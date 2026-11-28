import { getDb } from './mongo';

/** Read-only MongoDB access for public pages. */

type DoctorDoc = {
  id: number;
  slug: string;
  name: string;
  role: string;
  focus: string;
  photo_path: string | null;
  clinic_note: string;
  languages: string[] | string;
  is_active: number;
  sort_order: number;
};

type DepartmentDoc = {
  id: number;
  slug: string;
  name: string;
  filter_label: string;
  appointment_label: string;
  card_label: string;
  is_active: number;
  sort_order: number;
};

type MembershipDoc = {
  doctor_id: number;
  department_id: number;
  is_primary: number;
};

type ServiceDoc = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  icon: string | null;
  tag_label: string | null;
  booking_department: string | null;
  cta_label: string;
  cta_type: ServiceCtaType;
  is_emergency: number;
  is_active: number;
  category_id: number;
  sort_order: number;
};

type CategoryDoc = {
  id: number;
  slug: string;
  name: string;
  is_active: number;
  sort_order: number;
};

type TestimonialDoc = {
  patient_name: string;
  patient_meta: string | null;
  quote: string;
  is_published: number;
  is_featured: number;
  sort_order: number;
  id: number;
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

/** Accepts the stored array; older rows may still hold the JSON string form. */
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

export async function getDoctors(): Promise<Doctor[]> {
  const db = await getDb();

  const [doctors, memberships, departments] = await Promise.all([
    db
      .collection<DoctorDoc>('doctors')
      .find({ is_active: 1 })
      .sort({ sort_order: 1, name: 1 })
      .toArray(),
    db.collection<MembershipDoc>('doctor_departments').find({}).toArray(),
    db.collection<DepartmentDoc>('departments').find({}).toArray(),
  ]);

  const departmentById = new Map(departments.map((row) => [row.id, row]));

  return doctors.map((doctor) => {
    const links: { membership: MembershipDoc; department: DepartmentDoc }[] = [];

    for (const membership of memberships) {
      if (membership.doctor_id !== doctor.id) continue;

      const department = departmentById.get(membership.department_id);
      if (!department || department.is_active !== 1) continue;

      links.push({ membership, department });
    }

    const departmentsForDoctor: DoctorDepartment[] = links
      .sort(
        (a, b) =>
          b.membership.is_primary - a.membership.is_primary ||
          a.department.sort_order - b.department.sort_order
      )
      .map(({ membership, department }) => ({
        slug: department.slug,
        label: department.card_label,
        appointmentLabel: department.appointment_label,
        isPrimary: membership.is_primary === 1,
      }));

    return {
      id: doctor.id,
      slug: doctor.slug,
      name: doctor.name,
      role: doctor.role,
      focus: doctor.focus,
      photoPath: doctor.photo_path,
      clinicNote: doctor.clinic_note,
      languages: parseLanguages(doctor.languages),
      departments: departmentsForDoctor,
      primary: departmentsForDoctor.find((d) => d.isPrimary) ?? departmentsForDoctor[0] ?? null,
    };
  });
}

export async function getDepartmentChips(): Promise<DepartmentChip[]> {
  const db = await getDb();

  const rows = await db
    .collection<DepartmentDoc>('departments')
    .find({ is_active: 1 })
    .sort({ sort_order: 1 })
    .toArray();

  return rows.map((row) => ({ slug: row.slug, label: row.filter_label }));
}

/**
 * The services directory. Filter chips come from getServiceCategories(), so no
 * category label is repeated on every row here.
 */
export async function getServices(): Promise<Service[]> {
  const db = await getDb();

  const [services, categories] = await Promise.all([
    db.collection<ServiceDoc>('services').find({ is_active: 1 }).toArray(),
    db.collection<CategoryDoc>('service_categories').find({}).toArray(),
  ]);

  const categoryById = new Map(categories.map((row) => [row.id, row]));

  return services
    .flatMap((service) => {
      const category = categoryById.get(service.category_id);
      if (!category || category.is_active !== 1) return [];

      return [
        {
          category,
          sortOrder: service.sort_order,
          service: {
            slug: service.slug,
            name: service.name,
            summary: service.summary,
            icon: service.icon,
            tag: service.tag_label,
            categorySlug: category.slug,
            bookingDepartment: service.booking_department,
            ctaLabel: service.cta_label,
            ctaType: service.cta_type,
            isEmergency: service.is_emergency === 1,
          },
        },
      ];
    })
    .sort(
      (a, b) =>
        a.category.sort_order - b.category.sort_order ||
        a.sortOrder - b.sortOrder ||
        a.service.name.localeCompare(b.service.name)
    )
    .map((entry) => entry.service);
}

export async function getTestimonials(limit = 3): Promise<Testimonial[]> {
  const db = await getDb();

  const rows = await db
    .collection<TestimonialDoc>('testimonials')
    .find({ is_published: 1 })
    .sort({ is_featured: -1, sort_order: 1, id: 1 })
    .limit(limit)
    .toArray();

  return rows.map((row) => ({
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

/**
 * Department choices for the appointment form: the emergency service by name,
 * then every service that accepts bookings, in service order.
 */
export async function getBookingDepartments(): Promise<BookingOption[]> {
  const db = await getDb();

  const [services, categories] = await Promise.all([
    db.collection<ServiceDoc>('services').find({ is_active: 1 }).toArray(),
    db.collection<CategoryDoc>('service_categories').find({}).toArray(),
  ]);

  const categoryById = new Map(categories.map((row) => [row.id, row]));

  const ordered = services
    .flatMap((service) => {
      const category = categoryById.get(service.category_id);
      if (!category || category.is_active !== 1) return [];
      return [{ service, category }];
    })
    .sort(
      (a, b) =>
        a.category.sort_order - b.category.sort_order ||
        a.service.sort_order - b.service.sort_order ||
        a.service.name.localeCompare(b.service.name)
    );

  const options: BookingOption[] = [];

  for (const { service, category } of ordered) {
    const label = category.slug === 'emergency' ? service.name : service.booking_department;
    if (!label || options.some((option) => option.label === label)) continue;

    const group =
      category.slug === 'emergency'
        ? 'Emergency'
        : category.slug === 'diagnostics' || category.slug === 'support'
          ? 'Diagnostics and rehabilitation'
          : service.booking_department &&
              [
                'Obstetrics & Gynecology',
                'General & Laparoscopic Surgery',
                'Orthopedics & Trauma',
              ].includes(service.booking_department)
            ? "Surgery and women's health"
            : 'Medical specialties';

    options.push({ label, group });
  }

  return options;
}

/** Filter chips for /services; empty categories are left out. */
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const db = await getDb();

  const [categories, used] = await Promise.all([
    db
      .collection<CategoryDoc>('service_categories')
      .find({ is_active: 1 })
      .sort({ sort_order: 1 })
      .toArray(),
    db
      .collection<ServiceDoc>('services')
      .find({ is_active: 1 }, { projection: { category_id: 1 } })
      .toArray(),
  ]);

  const usedIds = new Set(used.map((row) => row.category_id));

  return categories
    .filter((category) => usedIds.has(category.id))
    .map((row) => ({ slug: row.slug, label: row.name }));
}
