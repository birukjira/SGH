'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

const SLIDES = [
  {
    id: 'emergency',
    img: '/assets/img/hero-consult.webp',
    alt: 'A consultant explains scan results on a monitor during a clinical review.',
    width: 960,
    height: 1200,
    icon: 'cross',
    kicker: 'Emergency · 24/7',
    title: 'Emergency & critical care',
    copy: 'Chest pain, serious infection or an accident — assessed and stabilised the moment you arrive.',
    href: '/services#emergency',
    cta: 'Explore emergency care',
  },
  {
    id: 'obgyn',
    img: '/assets/img/room.webp',
    alt: 'A calm inpatient ward with beds, bedside cabinets and privacy curtains.',
    width: 1200,
    height: 900,
    icon: 'heart',
    kicker: 'Maternity & inpatient',
    title: "Maternity and women's health",
    copy: 'Antenatal care, safe delivery and comfortable rooms for recovery — with your family close.',
    href: '/services#obgyn',
    cta: 'Explore maternity care',
  },
  {
    id: 'surgery',
    img: '/assets/img/theatre.webp',
    alt: 'Two surgeons operating under theatre lights.',
    width: 1200,
    height: 800,
    icon: 'scalpel',
    kicker: 'Surgery',
    title: 'Operating theatres, ready',
    copy: 'General, laparoscopic and emergency procedures, with consultant anaesthetists on site.',
    href: '/services#surgery',
    cta: 'Explore surgery',
  },
  {
    id: 'radiology',
    img: '/assets/img/lab.webp',
    alt: 'A laboratory scientist checks samples on an analyser.',
    width: 1200,
    height: 800,
    icon: 'scan',
    kicker: 'Diagnostics',
    title: 'Lab and imaging on site',
    copy: 'Blood work, X-ray and ultrasound without leaving the campus — results explained by your doctor.',
    href: '/services#radiology',
    cta: 'Explore diagnostics',
  },
];

const INTERVAL = 6500;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState('');
  const swipeStart = useRef<number | null>(null);
  const total = SLIDES.length;

  const show = useCallback(
    (next: number, announce = false) => {
      const index = ((next % total) + total) % total;
      setCurrent(index);
      if (announce) setStatus(`Service ${index + 1} of ${total}: ${SLIDES[index].title}`);
    },
    [total]
  );

  // Autoplay, paused while the pointer or keyboard focus is inside the carousel.
  useEffect(() => {
    if (paused || total < 2) return;
    const timer = window.setInterval(() => setCurrent((i) => (i + 1) % total), INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, total, current]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <div
      className="hero__visual"
      data-carousel=""
      aria-roledescription="carousel"
      aria-label="Our services at Summit General Hospital"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== 'mouse') swipeStart.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (swipeStart.current === null) return;
        const delta = event.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(delta) > 40) show(current + (delta < 0 ? 1 : -1), true);
      }}
      onPointerCancel={() => {
        swipeStart.current = null;
      }}
    >
      <div className="hero__frame">
        {SLIDES.map((slide, index) => {
          const active = index === current;
          return (
            <div
              className={`hero__slide${active ? ' is-active' : ''}`}
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${total}: ${slide.title}`}
              aria-hidden={!active}
            >
              <img
                src={slide.img}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                fetchPriority={index === 0 ? 'high' : undefined}
                loading={index === 0 ? undefined : 'lazy'}
              />
              <div className="hero__slide-copy">
                <p className="hero__kicker">
                  <Icon name={slide.icon} />
                  {slide.kicker}
                </p>
                <h2>{slide.title}</h2>
                <p>{slide.copy}</p>
                <a className="hero__slide-link" href={slide.href} tabIndex={active ? 0 : -1}>
                  {slide.cta}
                  <Icon name="arrow" />
                </a>
              </div>
            </div>
          );
        })}

        <a className="hero__call" href="tel:+251111132702">
          <span className="hero__call-icon" aria-hidden="true">
            <Icon name="phone" />
          </span>
          <span className="hero__call-text">
            <small>Emergency &amp; ambulance</small>
            <strong>+251 111 132 702</strong>
          </span>
        </a>
      </div>

      <div className="hero__badge" aria-hidden="true">
        <strong>24/7</strong>
        <span>Emergency</span>
      </div>

      <div className="hero__controls">
        <div className="hero__dots" role="tablist" aria-label="Choose a service">
          {SLIDES.map((slide, index) => (
            <button
              className={`hero__dot${index === current ? ' is-active' : ''}`}
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={index === current}
              aria-label={slide.title}
              tabIndex={index === current ? 0 : -1}
              onClick={() => show(index, true)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  show(current + 1, true);
                } else if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  show(current - 1, true);
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  show(0, true);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  show(total - 1, true);
                }
              }}
            />
          ))}
        </div>
        <div className="hero__control-right">
          <p className="hero__count" aria-hidden="true">
            <strong>{String(current + 1).padStart(2, '0')}</strong> /{' '}
            {String(total).padStart(2, '0')}
          </p>
          <div className="hero__arrows">
            <button
              className="hero__arrow hero__arrow--prev"
              type="button"
              aria-label="Previous service"
              onClick={() => show(current - 1, true)}
            >
              <Icon name="arrow" />
            </button>
            <button
              className="hero__arrow"
              type="button"
              aria-label="Next service"
              onClick={() => show(current + 1, true)}
            >
              <Icon name="arrow" />
            </button>
          </div>
        </div>
        <p className="sr-only" role="status">
          {status}
        </p>
      </div>
    </div>
  );
}
