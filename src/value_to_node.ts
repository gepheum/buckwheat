import { ArrayNode, ObjectNode, SimpleNode, ValueNode } from "./value_node.js";

/**
 * When passing a value with this property to `valueToNode`, the function will
 * return a `SimpleNode` and the description is the result of calling
 * `toString()` on the object.
 */
export const REPRESENT_AS_SIMPLE_NODE: unique symbol = Symbol();

/**
 * Converts any value (or matcher) to a `ValueNode`. The
 * {@link SimpleNode#mismatch} is never populated in the returned tree, and
 * every item of every array is marked as present.
 * This function can be used to describe a value which does not have a matcher.
 */
export function valueToNode(
  value: unknown,
  inProcess = new Set<unknown>(),
): ValueNode {
  if (inProcess.has(value)) {
    // We have an object which references itself. Avoid infinite recursion.
    return { kind: "..." };
  }
  try {
    inProcess.add(value);
    if (Array.isArray(value)) {
      return arrayToNode(value, inProcess);
    } else if (value instanceof Set || value instanceof Map) {
      return arrayToNode([...value], inProcess);
    } else if (value instanceof Date) {
      return simpleNode(`Date.parse(${JSON.stringify(value.toISOString())})`);
    } else if (typeof value === "number") {
      if (Number.isNaN(value)) {
        return simpleNode("Number.NaN");
      } else if (value === Number.POSITIVE_INFINITY) {
        return simpleNode("Number.POSITIVE_INFINITY");
      } else if (value === Number.NEGATIVE_INFINITY) {
        return simpleNode("Number.NEGATIVE_INFINITY");
      } else {
        return simpleNode(JSON.stringify(value));
      }
    } else if (typeof value === "boolean") {
      return simpleNode(String(value));
    } else if (typeof value === "string") {
      const lines = value.split("\n");
      if (lines.length <= 1) {
        return simpleNode(JSON.stringify(value));
      } else {
        const contents = lines
          .map((l) => `  ${JSON.stringify(l)},\n`)
          .join("");
        return simpleNode(`[\n${contents}].join("\\n")`);
      }
    } else if (value instanceof RegExp) {
      return simpleNode(
        String(value).startsWith("/")
          ? String(value)
          // In some Javascript environments, calling toString() on a RegExp
          // obtained from the RegExpr constructor returns "RegExp {}".
          : `new RegExpr(${JSON.stringify(value.source)})`,
      );
    } else if (typeof value === "bigint") {
      return simpleNode(`BigInt(${JSON.stringify(String(value))})`);
    } else if (
      value instanceof Object && !(REPRESENT_AS_SIMPLE_NODE in value)
    ) {
      return objectToNode(value as Record<PropertyKey, unknown>, inProcess);
    } else {
      // Call #toString() on value.
      return simpleNode(String(value));
    }
  } finally {
    inProcess.delete(value);
  }
}

function arrayToNode(
  array: readonly unknown[],
  inProcess: Set<unknown>,
): ArrayNode {
  return {
    kind: "array",
    items: array.map((e) => {
      return {
        kind: "present",
        node: valueToNode(e, inProcess),
      };
    }),
  };
}

function objectToNode(
  object: Record<PropertyKey, unknown>,
  inProcess: Set<unknown>,
): ObjectNode {
  const nodeRecord: Record<PropertyKey, ValueNode> = {};
  for (const [propertyKey, value] of Object.entries(object)) {
    nodeRecord[propertyKey] = valueToNode(value, inProcess);
  }
  return {
    kind: "object",
    record: nodeRecord,
  };
}

function simpleNode(description: string): SimpleNode {
  return {
    kind: "simple",
    description: description,
  };
}
