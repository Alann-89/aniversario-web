import { useCallback, useEffect, useState } from "react";
import { LLAVE_CUPONES } from "../data/cupones.js";
import { leer as leerGuardado, escribir, borrar } from "../nucleo/guardado.js";

/* =========================================================================
   Los cupones rasgados, en el navegador de ella
   -------------------------------------------------------------------------
   Sin backend: si abre el sitio en otro teléfono, los boletos aparecen sin
   rasgar. Es una consecuencia asumida, no un descuido.

   Formato de siempre, bajo la llave de siempre (LLAVE_CUPONES): un objeto
   { id: fecha ISO en la que se rasgó }. Si cambiara, los boletos que ya
   rasgó volverían a aparecer enteros.

   Se lee DESPUÉS de hidratar: el HTML del build no tiene localStorage y
   siempre trae los boletos enteros; leerlo en el primer render haría que
   el navegador pintara algo distinto y React descartaría la hidratación.
   ========================================================================= */
function leer() {
  const v = leerGuardado("local", LLAVE_CUPONES, {});
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

export const fechaLegible = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
};

export function useCupones() {
  const [canjeados, setCanjeados] = useState({});
  useEffect(() => setCanjeados(leer()), []);

  /* Actualización funcional: dos rasgados seguidos no se pisan. */
  const rasgar = useCallback((id) => {
    setCanjeados((antes) => {
      if (antes[id]) return antes;
      const nuevos = { ...antes, [id]: new Date().toISOString() };
      escribir("local", LLAVE_CUPONES, nuevos);
      return nuevos;
    });
  }, []);

  const reiniciar = useCallback(() => {
    borrar("local", LLAVE_CUPONES);
    setCanjeados({});
  }, []);

  return { canjeados, rasgar, reiniciar };
}
