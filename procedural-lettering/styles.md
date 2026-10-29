# Styles: axes, palettes and the named recipes

A look is a point in the axis space; recipes are just saved points. `createDropCap({ recipe: 'hero', style: 'uncial' })` applies the recipe and then your overrides.

## Axes

| axis | values | notes |
|---|---|---|
| `style` | `blackletter` `roman` `uncial` `script` `slab` `display` | font stacks in `src/raster.js`; `fontScale` nudges the fit |
| `fill` | `solid` `keyline` `pattern` `gradient` `hatch` `stipple` | `fillOptions`: `module` + `params` + `base` (pattern), `angle` `spacing` `cross` (hatch), `density` `dot` (stipple), `from` `to` (gradient), `inner` `double` (keyline) |
| `outline` | `none` `keyline` `rainbow` `badge` `sticker` `halo` | `outlineOptions`: `width`, `color`, `rings` + `colors` (rainbow), `radius` `pitch` `gamma` (badge), `edge` (sticker), `halo: true` under any outline |
| `frame` | `none` `square` `rounded` `circle` `diamond` `contour` | object form `{ shape, style: solid|stroked|borderless, lineWidth, fill, stroke, rim, inner, pad, offset }` |
| `ornament` | module name, `{ name, ...params }`, or an array of layers | layers run in order and avoid each other |
| `palette` | name or object | roles: `frame frameStroke rim inner letter letterStroke ornament accent accent2 glass[] theme` |
| `texture` | `grain` `inkspread` `misregister` | array; `grain` amount via `grain: 0.22` |
| `animate` | `true/false` `draw` `pop` `fade` `ripple` `reveal` | `duration` ms |

Module parameters (defaults in each module file):

- `vines`: `density`, `leaves`, `stars`, `dots`, `stroke`, `leafStyle: solid|outline|engraved`, `leafLen` (cells, 10.5), `midrib`, `halo` (paper under-stroke for hatched grounds), `eyes` (dot in every volute), `seeds`, `interior`, `turtle: {...}` (any growth parameter: `radius`, `clear`, `maxSteps`, `branchEvery`, `branchProb`, `leafStalkProb`, `spiralR0`, `spiralTighten`, `spiralEye`, `minSpiral`, `maxSpiral`, `flipProb`, `avoid`…)
- `porcelain`: `density`, `motifs`, `berries`, `flowers`, `leafLen` (4.2), `stroke`
- `contour`: `spacing`, `wobble`, `scale`, `breaks`, `grain`, `levels`, `stroke`, `fade`
- `hatch`: `angle`, `spacing`, `cross`, `stroke`, `jitter`, `gap`
- `interlace`: `pitch`, `stroke`, `rounded`, `bias`, `smooth` (0 = hard-angled maze, 0.6 = meander), `inline` (accent inline)
- `mosaic`: `size`, `gap`, `variation`, `colors[]` · `voronoi`: `size`, `lead`, `colors[]`
- `halftone`: `pitch`, `falloff: letter|frame|radial|flat`, `gamma`, `scale`, `angle`
- `stipple`: `density`, `shade: letter|frame|noise`, `rMin`, `rMax`, `dot`
- `tiling`: `pitch`, `motifs[]`, `alternate`, `scale` · `florets`: `density`
- `knotwork`: `pitch`, `stroke`, `gapRatio`, `twoTone` · `nouveau`: `density`, `taper`, `leaves`
- `circuit`: `pitch`, `traces`, `turnProb`, `stroke` · `colonization`: `density`, `roots`, `influence`, `kill`, `step`, `maxWidth`, `leaves`

## Page themes and palettes

Themes (`PAGE_THEMES`) give a coordinated page background and body text colour: `parchment` (#F4F0E6 / near-black), `cream`, `white`, `mint` (green text), `pink` (#F3D9E6 with blue #2667A8 text), `lavender`, `stone`, `ink` (dark page, cream text). Every palette names its theme, so a section can set `--page`/`--text` from `resolvePalette(name).page/.text` (the demo does this per chapter).

Palettes (`PALETTES`): `vermilion` (black frame with a paper hairline inside the edge, paper letter/ornament, red accent), `paper` (inverse), `delft`, `rust`, `woodcut`, `marigold`, `sumi`, `cobalt`, `ochre`, `stone`, `fuchsia`, `byzantine`, `rainbow` (+ `rings[]`), `carmine`, `oxblood`, `copper`, `glass` (+ `glass[]`), `moss`, `nouveau`. Pass an object to make your own; unspecified roles fall back (frameStroke → frame, accent2 → ornament, paper = frame fill or page when frameless).

## The fifteen video looks

Each recipe lives in `src/recipes.js`; the mapping to axes:

| # | recipe | style | fill | outline | frame | ornament | palette / theme | texture · animate |
|---|---|---|---|---|---|---|---|---|
| 1 | `delft` Delft porcelain medallion, script cap | script | pattern (porcelain inside, white base, cobalt edge) | none | circle, gold `rim` | porcelain (dense cobalt scrollwork, small leaves, berry clusters, rosettes) | delft / lavender | draw + pop |
| 2 | `rust` rust contour / wood-grain isolines | roman | solid | none | none | contour | rust / cream | ripple |
| 3 | `sticker` blackletter pattern-filled + sticker outline | blackletter | pattern (florets, black base, paper florets) | sticker | none | none | sumi / parchment | pop |
| 4 | `woodcut` black frame, hatch ground, engraved foliage, red roman with white keyline | roman | solid | keyline (paper) | square, thick black line | `['hatch', vines{engraved, halo, no stars}]` | woodcut / lavender | auto (draw) |
| 5 | `marigold` flat yellow square, pale-blue letter, misregistered | display | solid | none | square | florets | marigold / pink | misregister · pop |
| 6 | `silhouette` black foliage, no frame | uncial | solid | keyline | circle, borderless | vines (big solid leaves `leafLen: 12`, no midrib, no stars) | sumi / parchment | auto |
| 7 | `badge` halftone badge, blue letter | slab | solid | badge | none | none | cobalt / white | pop |
| 8 | `maze` ochre interlace square, dark letter, gold outline | roman | solid | keyline (gold) | square | interlace (smoothed meander, gold inline) | ochre / parchment | auto |
| 9 | `stone` grey stone stipple letter on beige tile | uncial | stipple | none | square | stipple (sparse) | stone / parchment | grain · pop |
| 10 | `fuchsia` magenta letter, pink filigree, pink page with blue text | roman | solid | none | none | vines (thin, starry) | fuchsia / pink | auto |
| 11 | `diamond` diamond frame | roman | solid | none | diamond | mosaic | byzantine / cream | pop |
| 12 | `rainbow` rainbow multi-outline with yellow halo | display | solid | rainbow + `halo` | none | none | rainbow / cream | pop |
| 13 | `ring` red ring frame | roman | keyline (double inline) | none | circle, stroked, thick | tiling (rings, dots) | carmine / parchment | pop |
| 14 | `oxblood` small dark-red square, white letter | roman | solid | none | square | tiling (quatrefoil, diamond, dot) | oxblood / stone | pop |
| 15 | `hero` white blackletter on black square, growing vines, leaves, stars | blackletter | solid | none | square (paper hairline inside) | vines | vermilion / parchment | auto (draw + pop) |

Beyond the video (`EXTRA_RECIPES`): `knotwork` (uncial, moss, fade), `nouveau` (display, rounded stroked frame), `circuit` (slab, copper on ink page), `glass` (blackletter with keyline over Voronoi glass), `coral` (space colonisation, vermilion), `contourFrame` (contour-offset frame with a halftone ground). `randomLook(rng)` returns a coherent random point in the space for a "surprise me" button.

## Composition notes

- Letters that are mostly counters (B, O, A, R) look best with modules that creep inside: vines, contour, halftone; use `fill: 'pattern'` to echo the ornament inside the glyph (Delft).
- Thin styles (script, keyline fills) want a fine-grained ground: porcelain scrollwork, halftone or tiling, not the big hero vines.
- Vines are tuned through the `turtle` object: larger `radius` and `clear` for calmer, sparser scrolls; higher `leafStalkProb` for leafier growth; `spiralR0`/`spiralTighten` for bigger or tighter volutes.
- Frame line weight ≈ keyline weight ≈ stem weight gives the engraved consistency of the references; `lineWidth` and `strokePx` are both derived from `size`.
- Headlines: `frame: 'none'` or a stroked banner; `tracking` 0.08–0.15 em leaves room between letters for stems; use `ornament` modules that read at small scale (vines, halftone, florets).
