import { getDb, nextId, nowIso } from './mongo';

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
  languages: string[] | string;
  accepts_appointments: number;
  is_active: number;
  sort_order: number;
  updated_at: string;
};

type MembershipDoc = {
  doctor_id: number;
  department_id: number;
  is_primary: number;
};

/** A membership with its department name, as the staff screens show it. */
type MembershipRow = MembershipDoc & { name: string };

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
  department_id: number | null;
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

function parseLanguages(value: unknown): string[] {
  let parsed: unknown = value;

  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }

  return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
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
  const collection = db.collection(table);

  for (let suffix = 1; suffix < 100; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const existing = await collection.findOne({ slug: candidate }, { projection: { _id: 1 } });
    if (!existing) return candidate;
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
  const rows = await db
    .collection<{ id: number; name: string; is_active: number }>('departments')
    .find({})
    .sort({ sort_order: 1, name: 1 })
    .toArray();

  return rows.map((row) => ({
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

  const [doctors, memberships, departments] = await Promise.all([
    db
      .collection<DoctorRow>('doctors')
      .find({})
      .sort({ is_active: -1, sort_order: 1, name: 1 })
      .toArray(),
    db.collection<MembershipDoc>('doctor_departments').find({}).toArray(),
    db
      .collection<{ id: number; name: string; sort_order: number }>('departments')
      .find({})
      .toArray(),
  ]);

  const departmentById = new Map(departments.map((row) => [row.id, row]));

  const named: MembershipRow[] = memberships.map((row) => ({
    ...row,
    name: departmentById.get(row.department_id)?.name ?? 'Unknown department',
  }));

  named.sort((a, b) => {
    const aDepartment = departmentById.get(a.department_id);
    const bDepartment = departmentById.get(b.department_id);
    return (
      b.is_primary - a.is_primary ||
      (aDepartment?.sort_order ?? 0) - (bDepartment?.sort_order ?? 0)
    );
  });

  return doctors.map((row) => mapDoctor(row, named));
}

export async function getDoctorForStaff(id: number): Promise<DoctorRecord | null> {
  const db = await getDb();

  const [row, membershipRows, departments] = await Promise.all([
    db.collection<DoctorRow>('doctors').findOne({ id }),
    db.collection<MembershipDoc>('doctor_departments').find({ doctor_id: id }).toArray(),
    db
      .collection<{ id: number; name: string }>('departments')
      .find({}, { projection: { id: 1, name: 1 } })
      .toArray(),
  ]);

  if (!row) return null;

  const departmentById = new Map(departments.map((department) => [department.id, department]));
  const memberships: MembershipRow[] = membershipRows.map((membership) => ({
    ...membership,
    name: departmentById.get(membership.department_id)?.name ?? 'Unknown department',
  }));

  return mapDoctor(row, memberships);
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

  const fields = {
    name: input.name,
    role: input.role,
    focus: input.focus,
    bio_md: input.bioMd,
    photo_path: input.photoPath,
    photo_alt: input.photoAlt,
    clinic_note: input.clinicNote,
    languages: input.languages,
    accepts_appointments: input.acceptsAppointments ? 1 : 0,
    sort_order: input.sortOrder,
    updated_at: nowIso(),
  };

  let id = input.id;

  if (id) {
    await db.collection('doctors').updateOne({ id }, { $set: fields });
  } else {
    // A new consultant starts visible; hiding is a deliberate action on the list.
    const slug = await uniqueSlug('doctors', input.name);
    id = await nextId(db, 'doctors');

    await db.collection('doctors').insertOne({
      ...fields,
      id,
      slug,
      is_active: 1,
      created_at: nowIso(),
    });
  }

  if (!id) throw new Error('The consultant could not be saved.');

  await db.collection('doctor_departments').deleteMany({ doctor_id: id });

  if (input.departmentIds.length > 0) {
    await db.collection('doctor_departments').insertMany(
      input.departmentIds.map((departmentId) => ({
        doctor_id: id,
        department_id: departmentId,
        is_primary: departmentId === input.primaryDepartmentId ? 1 : 0,
      }))
    );
  }

  return id;
}

/** Hides or restores a consultant. Never deletes the row. */
export async function setDoctorActive(id: number, active: boolean): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) return;

  const db = await getDb();
  await db
    .collection('doctors')
    .updateOne({ id }, { $set: { is_active: active ? 1 : 0, updated_at: nowIso() } });
}

/* Services --------------------------------------------------------------- */

export async function listServiceCategoryOptions(): Promise<ServiceCategoryOption[]> {
  const db = await getDb();
  const rows = await db
    .collection<{ id: number; name: string }>('service_categories')
    .find({})
    .sort({ sort_order: 1, name: 1 })
    .toArray();

  return rows.map((row) => ({ id: row.id, name: row.name }));
}

function mapService(
  row: ServiceRow,
  categoryName: string,
  departmentName: string | null
): ServiceRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    bodyMd: row.body_md,
    icon: row.icon,
    tag: row.tag_label,
    categoryId: row.category_id,
    categoryName,
    departmentId: row.department_id,
    departmentName,
    bookingDepartment: row.booking_department,
    ctaLabel: row.cta_label,
    ctaType: row.cta_type,
    isEmergency: row.is_emergency === 1,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

async function categoryAndDepartmentNames(rows: ServiceRow[]): Promise<{
  categories: Map<number, { name: string; sort_order: number }>;
  departments: Map<number, string>;
}> {
  const db = await getDb();
  const departmentIds = rows
    .map((row) => row.department_id)
    .filter((id): id is number => typeof id === 'number');

  const [categories, departments] = await Promise.all([
    db
      .collection<{ id: number; name: string; sort_order: number }>('service_categories')
      .find({}, { projection: { id: 1, name: 1, sort_order: 1 } })
      .toArray(),
    db
      .collection<{ id: number; name: string }>('departments')
      .find({ id: { $in: departmentIds } }, { projection: { id: 1, name: 1 } })
      .toArray(),
  ]);

  return {
    categories: new Map(categories.map((row) => [row.id, { name: row.name, sort_order: row.sort_order }])),
    departments: new Map(departments.map((row) => [row.id, row.name])),
  };
}

export async function listServicesForStaff(): Promise<ServiceRecord[]> {
  const db = await getDb();
  const rows = await db.collection<ServiceRow>('services').find({}).toArray();
  const { categories, departments } = await categoryAndDepartmentNames(rows);

  return rows
    .map((row) => ({
      record: mapService(
        row,
        categories.get(row.category_id)?.name ?? 'Uncategorised',
        row.department_id ? departments.get(row.department_id) ?? null : null
      ),
      categoryOrder: categories.get(row.category_id)?.sort_order ?? 0,
    }))
    .sort(
      (a, b) =>
        a.categoryOrder - b.categoryOrder ||
        a.record.sortOrder - b.record.sortOrder ||
        a.record.name.localeCompare(b.record.name)
    )
    .map((entry) => entry.record);
}

export async function getServiceForStaff(id: number): Promise<ServiceRecord | null> {
  const db = await getDb();
  const row = await db.collection<ServiceRow>('services').findOne({ id });
  if (!row) return null;

  const { categories, departments } = await categoryAndDepartmentNames([row]);

  return mapService(
    row,
    categories.get(row.category_id)?.name ?? 'Uncategorised',
    row.department_id ? departments.get(row.department_id) ?? null : null
  );
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

  const fields = {
    name: input.name,
    summary: input.summary,
    body_md: input.bodyMd,
    icon: input.icon,
    tag_label: input.tag,
    category_id: input.categoryId,
    department_id: input.departmentId,
    booking_department: input.bookingDepartment,
    cta_label: input.ctaLabel,
    cta_type: input.ctaType,
    is_emergency: input.isEmergency ? 1 : 0,
    sort_order: input.sortOrder,
    updated_at: nowIso(),
  };

  let id = input.id;

  if (id) {
    await db.collection('services').updateOne({ id }, { $set: fields });
  } else {
    const slug = await uniqueSlug('services', input.name);
    id = await nextId(db, 'services');

    await db.collection('services').insertOne({
      ...fields,
      id,
      slug,
      is_active: 1,
      created_at: nowIso(),
    });
  }

  if (!id) throw new Error('The service could not be saved.');
  return id;
}

/** Hides or restores a service. Never deletes the row. */
export async function setServiceActive(id: number, active: boolean): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) return;

  const db = await getDb();
  await db
    .collection('services')
    .updateOne({ id }, { $set: { is_active: active ? 1 : 0, updated_at: nowIso() } });
}
