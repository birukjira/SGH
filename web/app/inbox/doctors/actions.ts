'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/inbox';
import { parseDoctorForm, saveDoctor, setDoctorActive } from '@/lib/content';

/**
 * Public pages read from D1 per request, but the home page and the booking form
 * also show consultant-derived content, so every write refreshes them too.
 */
function revalidateDoctorContent() {
  revalidatePath('/inbox/doctors');
  revalidatePath('/doctors');
  revalidatePath('/appointment');
  revalidatePath('/');
}

/**
 * Create or update. Server actions are public endpoints, so the staff cookie is
 * re-checked here; `id` is empty on the "add" form.
 */
export async function saveDoctorAction(formData: FormData) {
  await requireStaff();

  const idValue = Number(formData.get('id'));
  const back =
    Number.isInteger(idValue) && idValue > 0 ? `/inbox/doctors/${idValue}` : '/inbox/doctors/new';

  const parsed = parseDoctorForm(formData);
  if (!parsed.ok) redirect(`${back}?error=${encodeURIComponent(parsed.error)}`);

  const savedId = await saveDoctor(parsed.value);
  revalidateDoctorContent();
  redirect(`/inbox/doctors/${savedId}?saved=1`);
}

/**
 * Hide or restore a consultant. A doctor who leaves the hospital is hidden, not
 * deleted, so old requests and the record itself stay intact.
 */
export async function toggleDoctor(formData: FormData) {
  await requireStaff();

  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) return;

  await setDoctorActive(id, String(formData.get('active')) === '1');
  revalidateDoctorContent();
  redirect('/inbox/doctors?saved=1');
}
