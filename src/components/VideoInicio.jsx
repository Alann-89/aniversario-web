import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { CONFIG } from "../data/config.js";
import { useMenosMovimiento } from "../nucleo/hooks.js";
import { Impresion, hayFoto } from "./Impresion.jsx";
import { Icono } from "./Icono.jsx";

/* =========================================================================
   VideoInicio — la impresión que asoma en la portada, con video
   -------------------------------------------------------------------------
   Una foto impresa que se mueve: el video corre en bucle y en mudo dentro
   del marco de papel (el archivo no trae sonido). Tocarlo lo abre en grande
   (VideoGrande.jsx).

   · Va con preload="none" y el póster (el primer cuadro, en .webp junto al
     video): no baja los 3 MB hasta que arranca, y arranca después de que la
     página cargó del todo. La portada no compite con él por la red.
   · Solo corre mientras se ve, y se detiene mientras está abierto en
     grande: un video que nadie mira gasta batería.
   · Con "reducir movimiento" o con el ahorro de datos encendido no arranca
     solo: se queda en el póster y sigue abriéndose con un toque.
   · Si el teléfono no deja reproducir solo (ahorro de batería de iPhone),
     pasa lo mismo: póster.
   ========================================================================= */
const poster = () => {
  const p = CONFIG.videoInicio.replace(/\.[^.]+$/, ".webp");
  return hayFoto(p) ? p : undefined;
};

/* Si la descarga del diálogo falla (datos agotados), no pasa nada: se cierra
   solo y se puede volver a tocar. Sin esto, un error de un componente
   perezoso sin atrapar desmontaría el regalo entero. */
function SinVideo({ alCerrar }) {
  useEffect(() => alCerrar(), [alCerrar]);
  return null;
}
const VideoGrande = lazy(() => import("./VideoGrande.jsx").catch(() => ({ default: SinVideo })));

export const hayVideoInicio = () => hayFoto(CONFIG.videoInicio);

export function VideoInicio() {
  const video = useRef(null);
  const [grande, setGrande] = useState(false);
  const menos = useMenosMovimiento();

  useEffect(() => {
    const v = video.current;
    if (!v || menos || navigator.connection?.saveData) return;
    let visible = false;
    let cargada = document.readyState === "complete";
    const ajustar = () => {
      if (cargada && visible && !grande) v.play().catch(() => {});
      else v.pause();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        ajustar();
      },
      { threshold: 0.05 }
    );
    io.observe(v);
    const alCargar = () => {
      cargada = true;
      ajustar();
    };
    if (!cargada) addEventListener("load", alCargar, { once: true });
    return () => {
      io.disconnect();
      removeEventListener("load", alCargar);
      v.pause();
    };
  }, [menos, grande]);

  const medio = (
    <video
      ref={video}
      className="impresion__foto"
      src={CONFIG.videoInicio}
      poster={poster()}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
    />
  );

  return (
    <>
      <button
        type="button"
        className="impresion-abrir"
        aria-haspopup="dialog"
        aria-label="Ver el video en grande"
        onClick={() => setGrande(true)}
      >
        <Impresion medio={medio} />
        <span className="impresion-ampliar" aria-hidden="true">
          <Icono nombre="ampliar" />
        </span>
      </button>
      {grande && (
        <Suspense fallback={null}>
          <VideoGrande src={CONFIG.videoInicio} poster={poster()} alCerrar={() => setGrande(false)} />
        </Suspense>
      )}
    </>
  );
}
