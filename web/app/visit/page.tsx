import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

const TITLE = 'Your Visit | Summit General Hospital, Lemi Kura';
const DESCRIPTION =
  'Plan your visit to Summit General Hospital in Lemi Kura — what to bring, admission steps, visiting hours, insurance, patient rights and answers to common questions.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/visit' },
  openGraph: { url: '/visit', title: TITLE, description: DESCRIPTION },
};

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Summit+General+Hospital%2C+Addis+Ababa%2C+Ethiopia';

const BRING = [
  'Your ID or passport',
  'Insurance card, if you have one',
  'Referral letter or previous test results',
  'A list of medicines you take, including doses',
  'Comfortable clothing and a phone charger for admissions',
  'The name and number of your next of kin',
];

const RIGHTS = [
  'To be treated with dignity, privacy and respect.',
  'To clear information about your diagnosis, tests and treatment.',
  'To give or refuse consent before treatment.',
  'To ask for a second opinion.',
  'To confidential care and secure medical records.',
  'To complain or give feedback without it affecting your care.',
];

const RESPONSIBILITIES = [
  'Share accurate information about your health and medicines.',
  'Treat staff, patients and visitors with respect.',
  'Follow the care plan you and your clinician agree.',
  'Keep valuables safe — the hospital cannot guarantee personal belongings.',
  'Tell a nurse promptly if your condition changes.',
  'Respect visiting hours, quiet spaces and infection-control guidance.',
];

const FAQ = [
  [
    'How do I book an appointment?',
    'You can request an appointment online or call +251 111 132 702. Online requests are confirmed by phone — they are not confirmed automatically.',
  ],
  [
    'Do I need a referral?',
    'Many consultations can be booked directly. Some diagnostic tests or specialist services may ask for a referral from your doctor. Bring any referral letter you have, and call us if you’re unsure.',
  ],
  [
    'What insurance do you accept?',
    'We work with major Ethiopian insurers and offer direct billing where your plan allows. Cover varies by plan and procedure. Bring your insurance card and we will check your cover before your consultation. If you are paying yourself, ask for an estimate before non-emergency treatment.',
  ],
  [
    'Can I choose my doctor?',
    'Yes, where the consultant’s clinic schedule allows. Choose a preferred consultant in the appointment form, or ask our front desk. If your preferred doctor is unavailable, we will offer the next available consultant in the same specialty.',
  ],
  [
    'What should I bring for admission?',
    'Bring your ID, insurance card, referral letter and results, a list of your medicines, comfortable clothing and a phone charger. Leave valuables at home where possible.',
  ],
  [
    'How do I get my test results?',
    'Your clinician will explain how and when results will be shared. Some results are available the same day; others take longer. Please ask at the laboratory or your consultant’s office if you are unsure.',
  ],
  [
    'Can I visit outside visiting hours?',
    'Visiting outside the published hours is sometimes possible for compassionate reasons. Please speak to the ward nurse in advance. Intensive care and maternity have their own arrangements.',
  ],
  [
    'How do I give feedback or complain?',
    'Tell any member of staff, ask for the ward or department manager, or send us a message. Complaints are reviewed by our leadership team and do not affect your care.',
  ],
];

const HOURS = [
  ['General wards', 'Daily, 8:00 AM – 8:00 PM'],
  ['Maternity', 'Daily, 10:00 AM – 12:00 PM & 4:00 PM – 7:00 PM'],
  ["Children's ward", 'One parent or guardian, 24 hours'],
  ['Intensive care', 'Daily, 11:00 AM – 12:00 PM & 5:00 PM – 6:00 PM'],
];

function TickList({ items }: { items: string[] }) {
  return (
    <ul className="ticks">
      {items.map((item) => (
        <li key={item}>
          <Icon name="check" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function VisitPage() {
  return (
    <div className="page-visit">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Your visit</span>
          </nav>
          <div className="page-hero__grid">
            <div>
              <p className="eyebrow">Your visit</p>
              <h1 style={{ marginTop: 16 }}>Plan your visit.</h1>
              <p className="page-hero__lede">
                A little preparation makes appointments and admissions calmer. Here is what to
                bring, where to go, and what to expect — plus the people to call if you&apos;re
                unsure.
              </p>
            </div>
            <aside className="page-hero__aside">
              <p className="eyebrow">Visiting hours</p>
              <p>
                General wards: daily, 8:00 AM – 8:00 PM. Intensive care has shorter visiting
                windows — please check with the ward team.
              </p>
              <Link href="/visit#visiting-hours">
                See all hours
                <Icon name="arrow" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="visit-cards">
            <div className="visit-card">
              <Icon name="pin" />
              <h3>Where to find us</h3>
              <p>
                Summit 72, Lemi Kura, Addis Ababa. Enter through the main reception; emergency care
                has a separate entrance.
              </p>
              <a href={MAPS_URL} target="_blank" rel="noopener">
                Get directions
              </a>
            </div>
            <div className="visit-card">
              <Icon name="clock" />
              <h3>Opening hours</h3>
              <p>
                Emergency: 24 hours, every day.
                <br />
                Outpatient clinics: Monday–Saturday, 8:00 AM – 6:00 PM.
              </p>
              <Link href="/appointment">Request an appointment</Link>
            </div>
            <div className="visit-card">
              <Icon name="phone" />
              <h3>Talk to someone</h3>
              <p>
                Our front desk can help with appointments, directions, billing and medical records.
              </p>
              <a href="tel:+251111132702">+251 111 132 702</a>
            </div>
          </div>

          <div className="support-band" id="ambulance">
            <div>
              <p className="eyebrow">Arriving by ambulance</p>
              <h2 style={{ marginTop: 12 }}>Call ahead so we&apos;re ready.</h2>
              <p>
                Our ambulance runs around the clock, and the emergency entrance at Summit 72 is
                separate from main reception. If you are bringing someone in yourself, call the
                emergency line on the way and tell us three things.
              </p>
              <p style={{ marginTop: 16 }}>
                <a className="btn btn--primary" href="tel:+251111132702">
                  Call +251 111 132 702
                  <Icon name="phone" />
                </a>
              </p>
            </div>
            <div className="support-band__items">
              <div className="support-band__item">
                <Icon name="pin" />
                <strong>Location and landmark</strong>
                <span>
                  Where you are and the nearest landmark — a road, building, church or school we can
                  find quickly.
                </span>
              </div>
              <div className="support-band__item">
                <Icon name="users" />
                <strong>Number of patients</strong>
                <span>
                  How many people need help, and whether anyone is a child, pregnant or badly
                  injured.
                </span>
              </div>
              <div className="support-band__item">
                <Icon name="shield" />
                <strong>Access notes</strong>
                <span>
                  Floor, gate, security, a narrow road or heavy traffic — and a number we can call
                  back.
                </span>
              </div>
            </div>
          </div>

          <div className="visit-block">
            <div className="visit-block__head">
              <p className="eyebrow">Before you arrive</p>
              <h2>Come prepared, not anxious.</h2>
              <p>
                Bring these items to your appointment or admission. If you forget something, tell
                the front desk — we can usually help.
              </p>
            </div>

            <div className="visit-two">
              <div className="info-card">
                <h3>What to bring</h3>
                <div style={{ marginTop: 16 }}>
                  <TickList items={BRING} />
                </div>
              </div>

              <div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.45rem', marginBottom: 6 }}>
                  If you&apos;re being admitted
                </h3>
                <div className="numbered-steps">
                  <div className="numbered-step">
                    <span>01</span>
                    <div>
                      <h3>Your clinician arranges admission</h3>
                      <p>
                        Your doctor explains why you need to stay and what will happen next.
                      </p>
                    </div>
                  </div>
                  <div className="numbered-step">
                    <span>02</span>
                    <div>
                      <h3>Front desk and insurance</h3>
                      <p>
                        We confirm your details and check your insurance cover. Ask for a cost
                        estimate before non-emergency treatment.
                      </p>
                    </div>
                  </div>
                  <div className="numbered-step">
                    <span>03</span>
                    <div>
                      <h3>Ward orientation</h3>
                      <p>
                        A nurse settles you in, reviews your medicines and answers your questions.
                        One adult companion can help you settle in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand" id="visiting-hours">
        <div className="wrap">
          <div className="visit-block__head">
            <p className="eyebrow">Visiting hours</p>
            <h2>Time together, protected.</h2>
            <p>
              Visitors are welcome, but rest matters. These hours help us protect quiet time and
              clinical care. Please check with the ward team if you&apos;re unsure.
            </p>
          </div>

          <div className="table-wrap">
            <table className="hours-table">
              <caption className="sr-only">Visiting hours by ward</caption>
              <thead>
                <tr>
                  <th scope="col">Area</th>
                  <th scope="col">Visiting hours</th>
                </tr>
              </thead>
              <tbody>
                {HOURS.map(([area, hours]) => (
                  <tr key={area}>
                    <th scope="row">{area}</th>
                    <td>{hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small-note" style={{ marginTop: 12 }}>
            Hours may change around clinical needs. Please speak to the ward team before planning a
            visit.
          </p>

          <div className="visit-block">
            <div className="visit-block__head">
              <p className="eyebrow">During your stay</p>
              <h2>The practical things, sorted.</h2>
            </div>
            <div className="visit-cards" style={{ marginTop: 0 }}>
              <div className="visit-card">
                <Icon name="pill" />
                <h3>Pharmacy on site</h3>
                <p>
                  Prescriptions can be dispensed before you leave, with advice on how to take them.
                </p>
              </div>
              <div className="visit-card">
                <Icon name="utensils" />
                <h3>Meals and dietary needs</h3>
                <p>
                  Meals are prepared on site. Tell the ward team about allergies, diabetes or other
                  dietary needs.
                </p>
              </div>
              <div className="visit-card">
                <Icon name="wheelchair" />
                <h3>Access and parking</h3>
                <p>
                  Step-free access and wheelchairs are available at the main entrance. Ask the front
                  desk about parking and drop-off.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Your rights and responsibilities</p>
              <h2>Respect goes both ways.</h2>
            </div>
            <div>
              <p className="lede">
                You have the right to be informed, respected and safe. We ask the same of everyone
                who walks through our doors — patients, families and staff.
              </p>
            </div>
          </div>

          <div className="visit-two">
            <div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', marginBottom: 14 }}>
                Your rights
              </h3>
              <TickList items={RIGHTS} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', marginBottom: 14 }}>
                Your responsibilities
              </h3>
              <TickList items={RESPONSIBILITIES} />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap">
          <div className="insurance-panel" id="insurance">
            <div>
              <p className="eyebrow">Insurance &amp; access</p>
              <h2 style={{ marginTop: 14, maxWidth: '13ch' }}>Cover, clearly explained.</h2>
              <p style={{ marginTop: 12, maxWidth: '46ch' }}>
                We work with major Ethiopian insurers and offer direct billing where your plan
                allows. Cover varies by plan and procedure, so we check before your consultation —
                not after.
              </p>
              <p style={{ marginTop: 14 }}>
                <Link className="link-arrow" href="/contact">
                  Ask about your cover <Icon name="arrow" />
                </Link>
              </p>
            </div>
            <TickList
              items={[
                'Bring your insurance card and we will confirm your cover before your visit.',
                'Direct billing where your plan allows; otherwise we explain the cost clearly.',
                'Paying yourself? Ask for an estimate before non-emergency treatment.',
                'Emergency care is never delayed for insurance checks.',
              ]}
            />
          </div>

          <div className="faq-layout">
            <div className="faq-layout__intro">
              <p className="eyebrow">Questions, answered</p>
              <h2>Before you ask.</h2>
              <p>
                If your question isn&apos;t here, call our front desk on{' '}
                <a
                  href="tel:+251111132702"
                  style={{
                    color: 'var(--ink)',
                    textDecoration: 'underline',
                    textUnderlineOffset: 2,
                  }}
                >
                  +251 111 132 702
                </a>{' '}
                or{' '}
                <Link
                  href="/contact"
                  style={{
                    color: 'var(--ink)',
                    textDecoration: 'underline',
                    textUnderlineOffset: 2,
                  }}
                >
                  send us a message
                </Link>
                .
              </p>
              <Link className="btn btn--outline" href="/contact">
                Contact the team
              </Link>
            </div>

            <div className="accordion">
              {FAQ.map(([question, answer], index) => (
                <details key={question} open={index === 0}>
                  <summary>
                    {question} <Icon name="plus" />
                  </summary>
                  <div className="accordion__body">{answer}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-band__inner">
          <div>
            <p className="eyebrow">Still unsure?</p>
            <h2>
              We&apos;ll help you <em>find</em> the way.
            </h2>
            <p>
              Call the front desk for directions, appointment changes, insurance questions or
              anything else about your visit.
            </p>
          </div>
          <div className="cta-band__actions">
            <a className="btn btn--light" href="tel:+251111132702">
              Call +251 111 132 702
              <Icon name="phone" />
            </a>
            <Link className="btn btn--ghost-light" href="/contact">
              Send a message
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
