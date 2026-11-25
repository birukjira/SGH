import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { inboxPassword, isStaff } from '@/lib/inbox';
import { login } from '../actions';

export const metadata: Metadata = {
  title: 'Staff inbox sign-in',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ error?: string }>;

export default async function InboxLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;
  const configured = Boolean(await inboxPassword());

  if (await isStaff()) redirect('/inbox');

  return (
    <div className="page-hero">
      <div className="wrap staff-wrap staff-wrap--narrow">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Staff inbox</span>
        </nav>
        <p className="eyebrow">Staff only</p>
        <h1 className="staff-title">Contact inbox.</h1>
        <p className="page-hero__lede">
          Messages sent through the website contact form. Sign in with the front-desk password.
        </p>

        {!configured ? (
          <p className="notice staff-notice">
            <Icon name="shield" />
            <span>
              <strong>No password is configured.</strong> Set <code>INBOX_PASSWORD</code> in{' '}
              <code>web/.dev.vars</code> for local use, or in Sites → Secrets for the deployed site,
              then reload this page.
            </span>
          </p>
        ) : (
          <form action={login} className="staff-form">
            <div className={`field${error ? ' has-error' : ''}`}>
              <label htmlFor="password">Password</label>
              <input
                className="input"
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'passwordError' : undefined}
              />
              {error ? (
                <span className="field__error" id="passwordError" role="alert">
                  {error === 'locked'
                    ? 'Too many failed attempts. Try again in about 15 minutes.'
                    : 'That password is not right.'}
                </span>
              ) : null}
            </div>
            <div className="staff-submit">
              <button className="btn btn--primary" type="submit">
                Sign in
                <Icon name="arrow" />
              </button>
            </div>
          </form>
        )}

        <p className="small-note staff-footnote">
          Not staff? <Link href="/contact">Use the contact page instead</Link> — it reaches the same
          team.
        </p>
      </div>
    </div>
  );
}
