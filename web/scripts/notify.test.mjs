// Front-desk alert check: what is sent when configured, that nothing is sent
// when it is not, and that the appointment and contact alerts carry routing
// detail only — never the patient's own words. Run with `npm run test:notify`
// (tsx, so the TypeScript modules run directly). No network request is made
// (`fetch` is stubbed) and no database is needed (the alert text builders are
// pure), so this runs anywhere.
import assert from 'node:assert/strict';
import { appointmentAlert, contactAlert } from '../lib/alerts.ts';

const CONFIGURED = {
  RESEND_API_KEY: 'test-key',
  NOTIFY_EMAIL_TO: 'front-desk@example.com',
  NOTIFY_EMAIL_FROM: 'Summit General Hospital <alerts@example.com>',
};

const calls = [];
let onFetch;
let nextFetch;
function stubFetch() {
  onFetch = new Promise((resolve) => {
    nextFetch = resolve;
  });
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    nextFetch();
    return { ok: true, status: 200, text: async () => '' };
  };
}

/** Waits for a call, but fails the check rather than hanging forever. */
async function firstCall() {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('fetch was never called')), 1000);
  });
  try {
    await Promise.race([onFetch, timeout]);
  } finally {
    clearTimeout(timer);
  }
  return calls[0];
}

function configure(values) {
  for (const name of Object.keys(CONFIGURED)) delete process.env[name];
  Object.assign(process.env, values);
}

const { queueFrontDeskAlert } = await import('../lib/notify.ts');

const results = [];
function check(name, run) {
  return Promise.resolve()
    .then(run)
    .then(() => results.push([name, null]))
    .catch((error) => results.push([name, error.message]));
}

await check('configured: sends one email to the front desk', async () => {
  configure(CONFIGURED);
  calls.length = 0;
  stubFetch();

  queueFrontDeskAlert({
    subject: 'New appointment request — SGH-TEST-01',
    lines: ['A patient asked for Cardiology.', 'Preferred: 2026-12-01 at 9:30 AM', 'Phone: +251 900 000 000'],
  });

  const call = await firstCall();
  assert.equal(call.url, 'https://api.resend.com/emails');
  assert.equal(call.init.method, 'POST');
  assert.equal(call.init.headers.Authorization, 'Bearer test-key');
  assert.equal(call.init.headers['Content-Type'], 'application/json');
  assert.ok(call.init.signal, 'request needs a timeout signal');

  const body = JSON.parse(call.init.body);
  assert.deepEqual(body.to, ['front-desk@example.com']);
  assert.equal(body.from, CONFIGURED.NOTIFY_EMAIL_FROM);
  assert.equal(body.subject, 'New appointment request — SGH-TEST-01');
  assert.match(body.text, /Cardiology/);
  assert.match(body.text, /\+251 900 000 000/);
  assert.equal(calls.length, 1, 'exactly one email per request');
});

await check('configured: links to the inbox as an absolute address', async () => {
  configure(CONFIGURED);
  calls.length = 0;
  stubFetch();

  queueFrontDeskAlert({ subject: 'New contact message — Feedback', lines: ['Someone wrote about Feedback.'] });

  const body = JSON.parse((await firstCall()).init.body);
  assert.match(body.text, /https:\/\/summitgeneralhospital\.com\/inbox/);
});

await check('configured: a rejected send does not throw', async () => {
  configure(CONFIGURED);
  calls.length = 0;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return { ok: false, status: 422, text: async () => 'domain not verified' };
  };

  // The helper logs the rejected send; the caller must not see an exception.
  const logged = [];
  const originalError = console.error;
  console.error = (...args) => logged.push(args.join(' '));
  try {
    queueFrontDeskAlert({ subject: 'x', lines: ['y'] });
    await new Promise((resolve) => setTimeout(resolve, 50));
  } finally {
    console.error = originalError;
  }

  assert.equal(calls.length, 1);
  assert.match(logged.join('\n'), /422/, 'a rejected send is logged for the operator');
});

await check('unconfigured: no key means no send', async () => {
  configure({ ...CONFIGURED, RESEND_API_KEY: '' });
  calls.length = 0;
  stubFetch();

  queueFrontDeskAlert({ subject: 'x', lines: ['y'] });
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(calls.length, 0);
});

await check('unconfigured: a missing recipient means no send', async () => {
  configure({ ...CONFIGURED, NOTIFY_EMAIL_TO: '' });
  calls.length = 0;
  stubFetch();

  queueFrontDeskAlert({ subject: 'x', lines: ['y'] });
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(calls.length, 0);
});

const APPOINTMENT = {
  department: 'Cardiology',
  doctor: 'Dr. Selam Tesfaye',
  visitType: 'First consultation',
  preferredDate: '2026-12-01',
  preferredTime: '9:30 AM',
  firstName: ' Abebe ',
  lastName: 'Bikila ',
  phone: '+251 900 000 000',
  email: 'abebe@example.com',
  reason: 'PLEASE-KEEP-THIS-OUT-42: chest pain after climbing the stairs',
  consent: true,
};

await check("appointment alert: the patient's reason stays out of the email", () => {
  const alert = appointmentAlert(APPOINTMENT, 'SGH-TEST-02', APPOINTMENT.phone);

  assert.doesNotMatch(JSON.stringify(alert), /PLEASE-KEEP-THIS-OUT-42|chest pain/);
  assert.equal(alert.subject, 'New appointment request — SGH-TEST-02');
  assert.deepEqual(alert.lines, [
    'Abebe Bikila asked for Cardiology (Dr. Selam Tesfaye).',
    'Preferred: 2026-12-01 at 9:30 AM',
    'Phone: +251 900 000 000',
  ]);
});

await check("contact alert: the message body stays out of the email", () => {
  const alert = contactAlert({
    name: 'Abebe Bikila',
    email: 'abebe@example.com',
    phone: '',
    subject: 'Feedback',
  });

  assert.equal(alert.subject, 'New contact message — Feedback');
  assert.deepEqual(alert.lines, ['Abebe Bikila wrote about Feedback.', 'Email: abebe@example.com']);
  assert.equal(
    contactAlert({ name: 'x', email: 'y@example.com', phone: '+251 900 000 000', subject: 'Feedback' }).lines.at(-1),
    'Phone: +251 900 000 000'
  );

  // The builder takes named routing fields only, so a message body cannot be
  // passed in even by mistake — an extra key is simply ignored.
  const smuggled = contactAlert({
    name: 'Abebe',
    email: 'abebe@example.com',
    phone: '',
    subject: 'Feedback',
    body: 'PLEASE-KEEP-THIS-OUT-43: my test results were strange',
  });
  assert.doesNotMatch(JSON.stringify(smuggled), /PLEASE-KEEP-THIS-OUT-43|test results/);
});

for (const [name, error] of results) {
  console.log(`${error ? 'FAIL' : 'PASS'}  ${name}${error ? `\n        ${error}` : ''}`);
}
const failed = results.filter(([, error]) => error).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);
