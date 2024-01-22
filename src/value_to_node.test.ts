import { describe, it } from "mocha";

import { expect } from "./expect.js";
import { REPRESENT_AS_SIMPLE_NODE, valueToNode } from "./value_to_node.js";

describe("valueToNode()", () => {
  it("works with string", () => {
    expect(valueToNode("foo")).toMatch({
      kind: "simple",
      description: '"foo"',
      mismatch: undefined,
    });
  });

  it("works with multiline string", () => {
    expect(valueToNode("foo\nbar\n")).toMatch({
      kind: "simple",
      description: ["[", '  "foo",', '  "bar",', '  "",', '].join("\\n")'].join(
        "\n",
      ),
    });
  });

  it("works with number", () => {
    expect(valueToNode(3.14)).toMatch({
      kind: "simple",
      description: "3.14",
    });
  });

  it("works with NaN", () => {
    expect(valueToNode(Number.NaN)).toMatch({
      kind: "simple",
      description: "Number.NaN",
    });
  });

  it("works with infinity", () => {
    expect(valueToNode(Number.POSITIVE_INFINITY)).toMatch({
      kind: "simple",
      description: "Number.POSITIVE_INFINITY",
    });
    expect(valueToNode(Number.NEGATIVE_INFINITY)).toMatch({
      kind: "simple",
      description: "Number.NEGATIVE_INFINITY",
    });
  });

  it("works with bigint", () => {
    expect(valueToNode(BigInt(100))).toMatch({
      kind: "simple",
      description: 'BigInt("100")',
    });
  });

  it("works with boolean", () => {
    expect(valueToNode(true)).toMatch({
      kind: "simple",
      description: "true",
    });
  });

  it("works with date", () => {
    expect(valueToNode(new Date(1694467279837))).toMatch({
      kind: "simple",
      description: 'Date.parse("2023-09-11T21:21:19.837Z")',
    });
  });

  it("works with regexp", () => {
    expect(valueToNode(/f/)).toMatch({
      kind: "simple",
      description: "/f/",
    });
  });

  it("works with array", () => {
    expect(valueToNode([1, 2])).toMatch({
      kind: "array",
      items: [
        {
          kind: "present",
          node: {
            kind: "simple",
            description: "1",
          },
        },
        {
          kind: "present",
          node: {
            kind: "simple",
            description: "2",
          },
        },
      ],
    });
  });

  it("works with object", () => {
    expect(valueToNode({ foo: 3 })).toMatch({
      kind: "object",
      record: {
        foo: {
          kind: "simple",
          description: "3",
        },
      },
    });
  });

  it("works with recursive object", () => {
    const o: Record<string, unknown> = {};
    o["bar"] = o;
    expect(valueToNode(o)).toMatch({
      kind: "object",
      record: {
        bar: {
          kind: "...",
        },
      },
    });
  });

  it("describes custom class", () => {
    expect(valueToNode(new Point(3, 4))).toMatch({
      kind: "object",
      record: {
        x: {
          kind: "simple",
          description: "3",
        },
        y: {
          kind: "simple",
          description: "4",
        },
      },
    });
  });

  it("describes custom class with special property", () => {
    const point = new Point(3, 4);
    Reflect.set(point, REPRESENT_AS_SIMPLE_NODE, true);
    expect(valueToNode(point)).toMatch({
      kind: "simple",
      description: "This is a:\nPoint",
    });
  });

  it("describes Map", () => {
    expect(valueToNode(new Map().set("foo", 3))).toMatch({
      kind: "array",
      items: [
        {
          kind: "present",
          node: {
            kind: "array",
            items: [
              {
                kind: "present",
                node: {
                  kind: "simple",
                  description: '"foo"',
                },
              },
              {
                kind: "present",
                node: {
                  kind: "simple",
                  description: "3",
                },
              },
            ],
          },
        },
      ],
    });
  });

  it("describes Set", () => {
    expect(valueToNode(new Set().add("foo"))).toMatch({
      kind: "array",
      items: [
        {
          kind: "present",
          node: {
            kind: "simple",
            description: '"foo"',
          },
        },
      ],
    });
  });
});

class Point {
  constructor(
    private readonly x: number,
    private readonly y: number,
  ) {}

  toString(): string {
    return "This is a:\nPoint";
  }
}
