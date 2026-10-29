# Animation

Default run is ~2.5 s (`duration`), CSS-only, one stylesheet injected per document by `src/animate.js`.

## Draw-on growth (`vines`, `nouveau`, `hatch`, `contour`, `interlace`, `circuit`, `colonization`)

- Every stem is a `<path>` with `stroke-dasharray = len` and the keyframe `pl-draw` animating `stroke-dashoffset` from `var(--pl-len)` to 0, linear. `len` is computed from the polyline (×1.02) at generation time, so no layout read is needed.
- **Times in arc length.** A seed stem starts at `T0 = 0`; a child starts at `T0 = parent.T0 + arc length of the parent at the branch node`; its duration is its own length. All stems therefore grow at one speed and children visibly sprout when the tip passes the node. Sprigs seeded later in leftover pockets start at 30–60 % of the longest chain so far, so the middle of the cap fills while the edge growth is still running.
- Normalisation: `t0/dur` are divided by the longest `T0 + L`, then multiplied by `0.9 × duration`, so the slowest chain finishes at ~2.25 s with 10 % headroom for the accents.
- **Accents** (leaves, stars, dots, buds) use `pl-pop`: `transform: scale(0 → 1)` with `cubic-bezier(.2,.9,.3,1.25)` (slight overshoot) around `transform-origin` = the leaf base / star centre (`transform-box: view-box`, origin in user units). A leaf's `t0` is the parent's `T0` plus the arc length at its node, i.e. the moment the tip passes (a stalk's tip leaf when the stalk finishes); stars and dots pop in the last 40 %; volute eye dots pop when the spiral ends.
- Concurrency: all edge seeds start together (`t0 = 0`), which reads as the frame "sprouting" inward from every side at once, as in the reference.

## Other choreographies

| `animate` | behaviour |
|---|---|
| `auto` / `true` | each element's own `anim.kind` and times from the module |
| `draw` | strokes draw on; anything without a length pops |
| `pop` | everything pops in with the module's `t0` staggering (tiles by distance from the letter, lattice motifs by diagonal) |
| `fade` | opacity 0→1, same staggering; used for knotwork (its paths are merged so draw-on would look odd) |
| `ripple` | `t0` is recomputed from `distLetter` at each element's `(cx, cy)`: ornament expands outward from the letter; contour levels ring out |
| `reveal` | the whole ornament group wipes left→right with `clip-path: inset()` |
| `false` / `none` | no animation; final state immediately |

The letter itself fades/rises in over 600 ms (`.pl-letter-in`) unless `letterIn: false`.

## Reduced motion and robustness

- `@media (prefers-reduced-motion: reduce) { .pl-svg * { animation: none !important } }`. This works because the natural, un-animated styles are the final state (`stroke-dashoffset: 0`, no transform, full opacity); keyframes only define the *from* state. Never put the final state inside the animation.
- `animation-fill-mode: both` keeps elements hidden before their delay starts; delays are inline CSS variables (`--pl-t0`, `--pl-dur`, `--pl-len`) per element, so no JS runs during playback.
- `svg.replay()` clones and replaces the ornament and letter groups, which restarts every CSS animation without regenerating geometry (the seed stays). The demo also replays a cap the first time it scrolls into view (IntersectionObserver, threshold 0.4) so growth is seen, not missed.
- `svg.regenerate(patch)` renders fresh with merged options and swaps the node in place; `svg.morphTo(seed, ms)` is the **kinetic morph**: a new render for the new seed is created, its ornament group is inserted above the old one and draws on while the old group fades out over `0.6·ms`; the letter group is replaced. Letter and frame are identical between seeds, so only the ornament changes — the headline in the demo re-seeds every 5 s while visible.

## Tuning

- Faster growth: lower `duration` or raise `turtle.step`; the ratio between stems and accents stays.
- A calmer cap: `animate: 'ripple'` with `duration: 1800` on contour/halftone/mosaic.
- Avoid animating `inkspread`-filtered caps in bulk (filter re-rasterises every frame).
- Headlines: the same engine; long words make long chains, so give `duration` 3000–3500 ms.
