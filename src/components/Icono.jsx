/* =========================================================================
   Icono.jsx — los iconos, dibujados a mano y a propósito
   -------------------------------------------------------------------------
   Trazados a mano en vez de venir de una librería, y hay dos que lo
   justifican solas: la palomita y el tache. Una palomita perfectamente
   simétrica se lee como icono de sistema; estas llevan el remate desigual
   que deja una pluma, porque en esta página la marca la puso alguien.

   Solo están los que se usan. Si un cupón pide un nombre que no existe,
   sale el corazón. Una librería traería 300 glifos para usar 16.
   ========================================================================= */

const LINEA = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

/* Los de los cupones (src/data/cupones.js): corazon, regalo, peli, taza,
   estrella. El resto, de la interfaz. */
const TRAZOS = {
  corazon: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  estrella: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9Z" />,
  peli: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v16M17 4v16M3 10h18M3 14h18" />
    </>
  ),
  regalo: (
    <>
      <rect x="3" y="9" width="18" height="12" rx="1.5" />
      <path d="M3 13h18M12 9v12" />
      <path d="M12 9C10 9 7 8.5 7 6.5A2.5 2.5 0 0 1 12 6a2.5 2.5 0 0 1 5 .5C17 8.5 14 9 12 9Z" />
    </>
  ),
  taza: (
    <>
      <path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" />
      <path d="M16 10h2a3 3 0 0 1 0 6h-2" />
      <path d="M7 2v3M11 2v3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  camara: (
    <>
      <path d="M3 8h4l2-3h6l2 3h4v12H3Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  flechaAbajo: <path d="M12 5v14M6 13l6 6 6-6" />,
  repetir: (
    <>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
  candadoAbierto: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 7.9-.9" />
    </>
  ),
  ampliar: <path d="M14.5 4H20v5.5M9.5 20H4v-5.5M20 4l-6.5 6.5M4 20l6.5-6.5" />,
  cerrar: <path d="M6 6 18 18M18 6 6 18" />,
  prev: <path d="M15 5.5 8.5 12 15 18.5" />,
  next: <path d="M9 5.5 15.5 12 9 18.5" />,
  palomita: <path d="M4.5 12.8c2.3 1.1 3.9 2.6 5.2 5 2.1-5.6 5-9.2 9.6-12.1" />,
  tache: <path d="M6.5 6.2c3.9 3.7 7.4 7.6 11 12M17.8 6.4C14 10 10.3 13.7 6.2 17.6" />,
};

export function Icono({ nombre, ...resto }) {
  return (
    <svg {...LINEA} {...resto}>
      {TRAZOS[nombre] || TRAZOS.corazon}
    </svg>
  );
}
