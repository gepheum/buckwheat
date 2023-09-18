import { describe, it } from "mocha";
import { compares, expect } from "./expect";

interface User {
  userId: number;
  firstName: string;
  lastName: string;
}

describe("match object", () => {
  const johnDoe: User = {
    userId: 123,
    firstName: "John",
    lastName: "Doe",
  };
  it("matches object with right first name", () => {
    expect(johnDoe).toMatch({
      firstName: "John",
    });
  });
  it("matches object with right last name", () => {
    expect(johnDoe).toMatch({
      userId: 123,
      lastName: "Doe",
    });
  });
});

describe("comparison matcher", () => {
  it("<", () => {
    expect(3).toMatch(compares("<", 4));
    expect(BigInt(3)).toMatch(compares("<", 4));
    expect(3).toMatch(compares("<", BigInt(4)));
    expect(BigInt(3)).toMatch(compares("<", BigInt(4)));
  });
  it("<=", () => {
    expect(3).toMatch(compares("<=", 3));
    expect(3).toMatch(compares("<=", 4));
  });
  it(">", () => {
    expect(3).toMatch(compares(">", 2));
  });
  it("<", () => {
    expect(3).toMatch(compares(">=", 2));
    expect(3).toMatch(compares(">=", 3));
  });
});
