/* =========================================================================
   Cielo — la capa fija de detrás: cielo, sol, luna, estrellas y la ladera
   -------------------------------------------------------------------------
   No lleva contenido, es aria-hidden y no recibe punteros. Por eso puede
   moverse con libertad sin competir con nada. Todo sale de las variables
   que escribe src/nucleo/cielo.js en este elemento (--cielo, --sol, --luna,
   --estrellas, --subir, --bajar); son menos de diez nodos, así que mover
   a los hijos con la variable del padre no cuesta nada medible.

   La ladera son tres crestas y una fila de pinos en colores planos que se
   derivan del propio cielo: anochecen solas, sin rampa aparte. Con
   `xMidYMax slice` un teléfono vertical solo enseña el centro del lienzo,
   y ahí están los picos.
   ========================================================================= */

/* Estrellas en posiciones fijas (generador con semilla: el HTML del build
   y el del navegador tienen que ser idénticos para hidratar). */
function estrellas(n, semilla = 7) {
  let s = semilla;
  const azar = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: n }, () => ({
    x: +(azar() * 100).toFixed(2),
    y: +(azar() * 100).toFixed(2),
    r: +(0.5 + azar() * 0.8).toFixed(2),
  }));
}
const ESTRELLAS = estrellas(52);

export function Cielo({ ref }) {
  return (
    <div className="cielo" ref={ref} aria-hidden="true">
      <svg className="cielo__estrellas">
        {ESTRELLAS.map((e, i) => (
          <circle key={i} cx={`${e.x}%`} cy={`${e.y}%`} r={e.r} opacity={0.45 + (i % 3) * 0.2} />
        ))}
      </svg>
      <div className="cielo__luna" />
      <div className="cielo__sol" />

      <div className="ladera">
        <svg className="ladera__capa ladera__capa--lejos" viewBox="0 0 1440 460" preserveAspectRatio="xMidYMax slice">
          <path d="M0 460V262l168-108 132 86 146-130 182 146 156-102 194 144 166-116 146 102 150-78v256Z" />
        </svg>
        <svg className="ladera__capa ladera__capa--medio" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
          <path d="M0 400V248l204-118 190 136 168-102 216 156 204-132 178 124 190-94 90 52v178Z" />
        </svg>
        <svg className="ladera__capa ladera__capa--cerca" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
          <path d="M0 320V214l178-96 196 130 164-76 226 138 194-106 184 100 216-78 82 40v54Z" />
        </svg>
        <svg className="ladera__capa ladera__capa--pinos" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice">
          <path d="M52 200 96 56l44 144Zm96 0 38-112 38 112Zm308 0 48-150 48 150Zm128 0 32-104 32 104Zm436 0 44-138 44 138Zm128 0 34-108 34 108Zm250 0 50-152 50 152Z" />
          <path opacity=".7" d="M0 200 36 92l36 108Zm256 0 30-96 30 96Zm440 0 28-92 28 92Zm248 0 36-112 36 112Zm308 0 32-102 32 102Z" />
          <rect y="186" width="1440" height="14" />
        </svg>
      </div>
    </div>
  );
}
