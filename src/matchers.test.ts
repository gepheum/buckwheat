import { expect } from "./expect.js";
import { AnyMatcher, MATCHES, Matcher } from "./matcher.js";
import { is, toMatcher } from "./matchers.js";
import { IsMatcher } from "./matchers/is.js";
import { describe, it } from "mocha";

describe("toMatcher()", () => {
  it("returns Matcher as-is", () => {
    const matcher: Matcher<number> = toMatcher(new IsMatcher(7));
    expect<unknown>(toMatcher(matcher)).toBe(matcher);
  });

  it("accepts T", () => {
    const matcher: Matcher<number> = toMatcher(7);
    expect<unknown>(toMatcher(matcher)).toBe(matcher);
  });

  it("accepts AnyMatcher<T>", () => {
    const matcher: Matcher<number> = toMatcher(7 as AnyMatcher<number>);
    expect<unknown>(toMatcher(matcher)).toBe(matcher);
  });

  it("accepts array of matchers", () => {
    const matcher: Matcher<number[]> = toMatcher([new IsMatcher(7), 8]);
    expect(matcher[MATCHES]([3])).toMatch({
      kind: "array",
      items: [{}, {}],
    });
  });

  it("accepts Set<T>", () => {
    const matcher: Matcher<Set<number>> = toMatcher(new Set([3]));
    expect(matcher[MATCHES](new Set([3]))).toMatch({
      kind: "array",
      items: [{}],
    });
  });

  it("accepts Map<K, V>", () => {
    const matcher: Matcher<Map<number, string>> = toMatcher(
      new Map([[3, "(3)"]]),
    );
    expect(matcher[MATCHES](new Map([[3, "(3)"]]))).toMatch({
      kind: "array",
      items: [{}],
    });
  });

  it("accepts Map<K, Matcher<V>>", () => {
    const matcher: Matcher<Map<number, string>> = toMatcher(
      new Map([[3, is("(3)")]]),
    );
    expect(matcher[MATCHES](new Map([[3, "(3)"]]))).toMatch({
      kind: "array",
      items: [{}],
    });
  });

  it("accepts Date", () => {
    const matcher: Matcher<Date> = toMatcher(new Date(1695545911807));
    expect(matcher[MATCHES](new Date(1695545911807))).toMatch({
      kind: "simple",
      mismatch: undefined,
    });
    expect(matcher[MATCHES](new Date(1695545911808))).toMatch({
      kind: "simple",
      mismatch: {},
    });
  });

  it("accepts RegExp", () => {
    const matcher: Matcher<string> = toMatcher(new RegExp(/^f/));
    expect(matcher[MATCHES]("foo")).toMatch({
      kind: "simple",
      mismatch: undefined,
    });
    expect(matcher[MATCHES]("bar")).toMatch({
      kind: "simple",
      mismatch: {},
    });
  });

  it("accepts Record<K, V>", () => {
    const matcher: Matcher<Record<number, string>> = toMatcher({
      3: "(3)",
    } as Record<number, string>);
    expect(matcher[MATCHES]({ 3: "(3)" })).toMatch({
      kind: "object",
      record: {
        3: {},
      },
    });
  });

  it("accepts Record<K, Matcher<V>>", () => {
    const matcher: Matcher<Record<number, string>> = toMatcher({
      3: is("(3)"),
    } as Record<number, Matcher<string>>);
    expect(matcher[MATCHES]({ 3: "(3)" })).toMatch({
      kind: "object",
      record: {
        3: {},
      },
    });
  });
});
