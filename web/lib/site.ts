/**
 * Public origin of the site.
 *
 * Canonical and sitemap URLs are built from this, and so is the inbox link in
 * front-desk alerts: that link has to be absolute, because staff read the email
 * outside the app and need to click straight through. If the hospital moves to
 * another domain, this is the only place to change it.
 */
export const SITE_URL = 'https://summitgeneralhospital.com';
