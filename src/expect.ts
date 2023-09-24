import { describeNode } from "./describe_node.js";
import { indentText } from "./format.js";
import { AnyMatcher, MATCHES } from "./matcher.js";
import { compares, is, near, toMatcher } from "./matchers.js";
import { ValueNode } from "./value_node.js";

/**
 * Returns an object which can be used to verify that `actual` satisfies some
 * conditions.
 *
 * @example
 * expect(fibonacci(7)).toBe(13);
 */
export function expect<T>(actual: T): Expecter<T> {
  return new Expecter(actual);
}

export class Expecter<T> {
  constructor(private readonly actual: T) {}

  /**
   * Verifies that the actual value matches the given matcher.
   * Throws an assertion error otherwise.
   */
  toMatch(matcher: AnyMatcher<T>): void {
    matcher = toMatcher(matcher);
    const valueNode = matcher[MATCHES](this.actual);
    if (isOk(valueNode)) {
      return;
    }
    const actualDescription = describeNode(valueNode, "");
    throw new AssertionError(
      `\x1b[0mthe actual value is:\n\n${indentText(actualDescription)}\n`,
    );
  }

  /**
   * Verifies that the actual value and `expected` are the same value according
   * to `Object.is()`. Throws an assertion error otherwise.
   *
   * You probably don't want to pass an object or an array to this function,
   * unless you want to check that the actual value reference the same object in
   * memory.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#description
   */
  toBe(expected: T): void {
    return this.toMatch(is(expected));
  }

  /**
   * Verifies that the absolute difference between the actual value and `limit`
   * is at most `epsilon`. Throws an assertion error otherwise.
   */
  toBeNear(
    this: Expecter<number>,
    limit: number, epsilon: number): void {
    return this.toMatch(near(limit, epsilon));
  }

  /**
   * Verifies that the inequality relationship between the actual value and
   * `limit` can be described with the given operator. Throws an assertion error
   * otherwise.
   */
  toCompare(
    this: Expecter<number | bigint>,
    operator: "<" | "<=" | ">" | ">=",
    limit: number | bigint,
  ): void {
    return this.toMatch(compares(operator, limit));
  }
}

/**
 * Error thrown by an {@link Expecter} when the actual value does not satisfy
 * the expected condition.
 */
export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

function isOk(node: ValueNode): boolean {
  switch (node.kind) {
    case "simple":
      return !node.mismatch;
    case "array":
      return node.items.every((item) => {
        switch (item.kind) {
          case "extra":
          case "missing":
            return false;
          case "present":
            return isOk(item.node);
        }
      });
    case "object":
      return Object.values(node.record).every((node) => isOk(node));
    case "...":
      return true;
  }
}
