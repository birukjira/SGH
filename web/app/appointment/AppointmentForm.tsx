'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import {
  appointmentErrors,
  bookingWindow,
  TIME_SLOTS,
  VISIT_TYPES,
  type AppointmentErrors,
  type AppointmentField,
  type AppointmentInput,
  type AppointmentResult,
} from '@/lib/appointment-slots';
import { submitAppointment } from './actions';

type DepartmentOption = { label: string; group: string };
type DoctorOption = { name: string; department: string; label: string };

type Props = {
  departments: DepartmentOption[];
  doctors: DoctorOption[];
  initialDepartment?: string;
  initialDoctor?: string;
};

/** Fields checked before each step will advance; the last list is the review. */
const STEP_FIELDS: AppointmentField[][] = [
  ['department', 'visitType'],
  ['preferredDate', 'preferredTime'],
  ['firstName', 'lastName', 'phone', 'email', 'reason', 'consent'],
];

const STEPS = [
  {
    label: 'Your visit',
    title: 'What brings you in?',
    intro: 'Pick the department closest to your concern. If you are unsure, choose one and we will redirect you if needed.',
  },
  {
    label: 'Date & time',
    title: 'When would you like to come?',
    intro: 'Give us a preferred date and time. We will call you to confirm the exact appointment.',
  },
  {
    label: 'Your details',
    title: 'Who should we call?',
    intro: 'We only need enough to reach you. Please leave out sensitive medical details.',
  },
];

const EMPTY: AppointmentInput = {
  department: '',
  doctor: '',
  visitType: VISIT_TYPES[0],
  preferredDate: '',
  preferredTime: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  reason: '',
  consent: false,
};

const DEPARTMENT_GROUPS = [
  'Emergency',
  'Medical specialties',
  "Surgery and women's health",
  'Diagnostics and rehabilitation',
];

const VISIT_CHOICES = [
  {
    value: 'First consultation',
    copy: 'A new concern, or your first visit to this department.',
    icon: 'calendar',
  },
  {
    value: 'Follow-up visit',
    copy: 'A review of ongoing care, results or treatment.',
    icon: 'activity',
  },
];

const PHONE_HINT = 'We will use this to confirm your appointment.';

function formatDate(value: string) {
  if (!value) return '—';
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function AppointmentForm({
  departments,
  doctors,
  initialDepartment = '',
  initialDoctor = '',
}: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<AppointmentInput>({
    ...EMPTY,
    department: initialDepartment,
    doctor: initialDoctor,
  });
  const [errors, setErrors] = useState<AppointmentErrors>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AppointmentResult | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const bounds = useMemo(() => bookingWindow(), []);

  useEffect(() => {
    if (result?.ok) successRef.current?.focus();
  }, [result]);

  const doctorsForDepartment = values.department
    ? doctors.filter((doctor) => doctor.department === values.department)
    : [];

  const visitSummary: [string, string][] = [
    ['Department', values.department || '—'],
    ['Consultant', values.doctor || 'Any available consultant'],
    ['Visit type', values.visitType || '—'],
    ['Preferred date', formatDate(values.preferredDate)],
    ['Preferred time', values.preferredTime || '—'],
  ];

  function update(patch: Partial<AppointmentInput>) {
    setValues((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch) as AppointmentField[]) delete next[key];
      return next;
    });
  }

  function focusFirstError() {
    // Wait for the error markup, then move focus to the field that failed.
    setTimeout(() => {
      document.querySelector<HTMLElement>('.form-step [aria-invalid="true"]')?.focus();
    }, 0);
  }

  function goTo(next: number) {
    if (next > step) {
      const all = appointmentErrors(values, bounds);
      const current: AppointmentErrors = {};
      for (const field of STEP_FIELDS[step]) if (all[field]) current[field] = all[field];

      if (Object.keys(current).length > 0) {
        setErrors((previous) => ({ ...previous, ...current }));
        focusFirstError();
        return;
      }
    }

    setStep(next);
    cardRef.current?.scrollIntoView({ block: 'start' });
    document.getElementById(`stepTitle${next}`)?.focus({ preventScroll: true });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    const problems = appointmentErrors(values, bounds);
    if (Object.keys(problems).length > 0) {
      setErrors(problems);
      const failed = Object.keys(problems) as AppointmentField[];
      const firstStep = STEP_FIELDS.findIndex((fields) => fields.some((f) => failed.includes(f)));
      if (firstStep >= 0) setStep(firstStep);
      focusFirstError();
      return;
    }

    setBusy(true);
    try {
      setResult(await submitAppointment(values));
    } catch {
      setResult({
        ok: false,
        message: 'We could not send your request. Please call +251 111 132 702.',
      });
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setResult(null);
    setStep(0);
  }

  const fieldClass = (field: AppointmentField) => `field${errors[field] ? ' has-error' : ''}`;
  const invalid = (field: AppointmentField) => (errors[field] ? true : undefined);
  const fieldError = (field: AppointmentField) =>
    errors[field] ? (
      <span className="field__error" role="alert" style={{ display: 'block' }}>
        {errors[field]}
      </span>
    ) : null;

  if (result?.ok) {
    return (
      <div className="booking-card" ref={cardRef}>
        <div className="booking-success is-visible">
          <div className="success-mark" aria-hidden="true">
            <Icon name="check" />
          </div>
          <h2 tabIndex={-1} ref={successRef}>
            Your request is with us.
          </h2>
          <p>
            Thank you. Our team will call you on the number you provided to confirm your
            appointment. If you don&apos;t hear from us within one working day, please call{' '}
            <a href="tel:+251111132702">+251 111 132 702</a>.
          </p>
          <p className="success-ref">
            Reference <strong>{result.reference}</strong>
          </p>
          <dl className="success-summary">
            {[
              ...visitSummary,
              ['Patient name', `${values.firstName} ${values.lastName}`.trim()],
              ['Phone', values.phone],
            ].map(([label, value]) => (
              <div className="review__row" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="success-actions">
            <Link className="btn btn--primary" href="/">
              Back to home
            </Link>
            <button className="btn btn--outline" type="button" onClick={reset}>
              Book another visit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-card" ref={cardRef}>
      <div className="booking-card__head">
        <div>
          <h2>Book a visit</h2>
          <p>Three short steps. No payment required online.</p>
        </div>
        <span className="booking-card__secure">
          <Icon name="shield" />
          Your details are private
        </span>
      </div>

      {result && !result.ok ? (
        <div className="form-alert is-visible" role="alert">
          <Icon name="cross" />
          <span>{result.message}</span>
        </div>
      ) : null}

      <form onSubmit={submit} noValidate>
        <div className="stepper" aria-label="Appointment request progress">
          {STEPS.map((item, index) => (
            <div
              className={`stepper__item${index === step ? ' is-active' : ''}${
                index < step ? ' is-done' : ''
              }`}
              key={item.label}
            >
              <span className="stepper__num">{String(index + 1).padStart(2, '0')}</span>
              <span className="stepper__label">{item.label}</span>
            </div>
          ))}
        </div>

        <section className="form-step is-active" aria-labelledby={`stepTitle${step}`}>
          <h2 className="form-step__title" id={`stepTitle${step}`} tabIndex={-1}>
            {STEPS[step].title}
          </h2>
          <p className="form-step__intro">{STEPS[step].intro}</p>

          {step === 0 ? (
            <>
              <div className="form-grid">
                <div className={`${fieldClass('department')} field--full`}>
                  <label htmlFor="department">Department</label>
                  <select
                    className="select"
                    id="department"
                    value={values.department}
                    onChange={(event) => update({ department: event.target.value, doctor: '' })}
                    aria-invalid={invalid('department')}
                  >
                    <option value="">Select a department</option>
                    {DEPARTMENT_GROUPS.map((group) => {
                      const options = departments.filter((item) => item.group === group);
                      if (options.length === 0) return null;
                      return (
                        <optgroup label={group} key={group}>
                          {options.map((option) => (
                            <option value={option.label} key={option.label}>
                              {option.label}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  {fieldError('department')}
                </div>

                <div className="field field--full">
                  <label htmlFor="doctor">
                    Preferred consultant <span className="opt">(optional)</span>
                  </label>
                  <select
                    className="select"
                    id="doctor"
                    value={values.doctor}
                    disabled={!values.department}
                    onChange={(event) => update({ doctor: event.target.value })}
                  >
                    <option value="">
                      {values.department ? 'Any available consultant' : 'Choose a department first'}
                    </option>
                    {doctorsForDepartment.map((doctor) => (
                      <option value={doctor.name} key={doctor.name}>
                        {doctor.label}
                      </option>
                    ))}
                  </select>
                  <span className="field__help">
                    Leave blank if you are happy to see any available consultant.
                  </span>
                </div>
              </div>

              <fieldset className={`${fieldClass('visitType')} field--full`} style={{ marginTop: 20 }}>
                <legend>Visit type</legend>
                <div className="choice-grid">
                  {VISIT_CHOICES.map((choice) => (
                    <label className="choice" key={choice.value}>
                      <input
                        type="radio"
                        name="visit_type"
                        value={choice.value}
                        checked={values.visitType === choice.value}
                        onChange={() => update({ visitType: choice.value })}
                      />
                      <span className="choice__inner">
                        <span className="choice__icon" aria-hidden="true">
                          <Icon name={choice.icon} />
                        </span>
                        <span className="choice__text">
                          <strong>{choice.value}</strong>
                          <span>{choice.copy}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {fieldError('visitType')}
              </fieldset>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="form-grid">
                <div className={`${fieldClass('preferredDate')} field--full`}>
                  <label htmlFor="preferredDate">Preferred date</label>
                  <input
                    className="input"
                    type="date"
                    id="preferredDate"
                    min={bounds.min}
                    max={bounds.max}
                    value={values.preferredDate}
                    onChange={(event) => update({ preferredDate: event.target.value })}
                    aria-invalid={invalid('preferredDate')}
                  />
                  <span className="field__help">Requests can be made up to three months ahead.</span>
                  {fieldError('preferredDate')}
                </div>
              </div>

              <fieldset className={`${fieldClass('preferredTime')} field--full`} style={{ marginTop: 20 }}>
                <legend>Preferred time</legend>
                <div className="slot-grid">
                  {TIME_SLOTS.map((slot) => (
                    <label className="slot" key={slot}>
                      <input
                        type="radio"
                        name="preferred_time"
                        value={slot}
                        checked={values.preferredTime === slot}
                        onChange={() => update({ preferredTime: slot })}
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
                <span className="field__help" style={{ marginTop: 8 }}>
                  Clinic hours are Monday to Saturday, 8:00 AM – 6:00 PM. Emergency care is open
                  24/7.
                </span>
                {fieldError('preferredTime')}
              </fieldset>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="form-grid">
                <div className={fieldClass('firstName')}>
                  <label htmlFor="firstName">First name</label>
                  <input
                    className="input"
                    type="text"
                    id="firstName"
                    autoComplete="given-name"
                    value={values.firstName}
                    onChange={(event) => update({ firstName: event.target.value })}
                    aria-invalid={invalid('firstName')}
                  />
                  {fieldError('firstName')}
                </div>
                <div className={fieldClass('lastName')}>
                  <label htmlFor="lastName">Last name</label>
                  <input
                    className="input"
                    type="text"
                    id="lastName"
                    autoComplete="family-name"
                    value={values.lastName}
                    onChange={(event) => update({ lastName: event.target.value })}
                    aria-invalid={invalid('lastName')}
                  />
                  {fieldError('lastName')}
                </div>
                <div className={fieldClass('phone')}>
                  <label htmlFor="phone">Phone number</label>
                  <input
                    className="input"
                    type="tel"
                    id="phone"
                    autoComplete="tel"
                    placeholder="+251 9__ ___ ___"
                    value={values.phone}
                    onChange={(event) => update({ phone: event.target.value })}
                    aria-invalid={invalid('phone')}
                  />
                  <span className="field__help">{PHONE_HINT}</span>
                  {fieldError('phone')}
                </div>
                <div className={fieldClass('email')}>
                  <label htmlFor="email">
                    Email <span className="opt">(optional)</span>
                  </label>
                  <input
                    className="input"
                    type="email"
                    id="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={(event) => update({ email: event.target.value })}
                    aria-invalid={invalid('email')}
                  />
                  {fieldError('email')}
                </div>
                <div className={fieldClass('reason')}>
                  <label htmlFor="reason">
                    Reason for visit <span className="opt">(optional)</span>
                  </label>
                  <textarea
                    className="textarea"
                    id="reason"
                    rows={3}
                    maxLength={800}
                    placeholder="A short note — for example, a check-up, a follow-up, or a specific concern."
                    value={values.reason}
                    onChange={(event) => update({ reason: event.target.value })}
                    aria-invalid={invalid('reason')}
                  />
                  <span className="field__help">
                    Please keep this brief. We&apos;ll discuss the details privately at your
                    appointment.
                  </span>
                  {fieldError('reason')}
                </div>
              </div>

              <dl className="review" style={{ marginTop: 20 }}>
                {visitSummary.map(([label, value]) => (
                  <div className="review__row" key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className={fieldClass('consent')} style={{ marginTop: 18 }}>
                <label className="check" htmlFor="bookingConsent">
                  <input
                    type="checkbox"
                    id="bookingConsent"
                    checked={values.consent}
                    onChange={(event) => update({ consent: event.target.checked })}
                    aria-invalid={invalid('consent')}
                  />
                  <span>
                    I agree to be contacted by Summit General Hospital about this request, and I
                    have read the <Link href="/privacy">privacy notice</Link>.
                  </span>
                </label>
                {fieldError('consent')}
              </div>

              <div className="notice" style={{ marginTop: 18 }}>
                <Icon name="clock" />
                <span>
                  <strong>This is a request, not a confirmed appointment.</strong> Our team will
                  call you during clinic hours to confirm the time. If you need urgent care, call{' '}
                  <a href="tel:+251111132702">+251 111 132 702</a>.
                </span>
              </div>
            </>
          ) : null}

          <div className="form-actions">
            {step === 0 ? (
              <Link className="link-arrow" href="/doctors">
                Browse doctors
                <Icon name="arrow" />
              </Link>
            ) : (
              <button className="btn--back" type="button" onClick={() => goTo(step - 1)}>
                <Icon name="arrow" />
                Back
              </button>
            )}
            <div className="form-actions__right">
              {step < STEPS.length - 1 ? (
                <button className="btn btn--primary" type="button" onClick={() => goTo(step + 1)}>
                  Continue
                  <Icon name="arrow" />
                </button>
              ) : (
                <button className="btn btn--primary" type="submit" disabled={busy} aria-busy={busy || undefined}>
                  {busy ? 'Sending request…' : 'Send request'}
                  <Icon name="arrow" />
                </button>
              )}
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
