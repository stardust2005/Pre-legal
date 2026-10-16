"use client";

import { useMemo, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {
  type MutualNdaValues,
  type Party,
  defaultValues,
  fillStandardTerms,
  missingFields,
} from "@/lib/forms/mutual-nda";
import type { Language } from "@/lib/document-language";
import { draftKey, useDraft } from "@/lib/drafts";
import { DraftNotice } from "@/components/DraftNotice";

const inputClass =
  "mt-1 w-full rounded-md border border-black/15 bg-background px-3 py-2 text-sm focus:border-black/40 focus:outline-none dark:border-white/20 dark:focus:border-white/50";

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {help && <span className="block text-xs text-foreground/60">{help}</span>}
      {children}
    </label>
  );
}

function YearsOption({
  checked,
  onSelect,
  years,
  onYears,
  name,
  suffix,
}: {
  checked: boolean;
  onSelect: () => void;
  years: number;
  onYears: (years: number) => void;
  name: string;
  suffix: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="radio" name={name} checked={checked} onChange={onSelect} />
      <input
        type="number"
        min={1}
        max={50}
        value={years}
        onChange={(e) => onYears(Math.max(1, Number(e.target.value) || 1))}
        onFocus={onSelect}
        className="w-16 rounded-md border border-black/15 bg-background px-2 py-1 dark:border-white/20"
        aria-label={`Años (${name})`}
      />
      <span>{suffix}</span>
    </label>
  );
}

function PartyFields({
  label,
  party,
  onChange,
}: {
  label: string;
  party: Party;
  onChange: (party: Party) => void;
}) {
  const set = (key: keyof Party) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...party, [key]: e.target.value });
  return (
    <fieldset className="space-y-3 rounded-lg border border-black/10 p-4 dark:border-white/15">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <Field label="Empresa">
        <input className={inputClass} value={party.company} onChange={set("company")} />
      </Field>
      <Field label="Nombre de quien firma">
        <input className={inputClass} value={party.name} onChange={set("name")} />
      </Field>
      <Field label="Cargo">
        <input className={inputClass} value={party.title} onChange={set("title")} />
      </Field>
      <Field label="Dirección para Notificaciones" help="Correo electrónico o dirección postal">
        <input className={inputClass} value={party.noticeAddress} onChange={set("noticeAddress")} />
      </Field>
    </fieldset>
  );
}

export function MutualNdaForm({ standardTerms, language }: { standardTerms: string; language: Language }) {
  const { values, setValues, saved, clear } = useDraft<MutualNdaValues>(draftKey("mutual-nda", language), () =>
    defaultValues(language),
  );
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof MutualNdaValues>(key: K, value: MutualNdaValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const preview = useMemo(
    () => fillStandardTerms(standardTerms, values, language),
    [standardTerms, values, language],
  );
  const missing = missingFields(values, language);

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      // Carga diferida: @react-pdf/renderer solo se descarga al pedir el PDF.
      const { renderMutualNdaPdf } = await import("@/lib/pdf/mutual-nda-pdf");
      const blob = await renderMutualNdaPdf(values, standardTerms, language);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = language === "es" ? "acuerdo-mutuo-de-confidencialidad.pdf" : "mutual-nda.pdf";
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
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <DraftNotice saved={saved} onClear={clear} />

        <Field label="Finalidad" help="Cómo puede utilizarse la Información Confidencial">
          <textarea
            className={inputClass}
            rows={3}
            value={values.purpose}
            onChange={(e) => update("purpose", e.target.value)}
          />
        </Field>

        <Field label="Fecha de Entrada en Vigor">
          <input
            type="date"
            className={inputClass}
            value={values.effectiveDate}
            onChange={(e) => update("effectiveDate", e.target.value)}
          />
        </Field>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Duración del MNDA</legend>
          <YearsOption
            name="mndaTerm"
            checked={values.mndaTerm.kind === "years"}
            onSelect={() => update("mndaTerm", { ...values.mndaTerm, kind: "years" })}
            years={values.mndaTerm.years}
            onYears={(years) => update("mndaTerm", { kind: "years", years })}
            suffix="año(s) desde la Fecha de Entrada en Vigor"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="mndaTerm"
              checked={values.mndaTerm.kind === "untilTerminated"}
              onChange={() => update("mndaTerm", { ...values.mndaTerm, kind: "untilTerminated" })}
            />
            Continúa hasta que una de las partes lo termine
          </label>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Plazo de Confidencialidad</legend>
          <YearsOption
            name="confidentialityTerm"
            checked={values.confidentialityTerm.kind === "years"}
            onSelect={() => update("confidentialityTerm", { ...values.confidentialityTerm, kind: "years" })}
            years={values.confidentialityTerm.years}
            onYears={(years) => update("confidentialityTerm", { kind: "years", years })}
            suffix="año(s) (los secretos empresariales, mientras lo sigan siendo)"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="confidentialityTerm"
              checked={values.confidentialityTerm.kind === "perpetual"}
              onChange={() => update("confidentialityTerm", { ...values.confidentialityTerm, kind: "perpetual" })}
            />
            A perpetuidad
          </label>
        </fieldset>

        <Field label="Ley Aplicable" help="Estado cuyas leyes rigen el acuerdo, p. ej. «Delaware»">
          <input
            className={inputClass}
            value={values.governingLaw}
            onChange={(e) => update("governingLaw", e.target.value)}
          />
        </Field>

        <Field label="Jurisdicción" help="Ciudad o condado y estado, p. ej. «tribunales situados en New Castle, DE»">
          <input
            className={inputClass}
            value={values.jurisdiction}
            onChange={(e) => update("jurisdiction", e.target.value)}
          />
        </Field>

        <Field label="Modificaciones del MNDA" help="Opcional. Cambios a los Términos Estándar acordados por las partes">
          <textarea
            className={inputClass}
            rows={3}
            value={values.modifications}
            onChange={(e) => update("modifications", e.target.value)}
          />
        </Field>

        <PartyFields label="Parte 1" party={values.party1} onChange={(p) => update("party1", p)} />
        <PartyFields label="Parte 2" party={values.party2} onChange={(p) => update("party2", p)} />

        <div className="space-y-3 border-t border-black/10 pt-6 dark:border-white/15">
          {missing.length > 0 && (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Faltan por rellenar: {missing.join(", ")}. Puedes descargar el PDF igualmente; esos campos
              aparecerán marcados como pendientes.
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
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/60">
          Vista previa de los Términos Estándar
        </h2>
        <article className="prose prose-sm max-w-none rounded-lg border border-black/10 p-6 dark:prose-invert dark:border-white/15">
          {/* El markdown procede del dataset y los valores del usuario se escapan en fillStandardTerms. */}
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {preview}
          </ReactMarkdown>
        </article>
      </section>
    </div>
  );
}
