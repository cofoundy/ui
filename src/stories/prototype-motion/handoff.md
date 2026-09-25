# Motion de primitivos (Button · Switch · Tabs · Toast): handoff

**Pedido literal:** "mejoremos sistemáticamente el diseño… motion como caso de prueba" (inspirado en x.com/twoclipping/status/2103273003555402193)  ·  **Tipo:** improve  ·  **Modo:** library
**Decisión:** variante A, "Morfar en sitio". El botón que el operador tocó es el mismo que le responde (Guardando → Guardada / No se guardó · Reintentar). Casi todo el motion es CSS sobre `--cf-spring-*`.
**Para el usuario:** el operador de Fovente guarda con 1 toque y sabe si funcionó sin leer un toast (antes: toast arriba a la derecha, lejos del pulgar, y cada pantalla improvisaba su spinner). Criterio: respuesta en ≤ 1 frame, se asienta en ≤ 400 ms (toast ≤ 600), overshoot ≤ 2 %, reduced-motion = cambio instantáneo sin perder palabras.
**Escalado (no decidido aquí):** nada. La API nueva de Button (`status`) es una decisión técnica y afecta a Fovente, TimelyAI y Landing (ver abajo).

## Qué construir
- **Referencia:** `src/stories/prototype-motion/a/`
  - `components.tsx`: MorphButton, StretchSwitch, TravelTabs, RiseToaster
  - `motion-a.css`: todo el motion
  - `timeline.ts`: agenda con rAF y `performance.now`, más `minLoading`
- **Button** (`src/components/ui/button.tsx`)
  - Props nuevas: `status?: "idle"|"loading"|"success"|"error"` y `statusLabels`.
  - Mientras está en loading, el botón se reduce a un círculo con `clip-path` y el foco lo sigue en su propia capa.
  - En éxito o error vuelve a ensancharse. El éxito queda persistente hasta que el contenido cambie. El error dice "No se guardó · Reintentar" en `--destructive`, el siguiente toque reintenta y el texto del usuario se conserva.
  - Press: `scale(.97)`.
  - Timing del contenido: la etiqueta sale en 80 ms (opacidad y blur de 4 px o menos) y entra 180 ms después.
  - El spinner se muestra al menos 350 ms. `aria-busy` y `role=status` anuncian las mismas palabras en los dos modos de motion.
- **Switch y Tabs** (`switch.tsx`, `tabs.tsx`)
  - Indicador de dos bordes, solo con transform: 3 capas `translateX`.
  - Borde delantero sobre `--cf-spring-edge` (271 ms) y borde trasero sobre `--cf-spring-smooth` comprimido a 400 ms.
  - El switch es optimista: si falla, el knob vuelve con el spring y la línea de estado explica qué pasó.
- **Toast** (`sonner.tsx`)
  - **Regla:** solo aparece en fallos o cuando el resultado vive en otra parte ("Asignada a Lucía" + Deshacer). No aparece al guardar.
  - Posición inferior centrada en móvil, subiendo desde encima del dock.
  - En Fovente cambiar `layout.tsx:93` (`top-right`) y sobrescribir `[data-sonner-toast]`. Esto aún no está probado sobre sonner: el prototipo usa un toaster local.
- **Tokens** (`src/styles/index.css`)
  - Agregar `--cf-spring-edge` y su `-duration`: `springToCSSLinear({duration:.25,bounce:.15})`, overshoot 0.63 %.
  - Convertir en tokens las duraciones sueltas (80, 160, 280 y 400 ms).
  - Deprecar `--cf-ease-emphasis` (y = 1.3, está prohibido en chrome).
  - Los presets snappy, smooth y gentle se quedan como están.
- **Estados diseñados:**
  - default, hover, focus-visible (anillo que sigue la forma), active, disabled, loading, success y error.
  - Tab vacía ("Nada pendiente…"), error de carga ("Volver a cargar") y switch que falla.

## Abierto (crítico fresco r3, tras 2 rondas de refine, el máximo)
1. Si el botón no ocupa todo el ancho, crece al pasar a éxito o error (186 → 259 px). Hay que reservar el ancho del estado más largo.
2. En tema oscuro, el pill de la tab activa tiene contraste 1.16:1 contra el track. Necesita el borde que ya tiene en tema claro.
3. Faltan filmstrips del switch que falla, del foco con teclado y de los estados vacío y error a 375 px.
4. El source anima propiedades fuera del contrato (color, sombra, stroke) y usa duraciones literales. Hay que pasarlas a tokens o a cambios instantáneos.
5. Los hover de Deshacer y Volver a cargar solo cambian el fondo (prohibido). El toast se ve recortado cuando no hay dock.

## Evidencia
- **Prototipo:**
  - Comparador (A ★, B, C; se navega con ← →): http://localhost:6007/?path=/story/prototype-motion-compare--compare
  - Variante A: http://localhost:6007/?path=/story/prototype-motion-a-morfar-en-sitio--operador
- **Antes:** `…/scratchpad/ua-run/before/{switch,tabs,toast,button}.png`
- **Después:** `…/scratchpad/ua-run/refine-r2/final/01…17` (filmstrips y matrices a 375 px en claro y oscuro)
- **Matrix:** `…/scratchpad/ua-run/matrix/matrix.png`
- **Scorecard final (crítico fresco r3):** UX 3.83 · Visual 3.67. Pasa el gate de UX pero no la barra de ship (4.3). El veredicto es refine, no reframe.
- **User-proxy (r1):** 3 de 3 tareas completadas y 3 fricciones, todas cerradas en el refine:
  - el éxito duraba demasiado poco;
  - no quedaba claro que "Modo operador" es global;
  - la fila de conversación no respondía al tocarla.

## Proceso (honesto)
- **Fases corridas:** UX brief → 3 variantes aisladas en paralelo (A CSS morph, B física directa, C causa-efecto) → crítico fresco (gana A) → user-proxy → refine ×2 → crítico fresco ×2 → matrix.
- **Saltadas:** ninguna.
- **Crítico independiente:** sí, en las 3 pasadas.
- **Injertos de las perdedoras:**
  - de C, la regla del toast y la línea de estado del switch;
  - de B, el error dentro del botón, Deshacer y el tiempo mínimo del spinner.

`…` = `/private/tmp/claude-501/-Users-styreep-cofoundy-packages-ui/c88efc1b-e695-4f21-ba5a-fb6e92d6070b`
