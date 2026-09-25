import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/* `virtual:fotos` — las fotos que EXISTEN en public/assets/fotos en el
   momento del build. Faltan cinco de seis, y el HTML prerenderizado tiene
   que saber cuáles pintar como foto y cuáles como papel en espera sin
   pedirlas: cada <img> que falla es un 404 en la consola del teléfono de
   ella. Cuando Alan añada una foto, el siguiente build la recoge sola. */
function fotosExistentes() {
  const id = "virtual:fotos";
  return {
    name: "fotos-existentes",
    resolveId: (x) => (x === id ? "\0" + id : null),
    load(x) {
      if (x !== "\0" + id) return null;
      const dir = resolve(import.meta.dirname, "public/assets/fotos");
      /* Sin la carpeta (la versión pública del repo no lleva fotos) todo se
         pinta como papel en espera. */
      const lista = existsSync(dir) ? readdirSync(dir).map((f) => `/assets/fotos/${f}`) : [];
      return `export default new Set(${JSON.stringify(lista)});`;
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
