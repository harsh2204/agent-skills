// Rasterizes the glyph + frame into an occupancy grid and builds the distance
// fields every ornament module reads. No dependencies: an offscreen 2D canvas
// draws the same font string the SVG <text> will use, so the mask matches the
// rendered letter.

import { clamp } from './geom.js';

export const GLYPH_STYLES = {
  blackletter: {
    family: '"UnifrakturMaguntia","Old English Text MT","Cloister Black","Lucida Blackletter","Fette Fraktur","Textura",serif',
    weight: 400, fit: 0.74, label: 'Blackletter',
  },
  roman: {
    family: '"Cinzel","Trajan Pro","Trajan","Playfair Display SC","Times New Roman",serif',
    weight: 700, fit: 0.66, label: 'Roman',
  },
  uncial: {
    family: '"Luminari","Uncial Antiqua","Cormorant Unicase","IM FELL English SC","Georgia",serif',
    weight: 700, fit: 0.66, label: 'Uncial / Lombardic',
  },
  script: {
    family: '"Great Vibes","Snell Roundhand","Apple Chancery","Edwardian Script ITC","Tangerine","Brush Script MT",cursive',
    weight: 400, fit: 0.78, label: 'Script',
  },
  slab: {
    family: '"Alfa Slab One","Ultra","Rockwell Extra Bold","Rockwell","Clarendon","Georgia",serif',
    weight: 700, fit: 0.64, label: 'Slab',
  },
  display: {
    family: '"Abril Fatface","Bodoni Moda","Playfair Display","Didot","Bodoni 72","Big Caslon","Georgia",serif',
    weight: 900, fit: 0.68, label: 'Display',
  },
};

export const FRAME_SHAPES = ['none', 'square', 'rounded', 'circle', 'diamond', 'contour'];

let _canvas = null;
function getCanvas() {
  if (!_canvas) _canvas = typeof OffscreenCanvas !== 'undefined' && false ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
  return _canvas;
}

export function fontString(style, fontSize) {
  const s = GLYPH_STYLES[style] || GLYPH_STYLES.roman;
  return `${s.weight} ${fontSize}px ${s.family}`;
}

/** Measure a string per character (no kerning, so SVG and canvas agree). */
function measureChars(ctx2d, text, fontSize, tracking) {
  const chars = [];
  let x = 0, top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity;
  for (const ch of text) {
    const m = ctx2d.measureText(ch);
    const l = x - (m.actualBoundingBoxLeft || 0);
    const r = x + (m.actualBoundingBoxRight || m.width);
    left = Math.min(left, l); right = Math.max(right, r);
    top = Math.min(top, -(m.actualBoundingBoxAscent || fontSize * 0.7));
    bottom = Math.max(bottom, m.actualBoundingBoxDescent || 0);
    chars.push({ ch, x, adv: m.width });
    x += m.width + tracking * fontSize;
  }
  return { chars, left, right, top, bottom, width: right - left, height: bottom - top };
}

// ----------------------------------------------------------- frame geometry

export function frameGeometry(shape, W, H, size, opts = {}) {
  const lw = opts.lineWidth ?? (shape === 'none' ? 0 : Math.max(1, size * 0.012));
  const margin = Math.max(1, size * 0.015) + lw / 2;
  const pad = opts.pad ?? size * 0.035;
  const g = { shape, W, H, lw, margin, pad, cx: W / 2, cy: H / 2 };
  g.x0 = margin; g.y0 = margin; g.x1 = W - margin; g.y1 = H - margin;
  g.r = Math.min(W, H) / 2 - margin;
  g.radius = shape === 'rounded' ? Math.min(W, H) * 0.14 : 0;
  g.inset = lw / 2 + pad; // ornament keeps this far from the frame line
  // area available for the glyph (fraction of min dimension)
  g.fitScale = { none: 1, square: 1, rounded: 0.96, circle: 0.84, diamond: 0.7, contour: 1 }[shape] ?? 1;
  return g;
}

/** Path data (px) of the frame outline. */
export function framePathData(g) {
  const { shape, x0, y0, x1, y1, cx, cy, r, radius } = g;
  switch (shape) {
    case 'square': return `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
    case 'rounded': {
      const k = radius;
      return `M${x0 + k} ${y0}H${x1 - k}Q${x1} ${y0} ${x1} ${y0 + k}V${y1 - k}Q${x1} ${y1} ${x1 - k} ${y1}H${x0 + k}Q${x0} ${y1} ${x0} ${y1 - k}V${y0 + k}Q${x0} ${y0} ${x0 + k} ${y0}Z`;
    }
    case 'circle': return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    case 'diamond': return `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`;
    default: return '';
  }
}

function fillFrameInterior(c, g, inset, glyph) {
  // draws (in px space) the region where ornament may live
  const { shape, cx, cy } = g;
  c.beginPath();
  if (shape === 'square' || shape === 'none') {
    c.rect(g.x0 + inset, g.y0 + inset, g.x1 - g.x0 - 2 * inset, g.y1 - g.y0 - 2 * inset);
  } else if (shape === 'rounded') {
    const k = Math.max(0, g.radius - inset);
    const x0 = g.x0 + inset, y0 = g.y0 + inset, x1 = g.x1 - inset, y1 = g.y1 - inset;
    c.moveTo(x0 + k, y0); c.lineTo(x1 - k, y0); c.quadraticCurveTo(x1, y0, x1, y0 + k);
    c.lineTo(x1, y1 - k); c.quadraticCurveTo(x1, y1, x1 - k, y1); c.lineTo(x0 + k, y1);
    c.quadraticCurveTo(x0, y1, x0, y1 - k); c.lineTo(x0, y0 + k); c.quadraticCurveTo(x0, y0, x0 + k, y0);
  } else if (shape === 'circle') {
    c.arc(cx, cy, Math.max(1, g.r - inset), 0, Math.PI * 2);
  } else if (shape === 'diamond') {
    const r = Math.max(1, g.r - inset * Math.SQRT2);
    c.moveTo(cx, cy - r); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r, cy);
  } else if (shape === 'contour') {
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.lineWidth = Math.max(1, 2 * (g.contourOffset - inset));
    c.strokeStyle = '#fff'; c.fillStyle = '#fff';
    c.font = glyph.font;
    for (const ch of glyph.chars) { c.strokeText(ch.ch, glyph.x + ch.x, glyph.y); c.fillText(ch.ch, glyph.x + ch.x, glyph.y); }
    return;
  }
  c.closePath();
  c.fillStyle = '#fff';
  c.fill();
}

// --------------------------------------------------------- distance transform

const INF = 1e20;
function edt1d(f, d, v, z, n) {
  let k = 0;
  v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++; v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

/** Exact Euclidean distance (in cells) from each cell to the nearest cell with mask!=0. */
export function distanceTransform(mask, cols, rows) {
  const n = Math.max(cols, rows);
  const f = new Float64Array(n), d = new Float64Array(n), z = new Float64Array(n + 1);
  const v = new Int32Array(n);
  const out = new Float32Array(cols * rows);
  const tmp = new Float64Array(cols * rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) f[j] = mask[j * cols + i] ? 0 : INF;
    edt1d(f, d, v, z, rows);
    for (let j = 0; j < rows; j++) tmp[j * cols + i] = d[j];
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) f[i] = tmp[j * cols + i];
    edt1d(f, d, v, z, cols);
    for (let i = 0; i < cols; i++) out[j * cols + i] = Math.sqrt(d[i]);
  }
  return out;
}

// ------------------------------------------------------------------- field

/**
 * The shared scene the ornament modules work in. All distances are in cells.
 */
export class Field {
  constructor(o) { Object.assign(this, o); this.occ = new Uint16Array(this.cols * this.rows); }
  idx(i, j) { return j * this.cols + i; }
  inBounds(i, j) { return i >= 0 && j >= 0 && i < this.cols && j < this.rows; }
  /** cell free of letter, frame and previously placed ornament */
  isFree(i, j, ignore = 0) {
    if (i < 0 || j < 0 || i >= this.cols || j >= this.rows) return false;
    const k = j * this.cols + i;
    return this.obst[k] === 0 && (this.occ[k] === 0 || (ignore !== 0 && this.occ[k] === ignore));
  }
  freeAt(x, y) { return this.isFree(Math.floor(x), Math.floor(y)); }
  isInside(i, j) { return this.inBounds(i, j) && this.obst[this.idx(i, j)] === 0; }
  insideAt(x, y) { return this.isInside(Math.floor(x), Math.floor(y)); }
  sample(arr, x, y) {
    const i = clamp(Math.floor(x), 0, this.cols - 1), j = clamp(Math.floor(y), 0, this.rows - 1);
    return arr[j * this.cols + i];
  }
  distAt(x, y) { return this.sample(this.dist, x, y); }
  distLetterAt(x, y) { return this.sample(this.distLetter, x, y); }
  distFrameAt(x, y) { return this.sample(this.distFrame, x, y); }
  /** all cells within radius r of (x,y) free? */
  clear(x, y, r, ignore = 0) {
    const i0 = Math.floor(x - r), i1 = Math.floor(x + r), j0 = Math.floor(y - r), j1 = Math.floor(y + r);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const dx = i + 0.5 - x, dy = j + 0.5 - y;
      if (dx * dx + dy * dy <= r * r && !this.isFree(i, j, ignore)) return false;
    }
    return true;
  }
  /** free run length along a ray (in steps of 1 cell), up to len */
  ray(x, y, a, len) {
    const cx = Math.cos(a), sy = Math.sin(a);
    for (let s = 1; s <= len; s++) if (!this.freeAt(x + cx * s, y + sy * s)) return s - 1;
    return len;
  }
  markDisk(x, y, r, v = 1) {
    const i0 = Math.floor(x - r), i1 = Math.floor(x + r), j0 = Math.floor(y - r), j1 = Math.floor(y + r);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (!this.inBounds(i, j)) continue;
      const dx = i + 0.5 - x, dy = j + 0.5 - y;
      if (dx * dx + dy * dy <= r * r) this.occ[j * this.cols + i] = v;
    }
  }
  markPolygon(pts, pad = 0) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    for (let j = Math.floor(y0 - pad); j <= Math.floor(y1 + pad); j++) for (let i = Math.floor(x0 - pad); i <= Math.floor(x1 + pad); i++) {
      if (!this.inBounds(i, j)) continue;
      if (pointInPoly(i + 0.5, j + 0.5, pts, pad)) this.occ[j * this.cols + i] = 1;
    }
  }
  px(v) { return v * this.cell; }        // cells -> px
  toPx(p) { return { x: p.x * this.cell, y: p.y * this.cell }; }
  /** random free cell centre (cells) satisfying optional predicate, or null */
  randomFree(rng, pred, tries = 200) {
    for (let t = 0; t < tries; t++) {
      const x = rng() * this.cols, y = rng() * this.rows;
      if (this.freeAt(x, y) && (!pred || pred(x, y))) return { x, y };
    }
    return null;
  }
  freeCount() { let n = 0; for (let k = 0; k < this.obst.length; k++) if (!this.obst[k] && !this.occ[k]) n++; return n; }
}

function pointInPoly(x, y, pts, pad) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  if (inside || !pad) return inside;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    if (distToSeg(x, y, pts[i], pts[j]) <= pad) return true;
  }
  return false;
}
function distToSeg(px, py, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = clamp(((px - a.x) * dx + (py - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(px - (a.x + dx * t), py - (a.y + dy * t));
}

// --------------------------------------------------------------- rasterize

/**
 * Builds the Field for a piece of text inside a frame.
 * @param {object} o  { text, style, W, H, size, frame: geometry, letterGap (px),
 *                      outlineWidth (px), tracking (em), cellPx, fontScale }
 */
export function rasterize(o) {
  const style = GLYPH_STYLES[o.style] || GLYPH_STYLES.roman;
  const cellPx = o.cellPx ?? Math.max(1, o.size / 128);
  const cols = Math.round(o.W / cellPx), rows = Math.round(o.H / cellPx);
  const cell = o.W / cols;
  const cv = getCanvas();
  cv.width = cols; cv.height = rows;
  const c = cv.getContext('2d', { willReadFrequently: true });
  const g = o.frame;
  const text = o.text || 'A';
  const tracking = o.tracking ?? (text.length > 1 ? 0.08 : 0);

  // --- fit glyph: measure at a probe size then scale into the available box
  const probe = 100;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.font = fontString(o.style, probe);
  const m0 = measureChars(c, text, probe, tracking);
  const inset = g.inset + (o.letterGap || 0) + (o.outlineWidth || 0);
  const availW = (g.x1 - g.x0 - 2 * inset) * g.fitScale, availH = (g.y1 - g.y0 - 2 * inset) * g.fitScale;
  const fit = (o.fontScale ?? 1) * style.fit * (g.shape === 'none' || g.shape === 'contour' ? 1.15 : 1);
  const targetW = availW * (text.length > 1 ? 0.96 : fit), targetH = availH * fit;
  const scale = Math.min(targetW / m0.width, targetH / m0.height);
  const fontSize = Math.max(4, probe * scale);
  c.font = fontString(o.style, fontSize);
  const m = measureChars(c, text, fontSize, tracking);
  // centre bbox in frame
  const gx = g.cx - (m.left + m.width / 2);
  const gy = g.cy - (m.top + m.height / 2);
  const glyph = {
    text, style: o.style, family: style.family, weight: style.weight, fontSize, tracking,
    font: c.font, x: gx, y: gy, chars: m.chars,
    bbox: { x: gx + m.left, y: gy + m.top, w: m.width, h: m.height },
  };
  if (g.shape === 'contour') g.contourOffset = o.contourOffset ?? Math.max(6, o.size * 0.16);

  const read = () => {
    const d = c.getImageData(0, 0, cols, rows).data;
    const out = new Uint8Array(cols * rows);
    for (let k = 0; k < out.length; k++) out[k] = d[k * 4] > 127 ? 1 : 0;
    return out;
  };
  const drawText = (strokeW) => {
    c.font = glyph.font; c.fillStyle = '#fff'; c.strokeStyle = '#fff';
    c.lineJoin = 'round'; c.lineCap = 'round';
    for (const ch of glyph.chars) {
      if (strokeW > 0) { c.lineWidth = strokeW * 2; c.strokeText(ch.ch, glyph.x + ch.x, glyph.y); }
      c.fillText(ch.ch, glyph.x + ch.x, glyph.y);
    }
  };
  const begin = () => {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000'; c.fillRect(0, 0, cols, rows);
    c.setTransform(1 / cell, 0, 0, 1 / cell, 0, 0);
  };

  // pass 1: frame interior
  begin(); fillFrameInterior(c, g, g.inset, glyph);
  const inside = read();
  // pass 2: letter + outline + gap (obstacle for ornament)
  begin(); drawText((o.letterGap || 0) + (o.outlineWidth || 0));
  const letter = read();
  // pass 3: letter interior (for pattern / stipple fills)
  begin(); drawText(0);
  const inner = read();

  const obst = new Uint8Array(cols * rows);
  const outside = new Uint8Array(cols * rows);
  for (let k = 0; k < obst.length; k++) { outside[k] = inside[k] ? 0 : 1; obst[k] = outside[k] | letter[k]; }
  const field = new Field({
    cols, rows, cell, W: o.W, H: o.H, size: o.size, glyph, frame: g,
    obst, letter, inner, outside,
    dist: distanceTransform(obst, cols, rows),
    distLetter: distanceTransform(letter, cols, rows),
    distFrame: distanceTransform(outside, cols, rows),
  });
  // distance from interior cells to the glyph edge (for stipple/hatch fills)
  const notInner = new Uint8Array(cols * rows);
  for (let k = 0; k < notInner.length; k++) notInner[k] = inner[k] ? 0 : 1;
  field.distInner = distanceTransform(notInner, cols, rows);
  return field;
}
