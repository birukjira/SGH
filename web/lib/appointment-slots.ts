/**
 * Booking options and rules, shared by the wizard (client) and the server action
 * that re-validates it. Keeping them in one file means the browser and the
 * database cannot disagree — and importing this never pulls `lib/d1` into the
 * client bundle.
 */

export const TIME_SLOTS = [
  '8:30 AM',
  '9:30 AM',
  '10:30 AM',
  '11:30 AM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
] as const;

export const VISIT_TYPES = ['First consultation', 'Follow-up visit'] as const;

const PHONE_RE = /^\+?[0-9][0-9\s\-()]{7,17}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REASON_LIMIT = 800;
const BOOKING_WINDOW_DAYS = 90;

export type AppointmentInput = {
  department: string;
  doctor: string;
  visitType: string;
  preferredDate: string;
  preferredTime: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  reason: string;
  consent: boolean;
};

export type AppointmentField = keyof AppointmentInput;
export type AppointmentErrors = Partial<Record<AppointmentField, string>>;

export type AppointmentResult = {
  ok: boolean;
  reference?: string;
  message: string;
};

function isoDate(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/** Earliest and latest date a request may ask for (also the `date` input bounds). */
export function bookingWindow(today = new Date()) {
  const latest = new Date(today);
  latest.setDate(latest.getDate() + BOOKING_WINDOW_DAYS);
  return { min: isoDate(today), max: isoDate(latest) };
}

export function appointmentErrors(
  input: AppointmentInput,
  bounds: { min: string; max: string } = bookingWindow()
): AppointmentErrors {
  const errors: AppointmentErrors = {};

  if (!input.department.trim()) errors.department = 'Choose a department.';
  if (!(VISIT_TYPES as readonly string[]).includes(input.visitType)) {
    errors.visitType = 'Choose an option.';
  }

  if (!input.preferredDate) {
    errors.preferredDate = 'Choose a preferred date.';
  } else if (input.preferredDate < bounds.min) {
    errors.preferredDate = 'Please choose a date from today onward.';
  } else if (input.preferredDate > bounds.max) {
    errors.preferredDate = 'Please choose a date within the next three months.';
  }

  if (!(TIME_SLOTS as readonly string[]).includes(input.preferredTime)) {
    errors.preferredTime = 'Choose a preferred time.';
  }

  if (!input.firstName.trim()) errors.firstName = 'Enter your first name.';
  if (!input.lastName.trim()) errors.lastName = 'Enter your last name.';
  if (!PHONE_RE.test(input.phone.trim())) {
    errors.phone = 'Enter a phone number we can reach you on.';
  }
  if (input.email.trim() && !EMAIL_RE.test(input.email.trim())) {
    errors.email = 'Enter a valid email address, or leave this blank.';
  }
  if (input.reason.trim().length > REASON_LIMIT) {
    errors.reason = `Please keep this under ${REASON_LIMIT} characters.`;
  }
  if (!input.consent) errors.consent = 'Please confirm we may contact you.';

  return errors;
}
