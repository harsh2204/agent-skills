// Halftone, stipple and geometric tiling: lattice- and sampling-based fills
// whose density follows the distance field.

import { poisson, starPath, regularPolygonPath, circlePath, f2, TAU } from '../geom.js';

export const halftone = {
  name: 'halftone', animates: 'pop',
  defaults: { pitch: 2.6, falloff: 'letter', gamma: 1, scale: 1, angle: 0 },
  run(field, env) {
    const { params } = env;
    const { cols, rows, cell } = field;
    const els = [];
    let maxD = 1;
    for (let k = 0; k < field.dist.length; k++) if (!field.obst[k]) maxD = Math.max(maxD, field.distLetter[k]);
    const step = params.pitch;
    const a = (params.angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const R = Math.hypot(cols, rows) / 2;
    for (let v = -R, row = 0; v <= R; v += step * 0.866, row++) {
      for (let u = -R + (row % 2) * step / 2; u <= R; u += step) {
        const x = cols / 2 + u * ca - v * sa, y = rows / 2 + u * sa + v * ca;
        if (!field.freeAt(x, y) || field.distAt(x, y) < 0.8) continue;
        let t;
        if (params.falloff === 'letter') t = field.distLetterAt(x, y) / maxD;          // big near the letter
        else if (params.falloff === 'frame') t = 1 - Math.min(1, field.distFrameAt(x, y) / (maxD * 0.8)); // big near frame
        else if (params.falloff === 'radial') t = Math.hypot(x - cols / 2, y - rows / 2) / (cols / 2);
        else t = 0.5;
        const r = Math.min(step * 0.48 * Math.pow(Math.max(0, 1 - t), params.gamma) * params.scale, field.distAt(x, y) - 1);
        if (r < 0.2) continue;
        const P = { x: x * cell, y: y * cell };
        els.push({ tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(r * cell), fill: env.fg }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0: 0.05 + 0.8 * t, dur: 0.12 } });
      }
    }
    return els;
  },
};

export const stipple = {
  name: 'stipple', animates: 'pop',
  defaults: { density: 1, shade: 'letter', rMin: 0.9, rMax: 3.2, dot: 0.4 },
  run(field, env) {
    const { rng, params } = env;
    const { cols, rows, cell } = field;
    const els = [];
    let maxD = 1;
    for (let k = 0; k < field.dist.length; k++) if (!field.obst[k]) maxD = Math.max(maxD, field.distLetter[k]);
    // variable-radius dart throwing with a coarse acceptance grid
    const gs = params.rMin, gw = Math.ceil(cols / gs), gh = Math.ceil(rows / gs);
    const buckets = new Map();
    const key = (x, y) => ((y / gs) | 0) * gw + ((x / gs) | 0);
    const radiusAt = (x, y) => {
      let t = params.shade === 'letter' ? field.distLetterAt(x, y) / maxD : params.shade === 'frame' ? 1 - field.distFrameAt(x, y) / maxD : 0.5 + 0.5 * env.noise.fbm(x * 0.08, y * 0.08, 2);
      t = Math.min(1, Math.max(0, t));
      return (params.rMin + (params.rMax - params.rMin) * t) / params.density;
    };
    const tries = Math.round(cols * rows * 1.2);
    let n = 0;
    for (let t = 0; t < tries && n < 3000; t++) {
      const x = rng() * cols, y = rng() * rows;
      if (!field.freeAt(x, y) || field.distAt(x, y) < 1.6) continue;
      const r = radiusAt(x, y);
      let ok = true;
      const cx = (x / gs) | 0, cy = (y / gs) | 0, reach = Math.ceil(r / gs);
      for (let j = cy - reach; j <= cy + reach && ok; j++) for (let i = cx - reach; i <= cx + reach; i++) {
        const b = buckets.get(j * gw + i);
        if (!b) continue;
        for (const q of b) if ((q.x - x) ** 2 + (q.y - y) ** 2 < Math.max(r, q.r) ** 2) { ok = false; break; }
        if (!ok) break;
      }
      if (!ok) continue;
      const k = key(x, y);
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push({ x, y, r });
      const P = { x: x * cell, y: y * cell };
      const dr = cell * params.dot * (0.7 + 0.6 * rng());
      els.push({ tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(dr), fill: env.fg }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0: 0.05 + 0.85 * rng(), dur: 0.1 } });
      n++;
    }
    return els;
  },
};

export const tiling = {
  name: 'tiling', animates: 'pop',
  defaults: { pitch: 5, motifs: ['diamond', 'ring', 'cross', 'quatrefoil', 'star'], alternate: true, scale: 0.82 },
  run(field, env) {
    const { rng, params } = env;
    const { cell } = field;
    const els = [];
    const step = params.pitch, half = step * 0.5 * params.scale;
    const motifs = params.motifs;
    const colors = [env.fg, env.accent, env.accent2].filter(Boolean);
    let idx = 0;
    for (let y = step / 2, row = 0; y < field.rows; y += step, row++) {
      for (let x = step / 2, col = 0; x < field.cols; x += step, col++) {
        if (!field.clear(x, y, half + 0.5)) continue;
        const m = params.alternate ? motifs[(row + col) % motifs.length] : motifs[Math.floor(rng() * motifs.length)];
        const P = { x: x * cell, y: y * cell }, r = half * cell;
        const color = params.alternate ? colors[(row + col) % colors.length] : colors[Math.floor(rng() * colors.length)];
        const sw = env.strokePx;
        let e;
        switch (m) {
          case 'diamond': e = { tag: 'path', attrs: { d: regularPolygonPath(P.x, P.y, r, 4, 0), fill: color } }; break;
          case 'ring': e = { tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(r * 0.8), fill: 'none', stroke: color, 'stroke-width': f2(sw * 1.4) } }; break;
          case 'dot': e = { tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(r * 0.55), fill: color } }; break;
          case 'cross': e = { tag: 'path', attrs: { d: `M${f2(P.x - r)} ${f2(P.y)}H${f2(P.x + r)}M${f2(P.x)} ${f2(P.y - r)}V${f2(P.y + r)}`, stroke: color, 'stroke-width': f2(sw * 1.4), fill: 'none', 'stroke-linecap': 'round' } }; break;
          case 'quatrefoil': {
            const q = r * 0.5;
            e = { tag: 'path', attrs: { d: circlePath(P.x - q, P.y, q) + circlePath(P.x + q, P.y, q) + circlePath(P.x, P.y - q, q) + circlePath(P.x, P.y + q, q), fill: color, 'fill-rule': 'nonzero' } };
            break;
          }
          case 'hex': e = { tag: 'path', attrs: { d: regularPolygonPath(P.x, P.y, r * 0.9, 6, 0), fill: 'none', stroke: color, 'stroke-width': f2(sw * 1.3) } }; break;
          default: e = { tag: 'path', attrs: { d: starPath(P.x, P.y, r, 5, 0.45, -Math.PI / 2), fill: color } };
        }
        e.cx = P.x; e.cy = P.y; e.anim = { kind: 'pop', t0: 0.05 + 0.8 * ((row + col) % 7) / 7 + rng() * 0.05, dur: 0.12 };
        els.push(e);
        field.markDisk(x, y, half);
        idx++;
      }
    }
    return els;
  },
};

/** Small florets and tendrils, the default pattern inside a pattern-filled glyph. */
export const florets = {
  name: 'florets', animates: 'pop',
  defaults: { density: 1 },
  run(field, env) {
    const { rng, params } = env;
    const { cell } = field;
    const els = [];
    const pts = poisson(field.cols, field.rows, 2.2 / params.density, rng, (x, y) => field.freeAt(x, y) && field.distAt(x, y) > 0.9);
    for (const p of pts) {
      const P = { x: p.x * cell, y: p.y * cell };
      // everything a floret draws must stay inside the clear disc around p
      const room = Math.min(field.distAt(p.x, p.y) - 1.5, 2.4);
      if (room < 0.3) continue;
      const r = room * 0.7 * cell;
      const t0 = 0.2 + rng() * 0.6;
      if (room > 1.6 && rng() < 0.35) {
        // floret: ring of 5 petals
        let d = '';
        for (let i = 0; i < 5; i++) { const a = (i * TAU) / 5 + rng(); d += circlePath(P.x + Math.cos(a) * r * 0.55, P.y + Math.sin(a) * r * 0.55, r * 0.32); }
        els.push({ tag: 'path', attrs: { d, fill: env.fg }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0, dur: 0.1 } });
        els.push({ tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(r * 0.2), fill: env.bg }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0, dur: 0.1 } });
      } else if (room > 1.2 && rng() < 0.5) {
        // tendril: little arc with a curl
        const a0 = rng() * TAU, L = r * 1.4;
        const d = `M${f2(P.x - Math.cos(a0) * L)} ${f2(P.y - Math.sin(a0) * L)}Q${f2(P.x + Math.cos(a0 + 1.4) * L * 0.6)} ${f2(P.y + Math.sin(a0 + 1.4) * L * 0.6)} ${f2(P.x + Math.cos(a0) * L)} ${f2(P.y + Math.sin(a0) * L)}`;
        els.push({ tag: 'path', attrs: { d, fill: 'none', stroke: env.fg, 'stroke-width': f2(env.strokePx * 0.9), 'stroke-linecap': 'round' }, len: L * 2.4, cx: P.x, cy: P.y, anim: { kind: 'draw', t0, dur: 0.1 } });
      } else {
        els.push({ tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(Math.min(r * 0.35, cell * 0.6)), fill: env.fg }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0, dur: 0.08 } });
      }
    }
    return els;
  },
};
