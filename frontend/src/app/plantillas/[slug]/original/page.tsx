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

export const dynamicParams = false;

// Solo las plantillas traducidas necesitan una página aparte para el original.
export async function generateStaticParams() {
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
