// Pinta en @react-pdf/renderer el markdown de las plantillas sin modificar su texto.
// Cubre lo que usan las plantillas y portadas de Common Paper: títulos, párrafos,
// listas numeradas anidadas, casillas (GFM), tablas (GFM), negrita, cursiva,
// enlaces, citas, separadores y los <span> de campos, cuyas etiquetas se
// descartan y se conserva el texto.
import { Link, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { Content, PhrasingContent, Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { styles } from "./styles";

export function parseMarkdown(markdown: string): Root {
  const processor = unified().use(remarkParse).use(remarkGfm);
  // Los títulos de cláusula (<span class="header_2|3">) se pintan en negrita, como en la web;
  // el texto no cambia.
  const source = markdown.replace(/<span class="header_\d"[^>]*>([^<]+)<\/span>/g, "**$1**");
  return processor.runSync(processor.parse(source)) as Root;
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
      case "delete":
        return inline(node.children, key);
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
              <Text style={item.checked == null ? styles.listMarker : styles.checkbox}>
                {item.checked === true
                  ? "[X]"
                  : item.checked === false
                    ? "[  ]"
                    : node.ordered
                      ? `${(node.start ?? 1) + i}.`
                      : "•"}
              </Text>
              <View style={styles.listBody}>
                {item.children.map((child, j) => block(child, `${key}-${i}-${j}`, depth + 1))}
              </View>
            </View>
          ))}
        </View>
      );
    case "table":
      return (
        <View key={key} style={styles.table} wrap={false}>
          {node.children.map((row, i) => (
            <View key={`${key}-${i}`} style={i === node.children.length - 1 ? styles.lastRow : styles.row}>
              {row.children.map((cell, j) => (
                <Text
                  key={`${key}-${i}-${j}`}
                  style={[j === 0 ? styles.cellLabel : styles.cell, { width: `${100 / row.children.length}%` }, i === 0 ? styles.bold : {}]}
                >
                  {inline(cell.children, `${key}-${i}-${j}`)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    case "thematicBreak":
      return <View key={key} style={styles.rule} />;
    default:
      return null;
  }
}

export function MarkdownPdf({ markdown }: { markdown: string }) {
  const tree = parseMarkdown(markdown);
  return <>{tree.children.map((node, i) => block(node, `b${i}`))}</>;
}
