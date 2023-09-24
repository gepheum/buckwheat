import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { Matcher, MATCHES } from "../matcher.js";
import { DateMatcher } from "./date.js";

describe("DateMatcher", () => {
  it("matches", () => {
    const timestamp = 1695545911807;
    const matcher = new DateMatcher(new Date(timestamp));
    expect(matcher[MATCHES](new Date(timestamp))).toMatch(
      {
        kind: "simple",
        description: 'Date.parse("2023-09-24T08:58:31.807Z")',
        mismatch: undefined,
      },
    );
  });

  it("mismatches", () => {
    const matcher = new DateMatcher(new Date(1695545911807));
    expect(matcher[MATCHES](new Date(1695545911808))).toMatch(
      {
        kind: "simple",
        description: 'Date.parse("2023-09-24T08:58:31.808Z")',
        mismatch: {
          expected: 'be Date.parse("2023-09-24T08:58:31.807Z")',
        },
      },
    );
  });

  it("#toString()", () => {
    const matcher = new DateMatcher(new Date(1695545911807));
    expect(matcher.toString()).toBe('Date.parse("2023-09-24T08:58:31.807Z")');
  });

  it("can handle values of unexpected type", () => {
    const matcher = new DateMatcher(new Date(1695545911807));
    expect((matcher as Matcher<unknown>)[MATCHES]("foo")).toMatch({
      kind: "simple",
      description: '"foo"',
      mismatch: {
        expected: "be a Date, actually is a string",
      },
    });
  });
});
