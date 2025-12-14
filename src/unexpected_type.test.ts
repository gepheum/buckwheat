import { describe, it } from "mocha";
import { expect } from "./expect.js";
import { valueOfUnexpectedTypeToNode } from "./unexpected_type.js";

class Point {}

describe("valueOfUnexpectedTypeToNode()", () => {
  it("works", () => {
    expect(valueOfUnexpectedTypeToNode(3, "array")).toMatch({
      kind: "simple",
      description: "3",
      mismatch: {
        expected: "be an array, actually is a number",
      },
    });
    expect(valueOfUnexpectedTypeToNode(true, "object")).toMatch({
      kind: "simple",
      description: "true",
      mismatch: {
        expected: "be an object, actually is a boolean",
      },
    });
    expect(valueOfUnexpectedTypeToNode(new Point(), "number")).toMatch({
      kind: "simple",
      description: "{}",
      mismatch: {
        expected: "be a number, actually is a Point",
      },
    });
  });
});
