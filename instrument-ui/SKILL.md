---
name: instrument-ui
description: Premium hardware-instrument UI design — VST/plugin panels, DJ decks and mixers, studio and set pages, pro-audio cockpits, synth faces, hardware control panels. Machined dark surfaces, LED glows, engineering typography, lit-stage composition. Use when the brief says VST, plugin, deck, mixer, cockpit, hardware, instrument, pro-audio, or wants a premium dark studio-grade interface.
---

# Instrument UI — Premium Hardware-Grade Interface Design

Design interfaces that feel like flagship physical instruments: a VST plugin panel, a club CDJ, a studio mixing desk, a broadcast cockpit. The look is *machined, powered, and lit* — not flat-SaaS, not glassmorphism, not neon-cyberpunk.

## The Secret Sauce (non-negotiable core)

1. **Blue-black anodized ramp.** Every dark value is hue-shifted toward blue (~hue 220, low saturation). Never neutral gray — neutral grays read cheap, blue-tinted darks read anodized aluminum.
2. **The milled bevel.** Every raised surface = vertical gradient + a 1px light edge on top + a hard small shadow below. Every recessed surface = inset dark shadow at top. This 1px-light/2px-dark asymmetry is what makes a `div` feel like milled metal.
3. **LED glow discipline.** Glows are tight (6–8px, or larger at negative spread), and only on powered, active, or interactive-lit elements. Real LEDs do not cast 40px light pools.
4. **Engineering typography.** UPPERCASE + wide tracking for labels, tabular numerals for every readout, a squarish techno display face, a condensed bold for dense labels, monospace for values.
5. **Machined radii.** 3px default, 6px "large". Only physically round things (knobs, jog wheels, indicator dots) get 50%; only pills/status dots get 999px.
6. **Stage, not scroll.** Compose the product as one instrument on a lit stage — a fixed-coordinate instrument canvas with overlays — not a column of rounded cards.
7. **Restraint.** Flat is the default state; bevel and glow are earned by interactivity or power. Premium = precision and consistency of the system, not decoration density.

## 1. Design tokens (copy this foundation)

```css
:root {
  /* Anodized value ramp — dark to light. Every "gray" is blue-tinted. */
  --s-0: #060709;  /* the void / page background */
  --s-1: #0b0d11;  /* well, meter track, socket */
  --s-2: #12151a;  /* panel base */
  --s-3: #1a1e25;  /* raised control surface */
  --s-4: #242932;  /* bright trim, borders on hover */
  --s-5: #2f3540;  /* specular trim, metallic text */

  /* Ink — three steps of desaturated blue-gray, never pure white (reserve white for "hot" peaks) */
  --text:       #e8ecf2;
  --text-dim:   #9aa4b2;
  --text-faint: #5f6875;
  --white-hot:  #ffffff; /* peaks, active LED cores only */

  /* Hairlines */
  --line:       #2b313b;
  --line-soft:  #1d222a;

  /* One working accent per context + fixed utility hues */
  --amber: #ff9d16;  /* primary action / power */
  --blue:  #1f8fff;  /* secondary mark */
  --green: #22d07a;  /* ready / signal-good */
  --red:   #ff3b47;  /* record / hot / danger */
  --teal:  #2fd4a8;
  --violet:#a882ff;
  --pink:  #ff6bc4;

  /* Machined radii */
  --radius: 3px;
  --radius-lg: 6px;

  /* The milled bevels */
  --raise: inset 0 1px rgba(255,255,255,.12), 0 2px rgba(0,0,0,.7);      /* raised surface */
  --raise-soft: inset 0 1px rgba(255,255,255,.06), 0 1px 3px rgba(0,0,0,.5);
  --well: inset 0 2px 6px rgba(0,0,0,.6);                               /* recessed socket */
  --well-soft: inset 0 1px 2px rgba(0,0,0,.6);
  --gloss: linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.02));

  /* LED glow (tight!) */
  --glow: 0 0 8px var(--green);                       /* lit LED */
  --ring: inset 0 0 0 1px color-mix(in srgb, var(--key) 40%, transparent),
          0 0 18px -6px var(--key);                    /* active panel ring */

  /* Type */
  --display: "Chakra Petch", "Rajdhani", "Michroma", system-ui, sans-serif; /* squarish techno */
  --soft:    "Outfit", "Inter", -apple-system, system-ui, sans-serif;       /* prose */
  --cond:    "Barlow Condensed", "Oswald", sans-serif;                     /* dense labels, 700 */
  --mono:    ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace;  /* values */
}
```

Font picks: the display face must be squarish/technical (Chakra Petch, Rajdhani, Saira Semi Condensed, Michroma). Free CDN-hosted via Google Fonts; self-host for production. If the project already has fonts, map the closest: geometric/technical sans → display, neutral sans → soft.

## 2. Typography laws

- **Labels**: uppercase, tracking `.08em–.24em`. The smaller the label, the wider the tracking (8px label → `.08em`; tiny 8–10px micro-labels sit under knobs at exactly `.08em`, 8px mono).
- **Every numeric readout**: `font-variant-numeric: tabular-nums` in `--mono`. BPM `128.00`, time `01:23:45.6`, level `-6.2 dB` never reflow as they tick.
- **H hierarchy**: display face for the instrument name/title only; everything else is small caps engineering labels. Prose (if any) in `--soft`, normal case, tracking `.01em–.02em`.
- **Metallic text** for one or two special labels: `background: linear-gradient(180deg, #fff 0 22%, #8792a3); -webkit-background-clip: text; color: transparent;`
- **Ink discipline**: default `--text-dim` for labels; `--text` for live values; `--text-faint` for annotations; `--white-hot` only for active peaks. Never pure white body text — it glares.

## 3. Surface laws (the milled bevel system)

**Raised surface** (panel, button, knob cap):
```css
background: var(--gloss), linear-gradient(180deg, #191d25, #10141a);
box-shadow: var(--raise);
border-radius: var(--radius);
border: 1px solid var(--line);
```

**Recessed well** (screen bezel, meter track, fader slot, socket):
```css
background: var(--s-1);
box-shadow: var(--well);
border: 1px solid var(--line-soft);
border-radius: var(--radius);
```

**Display/screen** (the "LCD in the bezel"): a well + an inner screen of near-black with a faint tint of the accent and slightly larger radius than its bezel:
```css
background: linear-gradient(180deg, #080a0e, #0c0f15);
box-shadow: var(--well-soft), inset 0 0 0 1px rgba(0,0,0,.8);
border-radius: 4px; /* inside a 6px bezel */
```

Laws:
- Gradients are only ever `180deg` (light from above). No diagonal gradients, no 45° sheens.
- Panel bodies are `--s-2`; controls on them are `--s-3`+gloss; wells cut to `--s-1`. Three depth planes maximum, always the same direction of light.
- Hairlines everywhere: 1px `--line` on raised, 1px `--line-soft` on wells. Borders are seams, not outlines — never 2px.
- Accent-colored controls (record arm, hot cues) tint via `color-mix(in srgb, #fff 22%, var(--red))` tops over the accent gradient body — a lit plastic cap, not a flat red fill.

## 4. The LED and glow system

- **Off state**: `--s-3` dot, hairline border, no glow.
- **On state**: accent core (`--white-hot` center only for "hot"), plus `box-shadow: 0 0 8px var(--accent)`.
- **Active module ring** (e.g., selected deck, armed channel): `var(--ring)` — a 1px inset tinted ring + tight outer glow at negative spread.
- All accent-derived washes: `color-mix(in srgb, var(--key) X%, transparent)` with X from the calibrated set **13 / 16 / 28 / 40** (wash / hover tint / glow tint / ring). Never eyeball a new rgba.
- Meter segments stack: good range green, warn amber (~80%), hot red (top 2 segments), each segment `--glow`-lite when lit. Unlit segments are barely visible `--s-3` on `--s-1` track.

## 5. Component recipes

**Knob** (SVG or canvas, 40px, `cursor: ns-resize`, drag to change value):
machined cap = radial-gradient ring + darker hub:
```css
background: radial-gradient(circle, #0b0e13 0 22%, #2a303a 23% 26%, #12161c 27% 90%, #2a303a 91%);
border-radius: 50%;
box-shadow: 0 1px rgba(255,255,255,.35) inset, 0 2px 4px rgba(0,0,0,.7);
```
Draw a pointer line from center to edge in `--text`; when active, pointer is `--key` with a 6px glow. Tick arc (the value range) as hairline `--text-faint` dots or 1px ticks around, 270° sweep. Label below: 8px mono uppercase `.08em` `--text-faint`, plus live value in tabular-nums.

**Fader/level meter**: 7px wide track, `--s-1` + `--well` + 1px `--line` border + 2px radius; cap/thumb is a 20–28px machined bar with a center hairline groove; value readout adjacent in mono tabular-nums.

**Button/pad**: raised surface recipe; `:hover` lifts gloss to `.16`; `:active` inverts to `--well` (pressed = recessed — the physical metaphor); `.on` gets the ring + glow. Hot-cue pads: accent tint per bank.

**Jog wheel** (rotary hero element): 50% radius, spin a conic or radial brushed texture, outer hairline ring, center display. Rotation is a `transform` on the texture layer only; caps (play/cue markers) are separate absolutely-positioned sprites.

**Screen module** (track title browser, wave display): the screen recipe, then inside: wave = layered canvas with peak+RMS in two ink steps; grid ticks every 16 beats in `--text-faint`; playhead = 1px `--white-hot` + 6px glow, with a 560px soft radial follow-light around it.

**Pedal/FX block** (the stompbox row): panels sit on a darker sub-strip; each pedal is a small raised panel with one knob, one LED, one footswitch-style button; engaged = LED glow + ring.

**Status pill**: 999px, 10px mono uppercase, 1px border `--line`, dot LED + text in `--text-dim`.

## 6. Stage composition (the page)

The page is a **stage**; the instrument is **lit** on it:

```css
body {
  background:
    radial-gradient(900px 520px at 50% 40%, rgba(30,22,60,.55) 0%, transparent 72%),
    radial-gradient(1500px 800px at 50% 50%, #06060e, #010103 78%),
    #060709;
}
```

- Two or three large soft radial washes (400–1500px) of *tinted, low-alpha* light — violet/amber/blue — at off-center positions. They tint the void; they never read as "a gradient background block".
- A **vignette** over the stage: `radial-gradient(122% 92% at 50% 50%, transparent 34%, rgba(0,0,0,.62) 100%)` — darker corners focus the instrument.
- Compose the instrument as one **fixed-coordinate canvas** (e.g., a 2048-unit-wide master composition scaled to viewport) with absolutely-positioned overlays — not a responsive stack of cards. Responsive = scale the composition, then reflow side panels.
- If imagery of the physical unit exists (photo/render), position interactive overlays in its coordinate space and light the UI to match its scene. If not, build the unit purely from the panel recipes — it must still read as *one object*.
- Ambient scene layer (optional): a very dark looping video or animated canvas behind/beside the instrument (e.g., slow starfield, club haze) at ≤65% darkness overlay. It is set dressing; it must never compete with the instrument.

## 7. Motion laws

- Motion is **mechanical, not bouncy**: `cubic-bezier(.22, 1, .36, 1)` for tours/highlights, 120–250ms for control feedback.
- LEDs and meters update instantly (0ms) — they are indicators, not animations. Meter ballistics: fast attack, slow release (~600ms decay).
- Hover: gloss lift + 1px border to `--s-5`; never scale-transform buttons (metal doesn't stretch). Knob/fader drags: `ns-resize` cursor, value flies in a mono tooltip beside the control.
- Playheads/scanlines move at their real rate with a tight glow; nothing floats or pulses at rest except one "power" tell (e.g., a breathing record-arm LED at 2–4s period, ±10% opacity).

## 8. Banned (anti-slop rules)

- No neutral gray ramps (`#111,#222,#333` etc.), no pure black text, no `#fff` body text.
- No rounded-12px+ cards, no `shadow-lg` diffused blobs, no drop shadows on text.
- No 45°/135° gradients, no rainbow conics, no glassmorphism blur cards, no neon outline "cyberpunk" borders.
- No glow on inactive/unpowered elements; no glow larger than ~18px spread.
- No rounded icon-language mixing: icons are either engineering glyphs (SVG strokes, 1.5px, `--text-dim`) or none — labels carry the meaning.
- No emoji, no friendly rounded display fonts (Nunito, Poppins as display), no `letter-spacing` under `.04em` on uppercase labels, no proportional digits in any readout.
- No card grids with equal-height tiles. The layout is an instrument face: asymmetric, functional clusters (deck left, mixer center, deck right), each cluster dense and purposeful.

## 9. Quality gate (pre-flight)

1. Squint test: does the page read as one physical object on a lit stage? If it reads as "a dark website", fix the bevels and stage lighting first.
2. Every raised element has the 1px top light edge; every well has the inset dark top. No exceptions, no double borders.
3. Every number is tabular mono; every label is uppercase tracked. One display font, one soft font, one cond font, one mono.
4. Glows only on powered/active/interactive elements, all built from `color-mix` of `--key`.
5. Radii audit: only 2/3/4/6px, 50%, 999px exist in the CSS.
6. Dark values all sit on the blue-tinted ramp — paste the ramp, never hand-pick a gray.
7. Interactions press *into* the surface (`:active` = well), never pop out.
