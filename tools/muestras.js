/* Fotos de muestra para la versión pública.
   Esta versión no lleva fotos personales: antes de compilar, este script
   baja imágenes de ejemplo de Lorem Picsum (https://picsum.photos, fotos de
   Unsplash) y las deja en public/assets/fotos con los nombres que espera
   src/data/historia.js. Las que ya existen no se vuelven a bajar, así que si
   pones tus propias fotos con esos nombres, se respetan.
   Si no hay red, no falla: el sitio se construye igual y esos lugares quedan
   como papel en espera. */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CARPETA = resolve(import.meta.dirname, "../public/assets/fotos");

/* nombre → [id de Picsum, ancho, alto] */
const MUESTRAS = {
  portada:  [1015, 900, 1200],
  momento1: [1043, 900, 1125],
  momento2: [1018, 900, 1125],
  momento3: [1050, 900, 1125],
  momento4: [57, 900, 1125],
  momento5: [1039, 900, 1125],
  momento6: [17, 900, 1125],
  momento7: [37, 900, 1125],
  extra1:   [1036, 900, 1200],
  extra2:   [42, 1100, 800],
  extra3:   [28, 900, 1125],
  extra4:   [16, 1100, 800],
  extra5:   [1047, 900, 1200],
  extra6:   [1056, 1100, 900],
  extra7:   [58, 900, 1125],
};

mkdirSync(CARPETA, { recursive: true });

async function bajar([id, ancho, alto]) {
  const r = await fetch(`https://picsum.photos/id/${id}/${ancho}/${alto}.webp`, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

let nuevas = 0;
let fallidas = 0;
await Promise.all(
  Object.entries(MUESTRAS).map(async ([nombre, datos]) => {
    const destino = resolve(CARPETA, nombre + ".webp");
    if (existsSync(destino)) return;
    try {
      writeFileSync(destino, await bajar(datos));
      nuevas++;
    } catch (e) {
      fallidas++;
      console.warn(`muestras: no se pudo bajar ${nombre} (${e.message})`);
    }
  }),
);
console.log(`muestras: ${nuevas} fotos de ejemplo bajadas${fallidas ? `, ${fallidas} sin red` : ""}`);
