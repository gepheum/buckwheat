import { describeNode } from "./describe_node.js";
import { expect } from "./expect.js";
import { describe, it } from "mocha";

describe("describeNode()", () => {
  it("describes simple node", () => {
    expect(
      describeNode({
        kind: "simple",
        description: "-3",
        mismatch: {
          expected: "be positive",
        },
      }),
    ).toBe(
      "\u001b[31m-3\u001b[0m\n\u001b[36m// ^ expected to be positive\u001b[0m",
    );
  });

  it("works when 'expected' is a multiline string", () => {
    expect(
      describeNode({
        kind: "simple",
        description: "-3",
        mismatch: {
          expected: "be\npositive",
        },
      }),
    ).toBe(
      "\u001b[31m-3\u001b[0m\n\u001b[36m// ^ expected to be\n" +
        "// positive\u001b[0m",
    );
  });

  it("describes complex node", () => {
    expect(
      describeNode({
        kind: "object",
        record: {
          f: {
            kind: "array",
            items: [
              {
                kind: "present",
                node: {
                  kind: "simple",
                  description: "3",
                  mismatch: {
                    expected: "be 4",
                  },
                },
              },
              {
                kind: "extra",
                description: "4",
                explanation: "^ unexpected item",
              },
              {
                kind: "missing",
                explanation: "missing item:\n  6",
              },
            ],
          },
          rec: {
            kind: "...",
          },
          empty_array: {
            kind: "array",
            items: [],
          },
          empty_object: {
            kind: "object",
            record: {},
          },
        },
      }),
    ).toBe(
      [
        "{",
        "  f: [",
        "    \u001b[31m3\u001b[0m,",
        "    \u001b[36m// ^ expected to be 4\u001b[0m",
        "    \u001b[31m4\u001b[0m,",
        "    \u001b[36m// ^ unexpected item\u001b[0m",
        "    \u001b[31m// missing item:",
        "    //   6\u001b[0m",
        "  ],",
        "  rec: ...,",
        "  empty_array: [],",
        "  empty_object: {},",
        "}",
      ].join("\n"),
    );
  });
});
