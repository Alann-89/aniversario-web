import { useEffect, useRef } from "react";
import { nevar } from "../nucleo/nevada.js";

/* La nieve de una escena de afuera (src/nucleo/nevada.js). Va dentro del escenario,
   encima del dibujo: los copos caen delante del suelo y de la cabaña. */
export function Nevada({ className = "" }) {
  const ref = useRef(null);
  useEffect(() => nevar(ref.current), []);
  return <canvas ref={ref} className={`nevada ${className}`} aria-hidden="true" />;
}
