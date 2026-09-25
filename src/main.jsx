import { StrictMode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";

/* Señal para la red de seguridad de index.html: el bundle llegó. Y si
   llegó TARDE (después de los 8 s, con la red muy mala) la red de seguridad
   ya quitó .con-js: se devuelve, porque todo lo que sigue da por hecho que
   la página está viva (el sobre cerrado que se abre, las escenas, los
   solapes). Sin esto el sobre no se podía abrir nunca. */
window.__vivo = true;
document.documentElement.classList.add("con-js");

/* El HTML llega pintado desde el build (tools/prerender.js): aquí se
   hidrata. createRoot solo corre en `npm run dev`, donde no hay prerender. */
const raiz = document.getElementById("root");
const arbol = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (raiz.hasChildNodes()) hydrateRoot(raiz, arbol);
else createRoot(raiz).render(arbol);
