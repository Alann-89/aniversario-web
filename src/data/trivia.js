/* =========================================================================
   trivia.js — "¿Cuánto me conoces?"
   -------------------------------------------------------------------------
   VERSIÓN DE MUESTRA: las preguntas son de ejemplo.

   PARA AGREGAR PREGUNTAS: copia un objeto del arreglo.
   `clave` NO es el índice directo: se guarda ofuscado para que la
   respuesta no se lea de un vistazo abriendo el archivo.

       clave = (índiceDeLaOpciónCorrecta * 7) + 3
       A → 3     B → 10     C → 17     D → 24
   ========================================================================= */

export const PREGUNTAS = [
  {
    pregunta: "¿Cuál es mi color favorito?",
    opciones: ["Azul", "Rojo", "Verde"],
    clave: 3
  },
  {
    pregunta: "¿Qué prefiero para una tarde libre?",
    opciones: ["Salir a caminar", "Ver una película", "Dormir una siesta"],
    clave: 10
  },
  {
    pregunta: "¿Dónde fue nuestra primera cita?",
    opciones: ["En un café", "En un museo", "En el cine"],
    clave: 10
  }

  /* Entre seis y ocho preguntas es donde empieza a sentirse un juego.
     Mezcla fáciles con difíciles.

     ,{
       pregunta: "",
       opciones: ["", "", ""],
       clave: 3                      // 3 = la primera, 10 = la segunda, 17 = la tercera
     }
  */
];

/* Aviso mientras falten preguntas. Déjalo en "" cuando termines de
   llenarlo y desaparece solo. */
export const PENDIENTE_TRIVIA = "";

/* La respuesta correcta, sacada de la clave ofuscada. */
export const descifrar = (clave) => (clave - 3) / 7;
