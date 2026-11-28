/* ==========================================================================
   Home — desktop 1440
   ========================================================================== */

const HOME_DEPARTMENTS = [
  ['Emergency and Critical Care', 'Immediate assessment and stabilisation, 24 hours a day.', 'cross'],
  ['Internal Medicine', 'Adult health, chronic conditions and preventive care.', 'stethoscope'],
  ['Pediatrics and Child Health', 'Gentle, family-centred care for infants, children and teens.', 'child'],
  ['Obstetrics and Gynecology', 'Pregnancy, birth and women\'s health at every stage.', 'users'],
  ['General and Laparoscopic Surgery', 'Elective and emergency procedures in modern theatres.', 'scalpel'],
  ['Orthopedics and Trauma', 'Bones, joints and recovery after injury.', 'bone'],
  ['Cardiology', 'Heart assessment, risk management and follow-up.', 'heart'],
  ['Radiology and Imaging', 'X-ray, ultrasound and diagnostic imaging on site.', 'scan'],
];

const HOME_DOCTORS = [
  { image: 'doctorMillion', name: 'Dr. Million Seid Muzeyen', role: 'Internist & CEO', focus: 'Adult internal medicine and chronic disease care.', days: 'Clinic days — call to confirm', booking: 'By phone or appointment form', dept: 'Internal medicine' },
  { image: 'doctorBiniyam', name: 'Dr. Biniyam Denekew Asrat', role: 'Consultant Obstetrician and Gynecologist', focus: 'Obstetrics, gynaecological care and women\'s health.', days: 'Clinic days — call to confirm', booking: 'By phone or appointment form', dept: 'Women\'s health' },
  { image: 'doctorYasin', name: 'Dr. Yasin Ahmed Yesuf', role: 'Consultant Pediatrician', focus: 'Child health, newborn follow-up and childhood illness.', days: 'Clinic days — call to confirm', booking: 'By phone or appointment form', dept: 'Pediatrics' },
];

// No patient stories are placed in the design. The three quotes that used to sit
// here were written as examples, never real patient statements — publishing them
// put words in patients' mouths. Add a story only after the patient, or their
// family, has agreed in writing.
const HOME_STORIES = [];

function eyebrow(parent, x, y, label, color = C.clay) {
  line(parent, 'Eyebrow / rule', x, y + 6, 26, color, 0.8, 1);
  addText(parent, `Eyebrow / ${label}`, label.toUpperCase(), x + 38, y, 520, {
    font: FONT.sansSemi,
    size: 10.5,
    color,
    lineHeight: 130,
    letterSpacing: 1.8,
  });
}

function trustItem(parent, x, y, iconName, label) {
  icon(parent, iconName, x, y, 15, C.clay);
  addText(parent, `Trust / ${label}`, label, x + 23, y - 2, 300, {
    font: FONT.sansMedium,
    size: 11.5,
    color: C.soft,
    lineHeight: 140,
  });
}

function quickCard(parent, x, y, num, iconName, title, copy, link, dark = false) {
  const card = frame(parent, `Quick card / ${title}`, x, y, 400, 216, {
    fill: dark ? C.forest : C.white,
    radius: 14,
    stroke: dark ? null : C.line,
  });
  const numColor = dark ? C.gold : C.clay;
  addText(card, 'Number', num, 340, 22, 40, { font: FONT.serifItalic, size: 15, color: numColor, lineHeight: 100 });
  ellipse(card, 'Icon circle', 24, 24, 46, dark ? C.forest3 : C.mint);
  icon(card, iconName, 36, 36, 22, dark ? C.gold : C.forest);
  addText(card, 'Title', title, 24, 88, 330, {
    font: FONT.serif,
    size: 25,
    color: dark ? C.paper : C.ink,
    lineHeight: 110,
  });
  addText(card, 'Copy', copy, 24, 126, 330, {
    font: FONT.sans,
    size: 13,
    color: dark ? '#B9C7C1' : C.soft,
    lineHeight: 155,
  });
  addText(card, 'Link', link, 24, 192, 300, {
    font: FONT.sansSemi,
    size: 10.5,
    color: dark ? C.gold : C.forest,
    lineHeight: 100,
    letterSpacing: 0.4,
  });
  icon(card, iconName === 'cross' ? 'phone' : 'arrow', 360, 191, 15, dark ? C.gold : C.soft);
}

// 58 px circular portrait with the site's teal availability dot (2 px white ring).
function doctorPortrait(card, image) {
  addImage(card, 'Portrait', image, 24, 24, 58, 58, { circle: true });
  ellipse(card, 'Availability dot', 71, 71, 10, '#4DC4C1', { stroke: C.white, strokeWeight: 2 });
}

function doctorCard(parent, x, y, doctor, width = 400) {
  const card = frame(parent, `Doctor / ${doctor.name}`, x, y, width, 378, {
    fill: C.white,
    radius: 14,
    stroke: C.line,
  });
  doctorPortrait(card, doctor.image);
  addText(card, 'Name', doctor.name, 96, 31, width - 120, { font: FONT.serif, size: 23, color: C.ink, lineHeight: 110 });
  addText(card, 'Role', doctor.role.toUpperCase(), 96, 61, width - 120, {
    font: FONT.sansSemi, size: 8, color: C.clay, lineHeight: 135, letterSpacing: 0.9,
  });
  addText(card, 'Focus', doctor.focus, 24, 110, width - 48, { font: FONT.sans, size: 13, color: C.soft, lineHeight: 155 });
  line(card, 'Rule', 24, 172, width - 48, C.line, 1);
  icon(card, 'calendar', 24, 190, 14, C.clay);
  addText(card, 'Clinic days', doctor.days, 46, 189, width - 70, { font: FONT.sans, size: 11, color: C.soft, lineHeight: 140 });
  icon(card, 'phone', 24, 218, 14, C.clay);
  addText(card, 'Booking', doctor.booking, 46, 217, width - 70, { font: FONT.sans, size: 11, color: C.soft, lineHeight: 140 });
  line(card, 'Rule 2', 24, 258, width - 48, C.line, 1);
  addText(card, 'Book link', 'Book a visit', 24, 280, 140, { font: FONT.sansSemi, size: 10.5, color: C.clay, lineHeight: 100 });
  addText(card, 'Department', doctor.dept.toUpperCase(), width - 160, 280, 136, {
    font: FONT.sans, size: 8, color: C.soft, lineHeight: 100, align: 'RIGHT', letterSpacing: 0.6,
  });
  return card;
}

function storyCard(parent, x, y, story) {
  const card = frame(parent, `Story / ${story.name}`, x, y, 400, 360, {
    fill: C.white,
    radius: 14,
    stroke: C.line,
  });
  addText(card, 'Quote mark', '“', 24, 16, 60, { font: FONT.serif, size: 64, color: C.gold, lineHeight: 60 });
  addText(card, 'Quote', story.quote, 24, 84, 340, { font: FONT.serif, size: 23, color: C.ink, lineHeight: 140 });
  line(card, 'Rule', 24, 264, 352, C.line, 1);
  ellipse(card, 'Avatar', 24, 286, 36, C.mint);
  addText(card, 'Initials', story.initials, 34, 298, 20, { font: FONT.serif, size: 11, color: C.forest, lineHeight: 100 });
  addText(card, 'Name', story.name, 72, 286, 250, { font: FONT.sansSemi, size: 11, color: C.ink, lineHeight: 120 });
  addText(card, 'Place', story.place, 72, 304, 250, { font: FONT.sans, size: 9.5, color: C.soft, lineHeight: 120 });
  return card;
}

function buildTopbar(page, y) {
  const s = section(page, 'Top bar', y, 40, C.forest);
  ellipse(s, 'Pulse dot', 100, 17, 7, C.rose);
  addText(s, 'Emergency label', '24/7 EMERGENCY & AMBULANCE', 115, 13, 240, {
    font: FONT.sansSemi, size: 9, color: C.paper, lineHeight: 100, letterSpacing: 0.9,
  });
  addText(s, 'Emergency phone', '+251 111 132 702', 342, 13, 160, {
    font: FONT.sansBold, size: 9.5, color: C.paper, lineHeight: 100,
  });
  icon(s, 'pin', 928, 14, 12, C.gold);
  addText(s, 'Address', 'Summit 72, Lemi Kura, Addis Ababa', 947, 13, 250, {
    font: FONT.sans, size: 9.5, color: '#C9D5CF', lineHeight: 100,
  });
  addText(s, 'Email', 'info@summitgh.com.et', 1190, 13, 150, {
    font: FONT.sans, size: 9.5, color: '#C9D5CF', lineHeight: 100, align: 'RIGHT',
  });
  return y + 40;
}

function buildHeader(page, y, active = 'home') {
  const s = section(page, 'Header', y, 86, C.paper);
  line(s, 'Header rule', 0, 85, 1440, C.line, 1);
  logo(s, 100, 20, 117, false);

  const nav = [
    ['home', 'Home', 560],
    ['about', 'About', 625],
    ['services', 'Services', 690],
    ['doctors', 'Doctors', 765],
    ['visit', 'Your visit', 845],
    ['contact', 'Contact', 930],
  ];
  for (const [key, label, x] of nav) {
    addText(s, `Nav / ${label}`, label, x, 37, 100, {
      font: key === active ? FONT.sansBold : FONT.sansMedium,
      size: 12.5,
      color: key === active ? C.ink : C.soft,
      lineHeight: 100,
    });
    if (key === active) ellipse(s, 'Active dot', x + 26, 58, 4, C.clay);
  }

  icon(s, 'phone', 1005, 36, 14, C.clay);
  addText(s, 'Phone', '+251 111 132 702', 1025, 37, 100, {
    font: FONT.sansBold, size: 10, color: C.ink, lineHeight: 100,
  });
  button(s, { x: 1130, y: 22, label: 'Book appointment', kind: 'primary', w: 210, h: 42, small: true });
  return y + 86;
}

function buildHero(page, y) {
  const s = section(page, 'Hero', y, 800, C.paper);
  topo(s, 720, 20, 860, 0.45);

  eyebrow(s, 100, 150, 'SUMMIT 72 · BOLE, ADDIS ABABA');
  const h1 = addText(s, 'Headline', 'Good health has\na home in Addis.', 100, 180, 630, {
    style: T.h1, color: C.ink,
  });
  accent(h1, 'home');
  addText(s, 'Intro', 'Compassionate, consultant-led care for every stage of life — from everyday check-ups to emergencies, all under one roof in Lemi Kura.', 100, 450, 520, {
    style: T.body, color: C.soft,
  });
  button(s, { x: 100, y: 555, label: 'Book an appointment', kind: 'primary' });
  button(s, { x: 310, y: 555, label: 'Explore our services', kind: 'outline' });

  line(s, 'Trust rule', 100, 640, 600, C.line, 1);
  trustItem(s, 100, 665, 'cross', '24/7 emergency care');
  trustItem(s, 300, 665, 'stethoscope', '4 specialist departments');
  trustItem(s, 545, 665, 'calendar', 'Consultant-led outpatient clinics');

  addImage(s, 'Hero image', 'hero', 820, 58, 500, 625, { arch: true, radius: 14 });
  const arch = rect(s, 'Arch outline', 804, 42, 532, 657, { stroke: C.gold, strokeOpacity: 0.6, radius: 266, strokeWeight: 1 });
  arch.topLeftRadius = 266; arch.topRightRadius = 266; arch.bottomLeftRadius = 14; arch.bottomRightRadius = 14;
  ellipse(s, '24/7 badge', 1240, 88, 96, C.forest);
  addText(s, 'Badge 24/7', '24/7', 1259, 116, 60, { font: FONT.serif, size: 26, color: C.paper, lineHeight: 100 });
  addText(s, 'Badge label', 'EMERGENCY', 1262, 148, 60, { font: FONT.sansSemi, size: 7, color: C.gold, lineHeight: 100, letterSpacing: 1.2 });

  const card = frame(s, 'Emergency card', 780, 590, 266, 86, {
    fill: C.paper, radius: 12, stroke: C.line, shadow: true,
  });
  ellipse(card, 'Icon circle', 16, 23, 40, C.forest);
  icon(card, 'ambulance', 26, 33, 20, C.paper);
  addText(card, 'Label', 'EMERGENCY & AMBULANCE', 70, 18, 180, {
    font: FONT.sansSemi, size: 7, color: C.clay, lineHeight: 100, letterSpacing: 1,
  });
  addText(card, 'Phone', '+251 111 132 702', 70, 34, 180, {
    font: FONT.sansBold, size: 11, color: C.ink, lineHeight: 100,
  });
  addText(card, 'Caption', 'Call ahead so we\'re ready', 70, 53, 180, {
    font: FONT.sans, size: 8.5, color: C.soft, lineHeight: 120,
  });
  addText(s, 'Image caption', 'ONE CAMPUS. EVERY STAGE OF CARE.', 1120, 704, 250, {
    font: FONT.sansSemi, size: 7.5, color: C.soft, lineHeight: 100, letterSpacing: 0.9, align: 'RIGHT',
  });
  return y + 800;
}

function buildQuick(page, y) {
  const s = section(page, 'Quick access', y, 270, C.paper);
  quickCard(s, 100, 15, '01', 'cross', 'Emergency and ambulance', 'Walk in any time, or call ahead so our team can prepare for your arrival.', 'Call +251 111 132 702', true);
  quickCard(s, 520, 15, '02', 'calendar', 'Book an appointment', 'Choose a department, tell us when suits you, and we\'ll call to confirm.', 'Start a request');
  quickCard(s, 940, 15, '03', 'stethoscope', 'Find a doctor', 'Browse consultants by department, specialty and clinic day.', 'Open the directory');
  return y + 270;
}

function buildWelcome(page, y) {
  const s = section(page, 'Welcome', y, 780, C.paper);
  addImage(s, 'Portrait', 'portrait', 100, 55, 500, 625, { arch: true, radius: 14 });
  addImage(s, 'Hands detail', 'hands', 430, 540, 280, 210, { radius: 10, stroke: C.paper, strokeWeight: 9 });
  const tag = frame(s, 'Campus tag', 80, 100, 200, 76, { fill: C.forest, radius: 6 });
  addText(tag, 'Label', 'ONE CAMPUS', 16, 14, 170, { font: FONT.sansSemi, size: 8, color: C.gold, lineHeight: 110, letterSpacing: 1.3 });
  addText(tag, 'Text', 'Every stage of care,\nclose to home.', 16, 30, 170, { font: FONT.sans, size: 9.5, color: C.paper, lineHeight: 145 });

  eyebrow(s, 720, 70, 'WELCOME TO SUMMIT');
  addText(s, 'Heading', 'A general hospital,\nbuilt around\nthe person.', 720, 100, 560, { style: T.h2, color: C.ink });
  addText(s, 'Body', 'At Summit General Hospital, good care starts with listening. Our consultants, nurses and support teams work together under one roof — so your questions are answered, your options are clear, and your family stays close.', 720, 282, 560, { style: T.body, color: C.soft });
  addText(s, 'Body 2', 'From our emergency department to outpatient clinics, diagnostics and operating theatres, we bring dependable care to the Summit 72 community and beyond.', 720, 402, 560, { style: T.body, color: C.soft });
  const ticks = [
    'Consultant-led care across four departments',
    'Laboratory, imaging and pharmacy on site',
    'One campus for clinics, diagnostics and surgery',
  ];
  ticks.forEach((item, i) => {
    icon(s, 'check', 720, 498 + i * 28, 15, C.clay);
    addText(s, `Tick ${i + 1}`, item, 744, 496 + i * 28, 500, { font: FONT.sans, size: 13, color: C.ink, lineHeight: 140 });
  });
  button(s, { x: 720, y: 608, label: 'More about Summit', kind: 'outline', small: true });
  addText(s, 'Consultants link', 'Meet our consultants  ↗', 905, 622, 240, { font: FONT.sansSemi, size: 10.5, color: C.clay, lineHeight: 100 });
  return y + 780;
}

function buildStats(page, y) {
  const s = section(page, 'Stats', y, 180, C.paper);
  line(s, 'Top rule', 100, 0, 1240, C.line, 1);
  const stats = [['24/7', 'EMERGENCY & INPATIENT CARE'], ['4', 'SPECIALIST DEPARTMENTS'], ['18', 'SERVICES ON ONE CAMPUS'], ['1', 'CAMPUS IN LEMI KURA']];
  stats.forEach(([value, label], i) => {
    const x = 100 + i * 310;
    addText(s, `Stat ${value}`, value, x, 26, 260, { font: FONT.serif, size: 56, color: C.ink, lineHeight: 100 });
    addText(s, `Label ${i + 1}`, label, x, 100, 250, { font: FONT.sansSemi, size: 9, color: C.soft, lineHeight: 130, letterSpacing: 1.1 });
    if (i < 3) line(s, 'Divider', x + 280, 24, 1, C.line, 1);
  });
  return y + 180;
}

function buildDepartments(page, y) {
  const s = section(page, 'Departments', y, 800, C.sand);
  eyebrow(s, 100, 74, 'CENTRES & DEPARTMENTS');
  addText(s, 'Heading', 'Care for every chapter.', 100, 108, 600, { style: T.h2, color: C.ink });
  addText(s, 'Intro', 'From a child\'s first check-up to specialist surgery, our departments work as one team — with diagnostics, pharmacy and follow-up close by.', 800, 120, 440, { style: T.body, color: C.soft });
  addText(s, 'All services link', 'View all 18 services  →', 800, 250, 260, { font: FONT.sansSemi, size: 10.5, color: C.clay, lineHeight: 100 });

  HOME_DEPARTMENTS.forEach(([title, copy, iconName], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 100 + col * 620;
    const yy = 306 + row * 112;
    line(s, 'Row rule', x, yy, 560, C.line, 1);
    addText(s, 'Number', String(i + 1).padStart(2, '0'), x, yy + 20, 30, { font: FONT.sansSemi, size: 8.5, color: C.clay, lineHeight: 100, letterSpacing: 0.7 });
    addText(s, 'Department', title, x + 40, yy + 15, 440, { font: FONT.serif, size: 22, color: C.ink, lineHeight: 110 });
    addText(s, 'Description', copy, x + 40, yy + 45, 430, { font: FONT.sans, size: 11, color: C.soft, lineHeight: 140 });
    ellipse(s, 'Arrow circle', x + 520, yy + 17, 32, C.sand);
    icon(s, 'arrow', x + 528, yy + 25, 15, C.soft);
  });
  return y + 800;
}

function buildPaths(page, y) {
  const s = section(page, 'Care pathways', y, 780, C.forest);
  topo(s, 760, -60, 780, 0.2);
  eyebrow(s, 100, 80, 'NOT SURE WHERE TO START?', C.gold);
  addText(s, 'Heading', 'The right care,\nat the right time.', 100, 116, 600, { style: T.h2, color: C.paper });
  addText(s, 'Intro', 'Use this quick guide — and if you are ever unsure, call us. A person, not a menu, will answer.', 800, 138, 440, { style: T.body, color: '#B5BFB5' });

  const paths = [
    ['IF IT CAN\'T WAIT', 'Come in now.', 'Chest pain, difficulty breathing, severe bleeding, sudden weakness, a serious accident, or a very sick child.', 'Call the emergency line', 'cross', '#F0A48B'],
    ['IF YOU\'RE WORRIED TODAY', 'Call us first.', 'A fever that won\'t settle, a minor injury, ongoing pain or a sick child — we\'ll help you decide what to do next.', 'Speak to our team', 'clock', C.gold],
    ['IF IT CAN WAIT', 'Book a visit.', 'A check-up, a specialist opinion, a follow-up or a planned procedure. Choose a department and request a time.', 'Request an appointment', 'calendar', C.gold],
  ];

  paths.forEach(([label, title, copy, linkLabel, iconName, color], i) => {
    const x = 100 + i * 420;
    const card = frame(s, `Path / ${title}`, x, 300, 400, 340, {
      fill: i === 0 ? '#183F37' : C.forest, radius: 12, stroke: C.lineLight,
    });
    ellipse(card, 'Icon circle', 24, 24, 46, '#183F37', { stroke: color, strokeOpacity: 0.35 });
    icon(card, iconName, 36, 36, 21, color);
    addText(card, 'Label', label, 250, 38, 130, { font: FONT.sansSemi, size: 7, color: '#9FB0A8', lineHeight: 120, letterSpacing: 1, align: 'RIGHT' });
    addText(card, 'Title', title, 24, 120, 350, { font: FONT.serif, size: 28, color: C.paper, lineHeight: 110 });
    addText(card, 'Copy', copy, 24, 168, 344, { font: FONT.sans, size: 13, color: '#B5BFB5', lineHeight: 155 });
    addText(card, 'Link', `${linkLabel}  →`, 24, 288, 340, { font: FONT.sansSemi, size: 10.5, color, lineHeight: 100 });
  });

  line(s, 'Foot rule', 100, 700, 1240, C.lineLight, 1);
  addText(s, 'Foot note', 'In an emergency, please do not use the online form. Call us or come directly to the emergency entrance.', 100, 720, 900, { font: FONT.sans, size: 9.5, color: '#8FA099', lineHeight: 120 });
  addText(s, 'Foot phone', '+251 111 132 702', 1160, 720, 180, { font: FONT.sansSemi, size: 10, color: C.paper, lineHeight: 120, align: 'RIGHT' });
  return y + 780;
}

function buildPromise(page, y) {
  const s = section(page, 'Why Summit', y, 820, C.paper);
  addImage(s, 'Surgeons', 'surgeons', 100, 70, 460, 575, { arch: true, radius: 12 });
  const badge = frame(s, '24/7 badge', 118, 560, 190, 66, { fill: C.paper, radius: 8, shadow: true });
  addText(badge, 'Title', '24/7', 16, 12, 160, { font: FONT.serif, size: 25, color: C.ink, lineHeight: 100 });
  addText(badge, 'Label', 'EMERGENCY & INPATIENT CARE', 16, 42, 165, { font: FONT.sansSemi, size: 7, color: C.soft, lineHeight: 100, letterSpacing: 0.8 });

  eyebrow(s, 720, 76, 'WHY SUMMIT');
  addText(s, 'Heading', 'Care that treats\nyou like a person,\nnot a case.', 720, 108, 560, { style: T.h2, color: C.ink });
  const items = [
    ['01', 'We listen first.', 'Your story matters. Appointments start with time to talk, not a form to rush through.'],
    ['02', 'We explain clearly.', 'Diagnosis and options in plain language — in the language you are most comfortable speaking.'],
    ['03', 'We stay close.', 'One team, one plan, from your first visit through treatment and follow-up.'],
    ['04', 'We keep you safe.', 'Clean, careful, evidence-based practice — every patient, every time.'],
  ];
  items.forEach(([num, title, copy], i) => {
    const yy = 300 + i * 110;
    line(s, 'Item rule', 720, yy, 560, C.line, 1);
    addText(s, 'Number', num, 720, yy + 24, 32, { font: FONT.serifItalic, size: 15, color: C.clay, lineHeight: 100 });
    addText(s, 'Title', title, 764, yy + 19, 500, { font: FONT.serif, size: 21, color: C.ink, lineHeight: 110 });
    addText(s, 'Copy', copy, 764, yy + 45, 500, { font: FONT.sans, size: 11.5, color: C.soft, lineHeight: 150 });
  });
  line(s, 'Last rule', 720, 740, 560, C.line, 1);
  return y + 820;
}

function buildDoctors(page, y) {
  const s = section(page, 'Specialists', y, 800, C.sand);
  eyebrow(s, 100, 76, 'OUR PEOPLE');
  addText(s, 'Heading', 'Specialists who\nknow your name.', 100, 108, 600, { style: T.h2, color: C.ink });
  addText(s, 'Intro', 'Our consultants are supported by nurses, pharmacists, radiographers, physiotherapists and laboratory scientists who work as one team.', 800, 120, 440, { style: T.body, color: C.soft });
  addText(s, 'Link', 'View all consultants  →', 800, 250, 240, { font: FONT.sansSemi, size: 10.5, color: C.clay, lineHeight: 100 });
  HOME_DOCTORS.forEach((doctor, i) => doctorCard(s, 100 + i * 420, 300, doctor));
  return y + 800;
}

function buildStories(page, y) {
  const s = section(page, 'Patient stories', y, 420, C.paper);
  eyebrow(s, 100, 76, 'PATIENT STORIES');
  addText(s, 'Heading', 'Shared only with consent.', 100, 108, 600, { style: T.h2, color: C.ink });
  addText(s, 'Intro', 'We publish a patient\'s words only when the patient, or their family, has agreed in writing. Nothing is quoted here until then.', 800, 120, 440, { style: T.body, color: C.soft });

  if (HOME_STORIES.length) {
    HOME_STORIES.forEach((story, i) => storyCard(s, 100 + i * 420, 250, story));
  } else {
    addText(s, 'Consent note', 'If you would like to share your experience of care here, send us a message. We will ask for your written consent before anything is published.', 100, 250, 780, { font: FONT.sans, size: 14, color: C.soft, lineHeight: 160 });
  }
  return y + 420;
}

function buildMap(page, y) {
  const s = section(page, 'Visit', y, 760, C.sand);
  addImage(s, 'Map', 'map', 100, 70, 700, 440, { radius: 14, stroke: C.line });
  rect(s, 'Map pin shadow', 512, 274, 18, 6, { fill: C.forest, fillOpacity: 0.22, radius: 999 });
  icon(s, 'pin', 495, 218, 42, C.clay, 2.2);
  const label = frame(s, 'Map address label', 120, 448, 270, 48, { fill: C.paper, radius: 7, stroke: C.line });
  icon(label, 'pin', 12, 15, 16, C.clay);
  addText(label, 'Label', 'SUMMIT 72, BOLE, ADDIS ABABA', 36, 14, 220, { font: FONT.sansSemi, size: 7.5, color: C.ink, lineHeight: 120, letterSpacing: 0.5 });

  eyebrow(s, 850, 76, 'FIND US');
  addText(s, 'Heading', 'Easy to reach, in\nthe heart of Lemi Kura.', 850, 108, 480, { style: T.h2, color: C.ink });
  addText(s, 'Body', 'We\'re at Summit 72 in Lemi Kura — close to home for families across Lemi Kura, CMC, Kazanchis and beyond. Emergency care is open around the clock.', 850, 230, 450, { style: T.body, color: C.soft });

  const facts = [
    ['pin', 'Address', 'Summit 72, Lemi Kura, Addis Ababa, Ethiopia'],
    ['phone', 'Phone', '+251 111 132 702'],
    ['clock', 'Hours', 'Emergency 24/7 · Outpatient hours: call to confirm'],
    ['mail', 'Email', 'info@summitgh.com.et'],
  ];
  facts.forEach(([iconName, title, value], i) => {
    const yy = 340 + i * 62;
    line(s, 'Fact rule', 850, yy, 490, C.line, 1);
    icon(s, iconName, 850, yy + 17, 15, C.clay);
    addText(s, 'Fact title', title, 878, yy + 12, 420, { font: FONT.sansSemi, size: 10, color: C.ink, lineHeight: 110 });
    addText(s, 'Fact value', value, 878, yy + 28, 440, { font: FONT.sans, size: 9.5, color: C.soft, lineHeight: 130 });
  });
  button(s, { x: 850, y: 610, label: 'Get directions', kind: 'primary', small: true });
  button(s, { x: 1020, y: 610, label: 'Plan your visit', kind: 'outline', small: true });
  return y + 760;
}

function buildCTA(page, y) {
  const s = section(page, 'CTA', y, 380, C.forest);
  topo(s, 760, -80, 720, 0.2);
  eyebrow(s, 100, 76, 'READY WHEN YOU ARE', C.gold);
  addText(s, 'Heading', 'Care, when you need it.', 100, 108, 680, { style: T.h2, color: C.paper });
  addText(s, 'Body', 'Book a consultation, call our team, or simply come in. We\'re here — day and night.', 100, 240, 480, { style: T.body, color: '#B5BFB5' });
  button(s, { x: 900, y: 250, label: 'Book an appointment', kind: 'light' });
  button(s, { x: 1130, y: 250, label: 'Call +251 111 132 702', kind: 'ghost' });
  return y + 380;
}

function buildFooter(page, y) {
  const s = section(page, 'Footer', y, 500, C.forest);
  logo(s, 100, 66, 142, true);
  addText(s, 'Description', 'Compassionate, consultant-led care\nin the heart of Lemi Kura — for every stage\nof life.', 100, 130, 300, { font: FONT.sans, size: 12, color: '#B5BFB5', lineHeight: 155 });
  const emergency = frame(s, 'Footer emergency', 100, 230, 300, 68, { stroke: C.lineLight, radius: 8 });
  ellipse(emergency, 'Dot', 16, 28, 7, C.rose);
  addText(emergency, 'Label', '24/7 EMERGENCY & AMBULANCE', 32, 16, 240, { font: FONT.sansSemi, size: 7, color: C.gold, lineHeight: 100, letterSpacing: 1 });
  addText(emergency, 'Phone', '+251 111 132 702', 32, 32, 240, { font: FONT.sansBold, size: 12, color: C.paper, lineHeight: 100 });

  const columns = [
    ['Explore', ['Home', 'About Summit', 'Services', 'Our doctors'], 600],
    ['Patients', ['Book an appointment', 'Your visit', 'Visiting hours', 'Contact us'], 820],
    ['Visit', ['Summit 72, Lemi Kura', 'Addis Ababa, Ethiopia', 'info@summitgh.com.et', 'Emergency open 24 hours'], 1040],
  ];
  columns.forEach(([title, links, x]) => {
    addText(s, 'Column title', title.toUpperCase(), x, 70, 200, { font: FONT.sansSemi, size: 8, color: C.gold, lineHeight: 100, letterSpacing: 1.4 });
    links.forEach((link, i) => {
      addText(s, 'Footer link', link, x, 100 + i * 26, 220, { font: FONT.sans, size: 10.5, color: '#C9D5CF', lineHeight: 120 });
    });
  });
  addText(s, 'Get directions', 'Get directions  ↗', 1040, 222, 220, { font: FONT.sansSemi, size: 10, color: C.paper, lineHeight: 100 });
  line(s, 'Bottom rule', 100, 370, 1240, C.lineLight, 1);
  addText(s, 'Copyright', '© 2026 Summit General Hospital. All rights reserved.', 100, 392, 500, { font: FONT.sans, size: 8, color: '#8FA099', lineHeight: 120 });
  addText(s, 'Legal', 'Privacy      Sitemap', 1160, 392, 180, { font: FONT.sans, size: 8, color: '#8FA099', lineHeight: 120, align: 'RIGHT' });
  addText(s, 'Disclaimer', 'This website provides general health information and is not a substitute for professional medical advice, diagnosis or treatment. In an emergency, call +251 111 132 702 or go to the nearest emergency department.', 100, 430, 900, { font: FONT.sans, size: 7, color: '#8FA099', lineHeight: 145 });
  return y + 500;
}

async function buildHome(originX = 0) {
  const page = figma.createFrame();
  page.name = '01 · Home — Desktop';
  page.resize(1440, 100);
  page.fills = [paint(C.paper)];
  page.clipsContent = true;
  page.x = originX;
  page.y = 0;
  figma.currentPage.appendChild(page);

  let y = 0;
  y = buildTopbar(page, y);
  y = buildHeader(page, y, 'home');
  y = buildHero(page, y);
  y = buildQuick(page, y);
  y = buildWelcome(page, y);
  y = buildStats(page, y);
  y = buildDepartments(page, y);
  y = buildPaths(page, y);
  y = buildPromise(page, y);
  y = buildDoctors(page, y);
  y = buildStories(page, y);
  y = buildMap(page, y);
  y = buildCTA(page, y);
  y = buildFooter(page, y);
  page.resize(1440, y);
  return page;
}
