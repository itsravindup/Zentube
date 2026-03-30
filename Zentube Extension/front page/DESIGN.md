# Design System Strategy: Premium Digital Meditation

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Translucent Sanctuary."** 

Moving beyond the fatigue of standard "Dark Mode" templates, this system treats the interface as a physical space composed of light, depth, and breath. We reject the rigid, boxed-in layouts of traditional video platforms in favor of an editorial, immersive experience. The goal is to make the user feel as though they are interacting with layers of dark glass and soft light rather than a database of content. 

We break the "template" look through:
*   **Intentional Asymmetry:** Using unbalanced white space to guide the eye toward focal points.
*   **Luminous Depth:** Replacing hard borders with soft, "inner-glow" lighting.
*   **Typographic Gravity:** Using a high-contrast scale where display titles feel like art pieces, and body text feels like a whisper.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep obsidian tones, punctuated by "Bioluminescent" accents that guide the user’s focus without causing eye strain.

*   **Primary (#50dea9) & Tertiary (#44dfab):** These are your "Glow" tokens. Use them sparingly for active states, progress bars, and high-importance CTAs.
*   **The "No-Line" Rule:** Under no circumstances should 1px solid borders be used to section off content. Sectioning must be achieved through **Tonal Shifting**. A sidebar should not have a line; it should simply sit on `surface_container_low` against a `surface` background.
*   **The Glass & Gradient Rule:** For primary actions or hero headers, use a subtle linear gradient from `primary` to `primary_container` (135° angle). This adds a "lithic" quality that flat hex codes cannot replicate.
*   **Surface Hierarchy (Nesting):** 
    *   **Base:** `surface_container_lowest` (#0e0e0e) for the deepest background.
    *   **Content Areas:** `surface` (#131313).
    *   **Interactive Cards:** `surface_container_low` (#1c1b1b).
    *   **Floating Menus:** `surface_bright` (#3a3939) with a 60% opacity and 20px backdrop-blur.

---

## 3. Typography: Editorial Zen
We use a pairing of **Manrope** (Display/Headline) for a modern, geometric soul and **Inter** (Title/Body/Label) for unparalleled readability.

*   **Display & Headlines (Manrope):** These should feel authoritative yet airy. Use `display-lg` (3.5rem) for "Welcome" states, ensuring letter-spacing is set to -0.02em to create a premium "tight" feel.
*   **The "Soft Glow" Header:** For featured video titles or categories, apply a text-shadow using the `primary` color at 15% opacity with a 12px blur. This creates a subtle "neon-in-fog" effect.
*   **Body & Labels (Inter):** Use `body-md` (0.875rem) as the workhorse. Ensure `on_surface_variant` is used for secondary metadata to push it into the background, maintaining the "distraction-free" promise.

---

## 4. Elevation & Depth: Tonal Layering
In this system, elevation is a function of light and opacity, not geometry.

*   **The Layering Principle:** Depth is achieved by stacking. A card (`surface_container_low`) placed on a `surface` background creates a natural lift. For child elements within that card, use `surface_container_high`.
*   **Ambient Shadows:** Traditional black shadows are forbidden. If a floating element (like a player controller) requires a shadow, use a 40px blur, 0px offset, and a color derived from `surface_container_highest` at 40% opacity. It should feel like a soft "bloom" rather than a drop shadow.
*   **Ghost Borders:** If accessibility requires a container edge, use the `outline_variant` token at **10-15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** All overlays (modals, search bars, floating nav) must use `backdrop-filter: blur(24px)`. This keeps the user tethered to their context while focusing on the task at hand.

---

## 5. Signature Components

### Minimal Search Bar
*   **Container:** `surface_container_low` with a `full` (9999px) radius.
*   **Interaction:** On focus, the background shifts to `surface_container_high`, and a subtle 4px "inner glow" of `primary` (at 10% opacity) appears.
*   **Iconography:** Use 20px thin-stroke icons in `on_surface_variant`.

### Video Cards & Playlists
*   **Structure:** No borders. `xl` (1.5rem) rounded corners.
*   **Spacing:** Use `spacing.6` (2rem) between cards.
*   **Metadata:** Title in `title-sm` (Inter), Metadata (views/time) in `label-md` using `on_surface_variant`. Avoid dividers; use a 0.5rem vertical gap instead.

### The "Zen" Progress Bar
*   **Track:** `surface_container_highest` at 30% opacity.
*   **Indicator:** A gradient from `primary` to `tertiary`. 
*   **Focus:** When active, the indicator should have a `primary_fixed` glow (blur: 8px) to mimic a light-pipe.

### Primary Action Buttons
*   **Style:** `lg` (1rem) rounded corners. 
*   **Color:** `primary_container` background with `on_primary_container` text.
*   **State:** On hover, increase brightness slightly and add a 2px "ghost border" of `primary_fixed`.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Negative Space:** If you think a section needs more content, it probably needs more padding (`spacing.12`).
*   **Use Micro-transitions:** All hover states should have a minimum 300ms cubic-bezier (0.4, 0, 0.2, 1) transition.
*   **Prioritize Typography:** Let the font size and color (High vs. Low emphasis) do the work of a divider.

### Don’t:
*   **Don't use pure white:** Use `on_surface` (#e5e2e1) for text to prevent "retina burn" in dark environments.
*   **Don't use hard edges:** The lowest radius allowed for any container is `md` (0.75rem).
*   **Don't use standard Dividers:** Never use a horizontal line to separate two pieces of content. Use the `spacing.8` or `spacing.10` tokens to create clear, breathable "zones."
*   **Don't use high-contrast shadows:** Shadows should be an extension of the background's darkness, not a black cutout.