# 04 — DATA ARCHITECTURE

> **Owner: Kartik.** Everything under `ingest/`, `seed/`, and routers `ref prices meta`.
> Read `00_CANON.md` §6 (schema) and §7.2 (price endpoints) before writing a line.

**Your one sentence:** *the claim "we use real government market data" is either true because of your work, or it is a lie the whole team tells on stage.* Nothing else in this file matters more than that.

---

## 1. What we actually need — the minimum viable dataset

Do not try to ingest all of Maharashtra. You need exactly this:

| Dimension | Requirement | Why exactly this |
|---|---|---|
| **Commodities** | **2** — onion, soybean (tur as backup) | Onion's real volatility makes **NO_ADVICE fire honestly**. Soybean gives a clean confident HOLD. Two crops = the "did you rig the threshold?" question answers itself. |
| **Markets** | **3–6** — Lasalgaon, Pimpalgaon, Pune (onion); Latur, Nanded, Akola (soybean) | Need ≥2 markets for the same crop or `/prices/nearby` and SELL_ELSEWHERE have nothing to compare |
| **History** | **≥ 180 days**, ideally 730 | LightGBM with 14-day lags + 30-day rolling needs ≥ 120 usable rows after feature construction. Below 180 raw rows, `INSUFFICIENT_HISTORY` fires and the demo dies. |
| **Fields** | date, market, commodity, min, max, modal, arrivals | Modal is the price we forecast. Arrivals is a real feature — supply glut is *why* the price drops. |
| **Provenance** | `source` + `source_url` on **every row** | I8. Without it, the provenance screen is a lie. |

**Total target: ~2 crops × 3 markets × 400 days ≈ 2,400 rows.** That is small. That is the point. A small honest dataset beats a large murky one.

---

## 2. The acquisition ladder — five rungs, climb down fast

**Rule: you get 3 hours (H1–H4). At H4 you report which rung you are on, out loud, to everyone.** Do not spend hour 9 fighting a scraper. A working rung 3 at H4 beats a broken rung 1 at H14.

### Rung 1 — data.gov.in API (try first, 45 min max)

```
GET https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
    ?api-key=<KEY>&format=json&limit=1000
    &filters[state]=Maharashtra&filters[commodity]=Onion
```
- Free key from `data.gov.in/user/register` — register at H0, the email can take minutes
- **`api-key` goes in `.env`, never in a committed file** (I2)
- **The catch:** this resource is often a *current-day snapshot*, not history. If it gives you one day, you cannot forecast from it. Check that first, before writing any parsing code.
- If it works: `source='AGMARKNET'`, `source_url` = the request URL minus the key

### Rung 2 — Agmarknet HTML report (60 min max)

`agmarknet.gov.in/SearchCmmMkt.aspx` with query params for commodity/state/market/date-range.
- Returns an HTML table → parse with `pandas.read_html` or BeautifulSoup
- **The catch:** ASP.NET `__VIEWSTATE`, session cookies, and a date-range cap per request. Requires a session + loop over months.
- **Timebox this hard.** If you are still fighting VIEWSTATE at 60 minutes, drop to rung 3.
- If it works: `source='AGMARKNET'`, `source_url` = the report URL

### Rung 3 — archived CSV mirror (the realistic answer, and it is fine)

Kaggle / GitHub / academic mirrors of Agmarknet daily arrivals & prices. Several cover 2015–2023 for Maharashtra.
- Download **once**, commit to `ingest/snapshots/`, and never touch the network again (I7)
- `source='ARCHIVE'`, `source_url` = **the mirror's URL**, `notes` = who published it and when they scraped it

> **This is real observed market data with honest provenance. It is not synthetic and you must not describe it as second-best.** The honest sentence on stage: *"180 days of Agmarknet modal prices for Lasalgaon onion, from a public archived mirror — here's the source URL, and here's the row count."* That sentence is stronger than a shaky live scraper, because it will still be true at 4pm on demo day.

### Rung 4 — MSAMB / eNAM (only if rungs 1–3 all fail)

`msamb.com` daily arrivals, `enam.gov.in` trade data. Same treatment: fetch once, snapshot, label `source='MSAMB'`.

### Rung 5 — synthetic, and it is loudly labelled (last resort)

If **everything** fails: generate a series with realistic seasonality + noise, seeded from any real anchor prices you do have.
- `source='SYNTHETIC'` on **every row**
- **The chart shows a badge. The provenance screen says so. You say so on stage, unprompted.** (I8)
- **Never** mix synthetic rows into a series you describe as real

> Presenting generated data as government data to a government panel is the single unrecoverable mistake available to this team. Rung 5 with a badge is survivable. Rung 5 without a badge ends the project.

---

## 3. Module design

```
ingest/
├─ sources/
│  ├─ base.py            # PriceRow dataclass + the Source protocol
│  ├─ datagovin.py       # rung 1
│  ├─ agmarknet.py       # rung 2
│  ├─ archive_csv.py     # rung 3
│  └─ synthetic.py       # rung 5 — ALWAYS stamps source='SYNTHETIC'
├─ normalize.py          # raw dict/row -> PriceRow (units, dates, names)
├─ validate.py           # quality gates + report generation
├─ load.py               # PriceRow[] -> price_obs, idempotent upsert
├─ run.py                # CLI: python -m ingest.run --source archive_csv --commodity onion
├─ snapshots/            # committed raw files. THE OFFLINE BOUNDARY.
│  ├─ onion_lasalgaon_2019_2024.csv
│  └─ soybean_latur_2019_2024.csv
└─ reports/
   ├─ report_onion.md
   └─ report_soybean.md
```

### `PriceRow` — the one shape everything normalises to

```python
# ingest/sources/base.py
from dataclasses import dataclass
from datetime import date

@dataclass(frozen=True)
class PriceRow:
    market_name: str          # raw name from the source, pre-mapping
    commodity_name: str
    obs_date: date
    min_paise_per_qtl: int    # INTEGER PAISE. see normalize.to_paise (I1)
    max_paise_per_qtl: int
    modal_paise_per_qtl: int
    arrivals_qtl: int | None
    source: str               # AGMARKNET | MSAMB | ARCHIVE | IMPUTED | SYNTHETIC
    source_url: str | None
```

Every source module exposes exactly one function:
```python
def fetch(commodity: str, markets: list[str], start: date, end: date) -> list[PriceRow]: ...
```
That signature is the contract. Swapping rungs then becomes a one-word CLI change, which is exactly what you want under time pressure.

---

## 4. Normalisation rules — get these wrong and the model learns garbage

### 4.1 Money → paise (I1)

```python
# ingest/normalize.py
from decimal import Decimal

def to_paise(rupees_per_qtl: str | float | Decimal) -> int:
    """Rupees/qtl (possibly '1,250.50') -> integer paise/qtl. NEVER float arithmetic."""
    s = str(rupees_per_qtl).replace(",", "").strip()
    return int(Decimal(s) * 100)
```

**`Decimal`, not `float`.** `int(1250.55 * 100)` is `125054` on some inputs — you would silently lose a paisa per row, and a judge who spots float money in a price product is finished with you.

### 4.2 Market and commodity name mapping

Sources spell things differently: `Lasalgaon`, `LASALGAON`, `Lasalgaon(Niphad)`, `Lasalgaon (Niphad)`.

Keep an **explicit** alias map. No fuzzy matching — a wrong market silently attaches Pune prices to a Nashik farmer.

```python
MARKET_ALIASES = {
    "lasalgaon": "mkt_lasalgaon",
    "lasalgaon(niphad)": "mkt_lasalgaon",
    "lasalgaon (niphad)": "mkt_lasalgaon",
    "pimpalgaon baswant": "mkt_pimpalgaon",
    ...
}

def map_market(raw: str) -> str:
    key = raw.strip().lower().replace("  ", " ")
    if key not in MARKET_ALIASES:
        raise ValueError(f"UNMAPPED_MARKET: {raw!r} — add it to MARKET_ALIASES, do not guess")
    return MARKET_ALIASES[key]
```

**Raise, never guess.** An unmapped market must fail the ingest loudly. Silent guessing is how the model ends up trained on the wrong market.

### 4.3 Units

- Agmarknet quintal prices → already ₹/qtl → just `to_paise`
- If a source gives ₹/kg → `paise_per_qtl = to_paise(rate_per_kg) * 100`
- Arrivals in tonnes → `qtl = tonnes * 10`
- **Write the conversion in a comment next to it.** This is where silent 100× errors live, and a 100× error produces a ₹6,29,000 gain that a judge will laugh at.

### 4.4 Dates

Parse with an **explicit** format. Never let pandas infer.
```python
datetime.strptime(raw, "%d/%m/%Y").date()   # dd/mm/yyyy — Indian sources
```
`pd.to_datetime` will read `03/09/2024` as March 9th, and every seasonal feature you build after that is wrong.

---

## 5. Validation gates — `ingest/validate.py`

Run on every ingest. Output a committed markdown report per crop.

| # | Gate | Action on failure |
|---|---|---|
| V1 | `min ≤ modal ≤ max` | **Drop the row.** Log it. This is a source typo, not signal. |
| V2 | All three prices > 0 | Drop |
| V3 | No duplicate `(market, commodity, date)` | Keep the first, log the count |
| V4 | Day-over-day move ≤ 50% | **Keep, flag as `outlier`.** Onion genuinely moves 40% in a day; do not clip real volatility. |
| V5 | Gap ≤ 7 consecutive days | Gaps ≤ 3 → forward-fill with `source='IMPUTED'`. Gaps > 7 → leave the hole and **report it**. |
| V6 | ≥ 180 rows per (market, commodity) after all gates | **Escalate at H4.** Below this the forecast is not defensible. |
| V7 | Latest obs ≤ 10 days before demo date | Otherwise `STALE_DATA` refusals fire everywhere |

### The report — this is a demo artefact, not a dev log

```markdown
# Data Quality Report — Onion
Generated: 2026-09-05 · Source: ARCHIVE (kaggle.com/…/agmarknet-mirror)

## Coverage
| market      | rows | first      | last       | gaps | imputed | outliers |
|-------------|------|------------|------------|------|---------|----------|
| Lasalgaon   |  742 | 2023-01-02 | 2024-12-30 |    3 |       7 |       12 |
| Pimpalgaon  |  698 | 2023-01-02 | 2024-12-30 |    9 |      11 |       15 |

## Dropped
- 4 rows failed V1 (modal outside min–max)
- 2 rows failed V2 (zero price)

## Known holes
- Lasalgaon 2024-03-11 → 2024-03-19 (mandi strike; not imputed, gap > 7)
```

> **Show this report to a judge who asks about data quality.** "We measured our own data and here are its holes" is a materially different claim from "we have data", and it takes you twenty minutes to be able to make it.

---

## 6. Loading — `ingest/load.py`

**Idempotent upsert.** Re-running an ingest must never duplicate rows.

```python
stmt = insert(PriceObs).values(rows)
stmt = stmt.on_conflict_do_update(
    index_elements=["market_id", "commodity_id", "obs_date"],
    set_={"min_paise_per_qtl": stmt.excluded.min_paise_per_qtl,
          "max_paise_per_qtl": stmt.excluded.max_paise_per_qtl,
          "modal_paise_per_qtl": stmt.excluded.modal_paise_per_qtl,
          "arrivals_qtl": stmt.excluded.arrivals_qtl,
          "source": stmt.excluded.source,
          "source_url": stmt.excluded.source_url},
)
```
The `unique (market_id, commodity_id, obs_date)` constraint in CANON §6 is what makes this safe. Do not remove it.

**`price_obs` is the one table that is legitimately upsertable.** `audit_log`, `escrow_events`, and `dispute_events` are not (I3) — never write an `UPDATE` against those.

---

## 7. Seeds — `seed/`

```
seed/
├─ 00_reference.py     # Kartik — districts, markets, commodities, cost_tables, warehouses
├─ 10_prices.py        # Kartik — snapshots -> price_obs (calls ingest.load)
├─ 20_demo_story.py    # Kartik — the 11 demo beats: farmers, buyers, FPO pool, demands
└─ run_all.py          # runs 00, 10, 20 in order. Idempotent.
```

### 7.1 `00_reference.py` — what to seed

| Table | Count | Notes |
|---|---|---|
| `districts` | 8 | Nashik, Pune, Latur, Nanded, Akola, Ahmednagar, Solapur, Jalgaon |
| `markets` | 12 | with **real** lat/lon — used for the distance term in matching |
| `commodities` | 4 | onion, soybean, tur, tomato (last two may have no price data; that is fine) |
| `cost_tables` | 12×4 | **the numbers that make or break the verdict — see 7.2** |
| `warehouses` | 6 | 2 WDRA-registered flagged, with capacity and ₹/qtl/day |

### 7.2 The cost table — the highest-leverage 30 minutes of your work

Every rupee in the verdict passes through here. If transport Nashik→Pune is wrong, **every recommendation in the product is wrong** and a farmer in the room will know instantly.

```python
# per (market, commodity)
{
  "transport_paise_per_qtl_per_km": 350,     # ₹3.50/qtl/km  <- VERIFY
  "commission_bps": 100,                     # 1% APMC       <- VERIFY per market
  "loading_paise_per_qtl": 2000,             # ₹20/qtl
  "storage_paise_per_qtl_per_day": 150,      # ₹1.50/qtl/day <- VERIFY vs warehouse rates
  "spoilage_bps_per_day": 30,                # 0.30%/day for onion
}
```

**Verification protocol — do this, do not skip it:**
1. Find a published source (APMC circular, MSAMB, a transport aggregator, a news report with a number)
2. Put the URL in a comment **on the line**
3. If you cannot find a source: use a defensible estimate and add `# ESTIMATE, unverified` — then **say "estimated" on stage**

> A judge asking *"where did ₹3.50 per quintal per kilometre come from?"* is the most likely detailed question you will get, because it is the one number a domain expert can check from memory. Have the answer. "Estimated from X" is a fine answer. "I don't know" is not.

### 7.3 `20_demo_story.py` — the 11 beats

Every row here exists to make one demo beat work. Nothing decorative.

| Row set | Serves |
|---|---|
| Farmer A — Ramesh, Nashik, 40 qtl onion, grade B | The hero verdict path |
| Farmer B — 25 qtl onion, grade A | FPO pool member |
| Farmer C — 15 qtl onion, grade C | FPO pool member (shows the grade multiplier biting) |
| Buyer 1 — Pune trader, demand 100 qtl grade B+ | Triggers the **COMBINATION** match (A+B+C fill it, none alone can) |
| Buyer 2 — processor, low reliability score | Shows the reliability signal is real, not decorative |
| FPO pool — the 3 farmers, split summing to **exactly 10000 bps** | The fair-split beat |
| One completed transaction with **full escrow event history** | The timeline screen has something to show |
| One open dispute at stage 1 | The dispute screen has something to show |

**Constraint from `01_PRD.md` §11 decision #7:** the pool's aggregate `vs_solo_paise` is **₹2,800**. Regenerate the per-member rows so they sum to exactly that. Do not ship three numbers that add to something else — a judge with a calculator is a real risk and this is a 10-minute fix.

**Pareto guard (CANON §10):** if any member's `vs_solo_paise < 0`, the pool must not form. Verify this holds for your seeded pool before you commit it.

---

## 8. Your endpoints

### `GET /prices/series` — the history chart
```json
{ "market_id":"mkt_lasalgaon", "commodity_id":"cmd_onion",
  "points":[{"obs_date":"2026-09-01","modal_paise_per_qtl":185000,
             "min_paise_per_qtl":160000,"max_paise_per_qtl":210000,
             "arrivals_qtl":12400,"source":"ARCHIVE"}],
  "source_summary":{"ARCHIVE":178,"IMPUTED":2} }
```
`source_summary` is what lets Pranay render the badge (I8). Do not omit it.

### ★ `GET /prices/nearby` — net-of-transport reordering

**This is your differentiator and it is cheap.** Agmarknet shows gross prices. You show what the farmer actually banks.

```json
{ "markets":[
  {"market_id":"mkt_pune","market_name_mr":"पुणे","distance_km":210,
   "gross_paise_per_qtl":195000,"transport_paise_per_qtl":73500,
   "commission_paise_per_qtl":1950,"net_paise_per_qtl":119550},
  {"market_id":"mkt_lasalgaon","market_name_mr":"लासलगाव","distance_km":18,
   "gross_paise_per_qtl":185000,"transport_paise_per_qtl":6300,
   "commission_paise_per_qtl":1850,"net_paise_per_qtl":176850}
]}
```
**Sorted by `net_paise_per_qtl` descending.** Note what happened: Pune's gross is ₹100/qtl higher, and it is the *worse* choice by ₹573/qtl once transport is netted out.

**Verify at least one such inversion exists in your seed data.** If gross-order and net-order are identical everywhere, the feature is invisible and the beat lands flat. Show **both** columns so the farmer can see *why* the order changed — hiding the gross price makes it look like a trick.

### `GET /meta/data-provenance` — the honesty screen
```json
{ "sources":[{"source":"ARCHIVE","row_count":1440,
              "first_obs":"2023-01-02","last_obs":"2024-12-30",
              "source_url":"https://…","commodities":["onion","soybean"]},
             {"source":"IMPUTED","row_count":18,"note":"forward-filled gaps ≤3 days"}],
  "total_rows":1458, "synthetic_row_count":0,
  "generated_at":"2026-09-05T10:00:00Z" }
```
**These numbers must equal `select source, count(*) from price_obs group by 1`.** Do not hardcode them — compute them. A judge may ask you to run the query.

### `GET /ref/*`
`districts`, `markets`, `commodities`, `warehouses`, `logistics` (the cost table, so the frontend can show the breakdown without a round trip per line).

---

## 9. What you must not do

- ❌ **No live network call in any request handler.** Ingestion is a **CLI** (`python -m ingest.run`) that writes to Postgres. The API only ever reads Postgres. (I7)
- ❌ **No API key in a committed file.** `.env.example` gets `DATA_GOV_API_KEY=` with an empty value. If you leak a key, rotate it — deleting the line later does not remove it from git history.
- ❌ **No unlabelled synthetic data.** Ever. (I8)
- ❌ **No float money.** Grep your own diff for `float`, `/ 100`, `round(`. (I1)
- ❌ **No fuzzy market-name matching.** Explicit alias map or a raised error.
- ❌ **No Aadhaar numbers**, not even fake ones in seed data. Phone is the identifier. (I15)
- ❌ **No `UPDATE`/`DELETE`** against `audit_log`, `escrow_events`, `dispute_events`. (I3)

---

## 10. Your definition of done

1. `python -m seed.run_all` on a clean DB produces a working dataset, twice in a row, with identical row counts.
2. `select count(*) from price_obs` ≥ 1000, **every row has a non-null `source`**.
3. `select count(*) from price_obs where source='SYNTHETIC'` — you know this number and you say it on stage.
4. `reports/report_onion.md` and `report_soybean.md` exist and are committed.
5. `GET /prices/nearby` shows **at least one** net-order ≠ gross-order inversion.
6. `GET /meta/data-provenance` matches the DB exactly.
7. Every cost-table number has a source URL comment or an explicit `# ESTIMATE` marker.
8. `docker compose up` → `alembic upgrade head` → `seed.run_all` → `smoke.sh` green, **rehearsed on EC2 at H28**.

---

## 11. Phase 2 (not now — do not start these)

| Item | Why later |
|---|---|
| Nightly cron ingestion with retry/backoff | Phase 1 ingests once. A cron adds a failure mode and buys nothing in a 36-hour demo. |
| Live MSAMB arrivals stream | Same. |
| 20 markets × 12 commodities | Breadth is a Phase 2 scaling story, not a Phase 1 credibility story. |
| Weather features (IMD rainfall) | Real forecast lift, but a new external dependency. Nikhil's call at Phase 2. |
| Mandi-level arrival forecasting | Genuinely valuable; needs more history than you have time to clean. |
| `dbt` / Airflow | Ceremony at this scale. A CLI and a cron is the honest answer to "how would you productionise this". |
