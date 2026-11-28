import { after } from 'next/server';
import type { FrontDeskAlert } from './alerts';
import { envValue } from './env';
import { SITE_URL } from './site';

/**
 * Front-desk email alerts for new requests.
 *
 * A request that only lands in `/inbox` is a request nobody has been told about,
 * so every successful write also emails the front desk a short alert. Delivery
 * uses Resend's HTTPS API through the built-in `fetch` — no SDK, no dependency.
 *
 * The alert is deliberately thin: who to call back, what they asked for, and the
 * reference. The patient's own words stay in `/inbox` rather than travelling
 * through mailboxes that staff may read on personal phones.
 *
 * This is best-effort by design. A mail outage must never fail a patient's
 * request or ask them to send it twice, so every failure is logged and swallowed.
 * With no API key or addresses configured nothing is sent — that is how local
 * development and the staff smoke test run.
 */

const ENDPOINT = 'https://api.resend.com/emails';
const TIMEOUT_MS = 5000;

/**
 * Queue an alert behind the current response. `after()` keeps the patient's
 * confirmation from waiting on a mail server while still letting the runtime
 * finish the send, and the promise never rejects, so mail cannot turn a saved
 * request into an error.
 */
export function queueFrontDeskAlert(alert: FrontDeskAlert): void {
  try {
    after(() => alertFrontDesk(alert));
  } catch {
    // Outside a request (a script or a test): there is no response to defer past.
    void alertFrontDesk(alert);
  }
}

async function alertFrontDesk(alert: FrontDeskAlert): Promise<void> {
  const apiKey = envValue('RESEND_API_KEY');
  const to = envValue('NOTIFY_EMAIL_TO');
  const from = envValue('NOTIFY_EMAIL_FROM');

  // Alerts are optional: without all three values there is nothing to send to.
  if (!apiKey || !to || !from) return;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: alert.subject,
        // The inbox link is absolute and on its own line: staff read this outside
        // the app, so it has to be clickable straight from the email.
        text: [...alert.lines, '', 'Open the staff inbox for the full request:', `${SITE_URL}/inbox`].join(
          '\n'
        ),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('front-desk alert rejected', response.status, detail.slice(0, 300));
    }
  } catch (error) {
    console.error('front-desk alert failed', error);
  }
}
