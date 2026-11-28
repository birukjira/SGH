import type { AppointmentInput } from './appointment-slots';

/**
 * The text of front-desk alerts, kept apart from sending them.
 *
 * These builders deliberately take the whole appointment request and still use
 * none of the patient's own words (`reason`), and `contactAlert` has no field
 * for the message body at all. That text is clinical or personal, so it stays
 * behind the staff gate in `/inbox` instead of travelling through mailboxes
 * staff may read on personal phones.
 *
 * They are pure, which is also what lets `npm run test:notify` check the
 * guarantee without a database.
 */

export type FrontDeskAlert = {
  subject: string;
  /** Body lines, in order. Keep them free of clinical detail. */
  lines: string[];
};

export function appointmentAlert(
  input: AppointmentInput,
  reference: string,
  phone: string
): FrontDeskAlert {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  return {
    subject: `New appointment request — ${reference}`,
    lines: [
      `${firstName} ${lastName} asked for ${input.department}${input.doctor ? ` (${input.doctor})` : ''}.`,
      `Preferred: ${input.preferredDate} at ${input.preferredTime}`,
      `Phone: ${phone}`,
    ],
  };
}

export function contactAlert(fields: {
  name: string;
  email: string;
  phone: string;
  subject: string;
}): FrontDeskAlert {
  return {
    subject: `New contact message — ${fields.subject}`,
    lines: [
      `${fields.name} wrote about ${fields.subject}.`,
      `Email: ${fields.email}`,
      ...(fields.phone ? [`Phone: ${fields.phone}`] : []),
    ],
  };
}
