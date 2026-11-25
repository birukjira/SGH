/* Summit General Hospital — core interactions */
(() => {
  'use strict';

  const doc = document;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (sel, ctx = doc) => ctx.querySelector(sel);
  const $$ = (sel, ctx = doc) => Array.from(ctx.querySelectorAll(sel));

  /* Header shadow ------------------------------------------------------- */
  const header = $('#siteHeader');
  if (header) {
    const setHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
    setHeader();
    window.addEventListener('scroll', setHeader, { passive: true });
  }

  /* Mobile navigation --------------------------------------------------- */
  const panel = $('#mobilePanel');
  const menuToggle = $('.menu-toggle');
  const panelClose = $('.panel__close');

  if (panel && menuToggle) {
    let lastFocused = null;

    const openPanel = () => {
      lastFocused = doc.activeElement;
      panel.classList.add('is-open');
      panel.removeAttribute('inert');
      panel.setAttribute('aria-hidden', 'false');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close menu');
      doc.body.style.overflow = 'hidden';
      window.setTimeout(() => {
        const first = panel.querySelector('a, button');
        if (first) first.focus({ preventScroll: true });
      }, 120);
    };

    const closePanel = ({ restoreFocus = true } = {}) => {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open menu');
      doc.body.style.overflow = '';
      if (restoreFocus && lastFocused) lastFocused.focus({ preventScroll: true });
    };

    menuToggle.addEventListener('click', () => {
      if (panel.classList.contains('is-open')) closePanel();
      else openPanel();
    });

    if (panelClose) panelClose.addEventListener('click', () => closePanel());

    $$('a', panel).forEach((link) => {
      link.addEventListener('click', () => closePanel({ restoreFocus: false }));
    });

    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        closePanel();
      }
    });

    panel.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = $$('a[href], button:not([disabled]), input, select, textarea', panel).filter(
        (el) => el.offsetParent !== null
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const desktopQuery = window.matchMedia('(min-width: 1001px)');
    const handleDesktop = (event) => {
      if (event.matches && panel.classList.contains('is-open')) closePanel({ restoreFocus: false });
    };
    if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', handleDesktop);
  }

  /* Hero service carousel ----------------------------------------------- */
  const carousel = $('[data-carousel]');

  if (carousel) {
    const slides = $$('[data-slide]', carousel);
    const dots = $$('[data-slide-to]', carousel);
    const count = $('[data-carousel-count]', carousel);
    const status = $('[data-carousel-status]', carousel);
    const prevBtn = $('[data-carousel-prev]', carousel);
    const nextBtn = $('[data-carousel-next]', carousel);
    const total = slides.length;
    const INTERVAL = 6500;
    let current = 0;
    let timer = null;

    const paint = () => {
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        $$('a, button', slide).forEach((el) => {
          el.tabIndex = active ? 0 : -1;
        });
      });
      dots.forEach((dot, i) => {
        const active = i === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', String(active));
        dot.tabIndex = active ? 0 : -1;
      });
      if (count) count.textContent = String(current + 1).padStart(2, '0');
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const show = (next, { announce = false } = {}) => {
      current = (next + total) % total;
      paint();
      if (announce && status && dots[current]) {
        status.textContent = `Service ${current + 1} of ${total}: ${dots[current].getAttribute('aria-label')}`;
      }
    };

    const start = () => {
      stop();
      if (total < 2) return;
      // Reduced motion still advances the slides; the base CSS drops the
      // crossfade and image zoom to a near-instant swap for those visitors.
      timer = window.setInterval(() => show(current + 1), INTERVAL);
    };

    const userShow = (next) => {
      show(next, { announce: true });
      start();
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => userShow(i));
      dot.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          userShow(current + 1);
          dots[current].focus();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          userShow(current - 1);
          dots[current].focus();
        } else if (event.key === 'Home') {
          event.preventDefault();
          userShow(0);
          dots[0].focus();
        } else if (event.key === 'End') {
          event.preventDefault();
          userShow(total - 1);
          dots[total - 1].focus();
        }
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', () => userShow(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => userShow(current + 1));

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) start();
    });

    doc.addEventListener('visibilitychange', () => {
      if (doc.hidden) stop();
      else start();
    });

    let swipeStart = null;
    carousel.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse') swipeStart = event.clientX;
    });
    carousel.addEventListener('pointerup', (event) => {
      if (swipeStart === null) return;
      const delta = event.clientX - swipeStart;
      swipeStart = null;
      if (Math.abs(delta) > 40) userShow(current + (delta < 0 ? 1 : -1));
    });
    carousel.addEventListener('pointercancel', () => {
      swipeStart = null;
    });

    paint();
    start();
  }

  /* Reveal on scroll ---------------------------------------------------- */
  const revealItems = $$('[data-reveal]');
  if (revealItems.length) {
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
      doc.documentElement.classList.add('js-reveal');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );
      revealItems.forEach((item, index) => {
        if (!item.style.getPropertyValue('--delay')) {
          item.style.setProperty('--delay', `${(index % 3) * 0.07}s`);
        }
        observer.observe(item);
      });
      window.setTimeout(() => {
        revealItems.forEach((item) => {
          if (item.getBoundingClientRect().top < window.innerHeight) item.classList.add('is-in');
        });
      }, 2500);
    }
  }

  /* Services filter ----------------------------------------------------- */
  const serviceGrid = $('#serviceGrid');
  if (serviceGrid) {
    const chips = $$('[data-filter]');
    const cards = $$('[data-category]', serviceGrid);
    const countEl = $('#serviceCount');
    const emptyEl = $('#serviceEmpty');
    let currentFilter = 'all';

    const applyFilter = (filter) => {
      currentFilter = filter;
      let visible = 0;
      cards.forEach((card) => {
        const categories = (card.dataset.category || '').split(/\s+/);
        const show = filter === 'all' || categories.includes(filter);
        card.hidden = !show;
        if (show) visible += 1;
      });
      chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter)));
      if (countEl) countEl.textContent = String(visible);
      if (emptyEl) emptyEl.classList.toggle('is-visible', visible === 0);
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => applyFilter(chip.dataset.filter));
    });

    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      const target = doc.getElementById(initialHash);
      if (target && target.matches('[data-category]')) applyFilter('all');
    }
  }

  /* Doctor directory ---------------------------------------------------- */
  const doctorGrid = $('#doctorGrid');
  if (doctorGrid) {
    const cards = $$('.doctor-card', doctorGrid);
    const chips = $$('[data-doctor-filter]');
    const search = $('#doctorSearch');
    const countEl = $('#doctorCount');
    const emptyEl = $('#doctorEmpty');
    let activeFilter = 'all';

    const applyDoctors = () => {
      const query = (search ? search.value : '').trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const departments = (card.dataset.department || '').toLowerCase().split('|');
        const haystack = `${card.dataset.name || ''} ${card.dataset.specialty || ''} ${card.dataset.focus || ''}`.toLowerCase();
        const matchesFilter = activeFilter === 'all' || departments.includes(activeFilter);
        const matchesQuery = !query || haystack.includes(query);
        const show = matchesFilter && matchesQuery;
        card.hidden = !show;
        if (show) visible += 1;
      });

      chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.doctorFilter === activeFilter)));
      if (countEl) countEl.textContent = String(visible);
      if (emptyEl) emptyEl.classList.toggle('is-visible', visible === 0);
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.doctorFilter;
        applyDoctors();
      });
    });

    if (search) {
      search.addEventListener('input', applyDoctors);
    }

    const params = new URLSearchParams(window.location.search);
    const deptParam = params.get('department');
    if (deptParam) {
      const match = chips.find((chip) => chip.dataset.doctorFilter.toLowerCase() === deptParam.toLowerCase());
      if (match) {
        activeFilter = match.dataset.doctorFilter;
        match.click();
      }
    }
  }

  /* Thank-you reference ------------------------------------------------- */
  const thankYouRef = document.getElementById('thankYouRef');
  if (thankYouRef) {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) {
      thankYouRef.textContent = `Reference: ${ref}`;
      thankYouRef.hidden = false;
    }
  }

  /* Footer year fallback ------------------------------------------------ */
  $$('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
