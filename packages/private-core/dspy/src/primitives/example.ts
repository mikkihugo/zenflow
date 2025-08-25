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
export class Example {
  public data: Record<string, any>;

  constructor(
    inputsOrData?: Record<string, any>,
    outputs?: Record<string, any>
  ) {
    if (
      typeof inputsOrData === 'object' &&
      inputsOrData !== null &&
      outputs === undefined
    ) {
      // Single object constructor: new Example({question: "What?", answer: "42"})
      this.data = { ...inputsOrData };
    } else if (
      typeof inputsOrData === 'object' &&
      typeof outputs === 'object'
    ) {
      // Two-object constructor: new Example({question: "What?"}, {answer: "42"})
      this.data = {
        ...inputsOrData,
        ...outputs,
      };
    } else {
      // Default empty constructor
      this.data = {};
    }
  }

  /**
   * Get value by key
   */
  get(key: string, defaultValue?: any): any {
    return this.data[key] ?? defaultValue;
  }

  /**
   * Set value by key
   */
  set(key: string, value: any): void {
    this.data[key] = value;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return key in this.data;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Object.keys(this.data);
  }

  /**
   * Get all values
   */
  values(): any[] {
    return Object.values(this.data);
  }

  /**
   * Get all entries
   */
  entries(): [string, any][] {
    return Object.entries(this.data);
  }

  /**
   * Create a copy of the example
   */
  copy(): Example {
    return new Example(this.data);
  }

  /**
   * Deep copy the example
   */
  deepcopy(): Example {
    const deepCopyData = JSON.parse(JSON.stringify(this.data));
    return new Example(deepCopyData);
  }

  /**
   * Convert to plain object
   */
  toObject(): Record<string, any> {
    return { ...this.data };
  }

  /**
   * Convert to JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.data);
  }

  /**
   * Create example from JSON string
   */
  static fromJSON(json: string): Example {
    const data = JSON.parse(json);
    return new Example(data);
  }

  /**
   * Create example with input fields only
   */
  withInputsOnly(inputFields: string[]): Example {
    const inputData: Record<string, any> = {};
    for (const field of inputFields) {
      if (this.has(field)) {
        inputData[field] = this.get(field);
      }
    }
    return new Example(inputData);
  }

  /**
   * Create example with specific fields
   */
  withFields(fields: string[]): Example {
    const filteredData: Record<string, any> = {};
    for (const field of fields) {
      if (this.has(field)) {
        filteredData[field] = this.get(field);
      }
    }
    return new Example(filteredData);
  }

  /**
   * Merge with another example
   */
  merge(other: Example): Example {
    return new Example({ ...this.data, ...other.data });
  }

  /**
   * Check equality with another example
   */
  equals(other: Example): boolean {
    return JSON.stringify(this.data) === JSON.stringify(other.data);
  }

  /**
   * Get size (number of fields)
   */
  get size(): number {
    return Object.keys(this.data).length;
  }

  /**
   * Check if empty
   */
  get isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Stanford DSPy compatible inputs() method
   * Returns a new Example with only input fields
   */
  inputs(): Example {
    const inputData: Record<string, any> = {};

    // If input fields are explicitly designated, use those
    if ((this as any)._input_fields) {
      const inputFields = (this as any)._input_fields as Set<string>;
      for (const [key, value] of Object.entries(this.data)) {
        if (inputFields.has(key)) {
          inputData[key] = value;
        }
      }
    } else {
      // Otherwise, use heuristic approach
      const outputFields = new Set([
        'answer',
        'output',
        'result',
        'prediction',
        'target',
        'label',
        'completion',
      ]);
      for (const [key, value] of Object.entries(this.data)) {
        if (!outputFields.has(key.toLowerCase())) {
          inputData[key] = value;
        }
      }
    }

    return new Example(inputData);
  }

  /**
   * Stanford DSPy compatible labels() method
   * Returns a new Example with only output/label fields
   */
  labels(): Example {
    const outputData: Record<string, any> = {};

    // If input fields are explicitly designated, labels are everything else
    if ((this as any)._input_fields) {
      const inputFields = (this as any)._input_fields as Set<string>;
      for (const [key, value] of Object.entries(this.data)) {
        if (!inputFields.has(key)) {
          outputData[key] = value;
        }
      }
    } else {
      // Otherwise, use heuristic approach for output fields
      const outputFields = new Set([
        'answer',
        'output',
        'result',
        'prediction',
        'target',
        'label',
        'completion',
      ]);
      for (const [key, value] of Object.entries(this.data)) {
        if (outputFields.has(key.toLowerCase())) {
          outputData[key] = value;
        }
      }
    }

    return new Example(outputData);
  }

  /**
   * Stanford DSPy compatible outputs() method (alias for labels)
   * Returns a new Example with only output fields
   */
  outputs(): Example {
    return this.labels();
  }

  /**
   * Stanford DSPy compatible without() method
   * Returns a new Example excluding specified fields
   */
  without(...fields: string[]): Example {
    const filteredData: Record<string, any> = {};
    const fieldsToExclude = new Set(fields);

    for (const [key, value] of Object.entries(this.data)) {
      if (!fieldsToExclude.has(key)) {
        filteredData[key] = value;
      }
    }

    return new Example(filteredData);
  }

  /**
   * Stanford DSPy compatible with_inputs method
   * Creates a new Example where specified fields are marked as inputs
   * This changes the behavior of inputs() and labels() methods
   */
  with_inputs(...fields: string[]): Example {
    const newExample = new Example(this.data);
    // Store the input field designation
    (newExample as any)._input_fields = new Set(fields);
    return newExample;
  }

  /**
   * String representation
   */
  toString(): string {
    return `Example(${JSON.stringify(this.data)})`;
  }

  /**
   * Iterator support
   */
  [Symbol.iterator](): Iterator<[string, any]> {
    const entries = this.entries();
    let index = 0;

    return {
      next(): IteratorResult<[string, any]> {
        if (index < entries.length) {
          const entry = entries[index++];
          if (entry) {
            return { value: entry, done: false };
          }
        }
        return { done: true, value: undefined };
      },
    };
  }
}

export default Example;
