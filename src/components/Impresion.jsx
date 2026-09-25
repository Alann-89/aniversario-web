import fotos from "virtual:fotos";
import { Icono } from "./Icono.jsx";

/* =========================================================================
   Impresion — la foto impresa, con su margen de papel
   -------------------------------------------------------------------------
   Plana: papel, margen desigual y la fecha estampada abajo a la derecha,
   como el reloj de las cámaras de rollo. Sin grano ni satinado.

   Si la foto NO está en public/assets/fotos cuando se construye el sitio
   (lo sabe `virtual:fotos`), no se pide: se pinta el papel en espera. Así
   no hay imágenes rotas ni errores 404 en la consola del teléfono de ella.
   Cuando Alan suba la foto, el siguiente build la recoge sola.
   ========================================================================= */
export const hayFoto = (src) => Boolean(src) && fotos.has(src);

export function Impresion({ imagen, alt = "", fecha, prioritaria = false }) {
  const conFoto = hayFoto(imagen);
  return (
    <span className={`impresion${conFoto ? "" : " impresion--vacia"}`}>
      <span className="impresion__marco">
        {conFoto ? (
          <img
            className="impresion__foto"
            src={imagen}
            alt={alt}
            width="800"
            height="1000"
            loading={prioritaria ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <span className="impresion__espera">
            <Icono nombre="camara" />
            <span>aquí va una foto</span>
          </span>
        )}
      </span>
      {fecha ? (
        <span className="impresion__fecha" aria-hidden="true">
          {fecha}
        </span>
      ) : null}
    </span>
  );
}
