// Contour isolines of the distance field, with low-frequency noise so they
// wander like wood grain; broken into fragments for an etched look.

import { marchingSquares, smoothPath, polyLength, f2 } from '../geom.js';

export const contour = {
  name: 'contour', animates: 'draw',
  defaults: { spacing: 3.2, wobble: 1.6, scale: 0.09, breaks: 0.25, grain: true, levels: 40, stroke: 1, fade: 0.35 },
  run(field, env) {
    const { rng, noise, params } = env;
    const { cols, rows, cell } = field;
    const F = new Float32Array(cols * rows);
    const amp = params.wobble, sc = params.scale;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      // distance to the letter only; the frame edge just clips
      const n = noise.fbm(i * sc + 7.1, j * sc + 3.3, 3);
      F[k] = field.distLetter[k] + amp * n + (params.grain ? 0.6 * Math.sin((i + j * 0.3) * 0.35 + n * 4) : 0);
    }
    const valid = (i, j) => !field.obst[j * cols + i] && field.distFrame[j * cols + i] > 0.8;
    const els = [];
    const sw = env.strokePx * params.stroke;
    let maxD = 0;
    for (let k = 0; k < F.length; k++) if (!field.obst[k]) maxD = Math.max(maxD, field.distLetter[k]);
    const nLevels = Math.min(params.levels, Math.ceil(maxD / params.spacing) + 1);
    for (let li = 0; li < nLevels; li++) {
      const level = 1.2 + li * params.spacing * (1 + li * 0.015);
      const chains = marchingSquares(F, cols, rows, level, valid);
      for (const ch of chains) {
        if (ch.pts.length < 4) continue;
        // split into fragments at random for the broken, etched quality
        const frags = [];
        let cur = [];
        for (let i = 0; i < ch.pts.length; i++) {
          cur.push(ch.pts[i]);
          if (params.breaks > 0 && cur.length > 10 && rng() < params.breaks * 0.08) { frags.push(cur); cur = []; const skip = 1 + Math.floor(rng() * 3); i += skip; }
        }
        if (cur.length > 2) frags.push(cur);
        for (const fr of frags) {
          const px = fr.map((p) => ({ x: p.x * cell, y: p.y * cell }));
          const d = smoothPath(px, 2, 0.5, false);
          els.push({
            tag: 'path', attrs: { d, fill: 'none', stroke: env.fg, 'stroke-width': f2(sw * (0.8 + rng() * 0.5)), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: f2((0.75 + rng() * 0.25) * (params.fade ? Math.min(1, (1.05 - li / nLevels) / params.fade) : 1)) },
            len: polyLength(px) * 1.03, cx: px[0].x, cy: px[0].y,
            anim: { kind: 'draw', t0: 0.05 + 0.7 * (li / Math.max(1, nLevels - 1)) + rng() * 0.08, dur: 0.22 },
          });
        }
      }
    }
    return els;
  },
};
