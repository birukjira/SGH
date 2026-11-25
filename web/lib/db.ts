import { getDb } from './d1';

/** Read-only D1 access for public pages. */

type DoctorRow = {
  id: number;
  slug: string;
  name: string;
  role: string;
  focus: string;
  photo_path: string | null;
  clinic_note: string;
  languages: string;
};

type ServiceRow = {
  slug: string;
  name: string;
  summary: string;
  icon: string | null;
  tag_label: string | null;
  booking_department: string | null;
  cta_label: string;
  cta_type: ServiceCtaType;
  is_emergency: number;
  category_slug: string;
};

type ServiceCategoryRow = {
  slug: string;
  name: string;
};

type MembershipRow = {
  doctor_id: number;
  slug: string;
  card_label: string;
  appointment_label: string;
  is_primary: number;
};

type DepartmentRow = {
  slug: string;
  filter_label: string;
};

export type DoctorDepartment = {
  slug: string;
  label: string;
  appointmentLabel: string;
  isPrimary: boolean;
};

export type Doctor = {
  id: number;
  slug: string;
  name: string;
  role: string;
  focus: string;
  photoPath: string | null;
  clinicNote: string;
  languages: string[];
  departments: DoctorDepartment[];
  primary: DoctorDepartment | null;
};

export type DepartmentChip = {
  slug: string;
  label: string;
};

type ServiceCtaType = 'appointment' | 'call' | 'contact';

export type Service = {
  slug: string;
  name: string;
  summary: string;
  icon: string | null;
  tag: string | null;
  categorySlug: string;
  bookingDepartment: string | null;
  ctaLabel: string;
  ctaType: ServiceCtaType;
  isEmergency: boolean;
};

export type ServiceCategory = {
  slug: string;
  label: string;
};

type TestimonialRow = {
  patient_name: string;
  patient_meta: string | null;
  quote: string;
};

export type Testimonial = {
  name: string;
  meta: string | null;
  quote: string;
  initials: string;
};

function initialsFor(name: string): string {
  return name
    .split(/[^A-Za-z]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function parseLanguages(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export async function getDoctors(): Promise<Doctor[]> {
  const db = await getDb();

  const [doctorResult, membershipResult] = await Promise.all([
    db
      .prepare(
        `SELECT id, slug, name, role, focus, photo_path, clinic_note, languages
           FROM doctors
          WHERE is_active = 1
          ORDER BY sort_order, name`
      )
      .all<DoctorRow>(),
    db
      .prepare(
        `SELECT dd.doctor_id, dep.slug, dep.card_label, dep.appointment_label, dd.is_primary
           FROM doctor_departments dd
           JOIN departments dep ON dep.id = dd.department_id
           JOIN doctors doc ON doc.id = dd.doctor_id
          WHERE doc.is_active = 1
          ORDER BY dd.is_primary DESC, dep.sort_order`
      )
      .all<MembershipRow>(),
  ]);

  const memberships = membershipResult.results ?? [];

  return (doctorResult.results ?? []).map((row) => {
    const departments = memberships
      .filter((m) => m.doctor_id === row.id)
      .map<DoctorDepartment>((m) => ({
        slug: m.slug,
        label: m.card_label,
        appointmentLabel: m.appointment_label,
        isPrimary: m.is_primary === 1,
      }));

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      role: row.role,
      focus: row.focus,
      photoPath: row.photo_path,
      clinicNote: row.clinic_note,
      languages: parseLanguages(row.languages),
      departments,
      primary: departments.find((d) => d.isPrimary) ?? departments[0] ?? null,
    };
  });
}

export async function getDepartmentChips(): Promise<DepartmentChip[]> {
  const db = await getDb();

  const result = await db
    .prepare(
      `SELECT slug, filter_label
         FROM departments
        WHERE is_active = 1
        ORDER BY sort_order`
    )
    .all<DepartmentRow>();

  return (result.results ?? []).map((row) => ({ slug: row.slug, label: row.filter_label }));
}

/**
 * The services directory. Filter chips come from getServiceCategories(), so no
 * category label is repeated on every row here.
 */
export async function getServices(): Promise<Service[]> {
  const db = await getDb();

  const result = await db
    .prepare(
      `SELECT s.slug, s.name, s.summary, s.icon, s.tag_label, s.booking_department,
              s.cta_label, s.cta_type, s.is_emergency, cat.slug AS category_slug
         FROM services s
         JOIN service_categories cat ON cat.id = s.category_id
        WHERE s.is_active = 1 AND cat.is_active = 1
        ORDER BY cat.sort_order, s.sort_order, s.name`
    )
    .all<ServiceRow>();

  return (result.results ?? []).map<Service>((row) => ({
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    icon: row.icon,
    tag: row.tag_label,
    categorySlug: row.category_slug,
    bookingDepartment: row.booking_department,
    ctaLabel: row.cta_label,
    ctaType: row.cta_type,
    isEmergency: row.is_emergency === 1,
  }));
}

export async function getTestimonials(limit = 3): Promise<Testimonial[]> {
  const db = await getDb();

  const result = await db
    .prepare(
      `SELECT patient_name, patient_meta, quote
         FROM testimonials
        WHERE is_published = 1
        ORDER BY is_featured DESC, sort_order, id
        LIMIT ?`
    )
    .bind(limit)
    .all<TestimonialRow>();

  return (result.results ?? []).map((row) => ({
    name: row.patient_name,
    meta: row.patient_meta,
    quote: row.quote,
    initials: initialsFor(row.patient_name),
  }));
}

export type BookingOption = {
  label: string;
  group: string;
};

type BookingRow = {
  service_name: string;
  booking_department: string | null;
  category_slug: string;
};

/**
 * Department choices for the appointment form: the emergency service by name,
 * then every service that accepts bookings, in service order.
 */
export async function getBookingDepartments(): Promise<BookingOption[]> {
  const db = await getDb();

  const result = await db
    .prepare(
      `SELECT s.name AS service_name, s.booking_department, cat.slug AS category_slug
         FROM services s
         JOIN service_categories cat ON cat.id = s.category_id
        WHERE s.is_active = 1 AND cat.is_active = 1
        ORDER BY cat.sort_order, s.sort_order`
    )
    .all<BookingRow>();

  const options: BookingOption[] = [];

  for (const row of result.results ?? []) {
    const label = row.category_slug === 'emergency' ? row.service_name : row.booking_department;
    if (!label || options.some((option) => option.label === label)) continue;

    const group =
      row.category_slug === 'emergency'
        ? 'Emergency'
        : row.category_slug === 'diagnostics' || row.category_slug === 'support'
          ? 'Diagnostics and rehabilitation'
          : row.booking_department && ['Obstetrics & Gynecology', 'General & Laparoscopic Surgery', 'Orthopedics & Trauma'].includes(row.booking_department)
            ? "Surgery and women's health"
            : 'Medical specialties';

    options.push({ label, group });
  }

  return options;
}

/** Filter chips for /services; empty categories are left out. */
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const db = await getDb();

  const result = await db
    .prepare(
      `SELECT c.slug, c.name
         FROM service_categories c
        WHERE c.is_active = 1
          AND EXISTS (
                SELECT 1 FROM services s
                 WHERE s.category_id = c.id AND s.is_active = 1
              )
        ORDER BY c.sort_order`
    )
    .all<ServiceCategoryRow>();

  return (result.results ?? []).map((row) => ({ slug: row.slug, label: row.name }));
}
