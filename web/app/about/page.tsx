import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

const TITLE = 'About Summit General Hospital | Care with a human scale';
const DESCRIPTION =
  'Learn about Summit General Hospital in Lemi Kura, Addis Ababa — our story, mission, values and commitment to careful, compassionate, consultant-led care.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: { url: '/about', title: TITLE, description: DESCRIPTION },
};

const VALUES = [
  ['01', 'Dignity', 'Every patient is treated with respect, privacy and patience — regardless of who they are.'],
  ['02', 'Clarity', 'We explain what we know, what we are still learning, and what happens next.'],
  ['03', 'Safety', 'We follow evidence-based protocols and speak up when something isn’t right.'],
  ['04', 'Community', 'We care for the neighbourhood we are part of, not just the patients we see.'],
];

const GALLERY = [
  ['/assets/img/reception.webp', 'A bright hospital reception and waiting area.', 'Reception & waiting'],
  ['/assets/img/theatre.webp', 'An operating theatre prepared for surgery.', 'Operating theatres'],
  ['/assets/img/lab.webp', 'A hospital laboratory with diagnostic equipment.', 'Laboratory services'],
  ['/assets/img/room.webp', 'A clean, private inpatient room.', 'Inpatient rooms'],
];

const QUALITY = [
  ['shield', 'Infection prevention', 'Hand hygiene, sterilisation and isolation practices are audited and reviewed — not assumed.'],
  ['pill', 'Medication safety', 'Our pharmacists review prescriptions and take time to explain how medicines should be taken.'],
  ['users', 'Clinical governance', 'Consultant-led reviews, incident reporting and continuous learning keep our standards moving forward.'],
  ['quote', 'Patient feedback', 'Complaints and compliments are read by our leadership team and used to improve the experience.'],
];

export default function AboutPage() {
  return (
    <div className="page-about">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>About</span>
          </nav>
          <div className="page-hero__grid">
            <div>
              <p className="eyebrow">About Summit</p>
              <h1 style={{ marginTop: 16 }}>Care with a human scale.</h1>
              <p className="page-hero__lede">
                A general hospital in Lemi Kura, built on a simple belief: excellent medicine
                should feel personal. We bring consultant-led care, modern diagnostics and a warm
                welcome together under one roof.
              </p>
            </div>
            <aside className="page-hero__aside">
              <p className="eyebrow">At a glance</p>
              <p>
                Summit 72, Lemi Kura · 24/7 emergency care · 4 specialist departments · 18
                services on one campus.
              </p>
              <Link href="/contact">
                Find us
                <Icon name="arrow-up-right" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="about-media">
          <img
            src="/assets/img/consult.webp"
            alt="A consultant reviewing scan results with a colleague."
            width={1400}
            height={933}
          />
          <span className="about-media__caption">
            Consultant-led care · One campus in Lemi Kura
          </span>
        </div>
      </div>

      <section className="section">
        <div className="wrap about-story">
          <div>
            <p className="eyebrow">Our story</p>
            <h2 style={{ marginTop: 16 }}>Built for the way families in Lemi Kura live.</h2>
          </div>
          <div className="about-story__body">
            <p className="lede">
              Summit General Hospital was built to bring dependable, multi-specialty care closer to
              the families of Lemi Kura. Our campus at Summit 72 brings outpatient clinics,
              emergency care, maternity, surgery and diagnostics together — so patients don&apos;t
              have to travel across the city for coordinated care.
            </p>
            <p>
              Two ideas shape how we work. Medicine is a conversation: we explain what we know, what
              we don&apos;t, and what comes next. And care is a team effort: our consultants,
              nurses, pharmacists and technicians share one plan for you.
            </p>
            <p>
              Today we serve the neighbourhoods around Summit, Lemi Kura and CMC — people of every
              age, background and language. Our promise is simple: careful medicine, clearly
              explained, close to home.
            </p>
            <div className="split__actions">
              <Link className="btn btn--outline" href="/doctors">
                Meet our consultants
                <Icon name="arrow" />
              </Link>
              <Link className="link-arrow" href="/services">
                Explore our services
                <Icon name="arrow-up-right" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">What drives us</p>
              <h2>Our mission, vision and values.</h2>
            </div>
            <div>
              <p className="lede">
                Good healthcare is more than equipment and expertise. It is how people are made to
                feel from the moment they walk through the door.
              </p>
            </div>
          </div>

          <div className="mv-grid">
            <div className="mv-card mv-card--dark">
              <Icon name="heart" />
              <h3>Our mission</h3>
              <p>
                To make dependable, compassionate healthcare accessible to our community — with
                clear explanations and respectful care at every step.
              </p>
            </div>
            <div className="mv-card">
              <Icon name="eye" />
              <h3>Our vision</h3>
              <p>
                To be Addis Ababa&apos;s most trusted general hospital — known for careful
                medicine, human kindness and a welcome that feels like home.
              </p>
            </div>
          </div>

          <div className="values-grid">
            {VALUES.map(([num, title, copy]) => (
              <div className="value-card" key={num}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Inside Summit</p>
              <h2>Designed for calm, built for care.</h2>
            </div>
            <div>
              <p className="lede">
                From the reception desk to the operating theatre, our spaces are organised around
                the patient journey — not the other way around.
              </p>
            </div>
          </div>

          <div className="gallery-grid">
            {GALLERY.map(([src, alt, label]) => (
              <figure className="gallery-item" key={src}>
                <img src={src} alt={alt} width={1200} height={900} />
                <figcaption className="gallery-item__label">{label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap quality">
          <div>
            <p className="eyebrow">Quality and safety</p>
            <h2 style={{ marginTop: 16 }}>Careful medicine is a habit, not a promise.</h2>
          </div>
          <div className="quality__list">
            {QUALITY.map(([icon, title, copy]) => (
              <div className="quality__item" key={title}>
                <Icon name={icon} />
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="community-band">
            <div>
              <p className="eyebrow">Part of the neighbourhood</p>
              <h2 style={{ marginTop: 14 }}>
                A hospital in the community, not apart from it.
              </h2>
              <p>
                We are proud to be part of Lemi Kura — supporting families, local employers and
                community health initiatives around Summit 72. When our neighbours are well, the
                whole city works better.
              </p>
            </div>
            <div className="community-band__facts">
              <div className="community-band__fact">
                <strong>Lemi Kura</strong>
                <span>Summit 72</span>
              </div>
              <div className="community-band__fact">
                <strong>24/7</strong>
                <span>Emergency care</span>
              </div>
              <div className="community-band__fact">
                <strong>4</strong>
                <span>Specialist departments</span>
              </div>
              <div className="community-band__fact">
                <strong>18</strong>
                <span>Services and departments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-band__inner">
          <div>
            <p className="eyebrow">Come and see us</p>
            <h2>
              Care that starts with <em>hello</em>.
            </h2>
            <p>
              Book a consultation or stop by the front desk. Our team will help you find the right
              next step.
            </p>
          </div>
          <div className="cta-band__actions">
            <Link className="btn btn--light" href="/appointment">
              Book an appointment
              <Icon name="arrow" />
            </Link>
            <Link className="btn btn--ghost-light" href="/contact">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
