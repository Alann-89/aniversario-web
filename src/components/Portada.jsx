import { useRef } from "react";
import { CONFIG } from "../data/config.js";
import { HISTORIA } from "../data/historia.js";
import { useEscena } from "../nucleo/hooks.js";
import { Impresion, hayFoto } from "./Impresion.jsx";

/* =========================================================================
   Portada — la foto de los dos a pantalla completa, con el título encima
   -------------------------------------------------------------------------
   Decisión de Alan (18 sep 2026): se probó otra portada y prefirió esta.
   No se vuelve a proponer.

   La foto es una <img> que viaja en el HTML (no un fondo puesto desde un
   efecto): se pinta sin esperar al JavaScript y el build la anuncia con
   preload. Encima, el velo —funcional: garantiza el contraste sea cual sea
   la foto— y el título.

   Tres gestos de papel (Alan, 24 sep 2026):
   · LA FOTO SE REVELA al abrir, como una instantánea: empieza lavada y en
     un par de segundos toma su color (una capa de papel que se desvanece;
     solo opacidad).
   · "Mi lugar favorito y perfecto" es una NOTA PEGADA A LA FOTO, junto a
     ellos dos: el lugar son ellos. Abajo quedan solo el título y su frase.
   · Abajo asoma la primera impresión de la subida, girada, y la pista
     ("baja, hay algo abajo") va ESCRITA EN SU CINTA, con la línea de
     siempre bajando hacia ella: la invitación no es un botón, es algo
     físico esperándola. La línea se desvanece al empezar a bajar. Sube con el
     scroll píxel por píxel hasta quedar entera y luego sigue a la página
     (si se quedara fija, el borde de la sección la guillotinaría con una
     línea recta). Responde a su gesto, así que se conserva con movimiento
     reducido.
   ========================================================================= */
/* Los dibujitos del espejo, con la paleta: corazones de labial (sello),
   estrellas y luna de ámbar (la noche que viene), destellos de durazno y
   de cielo. [trazo, color, grosor]. Aparecen en este orden. */
const DIBUJOS = [
  ["M64 58c-5-13-25-12-25 3 0 13 15 21 25 32 9-11 25-19 25-32 0-15-19-16-24-2", "sello", 2.8],
  ["M186 20l6 17 18 1-14 11 5 18-15-10-15 10 5-18-14-11 18-1 5-16", "ambar"],
  ["M288 30v26M275 43h26M280 35l16 16M296 35l-16 16", "papel"],
  ["M246 124c-3-8-16-7-16 2 0 8 9 13 16 20 6-7 16-12 16-20 0-9-12-10-15-1", "tarde"],
  ["M118 132v12M112 138h12", "cielo"],
  ["M144 78a15 15 0 1 0 12 25 12 12 0 1 1-12-25", "ambar"],
  ["M318 104c-2-5-10-4-10 1 0 5 6 8 10 12 4-4 10-7 10-12 0-6-8-6-9-1", "sello", 2.8],
  ["M44 150l3 8 8 1-6 5 2 8-7-5-7 5 2-8-6-5 8-1 3-7", "tarde"],
  // Puntitos: trazos de largo cero; con la punta redonda, un punto.
  ["M214 84h.1M224 90h.1M234 84h.1", "papel", 3.6],
];

export function Portada() {
  /* El avance se escribe solo en el elemento que lo lee: en la sección
     invalidaría la foto y cada palabra del título en cada cuadro. */
  const asoma = useRef(null);
  const ref = useEscena({
    modo: "salida",
    css: false,
    alCambiar: (p, e) => {
      asoma.current?.style.setProperty("--p", p.toFixed(4));
      asoma.current?.style.setProperty("--bajado", (p * e.alto).toFixed(1) + "px");
    },
  });
  const primera = HISTORIA[0];
  const palabras = CONFIG.titulo.split(/\s+/).filter(Boolean);

  return (
    <section id="portada" ref={ref} className="portada de-noche" aria-labelledby="portada-titulo" data-captura="0">
      {hayFoto(CONFIG.portada) && (
        <>
          <img
            className="portada__foto"
            src={CONFIG.portada}
            alt=""
            width="836"
            height="1600"
            fetchPriority="high"
            decoding="async"
          />
          <div className="portada__revelado" aria-hidden="true" />
          {/* Dibujitos en el espejo (Alan, 24 sep 2026): como hechos con
              plumón en el espejo donde se tomaron la foto. Llenan el techo
              vacío de arriba sin tapar caras ni la nota. Trazos abiertos,
              con el cierre un poco pasado, porque a mano nadie cierra
              perfecto. */}
          <svg className="portada__dibujos" viewBox="0 0 340 200" aria-hidden="true">
            {DIBUJOS.map(([d, color, grueso], i) => (
              <path
                key={i}
                className="dibujo"
                d={d}
                style={{ stroke: `var(--color-${color})`, strokeWidth: grueso, animationDelay: `${(1.1 + i * 0.22).toFixed(2)}s` }}
              />
            ))}
          </svg>
        </>
      )}
      <div className="portada__velo" aria-hidden="true" />

      <div className="portada__texto">
        {/* El espacio va FUERA de cada palabra: dentro de un inline-block
            animado se lo come y el título acaba diciendo "2años". */}
        <h1 id="portada-titulo" className="display portada__titulo">
          {palabras.map((p, i) => (
            <span key={i}>
              <span className="palabra" style={{ "--i": i }}>{p}</span>
              {i < palabras.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
        <p className="display portada__sub">{CONFIG.subtitulo}</p>
      </div>

      {CONFIG.mensajeInicio ? (
        <p className="display papel portada__nota">
          <span className="cinta" aria-hidden="true" />
          {CONFIG.mensajeInicio}
        </p>
      ) : null}

      {/* El enlace es el objeto entero; su nombre, la pista de la cinta. */}
      <a ref={asoma} className="portada__asoma" href="#historia">
        {/* La línea que baja, la de antes (Alan la quiso de vuelta): en su
            color claro, señalando la cinta. */}
        <span className="portada__linea" aria-hidden="true">
          <span className="portada__trazo" />
          <span className="portada__punta" />
        </span>
        <span className="cinta portada__pista">{CONFIG.textoBoton}</span>
        <span aria-hidden="true">
          <Impresion imagen={primera?.imagen} prioritaria />
        </span>
      </a>
    </section>
  );
}
