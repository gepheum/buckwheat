import { expect } from "../expect.js";
import { MATCHES, Matcher } from "../matcher.js";
import { satisfies } from "../matchers.js";
import { describe, it } from "mocha";

describe("SatisfiesMatcher", () => {
  it("matches", () => {
    const matcher: Matcher<number> = satisfies((n) => n % 2 === 0, "be even");
    expect(matcher[MATCHES](24)).toMatch({
      kind: "simple",
      description: "24",
      mismatch: undefined,
    });
  });

  it("mismatches", () => {
    const matcher: Matcher<number> = satisfies((n) => n % 2 === 0, "be even");
    expect(matcher[MATCHES](25)).toMatch({
      kind: "simple",
      description: "25",
      mismatch: {
        expected: "be even",
      },
    });
  });

  describe("#toString()", () => {
    it("single-line description", () => {
      const matcher: Matcher<number> = satisfies((n) => n % 2 === 0, "be even");
      expect(matcher.toString()).toBe('satisfies(..., "be even")');
    });

    it("multiline description", () => {
      const matcher: Matcher<number> = satisfies(
        (n) => n % 2 === 0,
        "be\neven",
      );
      expect(matcher.toString()).toBe(
        [
          "satisfies(",
          "  ...,",
          "  [",
          '    "be",',
          '    "even",',
          '  ].join("\\n")',
          ")",
        ].join("\n"),
      );
    });

    it("condition is named", () => {
      function isEven(n: number): boolean {
        return n % 2 === 0;
      }
      const matcher: Matcher<number> = satisfies(isEven, "be even");
      expect(matcher.toString()).toBe('satisfies(isEven, "be even")');
    });
  });
});
