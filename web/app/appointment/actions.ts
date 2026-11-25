'use server';

import { requestAppointment } from '@/lib/appointments';
import type { AppointmentInput, AppointmentResult } from '@/lib/appointment-slots';

export async function submitAppointment(input: AppointmentInput): Promise<AppointmentResult> {
  return requestAppointment(input);
}
