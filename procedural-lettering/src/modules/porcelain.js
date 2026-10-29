// Delft / porcelain floral: dense cobalt scrollwork with small leaves on both
// sides of every stem, berry clusters and rosettes in the pockets. Cobalt on
// white; the same engine as `vines` at a finer scale.

import { leafPath, smoothPath, polyLength, f2, TAU } from '../geom.js';
import { edgeSeeds, pocketSeeds, grow, thin, clearance, curvatureAt } from './turtle.js';
import { fitsLeaf, markLeaf } from './vines.js';

export const porcelain = {
  name: 'porcelain', animates: 'draw',
  defaults: { density: 1, motifs: 1, berries: true, flowers: true, leafLen: 4.2, stroke: 1 },
  run(field, env) {
    const { rng, params } = env;
    const cell = field.cell, ink = env.fg, paper = env.bg;
    const els = [];
    const sw = env.strokePx * params.stroke;
    const area = field.freeCount();
    const pop = (P, t0, dur = 0.1) => ({ cx: P.x, cy: P.y, anim: { kind: 'pop', t0, dur } });

    // --- scrollwork: tighter radii and spacing than the hero vines
    const turtle = {
      maxSteps: 46, minLen: 5, clear: 1.25, lag: 5, radius: 7, radiusJitter: 0.4, flipProb: 0.04, maxTurn: 0.45, avoid: 0.4, lookahead: 4,
      tightDist: 2.2, spiralProb: 0.03, minSpiralAt: 12, spiralR0: 4.5, spiralRmin: 1.8, spiralTighten: 0.14, spiralEye: 1.1,
      branchEvery: 7, branchProb: 0.8, branchAngle: 0.35, maxDepth: 4, maxStems: Math.round(140 * params.density), leafStalkProb: 0.25, stalkLen: [2, 4],
    };
    const nSeeds = Math.max(4, Math.round(Math.sqrt(area) / 7 * params.density));
    const stems = grow(field, rng, edgeSeeds(field, rng, nSeeds, { jitter: 1.2, minClear: 1.8 }), turtle);
    for (let round = 0; round < 16 && stems.length < turtle.maxStems; round++) {
      let tNow = 0;
      for (const s of stems) tNow = Math.max(tNow, s.T0 + s.L);
      const more = pocketSeeds(field, rng, 4, 2.6).map((s) => ({ ...s, T0: tNow * (0.3 + 0.3 * rng()) }));
      if (!more.length) break;
      grow(field, rng, more, { ...turtle, maxSteps: 30 }, { stems });
    }
    let maxT = 1;
    for (const s of stems) maxT = Math.max(maxT, s.T0 + s.L);
    const norm = (t) => t / maxT;
    for (const s of stems) {
      const px = thin(s.pts, 2, 0.2).map((q) => field.toPx(q));
      els.push({
        tag: 'path', attrs: { d: smoothPath(px, 1, 0.5), fill: 'none', stroke: ink, 'stroke-width': f2(sw), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        len: polyLength(px) * 1.04, cx: px[0].x, cy: px[0].y, anim: { kind: 'draw', t0: norm(s.T0), dur: norm(s.L) },
      });
    }

    // --- small leaves, alternating sides, plus a leaf on every stalk tip
    const leaf = (q, ang, len, t, ignore) => {
      const w = len * 0.42;
      if (!fitsLeaf(field, q.x, q.y, ang, len, w, ignore)) return false;
      markLeaf(field, q.x, q.y, ang, len, w);
      const P = field.toPx(q);
      els.push({ tag: 'path', attrs: { d: leafPath(P.x, P.y, ang, len * cell, w * cell, (rng() - 0.5) * 0.4), fill: ink }, ...pop(P, t) });
      return true;
    };
    for (const s of stems) {
      if (s.stalk) { const q = s.pts[s.pts.length - 1]; leaf(q, q.a, params.leafLen * (0.9 + rng() * 0.3), norm(s.T0 + s.L), s.mark) || leaf(q, q.a, params.leafLen * 0.65, norm(s.T0 + s.L), s.mark); continue; }
      let side = rng() < 0.5 ? 1 : -1;
      for (let i = 2 + Math.floor(rng() * 3); i < s.pts.length - 1; i += 3) {
        const q = s.pts[i];
        const kappa = curvatureAt(s.pts, i);
        side = Math.abs(kappa) > 0.08 ? (kappa > 0 ? -1 : 1) : -side;
        const ang = q.a + side * (1.0 + rng() * 0.4);
        leaf(q, ang, params.leafLen * (0.75 + rng() * 0.5), norm(s.T0 + q.L), s.mark);
      }
    }

    // --- berries (packed dot clusters) and rosettes in the remaining pockets
    if (params.motifs > 0) {
      const n = Math.round((area / 900) * 1.6 * params.motifs) + 2;
      let placed = 0;
      for (let t = 0; t < n * 60 && placed < n; t++) {
        const c = field.randomFree(rng);
        if (!c) break;
        const room = clearance(field, c.x, c.y, 1.9, 4, 0.3);
        if (!room) continue;
        const P = field.toPx(c);
        const t0 = 0.45 + rng() * 0.45;
        const r = room - 0.5;
        if (params.flowers && room >= 3.2 && rng() < 0.45) {
          // rosette: 5-6 petals around a white eye
          const k = 5 + (rng() < 0.4 ? 1 : 0), rot = rng() * TAU, pr = r * cell;
          for (let i = 0; i < k; i++) {
            const a = rot + (i * TAU) / k;
            els.push({ tag: 'path', attrs: { d: leafPath(P.x + Math.cos(a) * pr * 0.2, P.y + Math.sin(a) * pr * 0.2, a, pr * 0.78, pr * 0.3, 0), fill: ink }, ...pop(P, t0) });
          }
          els.push({ tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(pr * 0.2), fill: paper, stroke: ink, 'stroke-width': f2(sw) }, ...pop(P, t0 + 0.04) });
        } else if (params.berries) {
          // berry cluster: hex-packed dots filling the pocket
          const dr = Math.max(0.55, Math.min(0.9, r / 3)), pitch = dr * 2.15;
          let any = false;
          for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {
            const bx = c.x + (i + (j % 2 ? 0.5 : 0)) * pitch, by = c.y + j * pitch * 0.866;
            if (Math.hypot(bx - c.x, by - c.y) > r - dr * 0.4) continue;
            if (!field.clear(bx, by, dr + 0.8)) continue;
            const B = field.toPx({ x: bx, y: by });
            els.push({ tag: 'circle', attrs: { cx: f2(B.x), cy: f2(B.y), r: f2(dr * cell), fill: ink }, ...pop(B, t0 + 0.02 * (i + j + 6), 0.08) });
            any = true;
          }
          if (!any) continue;
        } else continue;
        field.markDisk(c.x, c.y, r + 0.4);
        placed++;
      }
    }
    return els;
  },
};
