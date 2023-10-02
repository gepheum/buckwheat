import { REPRESENT_AS_SIMPLE_NODE } from "./value_to_node.js";
import { ValueNode } from "./value_node.js";

/**
 * A value which can be converted to a `Matcher<T>`, for example a `T` or a
 * `Matcher<T>`.
 */
export type AnyMatcher<T> = Matcher<T> | ImplicitMatcher<T>;

/** Verifies that a given `T` (the actual value) satisfies a condition. */
export abstract class Matcher<T> {
  // We "name" a method with a symbol so it does not show up in autocomplete.
  abstract [MATCHES](input: Readonly<T>): ValueNode;

  protected readonly [REPRESENT_AS_SIMPLE_NODE] = true;
}

export const MATCHES: unique symbol = Symbol();

export type ImplicitMatcher<T> = //
  T extends ReadonlyArray<infer Item> ? ReadonlyArray<AnyMatcher<Item>>
    : T extends ReadonlySet<unknown> ? T
    : T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<K, AnyMatcher<V>>
    : T extends string ? (string | RegExp)
    : T extends object ? ImplicitObjectMatcher<T>
    : T;

export type ImplicitObjectMatcher<T> = T extends any
  ? { [Property in keyof T]?: AnyMatcher<T[Property]> }
  : never;
