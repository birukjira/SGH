// Summit General Hospital — MongoDB Atlas setup.
//
// Creates the collections and indexes, writes the seed content (departments,
// consultants, services), and initialises the id counters.
// Safe to re-run: seed rows are upserted by id and nothing staff created is
// deleted.
//
//   cd web && npm run db:setup
//
// Reads MONGODB_URI from the environment, or from web/.dev.vars when it is not
// exported. The connection string must already contain the database user's
// password.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATABASE = 'summit_general_hospital';

function localVar(name) {
  if (process.env[name]) return process.env[name].trim();

  let raw;
  try {
    raw = fs.readFileSync(path.join(HERE, '..', '.dev.vars'), 'utf8');
  } catch {
    return '';
  }

  for (const line of raw.split('\n')) {
    const text = line.trim();
    if (!text || text.startsWith('#')) continue;

    const split = text.indexOf('=');
    if (split < 0) continue;
    if (text.slice(0, split).trim() !== name) continue;

    return text
      .slice(split + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }

  return '';
}

function databaseName(uri) {
  const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const slash = withoutScheme.indexOf('/');
  if (slash < 0) return DEFAULT_DATABASE;
  return withoutScheme.slice(slash + 1).split('?')[0].trim() || DEFAULT_DATABASE;
}

const departments = [
  {
    id: 1,
    slug: 'internal-medicine',
    name: 'Internal Medicine',
    filter_label: 'Internal medicine',
    appointment_label: 'Internal Medicine',
    card_label: 'Internal medicine',
    summary: 'Adult health, chronic conditions, infections and preventive care.',
    icon: 'i-stethoscope',
    is_active: 1,
    sort_order: 1,
  },
  {
    id: 2,
    slug: 'pediatrics',
    name: 'Pediatrics and Child Health',
    filter_label: 'Pediatrics',
    appointment_label: 'Pediatrics & Child Health',
    card_label: 'Pediatrics',
    summary: 'Newborn checks, childhood illness, growth monitoring and vaccinations.',
    icon: 'i-child',
    is_active: 1,
    sort_order: 2,
  },
  {
    id: 3,
    slug: 'womens-health',
    name: 'Obstetrics and Gynecology',
    filter_label: "Women's health",
    appointment_label: 'Obstetrics & Gynecology',
    card_label: "Women's health",
    summary: 'Antenatal care, safe delivery, postnatal support and gynecological care.',
    icon: 'i-users',
    is_active: 1,
    sort_order: 3,
  },
  {
    id: 4,
    slug: 'surgery',
    name: 'General and Laparoscopic Surgery',
    filter_label: 'Surgery & ortho',
    appointment_label: 'General & Laparoscopic Surgery',
    card_label: 'Surgery',
    summary: 'Elective and emergency procedures in modern theatres.',
    icon: 'i-scalpel',
    is_active: 1,
    sort_order: 4,
  },
];

const doctors = [
  {
    id: 1,
    slug: 'dr-million-seid-muzeyen',
    name: 'Dr. Million Seid Muzeyen',
    role: 'Internist & CEO',
    focus: 'Adult internal medicine and chronic disease care.',
    photo_path: '/assets/img/doctors/dr-million-seid-muzeyen.jpg',
    photo_alt: 'Portrait of Dr. Million Seid Muzeyen',
    sort_order: 1,
  },
  {
    id: 2,
    slug: 'dr-yasin-ahmed-yesuf',
    name: 'Dr. Yasin Ahmed Yesuf',
    role: 'Consultant Pediatrician',
    focus: 'Child health, newborn follow-up and childhood illness.',
    photo_path: '/assets/img/doctors/dr-yasin-ahmed-yesuf.jpg',
    photo_alt: 'Portrait of Dr. Yasin Ahmed Yesuf',
    sort_order: 2,
  },
  {
    id: 3,
    slug: 'dr-gosa-abebe-shifera',
    name: 'Dr. Gosa Abebe Shifera',
    role: 'Consultant General Surgeon',
    focus: 'General and emergency surgery.',
    photo_path: '/assets/img/doctors/dr-gosa-abebe-shifera.jpg',
    photo_alt: 'Portrait of Dr. Gosa Abebe Shifera',
    sort_order: 3,
  },
  {
    id: 4,
    slug: 'dr-biniyam-denekew-asrat',
    name: 'Dr. Biniyam Denekew Asrat',
    role: 'Consultant Obstetrician and Gynecologist',
    focus: "Obstetrics, gynaecological care and women's health.",
    photo_path: '/assets/img/doctors/dr-biniyam-denekew-asrat.jpg',
    photo_alt: 'Portrait of Dr. Biniyam Denekew Asrat',
    sort_order: 4,
  },
];

const memberships = [
  { doctor_id: 1, department_id: 1, is_primary: 1 },
  { doctor_id: 2, department_id: 2, is_primary: 1 },
  { doctor_id: 3, department_id: 4, is_primary: 1 },
  { doctor_id: 4, department_id: 3, is_primary: 1 },
];

const serviceCategories = [
  { id: 1, slug: 'emergency', name: 'Emergency', is_active: 1, sort_order: 1 },
  { id: 2, slug: 'clinical', name: 'Clinical', is_active: 1, sort_order: 2 },
  { id: 3, slug: 'diagnostics', name: 'Diagnostics', is_active: 1, sort_order: 3 },
  { id: 4, slug: 'support', name: 'Support', is_active: 1, sort_order: 4 },
];

const services = [
  ['emergency', 'Emergency and Critical Care', 'Immediate assessment, stabilisation and critical care for adults and children — day or night.', 'i-cross', 'Emergency · 24/7', 1, null, null, 'Call the emergency line', 'call', 1, 1],
  ['internal-medicine', 'Internal Medicine', 'Adult health, chronic conditions, infections and preventive care from experienced internists.', 'i-stethoscope', 'Clinical', 2, 1, 'Internal Medicine', 'Book this service', 'appointment', 0, 2],
  ['family-medicine', 'Family Medicine and Screening', 'A regular doctor for check-ups, health screening, travel advice and family health.', 'i-user', 'Clinical', 2, null, 'Family Medicine', 'Book this service', 'appointment', 0, 3],
  ['pediatrics', 'Pediatrics and Child Health', 'Newborn checks, childhood illness, growth monitoring, vaccinations and family support.', 'i-child', 'Clinical', 2, 2, 'Pediatrics & Child Health', 'Book this service', 'appointment', 0, 4],
  ['obgyn', 'Obstetrics and Gynecology', 'Antenatal care, safe delivery, postnatal support and gynecological care at every stage.', 'i-users', 'Clinical', 2, 3, 'Obstetrics & Gynecology', 'Book this service', 'appointment', 0, 5],
  ['surgery', 'General and Laparoscopic Surgery', 'Elective and emergency procedures, including minimally invasive surgery, in modern theatres.', 'i-scalpel', 'Clinical', 2, 4, 'General & Laparoscopic Surgery', 'Book this service', 'appointment', 0, 6],
  ['orthopedics', 'Orthopedics and Trauma', 'Fracture care, joint assessment and rehabilitation after injury or surgery.', 'i-bone', 'Clinical', 2, null, 'Orthopedics & Trauma', 'Book this service', 'appointment', 0, 7],
  ['cardiology', 'Cardiology', 'Heart assessment, blood pressure management, risk reduction and ongoing follow-up.', 'i-heart', 'Clinical', 2, null, 'Cardiology', 'Book this service', 'appointment', 0, 8],
  ['neurology', 'Neurology', 'Assessment for headache, seizure, stroke follow-up and other neurological concerns.', 'i-brain', 'Clinical', 2, null, 'Neurology', 'Book this service', 'appointment', 0, 9],
  ['dermatology', 'Dermatology', 'Skin, hair and nail conditions for adults and children, with practical treatment advice.', 'i-shield', 'Clinical', 2, null, 'Dermatology', 'Book this service', 'appointment', 0, 10],
  ['ent', 'Ear, Nose and Throat (ENT)', 'Ear, nose and throat care for adults and children, from sinus problems to hearing concerns.', 'i-ear', 'Clinical', 2, null, 'ENT', 'Book this service', 'appointment', 0, 11],
  ['ophthalmology', 'Ophthalmology', 'Eye checks, vision care and assessment of common eye conditions for all ages.', 'i-eye', 'Clinical', 2, null, 'Ophthalmology', 'Book this service', 'appointment', 0, 12],
  ['urology', 'Urology', "Assessment and treatment for urinary concerns and men's health, with respectful, private care.", 'i-droplet', 'Clinical', 2, null, 'Urology', 'Book this service', 'appointment', 0, 13],
  ['dental', 'Dental Care', 'Preventive dentistry, fillings, extractions and practical oral health advice.', 'i-tooth', 'Clinical', 2, null, 'Dental Care', 'Book this service', 'appointment', 0, 14],
  ['radiology', 'Radiology and Imaging', 'X-ray, ultrasound and diagnostic imaging to support your diagnosis and treatment plan.', 'i-scan', 'Diagnostics', 3, null, 'Radiology & Imaging', 'Ask about a test', 'contact', 0, 15],
  ['laboratory', 'Laboratory Services', 'Haematology, biochemistry, microbiology and rapid tests, with timely results for your clinician.', 'i-lab', 'Diagnostics', 3, null, null, 'Ask about a test', 'contact', 0, 16],
  ['pharmacy', 'Pharmacy', 'Prescription dispensing, medication advice and refills from pharmacists who know your plan.', 'i-pill', 'Support', 4, null, null, 'Contact the pharmacy', 'contact', 0, 17],
  ['physiotherapy', 'Physiotherapy and Rehabilitation', 'Movement, pain and recovery programmes after injury, surgery or a long illness.', 'i-activity', 'Support', 4, null, 'Physiotherapy & Rehabilitation', 'Book this service', 'appointment', 0, 18],
].map((row, index) => {
  const [slug, name, summary, icon, tag_label, category_id, department_id, booking_department, cta_label, cta_type, is_emergency, sort_order] = row;

  return {
    id: index + 1,
    slug,
    name,
    summary,
    body_md: null,
    icon,
    tag_label,
    category_id,
    department_id,
    booking_department,
    cta_label,
    cta_type,
    is_emergency,
    is_active: 1,
    sort_order,
  };
});

const postCategories = [
  { id: 1, slug: 'hospital-news', name: 'Hospital news', sort_order: 1 },
  { id: 2, slug: 'health-advice', name: 'Health advice', sort_order: 2 },
  { id: 3, slug: 'services', name: 'Services and clinics', sort_order: 3 },
];

// No patient stories are seeded. The three quotes that used to live here were
// written as examples and were never real patient statements, so publishing them
// put words in patients' mouths. Add a quote only after the patient (or their
// family) has agreed in writing to be named and quoted.
const testimonials = [];

async function main() {
  const uri = localVar('MONGODB_URI');
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to web/.dev.vars or export it first.');
    process.exitCode = 1;
    return;
  }

  const client = new MongoClient(uri, { appName: 'summit-general-hospital-setup' });
  await client.connect();
  const db = client.db(databaseName(uri));
  const now = new Date().toISOString();

  await db.createCollection('departments').catch(() => {});
  await db.createCollection('doctors').catch(() => {});
  await db.createCollection('doctor_departments').catch(() => {});
  await db.createCollection('service_categories').catch(() => {});
  await db.createCollection('services').catch(() => {});
  await db.createCollection('post_categories').catch(() => {});
  await db.createCollection('posts').catch(() => {});
  await db.createCollection('testimonials').catch(() => {});
  await db.createCollection('review_snapshots').catch(() => {});
  await db.createCollection('messages').catch(() => {});
  await db.createCollection('login_attempts').catch(() => {});
  await db.createCollection('appointments').catch(() => {});
  await db.createCollection('counters').catch(() => {});

  await Promise.all([
    db.collection('departments').createIndex({ slug: 1 }, { unique: true }),
    db.collection('doctors').createIndex({ slug: 1 }, { unique: true }),
    db.collection('doctors').createIndex({ is_active: 1, sort_order: 1, name: 1 }),
    db
      .collection('doctor_departments')
      .createIndex({ doctor_id: 1, department_id: 1 }, { unique: true }),
    db.collection('doctor_departments').createIndex({ doctor_id: 1, is_primary: 1 }),
    db.collection('service_categories').createIndex({ slug: 1 }, { unique: true }),
    db.collection('services').createIndex({ slug: 1 }, { unique: true }),
    db.collection('services').createIndex({ is_active: 1, category_id: 1, sort_order: 1 }),
    db.collection('post_categories').createIndex({ slug: 1 }, { unique: true }),
    db.collection('posts').createIndex({ slug: 1 }, { unique: true }),
    db.collection('posts').createIndex({ status: 1, published_at: -1 }),
    db
      .collection('testimonials')
      .createIndex(
        { source: 1, source_review_id: 1 },
        { unique: true, partialFilterExpression: { source_review_id: { $type: 'string' } } }
      ),
    db.collection('testimonials').createIndex({ is_published: 1, is_featured: -1, sort_order: 1 }),
    db.collection('review_snapshots').createIndex({ provider: 1, place_id: 1, fetched_at: -1 }),
    db.collection('messages').createIndex({ status: 1, created_at: -1 }),
    db.collection('messages').createIndex({ email: 1, created_at: -1 }),
    db.collection('login_attempts').createIndex({ key: 1, attempted_at: -1 }),
    db.collection('appointments').createIndex({ reference: 1 }, { unique: true }),
    db.collection('appointments').createIndex({ status: 1, preferred_date: 1, id: 1 }),
    db.collection('appointments').createIndex({ phone: 1, created_at: -1 }),
  ]);

  // Documents carry a numeric `id` allocated from `counters`. A unique index
  // makes counter drift a loud write error instead of two documents sharing an
  // id, where a staff edit would silently land on the wrong record.
  const idCollections = [
    'departments',
    'doctors',
    'service_categories',
    'services',
    'post_categories',
    'testimonials',
    'messages',
    'appointments',
  ];

  for (const name of idCollections) {
    await db.collection(name).createIndex({ id: 1 }, { unique: true });
  }

  // Seed content is upserted by id so the script can run again without
  // touching rows staff added through the inbox.
  async function upsert(collection, docs) {
    const target = db.collection(collection);
    for (const doc of docs) {
      await target.updateOne(
        { id: doc.id },
        { $set: doc, $setOnInsert: { created_at: now, updated_at: now } },
        { upsert: true }
      );
    }
    return docs.length;
  }

  await upsert('departments', departments);
  await upsert('doctors', doctors.map((doctor) => ({
    ...doctor,
    bio_md: null,
    clinic_note: 'Clinic days — call to confirm',
    languages: [],
    accepts_appointments: 1,
    is_active: 1,
  })));
  await upsert('service_categories', serviceCategories);
  await upsert('services', services);
  await upsert('post_categories', postCategories);

  // Membership is a set, so the seeded consultants' links are rewritten.
  const seededDoctorIds = doctors.map((doctor) => doctor.id);
  await db.collection('doctor_departments').deleteMany({ doctor_id: { $in: seededDoctorIds } });
  await db.collection('doctor_departments').insertMany(memberships);

  const counters = db.collection('counters');
  await Promise.all([
    counters.updateOne({ _id: 'doctors' }, { $max: { seq: 4 } }, { upsert: true }),
    counters.updateOne({ _id: 'services' }, { $max: { seq: services.length } }, { upsert: true }),
    counters.updateOne({ _id: 'messages' }, { $max: { seq: 0 } }, { upsert: true }),
    counters.updateOne({ _id: 'appointments' }, { $max: { seq: 0 } }, { upsert: true }),
  ]);

  const [doctorCount, serviceCount, messageCount, appointmentCount] = await Promise.all([
    db.collection('doctors').countDocuments(),
    db.collection('services').countDocuments(),
    db.collection('messages').countDocuments(),
    db.collection('appointments').countDocuments(),
  ]);

  console.log(`Database ${db.databaseName} is ready.`);
  console.log(
    `${doctorCount} consultants, ${serviceCount} services, ${messageCount} messages, ${appointmentCount} appointment requests.`
  );

  await client.close();
}

main().catch(async (error) => {
  console.error('Setup failed:', error);
  process.exitCode = 1;
});
