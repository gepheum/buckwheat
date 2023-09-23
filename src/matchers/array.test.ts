import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { ArrayMatcher } from "./array.js";
import { compares, is } from "../matchers.js";
import { MATCHES } from "../matcher.js";

describe("ArrayMatcher", () => {
  it("works with missing items", () => {
    const matcher = new ArrayMatcher([is(10), is(20)]);
    expect(matcher[MATCHES]([8])).toMatch(
      {
        kind: "array",
        items: [
          {
            kind: "present",
            node: {
              kind: "simple",
              description: "8",
              mismatch: {
                expected: "be 10",
              },
            },
          },
          {
            kind: "missing",
            explanation: "Missing item at index 1:\n  20",
          },
        ],
      },
    );
  });

  it("works with extra items", () => {
    const matcher = new ArrayMatcher([is(10)]);
    expect(matcher[MATCHES]([10, 20])).toMatch(
      {
        kind: "array",
        items: [
          {
            kind: "present",
            node: {
              kind: "simple",
              description: "10",
              mismatch: undefined,
            },
          },
          {
            kind: "extra",
            description: "20",
            explanation: "^ unexpected item at index 1",
          },
        ],
      },
    );
  });

  it("#toString()", () => {
    const matcher = new ArrayMatcher([compares(">=", 10)]);
    expect(matcher.toString()).toBe('[\n  compares(">=", 10),\n]');
  });
});
