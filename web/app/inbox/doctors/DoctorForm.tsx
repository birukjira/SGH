import Link from 'next/link';
import { Icon } from '@/components/Icon';
import type { DepartmentOption, DoctorRecord } from '@/lib/content';
import { saveDoctorAction } from './actions';
import { DepartmentPicker } from './DepartmentPicker';

/**
 * Add/edit form for one consultant. `id` is empty when adding; the slug is
 * derived from the name on create and then never changes, because it is the
 * doctor's permanent key.
 *
 * Visibility is not a field here: hiding a doctor is a single deliberate click
 * on the list, so saving this form can never take someone off the website.
 */
export function DoctorForm({
  doctor,
  departments,
  error,
  saved,
}: {
  doctor: DoctorRecord | null;
  departments: DepartmentOption[];
  error?: string;
  saved?: boolean;
}) {
  const initialTicked = doctor?.departments.map((department) => department.id) ?? [];
  const initialPrimary = doctor?.departments.find((department) => department.isPrimary)?.id ?? null;

  return (
    <form action={saveDoctorAction} className="staff-form">
      {doctor ? <input type="hidden" name="id" value={doctor.id} /> : null}

      {error ? (
        <p className="notice staff-notice">
          <Icon name="shield" />
          <span>{error}</span>
        </p>
      ) : null}

      {saved ? (
        <p className="notice staff-notice">
          <Icon name="shield" />
          <span>
            <strong>Saved.</strong> The public directory shows the change on its next load.
          </span>
        </p>
      ) : null}

      <div className="form-grid">
        <div className="field field--full">
          <label htmlFor="name">Name</label>
          <input
            className="input"
            id="name"
            name="name"
            type="text"
            maxLength={120}
            required
            defaultValue={doctor?.name ?? ''}
            placeholder="Dr. Gosa Abebe Shifera"
          />
        </div>

        <div className="field">
          <label htmlFor="role">Role</label>
          <input
            className="input"
            id="role"
            name="role"
            type="text"
            maxLength={120}
            required
            defaultValue={doctor?.role ?? ''}
            placeholder="Consultant General Surgeon"
          />
        </div>

        <div className="field">
          <label htmlFor="sortOrder">
            Order <span className="opt">(lower appears first)</span>
          </label>
          <input
            className="input"
            id="sortOrder"
            name="sortOrder"
            type="number"
            step={1}
            defaultValue={doctor?.sortOrder ?? 0}
          />
        </div>

        <div className="field field--full">
          <label htmlFor="focus">Directory line</label>
          <input
            className="input"
            id="focus"
            name="focus"
            type="text"
            maxLength={240}
            required
            defaultValue={doctor?.focus ?? ''}
            placeholder="General and emergency surgery."
          />
          <span className="field__help">The one-line focus shown on the doctor&apos;s card.</span>
        </div>

        <DepartmentPicker
          departments={departments}
          initialTicked={initialTicked}
          initialPrimary={initialPrimary}
        />

        <div className="field">
          <label htmlFor="clinicNote">
            Clinic note <span className="opt">(optional)</span>
          </label>
          <input
            className="input"
            id="clinicNote"
            name="clinicNote"
            type="text"
            maxLength={200}
            defaultValue={doctor?.clinicNote ?? 'Clinic days — call to confirm'}
          />
          <span className="field__help">
            Left as the default unless the hospital has given you real clinic days.
          </span>
        </div>

        <div className="field">
          <label htmlFor="languages">
            Languages <span className="opt">(comma separated)</span>
          </label>
          <input
            className="input"
            id="languages"
            name="languages"
            type="text"
            defaultValue={doctor?.languages.join(', ') ?? ''}
            placeholder="Amharic, English"
          />
        </div>

        <div className="field">
          <label htmlFor="photoPath">
            Photo path <span className="opt">(optional)</span>
          </label>
          <input
            className="input"
            id="photoPath"
            name="photoPath"
            type="text"
            maxLength={300}
            defaultValue={doctor?.photoPath ?? ''}
            placeholder="/assets/img/doctors/dr-name.jpg"
          />
        </div>

        <div className="field">
          <label htmlFor="photoAlt">
            Photo description <span className="opt">(optional)</span>
          </label>
          <input
            className="input"
            id="photoAlt"
            name="photoAlt"
            type="text"
            maxLength={200}
            defaultValue={doctor?.photoAlt ?? ''}
            placeholder="Portrait of Dr. …"
          />
        </div>

        <div className="field field--full">
          <label htmlFor="bioMd">
            Profile text <span className="opt">(optional, Markdown)</span>
          </label>
          <textarea
            className="textarea"
            id="bioMd"
            name="bioMd"
            rows={6}
            maxLength={4000}
            defaultValue={doctor?.bioMd ?? ''}
            placeholder="Training, special interests and any languages spoken."
          />
          <span className="field__help">
            Only publish what the hospital has confirmed — no invented qualifications.
          </span>
        </div>

        <div className="field field--full">
          <label className="check" htmlFor="acceptsAppointments">
            <input
              type="checkbox"
              id="acceptsAppointments"
              name="acceptsAppointments"
              defaultChecked={doctor?.acceptsAppointments ?? true}
            />
            <span>This consultant accepts appointment requests from the website.</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <Link className="link-arrow" href="/inbox/doctors">
          Back to doctors
        </Link>
        <div className="form-actions__right">
          <button className="btn btn--primary" type="submit">
            {doctor ? 'Save changes' : 'Add consultant'}
            <Icon name="arrow" />
          </button>
        </div>
      </div>
    </form>
  );
}
