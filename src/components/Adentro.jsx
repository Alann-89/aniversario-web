import { useCallback, useEffect, useRef, useState } from "react";
import { CUPONES } from "../data/cupones.js";
import { useCupones, fechaLegible } from "../logica/cupones.js";
import { useRevelar } from "../nucleo/hooks.js";
import { fibras, vibrar, azar } from "../nucleo/efectos.js";
import { leer, escribir } from "../nucleo/guardado.js";
import { Icono } from "./Icono.jsx";

/* El canto roto de las dos mitades, complementario: lo que se lleva una es
   lo que le falta a la otra. Dientes de 0–6 px cada 5 % del alto. */
const DIENTES = Array.from({ length: 21 }, (_, i) => (azar(i * 7.05 + 0.24) * 6).toFixed(1));
const CANTO_CUERPO = `polygon(0 0, ${DIENTES.map((a, i) => `calc(100% - ${a}px) ${i * 5}%`).join(", ")}, 0 100%)`;
const CANTO_MUNON = `polygon(${DIENTES.map((a, i) => `${6 - a}px ${i * 5}%`).join(", ")}, 100% 100%, 100% 0)`;

const AMAGO = "nh_amago_v1";

/* =========================================================================
   Boleto — el cartón que se rasga
   -------------------------------------------------------------------------
   Un cupón que se canjea con un botón es una casilla de formulario; uno que
   hay que arrancar cuesta algo —poquito— y eso es lo que hace sentir que
   valía algo. El tirón vive en src/logica/arrastre.js (se carga aparte);
   aquí solo se pinta y se reacciona a lo que avisa.

   EL CARTÓN SE PARTE EN DOS: cada mitad lleva su propio cartón, con su
   canto roto, y la perforación desaparece al romperse. Si solo se moviera
   el texto, el cartón seguiría entero debajo y no se leería como roto.

   La primera vez (si nunca ha rasgado ninguno), el primer boleto hace un
   amago hacia abajo al entrar en pantalla: el gesto es lo que no se
   adivina. Con movimiento reducido no se mueve; la lengüeta ya dice
   hacia dónde.
   ========================================================================= */
function Boleto({ c, i, fecha, alRasgar, ensenar, motor, cargarMotor, avisar }) {
  const [ref, visto] = useRevelar("0px 0px -20% 0px");
  const lengueta = useRef(null);
  const cuerpo = useRef(null);
  const troquel = useRef(null);
  const control = useRef(null);
  const [porRasgar, setPorRasgar] = useState(false);
  const [recien, setRecien] = useState(false);
  const canjeado = Boolean(fecha);

  /* Pegado otra vez: vuelve a ser un boleto entero, y el próximo rasgado
     vuelve a tener su tirón y su sello. */
  useEffect(() => {
    if (!canjeado) {
      setRecien(false);
      setPorRasgar(false);
    }
  }, [canjeado]);

  const alRomper = useCallback(() => {
    setRecien(true);
    /* Un golpe corto y doble en la mano, como algo que se raja, donde el
       aparato lo tenga. Es movimiento: con menos movimiento, no. */
    vibrar([9, 26, 16]);
    const r = troquel.current?.getBoundingClientRect();
    if (r) fibras(troquel.current, r.left);
    alRasgar(c.id);
    avisar(`“${c.titulo}” rasgado. Ahora tengo que cumplirlo.`);
  }, [alRasgar, avisar, c.id, c.titulo]);

  useEffect(() => {
    if (!motor || canjeado || !lengueta.current) return;
    control.current = motor.enganchar(lengueta.current, cuerpo.current, {
      alCruzar: setPorRasgar,
      alRasgar: alRomper,
      alTocar: () => avisar("Tira hacia abajo sin soltar."),
    });
    return () => control.current?.soltar();
  }, [motor, canjeado, alRomper, avisar]);

  useEffect(() => {
    if (!ensenar || !visto || !motor || canjeado || leer("sesion", AMAGO)) return;
    const t = setTimeout(() => {
      escribir("sesion", AMAGO, true);
      control.current?.amago(22);
    }, 900);
    return () => clearTimeout(t);
  }, [ensenar, visto, motor, canjeado]);

  return (
    <li
      ref={ref}
      className={`cupon revelar${visto ? " visto" : ""}`}
      data-id={c.id}
      data-captura={i === 0 ? "0" : undefined}
      id={`cupon-${c.id}`}
    >
      <article
        className={`boleto${canjeado ? " boleto--canjeado" : ""}${porRasgar ? " boleto--por-rasgar" : ""}${recien ? " boleto--recien" : ""}`}
        style={{ "--canto-cuerpo": CANTO_CUERPO, "--canto-munon": CANTO_MUNON }}
      >
        <div className="boleto__cuerpo" ref={cuerpo}>
          <h3 className="display boleto__titulo">{c.titulo}</h3>
          <p className="boleto__texto">{c.descripcion}</p>
          <p className="boleto__chica">{c.letraChica}</p>
          {canjeado ? <p className="boleto__fecha">Rasgado el {fechaLegible(fecha)}</p> : null}
          {!canjeado ? (
            <button
              ref={lengueta}
              type="button"
              className="boleto__lengueta"
              aria-label={`Rasgar ${c.titulo} para canjearlo`}
              onPointerDown={motor ? undefined : cargarMotor}
              onClick={
                motor
                  ? undefined
                  : (e) => {
                      /* Sin el motor aún (red lenta): con teclado se rasga
                         igual, sin animación. */
                      if (!e.detail) alRomper();
                    }
              }
            >
              <Icono nombre="flechaAbajo" />
              <span>tira hacia abajo</span>
            </button>
          ) : null}
          <span className="boleto__sello" aria-hidden="true">RASGADO</span>
        </div>
        <div className="boleto__munon" ref={troquel} aria-hidden="true">
          <Icono nombre={c.icono} />
          <span className="boleto__folio">N° {String(i + 1).padStart(3, "0")}</span>
        </div>
      </article>
    </li>
  );
}

/* =========================================================================
   Adentro — la habitación
   -------------------------------------------------------------------------
   El único cambio de mundo de la página: afuera azul y frío, adentro ámbar.
   Colores planos, sin madera en imagen. La primera pantalla es el cuarto
   que se ve por la puerta del umbral (la ventana con la luna, la lámpara)
   y enseguida la primera repisa: al aterrizar nunca hay color liso.
   Sin rótulo de sección (decisión de Alan).
   ========================================================================= */
export function Adentro() {
  const { canjeados, rasgar, reiniciar } = useCupones();
  const [motor, setMotor] = useState(null);
  const [aviso, setAviso] = useState("");
  const reloj = useRef(null);

  const cargarMotor = useCallback(() => {
    import("../logica/arrastre.js").then(setMotor, () => {});
  }, []);

  /* El motor del tirón se pide cuando la habitación está a una pantalla. */
  const [seccion, cerca] = useRevelar("100% 0px");
  useEffect(() => {
    if (cerca) cargarMotor();
  }, [cerca, cargarMotor]);

  const avisar = useCallback((texto) => {
    setAviso(texto);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setAviso(""), 3200);
  }, []);
  useEffect(() => () => clearTimeout(reloj.current), []);

  const ninguno = Object.keys(canjeados).length === 0;

  return (
    <section id="adentro" ref={seccion} className="adentro" aria-labelledby="adentro-titulo">
      {/* El fuego late en la pared mientras ella baja por todo el cuarto. */}
      <div className="adentro__fuego" aria-hidden="true">
        <div className="fuego" />
      </div>
      <h2 id="adentro-titulo" className="solo-lectores">Los cupones</h2>
      <div className="adentro__cuarto" aria-hidden="true">
        <span className="adentro__ventana">
          <span className="adentro__nieve" />
        </span>
        <span className="adentro__lampara">
          <span className="halo" />
        </span>
      </div>
      <ol className="columna cupones">
        {CUPONES.map((c, i) => (
          <Boleto
            key={c.id}
            c={c}
            i={i}
            fecha={canjeados[c.id]}
            alRasgar={rasgar}
            ensenar={ninguno && i === 0}
            motor={motor}
            cargarMotor={cargarMotor}
            avisar={avisar}
          />
        ))}
      </ol>
      {!ninguno ? (
        <p className="columna adentro__pegar">
          <button type="button" className="tinta" onClick={() => (reiniciar(), avisar("Boletos pegados otra vez. Como nuevos."))}>
            <Icono nombre="repetir" />
            <span>pegar los boletos otra vez</span>
          </button>
        </p>
      ) : null}
      <p className="aviso" role="status">{aviso}</p>
    </section>
  );
}
