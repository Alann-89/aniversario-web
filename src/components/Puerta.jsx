import { useEffect, useRef } from "react";
import { CONFIG } from "../data/config.js";
import { PREGUNTAS, PENDIENTE_TRIVIA } from "../data/trivia.js";
import { useTrivia, correcta } from "../logica/trivia.js";
import { useRevelar } from "../nucleo/hooks.js";
import { chispas, vibrar } from "../nucleo/efectos.js";
import { Icono } from "./Icono.jsx";

/* =========================================================================
   La puerta — "¿Cuánto me conoces?"
   -------------------------------------------------------------------------
   Un examen que ya está abierto en pantalla es un formulario; uno que hay
   que abrir es un juego. Por eso las preguntas viven dentro de un sobre
   con lacre (el subtítulo, "ábreme esto", lo pide). Sin JavaScript el
   sobre se ve abierto con las tres preguntas: se leen, no se juegan.

   Minimalista (decisión de Alan, 23 sep 2026): una pregunta a la vez, un
   punto por pregunta arriba (vacío lo que falta, anillo la actual, lleno
   lo acertado, sello lo fallado), las opciones como filas de papel y la
   marca de tinta EN la opción: palomita en la correcta, tache en la
   elegida si falló. Nada de avisos flotantes.
   ========================================================================= */
function Progreso({ respuestas, actual, aciertos, terminada }) {
  const etiqueta = terminada
    ? `${aciertos} de ${PREGUNTAS.length} aciertos`
    : `Pregunta ${actual + 1} de ${PREGUNTAS.length}, ${aciertos} ${aciertos === 1 ? "acierto" : "aciertos"}`;
  return (
    <ol className="progreso" role="img" aria-label={etiqueta}>
      {PREGUNTAS.map((_, q) => {
        const r = respuestas[q];
        const estado = r === undefined ? (q === actual && !terminada ? "actual" : "") : r === correcta(q) ? "bien" : "mal";
        return <li key={q} data-estado={estado || undefined} />;
      })}
    </ol>
  );
}

export function Puerta() {
  const t = useTrivia();
  const [refSobre, vistoSobre] = useRevelar();
  const foco = useRef(null);
  const moverFoco = useRef(null);

  /* El foco se va a donde está lo siguiente: quien juega con teclado o con
     lector no tiene que buscar dónde quedó el contenido. */
  useEffect(() => {
    const destino = moverFoco.current;
    moverFoco.current = null;
    if (destino) foco.current?.querySelector(destino)?.focus();
  });
  const con = (accion, destino) => () => {
    moverFoco.current = destino;
    accion();
  };

  return (
    <section id="puerta" className="puerta de-noche fondo-noche" aria-labelledby="puerta-titulo">
      <div className="columna puerta__cabecera" id="trivia" data-captura="0">
        <h2 id="puerta-titulo" className="display puerta__titulo">{CONFIG.trivia.titulo}</h2>
        <p className="puerta__sub">{CONFIG.trivia.subtitulo}</p>
      </div>

      <div
        ref={refSobre}
        id="sobre"
        className={`columna sobre papel revelar${vistoSobre ? " visto" : ""}${t.abierto ? " sobre--abierto" : ""}`}
        data-captura="0"
      >
        <span className="sobre__solapa" aria-hidden="true" />
        <div className="sobre__cierre">
          <button
            type="button"
            className="sobre__lacre"
            aria-label="Abrir el sobre"
            aria-expanded={t.abierto}
            aria-controls="trivia-zona"
            tabIndex={t.abierto ? -1 : 0}
            onClick={() => {
              /* Romper el lacre: un golpecito en la mano. */
              vibrar(12);
              con(t.abrir, ".pregunta__texto")();
            }}
          >
            <Icono nombre="corazon" />
          </button>
          <p className="sobre__invita">toca el lacre</p>
        </div>

        <div id="trivia-zona" className="trivia" ref={foco} inert={!t.abierto}>
          {!t.terminada ? (
            <>
              <Progreso respuestas={t.respuestas} actual={t.actual} aciertos={t.aciertos} terminada={false} />
              {PREGUNTAS.map((p, q) => {
                const elegida = t.respuestas[q];
                return (
                  <fieldset key={q} className={`pregunta${q === t.actual ? " pregunta--actual" : ""}`} inert={q !== t.actual}>
                    <legend className="solo-lectores">Pregunta {q + 1} de {PREGUNTAS.length}</legend>
                    <h3 className="display pregunta__texto" tabIndex={-1}>{p.pregunta}</h3>
                    <ul className="opciones">
                      {p.opciones.map((o, i) => {
                        const esCorrecta = elegida !== undefined && i === correcta(q);
                        const esError = elegida === i && i !== correcta(q);
                        return (
                          <li key={i}>
                            <button
                              type="button"
                              className="opcion"
                              data-estado={esCorrecta ? "bien" : esError ? "mal" : elegida !== undefined ? "apagada" : undefined}
                              aria-pressed={elegida === i}
                              aria-disabled={elegida !== undefined || undefined}
                              onClick={(e) => {
                                if (elegida !== undefined) return;
                                /* Acertar: chispas y un toque. Fallar: la
                                   opción tiembla (CSS) y dos toques cortos. */
                                if (i === correcta(q)) {
                                  chispas(e.currentTarget);
                                  vibrar(14);
                                } else vibrar([8, 50, 8]);
                                moverFoco.current = ".trivia__siguiente";
                                t.elegir(i);
                              }}
                            >
                              <span>{o}</span>
                              {esCorrecta || esError ? (
                                <span className="opcion__marca" aria-hidden="true">
                                  <Icono nombre={esCorrecta ? "palomita" : "tache"} />
                                </span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </fieldset>
                );
              })}
              {/* La región viva existe siempre (vacía hasta que contesta): un
                  lector de pantalla no anuncia una región que nace ya llena. */}
              <p className="trivia__reaccion" role="status">
                {t.respondida ? (t.acerto ? "Sí. Me conoces bien." : "Casi. Ya sabes cuál era.") : ""}
              </p>
              {t.respondida ? (
                <button type="button" className="tinta tinta--fuerte trivia__siguiente" onClick={con(t.siguiente, t.actual === PREGUNTAS.length - 1 ? ".premio" : ".pregunta--actual .pregunta__texto")}>
                  <span>{t.actual === PREGUNTAS.length - 1 ? "ver qué pasa" : "siguiente"}</span>
                  <Icono nombre="flecha" />
                </button>
              ) : null}
            </>
          ) : (
            <div className="premio" tabIndex={-1}>
              <Progreso respuestas={t.respuestas} actual={t.actual} aciertos={t.aciertos} terminada />
              {t.gano ? (
                <>
                  <h3 className="display premio__titulo">{CONFIG.trivia.recompensaTitulo}</h3>
                  <p className="premio__texto">{CONFIG.trivia.recompensaTexto}</p>
                  <p className="premio__llave">
                    <Icono nombre="candadoAbierto" />
                    <span>ve a mi coche</span>
                  </p>
                  <button type="button" className="tinta premio__otra" onClick={con(t.reiniciar, ".pregunta--actual .pregunta__texto")}>
                    <Icono nombre="repetir" />
                    <span>jugar otra vez</span>
                  </button>
                </>
              ) : (
                <>
                  <h3 className="display premio__titulo">
                    {t.aciertos} de {PREGUNTAS.length}
                  </h3>
                  <p className="premio__texto">{CONFIG.trivia.mensajeIncompleto}</p>
                  <button type="button" className="tinta tinta--fuerte premio__otra" onClick={con(t.reiniciar, ".pregunta--actual .pregunta__texto")}>
                    <Icono nombre="repetir" />
                    <span>intentar de nuevo</span>
                  </button>
                </>
              )}
            </div>
          )}
          {PENDIENTE_TRIVIA ? <p className="trivia__pendiente">{PENDIENTE_TRIVIA}</p> : null}
        </div>
      </div>

    </section>
  );
}
