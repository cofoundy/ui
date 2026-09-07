# Plan de arreglo: fidelidad de Telegram

Origen: el **operador** comparó una captura real de Telegram con la nuestra. Investigación con
fuentes primarias (tdesktop `colors.palette`, `night.tdesktop-theme`, `chat.style`,
`history_view_message.cpp`, assets `history_{sent,received,views}.png`, TL schema, DrKLO
`day.attheme`).

⚠️ **Restricción, igual que con `whatsimule`:** tdesktop es GPL. Se investigó para **describir el
lenguaje visual**; cero copia de código o assets. Los valores de token son hechos observables (como
un hex de marca), no expresión copiada.

## 🔴 F-1 — El modelo de recibos está mal en la FORMA, no solo en el valor

Tenemos `receiptGlyph: 'double-tick' | 'single-tick' | 'trailing-label'`. Asume que el glifo es fijo
por canal y que el estado varía por otra vía. **Falso, y de tres maneras distintas:**

| Canal | Qué varía al pasar a "leído" | Qué rompe |
|---|---|---|
| WhatsApp | **el color** (✓✓ gris → ✓✓ azul) | glifo constante, color variable |
| Telegram 1:1 / grupo | **el glifo** (✓ → ✓✓), color fijo | color constante, glifo variable |
| Telegram **canal** | nada — no hay ticks, hay `👁 N` | el recibo no es un estado, es una **métrica** |
| iMessage | texto ("Entregado" / "Leído 9:41") | va **fuera** de la burbuja y **solo en el último** |

**Forma correcta:**
```
receipt: {
  kind:      'ticks' | 'metric' | 'text' | 'none',
  states:    { estado → { glyph, color } },
  placement: 'in-bubble' | 'below-bubble',
  scope:     'every' | 'last-only'
}
```
Con solo `estado→(glifo,color)` seguís sin poder representar canales de Telegram ni iMessage.

## 🔴 F-2 — Valores incorrectos hoy

| Campo | Ahora | Correcto |
|---|---|---|
| Telegram, estados | 1 tick fijo | **reloj (enviando) · ✓ (enviado) · ✓✓ (leído)** |
| Telegram, contador de vistas | en todo mensaje | **solo canales broadcast**; en 1:1 el slot lo ocupan los ticks |

## 🟡 F-3 — Paleta: real pero menor (corrige una exageración del CTO)

El CTO reportó "Telegram usa la paleta de WhatsApp". **Hecho correcto, conclusión exagerada.**
Copiamos el verde literal de WA (`#D9FDD3`), pero el saliente claro de Telegram es `#effdde` —
también verde menta. **En tema claro las dos marcas convergen**, así que el color casi no distingue.

La divergencia real: (a) el hex exacto y (b) **el tema oscuro, donde no se parecen en nada** —
Telegram `#2b5278` azul vs WA verde oscuro. Y Telegram **no dibuja sombra** en oscuro (alpha 00).

`--channel-telegram` existe hace meses y `styles.css` lo consume **0 veces**.

## Las 3 señales que deciden si una captura se lee como Telegram

1. **Doble tick = leído** (cambia el glifo, no el color), con el reloj como estado previo real.
2. **Colita en la ÚLTIMA de la racha** — esto ya lo tenemos bien — con 16px en esquinas libres y
   **6px en las pegadas**, que no tenemos.
3. **Píldora de servicio translúcida con texto BLANCO** flotando sobre el wallpaper, más **header
   plano sin barra de color**. Hoy nuestra píldora es opaca clara con texto gris: estilo WhatsApp.

## Wallpaper

Telegram: doodle **frío gris-azul**, outline sin relleno, contraste ~2% — casi plano, sobre
`#DEE3E7`. En oscuro es **color sólido `#0E1621`, sin patrón**.
WhatsApp: beige cálido con relleno y contraste visible. Hoy usamos el segundo para los dos.

## Geometría y cromo

| Elemento | Telegram | vs WhatsApp |
|---|---|---|
| Radio | 16px libres / **6px pegadas** | — |
| Ancho máx | 430px | — |
| Gap entre mensajes | 8px · **dentro de racha 2px** | comparable |
| Header | **plano**, = fondo de app | WA usa barra teal/gris |
| Composer | 📎 **izquierda**; 😊 y enviar/🎤 derecha | WA invierte |
| Reply | barra 2px, acento `#37a1de` in / `#5eb854` out, nombre en ese color | WA: barra sobre panel tintado |
| Fecha | píldora translúcida, **texto blanco** | WA: opaca clara, texto gris |
| No leídos | franja full-width 32px, `#fcfbfa`, texto `#538bb4` | WA no tiene equivalente |

Bonus: nombres de grupo en paleta rotativa de 7 (`#c03d33 #4fad2d #d09306 #168acd #8544d6 #cd4073
#2996ad`).

## Lo que el ciclo NO puede seguir haciendo

**Toda la batería de sondas es de consistencia interna.** El fixture de capabilities verifica que el
renderer OBEDEZCA al adapter, no que el adapter tenga RAZÓN. Un valor incorrecto pasa el gemelo
perfectamente porque el DOM cambia igual, sólo que hacia lo equivocado.

⇒ **El arreglo incluye un gemelo NUEVO de clase distinta:** un baseline visual contra una captura
real de referencia, aunque sea manual y de una sola vez. Sin eso, F-1 y F-2 vuelven a pasar.

## No verificado (marcado por la investigación, no rellenado)

- Color exacto del tick leído: inferido del pairing icono↔color-de-hora, no confirmado byte a byte.
- El wallpaper default vivo del servidor puede ser un gradiente animado de 4 colores sobre el patrón.
- Forma exacta de la colita: descrita por silueta, no medida.
