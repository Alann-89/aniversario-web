/* =========================================================================
   efectos.js — lo que comparten las animaciones hechas a mano
   -------------------------------------------------------------------------
   · quieto(): ¿pidió ella menos movimiento? En el momento de la llamada,
     no en el primer render (ver useMenosMovimiento en hooks.js).
   · tween(): una animación de un número con requestAnimationFrame y la
     curva de salida del sitio. La usan el contador de días y el tirón del
     boleto (que la importa desde su trozo diferido).
   · azar(): desorden repetible. Las cosas apoyadas en una mesa no están
     alineadas, pero no pueden bailar en cada render ni diferir entre el HTML
     del build y el del navegador: el azar sale de una semilla.
   · chispas() y fibras(): nodos sueltos colgados del <body>, no elementos
     de React: tienen que salirse de cualquier contenedor con `overflow`,
     duran un segundo y se borran solos. Son movimiento que nadie pidió, así
     que con menos movimiento no se crean.
   ========================================================================= */

export const quieto = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Un toque en la mano, donde el aparato vibre. Es movimiento: con menos
    movimiento, no. (El iPhone no vibra desde la web; no pasa nada.) */
export const vibrar = (patron) => {
  if (!quieto()) navigator.vibrate?.call(navigator, patron);
};

/* La curva de salida (--ease-salida es su pariente en CSS). */
const salida = (t) => 1 - (1 - t) ** 3;

/** Anima un número de `desde` a `hasta` en `ms`. Devuelve la función que la detiene. */
export function tween(desde, hasta, ms, alPaso, alFin) {
  let marco;
  const inicio = performance.now();
  const paso = (t) => {
    const k = Math.min(1, (t - inicio) / ms);
    alPaso(desde + (hasta - desde) * salida(k));
    if (k < 1) marco = requestAnimationFrame(paso);
    else alFin?.();
  };
  marco = requestAnimationFrame(paso);
  return () => cancelAnimationFrame(marco);
}

/** Un número entre 0 y 1 que siempre es el mismo para la misma semilla. */
export function azar(semilla) {
  const x = Math.sin(semilla * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function soltar(clase, n, dura, colocar) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = clase;
    s.setAttribute("aria-hidden", "true");
    colocar(s, i);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), dura);
  }
}

/** Chispas al acertar una pregunta: celebrar. */
export function chispas(elemento) {
  if (!elemento || quieto()) return;
  const caja = elemento.getBoundingClientRect();
  soltar("chispa", 8, 1000, (s) => {
    s.style.left = caja.left + caja.width * (0.1 + Math.random() * 0.8) + "px";
    s.style.top = caja.top + caja.height / 2 + "px";
    s.style.setProperty("--dx", (Math.random() - 0.5) * 80 + "px");
    s.style.setProperty("--dy", -24 - Math.random() * 56 + "px");
    s.style.animationDelay = Math.random() * 100 + "ms";
  });
}

/* Rasgar un boleto no es celebrar, es romper cartón, y lo que suelta el
   cartón al romperse son fibras de su color, no destellos. Salen de la
   línea del troquel. */
export function fibras(elemento, x) {
  if (!elemento || quieto()) return;
  const caja = elemento.getBoundingClientRect();
  soltar("fibra", 12, 1200, (s) => {
    s.style.left = x + (Math.random() - 0.5) * 14 + "px";
    s.style.top = caja.top + Math.random() * caja.height + "px";
    s.style.setProperty("--dx", (Math.random() - 0.5) * 50 + "px");
    s.style.setProperty("--dy", 40 + Math.random() * 80 + "px");
    s.style.setProperty("--giro", (Math.random() - 0.5) * 220 + "deg");
    s.style.animationDelay = Math.random() * 80 + "ms";
  });
}
