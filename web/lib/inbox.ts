import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { envValue } from './env';
import { getDb, nowIso } from './mongo';

/**
 * Staff inbox: access check and queries.
 *
 * The inbox is gated by a single shared password held in the environment
 * (`INBOX_PASSWORD`, from .dev.vars locally and the server environment in
 * production). A correct password sets an http-only cookie holding its digest,
 * so no secret is ever sent back to the browser. There is no per-user account:
 * this is a front-desk tool, not a clinician portal, and it must not be exposed
 * without a password set.
 */

const COOKIE = 'sgh_inbox';

/** Failed attempts allowed per client before sign-in is refused for a while. */
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export type MessageStatus = 'new' | 'read' | 'archived';

export type InboxMessage = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  body: string;
  note: string | null;
  status: MessageStatus;
  createdAt: string;
};

type MessageDoc = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  body: string;
  note: string | null;
  status: MessageStatus;
  created_at: string;
};

type AttemptDoc = {
  key: string;
  attempted_at: string;
};

export async function inboxPassword(): Promise<string> {
  return envValue('INBOX_PASSWORD');
}

async function token(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`summit-inbox:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Length-independent comparison so a wrong password leaks no timing detail. */
function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isStaff(): Promise<boolean> {
  const password = await inboxPassword();
  if (!password) return false;

  const cookie = (await cookies()).get(COOKIE)?.value;
  if (!cookie) return false;

  return sameSecret(cookie, await token(password));
}

/** Every inbox page and action starts with this. */
export async function requireStaff(): Promise<void> {
  if (!(await isStaff())) redirect('/inbox/login');
}

export type SignInResult = 'ok' | 'bad' | 'locked' | 'unconfigured';

/** Per-client key for the attempt counter, derived from the IP and the password. */
async function attemptKey(password: string): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0];
  const ip = (requestHeaders.get('cf-connecting-ip') ?? forwarded ?? 'local').trim();
  return token(`attempt:${ip}:${password}`);
}

/** Failures in the window for this key, after pruning older rows. */
async function recentFailures(key: string): Promise<number> {
  const db = await getDb();
  const cutoff = new Date(Date.now() - ATTEMPT_WINDOW_MS).toISOString();

  await db
    .collection<AttemptDoc>('login_attempts')
    .deleteMany({ attempted_at: { $lt: cutoff } });

  return db.collection<AttemptDoc>('login_attempts').countDocuments({ key });
}

export async function signIn(password: string): Promise<SignInResult> {
  const expected = await inboxPassword();
  const candidate = password.trim();
  if (!expected) return 'unconfigured';
  if (!candidate) return 'bad';

  const key = await attemptKey(expected);
  let failures = 0;

  try {
    failures = await recentFailures(key);
  } catch (error) {
    // A broken attempt counter must not lock staff out of their own inbox.
    console.error('inbox attempt check failed', error);
  }

  if (failures >= MAX_ATTEMPTS) return 'locked';

  const digest = await token(candidate);

  if (!sameSecret(digest, await token(expected))) {
    try {
      const db = await getDb();
      await db
        .collection<AttemptDoc>('login_attempts')
        .insertOne({ key, attempted_at: nowIso() });
    } catch (error) {
      console.error('inbox attempt record failed', error);
    }
    return 'bad';
  }

  try {
    const db = await getDb();
    await db.collection<AttemptDoc>('login_attempts').deleteMany({ key });
  } catch (error) {
    console.error('inbox attempt reset failed', error);
  }

  (await cookies()).set(COOKIE, digest, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/inbox',
    maxAge: 60 * 60 * 12,
  });

  return 'ok';
}

export async function signOut(): Promise<void> {
  // Must match the path the cookie was set with, or the browser keeps it.
  (await cookies()).set(COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/inbox',
    maxAge: 0,
  });
}

export async function listMessages(): Promise<InboxMessage[]> {
  const db = await getDb();

  const rows = await db
    .collection<MessageDoc>('messages')
    .find({})
    .sort({ created_at: -1, id: -1 })
    .limit(200)
    .toArray();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    body: row.body,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
  }));
}

/** Unread count for the staff navigation bar. */
export async function countNewMessages(): Promise<number> {
  const db = await getDb();
  return db.collection<MessageDoc>('messages').countDocuments({ status: 'new' });
}

export async function setMessageStatus(id: number, status: MessageStatus): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) return;

  const db = await getDb();
  await db.collection<MessageDoc>('messages').updateOne({ id }, { $set: { status } });
}

export async function setMessageNote(id: number, note: string): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) return;

  const trimmed = note.trim().slice(0, 500);
  const db = await getDb();
  await db
    .collection<MessageDoc>('messages')
    .updateOne({ id }, { $set: { note: trimmed || null } });
}
