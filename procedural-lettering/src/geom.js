// Geometry helpers shared by the ornament modules: path building, smoothing,
// Poisson sampling, Voronoi polygons, value noise and marching squares.

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const f2 = (n) => (Math.round(n * 100) / 100).toString();

// ---------------------------------------------------------------- paths

/** Polyline -> "M L L" path string. */
export function polyPath(pts, close = false) {
  if (!pts.length) return '';
  let d = `M${f2(pts[0].x)} ${f2(pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) d += `L${f2(pts[i].x)} ${f2(pts[i].y)}`;
  return close ? d + 'Z' : d;
}

/** Catmull-Rom spline through pts (every `every`-th point) as cubic beziers. */
export function smoothPath(pts, every = 2, tension = 0.5, close = false) {
  if (pts.length < 3) return polyPath(pts, close);
  const p = [];
  for (let i = 0; i < pts.length; i += every) p.push(pts[i]);
  if (p[p.length - 1] !== pts[pts.length - 1]) p.push(pts[pts.length - 1]);
  const n = p.length;
  const at = (i) => (close ? p[(i + n) % n] : p[clamp(i, 0, n - 1)]);
  let d = `M${f2(p[0].x)} ${f2(p[0].y)}`;
  const segs = close ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) * tension / 3, c1y = p1.y + (p2.y - p0.y) * tension / 3;
    const c2x = p2.x - (p3.x - p1.x) * tension / 3, c2y = p2.y - (p3.y - p1.y) * tension / 3;
    d += `C${f2(c1x)} ${f2(c1y)} ${f2(c2x)} ${f2(c2y)} ${f2(p2.x)} ${f2(p2.y)}`;
  }
  return close ? d + 'Z' : d;
}

/** Catmull-Rom cubic segments between consecutive pts: [{d:'C...', from, to}], so a
 *  polyline can be drawn in runs (e.g. tapering widths) without tangent breaks. */
export function smoothSegments(pts, tension = 0.5) {
  const n = pts.length, out = [];
  const at = (i) => pts[clamp(i, 0, n - 1)];
  for (let i = 0; i < n - 1; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) * tension / 3, c1y = p1.y + (p2.y - p0.y) * tension / 3;
    const c2x = p2.x - (p3.x - p1.x) * tension / 3, c2y = p2.y - (p3.y - p1.y) * tension / 3;
    out.push({ d: `C${f2(c1x)} ${f2(c1y)} ${f2(c2x)} ${f2(c2y)} ${f2(p2.x)} ${f2(p2.y)}`, from: p1, to: p2 });
  }
  return out;
}

export function polyLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return L;
}

/** Almond leaf: base at (x,y), pointing along angle a, length len, width w. */
export function leafPath(x, y, a, len, w, curl = 0) {
  const ca = Math.cos(a), sa = Math.sin(a);
  const nx = -sa, ny = ca;
  const tx = x + ca * len, ty = y + sa * len;
  const mx = x + ca * len * 0.45, my = y + sa * len * 0.45;
  const c = curl * w;
  return `M${f2(x)} ${f2(y)}Q${f2(mx + nx * w + ca * c)} ${f2(my + ny * w + sa * c)} ${f2(tx)} ${f2(ty)}` +
    `Q${f2(mx - nx * w + ca * c)} ${f2(my - ny * w + sa * c)} ${f2(x)} ${f2(y)}Z`;
}

export function starPath(cx, cy, r, points = 5, inner = 0.42, rot = -Math.PI / 2) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = rot + (i * Math.PI) / points;
    d += (i === 0 ? 'M' : 'L') + f2(cx + Math.cos(a) * rr) + ' ' + f2(cy + Math.sin(a) * rr);
  }
  return d + 'Z';
}

export function regularPolygonPath(cx, cy, r, n, rot = 0) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    d += (i ? 'L' : 'M') + f2(cx + Math.cos(a) * r) + ' ' + f2(cy + Math.sin(a) * r);
  }
  return d + 'Z';
}

export function circlePath(cx, cy, r) {
  return `M${f2(cx - r)} ${f2(cy)}a${f2(r)} ${f2(r)} 0 1 0 ${f2(2 * r)} 0a${f2(r)} ${f2(r)} 0 1 0 ${f2(-2 * r)} 0Z`;
}

/** Irregular blob (pebble) around a centre. */
export function blobPath(cx, cy, r, rng, n = 8, jitter = 0.25) {
  const pts = [];
  const rot = rng() * TAU;
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    const rr = r * (1 - jitter + rng() * jitter * 2);
    pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
  }
  return smoothPath(pts, 1, 0.6, true);
}

// ------------------------------------------------------------ sampling

/**
 * Bridson Poisson-disc sampling restricted to cells where `ok(x, y)` is true.
 * Coordinates are in grid cells (floats). Returns [{x,y}].
 */
export function poisson(cols, rows, rMin, rng, ok, maxPts = 4000, k = 20) {
  const cs = rMin / Math.SQRT2;
  const gw = Math.ceil(cols / cs), gh = Math.ceil(rows / cs);
  const grid = new Int32Array(gw * gh).fill(-1);
  const pts = [], active = [];
  const fits = (x, y) => {
    const gx = (x / cs) | 0, gy = (y / cs) | 0;
    for (let j = Math.max(0, gy - 2); j <= Math.min(gh - 1, gy + 2); j++)
      for (let i = Math.max(0, gx - 2); i <= Math.min(gw - 1, gx + 2); i++) {
        const q = grid[j * gw + i];
        if (q >= 0) {
          const dx = pts[q].x - x, dy = pts[q].y - y;
          if (dx * dx + dy * dy < rMin * rMin) return false;
        }
      }
    return true;
  };
  const add = (x, y) => {
    const id = pts.length;
    pts.push({ x, y });
    grid[((y / cs) | 0) * gw + ((x / cs) | 0)] = id;
    active.push(id);
  };
  // seed with a few random free points
  for (let t = 0; t < 60 && !pts.length; t++) {
    const x = rng() * cols, y = rng() * rows;
    if (ok(x, y)) add(x, y);
  }
  while (active.length && pts.length < maxPts) {
    const ai = Math.floor(rng() * active.length);
    const p = pts[active[ai]];
    let found = false;
    for (let t = 0; t < k; t++) {
      const a = rng() * TAU, rr = rMin * (1 + rng());
      const x = p.x + Math.cos(a) * rr, y = p.y + Math.sin(a) * rr;
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      if (!ok(x, y) || !fits(x, y)) continue;
      add(x, y);
      found = true;
      break;
    }
    if (!found) { active[ai] = active[active.length - 1]; active.pop(); }
    // islands: occasionally restart elsewhere so disconnected regions fill too
    if (!active.length && pts.length < maxPts) {
      for (let t = 0; t < 200; t++) {
        const x = rng() * cols, y = rng() * rows;
        if (ok(x, y) && fits(x, y)) { add(x, y); break; }
      }
    }
  }
  return pts;
}

// ------------------------------------------------------------- voronoi

function clipHalfPlane(poly, ax, ay, bx, by) {
  // keep the side of the bisector closer to (ax,ay) than (bx,by)
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const nx = bx - ax, ny = by - ay;
  const out = [];
  const inside = (p) => (p.x - mx) * nx + (p.y - my) * ny <= 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const pi = inside(p), qi = inside(q);
    if (pi) out.push(p);
    if (pi !== qi) {
      const dp = (p.x - mx) * nx + (p.y - my) * ny;
      const dq = (q.x - mx) * nx + (q.y - my) * ny;
      const t = dp / (dp - dq);
      out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    }
  }
  return out;
}

/** Voronoi cell polygons by half-plane clipping against k nearest neighbours. */
export function voronoi(points, x0, y0, x1, y1, k = 14) {
  const n = points.length;
  const cells = new Array(n);
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const near = [];
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const q = points[j];
      near.push([(q.x - p.x) ** 2 + (q.y - p.y) ** 2, j]);
    }
    near.sort((a, b) => a[0] - b[0]);
    let poly = [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
    for (let m = 0; m < Math.min(k, near.length) && poly.length; m++) {
      const q = points[near[m][1]];
      poly = clipHalfPlane(poly, p.x, p.y, q.x, q.y);
    }
    cells[i] = poly;
  }
  return cells;
}

export function polyCentroid(poly) {
  let x = 0, y = 0;
  for (const p of poly) { x += p.x; y += p.y; }
  return { x: x / poly.length, y: y / poly.length };
}

export function insetPolygon(poly, amount) {
  const c = polyCentroid(poly);
  return poly.map((p) => {
    const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy) || 1;
    const s = Math.max(0, d - amount) / d;
    return { x: c.x + dx * s, y: c.y + dy * s };
  });
}

// --------------------------------------------------------------- noise

/** Seeded 2D value noise with smooth interpolation, in [-1, 1]. */
export function makeNoise(rng, size = 64) {
  const lattice = new Float32Array(size * size);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rng() * 2 - 1;
  const at = (i, j) => lattice[((j % size + size) % size) * size + ((i % size + size) % size)];
  const fade = (t) => t * t * (3 - 2 * t);
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const u = fade(x - xi), v = fade(y - yi);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  };
  noise.fbm = (x, y, oct = 3) => {
    let s = 0, amp = 1, f = 1, norm = 0;
    for (let o = 0; o < oct; o++) { s += noise(x * f, y * f) * amp; norm += amp; amp *= 0.5; f *= 2.1; }
    return s / norm;
  };
  return noise;
}

// ---------------------------------------------------- marching squares

/**
 * Iso-contours of a scalar field (cols x rows, sampled at cell centres) at
 * `level`. Cells whose corners fail `valid(i,j)` are skipped. Returns chains of
 * points in cell coordinates (centres at i+0.5, j+0.5).
 */
export function marchingSquares(field, cols, rows, level, valid) {
  const segs = new Map(); // key(edge start) -> {a:{x,y,key}, b:{x,y,key}}
  const edgeKey = (i, j, dir) => (j * cols + i) * 2 + dir; // dir 0: edge from (i,j)->(i+1,j), 1: (i,j)->(i,j+1)
  const interp = (i0, j0, i1, j1, v0, v1) => {
    const t = (level - v0) / (v1 - v0 || 1e-9);
    return { x: i0 + 0.5 + (i1 - i0) * t, y: j0 + 0.5 + (j1 - j0) * t };
  };
  const chainsOut = [];
  const adj = new Map();
  const addSeg = (ka, pa, kb, pb) => {
    if (!adj.has(ka)) adj.set(ka, []);
    if (!adj.has(kb)) adj.set(kb, []);
    adj.get(ka).push({ k: kb, p: pb, self: pa });
    adj.get(kb).push({ k: ka, p: pa, self: pb });
  };
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      if (!valid(i, j) || !valid(i + 1, j) || !valid(i, j + 1) || !valid(i + 1, j + 1)) continue;
      const v0 = field[j * cols + i], v1 = field[j * cols + i + 1];
      const v2 = field[(j + 1) * cols + i + 1], v3 = field[(j + 1) * cols + i];
      const c = (v0 >= level ? 1 : 0) | (v1 >= level ? 2 : 0) | (v2 >= level ? 4 : 0) | (v3 >= level ? 8 : 0);
      if (c === 0 || c === 15) continue;
      const top = () => [edgeKey(i, j, 0), interp(i, j, i + 1, j, v0, v1)];
      const right = () => [edgeKey(i + 1, j, 1), interp(i + 1, j, i + 1, j + 1, v1, v2)];
      const bottom = () => [edgeKey(i, j + 1, 0), interp(i, j + 1, i + 1, j + 1, v3, v2)];
      const left = () => [edgeKey(i, j, 1), interp(i, j, i, j + 1, v0, v3)];
      const pairs = [];
      switch (c) {
        case 1: case 14: pairs.push([top(), left()]); break;
        case 2: case 13: pairs.push([top(), right()]); break;
        case 3: case 12: pairs.push([left(), right()]); break;
        case 4: case 11: pairs.push([right(), bottom()]); break;
        case 5: pairs.push([top(), left()], [right(), bottom()]); break;
        case 6: case 9: pairs.push([top(), bottom()]); break;
        case 7: case 8: pairs.push([left(), bottom()]); break;
        case 10: pairs.push([top(), right()], [left(), bottom()]); break;
      }
      for (const [[ka, pa], [kb, pb]] of pairs) addSeg(ka, pa, kb, pb);
    }
  }
  // stitch into chains
  const used = new Set();
  for (const [k0, list] of adj) {
    if (used.has(k0)) continue;
    // start from endpoints (degree 1) first for open chains
    if (list.length !== 1) continue;
    const chain = [list[0].self];
    let k = k0, prev = null;
    used.add(k);
    for (;;) {
      const nb = adj.get(k).find((e) => e.k !== prev && !used.has(e.k));
      if (!nb) break;
      chain.push(nb.p);
      used.add(nb.k);
      prev = k; k = nb.k;
    }
    chainsOut.push({ pts: chain, closed: false });
  }
  for (const [k0, list] of adj) {
    if (used.has(k0)) continue;
    const chain = [list[0].self];
    let k = k0, prev = null;
    used.add(k);
    for (;;) {
      const nb = adj.get(k).find((e) => e.k !== prev && !used.has(e.k));
      if (!nb) break;
      chain.push(nb.p);
      used.add(nb.k);
      prev = k; k = nb.k;
    }
    chainsOut.push({ pts: chain, closed: true });
  }
  return chainsOut;
}
