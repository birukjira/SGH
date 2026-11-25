'use server';

import { submitContact, type ContactState } from '@/lib/messages';

export async function sendContactMessage(
  _previous: ContactState,
  formData: FormData
): Promise<ContactState> {
  return submitContact(formData);
}
