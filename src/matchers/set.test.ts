import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { Matcher, MATCHES } from "../matcher.js";
import { SetMatcher } from "./set.js";

describe("SetMatcher", () => {
  it("matches", () => {
    const matcher = new SetMatcher(new Set([1, 2, 3]));
    expect(matcher[MATCHES](new Set([1, 2, 3]))).toMatch({
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
        {
          kind: "present",
          node: {
            kind: "simple",
            description: "3",
          },
        },
      ],
    });
  });

  it("mismatches", () => {
    const matcher = new SetMatcher(new Set([1, 2, 3]));
    expect(matcher[MATCHES](new Set([1, 2, 4]))).toMatch({
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
        {
          kind: "extra",
          description: "4",
          explanation: "^ unexpected element",
        },
        {
          kind: "missing",
          explanation: ["Missing element:", "  3"].join("\n"),
        },
      ],
    });
  });

  it("can handle values of unexpected type", () => {
    const matcher = new SetMatcher(new Set());
    expect((matcher as Matcher<unknown>)[MATCHES](true)).toMatch({
      kind: "simple",
      description: "true",
      mismatch: {
        expected: "be a Set, actually is a boolean",
      },
    });
  });
});
