# Ronin Survivor — GDD v0.1

**Slug:** `afro-survivor` · **Working public title:** *Ronin Survivor* · **Status:** playable web prototype

A *Vampire Survivors*–style horde-survival auto-battler, themed as an homage to **Afro Samurai** — a lone afro'd swordsman with the No.1-rival headband, walking a blood-red road, cut down by endless waves of foes who want the headband off his head. Theme is *inspired by*, deliberately **legally distinct** (same posture as Sigil Tactics): no licensed names, art, or music — original assets and an original title.

> Genre reference: *Vampire Survivors* (auto-attacking, move-only control, swarms, level-up boon drafts, escalating time pressure). Aesthetic reference: *Afro Samurai* (stark ink-black + bone-white + blood-red, lone-swordsman fantasy, drifting petals, a red sun).

---

## Pillars

1. **Active swordsman, automatic swarm-clear.** You move; your drafted weapons auto-fire; cursor-hover throws kunai; and you steer the fight with a kit of abilities — **double-tap to dodge** (each direction its own cooldown), a **left-click grappling hook**, a **right-click Chi Burst** (targeted explosion), and a **spacebar Deflect Burst** that parries enemy projectiles back on their casters. Decision-making lives in *positioning*, *ability timing*, and the *boon draft*. (Earlier builds were move-only; the combat layer was added deliberately, de-emphasising touch/mobile.)
2. **The swarm has a source.** A Souls/VS hybrid: the world is a quiet, explorable space dotted with **dormant summoners** along the roads. Wake one and it pumps out a VS-style spectral horde; cut through the adds, kill the summoner, and its whole horde vanishes. Clear an area and it's safe to navigate again. Difficulty is *place and depth* (which summoners you wake, how far out), not a global timer — and the world is clearable, resetting only when you **rest** at a campfire (or die).
3. **Power fantasy by minute 5.** Start fragile with one blade; end the run a whirling storm of steel and spirit-fire. The curve from "barely surviving" to "screen-clearing" is the product.
4. **Style is a feature.** Drawn-not-licensed art; high-contrast Afro-Samurai palette; satisfying hit-feedback (flash, knockback, sparks, screen-shake, damage numbers).

---

## Core loop

```
move to dodge / herd enemies  →  weapons auto-hit  →  foes drop ki
   →  collect ki, fill the bar  →  LEVEL UP: draft 1 of 3 boons
   →  stronger build  →  bigger swarm  →  repeat until you fall (or the timer ends)
```

A run takes place on a **square tile grid** (floor / forest / water / gate; `TILE`=64px). Movement collides with solid tiles while projectiles fly over them; faint pink petals drift across the top. The default world is **one built-in authored map** — large and open: a wide Dojo plaza split by a lake, then a gated spiral of roomy zones (Dojo → bandit camp → the five special buildings). Custom maps are painted tile-by-tile in **`mapbuilder.html`** (paint terrain, drop buildings/nests/camps/gates/campfires/spawn, export/import JSON) and played via `index.html?map=custom`. Each zone boss sits behind a **gate** that opens when the boss falls. **Water blocks walking but the grappling hook flies over it** — the map has grapple-only reward pockets (a campfire + a tougher nest, walled off by a moat) and a lake you can grapple straight across instead of taking the land-bridge the long way around. There are **no ambient spawns**: the roads are instead lined with **dormant summoner nests** (spaced along every corridor, deeper = tougher), each marked by a glowing sigil totem you can spot ahead. Walk within range and a hooded summoner wakes and conjures a spectral horde until you fight through and kill it — then its horde dissolves and the spot is safe. Flee far enough and it leashes back to sleep; **resting at a campfire (or dying) resets every nest**, so cleared ground can be re-run. A handful of friendly **guardian archers** (four) stand watch at the Dojo. Campfires (checkpoints) appear where bandit camps are razed. The camera follows the player. No menus mid-run except the level-up draft and special-building boon drafts (which pause time).

---

## Prototype scope (what is built — `index.html`)

Single self-contained file, vanilla JS + Canvas, no build step, mobile-portrait first. Built to this DoD — **all verified headlessly** (node syntax check + DOM-stubbed sim: spawn/kite/level-up/all-four-weapons/boss/render all pass):

- **Control (desktop-first):** WASD/arrows to move; **double-tap a direction** to dodge-dash it (i-frames; each of the four directions has its own cooldown); **left-click** fires a grappling hook that reels you to the first wall/enemy; **right-click** is a Chi Burst (targeted explosion at the cursor); **spacebar** is a Deflect Burst parry (and interacts when standing on something usable: campfire/Dojo/Dojo station). A throwing kunai auto-looses at whatever enemy the cursor hovers in range. Drafted weapons auto-fire. Touch drag-to-move is kept as a deprioritised fallback.
- **4 weapons**, each 6 levels:
  | Weapon | Behaviour |
  |---|---|
  | **Katana Sweep** (starter) | Periodic radial cut — hits every foe within reach *around* you. Levels: +dmg, +range, faster, wider visual sweep. |
  | **Throwing Stars** | Auto-targets the nearest foes; piercing shuriken. Levels: +count, +dmg. |
  | **Ki Wave** | Forward piercing crescent in your facing direction; hits all in its path. Levels: wider, +dmg. |
  | **Spirit Blades** | Blades orbit you, damaging on contact (per-foe hit cooldown). Levels: +count, +dmg. |
- **7 passives** (stackable, capped): Whetstone (+dmg), Iron Will (+max HP & heal), Swift Geta (+move), Quick Hands (−cooldowns), Soul Pull (+pickup range), Calm Breath (+regen), Ambition (+ki gain).
- **Level-up draft:** time pauses, 3 random eligible options (new weapon / weapon level / passive), tap to pick. Fallback "Second Wind" full-heal if everything is maxed.
- **Enemies:** footpad → ronin → ninja → brute, from three sources. (1) **Summoner nests** conjure an endless horde (type pool & strength scale with nest depth); the rooted hooded **summoner** has its own health bar and killing it dissolves the whole horde. (2) **Camps & patrols** are *finite* packs strewn densely along the roads — they wake on approach and **don't respawn** (flee and survivors despawn, but kills stick; only resting at a campfire or dying re-arms them). (3) Each **zone boss building** is a capstone fight that drops a boon and opens the gate onward; bosses are spaced apart so two never wake together.
- **Telegraphed attacks (dodge counterplay):** every type gets a signature tell that rewards a well-timed dodge. *Footpad* lobs a single slow ki bolt; *ninja* throws a slow 3-bolt spread; *ronin* winds up a forward cleave (locked red ground circle ahead); *brute* slams a big circle locked onto your current spot. Telegraphs are red ground markers whose inner fill converges to mark the impact instant; projectiles are slow enough to sidestep. **Bosses cycle four abilities** — ground slam, radial bolt ring, lunging cleave, and an aimed 5-bolt fan — rooting briefly mid-windup so the tell reads. Leaving the circle (or rolling through with i-frames) avoids the hit entirely.
- **Ki / XP:** orbs drop on kill, magnet-pull within pickup range, quadratic level curve.
- **Juice:** hit-flash, knockback, damage numbers, death sparks, screen-shake, i-frames + hurt-flash, drifting petals, red-sun vignette, grid ground.
- **Flow:** title → play → pause (resume/abandon) → game-over with run stats (time survived, felled, level) + restart.

### Now in the prototype beyond the VS core
- **Meta-progression:** Ryo currency earned per run, spent on permanent upgrades at the Dojo's **Ryo Trader** (the only permanent sink), persisted in `localStorage` (`ronin-meta-v1`); a walkable Dojo hub (Ryo Trader + Spirit Forge + The Road) with training dummies and four guardian archers; a gated tile-grid world with boss-sealed gates, campfire checkpoints (which also reset the world's summoner nests), and dormant summoner nests along the corridors; a sprite-art pipeline and a grid map editor (`mapbuilder.html`). Mini-games (Samurai Soccer, Samurai Volleyball) are an Options-menu easter egg rather than Dojo stations.
- **Special-building boon drafts:** the zone chain is randomised each run (zone 1 is always the tutorial camp; the rest is a shuffle that guarantees all five special buildings + two more camps). Clearing a special building grants a **run-scoped boon draft** (pick 1 of 3, reusing the level-up card UI): the **Forgotten Shrine** offers defensive *Blessings* (heals to full first), **Ronin's Cache** offers offensive *Arsenal* picks (weapon level / new weapon / damage), and the three ex-shops (**Smithy/Vigor/Spirit**) offer build-defining *Altar* boons — pure-upside power picks (e.g. +50% damage, +60% max HP, +22% move / −18% cooldowns). Bandit camps still drop a Ryo orb + plant a campfire checkpoint. Mid-run permanent Ryo shops were removed — all permanent spending now lives at the Dojo.

### Deliberately NOT in the prototype (next-up)
- Audio/music, more weapons & evolutions (VS-style weapon+passive fusions), multiple characters, stage variety, a true win condition / time cap, settings.

---

## Progression & balance (current first pass)

- **Player:** 100 HP, 148 px/s, 0.7s i-frames on contact. Abilities: dodge = 0.18s i-frame dash, **per-direction 1.6s cd** (double-tap); grappling hook = 560px reach, 4s cd (left-click); Chi Burst = 130px AoE, 6s cd (right-click); Deflect Burst = 0.18s parry window, 1.4s cd (spacebar); throwing kunai = 0.7s cadence, 360px range (cursor-hover).
- **Projectiles & tells:** all shots (player and enemy) fly at a global **0.5× speed**; all enemy charge-up telegraphs take **2× as long**. Combat is paced for read-and-react, not twitch.
- **Level curve:** `xpNext = round(50 + lvl²·11.5 + lvl·30)` — gentle early, steepening.
- **Global HP scale (`timeMul`):** `×(1 + t/75)` — applies to zone bosses (not nest adds, which scale by depth).
- **Summoner nests** (`NEST` in `index.html`): wake at 320px, leash at 760px; each summoner pulses `addBurst:2` adds every `addCd:0.7s`, capped at `addCap:14` live; spacing `along:600px`.
- **Summoner HP:** `round((110 + depth·60)·(1 + t/240))`; **nest add HP:** type base `×(1 + depth·0.12)`.
- **Zone boss HP:** per-building base (340–520, see `BUILDING_TYPES`) `× timeMul × (1 + 0.25·(depth−1))` — +25% HP per zone past the first.

These are *feel-tunable knobs*, not committed design. First playtest goal: confirm the "minute-5 power fantasy" curve lands and early survival is tense-but-fair, then tune.

---

## Tech

- **Web-first**, single `index.html`, zero dependencies/build (matches Sigil Tactics & tcg-pack-clicker). Runs by opening the file or via any static host.
- Fixed-ish timestep via rAF with a dt clamp; world-space + camera; Canvas 2D.
- **Art pipeline:** entities draw from pixel-art PNGs in `assets/sprites/` when present, falling back to procedural Canvas drawing when a sprite is absent — so the game stays playable at every stage of art delivery and the file is self-contained even with zero sprites. Sprites are committed to this public repo (they must ship to be served); a non-square sprite (e.g. the sword) keeps its native aspect. Companion tool `mapbuilder.html` authors custom worlds. See `assets/sprites/README.md`.

---

## Open questions (for the Operator)

1. **Title.** *Ronin Survivor* is a placeholder. Keep it, or pick another legally-distinct name? (Direct "Afro Samurai" naming is a trademark risk if ever shared publicly.)
2. **Win condition.** Endless-until-death (current), or a survive-to-N-minutes victory + boss finale (classic VS)?
3. **Meta-progression.** A first pass exists (Ryo → permanent upgrades at the Dojo's Ryo Trader, persisted between runs). Open question is now *depth*: how far to extend the upgrade tree / unlock system to carry long-term retention.
4. **Audio.** Lo-fi/hip-hop-samurai loop + SFX — generate procedurally (WebAudio) to stay asset-free, or source licensed tracks?
5. **Characters.** One swordsman, or multiple with different starting weapons/stats?
6. **Evolutions.** Add VS-style weapon+passive fusion ultimates (the depth hook)?

---

## Next steps

1. Operator playtest on phone → tune the difficulty/level curve and confirm the power-fantasy arc.
2. Resolve title + win-condition (Q1–Q2) — both are cheap and load-bearing.
3. Add WebAudio SFX/music (biggest felt-quality jump, still asset-free).
4. If the core proves fun: meta-progression + weapon evolutions (the retention layer).

To put it on a phone-reachable URL, see `07_projects/afro-survivor/DEPLOY.md` (the vault repo is private, so GitHub Pages serves from a separate public repo — same pattern as tcg-pack-clicker / sigil-tactics).

#LLM-generated
