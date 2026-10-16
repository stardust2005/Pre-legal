"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {
  type CoverModel,
  type CoverValues,
  type Line,
  type Party,
  type Segment,
  coverFieldValue,
  fillCover,
  fillStandardTermsFromCover,
  initialValues,
  lineActive,
  missingFields,
  parseCover,
  variantCheck,
} from "@/lib/forms/cover";
import type { Language } from "@/lib/document-language";
import { draftKey, useDraft } from "@/lib/drafts";
import { DraftNotice } from "@/components/DraftNotice";

// Documento que se puede añadir al principal desde su Portada, como el SLA en el CSA (PL-11).
export type AddOn = {
  // Opción de la Portada (`<!-- variant -->`) que lo activa.
  variant: string;
  title: string;
  standardTerms: string;
};

type Props = {
  title: string;
  slug: string;
  cover: string;
  standardTerms: string;
  language: Language;
  addOn?: AddOn;
};

const inputClass =
  "rounded-md border border-black/15 bg-background px-2 py-1 text-sm focus:border-black/40 focus:outline-none dark:border-white/20 dark:focus:border-white/50";

function FieldInput({
  model,
  id,
  value,
  onChange,
}: {
  model: CoverModel;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const field = model.fields[id];
  if (field.options) {
    return (
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} aria-label={field.hint}>
        <option value="">— elegir —</option>
        {field.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (field.multiline) {
    return (
      <textarea
        className={`${inputClass} mt-1 block w-full`}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={field.section}
      />
    );
  }
  return (
    <input
      className={`${inputClass} mx-1 inline-block w-56 max-w-full`}
      value={value}
      placeholder={field.hint}
      onChange={(e) => onChange(e.target.value)}
      aria-label={field.hint || field.section}
    />
  );
}

function Segments({
  model,
  segments,
  values,
  setField,
}: {
  model: CoverModel;
  segments: Segment[];
  values: CoverValues;
  setField: (id: string, value: string) => void;
}) {
  return (
    <>
      {segments.map((s, i) =>
        s.kind === "text" ? (
          // Quita la sintaxis de Markdown más habitual para mostrar el texto limpio.
          <span key={i}>{s.text.replace(/\*\*?|^\|\s*|\s*\|$/g, "").replace(/\s*\|\s*/g, " · ")}</span>
        ) : s.kind === "instruction" ? (
          <span key={i} className="text-xs italic text-foreground/50">
            [{s.text}]
          </span>
        ) : (
          <FieldInput key={i} model={model} id={s.id} value={values.fields[s.id] ?? ""} onChange={(v) => setField(s.id, v)} />
        ),
      )}
    </>
  );
}

function FormLine({
  line,
  model,
  values,
  setField,
  setCheck,
}: {
  line: Line;
  model: CoverModel;
  values: CoverValues;
  setField: (id: string, value: string) => void;
  setCheck: (id: string, checked: boolean) => void;
}) {
  switch (line.kind) {
    case "heading":
      if (line.level <= 1) return null;
      return line.level === 2 ? (
        <h2 className="mt-8 border-b border-black/10 pb-1 text-lg font-semibold dark:border-white/15">{line.title}</h2>
      ) : (
        <h3 className={line.level === 3 ? "mt-6 font-semibold" : "mt-4 text-sm font-semibold"}>{line.title}</h3>
      );
    case "label":
      return <p className="text-xs text-foreground/60">{line.text}</p>;
    case "note":
      return <p className="rounded bg-black/[.03] px-2 py-1 text-xs text-foreground/60 dark:bg-white/[.05]">{line.text}</p>;
    case "text":
      if (!line.segments.some((s) => s.kind === "field")) {
        return <p className="text-sm text-foreground/80">{line.raw.replace(/\*\*?/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")}</p>;
      }
      return (
        <p className="text-sm leading-8">
          <Segments model={model} segments={line.segments} values={values} setField={setField} />
        </p>
      );
    case "checkbox":
      return (
        <label className="flex items-start gap-2 text-sm leading-8" style={{ marginLeft: `${line.indent * 0.75}rem` }}>
          <input
            type="checkbox"
            className="mt-2.5"
            checked={values.checks[line.id] ?? false}
            onChange={(e) => setCheck(line.id, e.target.checked)}
          />
          <span>
            <Segments model={model} segments={line.segments} values={values} setField={setField} />
          </span>
        </label>
      );
    default:
      return null;
  }
}

export function CoverForm({ title, slug, cover, standardTerms, language, addOn }: Props) {
  const model = useMemo(() => parseCover(cover, language), [cover, language]);
  const { values, setValues, saved, clear } = useDraft<CoverValues>(draftKey(slug, language), () =>
    initialValues(model),
  );
  const [tab, setTab] = useState<"cover" | "terms" | "addOn">("cover");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (id: string, value: string) =>
    setValues((v) => ({ ...v, fields: { ...v.fields, [id]: value } }));
  const setCheck = (id: string, checked: boolean) =>
    setValues((v) => ({ ...v, checks: { ...v.checks, [id]: checked } }));
  const setParty = (role: string, key: keyof Party, value: string) =>
    setValues((v) => ({ ...v, parties: { ...v.parties, [role]: { ...v.parties[role], [key]: value } } }));

  const withAddOn = Boolean(addOn && values.checks[variantCheck(addOn.variant)]);
  const documentTitle = withAddOn ? `${title} + ${addOn!.title}` : title;
  const activeTab = tab === "addOn" && !withAddOn ? "cover" : tab;

  const filledCover = useMemo(() => fillCover(model, values), [model, values]);
  const valueOf = useMemo(() => coverFieldValue(model, values), [model, values]);
  const filledTerms = useMemo(
    () => fillStandardTermsFromCover(standardTerms, valueOf, language),
    [standardTerms, valueOf, language],
  );
  const filledAddOnTerms = useMemo(
    () => (addOn ? fillStandardTermsFromCover(addOn.standardTerms, valueOf, language) : ""),
    [addOn, valueOf, language],
  );
  const missing = missingFields(model, values);

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const { renderCoverPdf } = await import("@/lib/pdf/cover-pdf");
      const blob = await renderCoverPdf({
        title: documentTitle,
        cover: filledCover,
        standardTerms: withAddOn ? [standardTerms, addOn!.standardTerms] : [standardTerms],
        language,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = withAddOn ? `${slug}-${addOn!.variant}.pdf` : `${slug}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("No se ha podido generar el PDF. Vuelve a intentarlo.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
        <DraftNotice saved={saved} onClear={clear} />

        {addOn && (
          <label className="flex items-start gap-3 rounded-lg border border-black/10 p-4 text-sm dark:border-white/15">
            <input
              type="checkbox"
              className="mt-1"
              checked={withAddOn}
              onChange={(e) => setCheck(variantCheck(addOn.variant), e.target.checked)}
            />
            <span>
              <span className="font-medium">Incluir el {addOn.title}</span>
              <span className="block text-xs text-foreground/60">
                Sustituye la fila del SLA del pedido por la del {addOn.title} de Common Paper. Sus datos
                (objetivos, créditos, periodo de suscripción…) se toman de esta Portada, y el PDF añade sus
                Términos Estándar.
              </span>
            </span>
          </label>
        )}

        <fieldset className="space-y-3 rounded-lg border border-black/10 p-4 dark:border-white/15">
          <legend className="px-1 text-sm font-semibold">Partes</legend>
          {model.roles.map((role) => (
            <div key={role} className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["company", `${role}: denominación social`],
                  ["name", "Nombre de quien firma"],
                  ["title", "Cargo"],
                  ["address", "Dirección para Notificaciones"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs">
                  <span className="font-medium">{label}</span>
                  <input
                    className={`${inputClass} mt-1 block w-full`}
                    value={values.parties[role]?.[key] ?? ""}
                    onChange={(e) => setParty(role, key, e.target.value)}
                  />
                </label>
              ))}
            </div>
          ))}
        </fieldset>

        {model.lines.map((line, i) =>
          lineActive(line, values) ? (
            <FormLine key={i} line={line} model={model} values={values} setField={setField} setCheck={setCheck} />
          ) : null,
        )}

        <div className="space-y-3 border-t border-black/10 pt-6 dark:border-white/15">
          {missing.length > 0 && (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Faltan datos en: {missing.join(", ")}. Puedes descargar el PDF igualmente; esos datos aparecerán
              marcados como pendientes.
            </p>
          )}
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {downloading ? "Generando PDF…" : "Descargar PDF"}
          </button>
          {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}
        </div>
      </form>

      <section aria-label="Vista previa" className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <div className="mb-4 flex flex-wrap gap-2 text-sm" role="tablist">
          {(
            [
              ["cover", "Portada"],
              ["terms", withAddOn ? `Términos Estándar: ${title}` : "Términos Estándar"],
              ...(withAddOn ? [["addOn", `Términos Estándar: ${addOn!.title}`] as const] : []),
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setTab(key)}
              className={`rounded-md px-3 py-1.5 ${activeTab === key ? "bg-foreground text-background" : "border border-black/15 dark:border-white/20"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <article className="prose prose-sm max-w-none rounded-lg border border-black/10 p-6 dark:prose-invert dark:border-white/15">
          {/* Los valores del usuario se escapan en fillCover y fillStandardTermsFromCover. */}
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {activeTab === "cover" ? filledCover : activeTab === "terms" ? filledTerms : filledAddOnTerms}
          </ReactMarkdown>
        </article>
      </section>
    </div>
  );
}
