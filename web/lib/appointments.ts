import { getDb } from './d1';
import { appointmentErrors, type AppointmentInput, type AppointmentResult } from './appointment-slots';

/**
 * Appointment requests. The browser form is convenience only: everything is
 * re-validated here before a row is written, and the short reference is what
 * the front desk quotes on the phone.
 */

const PER_PHONE_PER_HOUR = 3;
const HOUR_AGO = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 hour')";

function reference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0');
  return `SGH-${stamp}-${suffix}`;
}

/** The first problem, for the one-line alert shown above the form. */
export function appointmentProblem(input: AppointmentInput): string | null {
  return Object.values(appointmentErrors(input))[0] ?? null;
}

export async function requestAppointment(
  input: AppointmentInput
): Promise<AppointmentResult> {
  const problem = appointmentProblem(input);
  if (problem) return { ok: false, message: problem };

  const phone = input.phone.trim();

  try {
    const db = await getDb();

    const recent = await db
      .prepare(`SELECT count(*) AS n FROM appointments WHERE phone = ? AND created_at > ${HOUR_AGO}`)
      .bind(phone)
      .all<{ n: number }>();

    if ((recent.results?.[0]?.n ?? 0) >= PER_PHONE_PER_HOUR) {
      return {
        ok: false,
        message:
          'We already have several requests from this number in the last hour. Please call +251 111 132 702 so we can help directly.',
      };
    }

    const ref = reference();

    await db
      .prepare(
        `INSERT INTO appointments
           (reference, department, doctor, visit_type, preferred_date, preferred_time,
            first_name, last_name, phone, email, reason, consent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
      )
      .bind(
        ref,
        input.department,
        input.doctor || null,
        input.visitType,
        input.preferredDate,
        input.preferredTime,
        input.firstName.trim(),
        input.lastName.trim(),
        phone,
        input.email.trim() || null,
        input.reason.trim() || null
      )
      .run();

    return {
      ok: true,
      reference: ref,
      message: 'Your request is with us.',
    };
  } catch (error) {
    console.error('appointment insert failed', error);
    return {
      ok: false,
      message:
        'We could not send your request. Please call +251 111 132 702 or email info@summitgh.com.et.',
    };
  }
}
