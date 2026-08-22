import { describe, it, expect } from "vitest";
import { buttonVariants } from "../../components/ui/button";
import { badgeVariants } from "../../components/ui/badge";

/**
 * La tinta de una variante de MARCA se deriva; no se fija.
 *
 * `--primary` es reasignable por la app que consume el paquete. Fovente lo ata
 * al color que el cliente elige en Ajustes → Marca, así que un `text-white`
 * clavado acá deja el relleno variable y la tinta constante — y sobre un
 * relleno claro el rótulo desaparece. Medido en el DOM vivo de Fovente antes
 * del arreglo: **1.68:1** con una marca amarilla, **2.61:1** en tema oscuro con
 * la marca por defecto. → inbox-ai#617
 *
 * Este test se escribió contra la versión ROTA primero y falló ahí; si alguna
 * vez pasa sobre un `text-white` reintroducido, es este test el que está mal.
 *
 * Las OTRAS variantes conservan `text-white` a propósito y el test lo afirma:
 * sus rellenos (`--secondary`, `--destructive`, los de estado y canal) son
 * colores FIJOS del sistema, no de marca, y su par ya está verificado. Sin esa
 * mitad, el test premiaría con verde a quien borre todos los `text-white`.
 */
describe("la tinta de las variantes de marca se deriva del relleno", () => {
  it("Button variant=default toma la tinta de --primary-foreground, no de un literal", () => {
    const cls = buttonVariants({ variant: "default" });
    expect(cls).toContain("bg-[var(--primary)]");
    expect(cls).toContain("text-[var(--primary-foreground)]");
    expect(cls).not.toContain("text-white");
  });

  it("Badge variant=default idem", () => {
    const cls = badgeVariants({ variant: "default" });
    expect(cls).toContain("bg-[var(--primary)]");
    expect(cls).toContain("text-[var(--primary-foreground)]");
    expect(cls).not.toContain("text-white");
  });

  it("las variantes de relleno FIJO sí conservan su tinta literal", () => {
    // Control de no-vacuidad: si esto se pusiera verde con todo el paquete
    // vaciado de `text-white`, las dos aserciones de arriba no probarían nada.
    expect(buttonVariants({ variant: "destructive" })).toContain("text-white");
    expect(buttonVariants({ variant: "secondary" })).toContain("text-white");
    expect(badgeVariants({ variant: "destructive" })).toContain("text-white");
  });
});
