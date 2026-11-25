# Summit General Hospital — Figma design

Because Figma files live inside your Figma account, I can’t create a `.fig` file directly for you. Instead, this package includes a **Figma development plugin** that builds the design inside your own Figma file in about a minute.

**Download:** [`summit-general-hospital-figma-plugin.zip`](summit-general-hospital-figma-plugin.zip)

The result is fully editable: every headline, paragraph, button label, card and colour swatch is a real Figma layer, with local colour styles and text styles.

> **Current brand vs. plugin brand:** the website in `src/` now uses a deep teal-blue
> (`#084F6C`) on cool off-white (`#F5FAFB`), with mint (`#A6E8E4`) and teal (`#0091A4`)
> accents, and a single variable **Montserrat** family for both headings and body text.
> The bundled plugin still builds the project's earlier evergreen (`#0C3B33`) and
> Fraunces/Manrope screens, so its colours and typography do not match the live site.
> To bring a Figma file in line, run the plugin and then restyle the swatches and text
> styles on the `Summit — Design system` page with the values above.

---

## What the plugin creates

Two new pages in your Figma file:

### `Summit — Website`

| # | Screen | Size |
| --- | --- | --- |
| 01 | Home | 1440 × 7716 |
| 02 | Services | 1440 × 3756 |
| 03 | Doctors | 1440 × 2616 |
| 04 | Appointment | 1440 × 2096 |
| 05 | Contact | 1440 × 3096 |
| 06 | About | 1440 × 4566 |
| 07 | Your visit | 1440 × 3486 |
| 08 | Home — Mobile | 390 × 2364 |
| 09 | Appointment — Mobile | 390 × 1734 |

The screens are laid out left-to-right on the canvas with labels above each frame.

### `Summit — Design system`

A separate page containing:

- 12 colour swatches from the earlier brand palette (Paper, Sand, Evergreen, Clay, Gold, Ink, Mint, Emergency and more) — not the current teal palette, see the note above
- Fraunces and Manrope type specimens (the site itself now uses Montserrat only)
- Primary, outline and emergency button styles
- Form fields, tags and checkbox pattern
- Service card, doctor card and patient story card examples
- 24 line icons — the set the design uses, drawn from the live site's larger icon sprite

All colours and type are saved as **local Figma styles** under the `Summit / …` namespace for reuse. The screens use the same values directly, so you can select a layer and apply a style when you want to standardise it.

---

## Install and run

### 1. Use the Figma desktop app

Local development plugins require the **Figma desktop app**. The browser version cannot import a local plugin manifest. The desktop app is free.

### 2. Unzip the package

You should have:

```
manifest.json
code.js
README.txt
```

Keep these three files together.

### 3. Create a new Figma design file

Use a new file rather than an important existing file. The plugin only adds new pages, but a fresh file is the cleanest place to start.

### 4. Import the plugin

In Figma:

**Menu → Plugins → Development → Import plugin from manifest…**

Select `manifest.json`.

### 5. Run it

**Menu → Plugins → Development → Summit General Hospital — Design Builder**

Wait a few seconds while the frames are generated. When it finishes, you’ll see:

> Summit design created: 9 screens plus a design system.

The new pages appear in the **Pages** panel on the left.

---

## Fonts

The plugin is intended to use:

- **Fraunces** for display and headings
- **Manrope** for body, labels and buttons

The published website has since switched to a single **Montserrat** variable family for both headings and body text. If you want the Figma file to match the site, apply Montserrat to both the display and body text styles after running the plugin.

Figma usually has both in its Google Fonts library. If they are not available, the plugin falls back to a serif and sans-serif that are installed, and the completion message tells you which ones it used.

To get the exact typography:

1. Open any text layer.
2. Open the font picker.
3. Add **Fraunces** and **Manrope** from Google Fonts.
4. Re-run the plugin in a fresh file, or update the saved text styles in the `Summit — Design system` page.

The design’s 12 colour styles and text styles are local to the file and can be edited under **Local styles**.

---

## Editing tips

- Use the **Pages** panel to switch between `Summit — Website` and `Summit — Design system`.
- Each section is a frame named `Section / …` (for example `Section / Hero`).
- Cards are named by content, e.g. `Service / Cardiology`, `Doctor / Dr. Million Seid Muzeyen`.
- Images are image fills on rectangles. Select the rectangle, then replace the fill from the right-hand panel.
- Buttons use **Auto Layout** so longer labels can expand; tags are fixed-size pills. If a label wraps unexpectedly, select the button frame and set the primary axis to **Hug contents**.
- The saved colour and text styles are a reusable palette. To apply one, select a layer and choose it from the Local styles panel; to update a whole screen, select the layers and apply the style you want.

### Moving screens

The frames are at these x positions on the Website page:

```
Home          0
Services      1600
Doctors       3200
Appointment   4800
Contact       6400
About         8000
Your visit    9600
Mobile Home   11200
Mobile Appt   11650
```

Select a frame and press **Shift + 2** to zoom to it.

---

## Re-running the plugin

The plugin always creates **new pages**; it never overwrites your work. If you run it twice, you’ll get a second `Summit — Website` page and a second design system page. Delete the old ones if you want a clean file.

---

## What is intentionally not in the Figma file

This is a design file, not a working website.

- The appointment flow is shown as **step 1** on desktop and mobile. The working four-step flow, validation and confirmation exist in the HTML site.
- Only two mobile screens are included as responsive direction. Desktop frames can be duplicated and adapted for the remaining mobile pages.
- No prototype connections are set up. You can add them in Figma’s Prototype panel.
- Photography is the same licensed stock imagery used on the website. Replace it with real Summit photography before publishing.
- All names, hours, services, testimonials and statistics are **sample content**. Verify them against the hospital’s actual information before using the design publicly. The main `README.md` contains the full pre-launch checklist.

---

## Troubleshooting

**“Import plugin from manifest” is missing**
You’re probably in the browser version. Open the Figma desktop app and try again.

**The plugin is greyed out or won’t run**
Check that all three files (`manifest.json`, `code.js`, `README.txt`) are in the same folder and that you selected `manifest.json`, not `code.js`.

**Fonts look different**
Fraunces and Manrope are not installed/available in your Figma. Add them from Google Fonts, or accept the fallback; all text remains editable. Note that the live site uses Montserrat, so a Fraunces headline is expected to look different from the website.

**A button label wraps**
Select the button frame and set its primary axis sizing to **Hug contents** in the Auto Layout section. This can happen if you edit a label to be longer than the original.

**I got “Cannot call with documentAccess: dynamic-page. Use setTextStyleIdAsync instead”**
That was a bug in the first build of this plugin. Import the updated package from this folder and use a fresh file. The text styles are still saved as local styles, but the plugin now applies the typography values directly so it does not hit that restriction.

**The plugin runs but nothing appears**
Look at the Pages panel — the plugin creates new pages rather than drawing on the current page. Also check the layer list on `Summit — Website`; the frames may be far to the right (x = 1600, 3200, …).

**I need the remaining mobile pages**
Duplicate a desktop section into a 390px frame and use the existing `Mobile Home` and `Mobile Appointment` frames as the responsive pattern. The same colour and text styles apply.
