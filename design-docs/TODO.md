# Ronin Survivor — Design TODO

Parked design passes, captured from the meta-systems audit (2026-06-16). These
are deliberate "later" items — not bugs. Each is a redesign, not a tweak.

---

## 1. Design pass on all special buildings — ✅ DONE (2026-06-16)

Resolved via the "full recast" direction:
- Clearing a special building now grants a **run-scoped boon draft** (pick 1 of
  3) via the level-up card UI — `BUILDING_BOONS` + `openBuildingDraft`.
  - Shrine → defensive *Blessing* (heals to full first).
  - Cache → offensive *Arsenal* (weapon level / new weapon / damage).
  - Smithy/Vigor/Spirit → build-defining *Altar* pacts with a tradeoff.
- Mid-run permanent Ryo shops **removed**; all permanent spending moved to the
  Dojo's new **Ryo Trader** station (`kind:'shop'` → `openDojoShop`).
- Zone chain **randomised** each run (zone 1 tutorial camp + shuffled mix
  guaranteeing all five specials + two camps).
- Bandit camps unchanged (Ryo orb + campfire checkpoint).

**Follow-up tuning (not blocking):** boon magnitudes are first-pass guesses;
balance once enemy flow (#2) is settled. Consider boss-fight identity per
building type as a separate pass (each boss is still just a stat block + the
shared telegraph set).

---

## 2. Redesign enemy flow — ✅ DONE (2026-06-16, "Version A" summoner nests)

Resolved by adopting the Souls/VS-hybrid pitch (clearable world, no ambient
spawns):
- **Cut** the old flow: time-scaled ambient `spawnEnemy`, the 75s world-boss
  timer, and all marcher/return-road streaming.
- **Added** `NEST` + `generateNests` / `activateNest` / `summonAdd` /
  `deactivateNest` / `dissolveHorde` / `resetNests`: dormant summoner nests are
  strung along the forward roads (depth-scaled). Approach wakes a rooted hooded
  summoner that conjures a spectral horde (bursts, capped); killing the summoner
  dissolves its horde; fleeing past the leash puts it back to sleep; resting at
  a campfire or dying **resets every nest** so ground is re-runnable.
- Zone **boss buildings** remain as capstone fights (boon + gate).

**Follow-up (not blocking):**
- Tuning pass: `NEST` cadence/cap/burst, summoner HP vs. depth, nest spacing —
  all first-pass guesses; needs a real playtest.
- ~~Dead code to sweep later: the retired spawners (`spawnEnemy`,
  `spawnMarcherFromCamp`, `spawnReturnMarcher`, `spawnInterval`,
  `campStreamInterval`, `returnStreamInterval`, `pointAlongRouteFromEnd`,
  `campMayStream`, the enemy AI `'march'` branch).~~ ✅ **SWEPT (2026-06-19)** —
  also removed the orphaned `clearedCount` helper, the dead `spawnAcc`/`bossT`/
  `bossN` game fields, and the unreachable `turretShot` draw branch (turret
  economy was cut earlier).
- Boss-fight identity per building type (still a stat block + shared telegraphs).

---

## 3. Handoff hygiene — ✅ DONE (2026-06-19)

Prep for handing the prototype to another dev:
- Dead-code sweep (see #2 follow-up above).
- Docs reconciled with the current build: README + GDD no longer mention the
  cut systems (time-scaled ambient spawns, the 60s warlord, return-road
  marcher lanes, upgradeable turrets) and now describe the summoner-nest flow,
  the four Dojo guardian archers, and the current balance constants.
- Added a `CLAUDE.md` at the repo root: architecture map, run/verify steps,
  code landmarks, and known gotchas for the next dev.

**Follow-up (not blocking):** ~~there is still no automated test harness checked
in — the GDD references a "DOM-stubbed sim" that lives outside this repo. Worth
committing a small headless smoke test (`?expose=1` already exposes the hooks).~~
✅ **DONE (2026-06-20)** — `test/smoke.js` is a dependency-free headless smoke
test (`npm test`) that loads the inline script behind a DOM/Canvas stub via
`?expose=1` and drives the key paths (run start, all weapons vs. a swarm, the
level-up draft, the Dojo, nest reset, every building boon). CI runs it on every
push/PR (`.github/workflows/test.yml`).

#LLM-generated
