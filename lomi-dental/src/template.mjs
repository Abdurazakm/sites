import { themeInitScript } from "./theme.mjs";
import { clinic } from "./clinic.mjs";
import { content } from "./content.mjs";
import { uiCopy } from "./ui-copy.mjs";
import { presenceCopy } from "./presence-copy.mjs";
import { flowCopy } from "./flow-copy.mjs";

export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const e = escapeHtml;
const arrow = '<span aria-hidden="true">↗</span>';
export const routes = [
  "home",
  "about",
  "services",
  "team",
  "contact",
  "appointment",
  "privacy",
  "confirmation",
  ...clinic.services.map((id) => `services/${id}`),
];
export const href = (lang, route = "home", service) =>
  `/${lang}/${route === "home" ? "" : `${route}/`}${service ? `?service=${encodeURIComponent(service)}` : ""}`;

export function render(lang, route, assetVersion = "") {
  const assetSuffix = assetVersion ? `?v=${encodeURIComponent(assetVersion)}` : "";
  const f = flowCopy[lang];
  const t = {
    ...content[lang],
    nav: { ...content[lang].nav, contact: f.navContact },
  };
  const u = uiCopy[lang];
  const p = presenceCopy[lang];
  const name = e(clinic.name[lang]);
  const serviceId = route.startsWith("services/") ? route.split("/")[1] : null;
  const link = (page = "home", selected) => href(lang, page, selected);
  const button = (label = t.appointment, page = "appointment", selected) =>
    `<a class="primary-button" href="${link(page, selected)}">${e(label)} ${arrow}</a>`;
  const textLink = (label, page, selected) =>
    `<a class="text-link" href="${link(page, selected)}">${e(label)} ${arrow}</a>`;
  const photo = (key, alt, classes = "", eager = false) =>
    `<img src="${e(clinic.images[key])}" alt="${e(p.imageAlt[key] || alt)}" width="${key === "catalog" ? 1400 : 1536}" height="${key === "catalog" ? 1050 : 1024}" class="${classes}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  const intro = (_eyebrow, title, body, h = "h1") =>
    `<div ${h === "h1" ? 'data-hero-copy' : ""} class="max-w-2xl"><${h} class="${h === "h1" ? "page-title" : "heading"}">${e(title)}</${h}>${body ? `<p class="body-copy mt-5 max-w-xl">${e(body)}</p>` : ""}</div>`;
  const title = serviceId ? t.serviceContent[serviceId][1] : t.nav[route];
  const breadcrumbs = () =>
    `<nav aria-label="${e(u.breadcrumb)}" class="breadcrumbs wrap"><ol class="flex flex-wrap items-center gap-2"><li><a href="${link()}">${e(t.nav.home)}</a></li><li aria-hidden="true">/</li>${serviceId ? `<li><a href="${link("services")}">${e(t.nav.services)}</a></li><li aria-hidden="true">/</li>` : ""}<li aria-current="page" class="text-ink">${e(title)}</li></ol></nav>`;
  const treatmentCards = (ids = clinic.services, withImages = false) =>
    `<div class="${withImages ? (withImages === "catalog" ? "grid items-stretch gap-6 md:grid-cols-2" : "grid items-stretch gap-6 md:grid-cols-3") : "treatment-index"}">${ids
      .map((id) => {
        const service = t.serviceContent[id];
        return `<a class="${withImages ? "treatment-card" : "treatment-row"}" href="${link(`services/${id}`)}">${withImages ? `<div class="overflow-hidden">${photo((withImages === "catalog" ? clinic.catalogImages : clinic.treatmentImages)[id], service[1], "aspect-[1.45] w-full object-cover")}</div>` : ""}<div class="${withImages ? "flex flex-1 flex-col p-6" : "min-w-0 flex-1"}"><p class="mb-2 text-xs font-medium text-muted">${e(u.categories[id])}</p><h3 class="text-xl leading-snug font-semibold tracking-tight">${e(service[1])}</h3><p class="body-copy mt-3 text-sm">${e(service[3])}</p>${withImages ? `<span class="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm font-semibold">${e(withImages === "catalog" ? f.viewTreatment : t.learn)} ${arrow}</span>` : ""}</div>${withImages ? "" : `<span aria-hidden="true" class="self-center text-xl text-primary">↗</span>`}</a>`;
      })
      .join("")}</div>`;
  const faq = (limit = 4) =>
    `<section class="section wrap grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]"><div>${intro(t.practical, u.faqTitle, "", "h2")}</div><div class="rounded-xl border border-line bg-card px-6">${t.faqs
      .slice(0, limit)
      .map(
        ([q, a]) =>
          `<details class="faq-item group"><summary class="flex list-none items-center justify-between gap-5 py-5 text-base font-medium">${e(q)}<span aria-hidden="true" class="text-xl text-muted group-open:rotate-45">+</span></summary><p class="body-copy pb-6 text-sm">${e(a)}</p></details>`,
      )
      .join("")}</div></section>`;
  const cta = () =>
    `<section class="wrap pb-16 md:pb-20"><div class="appointment-strip"><div><h2 class="heading max-w-lg">${e(u.ctaTitle)}</h2><p class="mt-4 max-w-lg text-base leading-relaxed text-on-dark/80">${e(u.ctaText)}</p></div><div class="shrink-0">${button()}<p class="mt-3 max-w-xs text-xs leading-relaxed text-on-dark/75">${e(u.confirmedByReception)}</p></div></div></section>`;
  const unsure = () =>
    `<aside class="flex flex-col justify-between gap-5 rounded-xl border border-line bg-soft p-6 sm:flex-row sm:items-center"><div><h2 class="text-lg font-semibold">${e(u.unsureTitle)}</h2><p class="body-copy mt-2 max-w-xl text-sm">${e(u.unsureText)}</p></div>${textLink(u.firstVisit, "appointment", "unsure")}</aside>`;
  const story = (full = false) =>
    `<section class="section wrap grid items-center gap-10 lg:grid-cols-2"><figure>${photo("aboutReception", t.photoNote, "aspect-[1.2] w-full rounded-xl object-cover")}</figure><div class="lg:pl-6">${intro(t.nav.about, u.aboutTitle, u.aboutText, "h2")}${full ? `<p class="body-copy mt-4">${e(t.aboutMore)}</p>` : ""}<ul class="mt-6 space-y-4">${t.principles.map((p) => `<li class="flex items-center gap-3 text-sm"><span class="check-mark" aria-hidden="true">✓</span>${e(p)}</li>`).join("")}</ul><div class="mt-7">${textLink(full ? t.nav.team : t.meet, full ? "team" : "about")}</div></div></section>`;
  const gallery = () =>
    `<section class="section wrap"><div class="section-heading">${intro("", u.spacesTitle, u.spacesText, "h2")}</div><div class="grid gap-6 md:grid-cols-2"><figure>${photo("room2", t.photoNote, "aspect-[1.5] w-full rounded-xl object-cover")}<figcaption class="mt-3 text-xs text-muted">${e(u.roomLabel)}</figcaption></figure><figure>${photo("dentist", t.photoNote, "aspect-[1.5] w-full rounded-xl object-cover")}</figure></div></section>`;
  const nextStep = (page, heading, body) =>
    `<section class="wrap pb-16 md:pb-20"><aside class="next-step"><div><p class="eyebrow">${e(f.next)}</p><h2 class="heading">${e(heading)}</h2><p class="body-copy mt-4 max-w-xl">${e(body)}</p></div><div class="flex flex-col items-start gap-3">${button()}${textLink(t.nav[page], page)}</div></aside></section>`;
  const visitProcess = () =>
    `<section class="section wrap">${intro("", f.firstVisitTitle, f.firstVisitBody, "h2")}<ol class="mt-8 grid gap-6 md:grid-cols-3">${t.process.map(([number, heading, body]) => `<li class="border-t border-line pt-5"><span class="check-mark mb-4">${number}</span><h3 class="text-lg font-semibold">${e(heading)}</h3><p class="body-copy mt-3 text-sm">${e(body)}</p></li>`).join("")}</ol></section>`;
  const navItem = (id, mobile = false) => {
    const active = route === id || (id === "services" && serviceId);
    return `<a class="${mobile ? "mobile-nav-link" : "nav-link"} ${active ? "is-active" : ""}" href="${link(id)}" ${active ? 'aria-current="page"' : ""}>${e(t.nav[id])}</a>`;
  };
  const logo = `<span class="brand-mark" aria-hidden="true">l.</span><span class="min-w-0"><span class="brand-name">${name}</span><span class="brand-location">${e(clinic.location[lang])}</span></span>`;
  const header = `<a class="skip-link" href="#main">${e(t.skip)}</a><header class="site-header"><div class="wrap header-row"><a class="header-brand" href="${link()}" aria-label="${name} — ${e(t.nav.home)}">${logo}</a><nav data-primary-navigation aria-label="${e(t.quickLinks)}" class="hidden items-center gap-1 xl:flex">${["home", "services", "team", "about", "contact"].map((id) => navItem(id)).join("")}</nav><div class="header-actions ml-auto flex shrink-0 items-center gap-1 sm:gap-2"><a data-language-switch class="language-button" href="${href(lang === "en" ? "am" : "en", route)}" lang="${lang === "en" ? "am" : "en"}" hreflang="${lang === "en" ? "am" : "en"}" aria-label="${e(t.language)}">${lang === "en" ? "አማርኛ" : "English"}</a><button id="theme" class="icon-button" aria-label="${e(t.theme)}" aria-pressed="false"><svg data-theme-moon xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6.25 6.25 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg><svg data-theme-sun hidden xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m4.93-17.07-1.42 1.42M6.49 17.51l-1.42 1.42M22 12h-2M4 12H2m17.07 7.07-1.42-1.42M6.49 6.49 5.07 5.07"/></svg></button><div class="hidden md:block">${route === "appointment" ? textLink(t.nav.contact, "contact") : button()}</div><button class="icon-button xl:hidden" id="menu-toggle" aria-label="${e(t.menu)}" aria-expanded="false" aria-controls="mobile-menu">☰</button></div></div><nav data-mobile-navigation id="mobile-menu" class="wrap pb-5" aria-label="${e(t.menu)}" hidden>${["home", "services", "team", "about", "contact", "appointment"].map((id) => navItem(id, true)).join("")}</nav></header>`;
  const callButton = clinic.phone
    ? `<a class="floating-call" href="tel:${e(clinic.phone.replace(/[\s()-]/g, ""))}" aria-label="${e(t.phone)}" title="${e(t.phone)}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg></a>`
    : "";
  const footer = `<footer class="border-t border-line bg-soft"><div class="wrap pt-12 pb-7"><div class="grid gap-9 pb-10 md:grid-cols-[1.4fr_0.8fr_1fr]"><div><a class="flex items-center gap-3" href="${link()}">${logo}</a><p class="body-copy mt-5 max-w-sm text-sm">${e(t.footerLine)}</p></div><div><h2 class="mb-5 text-sm font-semibold">${e(t.quickLinks)}</h2><nav class="flex flex-col items-start gap-3 text-sm">${["home", "services", "team", "about", "contact"].map((id) => `<a class="hover:underline" href="${link(id)}">${e(t.nav[id])}</a>`).join("")}</nav></div><div><h2 class="mb-5 text-sm font-semibold">${e(t.visit)}</h2><p class="text-sm leading-relaxed">${e(clinic.address[lang])}</p><p class="body-copy mt-3 text-sm">${e(clinic.hours[lang])}</p><div class="mt-4"><a class="text-link" href="${e(clinic.mapsUrl)}" target="_blank" rel="noopener noreferrer">${e(t.directions)} ${arrow}</a></div></div></div><div class="flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-xs text-muted"><p>© ${new Date().getUTCFullYear()} ${name}</p><a class="underline underline-offset-4" href="${link("privacy")}">${e(t.privacy)}</a></div></div></footer>${clinic.phone || !["appointment", "confirmation"].includes(route) ? `<div class="mobile-appointment ${clinic.phone ? "has-call" : ""}">${["appointment", "confirmation"].includes(route) ? `<p class="flex min-h-12 items-center text-sm font-medium">${e(t.phone)}</p>` : button(f.mobileAppointment, "appointment", serviceId)}</div>` : ""}`;
  let main = "";
  if (route === "home") {
    main = `<section class="wrap pt-5 pb-8 md:pt-7 md:pb-10"><div class="signature-hero"><div class="hero-copy" data-hero-copy><p class="eyebrow">${e(clinic.location[lang])}</p><h1 class="hero-title">${e(u.heroTitle.split("\n")[0])}<span>${e(u.heroAccent)}</span></h1><p class="mt-6 max-w-md text-base leading-relaxed text-on-dark/85 md:text-lg">${e(u.heroText)}</p><div class="mt-8 flex flex-wrap items-center gap-5">${button()}${textLink(u.chooseCare, "services")}</div><div class="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-on-dark/20 pt-5 text-xs text-on-dark/80"><span>${e(t.languages)}</span><span>${e(clinic.location[lang])}</span></div></div><figure class="hero-portrait">${photo("hero", t.photoNote, "signature-photo", true)}<figcaption><span class="mb-1 block text-xs text-muted">${e(clinic.location[lang])}</span><span class="text-sm font-semibold">${e(u.smileLabel)}</span></figcaption></figure></div></section><div class="border-y border-line"><ul class="wrap grid grid-cols-2 gap-x-5 gap-y-4 py-5 md:grid-cols-4">${t.ribbon.map((label) => `<li class="flex items-center gap-3 text-xs font-medium sm:text-sm"><span aria-hidden="true" class="text-primary">✓</span>${e(label)}</li>`).join("")}</ul></div><section class="section wrap"><div class="section-heading">${intro("", f.homeTreatments, u.treatmentsText, "h2")}${textLink(t.allTreatments, "services")}</div>${treatmentCards(
      clinic.featuredServices.filter((id) => clinic.services.includes(id)),
      true,
    )}<div class="mt-6">${textLink(u.firstVisit, "appointment", "unsure")}</div></section><section class="care-story"><div class="section wrap grid items-center gap-9 lg:grid-cols-2"><figure>${photo("consultation", t.photoNote, "aspect-[1.05] w-full rounded-xl object-cover")}</figure><div class="lg:pl-7">${intro("", f.homeApproach, u.careText, "h2")}<div class="mt-7 space-y-5">${p.details.map(([title]) => `<p class="flex items-center gap-3 text-sm font-medium"><span class="check-mark" aria-hidden="true">✓</span>${e(title)}</p>`).join("")}</div><div class="mt-6">${textLink(t.meet, "about")}</div></div></div></section><section class="section wrap"><div class="grid items-center gap-9 lg:grid-cols-2"><div>${intro("", f.homeDentists, u.teamText, "h2")}<div class="mt-7">${textLink(t.nav.team, "team")}</div></div><figure>${photo("team", t.portrait, "aspect-[1.3] w-full rounded-xl object-cover")}</figure></div></section><section class="wrap pb-16 md:pb-20"><div class="visit-card"><figure>${photo("clinic", t.photoNote, "h-64 w-full object-cover lg:h-full")}</figure><div class="p-7 md:p-10">${intro("", f.homeVisit, p.visitBody, "h2")}<p class="mt-5 text-sm font-medium">${e(clinic.hours[lang])}</p><p class="mt-2 text-xs text-muted">${e(clinic.address[lang])}</p><div class="mt-6">${textLink(t.nav.contact, "contact")}</div></div></div></section>${faq(3)}${cta()}`;
  } else if (route === "services") {
    const groups = clinic.serviceGroups
      .map((group) => ({
        ...group,
        services: group.services.filter((id) => clinic.services.includes(id)),
      }))
      .filter((group) => group.services.length);
    main = `${breadcrumbs()}<section class="wrap pb-16 md:pb-20"><div class="page-intro">${intro("", t.nav.services, u.treatmentsText)}</div><figure class="mx-auto mb-8 w-full max-w-4xl">${photo("catalog", t.photoNote, "block h-auto w-full rounded-xl", true)}</figure><nav class="page-jumps mb-9" aria-label="${e(f.treatmentGroups)}">${groups.map((group) => `<a href="#group-${group.id}">${e(f.groups[group.id].title)}</a>`).join("")}</nav><div class="space-y-12">${groups.map((group) => `<section id="group-${group.id}" class="scroll-mt-28" data-treatment-group="${group.id}"><h2 class="heading">${e(f.groups[group.id].title)}</h2><p class="body-copy mt-3 mb-6 max-w-2xl">${e(f.groups[group.id].body)}</p>${treatmentCards(group.services, "catalog")}</section>`).join("")}</div><div class="mt-10">${unsure()}</div></section>${cta()}`;
  } else if (serviceId) {
    const service = t.serviceContent[serviceId];
    const group = clinic.serviceGroups.find((item) =>
      item.services.includes(serviceId),
    );
    const related = (group?.services || clinic.services).filter(
      (id) => id !== serviceId && clinic.services.includes(id),
    );
    main = `${breadcrumbs()}<section class="wrap pb-16 md:pb-20"><div class="grid items-center gap-9 lg:grid-cols-[1.05fr_0.95fr]"><div>${intro("", service[1], service[3])}<div class="mt-7">${button(t.appointment, "appointment", serviceId)}</div><p class="mt-4 text-xs leading-relaxed text-muted">${e(u.confirmedByReception)}</p></div><figure>${photo(clinic.detailImages[serviceId], service[1], "aspect-[1.2] max-h-[430px] w-full rounded-xl object-cover", true)}</figure></div><nav class="page-jumps mt-9" aria-label="${e(f.onThisPage)}">${[
      ["who", f.who],
      ["process", f.process],
      ["questions", f.practical],
      ["request", f.request],
    ]
      .map(([id, label]) => `<a href="#${id}">${e(label)}</a>`)
      .join(
        "",
      )}</nav><div class="mt-10 grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]"><div class="space-y-10"><section id="who" class="scroll-mt-28"><h2 class="heading">${e(f.who)}</h2><p class="body-copy mt-4">${e(f.audiences[serviceId])}</p><p class="body-copy mt-4">${e(service[4])}</p><p class="mt-4 text-sm font-medium">${e(f.assessment)}</p></section><section id="process" class="scroll-mt-28 border-t border-line pt-8"><h2 class="heading">${e(f.process)}</h2><ol class="mt-6 space-y-5">${t.steps.map((step, i) => `<li class="flex gap-4"><span class="check-mark shrink-0">${i + 1}</span><p class="body-copy text-sm">${e(step)}</p></li>`).join("")}</ol></section><section id="questions" class="scroll-mt-28 border-t border-line pt-8"><h2 class="heading">${e(f.practical)}</h2><div class="mt-5">${f.questions.map(([question, answer]) => `<details class="faq-item group"><summary class="flex list-none items-center justify-between gap-5 py-5 text-base font-medium">${e(question)}<span class="text-xl text-muted group-open:rotate-45" aria-hidden="true">+</span></summary><p class="body-copy pb-5 text-sm">${e(answer)}</p></details>`).join("")}</div></section></div><aside class="rounded-xl border border-line bg-soft p-6 lg:sticky lg:top-28"><h2 class="text-xl font-semibold">${e(u.unsureTitle)}</h2><p class="body-copy mt-3 text-sm">${e(u.unsureText)}</p><div class="mt-5">${textLink(u.firstVisit, "appointment", "unsure")}</div><dl class="mt-6 space-y-4 border-t border-line pt-5 text-sm"><div><dt class="font-semibold">${e(t.hours)}</dt><dd class="mt-1 text-muted">${e(clinic.hours[lang])}</dd></div><div><dt class="font-semibold">${e(t.address)}</dt><dd class="mt-1 text-muted">${e(clinic.location[lang])}</dd></div></dl></aside></div><section id="request" class="mt-10 scroll-mt-28 rounded-xl border border-line bg-soft p-6 md:p-8"><h2 class="text-2xl font-semibold">${e(f.request)}</h2><p class="body-copy mt-3 mb-5">${e(u.confirmedByReception)}</p>${button(t.appointment, "appointment", serviceId)}</section>${related.length ? `<section class="mt-12"><div class="section-heading"><h2 class="heading">${e(u.related)}</h2>${textLink(t.allTreatments, "services")}</div>${treatmentCards(related)}</section>` : ""}</section>`;
  } else if (route === "about") {
    main = `${breadcrumbs()}<section class="wrap page-intro">${intro("", t.nav.about, "")}</section>${story(true)}${gallery()}${visitProcess()}${nextStep("team", f.nextTeam, f.nextTeamBody)}`;
  } else if (route === "team") {
    main = `${breadcrumbs()}<section class="wrap pb-16 md:pb-20"><div class="page-intro">${intro("", t.nav.team, u.teamText)}</div><div class="grid gap-8 md:grid-cols-2">${t.dentists
      .map((dentist, i) => {
        const profile = clinic.dentists[i];
        const qualifications = profile.qualifications[lang];
        return `<article class="flex flex-col overflow-hidden rounded-xl border border-line bg-card">${photo(profile.image, t.portrait, "aspect-[1.3] w-full object-cover", true)}<div class="flex flex-1 flex-col p-6 md:p-8"><h2 class="text-2xl font-semibold tracking-tight">${e(dentist.name)}</h2><p class="mt-2 text-sm font-medium text-primary">${e(dentist.role)}</p>${qualifications.length ? `<section class="mt-5"><h3 class="text-sm font-semibold">${e(f.qualifications)}</h3><ul class="body-copy mt-2 space-y-1 text-sm">${qualifications.map((item) => `<li>${e(item)}</li>`).join("")}</ul></section>` : ""}<section class="mt-6"><h3 class="text-sm font-semibold">${e(f.approach)}</h3><p class="body-copy mt-2 text-sm">${e(p.dentistBodies[i])}</p></section><section class="mt-5"><h3 class="text-sm font-semibold">${e(f.focusAreas)}</h3><ul class="mt-2 flex flex-wrap gap-2">${profile.services
          .filter((id) => clinic.services.includes(id))
          .map(
            (id) =>
              `<li><a class="care-chip" href="${link(`services/${id}`)}">${e(t.serviceContent[id][1])}</a></li>`,
          )
          .join(
            "",
          )}</ul></section><dl class="mt-5 text-sm"><dt class="font-semibold">${e(f.languages)}</dt><dd class="mt-2 text-muted">${e(t.languages)}</dd></dl><div class="mt-6 border-t border-line pt-4">${textLink(t.appointment, "appointment", "unsure")}</div></div></article>`;
      })
      .join(
        "",
      )}</div></section>${nextStep("about", f.nextClinic, f.nextClinicBody)}`;
  } else if (route === "contact") {
    main = `${breadcrumbs()}<section class="wrap pb-16 md:pb-20"><div class="page-intro">${intro(t.nav.contact, u.contactTitle, t.contactBody)}</div><div class="grid items-start gap-8 lg:grid-cols-2"><div><figure>${photo("contactWelcome", t.photoNote, "aspect-[1.5] w-full rounded-xl object-cover", true)}</figure><div class="mt-6 rounded-xl border border-line p-6"><h2 class="text-lg font-semibold">${e(f.directions)}</h2><p class="body-copy mt-3 text-sm">${e(p.contactAccess)}</p></div></div><aside class="order-first rounded-xl border border-line bg-card p-7 md:p-9 lg:order-last"><dl class="space-y-7"><div><dt class="eyebrow">${e(t.address)}</dt><dd class="text-lg font-medium">${e(clinic.address[lang])}</dd></div><div><dt class="eyebrow">${e(t.hours)}</dt><dd>${e(clinic.hours[lang])}</dd></div></dl><a class="primary-button mt-8 w-full" href="${e(clinic.mapsUrl)}" target="_blank" rel="noopener noreferrer">${e(t.directions)} ${arrow}</a><p class="mt-3 text-xs leading-relaxed text-muted">${e(t.directionsNote)}</p><div class="mt-7 border-t border-line pt-6">${clinic.phone ? `<a class="text-link" href="tel:${e(clinic.phone)}">${e(t.phone)} ${e(clinic.phone)}</a>` : `<p class="body-copy text-sm">${e(t.unavailable)}</p>`}${clinic.whatsapp ? `<a class="text-link mt-4" href="https://wa.me/${e(clinic.whatsapp)}">WhatsApp ${arrow}</a>` : ""}</div></aside></div></section>${cta()}`;
  } else if (route === "appointment") {
    const error = (id) => `<span class="field-error" id="${id}-error"></span>`;
    const input = (id, label, type, placeholder = "", extra = "", help = "") =>
      `<div><label for="${id}" class="field-label">${e(label)}</label><input class="field" type="${type}" id="${id}" name="${id}" placeholder="${e(placeholder)}" required aria-describedby="${id}-error${help ? ` ${id}-help` : ""}" ${extra}>${help ? `<p id="${id}-help" class="field-help">${e(help)}</p>` : ""}${error(id)}</div>`;
    const select = (id, label, options) =>
      `<div><label for="${id}" class="field-label">${e(label)}</label><select class="field" id="${id}" name="${id}" required aria-describedby="${id}-error"><option value="">${e(id === "time" ? t.time : t.choose)}</option>${options}</select>${error(id)}</div>`;
    main = `${breadcrumbs()}<section class="wrap pb-16 md:pb-20"><div class="page-intro">${intro("", t.nav.appointment, u.appointmentText)}<ol class="mt-6 flex flex-wrap gap-4 text-sm" aria-label="${e(f.process)}"><li class="flex items-center gap-2"><span class="check-mark">1</span>${e(f.requestStep)}</li><li class="flex items-center gap-2"><span class="check-mark">2</span>${e(f.confirmStep)}</li></ol></div><div class="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]"><div class="rounded-xl border border-line bg-card p-6 md:p-8"><div class="mb-7 rounded-lg border border-line bg-soft p-4"><p class="text-sm leading-relaxed">${e(p.formDemo)}</p></div><form id="appointment-form" novalidate><p class="mb-6 text-xs leading-relaxed text-muted">${e(u.formHelp)}</p><p id="form-error" class="text-sm text-error" role="alert"></p><fieldset><legend class="form-legend">${e(u.personalDetails)}</legend><div class="mt-5 grid gap-5 sm:grid-cols-2">${input("name", t.name, "text", t.namePlaceholder, 'autocomplete="name" maxlength="100"')}${input("phone", t.telephone, "tel", t.phonePlaceholder, 'autocomplete="tel" maxlength="25"', u.phoneHelp)}</div></fieldset><fieldset class="mt-7 border-t border-line pt-7"><legend class="form-legend float-left w-full">${e(u.visitDetails)}</legend><div class="clear-both grid gap-5 pt-5"><div>${select("service", t.service, `<option value="unsure">${e(t.unsure)}</option>${clinic.services.map((id) => `<option value="${id}">${e(t.serviceContent[id][1])}</option>`).join("")}`)}</div><div class="grid gap-5 sm:grid-cols-2">${input("date", t.date, "date", "", "", u.dateHelp)}${select("time", t.time, `<option value="morning">${e(t.morning)}</option><option value="afternoon">${e(t.afternoon)}</option>`)}</div></div></fieldset><details class="mt-6 border-t border-line pt-5"><summary class="cursor-pointer text-sm font-medium">${e(u.optionalDetails)} <span class="text-muted">(${e(t.optional)})</span></summary><div class="mt-4"><label for="message" class="field-label">${e(t.message)}</label><textarea class="field min-h-28" id="message" name="message" maxlength="500" placeholder="${e(t.messagePlaceholder)}" aria-describedby="message-error"></textarea>${error("message")}</div></details><label class="mt-6 flex items-start gap-3 text-sm leading-relaxed"><input class="mt-1 size-4 shrink-0 accent-primary" type="checkbox" id="consent" name="consent" required aria-describedby="consent-error">${e(t.consent)}</label>${error("consent")}<input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="hidden"><button class="primary-button mt-6 w-full" type="submit">${e(t.submit)} ${arrow}</button><p class="mt-4 text-center text-xs text-muted"><a class="underline underline-offset-4" href="${link("privacy")}">${e(t.privacy)}</a></p></form></div><aside class="space-y-6 lg:sticky lg:top-28"><div class="overflow-hidden rounded-xl border border-line bg-soft">${photo("appointmentSupport", t.photoNote, "aspect-[1.65] w-full object-cover")}<div class="p-6"><h2 class="text-lg font-semibold">${e(u.bookingSummary)}</h2><ul class="mt-5 space-y-4 text-sm leading-relaxed"><li class="flex gap-3"><span class="text-primary" aria-hidden="true">✓</span>${e(u.confirmedByReception)}</li><li class="flex gap-3"><span class="text-primary" aria-hidden="true">✓</span>${e(u.noPayment)}</li><li class="flex gap-3"><span class="text-primary" aria-hidden="true">✓</span>${e(clinic.hours[lang])}</li></ul></div></div><p class="text-xs leading-relaxed text-muted">${e(t.noEmergency)}</p></aside></div></section>`;
  } else if (route === "confirmation") {
    main = `${breadcrumbs()}<section class="wrap py-10 pb-20"><div class="mx-auto max-w-2xl rounded-xl border border-line bg-card p-7 md:p-10"><span class="check-mark mb-6 size-12 text-xl" aria-hidden="true">✓</span>${intro(t.demoShort, u.confirmationTitle, t.confirmationBody)}<section class="mt-7 border-t border-line pt-6"><h2 class="text-lg font-semibold">${e(t.next)}</h2><p class="body-copy mt-3 text-sm">${e(t.nextBody)}</p></section><div class="mt-7">${button(t.home, "home")}</div></div></section>`;
  } else if (route === "privacy") {
    main = `${breadcrumbs()}<section class="wrap pb-16 md:pb-20"><div class="page-intro">${intro(t.privacy, u.privacyTitle)}</div><div class="max-w-3xl space-y-8">${t.privacySections.map(([h, p]) => `<section class="border-t border-line pt-6"><h2 class="text-xl font-semibold">${e(h)}</h2><p class="body-copy mt-3">${e(p)}</p></section>`).join("")}</div></section>`;
  }
  const description = serviceId ? t.serviceContent[serviceId][3] : u.heroText;
  if (!main.includes("data-hero-copy")) main = main.replace("<h1 ", "<h1 data-hero-copy ");
  main = main.replace(/<img\b[^>]*>/, (image) =>
    image.replace("<img ", "<img data-hero-image ").replace('loading="lazy"', 'fetchpriority="high"'),
  );
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(title)} — ${name}</title><meta name="description" content="${e(description)}"><meta name="robots" content="${clinic.demo ? "noindex, nofollow" : "index, follow"}"><link rel="canonical" href="${clinic.domain}${link(route)}"><link rel="alternate" hreflang="en" href="${clinic.domain}${href("en", route)}"><link rel="alternate" hreflang="am" href="${clinic.domain}${href("am", route)}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><script id="theme-init">${themeInitScript}</script><link rel="stylesheet" href="/assets/styles.css${assetSuffix}"><script type="module" src="/assets/app.mjs${assetSuffix}"></script></head><body data-page="${e(route)}">${header}<main id="main" tabindex="-1">${main}</main>${footer}${callButton}</body></html>`;
}
