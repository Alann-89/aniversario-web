/* =========================================================================
   config.js — Centro de personalización
   -------------------------------------------------------------------------
   Todo lo que se cambia sin tocar nada más vive aquí.

   VERSIÓN DE MUESTRA: los textos son de ejemplo y no hay fotos ni canción.
   Pon los tuyos aquí, tus fotos en public/assets/fotos/ y tu canción en
   public/assets/audio/.
   ========================================================================= */

export const CONFIG = {
  /* ---------- Portada ---------- */
  titulo:        "Nuestra Historia",
  subtitulo:     "Un recorrido del atardecer a la noche",
  mensajeInicio: "Mi lugar favorito",
  /* El texto de la invitación de abajo. Ya no es un botón: es lo que se
     lee junto a la flecha, al lado de la impresión que asoma. */
  textoBoton:    "Baja, hay algo abajo",
  /* Lo que se ve en la pestaña del navegador. Déjalo vacío ("") para que
     mande el <title> del index.html y no haya dos títulos distintos. */
  tituloPestana: "Nuestra Historia",

  /* Imagen de fondo de la portada.
     Si el archivo no existe, se muestra el papel en espera y no se rompe
     nada. */
  portada: "/assets/fotos/portada.webp",

  /* ---------- Música ----------
     Vacío: el casete se ve pero no suena. Pon aquí la ruta de tu canción,
     por ejemplo "/assets/audio/cancion.mp3". */
  cancion:       "",
  nombreCancion: "Nuestra canción",
  artista:       "",
  volumenInicial: 0.55,   // 0 a 1

  /* ---------- Contador ---------- */
  // Fecha del primer momento, usada por el contador "juntos desde".
  fechaInicio: "2024-02-14",

  /* ---------- Trivia ---------- */
  trivia: {
    titulo:   "¿Cuánto me conoces?",
    subtitulo:"Antes de entrar, ábreme esto.",
    // Mensajes de la pantalla de recompensa
    recompensaTitulo:  "¡Me conoces muy bien!",
    recompensaTexto:   "Tu premio te espera al final del recorrido.",
    mensajeIncompleto: "Casi, casi. ¿Le damos otra vuelta?",
    /* Cuántas hay que acertar para que se abra el premio. null = todas. */
    minimoParaGanar: null
  },

  /* ---------- La puerta de la cabaña ----------
     La nota de papel pegada en la puerta, antes de entrar a los boletos.
     Déjala en "" para que no haya nota. */
  puertaNota: "pasa, está abierto",

  /* ---------- Mensaje final ---------- */
  finalTitulo: "Nuestra historia apenas comienza...",
  finalTexto:  "Gracias por cada momento de este camino.",
  finalFirma:  "— Con cariño",

  /* La indicación del regalo real. Va SIEMPRE al final de la carta, acierte
     o no la trivia: si la única pista del regalo dependiera de ganar, habría
     un camino en el que termina el sitio y nunca lo encuentra. */
  regaloTexto: "Ah, y una cosa más: hay una sorpresa esperándote.",
  regaloNota:  "Si no la encuentras, pregúntame.",

  /* ---------- Ajustes de experiencia ---------- */
  particulas: true,      // nieve flotando
  nieve:      true,      // nieve con viento en el paisaje
  parallax:   true       // profundidad al hacer scroll
};

/* =========================================================================
   LUGARES — el mapa de papel
   -------------------------------------------------------------------------
   OJO: el mapa es un DIBUJO, no una carta geográfica. `x` e `y` NO son
   coordenadas reales: son la posición dentro del dibujo, en el sistema
   del SVG, que va de 0 a 520 en horizontal y de 0 a 400 en vertical.

       x: 0 (izquierda)  ->  520 (derecha)
       y: 0 (arriba)     ->  400 (abajo)

   `busqueda` es lo que se manda a Google Maps al tocar la marca. Si lo
   dejas vacío, la marca no lleva a ningún lado (y no pasa nada).
   El orden del arreglo es el orden de la ruta.
   ========================================================================= */
export const LUGARES = [
  {
    nombre:   "Donde nos conocimos",
    detalle:  "14 febrero 2024",
    x: 168, y: 292,
    busqueda: "Bosque de Chapultepec, Ciudad de México"
  },
  {
    nombre:   "Nuestra primera cita",
    detalle:  "2 marzo 2024",
    x: 336, y: 196,
    busqueda: "Palacio de Bellas Artes, Ciudad de México"
  }
];

/* Texto que se muestra bajo el mapa cuando todavía faltan lugares por
   marcar. Si pones todos, déjalo en "" y desaparece solo. */
export const MAPA_PENDIENTE =
  "Faltan lugares por marcar — los voy poniendo.";

/* =========================================================================
   Paleta de color
   Se inyecta como variables CSS, así que cambiar aquí cambia todo el sitio.

   OJO: estos son los colores del MUNDO (cielo, nieve, acentos), no los del
   material. El papel, el cartón y las tintas viven en `@theme` dentro de
   src/styles/index.css, porque el color de una cosa no es un ajuste.
   ========================================================================= */
export const PALETA = {
  "--azul-pastel":   "#AEC6CF",
  "--azul-claro":    "#CEE7F0",
  "--azul-profundo": "#4B626A",
  "--azul-tinta":    "#31454E",
  "--crema":         "#FBF7F2",
  "--blanco":        "#FFFFFF",
  "--rosa-pastel":   "#F2D3DA",
  "--rosa-fuerte":   "#E29AAB",
  "--verde-pino":    "#6E8B7B",
  "--noche":         "#16222E",
  "--noche-alta":    "#2A3F52",
  "--texto":         "#25333B",
  "--texto-suave":   "#5C6B74"
};
