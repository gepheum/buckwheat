/** @fileoverview Examples to copy to README.md. */
import { expect } from "./expect.js";
import { near } from "./matchers.js";
import { describe, it } from "mocha";

interface Pet {
  name: string;
  heightInMeters: number;
  picture: string;
}

interface User {
  userId: number;
  name: string;
  quote: string;
  pets: Pet[];
  ssn?: string;
}

describe("examples", () => {
  const tarzan: User = {
    userId: 123,
    name: "Tarzan",
    quote: "AAAAaAaAaAyAAAAaAaAaAyAAAAaAaAaA",
    pets: [
      {
        name: "Cheeta",
        heightInMeters: 1.67,
        picture: "🐒",
      },
    ],
  };

  it.skip("top-level example", () => {
    expect(tarzan).toMatch({
      name: "Tarzan",
      quote: /^A/, // must start with the letter A
      pets: [
        {
          name: "Cheeta",
          heightInMeters: near(1.6, 0.01),
        },
      ],
      // `userId` is not specified so it can be anything
    });

    expect(tarzan).toMatch({
      name: "Tarzan",
      // Will fail if Tarzan has a social security number.
      ssn: undefined,
    });
  });

  it.skip("copy-paste example", () => {
    expect([tarzan]).toMatch([]);
  });
});
