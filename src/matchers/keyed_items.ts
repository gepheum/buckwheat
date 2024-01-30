import { describeValue } from "../describe_node.js";
import { indentText } from "../format.js";
import { MATCHES, Matcher } from "../matcher.js";
import { valueOfUnexpectedTypeToNode } from "../unexpected_type.js";
import { ArrayNode, ValueNode } from "../value_node.js";

export class KeyedItemsMatcher<
  Item,
  KeyProperty extends keyof Item,
> extends Matcher<ReadonlyArray<Item>> {
  constructor(
    private readonly keyProperty: KeyProperty,
    private readonly expectedEntries: ReadonlyMap<unknown, Matcher<Item>>,
    private readonly toHashable: (item: Item[KeyProperty]) => unknown,
  ) {
    super();
  }

  [MATCHES](input: ReadonlyArray<Item> | Map<unknown, Item>): ValueNode {
    if (!Array.isArray(input)) {
      return valueOfUnexpectedTypeToNode(input, "array");
    }
    input = new Map(
      [...input.values()].map((e) => [this.toHashable(e[this.keyProperty]), e]),
    );
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
          description: describeValue(actualValue),
          explanation: "^ unexpected item",
        });
      }
    }
    // Missing keys.
    for (const expectedEntry of expectedEntries) {
      const key = expectedEntry[0];
      if (input.has(key)) {
        continue;
      }
      const description = describeValue(expectedEntry[1]);
      outItems.push({
        kind: "missing",
        explanation: `Missing item:\n${indentText(description)}`,
      });
    }
    return {
      kind: "array",
      items: outItems,
    };
  }

  toString(): string {
    return describeValue([...this.expectedEntries.values()]);
  }
}
