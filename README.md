# Buckwheat

A TypeScript assertion library for writing useful unit tests faster. Less time
spent writing unit tests means more time writing production code or being
outdoors.

```ts
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

## Core principles

### Compose matchers to test complex objects

Buckwheat makes it simple to create matchers for complex values.

If `T` is an object, any object whose keys are a subset of the keys of `T` and
whose values are matchers for the values of `T` is a matcher for `T`. If `T` is
an array of `Item`s, any array of matchers for `Item` is a matcher for `T`.
Finally, for every possible `T`, `T` itself is a matcher for `T`.

This grammar allows you to test a complex object with a single call to `expect`.
It offers several advantages over testing frameworks which ask you to write one
`expect` for every property and nested property of the complex object.

Consider this example copied from the Jest [documentation](https://jestjs.io/docs/expect#tohavepropertykeypath-value):

```javascript
// Example Referencing
expect(houseForSale).toHaveProperty('bath');
expect(houseForSale).toHaveProperty('bedrooms', 4);

expect(houseForSale).not.toHaveProperty('pool');

// Deep referencing using dot notation
expect(houseForSale).toHaveProperty('kitchen.area', 20);
expect(houseForSale).toHaveProperty('kitchen.amenities', [
  'oven',
  'stove',
  'washer',
]);

expect(houseForSale).not.toHaveProperty('kitchen.open');

// Deep referencing using an array containing the keyPath
expect(houseForSale).toHaveProperty(['kitchen', 'area'], 20);
expect(houseForSale).toHaveProperty(
  ['kitchen', 'amenities'],
  ['oven', 'stove', 'washer'],
);
expect(houseForSale).toHaveProperty(['kitchen', 'amenities', 0], 'oven');
expect(houseForSale).toHaveProperty(
  'livingroom.amenities[0].couch[0][1].dimensions[0]',
  20,
);
expect(houseForSale).toHaveProperty(['kitchen', 'nice.oven']);
expect(houseForSale).not.toHaveProperty(['kitchen', 'open']);

// Referencing keys with dot in the key itself
expect(houseForSale).toHaveProperty(['ceiling.height'], 'tall');
```

This is how you would write a similar unit test with Buckwheat:

```ts
expect(houseForSale).toMatch({
  bath: true,
  bedrooms: 4,
  kitchen: {
    amenities: ['oven', 'stove', 'washer'],
    area: 20,
    wallColor: 'white',
    'nice.oven': true,
  },
  livingroom: {
    amenities: [
      {
        couch: [
          ['large', {dimensions: [20, 20]}],
          ['small', {dimensions: [10, 10]}],
        ],
      },
    ],
  },
  'ceiling.height': 2,
});
```

- Typesafe
- Shameless copy-pasting
- Integrable into any test suite
- Simplicity

## Non-goal

Not a validation library for validating user input or input passed to an API.
Buckwheat is only meant to be used in unit tests.

## Matchers

## Alternatives

Earl is an awesome assertion library written in TypeScript. It does have a few
design flaws, which we felt are important enough to writing and adding yet
another assertion library to the TypeScript ecosystem.

## FAQ

I want to disable type-checking

Why is this missing so many matchers?
