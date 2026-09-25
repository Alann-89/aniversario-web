import { useEffect, useRef } from "react";
import { registrar } from "./nucleo/escena.js";
import { pintarCielo } from "./nucleo/cielo.js";
import { Portada } from "./components/Portada.jsx";
import { Subida } from "./components/Subida.jsx";
import { Cielo } from "./components/Cielo.jsx";
import { Anochecer } from "./components/Anochecer.jsx";
import { Mapa } from "./components/Mapa.jsx";
import { Puerta } from "./components/Puerta.jsx";
import { Umbral } from "./components/Umbral.jsx";
import { Adentro } from "./components/Adentro.jsx";
import { Salida } from "./components/Salida.jsx";
import { Afuera } from "./components/Afuera.jsx";
import { Casete } from "./components/Casete.jsx";

/* =========================================================================
   App — el orden de las capas
   -------------------------------------------------------------------------
     1. El cielo, fijo detrás de todo. No lleva contenido.
     2. El casete, fijo encima, que se aparta.
     3. El contenido, un componente por tramo, en el orden del recorrido.

   La rampa del cielo (src/nucleo/cielo.js) sale de cuatro secciones: la subida
   (a), el anochecer (b), la entrada del mapa (c, baja la ladera) y el
   interior de la cabaña (la barra del teléfono toma su color).
   ========================================================================= */
function useRampa(capa) {
  useEffect(() => {
    const e = { a: 0, b: 0, c: 0, cuarto: false, salida: false };
    const pintar = () => capa.current && pintarCielo(capa.current, e.a, e.b, e.c, e.cuarto || e.salida);
    const RAMPA = [
      ["historia", { modo: "paso" }, (p) => (e.a = p)],
      ["anochecer", { modo: "fijo" }, (p) => (e.b = p)],
      ["mapa", { modo: "entrada", fin: 0.6 }, (p) => (e.c = p)],
      /* Dentro de la cabaña… */
      ["adentro", { modo: "paso" }, (_, s, y, vh) => (e.cuarto = y >= s.top && y < s.top + s.alto - vh / 2)],
      /* …y en la pared de la salida, hasta que la puerta se abre a la noche
         (salida.css: la cámara cruza a partir de 0.18 y el vano ya domina
         el cuadro hacia 0.35). Modo "paso" y no "fijo": en "fijo" el avance
         se queda en 0 antes de pegarse y el color podía quedarse atorado. */
      ["salida", { modo: "paso" }, (_, s, y, vh) => (e.salida = y >= s.top - vh / 2 && y < s.top + (s.alto - vh) * 0.35)],
    ];
    const quitar = RAMPA.filter(([id]) => document.getElementById(id)).map(([id, opciones, alCambiar]) =>
      registrar({
        el: document.getElementById(id),
        css: false,
        ...opciones,
        alCambiar: (...args) => {
          alCambiar(...args);
          pintar();
        },
      })
    );
    pintar();
    return () => quitar.forEach((q) => q());
  }, [capa]);
}

export default function App() {
  const cielo = useRef(null);
  useRampa(cielo);
  return (
    <>
      <a className="saltar" href="#historia">Saltar a la historia</a>
      <Cielo ref={cielo} />
      <Casete />
      <main className="app">
        <Portada />
        <Subida />
        <Anochecer />
        <Mapa />
        <Puerta />
        <Umbral />
        <Adentro />
        <Salida />
        <Afuera />
      </main>
    </>
  );
}
