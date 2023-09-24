import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { Matcher, MATCHES } from "../matcher.js";
import { is } from "../matchers.js";
import { MapMatcher } from "./map.js";

describe("MapMatcher", () => {
  it("matches", () => {
    const matcher = new MapMatcher(
      new Map([
        ["k1", is(1)],
        ["k2", is(2)],
      ]),
    );
    const actual = new Map([
      ["k1", 1],
      ["k2", 2],
    ]);
    expect(matcher[MATCHES](actual)).toMatch(
      {
        kind: "array",
        items: [
          {
            kind: "present",
            node: {
              kind: "simple",
              description: "1",
              mismatch: undefined,
            },
          },
          {
            kind: "present",
            node: {
              kind: "simple",
              description: "2",
              mismatch: undefined,
            },
          },
        ],
      },
    );
  });

  it("mismatches", () => {
    const matcher = new MapMatcher(
      new Map([
        ["k1", is(1)],
        ["k2", is(2)],
      ]),
    );
    const actual = new Map([
      ["k1", 1],
      ["k3", 3],
    ]);
    expect(matcher[MATCHES](actual)).toMatch(
      {
        kind: "array",
        items: [
          {
            kind: "present",
            node: {
              kind: "simple",
              description: "1",
              mismatch: undefined,
            },
          },
          {
            kind: "extra",
            description: [
              "[",
              '  "k3",',
              "  3,",
              "]",
            ].join("\n"),
            explanation: "^ unexpected entry",
          },
          {
            kind: "missing",
            explanation: [
              "Missing key:",
              '  "k2"',
            ].join("\n"),
          },
        ],
      },
    );
  });

  it("can handle values of unexpected type", () => {
    const matcher = new MapMatcher(new Map());
    expect((matcher as Matcher<unknown>)[MATCHES](true)).toMatch({
      kind: "simple",
      description: "true",
      mismatch: {
        expected: "be a Map, actually is a boolean",
      },
    });
  });
});
