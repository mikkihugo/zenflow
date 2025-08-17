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
  
  constructor(data: Record<string, any> = {}) {
    this.data = { ...data };
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
          return { value: entries[index++], done: false };
        } else {
          return { done: true, value: undefined };
        }
      }
    };
  }
}

export default Example;