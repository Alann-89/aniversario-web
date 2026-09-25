import { UMBRAL } from "../data/cupones.js";
import { quieto, tween } from "../nucleo/efectos.js";

/* =========================================================================
   arrastre.js — la única física del sitio: el tirón del boleto
   -------------------------------------------------------------------------
   Se carga APARTE (import dinámico desde Adentro.jsx cuando la habitación
   se acerca): al abrir el regalo no hace falta y no viaja en el JS inicial.
   Tampoco usa una librería: son unas cien líneas.

   Trabaja fuera del ciclo de React: cada cuadro del tirón escribe tres
   variables CSS en el propio cuerpo del boleto (--cuerpo-x/-y/-giro), que
   mueven su transform. A React solo le avisa de los cambios de estado de
   verdad: que cruzó el umbral, que se rasgó, que fue un toque.

     · Resistencia asintótica: al principio cede casi lo que se tira y
       cerca del umbral se pone dura; nunca pasa de ~1.4 × UMBRAL. Eso es
       lo que avisa al pulgar de que está por romperse.
     · Umbral de 72 px (el recorrido de un pulgar sin soltar).
     · Si no llega, vuelve con un resorte de amortiguación CRÍTICA
       (46 ≈ 2·√520): el cartón se asienta, no rebota. Es interrumpible: si
       lo agarra a media vuelta, el gesto sigue desde donde va.
     · Si llega, sale disparado hacia abajo en 170 ms (un golpe seco, no un
       deslizamiento) y suelta las variables: la posición final de la mitad
       rota la define el CSS de .boleto--canjeado.

   Una FASE explícita dice qué está haciendo el boleto. Toque o tirón se
   decide al soltar (un dedo de verdad tiembla unos píxeles: eso sigue
   siendo un toque); el `click` queda solo para el teclado.
   ========================================================================= */
const resistencia = (d) => UMBRAL * 1.4 * (1 - Math.exp((-Math.max(0, d) / UMBRAL) * 1.1));
const TOQUE = 8; // px: por debajo, fue un toque y no un tirón

function pintar(cuerpo, d) {
  const y = resistencia(d);
  cuerpo.style.setProperty("--cuerpo-y", y.toFixed(1) + "px");
  cuerpo.style.setProperty("--cuerpo-x", (-y * 0.18).toFixed(1) + "px");
  cuerpo.style.setProperty("--cuerpo-giro", (-Math.min(1, Math.max(0, d) / UMBRAL) * 5.5).toFixed(2) + "deg");
}
function soltarVariables(cuerpo) {
  for (const v of ["--cuerpo-y", "--cuerpo-x", "--cuerpo-giro"]) cuerpo.style.removeProperty(v);
}

/* El regreso: un resorte con amortiguación crítica. */
function resorte(desde, alPaso, alFin) {
  let marco;
  let x = desde;
  let v = 0;
  let antes = performance.now();
  const paso = (t) => {
    const dt = Math.min(0.032, (t - antes) / 1000);
    antes = t;
    v += (-520 * x - 46 * v) * dt;
    x += v * dt;
    if (Math.abs(x) < 0.4 && Math.abs(v) < 4) {
      alPaso(0);
      alFin();
      return;
    }
    alPaso(x);
    marco = requestAnimationFrame(paso);
  };
  marco = requestAnimationFrame(paso);
  return () => cancelAnimationFrame(marco);
}

/**
 * Engancha el tirón a un boleto.
 *   lengueta  el botón que se arrastra
 *   cuerpo    la mitad que se lleva el tirón
 *   avisos    { alCruzar(bool), alRasgar(), alTocar() }
 * Devuelve { amago(recorrido), soltar() }.
 */
export function enganchar(lengueta, cuerpo, avisos) {
  let fase = "quieto"; // quieto | agarrado | volviendo | amago | rasgando
  let d = 0;
  let origen = 0;
  let alAgarrar = 0;
  let movido = 0;
  let cruzado = false;
  let detener = () => {};

  const poner = (v) => {
    d = v;
    pintar(cuerpo, v);
    const c = v >= UMBRAL;
    if (c !== cruzado) avisos.alCruzar((cruzado = c));
  };
  const reposo = () => {
    fase = "quieto";
    d = 0;
    soltarVariables(cuerpo);
  };

  const rasgar = () => {
    detener();
    fase = "rasgando";
    avisos.alCruzar((cruzado = false));
    const fin = () => {
      soltarVariables(cuerpo);
      avisos.alRasgar();
    };
    if (quieto()) return fin();
    /* Sin pasar por poner(): cruzaría el umbral otra vez y dejaría el aviso
       de "por rasgar" encendido para siempre. */
    detener = tween(d, UMBRAL * 1.5, 170, (v) => pintar(cuerpo, (d = v)), fin);
  };

  /* Baja un poco y vuelve: enseña el gesto. Nunca a media mano ni mientras
     se rasga; sí desde el reposo o a media vuelta. */
  const amago = (recorrido = 16) => {
    if (quieto() || (fase !== "quieto" && fase !== "volviendo")) return;
    detener();
    fase = "amago";
    detener = tween(d, recorrido, 260, poner, () => {
      detener = tween(recorrido, 0, 420, poner, reposo);
    });
  };

  const alBajar = (e) => {
    if (fase === "rasgando") return;
    detener();
    fase = "agarrado";
    origen = e.clientY - d;
    alAgarrar = d;
    movido = 0;
    lengueta.setPointerCapture(e.pointerId);
  };
  const alMover = (e) => {
    if (fase !== "agarrado") return;
    const v = e.clientY - origen;
    /* Desde donde lo agarró, no desde cero: puede agarrarlo a media vuelta. */
    movido = Math.max(movido, Math.abs(v - alAgarrar));
    poner(v);
  };
  const alSubir = () => {
    if (fase !== "agarrado") return;
    if (d >= UMBRAL) return rasgar();
    fase = "volviendo";
    if (movido < TOQUE) {
      if (quieto()) reposo();
      else amago();
      avisos.alTocar();
      return;
    }
    detener = resorte(d, poner, reposo);
  };
  /* Si el navegador se queda el gesto (pointercancel), solo vuelve. */
  const alCancelar = () => {
    if (fase !== "agarrado") return;
    fase = "volviendo";
    detener = resorte(d, poner, reposo);
  };
  /* Teclado y lectores de pantalla: Enter o espacio llegan como un click
     con detail 0 y rasgan directo. Obligar a arrastrar dejaría fuera a
     quien no puede. Los clicks de puntero ya se decidieron en alSubir. */
  const alPulsar = (e) => {
    if (e.detail === 0 && fase !== "rasgando") rasgar();
  };

  const eventos = { pointerdown: alBajar, pointermove: alMover, pointerup: alSubir, pointercancel: alCancelar, click: alPulsar };
  for (const [t, f] of Object.entries(eventos)) lengueta.addEventListener(t, f);

  return {
    amago,
    soltar() {
      detener();
      for (const [t, f] of Object.entries(eventos)) lengueta.removeEventListener(t, f);
    },
  };
}
