/* =========================================================================
   escena.js — el avance de cada escena, en un solo sitio
   -------------------------------------------------------------------------
   Todo lo que avanza con el scroll (el cielo, el mapa, las escenas
   pegajosas, la carta) se registra aquí. Cada escena guarda su geometría
   —top y alto en el documento— y esa geometría SOLO se mide cuando cambia
   el layout: al cargar, al cambiar el tamaño de la ventana, cuando llegan
   las fuentes o una imagen, o cuando el ResizeObserver del body ve que la
   página cambió de alto. En cada scroll solo se lee `scrollY`, se resta y
   se escribe `--p` (0 → 1) en el elemento.

   Por qué así: la versión anterior tenía cuatro hooks que medían cada uno
   por su cuenta, con su propio observador y su propia suscripción al
   scroll; intercalaban lecturas de geometría con escrituras de variables
   y un teléfono de gama media acumulaba 47 tareas largas en un recorrido.
   Aquí hay UNA escucha de scroll, UN requestAnimationFrame y UNA medición.

   Tampoco se usa `useScroll({ target })` de Motion: daba 0.86 donde la
   posición real decía 0.95, y ese desajuste dejaba una escena a media
   opacidad cuando la siguiente ya estaba colocada.

   Modos (vh = alto de la pantalla):
     fijo      escena pegajosa: 0 cuando su borde de arriba toca el de la
               pantalla, 1 cuando su borde de abajo toca el de abajo.
     paso      0 cuando asoma por abajo, 1 cuando se va por arriba.
     entrada   0 cuando asoma por abajo, 1 cuando su borde de arriba llega
               a `fin` (fracción de pantalla, por defecto 0.3).
     recorrido 0 cuando asoma por abajo, 1 cuando su borde de abajo llega
               al de la pantalla: un espaciador que marca un tramo.
     salida    0 con su borde de arriba en el de la pantalla, 1 cuando su
               borde de abajo lo cruza: lo que se va por arriba (la portada).
   ========================================================================= */

const escenas = new Set();
let vh = 0;
let pedido = 0;
let pedidoMedir = 0;
let arrancado = false;

const acotar = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

function tramo(e) {
  const { top, alto } = e;
  if (e.modo === "fijo") return [top, top + Math.max(alto - vh, 1)];
  if (e.modo === "paso") return [top - vh, top + alto];
  if (e.modo === "recorrido") return [top - vh, top + alto - vh];
  if (e.modo === "salida") return [top, top + alto];
  return [top - vh, top - vh * (e.fin ?? 0.3)];
}

/* Cada escena recibe (p, escena, scrollY, alto de pantalla): lo que ya se
   leyó aquí. Volver a leer scrollY o innerHeight dentro de un alCambiar,
   después de que otra escena escribió su --p, forzaría un recálculo de
   estilo en mitad del cuadro. */
function pintar() {
  pedido = 0;
  const y = window.scrollY;
  for (const e of escenas) {
    const [a, b] = e.rango;
    if (Number.isNaN(a)) continue; // todavía sin medir
    const p = acotar((y - a) / (b - a));
    if (p === e.p) continue;
    e.p = p;
    if (e.css !== false) e.el.style.setProperty("--p", p.toFixed(4));
    e.alCambiar?.(p, e, y, vh);
  }
}

/* Lee toda la geometría de una vez (una sola pasada de layout) y después
   escribe: nunca lectura-escritura-lectura. Solo se repintan las escenas
   cuyo rango cambió: la barra de direcciones del teléfono dispara resize a
   cada rato y no tiene por qué reescribir todo. */
function medir() {
  pedidoMedir = 0;
  cancelAnimationFrame(pedido);
  vh = window.innerHeight;
  const y = window.scrollY;
  for (const e of escenas) {
    const r = e.el.getBoundingClientRect();
    e.top = r.top + y;
    e.alto = r.height;
  }
  for (const e of escenas) {
    const [a, b] = tramo(e);
    if (a !== e.rango[0] || b !== e.rango[1]) {
      e.rango = [a, b];
      e.p = -1; // fuerza repintar
    }
  }
  pintar();
}

const pedirPintar = () => {
  if (!pedido) pedido = requestAnimationFrame(pintar);
};
const pedirMedir = () => {
  if (!pedidoMedir) pedidoMedir = requestAnimationFrame(medir);
};

function arrancar() {
  if (arrancado) return;
  arrancado = true;
  addEventListener("scroll", pedirPintar, { passive: true });
  addEventListener("resize", pedirMedir);
  addEventListener("load", pedirMedir);
  document.fonts?.ready.then(pedirMedir);
  new ResizeObserver(pedirMedir).observe(document.body);
}

/** Registra una escena. Devuelve la función que la quita. */
export function registrar(opciones) {
  arrancar();
  const e = { modo: "fijo", p: -1, rango: [NaN, NaN], ...opciones };
  escenas.add(e);
  pedirMedir();
  return () => escenas.delete(e);
}
