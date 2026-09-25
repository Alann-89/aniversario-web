/* =========================================================================
   historia.js — Los momentos de la subida
   -------------------------------------------------------------------------
   Cada momento se dibuja como DOS objetos sueltos sobre la ladera: una
   impresión fotográfica pegada con cinta, y a su lado una tira de papel de
   nota con la fecha y lo que pasó. No hay tarjeta contenedora, y no debe
   haberla: en cuanto se mete todo en una caja blanca con esquinas
   redondeadas vuelve a ser una plantilla.

   VERSIÓN DE MUESTRA: los momentos son de ejemplo. Las fotos que no
   existen en public/assets/fotos/ se pintan como papel "aquí va una foto".

   PARA AGREGAR MOMENTOS: copia un bloque del arreglo y ponlo donde toque.
   El orden del arreglo es el orden del camino. Las fechas van tal cual las
   escribas; no se reordenan ni se reformatean.
   ========================================================================= */

export const HISTORIA = [
  {
    fecha:       "14 febrero 2024",
    titulo:      "La vez que nos conocimos",
    descripcion: "El primer día de todos, sin saber todo lo que venía después.",
    imagen:      "/assets/fotos/momento1.webp",
    icono:       "chispa",
    lugar:       "Bosque de Chapultepec, Ciudad de México",
    mapa:        "Bosque de Chapultepec, Ciudad de México"
  },
  {
    fecha:       "2/3/2024",
    titulo:      "Primera cita",
    descripcion: "Los nervios, la plática que no se acababa y el camino de regreso.",
    imagen:      "/assets/fotos/momento2.webp",
    icono:       "copa",
    lugar:       "Palacio de Bellas Artes, Ciudad de México",
    mapa:        "Palacio de Bellas Artes, Ciudad de México"
  },
  {
    fecha:       "20/4/24",
    titulo:      "Una tarde en el parque",
    descripcion: "Caminar sin prisa, platicar de todo y de nada.",
    imagen:      "/assets/fotos/momento3.webp",
    icono:       "hoja"
  },
  {
    fecha:       "8/6/24",
    titulo:      "Noche de películas",
    descripcion: "Cobija, palomitas y una película que ninguno de los dos terminó de ver.",
    imagen:      "/assets/fotos/momento4.webp",
    icono:       "peli"
  },
  {
    fecha:       "15/9/24",
    titulo:      "Nuestra primera feria",
    descripcion: "Luces, juegos y un peluche ganado a la tercera.",
    imagen:      "/assets/fotos/momento5.webp",
    icono:       "feria"
  },
  {
    fecha:       "24/12/24",
    titulo:      "Una sorpresa",
    descripcion: "Un momento especial que todavía recuerdo con una sonrisa.",
    imagen:      "/assets/fotos/momento6.webp",
    icono:       "regalo"
  }

  /* Copia este bloque las veces que haga falta:

     ,{
       fecha:       "",                         // como tú la escribas
       titulo:      "",
       descripcion: "",
       imagen:      "/assets/fotos/momento7.webp",
       icono:       "corazon",                  // ver la lista en components/Icono.jsx
       lugar:       "",                         // opcional: texto de la dirección
       mapa:        ""                          // opcional: búsqueda de Google Maps
     }

     Iconos disponibles: corazon, estrella, chispa, copa, hoja, peli,
     feria, regalo, taza, cabana, casa, libro, ticket, pin, camara, luna.
  */
];
