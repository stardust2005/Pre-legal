// PDF del Mutual NDA (modelo C): Portada rellenada + Términos Estándar sin modificar.
// Se importa de forma dinámica desde el cliente para no cargar @react-pdf/renderer
// hasta que el usuario pide la descarga.
import { Document, Link, Page, Text, View, pdf } from "@react-pdf/renderer";
import type { Language } from "@/lib/document-language";
import {
  FIELD_NAMES,
  type MutualNdaValues,
  type Party,
  describeConfidentialityTerm,
  describeMndaTerm,
  formatDate,
} from "@/lib/forms/mutual-nda";
import { MarkdownPdf } from "./markdown-pdf";
import { styles } from "./styles";

const STANDARD_TERMS_URL = "https://commonpaper.com/standards/mutual-nda/1.0";

// Textos de la Portada en cada idioma: el original de Common Paper
// (Templates/Mutual-NDA-coverpage.md) y su traducción (Templates/es/Mutual-NDA-coverpage.md).
const TEXT = {
  en: {
    title: "Mutual Non-Disclosure Agreement",
    footer: "Common Paper Mutual NDA 1.0 · CC BY 4.0",
    translationNote: undefined,
    usingHeading: "USING THIS MUTUAL NON-DISCLOSURE AGREEMENT",
    usingBefore:
      "This Mutual Non-Disclosure Agreement (the “MNDA”) consists of: (1) this Cover Page (“Cover Page”) and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 (“Standard Terms”) identical to those posted at ",
    usingAfter:
      ". Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.",
    pending: "Pending",
    purposeHelp: "How Confidential Information may be used",
    mndaTermHelp: "The length of this MNDA",
    mndaTermBlank: "Expires [__ year(s)] from Effective Date.",
    confidentialityHelp: "How long Confidential Information is protected",
    confidentialityBlank:
      "[__ year(s)] from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.",
    lawHeading: "Governing Law & Jurisdiction",
    lawHelp: "Governing Law (state)",
    jurisdictionHelp: "Jurisdiction (city or county and state)",
    modificationsHeading: "MNDA Modifications",
    noModifications: "None.",
    signing: "By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.",
    parties: ["PARTY 1", "PARTY 2"],
    rows: ["Signature", "Print Name", "Title", "Company", "Notice Address", "Date"],
    attribution:
      "Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).",
  },
  es: {
    title: "Acuerdo Mutuo de Confidencialidad",
    footer: "Common Paper Mutual NDA 1.0 · CC BY 4.0 · Traducción no oficial de Pre-Legal",
    translationNote:
      "Traducción no oficial al español de la Portada del Mutual Non-Disclosure Agreement de Common Paper, realizada por Pre-Legal. El original está redactado para el derecho de los Estados Unidos y esta traducción no lo adapta al derecho español. Revisa el documento con un profesional antes de firmarlo.",
    usingHeading: "CÓMO UTILIZAR ESTE ACUERDO MUTUO DE CONFIDENCIALIDAD",
    usingBefore:
      "Este Acuerdo Mutuo de Confidencialidad (el «MNDA», por sus siglas en inglés) se compone de: (1) esta Portada («Portada») y (2) los Términos Estándar del Mutual NDA de Common Paper, versión 1.0 («Términos Estándar»), idénticos a los publicados en ",
    usingAfter:
      ". Cualquier modificación de los Términos Estándar debe hacerse en la Portada, que prevalecerá en caso de conflicto con los Términos Estándar. Se adjunta a continuación una traducción no oficial de los Términos Estándar.",
    pending: "Pendiente",
    purposeHelp: "Cómo puede utilizarse la Información Confidencial",
    mndaTermHelp: "La duración de este MNDA",
    mndaTermBlank: "Vence [__ año(s)] después de la Fecha de Entrada en Vigor.",
    confidentialityHelp: "Durante cuánto tiempo se protege la Información Confidencial",
    confidentialityBlank:
      "[__ año(s)] desde la Fecha de Entrada en Vigor, pero, en el caso de los secretos empresariales, hasta que la Información Confidencial deje de considerarse secreto empresarial según las leyes aplicables.",
    lawHeading: "Ley Aplicable y Jurisdicción",
    lawHelp: "Ley Aplicable (estado)",
    jurisdictionHelp: "Jurisdicción (ciudad o condado y estado)",
    modificationsHeading: "Modificaciones del MNDA",
    noModifications: "Ninguna.",
    signing:
      "Al firmar esta Portada, cada parte acepta celebrar este MNDA con efectos desde la Fecha de Entrada en Vigor.",
    parties: ["PARTE 1", "PARTE 2"],
    rows: ["Firma", "Nombre", "Cargo", "Empresa", "Dirección para Notificaciones", "Fecha"],
    attribution:
      "Common Paper Mutual Non-Disclosure Agreement (Versión 1.0), de uso libre bajo CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Traducción al español realizada por Pre-Legal: el texto ha sido modificado respecto al original.",
  },
} satisfies Record<Language, unknown>;

// Dato de cada fila de la tabla de firmas, en el orden de TEXT[language].rows.
const ROW_KEYS: (keyof Party | undefined)[] = [undefined, "name", "title", "company", "noticeAddress", undefined];

function Value({ value, field, pending }: { value: string; field: string; pending: string }) {
  return value.trim() ? (
    <Text style={styles.value}>{value}</Text>
  ) : (
    <Text style={[styles.value, styles.pending]}>
      [{pending}: {field}]
    </Text>
  );
}

function Option({ checked, children }: { checked: boolean; children: string }) {
  return (
    <View style={styles.option}>
      <Text style={styles.checkbox}>{checked ? "[X]" : "[  ]"}</Text>
      <Text style={{ flex: 1 }}>{children}</Text>
    </View>
  );
}

function Footer({ language }: { language: Language }) {
  return (
    <Text style={styles.footer} fixed>
      {TEXT[language].footer}
    </Text>
  );
}

function SignatureTable({ values, language }: { values: MutualNdaValues; language: Language }) {
  const t = TEXT[language];
  return (
    <View style={styles.table}>
      <View style={styles.row}>
        <Text style={styles.cellLabel} />
        {t.parties.map((party) => (
          <Text key={party} style={[styles.cell, styles.bold]}>
            {party}
          </Text>
        ))}
      </View>
      {t.rows.map((label, i) => (
        <View key={label} style={i === t.rows.length - 1 ? styles.lastRow : styles.row}>
          <Text style={styles.cellLabel}>{label}</Text>
          {[values.party1, values.party2].map((party, j) => (
            <Text key={j} style={styles.cell}>
              {ROW_KEYS[i] ? party[ROW_KEYS[i]] : ""}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function CoverPage({ values, language }: { values: MutualNdaValues; language: Language }) {
  const t = TEXT[language];
  const names = FIELD_NAMES[language];
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>{t.title}</Text>
      {t.translationNote && (
        <View style={styles.note}>
          <Text>{t.translationNote}</Text>
        </View>
      )}

      <Text style={styles.h2}>{t.usingHeading}</Text>
      <Text style={styles.paragraph}>
        {t.usingBefore}
        <Link src={STANDARD_TERMS_URL} style={styles.link}>
          commonpaper.com/standards/mutual-nda/1.0
        </Link>
        {t.usingAfter}
      </Text>

      <Text style={styles.sectionLabel}>{names.purpose}</Text>
      <Text style={styles.help}>{t.purposeHelp}</Text>
      <Value value={values.purpose} field={names.purpose} pending={t.pending} />

      <Text style={styles.sectionLabel}>{names.effectiveDate}</Text>
      <Value value={formatDate(values.effectiveDate, language)} field={names.effectiveDate} pending={t.pending} />

      <Text style={styles.sectionLabel}>{names.mndaTerm}</Text>
      <Text style={styles.help}>{t.mndaTermHelp}</Text>
      <Option checked={values.mndaTerm.kind === "years"}>
        {values.mndaTerm.kind === "years" ? describeMndaTerm(values.mndaTerm, language) + "." : t.mndaTermBlank}
      </Option>
      <Option checked={values.mndaTerm.kind === "untilTerminated"}>
        {describeMndaTerm({ kind: "untilTerminated", years: 0 }, language) + "."}
      </Option>

      <Text style={styles.sectionLabel}>{names.confidentialityTerm}</Text>
      <Text style={styles.help}>{t.confidentialityHelp}</Text>
      <Option checked={values.confidentialityTerm.kind === "years"}>
        {values.confidentialityTerm.kind === "years"
          ? describeConfidentialityTerm(values.confidentialityTerm, language) + "."
          : t.confidentialityBlank}
      </Option>
      <Option checked={values.confidentialityTerm.kind === "perpetual"}>
        {describeConfidentialityTerm({ kind: "perpetual", years: 0 }, language) + "."}
      </Option>

      <Text style={styles.sectionLabel}>{t.lawHeading}</Text>
      <Text style={styles.help}>{t.lawHelp}</Text>
      <Value value={values.governingLaw} field={names.governingLaw} pending={t.pending} />
      <Text style={styles.help}>{t.jurisdictionHelp}</Text>
      <Value value={values.jurisdiction} field={names.jurisdiction} pending={t.pending} />

      <Text style={styles.sectionLabel}>{t.modificationsHeading}</Text>
      <Text style={styles.value}>{values.modifications.trim() || t.noModifications}</Text>

      {/* La aceptación, las firmas y la atribución van juntas para no separarse entre páginas. */}
      <View wrap={false}>
        <Text style={[styles.paragraph, { marginTop: 12 }]}>{t.signing}</Text>
        <SignatureTable values={values} language={language} />
        <Text style={[styles.help, { marginTop: 12 }]}>{t.attribution}</Text>
      </View>
      <Footer language={language} />
    </Page>
  );
}

function MutualNdaDocument({
  values,
  standardTerms,
  language,
}: {
  values: MutualNdaValues;
  standardTerms: string;
  language: Language;
}) {
  return (
    <Document title={TEXT[language].title} author="Pre-Legal" language={language}>
      <CoverPage values={values} language={language} />
      <Page size="A4" style={styles.page}>
        <MarkdownPdf markdown={standardTerms} />
        <Footer language={language} />
      </Page>
    </Document>
  );
}

export async function renderMutualNdaPdf(
  values: MutualNdaValues,
  standardTerms: string,
  language: Language,
): Promise<Blob> {
  return pdf(<MutualNdaDocument values={values} standardTerms={standardTerms} language={language} />).toBlob();
}
