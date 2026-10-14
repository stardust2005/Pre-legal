// Pinta en @react-pdf/renderer el markdown de las plantillas sin modificar su texto.
// Cubre lo que usan las plantillas de Common Paper: títulos, párrafos, listas
// numeradas anidadas, negrita, cursiva, enlaces, citas y los <span> de campos,
// cuyas etiquetas se descartan y se conserva el texto.
import { Link, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { Content, PhrasingContent, Root } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { styles } from "./styles";

export function parseMarkdown(markdown: string): Root {
  return unified().use(remarkParse).parse(markdown);
}

function inline(nodes: PhrasingContent[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (node.type) {
      case "text":
        return node.value;
      case "strong":
        return (
          <Text key={key} style={styles.bold}>
            {inline(node.children, key)}
          </Text>
        );
      case "emphasis":
        return (
          <Text key={key} style={styles.italic}>
            {inline(node.children, key)}
          </Text>
        );
      case "link":
        return (
          <Link key={key} src={node.url} style={styles.link}>
            {inline(node.children, key)}
          </Link>
        );
      case "inlineCode":
        return node.value;
      case "break":
        return "\n";
      // Etiquetas <span>/<label> sueltas: el texto que envuelven llega como nodos "text".
      case "html":
        return null;
      default:
        return null;
    }
  });
}

function block(node: Content, key: string, depth = 0): ReactNode {
  switch (node.type) {
    case "heading":
      return (
        <Text key={key} style={node.depth === 1 ? styles.h1 : node.depth === 2 ? styles.h2 : styles.h3}>
          {inline(node.children, key)}
        </Text>
      );
    case "paragraph":
      return (
        <Text key={key} style={styles.paragraph}>
          {inline(node.children, key)}
        </Text>
      );
    case "blockquote":
      return (
        <View key={key} style={styles.note}>
          {node.children.map((child, i) => block(child, `${key}-${i}`, depth))}
        </View>
      );
    case "list":
      return (
        <View key={key} style={depth > 0 ? styles.nestedList : undefined}>
          {node.children.map((item, i) => (
            <View key={`${key}-${i}`} style={styles.listItem} wrap>
              <Text style={styles.listMarker}>
                {node.ordered ? `${(node.start ?? 1) + i}.` : "•"}
              </Text>
              <View style={styles.listBody}>
                {item.children.map((child, j) => block(child, `${key}-${i}-${j}`, depth + 1))}
              </View>
            </View>
          ))}
        </View>
      );
    case "html":
      return null;
    default:
      return null;
  }
}

export function MarkdownPdf({ markdown }: { markdown: string }) {
  const tree = parseMarkdown(markdown);
  return <>{tree.children.map((node, i) => block(node, `b${i}`))}</>;
}
