const revealTargets = [
  "main .page-intro",
  "main .section-heading",
  "main .signature-hero",
  "main .treatment-card",
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
      !element.closest("form, [hidden]") &&
      !element.querySelector("form") &&
      !element.parentElement?.closest(".treatment-card, article"),
  );
  const targets = candidates.filter(
    (element) =>
      !candidates.some((other) => other !== element && element.contains(other)),
  );
  const running = new Map();
  const revealed = new Set();
  const observer = new view.IntersectionObserver(
    (entries) => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting || revealed.has(entry.target)) continue;
        revealed.add(entry.target);
        observer.unobserve(entry.target);
        if (preference.matches || entry.target.contains(root.activeElement))
          continue;
        const animation = entry.target.animate(
          [
            { opacity: 0, transform: "translateY(16px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 480,
            delay: Math.min(order++ * 60, 120),
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
    { threshold: 0 },
  );

  for (const target of targets) {
    const bounds = target.getBoundingClientRect();
    if (bounds.height > 0 && bounds.top >= view.innerHeight)
      observer.observe(target);
  }

  function revealFocused(event) {
    for (const target of targets) {
      if (!target.contains(event.target)) continue;
      revealed.add(target);
      observer.unobserve(target);
      running.get(target)?.cancel();
      running.delete(target);
    }
  }

  function cleanup() {
    observer.disconnect();
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
