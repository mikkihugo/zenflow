/**
 * @fileoverview Tests for Bootstrap Few-Shot Teleprompter Implementation
 * 
 * Comprehensive test suite for the Bootstrap teleprompter ensuring proper
 * teacher/student coordination, metric-based validation, and demonstration compilation.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  BootstrapFewShot, 
  LabeledFewShot,
  DEFAULT_BOOTSTRAP_CONFIG,
  type BootstrapConfig 
} from '../../../../lib/dspy/teleprompters/bootstrap';
import { Example } from '../../../../lib/dspy/primitives/example';
import type { DSPyModule } from '../../../../lib/dspy/primitives/module';
import type { DSPyPredictor, Signature } from '../../../../lib/dspy/primitives/predictor';
import type { MetricFunction } from '../../../../lib/dspy/interfaces/types';

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
    // Simple mock that returns based on input
    if (inputs.question?.includes('2+2')) return { answer: '4' };
    if (inputs.question?.includes('capital')) return { answer: 'Paris' };
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
    if (prompt.includes('2+2')) return '4';
    if (prompt.includes('capital')) return 'Paris';
    return 'mock response';
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
    copy.demos = [...this.demos.map(demo => demo.copy())];
    copy.instructions = this.instructions;
    copy.compiled = this.compiled;
    
    // Preserve mocked methods for testing
    if (this.forward !== MockPredictor.prototype.forward) {
      copy.forward = this.forward;
    }
    if (this.aforward !== MockPredictor.prototype.aforward) {
      copy.aforward = this.aforward;
    }
    
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

describe('BootstrapFewShot', () => {
  let bootstrap: BootstrapFewShot;
  let basicConfig: BootstrapConfig;
  let mockPredictor: MockPredictor;
  let mockModule: MockModule;
  let trainset: Example[];
  let valset: Example[];
  let exactMetric: MetricFunction;

  beforeEach(() => {
    // Setup exact match metric
    exactMetric = (example, prediction) => {
      return prediction.data?.answer === example.data.answer;
    };

    // Setup basic configuration
    basicConfig = {
      ...DEFAULT_BOOTSTRAP_CONFIG,
      metric: exactMetric,
      maxBootstrappedDemos: 2,
      maxLabeledDemos: 2,
      seed: 42,
      verbose: false
    };

    bootstrap = new BootstrapFewShot(basicConfig);

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
      new Example({ question: 'What is 3+3?', answer: '6' }).withInputs('question'),
      new Example({ question: 'What is the capital of Spain?', answer: 'Madrid' }).withInputs('question'),
      new Example({ question: 'What is 5+5?', answer: '10' }).withInputs('question')
    ];

    valset = [
      new Example({ question: 'What is 7+7?', answer: '14' }).withInputs('question'),
      new Example({ question: 'What is the capital of Italy?', answer: 'Rome' }).withInputs('question')
    ];
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const defaultBootstrap = new BootstrapFewShot();
      expect(defaultBootstrap).toBeInstanceOf(BootstrapFewShot);
    });

    it('should merge custom configuration with defaults', () => {
      const customConfig = { maxBootstrappedDemos: 8, seed: 123 };
      const customBootstrap = new BootstrapFewShot(customConfig);
      expect(customBootstrap).toBeInstanceOf(BootstrapFewShot);
    });

    it('should use default values for unspecified config', () => {
      const partialConfig = { maxBootstrappedDemos: 6 };
      const partialBootstrap = new BootstrapFewShot(partialConfig);
      expect(partialBootstrap).toBeInstanceOf(BootstrapFewShot);
    });
  });

  describe('Basic Compilation', () => {
    it('should compile student module successfully', async () => {
      const result = await bootstrap.compile(mockModule, { trainset });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
      expect(result).not.toBe(mockModule); // Should be a copy
    });

    it('should maintain original module structure', async () => {
      const result = await bootstrap.compile(mockModule, { trainset });
      
      expect(result.predictors()).toHaveLength(1);
      expect(result.predictors()[0].signature).toEqual(mockPredictor.signature);
    });

    it('should clear original demos from student', async () => {
      // Add some initial demos
      mockPredictor.addDemo(trainset[0]);
      expect(mockPredictor.demos).toHaveLength(1);
      
      const result = await bootstrap.compile(mockModule, { trainset });
      
      // Original should be unchanged, but result should be fresh
      expect(mockPredictor.demos).toHaveLength(1);
      expect(result.predictors()[0].demos).toHaveLength(2); // Should have new demos
    });
  });

  describe('Teacher/Student Preparation', () => {
    it('should create separate teacher and student instances', async () => {
      const result = await bootstrap.compile(mockModule, { trainset });
      
      // Should be different instances
      expect(result).not.toBe(mockModule);
      expect(result.predictors()[0]).not.toBe(mockPredictor);
    });

    it('should use provided teacher model', async () => {
      const teacherPredictor = new MockPredictor(mockPredictor.signature);
      teacherPredictor.addDemo(trainset[0]); // Give teacher some initial demos
      const teacherModule = new MockModule(teacherPredictor);
      
      const result = await bootstrap.compile(mockModule, { 
        trainset, 
        teacher: teacherModule 
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle signature validation between student and teacher', async () => {
      const differentSignature: Signature = {
        inputs: { query: 'string' }, // Different input name
        outputs: { response: 'string' },
        instruction: 'Different signature'
      };
      
      const differentPredictor = new MockPredictor(differentSignature);
      const differentModule = new MockModule(differentPredictor);
      
      await expect(bootstrap.compile(mockModule, { 
        trainset, 
        teacher: differentModule 
      })).rejects.toThrow(/signatures must match/);
    });
  });

  describe('Bootstrap Process', () => {
    it('should bootstrap demonstrations from successful examples', async () => {
      const result = await bootstrap.compile(mockModule, { trainset });
      
      const resultPredictor = result.predictors()[0];
      expect(resultPredictor.demos.length).toBeGreaterThan(0);
      
      // Check that demos have the expected structure
      const demo = resultPredictor.demos[0];
      expect(demo.data).toHaveProperty('question');
      expect(demo.data).toHaveProperty('answer');
    });

    it('should respect maxBootstrappedDemos limit', async () => {
      const limitedBootstrap = new BootstrapFewShot({
        ...basicConfig,
        maxBootstrappedDemos: 1
      });
      
      const result = await limitedBootstrap.compile(mockModule, { trainset });
      
      const bootstrappedDemos = result.predictors()[0].demos.filter(
        demo => demo.data._source === 'bootstrap'
      );
      expect(bootstrappedDemos.length).toBeLessThanOrEqual(1);
    });

    it('should handle metric validation', async () => {
      const strictMetric: MetricFunction = () => false; // Reject all
      
      const strictBootstrap = new BootstrapFewShot({
        ...basicConfig,
        metric: strictMetric
      });
      
      const result = await strictBootstrap.compile(mockModule, { trainset });
      
      // Should still complete but with fewer/no bootstrapped demos
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should handle metric threshold validation', async () => {
      const numericMetric: MetricFunction = () => 0.5; // Return numeric score
      
      const thresholdBootstrap = new BootstrapFewShot({
        ...basicConfig,
        metric: numericMetric,
        metricThreshold: 0.7 // Higher than metric returns
      });
      
      const result = await thresholdBootstrap.compile(mockModule, { trainset });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during bootstrapping', async () => {
      const errorBootstrap = new BootstrapFewShot({
        ...basicConfig,
        maxErrors: 2
      });
      
      // Mock predictor to throw errors occasionally
      const errorPredictor = new MockPredictor(mockPredictor.signature);
      errorPredictor.forward = vi.fn().mockImplementation((inputs) => {
        if (inputs.question?.includes('error')) {
          throw new Error('Simulated error');
        }
        return { answer: 'test' };
      });
      
      const errorModule = new MockModule(errorPredictor);
      
      const errorTrainset = [
        ...trainset,
        new Example({ question: 'This will error', answer: 'test' }).withInputs('question')
      ];
      
      const result = await errorBootstrap.compile(errorModule, { 
        trainset: errorTrainset 
      });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
    });

    it('should fail if too many errors occur', async () => {
      const errorBootstrap = new BootstrapFewShot({
        ...basicConfig,
        maxErrors: 1 // Very low threshold
      });
      
      // Mock predictor to always throw errors
      const errorPredictor = new MockPredictor(mockPredictor.signature);
      errorPredictor.forward = vi.fn().mockImplementation(() => {
        throw new Error('Always fails');
      });
      
      const errorModule = new MockModule(errorPredictor);
      
      await expect(errorBootstrap.compile(errorModule, { trainset, teacher: errorModule }))
        .rejects.toThrow('Always fails');
    });
  });

  describe('Demonstration Management', () => {
    it('should combine bootstrapped and labeled demonstrations', async () => {
      const result = await bootstrap.compile(mockModule, { trainset });
      
      const resultPredictor = result.predictors()[0];
      expect(resultPredictor.demos.length).toBeGreaterThan(0);
      
      // Should have a mix of demo types
      const demoSources = resultPredictor.demos.map(demo => demo.data._source);
      expect(demoSources).toContain('bootstrap');
    });

    it('should respect total demo limits', async () => {
      const totalLimit = 3;
      const limitedBootstrap = new BootstrapFewShot({
        ...basicConfig,
        maxBootstrappedDemos: 2,
        maxLabeledDemos: 1
      });
      
      const result = await limitedBootstrap.compile(mockModule, { trainset });
      
      const resultPredictor = result.predictors()[0];
      expect(resultPredictor.demos.length).toBeLessThanOrEqual(totalLimit);
    });
  });

  describe('Reproducibility', () => {
    it('should produce consistent results with same seed', async () => {
      const bootstrap1 = new BootstrapFewShot({ ...basicConfig, seed: 123 });
      const bootstrap2 = new BootstrapFewShot({ ...basicConfig, seed: 123 });
      
      const result1 = await bootstrap1.compile(mockModule.deepcopy(), { trainset });
      const result2 = await bootstrap2.compile(mockModule.deepcopy(), { trainset });
      
      // Results should be structurally similar (same number of demos)
      expect(result1.predictors()[0].demos.length)
        .toBe(result2.predictors()[0].demos.length);
    });

    it('should produce different results with different seeds', async () => {
      const bootstrap1 = new BootstrapFewShot({ ...basicConfig, seed: 123 });
      const bootstrap2 = new BootstrapFewShot({ ...basicConfig, seed: 456 });
      
      const result1 = await bootstrap1.compile(mockModule.deepcopy(), { trainset });
      const result2 = await bootstrap2.compile(mockModule.deepcopy(), { trainset });
      
      // Results might be different (though not guaranteed with small datasets)
      expect(result1).toBeInstanceOf(MockModule);
      expect(result2).toBeInstanceOf(MockModule);
    });
  });
});

describe('LabeledFewShot', () => {
  let labeledFewShot: LabeledFewShot;
  let mockModule: MockModule;
  let trainset: Example[];

  beforeEach(() => {
    labeledFewShot = new LabeledFewShot(3, 42);
    
    const signature: Signature = {
      inputs: { question: 'string' },
      outputs: { answer: 'string' },
      instruction: 'Answer the question.'
    };
    
    const mockPredictor = new MockPredictor(signature);
    mockModule = new MockModule(mockPredictor);
    
    trainset = [
      new Example({ question: 'What is 2+2?', answer: '4' }).withInputs('question'),
      new Example({ question: 'What is 3+3?', answer: '6' }).withInputs('question'),
      new Example({ question: 'What is 4+4?', answer: '8' }).withInputs('question'),
      new Example({ question: 'What is 5+5?', answer: '10' }).withInputs('question')
    ];
  });

  describe('Basic Functionality', () => {
    it('should compile with labeled examples', () => {
      const result = labeledFewShot.compile(mockModule, { trainset });
      
      expect(result).toBeInstanceOf(MockModule);
      expect(result.compiled).toBe(true);
      expect(result.predictors()[0].demos).toHaveLength(3);
    });

    it('should respect k parameter', () => {
      const smallK = new LabeledFewShot(2);
      const result = smallK.compile(mockModule, { trainset });
      
      expect(result.predictors()[0].demos).toHaveLength(2);
    });

    it('should handle k larger than trainset', () => {
      const largeK = new LabeledFewShot(10);
      const result = largeK.compile(mockModule, { trainset });
      
      expect(result.predictors()[0].demos).toHaveLength(trainset.length);
    });

    it('should create independent copy of student', () => {
      const result = labeledFewShot.compile(mockModule, { trainset });
      
      expect(result).not.toBe(mockModule);
      expect(result.predictors()[0]).not.toBe(mockModule.predictors()[0]);
    });
  });

  describe('Reproducibility', () => {
    it('should be deterministic with same seed', () => {
      const labeled1 = new LabeledFewShot(3, 42);
      const labeled2 = new LabeledFewShot(3, 42);
      
      const result1 = labeled1.compile(mockModule.deepcopy(), { trainset });
      const result2 = labeled2.compile(mockModule.deepcopy(), { trainset });
      
      // Should select same examples in same order
      const demos1 = result1.predictors()[0].demos;
      const demos2 = result2.predictors()[0].demos;
      
      expect(demos1.length).toBe(demos2.length);
      expect(demos1.map(d => d.data.question))
        .toEqual(demos2.map(d => d.data.question));
    });
  });
});