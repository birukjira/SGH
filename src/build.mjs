#!/usr/bin/env node
/**
 * Minimal static-site builder for the Summit General Hospital site.
 * No dependencies. Run `node src/build.mjs` from the project root.
 *
 * - Copies public/ -> dist/
 * - Concatenates src/css/*.css -> dist/assets/css/styles.css
 * - Concatenates src/js/*.js  -> dist/assets/js/main.js
 * - Wraps src/pages/*.html in src/layout.html and writes flat HTML to dist/
 * - Writes sitemap.xml
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const PUBLIC = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://summitgeneralhospital.com';
const YEAR = new Date().getFullYear();

const read = (p) => fs.readFile(p, 'utf8');
const exists = async (p) => { try { await fs.access(p); return true; } catch { return false; } };

function parseMeta(html) {
  const match = html.match(/^<!--\s*([\s\S]*?)\s*-->\s*/);
  if (!match) throw new Error('Page is missing its metadata comment');
  const meta = {};
  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue;
    const i = line.indexOf(':');
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: html.slice(match[0].length) };
}

function applyNav(html, nav) {
  if (!nav) return html;
  return html
    .replaceAll(`class="nav__link" data-nav="${nav}"`, `class="nav__link is-active" aria-current="page" data-nav="${nav}"`)
    .replaceAll(`class="panel__link" data-nav="${nav}"`, `class="panel__link is-active" aria-current="page" data-nav="${nav}"`);
}

async function main() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  await fs.cp(PUBLIC, DIST, { recursive: true });

  const layout = await read(path.join(SRC, 'layout.html'));
  const header = await read(path.join(SRC, 'partials/header.html'));
  const footer = await read(path.join(SRC, 'partials/footer.html'));
  const icons = await read(path.join(SRC, 'partials/icons.html'));

  // CSS
  const cssFiles = (await fs.readdir(path.join(SRC, 'css'))).filter((f) => f.endsWith('.css')).sort();
  const css = (await Promise.all(cssFiles.map((f) => read(path.join(SRC, 'css', f))))).join('\n\n');
  await fs.writeFile(path.join(DIST, 'assets/css/styles.css'), css);
  const cssVersion = createHash('sha1').update(css).digest('hex').slice(0, 8);

  // JS
  const jsFiles = (await fs.readdir(path.join(SRC, 'js'))).filter((f) => f.endsWith('.js')).sort();
  const js = (await Promise.all(jsFiles.map((f) => read(path.join(SRC, 'js', f))))).join('\n\n');
  await fs.writeFile(path.join(DIST, 'assets/js/main.js'), js);
  const jsVersion = createHash('sha1').update(js).digest('hex').slice(0, 8);

  // Pages
  const pageFiles = (await fs.readdir(path.join(SRC, 'pages'))).filter((f) => f.endsWith('.html')).sort();
  const sitemap = [];
  for (const file of pageFiles) {
    const raw = await read(path.join(SRC, 'pages', file));
    const { meta, body } = parseMeta(raw);
    if (!meta.title || !meta.description) throw new Error(`${file}: title and description are required`);

    const slug = file === 'index.html' ? '' : file;
    const canonical = meta.canonical || `${SITE_URL}/${slug}`;
    const ogImage = meta.ogImage || `${SITE_URL}/assets/img/og.jpg`;

    let page = layout
      .replaceAll('{{title}}', meta.title)
      .replaceAll('{{description}}', meta.description)
      .replaceAll('{{canonical}}', canonical)
      .replaceAll('{{ogTitle}}', meta.ogTitle || meta.title)
      .replaceAll('{{ogDescription}}', meta.ogDescription || meta.description)
      .replaceAll('{{ogImage}}', ogImage)
      .replaceAll('{{bodyClass}}', meta.body || '')
      .replaceAll('{{robots}}', meta.robots || 'index,follow')
      .replaceAll('{{cssVersion}}', cssVersion)
      .replaceAll('{{jsVersion}}', jsVersion)
      .replaceAll('{{schema}}', meta.schema || '')
      .replace('{{content}}', body)
      .replace('{{header}}', header)
      .replace('{{footer}}', footer)
      .replace('{{icons}}', icons)
      .replaceAll('{{year}}', String(YEAR));

    page = applyNav(page, meta.nav);
    page = page.replaceAll('{{year}}', String(YEAR));

    await fs.writeFile(path.join(DIST, file), page);
    if (meta.nav !== 'none' && file !== '404.html') {
      sitemap.push({ url: `${SITE_URL}/${slug}`, priority: file === 'index.html' ? '1.0' : '0.8' });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((s) => `  <url>
    <loc>${s.url}</loc>
    <lastmod>${today}</lastmod>
    <priority>${s.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemapXml);

  console.log(`Built ${pageFiles.length} pages, ${cssFiles.length} CSS files and ${jsFiles.length} JS files -> dist/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
