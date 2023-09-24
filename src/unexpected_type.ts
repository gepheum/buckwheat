import { describeNode } from "./describe_node.js";
import { SimpleNode } from "./value_node.js";
import { valueToNode } from "./value_to_node.js";

/**
 * Returns a simple node with an indication that the type of the actual value is
 * not the type expected by the matcher. Triggers a mismatch.
 */
export function valueOfUnexpectedTypeToNode(
  value: unknown,
  expectedType: "array" | "number" | "object" | "Date" | "Map" | "Set",
): SimpleNode {
  const description = describeNode(valueToNode(value));
  const expectedTypeName = typeof value === "object"
    ? Object.getPrototypeOf(value).constructor.name
    : typeof value;
  const actuallyIs = `actually is ${withArticle(expectedTypeName)}`;
  return {
    kind: "simple",
    description: description,
    mismatch: {
      expected: `be ${withArticle(expectedType)}, ${actuallyIs}`,
    },
  };
}

function withArticle(type: string) {
  return /^[ao]/.test(type) ? `an ${type}` : `a ${type}`;
}
