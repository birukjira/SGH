/* Summit General Hospital — newsletter popup */
(() => {
  'use strict';

  const modal = document.getElementById('subscribe');
  if (!modal) return;

  const card = modal.querySelector('.subscribe__card');
  const form = document.getElementById('subscribeForm');
  const email = document.getElementById('subscribeEmail');
  const consent = document.getElementById('subscribeConsent');
  const status = document.getElementById('subscribeStatus');
  const success = document.getElementById('subscribeSuccess');
  const submitButton = form ? form.querySelector('[type="submit"]') : null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DISMISS_KEY = 'sgh-subscribe-dismissed';
  const CLOSE_DAYS = 14;
  const SUBSCRIBED_DAYS = 3650;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  let lastFocused = null;
  let subscribed = false;
  let busy = false;

  const storage = (() => {
    try {
      const key = '__sgh';
      window.localStorage.setItem(key, '1');
      window.localStorage.removeItem(key);
      return window.localStorage;
    } catch (error) {
      return null;
    }
  })();

  const dismissed = () => {
    // Without storage, auto-opening would repeat on every page load.
    if (!storage) return true;
    const until = Number(storage.getItem(DISMISS_KEY) || 0);
    return until > Date.now();
  };

  const remember = (days) => {
    if (storage) storage.setItem(DISMISS_KEY, String(Date.now() + days * 864e5));
  };

  const setStatus = (message, type = '') => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', type === 'error');
  };

  const setFieldError = (field, message) => {
    const wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.add('has-error');
    const error = wrap.querySelector('.field__error');
    if (error) error.textContent = message;
    field.setAttribute('aria-invalid', 'true');
  };

  const clearFieldError = (field) => {
    const wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.remove('has-error');
    const error = wrap.querySelector('.field__error');
    if (error) error.textContent = '';
    field.removeAttribute('aria-invalid');
  };

  const setBodyLock = (locked) => {
    document.body.style.overflow = locked ? 'hidden' : '';
  };

  const open = (trigger) => {
    if (modal.classList.contains('is-open')) return;
    lastFocused = trigger || document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    void modal.offsetWidth;
    modal.classList.add('is-open');
    setBodyLock(true);
    window.setTimeout(() => {
      const target = subscribed ? $('.subscribe__success .btn', modal) : email;
      if (target) target.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 140);
  };

  const close = ({ restoreFocus = true } = {}) => {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    setBodyLock(false);
    if (!subscribed) remember(CLOSE_DAYS);

    const finish = () => {
      if (!modal.classList.contains('is-open')) modal.hidden = true;
    };
    if (reduceMotion) finish();
    else window.setTimeout(finish, 260);

    if (restoreFocus && lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  };

  $$('[data-subscribe-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => open(trigger));
  });

  $$('[data-subscribe-close]', modal).forEach((closer) => {
    closer.addEventListener('click', () => close());
  });

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab' || !card) return;
    const focusable = $$(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea',
      card
    ).filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* Auto-open once per visitor ----------------------------------------- */
  if (!dismissed() && form) {
    window.setTimeout(() => {
      const panel = document.getElementById('mobilePanel');
      if (panel && panel.classList.contains('is-open')) return;
      open(null);
    }, 9000);
  }

  /* Submit --------------------------------------------------------------- */
  if (!form || !email || !status) return;

  ['input', 'change'].forEach((type) => {
    form.addEventListener(type, (event) => {
      if (event.target === email || event.target === consent) clearFieldError(event.target);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;

    setStatus('');
    clearFieldError(email);
    if (consent) clearFieldError(consent);

    let firstInvalid = null;
    const value = email.value.trim();

    if (!value) {
      setFieldError(email, 'Please add your email address.');
      firstInvalid = email;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setFieldError(email, 'Enter a valid email address.');
      firstInvalid = email;
    }
    if (consent && !consent.checked) {
      setFieldError(consent, 'Please confirm you want to receive these emails.');
      firstInvalid = firstInvalid || consent;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    busy = true;
    const originalLabel = submitButton ? submitButton.innerHTML : '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.textContent = 'Subscribing…';
    }

    const succeed = () => {
      subscribed = true;
      remember(SUBSCRIBED_DAYS);
      form.hidden = true;
      if (success) success.hidden = false;
      setStatus('');
      const closeBtn = success ? $('.btn', success) : $('.subscribe__close', modal);
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    };

    try {
      if (window.location.protocol === 'file:') {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        succeed();
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      window.clearTimeout(timeout);

      let payload = null;
      try {
        payload = await response.json();
      } catch (error) {
        payload = null;
      }

      if (!response.ok || !payload || !payload.ok) {
        throw new Error((payload && payload.message) || 'Subscription failed.');
      }

      succeed();
    } catch (error) {
      setStatus(
        'We could not save your subscription just now. Please email info@summitgh.com.et and we will add you to the list.',
        'error'
      );
    } finally {
      busy = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
        submitButton.innerHTML = originalLabel;
      }
    }
  });
})();
