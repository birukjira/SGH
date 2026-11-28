import { MongoClient, type Db } from 'mongodb';
import { envValue } from './env';

/**
 * MongoDB access for pages and server actions.
 *
 * One client per process: the driver pools connections itself, and creating a
 * client per request would exhaust Atlas' connection limit. `MONGODB_URI` comes
 * from `.dev.vars` in development and from the environment on the server.
 */

/** Used when the connection string has no database path of its own. */
const DEFAULT_DATABASE = 'summit_general_hospital';

let clientPromise: Promise<MongoClient> | undefined;

function databaseName(uri: string): string {
  // mongodb+srv://host/?options — no path, so fall back to the constant.
  const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const slash = withoutScheme.indexOf('/');
  if (slash < 0) return DEFAULT_DATABASE;

  const pathPart = withoutScheme.slice(slash + 1).split('?')[0].trim();
  return pathPart || DEFAULT_DATABASE;
}

export async function getDb(): Promise<Db> {
  const uri = envValue('MONGODB_URI');

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to web/.dev.vars (or the server environment) and restart the app.'
    );
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      appName: 'summit-general-hospital',
      serverSelectionTimeoutMS: 8000,
    });
    clientPromise = client.connect();
  }

  try {
    const client = await clientPromise;
    return client.db(databaseName(uri));
  } catch (error) {
    // A failed handshake must not leave a rejected promise cached forever.
    clientPromise = undefined;
    throw error;
  }
}

/** Collections that keep numeric ids, and their counter document id. */
export type CounterName = 'doctors' | 'services' | 'messages' | 'appointments';

/**
 * SQL autoincrement replacement. Public URLs and staff forms use integer ids
 * (`/inbox/doctors/12`), so documents keep an `id` field filled from here
 * instead of exposing ObjectIds.
 */
export async function nextId(db: Db, name: CounterName): Promise<number> {
  const counters = db.collection<{ _id: string; seq: number }>('counters');
  const doc = await counters.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  if (!doc?.seq) throw new Error(`Could not allocate an id for ${name}.`);
  return doc.seq;
}

/** Timestamps are ISO-8601 UTC strings, as the staff screens format them. */
export function nowIso(): string {
  return new Date().toISOString();
}
