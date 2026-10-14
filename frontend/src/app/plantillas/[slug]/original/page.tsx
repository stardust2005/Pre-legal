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

export const dynamicParams = false;

// Solo las plantillas traducidas necesitan una página aparte para el original; con los
// documentos en inglés (PL-8), la página de la plantilla ya muestra el original.
export async function generateStaticParams() {
  if (DOCUMENT_LANGUAGE !== "es") return [];
  const templates = await getTemplates();
  return templates.filter(hasTranslation).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplate(slug);
  return { title: template ? `${template.name} (original) · Pre-Legal` : "Pre-Legal" };
}

export default async function OriginalPage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) notFound();

  const content = await getTemplateContent(template, "en");
  return <TemplateView template={template} content={content} language="en" translated />;
}
