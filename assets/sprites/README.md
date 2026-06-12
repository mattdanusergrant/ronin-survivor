# Ronin Survivor — sprite drop folder

Finished pixel art goes **here**. Drop a correctly-named PNG and it appears in
the game on the next load — no code change needed. Until a file exists, that
entity keeps drawing its procedural placeholder, so partial delivery never
breaks the build.

This is the *shipping* art. The read-only reference renders the artist riffs
on live in `../samples/` (one screenshot of the current in-game art per
entity, plus `prompts.md` for the house-style image prompts).

## Drop convention

| Key (in game) | Filename | Native size | Entity | Status |
|---|---|---|---|---|
| — | `logo.png` | any (≤420px wide) | Title screen logo — replaces text wordmark | **wired** |
| `ronin` | `ronin.png` | 32×32 | Player — wandering swordsman | **wired** |
| `dojo` | `dojo.png` | 64×64 | The Dojo — central hub | placeholder |
| `shop` | `shop.png` | 64×64 | Rescued shop (smithy / vigor / spirit) | placeholder |
| `camp` | `camp.png` | 64×64 | Bandit camp (uncleared) | placeholder |
| `campfire` | `campfire.png` | 32×32 | Checkpoint campfire | placeholder |
| `footpad` | `footpad.png` | 24×24 | Tier-0 enemy (basic bandit) | placeholder |
| `roninEnemy` | `ronin-enemy.png` | 28×28 | Tier-1 enemy (fallen ronin) | placeholder |
| `brute` | `brute.png` | 36×36 | Tier-3 enemy (heavy) | placeholder |
| `boss` | `boss.png` | 48×48 | Camp boss | **wired** |
| `kiOrb` | `ki-orb.png` | 24×24 | Ki pickup orb | placeholder |

## Rules for the artist

- **Exact filename, lowercase, `.png`.** The game looks these up by name.
- **Transparent background** (PNG alpha). The engine adds shadows/glow itself —
  don't bake them in.
- **Native size is a guide, not a hard cap.** Deliver at the listed size or a
  clean integer multiple (2×, 3×). The game scales with nearest-neighbour, so
  crisp pixels stay crisp; avoid anti-aliased edges.
- **Top-down 3/4 view, single forward-facing pose** for now. Directional /
  walk-cycle frames are a later pass — drop the single pose first.
- Match the house style in `../samples/README.md` (limited palette, ink-brush
  silhouette, Afro-Samurai mood).

## How the pipeline works (for the dev)

`index.html` defines `SPRITE_MANIFEST` → preloads each file into an offscreen
canvas exposed as `SPR.<key>`. A loaded sprite sets `SPR.<key>._ready = true`;
a missing file 404s silently and stays `false`.

**Wiring a delivered sprite into its draw site** is a one-line guard, e.g.:

```js
if (SPR.campfire._ready) ctx.drawImage(SPR.campfire, x - w/2, y - h/2, w, h);
else { /* existing procedural campfire */ }
```

The player (`drawPlayer`, reading `RONIN_SPRITE._ready`) is the worked example.
Wire the rest as art lands so each guess at scale/anchor is checked against the
real sprite instead of made blind.

#LLM-generated
