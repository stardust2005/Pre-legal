// Formulario de la Portada del Mutual NDA (PL-4). Sin dependencias de Node:
// lo usan tanto el formulario (cliente) como la generación del PDF.
// Los textos que van al documento siguen el idioma de los documentos (PL-8).
import type { Language } from "@/lib/document-language";

export type Party = {
  company: string;
  name: string;
  title: string;
  noticeAddress: string;
};

export type MutualNdaValues = {
  purpose: string;
  effectiveDate: string; // AAAA-MM-DD
  mndaTerm: { kind: "years" | "untilTerminated"; years: number };
  confidentialityTerm: { kind: "years" | "perpetual"; years: number };
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: Party;
  party2: Party;
};

const emptyParty = (): Party => ({ company: "", name: "", title: "", noticeAddress: "" });

const DEFAULT_PURPOSE: Record<Language, string> = {
  en: "Evaluating whether to enter into a business relationship with the other party.",
  es: "Evaluar si se establece una relación comercial con la otra parte.",
};

// Valores por defecto de la Portada de Common Paper (Mutual NDA 1.0).
export function defaultValues(language: Language): MutualNdaValues {
  return {
    purpose: DEFAULT_PURPOSE[language],
    effectiveDate: new Date().toISOString().slice(0, 10),
    mndaTerm: { kind: "years", years: 1 },
    confidentialityTerm: { kind: "years", years: 1 },
    governingLaw: "",
    jurisdiction: "",
    modifications: "",
    party1: emptyParty(),
    party2: emptyParty(),
  };
}

const years = (n: number, language: Language) =>
  language === "es" ? `${n} ${n === 1 ? "año" : "años"}` : `${n} ${n === 1 ? "year" : "years"}`;

export function formatDate(iso: string, language: Language): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function describeMndaTerm(term: MutualNdaValues["mndaTerm"], language: Language): string {
  if (language === "es") {
    return term.kind === "years"
      ? `Vence ${years(term.years, language)} después de la Fecha de Entrada en Vigor`
      : "Continúa hasta que se termine de acuerdo con los términos del MNDA";
  }
  return term.kind === "years"
    ? `Expires ${years(term.years, language)} from Effective Date`
    : "Continues until terminated in accordance with the terms of the MNDA";
}

export function describeConfidentialityTerm(
  term: MutualNdaValues["confidentialityTerm"],
  language: Language,
): string {
  if (language === "es") {
    return term.kind === "years"
      ? `${years(term.years, language)} desde la Fecha de Entrada en Vigor, pero, en el caso de los secretos empresariales, hasta que la Información Confidencial deje de considerarse secreto empresarial según las leyes aplicables`
      : "A perpetuidad";
  }
  return term.kind === "years"
    ? `${years(term.years, language)} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws`
    : "In perpetuity";
}

// Nombre de cada campo en los Términos Estándar (texto del <span class="coverpage_link">;
// en español, según Templates/es/GLOSARIO.md).
export const FIELD_NAMES: Record<
  Language,
  Record<"purpose" | "effectiveDate" | "mndaTerm" | "confidentialityTerm" | "governingLaw" | "jurisdiction", string>
> = {
  en: {
    purpose: "Purpose",
    effectiveDate: "Effective Date",
    mndaTerm: "MNDA Term",
    confidentialityTerm: "Term of Confidentiality",
    governingLaw: "Governing Law",
    jurisdiction: "Jurisdiction",
  },
  es: {
    purpose: "Finalidad",
    effectiveDate: "Fecha de Entrada en Vigor",
    mndaTerm: "Duración del MNDA",
    confidentialityTerm: "Plazo de Confidencialidad",
    governingLaw: "Ley Aplicable",
    jurisdiction: "Jurisdicción",
  },
};

// Valor de cada campo de los Términos Estándar, por el nombre del campo en el documento.
export function fieldValues(values: MutualNdaValues, language: Language): Record<string, string> {
  const names = FIELD_NAMES[language];
  return {
    [names.purpose]: values.purpose.trim(),
    [names.effectiveDate]: formatDate(values.effectiveDate, language),
    [names.mndaTerm]: describeMndaTerm(values.mndaTerm, language),
    [names.confidentialityTerm]: describeConfidentialityTerm(values.confidentialityTerm, language),
    [names.governingLaw]: values.governingLaw.trim(),
    [names.jurisdiction]: values.jurisdiction.trim(),
  };
}

// Campos obligatorios que siguen vacíos, para avisar antes de descargar.
export function missingFields(values: MutualNdaValues, language: Language): string[] {
  const missing = Object.entries(fieldValues(values, language))
    .filter(([, value]) => !value)
    .map(([field]) => field);
  for (const [label, party] of [
    ["Parte 1", values.party1],
    ["Parte 2", values.party2],
  ] as const) {
    if (!party.company.trim()) missing.push(`${label}: empresa`);
  }
  return missing;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Vista previa (modelo C): sustituye cada campo de los Términos Estándar por
// «Campo («valor»)». Los campos vacíos se marcan como pendientes.
export function fillStandardTerms(markdown: string, values: MutualNdaValues, language: Language): string {
  const byField = fieldValues(values, language);
  return markdown.replace(
    /<span class="coverpage_link">([^<]+)<\/span>/g,
    (match, field: string) => {
      if (!(field in byField)) return match;
      const value = byField[field];
      return value
        ? `<span class="coverpage_link filled" title="${escapeHtml(field)}">${escapeHtml(field)} («${escapeHtml(value)}»)</span>`
        : `<span class="coverpage_link pending" title="Campo pendiente">${escapeHtml(field)} [pendiente]</span>`;
    },
  );
}
