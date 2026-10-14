import { readFile } from "node:fs/promises";
import path from "node:path";
import { DOCUMENT_LANGUAGE, type Language } from "./document-language";

export type { Language };

// El dataset (PL-2) vive en la raíz del repositorio, un nivel por encima de frontend/.
const REPO_ROOT = path.join(process.cwd(), "..");
const CATALOG_PATH = path.join(REPO_ROOT, "catalog.json");
const TEMPLATES_DIR = path.join(REPO_ROOT, "Templates");

type Translation = {
  name: string;
  filename: string;
};

export type CatalogEntry = {
  name: string;
  description: string;
  filename: string;
  translations?: { es?: Translation };
  // Portada de la plantilla (PL-6); la del Mutual NDA es también una entrada propia.
  cover_page?: { filename: string; translations?: { es?: { filename: string } } };
};

export type Catalog = {
  source: string;
  license: string;
  license_url: string;
  language: string;
  templates: CatalogEntry[];
};

export type Template = CatalogEntry & {
  slug: string;
  // Nombre en el idioma de los documentos (DOCUMENT_LANGUAGE); si no hay traducción, el original.
  displayName: string;
};

export function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/i, "").toLowerCase();
}

export async function getCatalog(): Promise<Catalog> {
  const raw = await readFile(CATALOG_PATH, "utf-8");
  return JSON.parse(raw) as Catalog;
}

export async function getTemplates(): Promise<Template[]> {
  const catalog = await getCatalog();
  return catalog.templates.map((entry) => ({
    ...entry,
    slug: slugFromFilename(entry.filename),
    displayName: (DOCUMENT_LANGUAGE === "es" && entry.translations?.es?.name) || entry.name,
  }));
}

export async function getTemplate(slug: string): Promise<Template | undefined> {
  const templates = await getTemplates();
  return templates.find((template) => template.slug === slug);
}

export function hasTranslation(template: Template): boolean {
  return Boolean(template.translations?.es);
}

// Solo se admite Templates/<fichero> o Templates/es/<fichero>, nunca rutas fuera de Templates/.
function readTemplateFile(relative: string): Promise<string> {
  const dir = path.dirname(relative) === "es" ? path.join(TEMPLATES_DIR, "es") : TEMPLATES_DIR;
  return readFile(path.join(dir, path.basename(relative)), "utf-8");
}

export async function getTemplateContent(
  template: Template,
  language: Language = DOCUMENT_LANGUAGE,
): Promise<string> {
  const translated = language === "es" ? template.translations?.es?.filename : undefined;
  return readTemplateFile(translated ?? template.filename);
}

export async function getCoverContent(
  template: Template,
  language: Language = DOCUMENT_LANGUAGE,
): Promise<string | undefined> {
  const cover = template.cover_page;
  if (!cover) return undefined;
  const translated = language === "es" ? cover.translations?.es?.filename : undefined;
  return readTemplateFile(translated ?? cover.filename);
}
