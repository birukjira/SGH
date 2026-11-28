#!/usr/bin/env node
// Staff smoke test — the write paths worth checking before handing the site over.
//
//   npm run dev            # in another terminal
//   npm run test:smoke     # in web/
//
// Signs in to /inbox, then drives the staff forms the way their markup does — a
// multipart POST carrying the form's `$ACTION_ID_…` field, read from the page so
// a rebuild does not break it. Covers doctor and service add/edit plus their
// guards, doctor hide/restore, message and appointment notes and status buttons,
// and the appointment search. Records it creates are removed again, even when a
// check fails.
//
// The public contact and appointment forms are client components with no no-JS
// fallback, so the fixtures for those two sections are inserted directly.
//
// Settings: MONGODB_URI and INBOX_PASSWORD (environment, else web/.dev.vars),
// SMOKE_BASE_URL (default http://localhost:3100). Exit code 1 on any failure.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const BASE = (process.env.SMOKE_BASE_URL ?? 'http://localhost:3100').replace(/\/+$/, '');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUN = Date.now().toString(36);
const NAME = {
  doctor: `SMOKE ${RUN} Doctor`,
  service: `SMOKE ${RUN} Service`,
  booking: `SMOKE ${RUN} Booking`,
  message: `SMOKE ${RUN} Message`,
  patient: `SMOKE Patient ${RUN}`,
};
const EMAIL = 'smoke-test@example.invalid';
const PHONE = '+000 000 000';

let cookie = '';
let failed = 0;
let total = 0;

function check(label, ok, detail = '') {
  total += 1;
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `  (${detail})`}`);
}

/* Configuration ----------------------------------------------------------- */

/** Environment first, then web/.dev.vars — the app's own precedence. */
function setting(name) {
  if (process.env[name]) return process.env[name].trim();

  let raw = '';
  try {
    raw = fs.readFileSync(path.join(HERE, '..', '.dev.vars'), 'utf8');
  } catch {
    return '';
  }

  const line = raw.split('\n').map((text) => text.trim()).find((text) => text.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).replace(/^["']|["']$/g, '') : '';
}

/** Same database rule as lib/mongo.ts: the URI's path, else the app default. */
function databaseName(uri) {
  const rest = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const slash = rest.indexOf('/');
  return (slash < 0 ? '' : rest.slice(slash + 1).split('?')[0].trim()) || 'summit_general_hospital';
}

/* HTTP -------------------------------------------------------------------- */

function body(actionId, fields) {
  const form = new FormData();
  form.append(`$ACTION_ID_${actionId}`, '');
  for (const [name, value] of Object.entries(fields)) {
    for (const item of [].concat(value)) form.append(name, String(item));
  }
  return form;
}

const headers = (extra = {}) => ({ origin: BASE, ...(cookie ? { cookie } : {}), ...extra });

async function get(route) {
  const res = await fetch(`${BASE}${route}`, { headers: headers(), redirect: 'manual' });
  return { status: res.status, html: await res.text(), location: res.headers.get('location') ?? '' };
}

async function post(route, actionId, fields) {
  const res = await fetch(`${BASE}${route}`, {
    method: 'POST',
    headers: headers(),
    body: body(actionId, fields),
    redirect: 'manual',
  });
  return { status: res.status, location: res.headers.get('location') ?? '' };
}

/** Action id of the form containing `marker`, or of the page's only form. */
function formId(html, marker) {
  const form = (html.match(/<form[\s\S]*?<\/form>/g) ?? []).find((block) => !marker || block.includes(marker));
  return form?.match(/\$ACTION_ID_[a-f0-9]+/)?.[0].replace('$ACTION_ID_', '') ?? '';
}

const param = (location, name) => new URL(location, BASE).searchParams.get(name) ?? '';
const saved = (res) => param(res.location, 'saved') === '1';
const refused = (res) => param(res.location, 'error') !== '';

/* Database ---------------------------------------------------------------- */

const counts = async (db) => ({
  doctors: await db.collection('doctors').countDocuments(),
  services: await db.collection('services').countDocuments(),
  messages: await db.collection('messages').countDocuments(),
  appointments: await db.collection('appointments').countDocuments(),
});

async function nextId(db, name) {
  const doc = await db
    .collection('counters')
    .findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
  if (!doc?.seq) throw new Error(`could not allocate an id for ${name}`);
  return doc.seq;
}

async function seedMessage(db) {
  const id = await nextId(db, 'messages');
  await db.collection('messages').insertOne({
    id, name: NAME.message, email: EMAIL, phone: null, subject: 'General enquiry',
    body: 'Smoke-test fixture.', note: null, consent: 1, status: 'new',
    source_page: '/contact', created_at: new Date().toISOString(),
  });
  return id;
}

async function seedAppointment(db) {
  const id = await nextId(db, 'appointments');
  await db.collection('appointments').insertOne({
    id, reference: `SMOKE-${RUN}-${id}`, department: 'Internal Medicine', doctor: null,
    visit_type: 'First consultation', preferred_date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
    preferred_time: '10:30 AM', first_name: 'SMOKE', last_name: `Patient ${RUN}`, patient_name: NAME.patient,
    phone: PHONE, phone_digits: PHONE.replace(/[^0-9]/g, ''), email: null,
    reason: 'Smoke-test fixture.', note: null, consent: 1, status: 'new', handled_at: null,
    created_at: new Date().toISOString(),
  });
  return { id, reference: `SMOKE-${RUN}-${id}` };
}

/** Every fixture is named `SMOKE …`, so an interrupted run is swept next time. */
async function cleanup(db) {
  const ids = (await db.collection('doctors').find({ name: /^SMOKE / }, { projection: { id: 1 } }).toArray()).map((d) => d.id);
  if (ids.length > 0) await db.collection('doctor_departments').deleteMany({ doctor_id: { $in: ids } });
  await db.collection('doctors').deleteMany({ name: /^SMOKE / });
  await db.collection('services').deleteMany({ name: /^SMOKE / });
  await db.collection('messages').deleteMany({ email: EMAIL });
  await db.collection('appointments').deleteMany({ phone: PHONE });
}

/* Sections ---------------------------------------------------------------- */

async function signIn(password) {
  const login = await get('/inbox/login');
  const res = await fetch(`${BASE}/inbox/login`, {
    method: 'POST',
    headers: { origin: BASE },
    body: body(formId(login.html), { password }),
    redirect: 'manual',
  });

  const jar = (res.headers.getSetCookie?.() ?? []).find((value) => value.startsWith('sgh_inbox='));
  cookie = jar?.split(';')[0] ?? '';
  return res.headers.get('location') ?? '';
}

async function doctors(db) {
  console.log('\nDoctors: add, edit, guard, hide, restore');

  const add = await post('/inbox/doctors/new', formId((await get('/inbox/doctors/new')).html), {
    name: NAME.doctor, role: 'Smoke Consultant', focus: 'Created by the smoke test.',
    departments: ['1', '2'], primary: '2', clinicNote: 'Clinic days — call to confirm',
    languages: 'Amharic, English', acceptsAppointments: 'on', sortOrder: '97',
  });

  const id = Number(/\/inbox\/doctors\/(\d+)/.exec(add.location)?.[1] ?? 0);
  const doc = await db.collection('doctors').findOne({ id });
  check('add stores the doctor and shows it', saved(add) && Boolean(doc));
  check('slug from the name, languages parsed', /^smoke-.*-doctor$/.test(doc?.slug ?? '') && doc?.languages.length === 2, doc?.slug);

  const links = await db.collection('doctor_departments').find({ doctor_id: id }).toArray();
  check('two memberships, one primary', links.length === 2 && links.filter((l) => l.is_primary === 1).length === 1);
  check('visible on /doctors', (await get('/doctors')).html.includes(NAME.doctor));

  const edit = formId((await get(`/inbox/doctors/${id}`)).html);
  const renamed = `${NAME.doctor} (renamed)`;
  const fields = {
    id, name: renamed, role: 'Smoke Consultant', focus: 'Edited by the smoke test.',
    departments: ['1', '2'], primary: '1', clinicNote: 'Clinic days — call to confirm',
    languages: 'Amharic', acceptsAppointments: 'on', sortOrder: '96',
  };

  const edited = await post(`/inbox/doctors/${id}`, edit, fields);
  const after = await db.collection('doctors').findOne({ id });
  check('edit saves, keeps slug and visibility', saved(edited) && after?.name === renamed && after?.slug === doc?.slug && after?.is_active === 1);
  check('primary department moves', (await db.collection('doctor_departments').findOne({ doctor_id: id, is_primary: 1 }))?.department_id === 1);
  check('unticked primary is refused', refused(await post(`/inbox/doctors/${id}`, edit, { ...fields, primary: '3' })));

  const toggle = formId((await get('/inbox/doctors')).html, `name="id" value="${id}"`);
  check('hide saves', saved(await post('/inbox/doctors', toggle, { id, active: '0' })));
  check('hidden doctor leaves /doctors', !(await get('/doctors')).html.includes(renamed));
  check('restore saves', saved(await post('/inbox/doctors', toggle, { id, active: '1' })));
  check('restored doctor returns', (await get('/doctors')).html.includes(renamed));
}

async function services(db) {
  console.log('\nServices: add, edit, guard');

  const add = await post('/inbox/services/new', formId((await get('/inbox/services/new')).html), {
    name: NAME.service, summary: 'Created by the smoke test.', categoryId: '2',
    departmentId: '1', bookingDepartment: NAME.booking, tag: 'Smoke', icon: 'i-stethoscope',
    sortOrder: '97', ctaLabel: 'Book this service', ctaType: 'appointment', bodyMd: '',
  });

  const id = Number(/\/inbox\/services\/(\d+)/.exec(add.location)?.[1] ?? 0);
  const doc = await db.collection('services').findOne({ id });
  check('add stores the service and shows it', saved(add) && /^smoke-.*-service$/.test(doc?.slug ?? '') && doc?.is_active === 1, doc?.slug);
  check('card reaches /services', (await get('/services')).html.includes(NAME.service));
  check('booking department reaches the wizard', (await get('/appointment')).html.includes(NAME.booking));

  const edit = formId((await get(`/inbox/services/${id}`)).html);
  const fields = {
    id, name: `${NAME.service} (renamed)`, summary: 'Edited by the smoke test.', categoryId: '2',
    departmentId: '1', bookingDepartment: NAME.booking, tag: 'Smoke', icon: 'i-stethoscope',
    sortOrder: '95', ctaLabel: 'Book this service', ctaType: 'appointment', bodyMd: '',
  };

  const edited = await post(`/inbox/services/${id}`, edit, fields);
  const after = await db.collection('services').findOne({ id });
  check('edit saves, keeps slug and visibility', saved(edited) && after?.slug === doc?.slug && after?.is_active === 1);
  check('renamed card reaches /services', (await get('/services')).html.includes(fields.name));
  check('missing category is refused', refused(await post(`/inbox/services/${id}`, edit, { ...fields, categoryId: '' })));
}

async function messages(db) {
  console.log('\nMessages: note and status buttons');

  const id = await seedMessage(db);
  const action = formId((await get('/inbox')).html, `Internal note for ${NAME.message}`);

  await post('/inbox', action, { id, note: 'Replied by phone (smoke test).' });
  const noted = await db.collection('messages').findOne({ id });
  check('note saves without touching the status', noted?.note?.startsWith('Replied by phone') && noted?.status === 'new');

  for (const [label, status] of [['read', 'read'], ['archived', 'archived'], ['back to read', 'read']]) {
    await post('/inbox', action, { id, note: noted.note, status });
    check(`status button: ${label}`, (await db.collection('messages').findOne({ id }))?.status === status);
  }
}

async function appointments(db) {
  console.log('\nAppointments: note, status buttons, search');

  const fixture = await seedAppointment(db);
  const action = formId((await get('/inbox/appointments')).html, `Internal note for ${NAME.patient}`);
  const row = () => db.collection('appointments').findOne({ id: fixture.id });

  await post('/inbox/appointments', action, { id: fixture.id, note: 'Left a voicemail (smoke test).' });
  check('note saves without touching the status', (await row())?.status === 'new' && Boolean((await row())?.note));

  await post('/inbox/appointments', action, { id: fixture.id, note: 'Left a voicemail.', status: 'confirmed' });
  check('confirm stamps handled_at', (await row())?.status === 'confirmed' && Boolean((await row())?.handled_at));

  await post('/inbox/appointments', action, { id: fixture.id, note: 'Left a voicemail.', status: 'new' });
  check('back to new clears handled_at', (await row())?.handled_at === null);

  await post('/inbox/appointments', action, { id: fixture.id, note: 'Left a voicemail.', status: 'archived' });
  check('archive saves', (await row())?.status === 'archived');

  const found = async (term) =>
    (await get(`/inbox/appointments?status=all&q=${encodeURIComponent(term)}`)).html.includes(fixture.reference);

  check('search finds the reference', await found(fixture.reference));
  check('search finds the digits-only phone', await found('000000000'));
  check('search by name, any case', await found('smoke patient'));
  check('regex characters are literal', !(await found('(')));
}

/* Run --------------------------------------------------------------------- */

const uri = setting('MONGODB_URI');
const password = setting('INBOX_PASSWORD');

if (!uri || !password) {
  console.error('MONGODB_URI and INBOX_PASSWORD must be set (environment or web/.dev.vars).');
  process.exit(1);
}

try {
  await get('/');
} catch (error) {
  console.error(`Cannot reach ${BASE} (${error.message}) — start the app first: npm run dev.`);
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
await client.connect();
const db = client.db(databaseName(uri));

await cleanup(db); // sweep anything an interrupted run left behind
const before = await counts(db);

try {
  const landing = await signIn(password);
  console.log(`Staff smoke test against ${BASE}`);
  console.log('\nSign-in');
  check('login redirects to /inbox', landing.endsWith('/inbox'), landing);
  check('login sets the staff cookie', Boolean(cookie));

  const signedOut = cookie;
  cookie = '';
  check('signed-out /inbox redirects to login', (await get('/inbox')).status === 307);
  cookie = signedOut;

  await doctors(db);
  await services(db);
  await messages(db);
  await appointments(db);
} finally {
  await cleanup(db);
  const after = await counts(db);
  check('database is back to its starting counts', JSON.stringify(before) === JSON.stringify(after), `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
  await client.close();
}

console.log(`\n${total - failed}/${total} checks passed`);
if (failed > 0) {
  console.log(`${failed} check(s) failed`);
  process.exitCode = 1;
} else {
  console.log('Staff write paths look good.');
}
