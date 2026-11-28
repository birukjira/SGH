/* ==========================================================================
   Mobile frames — 390 wide
   ========================================================================== */

function mobileTopbar(page, y) {
  const s = frame(page, 'Section / Top bar', 0, y, 390, 38, { fill: C.forest });
  ellipse(s, 'Pulse dot', 20, 16, 6, C.rose);
  addText(s, 'Emergency', '24/7 EMERGENCY & AMBULANCE', 32, 12, 220, { font: FONT.sansSemi, size: 7.5, color: C.paper, lineHeight: 100, letterSpacing: 0.7 });
  addText(s, 'Phone', '+251 111 132 702', 260, 12, 110, { font: FONT.sansBold, size: 7.5, color: C.paper, lineHeight: 100, align: 'RIGHT' });
  return y + 38;
}

function mobileHeader(page, y) {
  const s = frame(page, 'Section / Header', 0, y, 390, 76, { fill: C.paper });
  line(s, 'Rule', 0, 75, 390, C.line, 1);
  logo(s, 20, 18, 104, false);
  const menu = frame(s, 'Menu button', 330, 18, 40, 40, { stroke: C.line });
  menu.cornerRadius = 999;
  line(menu, 'Line 1', 11, 18, 18, C.ink, 1, 1.5);
  line(menu, 'Line 2', 11, 23, 18, C.ink, 1, 1.5);
  return y + 76;
}

function buildMobileHome() {
  const page = pageFrame('08 · Home — Mobile', 11200);
  let y = 0;
  y = mobileTopbar(page, y);
  y = mobileHeader(page, y);

  const hero = frame(page, 'Section / Hero', 0, y, 390, 1110, { fill: C.paper });
  topo(hero, 140, 80, 340, 0.35);
  eyebrow(hero, 20, 38, 'SUMMIT 72 · BOLE, ADDIS ABABA');
  const h1 = addText(hero, 'Headline', 'Good health has\na home in Addis.', 20, 74, 350, {
    font: FONT.serif, size: 44, color: C.ink, lineHeight: 102, letterSpacing: -1.5,
  });
  accent(h1, 'home');
  addText(hero, 'Intro', 'Compassionate, consultant-led care for every stage of life — from everyday check-ups to emergencies, all under one roof in Lemi Kura.', 20, 218, 350, { style: T.bodySm, color: C.soft });
  button(hero, { x: 20, y: 340, label: 'Book an appointment', kind: 'primary', w: 350, h: 48 });
  button(hero, { x: 20, y: 400, label: 'Explore our services', kind: 'outline', w: 350, h: 48 });
  line(hero, 'Trust rule', 20, 480, 350, C.line, 1);
  const trust = [['cross', '24/7 emergency care'], ['stethoscope', '4 specialist departments'], ['calendar', 'Consultant-led outpatient clinics']];
  trust.forEach(([iconName, label], i) => {
    icon(hero, iconName, 20, 502 + i * 28, 14, C.clay);
    addText(hero, 'Trust', label, 42, 500 + i * 28, 320, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 140 });
  });
  addImage(hero, 'Hero image', 'hero', 20, 610, 350, 437, { arch: true, radius: 14 });
  ellipse(hero, 'Badge', 273, 620, 78, C.forest);
  addText(hero, 'Badge 24/7', '24/7', 289, 642, 50, { font: FONT.serif, size: 21, color: C.paper, lineHeight: 100 });
  addText(hero, 'Badge label', 'EMERGENCY', 290, 668, 50, { font: FONT.sansSemi, size: 6, color: C.gold, lineHeight: 100, letterSpacing: 0.9 });
  const card = frame(hero, 'Emergency card', 20, 1002, 350, 74, { fill: C.paper, radius: 10, stroke: C.line, shadow: true });
  ellipse(card, 'Icon circle', 14, 17, 38, C.forest);
  icon(card, 'ambulance', 24, 27, 18, C.paper);
  addText(card, 'Label', 'EMERGENCY & AMBULANCE', 64, 14, 260, { font: FONT.sansSemi, size: 7, color: C.clay, lineHeight: 100, letterSpacing: 0.8 });
  addText(card, 'Phone', '+251 111 132 702', 64, 30, 260, { font: FONT.sansBold, size: 10.5, color: C.ink, lineHeight: 100 });
  addText(card, 'Copy', 'Call ahead so we\'re ready', 64, 48, 260, { font: FONT.sans, size: 8, color: C.soft, lineHeight: 100 });
  y += 1110;

  const quick = frame(page, 'Section / Quick access', 0, y, 390, 720, { fill: C.paper });
  const cards = [
    ['Emergency and ambulance', 'Walk in any time, or call ahead so our team can prepare.', '01', 'cross', true],
    ['Book an appointment', 'Choose a department, tell us when suits you, and we\'ll call to confirm.', '02', 'calendar', false],
    ['Find a doctor', 'Browse consultants by department, specialty and clinic day.', '03', 'stethoscope', false],
  ];
  cards.forEach(([title, copy, num, iconName, dark], i) => {
    const c = frame(quick, `Quick card / ${title}`, 20, 20 + i * 226, 350, 206, { fill: dark ? C.forest : C.white, radius: 12, stroke: dark ? null : C.line });
    addText(c, 'Number', num, 300, 18, 30, { font: FONT.serifItalic, size: 13, color: dark ? C.gold : C.clay, lineHeight: 100 });
    ellipse(c, 'Icon circle', 18, 18, 42, dark ? C.forest3 : C.mint);
    icon(c, iconName, 29, 29, 20, dark ? C.gold : C.forest);
    addText(c, 'Title', title, 18, 78, 310, { font: FONT.serif, size: 23, color: dark ? C.paper : C.ink, lineHeight: 110 });
    addText(c, 'Copy', copy, 18, 112, 310, { font: FONT.sans, size: 12, color: dark ? '#B5BFB5' : C.soft, lineHeight: 150 });
    addText(c, 'Link', iconName === 'cross' ? 'Call +251 111 132 702  →' : (iconName === 'calendar' ? 'Start a request  →' : 'Open the directory  →'), 18, 168, 310, { font: FONT.sansSemi, size: 9, color: dark ? C.gold : C.forest, lineHeight: 100 });
  });
  y += 720;

  const welcome = frame(page, 'Section / Welcome', 0, y, 390, 420, { fill: C.paper });
  eyebrow(welcome, 20, 30, 'WELCOME TO SUMMIT');
  addText(welcome, 'Heading', 'A general hospital,\nbuilt around the person.', 20, 62, 350, { font: FONT.serif, size: 32, color: C.ink, lineHeight: 108 });
  addText(welcome, 'Body', 'At Summit General Hospital, good care starts with listening. Our consultants, nurses and support teams work together under one roof.', 20, 170, 350, { style: T.bodySm, color: C.soft });
  y += 420;

  page.resize(390, y);
  return page;
}

function buildMobileAppointment() {
  const page = pageFrame('09 · Appointment — Mobile', 11650);
  let y = 0;
  y = mobileTopbar(page, y);
  y = mobileHeader(page, y);

  const hero = frame(page, 'Section / Page hero', 0, y, 390, 300, { fill: C.paper });
  addText(hero, 'Breadcrumb', 'HOME   /   APPOINTMENTS', 20, 20, 300, { font: FONT.sansSemi, size: 8, color: C.soft, lineHeight: 100, letterSpacing: 1 });
  eyebrow(hero, 20, 58, 'APPOINTMENTS');
  addText(hero, 'Title', 'Request an\nappointment.', 20, 92, 350, { font: FONT.serif, size: 42, color: C.ink, lineHeight: 104 });
  addText(hero, 'Intro', 'Tell us what you need and when suits you. Our team will call you to confirm.', 20, 192, 350, { style: T.bodySm, color: C.soft });
  y += 300;

  const form = frame(page, 'Booking card', 20, y + 20, 350, 1120, { fill: C.white, radius: 16, stroke: C.line, shadow: true });
  addText(form, 'Title', 'Book a visit', 20, 20, 250, { font: FONT.serif, size: 28, color: C.ink, lineHeight: 100 });
  addText(form, 'Sub', 'Four short steps. No payment required online.', 20, 54, 300, { font: FONT.sans, size: 9, color: C.soft, lineHeight: 120 });
  const steps = ['Your visit', 'Date & time', 'Your details', 'Review'];
  steps.forEach((label, i) => {
    const x = 20 + (i % 2) * 160;
    const yy = 90 + Math.floor(i / 2) * 42;
    line(form, 'Step rule', x, yy, 150, i === 0 ? C.clay : C.line, 1, i === 0 ? 2 : 1);
    addText(form, 'Step num', `0${i + 1}`, x, yy + 8, 30, { font: FONT.sansSemi, size: 6.5, color: i === 0 ? C.clay : C.soft, lineHeight: 100 });
    addText(form, 'Step label', label, x, yy + 20, 150, { font: FONT.sansSemi, size: 7, color: i === 0 ? C.ink : C.soft, lineHeight: 100 });
  });
  addText(form, 'Step title', 'What brings you in?', 20, 184, 300, { font: FONT.serif, size: 26, color: C.ink, lineHeight: 110 });
  addText(form, 'Step intro', 'Choose the department closest to your concern.', 20, 218, 300, { font: FONT.sans, size: 9, color: C.soft, lineHeight: 140 });
  field(form, 20, 260, 310, 'Department', 'Select a department', { select: true, placeholder: true, height: 44 });
  field(form, 20, 340, 310, 'Preferred consultant (optional)', 'Choose a department first', { select: true, placeholder: true, height: 44 });
  addText(form, 'Visit type label', 'VISIT TYPE', 20, 422, 300, { font: FONT.sansSemi, size: 7, color: C.ink, lineHeight: 100, letterSpacing: 0.6 });
  const choices = [['First consultation', 'A new concern or first visit.'], ['Follow-up visit', 'A review of ongoing care.']];
  choices.forEach(([title, copy], i) => {
    const c = frame(form, `Choice / ${title}`, 20, 440 + i * 82, 310, 72, { fill: i === 0 ? '#FAF7F0' : C.white, radius: 8, stroke: i === 0 ? C.forest : C.line, strokeWeight: i === 0 ? 1.5 : 1 });
    ellipse(c, 'Icon circle', 12, 18, 30, C.mint);
    icon(c, i === 0 ? 'calendar' : 'activity', 19, 25, 15, C.forest);
    addText(c, 'Title', title, 52, 15, 245, { font: FONT.sansSemi, size: 9, color: C.ink, lineHeight: 120 });
    addText(c, 'Copy', copy, 52, 32, 245, { font: FONT.sans, size: 8, color: C.soft, lineHeight: 130 });
  });
  line(form, 'Rule', 20, 620, 310, C.line, 1);
  addText(form, 'Browse', 'Browse doctors  →', 20, 640, 180, { font: FONT.sansSemi, size: 9, color: C.clay, lineHeight: 100 });
  button(form, { x: 20, y: 672, label: 'Continue', kind: 'primary', w: 310, h: 48 });
  addText(form, 'Note', 'We\'ll call you to confirm. This is a request, not a confirmed appointment.', 20, 736, 310, { font: FONT.sans, size: 8, color: C.soft, lineHeight: 140 });

  y += 20 + 1120 + 20;
  const aside = frame(page, 'Emergency aside', 20, y, 350, 130, { fill: C.forest, radius: 12 });
  icon(aside, 'cross', 18, 18, 18, C.gold);
  addText(aside, 'Title', 'Is this an emergency?', 18, 46, 310, { font: FONT.serif, size: 20, color: C.paper, lineHeight: 110 });
  addText(aside, 'Copy', 'Don\'t use this form. Call our emergency line or come directly to Summit 72.', 18, 74, 310, { font: FONT.sans, size: 9, color: '#B5BFB5', lineHeight: 140 });
  addText(aside, 'Phone', '+251 111 132 702', 18, 106, 310, { font: FONT.sansSemi, size: 9, color: C.gold, lineHeight: 100 });
  y += 160;

  page.resize(390, y);
  return page;
}
