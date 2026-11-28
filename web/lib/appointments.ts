import { getDb, nextId, nowIso } from './mongo';
import { queueFrontDeskAlert } from './notify';
import { appointmentErrors, type AppointmentInput, type AppointmentResult } from './appointment-slots';

/**
 * Appointment requests. The browser form is convenience only: everything is
 * re-validated here before a document is written, and the short reference is
 * what the front desk quotes on the phone.
 */

const PER_PHONE_PER_HOUR = 3;
const HOUR_MS = 60 * 60 * 1000;

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
    const appointments = db.collection('appointments');

    const since = new Date(Date.now() - HOUR_MS).toISOString();
    const recent = await appointments.countDocuments({
      phone,
      created_at: { $gt: since },
    });

    if (recent >= PER_PHONE_PER_HOUR) {
      return {
        ok: false,
        message:
          'We already have several requests from this number in the last hour. Please call +251 111 132 702 so we can help directly.',
      };
    }

    const ref = reference();
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();

    await appointments.insertOne({
      id: await nextId(db, 'appointments'),
      reference: ref,
      department: input.department,
      doctor: input.doctor || null,
      visit_type: input.visitType,
      preferred_date: input.preferredDate,
      preferred_time: input.preferredTime,
      first_name: firstName,
      last_name: lastName,
      // Derived fields so the queue's search can match a full name and a
      // phone number typed without spaces, dashes or a plus sign.
      patient_name: `${firstName} ${lastName}`,
      phone,
      phone_digits: phone.replace(/[^0-9]/g, ''),
      email: input.email.trim() || null,
      reason: input.reason.trim() || null,
      note: null,
      consent: 1,
      status: 'new',
      handled_at: null,
      created_at: nowIso(),
    });

    // Sent after the response, and never able to fail the request.
    queueFrontDeskAlert({
      subject: `New appointment request — ${ref}`,
      lines: [
        `${firstName} ${lastName} asked for ${input.department}${input.doctor ? ` (${input.doctor})` : ''}.`,
        `Preferred: ${input.preferredDate} at ${input.preferredTime}`,
        `Phone: ${phone}`,
      ],
    });

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
