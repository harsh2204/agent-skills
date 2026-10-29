// Mosaic tesserae and Voronoi stained glass share one generator: Poisson
// points -> Voronoi polygons -> inset tiles clipped to the free region.

import { poisson, voronoi, insetPolygon, polyCentroid, polyPath, f2 } from '../geom.js';
import { mix, lighten, darken } from '../palettes.js';

export function tiles(field, env, rMin, gapCells, ok) {
  const { rng } = env;
  const pts = poisson(field.cols, field.rows, rMin, rng, ok || ((x, y) => field.freeAt(x, y)));
  if (pts.length < 3) return [];
  const cells = voronoi(pts, 0, 0, field.cols, field.rows, 12);
  // a vertex may only sit in a cell whose 8 neighbours are free too, so edges
  // between vertices (<= 0.8 cells apart) can never leave the free region
  const inside = (q) => field.isInside(Math.floor(q.x), Math.floor(q.y)) && field.distAt(q.x, q.y) >= 1.5;
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    let poly = insetPolygon(cells[i], gapCells / 2);
    if (poly.length < 3) continue;
    // subdivide long edges, then pull every vertex that lies in an obstacle back
    // along the ray to the seed until it is in the free region (bisection)
    const fine = [];
    for (let k = 0; k < poly.length; k++) {
      const a = poly[k], b = poly[(k + 1) % poly.length];
      const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.8));
      for (let t = 0; t < n; t++) fine.push({ x: a.x + (b.x - a.x) * t / n, y: a.y + (b.y - a.y) * t / n });
    }
    const seed = pts[i];
    // every vertex is clamped to the free run of the ray seed -> vertex, so the
    // tile is star-shaped around its seed and never bridges a letter stroke
    poly = fine.map((p) => {
      const dx = p.x - seed.x, dy = p.y - seed.y, len = Math.hypot(dx, dy);
      if (len < 1e-6) return p;
      let ok = 0;
      for (let t = 0.3; t <= len; t += 0.3) {
        if (!inside({ x: seed.x + dx * t / len, y: seed.y + dy * t / len })) break;
        ok = t;
      }
      if (ok >= len - 0.3 && inside(p)) return p;
      const t = Math.max(0, ok - 0.3);
      return { x: seed.x + dx * t / len, y: seed.y + dy * t / len };
    });
    out.push({ poly, seed, c: polyCentroid(poly) });
  }
  return out;
}

export const mosaic = {
  name: 'mosaic', animates: 'pop',
  defaults: { size: 3.4, gap: 0.7, variation: 0.25, colors: null },
  run(field, env) {
    const { rng, params } = env;
    const cell = field.cell;
    const palette = params.colors || [env.fg, lighten(env.fg, 0.25), darken(env.fg, 0.2), env.accent];
    const els = [];
    for (const t of tiles(field, env, params.size, params.gap)) {
      const base = palette[Math.floor(rng() * palette.length)];
      const col = mix(base, rng() < 0.5 ? '#ffffff' : '#000000', rng() * params.variation);
      const px = t.poly.map((p) => ({ x: p.x * cell, y: p.y * cell }));
      const C = { x: t.c.x * cell, y: t.c.y * cell };
      els.push({ tag: 'path', attrs: { d: polyPath(px, true), fill: col, stroke: col, 'stroke-width': 0.3, 'stroke-linejoin': 'round' }, cx: C.x, cy: C.y, anim: { kind: 'pop', t0: 0.05 + 0.8 * Math.min(1, field.distLetterAt(t.seed.x, t.seed.y) / 40) + rng() * 0.1, dur: 0.12 } });
    }
    return els;
  },
};

export const voronoiGlass = {
  name: 'voronoi', animates: 'pop',
  defaults: { size: 4.5, lead: 1.6, colors: null },
  run(field, env) {
    const { rng, params } = env;
    const cell = field.cell;
    const glass = params.colors || env.palette.glass || ['#D7301F', '#2667A8', '#F2D23B', '#2BB673', '#7B3FA0'];
    const els = [];
    const lead = env.strokePx * params.lead;
    const ts = tiles(field, env, params.size, 0.15);
    for (const t of ts) {
      const col = mix(glass[Math.floor(rng() * glass.length)], '#ffffff', rng() * 0.25);
      const px = t.poly.map((p) => ({ x: p.x * cell, y: p.y * cell }));
      const C = { x: t.c.x * cell, y: t.c.y * cell };
      els.push({ tag: 'path', attrs: { d: polyPath(px, true), fill: col, stroke: 'none' }, cx: C.x, cy: C.y, anim: { kind: 'fade', t0: 0.05 + 0.7 * Math.min(1, field.distLetterAt(t.seed.x, t.seed.y) / 40), dur: 0.2 } });
    }
    // lead came drawn over the glass
    for (const t of ts) {
      const px = t.poly.map((p) => ({ x: p.x * cell, y: p.y * cell }));
      els.push({ tag: 'path', attrs: { d: polyPath(px, true), fill: 'none', stroke: env.fg, 'stroke-width': f2(lead), 'stroke-linejoin': 'round' }, cx: t.c.x * cell, cy: t.c.y * cell, anim: { kind: 'fade', t0: 0.4 + rng() * 0.3, dur: 0.2 } });
    }
    return els;
  },
};
