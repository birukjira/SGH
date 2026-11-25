#!/usr/bin/env node
/**
 * Builds the static assets for the Next app from the existing static site
 * sources, so the design has exactly one source of truth (src/ and public/).
 *
 * - Concatenates src/css/*.css -> public/assets/css/styles.css
 * - Copies images and fonts from the static site's public/ folder
 * - Converts src/partials/icons.html -> public/sprite.svg (referenced as
 *   /sprite.svg#i-arrow so React components never duplicate icon paths)
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const WEB = path.resolve(import.meta.dirname, '..');
const ROOT = path.resolve(WEB, '..');
const SRC = path.join(ROOT, 'src');
const PUBLIC_SRC = path.join(ROOT, 'public');
const PUBLIC_OUT = path.join(WEB, 'public');

async function main() {
  await fs.mkdir(path.join(PUBLIC_OUT, 'assets', 'css'), { recursive: true });

  // Images, fonts and the favicon from the static site. Server-side artefacts
  // (send.php, .htaccess) and dotfiles (.DS_Store) are deliberately not copied.
  const skipDotfiles = (source) => !path.basename(source).startsWith('.');
  await fs.cp(path.join(PUBLIC_SRC, 'assets', 'img'), path.join(PUBLIC_OUT, 'assets', 'img'), {
    recursive: true,
    filter: skipDotfiles,
  });
  await fs.cp(path.join(PUBLIC_SRC, 'assets', 'fonts'), path.join(PUBLIC_OUT, 'assets', 'fonts'), {
    recursive: true,
    filter: skipDotfiles,
  });
  await fs.copyFile(path.join(PUBLIC_SRC, 'favicon.ico'), path.join(PUBLIC_OUT, 'favicon.ico'));
  await fs.copyFile(path.join(PUBLIC_SRC, 'robots.txt'), path.join(PUBLIC_OUT, 'robots.txt'));

  const cssFiles = (await fs.readdir(path.join(SRC, 'css')))
    .filter((f) => f.endsWith('.css'))
    .sort();
  const css = (
    await Promise.all(cssFiles.map((f) => fs.readFile(path.join(SRC, 'css', f), 'utf8')))
  ).join('\n\n');
  await fs.writeFile(path.join(PUBLIC_OUT, 'assets', 'css', 'styles.css'), css);

  // The sprite is an SVG document, so <use href="/sprite.svg#i-arrow"> works
  // from any React component without duplicating the symbol definitions.
  const sprite = await fs.readFile(path.join(SRC, 'partials', 'icons.html'), 'utf8');
  await fs.writeFile(path.join(PUBLIC_OUT, 'sprite.svg'), sprite.trim() + '\n');

  console.log(`Assets ready: ${cssFiles.length} CSS files, sprite.svg, public/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
