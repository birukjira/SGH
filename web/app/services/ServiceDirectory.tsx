'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import type { Service, ServiceCategory } from '@/lib/db';

type Props = {
  services: Service[];
  categories: ServiceCategory[];
};

const PHONE = 'tel:+251111132702';

/** Appointment requests go to the form; test and pharmacy enquiries to /contact. */
function ctaHref(service: Service) {
  if (service.ctaType === 'call') return PHONE;
  if (service.ctaType === 'contact') return '/contact';

  const params = new URLSearchParams();
  if (service.bookingDepartment) params.set('department', service.bookingDepartment);
  const query = params.toString();
  return query ? `/appointment?${query}` : '/appointment';
}

function tagClass(service: Service) {
  if (service.isEmergency) return 'tag tag--clay';
  if (service.categorySlug === 'clinical') return 'tag';
  return 'tag tag--gold';
}

export function ServiceDirectory({ services, categories }: Props) {
  const [filter, setFilter] = useState('all');

  const chips = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        count: services.filter((service) => service.categorySlug === category.slug).length,
      })),
    [categories, services]
  );

  const visible = useMemo(
    () => (filter === 'all' ? services : services.filter((s) => s.categorySlug === filter)),
    [services, filter]
  );

  return (
    <>
      <div className="filter-bar">
        <div className="chips" role="group" aria-label="Filter services by type">
          <button
            className="chip"
            type="button"
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All <span>{services.length}</span>
          </button>
          {chips.map((category) => (
            <button
              key={category.slug}
              className="chip"
              type="button"
              aria-pressed={filter === category.slug}
              onClick={() => setFilter(category.slug)}
            >
              {category.label} <span>{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="filter-count" aria-live="polite" style={{ marginBottom: 20 }}>
        Showing <strong>{visible.length}</strong> of {services.length} services
      </p>

      <div className="service-grid" id="serviceGrid">
        {visible.map((service) => (
          <article
            className={`service-card${service.isEmergency ? ' service-card--emergency' : ''}`}
            id={service.slug}
            data-category={service.categorySlug}
            key={service.slug}
          >
            <div className="service-card__top">
              <span className="service-card__icon" aria-hidden="true">
                <Icon name={service.icon ?? 'i-cross'} />
              </span>
              {service.tag ? <span className={tagClass(service)}>{service.tag}</span> : null}
            </div>
            <h3>{service.name}</h3>
            <p>{service.summary}</p>
            {service.ctaType === 'call' ? (
              <a className="service-card__link" href={ctaHref(service)}>
                {service.ctaLabel}
                <Icon name="phone" />
              </a>
            ) : (
              <Link className="service-card__link" href={ctaHref(service)}>
                {service.ctaLabel}
                <Icon name="arrow" />
              </Link>
            )}
          </article>
        ))}
      </div>

      <div className={`empty-state${visible.length === 0 ? ' is-visible' : ''}`}>
        <strong>No services in this category yet.</strong>
        Please call us on +251 111 132 702 and we&apos;ll help you find the right team.
      </div>
    </>
  );
}
