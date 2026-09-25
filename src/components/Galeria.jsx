import { useEffect, useRef } from "react";
import { HISTORIA } from "../data/historia.js";
import { hayFoto } from "./Impresion.jsx";
import { Icono } from "./Icono.jsx";

/* =========================================================================
   Galería — la foto en grande
   -------------------------------------------------------------------------
   Un <dialog> abierto con showModal(): el navegador atrapa el foco, vuelve
   inerte el resto de la página, cierra con Escape y devuelve el foco al
   botón que lo abrió. Nada de eso se reescribe a mano.

   Solo recorre los momentos que tienen foto. Se pasa con el dedo, pero es
   un gesto de umbral (48 px horizontales entre bajar y levantar), no un
   arrastre: la foto no sigue al dedo ni rebota. La única física del sitio
   sigue siendo el boleto.

   Se carga aparte (React.lazy en Subida.jsx): no hace falta al abrir.
   ========================================================================= */
const CON_FOTO = HISTORIA.map((m, i) => (hayFoto(m.imagen) ? i : -1)).filter((i) => i >= 0);

export default function Galeria({ indice, alCambiar, alCerrar }) {
  const dialogo = useRef(null);
  const gesto = useRef(null); // { x, enFondo } del último pointerdown
  const m = HISTORIA[indice];
  const pos = CON_FOTO.indexOf(indice);
  const varias = CON_FOTO.length > 1;

  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
  }, []);

  const mover = (paso) => {
    if (!varias) return;
    alCambiar(CON_FOTO[(pos + paso + CON_FOTO.length) % CON_FOTO.length]);
  };

  return (
    <dialog
      ref={dialogo}
      className="galeria"
      aria-label={m.titulo}
      onClose={alCerrar}
      /* Se cierra con un toque en el fondo, no al terminar un arrastre que
         empezó en la foto (el click cae en el <dialog> por ser el ancestro
         común). */
      onClick={(e) => e.target === e.currentTarget && gesto.current?.enFondo && dialogo.current.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") mover(1);
        if (e.key === "ArrowLeft") mover(-1);
      }}
      onPointerDown={(e) => (gesto.current = { x: e.clientX, enFondo: e.target === e.currentTarget })}
      onPointerUp={(e) => {
        const dx = gesto.current ? e.clientX - gesto.current.x : 0;
        if (Math.abs(dx) > 48) {
          gesto.current = null; // fue un deslizar: el click que sigue no cierra
          mover(dx < 0 ? 1 : -1);
        }
      }}
    >
      <figure className="galeria__hoja">
        <img src={m.imagen} alt={m.titulo} />
        <figcaption>
          <span className="galeria__fecha">{m.fecha}</span>
          <span className="display galeria__titulo">{m.titulo}</span>
        </figcaption>
      </figure>
      <button type="button" className="galeria__cerrar" aria-label="Cerrar" onClick={() => dialogo.current.close()}>
        <Icono nombre="cerrar" />
      </button>
      {varias && (
        <>
          <button type="button" className="galeria__paso galeria__paso--antes" aria-label="Foto anterior" onClick={() => mover(-1)}>
            <Icono nombre="prev" />
          </button>
          <button type="button" className="galeria__paso galeria__paso--despues" aria-label="Foto siguiente" onClick={() => mover(1)}>
            <Icono nombre="next" />
          </button>
        </>
      )}
    </dialog>
  );
}
