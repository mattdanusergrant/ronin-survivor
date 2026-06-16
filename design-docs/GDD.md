# Ronin Survivor — GDD v0.1

**Slug:** `afro-survivor` · **Working public title:** *Ronin Survivor* · **Status:** playable web prototype

A *Vampire Survivors*–style horde-survival auto-battler, themed as an homage to **Afro Samurai** — a lone afro'd swordsman with the No.1-rival headband, walking a blood-red road, cut down by endless waves of foes who want the headband off his head. Theme is *inspired by*, deliberately **legally distinct** (same posture as Sigil Tactics): no licensed names, art, or music — original assets and an original title.

> Genre reference: *Vampire Survivors* (auto-attacking, move-only control, swarms, level-up boon drafts, escalating time pressure). Aesthetic reference: *Afro Samurai* (stark ink-black + bone-white + blood-red, lone-swordsman fantasy, drifting petals, a red sun).

---

## Pillars

1. **Active swordsman, automatic swarm-clear.** You move, **aim + fire** a mouse-directed ki bolt, and **dodge-roll** through danger; your drafted weapons auto-fire on top. Decision-making lives in *positioning*, *aim/dodge timing*, and the *boon draft*. (Earlier builds were move-only; the combat layer was added deliberately, de-emphasising touch/mobile.)
2. **The swarm is the clock.** Difficulty is time, not stages. Enemies get more numerous and tougher every second; warlords (bosses) arrive on a timer.
3. **Power fantasy by minute 5.** Start fragile with one blade; end the run a whirling storm of steel and spirit-fire. The curve from "barely surviving" to "screen-clearing" is the product.
4. **Style is a feature.** Drawn-not-licensed art; high-contrast Afro-Samurai palette; satisfying hit-feedback (flash, knockback, sparks, screen-shake, damage numbers).

---

## Core loop

```
move to dodge / herd enemies  →  weapons auto-hit  →  foes drop ki
   →  collect ki, fill the bar  →  LEVEL UP: draft 1 of 3 boons
   →  stronger build  →  bigger swarm  →  repeat until you fall (or the timer ends)
```

A run takes place in a gated world carved out of solid forest: the Dojo sits at the center of the map, a single straight tutorial road leads to the first bandit camp, and the chain of zones wraps outward around the Dojo from there. The default layout is a procedural spiral; custom layouts — including branching ones — can be drawn in **`mapbuilder.html`** (place/chain/drag buildings, validate gate seals against the real generator, export/import JSON) and played via `index.html?map=custom`. Every zone boss barricades the road onward until it falls. Mid and outer zones (3, 5, 7) also hide a gated return road straight home — clearing them opens a shortcut to the Dojo that doubles as a permanent enemy lane, streaming tougher marchers (ronin → ninja → brute by depth) at the Dojo for the rest of the run. Turrets are upgradeable with Ryo, so the Dojo's defenses can keep pace. Campfires (checkpoints) only appear where bandit camps are razed. The camera follows the player. No menus mid-run except the level-up draft (which pauses time).

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
- **Enemies:** footpad → ronin → ninja → brute, weighted in by elapsed time; global HP scales with time. **Warlord boss** every 60s with its own health bar, ki burst on death, and an incoming-banner.
- **Telegraphed attacks (dodge counterplay):** every type gets a signature tell that rewards the dodge-roll. *Footpad* lobs a single slow ki bolt; *ninja* throws a slow 3-bolt spread; *ronin* winds up a forward cleave (locked red ground circle ahead); *brute* slams a big circle locked onto your current spot. Telegraphs are red ground markers whose inner fill converges to mark the impact instant; projectiles are slow enough to sidestep. **Bosses cycle four abilities** — ground slam, radial bolt ring, lunging cleave, and an aimed 5-bolt fan — rooting briefly mid-windup so the tell reads. Leaving the circle (or rolling through with i-frames) avoids the hit entirely.
- **Ki / XP:** orbs drop on kill, magnet-pull within pickup range, quadratic level curve.
- **Juice:** hit-flash, knockback, damage numbers, death sparks, screen-shake, i-frames + hurt-flash, drifting petals, red-sun vignette, grid ground.
- **Flow:** title → play → pause (resume/abandon) → game-over with run stats (time survived, felled, level) + restart.

### Now in the prototype beyond the VS core
- **Meta-progression:** Ryo currency earned per run, spent on permanent upgrades + Dojo turret levels, persisted in `localStorage` (`ronin-meta-v1`); a walkable Dojo hub with training dummies and stations; mini-games (Samurai Soccer, Samurai Volley); a gated spiral world with boss seals, campfire checkpoints, and return-road enemy lanes; a sprite-art pipeline and a custom-map editor (`mapbuilder.html`).

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
