/* =========================================================================
   cupones.js — Los boletos de la repisa
   -------------------------------------------------------------------------
   Para agregar uno: copia el bloque y cámbiale el `id` (tiene que ser
   único: es la llave con la que se guarda si ya lo rasgó).
   ========================================================================= */

export const CUPONES = [
  {
    id: "cita",
    titulo: "Cupón de una cita",
    descripcion: "Vale por una cita especial juntos, donde tú elijas.",
    letraChica: "Sin fecha de vencimiento. Yo invito.",
    icono: "corazon"
  },
  {
    id: "sorpresa",
    titulo: "Cupón sorpresa",
    descripcion: "Canjeable por una sorpresa. No preguntes, solo cánjealo.",
    letraChica: "El contenido es secreto hasta el día.",
    icono: "regalo"
  },
  {
    id: "pelicula",
    titulo: "Cupón de película",
    descripcion: "Una noche de películas juntos, con cobija y palomitas.",
    letraChica: "Tú eliges la peli. Prometo no dormirme.",
    icono: "peli"
  },
  {
    id: "mimos",
    titulo: "Cupón de mimos",
    descripcion: "Vale por una tarde juntos sin prisa y sin celulares.",
    letraChica: "Renovable las veces que quieras.",
    icono: "taza"
  },
  {
    id: "especial",
    titulo: "Cupón especial",
    descripcion: "Tú decides cómo utilizarlo. Lo que se te ocurra.",
    letraChica: "El más poderoso de todos. Úsalo bien.",
    icono: "estrella"
  }
];

/* Cuánto hay que tirar para que se rasgue, en píxeles. Bajo de más y se
   rasga sin querer al hacer scroll; alto de más y parece que no funciona.
   72 px es aproximadamente el recorrido de un pulgar sin soltar. */
export const UMBRAL = 72;

/* La llave de localStorage. No se cambia sin una razón: si cambia, los
   boletos que ella ya rasgó vuelven a aparecer sin rasgar. */
export const LLAVE_CUPONES = "nh_cupones_v1";
