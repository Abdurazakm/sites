import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { applyTheme, themeInitScript } from "../src/theme.mjs";
import { render, routes } from "../src/template.mjs";

function rootElement() {
  const classes = new Set();
  return {
    style: {},
    classList: {
      contains: (name) => classes.has(name),
      toggle(name, active) {
        if (active) classes.add(name);
        else classes.delete(name);
      },
    },
  };
}

test("Saved dark mode initializes in the head without a body or main module", () => {
  const root = rootElement();
  runInNewContext(themeInitScript, {
    document: { documentElement: root },
    localStorage: { getItem: () => "dark" },
  });
  assert.equal(root.classList.contains("dark"), true);
  assert.equal(root.style.colorScheme, "dark");
});

test("Light, missing, invalid, and blocked storage keep a usable light page", () => {
  for (const saved of ["light", null, "invalid"]) {
    const root = rootElement();
    runInNewContext(themeInitScript, {
      document: { documentElement: root },
      localStorage: { getItem: () => saved },
    });
    assert.equal(root.classList.contains("dark"), false);
    assert.equal(root.style.colorScheme, "light");
  }
  const root = rootElement();
  runInNewContext(themeInitScript, {
    document: { documentElement: root },
    get localStorage() {
      throw new Error("Storage unavailable");
    },
  });
  assert.equal(root.classList.contains("dark"), false);
  assert.equal(root.style.colorScheme, "light");
});

test("Every bilingual page initializes the theme before its stylesheet and body", () => {
  for (const lang of ["en", "am"])
    for (const route of routes) {
      const html = render(lang, route);
      const bootstrap = html.indexOf('<script id="theme-init">');
      assert.ok(bootstrap > html.indexOf("<head>"));
      assert.ok(bootstrap < html.indexOf('<link rel="stylesheet"'));
      assert.ok(bootstrap < html.indexOf("<body"));
      assert.ok(html.includes(themeInitScript));
    }
});

test("Toggling the root theme updates both page and native-control appearance", () => {
  const root = rootElement();
  applyTheme(root, true);
  assert.equal(root.classList.contains("dark"), true);
  assert.equal(root.style.colorScheme, "dark");
  applyTheme(root, false);
  assert.equal(root.classList.contains("dark"), false);
  assert.equal(root.style.colorScheme, "light");
});
