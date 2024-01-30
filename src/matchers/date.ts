import { describeValue } from "../describe_node.js";
import { MATCHES, Matcher } from "../matcher.js";
import { valueOfUnexpectedTypeToNode } from "../unexpected_type.js";
import { SimpleNode, ValueNode } from "../value_node.js";

export class DateMatcher extends Matcher<Date> {
  constructor(private readonly expected: Date) {
    super();
  }

  [MATCHES](input: Date): ValueNode {
    if (!(input instanceof Date)) {
      return valueOfUnexpectedTypeToNode(input, "Date");
    }
    let mismatch: SimpleNode.Mismatch | undefined;
    if (input.getTime() !== this.expected.getTime()) {
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
