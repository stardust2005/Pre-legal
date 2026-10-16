// CSA + SLA (PL-11): la portada del Cloud Service Agreement con la fila del SLA
// de Common Paper («Cover Page with SLA», Templates/sla-coverpage.md) como
// alternativa a su fila de SLA propia. La elige una casilla del formulario.

export const SLA_VARIANT = "sla";

const ROW = /^#### /;
const SECTION = /^#{1,3} /;

// Devuelve la portada del CSA con los dos bloques `<!-- variant -->`, o undefined
// si alguna de las portadas no tiene la estructura esperada.
export function csaCoverWithSla(csaCover: string, slaCover: string): string | undefined {
  const csa = csaCover.split(/\r?\n/);
  const start = csa.findIndex((l) => /^#### SLA\s*$/.test(l));
  if (start < 0) return undefined;
  let end = csa.findIndex((l, i) => i > start && (ROW.test(l) || SECTION.test(l)));
  if (end < 0) end = csa.length;

  const sla = slaCover.split(/\r?\n/);
  const from = sla.findIndex((l) => /^## SLA\s*$/.test(l));
  if (from < 0) return undefined;
  const row = sla
    .slice(from)
    // Sin el pie de licencia de la portada del SLA: la del CSA ya lleva el suyo.
    .filter((l) => !l.includes("CC BY 4.0"))
    // La sección del SLA pasa a ser una fila de «Additions and Modifications».
    .map((l) => l.replace(/^#{2,3} /, "#### "));

  return [
    ...csa.slice(0, start),
    `<!-- variant:!${SLA_VARIANT} -->`,
    ...csa.slice(start, end),
    "<!-- /variant -->",
    `<!-- variant:${SLA_VARIANT} -->`,
    ...row,
    "",
    "<!-- /variant -->",
    ...csa.slice(end),
  ].join("\n");
}
