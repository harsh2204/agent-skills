// Named looks. Each recipe is just a bundle of axis settings; anything can be
// overridden per call. See styles.md for the mapping back to the references.

export const RECIPES = {
  delft: {
    title: 'Delft porcelain medallion', theme: 'lavender',
    options: { style: 'script', fill: 'pattern', fillOptions: { module: 'porcelain', base: '#ffffff', edgeWidth: 1.6, params: { density: 2.2, motifs: 0, gap: 1.1 } }, outline: 'none', frame: { shape: 'circle', style: 'solid', rim: '#C9A24A' }, ornament: 'porcelain', palette: 'delft', animate: 'pop' },
  },
  rust: {
    title: 'Rust wood-grain isolines', theme: 'cream',
    options: { style: 'roman', fill: 'solid', frame: 'none', ornament: 'contour', palette: 'rust', animate: 'ripple' },
  },
  sticker: {
    title: 'Pattern-filled blackletter, sticker outline', theme: 'parchment',
    options: { style: 'blackletter', fill: 'pattern', fillOptions: { module: 'florets', base: '#111111', color: '#F4F0E6', edge: false }, outline: 'sticker', frame: 'none', ornament: 'none', palette: 'sumi', animate: 'pop' },
  },
  woodcut: {
    title: 'Woodcut: hatch ground, engraved foliage, red roman with white keyline', theme: 'lavender',
    options: { style: 'roman', fill: 'solid', outline: 'keyline', frame: { shape: 'square', style: 'solid', lineWidth: 3 }, ornament: ['hatch', { name: 'vines', density: 1.1, leafStyle: 'engraved', stars: 0, dots: 0.3, stroke: 1.2, leaves: 1.4, halo: true, eyes: false }], palette: 'woodcut', animate: 'auto' },
  },
  marigold: {
    title: 'Flat yellow square, pale-blue letter, misregistered', theme: 'pink',
    options: { style: 'display', fill: 'solid', frame: 'square', ornament: { name: 'florets', density: 1.1 }, palette: 'marigold', texture: ['misregister'], animate: 'pop' },
  },
  silhouette: {
    title: 'Black foliage silhouette, no frame', theme: 'parchment',
    options: { style: 'uncial', fill: 'solid', outline: 'keyline', frame: { shape: 'circle', style: 'borderless' }, ornament: { name: 'vines', leaves: 1.8, stars: 0, dots: 0.3, stroke: 1.3, density: 1.1, leafLen: 12, midrib: false }, palette: 'sumi', animate: 'auto' },
  },
  badge: {
    title: 'Halftone badge, blue letter', theme: 'white',
    options: { style: 'slab', fill: 'solid', outline: 'badge', frame: 'none', ornament: 'none', palette: 'cobalt', animate: 'pop' },
  },
  maze: {
    title: 'Ochre interlace tile, dark letter, gold outline', theme: 'parchment',
    options: { style: 'roman', fill: 'solid', outline: 'keyline', frame: 'square', ornament: 'interlace', palette: 'ochre', animate: 'auto' },
  },
  stone: {
    title: 'Grey stone stipple letter on a beige tile', theme: 'parchment',
    options: { style: 'uncial', fill: 'stipple', fillOptions: { density: 1.25, dot: 0.55 }, frame: 'square', ornament: { name: 'stipple', density: 0.5, rMin: 1.6, rMax: 4, dot: 0.3 }, palette: 'stone', texture: ['grain'], animate: 'pop' },
  },
  fuchsia: {
    title: 'Magenta letter, pink filigree, pink page with blue text', theme: 'pink',
    options: { style: 'roman', fill: 'solid', frame: 'none', ornament: { name: 'vines', stroke: 0.85, leaves: 0.8, stars: 1.6, dots: 1.2, density: 1.1, leafLen: 8 }, palette: 'fuchsia', animate: 'auto' },
  },
  diamond: {
    title: 'Diamond frame, mosaic ground', theme: 'cream',
    options: { style: 'roman', fill: 'solid', frame: 'diamond', ornament: { name: 'mosaic', size: 2.8 }, palette: 'byzantine', animate: 'pop' },
  },
  rainbow: {
    title: 'Rainbow multi-outline with yellow halo', theme: 'cream',
    options: { style: 'display', fill: 'solid', outline: 'rainbow', outlineOptions: { rings: 4, halo: true }, frame: 'none', ornament: 'none', palette: 'rainbow', animate: 'pop' },
  },
  ring: {
    title: 'Red ring frame, inline letter', theme: 'parchment',
    options: { style: 'roman', fill: 'keyline', frame: { shape: 'circle', style: 'stroked', lineWidth: 3 }, ornament: { name: 'tiling', pitch: 7, motifs: ['ring', 'dot'], alternate: false, scale: 0.4 }, palette: 'carmine', animate: 'pop' },
  },
  oxblood: {
    title: 'Small dark-red damask square, white letter', theme: 'stone',
    options: { style: 'roman', fill: 'solid', frame: 'square', ornament: { name: 'tiling', pitch: 4.2, motifs: ['quatrefoil', 'diamond', 'dot'], scale: 0.75 }, palette: 'oxblood', animate: 'pop' },
  },
  hero: {
    title: 'White blackletter on black, growing vines, leaves and stars', theme: 'parchment',
    options: { style: 'blackletter', fill: 'solid', frame: 'square', ornament: 'vines', palette: 'vermilion', animate: 'auto' },
  },
  // ---- beyond the video
  knotwork: {
    title: 'Celtic knotwork', theme: 'mint',
    options: { style: 'uncial', fill: 'solid', outline: 'keyline', frame: 'square', ornament: 'knotwork', palette: 'moss', animate: 'fade' },
  },
  nouveau: {
    title: 'Art-nouveau whiplash', theme: 'cream',
    options: { style: 'display', fill: 'solid', frame: { shape: 'rounded', style: 'stroked' }, ornament: 'nouveau', palette: 'nouveau', animate: 'auto' },
  },
  circuit: {
    title: 'Copper circuit traces', theme: 'ink',
    options: { style: 'slab', fill: 'solid', frame: 'square', ornament: 'circuit', palette: 'copper', animate: 'auto' },
  },
  glass: {
    title: 'Voronoi stained glass', theme: 'stone',
    options: { style: 'blackletter', fill: 'solid', outline: 'keyline', frame: 'square', ornament: 'voronoi', palette: 'glass', animate: 'pop' },
  },
  coral: {
    title: 'Space-colonisation coral', theme: 'parchment',
    options: { style: 'roman', fill: 'solid', frame: 'square', ornament: 'colonization', palette: 'vermilion', animate: 'auto' },
  },
  contourFrame: {
    title: 'Contour-offset frame, halftone ground', theme: 'white',
    options: { style: 'display', fill: 'solid', frame: { shape: 'contour', style: 'solid' }, ornament: { name: 'halftone', falloff: 'letter', pitch: 2.2 }, palette: 'paper', animate: 'ripple' },
  },
};

export const VIDEO_RECIPES = ['delft', 'rust', 'sticker', 'woodcut', 'marigold', 'silhouette', 'badge', 'maze', 'stone', 'fuchsia', 'diamond', 'rainbow', 'ring', 'oxblood', 'hero'];
export const EXTRA_RECIPES = ['knotwork', 'nouveau', 'circuit', 'glass', 'coral', 'contourFrame'];

export function applyRecipe(name) {
  const r = RECIPES[name];
  return r ? JSON.parse(JSON.stringify(r.options)) : {};
}

/** A coherent random combination of the orthogonal axes. */
export function randomLook(rng) {
  const pick = (a) => a[Math.floor(rng() * a.length)];
  const palette = pick(['vermilion', 'paper', 'delft', 'rust', 'woodcut', 'ochre', 'stone', 'fuchsia', 'byzantine', 'oxblood', 'copper', 'glass', 'moss', 'nouveau', 'carmine', 'marigold']);
  const style = pick(['blackletter', 'roman', 'uncial', 'script', 'slab', 'display']);
  const frame = pick(['square', 'square', 'rounded', 'circle', 'diamond', 'none', { shape: 'square', style: 'stroked' }]);
  const ornament = pick(['vines', 'vines', 'porcelain', 'contour', ['hatch', { name: 'vines', leafStyle: 'engraved', stars: 0 }], 'interlace', 'mosaic', 'halftone', 'tiling', 'stipple', 'knotwork', 'nouveau', 'circuit', 'voronoi', 'colonization']);
  const fill = pick(['solid', 'solid', 'solid', 'keyline', 'pattern', 'gradient', 'hatch', 'stipple']);
  const outline = pick(['none', 'none', 'keyline', 'keyline', 'rainbow', 'badge', 'sticker', 'halo']);
  const texture = rng() < 0.3 ? [pick(['grain', 'inkspread', 'misregister'])] : [];
  const animate = pick(['auto', 'auto', 'pop', 'ripple', 'reveal']);
  return { style, fill, outline, frame, ornament, palette, texture, animate };
}
