# BLOCKERS — append-only

**Rules**
1. **Append at the bottom. Never edit or delete someone else's entry.** (This file will
   have five agents writing to it; edits in the middle cause merge conflicts.)
2. Open a blocker the moment you need something you do not own. Then **stub locally and
   keep moving** — you are never blocked for more than 15 minutes.
3. The owner resolves it and appends `RESOLVED` under the entry with the commit sha.
4. At H58, `grep "TODO(R" -r apps services packages` — that is your punch list of stubs
   that still need deleting.

**Format** — copy this block:

```
### B-<n> · <one-line title>
- **Raised by:** R<n> at H<hh>
- **Owner:** R<n>
- **Need:** <exactly what you need. A field, a shape, an endpoint. Be specific.>
- **Why:** <what it unblocks>
- **My stub:** <what you did to keep moving, and where>
- **Status:** OPEN
```

---

### B-0 · Example entry — delete this once B-1 exists
- **Raised by:** R4 at H14
- **Owner:** R3
- **Need:** `GET /api/lots?status=LISTED` must include `assay.weakestDim` in the row, not
  just the grade. Shape: `LotDto.assay: AssayDto | null`.
- **Why:** the lot card shows "सुधारणा: ओलावा" (improve: moisture) under the grade chip;
  without `weakestDim` the card has an empty slot.
- **My stub:** rendering from `fxLot` in `@mandi/contracts/fixtures`, with
  `// TODO(R3): swap fixture for /api/lots once assay is included` in
  `apps/web/src/components/farmer/LotCard.tsx`.
- **Status:** OPEN

### [REVIEW → R1] CONTRACT: pre-freeze additive changes already applied — confirm, do not revert
- **What changed (on disk, uncommitted):**
  - `packages/contracts/src/index.ts`: `WindowAction` += `SELL_ELSEWHERE`; `WindowBody` += optional `cashNeedPaise`, `cashNeedBy`; new `PledgeQuote` schema; `WindowRecommendation` += `worstCasePaisePerQtl`, `worstCaseTotalPaise`, `pledgeQuote: PledgeQuote | null`.
  - `packages/contracts/src/fixtures.ts`: `fxWindowHold` and `fxWindowRefuse` updated for the new fields.
  - `prisma/schema.prisma`: `WindowAction` enum += `SELL_ELSEWHERE`; `RealisationLedger` += `baselineMethod` (default `HARVEST_DAY_MODAL_HOME_MANDI`).
- **Why:** the pledge quote is the thesis ("we pay them to wait") and the worst case is the ethical position; neither was in the contract. See `docs/10_GAP_REVIEW_AND_CORRECTIONS.md` A1, B1–B4.
- **Blocking:** R2 optimiser, R4 window screen, R5 warehouse seed.
- **Action for R1:** run `npm run typecheck` after `npm i`, mirror B1–B3 into `services/ml/app/contracts.py` with R2, then commit. R2 must not treat `pledgeQuote` as optional-to-implement.
- **Raised:** Day 0
- **PARTIALLY RESOLVED (Day 0, pre-commit):** `services/ml/app/contracts.py` now mirrors all
  three: `WindowAction` += `SELL_ELSEWHERE`; new `PledgeQuote` class; `WindowRecommendation`
  += `worstCasePaisePerQtl`, `worstCaseTotalPaise`, `pledgeQuote`; `MlWindowBody` +=
  `cashNeedPaise`, `cashNeedBy`.
  **Design decision recorded here so nobody re-litigates it at H40:** the pledge quote is
  computed in **TypeScript**, not Python. It is deterministic arithmetic over seeded
  `Warehouse` + `CostTable` rows with no model input, so `costs.ts` computes it and
  `window.ts` decides whether to emit it — vitest covers it with no database and no ML
  service running. Python always returns `pledgeQuote = null`. No new file, no ownership-map
  change: `costs.ts` already owns finance arithmetic and R2 already owns `costs.ts`.
  **Still open for R1:** B5 (`Recommendation.cashNeedPaise` / `pledgeOffered` audit columns)
  and B7 (`BuyerDto.renegotiationBps`) from `docs/10_GAP_REVIEW_AND_CORRECTIONS.md` §B.
  Both are additive; decide at H2.5, before the freeze.

### [INFO] Doc reconciliation complete (Day 0, pre-freeze) — no action, read once
The gap-review corrections are now inside the role briefs, so nobody has to cross-reference
`10_GAP_REVIEW_AND_CORRECTIONS.md` while building. What moved:
- **R2**: T2.3 data gate H20 → **H12**; new **T2.10b** pledge-quote task; optimiser pseudocode
  now has `SELL_ELSEWHERE`, `worstCase`, and the `cashNeedBy` branch; weather is a feature,
  not a model; tests 6 → 9.
- **R4**: T4.7 mockup now shows `WorstCaseRow` and `PledgeQuoteCard`; new **T4.15** Marathi
  audio with a **hard stop at H36** (then a teammate's voice); `SELL_ELSEWHERE` gets its own chip.
- **R5**: T5.13 deck moved **H58 → H0** (the portal gate is decided on the PPT alone); new
  **T5.5b** warehouses + the two personas; new **T5.5c** citation verification + Maharashtra
  programmes; fallback video **H48**.
- **R3**: `baselineMethod` documented on the ledger row, with the "gain compared to what?" answer.
- **CLAUDE.md** §7 said quantities end `Quintal`; corrected to integer kg / `qtyKg` to match
  the schema, contracts and every other doc.
- **New**: `docs/03_DEMO_AND_SEED.md` (frozen click path + seed spec — was referenced by three
  files and did not exist), `prisma/seed/rng.ts`, `prisma/seed/index.ts` skeleton.
- Untracked `build/__pycache__/*.pyc` from git.

**Two things still open for R1 at H2.5, before the freeze:** B5
(`Recommendation.cashNeedPaise` / `pledgeOffered` audit columns) and B7
(`BuyerDto.renegotiationBps` — it is on a deck slide and in R5's buyer seed, so the field has
to exist). Both additive.
