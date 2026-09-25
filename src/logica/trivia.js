import { useCallback, useEffect, useState } from "react";
import { CONFIG } from "../data/config.js";
import { PREGUNTAS, descifrar } from "../data/trivia.js";
import { leer, escribir } from "../nucleo/guardado.js";

/* =========================================================================
   La trivia, sin dibujo: el estado y las reglas
   -------------------------------------------------------------------------
   Reglas:
     · Hay que abrir el sobre antes de contestar.
     · Una pregunta a la vez; la respuesta no se puede cambiar.
     · Al fallar se enseña cuál era (decisión de Alan, 23 sep 2026).
     · Gana con CONFIG.trivia.minimoParaGanar aciertos (null = todas).
     · Ganar enseña el mensaje del regalo. Perder no cierra nada: la carta
       del final dice lo del coche de todos modos.

   El avance vive en sessionStorage: si recarga en la misma visita sigue
   donde iba. Se lee DESPUÉS de hidratar (el HTML del build siempre trae el
   sobre cerrado); src/nucleo/guardado.js se traga cualquier fallo del
   almacenamiento: no es motivo para no jugar.
   ========================================================================= */
const LLAVE = "nh_trivia_v2";
const META = Math.min(CONFIG.trivia.minimoParaGanar ?? PREGUNTAS.length, PREGUNTAS.length);
const LIMPIO = { abierto: false, actual: 0, respuestas: [], terminada: false };

export const correcta = (q) => descifrar(PREGUNTAS[q].clave);

/* Lo guardado puede venir de otra versión (Alan quitó o agregó preguntas):
   solo se acepta si cabe en las preguntas de ahora. */
const valido = (g) =>
  g &&
  Number.isInteger(g.actual) &&
  g.actual >= 0 &&
  g.actual < PREGUNTAS.length &&
  Array.isArray(g.respuestas) &&
  g.respuestas.length <= PREGUNTAS.length &&
  g.respuestas.every((r, q) => r === undefined || r === null || (Number.isInteger(r) && r >= 0 && r < PREGUNTAS[q].opciones.length));

export function useTrivia() {
  const [estado, setEstado] = useState(LIMPIO);

  useEffect(() => {
    const g = leer("sesion", LLAVE);
    if (valido(g)) setEstado({ ...LIMPIO, ...g, respuestas: g.respuestas.map((r) => (r === null ? undefined : r)) });
  }, []);

  /* LIMPIO es el estado con el que se monta: guardarlo pisaría lo que se
     acaba de leer (en desarrollo, con los efectos dobles, lo borraba). Todo
     cambio de verdad crea un objeto nuevo. */
  useEffect(() => {
    if (estado !== LIMPIO) escribir("sesion", LLAVE, estado);
  }, [estado]);

  const aciertos = estado.respuestas.filter((r, q) => r === correcta(q)).length;
  const gano = estado.terminada && aciertos >= META;
  const respondida = estado.respuestas[estado.actual] !== undefined;
  const acerto = respondida && estado.respuestas[estado.actual] === correcta(estado.actual);

  const abrir = useCallback(() => setEstado((s) => ({ ...s, abierto: true })), []);
  const elegir = useCallback(
    (i) =>
      setEstado((s) => {
        if (!s.abierto || s.terminada || s.respuestas[s.actual] !== undefined) return s;
        const respuestas = [...s.respuestas];
        respuestas[s.actual] = i;
        return { ...s, respuestas };
      }),
    []
  );
  const siguiente = useCallback(
    () =>
      setEstado((s) =>
        s.actual >= PREGUNTAS.length - 1 ? { ...s, terminada: true } : { ...s, actual: s.actual + 1 }
      ),
    []
  );
  const reiniciar = useCallback(() => setEstado({ ...LIMPIO, abierto: true }), []);

  return { ...estado, aciertos, gano, respondida, acerto, abrir, elegir, siguiente, reiniciar };
}
