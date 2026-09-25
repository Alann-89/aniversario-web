import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG } from "../data/config.js";

/* =========================================================================
   La canción, sin dibujo
   -------------------------------------------------------------------------
   El navegador no deja sonar nada con el scroll, solo con un toque, un clic
   o una tecla. Así que:
     1. Al bajar por primera vez se INTENTA. Casi siempre lo bloquea.
     2. Si lo bloquea, se espera al primer toque o tecla, donde sea.
     3. Si ella pausa, se acabó: nada vuelve a arrancarla salvo el casete.
   El mp3 va con preload="none": no se baja ni un byte hasta el intento.
   ========================================================================= */
export function useMusica(zonaPropia) {
  const audio = useRef(null);
  const pausadaPorElla = useRef(false);
  const [sonando, setSonando] = useState(false);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    a.volume = CONFIG.volumenInicial ?? 0.55;
    const eventos = ["pointerup", "touchend", "keydown"];
    let esperando = false;

    const dejarDeEsperar = () => {
      eventos.forEach((t) => removeEventListener(t, alToque, true));
      esperando = false;
    };
    const intentar = () => {
      if (pausadaPorElla.current || !a.paused) return;
      a.play().then(dejarDeEsperar, () => {
        if (esperando) return;
        esperando = true;
        eventos.forEach((t) => addEventListener(t, alToque, true));
      });
    };
    /* El casete hace lo suyo: un toque en él no cuenta como "primer toque". */
    function alToque(e) {
      if (zonaPropia.current?.contains(e.target)) return;
      intentar();
    }
    const alBajar = () => {
      if (scrollY < 80) return;
      removeEventListener("scroll", alBajar);
      intentar();
    };
    addEventListener("scroll", alBajar, { passive: true });

    const alSonar = () => setSonando(true);
    const alPausar = () => setSonando(false);
    a.addEventListener("play", alSonar);
    a.addEventListener("pause", alPausar);
    return () => {
      removeEventListener("scroll", alBajar);
      dejarDeEsperar();
      a.removeEventListener("play", alSonar);
      a.removeEventListener("pause", alPausar);
    };
  }, [zonaPropia]);

  const alternar = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) {
      pausadaPorElla.current = false;
      a.play().catch(() => {});
    } else {
      pausadaPorElla.current = true;
      a.pause();
    }
  }, []);

  return { audio, sonando, alternar };
}

/* =========================================================================
   El casete se aparta
   -------------------------------------------------------------------------
   Un objeto fijo sobre el contenido siempre tapa algo. En vez de buscarle
   hueco, se guarda: en cuanto ella baja se DUERME y queda solo su cinta en
   la esquina, entera (ver casete.css). Entero solo al abrir el regalo y
   cuando ella lo toca, y en los dos casos se vuelve a dormir con el scroll
   o a los seis segundos.

   Cuando la canción arranca NO se despierta: casi siempre arranca con el
   primer toque, que suele ser el principio de un scroll, y el casete se
   abría justo mientras ella bajaba y el scroll no podía guardarlo (lo vio
   Alan). Las rayitas de la cinta, que empiezan a bailar, ya dicen de dónde
   sale la música.

   El estado solo se escribe cuando CAMBIA (se lleva en un ref): nada de
   setState en cada evento de scroll.
   ========================================================================= */
export function useApartado() {
  const [dormido, setDormido] = useState(false);
  const actual = useRef({ dormido: false });
  const relojSiesta = useRef(0);

  const dormir = useCallback((si) => {
    if (si !== actual.current.dormido) setDormido((actual.current.dormido = si));
  }, []);

  const dormirEn = useCallback(
    (ms) => {
      clearTimeout(relojSiesta.current);
      relojSiesta.current = setTimeout(() => dormir(true), ms);
    },
    [dormir]
  );

  const despertar = useCallback(() => {
    dormir(false);
    dormirEn(6000);
  }, [dormir, dormirEn]);

  useEffect(() => {
    const alScroll = () => {
      clearTimeout(relojSiesta.current);
      dormir(true);
    };
    addEventListener("scroll", alScroll, { passive: true });
    dormirEn(6000);
    return () => {
      removeEventListener("scroll", alScroll);
      clearTimeout(relojSiesta.current);
    };
  }, [dormir, dormirEn]);

  return { dormido, despertar };
}
