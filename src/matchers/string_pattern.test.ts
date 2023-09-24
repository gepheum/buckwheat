import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { Matcher, MATCHES } from "../matcher.js";
import { StringPatternMatcher } from "./string_pattern.js";

describe("StringPatternMatcher", () => {
  it("matches", () => {
    const matcher = new StringPatternMatcher(/^f/);
    expect(matcher[MATCHES]("foo")).toMatch(
      {
        kind: "simple",
        description: '"foo"',
        mismatch: undefined,
      },
    );
  });

  it("mismatches", () => {
    const matcher = new StringPatternMatcher(/^f/);
    expect(matcher[MATCHES]("oof")).toMatch(
      {
        kind: "simple",
        description: '"oof"',
        mismatch: {
          expected: "match /^f/",
        },
      },
    );
  });

  it("#toString()", () => {
    const matcher = new RegExp(/^f/);
    expect(matcher.toString()).toBe("/^f/");
  });

  it("can handle values of unexpected type", () => {
    const matcher = new StringPatternMatcher(/^f/);
    expect((matcher as Matcher<unknown>)[MATCHES](3)).toMatch({
      kind: "simple",
      description: "3",
      mismatch: {
        expected: "be a string, actually is a number",
      },
    });
  });
});
