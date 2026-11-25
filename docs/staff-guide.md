# Staff inbox — operating guide

The staff area lives at **`/inbox`** and is protected by one shared front-desk
password (`INBOX_PASSWORD`). There are no individual accounts, so treat the password
as the front desk's key: share it with staff only, and change it by updating the
environment value (see [`deployment.md`](deployment.md)).

Signed-out visitors who open any `/inbox` address are redirected to `/inbox/login`.
After 5 wrong passwords from the same connection in 15 minutes, sign-in is paused
until the window passes. Sessions last 12 hours; **Sign out** sits at the top of every
staff screen, beside the page title.

## The screens

| Screen | What it is for |
| --- | --- |
| `/inbox` | Contact messages: **New**, **Read**, **Archived**. Reply by email, record an internal note, move the message along. |
| `/inbox/appointments` | Appointment requests. Each card carries the patient's details, the requested department/doctor/date, and a status: new → confirmed or declined → archived. |
| `/inbox/doctors` | The consultant list: who is on the website, their departments, edit links, and hide/restore. |
| `/inbox/doctors/new`, `/inbox/doctors/<id>` | Add or edit one consultant. |
| `/inbox/services` | The service cards, grouped by category, with hide/restore. |
| `/inbox/services/new`, `/inbox/services/<id>` | Add or edit one service. |

The bar across the top shows counts of new messages and new appointment requests, so
you can see at a glance whether anything is waiting.

## Rules the screens follow

**Nothing is deleted. Hiding is not deleting.** A consultant who leaves, or a service
the hospital stops offering, is hidden with one click. The row, its photo and every
past appointment keep their details, and the item can be restored later. The public
pages stop listing it immediately.

**A doctor's web address never changes.** The slug is generated from the name when
the record is created. Renaming a doctor later updates the display name only, so
links and search results keep working. If a name is entered wrong, ask for a new
record rather than editing the name of the old one.

**A primary department must be one of the ticked departments.** The picker only
offers ticked departments, and the server refuses anything else, so a save can never
move a consultant into a department they are not in. Leave the primary on
"First ticked department" and the first box you ticked becomes the booking
department.

**Visibility is not a form field.** Editing a doctor or service never changes whether
it is on the website; only the Hide/Show button on the list does. That way a hurried
save cannot take someone off the site.

**Internal notes are internal.** The note box on messages and appointments is for the
front desk ("replied by phone", "number unreachable"). It is never shown publicly.
Do not record diagnoses, test results or other clinical detail there — the website is
not a medical record system.

## What the staff area does not do

- **No notifications.** Nothing emails or messages you when a request arrives; the
  counts refresh when you open or reload a page. Ask the developer if you want email
  or Telegram alerts.
- **No patient history.** Messages and appointment requests are requests, not files
  or results.
- **No per-person logins or audit trail.** Everyone shares one password, so the
  system cannot say who changed what.
- **No bulk actions or export.** Each request is handled one card at a time.
