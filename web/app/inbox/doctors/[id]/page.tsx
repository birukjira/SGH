import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StaffNav } from '@/components/StaffNav';
import { countNewMessages, requireStaff } from '@/lib/inbox';
import { countByStatus } from '@/lib/appointment-queue';
import { getDoctorForStaff, listDepartments } from '@/lib/content';
import { DoctorForm } from '../DoctorForm';

export const metadata: Metadata = {
  title: 'Edit doctor',
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ error?: string; saved?: string }>;

/** `/inbox/doctors/new` and `/inbox/doctors/12` share this screen. */
export default async function DoctorEditorPage({
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

  const [doctor, departments, counts, newMessages] = await Promise.all([
    isNew ? Promise.resolve(null) : getDoctorForStaff(numeric),
    listDepartments(),
    countByStatus(),
    countNewMessages(),
  ]);

  if (!isNew && !doctor) notFound();

  return (
    <div className="page-inbox">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/inbox">Staff inbox</Link>
            <span aria-hidden="true">/</span>
            <Link href="/inbox/doctors">Doctors</Link>
            <span aria-hidden="true">/</span>
            <span>{doctor ? 'Edit' : 'Add'}</span>
          </nav>
          <div className="staff-head">
            <div>
              <p className="eyebrow">Staff</p>
              <h1 className="staff-title">{doctor ? doctor.name : 'Add a doctor.'}</h1>
              <p className="page-hero__lede">
                {doctor
                  ? 'Changes appear on the public directory on its next load.'
                  : 'New consultants are visible as soon as you save. The web address is built from the name.'}
              </p>
            </div>
            <Link className="btn btn--sm" href="/inbox/doctors">
              Back to list
            </Link>
          </div>
        </div>
      </section>

      <StaffNav active="doctors" newMessages={newMessages} newAppointments={counts.new} />

      <section className="section">
        <div className="wrap staff-wrap staff-wrap--wide">
          <DoctorForm
            doctor={doctor}
            departments={departments}
            error={error}
            saved={saved === '1'}
          />
        </div>
      </section>
    </div>
  );
}
