// Botanical space colonization (Runions et al.): attraction points scattered
// in the negative space pull a tree out of seeds on the frame edge. Branch
// width follows subtree size; chains draw on root-first.

import { poisson, f2 } from '../geom.js';
import { edgeSeeds } from './turtle.js';

export const colonization = {
  name: 'colonization', animates: 'draw',
  defaults: { density: 1, roots: 5, influence: 14, kill: 1.7, step: 1.1, maxWidth: 3.2, leaves: true },
  run(field, env) {
    const { rng, params } = env;
    const cell = field.cell;
    const attr = poisson(field.cols, field.rows, 2.2 / Math.sqrt(params.density), rng, (x, y) => field.freeAt(x, y) && field.distAt(x, y) > 1.2);
    const roots = edgeSeeds(field, rng, params.roots, { minClear: 2 });
    if (!roots.length || attr.length < 4) return [];
    const nodes = roots.map((r) => ({ x: r.x, y: r.y, parent: -1, depth: 0, children: 0 }));
    const alive = new Uint8Array(attr.length).fill(1);
    const stuck = {};
    const inf2 = params.influence ** 2, kill2 = params.kill ** 2;
    for (let iter = 0; iter < 260 && nodes.length < 1400; iter++) {
      const acc = new Map();
      let any = false;
      for (let a = 0; a < attr.length; a++) {
        if (!alive[a]) continue;
        let best = -1, bd = inf2;
        for (let n = 0; n < nodes.length; n++) {
          const d = (nodes[n].x - attr[a].x) ** 2 + (nodes[n].y - attr[a].y) ** 2;
          if (d < bd) { bd = d; best = n; }
        }
        if (best < 0) continue;
        any = true;
        const dx = attr[a].x - nodes[best].x, dy = attr[a].y - nodes[best].y, l = Math.hypot(dx, dy) || 1;
        const v = acc.get(best) || { x: 0, y: 0, n: 0 };
        v.x += dx / l; v.y += dy / l; v.n++;
        acc.set(best, v);
      }
      if (!any) break;
      for (const [n, v] of acc) {
        const l = Math.hypot(v.x, v.y);
        if (l < 1e-3) continue;
        // step toward the attractors; if that is blocked, try to slide around; if
        // still blocked the node is stuck, so its attractors are retired
        const a0 = Math.atan2(v.y, v.x);
        let grown = false;
        for (const da of [0, 0.6, -0.6, 1.2, -1.2]) {
          const nx = nodes[n].x + Math.cos(a0 + da) * params.step, ny = nodes[n].y + Math.sin(a0 + da) * params.step;
          if (!field.isInside(Math.floor(nx), Math.floor(ny)) || field.distAt(nx, ny) < 1.2) continue;
          nodes.push({ x: nx, y: ny, parent: n, depth: nodes[n].depth + 1, children: 0 });
          nodes[n].children++;
          grown = true;
          break;
        }
        if (!grown) { stuck[n] = (stuck[n] || 0) + 1; if (stuck[n] > 2) v.retire = true; }
      }
      for (const [n, v] of acc) if (v.retire) {
        for (let a = 0; a < attr.length; a++) if (alive[a] && (nodes[n].x - attr[a].x) ** 2 + (nodes[n].y - attr[a].y) ** 2 < inf2) {
          // only retire attractors whose nearest node is this stuck one
          let best = -1, bd = inf2;
          for (let m = 0; m < nodes.length; m++) { const d = (nodes[m].x - attr[a].x) ** 2 + (nodes[m].y - attr[a].y) ** 2; if (d < bd) { bd = d; best = m; } }
          if (best === n) alive[a] = 0;
        }
      }
      for (let a = 0; a < attr.length; a++) {
        if (!alive[a]) continue;
        for (let n = nodes.length - 1; n >= 0 && n > nodes.length - 400; n--) {
          if ((nodes[n].x - attr[a].x) ** 2 + (nodes[n].y - attr[a].y) ** 2 < kill2) { alive[a] = 0; break; }
        }
      }
    }
    // subtree sizes for width
    const size = new Float32Array(nodes.length).fill(1);
    for (let n = nodes.length - 1; n > 0; n--) size[nodes[n].parent] += size[n];
    const maxSize = Math.max(...roots.map((_, i) => size[i]));
    // chains: from each leaf up to a node that already belongs to a chain
    const claimed = new Uint8Array(nodes.length);
    const chains = [];
    const order = nodes.map((_, i) => i).sort((a, b) => size[b] - size[a]); // thick trunks first
    for (const leafIdx of order) {
      if (nodes[leafIdx].children > 0 && claimed[leafIdx]) continue;
      if (nodes[leafIdx].children > 0) continue;
      const pts = [];
      let n = leafIdx;
      while (n >= 0 && !claimed[n]) { pts.push(n); claimed[n] = 1; n = nodes[n].parent; }
      if (n >= 0) pts.push(n); // the attachment node
      pts.reverse();
      if (pts.length > 1) chains.push(pts);
    }
    let maxDepth = 1;
    for (const nd of nodes) maxDepth = Math.max(maxDepth, nd.depth);
    const els = [];
    for (const ch of chains) {
      const px = ch.map((n) => ({ x: nodes[n].x * cell, y: nodes[n].y * cell }));
      // width buckets along the chain
      const runs = Math.max(1, Math.min(4, Math.floor(ch.length / 5)));
      for (let r = 0; r < runs; r++) {
        const i0 = Math.floor((r * (ch.length - 1)) / runs), i1 = Math.floor(((r + 1) * (ch.length - 1)) / runs);
        const seg = px.slice(i0, i1 + 1);
        if (seg.length < 2) continue;
        const w = env.strokePx * (0.8 + (params.maxWidth - 0.8) * Math.sqrt(size[ch[i0]] / maxSize));
        let d = `M${f2(seg[0].x)} ${f2(seg[0].y)}`, len = 0;
        for (let k = 1; k < seg.length; k++) { d += `L${f2(seg[k].x)} ${f2(seg[k].y)}`; len += Math.hypot(seg[k].x - seg[k - 1].x, seg[k].y - seg[k - 1].y); }
        els.push({ tag: 'path', attrs: { d, fill: 'none', stroke: env.fg, 'stroke-width': f2(w), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, len: len * 1.02, cx: seg[0].x, cy: seg[0].y, anim: { kind: 'draw', t0: nodes[ch[i0]].depth / maxDepth * 0.85, dur: (nodes[ch[i1]].depth - nodes[ch[i0]].depth) / maxDepth * 0.85 } });
      }
      if (params.leaves) {
        const tip = nodes[ch[ch.length - 1]];
        if (tip.children === 0 && rng() < 0.6 && field.clear(tip.x, tip.y, 1.4)) {
          const P = { x: tip.x * cell, y: tip.y * cell };
          els.push({ tag: 'circle', attrs: { cx: f2(P.x), cy: f2(P.y), r: f2(cell * 0.65), fill: env.accent || env.fg }, cx: P.x, cy: P.y, anim: { kind: 'pop', t0: tip.depth / maxDepth * 0.85, dur: 0.1 } });
        }
      }
    }
    for (const nd of nodes) field.markDisk(nd.x, nd.y, 1.2);
    return els;
  },
};
