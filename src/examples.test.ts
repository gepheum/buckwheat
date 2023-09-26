/** @fileoverview Examples to copy to README.md. */

import { describe, it } from "mocha";
import { expect } from "./expect.js";
import { near } from "./matchers.js";

interface Pet {
  name: string;
  heightInMeters: number;
}

interface User {
  userId: number;
  name: string;
  quote: string;
  pets: Pet[];
  ssn?: string;
}

describe("examples", () => {
  it.skip("top-level example", () => {
    const tarzan: User = {
      userId: 123,
      name: "Tarzan",
      quote: "AAAAaAaAaAyAAAAaAaAaAyAAAAaAaAaA",
      pets: [
        {
          name: "Cheeta",
          heightInMeters: 1.67,
        },
      ],
    };

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
});
