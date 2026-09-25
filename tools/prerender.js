/* =========================================================================
   prerender.js — mete el HTML pintado dentro de dist/index.html
   -------------------------------------------------------------------------
   Corre después de los dos `vite build` (el del navegador y el del
   servidor). Una app de React normal manda un <div> vacío: si el bundle no
   llega, ella abre el regalo y ve una pantalla en blanco. Aquí el HTML
   viaja pintado y el JavaScript solo lo hidrata.

   Además anuncia con preload lo primero que ella ve: la foto de portada y
   las dos caras de letra que pinta la portada. Nada más: precargar de más
   compite con la foto por el mismo ancho de banda.
   ========================================================================= */
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DIST } from "./servidor.js";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const indice = resolve(DIST, "index.html");
const servidor = resolve(raiz, "dist-ssr/entry-server.js");

if (!existsSync(indice) || !existsSync(servidor)) {
  console.error("Falta dist/index.html o dist-ssr/entry-server.js. Corre `npm run build`.");
  process.exit(1);
}

const { render, portada } = await import(pathToFileURL(servidor).href);
const html = render();
const original = readFileSync(indice, "utf8");
if (!original.includes('<div id="root"></div>')) {
  console.error('No encuentro <div id="root"></div> en dist/index.html.');
  process.exit(1);
}

const cabeza = [];
if (portada && existsSync(resolve(raiz, "public", portada.replace(/^\//, "")))) {
  cabeza.push(`<link rel="preload" as="image" fetchpriority="high" href="${portada}">`);
}
const activos = readdirSync(resolve(DIST, "assets"));
for (const patron of [/^cormorant-garamond-latin-600-italic.*\.woff2$/, /^nunito-latin-400-normal.*\.woff2$/]) {
  const f = activos.find((a) => patron.test(a));
  if (f) cabeza.push(`<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${f}">`);
}

const salida = original
  .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  .replace("</head>", `${cabeza.join("\n")}\n</head>`);
writeFileSync(indice, salida, "utf8");
rmSync(resolve(raiz, "dist-ssr"), { recursive: true, force: true });

const kb = (n) => Math.round(n / 1024);
console.log(`prerender: ${kb(html.length)} kB de HTML que se ve sin JavaScript · ${cabeza.length} preloads`);
