import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { getBookingDepartments, getDoctors } from '@/lib/db';
import { AppointmentForm } from './AppointmentForm';

const TITLE = 'Book an Appointment | Summit General Hospital, Lemi Kura';
const DESCRIPTION =
  'Request an appointment at Summit General Hospital in Lemi Kura, Addis Ababa. Choose a department, preferred date and time. Our team will call you to confirm.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/appointment' },
  openGraph: { url: '/appointment', title: TITLE, description: DESCRIPTION },
};

// Options come from D1, so render per request rather than at build time.
export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ department?: string; doctor?: string }>;

export default async function AppointmentPage({ searchParams }: { searchParams: SearchParams }) {
  const { department, doctor } = await searchParams;
  const [departments, doctors] = await Promise.all([getBookingDepartments(), getDoctors()]);

  const initialDepartment =
    departments.find((option) => option.label === department)?.label ?? '';

  const doctorOptions = doctors.map((entry) => ({
    name: entry.name,
    department: entry.primary?.appointmentLabel ?? '',
    label: `${entry.name} — ${entry.primary?.label ?? entry.role}`,
  }));

  const initialDoctor = doctorOptions.some(
    (option) => option.name === doctor && option.department === initialDepartment
  )
    ? (doctor ?? '')
    : '';

  return (
    <div className="page-appointment">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Appointments</span>
          </nav>
          <div className="page-hero__grid">
            <div>
              <p className="eyebrow">Appointments</p>
              <h1 style={{ marginTop: 16 }}>Request an appointment.</h1>
              <p className="page-hero__lede">
                Tell us what you need and when suits you. Our team will call you to confirm the
                time and answer any questions before your visit.
              </p>
            </div>
            <aside className="page-hero__aside">
              <p className="eyebrow">Prefer to talk?</p>
              <p>Call our front desk — we can often find a time while you&apos;re on the phone.</p>
              <a href="tel:+251111132702">
                +251 111 132 702
                <Icon name="phone" />
              </a>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap booking">
          <AppointmentForm
            departments={departments}
            doctors={doctorOptions}
            initialDepartment={initialDepartment}
            initialDoctor={initialDoctor}
          />

          <aside className="booking-aside" aria-label="Appointment information">
            <div className="aside-card aside-card--emergency">
              <Icon name="cross" />
              <h3>Is this an emergency?</h3>
              <p>
                Don&apos;t use this form. Call our emergency line or come directly to the emergency
                entrance at Summit 72.
              </p>
              <p style={{ marginTop: 12 }}>
                <a href="tel:+251111132702">+251 111 132 702</a>
              </p>
            </div>

            <div className="aside-card">
              <Icon name="phone" />
              <h3>Prefer to call?</h3>
              <p>
                Our front desk can book, reschedule or answer questions about your visit.
              </p>
              <p>
                <a href="tel:+251111132702">+251 111 132 702</a>
              </p>
              <p style={{ fontSize: '0.68rem', marginTop: 4 }}>
                Mon–Sat, 8:00 AM – 6:00 PM
                <br />
                Emergency line open 24/7
              </p>
            </div>

            <div className="aside-card">
              <Icon name="file" />
              <h3>What to bring</h3>
              <ul className="aside-list">
                <li>
                  <Icon name="check" /> Your ID or passport
                </li>
                <li>
                  <Icon name="check" /> Insurance card, if you have one
                </li>
                <li>
                  <Icon name="check" /> Any referral letter or previous results
                </li>
                <li>
                  <Icon name="check" /> A list of medicines you take
                </li>
              </ul>
            </div>

            <div className="aside-card">
              <Icon name="card" />
              <h3>Insurance and billing</h3>
              <p>
                We work with major Ethiopian insurers and offer direct billing where your plan
                allows. Bring your card and we&apos;ll check before your consultation.
              </p>
              <p style={{ marginTop: 9 }}>
                <Link href="/visit#insurance">Read about insurance</Link>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
