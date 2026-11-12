/**
 * Entrada del ds-bundle: @cofoundy/ui para el navegador, sin npm.
 *
 * Expone TODOS los exports de `src/index.ts` en `window.CofoundyUI`, usando el React global
 * (`window.React` / `window.ReactDOM`, que cargan `_vendor/react.js` y `_vendor/react-dom.js`).
 * Lo consumen páginas HTML sueltas (p. ej. abiertas por file://) desde
 * https://ui.cofoundy.dev/ds-bundle/. Build: `npm run build:ds` (vite.config.ds.ts).
 */
import "./ds-bundle.css";

export * from "../index";
