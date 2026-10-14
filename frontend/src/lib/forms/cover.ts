// Formulario genérico a partir de una Portada en Markdown (PL-4 / PL-6).
// Sin dependencias de Node: lo usan el formulario (cliente) y la generación del PDF.
//
// Convenciones de las portadas de Templates/es/*-coverpage.md:
// - `### Campo` / `#### Campo`: secciones; el título es el nombre del campo.
// - `[ texto ]`: dato a rellenar (desplegable si contiene opciones `a | b`).
// - `- [ ]` / `- [x]`: opciones que se marcan o desmarcan.
// - `> *Nota de redacción:*` y `> *Nota de Pre-Legal:*`: ayuda; no salen en el documento.
// - Tabla con `[denominación social]` en la cabecera: firmas de las partes.

export type Segment =
  | { kind: "text"; text: string }
  | { kind: "field"; id: string }
  // Indicaciones para quien redacta, como «[ seleccionar si…: ]»: no salen en el documento.
  | { kind: "instruction"; text: string };

export type Field = {
  id: string;
  hint: string;
  options?: string[];
  defaultValue: string;
  multiline: boolean;
  section: string;
};

export type PartyKey = "name" | "title" | "address";

export type Line =
  | { kind: "blank" | "other" | "translation"; raw: string }
  | { kind: "heading"; raw: string; level: number; title: string }
  | { kind: "note"; raw: string; text: string }
  | { kind: "label"; raw: string; text: string }
  | { kind: "text"; raw: string; segments: Segment[]; section: string; table: boolean }
  | {
      kind: "checkbox";
      raw: string;
      id: string;
      indent: number;
      segments: Segment[];
      defaultChecked: boolean;
      section: string;
    }
  | { kind: "sigHeader"; raw: string }
  | { kind: "sigRow"; raw: string; label: string; key?: PartyKey };

export type CoverModel = {
  lines: Line[];
  fields: Record<string, Field>;
  roles: string[];
};

export type Party = { company: string; name: string; title: string; address: string };

export type CoverValues = {
  fields: Record<string, string>;
  checks: Record<string, boolean>;
  parties: Record<string, Party>;
};

const PLACEHOLDER = /\[([^[\]\n]*)\](?!\()/g;
const DEFAULT_ROLES = ["Proveedor", "Cliente"];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const hasLetters = (s: string) => /\p{L}/u.test(s);

function isInstruction(hint: string): boolean {
  return /^\s*(seleccionar|por ejemplo)/i.test(hint) || /:\s*$/.test(hint);
}

export function parseCover(markdown: string): CoverModel {
  const lines: Line[] = [];
  const fields: Record<string, Field> = {};
  let roles: string[] = [];
  let section = "";
  let inSignature = false;
  let n = 0;

  const segment = (text: string): Segment[] => {
    const out: Segment[] = [];
    let last = 0;
    for (const m of text.matchAll(PLACEHOLDER)) {
      if (m.index! > last) out.push({ kind: "text", text: text.slice(last, m.index) });
      const hint = m[1].trim();
      if (isInstruction(hint)) {
        out.push({ kind: "instruction", text: hint });
      } else {
        const id = `f${n++}`;
        const options = hint.includes("|")
          ? hint
              .replace(/^\s*elegir[^:]*:\s*/i, "")
              .split("|")
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined;
        // Textos largos entre corchetes: si son una propuesta de redacción se ofrecen ya
        // escritos; si son una indicación («indicar…», «describir…») el campo empieza vacío.
        const long = !options && hint.length > 60;
        const proposal =
          long &&
          !/^(indicar|describir|descripción|adjuntar|definir|cuadro|breve|texto libre|si lo exige)/i.test(hint);
        fields[id] = { id, hint, options, defaultValue: proposal ? hint : "", multiline: long, section };
        out.push({ kind: "field", id });
      }
      last = m.index! + m[0].length;
    }
    if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
    return out;
  };

  for (const raw of markdown.split(/\r?\n/)) {
    let m: RegExpMatchArray | null;
    if (/^\s*$/.test(raw)) {
      lines.push({ kind: "blank", raw });
      inSignature = false;
    } else if ((m = raw.match(/^(#{1,4})\s+(.*)$/))) {
      section = m[2].trim();
      lines.push({ kind: "heading", raw, level: m[1].length, title: section });
    } else if (raw.startsWith("> **Traducción no oficial")) {
      lines.push({ kind: "translation", raw });
    } else if ((m = raw.match(/^>\s*\*(Nota de redacción|Nota de Pre-Legal):\*\s*(.*)$/))) {
      lines.push({ kind: "note", raw, text: `${m[1]}: ${m[2]}` });
    } else if ((m = raw.match(/^<label>(.*)<\/label>\s*$/))) {
      lines.push({ kind: "label", raw, text: m[1] });
    } else if ((m = raw.match(/^(\s*)- \[( |x)\]\s?(.*)$/))) {
      const id = `c${n++}`;
      lines.push({
        kind: "checkbox",
        raw,
        id,
        indent: m[1].length,
        segments: segment(m[3]),
        defaultChecked: m[2] === "x",
        section,
      });
    } else if (raw.startsWith("|") && raw.includes("[denominación social]")) {
      roles = raw
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => capitalize(c.split(":")[0].trim()));
      inSignature = true;
      lines.push({ kind: "sigHeader", raw });
    } else if (/^\|\s*:?-{3}/.test(raw)) {
      lines.push({ kind: "other", raw });
    } else if (inSignature && raw.startsWith("|")) {
      const label = raw.split("|")[1].trim();
      const key: PartyKey | undefined = label.startsWith("Nombre")
        ? "name"
        : label.startsWith("Cargo")
          ? "title"
          : label.startsWith("Dirección")
            ? "address"
            : undefined;
      lines.push({ kind: "sigRow", raw, label, key });
    } else if (raw.startsWith(">")) {
      lines.push({ kind: "other", raw });
    } else {
      lines.push({ kind: "text", raw, segments: segment(raw), section, table: raw.startsWith("|") });
    }
  }
  return { lines, fields, roles: roles.length ? roles : DEFAULT_ROLES };
}

export function initialValues(model: CoverModel): CoverValues {
  const fields: Record<string, string> = {};
  for (const f of Object.values(model.fields)) fields[f.id] = f.defaultValue;
  const checks: Record<string, boolean> = {};
  for (const l of model.lines) if (l.kind === "checkbox") checks[l.id] = l.defaultChecked;
  const parties: Record<string, Party> = {};
  for (const r of model.roles) parties[r] = { company: "", name: "", title: "", address: "" };
  return { fields, checks, parties };
}

function pendingLabel(field: Field): string {
  const base = field.options
    ? field.options.join(" | ")
    : hasLetters(field.hint) && !field.multiline
      ? field.hint
      : field.section || "dato";
  return base.length > 50 ? `${base.slice(0, 47)}…` : base;
}

// Escapa los caracteres con significado en Markdown/HTML de lo que escribe el usuario.
const mdEscape = (s: string) => s.replace(/\s*\n\s*/g, " ").replace(/([\\`*_[\]<>#|])/g, "\\$1");

function renderSegments(segments: Segment[], model: CoverModel, values: CoverValues): string {
  return segments
    .map((s) => {
      if (s.kind === "text") return s.text;
      if (s.kind === "instruction") return "";
      const value = values.fields[s.id]?.trim();
      return value ? mdEscape(value) : `[Pendiente: ${pendingLabel(model.fields[s.id])}]`;
    })
    .join("")
    .replace(/ {2,}/g, " ");
}

// Portada rellenada (Markdown) para la vista previa y el PDF.
export function fillCover(model: CoverModel, values: CoverValues): string {
  const out: string[] = [];
  for (const line of model.lines) {
    switch (line.kind) {
      case "note":
        break;
      case "label":
        out.push(`*${line.text}*`);
        break;
      case "text":
        out.push(renderSegments(line.segments, model, values));
        break;
      case "checkbox":
        out.push(
          `${" ".repeat(line.indent)}- [${values.checks[line.id] ? "x" : " "}] ${renderSegments(line.segments, model, values)}`,
        );
        break;
      case "sigHeader":
        out.push(
          `|| ${model.roles
            .map((r) => {
              const company = values.parties[r]?.company.trim();
              return `${r.toUpperCase()}: ${company ? mdEscape(company) : "[Pendiente: denominación social]"}`;
            })
            .join(" | ")} |`,
        );
        break;
      case "sigRow": {
        const cells = model.roles.map((r) =>
          line.key ? mdEscape(values.parties[r]?.[line.key].trim() ?? "") : "",
        );
        out.push(`| ${line.raw.split("|")[1].trim()} | ${cells.join(" | ")} |`);
        break;
      }
      default:
        out.push(line.raw);
    }
  }
  // Las notas eliminadas dejan líneas en blanco seguidas.
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

// Campos obligatorios vacíos: los que aparecen en texto visible o en opciones marcadas.
export function missingFields(model: CoverModel, values: CoverValues): string[] {
  const missing = new Set<string>();
  for (const line of model.lines) {
    if (line.kind !== "text" && line.kind !== "checkbox") continue;
    if (line.kind === "checkbox" && !values.checks[line.id]) continue;
    for (const s of line.segments) {
      if (s.kind === "field" && !values.fields[s.id]?.trim()) missing.add(line.section || "Portada");
    }
  }
  for (const r of model.roles) if (!values.parties[r]?.company.trim()) missing.add(`${r}: denominación social`);
  return [...missing];
}

// Normaliza nombres de campo para comparar singular/plural y tildes
// («Periodos de Suscripción» = «Periodo de Suscripción»).
function normalize(s: string): string {
  return s
    .replace(/\((e?s)\)/g, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/ones$/, "on").replace(/s$/, ""))
    .join(" ")
    .trim();
}

const plain = (md: string) =>
  md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\\([\\`*_[\]<>#|])/g, "$1")
    .replace(/\*\*?/g, "")
    .trim();

// Valor de cada campo de los Términos Estándar según la Portada rellenada.
export function coverFieldValue(model: CoverModel, values: CoverValues): (field: string) => string {
  const bySection = new Map<string, string[]>();
  // Líneas visibles del tipo «Campo: valor» (opciones marcadas o párrafos).
  const labelled: string[] = [];
  let current = "";
  for (const line of model.lines) {
    if (line.kind === "heading") current = normalize(line.title);
    const visible =
      (line.kind === "text" && !line.table) || (line.kind === "checkbox" && values.checks[line.id]);
    if (!visible) continue;
    const text = plain(renderSegments(line.segments, model, values));
    if (!text) continue;
    bySection.set(current, [...(bySection.get(current) ?? []), text]);
    if (text.includes(":")) labelled.push(text);
  }
  const roles = new Map(model.roles.map((r) => [normalize(r), r]));
  const addressKey = normalize("Dirección para Notificaciones");

  return (field: string) => {
    const key = normalize(field);
    const role = roles.get(key);
    if (role) return values.parties[role]?.company.trim() ?? "";
    if (key === addressKey) {
      const addresses = model.roles
        .filter((r) => values.parties[r]?.address.trim())
        .map((r) => `${r}: ${values.parties[r].address.trim()}`);
      return addresses.length === model.roles.length ? addresses.join(" / ") : "";
    }
    const section = bySection.get(key);
    if (section?.length) return section.join(" / ");
    const item = labelled.find((t) => normalize(t.split(":")[0]) === key);
    return item ? item.slice(item.indexOf(":") + 1).trim() : "";
  };
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Vista previa (modelo C): «Campo («valor»)» en los Términos Estándar; los vacíos, pendientes.
export function fillStandardTermsFromCover(
  markdown: string,
  valueOf: (field: string) => string,
): string {
  return markdown.replace(
    /<span class="(\w+_link)"((?: id="[^"]*")?)>([^<]+)<\/span>/g,
    (_match, cls: string, id: string, field: string) => {
      const raw = valueOf(field);
      const value = raw.length > 160 ? `${raw.slice(0, 157)}…` : raw;
      // Un valor que aún contiene datos pendientes se muestra como pendiente.
      return value && !value.includes("[Pendiente")
        ? `<span class="${cls} filled"${id} title="${escapeHtml(field)}">${escapeHtml(field)} («${escapeHtml(value)}»)</span>`
        : `<span class="${cls} pending"${id} title="Campo pendiente">${escapeHtml(field)} [pendiente]</span>`;
    },
  );
}
