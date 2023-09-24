import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { Matcher, MATCHES } from "../matcher.js";
import { near } from "../matchers.js";

describe("NearMatcher", () => {
  it("matches", () => {
    const matcher = near(3.14, 0.005);
    expect(matcher[MATCHES](3.14159)).toMatch({
      kind: "simple",
      description: "3.14159",
      mismatch: undefined,
    });
    expect(matcher[MATCHES](3.1399999)).toMatch({
      kind: "simple",
      description: "3.1399999",
      mismatch: undefined,
    });
  });

  it("mismatches", () => {
    const matcher = near(3.14, 0.005);
    expect(matcher[MATCHES](3.13)).toMatch({
      kind: "simple",
      description: "3.13",
      mismatch: {
        expected: "be near 3.14 ± 0.005",
      },
    });
    expect(matcher[MATCHES](3.15)).toMatch({
      kind: "simple",
      description: "3.15",
      mismatch: {
        expected: "be near 3.14 ± 0.005",
      },
    });
  });

  it("mismatches if input is NaN", () => {
    const matcher = near(3.14, 0.005);
    expect(matcher[MATCHES](Number.NaN)).toMatch({
      kind: "simple",
      description: "NaN",
      mismatch: {
        expected: "be near 3.14 ± 0.005",
      },
    });
  });

  it("#toString()", () => {
    const matcher = near(3.14, 0.005);
    expect(matcher.toString()).toBe("near(3.14, 0.005)");
  });

  it("can handle values of unexpected type", () => {
    const matcher = near(3.14, 0.005);
    expect((matcher as Matcher<unknown>)[MATCHES]("foo")).toMatch({
      kind: "simple",
      description: '"foo"',
      mismatch: {
        expected: "be a number, actually is a string",
      },
    });
  });
});
