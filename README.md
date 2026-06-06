# Plinko — Provably Fair

An interactive Plinko game with a commit-reveal RNG protocol, deterministic outcome engine, animated UI, and a public verifier page.

**Live app:** https://plinko-games.vercel.app
**Verifier page:** https://plinko-games.vercel.app/verify
**Example round:** Play a round, then click "Verify this round" for a permalink

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or a [Neon](https://neon.tech) connection string)

### Local setup

```bash
git clone https://github.com/Prynshumishra/Plinko-Game.git
cd Plinko-Game
npm install
```

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/plinko
```

Push the schema and start:

```bash
npm run db:push   # creates tables (no migration files needed)
npm run dev       # http://localhost:3000
```

### Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server with hot reload |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm start` | Serve the production build |
| `npm test` | Run all unit tests with Vitest |
| `npm run test:watch` | Vitest in watch mode |
| `npm run db:push` | Sync Prisma schema → database |
| `npm run db:studio` | Open Prisma Studio (DB browser) |

### Docker (Postgres only)

If you don't have a local Postgres, start one with:

```bash
docker compose up -d
```

Then set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/plinko` in `.env.local`.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Next.js)                 │
│                                                      │
│  page.tsx ──► useGameState (hook)                   │
│     │              │                                 │
│     │         3-step API flow:                       │
│     │         POST /api/rounds/commit                │
│     │         POST /api/rounds/:id/start             │
│     │         POST /api/rounds/:id/reveal            │
│     │                                                │
│  PlinkoCanvas (Canvas 2D) ◄── BallAnimator          │
│  BetControls · SeedInput · PaytablePanel · RoundLog  │
│  /verify ──► VerifierForm ──► GET /api/verify        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────┐
│              Next.js API Routes (Node.js)            │
│                                                      │
│  lib/engine/                                         │
│    hash.ts        SHA-256 commit + combined seed     │
│    prng.ts        xorshift32 PRNG                    │
│    pegMap.ts      peg bias generation + hash         │
│    pathResolver.ts  ball path decisions              │
│    payout.ts      multiplier table                   │
└──────────────────────┬──────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────────┐
│             PostgreSQL  (Neon / local)               │
│             Round model — see prisma/schema.prisma   │
└─────────────────────────────────────────────────────┘
```

### Key files

| Path | Purpose |
|---|---|
| `app/page.tsx` | Main game page — layout, phase state, keyboard bindings |
| `hooks/useGameState.ts` | 7-phase state machine (IDLE → COMMITTING → … → RESULT) |
| `components/game/PlinkoCanvas.tsx` | Canvas renderer — pegs, ball, bins, confetti |
| `components/game/BallAnimator.ts` | Bezier-arc ball animation, reduced-motion support |
| `lib/engine/` | Pure deterministic engine — no side effects, fully testable |
| `app/api/rounds/` | Commit / start / reveal / list API routes |
| `app/api/verify/route.ts` | Stateless re-computation endpoint |
| `app/verify/page.tsx` | Public verifier page — auto-fills from URL params |

---

## Provably-Fair Protocol

### Commit-reveal flow

1. **Commit** — Server generates a random `serverSeed` (32 random bytes as hex) and a random `nonce`. It stores both privately and returns only:
   ```
   commitHex = SHA-256(serverSeed + ":" + nonce)
   ```
2. **Start** — Player submits `clientSeed`, `betCents`, `dropColumn`. Server computes:
   ```
   combinedSeed = SHA-256(serverSeed + ":" + clientSeed + ":" + nonce)
   ```
   All randomness for this round flows exclusively from `combinedSeed`. The outcome is determined here but `serverSeed` is not yet revealed.
3. **Reveal** — After the animation completes, server publishes `serverSeed`. Anyone can now verify that `SHA-256(serverSeed + ":" + nonce) === commitHex`, proving the seed was not changed after the player submitted their seed.

### Hash function

SHA-256 via Node.js built-in `crypto.createHash('sha256')`. No external library.

### PRNG — xorshift32

```
seed  = first 8 hex chars of combinedSeed parsed as big-endian uint32
state ^= state << 13
state ^= state >>> 17
state ^= state << 5
rand() = (state >>> 0) / 0x100000000   → [0, 1)
```

PRNG stream order: peg map generation first (78 calls for 12 rows), then 12 row decisions. This order is identical in the engine and the verifier.

### Peg map

For rows `r = 0..11`, each row has `r + 1` pegs. Each peg's `leftBias` is:

```
leftBias = round(0.5 + (rand() - 0.5) * 0.2, 6dp)
         = range [0.4, 0.6]
```

Rounding: `Number(value.toFixed(6))` — trailing zeros are dropped by JS number coercion (e.g. `0.468780` is stored as `0.46878`). The `pegMapHash` is `SHA-256(JSON.stringify(pegMap))` and is stable for any given `combinedSeed`.

### Drop column influence

```
adj    = (dropColumn - floor(ROWS / 2)) * 0.01   // dropColumn ∈ [0..12]
bias'  = clamp(leftBias + adj, 0, 1)
```

Column 6 (center) → `adj = 0`. Edges pull the ball slightly left or right.

### Decision per row

At row `r`, with current position `pos` (number of Right moves so far):

```
pegIdx   = min(pos, r)
rnd      = rand()
decision = rnd < bias' ? "Left" : "Right"
if Right: pos += 1
```

`binIndex = pos` after 12 rows.

### Paytable (bins 0–12, symmetric)

| Bins | 0, 12 | 1, 11 | 2, 10 | 3, 9 | 4, 8 | 5, 7 | 6 |
|---|---|---|---|---|---|---|---|
| Multiplier | 10× | 5× | 3× | 1.5× | 1× | 0.5× | 0.3× |

---

## Test Vectors

These are hard-coded in the unit tests and must pass exactly:

```
serverSeed   = b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc
nonce        = 42
clientSeed   = candidate-hello
dropColumn   = 6

commitHex    = bb9acdc67f3f18f3345236a01f0e5072596657a9005c7d8a22cff061451a6b34
combinedSeed = e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0

First 5 rand() values: 0.1106166649, 0.7625129214, 0.0439292176, 0.4578678815, 0.3438999297

Peg map (first 3 rows):
  Row 0: [0.422123]
  Row 1: [0.552503, 0.408786]
  Row 2: [0.491574, 0.46878, 0.43654]

binIndex = 6  (center drop, adj = 0)
```

Run tests: `npm test`

---

## Easter Eggs

| Trigger | Effect |
|---|---|
| Press **T** | TILT mode — board rotates ±5° with a sepia/contrast filter |
| Land center bin 3× in a row | **Golden Ball** — next drop uses a gold trail and glow |

---

### Where AI was used

| Area | Usage |
|---|---|
| Project scaffold | Bootstrapped Next.js 14 + Prisma + Vitest + Tailwind config |
| Engine design |
| Unit tests | Generated all test files with the spec's test vectors pre-loaded |
| Bug fixes | Fixed TypeScript strict-mode error (`this.path[row]?.decision`), React render-phase setState bug in VerifierForm, favicon 404
| Mobile layout | Canvas aspect-ratio wrapper, responsive bet button grid, header condensing |
| README | This document |

### What was kept vs changed

- The commit-reveal API flow was generated then reviewed for the security gap where `serverSeed` was being returned before reveal — caught and fixed during audit.
- Canvas rendering logic was generated then refined for the `aspect-ratio` responsive wrapper after testing on mobile viewport sizes.

---


### What I'd do with more time

- **Fixed-timestep physics** (Matter.js) for true continuous collision with pegs, while keeping discrete decisions authoritative for fairness
- **Wallet / balance system** with session-scoped credits, profit/loss tracker
- **Risk levels** (Low / Medium / High) with different paytables and row counts (8 / 12 / 16)
- **Auto-bet** mode with configurable stop-on-win / stop-on-loss
- **CSV export** of round hashes for offline verification
- **Real-time session log** via WebSocket instead of 3-second polling
- **"Open sesame" secret theme** easter egg (dungeon/torchlight mode)
- **Proper migrations** (`prisma migrate dev`) instead of `db push` for production history

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |

No other secrets are needed. The server seed is generated at runtime via `crypto.randomBytes`.

---

## License

MIT
