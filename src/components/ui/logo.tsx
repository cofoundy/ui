import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const logoVariants = cva("cf-logo", {
  variants: {
    size: {
      sm: "w-6 h-6",
      default: "w-10 h-10",
      lg: "w-16 h-16",
      xl: "w-24 h-24",
      "2xl": "w-32 h-32",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

/**
 * Cómo se pinta el isologo (regla de marca: handbook/positioning/BRAND/identity.md §02).
 * - `color`: colores de marca. Fondos claros (sobre oscuro los azules se hunden: usa `mono` o `flat`).
 * - `mono`: un color (currentColor) con relieve por opacidad de cara. Pensado para BLANCO sobre
 *   fondo oscuro neutro y tamaño mediano o mayor. En un color oscuro sobre claro la luz se
 *   invierte (la cara iluminada sale casi negra): para eso usa `flat`.
 * - `flat`: un color plano (currentColor) con las caras separadas por un offset (geometría de
 *   BRAND/assets/isologo/isologo-pure-white.svg). Tamaños chicos, favicon, avatar, sobre el
 *   color de un cliente, y cualquier mono que no sea blanco con relieve.
 */
type LogoVariant = "color" | "mono" | "flat";

/** Caras del isologo: path, color de marca y opacidad en `mono` (relieve). */
const FACES: { name: string; d: string; fill: string; relief: number }[] = [
  { name: "Right cube - top face", d: "M653.012 426.724L516.512 347.79C510.318 344.208 502.682 344.208 496.488 347.79L359.988 426.724C356.86 428.533 354.34 431.117 352.613 434.153L496.5 517.227C499.594 519.013 503.047 519.906 506.5 519.906C509.953 519.906 513.406 519.013 516.5 517.227L660.387 434.153C658.661 431.117 656.14 428.533 653.012 426.724Z", fill: "#2885AE", relief: 1 },
  { name: "Right cube - right face", d: "M663 601.962V444.038C663 440.511 662.071 437.117 660.387 434.153L516.5 517.227C513.406 519.013 509.953 519.906 506.5 519.906V700.897C509.957 700.897 513.415 700.001 516.512 698.21L653.012 619.276C659.193 615.701 663 609.103 663 601.962Z", fill: "#17597B", relief: 0.7 },
  { name: "Right cube - left face", d: "M359.988 619.276L496.488 698.21C499.585 700.001 503.043 700.897 506.5 700.897V519.906C503.047 519.906 499.594 519.013 496.5 517.227L352.613 434.153C350.929 437.117 350 440.511 350 444.038V601.962C350 609.103 353.807 615.701 359.988 619.276Z", fill: "#0B3957", relief: 0.5 },
  { name: "Left cube - top face", d: "M307.012 426.621L170.512 347.686C164.318 344.105 156.682 344.105 150.488 347.686L13.988 426.621C10.8596 428.43 8.3395 431.014 6.61323 434.05L150.5 517.123C153.594 518.91 157.047 519.803 160.5 519.803C163.953 519.803 167.406 518.91 170.5 517.123L314.387 434.05C312.661 431.014 310.14 428.43 307.012 426.621Z", fill: "#0B3957", relief: 0.5 },
  { name: "Left cube - right face", d: "M317 601.859V443.935C317 440.408 316.071 437.013 314.387 434.05L170.5 517.123C167.406 518.91 163.953 519.803 160.5 519.803V700.793C163.957 700.793 167.415 699.898 170.512 698.107L307.012 619.173C313.193 615.598 317 608.999 317 601.859Z", fill: "#0B3049", relief: 0.4 },
  { name: "Left cube - left face", d: "M13.988 619.173L150.488 698.107C153.585 699.898 157.043 700.793 160.5 700.793V519.803C157.047 519.803 153.594 518.91 150.5 517.123L6.61323 434.05C4.9286 437.013 4 440.408 4 443.935V601.859C4 608.999 7.80673 615.598 13.988 619.173Z", fill: "#072135", relief: 0.3 },
  { name: "Small cube top right", d: "M687 164.58C700.333 172.278 700.333 191.523 687 199.221L540 284.091C526.667 291.789 510 282.167 510 266.771V97.0298C510 81.6338 526.667 72.0113 540 79.7093L687 164.58Z", fill: "#354552", relief: 0.6 },
  { name: "Small cube top left", d: "M49 204.176C35.6667 211.874 35.6667 231.119 49 238.817L127.75 284.283C141.083 291.981 157.75 282.359 157.75 266.963V176.03C157.75 160.634 141.083 151.011 127.75 158.709L49 204.176Z", fill: "#354552", relief: 0.6 },
  { name: "Center structure - right", d: "M483 300.454V149.984V116.719C483 116.719 481 139.219 466.5 160.219C457.126 173.794 438.474 186.719 438.474 186.719L354.5 235.542C354.5 235.542 345.25 239.219 338.5 251.219C334 259.219 334 277.219 334 277.219V394.719C337.292 394.719 340.584 393.866 343.532 392.16L473.491 316.951C479.376 313.545 483 307.258 483 300.454Z", fill: "#072135", relief: 0.3 },
  { name: "Center structure - left", d: "M194.509 316.951L324.468 392.16C327.416 393.866 330.708 394.719 334 394.719V277.219C334 277.219 334 259.219 338.5 251.219C345.25 239.219 354.5 235.542 354.5 235.542L438.474 186.719C438.474 186.719 457.126 173.794 466.5 160.219C481 139.219 483 116.719 483 116.719V21.7188C483 21.7188 482.5 8.11886 471.5 3.71875C459 -1.28137 448 6.21883 448 6.21883L353 66.7191C353 66.7191 338.447 75.9747 332 86.7191C326 96.7191 322.5 104.43 322.5 116.719V211.219L209 146.219C209 146.219 199.778 140.219 192 145.219C185 149.719 185 155.359 185 158.719V300.454C185 307.258 188.624 313.545 194.509 316.951Z", fill: "#103D5C", relief: 0.5 },
];

/** Caras de `flat`: cada cara encogida hacia adentro (BRAND/assets/isologo/make-pure-white.py, gap 10). */
const FLAT_FACES = [
  "M650.51 431.05Q651.78 431.79 652.86 432.72L514 512.9Q510.52 514.91 506.5 514.91Q502.48 514.91 499 512.9L360.14 432.72Q361.22 431.79 362.49 431.05L498.99 352.12Q506.5 347.78 514.01 352.12Z",
  "M658 601.96Q658 610.61 650.51 614.95L514.01 693.88Q512.79 694.59 511.5 695.05V524.41Q515.42 523.62 519 521.56L657.78 441.43Q658 442.71 658 444.04Z",
  "M362.49 614.95Q355 610.61 355 601.96V444.04Q355 442.71 355.22 441.43L494 521.56Q497.58 523.62 501.5 524.41V695.05Q500.21 694.59 498.99 693.88Z",
  "M304.51 430.95Q305.78 431.69 306.86 432.62L168 512.79Q164.52 514.8 160.5 514.8Q156.48 514.8 153 512.79L14.14 432.62Q15.22 431.69 16.49 430.95L152.99 352.01Q160.5 347.67 168.01 352.01Z",
  "M312 601.86Q312 610.51 304.51 614.84L168.01 693.78Q166.79 694.48 165.5 694.94V524.31Q169.42 523.52 173 521.45L311.78 441.33Q312 442.6 312 443.93Z",
  "M16.49 614.84Q9 610.51 9 601.86V443.93Q9 442.6 9.22 441.33L148 521.45Q151.58 523.52 155.5 524.31V694.94Q154.21 694.48 152.99 693.78Z",
  "M684.5 168.91Q692 173.24 692 181.9Q692 190.56 684.5 194.89L537.5 279.76Q530 284.09 522.5 279.76Q515 275.43 515 266.77V97.03Q515 88.37 522.5 84.04Q530 79.71 537.5 84.04Z",
  "M51.5 208.51 130.25 163.04Q137.75 158.71 145.25 163.04Q152.75 167.37 152.75 176.03V266.96Q152.75 275.62 145.25 279.95Q137.75 284.28 130.25 279.95L51.5 234.49Q44 230.16 44 221.5Q44 212.84 51.5 208.51Z",
  "M478 300.45Q478 308.56 470.99 312.62L341.03 387.83Q340.04 388.41 339 388.8V277.22Q339 272.97 339.54 267.73Q340.56 257.76 342.86 253.67Q346.57 247.06 352.07 242.85Q354.68 240.85 356.35 240.19Q356.69 240.05 357.01 239.86L440.99 191.04Q441.16 190.94 441.32 190.83Q446.18 187.46 452.2 182.38Q464.38 172.09 470.61 163.06Q474.75 157.07 478 150.43Z",
  "M197.01 312.62Q190 308.56 190 300.45V158.72Q190 155.67 190.57 154.11Q191.54 151.46 194.7 149.42Q197.71 147.49 202.13 148.67Q204.64 149.34 206.27 150.41Q206.39 150.49 206.52 150.56L320.02 215.56Q321.17 216.22 322.5 216.22Q324.57 216.22 326.04 214.75Q327.5 213.29 327.5 211.22V116.72Q327.5 108.95 329.73 102.49Q331.56 97.17 336.29 89.29Q339.87 83.32 348.09 76.55Q352.3 73.09 355.69 70.94L450.69 10.44Q450.75 10.39 450.82 10.35L450.82 10.35Q452.91 8.92 456.46 7.9Q463.43 5.88 469.64 8.36Q474.48 10.3 476.7 16.14Q477.89 19.27 478 21.82V116.49Q477.52 121.6 475.37 129.24Q470.97 144.94 462.39 157.38Q456.91 165.31 445.75 174.74Q440.19 179.43 435.79 182.5L352.28 231.05Q349.46 232.25 345.99 234.91Q338.86 240.37 334.14 248.77Q329 257.91 329 277.22V388.8Q327.96 388.41 326.97 387.83Z",
];

interface LogoProps
  extends Omit<React.SVGProps<SVGSVGElement>, "fill">,
    VariantProps<typeof logoVariants> {
  /** `color` (default) · `mono` (blanco con relieve sobre oscuro) · `flat` (un color plano). */
  variant?: LogoVariant;
  /** @deprecated Usa `variant="mono"`. Se mantiene por compatibilidad. */
  mono?: boolean;
}

/**
 * Cofoundy Isologo — los cubos isométricos.
 * Accesible por defecto (`role="img"`, nombre «Cofoundy»); pasa `aria-hidden` si va junto al
 * wordmark u otro texto que ya nombra la marca.
 */
function Logo({ className, size, variant, mono = false, ...props }: LogoProps) {
  const resolved: LogoVariant = variant ?? (mono ? "mono" : "color");
  const decorative = props["aria-hidden"] === true || props["aria-hidden"] === "true";

  return (
    <svg
      viewBox="0 0 701 701"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(logoVariants({ size }), className)}
      data-slot="logo"
      data-variant={resolved}
      {...(decorative ? {} : { role: "img", "aria-label": "Cofoundy" })}
      {...props}
    >
      {resolved === "flat"
        ? FLAT_FACES.map((d, i) => <path key={i} d={d} fill="currentColor" />)
        : FACES.map((face) => (
            <path
              key={face.name}
              d={face.d}
              fill={resolved === "mono" ? "currentColor" : face.fill}
              opacity={resolved === "mono" && face.relief !== 1 ? face.relief : undefined}
            />
          ))}
    </svg>
  );
}

export { Logo, logoVariants };
export type { LogoProps, LogoVariant };
