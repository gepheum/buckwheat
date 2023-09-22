# Buckwheat

A TypeScript assertion library for writing useful unit tests faster. Less time
spent writing unit tests means more time writing production code or playing
outdoors.

Key features:

- Typesafe
- Write expectations on complex objects, thanks to smart matcher composition
- Precise blaming
- Copy-safe

Non-goal

Not a validation library for validating user input or input passed to an API.
Buckwheat is only meant to be used in unit tests.

Alternatives

Earl is an awesome assertion library written in TypeScript. It does have a few
design flaws, which we felt are important enough to writing and adding yet
another assertion library to the TypeScript ecosystem.

FAQ

I want to disable type-checking

Why is this missing so many matchers?
