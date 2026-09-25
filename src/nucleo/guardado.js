/* =========================================================================
   guardado.js — localStorage y sessionStorage, siempre dentro de try/catch
   -------------------------------------------------------------------------
   Modo privado, almacenamiento lleno o bloqueado (hay navegadores que
   lanzan con solo NOMBRAR localStorage) no son motivo para que el regalo
   deje de funcionar: se juega igual, sin recuerdo. Cualquier acceso pasa
   por aquí, y aquí se traga el error.

   Se llama siempre DESPUÉS de hidratar (en un efecto): en el build no hay
   almacenamiento, y leerlo en el primer render haría que el navegador
   pintara algo distinto del HTML servido.
   ========================================================================= */
const almacen = (tipo) => (tipo === "sesion" ? sessionStorage : localStorage);

/** Lee y parsea JSON; si no hay, no se puede o está dañado, `porDefecto`. */
export function leer(tipo, llave, porDefecto = null) {
  try {
    const v = almacen(tipo).getItem(llave);
    return v === null ? porDefecto : JSON.parse(v);
  } catch {
    return porDefecto;
  }
}

export function escribir(tipo, llave, valor) {
  try {
    almacen(tipo).setItem(llave, JSON.stringify(valor));
  } catch {
    /* sin recuerdo, nada más */
  }
}

export function borrar(tipo, llave) {
  try {
    almacen(tipo).removeItem(llave);
  } catch {
    /* igual que arriba */
  }
}
