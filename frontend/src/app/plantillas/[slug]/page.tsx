import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {
  getTemplate,
  getTemplateContent,
  getTemplates,
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
    title: template ? `${template.name} · Pre-Legal` : "Pre-Legal",
    description: template?.description,
  };
}

export default async function TemplatePage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) notFound();

  const content = await getTemplateContent(template);

  return (
    <>
      <Link
        href="/plantillas"
        className="text-sm text-foreground/60 hover:text-foreground"
      >
        ← Volver al catálogo
      </Link>

      <header className="mt-6 mb-8 border-b border-black/10 pb-6 dark:border-white/15">
        <h1 className="text-3xl font-semibold tracking-tight">
          {template.name}
        </h1>
        <p className="mt-3 max-w-2xl text-foreground/70">
          {template.description}
        </p>
      </header>

      {/* El markdown procede del dataset local de Templates/, no de usuarios,
          por eso se permite el HTML embebido (los <span> de los campos). */}
      <article className="prose max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </article>
    </>
  );
}
