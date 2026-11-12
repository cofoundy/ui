/**
 * `ds-bundle/_vendor/react.js`: React 19 ya no publica builds UMD, así que el ds-bundle trae
 * el suyo. Asigna `window.React` y `window.ReactJSXRuntime` (este último lo usa
 * `_ds_bundle.js` para el JSX compilado). Una sola copia de React para todo.
 */
import React from "react";
import * as ReactJSXRuntime from "react/jsx-runtime";

const w = window as unknown as Record<string, unknown>;
w.React = React;
w.ReactJSXRuntime = ReactJSXRuntime;
