/**
 * Seed entrypoint. OWNER: R5.  `npm run db:seed`
 *
 * This file is a SKELETON committed before the freeze so that the module boundaries and the
 * run order are fixed and R5 fills in bodies rather than deciding structure at H20. Each
 * `seedX` function lives in its own file and R5 owns all of them.
 *
 * RUN ORDER IS A DEPENDENCY ORDER, NOT A PREFERENCE:
 *   reference  → districts, markets, commodities, warehouses, cost tables
 *   actors     → farmers, FPOs, buyers          (needs districts, markets)
 *   prices     → PriceObs from R2's CSV          (needs markets, commodities)
 *   personas   → Ramesh + Sunita and their lots  (needs actors, prices, warehouses)
 *   history    → ~200 past transactions + ledger (needs everything above)
 *
 * Warehouses are seeded in `reference`, BEFORE personas, on purpose: without at least one
 * WDRA warehouse near Lasalgaon, `pledgeQuote` is null for every lot and demo beat 7 — the
 * peak of the pitch — silently disappears. See docs/03_DEMO_AND_SEED.md §3.1.
 *
 * DETERMINISM: everything random comes from `rngFor(name)` in ./rng. Two `db:reset` runs
 * must produce byte-identical ledger totals. That is the acceptance test, and it is checked
 * by `verifyDeterminism` below rather than trusted.
 */
import { PrismaClient } from '@prisma/client';

import { SEED, SEED_TODAY } from './rng';
// TODO(R5): implement each of these in its own file. Signatures are fixed here.
// import { seedReference } from './reference';
// import { seedActors } from './actors';
// import { seedPrices } from './prices';
// import { seedPersonas } from './personas';
// import { seedHistory } from './history';

const prisma = new PrismaClient();

/**
 * Wipe in reverse dependency order.
 *
 * NOTE ON I3: `realisation_ledger` and `audit_log` are append-only *in application code* —
 * no route may ever UPDATE or DELETE them. A dev-only reset is the one exception, and it
 * lives here, in a script guarded below, not behind an API. If this ever runs against a
 * non-dev database it destroys the audit trail, which is why the guard is not optional.
 */
async function reset(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('refusing to reset: NODE_ENV=production');
  }
  const url = process.env.DATABASE_URL ?? '';
  if (!/localhost|127\.0\.0\.1|@db[:/]/.test(url)) {
    throw new Error(`refusing to reset: DATABASE_URL does not look local (${url.slice(0, 24)}…)`);
  }
  // TODO(R5): deleteMany in reverse FK order. Keep this list in sync with schema.prisma;
  // a missing table here shows up as a mysterious unique-constraint error on the 2nd run.
}

async function main(): Promise<void> {
  const t0 = Date.now();
  console.log(`seed: SEED=${SEED} SEED_TODAY=${SEED_TODAY.toISOString().slice(0, 10)}`);

  await reset();

  // const ref      = await seedReference(prisma);
  // const actors   = await seedActors(prisma, ref);
  // const prices   = await seedPrices(prisma, ref);
  // const personas = await seedPersonas(prisma, ref, actors, prices);
  // await seedHistory(prisma, ref, actors, prices);

  await summarise();
  console.log(`seed: done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

/**
 * Print what landed, and assert the things the demo depends on.
 *
 * This is not decoration. Each check below corresponds to a demo beat that fails silently
 * otherwise — and "silently" is the problem: you find out at the rehearsal, with four hours
 * left, instead of at H20 when it is cheap. Fail the seed loudly instead.
 */
async function summarise(): Promise<void> {
  // TODO(R5): counts per table, then these assertions:
  //
  //  1. >= 1 Warehouse with isWdra = true within ~40 km of Lasalgaon
  //       → else pledgeQuote is null for every lot, and beat 7 disappears.
  //  2. Ramesh's lot exists, qtyKg = 1200, onion, Lasalgaon, with a declared cash need
  //       whose deadline falls BEFORE the expected hold ends
  //       → else no pledge quote is emitted even with warehouses present.
  //  3. Sunita's lot exists, tomato, and her recent price band is genuinely wide
  //       → else she gets a confident HOLD and beat 8, the refusal, is gone. The refusal
  //         must come from real band width, never a flag.
  //  4. PriceObs: >= 5 distinct markets for onion and >= 3 years of history
  //       → the model has nothing to learn from otherwise, and the MASE claim is empty.
  //  5. RealisationLedger: hash chain verifies from seq 1 to the end.
  //  6. RealisationLedger: 15-20% of rows have deltaPaise < 0
  //       → a ledger where every farmer won is obviously fabricated. Seeded losses are
  //         what make the positive average believable.
  //  7. Every PriceObs row generated rather than observed has source = 'SYNTHETIC'  (I6).
  //  8. No row anywhere contains anything resembling an Aadhaar number  (I8).
  //
  // Throw on any failure with a message naming the demo beat it breaks.
}

/**
 * Determinism check. Run manually: `npm run db:reset && npm run db:reset`.
 * Compare the printed fingerprint across runs — they must be identical.
 * TODO(R5): fingerprint = sha256 over (ledger seq, deltaPaise, hash) for all rows, ordered.
 */
export async function verifyDeterminism(): Promise<string> {
  return 'TODO(R5)';
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
