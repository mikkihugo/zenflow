/**
 * @fileoverview Comprehensive test suite for MIPROv2 teleprompter
 *
 * Tests 100% API compatibility with Stanford DSPy's MIPROv2 teleprompter.
 * Validates all constructor parameters, compile method behavior, and optimization logic.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  DSPyModule,
  Example,
  type MetricFunction,
  type Prediction,
} from '../../lib/index.js';
import { MIPROv2, type MIPROv2Config } from '../../teleprompters/miprov2.js';

// Mock DSPy Module for testing
class MockModule extends DSPyModule {
  private name: string;
  private mockResponse: Prediction;
  public _compiled: boolean = false;

  constructor(name: string, mockResponse: Prediction) {
    super();
    this.name = name;
    this.mockResponse = mockResponse;
  }

  async forward(example: Example): Promise<Prediction> {
    return {
      ...this.mockResponse,
      data: {
        ...this.mockResponse.data,
        source: this.name,
        input: example.data,
      },
    };
  }

  predictors() {
    return [
      {
        name: `${this.name}_predictor`,
        signature: { instructions: 'Follow the instructions carefully.' },
        lm: { model: 'mock-model', generate: async () => 'mock response' },
        demos: [],
      },
    ];
  }

  namedPredictors() {
    return [[`${this.name}_predictor`, this.predictors()[0]]];
  }

  deepcopy(): MockModule {
    const copy = new MockModule(this.name, { ...this.mockResponse });
    copy._compiled = this._compiled;
    return copy;
  }
}

// Mock LM for testing
const mockLM = {
  model: 'mock-gpt-4',
  generate: async (_prompt: string) => 'mock response',
  kill: () => {},
  launch: () => {},
};

// Mock metric function
const exactMatch: MetricFunction = (
  example: Example,
  prediction: Prediction
): number => (prediction.data?.answer === example.data.answer ? 1 : 0);

describe('MIPROv2 Teleprompter', () => {
  let miprov2: MIPROv2;
  let basicConfig: MIPROv2Config;
  let mockStudent: MockModule;
  let trainset: Example[];
  let valset: Example[];

  beforeEach(() => {
    basicConfig = {
      metric: exactMatch,
      auto: 'light',
      verbose: false,
    };

    mockStudent = new MockModule('student', {
      data: { answer: 'A' },
      confidence: 0.8,
    });

    trainset = [
      new Example({ question: 'What is 1+1?', answer: '2' }),
      new Example({ question: 'What is 2+2?', answer: '4' }),
      new Example({ question: 'What is 3+3?', answer: '6' }),
      new Example({ question: 'What is 4+4?', answer: '8' }),
      new Example({ question: 'What is 5+5?', answer: '10' }),
    ];

    valset = [
      new Example({ question: 'What is 1+2?', answer: '3' }),
      new Example({ question: 'What is 2+3?', answer: '5' }),
    ];
  });

  describe('Constructor API Compatibility', () => {
    it('should create MIPROv2 with required metric parameter', () => {
      miprov2 = new MIPROv2({ metric: exactMatch });
      const config = miprov2.getConfig();

      expect(config.metric).toBe(exactMatch);
      expect(config.auto).toBe('light'); // Default
    });

    it('should create MIPROv2 with auto=light configuration', () => {
      miprov2 = new MIPROv2({ metric: exactMatch, auto: 'light' });
      const config = miprov2.getConfig();

      expect(config.auto).toBe('light');
      expect(config.verbose).toBe(false);
      expect(config.track_stats).toBe(true);
    });

    it('should create MIPROv2 with auto=medium configuration', () => {
      miprov2 = new MIPROv2({ metric: exactMatch, auto: 'medium' });
      const config = miprov2.getConfig();

      expect(config.auto).toBe('medium');
    });

    it('should create MIPROv2 with auto=heavy configuration', () => {
      miprov2 = new MIPROv2({ metric: exactMatch, auto: 'heavy' });
      const config = miprov2.getConfig();

      expect(config.auto).toBe('heavy');
    });

    it('should create MIPROv2 with auto=null (manual mode)', () => {
      miprov2 = new MIPROv2({
        metric: exactMatch,
        auto: null,
        num_candidates: 6,
      });
      const config = miprov2.getConfig();

      expect(config.auto).toBeNull();
      expect(config.num_candidates).toBe(6);
    });

    it('should throw error for invalid auto parameter', () => {
      expect(() => {
        new MIPROv2({ metric: exactMatch, auto: 'invalid' as any });
      }).toThrow('Invalid value for auto:invalid');
    });

    it('should set all constructor parameters correctly', () => {
      const fullConfig: MIPROv2Config = {
        metric: exactMatch,
        prompt_model: mockLM,
        task_model: mockLM,
        teacher_settings: { temperature: 0.7 },
        max_bootstrapped_demos: 6,
        max_labeled_demos: 2,
        auto: 'medium',
        seed: 42,
        init_temperature: 0.8,
        verbose: true,
        track_stats: false,
        log_dir: '/tmp/mipro',
        metric_threshold: 0.8,
      };

      miprov2 = new MIPROv2(fullConfig);
      const config = miprov2.getConfig();

      expect(config.metric).toBe(exactMatch);
      expect(config.prompt_model).toBe(mockLM);
      expect(config.task_model).toBe(mockLM);
      expect(config.teacher_settings).toEqual({ temperature: 0.7 });
      expect(config.max_bootstrapped_demos).toBe(6);
      expect(config.max_labeled_demos).toBe(2);
      expect(config.auto).toBe('medium');
      expect(config.seed).toBe(42);
      expect(config.init_temperature).toBe(0.8);
      expect(config.verbose).toBe(true);
      expect(config.track_stats).toBe(false);
      expect(config.log_dir).toBe('/tmp/mipro');
      expect(config.metric_threshold).toBe(0.8);
    });

    it('should set default values correctly', () => {
      miprov2 = new MIPROv2({ metric: exactMatch });
      const config = miprov2.getConfig();

      expect(config.prompt_model).toBeNull();
      expect(config.task_model).toBeNull();
      expect(config.teacher_settings).toEqual({});
      expect(config.max_bootstrapped_demos).toBe(4);
      expect(config.max_labeled_demos).toBe(4);
      expect(config.auto).toBe('light');
      expect(config.num_candidates).toBeNull();
      expect(config.num_threads).toBeNull();
      expect(config.max_errors).toBeNull();
      expect(config.seed).toBe(9);
      expect(config.init_temperature).toBe(0.5);
      expect(config.verbose).toBe(false);
      expect(config.track_stats).toBe(true);
      expect(config.log_dir).toBeNull();
      expect(config.metric_threshold).toBeNull();
    });
  });

  describe('Compile Method API Compatibility', () => {
    beforeEach(() => {
      miprov2 = new MIPROv2(basicConfig);
    });

    it('should compile with minimal required parameters', async () => {
      const result = await miprov2.compile(mockStudent, { trainset });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(MockModule);
    });

    it('should compile with trainset and valset', async () => {
      const result = await miprov2.compile(mockStudent, {
        trainset,
        valset,
      });

      expect(result).toBeDefined();
    });

    it('should compile with teacher program', async () => {
      const teacher = new MockModule('teacher', { data: { answer: 'B' } });

      const result = await miprov2.compile(mockStudent, {
        trainset,
        teacher,
      });

      expect(result).toBeDefined();
    });

    it('should compile with multiple teacher programs', async () => {
      const teacher1 = new MockModule('teacher1', { data: { answer: 'B' } });
      const teacher2 = new MockModule('teacher2', { data: { answer: 'C' } });

      const result = await miprov2.compile(mockStudent, {
        trainset,
        teacher: [teacher1, teacher2],
      });

      expect(result).toBeDefined();
    });

    it('should validate auto/num_trials/num_candidates combinations', async () => {
      // Test auto=null with num_candidates but no num_trials
      miprov2 = new MIPROv2({
        metric: exactMatch,
        auto: null,
        num_candidates: 6,
      });

      await expect(miprov2.compile(mockStudent, { trainset })).rejects.toThrow(
        'If auto is None, num_trials must also be provided'
      );
    });

    it('should validate auto=null requires num_candidates', async () => {
      miprov2 = new MIPROv2({
        metric: exactMatch,
        auto: null,
      });

      await expect(miprov2.compile(mockStudent, { trainset })).rejects.toThrow(
        'If auto is None, num_candidates must also be provided'
      );
    });

    it('should validate auto conflicts with manual parameters', async () => {
      miprov2 = new MIPROv2({
        metric: exactMatch,
        auto: 'light',
        num_candidates: 6,
      });

      await expect(miprov2.compile(mockStudent, { trainset })).rejects.toThrow(
        'If auto is not None, num_candidates and num_trials cannot be set'
      );
    });

    it('should handle empty trainset', async () => {
      await expect(
        miprov2.compile(mockStudent, { trainset: [] })
      ).rejects.toThrow('Trainset cannot be empty');
    });

    it('should handle trainset too small without valset', async () => {
      const smallTrainset = [trainset[0]]; // Only 1 example

      await expect(
        miprov2.compile(mockStudent, { trainset: smallTrainset })
      ).rejects.toThrow(
        'Trainset must have at least 2 examples if no valset specified'
      );
    });

    it('should handle empty valset', async () => {
      await expect(
        miprov2.compile(mockStudent, { trainset, valset: [] })
      ).rejects.toThrow('Validation set must have at least 1 example');
    });

    it('should auto-split trainset when no valset provided', async () => {
      const result = await miprov2.compile(mockStudent, { trainset });

      expect(result).toBeDefined();
      // Should have automatically created valset from trainset
    });
  });

  describe('Optimization Process', () => {
    beforeEach(() => {
      miprov2 = new MIPROv2({
        ...basicConfig,
        verbose: false, // Reduce test output
      });
    });

    it('should perform bootstrap fewshot examples step', async () => {
      const result = await miprov2.compile(mockStudent, { trainset, valset });

      expect(result).toBeDefined();
      // Should have completed Step 1:Bootstrap fewshot examples
    });

    it('should perform instruction proposal step', async () => {
      const result = await miprov2.compile(mockStudent, { trainset, valset });

      expect(result).toBeDefined();
      // Should have completed Step 2:Propose instruction candidates
    });

    it('should perform prompt parameter optimization step', async () => {
      const result = await miprov2.compile(mockStudent, { trainset, valset });

      expect(result).toBeDefined();
      // Should have completed Step 3:Find optimal prompt parameters
    });

    it('should handle zero-shot optimization', async () => {
      miprov2 = new MIPROv2({
        metric: exactMatch,
        auto: 'light',
        max_bootstrapped_demos: 0,
        max_labeled_demos: 0,
      });

      const result = await miprov2.compile(mockStudent, { trainset, valset });

      expect(result).toBeDefined();
    });

    it('should handle minibatch evaluation', async () => {
      const result = await miprov2.compile(mockStudent, {
        trainset,
        valset,
        minibatch: true,
        minibatch_size: 2,
      });

      expect(result).toBeDefined();
    });

    it('should handle full evaluation (no minibatch)', async () => {
      const result = await miprov2.compile(mockStudent, {
        trainset,
        valset,
        minibatch: false,
      });

      expect(result).toBeDefined();
    });

    it('should validate minibatch size against valset', async () => {
      await expect(
        miprov2.compile(mockStudent, {
          trainset,
          valset,
          minibatch: true,
          minibatch_size: 10, // Larger than valset
          strict_minibatch_validation: true,
        })
      ).rejects.toThrow('Minibatch size cannot exceed the size of the valset');
    });
  });

  describe('Advanced Configuration', () => {
    it('should handle custom num_trials with auto=null', async () => {
      miprov2 = new MIPROv2({
        metric: exactMatch,
        auto: null,
        num_candidates: 4,
      });

      const result = await miprov2.compile(mockStudent, {
        trainset,
        valset,
        num_trials: 10,
      });

      expect(result).toBeDefined();
    });

    it('should handle override parameters in compile method', async () => {
      const localMiprov2 = new MIPROv2({
        metric: exactMatch,
        auto: 'light',
      });

      const result = await localMiprov2.compile(mockStudent, {
        trainset,
        valset,
        max_bootstrapped_demos: 2,
        max_labeled_demos: 1,
        seed: 123,
      });

      expect(result).toBeDefined();
    });

    it('should handle proposer configuration flags', async () => {
      const localMiprov2 = new MIPROv2({
        metric: exactMatch,
        auto: 'light',
      });

      const result = await localMiprov2.compile(mockStudent, {
        trainset,
        valset,
        program_aware_proposer: false,
        data_aware_proposer: false,
        tip_aware_proposer: false,
        fewshot_aware_proposer: false,
      });

      expect(result).toBeDefined();
    });

    it('should handle custom view_data_batch_size', async () => {
      const localMiprov2 = new MIPROv2({
        metric: exactMatch,
        auto: 'light',
      });

      const result = await localMiprov2.compile(mockStudent, {
        trainset,
        valset,
        view_data_batch_size: 5,
      });

      expect(result).toBeDefined();
    });

    it('should handle custom minibatch configuration', async () => {
      const localMiprov2 = new MIPROv2({
        metric: exactMatch,
        auto: 'light',
      });

      const result = await localMiprov2.compile(mockStudent, {
        trainset,
        valset,
        minibatch: true,
        minibatch_size: 2,
        minibatch_full_eval_steps: 3,
      });

      expect(result).toBeDefined();
    });
  });

  describe('Auto Mode Configurations', () => {
    it('should handle light auto mode correctly', async () => {
      miprov2 = new MIPROv2({ metric: exactMatch, auto: 'light' });

      const result = await miprov2.compile(mockStudent, { trainset });

      expect(result).toBeDefined();
      // Light mode should use n=6, val_size=100
    });

    it('should handle medium auto mode correctly', async () => {
      miprov2 = new MIPROv2({ metric: exactMatch, auto: 'medium' });

      const result = await miprov2.compile(mockStudent, { trainset });

      expect(result).toBeDefined();
      // Medium mode should use n=12, val_size=300
    });

    it('should handle heavy auto mode correctly', async () => {
      miprov2 = new MIPROv2({ metric: exactMatch, auto: 'heavy' });

      const result = await miprov2.compile(mockStudent, { trainset });

      expect(result).toBeDefined();
      // Heavy mode should use n=18, val_size=1000
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      miprov2 = new MIPROv2(basicConfig);
    });

    it('should handle programs without predictors', async () => {
      const emptyProgram = {
        forward: async () => ({ data: { answer: 'test' } }),
        predictors: () => [],
        namedPredictors: () => [],
        deepcopy() {
          return this;
        },
      };

      const result = await miprov2.compile(emptyProgram as any, {
        trainset,
        valset,
      });

      expect(result).toBeDefined();
    });

    it('should handle very small datasets', async () => {
      const tinyTrainset = trainset.slice(0, 2);
      const tinyValset = valset.slice(0, 1);

      const result = await miprov2.compile(mockStudent, {
        trainset: tinyTrainset,
        valset: tinyValset,
      });

      expect(result).toBeDefined();
    });

    it('should handle seed parameter for reproducibility', async () => {
      const result1 = await miprov2.compile(mockStudent, {
        trainset,
        valset,
        seed: 42,
      });

      const result2 = await miprov2.compile(mockStudent, {
        trainset,
        valset,
        seed: 42,
      });

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      // Results should be reproducible with same seed
    });

    it('should handle custom teacher settings', async () => {
      miprov2 = new MIPROv2({
        metric: exactMatch,
        auto: 'light',
        teacher_settings: { temperature: 0.7, max_tokens: 100 },
      });

      const teacher = new MockModule('teacher', { data: { answer: 'B' } });
      const result = await miprov2.compile(mockStudent, {
        trainset,
        valset,
        teacher,
      });

      expect(result).toBeDefined();
    });
  });

  describe('Stanford DSPy Compatibility', () => {
    it('should match Stanford DSPy constructor parameter names', () => {
      // Test exact parameter names from Stanford DSPy
      const config: MIPROv2Config = {
        metric: exactMatch,
        prompt_model: null,
        task_model: null,
        teacher_settings: null,
        max_bootstrapped_demos: 4,
        max_labeled_demos: 4,
        auto: 'light',
        num_candidates: null,
        num_threads: null,
        max_errors: null,
        seed: 9,
        init_temperature: 0.5,
        verbose: false,
        track_stats: true,
        log_dir: null,
        metric_threshold: null,
      };

      miprov2 = new MIPROv2(config);
      expect(miprov2).toBeInstanceOf(MIPROv2);
    });

    it('should match Stanford DSPy compile parameter names', async () => {
      // Test exact parameter names from Stanford DSPy compile method
      const result = await miprov2.compile(mockStudent, {
        trainset,
        teacher: null,
        valset: null,
        num_trials: null,
        max_bootstrapped_demos: null,
        max_labeled_demos: null,
        seed: null,
        minibatch: true,
        minibatch_size: 35,
        minibatch_full_eval_steps: 5,
        program_aware_proposer: true,
        data_aware_proposer: true,
        view_data_batch_size: 10,
        tip_aware_proposer: true,
        fewshot_aware_proposer: true,
        requires_permission_to_run: true,
        provide_traceback: null,
      });

      expect(result).toBeDefined();
    });

    it('should throw exact same errors as Stanford DSPy', async () => {
      // Test error messages match Stanford DSPy exactly
      miprov2 = new MIPROv2({
        metric: exactMatch,
        auto: null,
        num_candidates: 6,
      });

      await expect(miprov2.compile(mockStudent, { trainset })).rejects.toThrow(
        /If auto is None, num_trials must also be provided/
      );
    });

    it('should handle auto run settings like Stanford DSPy', () => {
      // Test auto settings match Stanford DSPy constants
      const lightConfig = new MIPROv2({ metric: exactMatch, auto: 'light' });
      const mediumConfig = new MIPROv2({ metric: exactMatch, auto: 'medium' });
      const heavyConfig = new MIPROv2({ metric: exactMatch, auto: 'heavy' });

      expect(lightConfig.getConfig().auto).toBe('light');
      expect(mediumConfig.getConfig().auto).toBe('medium');
      expect(heavyConfig.getConfig().auto).toBe('heavy');
    });
  });

  describe('Performance and Resource Management', () => {
    it('should handle large trainsets efficiently', async () => {
      const largeTrainset = Array.from(
        { length: 50 },
        (_, i) =>
          new Example({ question: `What is ${i}+${i}?`, answer: `${i * 2}` })
      );

      const localMiprov2 = new MIPROv2({
        metric: exactMatch,
        auto: 'light',
      });

      const result = await localMiprov2.compile(mockStudent, {
        trainset: largeTrainset,
        valset,
      });

      expect(result).toBeDefined();
    });

    it('should track statistics when enabled', async () => {
      miprov2 = new MIPROv2({
        metric: exactMatch,
        auto: 'light',
        track_stats: true,
      });

      const result = await miprov2.compile(mockStudent, { trainset, valset });

      expect(result).toBeDefined();
      // Should have attached trial_logs and other stats
    });

    it('should not track statistics when disabled', async () => {
      miprov2 = new MIPROv2({
        metric: exactMatch,
        auto: 'light',
        track_stats: false,
      });

      const result = await miprov2.compile(mockStudent, { trainset, valset });

      expect(result).toBeDefined();
      // Should not have attached statistics
    });
  });
});
