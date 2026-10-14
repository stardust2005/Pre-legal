// PDF genérico (modelo C): Portada rellenada + Términos Estándar sin modificar.
// Se importa de forma dinámica desde el cliente, como mutual-nda-pdf.
import { Document, Page, Text, pdf } from "@react-pdf/renderer";
import { MarkdownPdf } from "./markdown-pdf";
import { styles } from "./styles";

type Props = {
  title: string;
  cover: string;
  standardTerms: string;
};

function Footer({ title }: { title: string }) {
  return (
    <Text style={styles.footer} fixed>
      {title} · Common Paper · CC BY 4.0 · Traducción no oficial de Pre-Legal
    </Text>
  );
}

function CoverDocument({ title, cover, standardTerms }: Props) {
  return (
    <Document title={title} author="Pre-Legal" language="es">
      <Page size="A4" style={styles.page}>
        <MarkdownPdf markdown={cover} />
        <Footer title={title} />
      </Page>
      <Page size="A4" style={styles.page}>
        <MarkdownPdf markdown={standardTerms} />
        <Footer title={title} />
      </Page>
    </Document>
  );
}

export async function renderCoverPdf(props: Props): Promise<Blob> {
  return pdf(<CoverDocument {...props} />).toBlob();
}
