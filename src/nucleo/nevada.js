import { quieto } from "./efectos.js";

/* =========================================================================
   nevada.js — la nieve que cae en las escenas de afuera
   -------------------------------------------------------------------------
   Viene del proyecto base (Particulas.jsx), adaptada: un lienzo POR ESCENA
   (el umbral y la travesía), no uno fijo sobre toda la página, porque
   adentro no nieva y los copos tienen que ir delante del suelo, no detrás.

   · Solo corre mientras su escena está en pantalla (IntersectionObserver):
     fuera de ella no cuesta nada.
   · Se mueve por tiempo, no por cuadro: igual a 60 que a 120 Hz.
   · El viento. Nieve que cae recta es nieve de bola de cristal; la de
     verdad va en rachas. Dos senos de periodo largo y distinto (uno en el
     tiempo y otro en la altura) empujan por zonas y nunca se repiten a ojo.
     Los copos chicos están "más lejos" y el viento los mueve menos: eso da
     las capas de profundidad.
   · Con menos movimiento se pinta UNA vez, quieta: sigue nevando, pero
     nada se mueve solo.
   · El lienzo va en píxeles de dispositivo (hasta ×2: a ×3 son 4 veces los
     píxeles para copos de dos puntos, y no se nota).
   ========================================================================= */
const DENSIDAD = 9000; // un copo por cada tantos px² de escena
const viento = (t, y) => Math.sin(t * 0.00023) * 1.15 + Math.sin(t * 0.00071 + y * 0.004) * 0.55;

export function nevar(lienzo) {
  const ctx = lienzo.getContext("2d");
  if (!ctx) return () => {};
  const color = getComputedStyle(document.documentElement).getPropertyValue("--color-papel").trim() || "#F5EFE7";
  let ancho = 0;
  let alto = 0;
  let copos = [];
  let marco = 0;
  let antes = 0;

  const copo = (y) => ({
    x: Math.random() * ancho,
    y: y ?? Math.random() * alto,
    r: 0.7 + Math.random() * 1.8,
    vy: 0.012 + Math.random() * 0.03, // px por ms
    vx: (Math.random() - 0.5) * 0.015,
    alfa: 0.35 + Math.random() * 0.45,
  });

  function medir() {
    const w = lienzo.clientWidth;
    const h = lienzo.clientHeight;
    if (!w || !h || (w === ancho && h === alto)) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    lienzo.width = Math.round(w * dpr);
    lienzo.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = color;
    /* Al cambiar de tamaño los copos se reparten, no se vuelven a sembrar:
       sembrar de nuevo haría saltar la nevada entera. */
    for (const c of copos) {
      c.x *= w / (ancho || w);
      c.y *= h / (alto || h);
    }
    ancho = w;
    alto = h;
    const cuantos = Math.max(24, Math.min(70, Math.round((w * h) / DENSIDAD)));
    while (copos.length < cuantos) copos.push(copo());
    copos.length = cuantos;
  }

  function pintar() {
    ctx.clearRect(0, 0, ancho, alto);
    for (const c of copos) {
      ctx.globalAlpha = c.alfa;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function paso(t) {
    const dt = Math.min(50, t - (antes || t));
    antes = t;
    for (const c of copos) {
      c.y += c.vy * dt * (0.6 + c.r * 0.3);
      c.x += (c.vx + (viento(t, c.y) * c.r * 0.5 + Math.sin(c.y / 60) * 0.18) * 0.06) * dt;
      if (c.y > alto + 8) Object.assign(c, copo(-8));
      if (c.x < -12) c.x = ancho + 12;
      else if (c.x > ancho + 12) c.x = -12;
    }
    pintar();
    marco = requestAnimationFrame(paso);
  }

  const parar = () => {
    cancelAnimationFrame(marco);
    marco = 0;
    antes = 0;
  };

  medir();
  if (quieto()) {
    pintar();
    const tam = new ResizeObserver(() => (medir(), pintar()));
    tam.observe(lienzo);
    return () => tam.disconnect();
  }

  const tam = new ResizeObserver(medir);
  tam.observe(lienzo);
  const vista = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !marco) marco = requestAnimationFrame(paso);
    else if (!e.isIntersecting) parar();
  });
  vista.observe(lienzo);
  return () => {
    parar();
    tam.disconnect();
    vista.disconnect();
  };
}
