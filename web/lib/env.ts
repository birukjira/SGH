import fs from 'node:fs';
import path from 'node:path';

/**
 * Local secrets.
 *
 * Next only reads `.env*` files, while this project keeps its local values in
 * `web/.dev.vars` (git-ignored). This loads that file once on the server and
 * never overrides a variable that is already set, so a hosting panel or CI
 * value always wins over the local file.
 */
const FILE = '.dev.vars';

let loaded = false;

export function loadLocalEnv(): void {
  if (loaded) return;
  loaded = true;

  let raw: string;
  try {
    raw = fs.readFileSync(path.join(process.cwd(), FILE), 'utf8');
  } catch {
    return; // no local file: production reads the real environment
  }

  for (const line of raw.split('\n')) {
    const text = line.trim();
    if (!text || text.startsWith('#')) continue;

    const split = text.indexOf('=');
    if (split < 0) continue;

    const key = text.slice(0, split).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    let value = text.slice(split + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) process.env[key] = value;
  }
}

/** Reads a server-only value, after making `.dev.vars` visible. */
export function envValue(name: string): string {
  loadLocalEnv();
  return (process.env[name] ?? '').trim();
}

loadLocalEnv();
