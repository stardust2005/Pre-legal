import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverForm } from "@/components/CoverForm";
import { MutualNdaForm } from "@/components/MutualNdaForm";
import { fillSlugFor } from "@/lib/forms";
import { getCoverContent, getTemplate, getTemplateContent, getTemplates } from "@/lib/templates";

type Props = {
  params: Promise<{ slug: string }>;
};

// Solo existen las rutas de las plantillas que tienen formulario.
export const dynamicParams = false;

export async function generateStaticParams() {
  const templates = await getTemplates();
  return templates.filter((t) => fillSlugFor(t) === t.slug).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplate(slug);
  return { title: template ? `Rellenar: ${template.displayName} · Pre-Legal` : "Pre-Legal" };
}

export default async function FillPage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template || fillSlugFor(template) !== slug) notFound();

  const standardTerms = await getTemplateContent(template, "es");
  const cover = slug === "mutual-nda" ? undefined : await getCoverContent(template);

  return (
    <>
      <Link href={`/plantillas/${slug}`} className="text-sm text-foreground/60 hover:text-foreground">
        ← Volver a la plantilla
      </Link>
      <header className="mt-6 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Rellenar: {template.displayName}</h1>
        <p className="mt-3 max-w-2xl text-foreground/70">
          Completa la Portada. La vista previa muestra tus datos en la Portada y dentro de los Términos
          Estándar, y el PDF descargable incluye la Portada rellenada junto con los Términos Estándar sin
          modificar. Los datos no se guardan: solo existen en tu navegador mientras usas esta página.
        </p>
      </header>
      {cover ? (
        <CoverForm title={template.displayName} slug={slug} cover={cover} standardTerms={standardTerms} />
      ) : (
        <MutualNdaForm standardTerms={standardTerms} />
      )}
    </>
  );
}
