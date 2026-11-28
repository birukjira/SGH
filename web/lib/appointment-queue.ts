import { getDb, nowIso } from './mongo';
import { TIME_SLOTS } from './appointment-slots';

/**
 * Staff-side reads and writes for appointment requests.
 *
 * Nothing here is reachable from a public page: the queue page and its server
 * actions both call `requireStaff()` first (see lib/inbox.ts). Requests are
 * contacted by phone, so the queue is ordered by the date the patient asked for
 * rather than by arrival time.
 */

export type AppointmentStatus = 'new' | 'confirmed' | 'declined' | 'archived';

export const APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  'new',
  'confirmed',
  'declined',
  'archived',
];

export type StatusFilter = AppointmentStatus | 'all';

const STATUS_FILTERS: readonly StatusFilter[] = [...APPOINTMENT_STATUSES, 'all'];

export type QueueItem = {
  id: number;
  reference: string;
  department: string;
  doctor: string | null;
  visitType: string;
  preferredDate: string;
  preferredTime: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  reason: string | null;
  note: string | null;
  status: AppointmentStatus;
  handledAt: string | null;
  createdAt: string;
};

type QueueDoc = {
  id: number;
  reference: string;
  department: string;
  doctor: string | null;
  visit_type: string;
  preferred_date: string;
  preferred_time: string;
  first_name: string;
  last_name: string;
  patient_name?: string;
  phone: string;
  phone_digits?: string;
  email: string | null;
  reason: string | null;
  note: string | null;
  status: AppointmentStatus;
  handled_at: string | null;
  created_at: string;
};

export function statusFilter(value: string | undefined): StatusFilter {
  const candidate = value ?? '';
  return (STATUS_FILTERS as readonly string[]).includes(candidate)
    ? (candidate as StatusFilter)
    : 'new';
}

/** '10:30 AM' sorts before '8:30 AM' as text, so order by slot position. */
const SLOT_INDEX = new Map<string, number>(TIME_SLOTS.map((slot, index) => [slot, index]));
const slotIndex = (value: string) => SLOT_INDEX.get(value) ?? TIME_SLOTS.length;

export async function countByStatus(): Promise<Record<AppointmentStatus, number>> {
  const counts: Record<AppointmentStatus, number> = {
    new: 0,
    confirmed: 0,
    declined: 0,
    archived: 0,
  };

  const db = await getDb();
  const rows = await db
    .collection<{ _id: AppointmentStatus; n: number }>('appointments')
    .aggregate<{ _id: AppointmentStatus; n: number }>([
      { $group: { _id: '$status', n: { $sum: 1 } } },
    ])
    .toArray();

  for (const row of rows) {
    if (row._id in counts) counts[row._id] = row.n;
  }

  return counts;
}

/** The text as a case-insensitive literal, so `.` or `(` cannot act as a pattern. */
function literal(value: string): RegExp {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

/** Rows for one filter, optionally narrowed by reference, phone or patient name. */
export async function listAppointments(
  filter: StatusFilter,
  search = ''
): Promise<QueueItem[]> {
  const db = await getDb();

  const where: Record<string, unknown> = {};
  if (filter !== 'all') where.status = filter;

  const term = search.trim().slice(0, 60);
  if (term) {
    const pattern = literal(term);
    const digits = term.replace(/[^0-9]/g, '');

    where.$or = [
      { reference: pattern },
      { phone: pattern },
      { patient_name: pattern },
      { first_name: pattern },
      { last_name: pattern },
      ...(digits ? [{ phone_digits: literal(digits) }] : []),
    ];
  }

  const rows = await db
    .collection<QueueDoc>('appointments')
    .find(where)
    .limit(300)
    .toArray();

  return rows
    .map((row) => ({
      id: row.id,
      reference: row.reference,
      department: row.department,
      doctor: row.doctor,
      visitType: row.visit_type,
      preferredDate: row.preferred_date,
      preferredTime: row.preferred_time,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      email: row.email,
      reason: row.reason,
      note: row.note,
      status: row.status,
      handledAt: row.handled_at,
      createdAt: row.created_at,
    }))
    .sort(
      (a, b) =>
        a.preferredDate.localeCompare(b.preferredDate) ||
        slotIndex(a.preferredTime) - slotIndex(b.preferredTime) ||
        a.id - b.id
    );
}

export async function setAppointmentStatus(
  id: number,
  status: AppointmentStatus
): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) return;

  const db = await getDb();
  await db
    .collection<QueueDoc>('appointments')
    .updateOne(
      { id },
      { $set: { status, handled_at: status === 'new' ? null : nowIso() } }
    );
}

export async function setAppointmentNote(id: number, note: string): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) return;

  const trimmed = note.trim().slice(0, 500);
  const db = await getDb();
  await db
    .collection<QueueDoc>('appointments')
    .updateOne({ id }, { $set: { note: trimmed || null } });
}
