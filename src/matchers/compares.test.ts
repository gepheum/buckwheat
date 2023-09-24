import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { Matcher, MATCHES } from "../matcher.js";
import { ComparesMatcher } from "./compares.js";

describe("ComparesMatcher", () => {
  it("<=", () => {
    const matcher = new ComparesMatcher("<=", 2);
    expect(matcher[MATCHES](1)).toMatch({
      kind: "simple",
      description: "1",
      mismatch: undefined,
    });
    expect(matcher[MATCHES](2)).toMatch({
      kind: "simple",
      description: "2",
      mismatch: undefined,
    });
    expect(matcher[MATCHES](BigInt(2))).toMatch({
      kind: "simple",
      description: 'BigInt("2")',
      mismatch: undefined,
    });
  });

  it("not <=", () => {
    const matcher = new ComparesMatcher("<=", 2);
    expect(matcher[MATCHES](3)).toMatch({
      kind: "simple",
      description: "3",
      mismatch: {
        expected: "be <= 2",
      },
    });
  });

  it("<", () => {
    const matcher = new ComparesMatcher("<", 2);
    expect(matcher[MATCHES](1)).toMatch({
      kind: "simple",
      description: "1",
      mismatch: undefined,
    });
  });

  it("not <", () => {
    const matcher = new ComparesMatcher("<", 2);
    expect(matcher[MATCHES](2)).toMatch({
      kind: "simple",
      description: "2",
      mismatch: {
        expected: "be < 2",
      },
    });
  });

  it(">=", () => {
    const matcher = new ComparesMatcher(">=", 2);
    expect(matcher[MATCHES](2)).toMatch({
      kind: "simple",
      description: "2",
      mismatch: undefined,
    });
  });

  it("not >=", () => {
    const matcher = new ComparesMatcher(">=", 2);
    expect(matcher[MATCHES](1)).toMatch({
      kind: "simple",
      description: "1",
      mismatch: {
        expected: "be >= 2",
      },
    });
  });

  it(">", () => {
    const matcher = new ComparesMatcher(">", 2);
    expect(matcher[MATCHES](3)).toMatch({
      kind: "simple",
      description: "3",
      mismatch: undefined,
    });
  });

  it("not >", () => {
    const matcher = new ComparesMatcher(">", 2);
    expect(matcher[MATCHES](2)).toMatch({
      kind: "simple",
      description: "2",
      mismatch: {
        expected: "be > 2",
      },
    });
  });

  it("#toString()", () => {
    const matcher = new ComparesMatcher(">", 2);
    expect(matcher.toString()).toBe('compares(">", 2)');
  });

  it("can handle values of unexpected type", () => {
    const matcher = new ComparesMatcher(">", 2);
    expect((matcher as Matcher<unknown>)[MATCHES]("foo")).toMatch({
      kind: "simple",
      description: '"foo"',
      mismatch: {
        expected: "be a number, actually is a string",
      },
    });
  });
});
