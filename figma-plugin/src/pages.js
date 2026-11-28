/* ==========================================================================
   Inner pages — desktop 1440
   ========================================================================== */

const SERVICES = [
  ['Emergency and Critical Care', 'Immediate assessment, stabilisation and critical care for adults and children — day or night.', 'Emergency', 'cross', true],
  ['Internal Medicine', 'Adult health, chronic conditions, infections and preventive care from experienced internists.', 'Clinical', 'stethoscope'],
  ['Family Medicine and Screening', 'A regular doctor for check-ups, health screening, travel advice and family health.', 'Clinical', 'user'],
  ['Pediatrics and Child Health', 'Newborn checks, childhood illness, growth monitoring, vaccinations and family support.', 'Clinical', 'child'],
  ['Obstetrics and Gynecology', 'Antenatal care, safe delivery, postnatal support and gynecological care at every stage.', 'Clinical', 'users'],
  ['General and Laparoscopic Surgery', 'Elective and emergency procedures, including minimally invasive surgery, in modern theatres.', 'Clinical', 'scalpel'],
  ['Orthopedics and Trauma', 'Fracture care, joint assessment and rehabilitation after injury or surgery.', 'Clinical', 'bone'],
  ['Cardiology', 'Heart assessment, blood pressure management, risk reduction and ongoing follow-up.', 'Clinical', 'heart'],
  ['Neurology', 'Assessment for headache, seizure, stroke follow-up and other neurological concerns.', 'Clinical', 'brain'],
  ['Dermatology', 'Skin, hair and nail conditions for adults and children, with practical treatment advice.', 'Clinical', 'shield'],
  ['Ear, Nose and Throat (ENT)', 'Ear, nose and throat care for adults and children, from sinus problems to hearing concerns.', 'Clinical', 'ear'],
  ['Ophthalmology', 'Eye checks, vision care and assessment of common eye conditions for all ages.', 'Clinical', 'eye'],
  ['Urology', 'Assessment and treatment for urinary concerns and men\'s health, with respectful, private care.', 'Clinical', 'droplet'],
  ['Dental Care', 'Preventive dentistry, fillings, extractions and practical oral health advice.', 'Clinical', 'tooth'],
  ['Radiology and Imaging', 'X-ray, ultrasound and diagnostic imaging to support your diagnosis and treatment plan.', 'Diagnostics', 'scan'],
  ['Laboratory Services', 'Haematology, biochemistry, microbiology and rapid tests, with timely results for your clinician.', 'Diagnostics', 'lab'],
  ['Pharmacy', 'Prescription dispensing, medication advice and refills from pharmacists who know your plan.', 'Support', 'pill'],
  ['Physiotherapy and Rehabilitation', 'Movement, pain and recovery programmes after injury, surgery or a long illness.', 'Support', 'activity'],
];

const DOCTORS = [
  ['Dr. Million Seid Muzeyen', 'Internist & CEO', 'Internal medicine', 'Adult internal medicine and chronic disease care.', 'Clinic days — call to confirm', 'By phone or appointment form', 'doctorMillion'],
  ['Dr. Yasin Ahmed Yesuf', 'Consultant Pediatrician', 'Pediatrics', 'Child health, newborn follow-up and childhood illness.', 'Clinic days — call to confirm', 'By phone or appointment form', 'doctorYasin'],
  ['Dr. Gosa Abebe Shifera', 'Consultant General Surgeon', 'Surgery', 'General and emergency surgery.', 'Clinic days — call to confirm', 'By phone or appointment form', 'doctorGosa'],
  ['Dr. Biniyam Denekew Asrat', 'Consultant Obstetrician and Gynecologist', 'Women\'s health', 'Obstetrics, gynaecological care and women\'s health.', 'Clinic days — call to confirm', 'By phone or appointment form', 'doctorBiniyam'],
];

function pageFrame(name, originX, height = 1200) {
  const page = figma.createFrame();
  page.name = name;
  page.resize(1440, height);
  page.fills = [paint(C.paper)];
  page.clipsContent = true;
  page.x = originX;
  page.y = 0;
  figma.currentPage.appendChild(page);
  return page;
}

function buildPageHero(page, y, data) {
  const s = section(page, 'Page hero', y, 430, C.paper);
  topo(s, 900, -80, 700, 0.3);
  addText(s, 'Breadcrumb', `Home   /   ${data.crumb}`, 100, 30, 500, {
    font: FONT.sansSemi, size: 8.5, color: C.soft, lineHeight: 100, letterSpacing: 1,
  });
  eyebrow(s, 100, 66, data.eyebrow);
  addText(s, 'Page title', data.title, 100, 100, 790, { style: T.pageTitle, color: C.ink });
  addText(s, 'Page intro', data.lede, 100, 278, 650, { style: T.body, color: C.soft });

  if (data.asideTitle) {
    const aside = frame(s, 'Page aside', 1000, 62, 300, 250, { fill: C.paper, radius: 12, stroke: C.line, fillOpacity: 0.6 });
    eyebrow(aside, 22, 22, data.asideEyebrow || 'AT A GLANCE');
    addText(aside, 'Aside title', data.asideTitle, 22, 58, 256, { font: FONT.serif, size: 24, color: C.ink, lineHeight: 110 });
    addText(aside, 'Aside body', data.asideText, 22, 100, 256, { font: FONT.sans, size: 11, color: C.soft, lineHeight: 155 });
    addText(aside, 'Aside link', data.asideLink || 'Find us  ↗', 22, 208, 250, { font: FONT.sansSemi, size: 10, color: C.clay, lineHeight: 100 });
  }
  return y + 430;
}

function serviceTagColor(category) {
  if (category === 'Emergency') return { fill: '#F7E3DB', color: C.emergency, stroke: '#E4C3B4' };
  if (category === 'Clinical') return { fill: null, color: C.soft, stroke: C.line };
  return { fill: null, color: '#7E5E24', stroke: '#D8C28F' };
}

function serviceCard(parent, x, y, service, index) {
  const [title, copy, category, iconName, isEmergency] = service;
  const card = frame(parent, `Service / ${title}`, x, y, 400, 280, {
    fill: isEmergency ? '#FFFAF7' : C.white,
    radius: 14,
    stroke: isEmergency ? '#E4C3B4' : C.line,
  });
  ellipse(card, 'Icon circle', 24, 24, 44, isEmergency ? '#F7E3DB' : C.mint);
  icon(card, iconName, 36, 36, 20, isEmergency ? C.emergency : C.forest);
  const tagColor = serviceTagColor(category);
  tag(card, 260, 24, category.toUpperCase(), { fill: tagColor.fill, color: tagColor.color, stroke: tagColor.stroke });
  addText(card, 'Title', title, 24, 86, 352, { font: FONT.serif, size: 20, color: C.ink, lineHeight: 110 });
  addText(card, 'Copy', copy, 24, 140, 352, { font: FONT.sans, size: 11, color: C.soft, lineHeight: 155 });
  line(card, 'Rule', 24, 232, 352, C.line, 1);
  addText(card, 'Link', isEmergency ? 'Call the emergency line  →' : (category === 'Clinical' ? 'Book this service  →' : 'Ask about this service  →'), 24, 250, 340, {
    font: FONT.sansSemi, size: 9.5, color: isEmergency ? C.emergency : C.forest, lineHeight: 100,
  });
}

function buildServices(originX) {
  const page = pageFrame('02 · Services — Desktop', originX);
  let y = 0;
  y = buildTopbar(page, y);
  y = buildHeader(page, y, 'services');
  y = buildPageHero(page, y, {
    crumb: 'Services',
    eyebrow: 'SERVICES & DEPARTMENTS',
    title: 'Care for every need.',
    lede: 'Eighteen services, one connected team. Browse by department or filter to find what you need — and if you\'re unsure, call us. We\'ll point you in the right direction.',
    asideEyebrow: 'EMERGENCY',
    asideTitle: 'Open 24 hours.',
    asideText: 'For chest pain, severe bleeding, breathing difficulty or a serious accident, come directly or call ahead.',
    asideLink: '+251 111 132 702  ↗',
  });

  const notice = section(page, 'Notice', y, 100, C.paper);
  const box = frame(notice, 'Emergency notice', 100, 18, 1240, 62, { fill: '#F9E9E1', radius: 10, stroke: '#E4C3B4' });
  icon(box, 'cross', 18, 21, 19, C.emergency);
  addText(box, 'Notice text', 'In an emergency, don\'t wait for an online reply. Call +251 111 132 702 or come directly to our emergency entrance at Summit 72, Lemi Kura.', 48, 20, 1160, { font: FONT.sans, size: 11, color: '#6D2C1A', lineHeight: 140 });
  y += 100;

  const s = section(page, 'Service directory', y, 2220, C.paper);
  eyebrow(s, 100, 20, 'FIND A SERVICE');
  addText(s, 'Count', 'Showing 18 of 18 services', 1080, 20, 260, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 100, align: 'RIGHT' });
  const chips = ['All', 'Emergency', 'Clinical', 'Diagnostics', 'Support'];
  let chipX = 100;
  chips.forEach((label, i) => {
    const chipWidth = Math.max(50, label.length * 6.2 + 26);
    const chip = frame(s, `Filter / ${label}`, chipX, 56, chipWidth, 38, { fill: i === 0 ? C.forest : null, radius: 999, stroke: i === 0 ? null : C.line });
    addText(chip, 'Label', label, 0, 11, chipWidth, { font: FONT.sansSemi, size: 10, color: i === 0 ? C.paper : C.soft, lineHeight: 100, align: 'CENTER' });
    chipX += chipWidth + 8;
  });

  SERVICES.forEach((service, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    serviceCard(s, 100 + col * 420, 132 + row * 300, service, i);
  });

  const support = frame(s, 'Support band', 100, 1960, 1240, 210, { fill: C.paper2, radius: 14 });
  eyebrow(support, 28, 28, 'ONE CAMPUS');
  addText(support, 'Support heading', 'Fewer journeys. More answers.', 28, 58, 480, { font: FONT.serif, size: 30, color: C.ink, lineHeight: 110 });
  addText(support, 'Support body', 'Consultation, imaging, laboratory tests and pharmacy are steps apart — so your care moves quickly and your family spends less time travelling.', 28, 104, 460, { font: FONT.sans, size: 11, color: C.soft, lineHeight: 150 });
  const supportItems = [['On-site diagnostics', 'scan'], ['Pharmacy', 'pill'], ['Rehabilitation', 'activity']];
  supportItems.forEach(([label, iconName], i) => {
    const xx = 560 + i * 220;
    const item = frame(support, `Support / ${label}`, xx, 34, 200, 140, { fill: C.paper, radius: 8, stroke: C.line });
    icon(item, iconName, 16, 16, 18, C.clay);
    addText(item, 'Title', label, 16, 50, 170, { font: FONT.sansSemi, size: 10, color: C.ink, lineHeight: 120 });
    addText(item, 'Copy', i === 0 ? 'X-ray, ultrasound and laboratory services.' : i === 1 ? 'Medicines and advice before you leave.' : 'Physiotherapy for recovery and movement.', 16, 70, 168, { font: FONT.sans, size: 9, color: C.soft, lineHeight: 140 });
  });
  y += 2220;

  y = buildCTA(page, y);
  y = buildFooter(page, y);
  page.resize(1440, y);
  return page;
}

function buildDoctorsPage(originX) {
  const page = pageFrame('03 · Doctors — Desktop', originX);
  let y = 0;
  y = buildTopbar(page, y);
  y = buildHeader(page, y, 'doctors');
  y = buildPageHero(page, y, {
    crumb: 'Doctors',
    eyebrow: 'OUR CONSULTANTS',
    title: 'Find the right specialist.',
    lede: 'Search by name or specialty, or filter by the kind of care you need. Every consultation is with a qualified consultant — and a team that will explain the next step clearly.',
    asideEyebrow: 'NEED HELP CHOOSING?',
    asideTitle: 'We\'ll guide you.',
    asideText: 'Not sure which specialty fits your concern? Call our front desk and we\'ll guide you to the right consultant.',
    asideLink: '+251 111 132 702  ↗',
  });

  const s = section(page, 'Directory', y, 1040, C.paper);
  const note = frame(s, 'Note', 100, 18, 1240, 54, { fill: C.paper2, radius: 8, stroke: C.line });
  icon(note, 'calendar', 16, 19, 16, C.clay);
  addText(note, 'Note text', 'Consultations are by appointment. Clinic days below are a guide — call us to confirm availability, or request an appointment online.', 42, 19, 1170, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 130 });
  const filters = ['All', 'Internal medicine', 'Pediatrics', 'Women\'s health', 'Surgery & ortho'];
  let chipX = 100;
  filters.forEach((label, i) => {
    const width = Math.max(54, label.length * 6.2 + 24);
    const chip = frame(s, `Filter / ${label}`, chipX, 90, width, 38, { fill: i === 0 ? C.forest : null, radius: 999, stroke: i === 0 ? null : C.line });
    addText(chip, 'Label', label, 0, 11, width, { font: FONT.sansSemi, size: 9.5, color: i === 0 ? C.paper : C.soft, lineHeight: 100, align: 'CENTER' });
    chipX += width + 8;
  });
  const search = frame(s, 'Search', 1080, 90, 260, 38, { fill: C.white, radius: 999, stroke: C.line });
  icon(search, 'user', 14, 12, 14, C.soft);
  addText(search, 'Placeholder', 'Search name or specialty', 36, 12, 210, { font: FONT.sans, size: 9.5, color: C.soft, lineHeight: 100 });
  addText(s, 'Count', 'Showing 4 consultants', 100, 146, 300, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 100 });

  DOCTORS.forEach(([name, role, dept, focus, days, booking, image], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 100 + col * 420;
    const yy = 190 + row * 400;
    const card = frame(s, `Doctor / ${name}`, x, yy, 400, 378, { fill: C.white, radius: 14, stroke: C.line });
    doctorPortrait(card, image);
    addText(card, 'Name', name, 96, 31, 280, { font: FONT.serif, size: 23, color: C.ink, lineHeight: 110 });
    addText(card, 'Role', role.toUpperCase(), 96, 61, 280, { font: FONT.sansSemi, size: 8, color: C.clay, lineHeight: 135, letterSpacing: 0.9 });
    addText(card, 'Focus', focus, 24, 110, 352, { font: FONT.sans, size: 13, color: C.soft, lineHeight: 155 });
    line(card, 'Rule', 24, 172, 352, C.line, 1);
    icon(card, 'calendar', 24, 190, 14, C.clay);
    addText(card, 'Clinic days', days, 46, 189, 320, { font: FONT.sans, size: 11, color: C.soft, lineHeight: 140 });
    icon(card, 'phone', 24, 218, 14, C.clay);
    addText(card, 'Booking', booking, 46, 217, 320, { font: FONT.sans, size: 11, color: C.soft, lineHeight: 140 });
    line(card, 'Rule 2', 24, 258, 352, C.line, 1);
    addText(card, 'Book link', 'Book a visit  →', 24, 280, 150, { font: FONT.sansSemi, size: 10.5, color: C.clay, lineHeight: 100 });
    addText(card, 'Department', dept.toUpperCase(), 260, 280, 116, { font: FONT.sans, size: 8, color: C.soft, lineHeight: 100, align: 'RIGHT', letterSpacing: 0.5 });
  });

  y += 1040;
  const recruit = section(page, 'Recruit band', y, 140, C.paper);
  const band = frame(recruit, 'Recruit panel', 100, 20, 1240, 100, { fill: C.forest, radius: 14 });
  addText(band, 'Heading', 'Are you a consultant considering joining Summit?', 28, 26, 780, { font: FONT.serif, size: 25, color: C.paper, lineHeight: 110 });
  addText(band, 'Copy', 'We are always interested in meeting doctors and nurses who share our approach to care.', 28, 60, 760, { font: FONT.sans, size: 10, color: '#B5BFB5', lineHeight: 120 });
  button(band, { x: 1035, y: 28, label: 'Write to our team', kind: 'light', small: true });
  y += 140;

  y = buildCTA(page, y);
  y = buildFooter(page, y);
  page.resize(1440, y);
  return page;
}

function field(parent, x, y, w, label, value, options = {}) {
  addText(parent, `Label / ${label}`, label.toUpperCase(), x, y, w, { font: FONT.sansSemi, size: 8, color: C.ink, lineHeight: 100, letterSpacing: 0.7 });
  const input = frame(parent, `Input / ${label}`, x, y + 17, w, options.height || 48, { fill: C.white, radius: 8, stroke: C.line });
  addText(input, 'Value', value, 14, 15, w - 40, { font: FONT.sans, size: 11, color: options.placeholder ? '#8A958F' : C.ink, lineHeight: 100 });
  if (options.select) addText(input, 'Chevron', '⌄', w - 28, 12, 20, { font: FONT.sans, size: 14, color: C.soft, lineHeight: 100 });
  if (options.help) addText(parent, `Help / ${label}`, options.help, x, y + 70, w, { font: FONT.sans, size: 8.5, color: C.soft, lineHeight: 130 });
}

function buildAppointmentPage(originX) {
  const page = pageFrame('04 · Appointment — Desktop', originX);
  let y = 0;
  y = buildTopbar(page, y);
  y = buildHeader(page, y);
  y = buildPageHero(page, y, {
    crumb: 'Appointments',
    eyebrow: 'APPOINTMENTS',
    title: 'Request an appointment.',
    lede: 'Tell us what you need and when suits you. Our team will call you to confirm the time and answer any questions before your visit.',
    asideEyebrow: 'PREFER TO TALK?',
    asideTitle: 'Call our front desk.',
    asideText: 'We can often find a time while you\'re on the phone. Emergency care is open 24/7.',
    asideLink: '+251 111 132 702  ↗',
  });

  const s = section(page, 'Booking form', y, 1040, C.paper);
  const card = frame(s, 'Booking card', 100, 40, 820, 780, { fill: C.white, radius: 18, stroke: C.line, shadow: true });
  addText(card, 'Card title', 'Book a visit', 30, 28, 400, { font: FONT.serif, size: 32, color: C.ink, lineHeight: 100 });
  addText(card, 'Card sub', 'Four short steps. No payment required online.', 30, 68, 420, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 120 });
  const secure = frame(card, 'Secure badge', 600, 30, 180, 28, { fill: C.paper, radius: 999, stroke: C.line });
  icon(secure, 'shield', 10, 7, 13, C.forest);
  addText(secure, 'Label', 'Your details are private', 28, 8, 142, { font: FONT.sans, size: 8, color: C.soft, lineHeight: 100 });

  const steps = ['Your visit', 'Date & time', 'Your details', 'Review'];
  steps.forEach((label, i) => {
    const x = 30 + i * 190;
    line(card, 'Step rule', x, 106, 180, i < 1 ? C.clay : C.line, 1, i < 1 ? 2 : 1);
    addText(card, 'Step num', `0${i + 1}`, x, 118, 40, { font: FONT.sansSemi, size: 7, color: i < 1 ? C.clay : C.soft, lineHeight: 100, letterSpacing: 0.5 });
    addText(card, 'Step label', label, x, 132, 180, { font: FONT.sansSemi, size: 8, color: i < 1 ? C.ink : C.soft, lineHeight: 100 });
  });

  addText(card, 'Step title', 'What brings you in?', 30, 174, 600, { font: FONT.serif, size: 30, color: C.ink, lineHeight: 110 });
  addText(card, 'Step intro', 'Choose the department closest to your concern. If you\'re not sure, pick one and we\'ll redirect you if needed.', 30, 210, 720, { font: FONT.sans, size: 10.5, color: C.soft, lineHeight: 140 });
  field(card, 30, 254, 740, 'Department', 'Select a department', { select: true, placeholder: true });
  field(card, 30, 336, 740, 'Preferred consultant (optional)', 'Choose a department first', { select: true, placeholder: true, help: 'Leave blank if you\'re happy to see any available consultant.' });
  addText(card, 'Visit type label', 'VISIT TYPE', 30, 438, 300, { font: FONT.sansSemi, size: 8, color: C.ink, lineHeight: 100, letterSpacing: 0.7 });
  const choices = [['First consultation', 'A new concern or your first visit to this department.'], ['Follow-up visit', 'A review of ongoing care, results or treatment.']];
  choices.forEach(([title, copy], i) => {
    const x = 30 + i * 380;
    const box = frame(card, `Choice / ${title}`, x, 460, 360, 76, { fill: i === 0 ? '#FAF7F0' : C.white, radius: 9, stroke: i === 0 ? C.forest : C.line, strokeWeight: i === 0 ? 1.5 : 1 });
    ellipse(box, 'Icon circle', 14, 20, 32, C.mint);
    icon(box, i === 0 ? 'calendar' : 'activity', 22, 28, 16, C.forest);
    addText(box, 'Title', title, 56, 17, 290, { font: FONT.sansSemi, size: 10, color: C.ink, lineHeight: 120 });
    addText(box, 'Copy', copy, 56, 36, 290, { font: FONT.sans, size: 8.5, color: C.soft, lineHeight: 135 });
  });
  line(card, 'Footer rule', 30, 580, 760, C.line, 1);
  addText(card, 'Browse link', 'Browse doctors  →', 30, 608, 200, { font: FONT.sansSemi, size: 10, color: C.clay, lineHeight: 100 });
  button(card, { x: 610, y: 596, label: 'Continue', kind: 'primary', small: true });

  const aside = [
    ['Is this an emergency?', 'Don\'t use this form. Call our emergency line or come directly to the emergency entrance at Summit 72.', '+251 111 132 702', true, 'cross'],
    ['Prefer to call?', 'Our front desk can book, reschedule or answer questions about your visit.', '+251 111 132 702', false, 'phone'],
    ['What to bring', 'Your ID, insurance card, referral letter, previous results and a list of medicines.', 'Open your visit guide  →', false, 'file'],
  ];
  aside.forEach(([title, copy, link, dark], i) => {
    const xx = 960;
    const yy = 40 + i * 210;
    const a = frame(s, `Aside / ${title}`, xx, yy, 380, 190, { fill: dark ? C.forest : C.paper2, radius: 14, stroke: dark ? null : C.line });
    icon(a, aside[i][4], 22, 22, 20, dark ? C.gold : C.clay);
    addText(a, 'Title', title, 22, 56, 330, { font: FONT.serif, size: 22, color: dark ? C.paper : C.ink, lineHeight: 110 });
    addText(a, 'Copy', copy, 22, 92, 330, { font: FONT.sans, size: 10, color: dark ? '#B5BFB5' : C.soft, lineHeight: 150 });
    addText(a, 'Link', link, 22, 154, 330, { font: FONT.sansSemi, size: 9.5, color: dark ? C.gold : C.clay, lineHeight: 100 });
  });
  y += 1040;

  y = buildFooter(page, y);
  page.resize(1440, y);
  return page;
}

function buildContactPage(originX) {
  const page = pageFrame('05 · Contact — Desktop', originX);
  let y = 0;
  y = buildTopbar(page, y);
  y = buildHeader(page, y, 'contact');
  y = buildPageHero(page, y, {
    crumb: 'Contact',
    eyebrow: 'CONTACT US',
    title: 'We\'re here to help.',
    lede: 'Call us, write to us, or come to the front desk at Summit 72. For appointments, directions, insurance or medical records, our team will point you to the right person.',
    asideEyebrow: 'EMERGENCY · 24/7',
    asideTitle: 'Don\'t wait.',
    asideText: 'For chest pain, difficulty breathing, severe bleeding or a serious accident, call ahead or come directly.',
    asideLink: '+251 111 132 702  ↗',
  });

  const s = section(page, 'Contact details', y, 1660, C.paper);
  const cards = [
    ['Call us', 'Front desk hours are not published here yet — call to confirm.\nEmergency line: 24 hours.', '+251 111 132 702', true, 'phone'],
    ['Visit us', 'Summit 72, Lemi Kura\nAddis Ababa, Ethiopia', 'Open in Google Maps  ↗', false, 'pin'],
    ['Email us', 'General enquiries, appointments, insurance and medical records.', 'info@summitgh.com.et', false, 'mail'],
  ];
  cards.forEach(([title, copy, link, dark, iconName], i) => {
    const c = frame(s, `Contact card / ${title}`, 100 + i * 420, 40, 400, 180, { fill: dark ? C.forest : C.white, radius: 14, stroke: dark ? null : C.line });
    icon(c, iconName, 24, 24, 20, dark ? C.gold : C.clay);
    addText(c, 'Title', title, 24, 62, 340, { font: FONT.serif, size: 24, color: dark ? C.paper : C.ink, lineHeight: 110 });
    addText(c, 'Copy', copy, 24, 98, 340, { font: FONT.sans, size: 10, color: dark ? '#B5BFB5' : C.soft, lineHeight: 150 });
    addText(c, 'Link', link, 24, 148, 340, { font: FONT.sansSemi, size: 10, color: dark ? C.gold : C.clay, lineHeight: 100 });
  });

  addImage(s, 'Map', 'map', 100, 250, 1240, 480, { radius: 14, stroke: C.line });
  icon(s, 'pin', 602, 400, 44, C.clay, 2.6);
  const label = frame(s, 'Map label', 120, 660, 320, 52, { fill: C.paper, radius: 8, stroke: C.line });
  icon(label, 'pin', 14, 16, 17, C.clay);
  addText(label, 'Label', 'Summit General Hospital', 40, 12, 260, { font: FONT.sansSemi, size: 9, color: C.ink, lineHeight: 120 });
  addText(label, 'Sub', 'Summit 72, Lemi Kura, Addis Ababa', 40, 28, 260, { font: FONT.sans, size: 8, color: C.soft, lineHeight: 120 });
  addText(s, 'Map credit', '© OpenStreetMap contributors', 1090, 706, 240, { font: FONT.sans, size: 7, color: C.soft, lineHeight: 100, align: 'RIGHT' });

  const form = frame(s, 'Message form', 100, 780, 760, 640, { fill: C.white, radius: 14, stroke: C.line });
  addText(form, 'Heading', 'Send a message.', 28, 26, 500, { font: FONT.serif, size: 32, color: C.ink, lineHeight: 100 });
  addText(form, 'Intro', 'Please do not use this form for urgent medical concerns. Call us or come directly to the emergency department.', 28, 66, 680, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 140 });
  field(form, 28, 108, 330, 'Your name', '', { height: 44 });
  field(form, 390, 108, 330, 'Email', '', { height: 44 });
  field(form, 28, 186, 330, 'Phone (optional)', '', { height: 44 });
  field(form, 390, 186, 330, 'What is this about?', 'General enquiry', { select: true, height: 44 });
  addText(form, 'Message label', 'MESSAGE', 28, 264, 300, { font: FONT.sansSemi, size: 8, color: C.ink, lineHeight: 100, letterSpacing: 0.7 });
  const message = frame(form, 'Message input', 28, 281, 692, 130, { fill: C.white, radius: 8, stroke: C.line });
  addText(message, 'Placeholder', 'How can we help? Please avoid sharing sensitive medical details.', 14, 16, 660, { font: FONT.sans, size: 10, color: '#8A958F', lineHeight: 140 });
  rect(form, 'Consent checkbox', 28, 431, 14, 14, { fill: C.white, radius: 3, stroke: C.line });
  addText(form, 'Consent', 'I agree that Summit General Hospital may use these details to reply to my message.', 50, 428, 650, { font: FONT.sans, size: 9, color: C.soft, lineHeight: 140 });
  button(form, { x: 28, y: 468, label: 'Send message', kind: 'primary', w: 692 });

  const info = frame(s, 'Contact info', 900, 780, 440, 640, { fill: C.paper2, radius: 14, stroke: C.line });
  const rows = [
    ['Front desk', 'Appointments, directions, billing and finding the right department.', '+251 111 132 702\ninfo@summitgh.com.et\nFront desk hours: call to confirm'],
    ['Medical records', 'To request records or results, contact us with your full name, date of birth and approximate visit date.', 'info@summitgh.com.et'],
    ['Feedback & complaints', 'Compliments and complaints are reviewed by our leadership team. Raising a concern will never affect your care.', 'Choose “Feedback” in the form'],
  ];
  rows.forEach(([title, copy, detail], i) => {
    const yy = 26 + i * 190;
    addText(info, 'Title', title, 24, yy, 390, { font: FONT.serif, size: 22, color: C.ink, lineHeight: 110 });
    addText(info, 'Copy', copy, 24, yy + 34, 390, { font: FONT.sans, size: 9.5, color: C.soft, lineHeight: 145 });
    addText(info, 'Detail', detail, 24, yy + 104, 390, { font: FONT.sansSemi, size: 8.5, color: C.clay, lineHeight: 145 });
  });
  y += 1660;

  y = buildCTA(page, y);
  y = buildFooter(page, y);
  page.resize(1440, y);
  return page;
}

function buildAboutPage(originX) {
  const page = pageFrame('06 · About — Desktop', originX);
  let y = 0;
  y = buildTopbar(page, y);
  y = buildHeader(page, y, 'about');
  y = buildPageHero(page, y, {
    crumb: 'About',
    eyebrow: 'ABOUT SUMMIT',
    title: 'Care with a human scale.',
    lede: 'A general hospital in Lemi Kura, built on a simple belief: excellent medicine should feel personal. We bring consultant-led care, modern diagnostics and a warm welcome together under one roof.',
    asideEyebrow: 'AT A GLANCE',
    asideTitle: 'Summit 72, Lemi Kura.',
    asideText: '24/7 emergency care · 4 specialist departments · 18 services on one campus.',
    asideLink: 'Find us  ↗',
  });

  const media = section(page, 'About image', y, 600, C.paper);
  addImage(media, 'Consultation', 'consult', 100, 30, 1240, 520, { radius: 14 });
  const caption = frame(media, 'Image caption', 120, 500, 330, 30, { fill: C.paper, radius: 5, fillOpacity: 0.92 });
  addText(caption, 'Label', 'CONSULTANT-LED CARE · ONE CAMPUS IN BOLE', 12, 9, 310, { font: FONT.sansSemi, size: 7, color: C.ink, lineHeight: 100, letterSpacing: 0.6 });
  y += 600;

  const story = section(page, 'Our story', y, 540, C.paper);
  eyebrow(story, 100, 30, 'OUR STORY');
  addText(story, 'Heading', 'Built for the way\nfamilies in Lemi Kura live.', 100, 64, 420, { style: T.h2, color: C.ink });
  addText(story, 'Body 1', 'Summit General Hospital was built to bring dependable, multi-specialty care closer to the families of Lemi Kura. Our campus at Summit 72 brings outpatient clinics, emergency care, maternity, surgery and diagnostics together — so patients don\'t have to travel across the city for coordinated care.', 620, 40, 700, { style: T.body, color: C.ink });
  addText(story, 'Body 2', 'Two ideas shape how we work. Medicine is a conversation: we explain what we know, what we don\'t, and what comes next. And care is a team effort: our consultants, nurses, pharmacists and technicians share one plan for you.', 620, 180, 700, { style: T.body, color: C.soft });
  addText(story, 'Body 3', 'Today we serve the neighbourhoods around Summit, Lemi Kura and CMC — people of every age, background and language. Our promise is simple: careful medicine, clearly explained, close to home.', 620, 300, 700, { style: T.body, color: C.soft });
  button(story, { x: 620, y: 430, label: 'Meet our consultants', kind: 'outline', small: true });
  y += 540;

  const values = section(page, 'Mission and values', y, 660, C.sand);
  eyebrow(values, 100, 40, 'WHAT DRIVES US');
  addText(values, 'Heading', 'Our mission,\nvision and values.', 100, 74, 520, { style: T.h2, color: C.ink });
  addText(values, 'Intro', 'Good healthcare is more than equipment and expertise. It is how people are made to feel from the moment they walk through the door.', 800, 84, 440, { style: T.body, color: C.soft });
  const mission = frame(values, 'Mission', 100, 220, 610, 168, { fill: C.forest, radius: 12 });
  icon(mission, 'heart', 24, 22, 20, C.gold);
  addText(mission, 'Title', 'Our mission', 24, 58, 540, { font: FONT.serif, size: 26, color: C.paper, lineHeight: 110 });
  addText(mission, 'Copy', 'To make dependable, compassionate healthcare accessible to our community — with clear explanations and respectful care at every step.', 24, 96, 550, { font: FONT.sans, size: 10, color: '#B5BFB5', lineHeight: 150 });
  const vision = frame(values, 'Vision', 730, 220, 610, 168, { fill: C.white, radius: 12, stroke: C.line });
  icon(vision, 'eye', 24, 22, 20, C.clay);
  addText(vision, 'Title', 'Our vision', 24, 58, 540, { font: FONT.serif, size: 26, color: C.ink, lineHeight: 110 });
  addText(vision, 'Copy', 'To be Addis Ababa\'s most trusted general hospital — known for careful medicine, human kindness and a welcome that feels like home.', 24, 96, 550, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 150 });
  const vals = [['01', 'Dignity', 'Every patient is treated with respect, privacy and patience.'], ['02', 'Clarity', 'We explain what we know and what happens next.'], ['03', 'Safety', 'Evidence-based protocols and a habit of speaking up.'], ['04', 'Community', 'We care for the neighbourhood we are part of.']];
  vals.forEach(([num, title, copy], i) => {
    const x = 100 + i * 310;
    const card = frame(values, `Value / ${title}`, x, 412, 290, 190, { fill: C.paper, radius: 10, stroke: C.line });
    addText(card, 'Number', num, 18, 18, 40, { font: FONT.serifItalic, size: 14, color: C.clay, lineHeight: 100 });
    addText(card, 'Title', title, 18, 52, 250, { font: FONT.serif, size: 22, color: C.ink, lineHeight: 110 });
    addText(card, 'Copy', copy, 18, 88, 250, { font: FONT.sans, size: 9.5, color: C.soft, lineHeight: 145 });
  });
  y += 660;

  const gallery = section(page, 'Inside Summit', y, 830, C.paper);
  eyebrow(gallery, 100, 40, 'INSIDE SUMMIT');
  addText(gallery, 'Heading', 'Designed for calm,\nbuilt for care.', 100, 74, 560, { style: T.h2, color: C.ink });
  addText(gallery, 'Intro', 'From the reception desk to the operating theatre, our spaces are organised around the patient journey — not the other way around.', 800, 84, 440, { style: T.body, color: C.soft });
  const imgs = [['reception', 'Reception & waiting'], ['theatre', 'Operating theatres'], ['lab', 'Laboratory services'], ['room', 'Inpatient rooms']];
  imgs.forEach(([key, label], i) => {
    const x = 100 + (i % 2) * 630;
    const yy = 230 + Math.floor(i / 2) * 290;
    addImage(gallery, label, key, x, yy, 610, 270, { radius: 12 });
    const cap = frame(gallery, `Caption / ${label}`, x + 14, yy + 232, 200, 24, { fill: C.forest, radius: 4, fillOpacity: 0.9 });
    addText(cap, 'Label', label.toUpperCase(), 8, 7, 184, { font: FONT.sansSemi, size: 6.5, color: C.paper, lineHeight: 100, letterSpacing: 0.7 });
  });
  y += 830;

  const quality = section(page, 'Quality', y, 500, C.sand);
  eyebrow(quality, 100, 40, 'QUALITY & SAFETY');
  addText(quality, 'Heading', 'Careful medicine\nis a habit, not\na promise.', 100, 74, 520, { style: T.h2, color: C.ink });
  const q = [['Infection prevention', 'Hand hygiene, sterilisation and isolation practices are audited and reviewed — not assumed.'], ['Medication safety', 'Our pharmacists review prescriptions and explain how medicines should be taken.'], ['Clinical governance', 'Consultant-led reviews, incident reporting and continuous learning.'], ['Patient feedback', 'Complaints and compliments are read by leadership and used to improve.']];
  q.forEach(([title, copy], i) => {
    const yy = 40 + i * 104;
    line(quality, 'Rule', 720, yy, 580, C.line, 1);
    icon(quality, 'shield', 720, yy + 22, 18, C.clay);
    addText(quality, 'Title', title, 752, yy + 18, 540, { font: FONT.serif, size: 20, color: C.ink, lineHeight: 110 });
    addText(quality, 'Copy', copy, 752, yy + 46, 540, { font: FONT.sans, size: 9.5, color: C.soft, lineHeight: 145 });
  });
  y += 500;

  y = buildCTA(page, y);
  y = buildFooter(page, y);
  page.resize(1440, y);
  return page;
}

function buildVisitPage(originX) {
  const page = pageFrame('07 · Your visit — Desktop', originX);
  let y = 0;
  y = buildTopbar(page, y);
  y = buildHeader(page, y, 'visit');
  y = buildPageHero(page, y, {
    crumb: 'Your visit',
    eyebrow: 'YOUR VISIT',
    title: 'Plan your visit.',
    lede: 'A little preparation makes appointments and admissions calmer. Here is what to bring, where to go, and what to expect — plus the people to call if you\'re unsure.',
    asideEyebrow: 'VISITING HOURS',
    asideTitle: 'Call to confirm.',
    asideText: 'Visiting hours differ by ward and are not published here yet. Please call ahead so the ward team can tell you when to come.',
    asideLink: 'More on visiting  ↓',
  });

  const cards = section(page, 'Visit cards', y, 230, C.paper);
  const items = [['Where to find us', 'Summit 72, Lemi Kura, Addis Ababa. Enter through main reception; emergency care has a separate entrance.', 'pin'], ['Opening hours', 'Emergency: 24 hours. Outpatient clinic hours are not published here yet — call +251 111 132 702 to confirm.', 'clock'], ['Talk to someone', 'Our front desk can help with appointments, directions, billing and medical records.', 'phone']];
  items.forEach(([title, copy, iconName], i) => {
    const c = frame(cards, `Visit card / ${title}`, 100 + i * 420, 40, 400, 160, { fill: C.white, radius: 12, stroke: C.line });
    icon(c, iconName, 22, 22, 18, C.clay);
    addText(c, 'Title', title, 22, 56, 350, { font: FONT.serif, size: 21, color: C.ink, lineHeight: 110 });
    addText(c, 'Copy', copy, 22, 88, 350, { font: FONT.sans, size: 9.5, color: C.soft, lineHeight: 145 });
  });
  y += 230;

  const before = section(page, 'Before you arrive', y, 560, C.paper);
  eyebrow(before, 100, 20, 'BEFORE YOU ARRIVE');
  addText(before, 'Heading', 'Come prepared,\nnot anxious.', 100, 54, 480, { style: T.h2, color: C.ink });
  addText(before, 'Intro', 'Bring these items to your appointment or admission. If you forget something, tell the front desk — we can usually help.', 620, 30, 700, { font: FONT.sans, size: 11, color: C.soft, lineHeight: 150 });
  const bring = frame(before, 'What to bring', 100, 190, 560, 330, { fill: C.white, radius: 12, stroke: C.line });
  addText(bring, 'Title', 'What to bring', 24, 22, 500, { font: FONT.serif, size: 24, color: C.ink, lineHeight: 110 });
  ['Your ID or passport', 'Insurance card, if you have one', 'Referral letter or previous results', 'A list of medicines you take', 'Comfortable clothing and a phone charger', 'The name and number of your next of kin'].forEach((item, i) => {
    icon(bring, 'check', 24, 72 + i * 34, 14, C.clay);
    addText(bring, `Item ${i + 1}`, item, 46, 70 + i * 34, 490, { font: FONT.sans, size: 10, color: C.ink, lineHeight: 140 });
  });
  const adm = frame(before, 'Admissions', 700, 190, 600, 330, { fill: C.paper2, radius: 12, stroke: C.line });
  addText(adm, 'Title', 'If you\'re being admitted', 24, 22, 540, { font: FONT.serif, size: 24, color: C.ink, lineHeight: 110 });
  const steps = [['01', 'Your clinician arranges admission', 'Your doctor explains why you need to stay and what happens next.'], ['02', 'Front desk and insurance', 'We confirm your details and check your cover.'], ['03', 'Ward orientation', 'A nurse settles you in, reviews medicines and answers questions.']];
  steps.forEach(([num, title, copy], i) => {
    const yy = 74 + i * 78;
    addText(adm, 'Number', num, 24, yy + 4, 30, { font: FONT.serifItalic, size: 14, color: C.clay, lineHeight: 100 });
    addText(adm, 'Title', title, 60, yy, 510, { font: FONT.sansSemi, size: 11, color: C.ink, lineHeight: 120 });
    addText(adm, 'Copy', copy, 60, yy + 20, 510, { font: FONT.sans, size: 9, color: C.soft, lineHeight: 140 });
  });
  y += 560;

  const hours = section(page, 'Visiting hours', y, 380, C.sand);
  eyebrow(hours, 100, 40, 'VISITING HOURS');
  addText(hours, 'Heading', 'Time together, protected.', 100, 74, 600, { style: T.h2, color: C.ink });
  addText(hours, 'Intro', 'Visitors are welcome, but rest matters. Each ward sets its own hours to protect quiet time and clinical care, and we have not published them here yet.', 800, 84, 440, { style: T.body, color: C.soft });
  line(hours, 'Call rule', 100, 180, 1240, C.line, 1);
  addText(hours, 'Call note', 'Call +251 111 132 702 before you travel and the ward team will tell you when to come.', 100, 204, 780, { font: FONT.sans, size: 14, color: C.ink, lineHeight: 150 });
  addText(hours, 'Ward note', 'Maternity, children\'s and intensive care each have their own arrangements. The ward team will confirm them before you visit.', 100, 244, 1240, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 150 });
  y += 380;

  const insurance = section(page, 'Insurance', y, 260, C.paper);
  const panel = frame(insurance, 'Insurance panel', 100, 20, 1240, 210, { fill: C.paper2, radius: 14, stroke: C.line });
  eyebrow(panel, 28, 28, 'INSURANCE & ACCESS');
  addText(panel, 'Heading', 'Cover, clearly explained.', 28, 60, 420, { font: FONT.serif, size: 30, color: C.ink, lineHeight: 110 });
  addText(panel, 'Body', 'We have not published which insurers and plans we can bill directly here. Cover varies by plan and procedure, so ask us before your visit: we will confirm what applies to you before treatment, not after.', 28, 102, 480, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 150 });
  ['Bring your insurance card and we will confirm your cover.', 'Ask whether your plan can be billed directly here; if not, we explain the cost.', 'Ask for an estimate before non-elective treatment.', 'Emergency care is never delayed for insurance checks.'].forEach((item, i) => {
    icon(panel, 'check', 600, 44 + i * 34, 14, C.clay);
    addText(panel, `Point ${i + 1}`, item, 622, 42 + i * 34, 580, { font: FONT.sans, size: 10, color: C.soft, lineHeight: 140 });
  });
  y += 260;

  const faq = section(page, 'FAQ', y, 560, C.sand);
  eyebrow(faq, 100, 40, 'QUESTIONS, ANSWERED');
  addText(faq, 'Heading', 'Before you ask.', 100, 74, 520, { style: T.h2, color: C.ink });
  addText(faq, 'Intro', 'If your question isn\'t here, call our front desk on +251 111 132 702 or send us a message.', 100, 150, 420, { font: FONT.sans, size: 11, color: C.soft, lineHeight: 150 });
  const qs = ['How do I book an appointment?', 'Do I need a referral?', 'What insurance do you accept?', 'Can I choose my doctor?', 'What should I bring for admission?', 'How do I get my test results?', 'Can I visit outside visiting hours?', 'How do I give feedback?'];
  qs.forEach((q, i) => {
    const yy = 40 + i * 56;
    line(faq, 'Rule', 600, yy, 740, C.line, 1);
    addText(faq, 'Question', q, 600, yy + 18, 680, { font: FONT.sansMedium, size: 11, color: C.ink, lineHeight: 100 });
    addText(faq, 'Plus', '+', 1300, yy + 14, 30, { font: FONT.sans, size: 14, color: C.clay, lineHeight: 100, align: 'RIGHT' });
  });
  y += 560;

  y = buildCTA(page, y);
  y = buildFooter(page, y);
  page.resize(1440, y);
  return page;
}
