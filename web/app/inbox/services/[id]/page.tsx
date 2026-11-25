import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StaffNav } from '@/components/StaffNav';
import { countNewMessages, requireStaff } from '@/lib/inbox';
import { countByStatus } from '@/lib/appointment-queue';
import {
  getServiceForStaff,
  listDepartments,
  listServiceCategoryOptions,
} from '@/lib/content';
import { ServiceForm } from '../ServiceForm';

export const metadata: Metadata = {
  title: 'Edit service',
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ error?: string; saved?: string }>;

/** `/inbox/services/new` and `/inbox/services/12` share this screen. */
export default async function ServiceEditorPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireStaff();

  const { id } = await params;
  const { error, saved } = await searchParams;

  const isNew = id === 'new';
  const numeric = Number(id);
  if (!isNew && (!Number.isInteger(numeric) || numeric <= 0)) notFound();

  const [service, categories, departments, counts, newMessages] = await Promise.all([
    isNew ? Promise.resolve(null) : getServiceForStaff(numeric),
    listServiceCategoryOptions(),
    listDepartments(),
    countByStatus(),
    countNewMessages(),
  ]);

  if (!isNew && !service) notFound();

  return (
    <div className="page-inbox">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/inbox">Staff inbox</Link>
            <span aria-hidden="true">/</span>
            <Link href="/inbox/services">Services</Link>
            <span aria-hidden="true">/</span>
            <span>{service ? 'Edit' : 'Add'}</span>
          </nav>
          <div className="staff-head">
            <div>
              <p className="eyebrow">Staff</p>
              <h1 className="staff-title">{service ? service.name : 'Add a service.'}</h1>
              <p className="page-hero__lede">
                {service
                  ? 'Changes appear on /services and on the booking form on their next load.'
                  : 'New services are visible as soon as you save. The web address is built from the name.'}
              </p>
            </div>
            <Link className="btn btn--sm" href="/inbox/services">
              Back to list
            </Link>
          </div>
        </div>
      </section>

      <StaffNav active="services" newMessages={newMessages} newAppointments={counts.new} />

      <section className="section">
        <div className="wrap staff-wrap staff-wrap--wide">
          <ServiceForm
            service={service}
            categories={categories}
            departments={departments}
            error={error}
            saved={saved === '1'}
          />
        </div>
      </section>
    </div>
  );
}
