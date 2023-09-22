import { describeValue } from "../describe_node.js";
import { indentText } from "../format.js";
import { Matcher, MATCHES } from "../matcher.js";
import { ArrayNode, ValueNode } from "../value_node.js";

export class MapMatcher<K, V> extends Matcher<ReadonlyMap<K, V>> {
  constructor(private readonly expectedEntries: ReadonlyMap<K, Matcher<V>>) {
    super();
  }

  [MATCHES](input: ReadonlyMap<K, V>): ValueNode {
    const { expectedEntries } = this;
    const outItems: ArrayNode.Item[] = [];
    for (const actualEntry of input.entries()) {
      const [key, actualValue] = actualEntry;
      if (expectedEntries.has(key)) {
        const expectedMatcher = expectedEntries.get(key)!;
        outItems.push({
          kind: "present",
          node: expectedMatcher[MATCHES](actualValue),
        });
      } else {
        outItems.push({
          kind: "extra",
          description: describeValue(actualEntry),
          explanation: "^ unexpected entry",
        });
      }
    }
    // Missing keys.
    for (const expectedEntry of expectedEntries) {
      const key = expectedEntry[0];
      if (expectedEntries.has(key)) {
        continue;
      }
      const description = describeValue(key);
      outItems.push({
        kind: "missing",
        explanation: `Missing key:\n${indentText(description)}`,
      });
    }
    return {
      kind: "array",
      items: outItems,
    };
  }

  toString(): string {
    return describeValue(this.expectedEntries);
  }
}
