import { getDb } from './d1';
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

type QueueRow = {
  id: number;
  reference: string;
  department: string;
  doctor: string | null;
  visit_type: string;
  preferred_date: string;
  preferred_time: string;
  first_name: string;
  last_name: string;
  phone: string;
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
  const result = await db
    .prepare('SELECT status, count(*) AS n FROM appointments GROUP BY status')
    .all<{ status: AppointmentStatus; n: number }>();

  for (const row of result.results ?? []) {
    if (row.status in counts) counts[row.status] = row.n;
  }

  return counts;
}

/** Rows for one filter, optionally narrowed by reference, phone or patient name. */
export async function listAppointments(
  filter: StatusFilter,
  search = ''
): Promise<QueueItem[]> {
  const db = await getDb();

  const where: string[] = [];
  const params: string[] = [];

  if (filter !== 'all') {
    where.push('status = ?');
    params.push(filter);
  }

  const term = search.trim().slice(0, 60);
  if (term) {
    const digits = term.replace(/[^0-9]/g, '');
    where.push(
      `(reference LIKE ? OR phone LIKE ? OR (first_name || ' ' || last_name) LIKE ?
        OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') LIKE ?)`
    );
    params.push(`%${term}%`, `%${term}%`, `%${term}%`, `%${digits || term}%`);
  }

  const result = await db
    .prepare(
      `SELECT id, reference, department, doctor, visit_type, preferred_date, preferred_time,
              first_name, last_name, phone, email, reason, note, status, handled_at, created_at
         FROM appointments
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY preferred_date ASC, id ASC
        LIMIT 300`
    )
    .bind(...params)
    .all<QueueRow>();

  return (result.results ?? [])
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
    .prepare(
      `UPDATE appointments
          SET status = ?,
              handled_at = CASE WHEN ? = 'new' THEN NULL
                                ELSE strftime('%Y-%m-%dT%H:%M:%fZ', 'now') END
        WHERE id = ?`
    )
    .bind(status, status, id)
    .run();
}

export async function setAppointmentNote(id: number, note: string): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) return;

  const trimmed = note.trim().slice(0, 500);
  const db = await getDb();
  await db
    .prepare('UPDATE appointments SET note = ? WHERE id = ?')
    .bind(trimmed || null, id)
    .run();
}
