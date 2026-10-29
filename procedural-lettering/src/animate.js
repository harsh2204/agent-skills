// Choreography: turns the normalised {kind, t0, dur} on each element into CSS
// animations. One stylesheet is injected per document; reduced motion shows
// the final state because the natural (non-animated) styles ARE the final state.

const STYLE_ID = 'procedural-lettering-style';
export function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
.pl-svg{display:block;overflow:visible}
.pl-svg text{user-select:text;pointer-events:none}
.pl-svg .pl-ornament *{pointer-events:none}
@keyframes pl-draw{from{stroke-dashoffset:var(--pl-len)}to{stroke-dashoffset:0}}
@keyframes pl-pop{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes pl-fade{from{opacity:0}to{opacity:1}}
@keyframes pl-reveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes pl-letter{from{opacity:0;transform:translateY(2%)}to{opacity:1;transform:none}}
.pl-svg .pl-draw{stroke-dasharray:var(--pl-len);stroke-dashoffset:0;animation:pl-draw var(--pl-dur) linear var(--pl-t0) both}
.pl-svg .pl-pop{transform-box:view-box;animation:pl-pop var(--pl-dur) cubic-bezier(.2,.9,.3,1.25) var(--pl-t0) both}
.pl-svg .pl-fade{animation:pl-fade var(--pl-dur) ease-out var(--pl-t0) both}
.pl-svg .pl-reveal{animation:pl-reveal var(--pl-dur) cubic-bezier(.6,0,.2,1) var(--pl-t0) both}
.pl-svg .pl-letter-in{transform-box:fill-box;transform-origin:center;animation:pl-letter 600ms ease-out both}
@media (prefers-reduced-motion:reduce){.pl-svg *{animation:none!important}}
`;
  document.head.appendChild(s);
}

/**
 * Apply animation classes/vars to created nodes.
 * @param nodes [{node, data}] where data has anim {kind,t0,dur}, len, cx, cy
 * @param mode 'auto'|'draw'|'pop'|'fade'|'ripple'|'reveal'|'none'
 */
export function choreograph(nodes, mode, duration, field) {
  if (mode === 'none' || !duration) return;
  const D = duration;
  if (mode === 'reveal') {
    for (const { node } of nodes) node.style.animation = 'none';
    return; // the group itself gets the reveal class (see compose)
  }
  let maxDL = 1;
  if (mode === 'ripple') for (let k = 0; k < field.distLetter.length; k++) if (!field.obst[k]) maxDL = Math.max(maxDL, field.distLetter[k]);
  for (const { node, data } of nodes) {
    const a = data.anim || { kind: 'fade', t0: 0, dur: 0.3 };
    let kind = a.kind, t0 = a.t0 ?? 0, dur = a.dur ?? 0.3;
    if (mode === 'pop') { kind = 'pop'; dur = 0.12; }
    else if (mode === 'fade') { kind = 'fade'; dur = 0.2; }
    else if (mode === 'draw') { kind = data.len ? 'draw' : 'pop'; }
    else if (mode === 'ripple') {
      const cx = data.cx ?? 0, cy = data.cy ?? 0;
      const dl = field.sample(field.distLetter, cx / field.cell, cy / field.cell);
      t0 = 0.05 + 0.75 * Math.min(1, dl / maxDL);
      kind = data.len && a.kind === 'draw' ? 'draw' : (data.cx != null ? 'pop' : 'fade');
      dur = kind === 'draw' ? 0.25 : 0.15;
    }
    if (kind === 'draw' && !data.len) kind = 'fade';
    const ms0 = Math.round(t0 * D * 0.9), msD = Math.max(60, Math.round(dur * D * 0.9));
    node.style.setProperty('--pl-t0', ms0 + 'ms');
    node.style.setProperty('--pl-dur', (kind === 'pop' ? Math.max(260, msD) : msD) + 'ms');
    if (kind === 'draw') { node.style.setProperty('--pl-len', data.len.toFixed(1)); node.classList.add('pl-draw'); }
    else if (kind === 'pop') {
      node.style.transformOrigin = `${(data.cx ?? 0).toFixed(1)}px ${(data.cy ?? 0).toFixed(1)}px`;
      node.classList.add('pl-pop');
    } else node.classList.add('pl-fade');
  }
}
