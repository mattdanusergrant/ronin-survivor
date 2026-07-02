# Improvement Plan — ronin-survivor

> Generated 2026-07-02 from a full 12-repo portfolio audit (Claude Code session).
> Companion career report: ConductiveOS vault, `09_personal/2026-07-02-life-audit-and-career-plan.md`.

**What this is:** A Vampire-Survivors-style horde-survival auto-battler (legally-distinct Afro Samurai homage) built as one self-contained 4,988-line vanilla-JS/Canvas file, with a grid map editor, meta-progression, headless smoke tests and CI — his most engineered game.

**Stack:** Vanilla JavaScript, Canvas 2D, Node (headless smoke test via DOM/canvas stubs), GitHub Actions (test + Pages deploy), localStorage persistence · **Maturity:** active-development · **Live:** https://mattdanusergrant.github.io/ronin-survivor/
**Size:** ~5k lines JS in index.html + 510-line map editor + 543-line smoke test

## What's genuinely good here

- Documentation is hiring-manager-grade: CLAUDE.md is a model handoff doc (stable symbol code-map, system-interaction notes, gotchas); design-docs/GDD.md v0.1 has pillars, scope discipline, and deliberate cut-lists; design-docs/TODO.md records completed redesigns with dated rationale
- Testing discipline that's rare in hobby gamedev: dependency-free headless smoke test (test/smoke.js) drives the real game through a ?expose=1 dev hatch behind DOM/Canvas stubs; runs in CI on every push/PR (.github/workflows/test.yml)
- A real systems-design act: the documented enemy-flow redesign from timer-based ambient spawns to place-based summoner nests + finite camps (Souls/VS hybrid) — including sweeping the dead code afterwards (dated 2026-06-19)
- Complete toolchain thinking: mapbuilder.html grid painter exports the same v2 map spec the game loads; sprite pipeline with procedural-art fallback so partial art never breaks the build
- Meta-progression + hub (Dojo, Ryo Trader, run snapshot/restore) — a full game-shaped game, not a demo


## Issues found

- HEAD commit is 'Triple Ronin speed for testing' (61b2394) — debug tuning committed straight to the deploy branch, so the live Pages build ships 3x player speed
- index.html at ~5k lines is nearing the single-file ceiling; CLAUDE.md itself relies on 'search for landmarks' navigation — fine solo, but a liability the repo half-acknowledges
- No audio at all, no win condition/time cap — the two biggest 'feels unfinished' gaps the GDD already names as next-up
- All combat/nest balance values are self-described 'first-pass guesses'; no playtest telemetry exists to tune against
- The v2 map-spec shape is duplicated between index.html and mapbuilder.html by convention only ('if you change the spec, change both') — no shared source of truth or spec test
- Smoke test asserts no-throw/no-NaN, not gameplay correctness — e.g. the 3x-speed debug commit passed CI silently, which proves the gap


## Ranked improvements

### 1. Revert the 'Triple Ronin speed for testing' commit  `impact 5/5 · effort S`

**Why:** Debug tuning is live in production right now; it also demonstrates the missing guard between 'testing' and 'deploy'

**How:** git revert 61b2394; then add a smoke-test assertion pinning player.speed (and other tunables) to design values so CI catches stray debug tuning

**Career angle:** Anyone evaluating the live game today plays a broken-feeling build — this is the single cheapest fix with the highest portfolio effect

### 2. Ship a win condition + time cap  `impact 5/5 · effort M`

**Why:** GDD names it as the top next-up; it converts an endless sandbox into a completable game reviewers can finish

**How:** Add a run goal (e.g. clear the final gated zone or survive N minutes) to the STATE machine (loop/update/draw), surface it in the game-over stats, and include it in snapshotRun/restoreRun

**Career angle:** 'Shipped a complete game' reads far better than 'built a prototype'

### 3. Write the case study: 'A tested, CI'd, single-file game'  `impact 5/5 · effort S`

**Why:** The repo's most marketable trait isn't the game — it's the engineering discipline around it (headless smoke test, dev hatch, handoff docs); that story is currently invisible unless someone reads the repo

**How:** Anonymize nothing — this one's public: a case-studies/ page on mattdanusergrant.com walking through the ?expose=1 test harness, the enemy-flow redesign decision record, and the AI-pair workflow from CLAUDE.md

**Career angle:** Directly evidences senior-engineer habits (testing, docs, decision records) to non-game employers — the highest-salary audiences

### 4. Minimal audio pass (Web Audio, no assets)  `impact 4/5 · effort M`

**Why:** Silence is the loudest unfinished signal in a game; procedural SFX keeps the no-dependency ethos

**How:** One small AudioContext helper near the juice systems (hit-flash/shake already centralize feedback moments); synthesize hits/level-up/boss stings; respect a mute toggle in SETTINGS

**Career angle:** Moves the live demo from 'prototype' to 'polished' in the first 30 seconds of a hiring manager's playtest

### 5. Run-stats telemetry for balance tuning  `impact 4/5 · effort M`

**Why:** Every tunable is a first-pass guess; you can't balance what you don't measure

**How:** Extend the existing game-over stats + localStorage meta into an exportable run-log (time-to-level, damage by weapon, death cause); optionally pipe playtester feedback through the Supabase feedback infra already built in jabberjawbreaker

**Career angle:** Data-informed balancing is exactly what technical-designer roles screen for

### 6. Single source of truth for the map spec  `impact 3/5 · effort S`

**Why:** The game and editor duplicate the v2 spec shape by convention; drift breaks custom maps silently

**How:** Extract a tiny shared map-spec module (or a JSON-schema-ish validator function) included by both index.html and mapbuilder.html via a <script src>, plus a smoke-test case that round-trips an exported spec through loadGridMap

**Career angle:** Shows API/contract thinking, not just game hacking


## Skills this repo proves (for hiring managers)

- Game systems design with documented decision records (enemy-flow redesign)
- Framework-free JS/Canvas engineering at ~5k-line scale
- Test harness design (headless DOM-stub smoke testing of a rendering app) + CI
- Tooling/editor construction sharing a versioned data spec
- Technical writing (CLAUDE.md handoff doc, GDD, TODO decision log)
- Scope management (explicit cut-lists, dated design passes)


## Career signals

- CI on every push/PR — rare for hobby gamedev
- Docs-first culture throughout
- Live deployed and playable
- Active development (52 commits)
- BUT: debug commit at HEAD undermines the discipline story until reverted


## Monetization angles

- Steam/itch packaging via a desktop wrapper once win condition + audio land (the VS-like market is proven)
- More realistically: the repo's value is portfolio, not revenue — the case study is worth more than sales


## Standout artifacts to show off

- test/smoke.js — headless smoke test of a canvas game with zero dependencies
- CLAUDE.md — the handoff doc itself
- design-docs/TODO.md — dated design-pass decision records
- mapbuilder.html — self-contained grid map editor sharing the game's spec


## Cross-repo connections

- mattdanusergrant.com case study on the test-harness + AI-pair engineering story
- jabberjawbreaker's Supabase feedback/Discord-notify infra drops in for playtest feedback
- ConductiveOS 10_game-asset-library feeds the sprite pipeline
- mustdesigngames index should cross-link the live build as the collection's flagship


#LLM-generated
