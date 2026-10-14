// PDF del Mutual NDA (modelo C): Portada rellenada + Términos Estándar sin modificar.
// Se importa de forma dinámica desde el cliente para no cargar @react-pdf/renderer
// hasta que el usuario pide la descarga.
import { Document, Link, Page, Text, View, pdf } from "@react-pdf/renderer";
import {
  type MutualNdaValues,
  type Party,
  describeConfidentialityTerm,
  describeMndaTerm,
  formatDate,
} from "@/lib/forms/mutual-nda";
import { MarkdownPdf } from "./markdown-pdf";
import { styles } from "./styles";

const STANDARD_TERMS_URL = "https://commonpaper.com/standards/mutual-nda/1.0";

function Value({ value, field }: { value: string; field: string }) {
  return value.trim() ? (
    <Text style={styles.value}>{value}</Text>
  ) : (
    <Text style={[styles.value, styles.pending]}>[Pendiente: {field}]</Text>
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

function Footer() {
  return (
    <Text style={styles.footer} fixed>
      Common Paper Mutual NDA 1.0 · CC BY 4.0 · Traducción no oficial de Pre-Legal
    </Text>
  );
}

const ROWS: { label: string; key?: keyof Party }[] = [
  { label: "Firma" },
  { label: "Nombre", key: "name" },
  { label: "Cargo", key: "title" },
  { label: "Empresa", key: "company" },
  { label: "Dirección para Notificaciones", key: "noticeAddress" },
  { label: "Fecha" },
];

function SignatureTable({ values }: { values: MutualNdaValues }) {
  return (
    <View style={styles.table}>
      <View style={styles.row}>
        <Text style={styles.cellLabel} />
        <Text style={[styles.cell, styles.bold]}>PARTE 1</Text>
        <Text style={[styles.cell, styles.bold]}>PARTE 2</Text>
      </View>
      {ROWS.map(({ label, key }, i) => (
        <View key={label} style={i === ROWS.length - 1 ? styles.lastRow : styles.row}>
          <Text style={styles.cellLabel}>{label}</Text>
          {[values.party1, values.party2].map((party, j) => (
            <Text key={j} style={styles.cell}>
              {key ? party[key] : ""}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function CoverPage({ values }: { values: MutualNdaValues }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Acuerdo Mutuo de Confidencialidad</Text>
      <View style={styles.note}>
        <Text>
          Traducción no oficial al español de la Portada del Mutual Non-Disclosure Agreement de Common Paper,
          realizada por Pre-Legal. El original está redactado para el derecho de los Estados Unidos y esta
          traducción no lo adapta al derecho español. Revisa el documento con un profesional antes de firmarlo.
        </Text>
      </View>

      <Text style={styles.h2}>CÓMO UTILIZAR ESTE ACUERDO MUTUO DE CONFIDENCIALIDAD</Text>
      <Text style={styles.paragraph}>
        Este Acuerdo Mutuo de Confidencialidad (el «MNDA», por sus siglas en inglés) se compone de: (1) esta
        Portada («Portada») y (2) los Términos Estándar del Mutual NDA de Common Paper, versión 1.0 («Términos
        Estándar»), idénticos a los publicados en{" "}
        <Link src={STANDARD_TERMS_URL} style={styles.link}>
          commonpaper.com/standards/mutual-nda/1.0
        </Link>
        . Cualquier modificación de los Términos Estándar debe hacerse en la Portada, que prevalecerá en caso de
        conflicto con los Términos Estándar. Se adjunta a continuación una traducción no oficial de los Términos
        Estándar.
      </Text>

      <Text style={styles.sectionLabel}>Finalidad</Text>
      <Text style={styles.help}>Cómo puede utilizarse la Información Confidencial</Text>
      <Value value={values.purpose} field="Finalidad" />

      <Text style={styles.sectionLabel}>Fecha de Entrada en Vigor</Text>
      <Value value={formatDate(values.effectiveDate)} field="Fecha de Entrada en Vigor" />

      <Text style={styles.sectionLabel}>Duración del MNDA</Text>
      <Text style={styles.help}>La duración de este MNDA</Text>
      <Option checked={values.mndaTerm.kind === "years"}>
        {values.mndaTerm.kind === "years"
          ? describeMndaTerm(values.mndaTerm) + "."
          : "Vence [__ año(s)] después de la Fecha de Entrada en Vigor."}
      </Option>
      <Option checked={values.mndaTerm.kind === "untilTerminated"}>
        {describeMndaTerm({ kind: "untilTerminated", years: 0 }) + "."}
      </Option>

      <Text style={styles.sectionLabel}>Plazo de Confidencialidad</Text>
      <Text style={styles.help}>Durante cuánto tiempo se protege la Información Confidencial</Text>
      <Option checked={values.confidentialityTerm.kind === "years"}>
        {values.confidentialityTerm.kind === "years"
          ? describeConfidentialityTerm(values.confidentialityTerm) + "."
          : "[__ año(s)] desde la Fecha de Entrada en Vigor, pero, en el caso de los secretos empresariales, hasta que la Información Confidencial deje de considerarse secreto empresarial según las leyes aplicables."}
      </Option>
      <Option checked={values.confidentialityTerm.kind === "perpetual"}>A perpetuidad.</Option>

      <Text style={styles.sectionLabel}>Ley Aplicable y Jurisdicción</Text>
      <Text style={styles.help}>Ley Aplicable (estado)</Text>
      <Value value={values.governingLaw} field="Ley Aplicable" />
      <Text style={styles.help}>Jurisdicción (ciudad o condado y estado)</Text>
      <Value value={values.jurisdiction} field="Jurisdicción" />

      <Text style={styles.sectionLabel}>Modificaciones del MNDA</Text>
      <Text style={styles.value}>{values.modifications.trim() || "Ninguna."}</Text>

      {/* La aceptación, las firmas y la atribución van juntas para no separarse entre páginas. */}
      <View wrap={false}>
        <Text style={[styles.paragraph, { marginTop: 12 }]}>
          Al firmar esta Portada, cada parte acepta celebrar este MNDA con efectos desde la Fecha de Entrada
          en Vigor.
        </Text>
        <SignatureTable values={values} />
        <Text style={[styles.help, { marginTop: 12 }]}>
          Common Paper Mutual Non-Disclosure Agreement (Versión 1.0), de uso libre bajo CC BY 4.0
          (https://creativecommons.org/licenses/by/4.0/). Traducción al español realizada por Pre-Legal: el
          texto ha sido modificado respecto al original.
        </Text>
      </View>
      <Footer />
    </Page>
  );
}

function MutualNdaDocument({ values, standardTerms }: { values: MutualNdaValues; standardTerms: string }) {
  return (
    <Document title="Acuerdo Mutuo de Confidencialidad" author="Pre-Legal" language="es">
      <CoverPage values={values} />
      <Page size="A4" style={styles.page}>
        <MarkdownPdf markdown={standardTerms} />
        <Footer />
      </Page>
    </Document>
  );
}

export async function renderMutualNdaPdf(values: MutualNdaValues, standardTerms: string): Promise<Blob> {
  return pdf(<MutualNdaDocument values={values} standardTerms={standardTerms} />).toBlob();
}
