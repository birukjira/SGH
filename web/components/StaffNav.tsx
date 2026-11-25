import Link from 'next/link';

/**
 * The staff area's shared bar: the two queues (with the number of items that
 * need attention) and the website content screens. Counts are passed in by the
 * page because every page already queries them.
 */
type Props = {
  active: 'messages' | 'appointments' | 'doctors' | 'services';
  newMessages: number;
  newAppointments: number;
};

export function StaffNav({ active, newMessages, newAppointments }: Props) {
  const queues = [
    { key: 'messages', href: '/inbox', label: 'Messages', count: newMessages, hint: 'new' },
    {
      key: 'appointments',
      href: '/inbox/appointments',
      label: 'Appointments',
      count: newAppointments,
      hint: 'waiting',
    },
  ] as const;

  const content = [
    { key: 'doctors', href: '/inbox/doctors', label: 'Doctors' },
    { key: 'services', href: '/inbox/services', label: 'Services' },
  ] as const;

  return (
    <nav className="staff-nav" aria-label="Staff queues">
      <div className="wrap staff-nav__inner">
        {queues.map((queue) => {
          const isActive = queue.key === active;
          return (
            <Link
              key={queue.key}
              href={queue.href}
              className={`btn btn--sm${isActive ? '' : ' btn--outline'}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={
                queue.count > 0 ? `${queue.label}, ${queue.count} ${queue.hint}` : queue.label
              }
            >
              {queue.label}
              {queue.count > 0 ? (
                <span aria-hidden="true" className="staff-nav__badge">
                  {queue.count}
                </span>
              ) : null}
            </Link>
          );
        })}

        <span className="staff-nav__label">Website</span>

        {content.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`btn btn--sm${isActive ? '' : ' btn--outline'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
