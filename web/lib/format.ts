/** Presentation helpers shared by the staff screens. */

/** ISO-8601 UTC string as written by the database -> "2026-11-24 02:23 UTC". */
export function utcStamp(iso: string): string {
  return iso.replace('T', ' ').replace(/\..*$/, ' UTC');
}

/** `tel:` target for a phone number typed with spaces, dashes or brackets. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Local calendar date as `YYYY-MM-DD`, for comparing with stored preferred dates. */
export function dateKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate()
  ).padStart(2, '0')}`;
}
