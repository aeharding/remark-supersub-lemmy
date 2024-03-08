/**
 * Subscript and Superscript plugin for Remark.
 */
import { visit } from "unist-util-visit";
import { Transformer } from "unified";
import type { Node, Parent } from "unist";
import type { Text } from "mdast";

const SUPERSCRIPT_REGEX = /\^([^^ ]+)\^/g;
const SUBSCRIPT_REGEX = /~([^~ ]+)~/g;

function handleSuperSub(
  node: Text,
  regex: RegExp,
  nodeName: "superscript" | "subscript",
  hName: string,
): Node[] {
  const { value } = node;
  let match;
  let lastIndex = 0;
  const children: Node[] = [];

  while ((match = regex.exec(value)) !== null) {
    const [fullMatch, text] = match;
    const index = match.index;

    const textNode: Text = {
      type: "text",
      value: value.substring(lastIndex, index),
    };

    // Add the preceding text as a text node
    children.push(textNode);

    const intermediateTextNode = {
      type: "text",
      value: text,
    };

    // Add the superscript/subscript node
    children.push({
      type: nodeName,
      data: {
        hName,
      },
      children: [intermediateTextNode],
    } as Parent);

    lastIndex = index + fullMatch.length;
  }

  const lastTextNode: Text = {
    type: "text",
    value: value.substring(lastIndex),
  };

  // Add the remaining text as a text node
  children.push(lastTextNode);

  return children;
}

export default function supersub(): Transformer {
  return (tree) => {
    // Superscript
    visit(tree, ["text"], (node, i, parent: Parent) => {
      if (node.type !== "text") {
        return;
      }

      const children = handleSuperSub(
        node as Text,
        SUPERSCRIPT_REGEX,
        "superscript",
        "sup",
      );
      parent!.children.splice(i!, 1, ...children);
    });

    // Subscript
    visit(tree, ["text"], (node, i, parent: Parent) => {
      if (node.type !== "text") {
        return;
      }

      const children = handleSuperSub(
        node as Text,
        SUBSCRIPT_REGEX,
        "subscript",
        "sub",
      );
      parent!.children.splice(i!, 1, ...children);
    });
  };
}
