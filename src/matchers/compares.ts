import { describeValue } from "../describe_node.js";
import { MATCHES, Matcher } from "../matcher.js";
import { valueOfUnexpectedTypeToNode } from "../unexpected_type.js";
import { SimpleNode, ValueNode } from "../value_node.js";

export class ComparesMatcher extends Matcher<number | bigint> {
  constructor(
    private readonly operator: "<" | "<=" | ">" | ">=",
    private readonly limit: number | bigint,
  ) {
    super();
  }

  [MATCHES](input: number | bigint): ValueNode {
    if (typeof input !== "number" && typeof input !== "bigint") {
      return valueOfUnexpectedTypeToNode(input, "number");
    }
    let ok: boolean;
    switch (this.operator) {
      case "<":
        ok = input < this.limit;
        break;
      case "<=":
        ok = input <= this.limit;
        break;
      case ">":
        ok = input > this.limit;
        break;
      case ">=":
        ok = input >= this.limit;
        break;
    }
    const mismatch: SimpleNode.Mismatch | undefined = ok
      ? undefined
      : {
          expected: `be ${this.operator} ${this.limit}`,
        };
    return {
      kind: "simple",
      description: describeValue(input),
      mismatch: mismatch,
    };
  }

  toString() {
    return `compares("${this.operator}", ${this.limit})`;
  }
}
