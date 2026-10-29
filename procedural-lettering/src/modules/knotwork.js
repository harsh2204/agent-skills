// Celtic knotwork on a lattice: two diagonal strands cross in every free cell;
// at lattice corners a strand passes straight on, or reflects off walls that
// bound the letter/frame. Over/under alternates in a checkerboard.

import { latticeOf } from './lattice.js';
import { f2 } from '../geom.js';

export const knotwork = {
  name: 'knotwork', animates: 'fade',
  defaults: { pitch: 6, stroke: 0.32, gapRatio: 0.55, twoTone: true },
  run(field, env) {
    const { params } = env;
    const L = latticeOf(field, params.pitch, 0);
    const m = L.m * field.cell;
    const w = m * params.stroke, halo = w * (1 + params.gapRatio);
    const F = (i, j) => L.isFree(i, j);
    // walls: an edge between a free and a non-free cell
    const hWallAt = (i, j) => (F(i - 1, j - 1) !== F(i - 1, j)) || (F(i, j - 1) !== F(i, j)); // horizontal grid line through corner (i,j)
    const vWallAt = (i, j) => (F(i - 1, j - 1) !== F(i, j - 1)) || (F(i - 1, j) !== F(i, j));  // vertical grid line through corner (i,j)
    const under = [], over = [], halos = [];
    const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    let cells = 0;
    for (let j = 0; j < L.lr; j++) for (let i = 0; i < L.lc; i++) {
      if (!F(i, j)) continue;
      cells++;
      const c = L.centre(i, j);
      const d1Over = (i + j) % 2 === 0; // NW-SE diagonal over when even
      for (const [dx, dy] of [[1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const isD1 = dx === dy;
        const ci = i + (dx > 0 ? 1 : 0), cj = j + (dy > 0 ? 1 : 0); // corner index
        const P = L.corner(ci, cj);
        const hw = hWallAt(ci, cj), vw = vWallAt(ci, cj);
        let ti, tj;
        if (!hw && !vw) { ti = i + dx; tj = j + dy; }
        else if (hw && !vw) { ti = i + dx; tj = j; }
        else if (!hw && vw) { ti = i; tj = j + dy; }
        else { ti = i; tj = j; }
        let d;
        if (ti === i && tj === j) {
          // reverse: a lobe out to the corner and back
          const ux = (P.x - c.x), uy = (P.y - c.y);
          const nx = -uy * 0.55, ny = ux * 0.55;
          d = `M${f2(c.x)} ${f2(c.y)}C${f2(P.x + nx * 0.9 + ux * 0.15)} ${f2(P.y + ny * 0.9 + uy * 0.15)} ${f2(P.x - nx * 0.9 + ux * 0.15)} ${f2(P.y - ny * 0.9 + uy * 0.15)} ${f2(c.x)} ${f2(c.y)}`;
          // the lobe belongs to this cell's diagonal; draw whole
          (isD1 === d1Over ? over : under).push(d);
          continue;
        }
        const t = L.centre(ti, tj);
        // half of the quadratic c -> P -> t, split at the midpoint
        const m1 = mid(c, P), m2 = mid(P, t), M = mid(m1, m2);
        d = `M${f2(c.x)} ${f2(c.y)}Q${f2(m1.x)} ${f2(m1.y)} ${f2(M.x)} ${f2(M.y)}`;
        (isD1 === d1Over ? over : under).push(d);
      }
      // halo under the over-strand, only around the crossing
      const k = 0.28 * m;
      const sgn = d1Over ? 1 : -1;
      halos.push(`M${f2(c.x - k)} ${f2(c.y - k * sgn)}L${f2(c.x + k)} ${f2(c.y + k * sgn)}`);
    }
    if (!cells) return [];
    const ink = env.fg, paper = env.bg;
    const els = [];
    const base = { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    if (params.twoTone) {
      // dark edge line under a lighter core gives the carved look
      els.push({ tag: 'path', attrs: { d: under.join(''), ...base, stroke: ink, 'stroke-width': f2(w) }, anim: { kind: 'fade', t0: 0, dur: 0.4 } });
      els.push({ tag: 'path', attrs: { d: halos.join(''), ...base, stroke: paper, 'stroke-width': f2(halo), 'stroke-linecap': 'butt' }, anim: { kind: 'fade', t0: 0.3, dur: 0.3 } });
      els.push({ tag: 'path', attrs: { d: over.join(''), ...base, stroke: ink, 'stroke-width': f2(w) }, anim: { kind: 'fade', t0: 0.3, dur: 0.3 } });
      els.push({ tag: 'path', attrs: { d: under.join(''), ...base, stroke: env.accent, 'stroke-width': f2(w * 0.4) }, anim: { kind: 'fade', t0: 0.5, dur: 0.4 } });
      els.push({ tag: 'path', attrs: { d: halos.join(''), ...base, stroke: paper, 'stroke-width': f2(halo), 'stroke-linecap': 'butt' }, anim: { kind: 'fade', t0: 0.5, dur: 0.4 } });
      els.push({ tag: 'path', attrs: { d: over.join(''), ...base, stroke: ink, 'stroke-width': f2(w) }, anim: { kind: 'fade', t0: 0.5, dur: 0.4 } });
      els.push({ tag: 'path', attrs: { d: over.join(''), ...base, stroke: env.accent, 'stroke-width': f2(w * 0.4) }, anim: { kind: 'fade', t0: 0.6, dur: 0.4 } });
    } else {
      els.push({ tag: 'path', attrs: { d: under.join(''), ...base, stroke: ink, 'stroke-width': f2(w) }, anim: { kind: 'fade', t0: 0, dur: 0.4 } });
      els.push({ tag: 'path', attrs: { d: halos.join(''), ...base, stroke: paper, 'stroke-width': f2(halo), 'stroke-linecap': 'butt' }, anim: { kind: 'fade', t0: 0.3, dur: 0.3 } });
      els.push({ tag: 'path', attrs: { d: over.join(''), ...base, stroke: ink, 'stroke-width': f2(w) }, anim: { kind: 'fade', t0: 0.3, dur: 0.3 } });
    }
    for (let j = 0; j < L.lr; j++) for (let i = 0; i < L.lc; i++) if (F(i, j)) L.mark(i, j);
    return els;
  },
};
