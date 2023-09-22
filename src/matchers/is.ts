import { describeValue } from "../describe_node.js";
import { Matcher, MATCHES } from "../matcher.js";
import { SimpleNode, ValueNode } from "../value_node.js";

export class IsMatcher<T> extends Matcher<T> {
  constructor(private readonly expected: T) {
    super();
  }

  [MATCHES](input: Readonly<T>): ValueNode {
    let mismatch: SimpleNode.Mismatch | undefined;
    if (!Object.is(input, this.expected)) {
      mismatch = {
        expected: `be ${describeValue(this.expected)}`,
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
