import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { fillSlugFor } from "@/lib/forms";
import type { Language, Template } from "@/lib/templates";

type Props = {
  template: Template;
  content: string;
  language: Language;
  translated: boolean;
};

export function TemplateView({ template, content, language, translated }: Props) {
  const fillSlug = fillSlugFor(template);
  const otherLink =
    language === "es"
      ? translated && { href: `/plantillas/${template.slug}/original`, label: "Ver el original en inglés" }
      : translated && { href: `/plantillas/${template.slug}`, label: "Ver la traducción al español" };

  return (
    <>
      <Link href="/plantillas" className="text-sm text-foreground/60 hover:text-foreground">
        ← Volver al catálogo
      </Link>

      <header className="mt-6 mb-8 border-b border-black/10 pb-6 dark:border-white/15">
        <h1 className="text-3xl font-semibold tracking-tight">
          {language === "es" ? template.displayName : template.name}
        </h1>
        <p className="mt-3 max-w-2xl text-foreground/70">{template.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
          {fillSlug && (
            <Link
              href={`/plantillas/${fillSlug}/rellenar`}
              className="rounded-md bg-foreground px-4 py-2 font-medium text-background transition-opacity hover:opacity-85"
            >
              Rellenar este acuerdo
            </Link>
          )}
          {otherLink && (
            <Link href={otherLink.href} className="text-foreground/70 underline hover:text-foreground">
              {otherLink.label}
            </Link>
          )}
        </div>
      </header>

      {/* El markdown procede del dataset local de Templates/, no de usuarios,
          por eso se permite el HTML embebido (los <span> de los campos). */}
      <article lang={language} className="prose max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </article>
    </>
  );
}
