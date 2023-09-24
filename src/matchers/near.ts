import { Matcher, MATCHES } from "../matcher.js";
import { valueOfUnexpectedTypeToNode } from "../unexpected_type.js";
import { SimpleNode, ValueNode } from "../value_node.js";

export class NearMatcher extends Matcher<number> {
  constructor(
    private readonly target: number,
    private readonly epsilon: number,
  ) {
    super();
    // Use ("!", "<=") instead of (">") to handle NaN.
    if (!(this.epsilon >= 0)) {
      throw new Error("epsilon must be positive");
    }
  }

  [MATCHES](input: number): ValueNode {
    if (typeof input !== "number") {
      return valueOfUnexpectedTypeToNode(input, "number");
    }
    let mismatch: SimpleNode.Mismatch | undefined;
    // Use ("!", "<=") instead of (">") to handle NaN.
    if (!(Math.abs(this.target - input) <= this.epsilon)) {
      mismatch = {
        expected: `be near ${this.target} ± ${this.epsilon}`,
      };
    }
    return {
      kind: "simple",
      description: String(input),
      mismatch: mismatch,
    };
  }

  toString() {
    return `near(${this.target}, ${this.epsilon})`;
  }
}
