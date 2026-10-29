---
name: procedural-lettering
description: Generative, procedural ornamental lettering in HTML/SVG/canvas — illuminated drop caps, decorated initials, filigree and vine-grown letters, animated decorative type, ornamental headlines. Use when a page needs drop caps, illuminated initials, generative/seeded letter ornament (vines, porcelain, contour lines, knotwork, mosaic, halftone), animated draw-on lettering, or print-like textured type without dependencies.
---

# Procedural lettering

Dependency-free ES module (`lettering.js`, engine in `src/`) that turns a letter or word into an ornamented SVG: the glyph is a collision mask, ornament grows only in the negative space between letter and frame, and everything is seeded so a look is reproducible. Inspired by Azlen's procedural illuminated drop caps.

```js
import { createDropCap, createHeadline, mulberry32 } from './lettering.js';
const svg = createDropCap({ letter: 'A', style: 'blackletter', frame: 'square', ornament: 'vines', palette: 'vermilion', seed: 7, size: 160 });
el.appendChild(svg);           // svg.seed, svg.replay(), svg.regenerate({seed: 8}), svg.morphTo(9)
const word = createHeadline({ text: 'Beyond', style: 'script', ornament: 'nouveau', frame: 'none' });
```

Reference files: [algorithms.md](algorithms.md) (mask, distance field, turtle, modules), [styles.md](styles.md) (axes, palettes, the 15 named recipes), [animation.md](animation.md) (choreography, reduced motion, morph). Demo: `demo.html` (serve statically, e.g. `python3 -m http.server`; ES modules do not load from `file://`). Verification: `node verify.mjs` serves the directory, loads the demo in headless Chromium, fails on any console error or 4xx, samples every ornament path against the raster field (nothing in the letter mask, nothing outside the frame) and writes `screenshots/` (hero mid-growth and final close-ups, full gallery, all recipes at 2×). Browser and Playwright paths are constants at the top of the script.

## Workflow

1. **Decide the role.** Drop cap floated left spanning 2–5 lines (size = lines × line-height), a standalone initial, or a whole word (`createHeadline`). Keep real text in the DOM: the SVG `<text>` is the letter; the ornament group is `aria-hidden`.
2. **Pick a point in the axis space, not a preset.** Every look is `style × fill × outline × frame × ornament × palette × texture × animate`. Start from a named recipe (`recipe: 'hero'`) and override one axis at a time. Bundle orthogonal choices; never hard-code colours into modules.
3. **Seed everything.** `seed` (number or string) feeds `mulberry32`; same options + same seed = same SVG. Expose the seed in the UI; regenerate = new seed, replay = restart choreography without regenerating.
4. **Render at display size.** Stroke widths and grid resolution derive from `size`; do not render at 200 px and scale to 60 px with CSS (strokes vanish). Minimum sensible size ≈ 48 px.
5. **Check the quality list** below against a screenshot at the real size before shipping (`node verify.mjs`, then look at `screenshots/`); iterate on seeds and densities, not on hand edits of paths.

## Architecture (src/)

| file | job |
|---|---|
| `rng.js` | `mulberry32`, `seedFrom(seed, ...salt)`, helpers (`range`, `pick`, `gauss`) |
| `raster.js` | font stacks per glyph style, glyph fitting, frame geometry, canvas rasterisation → `Field` (masks, exact EDT distance fields, occupancy grid, probes) |
| `geom.js` | path builders (Catmull-Rom smoothing, leaves, stars, blobs), Poisson-disc, Voronoi, value noise, marching squares |
| `modules/turtle.js` | curvature-driven growth shared by vines, porcelain and nouveau: seeds, pocket finding, volutes, tangential branching |
| `modules/*.js` | ornament modules; each `run(field, env) -> elements[]` with normalised animation times |
| `letter.js` | letter fills and outlines (`<text>` copies, clip paths, badge dots) |
| `compose.js` | pipeline: options → field → modules → `<svg>` (frame, masked ornament, letter, filters, choreography) |
| `animate.js` | one injected stylesheet; `draw`/`pop`/`fade`/`reveal` keyframes; reduced-motion rule |
| `texture.js` | paper grain and ink-spread SVG filters |
| `palettes.js`, `recipes.js` | colour roles + page themes; named looks + `randomLook(rng)` |

Pipeline per render: rasterise glyph + frame to a grid (~128 cells per side) → distance fields (to letter, to frame, to any obstacle) → run ornament layers in order (each marks an occupancy grid so later layers avoid earlier ones) → emit SVG elements → mask the ornament group with "frame interior minus dilated letter" as a hard guarantee → letter layer on top → textures → choreography. See algorithms.md.

Adding a module: export `{ name, animates, defaults, run(field, env) }` and register it in `modules/index.js` (or `registerModule`). Elements are `{ tag, attrs, len?, cx?, cy?, anim: { kind: 'draw'|'pop'|'fade', t0, dur } }` with `t0/dur` in 0–1 of the total duration. Always consult `field.isFree / clear / dist*` before placing anything and `markDisk / markPolygon` after. Geometry is continuous while the field is cellular: `clear(x, y, r)` only guarantees a free disc of radius `r − 0.7` cells, so give every shape at least `0.75` cells of margin and size dots by `distAt − 1.5`; the audit in `verify.mjs` catches anything that leaks.

## Axes (orthogonal, all seeded)

- **style**: `blackletter | roman | uncial | script | slab | display` — system/web-safe font stacks rendered through canvas, no font files.
- **fill**: `solid | keyline | pattern | gradient | hatch | stipple` (`fillOptions`: `module`, `base`, `angle`, `spacing`, `density`...). `pattern` runs any ornament module *inside* the glyph.
- **outline**: `none | keyline | rainbow | badge | sticker | halo` (`outlineOptions`: `width`, `rings`, `colors`, `radius`, `halo: true` to add a halo under any outline).
- **frame**: `none | square | rounded | circle | diamond | contour` with `style: solid | stroked | borderless`, `lineWidth`, `rim` (gold rim on medallions), `inner` (hairline ruled just inside the edge, as on the black hero square), `offset` (contour frame). Borderless frames still constrain the ornament, which is how silhouettes get an organic edge.
- **ornament**: one module name, an object `{ name, ...params }`, or an array of layers. Modules: `vines` (hero), `porcelain`, `contour`, `hatch`, `interlace`, `mosaic`, `halftone`, `tiling`, `stipple`, `florets`, and beyond the video: `knotwork`, `nouveau`, `circuit`, `voronoi`, `colonization`.
- **palette**: a name from `PALETTES` or an object with roles `frame, frameStroke, rim, inner, letter, letterStroke, ornament, accent, accent2, glass[], theme`. `theme` names a page theme (`parchment, cream, white, mint, pink, lavender, stone, ink`) that sets coordinated `page` and `text` colours: use them to tint the surrounding section.
- **texture**: array of `grain`, `inkspread`, `misregister` (`misregister: {dx, dy, color}`).
- **animate**: `true` (`auto`: each module's own choreography), `false`, or `draw | pop | fade | ripple | reveal`; `duration` ms (default 2500).

## Palettes

Black / parchment `#F4F0E6` / vermilion `#D7301F` is the house palette (`vermilion`: black square, paper letter and vines, red accent; `paper`: the inverse). Themed palettes carry their page theme so a whole section can change: `delft` (cobalt on white, lavender page), `fuchsia` (magenta on a pink page with blue text), `rust` (cream page), `copper` (ink page). Keep ornament at most two inks plus the paper; contrast comes from the frame fill, not from more colours.

## Choreography (~2.5 s)

Stems draw on via `stroke-dashoffset` from frame-edge seeds inward with several seeds running concurrently; a child branch starts when the parent's tip reaches its node; sprigs seeded later in leftover pockets start mid-way; leaves, stars and dots scale 0→1 with an ease-out when the tip passes. Times are computed in arc-length units and normalised so the longest chain ends at ~90 % of `duration`. Other modules use `pop` (staggered by distance from the letter), `ripple` (contours expand from the letter), `fade`, or a left-to-right `reveal`. `prefers-reduced-motion: reduce` disables all animation and shows the final state, because the un-animated styles *are* the final state. `svg.morphTo(seed)` cross-fades to a new seed while the new ornament draws (kinetic morph). See animation.md.

## Accessibility

- The letter is real `<text>` inside the SVG, and the SVG carries `role="img" aria-label="<letter>"`; ornament and frame groups are `aria-hidden="true"`.
- In running text, put the rest of the first word in small caps right after the cap (see demo) so the word reads as one unit; copy/paste yields the letter plus the word.
- Honour reduced motion (built in); keep contrast of letter vs frame ≥ 4.5:1 for body-size caps.

## Performance

- Rasterisation is a 128×128 grid per cap (one canvas, three passes, exact EDT): ~5–60 ms per cap depending on module; porcelain/colonization/stipple are the heavy ones.
- Precompute: render once, keep the SVG; use `replay()` to re-run choreography without regenerating. Use `maxPaths` (default 3000) to cap element count; tiles/halftone can hit it at large sizes.
- One stylesheet is injected per document; animations are CSS, so hundreds of caps stay cheap. Avoid `texture: ['inkspread']` on dozens of caps at once (filters cost paint time).
- Fonts: the mask is only correct once the font stack has resolved; `await document.fonts.ready` before rendering.

## Quality checklist

- Ornament never touches the letter: a clean gap all round (`gap`, default 3 % of size), and nothing crosses the frame line. The mask is a backstop; `verify.mjs` must report zero samples in the glyph or outside the frame, and modules get there by checking the field, not by relying on the mask.
- Negative space is filled evenly: no empty corners, no clumps; stems reach into counters (e.g. inside an A or B) and sprigs are seeded in whatever pockets the edge growth missed.
- Stems are smooth continuous curves (no kinks, no zig-zag), curvature ramps into every terminal so stems end in tangent volutes of 1.5–2.5 turns with a dot in the eye; children leave tangentially from the outer side of the parent and curl the other way.
- Leaves are big almonds with a midrib on the outer side of curves or at the tip of short stalks, never slivers; stars and dots only in leftover pockets, sized to the pocket.
- Stroke weight is uniform and readable at the display size (≈0.65 % of size, minimum 0.7 px).
- Letter outline weights are consistent with the frame line weight; keylines separate letter from texture; on hatched grounds stems carry a paper halo (`halo: true`) so foliage reads over the rulings.
- Page theme, frame fill and letter colour coordinate (use the palette's `theme`).
- Reduced motion shows the complete final state; replay restarts cleanly; regenerate changes the seed display.

Strong modules: `vines`, `porcelain`, `contour`, `hatch+vines`, `knotwork`, `mosaic`, `voronoi`, `halftone`, `tiling`, `interlace`. Thinner (fine as texture, not hero material): `colonization`, `circuit`, `stipple` as an ornament; `nouveau` has buds but no flowers.
