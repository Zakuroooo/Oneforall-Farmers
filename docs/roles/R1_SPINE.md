# R1 · SPINE — Architecture, Database, Auth, Contracts, Integration, Deploy
**Branch:** `r1-spine` · **You are the unblocker. If you stall, four people stall.**

---

## ⬛ PASTE THIS TO CLAUDE CODE AT THE START OF EVERY SESSION

```
You are working on MANDI-SETU, a Next.js 15 + Prisma + Postgres monorepo for
Smart India Hackathon 2026, problem statement 26132 (market linkages and price
discovery for farmers of Maharashtra). Five engineers with five Claude Code agents
are building this simultaneously in ONE repo over 3 days.

I am R1 (codename SPINE). My role: architecture, database schema, authentication,
shared contracts, integration, and deployment. I am the only person who may change
the database schema or the API contracts.

Before you write any code, read these files in this order:
  1. CLAUDE.md                      (project invariants — all ten are binding)
  2. docs/00_MASTER_BUILD_PLAN.md   (architecture, timeline, protocol)
  3. docs/01_CONTRACTS.md           (the API surface)
  4. docs/02_SECURITY_AND_QUALITY.md (the rules I personally enforce)
  5. docs/roles/R1_SPINE.md         (my task list — work through it in order)
  6. prisma/schema.prisma and packages/contracts/src/index.ts (already written)

I OWN and may edit ONLY these paths:
  prisma/schema.prisma
  packages/contracts/**
  apps/web/src/lib/{db,auth,guard,ml,ratelimit,http,env}.ts
  apps/web/src/components/ui/**          (shadcn primitives; read-only for others)
  apps/web/app/api/auth/**
  apps/web/app/api/ref/**
  apps/web/app/layout.tsx, app/globals.css, middleware.ts
  package.json, tsconfig*.json, next.config.ts, docker-compose.yml, .env.example
  CLAUDE.md, docs/**

If a change is needed in any OTHER path, do NOT edit it. Append an entry to
docs/BLOCKERS.md and tell me. Other roles own:
  R2 = services/ml/**, app/api/{prices,forecast,window}/**, src/lib/domain/{window,costs}.ts
  R3 = src/lib/domain/{grading,matching,escrow,ledger,split}.ts, app/api/{lots,pools,demand,match,offers,tx,ledger,disputes}/**
  R4 = app/(farmer)/**, src/components/farmer/**, src/i18n/**
  R5 = app/(buyer|fpo|admin)/**, src/components/{buyer,admin}/**, prisma/seed/**, tests/**

Hard rules for you specifically:
- Money is integer paise. Quantity is integer kilograms. Never a float for money.
- Never store Aadhaar. Phone number is the identifier. There is no exception.
- Every DB read of user data is scoped by the session actor via guard(). Use
  findFirst with the owner in the `where` clause, never findUnique on a client id.
  Return 404, not 403, for rows the actor may not see.
- Every route validates its body with a Zod schema from @mandi/contracts. No `as any`.
- Never commit a secret. Only .env.example is committed.
- Never log a phone number, an OTP, or a full request payload.
- TypeScript strict is on, including noUncheckedIndexedAccess. Keep it green.

After each task: run `npm run typecheck`, then commit with a conventional message
(`feat(spine): …`), then push. Commit every 30–45 minutes. Never let main go red.

Start with Task 1 in docs/roles/R1_SPINE.md. Tell me your plan before you write files.
```

---

## Why your role exists

Four agents are about to write code against a database and a set of type contracts.
If those move, their work breaks. If those are late, their work never starts. Your job
in the first four hours is not to write features — it is to **make it impossible for the
other four to be blocked**, and then to keep it that way.

Your second job, from H54, is to be the one person who tries to break the system on
purpose. You run the security pass in `docs/02_SECURITY_AND_QUALITY.md` Part C. Nobody
else will, and a found IDOR at judging is worse than a missing feature.

You are also the only person who touches `main`.

---

## Files you own

```
prisma/schema.prisma                       ← ONLY YOU. This is the contract of contracts.
packages/contracts/**                      ← ONLY YOU. Frozen at H4.
apps/web/src/lib/db.ts                     prisma client singleton
apps/web/src/lib/env.ts                    typed env parsing — fail loudly at boot
apps/web/src/lib/auth.ts                   JWT sign/verify (jose), cookie helpers
apps/web/src/lib/guard.ts                  guard(role) → actor  ← the IDOR defence
apps/web/src/lib/ml.ts                     typed ML client, 3s timeout, fallback
apps/web/src/lib/ratelimit.ts              in-memory limiter
apps/web/src/lib/http.ts                   ok / badRequest / notFound / envelope
apps/web/src/lib/audit.ts                  audit(actor, action, entity, before, after)
apps/web/src/lib/idem.ts                   idempotency-key helpers
apps/web/src/components/ui/**              shadcn primitives — others import, never edit
apps/web/app/api/auth/**                   otp request/verify, logout, me
apps/web/app/api/ref/**                    markets, commodities
apps/web/app/layout.tsx  app/globals.css  middleware.ts
package.json  tsconfig*  next.config.ts  docker-compose.yml  .env.example
CLAUDE.md  docs/**
```

**Forbidden:** every `app/api` folder that is not `auth` or `ref`; every `src/lib/domain`
file; every route group `(farmer)`, `(buyer)`, `(fpo)`, `(admin)`; `src/components/farmer`,
`buyer`, `admin`; `src/i18n`; `services/ml`; `prisma/seed`; `tests`.

---

## Task list — work in this order

### H0 → H4 · Lockdown (with the whole team in the room)

**T1.1 — Bootstrap the app so five machines boot.**
`npx create-next-app@latest apps/web --ts --tailwind --app --eslint --src-dir` then wire
it into the workspace. Install: `prisma @prisma/client zod jose bcryptjs recharts
date-fns clsx tailwind-merge lucide-react`. `npx shadcn@latest init` and add the
primitives everyone will need immediately: `button card input label select badge tabs
dialog sheet table skeleton alert separator progress toast`.

Add them **now**, in one go. If R4 needs a `Dialog` at H30 and you own
`src/components/ui`, you become a blocker for something that takes ten seconds.

Acceptance: `npm run dev` boots on all five laptops; `npm run typecheck` green.

**T1.2 — Postgres + schema.**
`npm run db:up` (port 5433, already in `docker-compose.yml`), then `npm run db:push`.
Open Prisma Studio and confirm the ~30 tables exist.

Then **walk the schema out loud with all four teammates**. Ask each: "name every field
you need that isn't here." Write down what they say and add it now. This 30-minute
conversation is the cheapest insurance in the whole project — every field added at H4
costs a minute; the same field at H40 costs an hour and a broken branch for two people.

Acceptance: schema pushed; four teammates have each said "my fields are there."

**T1.3 — Contract sign-off, then freeze.**
Walk `packages/contracts/src/index.ts` the same way. Then announce, in words, in the
group: **"contracts are frozen; changes go through BLOCKERS.md."**

Acceptance: `npm run build -w @mandi/contracts` green; `dist/` importable from
`apps/web`; freeze announced.

**T1.4 — `src/lib/env.ts` — fail loudly, at boot, once.**
```ts
// Parse process.env with Zod at module load. A missing AUTH_SECRET must crash the
// server on start with a clear message — NOT produce an unsigned JWT at H60.
export const env = EnvSchema.parse(process.env);
```
Acceptance: deleting `AUTH_SECRET` from `.env` makes `npm run dev` fail with a readable
message naming the variable.

### H4 → H20 · Walking skeleton

**T1.5 — Auth, end to end.** This is your critical path; nothing else of yours matters
until it works.

- `POST /api/auth/otp/request` — validate phone `/^[6-9]\d{9}$/`; create/find `User`;
  generate a 6-digit code; store `OtpCode { hash, expiresAt: +5min, attempts: 0 }`;
  rate-limit 3/phone/10min and 20/IP/hour. Return `{ sent: true }`, plus `devCode`
  **only** when `DEV_OTP_ECHO === 'true' && process.env.NODE_ENV !== 'production'`.
  Both conditions. One is not enough — a mis-set env var in prod would echo OTPs.
- `POST /api/auth/otp/verify` — constant-time compare; increment `attempts`; die at 5;
  mark the code used on success (single-use); sign a JWT with `jose`
  (`{ sub, role, farmerId?, buyerId?, fpoId? }`, 72h); set `httpOnly secure sameSite=lax`.
- `GET /api/auth/me` → `SessionUser` | 401. `POST /api/auth/logout` clears the cookie.

Do **not** use NextAuth. It costs an hour of config friction for a phone-OTP flow that
is 60 lines of `jose`, and its abstractions will fight you on the role shape.

Acceptance: full login on a phone-sized viewport; wrong OTP 5× locks the code; the
cookie is not visible to `document.cookie`; the same phone twice does not create two users.

**T1.6 — `guard()`. The single most security-critical function in the repo.**
```ts
/** Returns the authenticated actor, or throws 401/403.
 *  The ONLY source of actor identity. Never read an actor id from a request body. */
export async function guard(role?: Role | Role[]): Promise<Actor>
```
`Actor` carries `userId`, `role`, and the resolved `farmerId | buyerId | fpoId`. Every
other role's routes will call this and use `actor.farmerId` in their `where` clauses.
Write the doc comment carefully — four agents will read it and copy the pattern.

Acceptance: unit test — no cookie → 401; farmer cookie with `guard('BUYER')` → 403;
valid → actor with the right scoped id.

**T1.7 — `http.ts`, the uniform envelope.**
`ok(data)`, `created(data)`, `badRequest(zodError)` → 422 with `fields`, `unauthorized()`,
`forbidden()`, `notFound()`, `conflict(code, msg)`, `serverError()`. Also a
`withRoute(handler)` wrapper that catches thrown `ApiError`s so no route needs try/catch
boilerplate and no stack trace ever reaches a response body.

**T1.8 — `/api/ref/markets` and `/api/ref/commodities`.** Unauthenticated (they are
public reference data), cached. R4 needs these for every dropdown; ship them early.

**T1.9 — Deploy on day one, not day three.**
Vercel project + Neon Postgres. Push `r1-spine`, get a preview URL green, run
`prisma db push` against Neon and seed it. Do this at H18, not H64. Every team that
leaves deployment to the last block discovers a build-only failure — an env var, a
Prisma binary target, an ESM import — with three hours left and no slack.

Acceptance: a public URL where login works, on a phone, over mobile data.

**Checkpoint A gate (H20):** a farmer logs in and sees a price that came out of Postgres.

### H28 → H48 · Harden and integrate

**T1.10 — `audit.ts`.** `audit({ actor, action, entity, entityId, before, after })`,
inserted in the **same transaction** as the write it describes. If the write rolls back,
the audit row must roll back with it. Give the other roles a one-line usage example in
`docs/BLOCKERS.md` so nobody invents their own.

**T1.11 — `idem.ts`.** `withIdempotency(key, fn)` — look up by key, return the stored
result on replay, otherwise run and store. R3 needs this on offer-accept and every
tx transition (S10).

**T1.12 — `ml.ts`.** Typed client for the FastAPI service. `x-ml-key` header, **3-second
timeout**, and a defined fallback: on any failure return a `NO_ADVICE` recommendation
with `refusalReason: 'forecast service unavailable'`. Never throw into a route. The ML
service *will* be down at some point in these 72 hours; the demo must not care.

**T1.13 — `ratelimit.ts`.** In-memory `Map`. Say "Redis in production" honestly on the
slide rather than pretending it is distributed.

**T1.14 — Integration duty.** From H28 you are half-time on your own code. The other
half: merging branches, resolving conflicts, and answering the four "does the contract
allow X?" questions per hour. **Protect this time.** A blocked teammate costs more than
your next commit.

**T1.15 — `middleware.ts`.** Redirect unauthenticated users away from protected route
groups. Note clearly in a comment that middleware is UX, **not** access control — the
route-level `guard()` is the access control. A team that relies on middleware for
authorisation has an unauthenticated API.

### H54 → H68 · The pass that protects the demo

**T1.16 — Run Part C of `docs/02_SECURITY_AND_QUALITY.md` personally.** Every line.
~90 minutes. Do not delegate. Do not skim. Specifically, read the `where` clause of
every single `findUnique`, `findFirst`, `findMany`, `update` and `delete` in the repo and
confirm the actor is in it.

**T1.17 — `npm run verify` green, production deploy, phone test over mobile data.**

**T1.18 — Enforce the H58 feature freeze.** You are the one who says no. Somebody will
want to add one more thing at H61. The answer is no, and the reason is that an unfound
bug in a 3-hour-old feature is exactly how demos die.

---

## Your failure modes, named

| Failure | How it shows up | Prevention |
|---|---|---|
| Auth slips past H20 | Four people are stubbing sessions and nothing is really protected | Auth is T1.5, before anything clever |
| You start writing domain logic | You are the bottleneck and now you are also busy | It is not your file. Hand it back. |
| Deploy left to H64 | A build-only failure with no slack | T1.9 at H18 |
| Schema churn after H4 | Two teammates' branches break simultaneously | Field-by-field sign-off at T1.2 |
| You never run the security pass | A judge finds the IDOR instead of you | H58 block is in the plan; treat it as unmovable |
| `main` goes red and stays red | Four people rebase onto a broken tree | Nobody merges but you, and only when verify is green |
