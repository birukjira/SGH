import { MongoClient, MongoServerError, type Db } from 'mongodb';
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

/** Duplicate-key error, raised when two first writes race to create a counter. */
const DUPLICATE_KEY = 11000;

type ClientCache = { uri: string; client: Promise<MongoClient> };

/**
 * Held on `globalThis` on purpose. Next can evaluate this module more than once
 * in one process (per-route bundles in development, several route workers in
 * production); a module-level variable would then open one pool per copy.
 */
const cache = globalThis as typeof globalThis & { __sghMongo?: ClientCache };

function databaseName(uri: string): string {
  // mongodb+srv://host/?options — no path, so fall back to the constant.
  const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const slash = withoutScheme.indexOf('/');
  if (slash < 0) return DEFAULT_DATABASE;

  const pathPart = withoutScheme.slice(slash + 1).split('?')[0].trim();
  return pathPart || DEFAULT_DATABASE;
}

function connect(uri: string): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    appName: 'summit-general-hospital',
    serverSelectionTimeoutMS: 8000,
  });

  // A refused handshake (Atlas network access, paused cluster, bad password)
  // must not leave a client and its monitor timers behind on every retry.
  return client.connect().catch(async (error: unknown) => {
    await client.close().catch(() => {});
    throw error;
  });
}

async function clientFor(uri: string): Promise<MongoClient> {
  if (cache.__sghMongo && cache.__sghMongo.uri !== uri) {
    // The connection string changed under a running dev server: drop the old
    // pool instead of talking to the previous cluster.
    void cache.__sghMongo.client.then((client) => client.close()).catch(() => {});
    cache.__sghMongo = undefined;
  }

  if (!cache.__sghMongo) {
    const pending = connect(uri);
    const entry: ClientCache = { uri, client: pending };
    cache.__sghMongo = entry;

    // A failed handshake must not be cached forever — but clear only this
    // attempt, so a concurrent retry's client is not thrown away.
    pending.catch(() => {
      if (cache.__sghMongo === entry) cache.__sghMongo = undefined;
    });
  }

  return cache.__sghMongo.client;
}

export async function getDb(): Promise<Db> {
  const uri = envValue('MONGODB_URI');

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to web/.dev.vars (or the server environment) and restart the app.'
    );
  }

  const client = await clientFor(uri);
  return client.db(databaseName(uri));
}

/** Collections that keep numeric ids, and their counter document id. */
export type CounterName = 'doctors' | 'services' | 'messages' | 'appointments';

function isDuplicateKey(error: unknown): boolean {
  return error instanceof MongoServerError && error.code === DUPLICATE_KEY;
}

/**
 * SQL autoincrement replacement. Public URLs and staff forms use integer ids
 * (`/inbox/doctors/12`), so documents keep an `id` field filled from here
 * instead of exposing ObjectIds.
 *
 * `$inc` is atomic, so concurrent writers never receive the same id. The one
 * remaining race is the very first write to a fresh database: two writers can
 * both try to create the counter document and one gets a duplicate-key error,
 * so that is retried once against the document the winner created. Drift
 * between a counter and the documents already stored cannot cause a silent
 * overwrite, because every collection has a unique index on `id`.
 */
export async function nextId(db: Db, name: CounterName): Promise<number> {
  const counters = db.collection<{ _id: string; seq: number }>('counters');

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const doc = await counters.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
      );

      if (!doc?.seq) throw new Error(`Could not allocate an id for ${name}.`);
      return doc.seq;
    } catch (error) {
      // Lost the race to create the counter document; the winner's document is
      // there now, so the next pass increments it normally.
      if (isDuplicateKey(error) && attempt === 0) continue;
      throw error;
    }
  }

  throw new Error(`Could not allocate an id for ${name}.`);
}

/** Timestamps are ISO-8601 UTC strings, as the staff screens format them. */
export function nowIso(): string {
  return new Date().toISOString();
}
