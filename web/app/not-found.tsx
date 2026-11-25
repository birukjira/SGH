import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Page Not Found | Summit General Hospital' },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="page-404">
      <section className="not-found">
        <div className="wrap not-found__inner">
          <p className="eyebrow" style={{ justifyContent: 'center' }}>
            404 — Page not found
          </p>
          <div className="not-found__code" aria-hidden="true">
            404
          </div>
          <h1>This page has moved on.</h1>
          <p>
            The link may be old, or the page may have a new home. Let&apos;s get you back to the
            care you need.
          </p>
          <div className="not-found__links">
            <Link className="btn btn--primary" href="/">
              Back to home
            </Link>
            <Link className="btn btn--outline" href="/appointment">
              Book an appointment
            </Link>
            <Link className="btn btn--outline" href="/contact">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
