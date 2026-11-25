import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { getDepartmentChips, getDoctors } from '@/lib/db';
import { DoctorDirectory } from './DoctorDirectory';

export const metadata: Metadata = {
  title: { absolute: 'Our Doctors | Summit General Hospital, Lemi Kura' },
  description:
    'Meet the consultant team at Summit General Hospital in Lemi Kura, Addis Ababa. Search by specialty, language or clinic day and request an appointment online.',
  alternates: { canonical: '/doctors' },
  openGraph: {
    url: '/doctors',
    title: 'Our Doctors | Summit General Hospital, Lemi Kura',
    description:
      'Meet the consultant team at Summit General Hospital in Lemi Kura, Addis Ababa. Search by specialty, language or clinic day and request an appointment online.',
  },
};

// Content comes from D1, so render per request rather than at build time.
export const dynamic = 'force-dynamic';

export default async function DoctorsPage() {
  const [doctors, departments] = await Promise.all([getDoctors(), getDepartmentChips()]);

  return (
    <div className="page-doctors">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Doctors</span>
          </nav>
          <div className="page-hero__grid">
            <div>
              <p className="eyebrow">Our consultants</p>
              <h1 style={{ marginTop: 16 }}>Find the right specialist.</h1>
              <p className="page-hero__lede">
                Search by name or specialty, or filter by the kind of care you need. Every
                consultation is with a qualified consultant — and a team that will explain the
                next step clearly.
              </p>
            </div>
            <aside className="page-hero__aside">
              <p className="eyebrow">Need help choosing?</p>
              <p>
                Not sure which specialty fits your concern? Call our front desk and we&apos;ll guide
                you to the right consultant.
              </p>
              <a href="tel:+251111132702">
                +251 111 132 702
                <Icon name="phone" />
              </a>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="doctors-note">
            <Icon name="calendar" />
            <span>
              Consultations are by appointment. Clinic days below are a guide — call us to confirm
              availability, or <Link href="/appointment">request an appointment online</Link> and we
              will call you back.
            </span>
          </div>

          <DoctorDirectory doctors={doctors} departments={departments} />

          <div className="recruit-band">
            <div>
              <h3>Are you a consultant considering Summit?</h3>
              <p>
                We are always interested in meeting doctors and nurses who share our approach to
                care.
              </p>
            </div>
            <Link className="btn btn--light" href="/contact">
              Write to our team
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-band__inner">
          <div>
            <p className="eyebrow">Ready to book?</p>
            <h2>Your <em>specialist</em> is closer than you think.</h2>
            <p>
              Choose a department and a preferred time. Our team will call you to confirm the
              appointment.
            </p>
          </div>
          <div className="cta-band__actions">
            <Link className="btn btn--light" href="/appointment">
              Book an appointment
              <Icon name="arrow" />
            </Link>
            <a className="btn btn--ghost-light" href="tel:+251111132702">
              Call +251 111 132 702
              <Icon name="phone" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
