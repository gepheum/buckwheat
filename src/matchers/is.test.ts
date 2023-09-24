import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { MATCHES } from "../matcher.js";
import { is } from "../matchers.js";

describe("IsMatcher", () => {
  it("matches", () => {
    const a = {};
    const matcher = is(a);
    expect(matcher[MATCHES](a)).toMatch(
      {
        kind: "simple",
        description: "{}",
        mismatch: undefined,
      },
    );
  });

  it("mismatches", () => {
    const matcher = is({});
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
    const matcher = is({});
    expect(matcher.toString()).toBe("{}");
  });
});
