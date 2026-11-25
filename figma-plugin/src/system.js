/* ==========================================================================
   Design system page
   ========================================================================== */

function buildDesignSystem() {
  const page = pageFrame('Summit — Design system', 0, 2500);

  const header = frame(page, 'Section / Header', 0, 0, 1440, 260, { fill: C.forest });
  topo(header, 900, -60, 700, 0.22);
  logo(header, 100, 54, 150, true);
  addText(header, 'Title', 'Design system', 100, 132, 700, { font: FONT.serif, size: 52, color: C.paper, lineHeight: 100 });
  addText(header, 'Subtitle', 'Colours, type, components and patterns for Summit General Hospital.', 100, 196, 700, { font: FONT.sans, size: 12, color: '#B5BFB5', lineHeight: 120 });

  const colors = [
    ['Paper', C.paper], ['Paper warm', C.paper2], ['Sand', C.sand], ['Evergreen', C.forest],
    ['Clay', C.clay], ['Gold', C.gold], ['Ink', C.ink], ['Ink soft', C.soft],
    ['Mint', C.mint], ['Emergency', C.emergency], ['Line', C.line], ['White', C.white],
  ];
  eyebrow(page, 100, 310, '01 · COLOUR');
  addText(page, 'Colour heading', 'Warm, grounded, clinical.', 100, 342, 700, { font: FONT.serif, size: 30, color: C.ink, lineHeight: 110 });
  colors.forEach(([name, hex], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 100 + col * 310;
    const y = 410 + row * 130;
    rect(page, `Swatch / ${name}`, x, y, 290, 76, { fill: hex, radius: 8, stroke: C.line });
    addText(page, 'Swatch name', name, x, y + 86, 180, { font: FONT.sansSemi, size: 10, color: C.ink, lineHeight: 100 });
    addText(page, 'Swatch hex', hex.toUpperCase(), x + 180, y + 86, 110, { font: FONT.sans, size: 9, color: C.soft, lineHeight: 100, align: 'RIGHT' });
  });

  eyebrow(page, 100, 850, '02 · TYPOGRAPHY');
  addText(page, 'Type heading', 'Fraunces for warmth. Manrope for clarity.', 100, 882, 900, { font: FONT.serif, size: 30, color: C.ink, lineHeight: 110 });
  addText(page, 'Display sample', 'Good health.', 100, 950, 700, { style: T.h1, color: C.ink });
  addText(page, 'H2 sample', 'Care for every chapter.', 100, 1070, 600, { style: T.h2, color: C.ink });
  addText(page, 'Body sample', 'Compassionate, consultant-led care for every stage of life — from everyday check-ups to emergencies, all under one roof in Lemi Kura.', 100, 1140, 520, { style: T.body, color: C.soft });
  eyebrow(page, 760, 952, 'EYEBROW · 11 / 1.8');
  addText(page, 'Eyebrow sample', 'SUMMIT 72 · BOLE, ADDIS ABABA', 760, 990, 500, { style: T.eyebrow, color: C.clay });
  addText(page, 'Quote sample', '“The nurses explained everything to my mother in Amharic.”', 760, 1060, 520, { style: T.quote, color: C.ink });

  eyebrow(page, 100, 1240, '03 · COMPONENTS');
  addText(page, 'Components heading', 'A small kit, used consistently.', 100, 1272, 700, { font: FONT.serif, size: 30, color: C.ink, lineHeight: 110 });
  button(page, { x: 100, y: 1330, label: 'Book an appointment', kind: 'primary' });
  button(page, { x: 330, y: 1330, label: 'Explore services', kind: 'outline' });
  button(page, { x: 530, y: 1330, label: 'Call us', kind: 'emergency' });
  tag(page, 700, 1335, 'EMERGENCY · 24/7', { fill: '#F7E3DB', color: C.emergency, stroke: '#E4C3B4' });
  tag(page, 860, 1335, 'CLINICAL', { stroke: C.line });
  tag(page, 960, 1335, 'DIAGNOSTICS', { stroke: '#D8C28F', color: '#7E5E24' });

  const field1 = frame(page, 'Field / Text', 100, 1420, 330, 52, { fill: C.white, radius: 8, stroke: C.line });
  addText(field1, 'Placeholder', 'Your name', 14, 17, 300, { font: FONT.sans, size: 11, color: '#8A958F', lineHeight: 100 });
  const field2 = frame(page, 'Field / Select', 460, 1420, 330, 52, { fill: C.white, radius: 8, stroke: C.line });
  addText(field2, 'Value', 'Select a department', 14, 17, 260, { font: FONT.sans, size: 11, color: '#8A958F', lineHeight: 100 });
  addText(field2, 'Chevron', '⌄', 300, 14, 20, { font: FONT.sans, size: 14, color: C.soft, lineHeight: 100 });
  const check = frame(page, 'Field / Checkbox', 820, 1420, 330, 52, { stroke: C.line, radius: 8 });
  rect(check, 'Box', 14, 18, 15, 15, { fill: C.white, radius: 3, stroke: C.line });
  addText(check, 'Label', 'I agree to be contacted', 38, 17, 270, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 100 });

  // Cards
  const sampleService = ['Cardiology', 'Heart assessment, blood pressure management and follow-up.', 'Clinical', 'heart'];
  serviceCard(page, 100, 1510, sampleService, 0);
  const sampleDoctor = { image: 'doctorMillion', name: 'Dr. Million Seid Muzeyen', role: 'Internist & CEO', focus: 'Adult internal medicine and chronic disease care.', days: 'Clinic days — call to confirm', booking: 'By phone or appointment form', dept: 'Internal medicine' };
  doctorCard(page, 520, 1510, sampleDoctor);
  storyCard(page, 940, 1510, { quote: '“The nurses explained everything to my mother in Amharic. That made all the difference.”', initials: 'MA', name: 'Mahlet A.', place: 'Lemi Kura, Addis Ababa' });

  eyebrow(page, 100, 1960, '04 · ICONS');
  addText(page, 'Icons heading', 'Line icons, drawn to match the type.', 100, 1992, 700, { font: FONT.serif, size: 30, color: C.ink, lineHeight: 110 });
  const iconNames = ['cross', 'stethoscope', 'heart', 'child', 'users', 'bone', 'scan', 'lab', 'pill', 'eye', 'ear', 'tooth', 'phone', 'pin', 'calendar', 'clock', 'shield', 'check', 'globe', 'user', 'file', 'card', 'activity', 'mail'];
  iconNames.forEach((name, i) => {
    const x = 100 + (i % 12) * 100;
    const y = 2060 + Math.floor(i / 12) * 80;
    const cell = frame(page, `Icon cell / ${name}`, x, y, 76, 60, { fill: C.white, radius: 8, stroke: C.line });
    icon(cell, name, 28, 19, 20, C.forest);
  });

  page.resize(1440, 2350);
  return page;
}
