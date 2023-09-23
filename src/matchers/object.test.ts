import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { Matcher, MATCHES } from "../matcher.js";
import { is } from "../matchers.js";
import { ObjectMatcher } from "./object.js";

describe("ObjectMatcher", () => {
  it("works", () => {
    const matcher: Matcher<Record<string, unknown>> = new ObjectMatcher(
      {
        k1: is(1),
        k2: is(2),
        // Okay for this field to not be present in the actual object.
        k4: is(undefined),
      },
    );
    const actual = {
      k1: 10,
      // Okay to have an extra field.
      k3: 3,
    };
    expect(matcher[MATCHES](actual)).toMatch(
      {
        kind: "object",
        record: {
          k1: {
            kind: "simple",
            description: "10",
            mismatch: {
              expected: "be 1",
            },
          },
          k2: {
            kind: "simple",
            description: "undefined",
            mismatch: {
              expected: "be 2",
            },
          },
          k4: {
            kind: "simple",
            description: "undefined",
            mismatch: undefined,
          },
        },
      },
    );
  });

  it("can handle values of unexpected type", () => {
    const matcher = new ObjectMatcher({});
    expect((matcher as Matcher<unknown>)[MATCHES](true)).toMatch({
      kind: "simple",
      description: "true",
      mismatch: {
        expected: "be an object, actually is a boolean",
      }
    });
  });
});
