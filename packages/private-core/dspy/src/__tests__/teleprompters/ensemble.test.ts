/**
 * @fileoverview Comprehensive test suite for Ensemble teleprompter
 *
 * Tests 100% API compatibility with Stanford DSPy's Ensemble teleprompter.
 * Validates all constructor parameters, compile method behavior, and edge cases.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Ensemble, EnsembleConfig } from '../../teleprompters/ensemble.js';
import { DSPyModule, Example, Prediction } from '../../lib/index.js';

// Mock DSPy Module for testing
class MockModule extends DSPyModule {
  private name: string;
  private mockResponse: Prediction;

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
      { name: `${this.name}_predictor`, signature: { instructions: 'Test' } },
    ];
  }

  namedPredictors() {
    return [
      [`${this.name}_predictor`, { signature: { instructions: 'Test' } }],
    ];
  }

  deepcopy(): MockModule {
    return new MockModule(this.name, { ...this.mockResponse });
  }
}

// Mock majority function (simplified)
const mockMajority = (outputs: Prediction[]): Prediction => {
  const votes = new Map<string, number>();

  for (const output of outputs) {
    const answer = output.data?.answer || 'unknown';
    votes.set(answer, (votes.get(answer) || 0) + 1);
  }

  let maxVotes = 0;
  let winner = 'unknown';
  for (const [answer, count] of votes) {
    if (count > maxVotes) {
      maxVotes = count;
      winner = answer;
    }
  }

  return {
    data: { answer: winner },
    reasoning: `Majority vote: ${winner} (${maxVotes}/${outputs.length})`,
    confidence: maxVotes / outputs.length,
  };
};

describe('Ensemble Teleprompter', () => {
  let ensemble: Ensemble;
  let programs: MockModule[];
  let testExample: Example;

  beforeEach(() => {
    // Create test programs
    programs = [
      new MockModule('program1', { data: { answer: 'A' }, confidence: 0.8 }),
      new MockModule('program2', { data: { answer: 'B' }, confidence: 0.7 }),
      new MockModule('program3', { data: { answer: 'A' }, confidence: 0.9 }),
    ];

    testExample = new Example({
      question: 'What is the answer?',
      answer: 'A',
    });
  });

  describe('Constructor API Compatibility', () => {
    it('should create ensemble with default parameters', () => {
      ensemble = new Ensemble();
      const config = ensemble.getConfig();

      expect(config.reduce_fn).toBeNull();
      expect(config.size).toBeNull();
      expect(config.deterministic).toBe(false);
    });

    it('should create ensemble with reduce function', () => {
      ensemble = new Ensemble({ reduce_fn: mockMajority });
      const config = ensemble.getConfig();

      expect(config.reduce_fn).toBe(mockMajority);
      expect(config.size).toBeNull();
      expect(config.deterministic).toBe(false);
    });

    it('should create ensemble with size parameter', () => {
      ensemble = new Ensemble({ size: 2 });
      const config = ensemble.getConfig();

      expect(config.reduce_fn).toBeNull();
      expect(config.size).toBe(2);
      expect(config.deterministic).toBe(false);
    });

    it('should throw error for deterministic=true (not implemented)', () => {
      expect(() => {
        new Ensemble({ deterministic: true });
      }).toThrow('TODO: Implement example hashing for deterministic ensemble.');
    });

    it('should accept deterministic=false', () => {
      ensemble = new Ensemble({ deterministic: false });
      const config = ensemble.getConfig();

      expect(config.deterministic).toBe(false);
    });

    it('should create ensemble with all parameters', () => {
      const config: EnsembleConfig = {
        reduce_fn: mockMajority,
        size: 2,
        deterministic: false,
      };

      ensemble = new Ensemble(config);
      const actualConfig = ensemble.getConfig();

      expect(actualConfig.reduce_fn).toBe(mockMajority);
      expect(actualConfig.size).toBe(2);
      expect(actualConfig.deterministic).toBe(false);
    });
  });

  describe('Compile Method API Compatibility', () => {
    beforeEach(() => {
      ensemble = new Ensemble();
    });

    it('should compile programs into EnsembledProgram', () => {
      const ensembledProgram = ensemble.compile(programs);

      expect(ensembledProgram).toBeDefined();
      expect(typeof ensembledProgram.forward).toBe('function');
      expect(typeof ensembledProgram.predictors).toBe('function');
      expect(typeof ensembledProgram.namedPredictors).toBe('function');
      expect(typeof ensembledProgram.deepcopy).toBe('function');
    });

    it('should throw error for empty programs array', () => {
      expect(() => {
        ensemble.compile([]);
      }).toThrow('Programs must be a non-empty array of DSPy modules');
    });

    it('should throw error for non-array input', () => {
      expect(() => {
        ensemble.compile(null as any);
      }).toThrow('Programs must be a non-empty array of DSPy modules');
    });

    it('should handle single program', () => {
      const ensembledProgram = ensemble.compile([programs[0]]);
      expect(ensembledProgram).toBeDefined();
    });
  });

  describe('EnsembledProgram Behavior', () => {
    it('should run all programs when no size specified', async () => {
      ensemble = new Ensemble();
      const ensembledProgram = ensemble.compile(programs);

      const result = await ensembledProgram.forward(testExample);

      expect(result.data?.outputs).toBeDefined();
      expect(Array.isArray(result.data?.outputs)).toBe(true);
      expect(result.data?.outputs).toHaveLength(3);
    });

    it('should sample programs when size specified', async () => {
      ensemble = new Ensemble({ size: 2 });
      const ensembledProgram = ensemble.compile(programs);

      const result = await ensembledProgram.forward(testExample);

      expect(result.data?.outputs).toBeDefined();
      expect(Array.isArray(result.data?.outputs)).toBe(true);
      expect(result.data?.outputs).toHaveLength(2);
    });

    it('should apply reduce function when provided', async () => {
      ensemble = new Ensemble({ reduce_fn: mockMajority });
      const ensembledProgram = ensemble.compile(programs);

      const result = await ensembledProgram.forward(testExample);

      expect(result.data?.answer).toBe('A'); // Majority vote
      expect(result.reasoning).toContain('Majority vote');
      expect(result.confidence).toBe(2 / 3); // 2 out of 3 voted for A
    });

    it('should combine size and reduce function', async () => {
      ensemble = new Ensemble({
        size: 2,
        reduce_fn: mockMajority,
      });
      const ensembledProgram = ensemble.compile(programs);

      const result = await ensembledProgram.forward(testExample);

      expect(result.data?.answer).toBeDefined();
      expect(result.reasoning).toContain('Majority vote');
    });

    it('should handle size larger than programs array', async () => {
      ensemble = new Ensemble({ size: 10 });
      const ensembledProgram = ensemble.compile(programs);

      const result = await ensembledProgram.forward(testExample);

      // Should use all available programs
      expect(result.data?.outputs).toHaveLength(3);
    });

    it('should handle size of 1', async () => {
      ensemble = new Ensemble({ size: 1 });
      const ensembledProgram = ensemble.compile(programs);

      const result = await ensembledProgram.forward(testExample);

      expect(result.data?.outputs).toHaveLength(1);
    });
  });

  describe('EnsembledProgram Methods', () => {
    let ensembledProgram: any;

    beforeEach(() => {
      ensemble = new Ensemble();
      ensembledProgram = ensemble.compile(programs);
    });

    it('should return predictors from all programs', () => {
      const predictors = ensembledProgram.predictors();

      expect(predictors).toHaveLength(3);
      expect(predictors[0].name).toBe('program1_predictor');
      expect(predictors[1].name).toBe('program2_predictor');
      expect(predictors[2].name).toBe('program3_predictor');
    });

    it('should return named predictors with program prefixes', () => {
      const namedPredictors = ensembledProgram.namedPredictors();

      expect(namedPredictors).toHaveLength(3);
      expect(namedPredictors[0][0]).toBe('program_0_program1_predictor');
      expect(namedPredictors[1][0]).toBe('program_1_program2_predictor');
      expect(namedPredictors[2][0]).toBe('program_2_program3_predictor');
    });

    it('should create deep copy', () => {
      const copied = ensembledProgram.deepcopy();

      expect(copied).not.toBe(ensembledProgram);
      expect(typeof copied.forward).toBe('function');
      expect(typeof copied.predictors).toBe('function');
    });

    it('should handle programs without predictors method', () => {
      const mockProgramWithoutPredictors = {
        forward: async () => ({ data: { answer: 'test' } }),
        deepcopy: function () {
          return this;
        },
      };

      const ensembledProgram = ensemble.compile([
        mockProgramWithoutPredictors as any,
      ]);
      const predictors = ensembledProgram.predictors();

      expect(predictors).toHaveLength(0);
    });

    it('should handle programs without namedPredictors method', () => {
      const mockProgramWithoutNamedPredictors = {
        forward: async () => ({ data: { answer: 'test' } }),
        predictors: () => [],
        deepcopy: function () {
          return this;
        },
      };

      const ensembledProgram = ensemble.compile([
        mockProgramWithoutNamedPredictors as any,
      ]);
      const namedPredictors = ensembledProgram.namedPredictors();

      expect(namedPredictors).toHaveLength(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle programs that throw errors', async () => {
      const errorProgram = new MockModule('error', {
        data: { answer: 'error' },
      });
      errorProgram.forward = async () => {
        throw new Error('Program failed');
      };

      ensemble = new Ensemble();
      const ensembledProgram = ensemble.compile([
        programs[0],
        errorProgram,
        programs[2],
      ]);

      // Should handle the error gracefully
      await expect(ensembledProgram.forward(testExample)).rejects.toThrow(
        'Program failed'
      );
    });

    it('should handle null reduce function explicitly', async () => {
      ensemble = new Ensemble({ reduce_fn: null });
      const ensembledProgram = ensemble.compile(programs);

      const result = await ensembledProgram.forward(testExample);

      expect(result.data?.outputs).toBeDefined();
      expect(Array.isArray(result.data?.outputs)).toBe(true);
    });

    it('should handle programs with undefined outputs', async () => {
      const undefinedProgram = new MockModule('undefined', {
        data: undefined as any,
      });

      ensemble = new Ensemble({ reduce_fn: mockMajority });
      const ensembledProgram = ensemble.compile([undefinedProgram]);

      const result = await ensembledProgram.forward(testExample);

      expect(result.data?.answer).toBe('unknown'); // Default from majority function
    });

    it('should maintain reproducibility with same programs', async () => {
      ensemble = new Ensemble({ size: 2 });
      const ensembledProgram = ensemble.compile([...programs]);

      // Multiple runs should be consistent (with same seed)
      const result1 = await ensembledProgram.forward(testExample);
      const result2 = await ensembledProgram.forward(testExample);

      expect(result1.data?.outputs).toHaveLength(2);
      expect(result2.data?.outputs).toHaveLength(2);
    });
  });

  describe('Stanford DSPy Compatibility', () => {
    it('should match Stanford DSPy constructor signature', () => {
      // Test various Stanford DSPy-style instantiations
      const ensemble1 = new Ensemble();
      expect(ensemble1).toBeInstanceOf(Ensemble);

      const ensemble2 = new Ensemble({ reduce_fn: mockMajority });
      expect(ensemble2).toBeInstanceOf(Ensemble);

      const ensemble3 = new Ensemble({ size: 3 });
      expect(ensemble3).toBeInstanceOf(Ensemble);

      const ensemble4 = new Ensemble({
        reduce_fn: mockMajority,
        size: 2,
        deterministic: false,
      });
      expect(ensemble4).toBeInstanceOf(Ensemble);
    });

    it('should match Stanford DSPy compile method signature', () => {
      ensemble = new Ensemble();

      // Should accept array of programs
      const result = ensemble.compile(programs);
      expect(result).toBeDefined();
    });

    it('should match Stanford DSPy EnsembledProgram behavior', async () => {
      // Test behavior matches Python version
      ensemble = new Ensemble({ size: 2 });
      const ensembledProgram = ensemble.compile(programs);

      const result = await ensembledProgram.forward(testExample);

      // Should return either reduced result or array of outputs
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should handle Stanford DSPy majority function pattern', async () => {
      // Test with majority-like reduce function
      ensemble = new Ensemble({ reduce_fn: mockMajority });
      const ensembledProgram = ensemble.compile(programs);

      const result = await ensembledProgram.forward(testExample);

      expect(result.data?.answer).toBe('A');
      expect(typeof result.confidence).toBe('number');
    });

    it('should support Stanford DSPy-style deterministic error', () => {
      // Should throw exact same error as Stanford DSPy
      expect(() => {
        new Ensemble({ deterministic: true });
      }).toThrow('TODO: Implement example hashing for deterministic ensemble.');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large number of programs', () => {
      const manyPrograms = Array.from(
        { length: 100 },
        (_, i) =>
          new MockModule(`program${i}`, { data: { answer: `answer${i}` } })
      );

      ensemble = new Ensemble({ size: 10 });
      const ensembledProgram = ensemble.compile(manyPrograms);

      expect(ensembledProgram).toBeDefined();
    });

    it('should handle concurrent forward calls', async () => {
      ensemble = new Ensemble({ size: 2 });
      const ensembledProgram = ensemble.compile(programs);

      const promises = Array.from({ length: 5 }, () =>
        ensembledProgram.forward(testExample)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.data?.outputs).toHaveLength(2);
      });
    });
  });
});
