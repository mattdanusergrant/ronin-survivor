# Ronin Survivor — artist reference pack (vol. 1)

Each PNG here is a screenshot of the **current in-game art** for that entity,
rendered in isolation against the game's background colour. Give them to the
artist as reference; ask for their own pixel-art version in the same role.

| # | File | What it is | Notes for the artist |
|---|---|---|---|
| 1 | `01-ronin-player.png` | The player — wandering swordsman | This is the temp sprite. Replace with full 4-direction walk + slash. |
| 2 | `02-dojo.png` | The Dojo — central hub building | Roof + door must read at a glance from across the map. Friendly. |
| 3 | `03-smithy-saved.png` | A rescued shop (smithy variant) | "Cleared" state: gold halo, glowing door. Other variants: Hall of Vigor, Spirit Pool — same silhouette, different icon + accent. |
| 4 | `04-bandit-camp.png` | Uncleared enemy camp (bandit hut) | Fresh state. After clearing, gets a red X overlay — that's the "looted" state, also worth a pass. |
| 5 | `05-campfire-checkpoint.png` | Active checkpoint campfire | When set as the player's respawn point, flame goes taller + gold-tinted + ★ tag underneath. Regular campfires are dimmer/shorter. |
| 6 | `06-footpad.png` | Tier-0 enemy (basic bandit) | Smallest, weakest, most numerous. Cowardly silhouette. |
| 7 | `07-ronin-enemy.png` | Tier-1 enemy (fallen ronin) | Mid-tier. Crimson palette, dishonored swordsman vibe. |
| 8 | `08-brute.png` | Tier-3 enemy (heavy) | Big plum-purple armoured warrior, slow but devastating. |
| 9 | `09-boss.png` | Camp boss (any variant) | Bigger than a brute, gold-eyed, comes with a gold healthbar (drawn by game — artist just makes the body). |
| 10 | `10-ki-orb.png` | Ki pickup orb | Cyan diamond shard. Slightly bigger + brighter variant exists for high-tier kills. |

## House style (paste at top of any art prompt)

> Pixel art, 4-color limited palette per sprite, Afro-Samurai-inspired:
> muted earth tones with deep blacks and a single bold accent (blood red,
> ki cyan, or gold). Hand-drawn ink-brush silhouette feel — not clean
> robot-style pixels. Transparent background. Top-down 3/4 view to match
> a tactical-overhead game. No outline glow (game adds that).

## Regenerating this pack

```
# from repo root, in one terminal:
python3 -m http.server 8765

# in another:
NODE_PATH=/opt/node22/lib/node_modules node /tmp/gen_samples.cjs
```

The generator lives at `/tmp/gen_samples.cjs` and loads the live game with
`?expose=1` (a dev hatch that surfaces draw functions on `window.__art`).
Edit the `items` array there to add or tweak entities.
