# Design System Specification: Editorial Precision for Data

## 1. Overview & Creative North Star
**Creative North Star: The Monolith & The Ghost**

This design system rejects the "cluttered dashboard" aesthetic in favor of a high-end editorial experience. It treats SQL code as high-value content and data results as fine-print documentation. We achieve this through **Organic Brutalism**: a philosophy where structure is defined by heavy-weight typography and massive tonal shifts rather than thin lines or "web-standard" borders.

The interface should feel like a premium printed manual—sparse, intentional, and authoritative. By utilizing intentional asymmetry and wide-open gutters, we transform a technical tool into a sophisticated workspace that breathes.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep obsidian tones and electric accents. We leverage high-contrast ratios (4.5:1 minimum) to ensure accessibility without sacrificing the "premium" aesthetic.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using `1px` solid borders to separate major UI sections (e.g., Sidebar from Editor). Boundaries must be defined solely through background color shifts. 
*   **Editor Area:** `surface` (#131313)
*   **Results Pane:** `surface_container_low` (#1c1b1b)
*   **Sidebar/Navigation:** `surface_container_lowest` (#0e0e0e)

### Surface Hierarchy & Nesting
Instead of a flat grid, treat the UI as stacked sheets of fine paper:
*   **Level 0 (Base):** `surface`
*   **Level 1 (Navigation/Sidebar):** `surface_container_low`
*   **Level 2 (Modals/Floating Menus):** `surface_container_high` with `backdrop-blur`
*   **Level 3 (Toasts/Popovers):** `surface_bright`

### The "Glass & Gradient" Rule
To prevent the UI from feeling "dead," use subtle gradients for primary actions. A button should not just be `primary`; it should transition from `primary` (#b8c3ff) to `primary_container` (#2e5bff) at a 135-degree angle. Floating elements (like command palettes) must use **Glassmorphism**: `surface_container_highest` at 80% opacity with a `20px` backdrop-blur.

---

## 3. Typography
We use a tri-font system to create a distinct hierarchy between Command (SQL), Interface (UI), and Data (Labels).

*   **The Command (Editor):** `Fira Code`, 14px minimum. Ligatures enabled. This is the "Hero" of the interface.
*   **The Headline (Navigation/Titles):** `Manrope`. Use `headline-sm` (1.5rem) for view titles to give an editorial, bold feel.
*   **The Interface (UI):** `Inter`. Used for all functional body text (`body-md`) and title tags (`title-sm`).
*   **The Data (Metadata/Labels):** `Space Grotesk`. Use `label-sm` for table headers and tiny metadata. Its monospaced-adjacent feel links the UI to the data world.

---

## 4. Elevation & Depth
Depth is a tool for focus, not just decoration.

*   **Tonal Layering:** Forgo shadows for internal UI elements. A `surface_container_highest` card sitting on a `surface` background creates a "Soft Lift" that feels integrated.
*   **Ambient Shadows:** For floating elements (Toasts, Context Menus), use a massive, diffuse shadow: `0px 24px 48px rgba(0, 0, 0, 0.4)`. The shadow color must be a tinted version of `on_surface` to mimic natural light.
*   **The "Ghost Border" Fallback:** If a separator is required for accessibility, use the `outline_variant` token at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### The SQL Editor
*   **Keywords:** `primary` (#b8c3ff)
*   **Strings:** `secondary` (#4ae183)
*   **Numbers:** `tertiary` (#ffb783)
*   **Comments:** `outline` (#8e90a2)
*   **Errors:** `error` (#ffb4ab) with a jagged underline.
*   **Active Line:** Highlighted via `surface_container_highest` background shift; no border.

### Buttons & Actions
*   **Primary Action:** Gradient fill (`primary` to `primary_container`). `0.25rem` (sm) roundedness. 
*   **Ghost Action:** No background, `on_surface` text. On hover, shift background to `surface_variant`.
*   **Execution Button:** Use `secondary` (#4ae183) for "Run" to signify success/start.

### Data Tables (The "No-Divider" Grid)
*   **Body:** `surface_container_low`. 
*   **Headers:** `label-md` in `Space Grotesk`, all-caps, `0.1em` tracking. 
*   **Separation:** Use `1.5` (0.3rem) vertical spacing scale between rows instead of divider lines. Alternating row colors is forbidden; use subtle hover states (`surface_container_high`) to track rows.

### Adjustable Split Panes
*   **The Gutter:** A `4px` wide area. On hover, the gutter glows with a `primary` (#b8c3ff) line. When idle, it is invisible, marked only by the change in surface color between the editor and results.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Negative Space:** Use the `24` (5.5rem) spacing token for outer margins to make the SQL code feel like a poem on a page.
*   **Use Tonal Transitions:** Transition from `surface` to `surface_container_low` to denote a change in function (e.g., from Editor to Results).
*   **Prioritize Typography:** Let a large `headline-md` title do the work that a heavy header bar usually does.

### Don't:
*   **Don't use Zebra Stripes:** Never use alternating grey/white rows in tables. Use white space and typography to guide the eye.
*   **Don't use "Pure" Black:** Use `surface` (#131313) to allow for depth layering. Pure #000000 kills the ability to create "Lower" containers.
*   **Don't use standard Tooltips:** Tooltips should be `surface_bright` with `label-sm` text, appearing with a `200ms` ease-out transform.

---

## 7. Interaction States
*   **Hover:** All interactive elements should elevate by one `surface_container` tier (e.g., from `low` to `high`).
*   **Focus:** Focused inputs get a `2px` `surface_tint` outer glow—no harsh solid offsets.
*   **Success/Error:** Use `secondary` and `error` tokens. For "Success" toasts, use a `secondary_container` background with `on_secondary_container` text for a sophisticated, low-vibrancy alert.