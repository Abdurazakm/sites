const revealTargets = [
  "main .page-intro",
  "main .section-heading",
  "main .signature-hero",
  "main .treatment-card",
  "main .treatment-row",
  "main section[id] > h2",
  "main section[id] > p",
  "main figure",
  "main article",
  "main aside",
  "main .visit-card > div",
  "main .next-step > div",
  "main .appointment-strip > div",
  "main .page-jumps",
  "main section[id]",
  "main .faq-item",
  "main .section > div",
  "main .grid > div",
  "main .section > ol > li",
  "main .space-y-8 > section",
  "main > section > div",
].join(", ");

export function setupScrollReveals(root = document, view = window) {
  if (
    !view.matchMedia ||
    !view.IntersectionObserver ||
    !view.Element?.prototype.animate
  )
    return () => {};

  const preference = view.matchMedia("(prefers-reduced-motion: reduce)");
  if (preference.matches) return () => {};

  const candidates = [...root.querySelectorAll(revealTargets)].filter(
    (element) =>
      !element.closest("form, [hidden], [data-hero-copy], [data-hero-image]") &&
      !element.querySelector("form, [data-hero-copy], [data-hero-image]") &&
      !element.parentElement?.closest(".treatment-card, article"),
  );
  const targets = candidates.filter(
    (element) =>
      !candidates.some((other) => other !== element && element.contains(other)),
  );
  const mobile = view.innerWidth < 768;
  const distance = mobile ? 20 : 28;
  const duration = mobile ? 520 : 650;
  const stagger = mobile ? 60 : 90;
  const maxDelay = mobile ? 120 : 180;
  const running = new Map();
  const revealed = new Set();
  const observer = new view.IntersectionObserver(
    (entries) => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          const bounds = entry.boundingClientRect ?? entry.target.getBoundingClientRect();
          const outside = bounds.top >= view.innerHeight || bounds.top + bounds.height <= 0;
          if (outside && !entry.target.contains(root.activeElement)) {
            revealed.delete(entry.target);
            running.get(entry.target)?.cancel();
            running.delete(entry.target);
            entry.target.classList.add("reveal-pending");
          }
          continue;
        }
        if (entry.intersectionRatio < 0.12 || revealed.has(entry.target)) continue;
        entry.target.classList.remove("reveal-pending");
        revealed.add(entry.target);
        if (preference.matches || entry.target.contains(root.activeElement))
          continue;
        const animation = entry.target.animate(
          [
            { opacity: 0, transform: `translateY(${distance}px)` },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration,
            delay: Math.min(order++ * stagger, maxDelay),
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "backwards",
          },
        );
        running.set(entry.target, animation);
        const finish = () => {
          if (running.get(entry.target) === animation)
            running.delete(entry.target);
        };
        animation.finished.then(finish, finish);
      }
    },
    { threshold: [0, 0.12] },
  );

  for (const target of targets) {
    const bounds = target.getBoundingClientRect();
    if (bounds.height <= 0) continue;
    observer.observe(target);
    if (bounds.top >= view.innerHeight || bounds.top + bounds.height <= 0) {
      target.classList.add("reveal-pending");
    } else {
      revealed.add(target);
    }
  }

  function revealFocused(event) {
    for (const target of targets) {
      if (!target.contains(event.target)) continue;
      target.classList.remove("reveal-pending");
      revealed.add(target);
      running.get(target)?.cancel();
      running.delete(target);
    }
  }

  function cleanup() {
    observer.disconnect();
    for (const target of targets) target.classList.remove("reveal-pending");
    for (const animation of running.values()) animation.cancel();
    running.clear();
    root.removeEventListener("focusin", revealFocused);
    preference.removeEventListener("change", preferenceChanged);
  }

  function preferenceChanged() {
    if (preference.matches) cleanup();
  }

  root.addEventListener("focusin", revealFocused);
  preference.addEventListener("change", preferenceChanged);
  return cleanup;
}
