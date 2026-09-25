import { lazy, Suspense, useEffect, useState } from "react";
import { CONFIG } from "../data/config.js";
import { HISTORIA } from "../data/historia.js";
import { useEscena, useMenosMovimiento, useRevelar } from "../nucleo/hooks.js";
import { azar, tween } from "../nucleo/efectos.js";
import { Impresion, hayFoto } from "./Impresion.jsx";
import { Icono } from "./Icono.jsx";

/* La galería no hace falta al abrir: se descarga la primera vez que ella
   toca una foto. Si la descarga falla (datos agotados), no pasa nada: un
   error de un componente perezoso sin atrapar desmontaría el regalo entero.
   Se cierra sola y la foto se puede volver a tocar. */
function SinGaleria({ alCerrar }) {
  useEffect(() => alCerrar(), [alCerrar]);
  return null;
}
const Galeria = lazy(() => import("./Galeria.jsx").catch(() => ({ default: SinGaleria })));

export const urlMapa = (consulta) =>
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consulta);

/* El canto rasgado de la nota, como polígono de recorte (antes era una
   máscara PNG). Dientes de 2–9 px cada ~3 % del ancho. */
function rasgado(semilla) {
  const puntos = ["0 0", "100% 0"];
  for (let i = 40; i >= 0; i--) {
    const alto = 2 + azar(semilla * 7 + i) * 7;
    puntos.push(`${(i * 2.5).toFixed(1)}% calc(100% - ${alto.toFixed(1)}px)`);
  }
  return `polygon(${puntos.join(", ")})`;
}

/* Días completos desde CONFIG.fechaInicio.
   · diasUTC: la cuenta del HTML del build y del PRIMER render del navegador.
     Tiene que dar lo mismo en los dos, y la zona horaria del build no es la
     de ella: con la hora local podían diferir en un día y React descartaba
     la hidratación.
   · diasLocales: la de su calendario; corrige el número tras hidratar. */
const [ANO, MES, DIA] = CONFIG.fechaInicio.split("-").map(Number);
const diasUTC = (ahora) => Math.max(0, Math.floor((ahora - Date.UTC(ANO, MES - 1, DIA)) / 86400000));
function diasLocales() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((hoy - new Date(ANO, MES - 1, DIA)) / 86400000));
}

/* ---------------- Contador "días juntos" ----------------
   El HTML del build trae el número del día del build (se lee sin JS), el
   navegador lo corrige al hidratar, y al entrar en cuadro se CUENTA de 0 al
   número real en 1.2 s: el tiempo acumulándose es literalmente la
   historia. En tabular-nums, para que las cifras no bailen. Al llegar al
   número, el corazoncito de al lado late dos veces: ya están todos. */
function Contador() {
  const [dias, setDias] = useState(() => diasUTC(__HOY__));
  const [mostrado, setMostrado] = useState(null);
  const [listo, setListo] = useState(false);
  const [ref, visto] = useRevelar();
  const menos = useMenosMovimiento();

  useEffect(() => setDias(diasLocales()), []);

  useEffect(() => {
    if (!visto) return;
    if (menos) return setListo(true);
    return tween(0, dias, 1200, (v) => setMostrado(Math.round(v)), () => setListo(true));
  }, [visto, menos, dias]);

  const meses = Math.floor(dias / 30.4375);
  return (
    <p ref={ref} className={`contador revelar${visto ? " visto" : ""}${listo ? " contador--listo" : ""}`}>
      <span className="contador__n display">{(mostrado ?? dias).toLocaleString("es-MX")}</span>{" "}
      <span className="contador__txt">
        <Icono nombre="corazon" />
        días juntos{meses >= 1 ? ` · ${meses} ${meses === 1 ? "mes" : "meses"}` : ""}
      </span>
    </p>
  );
}

/* =========================================================================
   Parada — un momento, en DOS objetos sueltos
   -------------------------------------------------------------------------
   La impresión pegada con cinta y, solapada encima, una tira de papel con
   la fecha y lo que pasó, rasgada por abajo. NO hay caja que los contenga:
   el solape es lo que hace que se lea como un montón sobre una mesa y no
   como una lista. Los lados se alternan con el índice.

   La impresión solo es un botón (abre la galería) si hay foto: un papel en
   espera que se abre en grande no enseña nada.
   ========================================================================= */
function Parada({ m, i, alAbrir }) {
  const [ref, visto] = useRevelar();
  const a = azar(i + 1);
  const b = azar(i + 21);
  const c = azar(i + 41);
  const estilo = {
    "--giro": (a * 4.8 - 2.4).toFixed(2) + "deg",
    "--nota-giro": (b * 3.2 - 1.6).toFixed(2) + "deg",
    "--cinta-x": (10 + a * 30).toFixed(0) + "%",
    "--cinta-giro": (a * 10 - 7).toFixed(1) + "deg",
    "--nota-x": (14 + c * 22).toFixed(0) + "px",
    "--rasgado": rasgado(i + 3),
  };
  const conFoto = hayFoto(m.imagen);
  const impresion = <Impresion imagen={m.imagen} alt={conFoto ? m.titulo : ""} fecha={m.fecha} prioritaria={i === 0} />;

  return (
    <li
      ref={ref}
      id={`momento-${i + 1}`}
      className={`parada revelar${visto ? " visto" : ""}`}
      data-lado={i % 2 ? "der" : "izq"}
      data-captura="0"
      style={estilo}
    >
      <div className="parada__foto">
        <span className="cinta" aria-hidden="true" />
        {conFoto ? (
          <button type="button" className="parada__abrir" onClick={() => alAbrir(i)} aria-label={`Ver en grande: ${m.titulo}`}>
            {impresion}
            <span className="parada__ampliar" aria-hidden="true">
              <Icono nombre="ampliar" />
            </span>
          </button>
        ) : (
          impresion
        )}
      </div>

      <div className="parada__nota papel">
        <p className="parada__fecha">{m.fecha}</p>
        <h3 className="display parada__titulo">{m.titulo}</h3>
        <p className="parada__texto">{m.descripcion}</p>
        {m.mapa ? (
          <>
            <a className="tinta parada__lugar" href={urlMapa(m.mapa)} target="_blank" rel="noopener noreferrer">
              <Icono nombre="pin" />
              <span>ver dónde fue</span>
              <span className="solo-lectores"> (abre Google Maps)</span>
            </a>
            {m.lugar ? <p className="parada__direccion">{m.lugar}</p> : null}
          </>
        ) : null}
      </div>
    </li>
  );
}

/* ---------------- La subida ----------------
   Sin rótulo de sección (decisión de Alan, 23 sep 2026): el nombre queda
   solo para el lector de pantalla. El hilo del camino une las paradas y se
   dibuja conforme ella baja: `--p` de escena.js se escribe en el propio
   hilo (no en el camino, que contiene todas las paradas y las invalidaría
   en cada cuadro) y mueve un transform, nada de máscaras animadas. */
export function Subida() {
  const hilo = useEscena({ modo: "paso" });
  const [abierta, setAbierta] = useState(null);

  return (
    <section id="historia" className="subida" aria-labelledby="historia-titulo" tabIndex={-1}>
      <h2 id="historia-titulo" className="solo-lectores">Nuestra historia</h2>
      <div id="dias" className="columna subida__inicio" data-captura="0">
        <Contador />
      </div>

      <div className="columna subida__camino">
        <span ref={hilo} className="subida__hilo" aria-hidden="true">
          <span />
        </span>
        <ol className="subida__paradas">
          {HISTORIA.map((m, i) => (
            <Parada key={i} m={m} i={i} alAbrir={setAbierta} />
          ))}
        </ol>
      </div>

      {abierta !== null && (
        <Suspense fallback={null}>
          <Galeria indice={abierta} alCambiar={setAbierta} alCerrar={() => setAbierta(null)} />
        </Suspense>
      )}
    </section>
  );
}
