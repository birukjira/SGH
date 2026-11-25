import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * D1 access for pages and server actions.
 *
 * The binding is declared in wrangler.jsonc as DB. In production it comes from
 * the Sites environment; in `next dev` it comes from Wrangler's local Miniflare
 * state (see initOpenNextCloudflareForDev in next.config.ts).
 */

export type D1Result<T> = { results?: T[]; success: boolean };

export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<never>>;
};

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatement;
};

export async function getDb(): Promise<D1DatabaseLike> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as { DB?: D1DatabaseLike }).DB;

  if (!db) {
    throw new Error(
      'D1 binding "DB" is not available. Run `npm run db:local` and restart `npm run dev`.'
    );
  }

  return db;
}
