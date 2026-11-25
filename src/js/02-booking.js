/* Summit General Hospital — appointment request flow */
(() => {
  'use strict';

  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) return;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const bookingCard = document.getElementById('bookingCard');
  const stepper = document.getElementById('bookingStepper');
  const successPanel = document.getElementById('bookingSuccess');
  const alertBox = document.getElementById('bookingAlert');
  const steps = $$('.form-step', bookingForm);
  const indicators = stepper ? $$('.stepper__item', stepper) : [];
  const department = $('#department');
  const doctor = $('#doctor');
  const dateInput = $('#preferredDate');
  const reviewSummary = $('#reviewSummary');
  const successSummary = $('#successSummary');
  const successRef = $('#successRef');
  const previewNote = $('#successPreviewNote');
  const submitButton = $('#bookingSubmit');
  const bookAnother = $('#bookAnother');

  let currentStep = 1;
  let submitting = false;

  const allDoctorOptions = doctor
    ? Array.from(doctor.options).map((option) => ({
        value: option.value,
        label: option.textContent.trim(),
        department: option.dataset.department || '',
      }))
    : [];

  /* Dates --------------------------------------------------------------- */
  const isoDate = (date) => {
    const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return copy.toISOString().slice(0, 10);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);

  if (dateInput) {
    dateInput.min = isoDate(today);
    dateInput.max = isoDate(maxDate);
  }

  const formatDate = (value) => {
    if (!value) return '—';
    const parsed = new Date(`${value}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  /* Doctor list --------------------------------------------------------- */
  const fillDoctors = (dept, selected = '') => {
    if (!doctor) return;
    doctor.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = dept ? 'Any available consultant' : 'Choose a department first';
    doctor.appendChild(placeholder);

    if (!dept) {
      doctor.disabled = true;
      return;
    }

    doctor.disabled = false;
    allDoctorOptions
      .filter((item) => item.department === dept)
      .forEach((item) => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.label;
        option.dataset.department = item.department;
        if (item.value === selected) option.selected = true;
        doctor.appendChild(option);
      });
  };

  if (department) {
    department.addEventListener('change', () => fillDoctors(department.value));
  }

  /* Prefill from links -------------------------------------------------- */
  const params = new URLSearchParams(window.location.search);
  const queryDepartment = params.get('department');
  const queryDoctor = params.get('doctor');

  if (department && queryDepartment) {
    const exists = Array.from(department.options).some((option) => option.value === queryDepartment);
    if (exists) department.value = queryDepartment;
  }
  fillDoctors(department ? department.value : '', queryDoctor || '');

  /* Stepper ------------------------------------------------------------- */
  const setStep = (next, { validate = false, scroll = true } = {}) => {
    if (next < 1 || next > steps.length) return true;

    if (validate && next > currentStep) {
      const result = validateStep(currentStep);
      if (!result.valid) {
        if (result.firstInvalid) result.firstInvalid.focus();
        return false;
      }
    }

    if (next === 4) buildSummary();

    currentStep = next;

    steps.forEach((step) => {
      const active = Number(step.dataset.step) === next;
      step.hidden = !active;
      step.classList.toggle('is-active', active);
    });

    indicators.forEach((indicator, index) => {
      const stepNumber = index + 1;
      indicator.classList.toggle('is-active', stepNumber === next);
      indicator.classList.toggle('is-done', stepNumber < next);
    });

    const heading = steps[next - 1] ? steps[next - 1].querySelector('h2') : null;
    if (heading) heading.focus({ preventScroll: true });

    if (scroll && bookingCard) {
      const top = bookingCard.getBoundingClientRect().top;
      if (top < 8 || top > 130) {
        bookingCard.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    }

    return true;
  };

  $$('[data-next]', bookingForm).forEach((button) => {
    button.addEventListener('click', () => setStep(currentStep + 1, { validate: true }));
  });

  $$('[data-back]', bookingForm).forEach((button) => {
    button.addEventListener('click', () => setStep(currentStep - 1));
  });

  /* Validation ---------------------------------------------------------- */
  const messageFor = (field) => {
    const name = field.name || field.id;
    const messages = {
      department: 'Choose a department.',
      preferredDate: 'Choose a preferred date.',
      firstName: 'Enter your first name.',
      lastName: 'Enter your last name.',
      phone: 'Enter a phone number we can reach you on.',
      email: 'Enter a valid email address, or leave this blank.',
      consent: 'Please confirm we may contact you about this request.',
    };
    return messages[name] || 'Please complete this field.';
  };

  const clearFieldError = (field) => {
    const wrap = field.closest('.field') || field.closest('.check');
    if (!wrap) return;
    wrap.classList.remove('has-error');
    const error = wrap.querySelector('.field__error');
    if (error) error.textContent = '';
    Array.from(wrap.querySelectorAll('input, select, textarea')).forEach((input) => {
      input.removeAttribute('aria-invalid');
    });
  };

  let errorCounter = 0;
  const setFieldError = (field, message) => {
    const wrap = field.closest('.field') || field.closest('.check');
    if (!wrap) return;
    wrap.classList.add('has-error');
    let error = wrap.querySelector('.field__error');
    if (!error) {
      error = document.createElement('span');
      error.className = 'field__error';
      error.setAttribute('role', 'alert');
      wrap.appendChild(error);
    }
    if (!error.id) error.id = `booking-error-${++errorCounter}`;
    error.textContent = message;
    const targets = wrap.matches('.field')
      ? Array.from(wrap.querySelectorAll('input, select, textarea'))
      : [field];
    targets.forEach((input) => {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', error.id);
    });
  };

  const isVisible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

  function validateStep(stepNumber) {
    const step = steps[stepNumber - 1];
    if (!step) return { valid: true, firstInvalid: null };

    Array.from(step.querySelectorAll('.has-error')).forEach((wrap) => {
      wrap.classList.remove('has-error');
      const error = wrap.querySelector('.field__error');
      if (error) error.textContent = '';
    });

    let firstInvalid = null;
    const markInvalid = (field, message) => {
      setFieldError(field, message);
      if (!firstInvalid) firstInvalid = field;
    };

    // Text, telephone, email, date and select fields
    Array.from(step.querySelectorAll('input, select, textarea')).forEach((field) => {
      if (field.type === 'radio' || field.type === 'checkbox' || field.type === 'hidden') return;
      if (!isVisible(field)) return;

      const value = field.value.trim();
      if (field.required && !value) {
        markInvalid(field, messageFor(field));
        return;
      }

      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        markInvalid(field, messageFor(field));
        return;
      }

      if (field.type === 'tel' && value && !/^\+?[0-9\s\-()]{9,18}$/.test(value)) {
        markInvalid(field, 'Enter a phone number using digits, spaces or +.');
        return;
      }

      if (field.type === 'date' && value) {
        if (value < isoDate(today)) {
          markInvalid(field, 'Please choose a date from today onward.');
        } else if (value > isoDate(maxDate)) {
          markInvalid(field, 'Please choose a date within the next three months.');
        }
      }
    });

    // Radio groups (visit type, preferred time)
    const radioNames = new Set(
      Array.from(step.querySelectorAll('input[type="radio"]')).map((radio) => radio.name).filter(Boolean)
    );
    radioNames.forEach((name) => {
      const radios = Array.from(step.querySelectorAll(`input[type="radio"][name="${name}"]`));
      if (!radios.length || !radios[0].required) return;
      if (!radios.some((radio) => radio.checked)) {
        const message = name === 'preferred_time' ? 'Choose a preferred time.' : 'Choose an option.';
        markInvalid(radios[0], message);
      }
    });

    // Checkboxes
    Array.from(step.querySelectorAll('input[type="checkbox"][required]')).forEach((checkbox) => {
      if (!checkbox.checked) markInvalid(checkbox, messageFor(checkbox));
    });

    return { valid: !firstInvalid, firstInvalid };
  }

  bookingForm.addEventListener('input', (event) => {
    if (event.target.matches('input, select, textarea')) clearFieldError(event.target);
  });
  bookingForm.addEventListener('change', (event) => {
    if (event.target.matches('input, select, textarea')) clearFieldError(event.target);
  });

  /* Summary ------------------------------------------------------------- */
  const checkedValue = (name) => {
    const checked = bookingForm.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  };

  const collectSummary = () => {
    const name = [bookingForm.elements.firstName.value, bookingForm.elements.lastName.value]
      .filter(Boolean)
      .join(' ')
      .trim();
    return [
      ['Department', department && department.value ? department.value : '—'],
      ['Consultant', doctor && doctor.value ? doctor.value : 'Any available consultant'],
      ['Visit type', checkedValue('visit_type') || '—'],
      ['Preferred date', formatDate(dateInput ? dateInput.value : '')],
      ['Preferred time', checkedValue('preferred_time') || '—'],
      ['Patient name', name || '—'],
      ['Phone', bookingForm.elements.phone ? bookingForm.elements.phone.value : '—'],
      ['Email', bookingForm.elements.email && bookingForm.elements.email.value ? bookingForm.elements.email.value : 'Not provided'],
    ];
  };

  const renderRows = (target, rows) => {
    if (!target) return;
    target.innerHTML = rows
      .map(
        ([label, value]) =>
          `<div class="review__row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
      )
      .join('');
  };

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return map[character];
    });

  function buildSummary() {
    const rows = collectSummary();
    renderRows(reviewSummary, rows);
    return rows;
  }

  /* Submit -------------------------------------------------------------- */
  const showAlert = (message) => {
    if (!alertBox) return;
    alertBox.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-cross"></use></svg><span>${escapeHtml(message)}</span>`;
    alertBox.classList.add('is-visible');
  };

  const hideAlert = () => {
    if (alertBox) alertBox.classList.remove('is-visible');
  };

  const showSuccess = (reference, preview = false) => {
    const rows = collectSummary();
    renderRows(successSummary, rows);
    if (successRef) successRef.textContent = reference;
    if (previewNote) previewNote.hidden = !preview;

    bookingForm.hidden = true;
    if (stepper) stepper.hidden = true;
    const cardHead = document.querySelector('.booking-card__head');
    if (cardHead) cardHead.hidden = true;
    if (successPanel) {
      successPanel.hidden = false;
      successPanel.classList.add('is-visible');
      successPanel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      const heading = successPanel.querySelector('h2');
      if (heading) heading.focus({ preventScroll: true });
    }
  };

  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();

    const result = validateStep(4);
    if (!result.valid) {
      if (result.firstInvalid) result.firstInvalid.focus();
      return;
    }

    if (submitting) return;
    submitting = true;

    const originalLabel = submitButton ? submitButton.innerHTML : '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.textContent = 'Sending request…';
    }

    const previewMode = window.location.protocol === 'file:';

    try {
      if (previewMode) {
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        showSuccess('SGH-PREVIEW', true);
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      const response = await fetch(bookingForm.action, {
        method: 'POST',
        body: new FormData(bookingForm),
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
        throw new Error((payload && payload.message) || 'We could not send your request just now.');
      }

      showSuccess(payload.reference || 'SGH-PENDING', false);
    } catch (error) {
      const message =
        error.name === 'AbortError'
          ? 'The request timed out. Please call us on +251 111 132 702 so we can help.'
          : `${error.message || 'We could not send your request.'} Please call us on +251 111 132 702 or email info@summitgh.com.et.`;
      showAlert(message);
      if (alertBox) alertBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    } finally {
      submitting = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
        submitButton.innerHTML = originalLabel;
      }
    }
  });

  if (bookAnother) {
    bookAnother.addEventListener('click', () => {
      bookingForm.reset();
      hideAlert();
      bookingForm.hidden = false;
      if (stepper) stepper.hidden = false;
      const cardHead = document.querySelector('.booking-card__head');
      if (cardHead) cardHead.hidden = false;
      if (successPanel) {
        successPanel.hidden = true;
        successPanel.classList.remove('is-visible');
      }
      fillDoctors('');
      currentStep = 1;
      setStep(1, { scroll: false });
      if (department) department.focus();
    });
  }
})();
