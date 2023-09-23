import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { MATCHES } from "../matcher.js";
import { IsMatcher } from "./is.js";

describe("IsMatcher", () => {
  it("matches", () => {
    const a = {};
    const matcher = new IsMatcher(a);
    expect(matcher[MATCHES](a)).toMatch(
      {
        kind: "simple",
        description: "{}",
        mismatch: undefined,
      },
    );
  });

  it("mismatches", () => {
    const matcher = new IsMatcher({});
    expect(matcher[MATCHES]({})).toMatch(
      {
        kind: "simple",
        description: "{}",
        mismatch: {
          expected: "be {}",
        },
      },
    );
  });

  it("#toString()", () => {
    const matcher = new IsMatcher({});
    expect(matcher.toString()).toBe("{}");
  });
});
