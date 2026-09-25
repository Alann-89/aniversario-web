import { CONFIG } from "../data/config.js";
import { useEscena } from "../nucleo/hooks.js";
import { Cabana } from "./Cabana.jsx";
import { Hilera } from "./Pino.jsx";
import { Nevada } from "./Nevada.jsx";

/* =========================================================================
   El umbral — de la cabaña a lo lejos, a cruzar su puerta
   -------------------------------------------------------------------------
   UN SOLO movimiento de cámara, sin cortes: la escena pegajosa arranca con
   la cabaña a lo lejos en la nieve, con las ventanas encendidas (la misma
   de la travesía), la cámara se acerca a su puerta hasta que la puerta llena la
   pantalla, la hoja se abre y por el vano se ve el cuarto encendido; al
   final la escena se desvanece sobre la habitación de verdad, que va
   solapada debajo. Antes el muro de la cabaña entraba desde abajo con un
   borde recto: era un corte.

   Todo sale de `--p` (escena.js) en CSS: un transform sobre un solo grupo
   (la cámara) y opacidades. Lienzo 1200×900 en `slice` anclado abajo: en
   un teléfono vertical se ve x ≈ 390–810, y ahí vive la cabaña.

   POR LA PUERTA SE VE EL CUARTO ENCENDIDO, nunca un agujero; y al fundirse
   aparece la habitación de verdad, que al llegar ya enseña su ventana, su
   lámpara y el primer boleto. Un solo cuarto: el vano no repite nada de la
   habitación, porque dos copias a escalas distintas se ven a la vez.

   La escena no recibe punteros: solapada con la habitación, se comería
   los tirones de los cupones. La nota de la puerta es texto de Alan: va
   dibujada y, para el lector de pantalla, también como texto.
   ========================================================================= */
const PINOS = [
  [372, 702, 110], [424, 708, 80], [466, 700, 140], [738, 702, 128], [778, 708, 84], [822, 698, 150],
  [250, 696, 100], [300, 702, 70], [900, 700, 116], [960, 696, 90], [120, 700, 124], [1080, 702, 108],
];

export function Umbral() {
  const ref = useEscena({ modo: "fijo" });
  return (
    <section id="umbral" ref={ref} className="escena umbral" data-captura="0,0.3,0.5,0.62">
      {CONFIG.puertaNota ? <p className="solo-lectores">En la puerta, una nota: {CONFIG.puertaNota}</p> : null}
      <div className="escena__escenario" aria-hidden="true">
        <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice">
          <g className="umbral__camara">
            <path className="suelo suelo--lejos" d="M0 694 Q300 676 600 688 T1200 684 V900 H0Z" />
            <g className="pinos pinos--lejos">
              <Hilera pinos={PINOS} inclina={2} />
            </g>
            <path className="suelo" d="M0 724 Q300 710 600 718 T1200 716 V900 H0Z" />
            <g transform="translate(600 720) scale(1.5)">
              <Cabana sufijo="umbral" />
              {/* El vano: el cuarto encendido. Solo su color, la lámpara (que
                  sale de cuadro por arriba antes del fundido) y el piso. NADA
                  que exista también en la habitación a otra escala: un boleto
                  o una ventana del vano, agrandados, caían medio transparentes
                  encima de los de verdad durante el fundido (se vio en el
                  teléfono). Un solo cuarto: el de la habitación. */}
              <g className="umbral__vano">
                <rect className="umbral__dentro" x="-12" y="-32" width="24" height="32" />
                <path className="umbral__cable" d="M1.6 -32 V-28.5" />
                <circle className="umbral__foco" cx="1.6" cy="-27.9" r="0.7" />
                <rect className="umbral__piso" x="-12" y="-4" width="24" height="4" />
              </g>
              {/* La nota va pegada A LA HOJA y gira con ella: suelta, se
                  quedaba flotando sobre el marco mientras la puerta se abría. */}
              <g className="umbral__hoja">
                <rect x="-12" y="-32" width="24" height="32" />
                <circle className="umbral__pomo" cx="8.5" cy="-15" r="0.9" />
                {CONFIG.puertaNota ? (
                  <g className="umbral__nota">
                    <rect x="-9.5" y="-25" width="19" height="6.4" transform="rotate(-3)" />
                    <text x="0" y="-20.8" textAnchor="middle" transform="rotate(-3)">
                      {CONFIG.puertaNota}
                    </text>
                  </g>
                ) : null}
              </g>
            </g>
          </g>
        </svg>
        <Nevada />
      </div>
    </section>
  );
}
