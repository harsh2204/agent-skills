// The hero module: thin uniform stems that sweep in long arcs, branch
// tangentially off their outer side and end in tight volutes; almond leaves
// with a midrib on the outer side of curves (and at the tips of short
// stalks); five-point stars and dots in whatever pockets are left.

import { smoothPath, leafPath, starPath, polyLength, TAU, f2 } from '../geom.js';
import { edgeSeeds, interiorSeeds, pocketSeeds, grow, curvatureAt, thin, clearance } from './turtle.js';

export const vines = {
  name: 'vines', animates: 'draw',
  defaults: {
    density: 1, leaves: 1, stars: 1, dots: 1, stroke: 1, leafStyle: 'solid', leafLen: 10.5, midrib: true,
    seeds: null, interior: false, eyes: true, halo: false, turtle: null,
  },
  run(field, env) {
    const { rng, params } = env;
    const cellPx = field.cell;
    const area = field.freeCount();
    const nSeeds = params.seeds ?? Math.max(3, Math.round(Math.sqrt(area) / 9 * params.density));
    const turtle = {
      maxStems: Math.round(80 * params.density), branchProb: Math.min(0.9, 0.6 * params.density), branchEvery: 11, leafStalkProb: 0.45,
      clear: 1.7, radius: 12, spiralR0: 7, minLen: 8,
      ...(params.turtle || {}),
    };
    const seeds = params.interior ? interiorSeeds(field, rng, nSeeds) : edgeSeeds(field, rng, nSeeds, { jitter: 0.9 });
    const stems = grow(field, rng, seeds, turtle);
    const els = [];
    const sw = env.strokePx * params.stroke;
    const ink = env.fg, paper = env.bg;
    const stemEls = [], leafQueue = [];

    // --- leaves get room before later sprigs do: place them as soon as a batch of stems exists
    const leafLen = params.leafLen * (0.9 + 0.2 * rng());
    const placeLeaf = (q, ang, len, t, ignore) => {
      const w = len * (0.38 + rng() * 0.1);
      if (!fitsLeaf(field, q.x, q.y, ang, len, w, ignore)) return false;
      markLeaf(field, q.x, q.y, ang, len, w);
      leafQueue.push({ P: field.toPx(q), ang, len: len * cellPx, w: w * cellPx, t, curl: (rng() - 0.5) * 0.5 });
      return true;
    };
    const leafBatch = (batch) => {
      if (params.leaves <= 0) return;
      for (const s of batch) if (s.stalk) {
        const q = s.pts[s.pts.length - 1];
        for (const len of [leafLen, leafLen * 0.8, leafLen * 0.6]) if (placeLeaf(q, q.a, len, s.T0 + s.L, s.mark)) break;
      }
      const spacing = Math.max(4, Math.round(8 / params.leaves));
      for (const s of batch) {
        if (s.stalk) continue;
        let next = 3 + Math.floor(rng() * spacing), alt = rng() < 0.5 ? 1 : -1;
        for (let i = next; i < s.pts.length - 2; i++) {
          const q = s.pts[i];
          const kappa = curvatureAt(s.pts, i);
          let side = kappa > 0.04 ? -1 : kappa < -0.04 ? 1 : (alt = -alt);
          if (rng() < 0.15) side = -side;
          const ang = q.a + side * (0.95 + rng() * 0.45);
          let ok = false;
          for (const len of [leafLen * (0.85 + rng() * 0.3), leafLen * 0.65]) if (placeLeaf(q, ang, len, s.T0 + q.L, s.mark)) { ok = true; break; }
          if (ok) { i += spacing + Math.floor(rng() * 3); } else i += 1;
        }
      }
    };
    leafBatch(stems);
    // keep sprouting new sprigs in the biggest pockets until the space is used up
    for (let round = 0; round < 14 && stems.length < turtle.maxStems; round++) {
      let tNow = 0;
      for (const s of stems) tNow = Math.max(tNow, s.T0 + s.L);
      const more = pocketSeeds(field, rng, 3, 3.4).map((s) => ({ ...s, T0: tNow * (0.3 + 0.3 * rng()) }));
      if (!more.length) break;
      const n0 = stems.length;
      grow(field, rng, more, { ...turtle, maxSteps: 40 }, { stems });
      leafBatch(stems.slice(n0));
    }

    // --- stems: timing in arc-length units, scaled to [0,1] over the longest chain
    let maxT = 1;
    for (const s of stems) maxT = Math.max(maxT, s.T0 + s.L);
    const norm = (t) => t / maxT;
    for (const s of stems) {
      const px = thin(s.pts).map((q) => field.toPx(q));
      const d = smoothPath(px, 1, 0.5);
      const anim = { kind: 'draw', t0: norm(s.T0), dur: norm(s.L) };
      if (params.halo) els.push({ tag: 'path', attrs: { d, fill: 'none', stroke: paper, 'stroke-width': f2(sw * 3.2), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, len: polyLength(px) * 1.04, cx: px[0].x, cy: px[0].y, anim });
      stemEls.push({
        tag: 'path', attrs: { d, fill: 'none', stroke: ink, 'stroke-width': f2(sw), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        len: polyLength(px) * 1.04, cx: px[0].x, cy: px[0].y, anim,
      });
    }
    els.push(...stemEls);
    for (const l of leafQueue) els.push(...leafEls(l.P, l.ang, l.len, l.w, ink, paper, sw, params.leafStyle, norm(l.t), params.midrib, l.curl));

    // --- a dot in the eye of every volute
    if (params.eyes) for (const s of stems) if (s.endedInSpiral) {
      const q = s.pts[s.pts.length - 1];
      const rr = Math.max(0.6, s.spiralR);
      const ex = q.x + Math.cos(q.a + s.spiralSign * Math.PI / 2) * rr, ey = q.y + Math.sin(q.a + s.spiralSign * Math.PI / 2) * rr;
      if (field.inBounds(Math.floor(ex), Math.floor(ey)) && !field.obst[field.idx(Math.floor(ex), Math.floor(ey))]) {
        const P = field.toPx({ x: ex, y: ey });
        els.push({ tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(Math.max(0.6 * cellPx, sw * 0.9)), fill: ink }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0: norm(s.T0 + s.L), dur: 0.06 } });
      }
    }

    // --- stars and dots in the pockets that are left, biggest pockets first
    if (params.stars > 0) {
      const n = Math.round((area / 1400) * 2.2 * params.stars) + 2;
      let placed = 0;
      for (let t = 0; t < n * 50 && placed < n; t++) {
        const c = field.randomFree(rng);
        if (!c) break;
        const room = clearance(field, c.x, c.y, 2.4, 4, 0.35);
        if (!room) continue;
        const r = Math.min(3.2, room - 0.6) * (0.85 + rng() * 0.15);
        field.markDisk(c.x, c.y, r + 0.7);
        const P = field.toPx(c);
        const rot = -Math.PI / 2 + (rng() - 0.5) * 0.6;
        els.push({
          tag: 'path', attrs: { d: starPath(P.x, P.y, r * cellPx, 5, 0.45, rot), fill: ink },
          cx: P.x, cy: P.y, anim: { kind: 'pop', t0: 0.55 + rng() * 0.4, dur: 0.08 },
        });
        placed++;
      }
    }
    if (params.dots > 0) {
      const n = Math.round((area / 1200) * 4 * params.dots) + 3;
      let placed = 0;
      for (let t = 0; t < n * 40 && placed < n; t++) {
        const c = field.randomFree(rng);
        if (!c) break;
        const room = clearance(field, c.x, c.y, 1.7, 2.8, 0.3);
        if (!room) continue;
        const r = Math.min(1.3, (room - 0.7) * 0.85) * (0.8 + rng() * 0.2);
        field.markDisk(c.x, c.y, r + 0.6);
        const P = field.toPx(c);
        els.push({
          tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(Math.max(r * cellPx, sw * 0.8)), fill: ink },
          cx: P.x, cy: P.y, anim: { kind: 'pop', t0: 0.5 + rng() * 0.45, dur: 0.06 },
        });
        placed++;
      }
    }
    return els;
  },
};

/** Leaf (+ midrib) elements at base P pointing along `ang`. */
export function leafEls(P, ang, lenPx, wPx, ink, paper, sw, style, t, midrib = true, curl = 0) {
  const d = leafPath(P.x, P.y, ang, lenPx, wPx, curl);
  const out = [];
  const base = { cx: P.x, cy: P.y, anim: { kind: 'pop', t0: t, dur: 0.1 } };
  if (style === 'outline' || style === 'engraved') out.push({ tag: 'path', attrs: { d, fill: paper, stroke: ink, 'stroke-width': f2(sw * (style === 'engraved' ? 0.9 : 1)), 'stroke-linejoin': 'round' }, ...base });
  else out.push({ tag: 'path', attrs: { d, fill: ink }, ...base });
  if (midrib && lenPx > sw * 5) {
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const x0 = P.x + ca * lenPx * 0.08, y0 = P.y + sa * lenPx * 0.08, x1 = P.x + ca * lenPx * 0.82, y1 = P.y + sa * lenPx * 0.82;
    const vein = style === 'solid' ? paper : ink;
    out.push({ tag: 'path', attrs: { d: `M${f2(x0)} ${f2(y0)}L${f2(x1)} ${f2(y1)}`, stroke: vein, 'stroke-width': f2(sw * 0.7), fill: 'none', 'stroke-linecap': 'round' }, ...base });
  }
  return out;
}

/** Room check for a leaf of length len / width w (cells), ignoring occupancy id `ignore` near its base. */
export function fitsLeaf(field, x, y, a, len, w, ignore = 0) {
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let t = 0.12; t <= 1.0; t += 0.22) {
    const cx = x + ca * len * t, cy = y + sa * len * t;
    const half = 0.5 * w * Math.sin(Math.PI * Math.min(1, t)); // quadratic almond: half-width ≤ w/2
    if (!field.clear(cx, cy, Math.max(0.45, half) + 0.45, t < 0.4 ? ignore : 0)) return false;
  }
  return field.clear(x + ca * len, y + sa * len, 0.6, 0);
}
export function markLeaf(field, x, y, a, len, w) {
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let t = 0.1; t <= 1.0; t += 0.15) {
    const half = 0.5 * w * Math.sin(Math.PI * Math.min(1, t));
    field.markDisk(x + ca * len * t, y + sa * len * t, Math.max(0.5, half) + 0.35);
  }
}
