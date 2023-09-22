import { describeValue } from "../describe_node.js";
import { indentText } from "../format.js";
import { Matcher, MATCHES } from "../matcher.js";
import { ArrayNode, ValueNode } from "../value_node.js";

export class ArrayMatcher<Item> extends Matcher<Array<Item>> {
  constructor(private readonly matchers: readonly Matcher<Item>[]) {
    super();
  }

  [MATCHES](input: ReadonlyArray<Item>): ValueNode {
    const { matchers } = this;
    const outItems: ArrayNode.Item[] = [];
    for (let i = 0; i < input.length && i < matchers.length; ++i) {
      const matcher = matchers[i]!;
      const inItem = input[i]!;
      outItems.push({
        kind: "present",
        node: matcher[MATCHES](inItem),
      });
    }
    // Missing items.
    for (let i = input.length; i < matchers.length; ++i) {
      const matcher = matchers[i];
      outItems.push({
        kind: "missing",
        explanation: `Missing item at index ${i}:\n${indentText(matcher)}`,
      });
    }
    // Extraneous items.
    for (let i = matchers.length; i < input.length; ++i) {
      const inItem = input[i];
      outItems.push({
        kind: "extra",
        description: describeValue(inItem),
        explanation: `^ unexpected item at index ${i}`,
      });
    }
    return {
      kind: "array",
      items: outItems,
    };
  }

  toString(): string {
    return describeValue(this.matchers);
  }
}
