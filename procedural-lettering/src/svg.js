// Tiny SVG DOM helpers.
export const NS = 'http://www.w3.org/2000/svg';
let uid = 0;
export const nextId = (p = 'pl') => `${p}${(++uid).toString(36)}${Date.now().toString(36).slice(-3)}`;

export function el(tag, attrs = {}, children = []) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  for (const c of children) if (c) e.appendChild(c);
  return e;
}
export function fromElement(d) {
  const e = el(d.tag, d.attrs);
  if (d.text != null) e.textContent = d.text;
  return e;
}
