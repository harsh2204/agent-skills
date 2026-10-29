# Craft

A bold surface still has to work. This file covers what makes a Picasso build feel finished: every state, honest latency, solid geometry, and text that sits right. Each state should speak in the aesthetic's own voice. A Void Terminal error is a red `ERR:` line, and a Brutalist empty state is a thick-bordered block of all-caps copy. Neither is a generic gray toast.

## States

Every interactive element gets all of these, and you look at each one before it ships.

| State | Needs |
|-------|-------|
| Rest | The default. Nothing fades into it on first paint unless it's a planned once-moment. |
| Hover | One property change, ≤200ms, on hover-capable pointers only. |
| Focus-visible | The project's single `--focus` ring, keyboard only, never removed. |
| Active | Press feedback (`scale(0.97)`, or the aesthetic's equivalent: an inversion, a 2px drop, a hard offset shadow collapsing), 100–160ms. |
| Pending | A spinner or aesthetic-native indicator replaces the label in the same footprint. `aria-busy="true"`. |
| Success | A static cue (icon, color, copy) plus at most one small motion. Transient success reverts by itself after ~2s. |
| Error | Words next to the field saying what went wrong and what to do. One short shake. `aria-invalid`, `role="alert"`. |
| Disabled | Dimmed through opacity, with no hover or press response, and a reason nearby if it isn't obvious. |
| Empty | One sentence about what will appear here, one action that starts it, in the same layout as the filled state. |
| Overflow | Long labels wrap or truncate deliberately. The layout holds. Scroll areas look scrollable. |

### Pending

- Keep the button the same width. Keep the person's chosen word ("Deploy") instead of rewriting it to "Deploying…". Turn the label out and an indicator in, then back again.
- Ignore repeat presses in the handler instead of setting `disabled`, which would dim the indicator that's supposed to show progress.
- For content loads, show a skeleton shaped like the incoming content only after ~150ms, and keep it up for at least 300ms once it appears so it doesn't flash.
- Under reduced motion, swap with a plain crossfade. The indicator can keep turning.

### Latency

| Response arrives in | Show |
|---------------------|------|
| < 100ms | Nothing. It already feels instant. |
| < 300ms | Press feedback only. A spinner would just flash. |
| < 1s | A pending state on the control that was pressed. |
| > 1s | Progress, or an honest estimate, plus a way to cancel or leave. |

Optimistic updates show the result right away, mark it provisional, and animate any correction instead of snapping.

### Error

The shake is one gesture: about 400ms, three or four small horizontal moves, run once per submit, never looping. The message clears as soon as the input changes. On submit, focus moves to the first invalid field.

### Hover only where it exists

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-4px); }
}
```

Touch devices otherwise keep the hover state stuck on after a tap. (Tailwind 4's `hover:` already gates this.)

## Surfaces

- **Concentric corners.** `outer radius = inner radius + padding`. Equal radii on a padded parent and child crowd the corner. Past ~24px of padding, treat them as separate surfaces. Square-cornered aesthetics (Terminal, Brutalist) stay at `0` throughout. Don't let one stray `8px` sneak in.
- **Depth has a job.** Shadows lift, borders structure. Brutalist offset shadows (`6px 6px 0 var(--border)`) and neon halos are the aesthetic, so commit to them. Don't stack a border, a blur, and a soft shadow on the same card.
- **Image edges.** Photos get a 1px inset outline at ~10% black (light) or white (dark) so their edges hold on any background.
- **Optical alignment.** Trust your eye over the math: a trailing icon side gets ~2px less padding, and a play triangle sits 1–2px right of center.

## Hit areas

At least 44×44 on touch and 40×40 in dense desktop UI. A smaller visible control extends itself:

```css
.icon-btn { position: relative; }
.icon-btn::after {
  content: '';
  position: absolute;
  inset: 50% auto auto 50%;
  width: 44px; height: 44px;
  translate: -50% -50%;
}
```

Extended hit areas never overlap their neighbors.

## Focus

Pick one ring and use it everywhere: same color, width, and offset, on `:focus-visible` only. It can be on-theme (a phosphor outline, a thick black offset box, a neon glow), but it can never be subtle and never `outline: none` without a replacement.

```css
:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
```

## Type that sits right

- Headings and short blocks: `text-wrap: balance`. Paragraphs: `text-wrap: pretty`.
- Any number that changes while someone watches (prices, counters, timers, tables) gets `font-variant-numeric: tabular-nums`.
- `-webkit-font-smoothing: antialiased` once at the root, never per component.
- Button, tab, and menu labels are `white-space: nowrap`. A label that changes reserves the width of its longest value.
- Body copy runs 45–75 characters per line. The gap above a heading is larger than the gap below it.
- A truncated label carries its full text in `title` or a tooltip. Truncate file names and hashes in the middle.

## Small mechanics

- `user-select: none` on controls. `-webkit-tap-highlight-color: transparent` when you design a press state.
- `scrollbar-gutter: stable` on scroll containers. Give images, video, and embeds explicit dimensions.
- Things that dismiss go out the way they came in: a toast from the bottom swipes back down.
- Dragged elements track the pointer with no easing, then settle with a spring from their release velocity. Dismiss on distance *or* a fast flick.
