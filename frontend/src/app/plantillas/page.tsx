import type { Metadata } from "next";
import Link from "next/link";
import { fillSlugFor } from "@/lib/forms";
import { getTemplates } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Plantillas · Pre-Legal",
  description:
    "Catálogo de plantillas de documentos legales de Common Paper disponibles en Pre-Legal.",
};

export default async function TemplatesCatalog() {
  const templates = await getTemplates();

  return (
    <>
      <section className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Catálogo de plantillas
        </h1>
        <p className="mt-3 max-w-2xl text-foreground/70">
          {templates.length} plantillas de acuerdos legales estándar listas para
          consultar, traducidas al español. Las marcadas como «Se puede rellenar»
          tienen formulario para generar el documento en PDF con tus datos.
        </p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2">
        {templates.map((template) => (
          <li key={template.slug}>
            <Link
              href={`/plantillas/${template.slug}`}
              className="block h-full rounded-lg border border-black/10 p-5 transition-colors hover:border-black/30 hover:bg-black/[.03] dark:border-white/15 dark:hover:border-white/40 dark:hover:bg-white/[.05]"
            >
              <h2 className="font-medium">{template.displayName}</h2>
              {fillSlugFor(template.slug) && (
                <span className="mt-2 inline-block rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium dark:bg-white/10">
                  Se puede rellenar
                </span>
              )}
              <p className="mt-2 text-sm text-foreground/70">
                {template.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
