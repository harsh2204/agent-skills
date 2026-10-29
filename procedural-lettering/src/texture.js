// Print textures as SVG filters: paper grain, ink spread. (Misregistration is
// a second offset ink copy, built in compose/letter.)
import { el } from './svg.js';

export function grainFilter(id, opts = {}) {
  const amount = opts.amount ?? 0.18;
  return el('filter', { id, x: '0', y: '0', width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' }, [
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: opts.frequency ?? 0.9, numOctaves: 2, seed: opts.seed ?? 3, result: 'noise' }),
    el('feColorMatrix', { in: 'noise', type: 'matrix', values: `0 0 0 0 ${1 - amount}  0 0 0 0 ${1 - amount}  0 0 0 0 ${1 - amount}  ${amount * 0.8} ${amount * 0.8} ${amount * 0.8} 0 ${1 - amount * 0.8}`, result: 'grain' }),
    el('feBlend', { in: 'SourceGraphic', in2: 'grain', mode: 'multiply', result: 'blend' }),
    el('feComposite', { in: 'blend', in2: 'SourceGraphic', operator: 'in' }),
  ]);
}

export function inkSpreadFilter(id, opts = {}) {
  const r = opts.radius ?? 0.5;
  return el('filter', { id, x: '-5%', y: '-5%', width: '110%', height: '110%', 'color-interpolation-filters': 'sRGB' }, [
    el('feMorphology', { operator: 'dilate', radius: r, result: 'fat' }),
    el('feGaussianBlur', { in: 'fat', stdDeviation: opts.blur ?? 0.7, result: 'soft' }),
    el('feComponentTransfer', { in: 'soft', result: 'hard' }, [el('feFuncA', { type: 'linear', slope: 6, intercept: -1.8 })]),
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.6, numOctaves: 1, seed: opts.seed ?? 7, result: 'n' }),
    el('feDisplacementMap', { in: 'hard', in2: 'n', scale: opts.wobble ?? 1.2, xChannelSelector: 'R', yChannelSelector: 'G' }),
  ]);
}
