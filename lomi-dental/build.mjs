import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { clinic } from "./src/clinic.mjs";
import { render, routes, href } from "./src/template.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "dist");
if (path.dirname(dist) !== root || path.basename(dist) !== "dist") {
  throw new Error("Build output must stay inside the demo project.");
}
await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(path.join(dist, "assets"), { recursive: true });
const cssPath = path.join(root, "src/styles.css");
const css = await postcss([tailwind({ base: root, optimize: true })]).process(
  await fs.readFile(cssPath, "utf8"),
  { from: cssPath },
);
const hash = createHash("sha256").update(css.css);
for (const name of (await fs.readdir(path.join(root, "src"))).filter((name) => /\.(mjs|css)$/.test(name)).sort()) {
  hash.update(await fs.readFile(path.join(root, "src", name)));
}
const assetVersion = hash.digest("hex").slice(0, 12);
await fs.writeFile(path.join(dist, "assets/styles.css"), css.css);
const brand = `:root:not(.dark){--color-primary:${clinic.theme.primary};--color-ink:${clinic.theme.ink};--color-paper:${clinic.theme.paper};}`;
await fs.appendFile(path.join(dist, "assets/styles.css"), brand);
await fs.cp(path.join(root, "public"), dist, { recursive: true });
for (const name of [
  "app.mjs",
  "content.mjs",
  "ui-copy.mjs",
  "presence-copy.mjs",
  "flow-copy.mjs",
  "clinic.mjs",
  "validation.mjs",
  "scroll-reveal.mjs",
  "theme.mjs",
])
  await fs.writeFile(
    path.join(dist, "assets", name),
    (await fs.readFile(path.join(root, "src", name), "utf8")).replace(
      /from "(\.\/[^"?]+\.mjs)"/g,
      `from "$1?v=${assetVersion}"`,
    ),
  );
for (const lang of ["en", "am"]) {
  for (const route of routes) {
    const folder = path.join(dist, href(lang, route));
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(path.join(folder, "index.html"), render(lang, route, assetVersion));
  }
}
await fs.writeFile(path.join(dist, "index.html"), render("en", "home", assetVersion));
await fs.writeFile(path.join(dist, "404.html"), render("en", "contact", assetVersion));
await fs.writeFile(
  path.join(dist, "robots.txt"),
  clinic.demo
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\nSitemap: ${clinic.domain}/sitemap.xml\n`,
);
await fs.writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["en", "am"].flatMap((lang) => routes.filter((route) => route !== "confirmation").map((route) => `<url><loc>${clinic.domain}${href(lang, route)}</loc></url>`)).join("")}</urlset>`,
);
process.stdout.write(
  `Built ${routes.length * 2 + 1} bilingual static pages.\n`,
);
