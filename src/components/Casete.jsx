import { useRef } from "react";
import { CONFIG } from "../data/config.js";
import { useMusica, useApartado } from "../logica/musica.js";

/* =========================================================================
   El casete — "nuestra canción"
   -------------------------------------------------------------------------
   Decisión de Alan (13 sep 2026): el reproductor es un casete, porque es el
   objeto que "nuestra canción" significa. Y (24 sep 2026) con el lenguaje
   del resto de la página: la etiqueta es una nota de papel en la cursiva del
   sitio, pegada con un pedazo de cinta que lleva ♪ y tres rayitas de tinta
   que bailan mientras suena.

   Al bajar, el casete se guarda y SE QUEDA LA CINTA, entera, en la esquina:
   un objeto completo, no un casete cortado por el borde (así se veía antes,
   con letras a medias). Sin volumen: el iPhone ignora el volumen de la
   página (decisión de Alan).

   Un toque a la cinta sola solo despierta el casete; despierto, suena o
   pausa. Con teclado, al enfocarlo se enseña entero (CSS, :focus-within) y
   Enter ya suena.
   ========================================================================= */
export function Casete() {
  const zona = useRef(null);
  const { audio, sonando, alternar } = useMusica(zona);
  const { dormido, despertar } = useApartado();

  return (
    <div ref={zona} className={`casete${sonando ? " casete--sonando" : ""}${dormido ? " casete--dormido" : ""}`}>
      {/* Sin canción (la versión pública del repo) el casete se ve igual y
          simplemente no suena: sin src no se pide nada ni hay 404. */}
      <audio ref={audio} src={CONFIG.cancion || undefined} preload="none" loop />
      <button
        type="button"
        className="casete__boton"
        aria-label={sonando ? `Pausar “${CONFIG.nombreCancion}”` : `Reproducir “${CONFIG.nombreCancion}”`}
        onClick={(e) => {
          /* Un toque a la cinta sola solo despierta. Con teclado (detail 0)
             ya se ve entero por :focus-within: suena o pausa. */
          if (dormido && e.detail) return despertar();
          despertar();
          alternar();
        }}
      >
        <span className="casete__cuerpo" aria-hidden="true">
          <span className="casete__nota">
            <span className="casete__nombre">{CONFIG.nombreCancion}</span>
            <span className="casete__cara">A</span>
          </span>
          <span className="casete__fila">
            <span className="casete__ventana">
              <span className="casete__carrete" />
              <span className="casete__carrete" />
            </span>
            <svg className="casete__estado" viewBox="0 0 24 24">
              {sonando ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.4v13.2L19 12Z" />}
            </svg>
          </span>
        </span>
        <span className="casete__cinta" aria-hidden="true">
          <svg className="casete__nota-musical" viewBox="0 0 24 24">
            <ellipse cx="7.6" cy="17.4" rx="3.3" ry="2.6" transform="rotate(-18 7.6 17.4)" />
            <ellipse cx="17.6" cy="15" rx="3.3" ry="2.6" transform="rotate(-18 17.6 15)" />
            <path d="M9.6 17V5.6l10-2.6v12.2h-1.9V7.5l-6.2 1.6V17Z" />
          </svg>
          <span className="casete__ondas">
            <i />
            <i />
            <i />
          </span>
        </span>
      </button>
    </div>
  );
}
