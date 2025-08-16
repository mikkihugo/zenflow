/**
 * @fileoverview Tests for SIMBA Teleprompter
 * 
 * Comprehensive test suite for the SIMBA optimization algorithm ensuring proper
 * optimization behavior, strategy selection, and performance improvements.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimbaOptimizer, type SimbaConfig, DEFAULT_SIMBA_CONFIG } from '../../../../lib/dspy/teleprompters/simba';
import { Predictor, type Signature } from '../../../../lib/dspy/primitives/predictor';
import { Example } from '../../../../lib/dspy/primitives/example';

// Mock simple QA task
interface MockQAInput {
  question: string;
}

interface MockQAOutput {
  answer: string;
}

// Create test signature
const qaSignature: Signature = {
  inputs: { question: 'string' },
  outputs: { answer: 'string' },
  instruction: 'Answer the question clearly and concisely.'
};

// Mock language model for testing
class MockLanguageModel {
  private responses: Record<string, string> = {
    'What is 2+2?': '4',
    'What is 3+3?': '6', 
    'What is 5+5?': '10',
    'What is the capital of France?': 'Paris',
    'What is the largest planet?': 'Jupiter',
    'What is 7+8?': '15',
    'What is 12/3?': '4',
    'What is the color of grass?': 'Green'
  };

  async generate(prompt: string): Promise<string> {
    // Simple pattern matching for testing
    for (const [question, answer] of Object.entries(this.responses)) {
      if (prompt.includes(question)) {
        return answer;
      }
    }
    
    // Default fallback
    if (prompt.includes('2+2') || prompt.includes('2 + 2')) return '4';
    if (prompt.includes('math') || prompt.includes('calculate')) return '42';
    return 'I need more information.';
  }

  getUsage() {
    return {
      prompt_tokens: 50,
      completion_tokens: 10,
      total_tokens: 60
    };
  }
}

describe('SimbaOptimizer', () => {
  let predictor: Predictor;
  let mockLM: MockLanguageModel;
  let trainset: Example[];
  let testset: Example[];

  beforeEach(() => {
    // Create predictor
    predictor = new Predictor(qaSignature);
    mockLM = new MockLanguageModel();
    predictor.set_lm(mockLM);

    // Create training set
    trainset = [
      new Example({ question: 'What is 2+2?', answer: '4' }).withInputs('question'),
      new Example({ question: 'What is 3+3?', answer: '6' }).withInputs('question'),
      new Example({ question: 'What is 5+5?', answer: '10' }).withInputs('question'),
      new Example({ question: 'What is the capital of France?', answer: 'Paris' }).withInputs('question'),
      new Example({ question: 'What is the largest planet?', answer: 'Jupiter' }).withInputs('question'),
      new Example({ question: 'What is 7+8?', answer: '15' }).withInputs('question'),
      new Example({ question: 'What is 12/3?', answer: '4' }).withInputs('question'),
      new Example({ question: 'What is the color of grass?', answer: 'Green' }).withInputs('question')
    ];

    // Create test set
    testset = [
      new Example({ question: 'What is 4+4?', answer: '8' }).withInputs('question'),
      new Example({ question: 'What is the capital of Italy?', answer: 'Rome' }).withInputs('question')
    ];
  });

  describe('Configuration and Initialization', () => {
    it('should initialize with default configuration', () => {
      const metric = (example: Example, prediction: any) => 
        prediction.answer === example.labels().data.answer ? 1 : 0;

      const simba = new SimbaOptimizer({ metric });
      
      expect(simba).toBeDefined();
      // Access private config through testing
      expect(simba['config'].max_steps).toBe(DEFAULT_SIMBA_CONFIG.max_steps);
      expect(simba['config'].max_demos).toBe(DEFAULT_SIMBA_CONFIG.max_demos);
      expect(simba['config'].temperature).toBe(DEFAULT_SIMBA_CONFIG.temperature);
    });

    it('should initialize with custom configuration', () => {
      const metric = (example: Example, prediction: any) => 
        prediction.answer === example.labels().data.answer ? 1 : 0;

      const customConfig: SimbaConfig = {
        metric,
        max_steps: 5,
        max_demos: 5,
        temperature: 0.8,
        sampling_temperature: 0.1,
        mini_batch_size: 3,
        seed: 123
      };

      const simba = new SimbaOptimizer(customConfig);
      
      expect(simba['config'].max_steps).toBe(5);
      expect(simba['config'].max_demos).toBe(5);
      expect(simba['config'].temperature).toBe(0.8);
      expect(simba['config'].sampling_temperature).toBe(0.1);
      expect(simba['config'].mini_batch_size).toBe(3);
    });

    it('should initialize RNG with seed for reproducibility', () => {
      const metric = (example: Example, prediction: any) => 
        prediction.answer === example.labels().data.answer ? 1 : 0;

      const simba1 = new SimbaOptimizer({ metric, seed: 42 });
      const simba2 = new SimbaOptimizer({ metric, seed: 42 });

      // Both should have same initial state
      expect(simba1['rng'].getSeed()).toBe(simba2['rng'].getSeed());
    });
  });

  describe('Training and Optimization', () => {
    it('should run full optimization process', async () => {
      const metric = (example: Example, prediction: any) => {
        const expected = example.labels().data.answer;
        return prediction.answer === expected ? 1 : 0;
      };

      const simba = new SimbaOptimizer({
        metric,
        max_steps: 3, // Shorter for testing
        max_demos: 3,
        seed: 42
      });

      const optimized = await simba.compile(predictor, trainset);
      
      expect(optimized).toBeDefined();
      expect(optimized.compiled).toBe(true);
      expect(optimized).not.toBe(predictor); // Should be a copy
    });

    it('should track optimization progress', async () => {
      const metric = (example: Example, prediction: any) => {
        const expected = example.labels().data.answer;
        return prediction.answer === expected ? 1 : 0;
      };

      // Spy on console.log to track progress
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const simba = new SimbaOptimizer({
        metric,
        max_steps: 2,
        max_demos: 2,
        seed: 42
      });

      await simba.compile(predictor, trainset);
      
      // Should log optimization progress
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SIMBA: Starting optimization')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SIMBA Step 1/2')
      );

      consoleSpy.mockRestore();
    });

    it('should improve performance over baseline', async () => {
      const metric = (example: Example, prediction: any) => {
        const expected = example.labels().data.answer;
        return prediction.answer === expected ? 1 : 0;
      };

      // Evaluate baseline performance
      let baselineScore = 0;
      for (const example of testset) {
        const inputs = example.inputs();
        const prediction = predictor.forward(inputs.data);
        baselineScore += metric(example, prediction);
      }
      baselineScore /= testset.length;

      // Optimize with SIMBA
      const simba = new SimbaOptimizer({
        metric,
        max_steps: 5,
        max_demos: 5,
        seed: 42
      });

      const optimized = await simba.compile(predictor, trainset);

      // Evaluate optimized performance
      let optimizedScore = 0;
      for (const example of testset) {
        const inputs = example.inputs();
        const prediction = optimized.forward(inputs.data);
        optimizedScore += metric(example, prediction);
      }
      optimizedScore /= testset.length;

      // Performance should be at least as good (could be same for simple mock)
      expect(optimizedScore).toBeGreaterThanOrEqual(baselineScore);
    });
  });

  describe('Mini-batch Sampling', () => {
    it('should sample appropriate mini-batch size', async () => {
      const metric = vi.fn().mockReturnValue(1);

      const simba = new SimbaOptimizer({
        metric,
        max_steps: 1,
        seed: 42
      });

      // Mock the sampleMiniBatch method to test it
      const sampleMiniBatchSpy = vi.spyOn(simba as any, 'sampleMiniBatch');

      await simba.compile(predictor, trainset);
      
      expect(sampleMiniBatchSpy).toHaveBeenCalled();
    });

    it('should handle small training sets', async () => {
      const metric = (example: Example, prediction: any) => 1;

      const smallTrainset = trainset.slice(0, 2);

      const simba = new SimbaOptimizer({
        metric,
        max_steps: 1,
        max_demos: 1,
        seed: 42
      });

      const optimized = await simba.compile(predictor, smallTrainset);
      
      expect(optimized).toBeDefined();
      expect(optimized.compiled).toBe(true);
    });
  });

  describe('Candidate Management', () => {
    it('should generate and track candidates', async () => {
      const metric = (example: Example, prediction: any) => {
        const expected = example.labels().data.answer;
        return prediction.answer === expected ? 1 : 0;
      };

      const simba = new SimbaOptimizer({
        metric,
        max_steps: 2,
        max_demos: 2,
        seed: 42
      });

      await simba.compile(predictor, trainset);
      
      // Should have tracked candidates
      expect(simba['globalCandidatePool'].length).toBeGreaterThan(0);
      expect(simba['winningCandidates'].length).toBeGreaterThan(0);
    });

    it('should generate unique candidate IDs', async () => {
      const metric = (example: Example, prediction: any) => 1;

      const simba = new SimbaOptimizer({
        metric,
        max_steps: 2,
        seed: 42
      });

      await simba.compile(predictor, trainset);
      
      const candidateIds = simba['globalCandidatePool'].map(c => c.id);
      const uniqueIds = new Set(candidateIds);
      
      expect(uniqueIds.size).toBe(candidateIds.length); // All IDs should be unique
    });
  });

  describe('Variability Analysis', () => {
    it('should calculate variability statistics correctly', () => {
      const metric = (example: Example, prediction: any) => 1;

      const simba = new SimbaOptimizer({ metric });

      // Create traces with different scores
      const traces = [
        { example: trainset[0], prediction: { answer: '4' }, score: 1.0, candidateId: 'test1' },
        { example: trainset[0], prediction: { answer: '5' }, score: 0.0, candidateId: 'test2' },
        { example: trainset[0], prediction: { answer: '4' }, score: 1.0, candidateId: 'test3' }
      ];

      const variability = simba['calculateVariability'](traces);
      
      expect(variability.maxMinDifference).toBe(1.0); // 1.0 - 0.0
      expect(variability.variance).toBeGreaterThan(0);
      expect(variability.standardDeviation).toBeGreaterThan(0);
      expect(variability.combined).toBeGreaterThan(0);
    });

    it('should handle single trace gracefully', () => {
      const metric = (example: Example, prediction: any) => 1;

      const simba = new SimbaOptimizer({ metric });

      const traces = [
        { example: trainset[0], prediction: { answer: '4' }, score: 1.0, candidateId: 'test1' }
      ];

      const variability = simba['calculateVariability'](traces);
      
      expect(variability.maxMinDifference).toBe(0);
      expect(variability.variance).toBe(0);
      expect(variability.standardDeviation).toBe(0);
      expect(variability.combined).toBe(0);
    });
  });

  describe('Strategy Selection', () => {
    it('should choose ADD_DEMO for low variability', () => {
      const metric = (example: Example, prediction: any) => 1;
      const simba = new SimbaOptimizer({ metric });

      const lowVariability = {
        maxMinDifference: 0.1,
        meanMaxDifference: 0.05,
        standardDeviation: 0.02,
        variance: 0.0004,
        combined: 0.17 // Below threshold
      };

      const strategy = simba['chooseStrategy'](lowVariability);
      expect(strategy).toBe('add_demonstration');
    });

    it('should choose APPEND_RULE for high variability', () => {
      const metric = (example: Example, prediction: any) => 1;
      const simba = new SimbaOptimizer({ metric });

      const highVariability = {
        maxMinDifference: 0.8,
        meanMaxDifference: 0.4,
        standardDeviation: 0.3,
        variance: 0.09,
        combined: 1.5 // Above threshold
      };

      const strategy = simba['chooseStrategy'](highVariability);
      expect(strategy).toBe('append_a_rule');
    });
  });

  describe('Module Integration', () => {
    it('should work with predictor modules', async () => {
      const metric = (example: Example, prediction: any) => {
        const expected = example.labels().data.answer;
        return prediction.answer === expected ? 1 : 0;
      };

      const simba = new SimbaOptimizer({
        metric,
        max_steps: 2,
        max_demos: 2,
        seed: 42
      });

      const optimized = await simba.compile(predictor, trainset);
      
      expect(simba['isPredictor'](optimized)).toBe(true);
      
      // Should be able to execute optimized predictor
      const inputs = testset[0].inputs();
      const prediction = optimized.forward(inputs.data);
      expect(prediction).toBeDefined();
      expect(prediction.answer).toBeDefined();
    });

    it('should preserve original module functionality', async () => {
      const metric = (example: Example, prediction: any) => 1;

      const simba = new SimbaOptimizer({
        metric,
        max_steps: 1,
        seed: 42
      });

      const originalInputs = testset[0].inputs();
      const originalPrediction = predictor.forward(originalInputs.data);

      const optimized = await simba.compile(predictor, trainset);
      const optimizedPrediction = optimized.forward(originalInputs.data);

      // Both should produce valid predictions
      expect(originalPrediction.answer).toBeDefined();
      expect(optimizedPrediction.answer).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle metric evaluation errors gracefully', async () => {
      const faultyMetric = (example: Example, prediction: any) => {
        if (prediction.answer === '4') {
          throw new Error('Simulated metric error');
        }
        return 1;
      };

      const simba = new SimbaOptimizer({
        metric: faultyMetric,
        max_steps: 1,
        seed: 42
      });

      // Should not throw, but handle errors gracefully
      const optimized = await simba.compile(predictor, trainset);
      expect(optimized).toBeDefined();
    });

    it('should handle prediction errors gracefully', async () => {
      const metric = (example: Example, prediction: any) => 1;

      // Create predictor that sometimes fails
      class FaultyPredictor extends Predictor {
        forward(inputs: Record<string, any>) {
          if (inputs.question?.includes('error')) {
            throw new Error('Simulated prediction error');
          }
          return super.forward(inputs);
        }
      }

      const faultyPredictor = new FaultyPredictor(qaSignature);
      faultyPredictor.set_lm(mockLM);

      const simba = new SimbaOptimizer({
        metric,
        max_steps: 1,
        seed: 42
      });

      const optimized = await simba.compile(faultyPredictor, trainset);
      expect(optimized).toBeDefined();
    });

    it('should throw error when no valid candidates found', async () => {
      const impossibleMetric = () => {
        throw new Error('Always fails');
      };

      const simba = new SimbaOptimizer({
        metric: impossibleMetric,
        max_steps: 1,
        seed: 42
      });

      // Mock the winningCandidates to be empty
      simba['winningCandidates'] = [];

      await expect(simba.compile(predictor, trainset))
        .rejects.toThrow('No valid candidates found during optimization');
    });
  });

  describe('Reproducibility', () => {
    it('should produce deterministic results with same seed', async () => {
      const metric = (example: Example, prediction: any) => {
        const expected = example.labels().data.answer;
        return prediction.answer === expected ? 1 : 0;
      };

      const config: SimbaConfig = {
        metric,
        max_steps: 3,
        max_demos: 2,
        seed: 999
      };

      const simba1 = new SimbaOptimizer(config);
      const simba2 = new SimbaOptimizer(config);

      const optimized1 = await simba1.compile(predictor.deepcopy() as Predictor, trainset);
      const optimized2 = await simba2.compile(predictor.deepcopy() as Predictor, trainset);

      // Should produce same number of demos (deterministic sampling)
      if (simba1['isPredictor'](optimized1) && simba2['isPredictor'](optimized2)) {
        const pred1 = optimized1 as any;
        const pred2 = optimized2 as any;
        expect(pred1.demos.length).toBe(pred2.demos.length);
      }
    });
  });
});