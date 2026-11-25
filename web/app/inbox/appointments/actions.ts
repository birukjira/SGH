'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/inbox';
import {
  APPOINTMENT_STATUSES,
  setAppointmentNote,
  setAppointmentStatus,
  type AppointmentStatus,
} from '@/lib/appointment-queue';

/**
 * One action for a queue row: the note input is always submitted, and `status`
 * is only present when the submitter was one of the status buttons. Both halves
 * are optional so a row can be annotated without moving it.
 *
 * Server actions are public endpoints, so the staff cookie is re-checked here.
 */
export async function updateAppointment(formData: FormData) {
  await requireStaff();

  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) return;

  const note = formData.get('note');
  if (typeof note === 'string') await setAppointmentNote(id, note);

  const status = String(formData.get('status') ?? '') as AppointmentStatus;
  if (APPOINTMENT_STATUSES.includes(status)) await setAppointmentStatus(id, status);

  revalidatePath('/inbox/appointments');
}
