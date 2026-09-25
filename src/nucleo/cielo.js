/* =========================================================================
   cielo.js — la única rampa del sitio
   -------------------------------------------------------------------------
   El cielo es el ÚNICO indicador de avance (no hay menú, ni barra, ni
   etiqueta). Se deriva de dos avances:

     a  la subida:     cielo de tarde (azul frío) → tarde (durazno)
     b  el anochecer:  tarde → ocaso (rosa) → violeta → noche

   Por qué en dos partes: entre luminancia ≈0.15 y ≈0.22 ni el texto oscuro
   ni el claro llegan a 4.5:1. Así que el cielo SOLO cruza esa banda durante
   el anochecer, que es una escena de paisaje sin letra, y cada sección
   tiene un color de texto fijo que no cambia con el scroll.

   Un tercer avance, c (la entrada del mapa), baja la ladera fuera del
   cuadro: la cámara mira al cielo PORQUE entra la hoja, sea cual sea el
   solape entre el anochecer y el mapa.

   Escribe sus variables en la capa del cielo (no en :root, para no
   invalidar el estilo del documento entero en cada cuadro), solo cuando
   algo cambió, y mueve la <meta name="theme-color"> con el mismo color.
   ========================================================================= */

/* ---- Color: los tokens salen del CSS (una sola fuente) -------------------
   Se leen una vez del @theme de src/styles/index.css: si Alan cambia un
   color ahí, el cielo y la barra del teléfono lo siguen solos. */
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const mezclarRgb = (a, b, t) => hex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * t));
const suave = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* El cielo se interpola en OKLCH y no en RGB: entre el azul frío y el
   durazno, casi complementarios, la mezcla en RGB pasaba por un gris sucio
   a media subida. En OKLCH el tono gira por el lado corto —del azul al
   durazno pasando por lavanda y rosa, que es lo que hace un cielo de
   tarde— y conserva el croma. (Por el lado largo pasaba por verde.) */
const lin = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const gam = (v) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
function aOklch(h) {
  const [r, g, b] = rgb(h).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}
function deOklch([L, C, H]) {
  const A = C * Math.cos(H);
  const B = C * Math.sin(H);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const c = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return hex(c.map((v) => Math.min(255, Math.max(0, gam(v)))));
}
/* Entre dos paradas ya convertidas, girando el tono por el lado corto. */
function entre(x, y, t) {
  let d = y[2] - x[2];
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return deOklch([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + d * t]);
}

/* Las paradas, convertidas una sola vez (la primera vez que se pinta). */
let paradas;
function preparar() {
  const css = getComputedStyle(document.documentElement);
  const token = (n) => css.getPropertyValue(n).trim();
  const [cielo, tarde, noche, sello] = ["--color-cielo", "--color-tarde", "--color-noche", "--color-sello"].map(token);
  /* El ocaso: el vino del sello entra en la tarde y se hunde en la noche. */
  const ocaso = [tarde, mezclarRgb(tarde, sello, 0.45), mezclarRgb(sello, noche, 0.62), noche];
  paradas = {
    subida: [aOklch(cielo), aOklch(tarde)],
    ocaso: ocaso.map(aOklch),
    interior: token("--interior"),
  };
}

function colorDelCielo(a, b) {
  if (b > 0) {
    const t = suave(0.08, 0.8, b) * (paradas.ocaso.length - 1);
    const i = Math.min(paradas.ocaso.length - 2, Math.floor(t));
    return entre(paradas.ocaso[i], paradas.ocaso[i + 1], t - i);
  }
  return entre(paradas.subida[0], paradas.subida[1], suave(0.15, 1, a));
}

let meta;
const escrito = {};
let antes = "";

/**
 * Pinta el cielo en `capa` (el elemento fijo del cielo).
 *   a subida, b anochecer, c entrada del mapa (0 → 1); `cuarto`: dentro de
 *   la cabaña, donde la barra del sistema toma el color del interior.
 */
export function pintarCielo(capa, a, b, c, cuarto) {
  const clave = `${a}|${b}|${c}|${cuarto}`;
  if (clave === antes) return;
  antes = clave;
  if (!paradas) preparar();

  const color = colorDelCielo(a, b);
  const valores = {
    "--cielo": color,
    "--sol": suave(0.05, 0.62, b).toFixed(3),
    "--estrellas": suave(0.5, 0.92, b).toFixed(3),
    "--luna": suave(0.42, 0.9, b).toFixed(3),
    "--subir": a.toFixed(3),
    "--bajar": suave(0, 1, c).toFixed(3),
  };
  for (const [k, v] of Object.entries(valores)) {
    if (escrito[k] !== v) capa.style.setProperty(k, (escrito[k] = v));
  }
  const tema = cuarto ? paradas.interior : color;
  meta ??= document.querySelector('meta[name="theme-color"]');
  if (meta && meta.content !== tema) meta.setAttribute("content", tema);
}
