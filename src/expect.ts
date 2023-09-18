export function expect<T>(actual: T): Expecter<T> {
  return new Expecter(actual);
}

export class Expecter<T> {
  constructor(private readonly actual: T) {}

  toMatch(matcher: AnyMatcher<T>): void {
    matcher = toMatcher(matcher);
    const valueNode = matcher[MATCHES](this.actual);
    if (isOk(valueNode)) {
      return;
    }
    const actualDescription = describeNode(valueNode, "");
    throw new AssertionError(`Actual:\n\n${indentText(actualDescription)}\n`);
  }

  toBe(expected: T): void {
    return this.toMatch(is(expected));
  }

  toCompare(
    this: Expecter<number | bigint>,
    operator: "<" | "<=" | ">" | ">=",
    limit: number | bigint,
  ): void {
    return this.toMatch(compares(operator, limit));
  }
}

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface Mismatch {
  readonly explanation: string;
}

export interface SimpleNode {
  readonly kind: "simple";
  readonly description: string;
  readonly mismatch?: Mismatch;
}

export declare namespace ArrayNode {
  // TODO: comment
  export interface PresentItem {
    kind: "present";
    node: ValueNode;
  }

  // TODO: comment
  export interface MissingItem {
    kind: "missing";
    explanation: string;
  }

  // TODO: comment
  export interface ExtraItem {
    kind: "extra";
    description: string;
    explanation: string;
  }

  export type Item = PresentItem | MissingItem | ExtraItem;
}

export interface ArrayNode {
  readonly kind: "array";
  readonly items: ArrayNode.Item[];
}

export interface ObjectNode {
  readonly kind: "object";
  readonly record: Readonly<{ [p: PropertyKey]: ValueNode }>;
}

export type ValueNode =
  | SimpleNode
  | ArrayNode
  | ObjectNode;

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
  }
}

function describeNode(node: ValueNode, maybeComma: "" | ","): string {
  switch (node.kind) {
    case "simple": {
      const { mismatch } = node;
      if (mismatch) {
        const explanation = //
          makeCyan(commentOut(`^ expected to ${mismatch.explanation}`));
        return `${makeRed(node.description)}${maybeComma}\n${explanation}`;
      } else {
        return `${node.description}${maybeComma}`;
      }
    }
    case "array": {
      const { items } = node;
      if (!items.length) {
        return `[]${maybeComma}`;
      }
      const contents = items
        .map((item) => {
          switch (item.kind) {
            case "present":
              return describeNode(item.node, ",");
            case "extra":
              return `${makeRed(item.description)},\n` +
                makeCyan(commentOut(item.explanation));
            case "missing":
              return makeRed(commentOut(item.explanation));
          }
        })
        .map((e) => `${indentText(e)}\n`)
        .join("");
      return `[\n${contents}]${maybeComma}`;
    }
    case "object": {
      const entries = Object.entries(node.record);
      if (!entries.length) {
        return "{}";
      }
      const contents = entries
        .map((e) => {
          const property = describeProperty(e[0]);
          return `${property}: ${describeNode(e[1], ",")}`;
        })
        .map((e) => `${indentText(e)}\n`)
        .join("");
      return `{\n${contents}}${maybeComma}`;
    }
  }
}

export const MATCHES: unique symbol = Symbol();

export abstract class Matcher<T> {
  abstract [MATCHES](input: Readonly<T>): ValueNode;
}

export type ImplicitObjectMatcher<T> = {
  [Property in keyof T]?: AnyMatcher<T[Property]>;
};

export type ImplicitMatcher<T> = //
  T extends ReadonlyArray<infer Item> ? ReadonlyArray<AnyMatcher<Item>>
    : T extends ReadonlySet<unknown> ? T
    : T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<K, AnyMatcher<V>>
    : T extends object ? ImplicitObjectMatcher<T>
    : T;

export type AnyMatcher<T> = ImplicitMatcher<T> | Matcher<T>;

export function is<T>(expected: T): Matcher<T> {
  return new ValueIs(expected);
}

export function compares(
  operator: "<" | "<=" | ">" | ">=",
  limit: number | bigint,
): Matcher<number | bigint> {
  return new ComparingMatcher(operator, limit);
}

export function toMatcher<T>(input: AnyMatcher<T>): Matcher<T> {
  // TODO: see if I can avoid the casts inside this function?
  if (input instanceof Matcher) {
    return input;
  } else if (Array.isArray(input)) {
    const matchers = input.map((e) => toMatcher(e));
    return new ArrayMatcher(matchers) as unknown as Matcher<T>;
  } else if (input instanceof Set) {
    return new SetMatcher(input) as unknown as Matcher<T>;
  } else if (input instanceof Map) {
    const expectedEntries = //
      new Map([...input.entries()].map((e) => [e[0], toMatcher(e[1])]));
    return new MapMatcher(expectedEntries) as unknown as Matcher<T>;
  } else if (input instanceof Object) {
    const spec: Record<PropertyKey, Matcher<unknown>> = {};
    for (const entry of Object.entries(input)) {
      const property = entry[0];
      const matcher = toMatcher(entry[1]);
      spec[property] = matcher;
    }
    return new ObjectMatcher(spec) as unknown as Matcher<T>;
  } else {
    return new ValueIs(input) as unknown as Matcher<T>;
  }
}

export function keyedItems<Item, KeyProperty extends keyof Item>(
  keyProperty: KeyProperty,
  items: ReadonlyArray<AnyMatcher<Item> & Pick<Item, KeyProperty>>,
  toHashable: (item: Item[KeyProperty]) => unknown = (item) => item,
): Matcher<Array<Item>> {
  const expectedEntries = new Map<unknown, Matcher<Item>>();
  for (const item of items) {
    const key = item[keyProperty] as Item[KeyProperty];
    const hashable = toHashable(key);
    if (expectedEntries.has(hashable)) {
      throw new Error(
        `Multiple matchers passed to #keyedItems() have the same key: ${key}`,
      );
    }
    expectedEntries.set(hashable, toMatcher(item as AnyMatcher<unknown>));
  }
  return new KeyedItems(keyProperty, expectedEntries, toHashable);
}

class ObjectMatcher<T> extends Matcher<T> {
  constructor(
    private readonly spec: {
      [Property in keyof T]: Matcher<T[Property]>;
    },
  ) {
    super();
  }

  [MATCHES](input: Readonly<T>): ValueNode {
    const record: { [p: PropertyKey]: ValueNode } = {};
    for (const property in this.spec) {
      const value = applyMatcherToFieldValue(input, property, this.spec);
      record[property] = value;
    }
    return {
      kind: "object",
      record: record,
    };
  }

  toString(): string {
    return describe(this.spec);
  }
}

function applyMatcherToFieldValue<T, Property extends keyof T>(
  object: T,
  property: Property,
  spec: { [Property in keyof T]: Matcher<T[Property]> },
): ValueNode {
  return spec[property][MATCHES](object[property]);
}

class ArrayMatcher<Item> extends Matcher<Array<Item>> {
  constructor(private readonly matchers: readonly Matcher<Item>[]) {
    super();
  }

  [MATCHES](input: ReadonlyArray<Item>): ValueNode {
    const { matchers } = this;
    const outItems: ArrayNode.Item[] = [];
    for (let i = 0; i < input.length && i < matchers.length; ++i) {
      const matcher = matchers[i];
      const inItem = input[i];
      outItems.push({
        kind: "present",
        node: matcher[MATCHES](inItem),
      });
    }
    // Missing items.
    for (let i = input.length; i < matchers.length; ++i) {
      const matcher = matchers[i];
      outItems.push({
        kind: "missing",
        explanation: `Missing item at index ${i}:\n${indentText(matcher)}`,
      });
    }
    // Extraneous items.
    for (let i = matchers.length; i < input.length; ++i) {
      const inItem = input[i];
      outItems.push({
        kind: "extra",
        description: describe(inItem),
        explanation: `^ unexpected item at index ${i}`,
      });
    }
    return {
      kind: "array",
      items: outItems,
    };
  }

  toString(): string {
    return describe(this.matchers);
  }
}

class SetMatcher<T> extends Matcher<ReadonlySet<T>> {
  constructor(private readonly expectedElements: ReadonlySet<T>) {
    super();
  }

  [MATCHES](input: ReadonlySet<T>): ValueNode {
    const { expectedElements } = this;
    const outItems: ArrayNode.Item[] = [];
    for (const actualElement of input) {
      const description = describe(actualElement);
      if (expectedElements.has(actualElement)) {
        outItems.push({
          kind: "present",
          node: {
            kind: "simple",
            description: description,
          },
        });
      } else {
        outItems.push({
          kind: "extra",
          description: description,
          explanation: "^ unexpected element",
        });
      }
    }
    // Missing elements.
    for (const expectedElement of this.expectedElements) {
      if (input.has(expectedElement)) {
        continue;
      }
      const description = describe(expectedElement);
      outItems.push({
        kind: "missing",
        explanation: `Missing element:\n${indentText(description)}`,
      });
    }
    return {
      kind: "array",
      items: outItems,
    };
  }

  toString(): string {
    return describe(this.expectedElements);
  }
}

class MapMatcher<K, V> extends Matcher<ReadonlyMap<K, V>> {
  constructor(private readonly expectedEntries: ReadonlyMap<K, Matcher<V>>) {
    super();
  }

  [MATCHES](input: ReadonlyMap<K, V>): ValueNode {
    const { expectedEntries } = this;
    const outItems: ArrayNode.Item[] = [];
    for (const actualEntry of input.entries()) {
      const [key, actualValue] = actualEntry;
      if (expectedEntries.has(key)) {
        const expectedMatcher = expectedEntries.get(key)!;
        outItems.push({
          kind: "present",
          node: expectedMatcher[MATCHES](actualValue),
        });
      } else {
        outItems.push({
          kind: "extra",
          description: describe(actualEntry),
          explanation: "^ unexpected entry",
        });
      }
    }
    // Missing keys.
    for (const expectedEntry of expectedEntries) {
      const key = expectedEntry[0];
      if (expectedEntries.has(key)) {
        continue;
      }
      const description = describe(key);
      outItems.push({
        kind: "missing",
        explanation: `Missing key:\n${indentText(description)}`,
      });
    }
    return {
      kind: "array",
      items: outItems,
    };
  }

  toString(): string {
    return describe(this.expectedEntries);
  }
}

class KeyedItems<Item, KeyProperty extends keyof Item>
  extends Matcher<ReadonlyArray<Item>> {
  constructor(
    private readonly keyProperty: KeyProperty,
    private readonly expectedEntries: ReadonlyMap<unknown, Matcher<Item>>,
    private readonly toHashable: (item: Item[KeyProperty]) => unknown,
  ) {
    super();
  }

  [MATCHES](input: ReadonlyArray<Item> | Map<unknown, Item>): ValueNode {
    input = new Map(
      [...input.values()].map((e) => [this.toHashable(e[this.keyProperty]), e]),
    );
    const { expectedEntries } = this;
    const outItems: ArrayNode.Item[] = [];
    for (const actualEntry of input.entries()) {
      const [key, actualValue] = actualEntry;
      if (expectedEntries.has(key)) {
        const expectedMatcher = expectedEntries.get(key)!;
        outItems.push({
          kind: "present",
          node: expectedMatcher[MATCHES](actualValue),
        });
      } else {
        outItems.push({
          kind: "extra",
          description: describe(actualValue),
          explanation: "^ unexpected item",
        });
      }
    }
    // Missing keys.
    for (const expectedEntry of expectedEntries) {
      const key = expectedEntry[0];
      if (expectedEntries.has(key)) {
        continue;
      }
      const description = describe(expectedEntry[1]);
      outItems.push({
        kind: "missing",
        explanation: `Missing item:\n${indentText(description)}`,
      });
    }
    return {
      kind: "array",
      items: outItems,
    };
  }

  toString(): string {
    return describe([...this.expectedEntries.values()]);
  }
}

class ValueIs<T> extends Matcher<T> {
  constructor(private readonly expected: T) {
    super();
  }

  [MATCHES](input: Readonly<T>): ValueNode {
    let mismatch: Mismatch | undefined;
    if (!Object.is(input, this.expected)) {
      mismatch = {
        explanation: `be ${describe(this.expected)}`,
      };
    }
    return {
      kind: "simple",
      description: describe(input),
      mismatch: mismatch,
    };
  }

  toString() {
    return describe(this.expected);
  }
}

class ComparingMatcher extends Matcher<number | bigint> {
  constructor(
    private readonly operator: "<" | "<=" | ">" | ">=",
    private readonly limit: number | bigint,
  ) {
    super();
  }

  [MATCHES](input: number | bigint): ValueNode {
    let ok: boolean;
    switch (this.operator) {
      case "<":
        ok = input < this.limit;
        break;
      case "<=":
        ok = input <= this.limit;
        break;
      case ">":
        ok = input > this.limit;
        break;
      case ">=":
        ok = input >= this.limit;
        break;
    }
    const mismatch: Mismatch | undefined = ok ? undefined : {
      explanation: `be ${this.operator} ${this.limit}`
    };
    return {
      kind: "simple",
      description: describe(input),
      mismatch: mismatch,
    };
  }

  toString() {
    return `compares(${this.operator}, ${this.limit})`;
  }
}

function prefixEachLinePastFirst(text: string, prefix: string): string {
  return text.replace(/\r|\n|\r\n/g, `$&${prefix}`);
}

function prefixEachLine(text: string, prefix: string): string {
  return text.replace(/^|\r|\n|\r\n/g, `$&${prefix}`);
}

function indentText(stringable: unknown): string {
  return prefixEachLine(String(stringable), "  ");
}

function commentOut(text: string): string {
  return prefixEachLine(text, "// ");
}

function makeRed(text: string): string {
  return `\x1b[31m${text}\x1b[0m`;
}

function makeCyan(text: string): string {
  return `\x1b[36m${text}\x1b[0m`;
}

function describe(value: unknown, indent = ""): string {
  if (Array.isArray(value)) {
    return describeArray(value, indent);
  } else if (value instanceof Set) {
    return `new Set([${describeArray([...value], indent)}])`;
  } else if (value instanceof Map) {
    return `new Map([${describeArray([...value], indent)}])`;
  } else if (value instanceof Date) {
    return `Date.parse(${JSON.stringify(value.toISOString())})`;
  } else if (value instanceof Object && !(value instanceof Matcher)) {
    return describeObject(value, indent);
  } else if (typeof value === "number") {
    if (Number.isNaN(value)) {
      return "Number.NaN";
    } else if (value === Number.POSITIVE_INFINITY) {
      return "Number.POSITIVE_INFINITY";
    } else if (value === Number.NEGATIVE_INFINITY) {
      return "Number.NEGATIVE_INFINITY";
    } else {
      return JSON.stringify(value);
    }
  } else if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  } else if (typeof value === "bigint") {
    return `BigInt(${JSON.stringify(String(value))})`;
  } else {
    // Call #toString() on value. If the string has multiple lines, indent all
    // the lines after the first one.
    return prefixEachLinePastFirst(String(value), `$&${indent + "  "}`);
  }
}

function describeArray<T>(array: readonly T[], indent: string): string {
  if (!array.length) {
    return "[]";
  }
  const moreIndented = indent + "  ";
  const contents = array
    .map((e) => `${moreIndented}${describe(e, moreIndented)},\n`)
    .join("");
  return `[\n${contents}${indent}]`;
}

function describeObject<T extends object>(object: T, indent: string): string {
  const entries = Object.entries(object);
  if (!entries.length) {
    return "{}";
  }
  const moreIndented = indent + "  ";
  const contents = entries
    .map((e) => `${moreIndented}${describeEntry(e, moreIndented)},\n`)
    .join("");
  return `{\n${contents}${indent}}`;
}

function describeEntry(entry: [unknown, unknown], indent: string): string {
  return `${describeProperty(entry[0])}: ${describe(entry[1], indent)}`;
}

function describeProperty(property: unknown) {
  return typeof property === "string" &&
      /^[A-Za-z$][0-9A-Za-z$]*$/.test(property)
    ? property
    : describe(property);
}
