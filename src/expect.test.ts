import { describe, it } from "mocha";
import { AssertionError, expect } from "./expect.js";
import { is } from "./matchers.js";

describe("expect()", () => {
  describe("toBe()", () => {
    it("when satisfied", () => {
      const o = {};
      expect(o).toBe(o);
    });
    it("when not satisfied", () => {
      try {
        expect({}).toBe({});
      } catch (e) {
        if (e instanceof AssertionError) {
          return;
        }
      }
      throw new AssertionError("`expect` should have thrown an AssertionError");
    });
  });

  describe("toMatch()", () => {
    it("when satisfied", () => {
      const o = {};
      expect(o).toMatch(is(o));
    });
    it("when not satisfied because of mismatch", () => {
      try {
        expect({}).toMatch(is({}));
      } catch (e) {
        if (e instanceof AssertionError) {
          return;
        }
      }
      throw new AssertionError("`expect` should have thrown an AssertionError");
    });
    it("when not satisfied because of missing item", () => {
      try {
        expect([2]).toMatch(is([]));
      } catch (e) {
        if (e instanceof AssertionError) {
          return;
        }
      }
      throw new AssertionError("`expect` should have thrown an AssertionError");
    });
    it("when not satisfied because of extra item", () => {
      try {
        expect([2]).toMatch(is([2, 3]));
      } catch (e) {
        if (e instanceof AssertionError) {
          return;
        }
      }
      throw new AssertionError("`expect` should have thrown an AssertionError");
    });
  });

  describe("toBeNear", () => {
    it("when satisfied", () => {
      expect(3.14).toBeNear(3.14159, 0.01);
    });
    it("when not satisfied", () => {
      try {
        expect(3.14).toBeNear(3.14159, 0.001);
      } catch (e) {
        if (e instanceof AssertionError) {
          return;
        }
      }
      throw new AssertionError("`expect` should have thrown an AssertionError");
    });
  });

  describe("toCompare", () => {
    it("when satisfied", () => {
      expect(1).toCompare("<", 2);
    });
    it("when not satisfied", () => {
      try {
        expect(2).toCompare("<", 1);
      } catch (e) {
        if (e instanceof AssertionError) {
          return;
        }
      }
      throw new AssertionError("`expect` should have thrown an AssertionError");
    });
  });
});
