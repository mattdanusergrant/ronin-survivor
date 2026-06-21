#!/usr/bin/env node
/* =====================================================================
   Ronin Survivor — headless smoke test.

   No dependencies, no framework. Stubs just enough of the DOM + Canvas to
   load the game's inline <script> in Node, then drives it through the key
   gameplay paths via the `?expose=1` dev hatch (window.__art) and asserts
   nothing throws / no NaN leaks / state stays sane.

   Run:  node test/smoke.js   (exit code 0 = pass, 1 = fail)

   This is a *smoke* test (does the machine catch fire?), not a balance or
   pixel test — it exercises code paths and invariants, not feel. The render
   layer runs against a no-op canvas, so it verifies the draw code doesn't
   throw, not what it draws.
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ---------------------------------------------------------------------
//  Tiny assertion framework
// ---------------------------------------------------------------------
let passed = 0, failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  \x1b[32m✓\x1b[0m ' + name);
  } catch (err) {
    failed++;
    failures.push({ name, err });
    console.log('  \x1b[31m✗\x1b[0m ' + name + '\n      ' + (err && err.message || err));
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}
function finite(v) { return typeof v === 'number' && Number.isFinite(v); }
// Walk an entity and confirm its core numeric fields haven't gone NaN/Infinity.
function assertFiniteXY(o, label) {
  assert(finite(o.x) && finite(o.y), `${label}: x/y not finite (${o.x},${o.y})`);
  if ('hp' in o) assert(finite(o.hp), `${label}: hp not finite (${o.hp})`);
}

// ---------------------------------------------------------------------
//  DOM / Canvas / browser stubs (only what index.html touches at load + run)
// ---------------------------------------------------------------------
const GRADIENT = { addColorStop() {} };

function makeCtx() {
  const store = {};
  const base = {
    setTransform() {}, transform() {}, resetTransform() {},
    save() {}, restore() {}, translate() {}, scale() {}, rotate() {},
    beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, arc() {}, arcTo() {},
    ellipse() {}, rect() {}, quadraticCurveTo() {}, bezierCurveTo() {},
    fill() {}, stroke() {}, fillRect() {}, strokeRect() {}, clearRect() {}, clip() {},
    fillText() {}, strokeText() {}, drawImage() {},
    setLineDash() {}, getLineDash() { return []; },
    createLinearGradient() { return GRADIENT; },
    createRadialGradient() { return GRADIENT; },
    createPattern() { return null; },
    measureText() { return { width: 0 }; },
    getImageData() { return { data: [] }; },
    putImageData() {},
  };
  // Properties (fillStyle, font, globalAlpha, …) are freely set/read.
  return new Proxy(base, {
    get(t, p) { return p in t ? t[p] : store[p]; },
    set(t, p, v) { store[p] = v; return true; },
  });
}

function makeEl(tag) {
  const store = {
    tagName: (tag || 'div').toUpperCase(),
    width: 300, height: 150,
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    appendChild(c) { return c; },
    removeChild(c) { return c; },
    insertBefore(c) { return c; },
    addEventListener() {}, removeEventListener() {},
    setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    focus() {}, blur() {}, click() {},
    getContext() { return makeCtx(); },
    getBoundingClientRect() { return { left: 0, top: 0, width: 300, height: 150 }; },
    querySelector() { return makeEl('div'); },
    querySelectorAll() { return []; },
    textContent: '', innerHTML: '', className: '', value: '',
    onclick: null, disabled: false, _ready: false,
  };
  return new Proxy(store, {
    get(t, p) { return p in t ? t[p] : undefined; },
    set(t, p, v) { t[p] = v; return true; },
  });
}

// One element instance per id, so repeated getElementById('hud') is stable.
const elements = Object.create(null);
const documentStub = {
  getElementById(id) {
    if (!elements[id]) { const el = makeEl('div'); el.id = id; elements[id] = el; }
    return elements[id];
  },
  createElement(tag) { return makeEl(tag); },
  addEventListener() {}, removeEventListener() {},
  querySelector() { return makeEl('div'); },
  querySelectorAll() { return []; },
  body: makeEl('body'),
};

class ImageStub {
  constructor() { this.onload = null; this.onerror = null; this._src = ''; }
  // Setting src never "loads" — leaves the sprite canvas _ready=false, so the
  // game falls back to its always-present procedural art (the path we test).
  set src(v) { this._src = v; }
  get src() { return this._src; }
}

// requestAnimationFrame is a no-op so the game's auto-start `rAF(loop)` does
// NOT begin animating; the test drives frames itself via __art.update/draw.
function makeSandbox() {
  const sandbox = {
    console,
    document: documentStub,
    Image: ImageStub,
    localStorage: (() => {
      const m = new Map();
      return {
        getItem: k => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => m.set(k, String(v)),
        removeItem: k => m.delete(k),
        clear: () => m.clear(),
      };
    })(),
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
    performance: { now: () => Date.now() },
    location: { search: '?expose=1', href: 'http://localhost/?expose=1' },
    navigator: { userAgent: 'node', maxTouchPoints: 0 },
    confirm: () => true,
    alert: () => {},
    devicePixelRatio: 1,
    innerWidth: 800,
    innerHeight: 600,
    addEventListener() {}, removeEventListener() {},
    setTimeout: () => 0, clearTimeout() {},
    setInterval: () => 0, clearInterval() {},
    Math, Date, JSON, isNaN, parseInt, parseFloat,
    URLSearchParams,
  };
  sandbox.window = sandbox;        // `window.__art`, `window.innerWidth`, …
  sandbox.globalThis = sandbox;
  return sandbox;
}

// ---------------------------------------------------------------------
//  Load the game's inline <script> into a VM sandbox
// ---------------------------------------------------------------------
function loadGame() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('could not find <script> block in index.html');
  const src = m[1];
  const sandbox = makeSandbox();
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'index.html#inline' });
  if (!sandbox.window.__art) {
    throw new Error('window.__art was not populated — did the expose hook run?');
  }
  return sandbox.window.__art;
}

// Build a complete chase-enemy of a given type (mirrors summonAdd's shape so
// the AI/weapon code finds every field it expects).
function spawnEnemy(art, typeKey, x, y) {
  const t = art.ENEMY_TYPES[typeKey];
  const e = {
    x, y, r: t.r, hp: t.hp, maxhp: t.hp, speed: t.speed,
    dmg: t.dmg, xp: t.xp, color: t.color, hit: 0, boss: false, sep: 0,
    state: 'chase', sight: 9999, callR: 0,
    wDir: 0, wTimer: 0, wSpeed: 0, alertT: 0, chargeT: 0, chargeCheckT: 0,
  };
  art.enemies.push(e);
  return e;
}

function step(art, frames, dt) {
  dt = dt || 1 / 60;
  for (let i = 0; i < frames; i++) {
    if (art.game && art.game.state === art.STATE.PLAY) art.update(dt);
    art.draw();
  }
}

// ---------------------------------------------------------------------
//  Tests
// ---------------------------------------------------------------------
console.log('\nRonin Survivor — smoke test\n');

let art;

test('boot: inline script loads and exposes __art', () => {
  art = loadGame();
  assert(art && typeof art.newGame === 'function', '__art.newGame missing');
  assert(typeof art.update === 'function' && typeof art.draw === 'function',
    'update/draw not exposed (needed to drive frames)');
  assert(art.STATE && typeof art.STATE.PLAY === 'number', 'STATE not exposed');
});

test('newGame: starts a run with player, world, nests and 4 Dojo archers', () => {
  art.newGame();
  const g = art.game, p = art.player;
  assert(g && g.state === art.STATE.PLAY, 'game not in PLAY state');
  assert(p && p.hp > 0 && finite(p.hp), 'player hp invalid');
  assert(Array.isArray(g.buildings) && g.buildings.length > 0, 'no buildings generated');
  assert(g.buildings[0].type === 'dojo', 'first building should be the Dojo');
  assert(Array.isArray(art.nests) && art.nests.length > 0, 'no summoner nests generated');
  assert(art.nests.every(n => n.state === 'dormant'), 'nests should start dormant');
  assert(Array.isArray(g.archers) && g.archers.length === 4, 'expected 4 Dojo archers');
});

test('idle frames: 2s with no enemies runs without throwing or drifting to NaN', () => {
  art.newGame();
  const t0 = art.game.t;
  step(art, 120);                       // ~2 seconds
  assert(art.game.t > t0, 'game clock did not advance');
  assertFiniteXY(art.player, 'player');
  assert(art.player.hp === art.player.maxhp, 'player took damage with no enemies around');
});

test('level-up draft: buildOptions returns picks and applyOption grants them', () => {
  art.newGame();
  const opts = art.buildOptions();
  assert(Array.isArray(opts) && opts.length > 0, 'buildOptions returned nothing');
  // find a weapon-grant option (new-weapon) and apply it
  const grant = opts.find(o => o.kind === 'new-weapon') || { kind: 'new-weapon', id: 'shuriken' };
  const before = art.player.weapons[grant.id] || 0;
  art.applyOption(grant);
  assert((art.player.weapons[grant.id] || 0) === before + 1, 'new-weapon did not raise level');
  assert(art.game.state === art.STATE.PLAY, 'applyOption should return to PLAY');
});

test('all weapons fire and deal damage to a surrounded swarm (no NaN)', () => {
  art.newGame();
  const p = art.player;
  // grant every weapon at level 1 via the legit path (handles orbit/rebuildOrbit)
  for (const id in art.WEAPONS) art.applyOption({ kind: 'new-weapon', id });
  // level a couple up to exercise the weapon-level branch too
  art.applyOption({ kind: 'weapon', id: Object.keys(art.WEAPONS)[0] });

  // ring of enemies around the player
  const made = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    made.push(spawnEnemy(art, i % 2 ? 'footpad' : 'ronin',
      p.x + Math.cos(a) * 60, p.y + Math.sin(a) * 60));
  }
  const startHp = made.reduce((s, e) => s + e.hp, 0);
  step(art, 240);                       // ~4 seconds of combat + rendering

  // something must have been emitted and damage must have landed
  const liveHp = art.enemies.filter(e => !e.dead).reduce((s, e) => s + e.hp, 0);
  assert(liveHp < startHp || art.game.kills > 0,
    'no damage dealt to the swarm in 4s with every weapon equipped');
  // no entity should have leaked a NaN coordinate
  for (const e of art.enemies) assertFiniteXY(e, 'enemy');
  for (const s of art.shots) assert(finite(s.x) && finite(s.y), 'shot coord not finite');
  assertFiniteXY(art.player, 'player');
});

test('manual ki/level economy: gainXP accumulates, no auto-level', () => {
  art.newGame();
  const lvl0 = art.game.level;
  const xp0 = art.game.xp;
  art.gainXP(500);
  assert(art.game.xp > xp0, 'gainXP did not add ki');
  step(art, 60);
  assert(art.game.level === lvl0, 'level should not auto-advance (manual economy)');
});

test('direct damage path: killing an enemy increments kills and drops an orb', () => {
  art.newGame();
  const kills0 = art.game.kills;
  const orbs0 = art.orbs.length;
  const e = spawnEnemy(art, 'footpad', art.player.x + 50, art.player.y);
  art.update(1 / 60);                    // assigns e._id etc.
  art.damage(e, e.hp + 999);            // overkill
  assert(art.game.kills === kills0 + 1, 'kill counter did not advance');
  assert(art.orbs.length > orbs0, 'no ki orb dropped on death');
});

test('building boon drafts: every BUILDING_BOONS entry applies cleanly (no NaN)', () => {
  art.newGame();
  for (const group in art.BUILDING_BOONS) {
    for (const boon of art.BUILDING_BOONS[group]) {
      assert(typeof boon.apply === 'function', `${group}/${boon.nm}: missing apply()`);
      // apply to a fresh run's player and confirm core stats stay finite
      art.newGame();
      const p = art.player;
      boon.apply(p);
      assert(finite(p.hp) && finite(p.maxhp), `${group}/${boon.nm}: hp/maxhp NaN`);
      assert(finite(p.power) && p.power > 0, `${group}/${boon.nm}: power invalid`);
      assert(finite(p.speed) && p.speed > 0, `${group}/${boon.nm}: speed invalid`);
    }
  }
});

test('Dojo: startDojo enters peaceful hub with dummies + 4 archers, frames run', () => {
  art.startDojo();
  const g = art.game;
  assert(g && g.dojoMode === true, 'not in dojo mode');
  assert(Array.isArray(g.archers) && g.archers.length === 4, 'expected 4 dojo archers');
  const dummies = art.enemies.filter(e => e.dummy);
  assert(dummies.length > 0, 'no training dummies in the Dojo');
  step(art, 90);                        // dojo update + render path
  assertFiniteXY(art.player, 'player(dojo)');
});

test('diving bomb: resolveDive deals AoE damage to nearby foes (right-click)', () => {
  art.newGame();
  const p = art.player;
  const near = spawnEnemy(art, 'brute', p.x + 40, p.y);   // inside DIVE_AOE
  const far = spawnEnemy(art, 'brute', p.x + 4000, p.y);  // well outside
  const nearHp = near.hp, farHp = far.hp;
  art.resolveDive();
  assert(near.hp < nearHp, 'dive did not damage an enemy in the blast');
  assert(far.hp === farHp, 'dive damaged an enemy outside its radius');
});

test('deflect burst: a parried bolt stops hurting you and flips to your side (space)', () => {
  art.newGame();
  const p = art.player; p.hp = p.maxhp; p.inv = 0;
  spawnEnemy(art, 'footpad', p.x + 300, p.y);             // a target to deflect toward
  art.shots.push({ kind: 'foeBolt', foe: true, x: p.x + 6, y: p.y,
    vx: -50, vy: 0, dmg: 999, r: 7, life: 3, rot: Math.PI });
  art.startDeflect();
  art.update(1 / 60);
  const liveFoeNear = art.shots.some(s => s.foe &&
    Math.hypot(s.x - p.x, s.y - p.y) < 130);
  assert(p.hp === p.maxhp, 'deflect window let the bolt through');
  assert(!liveFoeNear, 'bolt was not deflected (still a live enemy bolt on you)');
});

test('camps & patrols: generated, finite, cleared persists, rest re-arms', () => {
  art.newGame();
  const mobs = art.mobs;
  assert(Array.isArray(mobs) && mobs.length > 0, 'no camps/patrols generated');
  assert(mobs.every(m => m.state === 'idle'), 'camps should start idle');
  assert(mobs.some(m => m.kind === 'camp') && mobs.some(m => m.kind === 'patrol'),
    'expected both camps and patrols');
  const c = mobs.find(m => m.kind === 'camp');
  art.spawnMobGroup(c);
  assert(c.state === 'active', 'spawnMobGroup did not activate the camp');
  const members = art.enemies.filter(e => e.mobId === c._id);
  assert(members.length === c.total, 'wrong number of camp members spawned');
  for (const e of members) art.damage(e, e.hp + 999);    // wipe the camp
  assert(c.killed >= c.total, 'kills were not banked on the camp');
  // a cleared camp must NOT respawn on re-approach (only a rest does that)
  art.despawnMob(c);
  art.spawnMobGroup(c);
  assert(art.enemies.filter(e => e.mobId === c._id && !e.dead).length === 0,
    'cleared camp respawned without a rest');
  art.resetNests();
  assert(c.state === 'idle' && c.killed === 0, 'rest/death did not re-arm the camp');
});

// Flood walkable cells (0 = floor) from a start cell; returns the seen mask.
function floodGrid(grid) {
  const { cols, rows, cells } = grid;
  return (sc, sr) => {
    const seen = new Uint8Array(cols * rows);
    const stack = [sr * cols + sc];
    seen[stack[0]] = 1;
    while (stack.length) {
      const i = stack.pop(), c = i % cols, r = (i / cols) | 0;
      const nbrs = [[c+1,r],[c-1,r],[c,r+1],[c,r-1]];
      for (const [nc, nr] of nbrs) {
        if (nc<0||nr<0||nc>=cols||nr>=rows) continue;
        const j = nr*cols+nc;
        if (seen[j] || cells[j] !== 0) continue;   // 0 = floor
        seen[j] = 1; stack.push(j);
      }
    }
    return seen;
  };
}
function cellOf(art, b) { const t = art.TILE; return { c: Math.floor(b.x/t), r: Math.floor(b.y/t) }; }
function reaches(seen, grid, b, art) {
  const { c, r } = cellOf(art, b);
  for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) {
    const nc=c+dc, nr=r+dr;
    if (nc>=0&&nr>=0&&nc<grid.cols&&nr<grid.rows && seen[nr*grid.cols+nc]) return true;
  }
  return false;
}

test('grid world: terrain grid loads and collision blocks solid tiles', () => {
  art.newGame();
  const g = art.game.grid;
  assert(g && g.cells.length === g.cols * g.rows, 'grid not loaded / wrong size');
  assert(g.cells.some(v => v === art.T_FLOOR) && g.cells.some(v => v === art.T_FOREST),
    'expected both floor and forest tiles');
  // a forest cell center should not be walkable; the spawn cell should be
  const fi = g.cells.indexOf(art.T_FOREST);
  const fc = fi % g.cols, fr = (fi / g.cols) | 0, t = art.TILE;
  assert(!art.isWalkable((fc+0.5)*t, (fr+0.5)*t, 14), 'forest tile reported walkable');
  assert(art.isWalkable(art.player.x, art.player.y, 14), 'player spawn is inside a wall');
});

test('gating: deeper zones are sealed until their gate-owner boss falls', () => {
  art.newGame();
  const g = art.game.grid;
  const flood = floodGrid(g);
  const spawnCell = { c: Math.floor(art.player.x/art.TILE), r: Math.floor(art.player.y/art.TILE) };
  const bldgs = art.game.buildings.filter(b => b.type !== 'dojo');
  // sort by depth: tutorial (depth 1) reachable from spawn; depth>=2 sealed
  const tut  = bldgs.find(b => b.depth === 1);
  const deep = bldgs.find(b => b.depth === 2);
  assert(tut && deep, 'expected a depth-1 and depth-2 building');
  let seen = flood(spawnCell.c, spawnCell.r);
  assert(reaches(seen, g, tut, art), 'tutorial zone unreachable from spawn');
  assert(!reaches(seen, g, deep, art), 'depth-2 zone reachable before its gate opens');
  // clear the tutorial boss → its gates open → depth-2 becomes reachable
  art.openGates(tut);
  seen = flood(spawnCell.c, spawnCell.r);
  assert(reaches(seen, g, deep, art), 'gate did not open the way to the next zone');
});

test('custom map loader: a hand-authored v2 spec loads into the world', () => {
  art.newGame();   // need game.grid live for loadGridMap helpers
  const cols = 8, rows = 8;
  const terrain = new Array(cols*rows).fill(art.T_FOREST);
  for (let r=1;r<=6;r++) for (let c=1;c<=6;c++) terrain[r*cols+c] = art.T_FLOOR; // open room
  const spec = { version:2, name:'t', cols, rows, tile:64, terrain, entities:[
    { kind:'dojo', col:2, row:2 },
    { kind:'spawn', col:2, row:2 },
    { kind:'building', type:'bandits', col:5, row:5, id:1, depth:1 },
    { kind:'gate', col:4, row:4, owner:1 },
    { kind:'nest', col:3, row:3, depth:1 },
    { kind:'camp', col:4, row:5, depth:1 },
    { kind:'campfire', col:2, row:3 },
  ]};
  const w = art.loadGridMap(spec);
  assert(w.grid.cols === 8 && w.grid.cells.length === 64, 'grid dims wrong');
  assert(w.grid.cells[4*8+4] === art.T_GATE, 'gate not stamped into terrain');
  assert(w.buildings.length === 2, 'expected dojo + 1 building');   // dojo counts as a building
  const camp = w.buildings.find(b => b.type === 'bandits');
  assert(camp && camp.gateCells.length === 1, 'gate not linked to its owner building');
  assert(w.nests.length === 1 && w.mobs.length === 1 && w.campfires.length === 1, 'spawn entities miscounted');
  assert(w.spawn.x === 2.5*64 && w.spawn.y === 2.5*64, 'player spawn not at the authored cell center');
});

test('nest reset: resetNests puts every nest back to dormant and clears the horde', () => {
  art.newGame();
  // fake-activate a nest with a live summoned add
  const n = art.nests[0];
  n.state = 'active';
  art.enemies.push({ x: n.x, y: n.y, r: 10, hp: 10, maxhp: 10, speed: 0, dmg: 1,
    summonedNest: n._id, state: 'chase', sight: 0, callR: 0, hit: 0, boss: false, sep: 0,
    wDir: 0, wTimer: 0, wSpeed: 0, alertT: 0, chargeT: 0, chargeCheckT: 0 });
  art.resetNests();
  assert(art.nests.every(x => x.state === 'dormant'), 'nests not reset to dormant');
  assert(!art.enemies.some(e => e.summonedNest === n._id && !e.dead),
    'summoned adds not cleared on reset');
});

// ---------------------------------------------------------------------
//  Summary
// ---------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
