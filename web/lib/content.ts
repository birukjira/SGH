import { getDb } from './d1';

/**
 * Staff-side reads and writes for the content behind the public directory:
 * consultants (/doctors) and services (/services).
 *
 * Nothing here is reachable from a public page: the pages and server actions
 * under app/inbox/doctors and app/inbox/services call `requireStaff()` first,
 * and the pages are marked noindex.
 *
 * Rows are never deleted. A consultant who leaves the hospital is hidden with
 * `setDoctorActive(id, false)`, which drops them from the public directory
 * while keeping their record, photo and any history intact.
 */

const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export type DepartmentOption = {
  id: number;
  name: string;
  isActive: boolean;
};

export type ServiceCategoryOption = {
  id: number;
  name: string;
};

type DoctorRow = {
  id: number;
  slug: string;
  name: string;
  role: string;
  focus: string;
  bio_md: string | null;
  photo_path: string | null;
  photo_alt: string | null;
  clinic_note: string;
  languages: string;
  accepts_appointments: number;
  is_active: number;
  sort_order: number;
  updated_at: string;
};

type MembershipRow = {
  doctor_id: number;
  department_id: number;
  name: string;
  is_primary: number;
};

export type DoctorRecord = {
  id: number;
  slug: string;
  name: string;
  role: string;
  focus: string;
  bioMd: string | null;
  photoPath: string | null;
  photoAlt: string | null;
  clinicNote: string;
  languages: string[];
  acceptsAppointments: boolean;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
  departments: { id: number; name: string; isPrimary: boolean }[];
};

type ServiceRow = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  body_md: string | null;
  icon: string | null;
  tag_label: string | null;
  category_id: number;
  category_name: string;
  department_id: number | null;
  department_name: string | null;
  booking_department: string | null;
  cta_label: string;
  cta_type: ServiceCtaType;
  is_emergency: number;
  is_active: number;
  sort_order: number;
  updated_at: string;
};

export type ServiceCtaType = 'appointment' | 'call' | 'contact';

export const CTA_TYPES: readonly ServiceCtaType[] = ['appointment', 'call', 'contact'];

export type ServiceRecord = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  bodyMd: string | null;
  icon: string | null;
  tag: string | null;
  categoryId: number;
  categoryName: string;
  departmentId: number | null;
  departmentName: string | null;
  bookingDepartment: string | null;
  ctaLabel: string;
  ctaType: ServiceCtaType;
  isEmergency: boolean;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
};

/* Helpers ---------------------------------------------------------------- */

function parseLanguages(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/** 'Dr. Gosa Abebe Shifera' -> 'dr-gosa-abebe-shifera'. */
function slugify(value: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'entry';
}

/**
 * Slugs are permanent public keys, so a new row never takes a slug another row
 * already holds — it gets a numeric suffix instead. `table` is one of two
 * literals in this file, never user input.
 */
async function uniqueSlug(table: 'doctors' | 'services', name: string): Promise<string> {
  const db = await getDb();
  const base = slugify(name);

  for (let suffix = 1; suffix < 100; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const result = await db
      .prepare(`SELECT id FROM ${table} WHERE slug = ?`)
      .bind(candidate)
      .all<{ id: number }>();
    if (!(result.results ?? []).length) return candidate;
  }

  return `${base}-${Date.now()}`;
}

function optional(value: FormDataEntryValue | null, max: number): string | null {
  const text = String(value ?? '').trim().slice(0, max);
  return text || null;
}

/* Doctors ---------------------------------------------------------------- */

export async function listDepartments(): Promise<DepartmentOption[]> {
  const db = await getDb();
  const result = await db
    .prepare('SELECT id, name, is_active FROM departments ORDER BY sort_order, name')
    .all<{ id: number; name: string; is_active: number }>();

  return (result.results ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    isActive: row.is_active === 1,
  }));
}

function mapDoctor(row: DoctorRow, memberships: MembershipRow[]): DoctorRecord {
  const departments = memberships
    .filter((m) => m.doctor_id === row.id)
    .map((m) => ({ id: m.department_id, name: m.name, isPrimary: m.is_primary === 1 }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    focus: row.focus,
    bioMd: row.bio_md,
    photoPath: row.photo_path,
    photoAlt: row.photo_alt,
    clinicNote: row.clinic_note,
    languages: parseLanguages(row.languages),
    acceptsAppointments: row.accepts_appointments === 1,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
    departments,
  };
}

export async function listDoctorsForStaff(): Promise<DoctorRecord[]> {
  const db = await getDb();

  const [doctorResult, membershipResult] = await Promise.all([
    db
      .prepare(
        `SELECT id, slug, name, role, focus, bio_md, photo_path, photo_alt, clinic_note,
                languages, accepts_appointments, is_active, sort_order, updated_at
           FROM doctors
          ORDER BY is_active DESC, sort_order, name`
      )
      .all<DoctorRow>(),
    db
      .prepare(
        `SELECT dd.doctor_id, dd.department_id, dep.name, dd.is_primary
           FROM doctor_departments dd
           JOIN departments dep ON dep.id = dd.department_id
          ORDER BY dd.is_primary DESC, dep.sort_order`
      )
      .all<MembershipRow>(),
  ]);

  const memberships = membershipResult.results ?? [];

  return (doctorResult.results ?? []).map((row) => mapDoctor(row, memberships));
}

export async function getDoctorForStaff(id: number): Promise<DoctorRecord | null> {
  const db = await getDb();

  const [doctorResult, membershipResult] = await Promise.all([
    db
      .prepare(
        `SELECT id, slug, name, role, focus, bio_md, photo_path, photo_alt, clinic_note,
                languages, accepts_appointments, is_active, sort_order, updated_at
           FROM doctors
          WHERE id = ?`
      )
      .bind(id)
      .all<DoctorRow>(),
    db
      .prepare(
        `SELECT dd.doctor_id, dd.department_id, dep.name, dd.is_primary
           FROM doctor_departments dd
           JOIN departments dep ON dep.id = dd.department_id
          WHERE dd.doctor_id = ?`
      )
      .bind(id)
      .all<MembershipRow>(),
  ]);

  const row = (doctorResult.results ?? [])[0];
  return row ? mapDoctor(row, membershipResult.results ?? []) : null;
}

export type DoctorInput = {
  id: number | null;
  name: string;
  role: string;
  focus: string;
  bioMd: string | null;
  photoPath: string | null;
  photoAlt: string | null;
  clinicNote: string;
  languages: string[];
  acceptsAppointments: boolean;
  sortOrder: number;
  departmentIds: number[];
  primaryDepartmentId: number | null;
};

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseDoctorForm(formData: FormData): Parsed<DoctorInput> {
  const text = (key: string) => String(formData.get(key) ?? '').trim();

  const name = text('name').slice(0, 120);
  const role = text('role').slice(0, 120);
  const focus = text('focus').slice(0, 240);

  if (!name) return { ok: false, error: 'A consultant needs a name.' };
  if (!role) return { ok: false, error: 'Add the role shown under the name, e.g. Consultant Pediatrician.' };
  if (!focus) return { ok: false, error: 'Add a one-line focus for the directory card.' };

  const idValue = Number(formData.get('id'));
  const id = Number.isInteger(idValue) && idValue > 0 ? idValue : null;

  const departmentIds = formData
    .getAll('departments')
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  // Blank means "first ticked", which is still one of the doctor's departments.
  // A named primary that is not ticked is refused rather than quietly replaced,
  // so a save can never move a consultant to a department they are not in.
  const primaryRaw = text('primary');
  let primaryDepartmentId: number | null = departmentIds[0] ?? null;

  if (primaryRaw) {
    const primaryValue = Number(primaryRaw);
    if (!Number.isInteger(primaryValue) || !departmentIds.includes(primaryValue)) {
      return {
        ok: false,
        error: 'The primary department must be one of the departments you ticked.',
      };
    }
    primaryDepartmentId = primaryValue;
  }

  const languages = text('languages')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 10);

  const sortValue = Number(formData.get('sortOrder'));
  const sortOrder = Number.isFinite(sortValue) ? Math.trunc(sortValue) : 0;

  return {
    ok: true,
    value: {
      id,
      name,
      role,
      focus,
      bioMd: optional(formData.get('bioMd'), 4000),
      photoPath: optional(formData.get('photoPath'), 300),
      photoAlt: optional(formData.get('photoAlt'), 200),
      clinicNote: text('clinicNote').slice(0, 200) || 'Clinic days — call to confirm',
      languages,
      acceptsAppointments: formData.get('acceptsAppointments') !== null,
      sortOrder,
      departmentIds,
      primaryDepartmentId,
    },
  };
}

/** Creates or updates a consultant, then rewrites their department links. */
export async function saveDoctor(input: DoctorInput): Promise<number> {
  const db = await getDb();
  const languages = JSON.stringify(input.languages);
  const accepts = input.acceptsAppointments ? 1 : 0;

  let id = input.id;

  if (id) {
    await db
      .prepare(
        `UPDATE doctors
            SET name = ?, role = ?, focus = ?, bio_md = ?, photo_path = ?, photo_alt = ?,
                clinic_note = ?, languages = ?, accepts_appointments = ?, sort_order = ?,
                updated_at = ${NOW}
          WHERE id = ?`
      )
      .bind(
        input.name,
        input.role,
        input.focus,
        input.bioMd,
        input.photoPath,
        input.photoAlt,
        input.clinicNote,
        languages,
        accepts,
        input.sortOrder,
        id
      )
      .run();
  } else {
    // A new consultant starts visible; hiding is a deliberate action on the list.
    const slug = await uniqueSlug('doctors', input.name);
    const result = await db
      .prepare(
        `INSERT INTO doctors
           (slug, name, role, focus, bio_md, photo_path, photo_alt, clinic_note, languages,
            accepts_appointments, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`
      )
      .bind(
        slug,
        input.name,
        input.role,
        input.focus,
        input.bioMd,
        input.photoPath,
        input.photoAlt,
        input.clinicNote,
        languages,
        accepts,
        input.sortOrder
      )
      .all<{ id: number }>();

    id = result.results?.[0]?.id ?? 0;
  }

  if (!id) throw new Error('The consultant could not be saved.');

  await db.prepare('DELETE FROM doctor_departments WHERE doctor_id = ?').bind(id).run();

  for (const departmentId of input.departmentIds) {
    await db
      .prepare(
        'INSERT INTO doctor_departments (doctor_id, department_id, is_primary) VALUES (?, ?, ?)'
      )
      .bind(id, departmentId, departmentId === input.primaryDepartmentId ? 1 : 0)
      .run();
  }

  return id;
}

/** Hides or restores a consultant. Never deletes the row. */
export async function setDoctorActive(id: number, active: boolean): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) return;

  const db = await getDb();
  await db
    .prepare(`UPDATE doctors SET is_active = ?, updated_at = ${NOW} WHERE id = ?`)
    .bind(active ? 1 : 0, id)
    .run();
}

/* Services --------------------------------------------------------------- */

export async function listServiceCategoryOptions(): Promise<ServiceCategoryOption[]> {
  const db = await getDb();
  const result = await db
    .prepare('SELECT id, name FROM service_categories ORDER BY sort_order, name')
    .all<{ id: number; name: string }>();

  return (result.results ?? []).map((row) => ({ id: row.id, name: row.name }));
}

function mapService(row: ServiceRow): ServiceRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    bodyMd: row.body_md,
    icon: row.icon,
    tag: row.tag_label,
    categoryId: row.category_id,
    categoryName: row.category_name,
    departmentId: row.department_id,
    departmentName: row.department_name,
    bookingDepartment: row.booking_department,
    ctaLabel: row.cta_label,
    ctaType: row.cta_type,
    isEmergency: row.is_emergency === 1,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

const SERVICE_QUERY = `SELECT s.id, s.slug, s.name, s.summary, s.body_md, s.icon, s.tag_label,
                              s.category_id, cat.name AS category_name, s.department_id,
                              dep.name AS department_name, s.booking_department,
                              s.cta_label, s.cta_type, s.is_emergency, s.is_active,
                              s.sort_order, s.updated_at
                         FROM services s
                         JOIN service_categories cat ON cat.id = s.category_id
                         LEFT JOIN departments dep ON dep.id = s.department_id`;

export async function listServicesForStaff(): Promise<ServiceRecord[]> {
  const db = await getDb();
  const result = await db
    .prepare(`${SERVICE_QUERY} ORDER BY cat.sort_order, s.sort_order, s.name`)
    .all<ServiceRow>();

  return (result.results ?? []).map(mapService);
}

export async function getServiceForStaff(id: number): Promise<ServiceRecord | null> {
  const db = await getDb();
  const result = await db.prepare(`${SERVICE_QUERY} WHERE s.id = ?`).bind(id).all<ServiceRow>();
  const row = (result.results ?? [])[0];
  return row ? mapService(row) : null;
}

export type ServiceInput = {
  id: number | null;
  name: string;
  summary: string;
  bodyMd: string | null;
  icon: string | null;
  tag: string | null;
  categoryId: number;
  departmentId: number | null;
  bookingDepartment: string | null;
  ctaLabel: string;
  ctaType: ServiceCtaType;
  isEmergency: boolean;
  sortOrder: number;
};

export function parseServiceForm(formData: FormData): Parsed<ServiceInput> {
  const text = (key: string) => String(formData.get(key) ?? '').trim();

  const name = text('name').slice(0, 120);
  const summary = text('summary').slice(0, 300);

  if (!name) return { ok: false, error: 'A service needs a name.' };
  if (!summary) return { ok: false, error: 'Add the one-line summary shown on the service card.' };

  const categoryId = Number(formData.get('categoryId'));
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { ok: false, error: 'Choose the category this service is listed under.' };
  }

  const idValue = Number(formData.get('id'));
  const id = Number.isInteger(idValue) && idValue > 0 ? idValue : null;

  const departmentValue = Number(formData.get('departmentId'));
  const departmentId =
    Number.isInteger(departmentValue) && departmentValue > 0 ? departmentValue : null;

  const ctaValue = String(formData.get('ctaType') ?? '');
  const ctaType = (CTA_TYPES as readonly string[]).includes(ctaValue)
    ? (ctaValue as ServiceCtaType)
    : 'appointment';

  const sortValue = Number(formData.get('sortOrder'));
  const sortOrder = Number.isFinite(sortValue) ? Math.trunc(sortValue) : 0;

  return {
    ok: true,
    value: {
      id,
      name,
      summary,
      bodyMd: optional(formData.get('bodyMd'), 8000),
      icon: optional(formData.get('icon'), 60),
      tag: optional(formData.get('tag'), 60),
      categoryId,
      departmentId,
      bookingDepartment: optional(formData.get('bookingDepartment'), 80),
      ctaLabel: text('ctaLabel').slice(0, 60) || 'Book this service',
      ctaType,
      isEmergency: formData.get('isEmergency') !== null,
      sortOrder,
    },
  };
}

export async function saveService(input: ServiceInput): Promise<number> {
  const db = await getDb();

  let id = input.id;

  if (id) {
    await db
      .prepare(
        `UPDATE services
            SET name = ?, summary = ?, body_md = ?, icon = ?, tag_label = ?, category_id = ?,
                department_id = ?, booking_department = ?, cta_label = ?, cta_type = ?,
                is_emergency = ?, sort_order = ?, updated_at = ${NOW}
          WHERE id = ?`
      )
      .bind(
        input.name,
        input.summary,
        input.bodyMd,
        input.icon,
        input.tag,
        input.categoryId,
        input.departmentId,
        input.bookingDepartment,
        input.ctaLabel,
        input.ctaType,
        input.isEmergency ? 1 : 0,
        input.sortOrder,
        id
      )
      .run();
  } else {
    const slug = await uniqueSlug('services', input.name);
    const result = await db
      .prepare(
        `INSERT INTO services
           (slug, name, summary, body_md, icon, tag_label, category_id, department_id,
            booking_department, cta_label, cta_type, is_emergency, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`
      )
      .bind(
        slug,
        input.name,
        input.summary,
        input.bodyMd,
        input.icon,
        input.tag,
        input.categoryId,
        input.departmentId,
        input.bookingDepartment,
        input.ctaLabel,
        input.ctaType,
        input.isEmergency ? 1 : 0,
        input.sortOrder
      )
      .all<{ id: number }>();

    id = result.results?.[0]?.id ?? 0;
  }

  if (!id) throw new Error('The service could not be saved.');
  return id;
}

/** Hides or restores a service. Never deletes the row. */
export async function setServiceActive(id: number, active: boolean): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) return;

  const db = await getDb();
  await db
    .prepare(`UPDATE services SET is_active = ?, updated_at = ${NOW} WHERE id = ?`)
    .bind(active ? 1 : 0, id)
    .run();
}
