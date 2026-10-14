import type { Template } from "@/lib/templates";

// Plantillas que se pueden rellenar (PL-4): todas las que tienen Portada (PL-6).
// El Mutual NDA usa su formulario específico; su Portada, que es una entrada
// propia del catálogo, enlaza al mismo formulario.
export function fillSlugFor(template: Template): string | undefined {
  if (template.slug === "mutual-nda-coverpage") return "mutual-nda";
  return template.cover_page ? template.slug : undefined;
}
