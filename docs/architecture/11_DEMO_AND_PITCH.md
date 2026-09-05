# 11 — DEMO AND PITCH

> **Owner: Shreya (narrative + deck), with Pranay driving the app and Nilesh/Nikhil on the model questions.**
> Rehearse three times, timed, out loud, with someone holding a phone. Reading this file is not rehearsing.

**The rule that governs everything below:** *the demo is not a feature tour.* Judges do not score features; they score whether they believe you. Every beat exists to make one claim believable, and the strongest beat in the whole run is the one where the product **refuses to answer**.

---

## 1. The golden path — 11 beats, 8 minutes

Memorise the order. Do not improvise a new order on stage.

```
Marathi → login → home (price + source badge) → history → forecast (fan) →
model card → VERDICT (HOLD +₹6,290, worst −₹4,800) → cost breakdown →
pledge card → 🔊 voice → AIRPLANE MODE → offline banner → voice again →
back online → create lot → assay → grade B + tip →
[buyer tab] post demand → matches incl. COMBINATION → offer ₹1,900 →
[farmer] counter ₹2,000 WITH FORECAST VISIBLE → [buyer] counter ₹1,960 →
accept → escrow timeline → FPO split → provenance screen →
[second crop] → NO_ADVICE refusal
```

| # | Beat | On screen | The line you say | Time |
|---|---|---|---|---|
| **1** | **Marathi first** | App opens in Marathi, no toggle needed | *"This opens in Marathi because our user reads Marathi. English is the fallback, not the default."* | 0:20 |
| **2** | **Price + provenance** | Home: today's Lasalgaon onion price, source badge | *"₹1,850 a quintal. That badge says ARCHIVE — it's real Agmarknet data from a public mirror, and I'll show you the row count later."* | 0:30 |
| **3** | **History + forecast fan** | 180-day chart, then the p10/p50/p90 fan | *"We don't show a line. We show a band, because a point forecast with no uncertainty is a guess with a chart."* | 0:45 |
| **4** | **Model card** | MASE, coverage, known limitations | *"MASE 0.83 — better than seasonal-naive. 81% of actuals land inside our band, and we're targeting 80. It says right here that we can't see export bans coming."* | 0:40 |
| **5** | **★ THE VERDICT** | HOLD · **+₹6,290** · worst case **−₹4,800** | *"Hold 11 days. Expected gain ₹6,290 on 40 quintals — net of transport, commission, storage and spoilage. Worst case, he loses ₹4,800. Same font size. He gets both numbers or neither."* | **1:10** |
| **6** | **Cost breakdown + pledge** | Every deduction itemised; pledge card | *"Every rupee we netted out, itemised. And this — 'indicative simulation, not a lender quote' — because we're not a lender. If the interest exceeded the gain, this card would not appear at all."* | 0:45 |
| **7** | **★ Voice, then airplane mode** | 🔊 speaks it in Marathi → **enable airplane mode** → stale banner → 🔊 **still speaks** | *"Now watch."* [airplane mode] *"Yesterday 3pm's data — it says so. And the voice still works, because the Marathi audio is on the phone, not in the cloud. A farmer in a field with no signal still gets the advice — including the worst case."* | **1:00** |
| **8** | **Lot → assay → grade** | Create lot, 6 questions, grade B + improvement tip | *"Six questions he can answer standing in his field. Grade B. And a tip: sorting for size moves this to A and adds 8% to the price."* | 0:50 |
| **9** | **★ Negotiate — the middleman beat** | Buyer posts demand → matches incl. **COMBINATION** → offer ₹1,900 → **farmer counters ₹2,000 with the forecast on screen** → buyer ₹1,960 → accept | *"The buyer needs 100 quintals; no single farmer has that, so we combined three. He offers ₹1,900. Now look at the farmer's counter screen — **his own forecast is sitting right above the input box.** He isn't guessing. That's the middleman's entire informational advantage, handed to the farmer."* | **1:30** |
| **10** | **Escrow + split + provenance** | Timeline of states; FPO split summing to exactly 100%; provenance screen | *"Money held until delivery is confirmed. Three farmers, split by quantity **and grade**, adding to exactly 100% — and no pool forms if any member would do worse alone. And here's the data behind everything: 1,458 rows, zero synthetic."* | 0:50 |
| **11** | **★★ THE REFUSAL** | Second crop → **NO_ADVICE** + Marathi reason | *"Now the same question on a different crop — and the product refuses. The band is too wide to be useful, so it says so instead of inventing a number. A wrong HOLD costs a farmer real money. **We'd rather say nothing than guess.**"* | **0:50** |

**Total ≈ 8:30.** Cut beat 6's pledge card first if you are over. **Never cut 5, 7, 9, or 11.**

### Which beat wins the room

**Beat 11.** Everything before it makes it land. A team that demonstrates their own model declining to answer has said something no other team in the room will say, and it retroactively makes every number in beats 3–5 credible. Deliver it slowly. Pause after *"we'd rather say nothing than guess."*

---

## 2. Who does what, on stage

| Person | Role during the demo |
|---|---|
| **Pranay** | Drives the phone. Says nothing except when asked directly. Hands do not shake if hands have done it three times. |
| **Shreya** | Narrates all 11 beats. Owns the clock. |
| **Nilesh** | Takes every question about the verdict, costs, refusal thresholds, pledge maths. |
| **Nikhil** | Takes every question about the model, MASE, coverage, features, leakage. |
| **Kartik** | Takes every question about data provenance, row counts, scraping, deployment. |
| **Akash** | Takes every question about escrow, authorization, the FSM, blockchain. |

**One narrator. One driver.** Two people talking over a demo reads as a team that has not rehearsed. Everyone else stays silent until their question arrives — then answers in **two sentences and stops**.

---

## 3. The deck — 9 slides, no more

Slides are the frame around the demo, not a substitute for it. **Demo first if the room allows it.**

| # | Slide | The one thing it must land |
|---|---|---|
| 1 | **Title** | MANDI-SETU · PS 26132 · Government of Maharashtra · six names |
| 2 | **★ The problem, restated** | *"Farmers already suspect prices will rise. They sell at harvest anyway — because they cannot afford to wait. The binding constraint is not information. It's liquidity."* **This slide is the whole pitch.** If they only remember one slide, this is the one. |
| 3 | **What we built** | One line: *"A system that tells a farmer whether waiting pays, by how much, with what confidence — and then removes the reasons he couldn't wait."* |
| 4 | **The verdict, screenshotted** | The HOLD card with both numbers. Let the screenshot argue. |
| 5 | **★ How we're honest** | Three bullets: forecast bands not points · the model can refuse · every price row carries its source. **This is the differentiator slide.** |
| 6 | **Architecture** | One diagram. Expo → FastAPI → Postgres, model in-process, ingestion offline. No microservice fantasy. |
| 7 | **Data** | Row count, date range, source, **synthetic count (zero, or the true number)**. Numbers, not adjectives. |
| 8 | **Phase 2 / Phase 3, gated** | The four Phase 3 gates. *"We've written down what has to be true before we're allowed to scale."* |
| 9 | **Why it matters** | One sentence, said plainly, not dramatised. See §7. |

**Rules for the deck:**
- **Every external number has a source on the slide.** No source → the number comes off. This discipline is worth more than any figure you could add.
- No stock photos of farmers. No "₹X billion market opportunity" without a citation.
- Slide 2 is the only slide with no product on it, and it is the most important one.

---

## 4. ★ The eleven questions — rehearse these answers out loud

| # | Question | Who | The answer |
|---|---|---|---|
| 1 | *"Is this real data or did you make it up?"* | Kartik | *"Real. 1,458 rows of Agmarknet modal prices, Jan 2023 to Dec 2024, six markets, from a public archived mirror — here's the URL. 18 rows are forward-filled across gaps of three days or less and they're labelled IMPUTED. Zero synthetic. Here's the provenance endpoint, live."* |
| 2 | *"Where did ₹3.50 per quintal per kilometre come from?"* | Kartik | The **most likely detailed question**, because a domain expert can check it from memory. Give the source, or say *"that's an estimate from X, and it's marked as an estimate in our cost table."* **Never "I don't know."** |
| 3 | *"How accurate is your model?"* | Nikhil | *"MASE 0.83 against a seasonal-naive baseline, so 17% better than 'assume last week repeats'. But accuracy is the wrong question for us — what matters is whether the band is honest. 81% of actual prices fall inside our p10–p90, and we designed for 80. If that number were 40% we'd be lying to farmers with a nice chart."* |
| 4 | *"What if the model is wrong?"* | Nilesh | *"Then the farmer loses money, which is why the worst case is in the same font size as the expected gain, and why the app refuses when the band is too wide. Let me show you the refusal."* → **go to beat 11** |
| 5 | *"Why not blockchain?"* | Akash | *"Because what we need is tamper-evidence and auditability, and an append-only Postgres table with a hash chain gives us both — every row carries the previous row's hash, so you can't alter history without breaking the chain. A distributed ledger would add consensus overhead to solve a trust problem we don't have: there's one operator, and the auditor is the government. We'd rather be able to explain our design than name-drop one."* |
| 6 | *"How does this scale?"* | Kartik | The three ordered steps from `08_DEVOPS_AND_DEPLOY.md` §8. **Never invent a throughput number.** |
| 7 | *"Can I see another farmer's data?"* | Akash | *"Try it."* Hand them the phone. Every user-owned read is scoped from the JWT and returns 404 — not 403, because a 403 tells you the row exists. **Have the curl ready in `smoke.sh`.** |
| 8 | *"How is an illiterate farmer going to use this?"* | Shreya | *"Marathi by default, Devanagari numerals, one decision per screen, and the verdict is spoken aloud — including the worst case. The audio is on the phone, so it works with no signal. And Phase 2 puts the same verdict on SMS and a missed-call IVR, because about half of these farmers don't have a usable smartphone and we're not going to pretend otherwise."* |
| 9 | *"Aren't you just replacing the middleman with yourself?"* | Nilesh | *"The middleman's advantage is knowing the price curve when the farmer doesn't. We put the farmer's own forecast directly above his counter-offer box — you saw it. We take no cut of the negotiation, and if our pledge simulation ever costs more in interest than the expected gain, the app doesn't show it at all. We wrote that as a rule in the code, not a promise in a slide."* |
| 10 | *"What's not working yet?"* | Shreya | **Answer this honestly; it is a trust test, not a trap.** *"Payments are simulated — the state machine is real, the money isn't. Two crops, six markets. The assistant answers 30 fixed questions, no generation, because we'd rather it say 'I don't know' than hallucinate an MSP. And we can't see policy shocks — an export ban breaks our model and that's written in the model card."* |
| 11 | *"What's your business model?"* | Shreya | *"A transaction fee on completed trades, paid by the buyer, disclosed as a separate line in the ledger so the farmer can see every paisa. Never a fee on advice, and never a cut of the negotiation — the moment we earn more when he sells sooner, our incentives are against him."* |

**The meta-rule for Q&A: two sentences, then stop.** The most common way a good answer becomes a bad one is a third sentence nobody asked for.

**If you do not know, say so and say what you would do.** *"I don't know — I'd check X"* is a passing answer. A confident wrong answer to a domain expert is not.

---

## 5. Fallback — decided in advance (from `08_DEVOPS_AND_DEPLOY.md` §7)

| Rung | If | Do |
|---|---|---|
| 1 | Everything works | Live on EC2, phone over wifi |
| 2 | EC2 unreachable | Laptop `docker compose up`, phone on a hotspot |
| 3 | Docker won't start | Expo Go against localhost |
| 4 | Nothing runs | **Play the H32 recording** |

**Do not debug on stage.** If a beat fails, say *"that's the live box — let me show you the recording of that flow"*, switch to rung 4 for that beat only, and continue. Ten seconds of composure beats two minutes of terminal.

**Record the fallback video at H32.** Full golden path, voiceover, before fatigue. Twenty minutes of work for the entire downside protection of the pitch.

---

## 6. The 90 seconds before you start

1. `curl <host>/api/v1/meta/health` → `model_loaded: true`, `price_row_count` > 1000
2. App open, **already logged in**, Marathi selected, on the home screen
3. Buyer console open in a second tab, **already logged in**
4. Airplane mode **off**, wifi connected, brightness up, notifications silenced
5. `docker compose logs -f api` running on a second screen if you have one
6. Fallback video **open in a tab**, paused at 0:00
7. Phone charged above 50%

**Log in before you start.** An OTP flow on stage is 40 seconds of nothing happening and one chance to typo.

---

## 7. The closing line

Do not dramatise this. Say it plainly, once, and stop.

> *"Every year, farmers in Maharashtra sell at harvest for less than their crop is worth, because they can't afford to wait — and some of them don't survive that gap. We can't fix the whole of that. What we built tells a farmer whether waiting pays, in his language, with the worst case shown next to the best one, and it refuses to answer when it doesn't know. That's the part we could actually make honest in thirty-six hours."*

**Then stop talking.** Do not add a thank-you paragraph, a vision statement, or a market-size figure. The silence after that sentence is doing more work than anything you could put in it.

---

## 8. Rehearsal protocol — H33 to H36

Three full runs. **Timed. Out loud. Standing up.**

| Run | Focus | Fix between runs |
|---|---|---|
| **1** | Get through all 11 beats without stopping. Expect it to take 14 minutes. | Cut words, not beats |
| **2** | Hit 8:30. Shreya narrates while Pranay drives, no cross-talk. | Fix the two beats that always stumble |
| **3** | Full run **+ someone playing a hostile judge** interrupting with questions 2, 4, 7 and 10 | Nothing. You are done. Sleep. |

**Run 3's hostile judge is the highest-value 15 minutes of the last three hours.** Being interrupted mid-beat for the first time on stage is how a rehearsed demo falls apart. Have it happen in the room first.

**Then stop.** No new features, no "quick fix", no last commit. The freeze at H30 was real. A demo you have run three times and understand beats a demo with one more feature and a fresh bug.
