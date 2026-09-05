# BLOCKERS

**Append-only. Never edit or delete someone else's entry.** Add yours at the bottom.

This file is the *record*. The group chat is the *alert*. **Both, always, within 30 minutes** of getting stuck.
A blocker nobody declared is the most expensive object in this repository.

---

## How to use this file

1. **You are blocked when you cannot make your next commit without someone else's change.** Not when something is annoying — when you are *stopped*.
2. **Do not edit a file you do not own** to unblock yourself. Not even a one-line fix. Not even if it is obviously wrong. Ownership is in `CLAUDE.md` §4.
3. **Stub it in your own file** with `TODO(<name>):` and keep moving. A stub plus a blocker is thirty seconds. A cross-lane edit is a rebase conflict at H30.
4. **Grep for your own name before every push:**
   ```bash
   grep -rn "TODO(nilesh)" api/ app/ ingest/     # substitute your name
   ```
   That grep is your inbox. Everyone's queue is somebody else's `TODO(you):`.
5. **Resolve by appending a `RESOLVED` line to your own entry.** Do not delete the entry — the history of what blocked whom is how we answer *"how did you coordinate?"* on demo day.

---

## Format — copy this block

```markdown
### [Requester → Owner] CATEGORY: one-line summary
- **What I need:** the specific change, in one sentence.
- **Why:** what breaks without it.
- **Blocking:** your task IDs, and the demo beat if any.
- **Workaround in place:** what you stubbed so you could keep moving.
- **Raised:** H<n>
- **RESOLVED:** H<n> — <what landed> (added by the owner)
```

`CATEGORY` ∈ `CONTRACT` · `SCHEMA` · `DATA` · `INFRA` · `DECISION` · `BUG`

Names are the six: **Akash · Kartik · Nikhil · Nilesh · Pranay · Shreya**.

---

## Who owns what — so you address the blocker to the right person

| Owner | Lane | Their files |
|---|---|---|
| **Akash** | Backend | `api/app/main.py`, `deps.py`, `models.py`, `schemas.py`, `routers/**` (except `window`, `prices`), `domain/{grading,matching,split,escrow,ledger}.py`, `alembic/**` |
| **Kartik** | Data + DevOps | `ingest/**`, `api/seed/{00_reference,10_prices}.py`, `api/app/routers/{prices,meta}.py`, `docker-compose.yml`, `nginx/**`, `infra/**`, `scripts/**`, `.env.example` |
| **Nikhil** | Forecasting | `api/app/ml/**` and the committed model pickles |
| **Nilesh** | Decision engine | `api/app/domain/{decide,costs,pledge}.py`, `api/app/config.py`, `api/app/routers/{window,ai}.py` |
| **Pranay** | Farmer app | `app/src/screens/farmer/**`, `app/src/components/farmer/**`, `app/src/lib/{api,money,offline}.ts` |
| **Shreya** | Buyer + language | `app/src/screens/buyer/**`, `app/src/components/ui/**`, `app/src/lib/{i18n,voice}.ts`, `app/messages/**`, `app/assets/audio/**`, `scripts/gen_tts.py`, `docs/deck/**` |

**Contract questions go to the contract, not to a person.** `docs/architecture/00_CANON.md` is authoritative: *"if another doc contradicts this one, this one wins."* If a role doc disagrees with CANON, CANON is right and the role doc is a bug — file it here.

---

## Open

*(nothing yet — H0)*

---

## Resolved

### [Everyone → Pranay] CONTRACT: role docs disagreed with CANON on the window response
- **What I need:** `NILESH.md` §1.2 and `PRANAY.md` §2.8 documented `best_day`, `best_case_paise`, `confidence_bps`, `costs_paise` and `source_summary` — five fields `00_CANON.md` §7.4 does not define.
- **Why:** Nilesh would have built a server response Pranay's screens could not read, and both would have disagreed with the contract Akash's `schemas.py` enforces. `undefined` on stage at beat 8.
- **Blocking:** L1, L5, P4, P5 — the hero endpoint end to end.
- **Workaround in place:** none needed; corrected before the build started.
- **Raised:** H0
- **RESOLVED:** H0 — both docs rewritten against CANON §7.4. The shape is `{action, hold_days, confidence, band_width_bps, sell_now_net_paise_per_qtl, hold_p50_net_paise_per_qtl, hold_p10_net_paise_per_qtl, expected_gain_paise, worst_case_paise, costs{6 keys}, alt_market, pledge_quote, refusal_reason, model_card, explain_mr, explain_en, data_source}`. Every key always present; `pledge_quote` nullable.

### [Everyone → Pranay] SCHEMA: AKASH.md's escrow FSM used state names the DB rejects
- **What I need:** `AKASH.md` §2.5 used `FUNDS_HELD` and `RECEIVED`; the `CHECK` constraint in `00_CANON.md` §6 permits only `ESCROW_HELD` and `DELIVERED`.
- **Why:** the first `transition()` insert would have violated the constraint at runtime, and Shreya's S22 would have rendered states the DB refuses to store.
- **Blocking:** A9, A10, SH-side S22.
- **Workaround in place:** none needed.
- **Raised:** H0
- **RESOLVED:** H0 — `LEGAL` and `ACTOR` corrected to `CREATED → ESCROW_HELD → DISPATCHED → DELIVERED → RELEASED`, plus `CANCELLED` / `REFUNDED` / `DISPUTED`. `06_BACKEND_ARCHITECTURE.md` §6 and `09_PHASE_2.md` carried the same two wrong names and were corrected in the same pass.

### [Everyone → Pranay] CONTRACT: two conflicting invariant numbering schemes
- **What I need:** `CLAUDE.md` §2 numbered the invariants differently from `00_CANON.md` §3 — the same rule was `I3` in one file and `I5` in the other. Ten of the sixteen numbers disagreed.
- **Why:** every role doc cites invariants by number. A teammate reading *"append-only, ever (I3)"* in `AKASH.md`, then grepping CANON for I3, finds *"rates are basis points"* and loses five minutes — repeatedly, for thirty-six hours. It also made two citations in `SHREYA.md` resolve to nothing at all.
- **Blocking:** nothing directly; it taxes everybody continuously, which is worse.
- **Workaround in place:** none needed; corrected before the build started.
- **Raised:** H0
- **RESOLVED:** H0 — **`00_CANON.md` §3 is the single authoritative table and its numbering wins**, per CANON's own precedence rule. `CLAUDE.md` §2 and all six role docs were renumbered to match; the eleven architecture docs already used CANON numbering and were left untouched. CANON gained **I16 — both numbers, always**, which `CLAUDE.md` had as I11 and CANON had been missing entirely. The two `SHREYA.md` citations that pointed at no real invariant (farmer illiteracy, 56 px touch target) were dropped, keeping the reasoning without the false authority. **Cite invariants by number only after checking CANON §3.**
