'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  requireStaff,
  setMessageNote,
  setMessageStatus,
  signIn,
  signOut,
} from '@/lib/inbox';

export async function login(formData: FormData) {
  const result = await signIn(String(formData.get('password') ?? ''));
  if (result === 'ok') redirect('/inbox');

  redirect(`/inbox/login?error=${result === 'locked' ? 'locked' : 'password'}`);
}

export async function logout() {
  await signOut();
  redirect('/inbox/login');
}

/**
 * One action per card: the note input is always submitted, and `status` is only
 * present when the submitter was one of the status buttons. Both halves are
 * optional, so a note can be saved without moving the message.
 *
 * Server actions are public endpoints, so the staff cookie is re-checked here.
 */
export async function updateMessage(formData: FormData) {
  await requireStaff();

  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) return;

  const note = formData.get('note');
  if (typeof note === 'string') await setMessageNote(id, note);

  const status = String(formData.get('status') ?? '');
  if (status === 'read' || status === 'archived') await setMessageStatus(id, status);

  revalidatePath('/inbox');
}
