'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';

const NAV = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'about', href: '/about', label: 'About' },
  { key: 'services', href: '/services', label: 'Services' },
  { key: 'doctors', href: '/doctors', label: 'Doctors' },
  { key: 'visit', href: '/visit', label: 'Your visit' },
  { key: 'contact', href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="topbar">
        <div className="wrap topbar__inner">
          <a className="topbar__emergency" href="tel:+251111132702">
            <span className="pulse-dot" aria-hidden="true" />
            <span>24/7 Emergency &amp; Ambulance</span>
            <strong>+251 111 132 702</strong>
          </a>
          <div className="topbar__meta">
            <span className="topbar__addr">
              <Icon name="pin" />
              Summit 72, Lemi Kura, Addis Ababa
            </span>
            <a href="mailto:info@summitgh.com.et">info@summitgh.com.et</a>
          </div>
        </div>
      </div>

      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`} id="siteHeader">
        <div className="wrap header__inner">
          <Link className="brand" href="/" aria-label="Summit General Hospital — home">
            <img src="/assets/img/logo-full.svg" alt="Summit General Hospital" width={117} height={46} />
          </Link>

          <nav className="nav" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.key}
                className={`nav__link${isActive(item.href) ? ' is-active' : ''}`}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <a className="header__phone" href="tel:+251111132702">
              <Icon name="phone" />
              <span>+251 111 132 702</span>
            </a>
            <Link className="btn btn--primary btn--sm header__book" href="/appointment">
              Book appointment
              <Icon name="arrow" />
            </Link>
            <button
              className="menu-toggle"
              type="button"
              aria-expanded={open}
              aria-controls="mobilePanel"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((value) => !value)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`panel${open ? ' is-open' : ''}`}
        id="mobilePanel"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="wrap panel__top">
          <Link className="brand" href="/" aria-label="Summit General Hospital — home">
            <img src="/assets/img/logo-white.svg" alt="Summit General Hospital" width={122} height={48} />
          </Link>
          <button className="panel__close" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            <Icon name="close" />
          </button>
        </div>

        <nav className="panel__nav wrap" aria-label="Mobile">
          {NAV.map((item, index) => (
            <Link
              key={item.key}
              className={`panel__link${isActive(item.href) ? ' is-active' : ''}`}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="panel__foot wrap">
          <a href="tel:+251111132702">
            <span className="panel__label">24/7 Emergency &amp; Ambulance</span>
            <strong>+251 111 132 702</strong>
          </a>
          <a href="mailto:info@summitgh.com.et">info@summitgh.com.et</a>
          <p>Summit 72, Lemi Kura, Addis Ababa, Ethiopia</p>
        </div>
      </div>
    </>
  );
}
