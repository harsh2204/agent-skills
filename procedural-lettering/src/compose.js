// Assembles everything into one <svg>: frame, ornament (aria-hidden, masked
// to the negative space), letter, textures and choreography.

import { mulberry32, seedFrom, makeRandom } from './rng.js';
import { makeNoise, f2 } from './geom.js';
import { rasterize, frameGeometry, framePathData, GLYPH_STYLES, FRAME_SHAPES } from './raster.js';
import { resolvePalette } from './palettes.js';
import { el, fromElement, nextId } from './svg.js';
import { buildLetter, outlineWidth, textNode } from './letter.js';
import { MODULES } from './modules/index.js';
import { ensureStyles, choreograph } from './animate.js';
import { grainFilter, inkSpreadFilter } from './texture.js';

export const DEFAULTS = {
  text: 'A', style: 'blackletter', fill: 'solid', outline: 'none',
  frame: 'square', ornament: 'vines', palette: 'vermilion',
  seed: 1, size: 160, animate: true, duration: 2500, texture: [], gap: null,
};

const FRAME_STYLES = ['solid', 'stroked', 'borderless'];
export function normalizeFrame(frame) {
  if (!frame) return { shape: 'none', style: 'borderless' };
  let f = typeof frame === 'string'
    ? (FRAME_STYLES.includes(frame) ? { shape: 'square', style: frame } : { shape: frame, style: 'solid' })
    : { style: 'solid', ...frame };
  if (f.shape === 'none') f.style = 'borderless';
  if (!FRAME_SHAPES.includes(f.shape)) f.shape = 'square';
  return f;
}

export function normalizeOrnament(orn) {
  if (!orn || orn === 'none') return [];
  const list = Array.isArray(orn) ? orn : [orn];
  return list.filter(Boolean).map((o) => (typeof o === 'string' ? { name: o, params: {} } : { name: o.name, params: o.params || o }));
}

/**
 * Core renderer. Returns an <svg> with .seed, .options, .replay(), .regenerate().
 */
export function render(userOpts) {
  ensureStyles();
  const o = { ...DEFAULTS, ...userOpts };
  const size = o.size;
  const text = String(o.text ?? o.letter ?? 'A');
  const seed = o.seed ?? 1;
  const rng = mulberry32(seedFrom(seed, text));
  const R = makeRandom(rng);
  const pal = resolvePalette(o.palette);
  const frame = normalizeFrame(o.frame);
  if (o.letterColor) pal.letter = o.letterColor;

  // --- geometry
  const W = o.width ?? size, H = o.height ?? size;
  const g = frameGeometry(frame.shape, W, H, size, { lineWidth: frame.lineWidth, pad: frame.pad });
  const ow = outlineWidth(o.outline, size, o.outlineOptions);
  const gap = o.gap ?? size * 0.03;
  const field = rasterize({
    text, style: o.style, W, H, size, frame: g, letterGap: gap, outlineWidth: ow,
    tracking: o.tracking, fontScale: o.fontScale, contourOffset: frame.offset,
  });

  // --- ornament layers
  const layers = normalizeOrnament(o.ornament);
  const env = {
    rng, R, palette: pal, size, cell: field.cell, noise: makeNoise(rng),
    strokePx: Math.max(0.7, size * 0.0065), fg: o.ornamentColor || pal.ornament, bg: pal.paper, accent: pal.accent, accent2: pal.accent2,
  };
  const elements = [];
  for (const layer of layers) {
    const mod = MODULES[layer.name];
    if (!mod) { console.warn(`procedural-lettering: unknown ornament "${layer.name}"`); continue; }
    const params = { ...mod.defaults, ...layer.params };
    const els = mod.run(field, { ...env, params, fg: layer.params.color || env.fg });
    for (const e of els) elements.push(e);
  }
  const cap = o.maxPaths ?? 3000;
  if (elements.length > cap) elements.length = cap;

  // --- svg skeleton
  const svg = el('svg', {
    class: 'pl-svg', viewBox: `0 0 ${f2(W)} ${f2(H)}`, width: f2(W), height: f2(H),
    xmlns: 'http://www.w3.org/2000/svg', role: 'img', 'aria-label': text,
  });
  const defs = el('defs');
  svg.appendChild(defs);
  const root = el('g', { class: 'pl-root' });
  svg.appendChild(root);

  // frame
  const frameG = el('g', { class: 'pl-frame', 'aria-hidden': 'true' });
  root.appendChild(frameG);
  const fd = frame.shape === 'contour' ? null : framePathData(g);
  const frameFill = frame.fill || pal.frame;
  const frameStroke = frame.stroke || pal.frameStroke;
  const misreg = o.texture.includes('misregister') ? (o.misregister || { dx: size * 0.014, dy: size * 0.01 }) : null;
  if (frame.shape !== 'none') {
    const styleAttrs = frame.style === 'solid'
      ? { fill: frameFill === 'none' ? pal.page : frameFill, stroke: frame.style === 'solid' && frameFill !== frameStroke ? frameStroke : 'none', 'stroke-width': f2(g.lw) }
      : frame.style === 'stroked'
        ? { fill: frame.fill || pal.paper === pal.page ? 'none' : pal.paper, stroke: frameStroke, 'stroke-width': f2(frame.lineWidth ?? g.lw) }
        : { fill: 'none', stroke: 'none' };
    if (frame.shape === 'contour') {
      const off = g.contourOffset;
      if (misreg && frame.style === 'solid') frameG.appendChild(textNode(field.glyph, { fill: pal.accent2, stroke: pal.accent2, 'stroke-width': f2(2 * off), 'stroke-linejoin': 'round', transform: `translate(${f2(-misreg.dx)} ${f2(misreg.dy)})`, style: 'mix-blend-mode:multiply' }));
      if (frame.style !== 'borderless') frameG.appendChild(textNode(field.glyph, { fill: frameStroke, stroke: frameStroke, 'stroke-width': f2(2 * off + 2 * g.lw), 'stroke-linejoin': 'round' }));
      frameG.appendChild(textNode(field.glyph, { fill: styleAttrs.fill === 'none' ? pal.page : styleAttrs.fill, stroke: styleAttrs.fill === 'none' ? pal.page : styleAttrs.fill, 'stroke-width': f2(2 * off), 'stroke-linejoin': 'round' }));
    } else {
      if (misreg && frame.style === 'solid') frameG.appendChild(el('path', { d: fd, fill: pal.accent2, transform: `translate(${f2(-misreg.dx)} ${f2(misreg.dy)})`, style: 'mix-blend-mode:multiply', opacity: 0.85 }));
      frameG.appendChild(el('path', { d: fd, ...styleAttrs, 'stroke-linejoin': 'miter' }));
      if (frame.inner || pal.inner) {
        // a hairline ruled just inside the frame edge (the ornament stays inside it)
        frameG.appendChild(el('path', { d: fd, fill: 'none', stroke: frame.inner || pal.inner, 'stroke-width': f2(Math.max(0.6, size * 0.005)), transform: insetTransform(g, g.lw / 2 + g.pad * 0.45) }));
      }
      if (frame.rim || pal.rim) {
        // a thin gold rim just inside the edge
        const rimId = nextId('rim');
        frameG.appendChild(el('path', { d: fd, fill: 'none', stroke: frame.rim || pal.rim, 'stroke-width': f2(Math.max(1, size * 0.012)), id: rimId }));
        frameG.appendChild(el('path', { d: fd, fill: 'none', stroke: frameFill === 'none' ? pal.page : frameFill, 'stroke-width': f2(Math.max(0.6, size * 0.005)), transform: `translate(${g.cx} ${g.cy}) scale(${f2(1 - size * 0.02 / g.r)}) translate(${-g.cx} ${-g.cy})` }));
      }
    }
  }

  // ornament, masked to the negative space (frame interior minus dilated letter)
  const maskId = nextId('mask');
  const maskG = el('mask', { id: maskId, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H });
  maskG.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: '#000' }));
  if (frame.shape === 'contour') {
    maskG.appendChild(textNode(field.glyph, { fill: '#fff', stroke: '#fff', 'stroke-width': f2(2 * (g.contourOffset - g.inset)), 'stroke-linejoin': 'round' }));
  } else if (frame.shape === 'none') {
    maskG.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff' }));
  } else {
    maskG.appendChild(el('path', { d: fd, fill: '#fff', transform: insetTransform(g, g.inset) }));
  }
  if (o.maskLetter !== false) {
    maskG.appendChild(textNode(field.glyph, { fill: '#000', stroke: '#000', 'stroke-width': f2(2 * (gap * 0.6 + ow)), 'stroke-linejoin': 'round' }));
  }
  defs.appendChild(maskG);
  const ornG = el('g', { class: 'pl-ornament', 'aria-hidden': 'true', mask: `url(#${maskId})` });
  root.appendChild(ornG);
  const nodes = [];
  for (const e of elements) {
    const n = fromElement(e);
    ornG.appendChild(n);
    nodes.push({ node: n, data: e });
  }

  // letter
  const letter = buildLetter(field, {
    palette: pal, rng, fill: o.fill, outline: o.outline, fillOptions: o.fillOptions, outlineOptions: o.outlineOptions,
    misregister: misreg ? { dx: misreg.dx, dy: misreg.dy, color: o.misregister?.color || pal.accent2 } : null,
    renderPattern: (innerField, fo) => renderPattern(innerField, fo, env, o),
  });
  for (const d of letter.defs) defs.appendChild(d);
  root.appendChild(letter.group);

  // textures
  if (o.texture.includes('inkspread')) {
    const id = nextId('ink');
    defs.appendChild(inkSpreadFilter(id, { radius: Math.max(0.3, size * 0.003), blur: Math.max(0.4, size * 0.004), seed: seedFrom(seed) % 100 }));
    ornG.setAttribute('filter', `url(#${id})`);
    letter.group.setAttribute('filter', `url(#${id})`);
  }
  if (o.texture.includes('grain')) {
    const id = nextId('grain');
    defs.appendChild(grainFilter(id, { seed: seedFrom(seed) % 100, amount: o.grain ?? 0.22 }));
    root.setAttribute('filter', `url(#${id})`);
  }

  // choreography
  const mode = o.animate === false ? 'none' : o.animate === true ? 'auto' : String(o.animate);
  choreograph(nodes, mode, o.duration, field);
  if (mode === 'reveal') { ornG.classList.add('pl-reveal'); ornG.style.setProperty('--pl-dur', o.duration * 0.8 + 'ms'); ornG.style.setProperty('--pl-t0', '0ms'); }
  if (mode !== 'none' && o.letterIn !== false) letter.group.classList.add('pl-letter-in');

  // api
  svg.seed = seed;
  svg.options = { ...o, text };
  svg.palette = pal;
  svg.field = field;
  svg.replay = () => {
    for (const sel of ['.pl-ornament', '.pl-letter']) { const g = svg.querySelector(sel); if (g) g.replaceWith(g.cloneNode(true)); }
    return svg;
  };
  svg.regenerate = (patch = {}) => { const n = render({ ...svg.options, ...patch }); svg.replaceWith(n); return n; };
  svg.morphTo = (newSeed, ms = 900) => morph(svg, newSeed, ms);
  return svg;
}

function insetTransform(g, inset) {
  if (g.shape === 'diamond') { const s = (g.r - inset * Math.SQRT2) / g.r; return `translate(${g.cx} ${g.cy}) scale(${f2(s)}) translate(${-g.cx} ${-g.cy})`; }
  const sx = (g.x1 - g.x0 - 2 * inset) / (g.x1 - g.x0), sy = (g.y1 - g.y0 - 2 * inset) / (g.y1 - g.y0);
  return `translate(${g.cx} ${g.cy}) scale(${f2(sx)} ${f2(sy)}) translate(${-g.cx} ${-g.cy})`;
}

/** Ornament inside the glyph: runs a module on the interior field at a finer scale. */
function renderPattern(innerField, fo, env, o) {
  const name = fo.module || o.fillPattern || 'florets';
  const mod = MODULES[name] || MODULES.florets;
  const params = { ...mod.defaults, ...(fo.params || {}) };
  const sub = { ...env, params, fg: fo.color || env.palette.letterStroke || env.palette.ornament, bg: fo.base || env.palette.letter, strokePx: env.strokePx * (fo.strokeScale ?? 0.8) };
  const els = mod.run(innerField, sub);
  const g = el('g', { class: 'pl-pattern' });
  for (const e of els.slice(0, 1500)) g.appendChild(fromElement(e));
  return g;
}

/** Kinetic morph: cross-fades to a new seed while the new ornament draws on. */
function morph(svg, newSeed, ms) {
  const next = render({ ...svg.options, seed: newSeed, animate: svg.options.animate === false ? false : svg.options.animate, duration: ms * 2 });
  const old = svg.querySelector('.pl-ornament');
  const fresh = next.querySelector('.pl-ornament');
  old.classList.remove('pl-ornament');
  old.style.transition = `opacity ${ms * 0.6}ms ease`;
  old.style.opacity = '0';
  old.parentNode.insertBefore(fresh, old.nextSibling);
  svg.querySelector('defs').append(...next.querySelector('defs').childNodes);
  svg.querySelector('.pl-letter').replaceWith(next.querySelector('.pl-letter'));
  setTimeout(() => old.remove(), ms * 0.7);
  svg.seed = newSeed; svg.options.seed = newSeed;
  return svg;
}

export { GLYPH_STYLES };
