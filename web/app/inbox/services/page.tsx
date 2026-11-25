import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { StaffNav } from '@/components/StaffNav';
import { countNewMessages, requireStaff } from '@/lib/inbox';
import { countByStatus } from '@/lib/appointment-queue';
import { listServicesForStaff, type ServiceRecord } from '@/lib/content';
import { toggleService } from './actions';

export const metadata: Metadata = {
  title: 'Services',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ saved?: string }>;

export default async function ServicesAdminPage({ searchParams }: { searchParams: SearchParams }) {
  await requireStaff();

  const { saved } = await searchParams;
  const [services, counts, newMessages] = await Promise.all([
    listServicesForStaff(),
    countByStatus(),
    countNewMessages(),
  ]);

  const visible = services.filter((service) => service.isActive).length;
  const hidden = services.length - visible;

  const groups: { name: string; rows: ServiceRecord[] }[] = [];
  for (const service of services) {
    const last = groups.at(-1);
    if (last && last.name === service.categoryName) last.rows.push(service);
    else groups.push({ name: service.categoryName, rows: [service] });
  }

  return (
    <div className="page-inbox">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/inbox">Staff inbox</Link>
            <span aria-hidden="true">/</span>
            <span>Services</span>
          </nav>
          <div className="staff-head">
            <div>
              <p className="eyebrow">Staff</p>
              <h1 className="staff-title">Services.</h1>
              <p className="page-hero__lede">
                {visible} on the website · {hidden} hidden. These cards also feed the department
                list on the appointment form.
              </p>
            </div>
            <Link className="btn btn--sm" href="/inbox">
              Back to inbox
            </Link>
          </div>
        </div>
      </section>

      <StaffNav active="services" newMessages={newMessages} newAppointments={counts.new} />

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
            <Link className="btn btn--sm btn--primary" href="/inbox/services/new">
              Add a service
              <Icon name="arrow" />
            </Link>
            <Link className="btn btn--sm btn--outline" href="/services">
              View public page
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="empty-state is-visible">
              <strong>No services yet.</strong>
              Add the first one — /services reads this list.
            </div>
          ) : null}

          {groups.map((group) => (
            <div key={group.name} className="staff-group">
              <h2 className="staff-group__title">{group.name}</h2>
              <p className="small-note staff-group__meta">
                {group.rows.length} service{group.rows.length === 1 ? '' : 's'}
              </p>

              {group.rows.map((service) => (
                <article className="staff-card staff-card--row" key={service.id}>
                  <div className="staff-card__head">
                    <strong>{service.name}</strong>
                    {service.tag ? <span className="tag">{service.tag}</span> : null}
                    {service.isEmergency ? <span className="tag">Emergency</span> : null}
                    <span className={`tag${service.isActive ? '' : ' tag--clay'}`}>
                      {service.isActive ? 'On the website' : 'Hidden'}
                    </span>
                    <span className="small-note staff-card__stamp">order {service.sortOrder}</span>
                  </div>

                  <p className="staff-card__meta">
                    {service.bookingDepartment
                      ? `Books as “${service.bookingDepartment}”`
                      : 'Not bookable online'}
                    {service.departmentName ? ` · ${service.departmentName}` : ''}
                    {` · button: ${service.ctaLabel}`}
                  </p>

                  <p className="staff-card__reason">{service.summary}</p>

                  <div className="staff-card__actions staff-card__links">
                    <Link
                      className="btn btn--sm btn--outline"
                      href={`/inbox/services/${service.id}`}
                    >
                      Edit
                    </Link>
                    <form action={toggleService}>
                      <input type="hidden" name="id" value={service.id} />
                      <input type="hidden" name="active" value={service.isActive ? '0' : '1'} />
                      <button className="btn btn--sm" type="submit">
                        {service.isActive ? 'Hide from website' : 'Show on website'}
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ))}

          <p className="small-note staff-footnote">
            <Icon name="shield" /> Services are hidden, never deleted. If a service stops being
            offered, hide it so past appointments and the booking history keep their department name.
          </p>
        </div>
      </section>
    </div>
  );
}
