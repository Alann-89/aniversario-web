import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { closeSync, existsSync, openSync, readdirSync, readSync } from "node:fs";
import { resolve } from "node:path";

/* Ancho y alto de un .webp, leídos de su encabezado (32 bytes), sin
   decodificarlo. Los tres formatos que produce un exportador: con pérdida
   (VP8), sin pérdida (VP8L) y extendido (VP8X, el que llevan los que tienen
   canal alfa). null si no es un webp reconocible. */
function medidaWebp(ruta) {
  const fd = openSync(ruta, "r");
  const b = Buffer.alloc(32);
  try {
    readSync(fd, b, 0, 32, 0);
  } finally {
    closeSync(fd);
  }
  if (b.toString("latin1", 0, 4) !== "RIFF" || b.toString("latin1", 8, 12) !== "WEBP") return null;
  switch (b.toString("latin1", 12, 16)) {
    case "VP8 ":
      return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    case "VP8L": {
      const v = b.readUInt32LE(21);
      return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1];
    }
    case "VP8X":
      return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
    default:
      return null;
  }
}

/* `virtual:fotos` — las fotos que EXISTEN en public/assets/fotos en el
   momento del build. Faltan cinco de seis, y el HTML prerenderizado tiene
   que saber cuáles pintar como foto y cuáles como papel en espera sin
   pedirlas: cada <img> que falla es un 404 en la consola del teléfono de
   ella. Cuando Alan añada una foto, el siguiente build la recoge sola.
   También exporta `medidas`: [ancho, alto] de cada .webp, para que la
   impresión reserve su proporción real antes de que la foto llegue (sin
   eso la página se movería al aparecer cada una) y para no recortar una
   foto horizontal dentro de un marco vertical.

   En desarrollo (`npm run dev`) Vite guarda el módulo y no se enteraba de
   las fotos agregadas con el servidor encendido: aparecían como papel hasta
   reiniciarlo. Por eso el servidor vigila la carpeta y recarga la página. */
function fotosExistentes() {
  const id = "virtual:fotos";
  const carpeta = resolve(import.meta.dirname, "public/assets/fotos").replaceAll("\\", "/");
  return {
    name: "fotos-existentes",
    resolveId: (x) => (x === id ? "\0" + id : null),
    configureServer(servidor) {
      const alCambiar = (archivo) => {
        if (!archivo.replaceAll("\\", "/").startsWith(carpeta)) return;
        const modulo = servidor.moduleGraph.getModuleById("\0" + id);
        if (modulo) servidor.moduleGraph.invalidateModule(modulo);
        servidor.ws.send({ type: "full-reload" });
      };
      servidor.watcher.on("add", alCambiar).on("unlink", alCambiar);
    },
    load(x) {
      if (x !== "\0" + id) return null;
      const dir = resolve(import.meta.dirname, "public/assets/fotos");
      /* Sin la carpeta (la versión pública del repo no lleva fotos) todo se
         pinta como papel en espera. */
      const archivos = existsSync(dir) ? readdirSync(dir) : [];
      const lista = archivos.map((f) => `/assets/fotos/${f}`);
      const medidas = {};
      for (const f of archivos) {
        const m = /\.webp$/i.test(f) ? medidaWebp(resolve(dir, f)) : null;
        if (m) medidas[`/assets/fotos/${f}`] = m;
      }
      return `export default new Set(${JSON.stringify(lista)});\nexport const medidas = ${JSON.stringify(medidas)};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), fotosExistentes()],
  build: { outDir: "dist", assetsInlineLimit: 0 },
  /* El día del build: el contador del HTML prerenderizado sale de aquí (así
     se lee sin JavaScript) y el navegador lo corrige al hidratar. */
  define: { __HOY__: JSON.stringify(Date.now()) },
  server: { port: 5173 },
});
