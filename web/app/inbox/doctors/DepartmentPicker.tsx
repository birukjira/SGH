'use client';

import { useState } from 'react';
import type { DepartmentOption } from '@/lib/content';

/**
 * Departments and the primary choice. This is the only part of the doctor form
 * that needs the browser: a `<select>` cannot be filtered by checkbox state
 * without it. It is an affordance only — the server refuses a primary that is
 * not ticked, whoever posts the form.
 */
export function DepartmentPicker({
  departments,
  initialTicked,
  initialPrimary,
}: {
  departments: DepartmentOption[];
  initialTicked: number[];
  initialPrimary: number | null;
}) {
  const [ticked, setTicked] = useState<number[]>(initialTicked);
  const [primary, setPrimary] = useState(initialPrimary ? String(initialPrimary) : '');

  const primaryOptions = departments.filter((department) => ticked.includes(department.id));

  // Unticking the current primary leaves nothing selected, which saves as
  // "first ticked" — short of that, the choice is kept as it is.
  const primaryValue = primaryOptions.some((department) => String(department.id) === primary)
    ? primary
    : '';

  function toggleDepartment(id: number, checked: boolean) {
    setTicked((current) =>
      checked ? [...current, id] : current.filter((departmentId) => departmentId !== id)
    );
  }

  return (
    <>
      <fieldset className="field field--full">
        <legend>Departments</legend>
        <div className="staff-checks">
          {departments.map((department) => (
            <label className="check" key={department.id}>
              <input
                type="checkbox"
                name="departments"
                value={department.id}
                checked={ticked.includes(department.id)}
                onChange={(event) => toggleDepartment(department.id, event.target.checked)}
              />
              <span>
                {department.name}
                {department.isActive ? '' : ' (hidden from the website)'}
              </span>
            </label>
          ))}
        </div>
        <span className="field__help">
          Ticked departments decide which directory filters list this consultant. The primary is
          chosen from these.
        </span>
      </fieldset>

      <div className="field field--full">
        <label htmlFor="primary">Primary department</label>
        <select
          className="select"
          id="primary"
          name="primary"
          value={primaryValue}
          disabled={primaryOptions.length === 0}
          onChange={(event) => setPrimary(event.target.value)}
        >
          <option value="">First ticked department</option>
          {primaryOptions.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        <span className="field__help">
          {primaryOptions.length === 0
            ? 'Tick a department above to choose a primary.'
            : 'The department used when a patient books with this doctor.'}
        </span>
      </div>
    </>
  );
}
