import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { ContactForm } from './ContactForm';

const TITLE = 'Contact Summit General Hospital | Lemi Kura, Addis Ababa';
const DESCRIPTION =
  'Contact Summit General Hospital at Summit 72, Lemi Kura, Addis Ababa. Call +251 111 132 702, email info@summitgh.com.et or send a message to our team.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/contact' },
  openGraph: { url: '/contact', title: TITLE, description: DESCRIPTION },
};

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Summit+General+Hospital%2C+Addis+Ababa%2C+Ethiopia';

export default function ContactPage() {
  return (
    <div className="page-contact">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Contact</span>
          </nav>
          <div className="page-hero__grid">
            <div>
              <p className="eyebrow">Contact us</p>
              <h1 style={{ marginTop: 16 }}>We&apos;re here to help.</h1>
              <p className="page-hero__lede">
                Call us, write to us, or come to the front desk at Summit 72. For appointments,
                directions, insurance or medical records, our team will point you to the right
                person.
              </p>
            </div>
            <aside className="page-hero__aside">
              <p className="eyebrow">Emergency · 24/7</p>
              <p>
                For chest pain, difficulty breathing, severe bleeding or a serious accident, call
                ahead or come directly to our emergency entrance.
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
          <div className="contact-cards">
            <div className="contact-card contact-card--dark">
              <Icon name="phone" />
              <h3>Call us</h3>
              <p>
                Front desk: Monday–Saturday, 8:00 AM – 6:00 PM.
                <br />
                Emergency line: 24 hours.
              </p>
              <a href="tel:+251111132702">+251 111 132 702</a>
            </div>
            <div className="contact-card">
              <Icon name="pin" />
              <h3>Visit us</h3>
              <p>
                Summit 72, Lemi Kura
                <br />
                Addis Ababa, Ethiopia
              </p>
              <a href={MAPS_URL} target="_blank" rel="noopener">
                Open in Google Maps
              </a>
            </div>
            <div className="contact-card">
              <Icon name="mail" />
              <h3>Email us</h3>
              <p>General enquiries, appointments, insurance and medical records.</p>
              <a href="mailto:info@summitgh.com.et">info@summitgh.com.et</a>
            </div>
          </div>

          <div className="contact-map">
            <img
              className="contact-map__img"
              src="/assets/img/map-summit.jpg"
              alt="Map view of Summit General Hospital on Summit 72 Street, Lemi Kura, Addis Ababa, with the hospital marked."
              width={1200}
              height={750}
              loading="lazy"
              decoding="async"
            />
            <a className="map-card__open" href={MAPS_URL} target="_blank" rel="noopener">
              Open in Google Maps
              <Icon name="arrow-up-right" />
            </a>
            <div className="contact-map__label">
              <Icon name="pin" />
              <span>
                <strong>Summit General Hospital</strong>
                <span>Summit 72, Lemi Kura, Addis Ababa</span>
              </span>
            </div>
            <a className="map-card__attrib" href={MAPS_URL} target="_blank" rel="noopener">
              Map data © Google
            </a>
          </div>

          <div className="contact-main">
            <div className="contact-form-card">
              <h2>Send a message.</h2>
              <p>
                Please do not use this form for urgent medical concerns. Call us or come directly to
                the emergency department.
              </p>

              <ContactForm />

              <p className="small-note" style={{ marginTop: 12 }}>
                We reply during office hours. For an urgent medical concern, call{' '}
                <a href="tel:+251111132702" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                  +251 111 132 702
                </a>
                .
              </p>
            </div>

            <div className="contact-info">
              <div className="contact-info__block">
                <h3>Front desk</h3>
                <p>
                  Our team can help with appointments, directions, billing questions and finding the
                  right department.
                </p>
                <div className="contact-info__rows">
                  <div>
                    <Icon name="phone" /> <a href="tel:+251111132702">+251 111 132 702</a>
                  </div>
                  <div>
                    <Icon name="mail" />{' '}
                    <a href="mailto:info@summitgh.com.et">info@summitgh.com.et</a>
                  </div>
                  <div>
                    <Icon name="clock" /> Mon–Sat, 8:00 AM – 6:00 PM
                  </div>
                </div>
              </div>

              <div className="contact-info__block">
                <h3>Medical records</h3>
                <p>
                  To request a copy of your records or results, contact us with your full name, date
                  of birth and the approximate date of your visit. We may ask for identification
                  before releasing records.
                </p>
                <div className="contact-info__rows">
                  <div>
                    <Icon name="mail" />{' '}
                    <a href="mailto:info@summitgh.com.et?subject=Medical%20records%20request">
                      info@summitgh.com.et
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-info__block">
                <h3>Feedback and complaints</h3>
                <p>
                  Tell us what worked and what didn&apos;t. Compliments and complaints are reviewed
                  by our leadership team, and raising a concern will never affect your care.
                </p>
                <div className="contact-info__rows">
                  <div>
                    <Icon name="quote" /> Choose &ldquo;Feedback or complaint&rdquo; in the form
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-band__inner">
          <div>
            <p className="eyebrow">In an emergency</p>
            <h2>
              Don&apos;t wait. <em>Call us.</em>
            </h2>
            <p>
              Our emergency team is available 24 hours a day, every day. Call ahead so we can prepare
              for your arrival.
            </p>
          </div>
          <div className="cta-band__actions">
            <a className="btn btn--light" href="tel:+251111132702">
              Call +251 111 132 702
              <Icon name="phone" />
            </a>
            <Link className="btn btn--ghost-light" href="/appointment">
              Book a non-urgent visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
