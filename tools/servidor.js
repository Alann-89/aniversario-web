/* Servidor estático mínimo para dist/: lo usan las capturas y la auditoría.
   Entiende rangos (el <audio> los pide) y nada más. */
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
};

export const DIST = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");

export function servir(dir = DIST) {
  const srv = http.createServer(async (req, res) => {
    let ruta = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (ruta.endsWith("/")) ruta += "index.html";
    const f = resolve(dir, "." + ruta);
    try {
      const s = await stat(f);
      const cuerpo = await readFile(f);
      const rango = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
      const tipo = TIPOS[extname(f)] || "application/octet-stream";
      if (rango) {
        const a = +rango[1], b = rango[2] ? +rango[2] : s.size - 1;
        res.writeHead(206, { "content-type": tipo, "content-range": `bytes ${a}-${b}/${s.size}`, "accept-ranges": "bytes" });
        return res.end(cuerpo.subarray(a, b + 1));
      }
      res.writeHead(200, { "content-type": tipo, "accept-ranges": "bytes" });
      res.end(cuerpo);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  return new Promise((ok) =>
    srv.listen(0, () => ok({ url: `http://localhost:${srv.address().port}`, cerrar: () => srv.close() }))
  );
}
