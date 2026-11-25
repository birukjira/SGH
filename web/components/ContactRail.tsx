import { Icon } from './Icon';

/** Floating contact buttons, matching the static layout. The newsletter button
 *  returns with the forms port (it needs the subscribe dialog markup). */
export function ContactRail() {
  return (
    <aside className="contact-rail" aria-label="Contact Summit General Hospital">
      <a
        className="contact-rail__btn contact-rail__btn--whatsapp"
        href="https://wa.me/251111132702?text=Hello%20Summit%20General%20Hospital%2C%20I%20would%20like%20to%20ask%20about"
        target="_blank"
        rel="noopener"
        aria-label="Chat with Summit General Hospital on WhatsApp"
      >
        <Icon name="whatsapp" />
        <span className="contact-rail__label">WhatsApp</span>
      </a>
      <a
        className="contact-rail__btn contact-rail__btn--telegram"
        href="https://t.me/+251950505015"
        target="_blank"
        rel="noopener"
        aria-label="Message Summit General Hospital on Telegram"
      >
        <Icon name="telegram" />
        <span className="contact-rail__label">Telegram</span>
      </a>
      <a
        className="contact-rail__btn contact-rail__btn--call"
        href="tel:+251111132702"
        aria-label="Call Summit General Hospital on +251 111 132 702"
      >
        <Icon name="phone" />
        <span className="contact-rail__label">Call 24/7</span>
      </a>
    </aside>
  );
}
