# Algorithms

How a letter becomes a collision mask and how each ornament module fills the negative space. All distances below are in grid cells unless stated; a cell is `size / 128` px.

## 1. Glyph → mask

`raster.js`

1. **Font stack per style.** Each glyph style maps to a stack of system/web-safe fonts (`GLYPH_STYLES`), e.g. blackletter → UnifrakturMaguntia, Old English Text MT, Cloister Black…; script → Great Vibes, Snell Roundhand, Apple Chancery… The same `font` string is used by the canvas rasteriser and the SVG `<text>`, so the mask matches what the browser draws. Measure per character (no kerning) so canvas and SVG agree; multi-letter words place each glyph with its own `x`.
2. **Fit.** Measure at a probe size with `measureText` (actual bounding box), then scale so the glyph's box fits `fit × available area` (`fit` is per style, frames shrink it: circle 0.84, diamond 0.7). Centre the box in the frame.
3. **Three raster passes** on a `cols × rows` canvas with the transform set to cells: (a) frame interior (the region ornament may occupy, inset by line width + pad), (b) letter dilated by `gap + outlineWidth` (round joins, via `strokeText`), (c) bare letter interior. Threshold red > 127 to get three `Uint8Array` masks.
4. **Obstacle grid** `obst = outside(frame) | letter`. Free = `obst == 0 && occ == 0` where `occ` is the dynamic occupancy grid modules write to.

## 2. Distance fields

Felzenszwalb–Huttenlocher exact Euclidean distance transform (1-D parabolic lower envelope, run on columns then rows, `O(n)` per line). Four fields:

- `dist` – to the nearest obstacle (letter ∪ frame outside), what the turtle steers by;
- `distLetter` – to the letter only (halftone badge, ripple timing, contour levels);
- `distFrame` – to the frame boundary (seed placement near the edge, circuit starts);
- `distInner` – inside the glyph, distance to its edge (stipple/hatch fills shade toward edges).

`Field` offers `distAt(x,y)`, `freeAt`, `clear(x,y,r,ignoreId)` (disc of cells free), `ray(x,y,angle,len)` (free run length along a ray), `markDisk`, `markPolygon`, `randomFree(rng, pred)`, `gradient` of any field.

## 3. Turtle growth (vines, porcelain, nouveau)

`modules/turtle.js` — a curvature-driven turtle, so output is smooth by construction (the polyline is emitted through a Catmull-Rom cubic after `thin()` drops collinear nodes).

- **Seeds**: `edgeSeeds` picks cells in a band `[minClear−0.5, minClear+2.5]` from the frame edge with `dist ≥ minClear`, spread by greedy farthest-point sampling, heading = gradient of `distFrame` (inward) ± jitter. `pocketSeeds` finds the biggest remaining free pockets (random probes ranked by `clearance()` = largest free disc) for later sprigs; `interiorSeeds` for frameless use.
- **Arc mode**: each stem has a signed base curvature `1/R` (`radius` 11 cells ± jitter, children 0.8×, pocket sprigs scaled to their room) that occasionally flips sign (`flipProb`, at least 14 steps apart) to make S-curves, plus a slewed steering term `avoid·(dl−dr)/look·(0.5+1.5·pressure)` from free-ray probes left/right/ahead (`pressure = 1 − ahead/look`). Turn per step is clamped to `maxTurn` (0.36 rad) so there are no kinks; if a step is blocked the turtle tries ±0.25/±0.5 rad, and if that fails it tries to start a volute, otherwise it stops.
- **Volute**: when `ahead < tightDist`, at random after `minSpiralAt`, or when the length budget runs out, `startSpiral()` looks for the largest disc of radius `r ∈ [spiralRmin, spiralR0]` tangent to the stem on either side (own trail ignored) and, if one fits, switches to a logarithmic spiral: per step `dθ = step/r`, `r ← r·exp(−tighten·dθ)`, step length shrinks with `r` so the eye stays round, stop when `r < spiralEye` or after `minSpiral…maxSpiral` radians (1.5–2.5 turns). Because curvature only increases, the spiral stays inside the disc that was checked (nested osculating circles), so volutes almost never collide. A stem whose terminal fits no volute just stops; the eye of every volute gets a dot.
- **Collision**: a step is accepted only if `clear(next, 0.75·clear)`. A stem's own trail is marked with radius `clear` only after `lag` steps and with its own id (`mark`), which its spiral, its leaves and its children's first cells may ignore. Rejected (too short) stems unmark themselves.
- **Branching** (the scroll rule): every `branchEvery` steps with probability `branchProb`, a child leaves from the **outer** side of the current curve — heading `a − sign·branchAngle`, curvature sign opposite to the parent — so it peels off tangentially and curls the other way. With probability `leafStalkProb` the child is a short *stalk* (3–6 steps, no volute, no branching) that ends in a leaf. Depth ≤ `maxDepth`; `T0 = parent.T0 + arc length at the node` drives the choreography.
- **Filling** (`vines.js`): grow edge seeds → place leaves on them → repeat up to 14 rounds of `pocketSeeds` (room ≥ 3.4 cells) → leaves on the new sprigs → stars (pockets of room ≥ 2.4, radius `room−0.6`) → dots (room ≥ 1.7). Leaves get their room before later sprigs do, which is what makes the result leafy rather than wiry.
- **Leaves**: almond `leafPath` (quadratic, half-width ≤ w/2) of `leafLen` 10.5 cells × 0.4, on the outer side of the local curvature (sign of heading change over ±2 nodes) at ~1.0–1.4 rad from the tangent, or along the heading at a stalk tip; tried at 100 %, 80 %, 65 % length; accepted only if five sample discs along the axis plus the tip are free; then marked. A midrib in the paper colour (ink for `engraved`/`outline`) runs from 8 % to 82 % of the length. `halo: true` draws a paper under-stroke beneath stems so they read over hatching.
- **Porcelain** uses the same engine with `radius 7`, `clear 1.25`, `spiralR0 4.5`, 140 stems, small leaves (4.2 cells) every 3 nodes alternating sides, then berry clusters (hex-packed dots sized to the pocket) and 5–6-petal rosettes in the pockets.
- **Nouveau** uses `radius 16`, `clear 2`, big volutes (`spiralR0 8`), few branches and no stalks; the stroke tapers in 4 runs built from shared cubic segments (`smoothSegments`) so the width steps down without tangent breaks; elongated leaves at curvature maxima; an accent bud in each eye.

## 4. Field-driven modules

- **contour** – scalar field `F = distLetter + wobble·fbm(noise) + grain·sin(...)`; marching squares at levels `1.2 + k·spacing` (cells whose corners touch obstacles are skipped, so lines never enter the letter); segments stitched into chains via edge keys; chains randomly broken into fragments; outer levels fade. Ripple timing = level index.
- **hatch** – rulings at `angle` and `spacing`; each line walked in 0.5-cell steps, emitted as runs where `free && dist > gap`. Optional cross-hatch. Does not mark occupancy, so foliage layered after it draws over the rulings (woodcut look with `leafStyle: 'engraved'`).
- **halftone** – hex lattice; dot radius `0.48·pitch·(1−t)^γ` with `t` from `distLetter` (big near the letter), `distFrame`, or radial; a dot is also capped at `dist − 1` so it never reaches an obstacle cell.
- **stipple** – variable-radius dart throwing with a bucket grid; spacing shrinks toward the letter (`shade: 'letter'`) or the frame or by noise; candidates need `dist > 1.6`. Used for the engraved-stone letter fill via the inner field.
- **badge outline** – hex dots within `radius` of the glyph, radius falling to 0 outward (uses `distLetter`), with a paper keyline between dots and letter.

## 5. Sampling and tessellation

- **Poisson-disc** (Bridson) restricted by a predicate; restarts in unreached islands so counters get filled.
- **Voronoi** by half-plane clipping against the 12–14 nearest neighbours (n ≤ ~600, fine). `tiles()` insets each polygon toward its centroid, subdivides edges to ≤ 0.8 cells and clamps every vertex to the free run of the ray seed → vertex (a vertex may only sit in a cell whose 8 neighbours are free), so a tile is star-shaped around its seed and can never bridge a letter stroke or cut a frame corner. `mosaic` colours tiles from the palette with variation; `voronoi` (stained glass) fills with the `glass[]` palette and draws lead lines over.
- **florets** – Poisson points inside the glyph; floret, tendril or dot depending on local room (`dist − 1.5`, so the whole motif fits its clear disc). Default module for `fill: 'pattern'`.

## 6. Lattice modules

`modules/lattice.js` coarsens the grid into `m×m` blocks that are free only if every cell is.

- **interlace** – randomised DFS maze over free blocks (bias to continue straight), passages emitted as round-capped runs smoothed into a meander (`smooth`, 0 for a hard-angled labyrinth) with an accent inline; each corridor is a draw-on path.
- **knotwork** – Celtic plait: in every free block two diagonal strands cross; over/under alternates on a checkerboard `(i+j) % 2`. At a lattice corner a strand continues straight unless a wall (edge between free and non-free blocks) passes through the corner: a horizontal wall reflects it vertically, a vertical wall horizontally, both reverse it into a lobe. Each strand half is a quadratic `centre → corner → next centre` split at its midpoint so the two halves belong to their own blocks' layers; a short paper "halo" under the over-strand around the crossing produces the weave. Everything is three (or seven, two-tone) `<path>`s.
- **circuit** – 8-direction lattice walks from pads near the frame edge, 45° bends, no diagonal squeezing between used blocks, pads (ring + hole) at ends and vias mid-trace.
- **tiling** – lattice points with a clearance disc; motifs (`diamond, ring, dot, cross, quatrefoil, hex, star`) alternate by `(row+col)` or at random; colours cycle ornament/accent/accent2.

## 7. Space colonisation (`colonization`)

Runions et al.: attraction points = Poisson samples in free space; roots = edge seeds; each iteration every live attractor pulls its nearest node within `influence`; each pulled node grows one `step` toward the mean direction, sliding ±0.6/±1.2 rad if the straight step is blocked; a node that stays blocked for three iterations retires the attractors it is nearest to (otherwise attractors behind a letter stroke stall the whole tree); attractors within `kill` of a node die. Subtree size → stroke width (`√(size/max)`), chains (leaf → first claimed ancestor, thick trunks claimed first) are emitted root-first with depth-based timing; terminal dots on tips.

## 8. Compose and guarantees

- Ornament group is masked with `frame interior (inset) − letter dilated by 0.6·gap + outlineWidth` so a module bug can never paint over the letter or outside the frame; modules still avoid collisions themselves so edges look intentional. `verify.mjs` samples every emitted path every 1.5 px against `field.inner / letter / outside` (with a 0.05-cell tolerance for the 2-decimal path rounding) and fails on any sample inside the glyph or outside the frame.
- Frames can carry a `rim` (gold line inside the edge) and an `inner` hairline (ruled at `lw/2 + 0.45·pad` inside the edge; the ornament inset is `lw/2 + pad`, so growth stays inside the hairline).
- `maxPaths` truncates element lists; cell count is fixed at ~128 per side so cost is independent of pixel size.
- `fill: 'pattern'` builds an *inner* field (free = glyph interior) and runs a module on it at `strokeScale`, clipped by a `<clipPath>` of the glyph's `<text>` nodes.
- Textures: `grain` = fractal noise multiplied over the whole cap; `inkspread` = dilate → blur → alpha-sharpen → tiny displacement; `misregister` = a second copy of frame and letter in `accent2` offset by `(dx, dy)` with multiply blending.
