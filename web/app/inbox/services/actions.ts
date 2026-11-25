'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/inbox';
import { parseServiceForm, saveService, setServiceActive } from '@/lib/content';

/** Services feed /services, the booking form's department list and the home page. */
function revalidateServiceContent() {
  revalidatePath('/inbox/services');
  revalidatePath('/services');
  revalidatePath('/appointment');
  revalidatePath('/');
}

export async function saveServiceAction(formData: FormData) {
  await requireStaff();

  const idValue = Number(formData.get('id'));
  const back =
    Number.isInteger(idValue) && idValue > 0
      ? `/inbox/services/${idValue}`
      : '/inbox/services/new';

  const parsed = parseServiceForm(formData);
  if (!parsed.ok) redirect(`${back}?error=${encodeURIComponent(parsed.error)}`);

  const savedId = await saveService(parsed.value);
  revalidateServiceContent();
  redirect(`/inbox/services/${savedId}?saved=1`);
}

/** Hide or restore a service. Rows are never deleted. */
export async function toggleService(formData: FormData) {
  await requireStaff();

  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) return;

  await setServiceActive(id, String(formData.get('active')) === '1');
  revalidateServiceContent();
  redirect('/inbox/services?saved=1');
}
