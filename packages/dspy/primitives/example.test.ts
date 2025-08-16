/**
 * @fileoverview DSPy Example Tests
 * 
 * Comprehensive test suite for Example class to ensure compatibility
 * with Stanford DSPy behavior patterns.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Example } from './example';

describe('Example', () => {
  let example: Example;

  beforeEach(() => {
    example = new Example({
      question: 'What is the capital of France?',
      answer: 'Paris',
      reasoning: 'France is a country in Europe, and Paris is its capital city.',
      dspy_internal: 'should be filtered'
    });
  });

  describe('Constructor', () => {
    it('should create empty Example with no arguments', () => {
      const empty = new Example();
      expect(empty.data).toEqual({});
      expect(empty.inputKeys).toBeNull();
    });

    it('should create Example from object', () => {
      const data = { question: 'test', answer: 'result' };
      const ex = new Example(data);
      expect(ex.data).toEqual(data);
      expect(ex.get('question')).toBe('test');
      expect(ex.get('answer')).toBe('result');
    });

    it('should create Example from another Example', () => {
      const original = new Example({ a: 1, b: 2 }).withInputs('a');
      const copied = new Example(original);
      
      expect(copied.data).toEqual({ a: 1, b: 2 });
      expect(copied.inputKeys).toEqual(new Set(['a']));
      expect(copied).not.toBe(original); // Different instances
    });

    it('should merge kwargs with base data', () => {
      const base = { a: 1, b: 2 };
      const ex = new Example(base, { c: 3, a: 10 }); // a should be overridden
      
      expect(ex.data).toEqual({ a: 10, b: 2, c: 3 });
    });
  });

  describe('Input/Label Separation', () => {
    it('should throw error when accessing inputs without setting them', () => {
      expect(() => example.inputs()).toThrow(
        'Inputs have not been set for this example. Use `example.withInputs()` to set them.'
      );
    });

    it('should set input keys with withInputs', () => {
      const withInputs = example.withInputs('question');
      
      expect(withInputs.inputKeys).toEqual(new Set(['question']));
      expect(example.inputKeys).toBeNull(); // Original unchanged
    });

    it('should return only input fields with inputs()', () => {
      const withInputs = example.withInputs('question', 'reasoning');
      const inputs = withInputs.inputs();
      
      expect(inputs.data).toEqual({
        question: 'What is the capital of France?',
        reasoning: 'France is a country in Europe, and Paris is its capital city.'
      });
      expect(inputs.inputKeys).toEqual(new Set(['question', 'reasoning']));
    });

    it('should return only label fields with labels()', () => {
      const withInputs = example.withInputs('question');
      const labels = withInputs.labels();
      
      expect(labels.data).toEqual({
        answer: 'Paris',
        reasoning: 'France is a country in Europe, and Paris is its capital city.',
        dspy_internal: 'should be filtered'
      });
    });

    it('should handle empty inputs/labels correctly', () => {
      const withInputs = example.withInputs('nonexistent');
      const inputs = withInputs.inputs();
      const labels = withInputs.labels();
      
      expect(inputs.data).toEqual({});
      expect(Object.keys(labels.data).length).toBeGreaterThan(0);
    });
  });

  describe('Data Access Methods', () => {
    it('should get values with default fallback', () => {
      expect(example.get('question')).toBe('What is the capital of France?');
      expect(example.get('nonexistent')).toBeUndefined();
      expect(example.get('nonexistent', 'default')).toBe('default');
    });

    it('should filter dspy_ keys by default', () => {
      const keys = example.keys();
      const values = example.values();
      const items = example.items();
      
      expect(keys).not.toContain('dspy_internal');
      expect(values).not.toContain('should be filtered');
      expect(items.find(([key]) => key === 'dspy_internal')).toBeUndefined();
    });

    it('should include dspy_ keys when requested', () => {
      const keys = example.keys(true);
      const values = example.values(true);
      const items = example.items(true);
      
      expect(keys).toContain('dspy_internal');
      expect(values).toContain('should be filtered');
      expect(items.find(([key]) => key === 'dspy_internal')).toBeDefined();
    });

    it('should return correct length excluding dspy_ keys', () => {
      expect(example.length).toBe(3); // question, answer, reasoning (not dspy_internal)
    });
  });

  describe('Copy Operations', () => {
    it('should create independent copy', () => {
      const copied = example.copy();
      
      expect(copied.data).toEqual(example.data);
      expect(copied).not.toBe(example);
      
      // Modify copy, original should be unchanged
      copied.set('newField', 'newValue');
      expect(example.has('newField')).toBe(false);
    });

    it('should copy with overrides', () => {
      const copied = example.copy({ question: 'New question', extra: 'data' });
      
      expect(copied.get('question')).toBe('New question');
      expect(copied.get('answer')).toBe('Paris'); // Original data preserved
      expect(copied.get('extra')).toBe('data');
    });

    it('should copy without specified keys', () => {
      const withoutAnswer = example.without('answer', 'dspy_internal');
      
      expect(withoutAnswer.has('answer')).toBe(false);
      expect(withoutAnswer.has('dspy_internal')).toBe(false);
      expect(withoutAnswer.has('question')).toBe(true);
      expect(withoutAnswer.has('reasoning')).toBe(true);
    });

    it('should preserve input keys in copy operations', () => {
      const withInputs = example.withInputs('question');
      const copied = withInputs.copy();
      
      expect(copied.inputKeys).toEqual(new Set(['question']));
    });
  });

  describe('Utility Methods', () => {
    it('should check key existence', () => {
      expect(example.has('question')).toBe(true);
      expect(example.has('nonexistent')).toBe(false);
    });

    it('should set and delete keys', () => {
      example.set('newKey', 'newValue');
      expect(example.get('newKey')).toBe('newValue');
      
      example.delete('newKey');
      expect(example.has('newKey')).toBe(false);
    });

    it('should convert to dict', () => {
      const dict = example.toDict();
      expect(dict).toEqual(example.data);
      expect(dict).not.toBe(example.data); // Should be a copy
    });

    it('should provide meaningful string representation', () => {
      const str = example.toString();
      expect(str).toContain('Example(');
      expect(str).toContain('question');
      expect(str).toContain('input_keys=null');
      
      const withInputsStr = example.withInputs('question').toString();
      expect(withInputsStr).toContain('input_keys=["question"]');
    });
  });

  describe('Equality and Comparison', () => {
    it('should be equal to identical Example', () => {
      const other = new Example({
        question: 'What is the capital of France?',
        answer: 'Paris',
        reasoning: 'France is a country in Europe, and Paris is its capital city.',
        dspy_internal: 'should be filtered'
      });
      
      expect(example.equals(other)).toBe(true);
    });

    it('should not be equal to Example with different data', () => {
      const other = new Example({ question: 'Different question' });
      expect(example.equals(other)).toBe(false);
    });

    it('should not be equal to Example with different input keys', () => {
      const ex1 = example.withInputs('question');
      const ex2 = example.withInputs('answer');
      
      expect(ex1.equals(ex2)).toBe(false);
    });

    it('should handle null input keys in equality', () => {
      const ex1 = new Example({ a: 1 });
      const ex2 = new Example({ a: 1 });
      const ex3 = new Example({ a: 1 }).withInputs('a');
      
      expect(ex1.equals(ex2)).toBe(true);
      expect(ex1.equals(ex3)).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty Examples', () => {
      const empty = new Example();
      expect(empty.length).toBe(0);
      expect(empty.keys()).toEqual([]);
      expect(empty.values()).toEqual([]);
      expect(empty.items()).toEqual([]);
    });

    it('should handle Examples with only dspy_ keys', () => {
      const dspyOnly = new Example({ dspy_trace: 'trace', dspy_meta: 'meta' });
      expect(dspyOnly.length).toBe(0);
      expect(dspyOnly.keys()).toEqual([]);
      expect(dspyOnly.keys(true)).toEqual(['dspy_trace', 'dspy_meta']);
    });

    it('should handle undefined and null values', () => {
      const withNulls = new Example({ a: null, b: undefined, c: 'value' });
      expect(withNulls.get('a')).toBeNull();
      expect(withNulls.get('b')).toBeUndefined();
      expect(withNulls.has('a')).toBe(true);
      expect(withNulls.has('b')).toBe(true);
    });
  });
});