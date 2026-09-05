# 08 — DEVOPS AND DEPLOYMENT

> **Owner: Kartik** (with Akash on the smoke script).
> `docker-compose.yml`, `infra/`, `nginx/`, `.env.example`, CI, the EC2 box.

**Your one sentence:** *a product that does not run on demo day did not get built.* The deploy is not the last task; it is a task you rehearse at **H28** so that it is boring by H33.

---

## 1. The target — deliberately small

**One EC2 `t3.small` (2 vCPU, 2 GB), Ubuntu 22.04, Mumbai `ap-south-1`.** Three containers behind nginx.

```
                      Internet
                         │
                    ┌────▼────┐
                    │  nginx  │  :80  (:443 if a domain lands in time)
                    └────┬────┘
                 /api    │    /media → disk
                    ┌────▼─────┐
                    │   api    │  FastAPI :8000, gunicorn+uvicorn, 2 workers
                    │  + model │  LightGBM pickle in-process
                    └────┬─────┘
                    ┌────▼─────┐
                    │ postgres │  :5432, docker volume
                    └──────────┘
```

**Why one box:** ~20 concurrent users during a demo. Kubernetes, ECS, autoscaling groups, and a managed RDS would each cost you an hour and buy nothing you can show. When asked about scale, say the true thing (§8) rather than pre-building for a load that does not exist.

**Why the model is in-process:** a separate ML container costs a container, a deploy, a network hop, an auth key, and a failure mode — for a 2 MB pickle that answers in 30 ms. Splitting it is a Phase 2 decision to make when you have real traffic.

---

## 2. `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      retries: 10
    restart: unless-stopped

  api:
    build: ./api
    env_file: .env
    depends_on:
      db: { condition: service_healthy }
    volumes: [media:/app/media]
    command: >
      gunicorn app.main:app -k uvicorn.workers.UvicornWorker
      -w 2 -b 0.0.0.0:8000 --timeout 60 --access-logfile -
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes: [./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro]
    depends_on: [api]
    restart: unless-stopped

volumes: { pgdata: , media: }
```

Three details that matter:

- **`depends_on: condition: service_healthy`.** Without it, the API starts before Postgres accepts connections, crashes, and you spend ten minutes debugging a race that is one line to fix.
- **`restart: unless-stopped` everywhere.** If the API OOMs at H34, it comes back by itself.
- **`-w 2`, not 4.** Two workers × a LightGBM bundle each on a 2 GB box. Four workers will OOM. If memory is tight, drop to `-w 1` — at 20 users nobody notices.

---

## 3. nginx — `nginx/default.conf`

```nginx
server {
  listen 80;
  server_name _;
  client_max_body_size 6M;              # photo uploads (5 MB cap + overhead)

  location /api/ {
    proxy_pass http://api:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 60s;
  }

  location /media/ {
    alias /var/media/;
    expires 7d;
  }

  location / {
    proxy_pass http://web:80;
  }
}
```

`client_max_body_size` is the classic one: default 1 MB, and every photo upload returns a 413 that looks like an app bug.

---

## 4. `.env.example` — committed. `.env` — never. (I2)

```bash
# ---- database
POSTGRES_USER=mandi
POSTGRES_PASSWORD=
POSTGRES_DB=mandi
DATABASE_URL=postgresql+psycopg://mandi:@db:5432/mandi

# ---- app
ENV=development                # development | production
API_BASE_PATH=/api/v1
JWT_SECRET=
JWT_EXPIRY_DAYS=7
MEDIA_ROOT=/app/media

# ---- auth / dev
DEV_OTP_ECHO=true              # MUST be false in production
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_MAX_REQUESTS_PER_10MIN=3

# ---- decision engine thresholds (Nilesh)
NO_ADVICE_BAND_BPS=3500
MIN_HISTORY_ROWS=180
MAX_STALENESS_DAYS=10
MIN_GAIN_PAISE=5000
FORECAST_HORIZON_DAYS=14
DEFAULT_LTV_BPS=7000
DEFAULT_PLEDGE_RATE_BPS=1200

# ---- ingestion (Kartik) — CLI only, never read in a request path
DATA_GOV_API_KEY=
SARVAM_API_KEY=                # offline TTS generation only

# ---- frontend
# NOTHING.  React Native CLI has no env injection — no EXPO_PUBLIC_* equivalent.
# The API base URL is a committed constant in app/src/config.ts (Pranay, P0).
```

**Rules:**
- Every secret has an **empty value** in `.env.example`. Never a real one, never a placeholder that looks real.
- `.env` in `.gitignore`. Verify with `git check-ignore -v .env`.
- **If a key is ever committed, rotate it.** Deleting the line does not remove it from history.
- `DEV_OTP_ECHO=false` in production — and the code checks `ENV != 'production'` too, so a single flipped flag cannot leak OTPs.

---

## 5. EC2 provisioning — `infra/provision.sh`, do this at H20

```bash
#!/usr/bin/env bash
set -euo pipefail
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
sudo systemctl enable --now docker

# 2 GB box + docker build = OOM without swap. this line prevents a real failure.
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

git clone <repo> ~/mandi-setu
cd ~/mandi-setu && cp .env.example .env
echo "→ now fill in .env, then run scripts/deploy.sh"
```

**Security group:** inbound 22 (your IP only), 80, 443. **Nothing else — and never 5432.** An open Postgres port on a public IP is found by scanners within hours.

**The swap file is not optional.** `docker compose build` on a 2 GB box without swap gets OOM-killed mid-build, and the error message does not say "out of memory."

---

## 6. The deploy — four commands, memorised

```bash
git pull && docker compose up -d --build
docker compose exec api alembic upgrade head
docker compose exec api python -m seed.run_all
bash scripts/smoke.sh
```

**★ Rehearse this at H28, in full, with everyone watching.** Then have one person open the app on a phone over wifi and complete the golden path.

If it fails at H28 you have two hours. If you first try it at H33 you have zero. Every hackathon team that deployed for the first time in the last three hours has the same story.

### `scripts/deploy.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
git pull --ff-only
docker compose up -d --build
docker compose exec -T api alembic upgrade head
docker compose exec -T api python -m seed.run_all
bash scripts/smoke.sh                       # non-zero exit = DO NOT PROCEED
echo "✓ deployed"
```

`set -euo pipefail` means a failed migration stops the script instead of cheerfully continuing to seed a broken schema.

### Seed reset — the one guarded destructive command

```python
# seed/reset.py
def reset():
    if settings.ENV == "production":
        raise SystemExit("refusing to reset in production")
    if not any(h in settings.DATABASE_URL for h in ("localhost", "127.0.0.1", "@db:")):
        raise SystemExit("DATABASE_URL does not look local — refusing")
    truncate_all()
```

**Both guards.** `ENV` can be misconfigured; the URL check is the backstop. This is the only place in the codebase permitted to delete data, and it must be impossible to point at anything real.

---

## 7. ★ The fallback ladder — decide the order now, not at H35

| Rung | If | Do this | Prepared by |
|---|---|---|---|
| **1** | Everything works | Live demo on EC2, phone over wifi | Kartik, H28 |
| **2** | EC2 unreachable / venue blocks it | **Laptop + `docker compose up` locally**, phone on a hotspot | everyone, verified H30 |
| **3** | Docker or the DB will not start | **Flip `USE_FIXTURES = true` in `app/src/config.ts` and rebuild** — the app runs the whole golden path off committed fixtures with no API at all | Pranay, verified H31 |
| **4** | Nothing runs | **★ Play the H32 screen recording** | Shreya, recorded H32 |

**Rung 4 is the one people skip and the one that saves them.** Record the full golden path with voiceover at **H32** — before fatigue, before anything breaks. It takes 20 minutes. If the box dies at H35, it is the difference between a demo and an apology.

**Test rung 2 for real at H30.** Not "we could run it locally" — actually stop the EC2 containers, run locally, complete the golden path.

---

## 8. The honest scale answer

When asked "how does this scale?", do not invent a number. Say this:

> *"Today: one t3.small, roughly 20 concurrent users, Postgres and the model in the same box. That's sized for a demo and we know it.*
>
> *To get to district scale — call it 10,000 farmers — three things change, in this order: Postgres moves to a managed instance with read replicas, because price reads are 90% of the traffic and they're all cacheable. The forecast becomes a nightly batch written to a table instead of an on-request prediction, because a 14-day forecast doesn't change between two farmers looking at it five minutes apart. And the model moves out of the API process so we can scale inference separately from request handling.*
>
> *None of that is hard. All of it is premature today, and we'd rather show you a working product than a diagram of one."*

**Three specific, ordered, technically correct steps beats a hand-wave about microservices**, and it beats a fabricated "we handle 10,000 requests per second" that collapses under one follow-up.

---

## 9. CI — one workflow, keep it under 90 seconds

`.github/workflows/ci.yml`
```yaml
on: [push, pull_request]
jobs:
  api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: test }
        options: >-
          --health-cmd pg_isready --health-interval 5s --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }        # 3.11. NOT 3.14 — no LightGBM wheel.
      - run: pip install -r api/requirements.txt
      - run: cd api && alembic upgrade head
      - run: cd api && pytest -q
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd app && npm ci && npx tsc --noEmit
```

**Python 3.11 is a hard requirement.** The default runner Python has no LightGBM wheel and will try to build from source, which fails. Same reason `uv venv --python 3.11` locally.

Keep CI fast. A 6-minute pipeline gets ignored under time pressure, and an ignored pipeline is worse than none because it produces false confidence.

---

## 10. Monitoring — proportionate

No Prometheus. No Grafana. No Sentry.

```
docker compose logs -f api          # what you actually use
docker stats                        # is anything about to OOM
GET /api/v1/meta/health             # {status, db, model_loaded, price_row_count}
```

`/meta/health` returning `model_loaded: true` and a non-zero `price_row_count` is your entire readiness check, and it is the first thing to curl if something looks wrong on stage.

**Have `docker compose logs -f api` open in a terminal during the demo, on a second screen if you have one.** If something breaks, you will know why in two seconds instead of guessing.

---

## 11. Backup — 30 seconds of insurance

```bash
docker compose exec -T db pg_dump -U mandi mandi | gzip > backups/$(date +%H%M).sql.gz
```

**Run it after the seed succeeds at H28 and again after the last data change.** If someone runs `reset.py` against the wrong DB at H33, this is the difference between a 2-minute restore and a rebuilt demo.

```bash
gunzip -c backups/HHMM.sql.gz | docker compose exec -T db psql -U mandi mandi
```

Practise the restore once. An untested backup is a hope.

---

## 12. Your definition of done

1. `docker compose up -d --build` from a clean clone → all four containers healthy.
2. `alembic upgrade head` → 24 tables.
3. `seed.run_all` → runs twice with identical row counts (idempotent).
4. `smoke.sh` → all green, including the cross-actor 404.
5. **Deployed on EC2 and rehearsed at H28**, with a phone completing the golden path over wifi.
6. **Rung 2 (local) tested for real at H30.**
7. **Rung 4 video recorded at H32.**
8. `.env` gitignored; `git log -p | grep -iE 'api[_-]?key|secret|password' --` finds nothing real.
9. Postgres port not exposed to the internet.
10. A backup taken and one restore practised.
11. Swap enabled on the box.

---

## 13. Phase 2 (not now)

| Item | Why later |
|---|---|
| Managed Postgres (RDS / Neon) with replicas | The right first scaling move — and pointless at 20 users |
| Nightly batch forecast → `forecasts` table | Removes model latency from the request path; the second scaling move |
| Model out of the API process | The third scaling move, once inference and requests need to scale separately |
| HTTPS with a real domain + Let's Encrypt | Do it if a domain lands in time; not worth blocking on |
| Sentry / structured logging / metrics | Needed the day you have users you cannot phone |
| Blue-green or rolling deploys | `docker compose up -d --build` has ~10 s of downtime. Nobody notices at this scale. |
| Terraform / IaC | One box provisioned by a 12-line shell script. IaC is the answer at 5 boxes, not 1. |
| Nightly ingestion cron with retry/backoff | Adds a failure mode; Phase 1 ingests once, offline. |
