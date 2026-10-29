// procedural-lettering — dependency-free generative ornamental lettering.
// Entry module. See SKILL.md for the workflow and styles.md for recipes.

import { render, normalizeFrame, normalizeOrnament, DEFAULTS } from './compose.js';
import { GLYPH_STYLES } from './raster.js';

export { mulberry32, seedFrom, hashString, makeRandom } from './rng.js';
export { PALETTES, PAGE_THEMES, resolvePalette, listPalettes } from './palettes.js';
export { MODULES, registerModule } from './modules/index.js';
export { LETTER_FILLS, LETTER_OUTLINES } from './letter.js';
export { FRAME_SHAPES } from './raster.js';
export { RECIPES, VIDEO_RECIPES, EXTRA_RECIPES, applyRecipe, randomLook } from './recipes.js';
export { GLYPH_STYLES, render, normalizeFrame, normalizeOrnament, DEFAULTS };

/**
 * createDropCap({ letter, style, fill, outline, frame, ornament, palette,
 *                 seed, size, animate, duration, texture, recipe })
 * -> <svg> element (square), with .seed, .replay(), .regenerate(patch), .morphTo(seed)
 */
export function createDropCap(opts = {}) {
  const o = { ...opts };
  if (o.recipe) Object.assign(o, applyRecipeOpts(o.recipe), opts);
  o.text = String(o.letter ?? o.text ?? 'A').slice(0, 1);
  delete o.width; delete o.height;
  return render(o);
}

/**
 * createHeadline({ text, ... }) -> wide <svg> whose ornament fills the space
 * around and between the letters.
 */
export function createHeadline(opts = {}) {
  const o = { frame: 'none', ...opts };
  if (o.recipe) Object.assign(o, applyRecipeOpts(o.recipe), opts);
  const text = String(o.text ?? 'Headline');
  const size = o.size ?? 160;
  const style = GLYPH_STYLES[o.style] || GLYPH_STYLES.roman;
  // rough width estimate: ~0.62em per char at the fitted size, plus tracking
  const fs = size * (o.fontScale ?? 1) * style.fit * 0.9;
  const tracking = o.tracking ?? 0.1;
  const estW = text.length * fs * (0.6 + tracking) + size * 0.5;
  return render({ ...o, text, size, width: Math.max(size, Math.round(estW)), height: Math.round(o.height ?? size * 1.05), fontScale: o.fontScale ?? 0.9 });
}

import { applyRecipe as _applyRecipe } from './recipes.js';
function applyRecipeOpts(name) { return _applyRecipe(name); }
