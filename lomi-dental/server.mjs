import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".mjs": "text/javascript",
  ".js": "text/javascript",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      let target = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
      if (!target.startsWith(root + path.sep) && target !== root) {
        res.writeHead(403);
        res.end();
        return;
      }
      if ((await fs.stat(target)).isDirectory()) target = path.join(target, "index.html");
      res.writeHead(200, {
        "Content-Type": types[path.extname(target)] || "application/octet-stream",
      });
      res.end(await fs.readFile(target));
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(4310, "127.0.0.1", () => process.stdout.write("Local: http://127.0.0.1:4310\n"));
