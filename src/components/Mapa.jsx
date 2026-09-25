import { LUGARES, MAPA_PENDIENTE } from "../data/config.js";
import { useEscena } from "../nucleo/hooks.js";
import { urlMapa } from "./Subida.jsx";
import { Icono } from "./Icono.jsx";

/* =========================================================================
   Mapa — el mapa de papel
   -------------------------------------------------------------------------
   Es un DIBUJO, no una carta geográfica: las x/y de LUGARES son posiciones
   en un lienzo de 520×400 (ver config.js), no coordenadas. Un centro
   histórico no es una cuadrícula perfecta, así que las manzanas van
   desalineadas, hay una plaza, una avenida en diagonal, las vías y el
   arroyo.

   La ruta se dibuja mientras el mapa sube por la pantalla (`--p` de
   escena.js) y cada lugar se enciende cuando la ruta llega a él. La ruta
   no se "traza" animando el guion (eso repinta el trazo en cada cuadro):
   la descubre un recorte que ESCALA desde el primer lugar. Sin JavaScript
   `--p` no existe, vale 1 y todo se ve dibujado.

   Los nombres son HTML sobre el dibujo, no <text> de SVG: así la letra no
   encoge con el dibujo en el teléfono y cada marca recibe el dedo en 44 px.
   Sin rótulo de sección (decisión de Alan): el nombre, solo para lectores.
   ========================================================================= */
const lugares = LUGARES.filter((l) => l && Number.isFinite(l.x) && Number.isFinite(l.y));

/* Una curva suave por los lugares, en su orden (Catmull-Rom → Bézier). Con
   dos lugares, una curva con la panza hacia abajo: una recta entre dos
   puntos de un mapa dibujado a mano se ve trazada con regla. */
function ruta(p) {
  if (p.length < 2) return "";
  if (p.length === 2) {
    const [a, b] = p;
    const k = 0.28;
    return `M${a.x} ${a.y} Q${(a.x + b.x) / 2 - (b.y - a.y) * k} ${(a.y + b.y) / 2 + (b.x - a.x) * k} ${b.x} ${b.y}`;
  }
  let d = `M${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] || p2;
    d += ` C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`;
  }
  return d;
}

/* El recorte avanza de izquierda a derecha o al revés, según hacia dónde
   va la ruta. `--en` de cada lugar es la fracción del barrido en la que la
   ruta llega a él. */
const xs = lugares.map((l) => l.x);
const minX = Math.min(...xs) - 12;
const maxX = Math.max(...xs) + 12;
const haciaIzquierda = lugares.length > 1 && lugares.at(-1).x < lugares[0].x;
const fraccion = (x) => (haciaIzquierda ? (maxX - x) / (maxX - minX) : (x - minX) / (maxX - minX));

export function Mapa() {
  const ref = useEscena({ modo: "entrada", fin: 0.3 });
  if (!lugares.length) return null;

  return (
    <section id="mapa" ref={ref} className="mapa de-noche fondo-noche" aria-labelledby="mapa-titulo">
      <h2 id="mapa-titulo" className="solo-lectores">Nuestros lugares</h2>
      <div className="columna mapa__hoja papel" data-captura="0" id="mapa-hoja">
        <span className="cinta" aria-hidden="true" />
        <div className="mapa__lienzo">
          <svg viewBox="0 0 520 400" aria-hidden="true">
            <defs>
              <clipPath id="mapa-barrido">
                <rect
                  className="mapa__barrido"
                  x={minX}
                  y="0"
                  width={maxX - minX}
                  height="400"
                  style={{ transformOrigin: `${haciaIzquierda ? maxX : minX}px 0` }}
                />
              </clipPath>
            </defs>
            <g className="mapa__manzanas">
              <path d="M24 22h96v72H24Zm110 0h118v66H134Zm128 4h84v68h-84Zm94-4h140v76H356Z" />
              <path d="M24 106h96v96H24Zm338-2h132v92H362Z" />
              <path d="M24 214h90v74H24Zm100 4h112v70H124Zm122-2h94v76h-94Zm104 0h144v72H350Z" />
              <path d="M24 300h86v56H24Zm96 2h120v54H120Zm130 0h96v50h-96Zm106 4h138v46H356Z" />
            </g>
            {/* El jardín y la plaza: las dos manchas que orientan el mapa. */}
            <path className="mapa__verde" d="M134 104h96v98h-96Z" />
            <circle className="mapa__verde" cx="300" cy="196" r="21" />
            <g className="mapa__calles">
              <path strokeWidth="6.5" d="M126 12v380M240 12v380M348 12v380M12 100h496M12 206h496M12 294h496" />
              <path strokeWidth="11" d="M12 153h496" />
              <path strokeWidth="7.5" d="M508 12c-58 42-92 78-132 118-46 46-86 82-150 130-42 32-84 58-214 96" />
              <path strokeWidth="2.2" d="M76 12v380M186 12v380M296 12v380M420 12v380M466 12v380M12 58h496M12 250h496M12 340h496M12 372h496" />
            </g>
            <path className="mapa__vias" d="M12 380c130-22 236-16 360-44 46-10 94-26 136-46" />
            <path className="mapa__agua" d="M0 400v-26c58-6 96 6 154-4 54-10 88-30 148-24 58 6 96 26 146 18 28-4 52-12 72-22v58Z" />
            <path className="mapa__ruta" d={ruta(lugares)} clipPath="url(#mapa-barrido)" />
            {lugares.map((l, i) => (
              <g key={i} className="mapa__marca" style={{ "--en": fraccion(l.x).toFixed(3) }}>
                <circle cx={l.x} cy={l.y} r="13" className="mapa__aro" />
                <circle cx={l.x} cy={l.y} r="6" className="mapa__punto" />
              </g>
            ))}
          </svg>
          <ol className="mapa__lugares">
            {lugares.map((l, i) => {
              const contenido = (
                <>
                  <span className="mapa__nombre display">{l.nombre}</span>
                  {l.detalle ? <span className="mapa__detalle">{l.detalle}</span> : null}
                </>
              );
              return (
                <li
                  key={i}
                  className="mapa__lugar"
                  data-lado={l.x > 300 ? "izq" : "der"}
                  style={{ left: `${(l.x / 520) * 100}%`, top: `${(l.y / 400) * 100}%`, "--en": fraccion(l.x).toFixed(3) }}
                >
                  {l.busqueda ? (
                    <a href={urlMapa(l.busqueda)} target="_blank" rel="noopener noreferrer">
                      {contenido}
                      <span className="solo-lectores"> (abre Google Maps)</span>
                    </a>
                  ) : (
                    <span className="mapa__sin-enlace">{contenido}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      {MAPA_PENDIENTE ? (
        <p className="columna mapa__pendiente">
          <Icono nombre="pin" aria-hidden="true" />
          <span>{MAPA_PENDIENTE}</span>
        </p>
      ) : null}
    </section>
  );
}
