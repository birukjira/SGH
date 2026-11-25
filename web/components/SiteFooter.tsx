import Link from 'next/link';
import { Icon } from './Icon';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer__top">
        <div className="footer__brand">
          <Link className="brand" href="/" aria-label="Summit General Hospital — home">
            <img src="/assets/img/logo-white.svg" alt="Summit General Hospital" width={142} height={56} />
          </Link>
          <p>“Your Health Our Priority!” Compassionate, consultant-led care in the heart of Lemi Kura.</p>
          <a className="footer__emergency" href="tel:+251111132702">
            <span className="pulse-dot pulse-dot--light" aria-hidden="true" />
            <span>
              <small>24/7 Emergency &amp; Ambulance</small>
              <strong>+251 111 132 702</strong>
            </span>
          </a>
        </div>

        <div className="footer__col">
          <h2 className="footer__h">Explore</h2>
          <ul className="footer__links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About Summit</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/doctors">Our doctors</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h2 className="footer__h">Patients</h2>
          <ul className="footer__links">
            <li><Link href="/appointment">Book an appointment</Link></li>
            <li><Link href="/visit">Your visit</Link></li>
            <li><Link href="/visit#visiting-hours">Visiting hours</Link></li>
            <li><Link href="/contact">Contact us</Link></li>
          </ul>
        </div>

        <div className="footer__col footer__visit">
          <h2 className="footer__h">Visit</h2>
          <address>
            Summit 72, Lemi Kura<br />
            Addis Ababa, Ethiopia
          </address>
          <a href="mailto:info@summitgh.com.et">info@summitgh.com.et</a>
          <p className="footer__hours">
            <Icon name="clock" />
            Emergency open 24 hours
          </p>
          <a
            className="footer__map-link"
            href="https://www.google.com/maps/search/?api=1&query=Summit+General+Hospital%2C+Addis+Ababa%2C+Ethiopia"
            target="_blank"
            rel="noopener"
          >
            Get directions
            <Icon name="arrow-up-right" />
          </a>
        </div>
      </div>

      <div className="wrap footer__bottom">
        <p>&copy; {new Date().getFullYear()} Summit General Hospital. All rights reserved.</p>
        <nav aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <a href="/sitemap.xml">Sitemap</a>
        </nav>
      </div>
      <div className="wrap footer__disclaimer">
        <p>
          This website provides general health information and is not a substitute for professional
          medical advice, diagnosis or treatment. In an emergency, call{' '}
          <a href="tel:+251111132702">+251 111 132 702</a> or go to the nearest emergency department.
        </p>
      </div>
    </footer>
  );
}
