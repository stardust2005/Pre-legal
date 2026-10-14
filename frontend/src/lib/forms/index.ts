// Plantillas que ya se pueden rellenar (PL-4). El resto llegará con PL-6.
// Clave: slug de la página del formulario. Valor: slugs del catálogo que enlazan a él.
export const FILLABLE: Record<string, string[]> = {
  "mutual-nda": ["mutual-nda", "mutual-nda-coverpage"],
};

export function fillSlugFor(templateSlug: string): string | undefined {
  return Object.entries(FILLABLE).find(([, slugs]) => slugs.includes(templateSlug))?.[0];
}
