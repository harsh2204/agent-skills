---
name: picasso
description: Authored frontends with unique typography, inevitable palettes, atmospheric texture, and communicative motion, finished down to every state. Use when generating, restyling, or reviewing a UI, landing page, dashboard, or frontend.
---

# Picasso

Build a frontend that looks authored for this project, then finish it until it feels that way in the hand.

Bold is the point. A page with a nameable identity, a face nobody else picked, a palette that could only belong here. But a striking page with a dead hover, a button that forgets it was pressed, or a hero animation that replays on every tab switch is still slop, just louder. Picasso spends its boldness where people look once and keeps everything they touch a hundred times fast, quiet, and complete.

## Workflow

Four passes. Each has a done condition.

### 1. Sense

- **Extract DNA**: domain, audience, mood, density, era, and the visual language each implies. Done when all five are written down.
- **Read the ground**: in an existing project, find the styling system (Tailwind, CSS modules, CSS-in-JS, a motion library) and work inside it. Never add a second one to land an effect. Walk the current UI through every state before changing it.

### 2. Decide

- **Pick aesthetic**: match DNA to [aesthetics.md](aesthetics.md). Fuse at most two profiles, or name a hybrid. Done when you can say: *Aesthetic: Name. Fonts, palette, texture, motion.*
- **Plan the motion budget**: list every moving thing and place it in the [motion budget](#motion-budget). Choose the one or two showpiece moments. Everything else gets a modest, short line in the budget.

### 3. Build

- **Foundation**: semantic HTML5, the token set below in `:root`, mobile-first. Done when every token has a value from this aesthetic.
- **The five layers**: Typography → Color → Texture → Motion → Layout. Load the matching reference as you go. Done when each layer would fail its slop check if removed.
- **The 10%**: one surprise the aesthetic owns: cursor, loader, hover, scroll reveal, empty state, or 404.
- **Finish**: every state from [craft.md](craft.md) exists and is styled in the aesthetic's voice.

### 4. Prove

- Slow animations to 10% in DevTools' Animations panel and step through frames. Hitches you can't see at full speed are obvious at a tenth.
- Turn on reduced motion, use a touch viewport, then use the keyboard only. Every state still has to make sense.
- Score the [rubric](#rubric). Under 42/60, iterate. Pass [anti-slop.md](anti-slop.md) and the [finish checklist](#finish-checklist). Then ship complete runnable files.

Example: "CLI dashboard for server monitoring" → ops, engineers, vigilant, dense, none → *Void Terminal: Fira Code + IBM Plex Mono, phosphor on CRT black, scanlines, cursor-blink.* Budget: a boot-sequence typewriter on first load; row hovers are instant inversions; metric updates swap with no travel.

## Motion budget

Every animation costs attention, and the cost comes back each time it plays. The more often someone sees it, the cheaper it has to be.

| How often it plays | Budget |
|--------------------|--------|
| Every keystroke, shortcut, list arrow, palette open | Zero. Instant. Never animate anything the keyboard triggers. |
| Many times an hour: hover, tabs, menus, tooltips | One property, 120–200ms, ease-out. It acknowledges; it doesn't perform. |
| A few times a session: dialogs, drawers, toasts | 200–300ms with a clear direction: where it came from, where it goes. |
| Once: hero entrance, first load, first success, 404 | Spend it here. Stagger, clip reveals, slam-ins, glitch, spring. This is Picasso's stage. |

Atmosphere (grain drift, embers, slow spin) is ambient. It runs slowly (3–30s), stays behind content, never touches text people are reading, and stops under reduced motion.

Each motion needs a reason: it confirms an input, shows where something came from, joins two states, explains a change, or delights once. "It looks cool" only counts in the last row.

Motion is never the only signal. Every animated change also leaves something static behind (a color, an icon, a label, a position), so someone who looked away still knows what happened.

## Tokens

```css
:root {
  --bg-deep: ; --bg-surface: ; --bg-elevated: ;
  --text-primary: ; --text-muted: ;
  --accent: ; --accent-glow: ;
  --danger: ; --success: ; --border: ;
  --focus: ;                                     /* one ring, everywhere */

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);     /* arrivals, most things */
  --ease-exit: cubic-bezier(0.4, 0, 0.6, 1);     /* departures */
  --ease-move: cubic-bezier(0.7, 0, 0.3, 1);     /* A to B on screen */
  --dur-press: 120ms; --dur-hover: 160ms;
  --dur-overlay: 240ms; --dur-hero: 600ms;
}
```

The background is a gradient, a layered stack, or a texture. The accent meets 4.5:1 against its surface. `--focus` meets 3:1 against every surface it sits on.

## House numbers

Use these first. Deviate only for a reason you could put in a code comment.

| Thing | Value |
|-------|-------|
| Interactive duration | Under 300ms. Exits run at 60–75% of the matching enter. |
| Hero / once-moment | 400–700ms per piece; the whole cascade lands within ~1s. |
| Stagger | 40–80ms between list items, 80–120ms between hero chunks. Never block input while it plays. |
| Press | `scale(0.97)`, or `0.96` on small/icon buttons, never below `0.95`. Use a transition, not keyframes. |
| Arrival | Start at `opacity: 0` and `scale(0.95)` or larger, never `scale(0)`. Popovers grow from their trigger. |
| Exit | 8–16px of travel plus a fade on `--ease-exit`. Never a one-frame vanish. |
| Hit area | 44×44 on touch, 40×40 in dense desktop UI. Extend small controls with a pseudo-element. |
| Radius | Nested corners: `outer = inner + padding`. Square aesthetics stay square everywhere. |
| Blur in motion | 2–4px to bridge a crossfade, never over 12px. |
| Easing | Never ease-in on something the person is waiting for. |

## Five layers

| Layer | Do | Reference |
|-------|-----|-----------|
| Typography | Contrast pairing (display + body + mono). Fluid `clamp()`. Tight headlines, tracked labels. Pair weight 300 with 800. Tabular numbers on anything that changes. | [fonts.md](fonts.md), [craft.md](craft.md#type-that-sits-right) |
| Color | Palette as the tokens above, inevitable for this DNA. | [aesthetics.md](aesthetics.md) |
| Texture | Grain, mesh, scanlines, frost, stacked. | [patterns.md](patterns.md) |
| Motion | Spend the budget: loud once, quiet often. Removing any one of them should lose meaning. | [animations.md](animations.md) |
| Layout | Personality: brutalist, editorial, terminal, glass, neo-geo. `clip-path`, `mix-blend-mode`, `mask-image`. | [aesthetics.md](aesthetics.md) |

## Finish checklist

Before ship:

- Every interactive element has rest, hover, focus-visible, active, pending, success, error, disabled, empty, and overflow states, in this aesthetic's voice. See [craft.md](craft.md).
- Nothing animates on first paint unless it's a planned once-moment.
- Transitions name their properties. No `transition: all`, and no bare Tailwind `transition`.
- Anything that can be retriggered (hover, toggle, toast) uses transitions or springs. Keyframes are for sequences that run once.
- Hover styles sit behind `@media (hover: hover) and (pointer: fine)`.
- Reduced motion keeps fades and color changes, drops travel, scale, 3D, parallax, and ambient loops, and every state still reads.
- The focus ring is visible, consistent, and keyboard-only (`:focus-visible`).
- No layout shift: tabular numbers, reserved space, sized media.
- Only compositor properties animate. See [animations.md](animations.md#performance).

## Rubric

Rate 1–10. Ship at 42/60.

| Criterion | 10 |
|-----------|-----|
| Typography | Custom pairing, expressive scale, deliberate spacing |
| Color | Rich palette, textured background, glowing accents |
| Motion | A showpiece that lands once; snappy, quiet feedback everywhere else |
| Layout | Broken grid, overlaps, asymmetry, tension |
| Character | Unmistakably this project |
| Finish | Every state designed, keyboard and reduced motion intact, no jank |

Bold and unfinished fails. Finished and generic fails too.

## Review mode

When asked to review or critique a frontend, follow [review.md](review.md): state scope and mode, walk the states, judge both identity and finish, report findings in one table, and end with a verdict.

## References

| File | Read it for |
|------|-------------|
| [aesthetics.md](aesthetics.md) | Complete aesthetic profiles: fonts, palette, texture, motion, layout |
| [fonts.md](fonts.md) | Display, body, and mono faces and how to pair them |
| [patterns.md](patterns.md) | Background stacks: grain, scanlines, mesh, frost |
| [animations.md](animations.md) | Entrances, hovers, atmosphere, exits, reduced motion, performance |
| [craft.md](craft.md) | States, latency, surfaces, hit areas, focus, type rendering |
| [anti-slop.md](anti-slop.md) | What generic looks like, and what to do instead |
| [review.md](review.md) | Review protocol and report format |

Craft guidance inspired by Kobra's design-eng skill ([kobra.systems](https://kobra.systems)).
