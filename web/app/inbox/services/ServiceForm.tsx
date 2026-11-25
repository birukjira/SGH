import Link from 'next/link';
import { Icon } from '@/components/Icon';
import {
  CTA_TYPES,
  type DepartmentOption,
  type ServiceCategoryOption,
  type ServiceRecord,
} from '@/lib/content';
import { saveServiceAction } from './actions';

const CTA_LABEL: Record<(typeof CTA_TYPES)[number], string> = {
  appointment: 'Books an appointment',
  call: 'Shows the phone number to call',
  contact: 'Sends the reader to the contact page',
};

/**
 * One service card on /services. Visibility is set on the list, not here, so a
 * save never takes a service off the website by accident.
 */
export function ServiceForm({
  service,
  categories,
  departments,
  error,
  saved,
}: {
  service: ServiceRecord | null;
  categories: ServiceCategoryOption[];
  departments: DepartmentOption[];
  error?: string;
  saved?: boolean;
}) {
  return (
    <form action={saveServiceAction} className="staff-form">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}

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
            <strong>Saved.</strong> /services and the booking form show the change on their next
            load.
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
            defaultValue={service?.name ?? ''}
            placeholder="Cardiology"
          />
        </div>

        <div className="field field--full">
          <label htmlFor="summary">Card summary</label>
          <input
            className="input"
            id="summary"
            name="summary"
            type="text"
            maxLength={300}
            required
            defaultValue={service?.summary ?? ''}
            placeholder="Heart assessment, blood pressure management and ongoing follow-up."
          />
          <span className="field__help">One sentence — this is the text on the service card.</span>
        </div>

        <div className="field">
          <label htmlFor="categoryId">Category</label>
          <select
            className="select"
            id="categoryId"
            name="categoryId"
            required
            defaultValue={service?.categoryId ?? categories[0]?.id ?? ''}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <span className="field__help">Decides the filter chip the service sits under.</span>
        </div>

        <div className="field">
          <label htmlFor="departmentId">
            Department <span className="opt">(optional)</span>
          </label>
          <select
            className="select"
            id="departmentId"
            name="departmentId"
            defaultValue={service?.departmentId ?? ''}
          >
            <option value="">No department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="bookingDepartment">
            Booking department <span className="opt">(optional)</span>
          </label>
          <input
            className="input"
            id="bookingDepartment"
            name="bookingDepartment"
            type="text"
            maxLength={80}
            defaultValue={service?.bookingDepartment ?? ''}
            placeholder="Cardiology"
          />
          <span className="field__help">
            The exact appointment-form option to preselect. Leave empty if the service cannot be
            booked online.
          </span>
        </div>

        <div className="field">
          <label htmlFor="tag">Card tag <span className="opt">(optional)</span></label>
          <input
            className="input"
            id="tag"
            name="tag"
            type="text"
            maxLength={60}
            defaultValue={service?.tag ?? ''}
            placeholder="Clinical"
          />
        </div>

        <div className="field">
          <label htmlFor="icon">
            Icon <span className="opt">(optional)</span>
          </label>
          <input
            className="input"
            id="icon"
            name="icon"
            type="text"
            maxLength={60}
            defaultValue={service?.icon ?? ''}
            placeholder="i-heart"
          />
          <span className="field__help">
            Sprite id from the site icon set, e.g. <code>i-heart</code>, <code>i-scan</code>.
          </span>
        </div>

        <div className="field">
          <label htmlFor="sortOrder">Order</label>
          <input
            className="input"
            id="sortOrder"
            name="sortOrder"
            type="number"
            step={1}
            defaultValue={service?.sortOrder ?? 0}
          />
          <span className="field__help">Lower numbers appear first inside the category.</span>
        </div>

        <div className="field">
          <label htmlFor="ctaLabel">Button label</label>
          <input
            className="input"
            id="ctaLabel"
            name="ctaLabel"
            type="text"
            maxLength={60}
            defaultValue={service?.ctaLabel ?? 'Book this service'}
          />
        </div>

        <div className="field">
          <label htmlFor="ctaType">Button does</label>
          <select
            className="select"
            id="ctaType"
            name="ctaType"
            defaultValue={service?.ctaType ?? 'appointment'}
          >
            {CTA_TYPES.map((type) => (
              <option key={type} value={type}>
                {CTA_LABEL[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="field field--full">
          <label htmlFor="bodyMd">
            Page text <span className="opt">(optional, Markdown)</span>
          </label>
          <textarea
            className="textarea"
            id="bodyMd"
            name="bodyMd"
            rows={6}
            maxLength={8000}
            defaultValue={service?.bodyMd ?? ''}
            placeholder="What the service covers, who it is for, and how to reach it."
          />
        </div>

        <div className="field field--full">
          <label className="check" htmlFor="isEmergency">
            <input
              type="checkbox"
              id="isEmergency"
              name="isEmergency"
              defaultChecked={service?.isEmergency ?? false}
            />
            <span>Emergency service — shown with the 24/7 treatment on the services page.</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <Link className="link-arrow" href="/inbox/services">
          Back to services
        </Link>
        <div className="form-actions__right">
          <button className="btn btn--primary" type="submit">
            {service ? 'Save changes' : 'Add service'}
            <Icon name="arrow" />
          </button>
        </div>
      </div>
    </form>
  );
}
