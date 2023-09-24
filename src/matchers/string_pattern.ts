import { describeValue } from "../describe_node.js";
import { Matcher, MATCHES } from "../matcher.js";
import { valueOfUnexpectedTypeToNode } from "../unexpected_type.js";
import { SimpleNode, ValueNode } from "../value_node.js";

export class StringPatternMatcher extends Matcher<string> {
  constructor(private readonly expectedPattern: RegExp) {
    super();
  }

  [MATCHES](input: string): ValueNode {
    if (typeof input !== "string") {
      return valueOfUnexpectedTypeToNode(input, "string");
    }
    let mismatch: SimpleNode.Mismatch | undefined;
    if (!this.expectedPattern.test(input)) {
      mismatch = {
        expected: `match ${this.toString()}`,
      };
    }
    return {
      kind: "simple",
      description: describeValue(input),
      mismatch: mismatch,
    };
  }

  toString() {
    const { expectedPattern } = this;
    return String(expectedPattern).startsWith("/")
      ? String(expectedPattern)
      // In some Javascript environments, calling toString() on a RegExp
      // obtained from the RegExpr constructor returns "RegExp {}".
      : `new RegExpr(${JSON.stringify(expectedPattern.source)})`;
  }
}
