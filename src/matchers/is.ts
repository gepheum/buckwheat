import { describeValue } from "../describe_node.js";
import { indentText } from "../format.js";
import { MATCHES, Matcher } from "../matcher.js";
import { SimpleNode, ValueNode } from "../value_node.js";

export class IsMatcher<T> extends Matcher<T> {
  constructor(private readonly expected: T) {
    super();
  }

  [MATCHES](input: Readonly<T>): ValueNode {
    let mismatch: SimpleNode.Mismatch | undefined;
    const { expected } = this;
    if (!Object.is(input, this.expected)) {
      const be =
        typeof expected === "object" ? "be a specific reference to" : "be";
      const description = describeValue(this.expected);
      const multiline = /[\r\n]/.test(description);
      mismatch = {
        expected: multiline
          ? `${be}:\n${indentText(description)}`
          : `${be} ${description}`,
      };
    }
    return {
      kind: "simple",
      description: describeValue(input),
      mismatch: mismatch,
    };
  }

  toString() {
    return describeValue(this.expected);
  }
}
