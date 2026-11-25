import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { getServiceCategories, getServices } from '@/lib/db';
import { ServiceDirectory } from './ServiceDirectory';

const TITLE = 'Services & Departments | Summit General Hospital, Lemi Kura';
const DESCRIPTION =
  'Explore 18 services at Summit General Hospital in Lemi Kura — emergency care, internal medicine, pediatrics, maternity, surgery, cardiology, diagnostics, pharmacy and physiotherapy.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/services' },
  openGraph: { url: '/services', title: TITLE, description: DESCRIPTION },
};

// Content comes from D1, so render per request rather than at build time.
export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([getServices(), getServiceCategories()]);

  return (
    <div className="page-services">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Services</span>
          </nav>
          <div className="page-hero__grid">
            <div>
              <p className="eyebrow">Services and departments</p>
              <h1 style={{ marginTop: 16 }}>Care for every need.</h1>
              <p className="page-hero__lede">
                {services.length} services, one connected team. Browse by department or filter to
                find what you need — and if you&apos;re unsure, call us. We&apos;ll point you in the
                right direction.
              </p>
            </div>
            <aside className="page-hero__aside">
              <p className="eyebrow">Emergency</p>
              <p>
                Open 24 hours. For chest pain, severe bleeding, breathing difficulty or a serious
                accident, come directly or call ahead.
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
          <div className="notice" style={{ marginBottom: 28 }}>
            <Icon name="cross" />
            <span>
              <strong>In an emergency, don&apos;t wait for an online reply.</strong> Call{' '}
              <a href="tel:+251111132702">+251 111 132 702</a> or come directly to our emergency
              entrance at Summit 72, Lemi Kura.
            </span>
          </div>

          <div className="services-intro">
            <div>
              <p className="eyebrow">Find a service</p>
              <p style={{ marginTop: 10 }}>Filter by type of care, or scroll the full directory below.</p>
            </div>
          </div>

          <ServiceDirectory services={services} categories={categories} />

          <div className="support-band">
            <div>
              <p className="eyebrow">One campus</p>
              <h2 style={{ marginTop: 12 }}>Fewer journeys. More answers.</h2>
              <p>
                Consultation, imaging, laboratory tests and pharmacy are steps apart — so your care
                moves quickly and your family spends less time travelling.
              </p>
            </div>
            <div className="support-band__items">
              <div className="support-band__item">
                <Icon name="scan" />
                <strong>On-site diagnostics</strong>
                <span>X-ray, ultrasound and laboratory services.</span>
              </div>
              <div className="support-band__item">
                <Icon name="pill" />
                <strong>Pharmacy</strong>
                <span>Medicines and advice before you leave.</span>
              </div>
              <div className="support-band__item">
                <Icon name="activity" />
                <strong>Rehabilitation</strong>
                <span>Physiotherapy for recovery and movement.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ambulance" id="ambulance">
        <div className="wrap">
          <div className="ambulance__grid">
            <div>
              <p className="eyebrow">Ambulance and emergency transport</p>
              <h2>
                Bringing a patient in? <em>Tell us three things.</em>
              </h2>
              <p className="ambulance__lede">
                Our ambulance runs around the clock. Calling ahead means the emergency team is ready
                when you arrive — and someone can talk you through what to do while you wait.
              </p>
              <div className="ambulance__actions">
                <a className="btn btn--light" href="tel:+251111132702">
                  Call +251 111 132 702
                  <Icon name="phone" />
                </a>
                <p className="ambulance__note">
                  One number for ambulance dispatch and emergency advice, day or night.
                </p>
              </div>
            </div>

            <ol className="ambulance__steps">
              <li className="ambulance__step">
                <Icon name="pin" />
                <div>
                  <strong>Where you are</strong>
                  <span>
                    Your location and the nearest landmark — a road name, building, church or school
                    we can find quickly.
                  </span>
                </div>
              </li>
              <li className="ambulance__step">
                <Icon name="users" />
                <div>
                  <strong>How many patients</strong>
                  <span>
                    How many people need help, and whether anyone is a child, pregnant or badly
                    injured.
                  </span>
                </div>
              </li>
              <li className="ambulance__step">
                <Icon name="shield" />
                <div>
                  <strong>How to reach you</strong>
                  <span>
                    Access notes: floor, gate, security, a narrow road or heavy traffic — and a
                    number we can call back.
                  </span>
                </div>
              </li>
            </ol>
          </div>

          <p className="ambulance__foot">
            <strong>Do not move someone who may have a spinal injury.</strong> Call first and stay
            with the patient. If their condition changes, call back — the line is answered day and
            night.
          </p>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-band__inner">
          <div>
            <p className="eyebrow">Not sure which service?</p>
            <h2>
              Talk to a <em>person</em>.
            </h2>
            <p>
              Call our front desk and describe what&apos;s going on. We&apos;ll help you choose the
              right department or see you urgently if needed.
            </p>
          </div>
          <div className="cta-band__actions">
            <Link className="btn btn--light" href="/appointment">
              Request an appointment
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
