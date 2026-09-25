import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import { CONFIG } from "./data/config.js";

/* El sitio pintado en el build. Si el JavaScript no llega (red mala, datos
   agotados, un bloqueador), ella ve la portada, la historia, el mapa, la
   trivia, los cupones y la carta que la manda al coche; lo que se pierde
   es el movimiento. */
export const render = () => renderToString(<App />);

/* Para que prerender.js anuncie la foto de portada con preload. */
export const portada = CONFIG.portada;
