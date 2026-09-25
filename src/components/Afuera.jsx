import { useRef } from "react";
import { useEscena } from "../nucleo/hooks.js";
import { CONFIG } from "../data/config.js";
import { Cabana } from "./Cabana.jsx";
import { Pino } from "./Pino.jsx";
import { Nevada } from "./Nevada.jsx";
import { Icono } from "./Icono.jsx";

/* =========================================================================
   Afuera — la travesía por la nieve
   -------------------------------------------------------------------------
   Una cámara que retrocede con ella. La cabaña encendida (acaba de salir de
   un cuarto con la lámpara prendida) se aleja hacia el horizonte, las
   huellas nacen de su puerta y llegan hasta nosotros, y los pinos pasan a
   los lados. Perspectiva de verdad, no escalas a ojo:

       y = HORIZONTE + F / D        x = 600 + F · xMundo / D
       escala = S / D               (D = distancia a la cámara)

   La cámara va de Z0 a Z1 (distancia a la cabaña) con el scroll. Todo se
   calcula aquí y se escribe como atributo `transform` de cada elemento,
   solo si cambió (nunca estado de React: son ~60 nodos, y a la vez casi la
   mitad están quietos en scale(0)). El HTML del build ya
   trae el cuadro final, así que sin JavaScript se ve la cabaña lejos y el
   rastro completo, y al hidratar no hay nada distinto.

   Las huellas son de bota, pequeñas, y la punta mira hacia donde ella
   camina: hacia la cámara (decisión de Alan). Alternan pie izquierdo y
   derecho, con un temblor, porque nadie pisa igual dos veces.

   La cabaña aparece al cruzar: mientras ella sigue dentro, por la puerta se
   ve el campo de delante, no la casa. Es un contraplano. Durante el fundido
   de la salida esta escena se queda quieta en su primer cuadro, que es lo
   mismo que se ve por el vano (sin cabaña ni pinos cercanos); solo cuando
   la salida ya no está echa a andar la cámara y aparecen la cabaña, sus
   huellas y los pinos de delante, sobre un campo limpio, sin doble
   exposición.

   Lienzo 1200×900 en `slice` anclado abajo, como la salida: en un teléfono
   vertical se ve x ≈ 390–810, y ahí viven el rastro, la cabaña y los pinos
   cercanos.

   LA CARTA va DENTRO de la misma sección, después del recorrido: la escena
   sigue pegada mientras la carta sube encima, así que nunca hay un corte
   entre caminar y leer, y al final la cabaña queda arriba, pequeña y
   encendida. Se despliega al acercarse (se levanta desde su borde de abajo
   y los dobleces se borran) y, abierta del todo, pierde el transform: con
   una rotación residual el compositor dejaba costuras blancas en el papel.

   LA CARTA SIEMPRE DICE LO DEL COCHE, acierte o no la trivia: ella abre
   esto sola, y si la única pista del regalo dependiera de sacar tres de
   tres habría un camino en el que termina el sitio y nunca sale al coche.
   Es la razón de que exista la página.
   ========================================================================= */
const HORIZONTE = 300;
const F = 1400;
const Z0 = 4.7;
const Z1 = 17;
const ADELANTE = 1.6; // la huella más nueva va un poco por delante de la cámara
const PASO = 0.42;
/* Lo que dura el fundido de la salida medido en este recorrido: el 10 % de
   --salida-recorrido (100vh) de los 220vh de .afuera__recorrido. */
const CRUCE = 10 / 220;

/* La planta de una bota con su tacón, punta hacia abajo (hacia la cámara).
   El pie izquierdo es esta misma espejada. */
const PLANTA = "M0 30C16 30 18 12 14 0C10-10-10-10-14 0C-18 12-16 30 0 30ZM0-12C9-12 11-22 0-30C-11-22-9-12 0-12Z";

const HUELLAS = Array.from({ length: Math.ceil((Z1 - ADELANTE - 0.35) / PASO) + 1 }, (_, i) => {
  const z = 0.35 + i * PASO;
  const pie = i % 2 ? 1 : -1;
  return { z, x: 0.12 * Math.sin(z * 0.55) + pie * 0.07, pie, giro: pie * 5 + ((i * 7919) % 7) - 3 };
});
/* Pinos: (xMundo, z, alto). z < 0 queda detrás de la cabaña. Los de
   delante van cerca del rastro (|x| ≈ 0.3): al acercarse pasan por los
   bordes de la pantalla del TELÉFONO, cortados como pasa un árbol al
   caminar. Los de |x| ≈ 1 son relleno para escritorio. */
const PINOS = [
  [-0.95, -2.2, 1], [1.15, -2.6, 1.1], [-1.5, -3.4, 0.9], [1.6, -3.8, 1.2], [-0.62, -1.2, 0.8], [0.5, -1.6, 0.9], [-0.35, -3, 1],
  [-2.3, -4.5, 1.1], [2.4, -5, 1.2], [-1.9, -1.8, 0.9], [2, -1.4, 1], [-3.2, -6, 1.3], [3, -6.5, 1.2],
  [-0.2, -5.5, 1.1], [1.3, -4.6, 1], [-1.2, -5.2, 1.2], [0.7, -3.8, 0.9], [-0.6, -4.2, 1], [0.25, -6.8, 1.2],
  [-0.3, 2.2, 1], [0.34, 3.4, 1.1], [-0.38, 5, 1.2], [0.3, 6.6, 0.9], [-0.32, 8.4, 1], [0.36, 10, 1.2],
  [-0.3, 12.2, 1.1], [0.32, 14, 1], [-0.4, 15.6, 1.3], [0.38, 17.4, 1.2], [-0.3, 19.2, 1],
  [-0.9, 3, 1.2], [1, 5.5, 1.1], [-1.1, 8, 1.3], [0.95, 11, 1.2], [-1, 14.5, 1.1], [1.1, 18, 1.3],
].sort((a, b) => a[1] - b[1]);

const proyectar = (xm, z, Z) => {
  const D = Z - z;
  return { D, x: 600 + (F * xm) / D, y: HORIZONTE + F / D };
};
function cuadro(p) {
  const Z = Z0 + (Z1 - Z0) * p;
  const cab = proyectar(0, 0, Z);
  return {
    cabana: `translate(600 ${cab.y.toFixed(1)}) scale(${(7 / Z).toFixed(3)})`,
    huellas: HUELLAS.map((h) => {
      const q = proyectar(h.x, h.z, Z);
      return h.z <= Z - ADELANTE && q.D > 1.1
        ? `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) scale(${((h.pie * 0.8) / q.D).toFixed(3)} ${(0.8 / q.D).toFixed(3)}) rotate(${h.giro})`
        : "scale(0)";
    }),
    pinos: PINOS.map(([xm, z, alto]) => {
      const q = proyectar(xm, z, Z);
      return q.D > 0.9 ? `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) scale(${((8 * alto) / q.D).toFixed(3)})` : "scale(0)";
    }),
  };
}
const FINAL = cuadro(1);

/* Escribe un transform solo si cambió: setAttribute vuelve a analizar la
   lista de transformaciones aunque el valor sea el mismo. */
const poner = (el, t) => {
  if (el && el.__t !== t) el.setAttribute("transform", (el.__t = t));
};

export function Afuera() {
  const cabana = useRef(null);
  const huellas = useRef([]);
  const pinos = useRef([]);
  const cerca = useRef(null);
  const rastro = useRef(null);
  /* Se abre hasta que su borde de abajo toca el de la pantalla, que es el
     final de la página: siempre llega a abrirse, también en escritorio. */
  const carta = useEscena({
    modo: "recorrido",
    alCambiar: (p, e) => e.el.toggleAttribute("data-abierta", p > 0.97),
  });
  const recorrido = useEscena({
    modo: "recorrido",
    css: false,
    alCambiar: (p) => {
      const q = Math.max(0, (p - CRUCE) / (1 - CRUCE));
      const c = cuadro(q);
      poner(cabana.current, c.cabana);
      c.huellas.forEach((t, i) => poner(huellas.current[i], t));
      c.pinos.forEach((t, i) => poner(pinos.current[i], t));
      /* El contraplano: la cabaña, sus huellas y los pinos de delante
         aparecen ya cruzada la puerta. */
      const ver = Math.min(1, q * 20).toFixed(3);
      for (const el of [cabana.current, rastro.current, cerca.current]) if (el) el.style.opacity = ver;
    },
  });

  const pino = (_, i) => (
    <g key={i} ref={(el) => (pinos.current[i] = el)} transform={FINAL.pinos[i]}>
      <Pino alto={100} ancho={46} inclina={i % 2 ? 3 : -3} />
    </g>
  );

  return (
    <section id="afuera" className="escena afuera de-noche" aria-labelledby="carta-titulo" data-captura="0,0.3,0.6">
      <div className="escena__escenario" aria-hidden="true">
        <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice">
          <path className="cresta" d="M0 262 L150 236 L300 252 L430 222 L560 250 L660 226 L780 248 L900 230 L1040 256 L1200 240 V320 H0Z" />
          <rect className="suelo" x="0" y={HORIZONTE} width="1200" height="620" />
          <path className="suelo--lejos" d={`M0 ${HORIZONTE} Q600 ${HORIZONTE - 14} 1200 ${HORIZONTE} V${HORIZONTE + 12} Q600 ${HORIZONTE} 0 ${HORIZONTE + 12}Z`} />
          <g ref={rastro} className="afuera__huellas">
            {HUELLAS.map((_, i) => (
              <path key={i} ref={(el) => (huellas.current[i] = el)} d={PLANTA} transform={FINAL.huellas[i]} />
            ))}
          </g>
          <g className="pinos">{PINOS.map((p, i) => (p[1] < 0 ? pino(p, i) : null))}</g>
          <g ref={cabana} transform={FINAL.cabana}>
            <Cabana sufijo="afuera" />
          </g>
          <g ref={cerca} className="pinos">{PINOS.map((p, i) => (p[1] >= 0 ? pino(p, i) : null))}</g>
        </svg>
        <Nevada />
      </div>
      <div ref={recorrido} className="afuera__recorrido" />
      <article ref={carta} id="carta" className="columna carta" data-captura="0">
        <div className="carta__plegable">
          <span className="cinta" aria-hidden="true" />
          <div className="carta__hoja papel">
          <h2 id="carta-titulo" className="display carta__titulo">{CONFIG.finalTitulo}</h2>
          <p className="carta__texto">{CONFIG.finalTexto}</p>
          <p className="display carta__firma">
            {CONFIG.finalFirma}
            <Icono nombre="corazon" aria-hidden="true" />
          </p>
          {/* El regalito dibujado junto a la línea del coche: lo único de la
              carta que no es solo palabras. */}
          <p className="display carta__regalo">
            <Icono nombre="regalo" aria-hidden="true" />
            <span>{CONFIG.regaloTexto}</span>
          </p>
          <p className="carta__nota">{CONFIG.regaloNota}</p>
          </div>
        </div>
      </article>
      {/* Sin la ciudad en el pie (decisión de Alan, 18 sep 2026). */}
      <footer className="pie">
        Hecho a mano para ti{" "}
        <svg className="pie__corazon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.4c-.7 0-8.4-5.8-8.4-11.1 0-2.9 2.3-5.1 5.1-5.1 1.5 0 2.7.7 3.3 1.7.6-1 1.8-1.7 3.3-1.7 2.8 0 5.1 2.2 5.1 5.1 0 5.3-7.7 11.1-8.4 11.1Z" />
        </svg>
      </footer>
    </section>
  );
}
