# CLAUDE.md — Ronin Survivor dev guide / handoff notes

Orientation for the next person (human or agent) picking this up. For the
*what* and *why*, read `design-docs/GDD.md`; this file is the *how* and *where*.

## TL;DR

- **What it is:** a *Vampire Survivors*–style horde-survival auto-battler with an
  Afro-Samurai-inspired (legally distinct) theme. Vanilla JS + Canvas 2D.
- **No build step, no dependencies.** The entire game is one self-contained file:
  `index.html` (HTML/CSS/`<script>` all inline).
- **Companion tool:** `mapbuilder.html` — a standalone custom-map editor.
- **Deploy:** push to `main` → GitHub Pages via `.github/workflows/pages.yml`
  (the whole repo root is the site). Live at
  <https://mattdanusergrant.github.io/ronin-survivor/>.

## Run it

- **Play locally:** open `index.html` in a browser, or
  `python3 -m http.server` from the repo root → <http://localhost:8000>.
- **Custom map:** `index.html?map=custom` (the spec is authored in
  `mapbuilder.html` and travels through `localStorage`).
- **Dev hatch:** `index.html?expose=1` puts draw functions and live state on
  `window.__art` (see bottom of the script). Used by asset/screenshot tooling
  and handy for a headless smoke test.

## Verify a change

```bash
# 1. Headless smoke test (dependency-free; ~10 assertions over the key paths).
#    Loads the inline <script> in Node behind a DOM/Canvas stub via ?expose=1,
#    starts a run, fires every weapon at a swarm, runs the Dojo + nest paths,
#    and asserts no throw / no NaN / sane state. Catches a SyntaxError on load
#    too, so it subsumes the old `node --check`.
npm test            # === node test/smoke.js  (exit 0 = pass, 1 = fail)

# 2. Open the game in a browser and sanity-play: title → run, level up, wake a
#    summoner nest, clear a zone boss, rest at a campfire, enter the Dojo.
```

CI runs the same smoke test on every push/PR (`.github/workflows/test.yml`).

The smoke test (`test/smoke.js`) drives the game through the `?expose=1` dev
hatch (`window.__art`). If you add a system you want covered, expose the handle
it needs in the `window.__art` block at the end of the script (the headless-sim
hooks are grouped there) and add a `test(...)` case. It's a *smoke* test — it
exercises code paths and invariants, not feel or pixels (the canvas is a no-op
stub, so it confirms the draw code doesn't throw, not what it draws).

## Code map — `index.html` (single `<script>`)

Search for these landmarks (line numbers drift; the names are stable):

| Area | Symbols |
|---|---|
| Global mutable state | `let game, player, enemies, orbs, shots, blades, fx, petals, shake` |
| Game states | `const STATE = { TITLE, PLAY, LEVELUP, PAUSED, OVER }` |
| Main loop | `function loop(now)` → `update(dt)` + `draw()` (rAF, dt clamped to 50ms) |
| Settings (persisted) | `SETTINGS` / `SETTINGS_KEY` (`ronin-settings-v1`); `upgradeMode` = `classic`\|`minimal` |
| Meta-progression (persisted) | `META` / `META_KEY` (`ronin-meta-v1`), `META_UPGRADES`, `applyMeta(p)` |
| Weapons / passives | `WEAPONS`, `PASSIVES`, `MINIMAL_UPGRADES` (each entry has `apply`/`desc`) |
| Player abilities | left-click `startRoll` (dodge, 2s cd), right-click `startDive`/`resolveDive` (bomb, 10s cd), space `startDeflect`/`deflectBolt` (parry); constants `ROLL_*`/`DIVE_*`/`DEFLECT_*` |
| Projectile/tell pacing | `PROJ_SLOW` (0.5× shot speed, applied in `stepShot`), `TELL_MUL` (2× wind-up, applied in `startEnemyAttack`) |
| Level-up draft | `buildOptions` / `buildMinimalOptions` → `openLevelUp` → `applyOption` |
| Enemies | `ENEMY_TYPES`; enemy AI lives in `update()` (states: `wander`→`alert`→`chase`) |
| Summoner nests (endless horde source) | `NEST`, `generateNests`, `activateNest`/`deactivateNest`, `summonAdd`, `dissolveHorde`, `resetNests` |
| Camps & patrols (finite source) | `MOB`, `generateMobCamps`, `spawnMobGroup`/`despawnMob`; `killEnemy` banks `mobId` kills; reset via `resetNests` |
| World gen | `BUILDING_TYPES`, `generateBuildings`, `generatePaths`, obstacles via `buildObstacleGrid` / `isWalkable` |
| Special-building boons | `BUILDING_BOONS`, `openBuildingDraft` |
| Dojo hub | `DOJO`, `DOJO_STATIONS`, `DOJO_DUMMIES`, `startDojo`, `updateDojoStations`; archers: `ARCHER`, `makeDojoArchers`, `updateArcher` |
| Run snapshot (dojo mid-run) | `snapshotRun` / `restoreRun` / `enterDojoFromRun` |
| Custom maps | `?map=custom` → `loadCustomMapSpec` (`CUSTOM_MAP_KEY` in `localStorage`) |
| Rendering | `draw()` + the `draw*` family (`drawEnemy`, `drawBuilding`, `drawPlayer`, …) |
| Mini-games (Options easter egg) | `updateVolley`/`drawVolley`, `updateSoccer`/`drawSoccer` |
| Dev hatch | `?expose=1` → `window.__art` (end of script) |

## How the core systems fit together

- **Enemy flow is place-based, not time-based.** There are no ambient spawns and
  no global difficulty clock. The roads are lined with **dormant summoner
  nests**; walking within `NEST.aggro` wakes a rooted summoner that pulses out a
  capped spectral horde. Kill the summoner → `dissolveHorde`. Flee past
  `NEST.leash` → `deactivateNest` (back to dormant). **Resting at a campfire or
  dying calls `resetNests`**, so cleared ground is re-runnable. Tuning knobs all
  live in the `NEST` object.
- **Two enemy sources, different rules.** Nests are the *endless* horde (re-arm
  on leash). **Camps & patrols** (`MOB` / `generateMobCamps`) are the *finite*
  packs: a fixed roster that wakes on approach and, crucially, **does not
  respawn** — `killEnemy` banks each member's kill on its camp, leashing away
  only despawns *survivors*, and a fully-cleared camp stays cleared. `resetNests`
  (rest/death) is the **only** thing that re-arms them — so if you add another
  "world reset" trigger, route it through `resetNests`.
- **`timeMul()` = `1 + t/75`** is a mild global HP scale. It applies to **zone
  bosses** (plus a per-depth multiplier), *not* to nest adds (those scale by
  nest `depth`).
- **Zone gating:** `BUILDING_TYPES` defines each zone boss; clearing a special
  building grants a **run-scoped boon draft** (`BUILDING_BOONS`) and opens the
  gate onward. The only **permanent** Ryo sink is the Dojo's Ryo Trader.
- **Dojo visits mid-run** snapshot/restore the entire run state
  (`snapshotRun`/`restoreRun`) — if you add new run-global state, remember to
  include it in the snapshot or it will reset on a Dojo visit.

## Gotchas / conventions

- **One file, no modules.** Order matters: it's plain top-level `const`/
  `function` declarations in one script. Keep new helpers near their system.
- **Procedural-art fallback.** Entities draw from `assets/sprites/*.png` when the
  file exists, else a Canvas placeholder — so partial art never breaks the build.
  See `assets/sprites/README.md` for the naming/size convention. Sprites must be
  committed to ship (Pages serves them).
- **Two upgrade modes.** `SETTINGS.upgradeMode` switches between the `classic`
  weapon/passive draft and a `minimal` stat-focused pool — touch both
  `buildOptions` *and* `buildMinimalOptions` when changing the level-up UI.
- **The boss banner** still reads "A WARLORD APPROACHES" and now fires on any
  zone/camp boss spawn (the old 60s warlord timer is gone). Cosmetic; rename if
  the theming bothers you.
- **Cut systems already removed** (don't resurrect by accident): time-scaled
  ambient spawning, the 60s world-boss timer, return-road marcher streaming, and
  the upgradeable-turret economy (replaced by the Dojo guardian archers). The
  retired spawner functions and the dead `'march'` enemy-AI branch were swept on
  2026-06-19 — see `design-docs/TODO.md`.

## Where to look next

`design-docs/GDD.md` open questions + next steps (title, win condition, audio,
characters, weapon evolutions) and `design-docs/TODO.md` follow-ups (nest
balance tuning, per-building boss identity, a checked-in smoke test).

#LLM-generated
