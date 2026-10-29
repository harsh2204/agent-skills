// Interlace / maze: a randomised depth-first maze over the negative space,
// drawn as its passages (a labyrinthine meander texture).

import { latticeOf } from './lattice.js';
import { f2, smoothPath, polyLength } from '../geom.js';

export const interlace = {
  name: 'interlace', animates: 'draw',
  defaults: { pitch: 3, stroke: 1.6, rounded: true, bias: 0.5, smooth: 0.6, inline: true },
  run(field, env) {
    const { rng, params } = env;
    const L = latticeOf(field, params.pitch);
    const visited = new Uint8Array(L.lc * L.lr);
    const els = [], inlines = [];
    const w = Math.max(1, L.m * field.cell * 0.34 * params.stroke);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let order = 0, total = 0;
    for (let k = 0; k < visited.length; k++) if (L.free[k]) total++;
    const starts = [];
    for (let j = 0; j < L.lr; j++) for (let i = 0; i < L.lc; i++) if (L.isFree(i, j)) starts.push([i, j]);
    for (let s = starts.length - 1; s > 0; s--) { const t = Math.floor(rng() * (s + 1)); [starts[s], starts[t]] = [starts[t], starts[s]]; }
    for (const [si, sj] of starts) {
      if (visited[sj * L.lc + si]) continue;
      // iterative DFS; emit each straight-ish run as a path
      const stack = [[si, sj, null]];
      visited[sj * L.lc + si] = 1;
      let chain = [L.centre(si, sj)], chainT0 = order / total;
      const flush = () => {
        if (chain.length > 1) {
          // corridors are smoothed into a meander; the hard-angled maze is one setting away
          const d = params.smooth > 0 ? smoothPath(chain, 1, params.smooth) : chain.map((c, i) => (i ? 'L' : 'M') + f2(c.x) + ' ' + f2(c.y)).join('');
          const len = polyLength(chain);
          const anim = { kind: 'draw', t0: chainT0 * 0.8, dur: Math.min(0.3, len / (field.W * 2)) };
          els.push({ tag: 'path', attrs: { d, stroke: env.fg, 'stroke-width': f2(w), fill: 'none', 'stroke-linecap': params.rounded ? 'round' : 'square', 'stroke-linejoin': params.rounded ? 'round' : 'miter' }, len: len * 1.02, cx: chain[0].x, cy: chain[0].y, anim });
          if (params.inline && env.accent && env.accent !== env.fg) inlines.push({ tag: 'path', attrs: { d, stroke: env.accent, 'stroke-width': f2(Math.max(0.5, w * 0.3)), fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, len: len * 1.02, cx: chain[0].x, cy: chain[0].y, anim: { ...anim, t0: Math.min(0.95, anim.t0 + 0.05) } });
        }
        chain = [];
      };
      let lastDir = null;
      while (stack.length) {
        const [i, j] = stack[stack.length - 1];
        const opts = [];
        for (const d of dirs) { const ni = i + d[0], nj = j + d[1]; if (L.isFree(ni, nj) && !visited[nj * L.lc + ni]) opts.push(d); }
        if (!opts.length) { stack.pop(); flush(); if (stack.length) { const [bi, bj] = stack[stack.length - 1]; chain = [L.centre(bi, bj)]; chainT0 = order / total; lastDir = null; } continue; }
        // prefer continuing straight for longer corridors
        let d = opts[Math.floor(rng() * opts.length)];
        if (lastDir && rng() < params.bias) { const st = opts.find((o) => o[0] === lastDir[0] && o[1] === lastDir[1]); if (st) d = st; }
        const ni = i + d[0], nj = j + d[1];
        visited[nj * L.lc + ni] = 1; order++;
        lastDir = d;
        if (!chain.length) chain = [L.centre(i, j)];
        chain.push(L.centre(ni, nj));
        stack.push([ni, nj]);
      }
      flush();
    }
    for (let j = 0; j < L.lr; j++) for (let i = 0; i < L.lc; i++) if (L.isFree(i, j)) L.mark(i, j);
    return els.concat(inlines);
  },
};
