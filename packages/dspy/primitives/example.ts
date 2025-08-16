/**
 * @fileoverview DSPy Example Implementation
 * 
 * TypeScript port of dspy/primitives/example.py
 * Core data structure for all DSPy operations.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import type { Example as Example } from '../interfaces/types';

/**
 * Example class - Core data structure for DSPy training and evaluation
 * 
 * Faithful TypeScript port of Python DSPy Example with proper typing.
 * Maintains compatibility with Stanford DSPy patterns.
 */
export class Example implements Example {
  private _data: Record<string, any>;
  private _inputKeys: Set<string> | null;

  /**
   * Create a new Example instance
   * 
   * @param base - Base data or another Example to copy from
   * @param kwargs - Additional key-value pairs to include
   */
  constructor(base?: Record<string, any> | Example, kwargs: Record<string, any> = {}) {
    this._data = {};
    this._inputKeys = null;

    // Initialize from a base Example if provided
    if (base && base instanceof Example) {
      this._data = { ...base._data };
      this._inputKeys = base._inputKeys ? new Set(base._inputKeys) : null;
    }
    // Initialize from a dict if provided
    else if (base && typeof base === 'object') {
      this._data = { ...base };
    }

    // Update with provided kwargs
    Object.assign(this._data, kwargs);
  }

  /**
   * Get readonly access to internal data
   */
  get data(): Record<string, any> {
    return { ...this._data };
  }

  /**
   * Get readonly access to input keys
   */
  get inputKeys(): Set<string> | null {
    return this._inputKeys ? new Set(this._inputKeys) : null;
  }

  /**
   * Create a copy with specified keys marked as inputs
   * 
   * @param keys - Keys to mark as input fields
   * @returns New Example with input keys set
   */
  withInputs(...keys: string[]): Example {
    const copied = this.copy();
    copied._inputKeys = new Set(keys);
    return copied;
  }

  /**
   * Get Example containing only input fields
   * 
   * @returns New Example with only input data
   */
  inputs(): Example {
    if (this._inputKeys === null) {
      throw new Error('Inputs have not been set for this example. Use `example.withInputs()` to set them.');
    }

    // Return items that are in input_keys
    const inputData: Record<string, any> = {};
    for (const key of Object.keys(this._data)) {
      if (this._inputKeys.has(key)) {
        inputData[key] = this._data[key];
      }
    }

    const newInstance = new Example(inputData);
    newInstance._inputKeys = new Set(this._inputKeys);
    return newInstance;
  }

  /**
   * Get Example containing only label fields (non-input fields)
   * 
   * @returns New Example with only label data
   */
  labels(): Example {
    const inputKeys = this.inputs().keys();
    const inputKeySet = new Set(inputKeys);

    // Return items that are NOT in input_keys
    const labelData: Record<string, any> = {};
    for (const key of Object.keys(this._data)) {
      if (!inputKeySet.has(key)) {
        labelData[key] = this._data[key];
      }
    }

    return new Example(labelData);
  }

  /**
   * Create a copy of this Example
   * 
   * @param overrides - Additional data to include in the copy
   * @returns New Example instance
   */
  copy(overrides: Record<string, any> = {}): Example {
    const copied = new Example(this._data, overrides);
    copied._inputKeys = this._inputKeys ? new Set(this._inputKeys) : null;
    return copied;
  }

  /**
   * Create a copy without specified keys
   * 
   * @param keys - Keys to exclude from the copy
   * @returns New Example without specified keys
   */
  without(...keys: string[]): Example {
    const copied = this.copy();
    for (const key of keys) {
      delete copied._data[key];
    }
    return copied;
  }

  /**
   * Convert to plain JavaScript object
   * 
   * @returns Copy of internal data
   */
  toDict(): Record<string, any> {
    return { ...this._data };
  }

  /**
   * Get value for a key with optional default
   * 
   * @param key - Key to retrieve
   * @param defaultValue - Default value if key not found
   * @returns Value or default
   */
  get(key: string, defaultValue?: any): any {
    return this._data.hasOwnProperty(key) ? this._data[key] : defaultValue;
  }

  /**
   * Get all keys, optionally including DSPy internal keys
   * 
   * @param includeDspy - Whether to include keys starting with 'dspy_'
   * @returns Array of keys
   */
  keys(includeDspy: boolean = false): string[] {
    return Object.keys(this._data).filter(key => 
      !key.startsWith('dspy_') || includeDspy
    );
  }

  /**
   * Get all values, optionally including DSPy internal values
   * 
   * @param includeDspy - Whether to include values for keys starting with 'dspy_'
   * @returns Array of values
   */
  values(includeDspy: boolean = false): any[] {
    return Object.entries(this._data)
      .filter(([key]) => !key.startsWith('dspy_') || includeDspy)
      .map(([, value]) => value);
  }

  /**
   * Get all key-value pairs, optionally including DSPy internal pairs
   * 
   * @param includeDspy - Whether to include pairs for keys starting with 'dspy_'
   * @returns Array of [key, value] tuples
   */
  items(includeDspy: boolean = false): [string, any][] {
    return Object.entries(this._data).filter(([key]) => 
      !key.startsWith('dspy_') || includeDspy
    );
  }

  /**
   * Get the number of non-internal keys
   * 
   * @returns Number of keys (excluding dspy_ prefixed keys)
   */
  get length(): number {
    return this.keys().length;
  }

  /**
   * Check if a key exists in the example
   * 
   * @param key - Key to check
   * @returns True if key exists
   */
  has(key: string): boolean {
    return key in this._data;
  }

  /**
   * Set a value for a key
   * 
   * @param key - Key to set
   * @param value - Value to set
   */
  set(key: string, value: any): void {
    this._data[key] = value;
  }

  /**
   * Delete a key from the example
   * 
   * @param key - Key to delete
   */
  delete(key: string): void {
    delete this._data[key];
  }

  /**
   * String representation of the Example
   */
  toString(): string {
    const displayData = Object.fromEntries(
      Object.entries(this._data).filter(([key]) => !key.startsWith('dspy_'))
    );
    const inputKeysStr = this._inputKeys ? JSON.stringify(Array.from(this._inputKeys)) : 'null';
    return `Example(${JSON.stringify(displayData)}) (input_keys=${inputKeysStr})`;
  }

  /**
   * Check equality with another Example
   * 
   * @param other - Other Example to compare with
   * @returns True if Examples are equal
   */
  equals(other: Example): boolean {
    if (!(other instanceof Example)) {
      return false;
    }

    // Compare data
    const thisKeys = Object.keys(this._data).sort();
    const otherKeys = Object.keys(other._data).sort();
    
    if (thisKeys.length !== otherKeys.length) {
      return false;
    }

    for (let i = 0; i < thisKeys.length; i++) {
      if (thisKeys[i] !== otherKeys[i]) {
        return false;
      }
      if (this._data[thisKeys[i]] !== other._data[otherKeys[i]]) {
        return false;
      }
    }

    // Compare input keys
    if (this._inputKeys === null && other._inputKeys === null) {
      return true;
    }
    if (this._inputKeys === null || other._inputKeys === null) {
      return false;
    }
    if (this._inputKeys.size !== other._inputKeys.size) {
      return false;
    }
    for (const key of this._inputKeys) {
      if (!other._inputKeys.has(key)) {
        return false;
      }
    }

    return true;
  }
}