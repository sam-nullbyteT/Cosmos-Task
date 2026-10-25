---
name: Orbital Neumorphic Focus
colors:
  surface: '#0f0645'
  surface-dim: '#0f0645'
  surface-bright: '#36326c'
  surface-container-lowest: '#090041'
  surface-container-low: '#17114d'
  surface-container: '#1b1651'
  surface-container-high: '#26225c'
  surface-container-highest: '#312d67'
  on-surface: '#e3dfff'
  on-surface-variant: '#c8c5d2'
  inverse-surface: '#e3dfff'
  inverse-on-surface: '#2d2863'
  outline: '#928f9c'
  outline-variant: '#474551'
  surface-tint: '#c4c0ff'
  primary: '#c4c0ff'
  on-primary: '#2a2473'
  primary-container: '#8c88db'
  on-primary-container: '#231c6c'
  inverse-primary: '#5955a4'
  secondary: '#c7c1ef'
  on-secondary: '#2f2c50'
  secondary-container: '#48456b'
  on-secondary-container: '#b9b3e0'
  tertiary: '#ffb2b9'
  on-tertiary: '#67001e'
  tertiary-container: '#f06076'
  on-tertiary-container: '#5b001a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c4c0ff'
  on-primary-fixed: '#13085e'
  on-primary-fixed-variant: '#413c8a'
  secondary-fixed: '#e4dfff'
  secondary-fixed-dim: '#c7c1ef'
  on-secondary-fixed: '#1a173a'
  on-secondary-fixed-variant: '#464268'
  tertiary-fixed: '#ffdadc'
  tertiary-fixed-dim: '#ffb2b9'
  on-tertiary-fixed: '#400010'
  on-tertiary-fixed-variant: '#8c1231'
  background: '#0f0645'
  on-background: '#e3dfff'
  surface-variant: '#312d67'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Montserrat
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  title-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-pill:
    fontFamily: Montserrat
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.14em
  label-caption:
    fontFamily: Montserrat
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1.25rem
  margin-tablet: 2rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 1.75rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends tactile soft-extrusion (neumorphism) with an ethereal, deep-space visual metaphor tailored for high-focus task management and deadline adherence. The user experience is crafted to evoke calm focus, weightless efficiency, and tactile delight—transforming deadline anxiety into an ambient, orbital mission where completing tasks feels like calibrating instruments in a sleek space capsule.

### Target Audience & Emotional Intent
- **Audience:** Digital-first professionals, creatives, and students seeking a high-personality task cockpit that departs from generic flat productivity tools.
- **Tone & Mood:** Ambient, futuristic, tactile, and reassuring. Interactions communicate spatial presence through dual-light casting, pill-shaped cockpit toggles, and planetary visual anchors.

### Visual Aesthetic & Movement
- **Atmospheric Neumorphism:** Tactile extruded surfaces emerging from deep indigo space, illuminated by an overhead celestial rim light (soft white-lavender highlights) and deep space cast shadows.
- **Layered Dimensions:** Structural mission cards feature notched or tabbed outlines with large radii (28px to 36px), accented by floating 3D orbital assets (planets, astronauts, capsules) that partially break bounding containers to create depth.

## Colors

The palette establishes an orbital cockpit environment using multi-tiered tonal surfaces paired with cosmic semantic signals.

### Surface System
- **Cosmic Canvas (`#5E5A97`):** The default ambient ground plane upon which all neumorphic extrusions, tabs, and modals seat.
- **Primary Surface / Main Cards (`#7B77C9`):** Medium-violet raised platform for core task groupings, timelines, and primary workflows.
- **Light Surface / Hero Cards (`#CFC9F7`):** Pale-lavender elevated surface used for priority mission focal points, stats, and high-readability overview widgets.
- **Deep Chamber Surface (`#34306B`):** Recessed or commanding navy-purple used for timer displays, countdown trackers, and high-contrast night panels.

### Typography & Content Tones
- **Soft Light Ink (`#EDE9FF`):** Used across canvas, primary cards (`#7B77C9`), and deep chamber cards (`#34306B`) for crisp readability under low-light ambient conditions.
- **Deep Cosmic Ink (`#2E2A5E`):** Reserved strictly for typography, icons, and status glyphs placed on top of light lavender cards (`#CFC9F7`).

### Mission Status Accents
- **Overdue / Critical (`#FF6B81`):** Soft coral red; denotes elapsed deadlines, urgent priority flags, and destructive actions.
- **Complete / Nominal (`#6BCB9F`):** Mint sage; indicates finished milestones, streak counters, and positive momentum.
- **Pending / In Orbit (`#74B9FF`):** Sky periwinkle; represents in-progress schedules, floating dates, and synchronized events.

## Typography

The typography centers on Montserrat, leveraging its geometric construction to reinforce an architectural, space-cockpit aesthetic.

### Rules & Hierarchy
- **Header Treatments:** Primary headings (`headline-xl`, `headline-lg`) utilize gradient fills transitioning from pure white (`#FFFFFF`) to soft lavender (`#EDE9FF`) or subtle coral transitions for high-impact screens. 
- **Script Accents:** Decorative section titles and motivational markers pair Montserrat headers with an occasional expressive script accent inline (such as "Today’s *Mission*" or "Launch *Velocity*") to balance technical precision with human warmth.
- **Pill & Tag Formatting:** `label-pill` must always be rendered in full uppercase with expanded tracking (`0.14em`) to ensure legibility when housed within embossed, glowing pill chips.

## Layout & Spacing

The layout embraces a mobile-first fluid vertical stack optimized for one-thumb task management and expansive tactile surfaces.

### Layout Mechanics
- **Grid Architecture:** 4-column fluid mobile grid transitioning to an 8-column layout on tablets. 
- **Screen Margin:** Strict `1.25rem` (20px) horizontal screen boundary preserving safe area padding on mobile devices, expanding to `2rem` on wide tablets.
- **Neumorphic Bleed & Safe Radii:** Because large rounded corners (28px - 36px) and soft extruded shadow halos require visual breath, vertical card spacing relies on `space-md` (20px) and `space-lg` (28px) to prevent multi-layered drop shadows from clipping.
- **Notched Header Overlaps:** Card headers intentionally extend upward using negative margins (`-12px` to `-16px`) when anchoring floating 3D planetary badges and orbital timeline indicators.

## Elevation & Depth

Visual hierarchy is constructed through directional lighting, soft 3D extrusion, and debossed cutouts rather than traditional flat drop shadows. The primary light source originates from the top-left (-45 degrees relative to vertical).

### Extrusion Archetypes

#### 1. Raised Surfaces (Cards & Modules)
Raised elements on canvas (`#5E5A97`) feature dual directional shadows:
- **Top-Left Highlight:** Soft white-lavender glow (`rgba(237, 233, 255, 0.45)`) with a blur of 16px to 20px and an offset of -8px, -8px.
- **Bottom-Right Cast Shadow:** Deep navy-indigo shadow (`rgba(35, 30, 75, 0.60)`) with a blur of 20px to 24px and an offset of 10px, 10px.
- **Subtle Inner Rim:** 1px border stroke with an inset linear gradient from `rgba(255, 255, 255, 0.3)` at the top edge to `rgba(52, 48, 107, 0.2)` at the bottom edge.

#### 2. Debossed / Inset Surfaces (Inputs, Progress Wells, Inactive Toggles)
Recessed surfaces appear cut into the base deck:
- **Top-Left Inset Shadow:** `inset 4px 4px 8px rgba(35, 30, 75, 0.55)`
- **Bottom-Right Inset Highlight:** `inset -4px -4px 8px rgba(237, 233, 255, 0.25)`

#### 3. Orbital Overlays (3D Planets & Astronaut Tokens)
Floating 3D elements overlap cards and project an ambient floating shadow:
- `0 18px 32px rgba(20, 15, 50, 0.50)` accompanied by a gentle cosmic rim light along the asset's curvature.

## Shapes

The design system employs an exaggerated soft geometry modeled after ergonomic spacecraft hardware and aerospace capsule interfaces.

### Curvature Values
- **Primary Cards & Containers:** Standardized between `28px` and `36px` border radii to soften large layout blocks and cradle content.
- **Pills & Buttons:** Fully curved pill morphology (`9999px` / `rounded-full`) for high-touch operational controls.
- **Embossed Icon Anchors:** Symmetrical square geometry with `16px` to `20px` corners, delivering a distinct squircle button profile.

### Architectural Tab Notches
Card headers regularly feature integrated architectural cutouts—asymmetrical tabs that rise out of the top surface to host priority tags, countdown badges, or date stamps without breaking the continuous capsule profile.

## Components

### Buttons
- **Action Pills:** Full capsule buttons (`padding: 14px 28px`) rendered in raised primary violet (`#7B77C9`) or soft lavender (`#CFC9F7`). Framed with a 1px delicate outline (`rgba(237, 233, 255, 0.5)`) and multi-layer neumorphic elevation. On press, transitions to an inset/sunken shadow profile.
- **Embossed Icon Buttons:** 48x48px square buttons with 16px radius. Extruded with soft dual shadows. Center icon glyph matches `#EDE9FF` with an optional 1px text-shadow halo.

### Cards & Notched Panels
- **Main Mission Card (`#7B77C9`):** Rounded to 32px. Features a tabbed top-right or top-left profile holding deadline countdowns. Text rendered in `#EDE9FF`.
- **Hero Milestone Card (`#CFC9F7`):** High-prominence cards with deep indigo typography (`#2E2A5E`). Inner glow border is tinted subtle white (`rgba(255, 255, 255, 0.8)`).
- **Deep Void Card (`#34306B`):** Anchored cards for timers and completed task vaults. Outlined with a soft periwinkle ambient edge.

### Chips & Status Indicators
- **Deadline Pill Tags:** Mini-pills with `label-pill` typography. Overdue tags use a translucent background of coral red (`rgba(255, 107, 129, 0.15)`) with an embossed `#FF6B81` border and bold text. Active milestones use sky periwinkle (`#74B9FF`). Complete tags use mint sage (`#6BCB9F`).

### Task Checkboxes & Completion Nodes
- **Orbital Orbit Nodes:** Circular 28px completion toggles. Unchecked: a debossed concave indentation in the card surface with a subtle central planetary ring icon. Checked: fills instantly with mint sage (`#6BCB9F`), transitioning from sunken to an extruded convex glowing sphere with an embossed white checkmark.

### Input Fields & Search Bars
- **Recessed Data Pods:** Debossed input bars featuring inset shadow wells. Placeholder text rendered in muted soft lavender (`rgba(237, 233, 255, 0.5)`). Active state activates a thin 1.5px periwinkle (`#74B9FF`) orbital boundary glow.

### Space Accents & Orbital Gauges
- **Radial Deadline Clock:** Circular progress tracks utilizing debossed track grooves with glowing neon status heads (coral, periwinkle, or mint).
- **Floating 3D Mission Badges:** Tinted monochrome 3D astronauts, planetary rings, and shuttle pods positioned at card peripheries, overlapping headers by 20% to reinforce dimensional flight layers.