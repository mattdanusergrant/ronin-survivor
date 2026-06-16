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

## 2. Redesign enemy flow

**Why:** The world layers two competing pressure systems — time-scaled arena
spawns *and* a base-defense "marcher lane" that streams enemies down carved
roads at the Dojo. Late runs read as endless footpads trickling along paths,
which dilutes pillar #2 ("the swarm is the clock"). The return-road shortcuts
read as convenience, not a meaningful choice.

**Candidate directions:**
- Collapse to a single, legible pressure source (clean time-scaled swarm), and
  let cleared zones change *where/what* spawns rather than adding parallel lanes.
- OR commit to the base-defense identity and make the lanes a real, readable
  threat (visible wave timers, a Dojo the player actually defends) — but only if
  that's the game we want.
- Re-examine marcher routes / return-road streaming
  (`spawnMarcherFromCamp`, `spawnReturnMarcher`, `campStreamInterval`,
  `returnStreamInterval`, `campMayStream`) — ~116 lines that may shrink a lot.

**Note:** The new Dojo guardian archer assumes *some* enemy flow toward the
Dojo to be worth guarding; settle this redesign before tuning the archer.

#LLM-generated
