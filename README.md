# Buckwheat

Buckwheat is a TypeScript assertion library for writing useful unit tests
faster. Less time spent writing unit tests means more time writing production
code or being outdoors.

```typescript
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
```

When running this unit test with a framework like Mocha, the console output is:

```diff
  AssertionError: the actual value is:

    {
      name: "Tarzan",
      quote: "AAAAaAaAaAyAAAAaAaAaAyAAAAaAaAaA",
      pets: [
        {
          name: "Cheeta",
-         heightInMeters: 1.67,
+         // ^ expected to be near 1.6 ± 0.01
        },
      ],
    }
```

## Key features

### Compose matchers to test complex objects

Buckwheat makes it simple to create matchers for complex values.

If `T` is an object, any object whose keys are a subset of the keys of `T` and
whose values are matchers for the values of `T` is a matcher for `T`. If `T` is
an array of `Item`s, any array of matchers for `Item` is a matcher for `T`.
Finally, for every possible `T`, `T` itself is a matcher for `T`.

This grammar allows you to test a complex object with a single call to `expect`.
It offers several advantages over testing frameworks which ask you to write one
`expect` for every property and nested property of the complex object. See this
[example](https://jestjs.io/docs/expect#tohavepropertykeypath-value) in the
official Jest documentation.

```typescript
// Test properties one by one (bad)

expect(tarzan.name).toBe("tarzan");
expect(tarzan.quote).toMatch(/^A/);
expect(tarzan.pets).toHaveLength(1);
expect(tarzan.pets[0].name).toBe("Cheeta");
expect(tarzan.pets[0].lengthInMeters).toBeCloseTo(1.6, 0.01);
```

That approach has a couple flaws. First, it takes more time to write unit tests
this way. Second, if one expectation fails, the console output will only show
the value of the corresponding property as opposed to the value of the whole
object, and the other expectations will not be tested until the first one is
fixed. These flaws can result in you spending more time on unit tests than you
should.

### Only test fields explicitly set in the matcher

Comparing the expected value and the actual value using deep object **equality**
is not the best practice in unit tests, because it means that when you add a
field to a class, you will need to update all the unit tests which look at
instances of the class so they pass. This is not only laborious, this goes
against a principle of unit testing: each unit test should be focused on a
specific piece of logic.

When testing objects, Buckwheat only looks at properties explicitly set in the
matcher. The other properties present in the object being tested are ignored. To
check that a property is _not_ set in the object being tested, simply set the
property to `undefined` in the matcher:

```typescript
expect(tarzan).toMatch({
  name: "Tarzan",
  // Will fail if Tarzan has a social security number.
  ssn: undefined,
});
```

### Type safety

Buckwheat was written with type safety in mind. Misspelling a property within a
nested object or assigning a matcher for type A to a property of type B will
make the compiler unhappy.

```typescript
expect(tarzan).toMatch({
  pets: [
    {
      name: near(1.6, 0.01),  // COMPILER ERROR: expects a string matcher
      height: 1.67,  // COMPILER ERROR: did you mean `heightInMeters'?
    },
  ],
});
```

Although type safety might seem less relevant in the context of unit testing
than in production code, it helps improve productivity in two ways. First, it
allows you to catch errors in your unit tests before running them. Second, it
greatly improves the quality of autocompletion in the IDE. Both things can help
you save precious time, which is the primary goal of Buckwheat.

### Copy from the console output, paste to your unit test

Sometimes when a unit test fails, the actual value is in fact correct and it's
the matcher which is wrong. When this happens, Buckwheat makes it easy to update
the matcher: it prints the actual value as valid JavaScript code (when
possible). You can then replace the argument of the `toMatch()` method with the
value copied from the console output and make some edits if needed.

You can even take this idea one step further, and skip the part where you try to
write a correct matcher in the first place. Write for example:

```typescript
// Tip: wrap the actual value inside a singleton array so the console output
// shows all the properties of the object. Otherwise the console output will
// only show properties set in the matcher.
expect([tarzan]).toMatch([]);
```

Running this failing unit test will output:

```diff
  AssertionError: the actual value is:

    [
-     {
-       userId: 123,
-       name: "Tarzan",
-       quote: "AAAAaAaAaAyAAAAaAaAaAyAAAAaAaAaA",
-       pets: [
-         {
-           name: "Cheeta",
-           heightInMeters: 1.67,
-         },
-       ],
-     },
+     // ^ unexpected item at index 0
    ]
```

Copy the value in red into `toMatch()`, remove the square brackets around
`tarzan` and you will end up with a working unit test:

```typescript
expect(tarzan).toMatch(
  {
    userId: 123,
    name: "Tarzan",
    quote: "AAAAaAaAaAyAAAAaAaAaAyAAAAaAaAaA",
    pets: [
      {
        name: "Cheeta",
        heightInMeters: 1.67,
      },
    ],
  },
);
```

Although this practice might seem heretic because you are more likely to let
errors in your code slip through, it can also help you save a lot of time. In
some situations it's worth the trade-off. If you decide to go this way, make
sure you carefully look at the actual value before copying it to your unit test.

### Works with any testing framework

Buckwheat is not a framework, it's a simple assertion library. It can be used
within any testing framework. We recommend Mocha.

## Non-goal

Buckwheat is not a validation library for checking user inputs or inputs passed
to an API. Buckwheat is only meant to be used in unit tests.

## User guide

### How matching works

The logic to determine if an actual value is as expected depends on the type of
the matcher provided:

- If `matcher` implements the `Matcher` abstract class, as is the case of all
  the ones listed in the _Custom matchers_ section, Buckwheat applies the custom
  logic implemented by the matcher.
- If `matcher` is an array, Buckwheat expects the actual value to be an array of
  same length as `matcher`, and each item in the actual array is matched against
  the item at the same index in `matcher`.
- If `matcher` is a `Set`, Buckwheat expects the actual value to be a set
  containing the same elements.
- If `matcher` is a `Map`, Buckwheat expects the actual value to be a map
  containing the same keys, and each value in the actual map is matched against
  the corresponding value in `matcher`.
- If `matcher` is a `Date`, Buckwheat expects the actual value to be a date with
  the same timestamp.
- If `matcher` is a `RegExpr`, Buckwheats expects there to be at least one match
  between the given pattern and the actual string.
- If `matcher` is an `Object`, Buckwheat expects the actual value to be an
  object. For every property of `matcher`, the value of the actual object is
  matched against the value of `matcher`. If a property is missing from the
  actual object, the value resolves to `undefined`. Properties present in the
  actual object and missing from `matcher` are ignored.
- Otherwise, Buckwheat compares the actual value against `matcher` using
  [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#description).

Buckwheat tries all these rules in order and stops at the first rule which
triggers.

### Custom matchers

#### `is()`

```typescript
export function is<T>(expected: T): Matcher<T>;
```

Returns a matcher which verifies that the actual value and `expected` are the
same value, according to [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#description).

Example:

```typescript
expect(tarzan).toMatch(
  {
    pets: [
      // For the test to pass, `cheeta` and Tarzan's only pet must both
      // reference the same object in memory.
      is(cheeta),
    ],
  },
);
```

#### `near()`

```typescript
export function near(target: number, epsilon: number): Matcher<number>;
```

Returns a matcher which verifies that the absolute difference between the actual
value and `target` is at most `epsilon`.

#### `compares()`

```typescript
export function compares(
  operator: "<" | "<=" | ">" | ">=",
  limit: number | bigint,
): Matcher<number | bigint>;
```

Returns a matcher which verifies that the inequality relationship between the
actual value and `limit` can be described with the given operator.

Example:

```typescript
expect(tarzan).toMatch(
  {
    pets: [
      {
        // For the test to pass, Cheeta must be at least 1.5 meters tall.
        heightInMeters: compares(">=", 1.5),
      },
    ],
  },
);
```

#### `keyedItems()`

```typescript
export function keyedItems<Item, KeyProperty extends keyof Item>(
  keyProperty: KeyProperty,
  matchers: ReadonlyArray<AnyMatcher<Item> & Pick<Item, KeyProperty>>,
  toHashable: (item: Item[KeyProperty]) => unknown = (item) => item,
): Matcher<Array<Item>>;
```

Returns a matcher which verifies that the actual array has the same length as
`matchers`, and that every item in the actual array matches the matcher with the
same key in `items`. Items and matchers don't need to be in the same order.

The key is obtained by extracting the `keyProperty` from the item or matcher and
optionally passing it to the `toHashable` function if provided.

```typescript
expect(tarzan).toMatch({
  // For the test to pass, Tarzan must have exactly 2 pets in any order.
  // One pet must be named "Max" and its picture must be "🐶". The other pet must
  // be named "Cheeta" and its picture must be one of "🐒", "🙉", "🙈" or "🙊".
  pets: keyedItems(
    "name",
    [
      {
        name: "Max",
        picture: "🐶",
      },
      {
        name: "Cheeta",
        picture: /🐒|🙉|🙈|🙊/,
      },
    ],
  ),
});
```

#### `satisfies()`

```typescript
export function satisfies<T>(
  predicate: (input: T) => boolean,
  description: string,
): Matcher<T>;
```

Returns a matcher which verifies that the `predicate` function returns true when
applied to the actual value.

Example:

```typescript
expect(24).toMatch(satisfies((n) => n % 2 === 0, "be even"));
```

## Comparison with Earl

[Earl](https://earl.fun/) is an awesome assertion library written in TypeScript.
We tried it, but unfortunately we found that it has a couple design flaws which
are serious enough to justify adding yet another assertion library to the
TypeScript ecosystem, and this is why we wrote Buckwheat.

### Type safety of functions returning matchers

Although Earl claims to be written with type safety in mind, the return type of
all the functions creating matchers is `never`. This essentially disables
compile-time type checking:

```typescript
import { expect } from "earl";

// This compiles with Earl but probably should not.
expect(doggy).toEqual({
  name: closeTo(3.14, 0.001),
});
```

This is justified by the fact that `toEqual()` expects a `T`, but it's _not
really_ a `T` because the value of each property within the object can be a
matcher. If `closeTo()` returned a `Matcher<number>`, the compiler would not
allow us to assign the matcher to a numeric field. By making the return type
`never`, the compiler lets us assign the matcher to a numeric field, but also
unfortunately to any non-numeric field.

Buckwheat uses [mapped types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
and [conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
to work around this problem. The `toMatch()` method expects an `AnyMatcher<T>`
instead of a `T`. This allows more errors to be detected at compile-time.

### The better option than `toEqual` has weaker type safety

When testing objects we think it's better to only look at properties explicitly
set in the matcher than to use deep object equality. The reasons are outlined
[here](#only-test-fields-explicitly-set-in-the-matcher). So Earl's
[`toHaveSubset`](https://earl.fun/api/api-reference.html#tohavesubset-this-validators-object-subset-subset-void)
is often a better choice than `toEqual`, but unfortunately it has even weaker
type safety: the compiler does not require the properties of the object matcher
to be present in `T`.

```typescript
import { expect } from "earl";

// This too compiles with Earl but probably should not.
expect(doggy).toHaveSubset({
  naem: "Waffles",  // `name` is misspelled
});
```

## Contributions

Are welcome! Buckwheat is still very young and lacks many features that other assertion
libraries have, but it was written with extensibility in mind.

## Authors

Buckwheat was written by [Tyler Fibonacci](https://github.com/gepheum).

## License

Published under the MIT License. Copyright © 2023 Gepheum.
