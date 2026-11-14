import { clinic } from "./clinic.mjs";
import { content } from "./content.mjs";
import { uiCopy } from "./ui-copy.mjs";
import { todayInAddis, validateRequest } from "./validation.mjs";

const lang = document.documentElement.lang;
const t = content[lang];
const u = uiCopy[lang];
const menu = document.querySelector("#mobile-menu");
const toggle = document.querySelector("#menu-toggle");
function closeMenu() {
  menu.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", t.menu);
}
toggle?.addEventListener("click", () => {
  menu.hidden = !menu.hidden;
  toggle.setAttribute("aria-expanded", String(!menu.hidden));
  toggle.setAttribute("aria-label", menu.hidden ? t.menu : t.close);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) {
    closeMenu();
    toggle.focus();
  }
});
window.matchMedia("(min-width: 1280px)").addEventListener("change", closeMenu);
const themeButton = document.querySelector("#theme");
function updateThemeButton() {
  const dark = document.body.classList.contains("dark");
  themeButton?.setAttribute("aria-pressed", String(dark));
  themeButton?.setAttribute("aria-label", dark ? u.themeLight : u.themeDark);
  themeButton?.setAttribute("title", dark ? u.themeLight : u.themeDark);
  const moon = themeButton?.querySelector("[data-theme-moon]");
  const sun = themeButton?.querySelector("[data-theme-sun]");
  moon?.toggleAttribute("hidden", dark);
  sun?.toggleAttribute("hidden", !dark);
}
themeButton?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  updateThemeButton();
  try {
    localStorage.setItem(
      "lomi-theme",
      document.body.classList.contains("dark") ? "dark" : "light",
    );
  } catch {
    return;
  }
});
try {
  if (localStorage.getItem("lomi-theme") === "dark")
    document.body.classList.add("dark");
} catch {
  document.body.classList.remove("dark");
}
updateThemeButton();
const form = document.querySelector("#appointment-form");
if (form) {
  const dateField = form.querySelector("#date");
  const tomorrow = new Date(`${todayInAddis()}T12:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  dateField.min = tomorrow.toISOString().slice(0, 10);
  const preferred = new URLSearchParams(location.search).get("service");
  if (["unsure", ...clinic.services].includes(preferred))
    form.elements.service.value = preferred;
  const languageLink = document.querySelector("[data-language-switch]");
  function preserveTreatmentLanguage() {
    if (!languageLink) return;
    const target = new URL(languageLink.href);
    const selected = form.elements.service.value;
    if (["unsure", ...clinic.services].includes(selected))
      target.searchParams.set("service", selected);
    else target.searchParams.delete("service");
    languageLink.href = target.href;
  }
  preserveTreatmentLanguage();
  form.elements.service.addEventListener("change", preserveTreatmentLanguage);
  function clearFieldError(field) {
    form.elements[field].setAttribute("aria-invalid", "false");
    document.querySelector(`#${field}-error`).textContent = "";
  }
  form.addEventListener("input", (event) => {
    if (
      [
        "name",
        "phone",
        "service",
        "date",
        "time",
        "message",
        "consent",
      ].includes(event.target.name)
    )
      clearFieldError(event.target.name);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (data.website) return;
    const errors = validateRequest(data, clinic.services);
    for (const field of [
      "name",
      "phone",
      "service",
      "date",
      "time",
      "message",
      "consent",
    ]) {
      form.elements[field].setAttribute(
        "aria-invalid",
        String(Boolean(errors[field])),
      );
      document.querySelector(`#${field}-error`).textContent = errors[field]
        ? t[errors[field]]
        : "";
    }
    document.querySelector("#form-error").textContent = Object.keys(errors)
      .length
      ? t.formError
      : "";
    if (Object.keys(errors).length) {
      const firstInvalid = form.elements[Object.keys(errors)[0]];
      const details = firstInvalid.closest("details");
      if (details) details.open = true;
      firstInvalid.focus();
      return;
    }
    form.reset();
    location.assign(`/${lang}/confirmation/`);
  });
}
