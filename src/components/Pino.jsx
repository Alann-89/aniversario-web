/* =========================================================================
   Pino — un abeto, no un triángulo
   -------------------------------------------------------------------------
   Seis triángulos isósceles idénticos son la firma del clipart. Un abeto es
   una pila de faldones que se estrechan hacia arriba, ninguno igual a su
   vecino: esto se dibuja a partir de alto/ancho/inclinación, así que
   variarlos cuesta un número y no un `path` nuevo. El color lo pone el
   grupo que lo contiene.

   Origen en el pie del tronco: se coloca con un solo translate/scale.
   ========================================================================= */
export function Pino({ alto = 100, ancho = 50, inclina = 0 }) {
  const faldon = (cima, suelo, w) => `M${inclina} ${cima} L${w / 2} ${suelo} L${-w / 2} ${suelo}Z`;
  return (
    <path
      d={
        faldon(-alto, -alto * 0.6, ancho * 0.46) +
        faldon(-alto * 0.74, -alto * 0.28, ancho * 0.74) +
        faldon(-alto * 0.46, 0, ancho)
      }
    />
  );
}

/** Una fila de pinos a partir de [x, y, alto], alternando la inclinación. */
export function Hilera({ pinos, inclina }) {
  return pinos.map(([x, y, alto], i) => (
    <g key={i} transform={`translate(${x} ${y})`}>
      <Pino alto={alto} ancho={alto * 0.5} inclina={i % 2 ? inclina : -inclina} />
    </g>
  ));
}
