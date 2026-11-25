import { getDb } from './d1';

/** Contact form: validation and the single write path into `messages`. */

export const CONTACT_SUBJECTS = [
  'General enquiry',
  'Appointments',
  'Insurance and billing',
  'Medical records',
  'Feedback',
  'Careers',
  'Media',
] as const;

export type ContactFields = 'name' | 'email' | 'subject' | 'body' | 'consent';

export type ContactState = {
  /** null until the form has been submitted. */
  ok: boolean | null;
  message: string;
  errors: Partial<Record<ContactFields, string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SUCCESS = 'Thank you — your message is on its way. Our team will reply during office hours.';
const FAILURE = 'We could not send your message. Please call +251 111 132 702 or email info@summitgh.com.et.';
const BUSY =
  'We have received several messages from this address in the last hour. Please call +251 111 132 702 if your message is urgent.';

/** Per-address and site-wide caps, counted from the messages already stored. */
const PER_EMAIL_PER_HOUR = 2;
const PER_HOUR_TOTAL = 20;
const HOUR_AGO = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 hour')";

function text(value: FormDataEntryValue | null, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function submitContact(formData: FormData): Promise<ContactState> {
  const name = text(formData.get('contactName'), 100);
  const email = text(formData.get('contactEmail'), 160);
  const phone = text(formData.get('contactPhone'), 40);
  const subject = text(formData.get('contactSubject'), 60);
  const body = text(formData.get('contactMessage'), 4000);
  const consent = formData.get('contactConsent') === 'yes' || formData.get('contactConsent') === 'on';
  const honeypot = text(formData.get('website'), 200);

  // Bots fill the hidden field; answer as if it worked and write nothing.
  if (honeypot) return { ok: true, message: SUCCESS, errors: {} };

  const errors: ContactState['errors'] = {};

  if (!name) errors.name = 'Please tell us your name.';
  if (!email) errors.email = 'Please add an email address so we can reply.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (!CONTACT_SUBJECTS.includes(subject as (typeof CONTACT_SUBJECTS)[number])) {
    errors.subject = 'Please choose what your message is about.';
  }
  if (body.length < 10) errors.body = 'Please add a little more detail (at least 10 characters).';
  if (!consent) errors.consent = 'Please confirm we may reply to your message.';

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Please check the highlighted fields.', errors };
  }

  try {
    const db = await getDb();

    const usage = await db
      .prepare(
        `SELECT
           (SELECT count(*) FROM messages WHERE email = ? AND created_at > ${HOUR_AGO}) AS from_email,
           (SELECT count(*) FROM messages WHERE created_at > ${HOUR_AGO}) AS in_total`
      )
      .bind(email)
      .all<{ from_email: number; in_total: number }>();

    const recent = usage.results?.[0];
    if (!recent || recent.from_email >= PER_EMAIL_PER_HOUR || recent.in_total >= PER_HOUR_TOTAL) {
      return { ok: false, message: BUSY, errors: {} };
    }

    await db
      .prepare(
        `INSERT INTO messages (name, email, phone, subject, body, consent, source_page)
         VALUES (?, ?, ?, ?, ?, 1, '/contact')`
      )
      .bind(name, email, phone || null, subject, body)
      .run();
  } catch (error) {
    console.error('contact message insert failed', error);
    return { ok: false, message: FAILURE, errors: {} };
  }

  return { ok: true, message: SUCCESS, errors: {} };
}
