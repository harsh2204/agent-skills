// The letter layer: real <text> in the DOM, drawn with one of several fills
// and outlines. Fills that need geometry (stipple, hatch, pattern) run on the
// glyph interior mask and are clipped by the text itself.

import { el, nextId } from './svg.js';
import { f2 } from './geom.js';
import { Field, distanceTransform } from './raster.js';
import { lighten, darken } from './palettes.js';

export const LETTER_FILLS = ['solid', 'keyline', 'pattern', 'gradient', 'hatch', 'stipple'];
export const LETTER_OUTLINES = ['none', 'keyline', 'rainbow', 'badge', 'sticker', 'halo'];

/** Width (px) the outline adds beyond the glyph edge, used as extra obstacle. */
export function outlineWidth(outline, size, opts = {}) {
  switch (outline) {
    case 'keyline': return opts.width ?? size * 0.012;
    case 'rainbow': return (opts.rings ?? 4) * (opts.width ?? size * 0.02);
    case 'badge': return opts.radius ?? size * 0.12;
    case 'sticker': return opts.width ?? size * 0.045;
    case 'halo': return (opts.width ?? size * 0.04) * 0.8;
    default: return 0;
  }
}

/** Creates one <text> per character so SVG matches the canvas measurement. */
export function textNode(glyph, attrs = {}) {
  const g = el('g', attrs);
  for (const ch of glyph.chars) {
    const t = el('text', {
      x: f2(glyph.x + ch.x), y: f2(glyph.y), 'font-family': glyph.family, 'font-size': f2(glyph.fontSize),
      'font-weight': glyph.weight, 'xml:space': 'preserve',
    });
    t.textContent = ch.ch;
    g.appendChild(t);
  }
  return g;
}

/** <clipPath> whose children are the glyph's <text> nodes (a <g> is not allowed there). */
export function textClip(glyph, id) {
  const cp = el('clipPath', { id });
  for (const t of textNode(glyph).childNodes) cp.appendChild(t.cloneNode(true));
  return cp;
}

/** Build the letter group. Returns {group, defs:[...]}. */
export function buildLetter(field, o) {
  const { glyph, size } = field;
  const pal = o.palette, rng = o.rng;
  const defs = [];
  const group = el('g', { class: 'pl-letter' });
  const ink = o.letterColor ?? pal.letter;
  const strokeColor = pal.letterStroke || pal.paper;
  const paper = pal.paper;
  const outline = o.outline || 'none', fill = o.fill || 'solid';
  const oo = o.outlineOptions || {};
  const kw = Math.max(0.8, size * 0.012);

  // ---- outlines (drawn beneath the fill)
  const addHalo = (color, w) => {
    const id = nextId('halo');
    defs.push(el('filter', { id, x: '-30%', y: '-30%', width: '160%', height: '160%' }, [el('feGaussianBlur', { stdDeviation: f2(w * 0.45) })]));
    group.appendChild(textNode(glyph, { fill: color, stroke: color, 'stroke-width': f2(w * 1.2), 'stroke-linejoin': 'round', filter: `url(#${id})`, opacity: 0.95 }));
  };
  if (outline === 'halo') addHalo(oo.color || pal.accent, oo.width ?? size * 0.04);
  else if (oo.halo) addHalo(oo.haloColor || pal.accent, (oo.haloWidth ?? size * 0.05) + outlineWidth(outline, size, oo));
  if (outline === 'badge') group.appendChild(badgeDots(field, o, oo));
  if (outline === 'rainbow') {
    const rings = oo.rings ?? 4, w = oo.width ?? size * 0.02;
    const colors = oo.colors || pal.rings || [pal.accent, pal.ornament, pal.accent2, pal.letter];
    for (let i = rings - 1; i >= 0; i--) {
      group.appendChild(textNode(glyph, { fill: 'none', stroke: colors[i % colors.length], 'stroke-width': f2(2 * (i + 1) * w), 'stroke-linejoin': 'round' }));
    }
    group.appendChild(textNode(glyph, { fill: 'none', stroke: paper, 'stroke-width': f2(w * 0.9), 'stroke-linejoin': 'round' }));
  }
  if (outline === 'sticker') {
    const w = oo.width ?? size * 0.045;
    group.appendChild(textNode(glyph, { fill: 'none', stroke: oo.edge || pal.ornament, 'stroke-width': f2(2 * w + kw * 2), 'stroke-linejoin': 'round' }));
    group.appendChild(textNode(glyph, { fill: 'none', stroke: oo.color || paper, 'stroke-width': f2(2 * w), 'stroke-linejoin': 'round' }));
  }
  if (outline === 'keyline') {
    const w = oo.width ?? kw;
    group.appendChild(textNode(glyph, { fill: 'none', stroke: oo.color || strokeColor, 'stroke-width': f2(2 * w), 'stroke-linejoin': 'round' }));
  }
  if (outline === 'badge' || outline === 'halo') {
    // a paper keyline keeps the badge/halo off the letter
    group.appendChild(textNode(glyph, { fill: 'none', stroke: paper, 'stroke-width': f2(2 * kw * 1.5), 'stroke-linejoin': 'round' }));
  }

  // ---- misregistration ghost under the fill
  if (o.misregister) {
    const m = o.misregister;
    group.appendChild(textNode(glyph, {
      fill: m.color || pal.accent2 || pal.accent, transform: `translate(${f2(m.dx)} ${f2(m.dy)})`,
      style: 'mix-blend-mode:multiply', opacity: m.opacity ?? 0.9,
    }));
  }

  // ---- fills
  if (fill === 'solid') {
    group.appendChild(textNode(glyph, { fill: ink }));
  } else if (fill === 'keyline') {
    const fo = o.fillOptions || {};
    const w1 = fo.width ?? kw * 1.3;
    if (fo.inner) group.appendChild(textNode(glyph, { fill: fo.inner }));
    if (fo.double !== false) {
      // inline: an inner line parallel to the edge, made by clipping two strokes to the glyph
      const cid = nextId('clip');
      defs.push(textClip(glyph, cid));
      const g = el('g', { 'clip-path': `url(#${cid})`, fill: 'none', 'stroke-linejoin': 'round' });
      g.appendChild(textNode(glyph, { stroke: ink, 'stroke-width': f2(2 * kw * 3.2) }));
      g.appendChild(textNode(glyph, { stroke: fo.inner || paper, 'stroke-width': f2(2 * kw * 2.3) }));
      group.appendChild(g);
    }
    group.appendChild(textNode(glyph, { fill: 'none', stroke: ink, 'stroke-width': f2(w1), 'stroke-linejoin': 'round' }));
  } else if (fill === 'gradient') {
    const id = nextId('grad');
    const fo = o.fillOptions || {};
    const b = field.glyph.bbox;
    const vertical = fo.angle == null || fo.angle === 90;
    defs.push(el('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: f2(b.x), y1: f2(b.y), x2: f2(vertical ? b.x : b.x + b.w), y2: f2(vertical ? b.y + b.h : b.y) }, [
      el('stop', { offset: '0%', 'stop-color': fo.from || lighten(ink, 0.35) }),
      el('stop', { offset: '100%', 'stop-color': fo.to || darken(ink, 0.25) }),
    ]));
    group.appendChild(textNode(glyph, { fill: `url(#${id})` }));
  } else if (fill === 'hatch') {
    const fo = o.fillOptions || {};
    const cid = nextId('clip');
    defs.push(textClip(glyph, cid));
    const g = el('g', { 'clip-path': `url(#${cid})` });
    if (fo.base) g.appendChild(textNode(glyph, { fill: fo.base }));
    const ang = (fo.angle ?? 45) * Math.PI / 180, sp = fo.spacing ?? Math.max(1.8, size * 0.022);
    const b = glyph.bbox, cx = b.x + b.w / 2, cy = b.y + b.h / 2, R = Math.hypot(b.w, b.h) / 2 + 2;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    let d = '';
    for (let t = -R; t <= R; t += sp) {
      const px = cx + (-sa) * t, py = cy + ca * t;
      d += `M${f2(px - ca * R)} ${f2(py - sa * R)}L${f2(px + ca * R)} ${f2(py + sa * R)}`;
    }
    g.appendChild(el('path', { d, stroke: ink, 'stroke-width': f2(fo.width ?? Math.max(0.6, sp * 0.4)), fill: 'none' }));
    if (fo.cross) {
      let d2 = '';
      for (let t = -R; t <= R; t += sp) {
        const px = cx + ca * t, py = cy + sa * t;
        d2 += `M${f2(px + sa * R)} ${f2(py - ca * R)}L${f2(px - sa * R)} ${f2(py + ca * R)}`;
      }
      g.appendChild(el('path', { d: d2, stroke: ink, 'stroke-width': f2(fo.width ?? Math.max(0.6, sp * 0.4)), fill: 'none' }));
    }
    group.appendChild(g);
    group.appendChild(textNode(glyph, { fill: 'none', stroke: ink, 'stroke-width': f2(fo.edge ?? kw), 'stroke-linejoin': 'round' }));
  } else if (fill === 'stipple') {
    const fo = o.fillOptions || {};
    const cid = nextId('clip');
    defs.push(textClip(glyph, cid));
    const g = el('g', { 'clip-path': `url(#${cid})` });
    if (fo.base) g.appendChild(textNode(glyph, { fill: fo.base }));
    g.appendChild(o.renderPattern(innerField(field), { module: 'stipple', color: ink, params: { shade: 'frame', rMin: fo.rMin ?? 0.8, rMax: fo.rMax ?? 2.6, density: fo.density ?? 1, dot: fo.dot ?? 0.5 } }));
    group.appendChild(g);
    if (fo.edge !== false) group.appendChild(textNode(glyph, { fill: 'none', stroke: ink, 'stroke-width': f2(kw * 0.9), 'stroke-linejoin': 'round' }));
  } else if (fill === 'pattern') {
    const cid = nextId('clip');
    defs.push(textClip(glyph, cid));
    const g = el('g', { 'clip-path': `url(#${cid})` });
    const fo = o.fillOptions || {};
    g.appendChild(textNode(glyph, { fill: fo.base || ink }));
    const inner = o.renderPattern(innerField(field), fo);
    g.appendChild(inner);
    group.appendChild(g);
    if (fo.edge !== false) group.appendChild(textNode(glyph, { fill: 'none', stroke: fo.edgeColor || strokeColor, 'stroke-width': f2(fo.edgeWidth ?? kw * 1.2), 'stroke-linejoin': 'round' }));
  }
  return { group, defs };
}

/** A Field whose free region is the glyph interior. */
export function innerField(field) {
  const obst = new Uint8Array(field.inner.length);
  for (let k = 0; k < obst.length; k++) obst[k] = field.inner[k] ? 0 : 1;
  const f = new Field({
    cols: field.cols, rows: field.rows, cell: field.cell, W: field.W, H: field.H, size: field.size,
    glyph: field.glyph, frame: field.frame, obst, letter: obst, inner: field.inner, outside: obst,
    dist: field.distInner, distLetter: field.distInner, distFrame: field.distInner,
  });
  f.distInner = field.distInner;
  return f;
}

function badgeDots(field, o, oo) {
  // halftone dots on a hex lattice within radius R of the glyph, shrinking outward
  const { cell, size } = field;
  const R = (oo.radius ?? size * 0.12) / cell;
  const color = oo.color || o.palette.ornament;
  const step = Math.max(1.4, (oo.pitch ?? size * 0.02) / cell);
  const g = el('g', { fill: color });
  let n = 0;
  for (let j = 0, row = 0; j < field.rows; j += step * 0.866, row++) {
    for (let i = (row % 2) * step / 2; i < field.cols; i += step) {
      const d = field.sample(field.distLetter, i, j);
      if (d > R || field.sample(field.outside, i, j)) continue;
      const t = d / R;
      const r = step * 0.5 * (1 - t) ** (oo.gamma ?? 0.9) * (oo.scale ?? 1.05);
      if (r < 0.15) continue;
      g.appendChild(el('circle', { cx: f2(i * cell), cy: f2(j * cell), r: f2(r * cell) }));
      if (++n > 4000) return g;
    }
  }
  return g;
}
