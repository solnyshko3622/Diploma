# Design System Specification: High-Precision SQL Editorial

## 1. Overview & Creative North Star: "The Digital Architect"
This design system rejects the cluttered, "dashboard-heavy" aesthetic of traditional database tools. Our Creative North Star is **The Digital Architect**: an environment that feels like a high-end, physical drafting table. It prioritizes mental clarity through immense negative space, intentional asymmetry, and the total removal of traditional UI "noise" like borders and heavy shadows. 

By utilizing a high-contrast typography scale against a soft, expansive off-white canvas, we transform a technical utility into a premium editorial experience. We don't just "show data"; we "curate insights."

---

## 2. Colors & Surface Philosophy
The palette is rooted in a clinical yet inviting off-white (#F8F9FB), punctuated by a high-performance Brand Blue (#2E5BFF).

### The Surface Hierarchy (Nesting over Bordering)
*   **Surface (Base):** `#F8F9FB` – Use for the primary application canvas.
*   **Surface Container Low:** `#F2F4F6` – Use for secondary sidebars or non-active editor panes.
*   **Surface Container Lowest:** `#FFFFFF` – Use for the primary SQL Editor "sheet" and high-focus cards.
*   **Surface Container High:** `#E7E8EA` – Use for "pressed" states or subtle metadata footers.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section the UI. Separation must be achieved through background shifts. For example, the SQL editor (Surface Container Lowest) should sit atop the main workspace (Surface) to create a natural, "elevated paper" feel without a single stroke.

### The "Glass & Gradient" Rule
To elevate the "Primary" actions, use a subtle linear gradient on main CTAs (e.g., `primary` to `primary_container`). For floating modals or "Command Palettes," use Glassmorphism:
*   **Backdrop Blur:** 12px–20px.
*   **Fill:** `surface_container_lowest` at 85% opacity.

---

## 3. Typography: Editorial Precision
We pair the geometric humanism of **Manrope** for the interface with the technical rigor of **Fira Code** for the data.

*   **Display Large (Manrope, 3.5rem):** Used for empty-state hero headers or major section transitions.
*   **Headline Small (Manrope, 1.5rem):** For Database Schema names and Query Titles. 
*   **Title Medium (Manrope, 1.125rem):** For active tab labels and primary modal headers.
*   **Body Medium (Manrope, 0.875rem):** The workhorse for metadata, properties, and settings.
*   **Code (Fira Code, Variable):** 
    *   **Keywords:** `primary` (#0040E0) - *High Authority*
    *   **Strings:** `tertiary` (#784B00 / Adjusted Green variant) - *Natural Clarity*
    *   **Numbers:** `on_tertiary_fixed_variant` (#653E00 / Adjusted Orange) - *Calculated Contrast*
    *   **Comments:** `secondary` (#545F73) - *Intentional Recess*

---

## 4. Elevation & Depth: Tonal Layering
Depth in this system is a measure of focus, not physical height.

*   **The Layering Principle:** Stack `surface_container_lowest` (#FFFFFF) components onto `surface` (#F8F9FB) backgrounds. This creates a "soft lift" that feels architectural.
*   **Ambient Shadows:** For floating elements (menus, tooltips), use:
    *   `box-shadow: 0 12px 40px rgba(25, 28, 30, 0.06);` 
    *   The shadow is never black; it is a diluted version of `on_surface`.
*   **The "Ghost Border" Fallback:** If accessibility requires a container definition (e.g., in a data grid), use `outline_variant` (#C4C5D9) at **15% opacity**. 

---

## 5. Components & Interaction Patterns

### Buttons
*   **Primary:** Gradient fill from `primary` to `primary_container`. `ROUND_FOUR` (0.25rem) corners. No border. Text is `on_primary`.
*   **Tertiary (Ghost):** No background. Text is `primary`. On hover, apply a `surface_container_low` background wash.

### Input Fields (The "Drafting" Style)
*   **Standard:** No bottom line or full border. Use a subtle `surface_container_high` fill. 
*   **Active:** The fill transitions to `surface_container_lowest` (#FFFFFF) with a 2px `primary_container` left-accent-bar to indicate focus.

### The SQL Editor Pane
*   **Styling:** Forbid dividers between line numbers and code. Use a 2.25rem (`spacing.10`) gutter of whitespace instead. 
*   **Active Line Highlighting:** Use `surface_container_low` as a full-width background bleed on the active cursor line.

### Data Result Tables
*   **The Divider Rule:** Forbid horizontal and vertical lines. Use alternating row heights or subtle tonal shifts (`surface` vs `surface_container_low`) to guide the eye.
*   **Header:** `label-md` in `secondary` color, all-caps with 0.05em tracking for a "technical blueprint" look.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. A wider left-hand margin in the editor creates a "notebook" feel that reduces cognitive load.
*   **Do** use `spacing.16` (3.5rem) between major functional groups to let the design "breathe."
*   **Do** use color sparingly. Blue is for *action* and *logic*; Slate is for *structure*.

### Don't
*   **Don't** use 100% black typography. It is too harsh for the `surface` background; always use `on_surface` (#191C1E).
*   **Don't** use standard "Material Design" drop shadows. They look "off-the-shelf." Stick to Tonal Layering.
*   **Don't** use dividers in lists. If items need separation, increase the `spacing` scale or change the background tone.

---

## 7. Signature Elements
*   **The Precision Cursor:** When hovering over executable SQL blocks, the cursor should change to a custom `primary` color crosshair, signaling high-precision interaction.
*   **The Subtle Glow:** Active status indicators (e.g., "Query Running") should not blink; they should use a soft "breathing" opacity animation (100% to 40%) on a `primary` colored dot.