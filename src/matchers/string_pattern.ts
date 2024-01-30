import { describeValue } from "../describe_node.js";
import { MATCHES, Matcher } from "../matcher.js";
import { valueOfUnexpectedTypeToNode } from "../unexpected_type.js";
import { SimpleNode, ValueNode } from "../value_node.js";
import { IsMatcher } from "./is.js";

export class StringPatternMatcher extends Matcher<string | RegExp> {
  constructor(private readonly expectedPattern: RegExp) {
    super();
  }

  [MATCHES](input: string | RegExp): ValueNode {
    if (input instanceof RegExp) {
      // Verify that input and the expected RegExp are the same value according
      // to `Object.is`.
      return new IsMatcher(this.expectedPattern)[MATCHES](input);
    }
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
    return describeValue(this.expectedPattern);
  }
}
