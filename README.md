# Ronin Survivor

A *Vampire Survivors*–style horde-survival auto-battler with an **Afro Samurai–inspired** theme (theme *inspired by*, deliberately legally distinct — original title, original art). A lone afro'd swordsman holds his ground on a blood-red road: you only move, your blade swings itself, and the swarm never stops. Between runs you return to a walkable **Dojo** hub to spend the Ryo you earned.

**Play it:** <https://mattdanusergrant.github.io/ronin-survivor/>

## Repo contents

- `index.html` — the game. Single self-contained file (vanilla JS/Canvas, no build step, no dependencies).
- `mapbuilder.html` — standalone **grid map painter**: paint terrain (floor/forest/water) and drop entities (Dojo, zone buildings, summoner nests, camps/patrols, gates, campfires, player spawn), export/import JSON, one-click playtest. Play a custom layout via `index.html?map=custom`.
- `assets/sprites/` — pixel-art sprites + a drop-in pipeline: drop a correctly-named PNG and it appears in-game on next load, falling back to procedural art until it's there. See `assets/sprites/README.md` for the naming/size convention.
- `design-docs/GDD.md` — design doc (pillars, core loop, prototype scope, balance knobs, open questions).
- `CLAUDE.md` — dev guide / handoff notes: how to run & verify, a code map of `index.html`, and gotchas for the next dev.
- `test/smoke.js` — dependency-free headless smoke test (`npm test`); also wired to CI (`.github/workflows/test.yml`).
- `.github/workflows/pages.yml` — auto-deploys the site to GitHub Pages on every push to `main`.

## How to play

- **On a phone:** open the hosted URL above.
- **Locally:** open `index.html` in any browser, or `python3 -m http.server` from the repo root and visit `http://localhost:8000`.

**Controls (desktop-first):**

- **Move** — WASD / arrow keys
- **Dodge** — **double-tap** a movement key to dash that way (i-frames). Each direction has its **own cooldown**, so you can dash a different way instantly — you just can't spam the same one.
- **Left-click** — **grappling hook** toward the cursor: anchors on the first wall/enemy/max-range and reels you in (i-frames). It **flies over water**, so it's how you cross lakes to reach pockets and shortcuts
- **Right-click** — **Chi Burst**: a targeted explosion centered on the cursor
- **Throwing kunai** — auto-thrown at whatever enemy your **cursor hovers**, if it's in range (no click)
- **Spacebar** — **Deflect Burst**: a brief parry window that knocks enemy projectiles back on their casters (good timing required). Also interacts when you're standing on something usable.
- **Interact** — `E` / `Enter` / `Space` when standing on something usable (a campfire checkpoint, the Dojo, or a Dojo station)
- Your drafted weapons fire **automatically** on top of all this
- **Esc/P** — pause

Walk over glowing **ki** to fill the level bar; on level-up, **click a boon** to draft it. Don't let enemies touch you. *(Touch fallback: drag anywhere to move — mobile is no longer the primary target.)*

**Goal:** push deeper into the gated world and survive. There are **no ambient spawns** — the swarm comes from **dormant summoner nests** strung along the roads (deeper = tougher). Wake one and it conjures a spectral horde until you cut through and kill the summoner; clear an area and it's safe. Resting at a campfire (or dying) resets every nest, so cleared ground is re-runnable. Build toward a screen-clearing storm of steel and spirit-fire before the swarm overwhelms you.

## What's in the prototype

- Desktop controls: WASD move; **double-tap to dodge** (per-direction cooldown); **left-click grappling hook**, **right-click Chi Burst**, **spacebar Deflect Burst**; cursor-hover **throwing kunai**; `E` / `Enter` / `Space` interact (touch drag-to-move kept as a fallback)
- Auto-firing weapons × 6 levels (Katana Slash, Throwing Stars, Ki Wave, Spirit Blades, Iron Crusher, …) + stackable passives
- All projectiles (yours and theirs) and all enemy charge-up tells move at a **deliberate half-speed** — combat reads as dodge/parry timing, not bullet-dodging reflexes
- Level-up boon draft (3-of-N, pauses time)
- A large, open **gated tile-grid world** (square tiles: floor / forest / water / gate): a built-in authored map — a wide Dojo plaza split by a lake, then a gated spiral of roomy zones (each sealed by a gate that opens when you clear its boss). **Water blocks walking but the grappling hook flies over it**, so there are grapple-only reward pockets and a lake shortcut. Make your own in `mapbuilder.html`
- **Summoner nests** along the roads (the endless-horde source): walk near a dormant nest to wake its summoner and its spectral horde; kill the summoner to dissolve the horde; flee the leash to put it back to sleep; resting/dying resets them
- **Camps & patrols** along the roads (the *finite* enemy source): packs of ordinary foes that wake on approach. Unlike nests they **don't respawn** — clear one and it stays cleared; flee mid-fight and survivors despawn but your kills stick. Only **resting at a campfire (or dying) re-arms them**
- Clearing a special building grants a **run-scoped boon draft** (Shrine = Blessing, Cache = Arsenal, the three altars = build-defining pure-upside boons)
- **Dojo hub** between runs — walkable room with training dummies, four guardian archers, and stations (Ryo Trader, Spirit Forge, The Road)
- **Meta-progression**: earn **Ryo**, spend it on permanent upgrades at the Dojo's Ryo Trader; persisted in `localStorage` across runs
- **Mini-games** (Samurai Soccer, Samurai Volley) — an Options-menu easter egg
- **Custom maps** via the `mapbuilder.html` editor (`index.html?map=custom`)
- **Sprite-art pipeline** with procedural fallback (see `assets/sprites/`)
- Zone boss buildings (capstone fights) + rooted summoners; no global difficulty clock
- Hit-juice (flash, knockback, damage numbers, sparks, screen-shake, i-frames)
- Title / pause / game-over-with-stats flow

## What's not in the prototype yet

Audio, weapon evolutions (VS-style fusions), multiple characters, stage variety, and a true victory condition — see the GDD's open questions and next steps.

## Enabling GitHub Pages (one-time)

The workflow at `.github/workflows/pages.yml` deploys the prototype to Pages automatically, but the repo's Pages source has to be set to **GitHub Actions** once:

1. Repo **Settings → Pages**
2. *Build and deployment* → Source: **GitHub Actions**

After the next push to `main`, the site goes live at `https://mattdanusergrant.github.io/ronin-survivor/`.
