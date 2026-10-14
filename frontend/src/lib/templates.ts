import { readFile } from "node:fs/promises";
import path from "node:path";

// El dataset (PL-2) vive en la raíz del repositorio, un nivel por encima de frontend/.
const REPO_ROOT = path.join(process.cwd(), "..");
const CATALOG_PATH = path.join(REPO_ROOT, "catalog.json");
const TEMPLATES_DIR = path.join(REPO_ROOT, "Templates");

export type CatalogEntry = {
  name: string;
  description: string;
  filename: string;
};

export type Catalog = {
  source: string;
  license: string;
  license_url: string;
  templates: CatalogEntry[];
};

export type Template = CatalogEntry & { slug: string };

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
  }));
}

export async function getTemplate(slug: string): Promise<Template | undefined> {
  const templates = await getTemplates();
  return templates.find((template) => template.slug === slug);
}

export async function getTemplateContent(template: Template): Promise<string> {
  // basename evita que una entrada del catálogo apunte fuera de Templates/.
  const file = path.join(TEMPLATES_DIR, path.basename(template.filename));
  return readFile(file, "utf-8");
}
