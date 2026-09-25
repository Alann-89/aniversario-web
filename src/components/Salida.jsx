import { useEscena } from "../nucleo/hooks.js";
import { Hilera } from "./Pino.jsx";
import { azar } from "../nucleo/efectos.js";

/* =========================================================================
   La salida — la otra puerta, desde dentro
   -------------------------------------------------------------------------
   El espejo del umbral: la pared del cuarto (el mismo color que la
   habitación, así que entra sin costura), la puerta trasera se abre y por
   el vano se ve la noche nevada; la cámara la cruza y la escena se
   desvanece sobre la travesía, que va solapada debajo.

   La cámara no entra por el centro del vano (terminaba en un azul liso)
   sino por debajo de su horizonte: con el origen en y=736, cuando empieza
   el desvanecido (escala ≈ 9.5) el horizonte del vano cae en y≈300, justo
   donde la travesía tiene el suyo. oy = (690·s − 300) / (s − 1). Las dos
   escenas se anclan igual (`xMidYMax slice`) para que eso valga también en
   escritorio.

   La pared lleva su ventana y su lámpara, como la habitación. Por el vano
   no se ven dos bandas lisas: hay estrellas, la luna y los
   pinos del borde del bosque, justo en la franja que queda en cuadro al
   cruzar. Mientras ella sigue dentro se ve el campo de delante, no la
   cabaña: la cabaña aparece al cruzar, en la travesía (es un contraplano).
   ========================================================================= */
/* El borde del bosque que se ve por el vano son LOS MISMOS pinos que la
   travesía tiene al fondo en su primer cuadro, proyectados al vano (escala
   ≈ 9.5 en el punto del fundido): al cruzar, cada árbol se queda donde
   estaba y la cabaña aparece sobre el mismo campo. Con árboles distintos, o
   más grandes, durante el fundido se veían fantasmas encima de la cabaña.
   Si se cambian allá, se recalculan aquí: x' = 600 + (x − 600) / 9.52,
   y' = 736 + (y − 736) / 9.52, alto' = alto / 9.52 (del más lejano al más
   cercano, para que se tapen bien). */
const PINOS = [
  [603.2, 703, 8.8], [639.4, 703.3, 9], [556, 703.9, 10.2], [597.1, 704.6, 9.1], [582.2, 705.1, 10.2], [636.4, 705.4, 10.4], [620.6, 706, 9],
  [563.2, 706.2, 10], [590.1, 706.7, 9.4], [627.7, 707.5, 11.9], [612.1, 707.5, 8.9], [572.8, 708.4, 9.3], [593.3, 709.3, 10.9], [623.2, 710.3, 12.7],
  [579.8, 711.5, 12.2], [557, 712.8, 11.6], [611.7, 713.5, 12], [648.2, 714.3, 13.8], [584.5, 715.1, 11.4],
];

/* La nieve que se ve por la ventana y por el vano, en dos capas:

   · LEJOS: copos chicos que pertenecen a cada hueco y solo cruzan su alto.
     Crecen con la cámara, así que se desvanecen al acercarse (salida.css).
     Sin ellos, de lejos no se veía nevar: un hueco chico apenas atrapa copos
     de una nevada del tamaño de la pantalla.
   · AL CRUZAR (solo el vano): un grupo que deshace el zoom de la cámara, así
     que sus copos caen del tamaño y a la velocidad de la nieve de la
     travesía y no se inflan a ×9.5; cubren el lienzo entero porque al final
     el vano es toda la pantalla, y en el fundido una nevada se funde con la
     otra, con la misma densidad.

   Posiciones y tiempos salen de azar(): iguales en el HTML del build y en el
   navegador. */
function sembrar(n, semilla, [x, y, ancho, alto], [r0, r1], [t0, t1], deriva) {
  return Array.from({ length: n }, (_, i) => {
    const k = i + semilla;
    const cy = y + azar(k * 5.7 + 1.3) * alto;
    const dura = t0 + azar(k * 1.9 + 2.1) * (t1 - t0);
    return {
      cx: (x + azar(k * 3.1 + 0.5) * ancho).toFixed(1),
      cy: cy.toFixed(1),
      r: (r0 + azar(k * 2.3 + 0.7) * (r1 - r0)).toFixed(2),
      estilo: {
        "--desde": `${(y - 4 - cy).toFixed(1)}px`,
        "--hasta": `${(y + alto + 4 - cy).toFixed(1)}px`,
        "--deriva": `${((azar(k * 4.3 + 0.9) - 0.5) * deriva).toFixed(1)}px`,
        animationDuration: `${dura.toFixed(1)}s`,
        animationDelay: `${(-dura * azar(k * 6.1 + 0.3)).toFixed(1)}s`,
      },
    };
  });
}
const LEJOS_VENTANA = sembrar(10, 0, [380, 400, 94, 120], [0.7, 1.3], [6, 12], 16);
const LEJOS_VANO = sembrar(16, 20, [540, 470, 120, 340], [0.7, 1.3], [12, 24], 20);
const AL_CRUZAR = sembrar(80, 50, [0, -20, 1200, 940], [0.9, 2.4], [16, 40], 120);

function Copos({ copos, clase }) {
  return (
    <g className={clase}>
      {copos.map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} style={c.estilo} />
      ))}
    </g>
  );
}

export function Salida() {
  const ref = useEscena({ modo: "fijo" });
  return (
    <section id="salida" ref={ref} className="escena salida" aria-hidden="true" data-captura="0,0.3,0.55">
      <div className="escena__escenario">
        <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice">
          <g className="salida__camara">
            <rect className="salida__pared" x="-20" y="-20" width="1240" height="940" />
            <rect className="salida__piso" x="-20" y="810" width="1240" height="110" />
            <defs className="luz">
              <radialGradient id="salida-halo">
                <stop offset="0" stopOpacity="0.34" />
                <stop offset="0.45" stopOpacity="0.1" />
                <stop offset="1" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="760" cy="358" r="150" fill="url(#salida-halo)" />
            {/* La misma habitación: la ventana y la lámpara, para que la
                pared de la salida no sea un paño liso. La ventana SIN luna:
                la luna está en el vano, y con la puerta abierta se veían dos
                (lo vio Alan). Por la ventana, como por el vano, nieva. */}
            <defs>
              <clipPath id="salida-ventana">
                <rect x="380" y="400" width="94" height="120" />
              </clipPath>
            </defs>
            <rect className="salida__marco" x="372" y="392" width="110" height="136" />
            <rect className="salida__cielo" x="380" y="400" width="94" height="120" />
            <g clipPath="url(#salida-ventana)">
              <Copos copos={LEJOS_VENTANA} clase="copos copos--lejos" />
            </g>
            <path className="salida__marco-cruz" d="M427 400v120M380 460h94" />
            <path className="salida__cable" d="M760 0v332" />
            <path className="salida__pantalla" d="M738 352l10-20h24l10 20Z" />
            <circle className="salida__foco" cx="760" cy="358" r="8" />
            <rect className="salida__cerco" x="526" y="456" width="148" height="354" />
            <defs>
              <clipPath id="salida-vano">
                <rect x="540" y="470" width="120" height="340" />
              </clipPath>
            </defs>
            {/* Recortado al hueco de la puerta: lo de afuera no puede
                asomar por encima de la pared. */}
            <g className="salida__vano" clipPath="url(#salida-vano)">
              <rect className="salida__cielo" x="540" y="470" width="120" height="340" />
              <circle className="salida__luna" cx="630" cy="520" r="9" />
              <g className="salida__estrellas">
                <circle cx="560" cy="500" r="1.4" />
                <circle cx="584" cy="548" r="1.1" />
                <circle cx="604" cy="492" r="1.2" />
                <circle cx="648" cy="580" r="1" />
                <circle cx="572" cy="612" r="1.1" />
                <circle cx="620" cy="640" r="0.9" />
              </g>
              {/* El suelo, como el de la travesía proyectado: el horizonte en
                  y≈690 (su y=300) y el filo lejano delgado. */}
              <path
                className="cresta"
                d="M536.8 686.1 L552.6 683.4 L568.4 685.1 L582.1 681.9 L595.8 684.8 L606.3 682.3 L618.9 684.6 L631.6 682.7 L646.3 685.5 L663.2 683.8 V690.1 H536.8Z"
              />
              <rect className="suelo" x="540" y="690" width="120" height="120" />
              <rect className="suelo--lejos" x="540" y="690" width="120" height="1.3" />
              <g className="pinos">
                <Hilera pinos={PINOS} inclina={0.2} />
              </g>
              <Copos copos={LEJOS_VANO} clase="copos copos--lejos" />
              <Copos copos={AL_CRUZAR} clase="copos salida__al-cruzar" />
            </g>
            <g className="salida__hoja">
              <rect x="540" y="470" width="120" height="340" />
              <circle className="salida__pomo" cx="646" cy="650" r="4.5" />
            </g>
          </g>
        </svg>
        {/* El fuego del cuarto sigue latiendo en esta pared; se queda atrás
            al cruzar la puerta. */}
        <div className="salida__fuego" aria-hidden="true">
          <div className="fuego" />
        </div>
      </div>
    </section>
  );
}
