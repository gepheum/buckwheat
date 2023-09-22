import { describeValue } from "../describe_node.js";
import { Matcher, MATCHES } from "../matcher.js";
import { SimpleNode, ValueNode } from "../value_node.js";

export class ComparesMatcher extends Matcher<number | bigint> {
  constructor(
    private readonly operator: "<" | "<=" | ">" | ">=",
    private readonly limit: number | bigint,
  ) {
    super();
  }

  [MATCHES](input: number | bigint): ValueNode {
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
    const mismatch: SimpleNode.Mismatch | undefined = ok ? undefined : {
      expected: `be ${this.operator} ${this.limit}`,
    };
    return {
      kind: "simple",
      description: describeValue(input),
      mismatch: mismatch,
    };
  }

  toString() {
    return `compares(${this.operator}, ${this.limit})`;
  }
}
