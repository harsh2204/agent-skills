// Engraving hatch: parallel ruled lines across the negative space, optionally
// crosshatched, each line broken wherever the letter, frame or earlier
// ornament sits. Used as a woodcut background under foliage.

import { f2 } from '../geom.js';

export const hatch = {
  name: 'hatch', animates: 'draw',
  defaults: { angle: 0, spacing: 2.6, cross: false, stroke: 0.8, jitter: 0.15, gap: 0.8 },
  run(field, env) {
    const { rng, params } = env;
    const { cols, rows, cell } = field;
    const els = [];
    const sw = env.strokePx * params.stroke;
    const lines = (angleDeg, order) => {
      const a = (angleDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
      const cx = cols / 2, cy = rows / 2, R = Math.hypot(cols, rows) / 2 + 2;
      let idx = 0;
      for (let t = -R; t <= R; t += params.spacing, idx++) {
        const ox = cx - sa * t, oy = cy + ca * t;
        const jit = (rng() - 0.5) * params.jitter;
        let run = null;
        const flush = () => {
          if (run && run.n >= 2) {
            const P0 = { x: run.x0 * cell, y: run.y0 * cell }, P1 = { x: run.x1 * cell, y: run.y1 * cell };
            const len = Math.hypot(P1.x - P0.x, P1.y - P0.y);
            els.push({
              tag: 'path', attrs: { d: `M${f2(P0.x)} ${f2(P0.y)}L${f2(P1.x)} ${f2(P1.y)}`, stroke: env.fg, 'stroke-width': f2(sw), fill: 'none', 'stroke-linecap': 'round' },
              len: len * 1.02, cx: P0.x, cy: P0.y, anim: { kind: 'draw', t0: order * 0.4 + 0.5 * (idx / (2 * R / params.spacing)), dur: 0.15 },
            });
          }
          run = null;
        };
        for (let s = -R; s <= R; s += 0.5) {
          const x = ox + ca * s + jit, y = oy + sa * s;
          const ok = field.inBounds(Math.floor(x), Math.floor(y)) && field.freeAt(x, y) && field.distAt(x, y) > params.gap;
          if (ok) { if (!run) run = { x0: x, y0: y, x1: x, y1: y, n: 0 }; run.x1 = x; run.y1 = y; run.n++; }
          else flush();
        }
        flush();
      }
    };
    lines(params.angle, 0);
    if (params.cross) lines(params.angle + 90, 1);
    return els;
  },
};
