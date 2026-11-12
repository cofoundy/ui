/**
 * `ds-bundle/_vendor/react-dom.js`: asigna `window.ReactDOM` con `react-dom` + `react-dom/client`
 * (createRoot, hydrateRoot, createPortal, flushSync…). Usa el `window.React` de `react.js`.
 */
import ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

(window as unknown as Record<string, unknown>).ReactDOM = { ...ReactDOM, ...ReactDOMClient };
