'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { Icon } from '@/components/Icon';
import type { ContactState } from '@/lib/messages';
import { sendContactMessage } from './actions';

const INITIAL: ContactState = { ok: null, message: '', errors: {} };

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span className="field__error" id={id} role="alert" style={{ display: 'block' }}>
      {message}
    </span>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields once the message has been stored.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  const error = state.errors;

  return (
    <form ref={formRef} action={action} noValidate>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="contactWebsite">Leave this field empty</label>
        <input type="text" id="contactWebsite" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form-grid">
        <div className={`field${error.name ? ' has-error' : ''}`}>
          <label htmlFor="contactName">Your name</label>
          <input
            className="input"
            type="text"
            id="contactName"
            name="contactName"
            autoComplete="name"
            required
            aria-invalid={error.name ? true : undefined}
            aria-describedby={error.name ? 'contactNameError' : undefined}
          />
          <FieldError id="contactNameError" message={error.name} />
        </div>

        <div className={`field${error.email ? ' has-error' : ''}`}>
          <label htmlFor="contactEmail">Email</label>
          <input
            className="input"
            type="email"
            id="contactEmail"
            name="contactEmail"
            autoComplete="email"
            required
            aria-invalid={error.email ? true : undefined}
            aria-describedby={error.email ? 'contactEmailError' : undefined}
          />
          <FieldError id="contactEmailError" message={error.email} />
        </div>

        <div className="field">
          <label htmlFor="contactPhone">
            Phone <span className="opt">(optional)</span>
          </label>
          <input
            className="input"
            type="tel"
            id="contactPhone"
            name="contactPhone"
            autoComplete="tel"
          />
        </div>

        <div className={`field${error.subject ? ' has-error' : ''}`}>
          <label htmlFor="contactSubject">What is this about?</label>
          <select
            className="select"
            id="contactSubject"
            name="contactSubject"
            defaultValue="General enquiry"
            aria-invalid={error.subject ? true : undefined}
            aria-describedby={error.subject ? 'contactSubjectError' : undefined}
          >
            <option value="General enquiry">General enquiry</option>
            <option value="Appointments">Appointments</option>
            <option value="Insurance and billing">Insurance and billing</option>
            <option value="Medical records">Medical records</option>
            <option value="Feedback">Feedback or complaint</option>
            <option value="Careers">Careers</option>
            <option value="Media">Media &amp; partnerships</option>
          </select>
          <FieldError id="contactSubjectError" message={error.subject} />
        </div>

        <div className={`field field--full${error.body ? ' has-error' : ''}`}>
          <label htmlFor="contactMessage">Message</label>
          <textarea
            className="textarea"
            id="contactMessage"
            name="contactMessage"
            rows={6}
            required
            placeholder="How can we help? Please avoid sharing sensitive medical details."
            aria-invalid={error.body ? true : undefined}
            aria-describedby={error.body ? 'contactMessageError' : undefined}
          />
          <FieldError id="contactMessageError" message={error.body} />
        </div>

        <div className={`field field--full${error.consent ? ' has-error' : ''}`}>
          <label className="check" htmlFor="contactConsent">
            <input
              type="checkbox"
              id="contactConsent"
              name="contactConsent"
              value="yes"
              required
              aria-invalid={error.consent ? true : undefined}
              aria-describedby={error.consent ? 'contactConsentError' : undefined}
            />
            <span>
              I agree that Summit General Hospital may use these details to reply to my message.
              Read our <Link href="/privacy">privacy notice</Link>.
            </span>
          </label>
          <FieldError id="contactConsentError" message={error.consent} />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          className="btn btn--primary btn--block"
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
        >
          {pending ? 'Sending…' : 'Send message'}
          <Icon name="arrow" />
        </button>
      </div>

      <div
        className={`contact-form-status${
          state.ok === true ? ' is-success' : state.ok === false ? ' is-error' : ''
        }`}
        role="status"
        aria-live="polite"
      >
        {state.message}
      </div>
    </form>
  );
}
