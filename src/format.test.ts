import { describe, it } from "mocha";
import { expect } from "./expect.js";
import {
  commentOut,
  indentText,
  makeCyan,
  makeRed,
  prefixEachLine,
  prefixEachLinePastFirst,
} from "./format.js";

describe("prefixEachLinePastFirst()", () => {
  it("works with single-line string", () => {
    expect(prefixEachLinePastFirst("foo", "Z")).toBe("foo");
  });

  it("works with multiline string", () => {
    expect(prefixEachLinePastFirst("foo\nbar", "Z")).toBe("foo\nZbar");
  });
});

describe("prefixEachLine()", () => {
  it("works", () => {
    expect(prefixEachLine("foo\nbar", "Z")).toBe("Zfoo\nZbar");
  });
});

describe("indentText()", () => {
  it("works", () => {
    expect(indentText("foo\nbar")).toBe("  foo\n  bar");
  });
});

describe("commentOut()", () => {
  it("works", () => {
    expect(commentOut("foo\nbar")).toBe("// foo\n// bar");
  });
});

describe("makeRed()", () => {
  it("works", () => {
    expect(makeRed("foo")).toBe("\u001b[31mfoo\u001b[0m");
  });
});

describe("makeCyan()", () => {
  it("works", () => {
    expect(makeCyan("foo")).toBe("\u001b[36mfoo\u001b[0m");
  });
});
