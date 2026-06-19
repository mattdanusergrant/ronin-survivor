# Ronin Survivor — GDD v0.1

**Slug:** `afro-survivor` · **Working public title:** *Ronin Survivor* · **Status:** playable web prototype

A *Vampire Survivors*–style horde-survival auto-battler, themed as an homage to **Afro Samurai** — a lone afro'd swordsman with the No.1-rival headband, walking a blood-red road, cut down by endless waves of foes who want the headband off his head. Theme is *inspired by*, deliberately **legally distinct** (same posture as Sigil Tactics): no licensed names, art, or music — original assets and an original title.

> Genre reference: *Vampire Survivors* (auto-attacking, move-only control, swarms, level-up boon drafts, escalating time pressure). Aesthetic reference: *Afro Samurai* (stark ink-black + bone-white + blood-red, lone-swordsman fantasy, drifting petals, a red sun).

---

## Pillars

1. **Active swordsman, automatic swarm-clear.** You move, **aim + fire** a mouse-directed ki bolt, and **dodge-roll** through danger; your drafted weapons auto-fire on top. Decision-making lives in *positioning*, *aim/dodge timing*, and the *boon draft*. (Earlier builds were move-only; the combat layer was added deliberately, de-emphasising touch/mobile.)
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

A run takes place in a gated world carved out of solid cherry-blossom forest (large water bodies are placed first after the paths, then blossom trees fill the rest without overlapping the water; faint pink petals drift through): the Dojo sits at the center of the map, a single straight tutorial road leads to the first bandit camp, and the chain of zones wraps outward around the Dojo from there. The default layout is a procedural spiral; custom layouts — including branching ones — can be drawn in **`mapbuilder.html`** (place/chain/drag buildings, validate gate seals against the real generator, export/import JSON) and played via `index.html?map=custom`. Every zone boss barricades the road onward until it falls. There are **no ambient spawns**: the roads are instead lined with **dormant summoner nests** (spaced along every corridor, deeper = tougher), each marked by a glowing sigil totem you can spot ahead. Walk within range and a hooded summoner wakes and conjures a spectral horde until you fight through and kill it — then its horde dissolves and the spot is safe. Flee far enough and it leashes back to sleep; **resting at a campfire (or dying) resets every nest**, so cleared ground can be re-run. A single friendly **guardian archer** stands watch at the Dojo. Campfires (checkpoints) appear where bandit camps are razed. The camera follows the player. No menus mid-run except the level-up draft and special-building boon drafts (which pause time).

---

## Prototype scope (what is built — `index.html`)

Single self-contained file, vanilla JS + Canvas, no build step, mobile-portrait first. Built to this DoD — **all verified headlessly** (node syntax check + DOM-stubbed sim: spawn/kite/level-up/all-four-weapons/boss/render all pass):

- **Control (desktop-first):** WASD/arrows to move; **mouse-aim + hold left-click** for an aimed ki bolt; **spacebar** to dodge-roll (i-frames + short cooldown) or to interact when standing on something usable (campfire/turret/Dojo/shop). Drafted weapons still auto-fire. Touch drag-to-move is kept as a deprioritised fallback.
- **4 weapons**, each 6 levels:
  | Weapon | Behaviour |
  |---|---|
  | **Katana Sweep** (starter) | Periodic radial cut — hits every foe within reach *around* you. Levels: +dmg, +range, faster, wider visual sweep. |
  | **Throwing Stars** | Auto-targets the nearest foes; piercing shuriken. Levels: +count, +dmg. |
  | **Ki Wave** | Forward piercing crescent in your facing direction; hits all in its path. Levels: wider, +dmg. |
  | **Spirit Blades** | Blades orbit you, damaging on contact (per-foe hit cooldown). Levels: +count, +dmg. |
- **7 passives** (stackable, capped): Whetstone (+dmg), Iron Will (+max HP & heal), Swift Geta (+move), Quick Hands (−cooldowns), Soul Pull (+pickup range), Calm Breath (+regen), Ambition (+ki gain).
- **Level-up draft:** time pauses, 3 random eligible options (new weapon / weapon level / passive), tap to pick. Fallback "Second Wind" full-heal if everything is maxed.
- **Enemies:** footpad → ronin → ninja → brute, conjured as a horde by **summoner nests** (type pool & strength scale with nest depth). **Summoners** are rooted hooded conjurers with their own health bar; killing one dissolves its whole horde. Each **zone boss building** is a separate capstone fight that drops a boon and opens the gate onward.
- **Telegraphed attacks (dodge counterplay):** every type gets a signature tell that rewards the dodge-roll. *Footpad* lobs a single slow ki bolt; *ninja* throws a slow 3-bolt spread; *ronin* winds up a forward cleave (locked red ground circle ahead); *brute* slams a big circle locked onto your current spot. Telegraphs are red ground markers whose inner fill converges to mark the impact instant; projectiles are slow enough to sidestep. **Bosses cycle four abilities** — ground slam, radial bolt ring, lunging cleave, and an aimed 5-bolt fan — rooting briefly mid-windup so the tell reads. Leaving the circle (or rolling through with i-frames) avoids the hit entirely.
- **Ki / XP:** orbs drop on kill, magnet-pull within pickup range, quadratic level curve.
- **Juice:** hit-flash, knockback, damage numbers, death sparks, screen-shake, i-frames + hurt-flash, drifting petals, red-sun vignette, grid ground.
- **Flow:** title → play → pause (resume/abandon) → game-over with run stats (time survived, felled, level) + restart.

### Now in the prototype beyond the VS core
- **Meta-progression:** Ryo currency earned per run, spent on permanent upgrades at the Dojo's **Ryo Trader** (the only permanent sink), persisted in `localStorage` (`ronin-meta-v1`); a walkable Dojo hub (Ryo Trader + Spirit Forge + The Road) with training dummies and a lone guardian archer; a gated spiral world with boss seals, campfire checkpoints (which also reset the world's summoner nests), and dormant summoner nests along the roads; a sprite-art pipeline and a custom-map editor (`mapbuilder.html`). Mini-games (Samurai Soccer, Samurai Volleyball) are an Options-menu easter egg rather than Dojo stations.
- **Special-building boon drafts:** the zone chain is randomised each run (zone 1 is always the tutorial camp; the rest is a shuffle that guarantees all five special buildings + two more camps). Clearing a special building grants a **run-scoped boon draft** (pick 1 of 3, reusing the level-up card UI): the **Forgotten Shrine** offers defensive *Blessings* (heals to full first), **Ronin's Cache** offers offensive *Arsenal* picks (weapon level / new weapon / damage), and the three ex-shops (**Smithy/Vigor/Spirit**) offer build-defining *Altar* pacts with a tradeoff (e.g. +50% damage / −20% max HP). Bandit camps still drop a Ryo orb + plant a campfire checkpoint. Mid-run permanent Ryo shops were removed — all permanent spending now lives at the Dojo.

### Deliberately NOT in the prototype (next-up)
- Audio/music, more weapons & evolutions (VS-style weapon+passive fusions), multiple characters, stage variety, a true win condition / time cap, settings.

---

## Progression & balance (current first pass)

- **Player:** 100 HP, 148 px/s, 0.7s i-frames on contact.
- **Level curve:** `xpNext = round(5 + lvl²·1.15 + lvl·3)` — gentle early, steepening.
- **Enemy HP scale:** `×(1 + t/75)`; **spawn interval:** `max(0.18s, 1.05 − t·0.0065)`.
- **Boss HP:** 900 × time-scale, every 60s.

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
3. **Meta-progression.** A first pass exists (Ryo → permanent upgrades + turret levels, persisted between runs). Open question is now *depth*: how far to extend the upgrade tree / unlock system to carry long-term retention.
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
