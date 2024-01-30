import { expect } from "../expect.js";
import { MATCHES } from "../matcher.js";
import { is } from "../matchers.js";
import { describe, it } from "mocha";

describe("IsMatcher", () => {
  it("matches", () => {
    const a = {};
    const matcher = is(a);
    expect(matcher[MATCHES](a)).toMatch({
      kind: "simple",
      description: "{}",
      mismatch: undefined,
    });
  });

  it("mismatches", () => {
    const matcher = is(true);
    expect(matcher[MATCHES](false)).toMatch({
      kind: "simple",
      description: "false",
      mismatch: {
        expected: "be true",
      },
    });
  });

  it("mismatches with multiline description", () => {
    const matcher = is([100]);
    expect(matcher[MATCHES]([])).toMatch({
      kind: "simple",
      description: "[]",
      mismatch: {
        expected: [
          "be a specific reference to:",
          "  [",
          "    100,",
          "  ]",
        ].join("\n"),
      },
    });
  });

  it("#toString()", () => {
    const matcher = is({});
    expect(matcher.toString()).toBe("{}");
  });
});
