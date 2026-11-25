SUMMIT GENERAL HOSPITAL — FIGMA DESIGN BUILDER
================================================

What this is (updated build)
---------------------------
A local Figma development plugin that creates an editable Figma design for
Summit General Hospital inside your own Figma file:

  • 9 screens: Home, Services, Doctors, Appointment, Contact, About and
    Your Visit on desktop (1440px), plus Home and Appointment on mobile (390px)
  • a separate "Summit — Design system" page with colour swatches, type
    specimens, buttons, form fields, tags, icons and example cards
  • reusable local Figma colour styles and text styles
  • all photography embedded; everything is editable

The design mirrors the HTML/CSS site in this project, but Figma is a design
file, not a working booking system. The HTML site remains the source of truth
for interactions, forms and responsive behaviour.


How to install it (about one minute)
------------------------------------
1. Download and unzip this folder.
2. Open the Figma desktop app (local development plugins require the
   desktop app; the browser version cannot load a local manifest).
3. Create a NEW Figma design file. Do not run this in an important file.
4. In Figma: menu → Plugins → Development → Import plugin from manifest…
5. Select manifest.json from this folder.
6. Run: menu → Plugins → Development → Summit General Hospital — Design Builder.

The plugin creates two new pages:

  "Summit — Website"          the screens, laid out side by side
  "Summit — Design system"    colours, type and UI components

Open the Pages panel (top-left) to move between them. Use Shift+1 to fit the
current screen, or select a screen and press Shift+2.


Fonts
-----
The plugin tries to use:
  • Fraunces (headlines)
  • Manrope (body and UI)

If those fonts are not available in your Figma, it falls back to a serif and
sans-serif that are available and tells you which ones it used. To get the
exact look, add Fraunces and Manrope from Google Fonts in Figma's font picker,
then re-run the plugin in a fresh file.

The type and colour choices are saved as reusable local styles. The screens
use the same values directly; select a layer and apply a style when you want
to standardise it.


Editing
-------
Every headline, paragraph, button label and caption is a real Figma text layer.
Frames are named by section (e.g. "Section / Hero", "Service / Cardiology").
Images are image fills on rectangles; replace them from the Fill panel.

The screens are arranged left-to-right on the Website page:

  01 Home        0
  02 Services    1600
  03 Doctors     3200
  04 Appointment 4800
  05 Contact     6400
  06 About       8000
  07 Your visit  9600
  08 Mobile Home 11200
  09 Mobile Appt 11650

Re-running the plugin creates another new page. Delete the old page if you
want a clean start.


What is intentionally not included
----------------------------------
• Interactive prototypes for the multi-step form (the HTML site has the full
  four-step flow and validation).
• Tablets / every mobile page. The mobile Home and Appointment frames show the
  responsive direction; the desktop frames can be duplicated and adapted.
• Real Summit photography. The embedded images are the same licensed stock
  images used on the website and should be replaced with real facility/team
  photos before publishing.
  • Doctor cards show the hospital's four real consultants, with their
  portraits embedded from the website. Hours, services and testimonials
  should still be verified before using this design publicly. See the main
  project README for the full checklist.

If you want the remaining mobile screens or prototype links added, the same
component patterns can be extended.
