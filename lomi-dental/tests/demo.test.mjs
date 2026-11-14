import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { clinic } from "../src/clinic.mjs";
import { content } from "../src/content.mjs";
import { uiCopy } from "../src/ui-copy.mjs";
import { presenceCopy } from "../src/presence-copy.mjs";
import { flowCopy } from "../src/flow-copy.mjs";
import { render, routes, href } from "../src/template.mjs";
import { validateRequest, todayInAddis } from "../src/validation.mjs";

test("Every bilingual route has a heading, locale switch, and clear patient navigation", async () => {
  const imageOwners = { en: new Map(), am: new Map() };
  for (const lang of ["en", "am"])
    for (const route of routes) {
      const html = render(lang, route);
      assert.equal((html.match(/<h1\b/g) || []).length, 1, `${lang}/${route}`);
      assert.ok(html.includes(`<html lang="${lang}">`));
      assert.ok(html.includes(href(lang === "en" ? "am" : "en", route)));
      assert.ok(!html.includes(uiCopy[lang].photoCaption));
      assert.ok(!html.includes(content[lang].credits));
      if (route === "appointment")
        assert.ok(html.includes(presenceCopy[lang].formDemo));
      assert.ok(html.includes('content="noindex, nofollow"'));
      assert.ok(html.includes(`href="tel:${clinic.phone}"`));
      assert.ok(html.includes(`aria-label="${content[lang].phone}"`));
      const themeClasses = html
        .match(/id="theme" class="([^"]+)"/)?.[1]
        .split(/\s+/);
      assert.ok(themeClasses?.includes("icon-button"));
      assert.ok(!themeClasses.includes("hidden"));
      assert.ok(html.includes("data-theme-sun"));
      assert.ok(html.includes("data-theme-moon"));
      const navigation = html.match(
        /<nav data-primary-navigation[^>]*>(.*?)<\/nav>/s,
      )?.[1];
      assert.deepEqual(
        [...navigation.matchAll(/href="([^"]+)"/g)].map((match) => match[1]),
        ["home", "services", "team", "about", "contact"].map((id) =>
          href(lang, id),
        ),
      );
      for (const anchor of html.matchAll(/href="#([^"]+)"/g))
        assert.ok(
          html.includes(`id="${anchor[1]}"`),
          `Missing anchor ${anchor[1]}`,
        );
      if (route === "services") {
        assert.equal(
          (html.match(/class="treatment-card"/g) || []).length,
          clinic.services.length,
        );
        assert.equal(
          (html.match(/src="\/assets\/catalog-/g) || []).length,
          clinic.services.length,
        );
        assert.equal(
          html.split(flowCopy[lang].viewTreatment).length - 1,
          clinic.services.length,
        );
        for (const group of clinic.serviceGroups)
          assert.ok(html.includes(`data-treatment-group="${group.id}"`));
      }
      if (route.startsWith("services/")) {
        const serviceId = route.split("/")[1];
        assert.ok(html.includes(`?service=${serviceId}`));
        assert.ok(html.includes(`aria-current="page"`));
        assert.ok(
          html.includes(
            `<h1 class="page-title">${treatmentName(lang, serviceId)}</h1>`,
          ),
        );
        const sections = ["who", "process", "questions", "request"].map((id) =>
          html.indexOf(`id="${id}"`),
        );
        assert.ok(
          sections.every(
            (position, index) => position > (sections[index - 1] ?? -1),
          ),
        );
      }
      assert.equal(
        (html.match(/class="mobile-appointment has-call"/g) || []).length,
        1,
      );
      assert.equal((html.match(/class="floating-call"/g) || []).length, 1);
      for (const image of html.matchAll(/<img src="([^"]+)"/g)) {
        const bytes = await fs.readFile(
          new URL(`../public${image[1]}`, import.meta.url),
        );
        const fingerprint = createHash("sha256").update(bytes).digest("hex");
        assert.ok(
          !imageOwners[lang].has(fingerprint),
          `${image[1]} repeats a photo used on ${imageOwners[lang].get(fingerprint)} in ${lang}`,
        );
        imageOwners[lang].set(fingerprint, route);
      }
      for (const match of html.matchAll(/href="\/(en|am)\/([^"#?]*)/g)) {
        const target = match[2].replace(/\/$/, "") || "home";
        assert.ok(routes.includes(target), `Unknown destination ${target}`);
      }
    }
});

test("English and Amharic have matching translation and treatment keys", () => {
  function keys(value) {
    return Object.entries(value)
      .flatMap(([key, item]) =>
        typeof item === "object" && item !== null
          ? keys(item).map((child) => `${key}.${child}`)
          : [key],
      )
      .sort();
  }
  assert.deepEqual(keys(content.en), keys(content.am));
  assert.deepEqual(keys(uiCopy.en), keys(uiCopy.am));
  assert.deepEqual(keys(presenceCopy.en), keys(presenceCopy.am));
  assert.deepEqual(keys(flowCopy.en), keys(flowCopy.am));
  for (const lang of ["en", "am"])
    for (const id of clinic.services)
      assert.equal(content[lang].serviceContent[id].length, 5);
});

function treatmentName(lang, serviceId) {
  return content[lang].serviceContent[serviceId][1].replaceAll("&", "&amp;");
}

const valid = {
  name: "Demo Visitor",
  phone: "+251911000000",
  service: "checkup",
  date: "2026-11-16",
  time: "morning",
  consent: "on",
  message: "",
};
test("Valid Ethiopian mobile formats are accepted without modifying the request", () => {
  for (const phone of [
    "+251 911 000 000",
    "0911000000",
    "0711000000",
    "+251711000000",
  ]) {
    const data = { ...valid, phone };
    const before = structuredClone(data);
    assert.deepEqual(validateRequest(data, clinic.services, "2026-11-13"), {});
    assert.deepEqual(data, before);
  }
});

test("Invalid, past, Sunday, impossible, and unavailable requests are rejected", () => {
  for (const date of [
    "2026-11-12",
    "2026-11-13",
    "2026-11-15",
    "2026-02-30",
    "bad",
  ])
    assert.equal(
      validateRequest({ ...valid, date }, clinic.services, "2026-11-13").date,
      "invalidDate",
    );
  const errors = validateRequest(
    {
      ...valid,
      name: " ",
      phone: "123",
      service: "unavailable",
      time: "midnight",
      consent: "",
      message: "x".repeat(501),
    },
    clinic.services,
    "2026-11-13",
  );
  assert.deepEqual(Object.keys(errors).sort(), [
    "consent",
    "message",
    "name",
    "phone",
    "service",
    "time",
  ]);
});

test("Date validation follows Addis Ababa time at the UTC day boundary", () => {
  assert.equal(todayInAddis(new Date("2026-11-13T22:00:00Z")), "2026-11-14");
});

test("Demo has no personal-data persistence or request delivery", async () => {
  const script = await fs.readFile(
    new URL("../src/app.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    script,
    /fetch\(|XMLHttpRequest|sendBeacon|sessionStorage|JSON\.stringify\(data/,
  );
  assert.equal((script.match(/localStorage\.setItem\(/g) || []).length, 1);
  assert.match(script, /localStorage\.setItem\(\s*"lomi-theme"/);
  assert.ok(script.includes("form.reset()"));
});
