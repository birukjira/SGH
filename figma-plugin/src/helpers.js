/* ==========================================================================
   Summit General Hospital — Figma design builder
   Shared primitives
   ========================================================================== */

const PAGE_W = 1440;
const M = 100;
const CW = 1240;

const C = {
  paper: '#F7F2E8',
  paper2: '#F1EADB',
  sand: '#E8DDC9',
  ink: '#14231F',
  soft: '#4B5A55',
  forest: '#0C3B33',
  forest2: '#114A41',
  forest3: '#1A5C51',
  clay: '#9C4828',
  gold: '#C7A15A',
  line: '#D8CFC0',
  lineLight: '#48675F',
  white: '#FFFFFF',
  mint: '#E3ECE6',
  emergency: '#A33A2B',
  rose: '#F0A48B',
};

const FONT = {};
const STYLES = {};
const T = {};
const IMAGE_HASHES = {};

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function paint(hex, opacity = 1) {
  return { type: 'SOLID', color: hexToRgb(hex), opacity };
}

function setFill(node, hex, opacity = 1) {
  node.fills = [paint(hex, opacity)];
}

function setStroke(node, hex, opacity = 1, weight = 1) {
  node.strokes = [paint(hex, opacity)];
  node.strokeWeight = weight;
  node.strokeAlign = 'INSIDE';
}

async function initFonts() {
  let all = [];
  try {
    all = await figma.listAvailableFontsAsync();
  } catch (error) {
    all = [];
  }

  const families = [...new Set(all.map((item) => item.fontName.family))];
  const pickFamily = (preferences) => {
    for (const name of preferences) {
      const exact = families.find((family) => family.toLowerCase() === name.toLowerCase());
      if (exact) return exact;
    }
    return null;
  };

  const serifFamily = pickFamily(['Fraunces', 'Playfair Display', 'DM Serif Display', 'Lora', 'Georgia', 'Times New Roman']) || 'Georgia';
  const sansFamily = pickFamily(['Manrope', 'Inter', 'DM Sans', 'Arial', 'Helvetica Neue']) || 'Inter';

  const stylesFor = (family) => all.filter((item) => item.fontName.family === family).map((item) => item.fontName.style);
  const findFont = (family, preferences) => {
    const available = stylesFor(family);
    for (const preference of preferences) {
      const hit = available.find((style) => style.toLowerCase() === preference.toLowerCase());
      if (hit) return { family, style: hit };
    }
    return { family, style: available[0] || 'Regular' };
  };

  FONT.serif = findFont(serifFamily, ['Regular', 'Book', 'Roman', 'Light']);
  FONT.serifItalic = findFont(serifFamily, ['Italic', 'Regular Italic', 'Light Italic', 'Regular']);
  FONT.serifMedium = findFont(serifFamily, ['Medium', 'SemiBold', 'Regular']);
  FONT.sans = findFont(sansFamily, ['Regular', 'Book', 'Light']);
  FONT.sansMedium = findFont(sansFamily, ['Medium', 'Regular']);
  FONT.sansSemi = findFont(sansFamily, ['SemiBold', 'Semi Bold', 'DemiBold', 'Bold', 'Medium', 'Regular']);
  FONT.sansBold = findFont(sansFamily, ['Bold', 'ExtraBold', 'SemiBold', 'Medium', 'Regular']);

  const unique = [...new Set(Object.values(FONT).map((font) => `${font.family}|${font.style}`))];
  for (const key of unique) {
    const [family, style] = key.split('|');
    try {
      await figma.loadFontAsync({ family, style });
    } catch (error) {
      // Keep going; the text nodes will use whatever Figma resolves.
    }
  }

  return {
    serifFamily,
    sansFamily,
    fallback: serifFamily !== 'Fraunces' || sansFamily !== 'Manrope',
  };
}

function makeTextStyle(name, font, size, lineHeight, letterSpacing = 0) {
  const style = figma.createTextStyle();
  style.name = name;
  style.fontName = font;
  style.fontSize = size;
  style.lineHeight = { unit: 'PERCENT', value: lineHeight };
  style.letterSpacing = { unit: 'PIXELS', value: letterSpacing };
  return style;
}

function createStyles() {
  const colors = [
    ['Paper', C.paper],
    ['Paper warm', C.paper2],
    ['Sand', C.sand],
    ['Ink', C.ink],
    ['Ink soft', C.soft],
    ['Evergreen', C.forest],
    ['Evergreen deep', C.forest2],
    ['Clay', C.clay],
    ['Gold', C.gold],
    ['Line', C.line],
    ['Mint', C.mint],
    ['Emergency', C.emergency],
  ];

  for (const [name, hex] of colors) {
    const style = figma.createPaintStyle();
    style.name = `Summit / ${name}`;
    style.paints = [paint(hex)];
    STYLES[name.toLowerCase().replace(/\s+/g, '-')] = style;
  }

  T.h1 = makeTextStyle('Summit / Display / H1', FONT.serif, 84, 98, -3);
  T.pageTitle = makeTextStyle('Summit / Display / Page title', FONT.serif, 70, 102, -2.4);
  T.h2 = makeTextStyle('Summit / Display / H2', FONT.serif, 54, 103, -1.6);
  T.h3 = makeTextStyle('Summit / Display / H3', FONT.serif, 30, 112, -0.5);
  T.h4 = makeTextStyle('Summit / Display / H4', FONT.serif, 24, 115, -0.3);
  T.quote = makeTextStyle('Summit / Display / Quote', FONT.serif, 23, 140, -0.2);
  T.body = makeTextStyle('Summit / Body / Regular', FONT.sans, 16, 165, 0);
  T.bodySm = makeTextStyle('Summit / Body / Small', FONT.sans, 14, 160, 0);
  T.small = makeTextStyle('Summit / Body / Caption', FONT.sans, 12, 150, 0);
  T.eyebrow = makeTextStyle('Summit / Label / Eyebrow', FONT.sansSemi, 11, 130, 1.8);
  T.button = makeTextStyle('Summit / Label / Button', FONT.sansSemi, 13, 100, 0);
  T.nav = makeTextStyle('Summit / Label / Nav', FONT.sansMedium, 13, 100, 0);
}

function frame(parent, name, x, y, w, h, options = {}) {
  const node = figma.createFrame();
  node.name = name;
  node.resize(Math.max(1, w), Math.max(1, h));
  node.fills = options.fill ? [paint(options.fill, options.fillOpacity ?? 1)] : [];
  node.cornerRadius = options.radius ?? 0;
  node.clipsContent = Boolean(options.clip);
  if (options.stroke) setStroke(node, options.stroke, options.strokeOpacity ?? 1, options.strokeWeight ?? 1);
  if (options.shadow) {
    node.effects = [{
      type: 'DROP_SHADOW',
      color: { r: 0.047, g: 0.231, b: 0.2, a: 0.18 },
      offset: { x: 0, y: 18 },
      radius: 36,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    }];
  }
  if (options.opacity !== undefined) node.opacity = options.opacity;
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  return node;
}

function rect(parent, name, x, y, w, h, options = {}) {
  const node = figma.createRectangle();
  node.name = name;
  node.resize(Math.max(1, w), Math.max(1, h));
  node.fills = options.fill ? [paint(options.fill, options.fillOpacity ?? 1)] : [];
  node.cornerRadius = options.radius ?? 0;
  if (options.stroke) setStroke(node, options.stroke, options.strokeOpacity ?? 1, options.strokeWeight ?? 1);
  if (options.opacity !== undefined) node.opacity = options.opacity;
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  return node;
}

function ellipse(parent, name, x, y, size, color, options = {}) {
  const node = figma.createEllipse();
  node.name = name;
  node.resize(size, size);
  node.fills = [paint(color, options.opacity ?? 1)];
  if (options.stroke) setStroke(node, options.stroke, options.strokeOpacity ?? 1, options.strokeWeight ?? 1);
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  return node;
}

function line(parent, name, x, y, w, color, opacity = 0.18, weight = 1) {
  return rect(parent, name, x, y, w, weight, { fill: color, fillOpacity: opacity });
}

function section(page, name, y, h, fill) {
  return frame(page, `Section / ${name}`, 0, y, PAGE_W, h, { fill, clip: true });
}

function addText(parent, name, content, x, y, w, options = {}) {
  const node = figma.createText();
  node.name = name;
  node.fontName = options.font || FONT.sans;
  node.fontSize = options.size || 16;
  node.characters = String(content);
  if (options.style) {
    node.fontName = options.style.fontName;
    node.fontSize = options.style.fontSize;
    node.lineHeight = options.style.lineHeight;
    node.letterSpacing = options.style.letterSpacing;
  } else {
    node.lineHeight = { unit: 'PERCENT', value: options.lineHeight || 150 };
    node.letterSpacing = { unit: 'PIXELS', value: options.letterSpacing || 0 };
  }
  node.textAutoResize = 'HEIGHT';
  node.resize(Math.max(10, w), Math.max(10, node.height));
  if (options.align) node.textAlignHorizontal = options.align;
  node.fills = [paint(options.color || C.ink, options.opacity ?? 1)];
  if (options.opacity !== undefined) node.opacity = options.opacity;
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  return node;
}

function addAutoText(parent, name, content, options = {}) {
  const node = figma.createText();
  node.name = name;
  node.fontName = options.font || FONT.sans;
  node.fontSize = options.size || 13;
  node.characters = String(content);
  if (options.style) {
    node.fontName = options.style.fontName;
    node.fontSize = options.style.fontSize;
    node.lineHeight = options.style.lineHeight;
    node.letterSpacing = options.style.letterSpacing;
  } else {
    node.lineHeight = { unit: 'PERCENT', value: options.lineHeight || 120 };
    node.letterSpacing = { unit: 'PIXELS', value: options.letterSpacing || 0 };
  }
  node.textAutoResize = 'WIDTH_AND_HEIGHT';
  node.fills = [paint(options.color || C.ink, options.opacity ?? 1)];
  parent.appendChild(node);
  return node;
}

function accent(textNode, word, options = {}) {
  const index = textNode.characters.indexOf(word);
  if (index === -1) return;
  const end = index + word.length;
  const font = options.font || FONT.serifItalic;
  textNode.setRangeFontName(index, end, font);
  textNode.setRangeFills(index, end, [paint(options.color || C.clay)]);
}

function addImage(parent, name, key, x, y, w, h, options = {}) {
  const asset = ASSETS.images[key];
  if (!asset) return null;
  let hash = IMAGE_HASHES[key];
  if (!hash) {
    const bytes = ASSETS.decode(asset.data);
    hash = figma.createImage(bytes).hash;
    IMAGE_HASHES[key] = hash;
  }
  const node = figma.createRectangle();
  node.name = name;
  node.resize(w, h);
  node.fills = [{ type: 'IMAGE', imageHash: hash, scaleMode: 'FILL' }];
  node.cornerRadius = options.circle ? Math.min(w, h) / 2 : (options.radius ?? 0);
  if (options.arch) {
    node.topLeftRadius = w / 2;
    node.topRightRadius = w / 2;
    node.bottomLeftRadius = options.radius ?? 0;
    node.bottomRightRadius = options.radius ?? 0;
  }
  if (options.stroke) setStroke(node, options.stroke, options.strokeOpacity ?? 1, options.strokeWeight ?? 8);
  if (options.opacity !== undefined) node.opacity = options.opacity;
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  return node;
}

function addSvg(parent, name, markup, x, y, w, h, opacity = 1) {
  try {
    const node = figma.createNodeFromSvg(markup);
    node.name = name;
    parent.appendChild(node);
    if (w && h) node.resize(w, h);
    node.x = x;
    node.y = y;
    node.opacity = opacity;
    return node;
  } catch (error) {
    return null;
  }
}

function logo(parent, x, y, width, white = false) {
  const height = width * (46 / 117);
  const markup = (white ? ASSETS.logos.white : ASSETS.logos.dark)
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    .replace(/width="117" height="46"/, `width="${width}" height="${height}"`);
  return addSvg(parent, 'Logo / Summit General Hospital', markup, x, y, width, height, 1);
}

function topo(parent, x, y, width, opacity = 0.35) {
  const height = width * (1000 / 1400);
  const markup = ASSETS.topo.replace(/width="1400" height="1000"/, `width="${width}" height="${height}"`);
  return addSvg(parent, 'Decoration / Topographic lines', markup, x, y, width, height, opacity);
}

const ICONS = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  ambulance: '<path d="M3 16V8h11v8M14 11h4l3 3v2h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M8 10v4M6 12h4"/>',
  cross: '<path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5V3Z"/>',
  phone: '<path d="M6.5 3.5h3l1.5 4-2 1.5a13 13 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"/>',
  pin: '<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowUp: '<path d="M7 17 17 7M8 7h9v9"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  stethoscope: '<path d="M5 3v6a4 4 0 0 0 8 0V3M4 3h3M11 3h3"/><path d="M9 13v1a5 5 0 0 0 10 0v-1"/><circle cx="19" cy="10" r="2"/>',
  heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  shield: '<path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="9.5" r="2.4"/><path d="M16 14.6c2.8 0 5 2.2 5 5"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
  child: '<circle cx="12" cy="5.5" r="2.5"/><path d="M12 8.5V15M8 21l4-6 4 6M8 11.5h8"/>',
  brain: '<path d="M9.5 4a3 3 0 0 0-3 3 3 3 0 0 0-1.2 5.7A3 3 0 0 0 8 18a3 3 0 0 0 4 2V4a3 3 0 0 0-2.5 0Z"/><path d="M14.5 4a3 3 0 0 1 3 3 3 3 0 0 1 1.2 5.7A3 3 0 0 1 16 18a3 3 0 0 1-4 2"/>',
  scalpel: '<path d="M4 20 14 10M13 4l7 7-3 3-7-7 3-3Z"/><path d="M6 22h6"/>',
  bone: '<path d="M7.5 9.5 9.5 7.5a2.5 2.5 0 1 1 3-3l7 7a2.5 2.5 0 1 1-3 3l-2 2a2.5 2.5 0 1 1-3 3l-7-7a2.5 2.5 0 1 1 3-3Z"/>',
  scan: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 15h6"/>',
  lab: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
  pill: '<rect x="2.8" y="8.6" width="18.4" height="6.8" rx="3.4" transform="rotate(-45 12 12)"/><path d="m8.5 8.5 7 7"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  ear: '<path d="M6 10a6 6 0 1 1 12 0c0 3-2 4-3 5.5-.8 1.2-1 3.5-3 3.5a3 3 0 0 1-3-3"/><path d="M9.5 10a2.5 2.5 0 1 1 5 0c0 1.5-2 2-2 3.5"/>',
  tooth: '<path d="M12 4c2-1.5 5-1.5 6.5.5 1.8 2.4.8 5.7-.2 8.4-.8 2.2-.8 5.6-2.6 5.6-1.4 0-1.3-4.5-3.7-4.5s-2.3 4.5-3.7 4.5c-1.8 0-1.8-3.4-2.6-5.6C4.7 10.2 3.7 6.9 5.5 4.5 7 2.5 10 2.5 12 4Z"/>',
  droplet: '<path d="M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11Z"/>',
  activity: '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>',
  file: '<path d="M6 3h7l5 5v13H6Z"/><path d="M13 3v5h5M9 13h6M9 17h4"/>',
  utensils: '<path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10M16 3v18M16 3c2 0 3 2 3 4s-1 4-3 4"/>',
  wheelchair: '<circle cx="12" cy="4" r="2"/><path d="M12 7v6h5l2 6M8 13a5 5 0 1 0 7 4"/>',
};

function icon(parent, name, x, y, size, color, weight = 1.6) {
  const body = ICONS[name];
  if (!body) return null;
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return addSvg(parent, `Icon / ${name}`, markup, x, y, size, size, 1);
}

function button(parent, options) {
  const {
    x, y, label, kind = 'primary', w = null, h = 50, arrow = true, small = false,
  } = options;
  const themes = {
    primary: { bg: C.forest, fg: C.paper, stroke: null },
    outline: { bg: null, fg: C.ink, stroke: C.line },
    light: { bg: C.paper, fg: C.forest, stroke: null },
    ghost: { bg: null, fg: C.paper, stroke: C.lineLight },
    emergency: { bg: C.emergency, fg: C.paper, stroke: null },
  };
  const theme = themes[kind] || themes.primary;

  const node = figma.createFrame();
  node.name = `Button / ${label}`;
  node.layoutMode = 'HORIZONTAL';
  node.primaryAxisSizingMode = 'FIXED';
  node.counterAxisSizingMode = 'FIXED';
  node.resize(w || 300, h);
  node.paddingLeft = small ? 18 : 24;
  node.paddingRight = small ? 18 : 24;
  node.paddingTop = 0;
  node.paddingBottom = 0;
  node.itemSpacing = 9;
  node.counterAxisAlignItems = 'CENTER';
  node.primaryAxisAlignItems = 'CENTER';
  node.cornerRadius = 999;
  node.clipsContent = false;
  node.fills = theme.bg ? [paint(theme.bg)] : [];
  if (theme.stroke) setStroke(node, theme.stroke, 1, 1);
  parent.appendChild(node);
  node.x = x;
  node.y = y;

  addAutoText(node, 'Label', label, {
    font: FONT.sansSemi,
    size: small ? 12 : 13,
    color: theme.fg,
  });

  if (arrow) {
    addAutoText(node, 'Arrow', '→', {
      font: FONT.sans,
      size: small ? 14 : 16,
      color: theme.fg,
    });
  }

  if (!w) node.primaryAxisSizingMode = 'AUTO';

  return node;
}

function tag(parent, x, y, label, options = {}) {
  const width = options.width || Math.max(56, Math.round(label.length * 5.6 + 20));
  const node = frame(parent, `Tag / ${label}`, x, y, width, 22, {
    fill: options.fill || null,
    fillOpacity: options.fillOpacity ?? 1,
    radius: 999,
    stroke: options.stroke || null,
  });
  addText(node, 'Label', label, 0, 5, width, {
    font: FONT.sansSemi,
    size: 9,
    color: options.color || C.soft,
    lineHeight: 100,
    letterSpacing: 0.8,
    align: 'CENTER',
  });
  return node;
}

function pageTitle(page, index, title, subtitle) {
  return addText(page, 'Label / Frame title', `${index}  ·  ${title}`, 0, -56, 900, {
    font: FONT.sansSemi,
    size: 18,
    color: C.soft,
    letterSpacing: 1,
  });
  // subtitle intentionally unused; kept for future use
}
