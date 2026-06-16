# Ronin Survivor — Design TODO

Parked design passes, captured from the meta-systems audit (2026-06-16). These
are deliberate "later" items — not bugs. Each is a redesign, not a tweak.

---

## 1. Design pass on all special buildings

**Why:** The non-camp buildings are mechanically thin and disconnected from the
moment-to-moment combat. Right now each is a one-shot effect or a menu:

- **Shrine** (`shrine`) — boss death → full heal. One-time.
- **Cache** (`cache`) — boss death → +15% damage buff. One-time.
- **Smithy / shops** (`smithy` + `shopGroup` combat/defense/utility) — freeing
  the building makes its door open a permanent-upgrade (Ryo) store mid-run.
- Turret slots used to attach here — **now removed** (replaced by the Dojo
  guardian archer), so freed shops currently only open their store.

**Open questions to resolve in the pass:**
- Should special buildings grant *run-scoped* power (build-defining choices)
  instead of flat one-time buffs or out-of-band Ryo shopping?
- Do mid-run Ryo stores even belong in a run, or should all permanent spending
  live in the Dojo between runs? (Two shopping contexts feels redundant.)
- Can each building type read as a distinct, memorable landmark with a clear
  promise (heal / power / choice), rather than interchangeable spiral nodes?

**Touch points:** `BUILDING_TYPES`, `checkCampCleared` (rewards), `openDojoShop`
/ shop overlay, `spawnCampBoss`.

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
