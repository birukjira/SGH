'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import type { DepartmentChip, Doctor } from '@/lib/db';

type Props = {
  doctors: Doctor[];
  departments: DepartmentChip[];
};

function appointmentHref(doctor: Doctor) {
  const params = new URLSearchParams();
  if (doctor.primary) params.set('department', doctor.primary.appointmentLabel);
  params.set('doctor', doctor.name);
  return `/appointment?${params.toString()}`;
}

export function DoctorDirectory({ doctors, departments }: Props) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  // Keep the legacy ?department= behaviour (links from services and cards).
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('department');
    if (!value) return;
    const match = departments.find(
      (department) => department.slug.toLowerCase() === value.toLowerCase()
    );
    if (match) setFilter(match.slug);
  }, [departments]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesDepartment =
        filter === 'all' || doctor.departments.some((department) => department.slug === filter);
      if (!matchesDepartment) return false;
      if (!needle) return true;

      const haystack = [
        doctor.name,
        doctor.role,
        doctor.focus,
        ...doctor.departments.map((department) => department.label),
        ...doctor.languages,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [doctors, filter, query]);

  return (
    <>
      <div className="doctor-toolbar">
        <div className="chips" role="group" aria-label="Filter doctors by specialty">
          <button
            className="chip"
            type="button"
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {departments.map((department) => (
            <button
              key={department.slug}
              className="chip"
              type="button"
              aria-pressed={filter === department.slug}
              onClick={() => setFilter(department.slug)}
            >
              {department.label}
            </button>
          ))}
        </div>

        <div className="search-field">
          <Icon name="i-user" />
          <label className="sr-only" htmlFor="doctorSearch">Search doctors by name or specialty</label>
          <input
            id="doctorSearch"
            name="doctorSearch"
            type="search"
            placeholder="Search name or specialty"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <p className="filter-count" aria-live="polite" style={{ marginBottom: 20 }}>
        Showing <strong>{visible.length}</strong> consultants
      </p>

      <div className="doctor-grid" id="doctorGrid">
        {visible.map((doctor) => (
          <article className="doctor-card" key={doctor.slug}>
            <div className="doctor-card__top">
              <span className="avatar avatar--photo" aria-hidden="true">
                {doctor.photoPath ? (
                  <img
                    src={doctor.photoPath}
                    alt=""
                    width={112}
                    height={112}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  doctor.name.replace(/^Dr\.?\s*/, '').slice(0, 2).toUpperCase()
                )}
              </span>
              <div>
                <h3>{doctor.name}</h3>
                <p className="doctor-card__role">{doctor.role}</p>
              </div>
            </div>

            <p className="doctor-card__focus">{doctor.focus}</p>

            <div className="doctor-card__meta">
              <div>
                <Icon name="i-calendar" />
                {doctor.clinicNote}
              </div>
            </div>

            <div className="doctor-card__actions">
              <Link className="link-arrow" href={appointmentHref(doctor)}>
                Book a visit
                <Icon name="arrow" />
              </Link>
              <span className="doctor-card__langs">{doctor.primary?.label ?? ''}</span>
            </div>
          </article>
        ))}
      </div>

      <div className={`empty-state${visible.length === 0 ? ' is-visible' : ''}`} id="doctorEmpty">
        <strong>No consultants match your search.</strong>
        Try another specialty or call +251 111 132 702 — we&apos;ll help you find the right person.
      </div>
    </>
  );
}
