import { describeValue } from "../describe_node.js";
import { indentText } from "../format.js";
import { Matcher, MATCHES } from "../matcher.js";
import { ArrayNode, ValueNode } from "../value_node.js";

export class SetMatcher<T> extends Matcher<ReadonlySet<T>> {
  constructor(private readonly expectedElements: ReadonlySet<T>) {
    super();
  }

  [MATCHES](input: ReadonlySet<T>): ValueNode {
    const { expectedElements } = this;
    const outItems: ArrayNode.Item[] = [];
    for (const actualElement of input) {
      const description = describeValue(actualElement);
      if (expectedElements.has(actualElement)) {
        outItems.push({
          kind: "present",
          node: {
            kind: "simple",
            description: description,
          },
        });
      } else {
        outItems.push({
          kind: "extra",
          description: description,
          explanation: "^ unexpected element",
        });
      }
    }
    // Missing elements.
    for (const expectedElement of this.expectedElements) {
      if (input.has(expectedElement)) {
        continue;
      }
      const description = describeValue(expectedElement);
      outItems.push({
        kind: "missing",
        explanation: `Missing element:\n${indentText(description)}`,
      });
    }
    return {
      kind: "array",
      items: outItems,
    };
  }

  toString(): string {
    return describeValue(this.expectedElements);
  }
}
