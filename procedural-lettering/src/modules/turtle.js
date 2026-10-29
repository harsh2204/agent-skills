// Seeded curvature-driven turtle growth with collision against letter, frame
// and other stems. Shared by the vine, porcelain and art-nouveau modules.
//
// Units: cells. A stem is a list of nodes {x, y, a, L} (L = arc length from
// the stem's start). `T0` is the arc-length "time" at which the stem begins
// (parent's T0 + distance along the parent to the branch node), which the
// choreography uses so children start drawing when the parent reaches them.
//
// A stem is a smooth arc of slowly varying curvature (occasionally reversing
// into an S), steered away from obstacles by look-ahead rays. It ends in a
// logarithmic-spiral volute whose curvature ramps up until the eye radius is
// reached; the volute's radius is chosen as the largest disc that fits beside
// the stem. Children leave tangentially from the OUTER side of the parent
// curve and curl the opposite way (the classical scroll/rinceau rule). Some
// children are short "leaf stalks" that end in a leaf instead of a volute.

import { TAU, clamp } from '../geom.js';

/** Seeds spaced along the inside of the frame edge, heading inward. */
export function edgeSeeds(field, rng, count, opts = {}) {
  const { cols, rows } = field;
  const mc = opts.minClear ?? 2;
  const band = opts.band ?? [Math.max(1.2, mc - 0.5), mc + 2.5];
  const cand = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const k = field.idx(i, j);
    if (field.obst[k] || field.occ[k]) continue;
    const df = field.distFrame[k];
    if (df < band[0] || df > band[1]) continue;
    if (field.dist[k] < mc) continue;
    cand.push({ x: i + 0.5, y: j + 0.5 });
  }
  if (!cand.length) return [];
  // greedy farthest-point spacing, started from a random candidate
  const picked = [cand[Math.floor(rng() * cand.length)]];
  while (picked.length < count && cand.length) {
    let best = null, bestD = -1;
    for (let t = 0; t < 400; t++) {
      const c = cand[Math.floor(rng() * cand.length)];
      let d = Infinity;
      for (const p of picked) d = Math.min(d, (p.x - c.x) ** 2 + (p.y - c.y) ** 2);
      if (d > bestD) { bestD = d; best = c; }
    }
    if (!best || bestD < 9) break;
    picked.push(best);
  }
  return picked.map((p) => {
    // heading: up the frame-distance gradient (inward), jittered
    const g = gradient(field, field.distFrame, p.x, p.y);
    let a = Math.hypot(g.x, g.y) > 1e-3 ? Math.atan2(g.y, g.x) : Math.atan2(rows / 2 - p.y, cols / 2 - p.x);
    a += (rng() - 0.5) * (opts.jitter ?? 1.0);
    return { x: p.x, y: p.y, a };
  });
}

/** Seeds spread through the free interior (for frameless / inside-letter use). */
export function interiorSeeds(field, rng, count, minClear = 2.5) {
  const out = [];
  for (let t = 0; t < count * 40 && out.length < count; t++) {
    const p = field.randomFree(rng, (x, y) => field.distAt(x, y) > minClear);
    if (!p) break;
    if (out.some((q) => (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < 36)) continue;
    out.push({ x: p.x, y: p.y, a: rng() * TAU });
  }
  return out;
}

/** Largest clear radius around (x,y) in [rMin, rMax] (0 if even rMin fails). */
export function clearance(field, x, y, rMin, rMax, step = 0.5) {
  if (!field.clear(x, y, rMin)) return 0;
  let r = rMin;
  while (r + step <= rMax && field.clear(x, y, r + step)) r += step;
  return r;
}

/** Centres of the biggest remaining free pockets (room >= minR), largest first. */
export function pocketSeeds(field, rng, count, minR = 3, tries = 400) {
  const cands = [];
  for (let t = 0; t < tries; t++) {
    const x = rng() * field.cols, y = rng() * field.rows;
    if (!field.freeAt(x, y)) continue;
    const r = clearance(field, x, y, minR, 9);
    if (r >= minR) cands.push({ x, y, r });
  }
  cands.sort((a, b) => b.r - a.r);
  const out = [];
  for (const c of cands) {
    if (out.length >= count) break;
    if (out.some((o) => (o.x - c.x) ** 2 + (o.y - c.y) ** 2 < (o.r + c.r) ** 2)) continue;
    out.push({ x: c.x, y: c.y, a: rng() * TAU, room: c.r });
  }
  return out;
}

export function gradient(field, arr, x, y) {
  const s = 1.5;
  const d = (dx, dy) => field.sample(arr, x + dx, y + dy);
  return { x: (d(s, 0) - d(-s, 0)) / (2 * s), y: (d(0, s) - d(0, -s)) / (2 * s) };
}

const DEFAULTS = {
  step: 1,             // cells per step
  maxSteps: 64,        // arc length budget before the terminal volute
  minLen: 6,           // shorter stems are discarded
  clear: 1.5,          // marking radius (half the stem spacing)
  lag: 6,              // steps before a stem's own trail becomes solid
  radius: 11,          // mean arc radius (cells) while wandering
  radiusJitter: 0.45,
  flipProb: 0.035,     // chance per step to reverse curvature (S-curve)
  maxTurn: 0.36,       // rad per step in arc mode
  avoid: 0.4,          // steer strength toward the open side
  lookahead: 5,
  tightDist: 2.6,      // start a volute when the way ahead is shorter than this
  spiralProb: 0.025,   // chance per step to curl spontaneously (after minSpiralAt)
  minSpiralAt: 16,
  spiralR0: 6.5,       // preferred starting radius (cells) of a volute
  spiralRmin: 2.0,     // smallest volute worth drawing
  spiralTighten: 0.12, // radius shrink per radian turned (log spiral)
  spiralEye: 1.3,      // radius at which the volute stops
  minSpiral: 1.5 * TAU, maxSpiral: 2.5 * TAU,
  branchEvery: 9, branchProb: 0.75, branchAngle: 0.35,
  maxDepth: 4, maxStems: 80,
  leafStalkProb: 0.3, stalkLen: [3, 6],
};

/**
 * Grow stems from seeds. Returns [{pts, L, T0, depth, parent, branches, endedInSpiral, stalk, mark}].
 */
export function grow(field, rng, seeds, params = {}, state = {}) {
  const p = { ...DEFAULTS, ...params };
  const stems = state.stems || [];
  const queue = seeds.map((s) => ({ depth: 0, T0: 0, parent: -1, ...s }));
  let guard = 0;
  while (queue.length && stems.length < p.maxStems && guard++ < 600) {
    const s = queue.shift();
    s.mark = 2 + stems.length; // occupancy id so leaves/spirals can ignore their own stem
    const stem = growOne(field, rng, s, p);
    if (!stem) continue;
    stem.id = stems.length;
    stems.push(stem);
    for (const b of stem.branches) queue.push({ ...b, parent: stem.id, ignore: stem.mark });
  }
  return stems;
}

function growOne(field, rng, s, p) {
  let x = s.x, y = s.y, a = s.a;
  const ignore = s.ignore || 0; // parent's trail is passable for the first steps of a branch
  if (!field.isFree(Math.floor(x), Math.floor(y), ignore)) return null;
  const pts = [{ x, y, a, L: 0 }];
  const pending = [];
  const branches = [];
  const stalk = !!s.stalk;
  const maxSteps = s.maxSteps ?? Math.round(p.maxSteps * (s.depth ? 0.75 : 1) * (0.8 + rng() * 0.4));
  const R = p.radius * (1 - p.radiusJitter + 2 * p.radiusJitter * rng()) * (s.depth ? 0.8 : 1) * (s.room ? clamp(s.room / 5, 0.5, 1) : 1);
  let sign = s.curl ?? (rng() < 0.5 ? -1 : 1);
  const k0 = 1 / Math.max(2.5, R);
  let mode = 'arc', r = 0, spiralSign = 0, turned = 0, maxSpiralTurn = 0, L = 0, lastFlip = 0, steer = 0;
  let lastBranch = 2, nextGap = p.branchEvery * (0.5 + rng() * 0.6);
  let step = 0;

  // choose the largest volute that fits beside the stem; prefer the side we already turn to
  const startSpiral = () => {
    for (const sgn of [sign, -sign]) {
      const nx = Math.cos(a + sgn * Math.PI / 2), ny = Math.sin(a + sgn * Math.PI / 2);
      for (let rr = p.spiralR0 * (0.8 + 0.4 * rng()); rr >= p.spiralRmin; rr -= 0.5) {
        if (field.clear(x + nx * rr, y + ny * rr, rr + 0.5, s.mark)) {
          mode = 'spiral'; spiralSign = sgn; r = rr; turned = 0;
          maxSpiralTurn = p.minSpiral + rng() * (p.maxSpiral - p.minSpiral);
          return true;
        }
      }
    }
    return false;
  };

  for (let i = 0; i < maxSteps + 600; i++) {
    let turn, stepLen = p.step;
    if (mode === 'arc') {
      if (step >= maxSteps) { if (stalk || !startSpiral()) break; }
    }
    if (mode === 'arc') {
      const look = p.lookahead;
      const dl = field.ray(x, y, a + 0.6, look), dr = field.ray(x, y, a - 0.6, look), df = field.ray(x, y, a, look);
      if (!stalk && ((df < p.tightDist && step > 2) || (step >= p.minSpiralAt && rng() < p.spiralProb))) {
        if (startSpiral()) { i--; continue; }
        if (df < 1) break;
      }
      if (step > 8 && step - lastFlip > 14 && rng() < p.flipProb) { sign = -sign; lastFlip = step; }
      const pressure = clamp(1 - df / look, 0, 1);
      const target = ((dl - dr) / look) * p.avoid * (0.5 + pressure * 1.5);
      steer += (target - steer) * 0.5;
      turn = clamp(sign * k0 + steer, -p.maxTurn, p.maxTurn);
    } else {
      // logarithmic volute: curvature 1/r, radius shrinking per radian turned; fine steps near the eye
      stepLen = Math.min(p.step, Math.max(0.3, r * 0.42));
      const dth = stepLen / r;
      turn = spiralSign * dth;
      turned += dth;
      r *= Math.exp(-p.spiralTighten * dth);
      if (turned >= maxSpiralTurn || r < p.spiralEye) break;
    }
    a += turn;
    let nx = x + Math.cos(a) * stepLen, ny = y + Math.sin(a) * stepLen;
    const ign = mode === 'spiral' ? s.mark : step < 5 ? ignore : 0;
    if (!field.clear(nx, ny, p.clear * 0.75, ign)) {
      if (mode !== 'arc') break;
      let slid = false;
      for (const da of (p.slide || [0.25, -0.25, 0.5, -0.5])) {
        const ta = a + da, tx = x + Math.cos(ta) * stepLen, ty = y + Math.sin(ta) * stepLen;
        if (field.clear(tx, ty, p.clear * 0.75, ign)) { a = ta; nx = tx; ny = ty; slid = true; break; }
      }
      if (!slid) { if (!stalk && startSpiral()) { i--; continue; } break; }
    }
    x = nx; y = ny; L += stepLen; step++;
    pts.push({ x, y, a, L });
    pending.push({ x, y });
    if (pending.length > p.lag) { const q = pending.shift(); field.markDisk(q.x, q.y, p.clear, s.mark); }
    if (mode === 'arc' && !stalk && s.depth < p.maxDepth && step > 4 && step - lastBranch >= nextGap && rng() < p.branchProb) {
      lastBranch = step; nextGap = p.branchEvery * (0.6 + rng() * 0.8);
      const outer = -sign; // outer side of the current curve
      const child = rng() < p.leafStalkProb;
      branches.push({
        x, y, a: a + outer * p.branchAngle, curl: -sign, depth: s.depth + 1, T0: s.T0 + L, branchIndex: pts.length - 1,
        stalk: child, maxSteps: child ? Math.round(p.stalkLen[0] + rng() * (p.stalkLen[1] - p.stalkLen[0])) : undefined,
      });
    }
  }
  const minLen = stalk ? 2 : p.minLen;
  if (pts.length < minLen) {
    // undo the marks of a rejected stem
    for (let k = 0; k < field.occ.length; k++) if (field.occ[k] === s.mark) field.occ[k] = 0;
    return null;
  }
  for (const q of pending) field.markDisk(q.x, q.y, p.clear, s.mark);
  return { pts, L, T0: s.T0, depth: s.depth, parent: s.parent, branches, branchIndex: s.branchIndex ?? -1, endedInSpiral: mode === 'spiral' && turned > Math.PI, spiralSign, spiralR: r, stalk, mark: s.mark };
}

/** Signed curvature estimate at node i (positive = heading increasing). */
export function curvatureAt(pts, i) {
  const a = pts[Math.max(0, i - 2)].a, b = pts[Math.min(pts.length - 1, i + 2)].a;
  let d = b - a;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  return d;
}

/** Drop nearly collinear nodes so the smoothed path stays light. */
export function thin(pts, maxGap = 2.2, minTurn = 0.18) {
  if (pts.length < 4) return pts;
  const out = [pts[0]];
  let acc = 0, last = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    let d = pts[i + 1].a - pts[i - 1].a;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    acc += Math.abs(d);
    if (acc >= minTurn || pts[i].L - last.L >= maxGap) { out.push(pts[i]); last = pts[i]; acc = 0; }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
