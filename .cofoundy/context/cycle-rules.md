# Reglas de este ciclo (además del floor)

## R-1 — Gate visual por iteración: preview abierto + crítica del CTO

Instrucción del operador, 2026-09-04, textual:
> "me abres el preview con open para ver y aprobar los trabajos finales. tu tmb le echas una
> chequeada en cada iteracion y mandas tu critica constructiva"

**Contrato, en este orden. Ninguna iteración visual se declara lista sin los tres pasos:**

1. **Toda iteración visual produce un artefacto ABRIBLE.** Una story de Storybook o una página
   demo estática con URL. No "está en la rama" — algo que se abra.
2. **El CTO lo revisa PRIMERO.** Screenshot headless → crítica constructiva escrita contra el
   rubric, antes de mostrárselo al operador. No se le pasa crudo lo que llegó del IC: el CTO ya
   filtró y ya opinó.
3. **Recién ahí `open` la URL** para que el operador vea y apruebe.

**Requisito arquitectónico derivado (no es proceso, es diseño):** la superficie previsualizable
existe desde la iteración 1, no al final. El renderer `element/` sirve para las dos cosas —
preview y captura — así que se construye temprano, no como envoltorio último.

**Aplica en:** Fase 7 (cada `DONE` de un IC con salida visual) y Fase 9 (QA).

**Qué NO es:** un gate humano bloqueante del loop. El operador aprueba trabajos finales; el loop
sigue corriendo entre medio. Si el operador no responde, el ciclo continúa y acumula los previews
pendientes de aprobación — no se detiene a esperar.

## R-2 — La crítica del CTO es escrita y falsable

Contra el rubric de `ui-critique` (Honesty Protocol): listar los 5-10 *wrongs* ANTES de puntuar.
Nada de "se ve bien". Si el CTO no encuentra nada mal, lo dice explícito y dice contra qué miró.
