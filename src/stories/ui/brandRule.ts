/**
 * Espejo de la tabla «Qué variante usar» de handbook/positioning/BRAND/identity.md §02.
 * La regla vive allá: si cambia, se cambia allá primero y luego este espejo. Única copia en el paquete.
 */
export const IDENTITY_URL =
  'https://github.com/cofoundy/handbook/blob/main/positioning/BRAND/identity.md#02--logo-direction';

/** Filas de la tabla, con la variante del componente que les corresponde. */
export const ROWS = {
  claro: { n: 1, fondo: 'Claro', tamano: 'cualquiera', marca: '*-color', variant: 'color' },
  oscuroGrande: { n: 2, fondo: 'Oscuro neutro', tamano: '≥ 64 px', marca: '*-white', variant: 'mono' },
  oscuroChico: { n: 3, fondo: 'Oscuro neutro', tamano: '< 64 px', marca: '*-pure-white', variant: 'flat' },
  deColor: { n: 4, fondo: 'De color', tamano: 'cualquiera', marca: '*-pure-white', variant: 'flat' },
} as const;

export type BrandRow = (typeof ROWS)[keyof typeof ROWS];

/** «Fila 2 · Oscuro neutro · ≥ 64 px» + salto + «→ *-white · variant="mono"» */
export const rowLabel = (r: BrandRow) =>
  `Fila ${r.n} · ${r.fondo} · ${r.tamano}\n→ ${r.marca} · variant="${r.variant}"`;

export const VARIANT_TABLE_MD = `
### Qué variante usar

Una pregunta: ¿sobre qué fondo y a qué tamaño va? Regla de marca: [identity.md §02](${IDENTITY_URL}) (esta tabla es su espejo).

| # | Fondo | Tamaño | Marca | \`variant\` | Ejemplos |
|---|---|---|---|---|---|
| 1 | Claro (blanco, marfil) | cualquiera | \`*-color\` | \`color\` | cotización, web en modo claro, firma de correo |
| 2 | Oscuro neutro (midnight \`#121317\`, navy) | mediano o grande (≥ 64 px el isologo) | \`*-white\` | \`mono\` + \`text-white\` | portada de PDF, slide, hero, video |
| 3 | Oscuro neutro | chico (< 64 px) | \`*-pure-white\` | \`flat\` + \`text-white\` | favicon, ícono de app, sello en footer |
| 4 | De color (el del cliente, foto, degradado) | cualquiera | \`*-pure-white\` | \`flat\` + \`text-white\` | foto de grupo «X x Cofoundy», co-branding, sobre una foto |

Ante la duda, \`pure-white\` (\`flat\`).
`;
