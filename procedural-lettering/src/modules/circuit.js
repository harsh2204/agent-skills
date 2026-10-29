// Circuit / PCB traces: lattice walks with 45° bends, pads at the ends, vias
// in between. Traces never cross; each starts from a pad near the frame edge.

import { latticeOf } from './lattice.js';
import { f2 } from '../geom.js';

export const circuit = {
  name: 'circuit', animates: 'draw',
  defaults: { pitch: 3, traces: 1, turnProb: 0.18, stroke: 1.1 },
  run(field, env) {
    const { rng, params } = env;
    const L = latticeOf(field, params.pitch, 0);
    const used = new Uint8Array(L.lc * L.lr);
    const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    const free = (i, j) => L.isFree(i, j) && !used[j * L.lc + i];
    const els = [];
    const m = L.m * field.cell, w = Math.max(1, m * 0.3 * params.stroke);
    const pad = (P, t0, big) => {
      els.push({ tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(big ? m * 0.42 : m * 0.3), fill: env.fg }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0, dur: 0.08 } });
      els.push({ tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(big ? m * 0.16 : m * 0.1), fill: env.bg }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0, dur: 0.08 } });
    };
    // candidate starts near the frame edge
    const starts = [];
    for (let j = 0; j < L.lr; j++) for (let i = 0; i < L.lc; i++) if (L.isFree(i, j)) {
      const c = L.centre(i, j);
      if (field.distFrameAt(c.x / field.cell, c.y / field.cell) < L.m * 2.2) starts.push([i, j]);
    }
    for (let s = starts.length - 1; s > 0; s--) { const t = Math.floor(rng() * (s + 1)); [starts[s], starts[t]] = [starts[t], starts[s]]; }
    const nTraces = Math.round(starts.length * 0.45 * params.traces);
    let made = 0;
    for (const [si, sj] of starts) {
      if (made >= nTraces) break;
      if (!free(si, sj)) continue;
      // head inward
      const c0 = L.centre(si, sj);
      const gx = field.cols / 2 - c0.x / field.cell, gy = field.rows / 2 - c0.y / field.cell;
      let dir = Math.round(((Math.atan2(gy, gx) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8;
      let i = si, j = sj;
      const pts = [L.centre(i, j)];
      used[j * L.lc + i] = 1;
      for (let step = 0; step < 60; step++) {
        if (rng() < params.turnProb) dir = (dir + (rng() < 0.5 ? 1 : 7)) % 8;
        let moved = false;
        for (const dd of [0, 1, 7, 2, 6]) {
          const d = dirs[(dir + dd) % 8];
          const ni = i + d[0], nj = j + d[1];
          // diagonal moves must not squeeze between two used cells
          if (!free(ni, nj)) continue;
          if (d[0] && d[1] && (!free(i + d[0], j) && !free(i, j + d[1]))) continue;
          dir = (dir + dd) % 8; i = ni; j = nj; moved = true;
          used[j * L.lc + i] = 1; pts.push(L.centre(i, j));
          break;
        }
        if (!moved) break;
        if (step > 6 && rng() < 0.06) break; // random stop -> pad
      }
      if (pts.length < 3) continue;
      made++;
      let d = `M${f2(pts[0].x)} ${f2(pts[0].y)}`, len = 0;
      for (let k = 1; k < pts.length; k++) { d += `L${f2(pts[k].x)} ${f2(pts[k].y)}`; len += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y); }
      const t0 = rng() * 0.3, dur = Math.min(0.5, len / (field.W * 1.5));
      els.push({ tag: 'path', attrs: { d, fill: 'none', stroke: env.fg, 'stroke-width': f2(w), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, len: len * 1.02, cx: pts[0].x, cy: pts[0].y, anim: { kind: 'draw', t0, dur } });
      pad(pts[0], t0, true);
      pad(pts[pts.length - 1], t0 + dur, rng() < 0.4);
      if (pts.length > 8 && rng() < 0.5) pad(pts[Math.floor(pts.length / 2)], t0 + dur / 2, false);
    }
    for (let j = 0; j < L.lr; j++) for (let i = 0; i < L.lc; i++) if (used[j * L.lc + i]) L.mark(i, j);
    return els;
  },
};
