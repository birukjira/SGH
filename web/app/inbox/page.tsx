import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { StaffNav } from '@/components/StaffNav';
import {
  listMessages,
  requireStaff,
  type InboxMessage,
  type MessageStatus,
} from '@/lib/inbox';
import { countByStatus } from '@/lib/appointment-queue';
import { telHref, utcStamp } from '@/lib/format';
import { logout, updateMessage } from './actions';

export const metadata: Metadata = {
  title: 'Contact inbox',
  robots: { index: false, follow: false },
};

const SECTIONS = [
  { status: 'new', title: 'New', hint: 'Not yet opened' },
  { status: 'read', title: 'Read', hint: 'Seen, still to answer' },
  { status: 'archived', title: 'Archived', hint: 'Handled' },
] as const;

function MessageCard({ message }: { message: InboxMessage }) {
  return (
    <article
      className={`staff-card staff-card--message${message.status === 'new' ? ' staff-card--new' : ''}`}
    >
      <div className="staff-card__head">
        <strong>{message.name}</strong>
        <span className="tag">{message.subject}</span>
        <span className="small-note staff-card__stamp">{utcStamp(message.createdAt)}</span>
      </div>

      <p className="staff-card__meta">
        <a href={`mailto:${message.email}`}>{message.email}</a>
        {message.phone ? (
          <>
            {' · '}
            <a href={telHref(message.phone)}>{message.phone}</a>
          </>
        ) : null}
      </p>

      <p className="staff-card__body">{message.body}</p>

      <div className="staff-card__actions">
        <a
          className="btn btn--primary btn--sm"
          href={`mailto:${message.email}?subject=Re: ${message.subject}`}
        >
          Reply by email
          <Icon name="mail" />
        </a>

        {/* One form per card: the note submits with the form, and `status` only
            arrives from the status button that was clicked. Save note comes
            first so Enter in the note field cannot change the status. */}
        <form action={updateMessage} className="staff-card__form staff-card__row">
          <input type="hidden" name="id" value={message.id} />
          <input
            className="input staff-card__note"
            type="text"
            name="note"
            maxLength={500}
            defaultValue={message.note ?? ''}
            placeholder="Internal note — e.g. replied by phone"
            aria-label={`Internal note for ${message.name}`}
          />
          <button className="btn btn--sm" type="submit">
            Save note
          </button>
          {message.status === 'new' ? (
            <button className="btn btn--sm" type="submit" name="status" value="read">
              Mark read
            </button>
          ) : null}
          <button
            className="btn btn--sm"
            type="submit"
            name="status"
            value={message.status === 'archived' ? 'read' : 'archived'}
          >
            {message.status === 'archived' ? 'Move back to read' : 'Archive'}
          </button>
        </form>
      </div>
    </article>
  );
}

export default async function InboxPage() {
  await requireStaff();

  const [messages, appointmentCounts] = await Promise.all([listMessages(), countByStatus()]);
  const waitingAppointments = appointmentCounts.new;

  const grouped: Record<MessageStatus, InboxMessage[]> = { new: [], read: [], archived: [] };
  for (const message of messages) grouped[message.status].push(message);

  return (
    <div className="page-inbox">
      <section className="page-hero">
        <div className="wrap">
          <p className="eyebrow">Staff</p>
          <div className="staff-head">
            <div>
              <h1 className="staff-title">Contact inbox.</h1>
              <p className="page-hero__lede">
                {grouped.new.length} new · {grouped.read.length} read · {grouped.archived.length}{' '}
                archived. Messages from the website contact form, newest first.
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

      <StaffNav
        active="messages"
        newMessages={grouped.new.length}
        newAppointments={waitingAppointments}
      />

      <section className="section">
        <div className="wrap staff-wrap">
          {messages.length === 0 ? (
            <div className="empty-state is-visible">
              <strong>No messages yet.</strong>
              Anything sent through the contact form appears here.
            </div>
          ) : null}

          {SECTIONS.map((section) => {
            const rows = grouped[section.status];
            if (rows.length === 0) return null;

            return (
              <div key={section.status} className="staff-group">
                <h2 className="staff-group__title">{section.title}</h2>
                <p className="small-note staff-group__meta">{section.hint}</p>
                {rows.map((message) => (
                  <MessageCard key={message.id} message={message} />
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
