import type { Metadata } from 'next';
import Link from 'next/link';

const TITLE = 'Privacy Notice | Summit General Hospital';
const DESCRIPTION =
  'How Summit General Hospital handles information submitted through this website, including appointment requests and contact messages.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/privacy' },
  openGraph: { url: '/privacy', title: TITLE, description: DESCRIPTION },
};

export default function PrivacyPage() {
  return (
    <div className="page-privacy">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Privacy</span>
          </nav>
          <div className="page-hero__grid">
            <div>
              <p className="eyebrow">Privacy</p>
              <h1 style={{ marginTop: 16 }}>Your information, handled carefully.</h1>
              <p className="page-hero__lede">
                This notice explains what we collect through this website, why we collect it, and
                how to contact us with questions. It does not replace the privacy information you
                receive as a patient.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap legal-body">
          <p className="small-note" style={{ marginBottom: 26 }}>
            Last updated: November 2026
          </p>

          <h2>Who we are</h2>
          <p>
            Summit General Hospital is a general hospital located at Summit 72, Lemi Kura, Addis
            Ababa, Ethiopia. For questions about this notice or your information, contact{' '}
            <a href="mailto:info@summitgh.com.et">info@summitgh.com.et</a> or call{' '}
            <a href="tel:+251111132702">+251 111 132 702</a>.
          </p>

          <h2>What we collect through this website</h2>
          <p>
            When you use our appointment request or contact form, we collect the details you choose
            to provide, such as:
          </p>
          <ul>
            <li>Your name, phone number and email address.</li>
            <li>The department, consultant, date and time you request.</li>
            <li>A short reason for your visit, if you choose to provide one.</li>
            <li>The content of a message you send us.</li>
          </ul>
          <p>
            Please do not submit detailed medical records, test results or sensitive health
            information through the website forms. Bring those to your appointment or share them
            through a secure channel arranged with our team.
          </p>

          <h2>How we use it</h2>
          <p>We use the information you submit to:</p>
          <ul>
            <li>Respond to your message or request.</li>
            <li>Contact you to confirm, reschedule or discuss an appointment.</li>
            <li>Help you find the right department or service.</li>
            <li>Improve how the website and our front-desk service work.</li>
          </ul>
          <p>
            We do not sell your personal information. We do not use website form data for marketing
            without your consent.
          </p>

          <h2>Sharing</h2>
          <p>
            We share information only where needed to run the service you have asked for — for
            example, with the clinical team handling your appointment, or with the service providers
            who host our website and email. We may also disclose information where the law requires
            it.
          </p>

          <h2>Cookies and maps</h2>
          <p>
            This website does not use advertising or analytics cookies. Our locator map is a saved
            image served from our own site, so opening those pages does not load Google&apos;s maps
            code or set Google cookies. Choosing “Open in Google Maps” takes you to Google, where
            Google&apos;s own privacy policy applies.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Appointment requests and contact messages are kept only for as long as needed to handle
            your request and meet our administrative, clinical and legal obligations. We then delete
            or archive them according to our records policy.
          </p>

          <h2>Your choices</h2>
          <p>
            You can ask us what information we hold about you, request a correction, or ask us to
            delete information that we are not required to keep. Contact us using the details above.
            We may need to verify your identity before responding.
          </p>

          <h2>Children</h2>
          <p>
            Appointment requests for a child should be made by a parent or guardian. Please do not
            submit a child&apos;s information through the contact form without their
            guardian&apos;s consent.
          </p>

          <h2>Changes to this notice</h2>
          <p>
            We may update this notice from time to time. The date at the top of the page shows when
            it was last revised.
          </p>

          <h2>Contact</h2>
          <p>
            Summit General Hospital
            <br />
            Summit 72, Lemi Kura, Addis Ababa, Ethiopia
            <br />
            <a href="tel:+251111132702">+251 111 132 702</a> ·{' '}
            <a href="mailto:info@summitgh.com.et">info@summitgh.com.et</a>
          </p>
        </div>
      </section>
    </div>
  );
}
