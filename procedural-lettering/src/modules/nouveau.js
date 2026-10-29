// Art-nouveau whiplash: few long tapered stems of large radius whose
// curvature reverses in long S-sweeps and ends in generous curls, with
// elongated leaves at the points of greatest curvature and a bud in each eye.

import { smoothSegments, leafPath, polyLength, f2 } from '../geom.js';
import { edgeSeeds, pocketSeeds, grow, curvatureAt, thin } from './turtle.js';
import { fitsLeaf, markLeaf } from './vines.js';

export const nouveau = {
  name: 'nouveau', animates: 'draw',
  defaults: { density: 1, taper: 4, leaves: 1 },
  run(field, env) {
    const { rng, params } = env;
    const cell = field.cell;
    const area = field.freeCount();
    const nSeeds = Math.max(2, Math.round(Math.sqrt(area) / 14 * params.density));
    const seeds = edgeSeeds(field, rng, nSeeds, { jitter: 0.6, minClear: 2.8 });
    const turtle = {
      maxSteps: 170, minLen: 14, clear: 2.0, lag: 8, radius: 16, radiusJitter: 0.3, flipProb: 0.05, maxTurn: 0.28, avoid: 0.6, lookahead: 8,
      tightDist: 2.4, spiralProb: 0.005, minSpiralAt: 40, spiralR0: 8, spiralRmin: 2.5, spiralTighten: 0.1, spiralEye: 1.5, minSpiral: 1.2 * Math.PI * 2, maxSpiral: 2 * Math.PI * 2,
      branchEvery: 30, branchProb: 0.45, branchAngle: 0.25, maxDepth: 2, maxStems: Math.round(18 * params.density), leafStalkProb: 0, slide: [0.2, -0.2, 0.4, -0.4],
    };
    const stems = grow(field, rng, seeds, turtle);
    for (let round = 0; round < 4 && stems.length < turtle.maxStems; round++) {
      let tNow = 0;
      for (const s of stems) tNow = Math.max(tNow, s.T0 + s.L);
      const more = pocketSeeds(field, rng, 2, 4.5).map((s) => ({ ...s, T0: tNow * 0.4 }));
      if (!more.length) break;
      grow(field, rng, more, { ...turtle, maxSteps: 90 }, { stems });
    }
    let maxT = 1;
    for (const s of stems) maxT = Math.max(maxT, s.T0 + s.L);
    const els = [];
    const wMax = env.strokePx * 2.8, wMin = env.strokePx * 0.7;
    for (const s of stems) {
      // taper: the stem is split into `taper` runs of decreasing width
      const pts = thin(s.pts, 1.6, 0.12);
      const px = pts.map((q) => field.toPx(q));
      const segs = smoothSegments(px, 0.5);
      const n = pts.length, runs = Math.max(1, Math.min(params.taper, Math.floor(n / 6)));
      for (let r = 0; r < runs; r++) {
        const i0 = Math.floor((r * (n - 1)) / runs), i1 = Math.floor(((r + 1) * (n - 1)) / runs);
        if (i1 <= i0) continue;
        const t = r / runs;
        const w = (wMax * (1 - t) + wMin * t) * (s.depth ? 0.7 : 1);
        const d = `M${f2(px[i0].x)} ${f2(px[i0].y)}` + segs.slice(i0, i1).map((g) => g.d).join('');
        els.push({
          tag: 'path', attrs: { d, fill: 'none', stroke: env.fg, 'stroke-width': f2(w), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
          len: polyLength(px.slice(i0, i1 + 1)) * 1.04, cx: px[i0].x, cy: px[i0].y,
          anim: { kind: 'draw', t0: (s.T0 + pts[i0].L) / maxT, dur: (pts[i1].L - pts[i0].L) / maxT },
        });
      }
      // long narrow leaves on the outer side where the stem bends most
      if (params.leaves > 0) {
        let placed = 0;
        for (let i = 8; i < s.pts.length - 6 && placed < 3; i += 5) {
          const q = s.pts[i], kappa = curvatureAt(s.pts, i);
          if (Math.abs(kappa) < 0.1) continue;
          const side = kappa > 0 ? -1 : 1;
          const len = 8 + rng() * 5, w = len * 0.28;
          const ang = q.a + side * (0.8 + rng() * 0.3);
          if (fitsLeaf(field, q.x, q.y, ang, len, w, s.mark)) {
            markLeaf(field, q.x, q.y, ang, len, w);
            const P = field.toPx(q);
            els.push({ tag: 'path', attrs: { d: leafPath(P.x, P.y, ang, len * cell, w * cell, 0.12), fill: env.fg }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0: (s.T0 + q.L) / maxT, dur: 0.14 } });
            placed++;
          }
        }
      }
      // bud in the eye of a volute
      if (s.endedInSpiral) {
        const q = s.pts[s.pts.length - 1];
        const rr = Math.max(0.6, s.spiralR);
        const e = { x: q.x + Math.cos(q.a + s.spiralSign * Math.PI / 2) * rr, y: q.y + Math.sin(q.a + s.spiralSign * Math.PI / 2) * rr };
        if (field.insideAt(e.x, e.y)) {
          const P = field.toPx(e);
          els.push({ tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(Math.min(wMax * 0.6, rr * cell * 0.8)), fill: env.accent || env.fg }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0: (s.T0 + s.L) / maxT, dur: 0.1 } });
        }
      }
    }
    return els;
  },
};
