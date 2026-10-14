import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateView } from "@/components/TemplateView";
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

  const translated = hasTranslation(template);
  const content = await getTemplateContent(template, translated ? "es" : "en");

  return (
    <TemplateView
      template={template}
      content={content}
      language={translated ? "es" : "en"}
      translated={translated}
    />
  );
}
