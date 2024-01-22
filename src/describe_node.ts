import type { ValueNode } from "./value_node.ts";
import { commentOut, indentText, makeCyan, makeRed } from "./format.js";
import { valueToNode } from "./value_to_node.js";

/**
 * Returns a formatted string describing the actual value and the possible
 * mismatches.
 * Tries to return valid Javascript code, although it's not always possible.
 */
export function describeNode(
  node: ValueNode,
  maybeComma: "" | "," = "",
): string {
  switch (node.kind) {
    case "simple": {
      const { mismatch } = node;
      if (mismatch) {
        const { expected } = mismatch;
        const explanation = makeCyan(commentOut(`^ expected to ${expected}`));
        return `${makeRed(node.description)}${maybeComma}\n${explanation}`;
      } else {
        return `${node.description}${maybeComma}`;
      }
    }
    case "array": {
      const { items } = node;
      if (!items.length) {
        return `[]${maybeComma}`;
      }
      const contents = items
        .map((item) => {
          switch (item.kind) {
            case "present":
              return describeNode(item.node, ",");
            case "extra":
              return (
                `${makeRed(item.description)},\n` +
                makeCyan(commentOut(item.explanation))
              );
            case "missing":
              return makeRed(commentOut(item.explanation));
          }
        })
        .map((e) => `${indentText(e)}\n`)
        .join("");
      return `[\n${contents}]${maybeComma}`;
    }
    case "object": {
      const entries = Object.entries(node.record);
      if (!entries.length) {
        return `{}${maybeComma}`;
      }
      const contents = entries
        .map((e) => {
          const property = describeProperty(e[0]);
          return `${property}: ${describeNode(e[1], ",")}`;
        })
        .map((e) => `${indentText(e)}\n`)
        .join("");
      return `{\n${contents}}${maybeComma}`;
    }
    case "...": {
      return `...${maybeComma}`;
    }
  }
}

export function describeValue(value: unknown) {
  return describeNode(valueToNode(value));
}

/** Returns a possibly-quoted description of the given property. */
export function describeProperty(property: unknown) {
  return typeof property === "string" &&
    /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(property)
    ? property
    : JSON.stringify(property);
}
