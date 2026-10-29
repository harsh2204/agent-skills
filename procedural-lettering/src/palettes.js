// Palettes are plain objects; every colour role is optional and falls back.
// roles: page (section background), text (body text), frame (frame fill),
// frameStroke, rim (gold rim inside the edge), inner (hairline inside the edge), letter, letterStroke, ornament, accent, accent2, glass[]

export const PAGE_THEMES = {
  parchment: { page: '#F4F0E6', text: '#1d1a16', rule: '#c9bfae' },
  cream:     { page: '#FBF8EF', text: '#262219', rule: '#d8d0bf' },
  white:     { page: '#FFFFFF', text: '#111111', rule: '#dddddd' },
  mint:      { page: '#E8F1E6', text: '#1d3b2a', rule: '#b9cdb9' },
  pink:      { page: '#F3D9E6', text: '#2667A8', rule: '#d9b3c6' },
  lavender:  { page: '#EEE7F4', text: '#2d2340', rule: '#c9bcd8' },
  stone:     { page: '#E9E6DF', text: '#2a2a2a', rule: '#c6c2b8' },
  ink:       { page: '#15140f', text: '#e9e2cf', rule: '#3d3a2f' },
};

export const PALETTES = {
  // the classic: black square, white letter, white vines, vermilion accent
  vermilion: { theme: 'parchment', frame: '#111111', frameStroke: '#111111', inner: '#F4F0E6', letter: '#F4F0E6', ornament: '#F4F0E6', accent: '#D7301F', accent2: '#F4F0E6' },
  paper:     { theme: 'parchment', frame: '#F4F0E6', frameStroke: '#111111', letter: '#111111', ornament: '#111111', accent: '#D7301F', accent2: '#111111' },
  delft:     { theme: 'lavender', frame: '#FFFFFF', frameStroke: '#C9A24A', rim: '#C9A24A', letter: '#FFFFFF', letterStroke: '#2A4C9B', ornament: '#2A4C9B', accent: '#2A4C9B', accent2: '#6E8ED1' },
  rust:      { theme: 'cream', frame: 'none', letter: '#9A3B1F', ornament: '#9A3B1F', accent: '#C9633F', accent2: '#4a2a1d' },
  woodcut:   { theme: 'lavender', frame: '#F4F0E6', frameStroke: '#111111', letter: '#C8282C', letterStroke: '#F4F0E6', ornament: '#111111', accent: '#111111', accent2: '#F4F0E6' },
  marigold:  { theme: 'pink', frame: '#F2D23B', frameStroke: '#F2D23B', letter: '#9CC4E4', ornament: '#E8B61C', accent: '#5A9BD0', accent2: '#fff2a8' },
  sumi:      { theme: 'parchment', frame: 'none', letter: '#111111', letterStroke: '#F4F0E6', ornament: '#111111', accent: '#111111', accent2: '#F4F0E6' },
  cobalt:    { theme: 'white', frame: 'none', letter: '#2B57D6', letterStroke: '#FFFFFF', ornament: '#111111', accent: '#111111', accent2: '#FFFFFF' },
  ochre:     { theme: 'parchment', frame: '#C79A3A', frameStroke: '#C79A3A', letter: '#2E2416', letterStroke: '#E9C765', ornament: '#F6ECCF', accent: '#E9C765', accent2: '#7a5a1f' },
  stone:     { theme: 'parchment', frame: '#E4D6BC', frameStroke: '#E4D6BC', letter: '#5F5F5B', ornament: '#8a8780', accent: '#3b3b38', accent2: '#F4F0E6' },
  fuchsia:   { theme: 'pink', frame: 'none', letter: '#E0188C', ornament: '#F07AB8', accent: '#E0188C', accent2: '#2667A8' },
  byzantine: { theme: 'cream', frame: '#F4F0E6', frameStroke: '#2E2A6E', letter: '#2E2A6E', ornament: '#C9A24A', accent: '#A4262C', accent2: '#2E2A6E' },
  rainbow:   { theme: 'cream', frame: 'none', letter: '#E0188C', ornament: '#2667A8', accent: '#F2D23B', accent2: '#111111', rings: ['#E0188C', '#F2D23B', '#2BB673', '#2667A8', '#7B3FA0'] },
  carmine:   { theme: 'parchment', frame: 'none', frameStroke: '#B3262E', letter: '#B3262E', ornament: '#B3262E', accent: '#B3262E', accent2: '#F4F0E6' },
  oxblood:   { theme: 'stone', frame: '#5A1A1E', frameStroke: '#5A1A1E', letter: '#F4F0E6', ornament: '#F4F0E6', accent: '#D9A06A', accent2: '#2a0a0c' },
  copper:    { theme: 'ink', frame: '#1F2A1F', frameStroke: '#C98A3A', letter: '#F0E6C8', ornament: '#C98A3A', accent: '#E8C06A', accent2: '#1F2A1F' },
  glass:     { theme: 'stone', frame: '#2a2a2a', frameStroke: '#2a2a2a', letter: '#F4F0E6', letterStroke: '#2a2a2a', ornament: '#2a2a2a', accent: '#F2D23B', glass: ['#D7301F', '#2667A8', '#F2D23B', '#2BB673', '#7B3FA0', '#F28C28'] },
  moss:      { theme: 'mint', frame: '#F4F0E6', frameStroke: '#1d3b2a', letter: '#1d3b2a', ornament: '#2f6b45', accent: '#C8282C', accent2: '#F4F0E6' },
  nouveau:   { theme: 'cream', frame: '#F4F0E6', frameStroke: '#2b2a28', letter: '#2b2a28', ornament: '#2b2a28', accent: '#B98A2E', accent2: '#F4F0E6' },
};

export function resolvePalette(p) {
  const base = typeof p === 'string' ? (PALETTES[p] || PALETTES.vermilion) : (p || PALETTES.vermilion);
  const theme = PAGE_THEMES[base.theme] || PAGE_THEMES.parchment;
  const out = {
    name: typeof p === 'string' ? p : base.name || 'custom',
    page: theme.page, text: theme.text, rule: theme.rule,
    frame: '#111111', frameStroke: null, rim: null, inner: null,
    letter: '#F4F0E6', letterStroke: null,
    ornament: '#F4F0E6', accent: '#D7301F', accent2: null,
    ...base,
  };
  if (!out.frameStroke) out.frameStroke = out.frame === 'none' ? out.ornament : out.frame;
  if (!out.accent2) out.accent2 = out.ornament;
  // the "paper" colour behind the ornament: frame fill, or the page when frameless
  out.paper = out.frame === 'none' ? out.page : out.frame;
  return out;
}

export function listPalettes() { return Object.keys(PALETTES); }

// --- small colour utils (hex only; enough for jitter/mixing)
export function hexToRgb(h) {
  const s = h.replace('#', '');
  const v = s.length === 3 ? s.split('').map((c) => parseInt(c + c, 16)) : [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
  return v;
}
export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
}
export function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((x, i) => x + (B[i] - x) * t));
}
export function lighten(h, t) { return mix(h, '#ffffff', t); }
export function darken(h, t) { return mix(h, '#000000', t); }
export function luminance(h) { const [r, g, b] = hexToRgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }
