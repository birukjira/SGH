# The static site (cPanel deliverable)

> This document describes the plain-HTML deliverable built from `src/` and `public/`
> into `dist/`, which is what runs on ordinary cPanel hosting. The repository also
> contains the Next.js app with a database and staff inbox in `web/` — start with the
> [main README](../README.md) and [`architecture.md`](architecture.md) for that one.
> Everything below (design tokens, `send.php`, accessibility, the pre-launch content
> checklist) applies to both deliverables unless it names cPanel specifically.

A complete, responsive, static website for **Summit General Hospital**, Summit 72, Lemi Kura, Addis Ababa.

It is built as plain HTML, CSS and JavaScript so it can be uploaded to any cPanel hosting account — no WordPress, Node.js or database required on the server. Appointment and contact forms are handled by a small PHP script that emails your team.

The design is intentionally editorial: a deep teal-blue brand colour on cool off-white paper, a single variable Montserrat family carrying both headlines and body text, and photography framed with arches that reference the Summit hills.

---

## Figma design

A Figma version is included as a **development plugin** that builds the design inside your own Figma file. It creates nine screens (seven desktop, two mobile) plus a design-system page with reusable colour/type styles, buttons, form fields, tags and icons.

- Plugin package: [`summit-general-hospital-figma-plugin.zip`](summit-general-hospital-figma-plugin.zip)
- Step-by-step guide: [`FIGMA.md`](FIGMA.md)
- Design system preview: [`preview/figma-design-system.jpg`](preview/figma-design-system.jpg)

Figma desktop is required to import a local development plugin. The plugin needs no network access — all images are embedded. It never overwrites your file; it creates new pages.

> **Palette note:** the plugin still draws the project's earlier evergreen-and-gold screens with Fraunces/Manrope. The website in `src/` has since moved to the teal/Montserrat design described in this README, so treat the Figma file as a structure and content reference rather than a colour source. See [`FIGMA.md`](FIGMA.md) for details.

The Figma file is a **design reference**, not a working booking system. The HTML site remains the source of truth for interactions, validation and form delivery. The sample-content checklist below applies to both.

---

## What's included

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Hero, quick access, about, departments, care pathways, doctors preview, patient stories, map, CTA |
| About | `about.html` | Story, mission/vision/values, facility gallery, quality commitments, community |
| Services | `services.html` | 18 services with category filters and booking links |
| Doctors | `doctors.html` | 4-consultant directory with search and specialty filters |
| Appointments | `appointment.html` | Four-step appointment request with validation, review and confirmation |
| Your visit | `visit.html` | What to bring, admissions, visiting hours, rights, insurance, FAQs |
| Contact | `contact.html` | Contact cards, local map, message form, records/feedback info |
| Privacy | `privacy.html` | Website privacy notice |
| Confirmation | `thank-you.html` | Fallback confirmation page for non-JavaScript form posts |
| Not found | `404.html` | Styled 404 page |

Supporting files:

- `assets/css/styles.css` — one compiled stylesheet
- `assets/js/main.js` — one compiled script
- `assets/fonts/` — self-hosted Montserrat variable font (unreferenced Fraunces/Manrope files from the earlier build may also be present)
- `assets/img/` — optimised WebP photography, logo, map and social image
- `send.php` — form handler
- `sitemap.xml`, `robots.txt`, `.htaccess`, `favicon.ico`
- `src/` — source templates, CSS, JS and the build script (not needed on the server)

---

## 1. View it locally

Open `dist/index.html` in a browser. Everything works, including the appointment flow, except form delivery: in local-file preview mode the forms show a clear “preview mode” message instead of sending.

For a local web server:

```bash
cd summit-general-hospital
python3 -m http.server 8787 --directory dist
```

Then open <http://127.0.0.1:8787>.

> If you edit the source in `src/`, rebuild with `node src/build.mjs`. Node 18+ is required. The build copies `public/` to `dist/`, compiles the CSS/JS, wraps each page in the shared layout, and regenerates `sitemap.xml`.

---

## 2. Publish on cPanel

1. **Back up** the current `public_html` (especially if a Site Builder site is live).
2. In cPanel → **File Manager**, open `public_html`.
3. Upload the **contents of `dist/`** (not the `dist` folder itself) and extract, or upload `summit-general-hospital-site.zip` and extract it in place.
4. Make sure `index.html` sits directly in `public_html`, alongside `assets/`, `send.php`, `.htaccess`, etc.
5. Enable **Show Hidden Files** in File Manager so `.htaccess` is uploaded.
6. Visit your domain. If you see the old Site Builder page, clear the cPanel/Site Builder cache or remove the old `index.html`/builder files after taking the backup.

### Important: Site Builder vs. a custom static site

Your preview at `a6843c-384604.preview.sitehub.io` is built with cPanel Site Builder. This package is a **custom static site**, not a Site Builder template. Site Builder cannot import a whole HTML site into its drag-and-drop editor.

You have two clean options:

- **Recommended:** publish this static site in `public_html` as the main website. It is faster, fully responsive, and you can edit the HTML/CSS directly.
- **If you must stay in Site Builder:** use this site as the visual reference and copy the text, images and section order into Site Builder blocks. Do not upload this `index.html` over a live Site Builder installation without a backup.

### HTTPS and www

After your SSL certificate is active, uncomment the HTTPS redirect at the bottom of `.htaccess`. Pick one canonical host (`summitgeneralhospital.com` or `www.`) and update:

- the `SITE_URL` constant in `src/build.mjs`
- canonical/Open Graph URLs (regenerate by rebuilding)
- `Sitemap:` in `robots.txt`
- the `url`/`logo`/`image` values in the JSON-LD block in `src/layout.html`

---

## 3. Connect the forms

`send.php` sends appointment requests and contact messages to:

```php
$recipient  = 'info@summitgh.com.et';
$siteDomain = 'summitgeneralhospital.com';
```

Requirements:

- PHP **8.0 or newer** (8.1+ recommended)
- PHP `mail()` enabled on the hosting account
- `mbstring` enabled (standard on cPanel)

To change the destination, edit the top of `send.php` and upload it again.

Test after uploading:

1. Submit a contact message from the live site.
2. Check the inbox (and spam folder) for `info@summitgh.com.et`.
3. If mail does not arrive, ask your host to confirm `mail()` is enabled and that the sending domain has SPF/DKIM records. Alternatively, replace `send.php` with an SMTP integration or a form service such as FormSubmit/Formspree and update the form `action` in `src/pages/appointment.html` and `src/pages/contact.html`.

The handler includes a honeypot, origin check, validation, basic per-session rate limiting and a JSON/AJAX response. It does not store submissions in a database.

> **Privacy:** appointment and contact forms collect names, phone numbers, email addresses and a short reason for visit. Keep the privacy notice accurate and make sure your team handles these emails securely.

---

## 4. Before you publish — content that must be verified

This is a **designed template with sample content**, not a verified record of the hospital. Replace or confirm everything below before going live.

### Clinical and operational claims

- **Doctors:** the four consultants listed (Dr. Million Seid Muzeyen, Dr. Biniyam Denekew Asrat, Dr. Gosa Abebe Shifera and Dr. Yasin Ahmed Yesuf) are the hospital's own team. Confirm each one's role, clinic days, languages and availability before launch, and add or remove cards as the team changes.
- **Testimonials:** the three patient quotes are illustrative samples, not real patient statements. Replace them with approved, consented feedback or remove the section.
- **Services:** the 18 services and their descriptions are a typical general-hospital list. Confirm each one is actually offered, and correct department names.
- **Statistics:** “15+ clinical specialties”, “3 languages”, “18 services” and “24/7 emergency & inpatient care” must be confirmed.
- **Emergency & ambulance:** the site uses `+251 111 132 702` for the 24/7 emergency line and ambulance. Confirm this is the correct emergency number, and that the hospital offers the ambulance service described.
- **Hours:** outpatient clinics are shown as Monday–Saturday, 8:00–18:00. Visiting hours (general wards, maternity, children’s ward, ICU) are samples. Confirm all hours with the ward teams.
- **Insurance:** “major Ethiopian insurers” and direct billing are generic claims. Confirm which insurers and plans you actually accept, and adjust the wording.
- **Policies:** the admissions steps, “one adult companion”, patient rights/responsibilities, feedback process and medical-records process are written as reasonable defaults. Have administration review them.
- **Privacy notice:** written as a general website notice. Have it reviewed for Ethiopian data-protection and medical-confidentiality requirements.

### Photography and map

- All photography is **stock imagery** from Unsplash. It does **not** show Summit General Hospital’s real building, staff or patients. Replace it with your own photography, with staff and patient consent, before publishing. At minimum, avoid implying that stock clinicians are your consultants.
- The map is a static screenshot of the Google Maps listing for Summit General Hospital (**9.0077, 38.8688**), saved locally as `assets/img/map-summit.jpg` so no third-party map script or cookies load with the page. The red marker and its label are part of the image. Re-capture it from the verified listing if the location or street labels change, and keep the “Map data © Google” credit on the card.
- Consultant photos live in `assets/img/doctors/` as 320×320 square JPEGs. They show as 72 px circles beside the name on the home page and as 112 px circles above the name on the two-column `doctors.html` directory (`object-position: center 18%` keeps the face inside the crop). At 112 px the 320 px originals are still sharp; anything larger needs new photography. Cards without a photo still show initials. Only publish portraits you have consent to use, and keep the name, role and specialty on the card matched to the right person.

### Contact details

The phone, email, address and domain were taken from your existing preview:

- **Address:** Summit 72, Lemi Kura, Addis Ababa, Ethiopia
- **Phone:** +251 111 132 702
- **Email:** info@summitgh.com.et
- **Domain used in metadata:** summitgeneralhospital.com

Confirm all four before launch.

---

## 5. Changing the design

### Colours

Edit the custom properties at the top of `src/css/01-base.css`:

```css
--paper: #f5fafb;
--forest: #084f6c;
--teal: #0091a4;
--gold: #a6e8e4;
```

### Type

Montserrat is self-hosted as a single variable file in `assets/fonts/montserrat-var.woff2` (weights 300–800). Both `--serif` and `--sans` point at it, so headlines and body text share one family. If you swap fonts, update the `@font-face` rule in `src/css/01-base.css`, the custom properties beside it, and the preload link in `src/layout.html`.

The `fraunces-var.woff2`, `fraunces-italic-var.woff2` and `manrope-var.woff2` files left over from the earlier evergreen design are no longer referenced by any stylesheet. They are not downloaded by visitors, but you can delete them from `public/assets/fonts/` to keep the upload lean.

### Text and sections

Each page is a fragment in `src/pages/`. Edit the HTML there, run `node src/build.mjs`, and upload the regenerated `dist/`.

The shared header, footer and icon sprite live in `src/partials/`.

### Appointment form

The department list is in `src/pages/appointment.html` (the `#department` select) and in `send.php` (`$departments`). If you add or rename a department, update both.

The doctor list is also in the appointment page: each `<option>` has a `data-department` that must match the department value exactly. Update the `$departments` whitelist in `send.php` too.

### Map pin

The pin position is CSS, not embedded in the image. Adjust:

```css
.map-card__pin {
  left: 59.6%;
  top: 50.3%;
}
```

If you replace `assets/img/map-bole.webp`, keep a similar aspect ratio (8:5) or adjust the pin percentages to match.

---

## 6. Accessibility, SEO and performance notes

- Semantic landmarks, one `h1` per page, skip link, visible focus styles and a keyboard-accessible mobile menu.
- Form labels, inline errors, `aria-invalid`, `aria-describedby` and live confirmation messages.
- `prefers-reduced-motion` support for reveal animations and smooth scrolling.
- Colour contrast checked for body text, small labels and links on the ivory/sand backgrounds.
- Per-page titles, descriptions, canonical URLs, Open Graph/Twitter cards and `Hospital` JSON-LD.
- `sitemap.xml`, `robots.txt`, 404 page, `.htaccess` caching/compression and a local OpenStreetMap image (no third-party map iframe to slow the page or set cookies).
- Images are local WebP files with width/height attributes; fonts are self-hosted.

---

## 7. Credits and licences

- **Logo:** supplied by Summit General Hospital (from the existing preview site).
- **Photography:** [Unsplash](https://unsplash.com/license) — free to use. Source photo IDs include:
  `photo-1666214280557-f1b5022eb634`, `photo-1622253692010-333f2da6031d`,
  `photo-1584515933487-779824d29309`, `photo-1571772996211-2f02c9727629`,
  `photo-1519494026892-80bbd2d6fd0d`, `photo-1551601651-2a8555f1a136`,
  `photo-1579154204601-01588f351e67`, `photo-1538108149393-fbbd81895907`,
  `photo-1580281658626-ee379f3cce93`.
- **Map:** map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the Open Database License (ODbL). The map image is stored locally and the site displays attribution.
- **Fonts:** [Montserrat](https://fonts.google.com/specimen/Montserrat), SIL Open Font License 1.1.
- **Icons:** custom inline SVG, no third-party icon library.
- **Build:** hand-written Node script and vanilla CSS/JS, no framework.

---

## 8. File map

```
summit-general-hospital/
├── dist/                     ← upload the contents of this folder
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── doctors.html
│   ├── appointment.html
│   ├── visit.html
│   ├── contact.html
│   ├── privacy.html
│   ├── thank-you.html
│   ├── 404.html
│   ├── send.php
│   ├── assets/
│   ├── sitemap.xml
│   ├── robots.txt
│   ├── favicon.ico
│   └── .htaccess
├── figma-plugin/             ← Figma design builder source and dist
├── summit-general-hospital-figma-plugin.zip
├── FIGMA.md                  ← Figma install and editing guide
├── preview/                  ← design preview images
├── public/                   ← static source assets + send.php
├── src/
│   ├── pages/                ← page content
│   ├── partials/             ← header, footer, icon sprite
│   ├── css/                  ← design system
│   ├── js/                   ← interactions and forms
│   ├── layout.html
│   └── build.mjs
└── README.md
```

---

## 9. A quick pre-launch checklist

- [ ] Confirm consultant roles, clinic days and availability
- [ ] Replace or remove sample patient testimonials
- [ ] Confirm services, hours, emergency/ambulance line and insurance
- [ ] Replace stock photography with real facility/team photos (with consent)
- [ ] Confirm the map pin and address
- [ ] Set the correct recipient email in `send.php`
- [ ] Send a live test through both forms
- [ ] Have the privacy notice and patient-facing policies reviewed
- [ ] Check the site on a phone, tablet and desktop
- [ ] Set up HTTPS, then update canonical URLs/robots/sitemap if the domain differs
