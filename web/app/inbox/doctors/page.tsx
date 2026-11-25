import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { StaffNav } from '@/components/StaffNav';
import { countNewMessages, requireStaff } from '@/lib/inbox';
import { toggleDoctor } from './actions';
import { countByStatus } from '@/lib/appointment-queue';
import { listDoctorsForStaff } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Doctors',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ saved?: string }>;

export default async function DoctorsAdminPage({ searchParams }: { searchParams: SearchParams }) {
  await requireStaff();

  const { saved } = await searchParams;
  const [doctors, counts, newMessages] = await Promise.all([
    listDoctorsForStaff(),
    countByStatus(),
    countNewMessages(),
  ]);

  const visible = doctors.filter((doctor) => doctor.isActive).length;
  const hidden = doctors.length - visible;

  return (
    <div className="page-inbox">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/inbox">Staff inbox</Link>
            <span aria-hidden="true">/</span>
            <span>Doctors</span>
          </nav>
          <div className="staff-head">
            <div>
              <p className="eyebrow">Staff</p>
              <h1 className="staff-title">Doctors.</h1>
              <p className="page-hero__lede">
                {visible} on the website · {hidden} hidden. Edits appear on{' '}
                <Link href="/doctors">the public directory</Link> straight away.
              </p>
            </div>
            <Link className="btn btn--sm" href="/inbox">
              Back to inbox
            </Link>
          </div>
        </div>
      </section>

      <StaffNav active="doctors" newMessages={newMessages} newAppointments={counts.new} />

      <section className="section">
        <div className="wrap staff-wrap staff-wrap--wide">
          {saved ? (
            <p className="notice staff-notice">
              <Icon name="shield" />
              <span>
                <strong>Saved.</strong> The public pages pick the change up on their next load.
              </span>
            </p>
          ) : null}

          <div className="queue-bar">
            <Link className="btn btn--sm btn--primary" href="/inbox/doctors/new">
              Add a doctor
              <Icon name="arrow" />
            </Link>
            <Link className="btn btn--sm btn--outline" href="/doctors">
              View public directory
            </Link>
          </div>

          {doctors.length === 0 ? (
            <div className="empty-state is-visible">
              <strong>No consultants yet.</strong>
              Add the first one — the public directory reads this list.
            </div>
          ) : null}

          {doctors.map((doctor) => (
            <article className="staff-card staff-card--row" key={doctor.id}>
              <div className="staff-card__head">
                <strong>{doctor.name}</strong>
                <span className="tag">{doctor.role}</span>
                <span className={`tag${doctor.isActive ? '' : ' tag--clay'}`}>
                  {doctor.isActive ? 'On the website' : 'Hidden'}
                </span>
                <span className="small-note staff-card__stamp">
                  order {doctor.sortOrder}
                </span>
              </div>

              <p className="staff-card__meta">
                {doctor.departments.length
                  ? doctor.departments
                      .map((department) =>
                        department.isPrimary ? `${department.name} (primary)` : department.name
                      )
                      .join(' · ')
                  : 'No department yet — this doctor will not appear under any filter.'}
              </p>

              <p className="staff-card__reason">{doctor.focus}</p>

              <div className="staff-card__actions staff-card__links">
                <Link className="btn btn--sm btn--outline" href={`/inbox/doctors/${doctor.id}`}>
                  Edit
                </Link>
                <form action={toggleDoctor}>
                  <input type="hidden" name="id" value={doctor.id} />
                  <input type="hidden" name="active" value={doctor.isActive ? '0' : '1'} />
                  <button className="btn btn--sm" type="submit">
                    {doctor.isActive ? 'Hide from website' : 'Show on website'}
                  </button>
                </form>
              </div>
            </article>
          ))}

          <p className="small-note staff-footnote">
            <Icon name="shield" /> A doctor who leaves is hidden, never deleted — they drop out of the
            public directory and the appointment form&apos;s consultant list, while the row, photo and
            past requests stay in the database. Add a new doctor with “Add a doctor”; the web address
            is generated from the name.
          </p>
        </div>
      </section>
    </div>
  );
}
