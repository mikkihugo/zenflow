/**
 * @fileoverview DSPy Example - Production Grade
 *
 * Core Example class for DSPy training and evaluation data.
 * 100% compatible with Stanford DSPy's Example interface.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
/**
 * DSPy Example class
 * Represents a single training/evaluation example with input-output pairs
 */
export declare class Example {
    data: Record<string, any>;
    constructor(inputsOrData?: Record<string, any>, outputs?: Record<string, any>);
    /**
     * Get value by key
     */
    get(key: string, defaultValue?: any): any;
    /**
     * Set value by key
     */
    set(key: string, value: any): void;
    /**
     * Check if key exists
     */
    has(key: string): boolean;
    /**
     * Get all keys
     */
    keys(): string[];
    /**
     * Get all values
     */
    values(): any[];
    /**
     * Get all entries
     */
    entries(): [string, any][];
    /**
     * Create a copy of the example
     */
    copy(): Example;
    /**
     * Deep copy the example
     */
    deepcopy(): Example;
    /**
     * Convert to plain object
     */
    toObject(): Record<string, any>;
    /**
     * Convert to JSON string
     */
    toJSON(): string;
    /**
     * Create example from JSON string
     */
    static fromJSON(json: string): Example;
    /**
     * Create example with input fields only
     */
    withInputsOnly(inputFields: string[]): Example;
    /**
     * Create example with specific fields
     */
    withFields(fields: string[]): Example;
    /**
     * Merge with another example
     */
    merge(other: Example): Example;
    /**
     * Check equality with another example
     */
    equals(other: Example): boolean;
    /**
     * Get size (number of fields)
     */
    get size(): number;
    /**
     * Check if empty
     */
    get isEmpty(): boolean;
    /**
     * Stanford DSPy compatible inputs() method
     * Returns a new Example with only input fields
     */
    inputs(): Example;
    /**
     * Stanford DSPy compatible labels() method
     * Returns a new Example with only output/label fields
     */
    labels(): Example;
    /**
     * Stanford DSPy compatible outputs() method (alias for labels)
     * Returns a new Example with only output fields
     */
    outputs(): Example;
    /**
     * Stanford DSPy compatible without() method
     * Returns a new Example excluding specified fields
     */
    without(...fields: string[]): Example;
    /**
     * Stanford DSPy compatible with_inputs method
     * Creates a new Example where specified fields are marked as inputs
     * This changes the behavior of inputs() and labels() methods
     */
    with_inputs(...fields: string[]): Example;
    /**
     * String representation
     */
    toString(): string;
    /**
     * Iterator support
     */
    [Symbol.iterator](): Iterator<[string, any]>;
}
export default Example;
//# sourceMappingURL=example.d.ts.map