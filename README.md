# Ronin Survivor

A *Vampire Survivors*–style horde-survival auto-battler with an **Afro Samurai–inspired** theme (theme *inspired by*, deliberately legally distinct — original title, original art). A lone afro'd swordsman holds his ground on a blood-red road: you only move, your blade swings itself, and the swarm never stops. Between runs you return to a walkable **Dojo** hub to spend the Ryo you earned.

**Play it:** <https://mattdanusergrant.github.io/ronin-survivor/>

## Repo contents

- `index.html` — the game. Single self-contained file (vanilla JS/Canvas, no build step, no dependencies).
- `mapbuilder.html` — standalone visual map editor: place/chain/drag buildings, validate gate seals against the real generator, export/import JSON, one-click playtest. Play a custom layout via `index.html?map=custom`.
- `assets/sprites/` — pixel-art sprites + a drop-in pipeline: drop a correctly-named PNG and it appears in-game on next load, falling back to procedural art until it's there. See `assets/sprites/README.md` for the naming/size convention.
- `design-docs/GDD.md` — design doc (pillars, core loop, prototype scope, balance knobs, open questions).
- `CLAUDE.md` — dev guide / handoff notes: how to run & verify, a code map of `index.html`, and gotchas for the next dev.
- `.github/workflows/pages.yml` — auto-deploys the site to GitHub Pages on every push to `main`.

## How to play

- **On a phone:** open the hosted URL above.
- **Locally:** open `index.html` in any browser, or `python3 -m http.server` from the repo root and visit `http://localhost:8000`.

**Controls (desktop-first):**

- **Move** — WASD / arrow keys
- **Aim + fire** — point with the mouse, hold **left-click** to fire an aimed ki bolt at the cursor
- **Spacebar** — **dodge-roll** (a quick dash with brief invulnerability); when you're standing on something usable (a campfire checkpoint, the Dojo, or a Dojo station) it **interacts** instead. `E`/`Enter` also interact.
- Your drafted weapons still fire **automatically** on top of all this
- **Esc/P** — pause

Walk over glowing **ki** to fill the level bar; on level-up, **click a boon** to draft it. Don't let enemies touch you. *(Touch fallback: drag anywhere to move — mobile is no longer the primary target.)*

**Goal:** push deeper into the gated world and survive. There are **no ambient spawns** — the swarm comes from **dormant summoner nests** strung along the roads (deeper = tougher). Wake one and it conjures a spectral horde until you cut through and kill the summoner; clear an area and it's safe. Resting at a campfire (or dying) resets every nest, so cleared ground is re-runnable. Build toward a screen-clearing storm of steel and spirit-fire before the swarm overwhelms you.

## What's in the prototype

- Desktop controls: WASD move, mouse-aimed left-click ki bolt, spacebar dodge-roll / interact (touch drag-to-move kept as a fallback)
- Auto-firing weapons × 6 levels (Katana Slash, Throwing Stars, Ki Wave, Spirit Blades, Iron Crusher, …) + stackable passives, all firing on top of the manual aimed shot
- Level-up boon draft (3-of-N, pauses time)
- A **gated world** carved from solid forest: a procedural spiral of zones around the Dojo, each sealed by a boss until you clear it; razed camps leave campfire checkpoints
- **Summoner nests** along the roads (the enemy source): walk near a dormant nest to wake its summoner and its spectral horde; kill the summoner to dissolve the horde; flee the leash to put it back to sleep; resting/dying resets them
- Clearing a special building grants a **run-scoped boon draft** (Shrine = Blessing, Cache = Arsenal, the three altars = build-defining pacts)
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
