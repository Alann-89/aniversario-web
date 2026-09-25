/* =========================================================================
   Anochecer — la única escena sin texto
   -------------------------------------------------------------------------
   Aquí, y solo aquí, el cielo cruza la banda de luminancia en la que ni el
   texto claro ni el oscuro pasan AA (ver src/nucleo/cielo.js). Por eso no lleva
   letra: es un tramo de scroll en el que el sol se hunde detrás de la
   ladera, sale la luna, se encienden las estrellas y, al final, la cámara
   mira al cielo y la ladera baja fuera del cuadro para que el mapa quede
   sobre la noche. Lo que se ve vive en la capa fija (Cielo.jsx); esta
   sección solo marca cuánto dura.

   Nunca queda una pantalla vacía: en cada cuadro está la ladera o, al
   final, el cielo con la luna y las estrellas, que es el fondo del mapa.
   ========================================================================= */
export function Anochecer() {
  return <section id="anochecer" className="escena anochecer" aria-hidden="true" data-captura="0,0.35,0.7,1" />;
}
