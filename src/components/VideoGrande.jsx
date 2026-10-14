import { useEffect, useRef } from "react";
import { Icono } from "./Icono.jsx";

/* =========================================================================
   VideoGrande — el video de la portada, en grande
   -------------------------------------------------------------------------
   Un <dialog> con showModal(), como la galería de fotos: el navegador
   atrapa el foco, vuelve inerte el resto de la página, cierra con Escape y
   devuelve el foco al botón que lo abrió.

   El video no trae sonido, así que la música sigue sonando por debajo. (Se
   probó pausarla mientras estaba abierto, y reanudarla al cerrar; se quitó
   porque no hay nada que escuchar.)

   Se carga aparte (React.lazy en VideoInicio.jsx): no hace falta al abrir.
   ========================================================================= */
export default function VideoGrande({ src, poster, alCerrar }) {
  const dialogo = useRef(null);
  const video = useRef(null);
  const enFondo = useRef(false); // el último pointerdown cayó en el fondo

  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
    video.current?.play().catch(() => {});
    return () => video.current?.pause();
  }, []);

  return (
    <dialog
      ref={dialogo}
      className="galeria"
      aria-label="Video"
      onClose={alCerrar}
      /* Se cierra con un toque en el fondo, no al terminar un arrastre que
         empezó sobre el video (la barra de avance). */
      onPointerDown={(e) => (enFondo.current = e.target === e.currentTarget)}
      onClick={(e) => e.target === e.currentTarget && enFondo.current && dialogo.current.close()}
    >
      <figure className="galeria__hoja">
        <video
          ref={video}
          src={src}
          poster={poster}
          controls
          playsInline
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
        />
      </figure>
      <button type="button" className="galeria__cerrar" aria-label="Cerrar el video" onClick={() => dialogo.current.close()}>
        <Icono nombre="cerrar" />
      </button>
    </dialog>
  );
}
