/** @fileoverview Factory functions returning matchers. */

import { AnyMatcher, Matcher } from "./matcher.js";
import { ArrayMatcher } from "./matchers/array.js";
import { ComparesMatcher } from "./matchers/compares.js";
import { DateMatcher } from "./matchers/date.js";
import { IsMatcher } from "./matchers/is.js";
import { KeyedItemsMatcher } from "./matchers/keyed_items.js";
import { MapMatcher } from "./matchers/map.js";
import { NearMatcher } from "./matchers/near.js";
import { ObjectMatcher } from "./matchers/object.js";
import { SetMatcher } from "./matchers/set.js";
import { StringPatternMatcher } from "./matchers/string_pattern.js";

export function toMatcher<T>(input: Matcher<T>): Matcher<T>;
export function toMatcher<Item, ItemMatcher extends AnyMatcher<Item>>(
  input: ReadonlyArray<ItemMatcher>,
): Matcher<Item[]>;
export function toMatcher<Item>(input: ReadonlySet<Item>): Matcher<Set<Item>>;
export function toMatcher<K, V, M extends AnyMatcher<V>>(
  input: ReadonlyMap<K, M>,
): Matcher<Map<K, V>>;
export function toMatcher(input: RegExp): Matcher<string>;
export function toMatcher<K extends PropertyKey, V, M extends AnyMatcher<V>>(
  input: Record<K, M>,
): Matcher<Record<K, V>>;
export function toMatcher<T>(input: AnyMatcher<T>): Matcher<T>;

/**
 * Converts the given `AnyMatcher<T>` to a `Matcher<T>` using the following
 * logic:
 * <ul>
 * <li>If `input` is already a `Matcher`, returns it as-is.
 * <li>If `input` is an array of `AnyMatcher<Item>`, returns a matcher which
 * verifies that every item in the actual array match the matcher at the same
 * index in `input`. For example, `toMatcher([10, is(20)])` verifies that the
 * actual array has exactly 2 items and that they are 10 and 20.
 * <li>If `input` is a `Set`, returns a matcher which verifies that the actual
 * set has the same elements as `input`.
 * <li>If `input` is a `Map<K, AnyMatcher<V>>`, returns a matcher which verifies
 * that the actual map has the same keys as `input`, and that every value in the
 * actual map matches the matcher with the same key in `input.
 * <li>If `input` is a `Date`, returns a matcher which verifies that the actual
 * date has the same timestamp as `input`.
 * <li>If `input` is a `RegExpr`, returns a matcher which verifies that there is
 * at least one match between the expected pattern and the actual string.
 * <li>If `input` is an object, returns a matcher which verifies that the
 * properties of the actual object are a subset of the properties of `input`,
 * and that every value in the actual object matches the corresponding matcher
 * in `input`.
 * <li>Otherwise, returns a matcher which verifies that the actual value and
 * `input` are the same value according to `Object.is()`.
 * </ul>
 */
export function toMatcher<T>(input: AnyMatcher<T>): Matcher<T> {
  if (input instanceof Matcher) {
    return input;
  } else if (Array.isArray(input)) {
    const matchers = input.map((e) => toMatcher(e));
    return new ArrayMatcher<unknown>(matchers) as unknown as Matcher<T>;
  } else if (input instanceof Set) {
    return new SetMatcher(input) as unknown as Matcher<T>;
  } else if (input instanceof Map) {
    const expectedEntries = //
      new Map([...input.entries()].map((e) => [e[0], toMatcher(e[1])]));
    return new MapMatcher(expectedEntries) as unknown as Matcher<T>;
  } else if (input instanceof Date) {
    return new DateMatcher(input) as unknown as Matcher<T>;
  } else if (input instanceof RegExp) {
    return new StringPatternMatcher(input) as unknown as Matcher<T>;
  } else if (input instanceof Object) {
    const spec: Record<PropertyKey, Matcher<unknown>> = {};
    for (const entry of Object.entries(input)) {
      const property = entry[0];
      const matcher = toMatcher(entry[1]);
      spec[property] = matcher;
    }
    return new ObjectMatcher(spec) as unknown as Matcher<T>;
  } else {
    return new IsMatcher(input) as unknown as Matcher<T>;
  }
}

/**
 * Returns a matcher which verifies that the actual value and `expected` are the
 * same value, according to `Object.is()`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#description
 */
export function is<T>(expected: T): Matcher<T> {
  return new IsMatcher(expected);
}

/**
 * Returns a matcher which verifies that the absolute difference between the
 * actual value and `target` is at most `epsilon`.
 */
export function near(target: number, epsilon: number): Matcher<number> {
  return new NearMatcher(target, epsilon);
}

/**
 * Returns a matcher which verifies that the inequality relationship between the
 * actual value and `limit` can be described with the given operator.
 */
export function compares(
  operator: "<" | "<=" | ">" | ">=",
  limit: number | bigint,
): Matcher<number | bigint> {
  return new ComparesMatcher(operator, limit);
}

/**
 * Returns a matcher which verifies that the actual array has the same length as
 * `matchers`, and that every item in the actual array matches the matcher with
 * the same key in `items`. Items and matchers don't need to be in the same
 * order.
 *
 * The key is obtained by extracting the `keyProperty` from the item or matcher
 * and optionally passing it to the `toHashable` function if provided.
 *
 * @example
 * const jane = {
 *   userId: 111,
 *   name: "Jane",
 * };
 *
 * const john = {
 *   userId: 222,
 *   name: "John",
 * };
 *
 * expect(
 *   [jane, john]
 * ).toMatch(
 *   "userId",
 *   [
 *     {
 *       userId: 222,
 *     },
 *     {
 *       userId: 111,
 *       name: "Jane",
 *     },
 *   ],
 * );
 */
export function keyedItems<Item, KeyProperty extends keyof Item>(
  keyProperty: KeyProperty,
  matchers: ReadonlyArray<AnyMatcher<Item> & Pick<Item, KeyProperty>>,
  toHashable: (item: Item[KeyProperty]) => unknown = (item) => item,
): Matcher<Array<Item>> {
  const expectedEntries = new Map<unknown, Matcher<Item>>();
  for (const item of matchers) {
    const key = item[keyProperty] as Item[KeyProperty];
    const hashable = toHashable(key);
    if (expectedEntries.has(hashable)) {
      throw new Error(
        `Matchers passed to #keyedItems() must have distinct keys; duplicate key: ${key}`,
      );
    }
    expectedEntries.set(hashable, toMatcher(item as AnyMatcher<unknown>));
  }
  return new KeyedItemsMatcher(keyProperty, expectedEntries, toHashable);
}
