/**
 * Result of comparing the actual value passed to `expect` against a matcher.
 * Mismatches are stored within sub-nodes.
 */
export type ValueNode = SimpleNode | ArrayNode | ObjectNode | Ellipsis;

/** A value without sub-nodes. */
export interface SimpleNode {
  readonly kind: "simple";
  readonly description: string;
  readonly mismatch?: SimpleNode.Mismatch;
}

export namespace SimpleNode {
  export interface Mismatch {
    /**
     * Describes the expected value.
     * Must start with a verb, e.g. "be positive".
     */
    readonly expected: string;
  }
}

/** Represents a collection value, e.g. an array or a set. */
export interface ArrayNode {
  readonly kind: "array";
  readonly items: ArrayNode.Item[];
}

export declare namespace ArrayNode {
  /**
   * A matcher was found for the item.
   * Does not mean that the actual item matches with this matcher.
   * For example, if the actual value is an array and the array matcher was
   * created from an array of N matchers, each of the first N items of the
   * actual array is represented as a `PresentItem`.
   */
  export interface PresentItem {
    kind: "present";
    node: ValueNode;
  }

  /** An item missing from the actual collection. Triggers a mismatch. */
  export interface MissingItem {
    kind: "missing";
    /** Explains that the item is missing and describes the orphan matcher. */
    explanation: string;
  }

  /**
   * An extraeous item in the actual collection with no matcher.
   * Triggers a mismatch.
   */
  export interface ExtraItem {
    kind: "extra";
    /** Describes the extraneous item. */
    description: string;
    /**
     * Explains that the item has no matcher.
     * Should start with a '^' symbol in order to refer to the value above.
     */
    explanation: string;
  }

  export type Item = PresentItem | MissingItem | ExtraItem;
}

/** Describes a collection of name-value pairs. */
export interface ObjectNode {
  readonly kind: "object";
  readonly record: Readonly<{ [p: PropertyKey]: ValueNode }>;
}

/**
 * A special node represented as "..." and indicating that the value is already
 * present in the tree. Helps avoid infinite recursion when an object references
 * itself.
 */
export interface Ellipsis {
  readonly kind: "...";
}
