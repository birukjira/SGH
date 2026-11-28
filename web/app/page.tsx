import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroCarousel } from '@/components/HeroCarousel';
import { Icon } from '@/components/Icon';
import { getDoctors, getTestimonials } from '@/lib/db';

const TITLE = 'Summit General Hospital | Compassionate care in Lemi Kura, Addis Ababa';
const DESCRIPTION =
  'Summit General Hospital at Summit 72, Lemi Kura, offers 24/7 emergency care, consultant-led clinics, surgery, maternity, diagnostics and pharmacy. Book an appointment.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { url: '/', title: TITLE, description: DESCRIPTION },
};

// Content comes from D1, so render per request rather than at build time.
export const dynamic = 'force-dynamic';

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Summit+General+Hospital%2C+Addis+Ababa%2C+Ethiopia';

const DEPARTMENTS = [
  ['emergency', 'Emergency and Critical Care', 'Immediate assessment and stabilisation, 24 hours a day.'],
  ['internal-medicine', 'Internal Medicine', 'Adult health, chronic conditions and preventive care.'],
  ['pediatrics', 'Pediatrics and Child Health', 'Gentle, family-centred care for infants, children and teens.'],
  ['obgyn', 'Obstetrics and Gynecology', "Pregnancy, birth and women's health at every stage."],
  ['surgery', 'General and Laparoscopic Surgery', 'Elective and emergency procedures in modern theatres.'],
  ['orthopedics', 'Orthopedics and Trauma', 'Bones, joints and recovery after injury.'],
  ['cardiology', 'Cardiology', 'Heart assessment, risk management and follow-up.'],
  ['radiology', 'Radiology and Imaging', 'X-ray, ultrasound and diagnostic imaging on site.'],
];

export default async function HomePage() {
  const [doctors, testimonials] = await Promise.all([getDoctors(), getTestimonials(3)]);

  return (
    <div className="page-home">
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__content">
            <p className="hero__tagline">“Your Health Our Priority!”</p>
            <p className="eyebrow hero__eyebrow">Summit 72 · Lemi Kura, Addis Ababa</p>
            <h1>
              Good health has a <em>home</em> in Addis.
            </h1>
            <p className="hero__lede">
              Compassionate, consultant-led care for every stage of life — from everyday check-ups
              to emergencies, all under one roof in Lemi Kura.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary" href="/appointment">
                Book an appointment
                <Icon name="arrow" />
              </Link>
              <Link className="btn btn--outline" href="/services">
                Explore our services
              </Link>
            </div>
            <div className="hero__trust">
              <span className="trust-item">
                <Icon name="cross" />
                24/7 emergency care
              </span>
              <span className="trust-item">
                <Icon name="stethoscope" />
                4 specialist departments
              </span>
              <span className="trust-item">
                <Icon name="calendar" />
                Consultant-led outpatient clinics
              </span>
            </div>
          </div>

          <HeroCarousel />
        </div>
      </section>

      <section className="quick" aria-label="Quick access">
        <div className="wrap">
          <div className="quick__grid">
            <a className="quick-card quick-card--emergency" href="tel:+251111132702">
              <span className="quick-card__num" aria-hidden="true">
                01
              </span>
              <span className="quick-card__icon" aria-hidden="true">
                <Icon name="cross" />
              </span>
              <h3>Emergency and ambulance</h3>
              <p>Walk in any time, or call ahead so our team can prepare for your arrival.</p>
              <span className="quick-card__go">
                Call +251 111 132 702
                <Icon name="phone" />
              </span>
            </a>

            <Link className="quick-card" href="/appointment">
              <span className="quick-card__num" aria-hidden="true">
                02
              </span>
              <span className="quick-card__icon" aria-hidden="true">
                <Icon name="calendar" />
              </span>
              <h3>Book an appointment</h3>
              <p>Choose a department, tell us when suits you, and we&apos;ll call to confirm.</p>
              <span className="quick-card__go">
                Start a request
                <Icon name="arrow" />
              </span>
            </Link>

            <Link className="quick-card" href="/doctors">
              <span className="quick-card__num" aria-hidden="true">
                03
              </span>
              <span className="quick-card__icon" aria-hidden="true">
                <Icon name="stethoscope" />
              </span>
              <h3>Find a doctor</h3>
              <p>Browse consultants by specialty, language and clinic day.</p>
              <span className="quick-card__go">
                Open the directory
                <Icon name="arrow" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="split">
            <div className="split__media">
              <div className="media-stack">
                <div className="media-stack__main">
                  <img
                    src="/assets/img/portrait.webp"
                    alt="A smiling physiotherapist wearing blue scrubs and a stethoscope."
                    width={900}
                    height={1125}
                  />
                </div>
                <div className="media-stack__small">
                  <img
                    src="/assets/img/hands.webp"
                    alt="A clinician holds a patient's hand during a consultation."
                    width={1200}
                    height={800}
                  />
                </div>
                <div className="media-stack__tag">
                  <span>One campus</span>
                  Every stage of care, close to home.
                </div>
              </div>
            </div>

            <div className="split__body">
              <p className="eyebrow">Welcome to Summit</p>
              <h2>A general hospital, built around the person.</h2>
              <p className="lede">
                At Summit General Hospital, good care starts with listening. Our consultants,
                nurses and support teams work together under one roof — so your questions are
                answered, your options are clear, and your family stays close.
              </p>
              <p>
                From our emergency department to outpatient clinics, diagnostics and operating
                theatres, we bring dependable care to the Summit 72 community and beyond.
              </p>
              <ul className="ticks">
                <li>
                  <Icon name="check" />
                  Consultant-led care across four departments
                </li>
                <li>
                  <Icon name="check" />
                  Laboratory, imaging and pharmacy on site
                </li>
                <li>
                  <Icon name="check" />
                  One campus for clinics, diagnostics and surgery
                </li>
              </ul>
              <div className="split__actions">
                <Link className="btn btn--outline" href="/about">
                  More about Summit
                  <Icon name="arrow" />
                </Link>
                <Link className="link-arrow" href="/doctors">
                  Meet our consultants
                  <Icon name="arrow-up-right" />
                </Link>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <strong>24/7</strong>
              <span>Emergency &amp; inpatient care</span>
            </div>
            <div className="stat">
              <strong>4</strong>
              <span>Specialist departments</span>
            </div>
            <div className="stat">
              <strong>18</strong>
              <span>Services on one campus</span>
            </div>
            <div className="stat">
              <strong>1</strong>
              <span>Connected campus in Lemi Kura</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Centres and departments</p>
              <h2>Care for every chapter.</h2>
            </div>
            <div>
              <p className="lede">
                From a child&apos;s first check-up to specialist surgery, our departments work as
                one team — with diagnostics, pharmacy and follow-up close by.
              </p>
              <p style={{ marginTop: 18 }}>
                <Link className="link-arrow" href="/services">
                  View all 18 services
                  <Icon name="arrow" />
                </Link>
              </p>
            </div>
          </div>

          <div className="dept-grid">
            {DEPARTMENTS.map(([slug, name, copy], index) => (
              <Link className="dept" href={`/services#${slug}`} key={slug}>
                <span className="dept__num">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{name}</h3>
                  <p>{copy}</p>
                </div>
                <span className="dept__arrow" aria-hidden="true">
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark paths">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Not sure where to start?</p>
              <h2>The right care, at the right time.</h2>
            </div>
            <div>
              <p className="lede">
                Use this quick guide — and if you are ever unsure, call us. A person, not a menu,
                will answer.
              </p>
            </div>
          </div>

          <div className="path-grid">
            <div className="path path--emergency">
              <div className="path__top">
                <span className="path__icon" aria-hidden="true">
                  <Icon name="cross" />
                </span>
                <span className="path__label">If it can&apos;t wait</span>
              </div>
              <h3>Come in now.</h3>
              <p>
                Chest pain, difficulty breathing, severe bleeding, sudden weakness, a serious
                accident, or a very sick child.
              </p>
              <a className="link-arrow" href="tel:+251111132702">
                Call the emergency line
                <Icon name="phone" />
              </a>
            </div>

            <div className="path">
              <div className="path__top">
                <span className="path__icon" aria-hidden="true">
                  <Icon name="clock" />
                </span>
                <span className="path__label">If you&apos;re worried today</span>
              </div>
              <h3>Call us first.</h3>
              <p>
                A fever that won&apos;t settle, a minor injury, ongoing pain or a sick child — we
                will help you decide what to do next.
              </p>
              <a className="link-arrow" href="tel:+251111132702">
                Speak to our team
                <Icon name="phone" />
              </a>
            </div>

            <div className="path">
              <div className="path__top">
                <span className="path__icon" aria-hidden="true">
                  <Icon name="calendar" />
                </span>
                <span className="path__label">If it can wait</span>
              </div>
              <h3>Book a visit.</h3>
              <p>
                A check-up, a specialist opinion, a follow-up or a planned procedure. Choose a
                department and request a time.
              </p>
              <Link className="link-arrow" href="/appointment">
                Request an appointment
                <Icon name="arrow" />
              </Link>
            </div>
          </div>

          <div className="paths__foot">
            <span>
              In an emergency, please do not use the online form. Call us or come directly to the
              emergency entrance.
            </span>
            <a href="tel:+251111132702">+251 111 132 702</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap promise">
          <div className="promise__media">
            <img
              src="/assets/img/surgeons.webp"
              alt="A surgical team at work in an operating theatre."
              width={900}
              height={1125}
            />
            <div className="promise__badge">
              <strong>24/7</strong>
              <span>Emergency &amp; inpatient care</span>
            </div>
          </div>

          <div>
            <p className="eyebrow">Why Summit</p>
            <h2 style={{ marginTop: 16, maxWidth: '14ch' }}>
              Care that treats you like a person, not a case.
            </h2>
            <div className="promise__list">
              <div className="promise__item">
                <span className="promise__num">01</span>
                <div>
                  <h3>We listen first.</h3>
                  <p>
                    Your story matters. Appointments start with time to talk, not a form to rush
                    through.
                  </p>
                </div>
              </div>
              <div className="promise__item">
                <span className="promise__num">02</span>
                <div>
                  <h3>We explain clearly.</h3>
                  <p>
                    Diagnosis and options in plain language — in the language you are most
                    comfortable speaking.
                  </p>
                </div>
              </div>
              <div className="promise__item">
                <span className="promise__num">03</span>
                <div>
                  <h3>We stay close.</h3>
                  <p>One team, one plan, from your first visit through treatment and follow-up.</p>
                </div>
              </div>
              <div className="promise__item">
                <span className="promise__num">04</span>
                <div>
                  <h3>We keep you safe.</h3>
                  <p>Clean, careful, evidence-based practice — every patient, every time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Our people</p>
              <h2>Specialists who know your name.</h2>
            </div>
            <div>
              <p className="lede">
                Our consultants are supported by nurses, pharmacists, radiographers,
                physiotherapists and laboratory scientists who work as one team.
              </p>
              <p style={{ marginTop: 18 }}>
                <Link className="link-arrow" href="/doctors">
                  View all consultants
                  <Icon name="arrow" />
                </Link>
              </p>
            </div>
          </div>

          <div className="doctor-grid">
            {doctors.slice(0, 3).map((doctor) => (
              <article className="doctor-card" key={doctor.slug}>
                <div className="doctor-card__top">
                  <span className="avatar avatar--photo" aria-hidden="true">
                    {doctor.photoPath ? (
                      <img
                        src={doctor.photoPath}
                        alt=""
                        width={72}
                        height={72}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      doctor.name.replace(/^Dr\.?\s*/, '').slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <div>
                    <h3>{doctor.name}</h3>
                    <p className="doctor-card__role">{doctor.role}</p>
                  </div>
                </div>
                <p className="doctor-card__focus">{doctor.focus}</p>
                <div className="doctor-card__meta">
                  <div>
                    <Icon name="calendar" />
                    {doctor.clinicNote}
                  </div>
                </div>
                <div className="doctor-card__actions">
                  <Link
                    className="link-arrow"
                    href={`/appointment?department=${encodeURIComponent(
                      doctor.primary?.appointmentLabel ?? ''
                    )}&doctor=${encodeURIComponent(doctor.name)}`}
                  >
                    Book a visit
                    <Icon name="arrow" />
                  </Link>
                  <span className="doctor-card__langs">{doctor.primary?.label ?? ''}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Patient stories</p>
              <h2>Shared only with consent.</h2>
            </div>
            <div>
              <p className="lede">
                We publish a patient&apos;s words only when the patient, or their family, has
                agreed in writing. Nothing is quoted here until then.
              </p>
            </div>
          </div>

          {testimonials.length > 0 ? (
            <div className="story-grid">
              {testimonials.map((story) => (
                <figure className="story" key={story.name}>
                  <span className="story__mark" aria-hidden="true">
                    <Icon name="quote" />
                  </span>
                  <blockquote>“{story.quote}”</blockquote>
                  <figcaption>
                    <span className="story__avatar" aria-hidden="true">
                      {story.initials}
                    </span>
                    <span className="story__who">
                      <strong>{story.name}</strong>
                      <span>{story.meta}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="lede" style={{ maxWidth: '62ch' }}>
              If you would like to share your experience of care here,{' '}
              <Link href="/contact">send us a message</Link>. We will ask for your written
              consent before anything is published.
            </p>
          )}
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap visit-home">
          <div className="map-card">
            <img
              className="map-card__img"
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
            <div className="map-card__label">
              <Icon name="pin" />
              <span>
                <small>Find us</small>
                <strong>Summit 72, Lemi Kura, Addis Ababa</strong>
              </span>
            </div>
            <a className="map-card__attrib" href={MAPS_URL} target="_blank" rel="noopener">
              Map data © Google
            </a>
          </div>

          <div className="visit-home__body">
            <p className="eyebrow">Find us</p>
            <h2>Easy to reach, in the heart of Lemi Kura.</h2>
            <p>
              We&apos;re at Summit 72 in Lemi Kura — close to home for families across Lemi Kura,
              CMC, Kazanchis and beyond. Emergency care is open around the clock.
            </p>
            <ul className="visit-facts">
              <li>
                <Icon name="pin" />
                <span>
                  <strong>Address</strong>
                  <span>Summit 72, Lemi Kura, Addis Ababa, Ethiopia</span>
                </span>
              </li>
              <li>
                <Icon name="phone" />
                <span>
                  <strong>Phone</strong>
                  <span>
                    <a href="tel:+251111132702">+251 111 132 702</a>
                  </span>
                </span>
              </li>
              <li>
                <Icon name="clock" />
                <span>
                  <strong>Hours</strong>
                  <span>Emergency 24/7 · Outpatient hours: call to confirm</span>
                </span>
              </li>
              <li>
                <Icon name="mail" />
                <span>
                  <strong>Email</strong>
                  <span>
                    <a href="mailto:info@summitgh.com.et">info@summitgh.com.et</a>
                  </span>
                </span>
              </li>
            </ul>
            <div className="visit-home__actions">
              <a className="btn btn--primary" href={MAPS_URL} target="_blank" rel="noopener">
                Get directions
                <Icon name="arrow-up-right" />
              </a>
              <Link className="btn btn--outline" href="/visit">
                Plan your visit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-band__inner">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2>
              Care, when you <em>need</em> it.
            </h2>
            <p>Book a consultation, call our team, or simply come in. We&apos;re here — day and night.</p>
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
