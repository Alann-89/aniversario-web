/* =========================================================================
   Cabana — la casa, dibujada UNA sola vez
   -------------------------------------------------------------------------
   La usan el umbral (a lo lejos, la cámara se acerca) y la travesía (se
   aleja). Si el dibujo fuera otro en cada sitio, el final no cerraría
   el círculo.

   Plana: chimenea detrás del tejado, alero que vuela, carga de nieve,
   muro, puerta y dos ventanas. El origen es el pie de la puerta (x 0 en su
   centro, y 0 en el suelo), así se coloca con un solo translate/scale.

   SIEMPRE ENCENDIDA (decisión de Alan, 24 sep 2026; antes se encendía al
   ganar la trivia): las ventanas y la rendija de la puerta en ámbar son lo
   único ámbar que se ve desde fuera, y con ellas:
   · las ventanas laten como late un fuego (dos periodos distintos);
   · la luz cae sobre la nieve delante del muro: un charco y un cono por
     ventana, en `screen`, que ACLARA la nieve hacia el ámbar. (Con mezcla
     normal, ámbar sobre gris azulado da café: así se leía en prueba.)
   · sale humo de la chimenea: hay alguien.

   `sufijo` separa los `id` de los degradados, porque hay dos cabañas en la
   página y `url(#…)` tomaría siempre la primera.
   ========================================================================= */
export function Cabana({ sufijo }) {
  const id = (base) => `${base}-${sufijo}`;
  return (
    <g className="cabana">
      {/* El color de los degradados lo pone el CSS (.luz stop): un atributo
          no entiende var(). */}
      <defs className="luz">
        <radialGradient id={id("charco")}>
          <stop offset="0" stopOpacity="0.5" />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("cono")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopOpacity="0.32" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Cada bocanada con el borde difuso: con canto, el humo era una
          columna de cuentas. */}
      <defs className="humo">
        <radialGradient id={id("humo")}>
          <stop offset="0.3" stopOpacity="1" />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect className="cabana__oscuro" x="26" y="-112" width="16" height="44" />
      <path className="cabana__techo" d="M-78 -60 L0 -118 L78 -60Z" />
      <path className="cabana__nieve" d="M-80 -59 L0 -121 L80 -59 L72 -59 L0 -111 L-72 -59Z" />
      <rect className="cabana__muro" x="-54" y="-62" width="108" height="62" />
      <path className="cabana__oscuro" d="M-54 -62h108v6h-108Z" opacity=".5" />
      <rect className="cabana__oscuro" x="-12" y="-32" width="24" height="32" />
      <rect className="cabana__ventana" x="-42" y="-48" width="22" height="18" />
      <rect className="cabana__ventana" x="20" y="-48" width="22" height="18" />
      <g className="cabana__luz">
        <rect x="-42" y="-48" width="22" height="18" />
        <rect x="20" y="-48" width="22" height="18" />
        <rect x="-12" y="-32" width="3" height="32" />
      </g>
      <path className="cabana__marco" d="M-31 -48v18M-42 -39h22M31 -48v18M20 -39h22" />
      <path className="cabana__nieve" d="M-16 0h32v4h-32Z" opacity=".6" />
      <g className="cabana__derrame">
        <ellipse cx="0" cy="6" rx="112" ry="20" fill={`url(#${id("charco")})`} />
        <path d="M-44 0H-18L-4 26H-66Z" fill={`url(#${id("cono")})`} />
        <path d="M18 0H44L66 26H4Z" fill={`url(#${id("cono")})`} />
      </g>
      <g className="cabana__humo" fill={`url(#${id("humo")})`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx="34" cy="-116" r="8" />
        ))}
      </g>
    </g>
  );
}
