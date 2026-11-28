import { envValue } from './env';

const PRODUCTION_URL = 'https://summitgeneralhospital.com';

/**
 * Public origin of the site.
 *
 * Canonical and sitemap URLs are built from this, and so is the inbox link in
 * front-desk alerts: that link has to be absolute, because staff read the email
 * outside the app and need to click straight through.
 *
 * Production is the default. A test host sets `SITE_URL` so pages, the sitemap
 * and those alert links point at the host that actually served the page instead
 * of production. Like the rest of `lib/env.ts` it is read when the process
 * starts, so a static build also needs it at build time.
 */
export const SITE_URL = (envValue('SITE_URL') || PRODUCTION_URL).replace(/\/+$/, '');
