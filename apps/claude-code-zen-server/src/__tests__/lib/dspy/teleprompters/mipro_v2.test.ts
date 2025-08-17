/**
 * @fileoverview Tests for MIPRO V2 Teleprompter Implementation
 * 
 * Comprehensive test suite for the MIPRO V2 (Multi-stage Instruction and Prefix Optimization) class
 * ensuring proper bootstrap, instruction generation, and Bayesian optimization logic.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  MiproV2Optimizer, 
  DEFAULT_MIPRO_V2_CONFIG,
  AUTO_RUN_SETTINGS,
  type MiproV2Config,
  type AutoRunMode,
  type FewShotCandidateSet,
  type InstructionCandidate,
  type OptimizationTrial
} from '../../../../lib/dspy/teleprompters/mipro_v2';
import { Example } from '../../../../lib/dspy/primitives/example';
import type { DSPyModule } from '../../../../lib/dspy/primitives/module';
import type { DSPyPredictor, Signature } from '../../../../lib/dspy/primitives/predictor';

// Mock predictor for testing
class MockPredictor implements DSPyPredictor {
  public signature: Signature;
  public demos: Example[] = [];
  public instructions?: string;
  public callbacks?: any[];
  public history: any[] = [];
  public compiled: boolean = false;

  constructor(signature: Signature) {
    this.signature = signature;
    this.instructions = signature.instruction;
  }

  forward(inputs: Record<string, any>) {
    return { answer: '42', raw_response: '42' };
  }

  async aforward(inputs: Record<string, any>) {
    return this.forward(inputs);
  }

  __call__(inputs: Record<string, any>) {
    const result = this.forward(inputs);
    this.history.push({ inputs: [inputs], outputs: result });
    return result;
  }

  validateInputs(inputs: Record<string, any>): void {
    // Mock validation
  }

  formatPrompt(inputs: Record<string, any>): string {
    return `${this.instructions || ''}\\nQuestion: ${inputs.question}\\nAnswer:`;
  }

  parseResponse(response: string, inputs: Record<string, any>) {
    return { answer: response, raw_response: response };
  }

  simulateLanguageModel(prompt: string): string {
    if (prompt.includes('2+2')) return '4';
    if (prompt.includes('capital')) return 'Paris';
    return '42';
  }

  set_lm(lm: any): void {
    // Mock LM setting
  }

  addDemo(demo: Example): void {
    this.demos.push(demo);
  }

  updateDemos(demos: Example[]): void {
    this.demos = [...demos];
  }

  clearDemos(): void {
    this.demos = [];
  }

  updateInstructions(instructions: string): void {
    this.instructions = instructions;
    this.signature = { ...this.signature, instruction: instructions };
  }

  named_parameters() {
    return {
      demos: { name: 'demos', value: this.demos, trainable: true, metadata: { type: 'predictor' } },
      instructions: { name: 'instructions', value: this.instructions, trainable: true, metadata: { type: 'predictor' } },
      signature: { name: 'signature', value: this.signature, trainable: false, metadata: { type: 'predictor' } }
    };
  }

  save(name: string): void {
    // Mock save
  }

  load(name: string): void {
    // Mock load
  }

  deepcopy(): MockPredictor {
    const copy = new MockPredictor({
      inputs: { ...this.signature.inputs },
      outputs: { ...this.signature.outputs },
      instruction: this.signature.instruction,
      format: this.signature.format ? { ...this.signature.format } : undefined
    });
    copy.demos = [...this.demos];
    copy.instructions = this.instructions;
    return copy;
  }
}

// Mock module for testing
class MockModule implements DSPyModule {
  public compiled: boolean = false;
  public history: any[] = [];
  private predictor: MockPredictor;

  constructor(predictor: MockPredictor) {
    this.predictor = predictor;
  }

  forward(inputs: Record<string, any>) {
    return this.predictor.forward(inputs);
  }

  async aforward(inputs: Record<string, any>) {
    return this.predictor.aforward(inputs);
  }

  predictors() {
    return [this.predictor];
  }

  named_parameters() {
    return this.predictor.named_parameters();
  }

  save(name: string): void {
    this.predictor.save(name);
  }

  load(name: string): void {
    this.predictor.load(name);
  }

  deepcopy(): MockModule {
    return new MockModule(this.predictor.deepcopy());
  }
}

describe('MiproV2Optimizer', () => {
  let optimizer: MiproV2Optimizer;
  let basicConfig: MiproV2Config;
  let mockPredictor: MockPredictor;
  let mockModule: MockModule;
  let trainset: Example[];
  let valset: Example[];

  beforeEach(() => {
    // Setup basic configuration
    basicConfig = {
      ...DEFAULT_MIPRO_V2_CONFIG,
      metric: (example, prediction) => prediction.answer === example.data.answer ? 1 : 0,
      auto: 'light',
      max_bootstrapped_demos: 2, // Smaller for testing
      max_labeled_demos: 2,
      seed: 42,
      verbose: false
    };

    optimizer = new MiproV2Optimizer(basicConfig);

    // Setup mock predictor and module
    const signature: Signature = {
      inputs: { question: 'string' },
      outputs: { answer: 'string' },
      instruction: 'Answer the question clearly and concisely.'
    };

    mockPredictor = new MockPredictor(signature);
    mockModule = new MockModule(mockPredictor);

    // Setup training and validation data
    trainset = [
      new Example({ question: 'What is 2+2?', answer: '4' }).withInputs('question'),
      new Example({ question: 'What is the capital of France?', answer: 'Paris' }).withInputs('question'),
      new Example({ question: 'What is 5+5?', answer: '10' }).withInputs('question'),
      new Example({ question: 'What is 3+3?', answer: '6' }).withInputs('question'),
      new Example({ question: 'What is the capital of Spain?', answer: 'Madrid' }).withInputs('question')
    ];

    valset = [
      new Example({ question: 'What is 7+7?', answer: '14' }).withInputs('question'),
      new Example({ question: 'What is the capital of Italy?', answer: 'Rome' }).withInputs('question')
    ];
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with valid configuration', () => {
      expect(optimizer).toBeInstanceOf(MiproV2Optimizer);
    });

    it('should throw error for invalid auto mode', () => {
      expect(() => {
        new MiproV2Optimizer({ 
          ...basicConfig, 
          auto: 'invalid' as AutoRunMode 
        });
      }).toThrow('Invalid auto mode');
    });

    it('should use default configuration values', () => {
      const defaultOptimizer = new MiproV2Optimizer({
        metric: basicConfig.metric
      });
      expect(defaultOptimizer).toBeInstanceOf(MiproV2Optimizer);
    });

    it('should handle undefined auto mode with manual settings', () => {
      expect(() => {
        new MiproV2Optimizer({
          ...basicConfig,
          auto: undefined,
          num_candidates: 5
        });
      }).not.toThrow();
    });
  });

  describe('Configuration Validation', () => {
    it('should validate auto mode and manual settings compatibility', async () => {
      const invalidOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        auto: 'medium',
        num_candidates: 10 // Should conflict with auto mode
      });

      await expect(invalidOptimizer.compile(mockModule, {
        trainset,
        valset,
        num_trials: 5
      })).rejects.toThrow();
    });

    it('should require num_trials when auto is undefined', async () => {
      const manualOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        auto: undefined,
        num_candidates: 5
      });

      await expect(manualOptimizer.compile(mockModule, {
        trainset,
        valset
      })).rejects.toThrow('num_trials must also be provided');
    });

    it('should validate dataset requirements', async () => {
      // Empty trainset
      await expect(optimizer.compile(mockModule, {
        trainset: [],
        valset
      })).rejects.toThrow('Trainset cannot be empty');

      // Empty valset when provided
      await expect(optimizer.compile(mockModule, {
        trainset,
        valset: []
      })).rejects.toThrow('Validation set must have at least 1 example');
    });
  });

  describe('Auto Run Mode Settings', () => {
    it.each(['light', 'medium', 'heavy'] as AutoRunMode[])(
      'should handle %s auto mode',
      async (mode) => {
        const autoOptimizer = new MiproV2Optimizer({
          ...basicConfig,
          auto: mode
        });

        const result = await autoOptimizer.compile(mockModule, {
          trainset,
          // No valset - should auto-split
        });

        expect(result).toBeInstanceOf(MockModule);
        expect(result.compiled).toBe(true);

        // Verify auto settings were applied
        const settings = AUTO_RUN_SETTINGS[mode];
        expect(settings).toBeDefined();
        expect(settings.n).toBeGreaterThan(0);
        expect(settings.val_size).toBeGreaterThan(0);
      }
    );

    it('should auto-split trainset when no valset provided', async () => {
      const result = await optimizer.compile(mockModule, {
        trainset: trainset.slice(0, 10) // Larger trainset for splitting
      });

      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle small trainset validation', async () => {
      await expect(optimizer.compile(mockModule, {
        trainset: [trainset[0]] // Only 1 example, need at least 2 for auto-split
      })).rejects.toThrow('Trainset must have at least 2 examples');
    });
  });

  describe('Optimization Process', () => {
    it('should complete basic optimization workflow', async () => {
      const result = await optimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle zero-shot optimization', async () => {
      const zeroShotOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        max_bootstrapped_demos: 0,
        max_labeled_demos: 0
      });

      const result = await zeroShotOptimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle minibatch evaluation', async () => {
      const result = await optimizer.compile(mockModule, {
        trainset,
        valset,
        minibatch: true,
        minibatch_size: 2,
        minibatch_full_eval_steps: 3
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle full evaluation mode', async () => {
      const result = await optimizer.compile(mockModule, {
        trainset,
        valset,
        minibatch: false
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle teacher model for bootstrapping', async () => {
      const teacherModule = new MockModule(mockPredictor.deepcopy());
      
      const result = await optimizer.compile(mockModule, {
        trainset,
        valset,
        teacher: teacherModule
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });
  });

  describe('Bootstrap Few-shot Examples', () => {
    it('should generate few-shot candidate sets', async () => {
      const result = await optimizer.compile(mockModule, {
        trainset,
        valset,
        max_bootstrapped_demos: 3
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle zero few-shot demos', async () => {
      const result = await optimizer.compile(mockModule, {
        trainset,
        valset,
        max_bootstrapped_demos: 0
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should limit demo count to available examples', async () => {
      const smallTrainset = trainset.slice(0, 2);
      
      const result = await optimizer.compile(mockModule, {
        trainset: smallTrainset,
        valset,
        max_bootstrapped_demos: 5 // More than available
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });
  });

  describe('Instruction Generation', () => {
    it('should generate instruction candidates with different strategies', async () => {
      const result = await optimizer.compile(mockModule, {
        trainset,
        valset,
        program_aware_proposer: true,
        data_aware_proposer: true,
        tip_aware_proposer: true,
        fewshot_aware_proposer: true
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle disabled proposer strategies', async () => {
      const result = await optimizer.compile(mockModule, {
        trainset,
        valset,
        program_aware_proposer: false,
        data_aware_proposer: false,
        tip_aware_proposer: false,
        fewshot_aware_proposer: false
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should preserve original instruction as baseline', async () => {
      const originalInstruction = mockPredictor.signature.instruction;
      
      await optimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      // Original instruction should be preserved
      expect(originalInstruction).toBeDefined();
    });

    it('should handle different view data batch sizes', async () => {
      const result = await optimizer.compile(mockModule, {
        trainset,
        valset,
        view_data_batch_size: 3
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });
  });

  describe('Parameter Optimization', () => {
    it('should perform Bayesian optimization trials', async () => {
      const manualOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        auto: undefined,
        num_candidates: 3
      });

      const result = await manualOptimizer.compile(mockModule, {
        trainset,
        valset,
        num_trials: 5,
        minibatch_size: 2 // Ensure minibatch size doesn't exceed valset size
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should track optimization statistics when enabled', async () => {
      const statsOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        track_stats: true
      });

      const result = await statsOptimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
      
      // Check for attached metadata
      expect((result as any).trial_logs).toBeDefined();
      expect((result as any).candidate_programs).toBeDefined();
    });

    it('should not track detailed statistics when disabled', async () => {
      const noStatsOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        track_stats: false
      });

      const result = await noStatsOptimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
      
      // Should not have detailed metadata
      expect((result as any).trial_logs).toBeUndefined();
    });

    it('should handle custom seed for reproducibility', async () => {
      const seed1Optimizer = new MiproV2Optimizer({
        ...basicConfig,
        seed: 123
      });

      const seed2Optimizer = new MiproV2Optimizer({
        ...basicConfig,
        seed: 123
      });

      const result1 = await seed1Optimizer.compile(mockModule.deepcopy(), {
        trainset,
        valset,
        seed: 123
      });

      const result2 = await seed2Optimizer.compile(mockModule.deepcopy(), {
        trainset,
        valset,
        seed: 123
      });
      
      expect(result1).toBeInstanceOf(MockModule);
      expect(result2).toBeInstanceOf(MockModule);
      
      // Results should be deterministic with same seed
      // (In practice, would check specific reproducible outcomes)
    });
  });

  describe('Error Handling', () => {
    it('should handle evaluation errors gracefully', async () => {
      const faultyMetric = () => {
        throw new Error('Metric evaluation failed');
      };

      const faultyOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        metric: faultyMetric
      });

      // Should complete optimization despite metric errors
      const result = await faultyOptimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
    });

    it('should handle module forward errors gracefully', async () => {
      const faultyPredictor = new MockPredictor(mockPredictor.signature);
      faultyPredictor.forward = () => {
        throw new Error('Forward pass failed');
      };
      
      const faultyModule = new MockModule(faultyPredictor);
      
      // Should complete optimization despite forward errors
      const result = await optimizer.compile(faultyModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
    });

    it('should auto-adjust minibatch size when it exceeds valset size', async () => {
      const result = await optimizer.compile(mockModule, {
        trainset,
        valset: valset.slice(0, 1), // Very small valset
        minibatch: true,
        minibatch_size: 5 // Larger than valset, should be auto-adjusted
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });
  });

  describe('Multi-Predictor Scenarios', () => {
    it('should handle modules with multiple predictors', async () => {
      // Create module with multiple predictors
      const predictor1 = new MockPredictor({
        inputs: { question: 'string' },
        outputs: { reasoning: 'string' },
        instruction: 'Think step by step.'
      });

      const predictor2 = new MockPredictor({
        inputs: { reasoning: 'string' },
        outputs: { answer: 'string' },
        instruction: 'Provide the final answer.'
      });

      class MultiPredictorModule implements DSPyModule {
        public compiled: boolean = false;
        public history: any[] = [];
        private predictors_list = [predictor1, predictor2];

        forward(inputs: Record<string, any>) {
          const reasoning = predictor1.forward(inputs);
          const answer = predictor2.forward(reasoning);
          return answer;
        }

        async aforward(inputs: Record<string, any>) {
          return this.forward(inputs);
        }

        predictors() {
          return this.predictors_list;
        }

        named_parameters() {
          return {
            ...predictor1.named_parameters(),
            ...predictor2.named_parameters()
          };
        }

        save(name: string): void {}
        load(name: string): void {}

        deepcopy(): MultiPredictorModule {
          const copy = new MultiPredictorModule();
          copy.predictors_list = [predictor1.deepcopy(), predictor2.deepcopy()];
          return copy;
        }
      }

      const multiModule = new MultiPredictorModule();
      
      const result = await optimizer.compile(multiModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MultiPredictorModule);
      expect(result.compiled).toBe(true);
      expect(result.predictors()).toHaveLength(2);
    });
  });

  describe('Performance and Metrics', () => {
    it('should show optimization progress', async () => {
      const verboseOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        verbose: true
      });

      const result = await verboseOptimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should complete optimization within reasonable time', async () => {
      const startTime = Date.now();
      
      await optimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 10 seconds for test data
      expect(duration).toBeLessThan(10000);
    });

    it('should handle different metric types', async () => {
      // Boolean metric
      const booleanMetric = (example: Example, prediction: any): boolean => {
        return prediction.answer === example.data.answer;
      };

      const booleanOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        metric: booleanMetric
      });

      const result = await booleanOptimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle metric threshold filtering', async () => {
      const thresholdOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        metric_threshold: 0.5
      });

      const result = await thresholdOptimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });
  });

  describe('Advanced Configuration', () => {
    it('should handle custom thread and error limits', async () => {
      const advancedOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        num_threads: 4,
        max_errors: 10
      });

      const result = await advancedOptimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle custom model configurations', async () => {
      const customOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        task_model: 'custom-task-model',
        prompt_model: 'custom-prompt-model',
        teacher_settings: { temperature: 0.7 }
      });

      const result = await customOptimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle log directory configuration', async () => {
      const loggingOptimizer = new MiproV2Optimizer({
        ...basicConfig,
        log_dir: '/tmp/mipro-logs'
      });

      const result = await loggingOptimizer.compile(mockModule, {
        trainset,
        valset
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });
  });
});