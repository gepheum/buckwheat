import { describe, it } from "mocha";
import { expect } from "./expect";

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
