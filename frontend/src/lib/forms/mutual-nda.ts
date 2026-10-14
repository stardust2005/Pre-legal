// Formulario de la Portada del Mutual NDA (PL-4). Sin dependencias de Node:
// lo usan tanto el formulario (cliente) como la generación del PDF.

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

// Valores por defecto de la Portada de Common Paper (Mutual NDA 1.0).
export function defaultValues(): MutualNdaValues {
  return {
    purpose: "Evaluar si se establece una relación comercial con la otra parte.",
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

const years = (n: number) => `${n} ${n === 1 ? "año" : "años"}`;

export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function describeMndaTerm(term: MutualNdaValues["mndaTerm"]): string {
  return term.kind === "years"
    ? `Vence ${years(term.years)} después de la Fecha de Entrada en Vigor`
    : "Continúa hasta que se termine de acuerdo con los términos del MNDA";
}

export function describeConfidentialityTerm(term: MutualNdaValues["confidentialityTerm"]): string {
  return term.kind === "years"
    ? `${years(term.years)} desde la Fecha de Entrada en Vigor, pero, en el caso de los secretos empresariales, hasta que la Información Confidencial deje de considerarse secreto empresarial según las leyes aplicables`
    : "A perpetuidad";
}

// Valor de cada campo de los Términos Estándar, por el nombre del campo en español
// (texto del <span class="coverpage_link">, según Templates/es/GLOSARIO.md).
export function fieldValues(values: MutualNdaValues): Record<string, string> {
  return {
    Finalidad: values.purpose.trim(),
    "Fecha de Entrada en Vigor": formatDate(values.effectiveDate),
    "Duración del MNDA": describeMndaTerm(values.mndaTerm),
    "Plazo de Confidencialidad": describeConfidentialityTerm(values.confidentialityTerm),
    "Ley Aplicable": values.governingLaw.trim(),
    Jurisdicción: values.jurisdiction.trim(),
  };
}

// Campos obligatorios que siguen vacíos, para avisar antes de descargar.
export function missingFields(values: MutualNdaValues): string[] {
  const missing = Object.entries(fieldValues(values))
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
export function fillStandardTerms(markdown: string, values: MutualNdaValues): string {
  const byField = fieldValues(values);
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
