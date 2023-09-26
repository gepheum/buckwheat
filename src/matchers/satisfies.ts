import { describeValue } from "../describe_node.js";
import { indentText } from "../format.js";
import { Matcher, MATCHES } from "../matcher.js";
import { SimpleNode, ValueNode } from "../value_node.js";

export class SatisfiesMatcher<T> extends Matcher<T> {
  constructor(
    private readonly predicate: (input: T) => boolean,
    private readonly description: string,
  ) {
    super();
  }

  [MATCHES](input: Readonly<T>): ValueNode {
    let mismatch: SimpleNode.Mismatch | undefined;
    // Use ("!", "<=") instead of (">") to handle NaN.
    if (!this.predicate(input)) {
      mismatch = {
        expected: this.description,
      };
    }
    return {
      kind: "simple",
      description: describeValue(input),
      mismatch: mismatch,
    };
  }

  toString() {
    let predicateName = this.predicate.name;
    if (!predicateName) {
      // An anonymous function.
      predicateName = "...";
    }
    const { description } = this;
    return /[\r\n]/.test(description)
      ? `satisfies(\n  ${predicateName},\n${
        indentText(describeValue(description))
      }\n)`
      : `satisfies(${predicateName}, ${describeValue(description)})`;
  }
}
