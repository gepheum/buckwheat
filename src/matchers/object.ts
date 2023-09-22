import { describeValue } from "../describe_node.js";
import { Matcher, MATCHES } from "../matcher.js";
import { ValueNode } from "../value_node.js";

export class ObjectMatcher<T> extends Matcher<T> {
  constructor(
    private readonly spec: {
      [Property in keyof T]: Matcher<T[Property]>;
    },
  ) {
    super();
  }

  [MATCHES](input: Readonly<T>): ValueNode {
    const record: { [p: PropertyKey]: ValueNode } = {};
    for (const property in this.spec) {
      const value = applyMatcherToFieldValue(input, property, this.spec);
      record[property] = value;
    }
    return {
      kind: "object",
      record: record,
    };
  }

  toString(): string {
    return describeValue(this.spec);
  }
}

function applyMatcherToFieldValue<T, Property extends keyof T>(
  object: T,
  property: Property,
  spec: { [Property in keyof T]: Matcher<T[Property]> },
): ValueNode {
  return spec[property][MATCHES](object[property]);
}
