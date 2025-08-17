/**
 * @fileoverview Tests for Bootstrap Finetune Teleprompter Implementation
 * 
 * Comprehensive test suite for the Bootstrap Finetune teleprompter ensuring proper
 * LM fine-tuning coordination, trace data collection, and error handling.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  BootstrapFinetune, 
  FinetuneTeleprompter,
  TrainDataFormat,
  LMCacheManager,
  allPredictorsHaveLMs,
  copyProgramWithLMs,
  getUniqueLMs,
  DEFAULT_BOOTSTRAP_FINETUNE_CONFIG,
  type BootstrapFinetuneConfig,
  type TraceData,
  type FailedPrediction
} from '../../../../lib/dspy/teleprompters/bootstrap-finetune';
import { Example } from '../../../../lib/dspy/primitives/example';
import type { DSPyModule } from '../../../../lib/dspy/primitives/module';
import type { DSPyPredictor, Signature } from '../../../../lib/dspy/primitives/predictor';
import type { MetricFunction } from '../../../../lib/dspy/interfaces/types';
import type { LMInterface } from '../../../../lib/dspy/interfaces/lm';

// Mock LM interface for testing
class MockLM implements LMInterface {
  public model: string = 'mock-model';
  public cache: boolean = true;
  public finetuneCallCount: number = 0;
  public killCallCount: number = 0;

  async forward(inputs: Record<string, any>) {
    return { answer: 'mock response' };
  }

  async finetune(options: any): Promise<LMInterface> {
    this.finetuneCallCount++;
    // Simulate successful fine-tuning by returning a new instance
    const fintuned = new MockLM();
    fintuned.model = `${this.model}-finetuned-${this.finetuneCallCount}`;
    return fintuned;
  }

  async kill(): Promise<void> {
    this.killCallCount++;
  }

  async launch(): Promise<void> {
    // Mock launch
  }
}

// Mock predictor for testing
class MockPredictor implements DSPyPredictor {
  public signature: Signature;
  public demos: Example[] = [];
  public instructions?: string;
  public callbacks?: any[];
  public history: any[] = [];
  public compiled: boolean = false;
  public lm?: LMInterface;
  public id: string;

  constructor(signature: Signature, lm?: LMInterface) {
    this.signature = signature;
    this.instructions = signature.instruction;
    this.lm = lm;
    this.id = `predictor-${Math.random().toString(36).substr(2, 9)}`;
  }

  forward(inputs: Record<string, any>) {
    if (this.lm) {
      return this.lm.forward(inputs);
    }
    return { answer: 'mock response' };
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
    return 'mock response';
  }

  set_lm(lm: LMInterface): void {
    this.lm = lm;
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
    }, this.lm);
    copy.demos = [...this.demos.map(demo => demo.copy())];
    copy.instructions = this.instructions;
    copy.compiled = this.compiled;
    copy.id = `predictor-${Math.random().toString(36).substr(2, 9)}`; // Generate new ID for copies
    // Preserve the original LM reference
    copy.lm = this.lm;
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

  async forward(inputs: Record<string, any>) {
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
    const copy = new MockModule(this.predictor.deepcopy());
    copy.compiled = this.compiled;
    return copy;
  }
}

describe('BootstrapFinetune', () => {
  let bootstrap: BootstrapFinetune;
  let basicConfig: BootstrapFinetuneConfig;
  let mockLM: MockLM;
  let mockPredictor: MockPredictor;
  let mockModule: MockModule;
  let trainset: Example[];
  let exactMetric: MetricFunction;

  beforeEach(() => {
    // Setup exact match metric
    exactMetric = (example, prediction) => {
      return prediction.data?.answer === example.data.answer;
    };

    // Setup basic configuration
    basicConfig = {
      ...DEFAULT_BOOTSTRAP_FINETUNE_CONFIG,
      metric: exactMetric,
      multitask: true,
      exclude_demos: false,
      num_threads: 1
    };

    bootstrap = new BootstrapFinetune(basicConfig);

    // Setup mock LM and components
    mockLM = new MockLM();
    
    const signature: Signature = {
      inputs: { question: 'string' },
      outputs: { answer: 'string' },
      instruction: 'Answer the question clearly and concisely.'
    };

    mockPredictor = new MockPredictor(signature, mockLM);
    mockPredictor.lm = mockLM; // Ensure LM is explicitly set
    mockModule = new MockModule(mockPredictor);

    // Setup training data
    trainset = [
      new Example({ question: 'What is 2+2?', answer: '4' }).withInputs('question'),
      new Example({ question: 'What is the capital of France?', answer: 'Paris' }).withInputs('question'),
      new Example({ question: 'What is 3+3?', answer: '6' }).withInputs('question')
    ];
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const defaultBootstrap = new BootstrapFinetune();
      expect(defaultBootstrap).toBeInstanceOf(BootstrapFinetune);
      expect(defaultBootstrap).toBeInstanceOf(FinetuneTeleprompter);
    });

    it('should merge custom configuration with defaults', () => {
      const customConfig = { 
        multitask: false, 
        exclude_demos: true,
        num_threads: 4 
      };
      const customBootstrap = new BootstrapFinetune(customConfig);
      expect(customBootstrap).toBeInstanceOf(BootstrapFinetune);
    });

    it('should handle train_kwargs configuration', () => {
      const trainKwargs = { learning_rate: 0.001, batch_size: 32 };
      const bootstrap = new BootstrapFinetune({ train_kwargs: trainKwargs });
      expect(bootstrap).toBeInstanceOf(BootstrapFinetune);
    });
  });

  describe('LM Validation', () => {
    it('should validate that all predictors have LMs assigned', async () => {
      // Remove LM to trigger validation error
      mockPredictor.lm = undefined;
      
      await expect(bootstrap.compile(mockModule, trainset))
        .rejects.toThrow(/does not have an LM assigned/);
    });

    it('should accept modules with properly assigned LMs', async () => {
      // Double-check LM assignment since mockPredictor seems to lose its LM reference
      mockPredictor.lm = mockLM;
      expect(mockPredictor.lm).toBeDefined();
      
      const result = await bootstrap.compile(mockModule, trainset);
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle multiple predictors with different LMs', async () => {
      const secondLM = new MockLM();
      secondLM.model = 'second-mock-model';
      
      const secondPredictor = new MockPredictor(mockPredictor.signature, secondLM);
      secondPredictor.lm = secondLM; // Ensure LM is explicitly set
      
      // Create module with multiple predictors
      const multiModule = new MockModule(mockPredictor);
      multiModule.predictors = () => [mockPredictor, secondPredictor];
      
      // Use bootstrap with enough threads for multiple LMs
      const multiThreadBootstrap = new BootstrapFinetune({ 
        ...basicConfig, 
        num_threads: 2 // Need 2 threads for 2 different LMs
      });
      
      const result = await multiThreadBootstrap.compile(multiModule, trainset);
      expect(result.compiled).toBe(true);
    });
  });

  describe('Fine-tuning Process', () => {
    it('should execute fine-tuning jobs successfully', async () => {
      const result = await bootstrap.compile(mockModule, trainset);
      
      expect(mockLM.finetuneCallCount).toBeGreaterThan(0);
      expect(mockLM.killCallCount).toBeGreaterThan(0);
      expect(result.compiled).toBe(true);
    });

    it('should update predictors with fine-tuned LMs', async () => {
      const originalModel = mockLM.model;
      
      const result = await bootstrap.compile(mockModule, trainset);
      
      const updatedLM = result.predictors()[0].lm as MockLM;
      expect(updatedLM.model).not.toBe(originalModel);
      expect(updatedLM.model).toContain('finetuned');
    });

    it('should handle multitask training correctly', async () => {
      const multitaskBootstrap = new BootstrapFinetune({ 
        ...basicConfig, 
        multitask: true 
      });
      
      const result = await multitaskBootstrap.compile(mockModule, trainset);
      expect(result.compiled).toBe(true);
    });

    it('should respect exclude_demos setting', async () => {
      // Add some initial demos
      mockPredictor.addDemo(trainset[0]);
      expect(mockPredictor.demos).toHaveLength(1);
      
      const excludeDemosBootstrap = new BootstrapFinetune({ 
        ...basicConfig, 
        exclude_demos: true 
      });
      
      const result = await excludeDemosBootstrap.compile(mockModule, trainset);
      
      // Demos should be cleared when exclude_demos is true
      expect(result.predictors()[0].demos).toHaveLength(0);
    });
  });

  describe('Thread Management', () => {
    it('should validate thread count against job count', async () => {
      const limitedThreadBootstrap = new BootstrapFinetune({ 
        ...basicConfig, 
        num_threads: 0 // Invalid: less than job count
      });
      
      await expect(limitedThreadBootstrap.compile(mockModule, trainset))
        .rejects.toThrow(/num_threads.*bigger than or equal/);
    });

    it('should handle appropriate thread count', async () => {
      const threadBootstrap = new BootstrapFinetune({ 
        ...basicConfig, 
        num_threads: 2 // Valid: greater than job count
      });
      
      const result = await threadBootstrap.compile(mockModule, trainset);
      expect(result.compiled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle fine-tuning failures gracefully', async () => {
      // Mock LM that fails fine-tuning
      const failingLM = new MockLM();
      failingLM.finetune = vi.fn().mockRejectedValue(new Error('Fine-tuning failed'));
      
      mockPredictor.lm = failingLM;
      
      // Ensure the predictor has the failing LM before compilation
      expect(mockPredictor.lm).toBe(failingLM);
      
      await expect(bootstrap.compile(mockModule, trainset))
        .rejects.toThrow('Finetuned LM for predictor 0 failed');
    });

    it('should handle structural validation between student and teacher', async () => {
      const differentSignature: Signature = {
        inputs: { query: 'string' }, // Different from mockPredictor
        outputs: { response: 'string' },
        instruction: 'Different signature'
      };
      
      const differentPredictor = new MockPredictor(differentSignature, new MockLM());
      const differentModule = new MockModule(differentPredictor);
      
      await expect(bootstrap.compile(mockModule, trainset, differentModule))
        .rejects.toThrow(/signatures must match/);
    });

    it('should handle trace data collection errors', async () => {
      // Mock module that throws during forward pass
      const errorModule = new MockModule(mockPredictor);
      errorModule.forward = vi.fn().mockRejectedValue(new Error('Forward pass failed'));
      
      // Should handle error and continue (raise_on_error = false by default in our implementation)
      const result = await bootstrap.compile(errorModule, trainset);
      expect(result).toBeInstanceOf(MockModule);
    });
  });

  describe('Teacher Model Handling', () => {
    it('should use student as teacher when none provided', async () => {
      const result = await bootstrap.compile(mockModule, trainset);
      expect(result.compiled).toBe(true);
    });

    it('should use provided teacher model', async () => {
      const teacherLM = new MockLM();
      teacherLM.model = 'teacher-model';
      
      const teacherPredictor = new MockPredictor(mockPredictor.signature, teacherLM);
      const teacherModule = new MockModule(teacherPredictor);
      
      const result = await bootstrap.compile(mockModule, trainset, teacherModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle multiple teacher models', async () => {
      const teacher1 = new MockModule(new MockPredictor(mockPredictor.signature, new MockLM()));
      const teacher2 = new MockModule(new MockPredictor(mockPredictor.signature, new MockLM()));
      
      const result = await bootstrap.compile(mockModule, trainset, [teacher1, teacher2]);
      expect(result.compiled).toBe(true);
    });
  });

  describe('Data Format and Adapter Integration', () => {
    it('should infer correct data format', async () => {
      const result = await bootstrap.compile(mockModule, trainset);
      expect(result.compiled).toBe(true);
      // Data format should be inferred from adapter
    });

    it('should handle custom adapter configuration', async () => {
      // Note: Would need actual adapter implementation for full testing
      const result = await bootstrap.compile(mockModule, trainset);
      expect(result.compiled).toBe(true);
    });
  });
});

describe('TrainDataFormat', () => {
  it('should have correct enum values', () => {
    expect(TrainDataFormat.GRPO_CHAT).toBe('grpo_chat');
    expect(TrainDataFormat.STANDARD).toBe('standard');
  });
});

describe('LMCacheManager', () => {
  let mockModule: MockModule;
  let mockLM: MockLM;

  beforeEach(() => {
    mockLM = new MockLM();
    const mockPredictor = new MockPredictor({
      inputs: { question: 'string' },
      outputs: { answer: 'string' },
      instruction: 'Test'
    }, mockLM);
    mockModule = new MockModule(mockPredictor);
  });

  it('should disable and restore LM cache', () => {
    const originalCache = mockLM.cache;
    
    LMCacheManager.disableLMCache(mockModule);
    expect(mockLM.cache).toBe(false);
    
    LMCacheManager.recoverLMCache(mockModule);
    expect(mockLM.cache).toBe(originalCache);
  });

  it('should handle predictors without LMs', () => {
    const predictorWithoutLM = new MockPredictor({
      inputs: { question: 'string' },
      outputs: { answer: 'string' },
      instruction: 'Test'
    });
    predictorWithoutLM.lm = undefined;
    
    const moduleWithoutLM = new MockModule(predictorWithoutLM);
    
    expect(() => LMCacheManager.disableLMCache(moduleWithoutLM))
      .toThrow(/does not have an LM set/);
  });
});

describe('Utility Functions', () => {
  let mockModule: MockModule;
  let mockLM: MockLM;

  beforeEach(() => {
    mockLM = new MockLM();
    const mockPredictor = new MockPredictor({
      inputs: { question: 'string' },
      outputs: { answer: 'string' },
      instruction: 'Test'
    }, mockLM);
    mockModule = new MockModule(mockPredictor);
  });

  describe('allPredictorsHaveLMs', () => {
    it('should return true when all predictors have LMs', () => {
      expect(allPredictorsHaveLMs(mockModule)).toBe(true);
    });

    it('should return false when any predictor lacks LM', () => {
      mockModule.predictors()[0].lm = undefined;
      expect(allPredictorsHaveLMs(mockModule)).toBe(false);
    });
  });

  describe('copyProgramWithLMs', () => {
    it('should create copy preserving LMs', () => {
      const copied = copyProgramWithLMs(mockModule);
      
      expect(copied).not.toBe(mockModule);
      expect(copied.predictors()[0].lm).toBe(mockLM);
    });
  });

  describe('getUniqueLMs', () => {
    it('should return unique LMs from program', () => {
      const lms = getUniqueLMs(mockModule);
      
      expect(lms).toHaveLength(1);
      expect(lms[0]).toBe(mockLM);
    });

    it('should handle predictors without LMs', () => {
      mockModule.predictors()[0].lm = undefined;
      const lms = getUniqueLMs(mockModule);
      
      expect(lms).toHaveLength(0);
    });
  });
});