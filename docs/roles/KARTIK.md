# KARTIK — Data + DevOps

> **You own the two things that can kill this project outright.** If the data is fake, the pitch is fraud. If the box is down at H36, there is no pitch.
> This file is your PRD, your TRD, and your task list. Read it, then `docs/architecture/00_CANON.md` §6, then `04_DATA_ARCHITECTURE.md`, then `08_DEVOPS_AND_DEPLOY.md`. Then start on K0.

---

## PART 1 — PRD · What you are building and why

### 1.1 Your mission in one sentence

**Make every number on screen traceable to a URL.** A judge points at ₹1,850 and asks where it came from; you answer with a source, a row count, and a date range — not an adjective.

### 1.2 Why you are the highest-leverage person in the first four hours

Nikhil cannot train without prices. Nilesh cannot decide without a forecast. Pranay's home screen has nothing to render. **Everyone downstream of you is blocked until the data lands**, which is why there is a formal **H4 DATA GATE** where you say out loud, to the whole team, which rung of the ladder you are on.

Say it honestly and early. *"I'm on rung 3, I'll have 1,000 rows by H6"* lets four people plan. Silence until H10 costs the project more than any missing feature.

### 1.3 The acquisition ladder — climb down it, with timeboxes

| Rung | Source | Timebox | Notes |
|---|---|---|---|
| **1** | **data.gov.in API** — resource `9ef84268-d588-465a-a308-a864a43d0070` | 45 min | Cleanest if the key works. See `docs/reference/DATA_SOURCE_RECIPES.md`. |
| **2** | **Agmarknet** `SearchCmmMkt.aspx` commodity/market report → Excel export | 60 min | Real government data. The export path is in the recipes file. |
| **3** | **NHRDF** onion series / **MSAMB** APMC directory | 45 min | NHRDF has long clean onion history. MSAMB gives real Marathi mandi names. |
| **4** | **Archived mirror / public dataset** | 30 min | Still real data. Record the archive URL. |
| **5** | **Synthetic, labelled `SYNTHETIC` in the DB and badged in the UI** | last resort | **I8.** Never ship generated data unlabelled. |

**Move down a rung when the timebox expires, not when you feel stuck.** The failure mode here is spending five hours on rung 1 and arriving at H9 with nothing. Four hours on rung 3 with 1,458 real rows beats nine hours on rung 1 with a half-working scraper.

**The endpoints have not been verified from a sandbox** — you must confirm the working URL yourself and **record it** in the recipes file. That recorded URL is what you read out on stage.

### 1.4 The data target

| Dimension | Minimum | Why |
|---|---|---|
| Commodities | **2** — onion + tomato | Tomato is the NO_ADVICE crop. One commodity cannot demonstrate refusal. |
| Markets | **3+**, ideally 6 | `/prices/nearby` needs several to compare |
| History | **≥180 days**, ideally 24 months | LightGBM with lag features needs the runway |
| Row count | **≥1000** | `select count(*) from price_obs` is a number you will be asked for |
| Provenance | **every row** has `source` + `source_url` | I8, non-negotiable |

**Priority onion mandis** (from the recipes file): Lasalgaon, Pimpalgaon Baswant, Nashik, Yeola, Manmad, Sinnar, Chandwad, Umrane, Ahmednagar/Rahuri, Solapur. Lasalgaon is the demo market — it is Asia's largest onion mandi and a Maharashtra judge will recognise the name.

### 1.5 The dirt you will find, and must handle

Real data is dirty. Expect and handle:
- **Missing days** — holidays, closures. Forward-fill gaps **≤3 days**, label `IMPUTED`. Longer gaps stay missing.
- **Variety-name inconsistencies** — "Onion", "Onion(Red)", "Kanda". Normalise to a commodity id.
- **Unit-error spikes** — a price 100× the neighbours because someone entered per-kg in a per-quintal field. Flag, do not silently delete.

`ingest/validate.py` runs seven gates and writes a committed `report_<crop>.md`. **That report is a demo artefact** — it is how you answer question 1 with a document instead of a claim.

### 1.6 ★ `/prices/nearby` — your one feature that changes a decision

This is the endpoint where transport cost reorders the answer:

```
Lasalgaon   gross ₹1,850   transport ₹0     net ₹1,850   ← nearest, lower gross
Pune        gross ₹1,920   transport ₹210   net ₹1,710   ← higher gross, WORSE net
Nashik      gross ₹1,880   transport ₹35    net ₹1,845
```

**Requirement: at least one case in the seeded data where the net ordering differs from the gross ordering.** If every market's net order matches its gross order, the feature demonstrates nothing — a farmer could have sorted by gross himself. Engineer the seed so the reordering is visible, using real distances and the real cost table.

Sorted by **net**, always. Gross is shown but never the sort key.

### 1.7 The cost table is a demo weapon and a demo liability

`₹3.50 per quintal per km` is the **most likely detailed question you will get** (question 2, `11_DEMO_AND_PITCH.md`), because a domain expert can check it from memory.

Three acceptable answers:
1. *"From [source], here's the URL."*
2. *"That's an estimate from [X], and it's marked as an estimate in our cost table."*
3. *"I don't know that one — I'd check [Y]."*

**"I don't know" with a plan is a passing answer. A confident wrong number to a domain expert is not.** Put an `is_estimate` boolean and a `source_url` on every cost-table row so you can answer from the data rather than from memory.

### 1.8 What you own

| | |
|---|---|
| **Data** | `ingest/**` (the whole offline CLI), `api/seed/00_reference.py`, `api/seed/10_prices.py`, `docs/reference/DATA_SOURCE_RECIPES.md` |
| **Endpoints** | `api/app/routers/prices.py`, `api/app/routers/meta.py` (`/ref/*`, `/meta/data-provenance`) |
| **Infra** | `docker-compose.yml`, `nginx/**`, `infra/**`, `scripts/**`, `.env.example`, CI |
| **Not yours** | Everything else in `api/app/`. Akash owns the routers, Nikhil `ml/`, Nilesh `domain/decide.py`. |

---

## PART 2 — TRD · How you build it

### 2.1 I7 — ingestion is offline, always

```
ingest/  (a CLI, run by hand)  ──►  writes CSV to ingest/data/  ──►  seed/10_prices.py  ──►  Postgres
                                                                                              │
                                                                     the API only ever reads ─┘
```

**The API never makes an external network call in a request path.** Not with a cache, not with a timeout, not "just for the live price". Venue wifi fails; it always fails. The demo reads Postgres and nothing else.

### 2.2 The price table shape

```sql
create table price_obs (
  id            text primary key,
  commodity_id  text not null references commodities(id),
  market_id     text not null references markets(id),
  obs_date      date not null,
  min_paise_per_qtl   int,
  modal_paise_per_qtl int not null,        -- modal is what we forecast
  max_paise_per_qtl   int,
  arrivals_qtl  int,
  source        text not null check (source in ('AGMARKNET','DATA_GOV','NHRDF','MSAMB','ARCHIVE','IMPUTED','SYNTHETIC')),
  source_url    text,                      -- the URL you read out on stage
  ingested_at   timestamptz not null default now(),
  unique (commodity_id, market_id, obs_date)
);
```

**Integer paise (I1).** A rupee price of ₹1,850.50 is `185050`. Never a float, not even in the CSV parser — parse to `Decimal`, multiply by 100, cast to `int`.

**The unique constraint is what makes `10_prices.py` idempotent.** `ON CONFLICT DO NOTHING` and the seed can be re-run any number of times, which you will do more than you expect.

### 2.3 `/meta/data-provenance` — the honesty endpoint

```python
@router.get('/meta/data-provenance')
async def provenance(db) -> ProvenanceRes:
    rows = await db.execute(text('select source, count(*) from price_obs group by 1 order by 2 desc'))
    ...
```

**The response must match that query exactly.** If the endpoint says "zero synthetic" and the query says 40, you have handed a judge the one unrecoverable mistake available to this team. Compute it live from the table; never hardcode a summary.

Response shape: `{ total, by_source: {ARCHIVE: 1440, IMPUTED: 18, SYNTHETIC: 0}, date_range: {from, to}, markets, commodities, source_urls: [...] }`

### 2.4 Deploy — one box, rehearsed twice

```
EC2 t3.small  +  swap file (mandatory — 2 GB RAM and LightGBM will OOM without it)
   nginx  →  api:8000  (docker compose)
             postgres:5432  ← NEVER exposed to the internet
```

```bash
docker compose up -d --build
docker compose exec api alembic upgrade head
docker compose exec api python -m seed.run_all
bash scripts/smoke.sh
```

**The swap file is not optional.** t3.small has 2 GB; LightGBM training plus Postgres plus the API will hit the ceiling and the OOM killer takes the API, not the trainer.

**Postgres port stays closed.** No `5432:5432` in the compose file's public mapping, no security-group rule. The API reaches it on the docker network.

### 2.5 ★ The H28 deploy rehearsal

**Deploy twice: once at H28, once at H34.** The first deploy always fails on something environmental — a missing env var, a wrong image tag, a permissions error on the data volume. Discovering that at H28 costs an hour. Discovering it at H35 costs the pitch.

After the H28 deploy, run `scripts/smoke.sh` **against the EC2 host**, not localhost. A green smoke test on your laptop proves nothing about the box.

### 2.6 The fallback ladder — decided in advance

| Rung | If | Do |
|---|---|---|
| 1 | Everything works | Live on EC2, phone over wifi |
| 2 | EC2 unreachable | Laptop `docker compose up`, phone on a hotspot |
| 3 | Docker or the DB won't start | `USE_FIXTURES = true` — app runs off fixtures, no API |
| 4 | Nothing runs | **Play the H32 recording** |

You own rungs 1–3. Have rung 2 tested — meaning you have actually run the app against your laptop over a phone hotspot at least once, before demo day.

### 2.7 I10 — secrets

Only `.env.example` is committed, **with empty values**. No keys, no tokens, no connection strings, in code or docs or a comment or a commit message.

**If a secret does get committed, rotate it.** Deleting the line in a follow-up commit does not remove it from history — the old blob is still there and `git log -p` finds it in five seconds.

### 2.8 Your definition of done

1. `select count(*) from price_obs` ≥ 1000, and you know the number by heart.
2. Every row has `source` and `source_url`. `select count(*) from price_obs where source_url is null` → 0.
3. `/meta/data-provenance` output matches the `group by source` query exactly.
4. `report_onion.md` and `report_tomato.md` committed.
5. `/prices/nearby` sorted by net, with at least one gross-vs-net reordering visible.
6. `seed/10_prices.py` is idempotent — run it three times, row count unchanged.
7. Deployed to EC2 and `smoke.sh` green **against the EC2 host**. Twice.
8. Postgres not reachable from the internet. Verified by trying.
9. No secrets in git. Re-audited, not assumed.
10. Committed and pushed to `kartik`.

---

## PART 3 — Your tasks, in order

| # | Task | Done when | Blocked by |
|---|---|---|---|
| **K0** | **`docker-compose.yml` + `.env.example` + Postgres up** | `docker compose up -d` and Akash can connect | nothing |
| **K1** | **★ Ingest** — 2 commodities × 3+ markets × ≥180 days | `count(*) ≥ 1000`, **all rows** with `source` + `source_url` | nothing (**H4 GATE**) |
| **K2** | **`ingest/validate.py`** + committed `report_<crop>.md` | Seven gates run; the report names every gap and spike | K1 |
| **K3** | **`seed/10_prices.py`**, idempotent | Run three times, row count unchanged | K1, Akash A0 |
| **K4** | **`GET /prices/series`** | Pranay's home screen renders a real price | K3 |
| **K5** | **`GET /ref/*`** — districts, markets, commodities, warehouses | The dropdowns in S3 populate | K3 |
| **K6** | **★★ `GET /prices/nearby`** — gross, transport, commission, **net**, sorted by net | **At least one case where net-order ≠ gross-order** | K4 |
| **K7** | **`GET /meta/data-provenance`** | Output matches `select source, count(*) from price_obs group by 1` exactly | K3 |
| **K8** | **nginx + EC2 provisioning + swap file** | `curl <host>/api/v1/meta/health` from outside | K0 |
| **K9** | **★ H28 deploy rehearsal** — full deploy + `smoke.sh` **against EC2** | Green from the EC2 host, not localhost | K8, Akash A12 |
| **K10** | **Fallback rung 2 tested** — laptop compose + phone hotspot | The app worked over a hotspot, once, for real | K9 |
| **K11** | **Second deploy at H34** | Green again, from a cold box | K9 |

**K1 is the H4 gate and it blocks four people.** Nothing else on this list matters if K1 slips — Nikhil has no training data, Nilesh has no forecast, Pranay has no price, Shreya has nothing to narrate.

### One warning about K6

`/prices/nearby` looks like a small endpoint and it is the feature that most directly changes a farmer's decision. A farmer who learns that the mandi with the higher board price nets him less after transport has learned something he could not have worked out from a price list. Give it real distances, the real cost table, and make sure the reordering actually happens in the seeded data.

---

## PART 4 — Blocked?

1. Rung timebox expired? **Move down a rung.** That is not failure, that is the plan.
2. Need a schema column? Ask Akash — it is additive, it is cheap, post the diff in chat.
3. Otherwise: `docs/BLOCKERS.md` + group chat, within 30 minutes. **Especially for K1** — if the data is going to be thin, four people need to know at H4, not H14.

---

## PART 5 — On demo day

You take **questions 1, 2, and 6**: *"is this real data"*, *"where did ₹3.50/qtl/km come from"*, *"how does this scale"*.

Have ready:
- The row count, the date range, and the source URL — **memorised**, not looked up
- `/meta/data-provenance` open in a browser tab
- `report_onion.md` open
- The cost table with its `source_url` column visible

Your question-1 answer, verbatim from the pitch doc:

> *"Real. 1,458 rows of Agmarknet modal prices, Jan 2023 to Dec 2024, six markets, from a public archived mirror — here's the URL. 18 rows are forward-filled across gaps of three days or less and they're labelled IMPUTED. Zero synthetic. Here's the provenance endpoint, live."*

Substitute your real numbers. **Do not substitute optimistic ones.** If 40 rows are synthetic, the answer says 40, and the badge is on the chart, and you are still fine. Claiming zero when it is 40 is the one mistake this project cannot survive.
