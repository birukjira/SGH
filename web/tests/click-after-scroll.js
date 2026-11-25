/**
 * Browser-test helper for the staff area.
 *
 * `html { scroll-behavior: smooth }` (src/css/01-base.css) makes scrollIntoView
 * animate. Anything that measures a rectangle, or clicks a remembered set of
 * coordinates, before that animation finishes will hit whatever the page
 * scrolled past — which is how a perfectly good "Hide from website" button was
 * once mistaken for a broken form action.
 *
 * This helper scrolls instantly, waits for the scroll to be at rest, checks that
 * the pointer really lands on the target (so a sticky header or overlay is
 * reported rather than silently swallowing the click), and only then clicks.
 *
 * Usage: paste this file into the devtools console, or run it through the
 * preview tools' evaluate, then
 *
 *     await sghClick('form:has(input[name="id"][value="4"]) button')
 *
 * Being a plain browser script it is never imported by the app, so it adds
 * nothing to the bundle.
 */
(() => {
  // Timers rather than requestAnimationFrame: rAF is paused in a background tab,
  // which turns a scroll wait into a hang instead of a fast check.
  const tick = () => new Promise((resolve) => setTimeout(resolve, 50));

  function label(el) {
    if (!el) return 'nothing';
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return text ? `<${el.tagName.toLowerCase()}> "${text}"` : `<${el.tagName.toLowerCase()}>`;
  }

  async function settle() {
    // Instant scrolling still paints on the next tick, and late content (fonts,
    // images) can move the page once more, so wait until scrollY stops moving.
    let last = -1;
    for (let i = 0; i < 20 && scrollY !== last; i += 1) {
      last = scrollY;
      await tick();
    }
  }

  window.sghClick = async function sghClick(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) throw new Error(`No element matches ${String(target)}`);

    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    await settle();

    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) throw new Error(`Not visible: ${label(el)}`);

    const at = [Math.round(box.left + box.width / 2), Math.round(box.top + box.height / 2)];
    const hit = document.elementFromPoint(at[0], at[1]);
    if (hit !== el && !el.contains(hit)) {
      throw new Error(`Pointer at ${at} would hit ${label(hit)}, not ${label(el)}`);
    }

    el.click();
    return { clicked: label(el), at, scrollY: Math.round(scrollY) };
  };

  return 'sghClick installed';
})();
