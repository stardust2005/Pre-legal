import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateView } from "@/components/TemplateView";
import { DOCUMENT_LANGUAGE } from "@/lib/document-language";
import {
  getTemplate,
  getTemplateContent,
  getTemplates,
  hasTranslation,
} from "@/lib/templates";

type Props = {
  params: Promise<{ slug: string }>;
};

// Solo existen las plantillas del catálogo; cualquier otra ruta da 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const templates = await getTemplates();
  return templates.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplate(slug);
  return {
    title: template ? `${template.displayName} · Pre-Legal` : "Pre-Legal",
    description: template?.description,
  };
}

export default async function TemplatePage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) notFound();

  // En inglés (PL-8) se muestra el original y no se enlaza la traducción, pendiente de revisar (PL-9).
  const translated = DOCUMENT_LANGUAGE === "es" && hasTranslation(template);
  const language = translated ? "es" : "en";
  const content = await getTemplateContent(template, language);

  return <TemplateView template={template} content={content} language={language} translated={translated} />;
}
