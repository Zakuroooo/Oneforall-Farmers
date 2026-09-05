# 12 · Data Sources — concrete pull recipes for the 72 hours

> Owner: **R2** for prices/weather, **R5** for institutional/seed. Rule: nothing goes into `PriceObs` with `source = AGMARKNET`
> unless the raw file it came from is committed under `research/data/raw/` with a `PROVENANCE.md` line (URL, date pulled, who pulled it).
> URLs and IDs below are from memory of the public portals and must be confirmed on first open; portals move. Record what you find in §6.

---

## 1. Prices and arrivals (the core, do this first)

### 1.1 data.gov.in — daily mandi prices (programmatic, free key)
- Register at `https://data.gov.in` → My Account → API key. Takes minutes.
- The long-standing resource is **"Current Daily Price of Various Commodities from Various Markets (Mandi)"**, resource id historically
  `9ef84268-d588-465a-a308-a864a43d0070`. Search the catalogue for the title if the id has changed.
- Example call (verify parameter names on the resource page):
  ```
  https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=KEY&format=json&limit=1000
      &filters[state]=Maharashtra&filters[commodity]=Onion
  ```
- Fields: state, district, market, commodity, variety, grade, arrival_date, min_price, max_price, modal_price (₹/quintal). **No arrivals in this resource.**
- Limitation: it is a rolling *current* snapshot. It gives you today, not history. Use it to prove the ingestion path works and for the "last observed" row. History comes from 1.2.

### 1.2 Agmarknet portal — historical prices AND arrivals (HTML/Excel export, no key)
- `https://agmarknet.gov.in` → Price & Arrivals → **Commodity-wise / Market-wise** reports. The report page has historically been
  `SearchCmmMkt.aspx` with query parameters for commodity, state, district, market, date-from, date-to, and an Excel export button.
- Pull per (commodity, market, date range). Date ranges of one year at a time work best. Store the raw export as-is.
- Priority list for onion (Nashik belt): **Lasalgaon, Pimpalgaon Baswant, Nashik, Yeola, Manmad, Sinnar, Chandwad, Umrane, Ahmednagar (Rahuri), Solapur.** Aim for ≥ 5 mandis × ≥ 3 years by H12.
- Second commodity for the NO_ADVICE demo: **Tomato** at Nashik, Pune (Manchar/Narayangaon), Satara. Tomato bands are wide by nature; that is the point.
- Expect: missing days, variety-name inconsistencies ("Onion", "Onion-Red", "Local", "Pole"), price spikes from unit errors. Build the canonical mapping table by hand and commit it as `research/data/mapping_commodity_variety.csv`.

### 1.3 NHRDF — onion-specific daily market data (high value, onion only)
- National Horticultural Research and Development Foundation, `https://nhrdf.org` → Market Information. Publishes daily onion (and garlic) prices and
  arrivals for the major onion markets including Lasalgaon and Pimpalgaon, with history. If reachable, this is the cleanest onion series in India.
  Cross-check Agmarknet against it and cite both.

### 1.4 MSAMB — Maharashtra APMC directory and daily rates
- `https://www.msamb.com` → APMC list (the authoritative Maharashtra mandi set with district and contact), and "Bazarbhav"/daily rates.
  Use the APMC list to seed `Market` for Nashik, Ahmednagar, Pune, Solapur with real names and Marathi names.

### 1.5 Kaggle mirrors (fallback only; cite the mirror, not as primary)
- Search Kaggle for "agmarknet", "mandi prices India", "onion prices India". Several multi-year Agmarknet dumps exist. Fine for bootstrapping the
  model on Day 1 while the portal pulls run; replace with primary-source rows before H48 and note the swap in `PROVENANCE.md`.

### 1.6 Futures curve (optional, soybean/cotton phase 2)
- NCDEX public quotes `https://www.ncdex.com`. Not needed for onion. Skip for the round.

---

## 2. Weather (feature input, never a forecast we make)

### 2.1 Open-Meteo historical archive (no key, fastest)
```
https://archive-api.open-meteo.com/v1/archive?latitude=20.15&longitude=74.24
    &start_date=2021-01-01&end_date=2026-08-31
    &daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=Asia/Kolkata
```
(Lasalgaon ≈ 20.15 N, 74.24 E. Use each market's lat/lon from `Market`.) Compute 7/14/30-day rainfall sums and anomaly vs the same window's multi-year mean.
Run this **once, offline**, write to `research/data/weather/*.csv`, seed derived features. The demo never calls it (I5).

### 2.2 IMD
- `https://mausam.imd.gov.in` for district rainfall and warnings; several IMD datasets also sit on data.gov.in. Use only for a citation line; Open-Meteo is enough for the feature.

---

## 3. Institutional (seed data and slide facts)

| Need | Source | What to take |
|---|---|---|
| WDRA-registered warehouses in Nashik / Ahmednagar / Pune, and e-NWR repositories | `https://wdra.gov.in` → Registered Warehouses search; repositories are NERL and CCRL | 3 to 5 real warehouse names + capacity for the `Warehouse` seed with `isWdra = true`. Use an indicative storage rate band and label it indicative. |
| Pledge-finance rate band | RBI / NABARD publications on warehouse-receipt lending; public rate cards of Arya.ag / bank KCC | A defensible `financeBpsPerAnnum` (roughly 900 to 1400). Put the source in the `CostTable` seed comment. |
| APMC market fee and commission | MSAMB / Maharashtra APMC rules; the fee is a small percent of value, commission is regulated per commodity | The `C_mk` term in the optimiser. Cite the rule, not a blog. |
| Transport cost per kg-km | Published truck freight indices or two phone quotes from a Nashik transporter | `transportPaisePerKgKm`. A phone call is a legitimate citation: "quote from X Transport, Nashik, on <date>". |
| Real FPOs for names and quotes | SFAC FPO directory `https://sfacindia.com`; SMART project `https://www.smart-mh.org`; MAGNET `https://magnet-mh.org` (verify domains) | Real FPO names for `Fpo` seed. One phone conversation with an FPO office is worth a slide. |
| Farmer suicides, Maharashtra 2022 | NCRB **ADSI 2022**, chapter "Suicides in Farming Sector", `https://ncrb.gov.in` | The one figure, with table number. Mention once. |
| Holding sizes (43% marginal) | **Agriculture Census 2015-16**, state tables, `https://agcensus.gov.in` | Replace the Wikipedia citation with the table reference. |
| Household income and indebtedness | NSSO **Situation Assessment of Agricultural Households, 77th round (2018-19)**, MoSPI | Maharashtra rows for the impact slide context. |
| eNAM Maharashtra mandi count and trade | `https://enam.gov.in` dashboard | Update the "118 as of 2021" figure to the current number before it goes on a slide. |
| Onion policy-event calendar | PIB releases and DGFT notifications (`https://pib.gov.in`, `https://dgft.gov.in`) | Dates of export bans, minimum export prices, duty changes, stock limits for 2019 to 2025. Commit as `research/data/policy_events_onion.csv` with a URL per row. This is a genuine differentiator and an input to the regime flag. |

---

## 4. Marathi voice (pre-generated, cached, offline in the demo)

- **Bhashini** `https://bhashini.gov.in` → ULCA / API access requires registration; approval may not arrive in 72 hours. Apply on Day 1 anyway; it is a slide line.
- **AI4Bharat Indic-TTS** (open source, Marathi supported): run once locally, generate the ~15 demo lines, commit MP3s to `apps/web/public/audio/mr/`.
- **Any commercial Marathi TTS** (Google Cloud `mr-IN`, Azure `mr-IN`) is acceptable for pre-generation; note the engine in `PROVENANCE.md`.
- Fallback: a Marathi-speaking teammate records the lines on a phone. Label it "human-recorded for demo".
- The button in the UI plays a cached file. No network at demo time.

---

## 5. What NOT to spend time on this week
- Sentinel-2 / NDVI, SoilGrids, CMIP6, MODIS: roadmap slide only.
- eNAM API access: institutional, weeks of lead time.
- Live Agmarknet scraping at runtime: forbidden by I5 and unnecessary.
- Kisan Call Centre transcripts: phase 2 lexicon work.

---

## 6. Verification tracker (fill in as you go; this table goes on the data-provenance slide)

| Source | URL actually used | Auth | Pulled on | Rows | Date range | Owner | Notes |
|---|---|---|---|---|---|---|---|
| data.gov.in daily prices |  | key |  |  |  | R2 |  |
| Agmarknet market-wise export |  | none |  |  |  | R2 |  |
| NHRDF onion |  | none |  |  |  | R2 |  |
| MSAMB APMC list |  | none |  |  |  | R5 |  |
| Open-Meteo archive |  | none |  |  |  | R2 |  |
| WDRA warehouses |  | none |  |  |  | R5 |  |
| Policy-event calendar (PIB/DGFT) |  | none |  |  |  | R5 |  |
| NCRB ADSI 2022 |  | none |  |  |  | R5 |  |
| Agriculture Census 2015-16 |  | none |  |  |  | R5 |  |
| Marathi TTS engine |  |  |  |  |  | R4 |  |
