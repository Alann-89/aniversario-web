import { useEffect, useRef, useState } from "react";
import { registrar } from "./escena.js";

/** Escribe `--p` en el elemento según su avance (ver escena.js). */
export function useEscena(opciones = {}) {
  const ref = useRef(null);
  const ultimo = useRef(opciones);
  ultimo.current = opciones;
  useEffect(() => {
    if (!ref.current) return;
    return registrar({
      el: ref.current,
      modo: opciones.modo,
      fin: opciones.fin,
      css: opciones.css,
      alCambiar: (p, e) => ultimo.current.alCambiar?.(p, e),
    });
  }, [opciones.modo, opciones.fin, opciones.css]);
  return ref;
}

/* Revelar al entrar en pantalla. Es ESTADO de React, no una clase puesta a
   mano: en una versión anterior un classList.add y el className de React
   se pisaban y el sobre de la trivia se abría y desaparecía a la vez. Dos
   dueños del mismo atributo es un error; aquí el dueño es React. */
export function useRevelar(margen = "0px 0px -10% 0px") {
  const ref = useRef(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visto) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisto(true);
          io.disconnect();
        }
      },
      { rootMargin: margen }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visto, margen]);
  return [ref, visto];
}

/* prefers-reduced-motion, en vivo. En el build vale false (no hay media
   queries) y así también en el primer render del navegador: si no, el
   HTML hidratado diría algo distinto del prerenderizado y React lo
   descartaría entero (error #418, visto en la versión anterior). La
   preferencia se aplica justo después de montar. */
export function useMenosMovimiento() {
  const [menos, setMenos] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setMenos(mq.matches);
    const f = (e) => setMenos(e.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return menos;
}
