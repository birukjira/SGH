import type { ReactNode } from 'react';

/**
 * Staff screens. The public WhatsApp/Telegram/call rail floats over the bottom
 * corner of every page; on a phone it sits on top of the queue filters and the
 * search field, so the shared stylesheet hides it here at narrow widths only
 * (see `.staff-shell` in src/css/04-contact.css).
 */
export default function StaffLayout({ children }: { children: ReactNode }) {
  return <div className="staff-shell">{children}</div>;
}
