/**
 * @fileoverview Tests for DSPy Module Base Class
 * 
 * Comprehensive test suite for the BaseModule class and DSPyModule interface.
 * Ensures proper module lifecycle, parameter management, and execution tracking.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseModule, type Parameter, type ModuleState } from '../../../../lib/dspy/primitives/module';

// Test implementation of BaseModule
class TestModule extends BaseModule {
  forward(input: string): { result: string } {
    return { result: `processed: ${input}` };
  }
}

// Another test implementation with parameters
class ParameterizedModule extends BaseModule {
  constructor() {
    super();
    this.addParameter('learning_rate', 0.01, true, { type: 'optimizer' });
    this.addParameter('model_name', 'test-model', false, { type: 'config' });
  }

  forward(input: number): { output: number } {
    const lr = this.named_parameters()['learning_rate'].value;
    return { output: input * lr };
  }
}

describe('BaseModule', () => {
  let module: TestModule;
  let paramModule: ParameterizedModule;

  beforeEach(() => {
    module = new TestModule();
    paramModule = new ParameterizedModule();
    // Clear static state between tests
    BaseModule['savedStates'].clear();
  });

  describe('Constructor and Basic Setup', () => {
    it('should initialize with default values', () => {
      expect(module.compiled).toBe(false);
      expect(module.history).toEqual([]);
      expect(module.callbacks).toBeUndefined();
    });

    it('should initialize with callbacks', () => {
      const callbacks = [{ pre: () => {}, post: () => {} }];
      const moduleWithCallbacks = new TestModule(callbacks);
      expect(moduleWithCallbacks.callbacks).toBe(callbacks);
    });

    it('should have empty parameters by default', () => {
      expect(module.parameters()).toEqual([]);
      expect(module.named_parameters()).toEqual({});
      expect(module.predictors()).toEqual([]);
    });
  });

  describe('Execution and History Tracking', () => {
    it('should execute forward method via __call__', () => {
      const result = module.__call__('test input');
      expect(result).toEqual({ result: 'processed: test input' });
    });

    it('should track execution history', () => {
      module.__call__('input1');
      module.__call__('input2');

      expect(module.history).toHaveLength(2);
      expect(module.history[0].inputs).toEqual(['input1']);
      expect(module.history[0].outputs).toEqual({ result: 'processed: input1' });
      expect(module.history[1].inputs).toEqual(['input2']);
      expect(module.history[1].outputs).toEqual({ result: 'processed: input2' });
    });

    it('should track execution timing', () => {
      module.__call__('test');
      const execution = module.history[0];
      
      expect(execution.timestamp).toBeDefined();
      expect(execution.duration).toBeDefined();
      expect(typeof execution.duration).toBe('number');
      expect(execution.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle async execution', async () => {
      const result = await module.acall('async test');
      expect(result).toEqual({ result: 'processed: async test' });
      expect(module.history).toHaveLength(1);
    });
  });

  describe('Callback Execution', () => {
    it('should execute pre-callbacks before forward', () => {
      const preCallback = { pre: vi.fn() };
      const moduleWithCallback = new TestModule([preCallback]);
      
      moduleWithCallback.__call__('test');
      
      expect(preCallback.pre).toHaveBeenCalledWith(moduleWithCallback, ['test']);
    });

    it('should execute post-callbacks after forward', () => {
      const postCallback = { post: vi.fn() };
      const moduleWithCallback = new TestModule([postCallback]);
      
      const result = moduleWithCallback.__call__('test');
      
      expect(postCallback.post).toHaveBeenCalledWith(
        moduleWithCallback, 
        ['test'], 
        result
      );
    });

    it('should execute error callbacks on exception', () => {
      const errorCallback = { error: vi.fn() };
      
      class ErrorModule extends BaseModule {
        forward() {
          throw new Error('Test error');
        }
      }
      
      const errorModule = new ErrorModule([errorCallback]);
      
      expect(() => errorModule.__call__('test')).toThrow('Test error');
      expect(errorCallback.error).toHaveBeenCalled();
    });
  });

  describe('Parameter Management', () => {
    it('should manage parameters correctly', () => {
      const params = paramModule.parameters();
      expect(params).toHaveLength(2);
      
      const namedParams = paramModule.named_parameters();
      expect(namedParams['learning_rate']).toEqual({
        name: 'learning_rate',
        value: 0.01,
        trainable: true,
        metadata: { type: 'optimizer' }
      });
      
      expect(namedParams['model_name']).toEqual({
        name: 'model_name',
        value: 'test-model',
        trainable: false,
        metadata: { type: 'config' }
      });
    });

    it('should filter predictor parameters', () => {
      // Add a predictor parameter
      paramModule['addParameter']('predictor_param', 'value', true, { type: 'predictor' });
      
      const predictorParams = paramModule.predictors();
      expect(predictorParams).toHaveLength(1);
      expect(predictorParams[0].name).toBe('predictor_param');
    });

    it('should update parameter values', () => {
      paramModule['updateParameter']('learning_rate', 0.02);
      
      const updatedParam = paramModule.named_parameters()['learning_rate'];
      expect(updatedParam.value).toBe(0.02);
    });
  });

  describe('Language Model Management', () => {
    it('should set and get language model', () => {
      const mockLM = { generate: () => 'response' };
      
      module.set_lm(mockLM);
      expect(module.get_lm()).toBe(mockLM);
    });
  });

  describe('State Management', () => {
    it('should save and load module state', () => {
      // Set up module state
      paramModule.__call__(5); // Execute to create history
      paramModule.compiled = true;
      
      // Save state
      const savePath = 'test-module-state';
      paramModule.save(savePath, { include_history: true });
      
      // Create new module and load state
      const newModule = new ParameterizedModule();
      newModule.load(savePath);
      
      expect(newModule.compiled).toBe(true);
      expect(newModule.parameters()).toEqual(paramModule.parameters());
    });

    it('should save without history by default', () => {
      paramModule.__call__(5);
      paramModule.save('test-no-history');
      
      const newModule = new ParameterizedModule();
      newModule.load('test-no-history');
      
      // History should be empty since include_history was not set
      expect(newModule.history).toEqual([]);
    });

    it('should throw error when loading non-existent state', () => {
      expect(() => module.load('non-existent-path')).toThrow();
    });
  });

  describe('Copying and Cloning', () => {
    it('should create deep copy', () => {
      paramModule.__call__(5);
      paramModule.compiled = true;
      
      const copy = paramModule.deepcopy() as ParameterizedModule;
      
      // Should have same parameters but different instances
      expect(copy.parameters()).toEqual(paramModule.parameters());
      expect(copy).not.toBe(paramModule);
      
      // History should be empty in copy
      expect(copy.history).toEqual([]);
      expect(copy.compiled).toBe(false);
    });

    it('should create reset copy', () => {
      paramModule.__call__(5);
      paramModule.compiled = true;
      
      const resetCopy = paramModule.reset_copy() as ParameterizedModule;
      
      expect(resetCopy.parameters()).toEqual(paramModule.parameters());
      expect(resetCopy.history).toEqual([]);
      expect(resetCopy.compiled).toBe(false);
    });

    it('should maintain independence between copies', () => {
      const copy = paramModule.deepcopy() as ParameterizedModule;
      
      // Modify original
      paramModule['updateParameter']('learning_rate', 0.05);
      
      // Copy should be unaffected
      const copyParam = copy.named_parameters()['learning_rate'];
      expect(copyParam.value).toBe(0.01); // Original value
    });
  });

  describe('Batch Processing', () => {
    it('should process batch of examples', () => {
      // Mock examples - using compatible format
      const examples = [
        { inputs: () => ({ data: { input: 'test1' } }) },
        { inputs: () => ({ data: { input: 'test2' } }) },
        { inputs: () => ({ data: { input: 'test3' } }) }
      ] as any[];
      
      const results = module.batch(examples);
      
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ result: 'processed: [object Object]' });
      expect(module.history).toHaveLength(3);
    });

    it('should respect batch size option', () => {
      const examples = [
        { inputs: () => ({ data: { input: 'test1' } }) },
        { inputs: () => ({ data: { input: 'test2' } }) },
        { inputs: () => ({ data: { input: 'test3' } }) }
      ] as any[];
      
      const results = module.batch(examples, { batch_size: 2 });
      
      expect(results).toHaveLength(3);
      expect(module.history).toHaveLength(3);
    });
  });

  describe('Compilation Status', () => {
    it('should track compilation status', () => {
      expect(module.compiled).toBe(false);
      
      module.compiled = true;
      expect(module.compiled).toBe(true);
      expect(module._compiled).toBe(true);
    });
  });
});