import { describe, it } from "mocha";
import { expect } from "../expect.js";
import { Matcher, MATCHES } from "../matcher.js";
import { keyedItems } from "../matchers.js";

interface ComplexKey {
  key: string;
}

class Item {
  constructor(
    readonly key: string | ComplexKey,
    readonly n: number,
  ) {}
}

describe("KeyedItemsMatcher", () => {
  it("matches", () => {
    const matcher: Matcher<Item[]> = keyedItems("key", [
      { key: "k1", n: 1 },
      { key: "k2", n: 2 },
    ]);
    const actual = [new Item("k2", 2), new Item("k1", 1)];
    expect(matcher[MATCHES](actual)).toMatch({
      kind: "array",
      items: [
        {
          kind: "present",
          node: {
            kind: "object",
            record: {
              key: {
                kind: "simple",
                description: '"k2"',
              },
            },
          },
        },
        {
          kind: "present",
        },
      ],
      mismatch: undefined,
    });
  });

  it("mismatches because missing item", () => {
    const matcher: Matcher<Item[]> = keyedItems("key", [
      { key: "k1", n: 1 },
      { key: "k2", n: 2 },
    ]);
    const actual = [new Item("k2", 2)];
    expect(matcher[MATCHES](actual)).toMatch({
      kind: "array",
      items: [
        {
          kind: "present",
          node: {
            kind: "object",
            record: {
              key: {
                kind: "simple",
                description: '"k2"',
              },
            },
          },
        },
        {
          kind: "missing",
          explanation: 'Missing item:\n  {\n    key: "k1",\n    n: 1,\n  }',
        },
      ],
      mismatch: undefined,
    });
  });

  it("mismatches because extra item", () => {
    const matcher: Matcher<Item[]> = keyedItems("key", [{ key: "k2", n: 2 }]);
    const actual = [new Item("k1", 1), new Item("k2", 2)];
    expect(matcher[MATCHES](actual)).toMatch({
      kind: "array",
      items: [
        {
          kind: "extra",
          description: '{\n  key: "k1",\n  n: 1,\n}',
          explanation: "^ unexpected item",
        },
        {
          kind: "present",
          node: {
            kind: "object",
            record: {
              key: {
                kind: "simple",
                description: '"k2"',
                mismatch: undefined,
              },
              n: {
                kind: "simple",
                description: "2",
                mismatch: undefined,
              },
            },
          },
        },
      ],
    });
  });

  it("uses toMatchable if provided", () => {
    const matcher: Matcher<Item[]> = keyedItems(
      "key",
      [
        { key: { key: "k1" }, n: 1 },
        { key: { key: "k2" }, n: 2 },
      ],
      (key) => (key as ComplexKey).key,
    );
    const actual = [new Item({ key: "k2" }, 2), new Item({ key: "k1" }, 1)];
    expect(matcher[MATCHES](actual)).toMatch({
      kind: "array",
      items: [
        {
          kind: "present",
          node: {
            kind: "object",
          },
        },
        {
          kind: "present",
          node: {
            kind: "object",
          },
        },
      ],
    });
  });

  it("#toString()", () => {
    const matcher: Matcher<Item[]> = keyedItems("key", [
      { key: "k1", n: 1 },
      { key: "k2", n: 2 },
    ]);
    expect(matcher.toString()).toBe(
      [
        "[",
        "  {",
        '    key: "k1",',
        "    n: 1,",
        "  },",
        "  {",
        '    key: "k2",',
        "    n: 2,",
        "  },",
        "]",
      ].join("\n"),
    );
  });

  it("fails fast if multiple matchers have the same key", () => {
    try {
      keyedItems("key", [
        { key: "k1", n: 1 },
        { key: "k1", n: 2 },
      ]);
      throw new Error("`keyedItems() should have thrown an Error`");
    } catch (e) {
      if (!(e instanceof Error)) {
        throw new Error("`keyedItems() should have thrown an Error`");
      }
      expect(e.message).toBe(
        "Matchers passed to #keyedItems() must have distinct keys; duplicate key: k1",
      );
    }
  });

  it("handles key duplicate in actual array", () => {
    const matcher: Matcher<Item[]> = keyedItems("key", [
      { key: "k1", n: 1 },
      { key: "k2", n: 2 },
    ]);
    const actual = [new Item("k1", 2), new Item("k1", 1)];
    expect(matcher[MATCHES](actual)).toMatch({
      kind: "array",
      items: [
        {
          kind: "present",
          node: {
            kind: "object",
            record: {
              key: {
                kind: "simple",
                description: '"k1"',
                mismatch: undefined,
              },
              n: {
                kind: "simple",
                description: "1",
                mismatch: undefined,
              },
            },
          },
        },
        {
          kind: "missing",
          explanation: [
            "Missing item:",
            "  {",
            '    key: "k2",',
            "    n: 2,",
            "  }",
          ].join("\n"),
        },
      ],
    });
  });

  it("can handle values of unexpected type", () => {
    const matcher: Matcher<Item[]> = keyedItems("key", []);
    expect((matcher as Matcher<unknown>)[MATCHES](1)).toMatch({
      kind: "simple",
      description: "1",
      mismatch: {
        expected: "be an array, actually is a number",
      },
    });
  });
});
