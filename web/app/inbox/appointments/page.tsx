import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { StaffNav } from '@/components/StaffNav';
import { countNewMessages, requireStaff } from '@/lib/inbox';
import {
  countByStatus,
  listAppointments,
  statusFilter,
  type AppointmentStatus,
  type QueueItem,
  type StatusFilter,
} from '@/lib/appointment-queue';
import { dateKey, telHref, utcStamp } from '@/lib/format';
import { logout } from '../actions';
import { updateAppointment } from './actions';

export const metadata: Metadata = {
  title: 'Appointment requests',
  robots: { index: false, follow: false },
};

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
];

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  declined: 'Declined',
  archived: 'Archived',
};

/** Buttons a row offers, minus the status it is already in. */
const STATUS_ACTIONS: { status: AppointmentStatus; label: string }[] = [
  { status: 'confirmed', label: 'Confirm' },
  { status: 'declined', label: 'Decline' },
  { status: 'archived', label: 'Archive' },
  { status: 'new', label: 'Move back to new' },
];

/** 'YYYY-MM-DD' -> 'Monday 24 November 2026', marked when it is today or tomorrow. */
function dayLabel(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  const label = parsed.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date < dateKey(today)) return `${label} · past`;
  if (date === dateKey(today)) return `${label} · today`;
  if (date === dateKey(tomorrow)) return `${label} · tomorrow`;
  return label;
}

function AppointmentRow({ item }: { item: QueueItem }) {
  return (
    <article
      className={`staff-card staff-card--queue${item.status === 'new' ? ' staff-card--new' : ''}`}
    >
      <div className="staff-card__head">
        <strong>{item.preferredTime}</strong>
        <strong>
          {item.firstName} {item.lastName}
        </strong>
        {/* Dialling the patient is the main action on a phone, so it gets a
            full-height tap target instead of the tag's text-height padding. */}
        <a className="tag staff-card__phone" href={telHref(item.phone)}>
          {item.phone}
        </a>
        <span className="tag">{item.reference}</span>
        {item.status !== 'new' ? (
          <span className="tag tag--clay">{STATUS_LABEL[item.status]}</span>
        ) : null}
        <span className="small-note staff-card__stamp">
          {item.handledAt
            ? `handled ${utcStamp(item.handledAt)}`
            : `requested ${utcStamp(item.createdAt)}`}
        </span>
      </div>

      <p className="staff-card__meta">
        {item.department}
        {item.doctor ? ` · ${item.doctor}` : ' · any available consultant'}
        {` · ${item.visitType}`}
        {item.email ? (
          <>
            {' · '}
            <a href={`mailto:${item.email}`}>{item.email}</a>
          </>
        ) : null}
      </p>

      {item.reason ? <p className="staff-card__reason">{item.reason}</p> : null}

      {/* One form per row: note and status both submit, so a typed note is not lost
          when someone confirms. Save note comes first so Enter in the note field
          cannot commit a status by accident. */}
      <form action={updateAppointment} className="staff-card__form staff-card__form--queue">
        <input type="hidden" name="id" value={item.id} />
        <div className="staff-card__row">
          <input
            className="input staff-card__note"
            type="text"
            name="note"
            maxLength={500}
            defaultValue={item.note ?? ''}
            placeholder="Internal note — e.g. left a voicemail"
            aria-label={`Internal note for ${item.firstName} ${item.lastName}`}
          />
          <button className="btn btn--sm" type="submit">
            Save note
          </button>
        </div>

        <div className="staff-card__row">
          {STATUS_ACTIONS.filter((action) => action.status !== item.status).map((action) => (
            <button
              key={action.status}
              className={`btn btn--sm${action.status === 'confirmed' ? ' btn--primary' : ''}`}
              type="submit"
              name="status"
              value={action.status}
            >
              {action.label}
            </button>
          ))}
        </div>
      </form>
    </article>
  );
}

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function AppointmentsQueuePage({ searchParams }: { searchParams: SearchParams }) {
  await requireStaff();

  const { status, q } = await searchParams;
  const filter = statusFilter(status);
  const search = typeof q === 'string' ? q.trim().slice(0, 60) : '';

  const [items, counts, newMessages] = await Promise.all([
    listAppointments(filter, search),
    countByStatus(),
    countNewMessages(),
  ]);

  const total = counts.new + counts.confirmed + counts.declined + counts.archived;
  const countFor = (value: StatusFilter) => (value === 'all' ? total : counts[value]);

  const groups: { date: string; rows: QueueItem[] }[] = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (last && last.date === item.preferredDate) last.rows.push(item);
    else groups.push({ date: item.preferredDate, rows: [item] });
  }

  return (
    <div className="page-inbox">
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/inbox">Staff inbox</Link>
            <span aria-hidden="true">/</span>
            <span>Appointments</span>
          </nav>
          <div className="staff-head">
            <div>
              <p className="eyebrow">Staff</p>
              <h1 className="staff-title">Appointment requests.</h1>
              <p className="page-hero__lede">
                {counts.new} new · {counts.confirmed} confirmed · {counts.declined} declined ·{' '}
                {counts.archived} archived. Call each patient to confirm, then move the request on.
              </p>
            </div>
            <form action={logout}>
              <button className="btn btn--sm" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </section>

      <StaffNav active="appointments" newMessages={newMessages} newAppointments={counts.new} />

      <section className="section">
        <div className="wrap staff-wrap staff-wrap--wide">
          <div className="queue-bar">
            {FILTERS.map((item) => {
              const active = item.value === filter;
              return (
                <Link
                  key={item.value}
                  href={`/inbox/appointments?status=${item.value}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
                  className={`btn btn--sm${active ? '' : ' btn--outline'}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label} ({countFor(item.value)})
                </Link>
              );
            })}
          </div>

          <form action="/inbox/appointments" method="get" className="queue-bar">
            <input type="hidden" name="status" value={filter} />
            <input
              className="input queue-bar__input"
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Reference, phone or patient name"
              aria-label="Search appointment requests"
            />
            <button className="btn btn--sm" type="submit">
              Search
            </button>
            {search ? (
              <Link className="btn btn--sm" href={`/inbox/appointments?status=${filter}`}>
                Clear
              </Link>
            ) : null}
          </form>

          {items.length === 0 ? (
            <div className="empty-state is-visible">
              <strong>
                {search ? 'Nothing matches that search.' : `No ${filter === 'all' ? '' : filter} requests.`}
              </strong>
              {search
                ? 'Try the reference the patient was given, the phone number, or part of their name.'
                : 'Requests from the website appointment form appear here as they arrive.'}
            </div>
          ) : null}

          {groups.map((group) => (
            <div key={group.date} className="staff-group">
              <h2 className="staff-group__title">{dayLabel(group.date)}</h2>
              <p className="small-note staff-group__meta">
                {group.rows.length} request{group.rows.length === 1 ? '' : 's'}
              </p>
              {group.rows.map((item) => (
                <AppointmentRow key={item.id} item={item} />
              ))}
            </div>
          ))}

          <p className="small-note staff-footnote">
            <Icon name="clock" /> Requests are not confirmed bookings until a patient has been
            called. Notes are visible to staff only.
          </p>
        </div>
      </section>
    </div>
  );
}
