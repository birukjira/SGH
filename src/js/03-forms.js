/* Summit General Hospital — general contact form */
(() => {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('contactStatus');
  const submitButton = form.querySelector('[type="submit"]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let submitting = false;

  const invalidClass = 'has-error';

  const setError = (field, message) => {
    const wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.add(invalidClass);
    let error = wrap.querySelector('.field__error');
    if (!error) {
      error = document.createElement('span');
      error.className = 'field__error';
      error.setAttribute('role', 'alert');
      wrap.appendChild(error);
    }
    error.textContent = message;
    field.setAttribute('aria-invalid', 'true');
  };

  const clearError = (field) => {
    const wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.remove(invalidClass);
    const error = wrap.querySelector('.field__error');
    if (error) error.textContent = '';
    field.removeAttribute('aria-invalid');
  };

  const showStatus = (message, type) => {
    if (!status) return;
    status.textContent = message;
    status.className = `contact-form-status is-${type}`;
  };

  const validate = () => {
    const name = form.elements.contactName;
    const email = form.elements.contactEmail;
    const message = form.elements.contactMessage;
    const consent = form.elements.contactConsent;
    let firstInvalid = null;

    [name, email, message, consent].forEach((field) => {
      if (field) clearError(field);
    });

    if (!name.value.trim()) {
      setError(name, 'Please tell us your name.');
      firstInvalid = firstInvalid || name;
    }
    if (!email.value.trim()) {
      setError(email, 'Please add an email address so we can reply.');
      firstInvalid = firstInvalid || email;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      setError(email, 'Enter a valid email address.');
      firstInvalid = firstInvalid || email;
    }
    if (!message.value.trim() || message.value.trim().length < 10) {
      setError(message, 'Please add a little more detail (at least 10 characters).');
      firstInvalid = firstInvalid || message;
    }
    if (consent && !consent.checked) {
      setError(consent, 'Please confirm we may reply to your message.');
      firstInvalid = firstInvalid || consent;
    }

    return { valid: !firstInvalid, firstInvalid };
  };

  form.addEventListener('input', (event) => {
    if (event.target.matches('input, select, textarea')) clearError(event.target);
  });
  form.addEventListener('change', (event) => {
    if (event.target.matches('input, select, textarea')) clearError(event.target);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    const result = validate();
    if (!result.valid) {
      if (result.firstInvalid) result.firstInvalid.focus();
      return;
    }

    submitting = true;
    const originalLabel = submitButton ? submitButton.innerHTML : '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.textContent = 'Sending…';
    }
    showStatus('Sending your message…', 'success');

    try {
      if (window.location.protocol === 'file:') {
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        showStatus(
          'Preview mode: your message was not sent. Upload the site and connect send.php to receive enquiries at info@summitgh.com.et.',
          'success'
        );
        form.reset();
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
        throw new Error((payload && payload.message) || 'We could not send your message.');
      }

      showStatus('Thank you — your message is on its way. Our team will reply during office hours.', 'success');
      form.reset();
    } catch (error) {
      const message =
        error.name === 'AbortError'
          ? 'The request timed out. Please call +251 111 132 702 or email info@summitgh.com.et.'
          : 'We could not send your message. Please call +251 111 132 702 or email info@summitgh.com.et.';
      showStatus(message, 'error');
      if (status) status.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    } finally {
      submitting = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
        submitButton.innerHTML = originalLabel;
      }
    }
  });
})();
