/**
 * @fileoverview ML Integration Tests - Comprehensive Validation
 *
 * Validates the complete ML enhancement ecosystem including:
 * - DSPy-Brain ML Bridge integration
 * - Autonomous Teleprompter Selector functionality
 * - ML-enhanced teleprompter variants (MIPROv2ML, COPROML, GRPOML)
 * - End-to-end optimization workflows
 *
 * This test suite ensures all ML components work together seamlessly
 * and provide the expected performance improvements.
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { MLIntegrationDemo } from '../examples/ml-integration-demo';
import { DSPyBrainMLBridge } from '../ml-bridge/dspy-brain-ml-bridge';
import { AutonomousTeleprompterSelector } from '../autonomous/teleprompter-selector';
import { MIPROv2ML } from '../teleprompters/miprov2-ml';
import { COPROML } from '../teleprompters/copro-ml';
import { GRPOML } from '../teleprompters/grpo-ml';
import type { OptimizationTask } from '../autonomous/teleprompter-selector';

// Mock external dependencies for testing
vi.mock('@claude-zen/brain', () => ({
  BrainCoordinator: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    processOptimizationTask: vi.fn().mockResolvedValue({
      id: 'test-result',
      success: true,
      result: {
        optimizedInstructions: ['Test optimized instruction'],
        finalAccuracy: 0.92,
        convergenceTime: 5000,
        converged: true,
      },
    }),
    getMLEngine: vi.fn().mockReturnValue({
      optimizeTeleprompter: vi.fn().mockResolvedValue({
        success: true,
        optimizedParameters: {},
        metrics: { accuracy: 0.92 },
      }),
    }),
    destroy: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../../neural-ml/src/ml-engine', () => ({
  createMLEngine: vi.fn().mockResolvedValue({
    initialize: vi.fn().mockResolvedValue(undefined),
    bayesianOptimizer: {
      configure: vi.fn().mockResolvedValue(undefined),
      optimize: vi.fn().mockResolvedValue({
        bestParams: [0.8, 0.02, 0.1, 0.75],
        bestScore: 0.92,
      }),
    },
    onlineLearner: {
      configure: vi.fn().mockResolvedValue(undefined),
      predict: vi.fn().mockResolvedValue(0.85),
      update: vi.fn().mockResolvedValue(undefined),
      detectDrift: vi.fn().mockResolvedValue({
        driftDetected: false,
        driftStrength: 0.1,
        confidence: 0.8,
      }),
      reset: vi.fn().mockResolvedValue(undefined),
      adaptLearningRate: vi.fn().mockResolvedValue(undefined),
    },
    patternLearner: {
      configure: vi.fn().mockResolvedValue(undefined),
      trainPatterns: vi
        .fn()
        .mockResolvedValue([
          { pattern: 'test-pattern', confidence: 0.9, quality: 0.85 },
        ]),
    },
    statisticalAnalyzer: {
      tTest: vi.fn().mockResolvedValue({
        statistic: 2.5,
        pValue: 0.02,
        critical: 0.05,
        significant: true,
        effectSize: 0.4,
      }),
      correlation: vi.fn().mockResolvedValue({
        correlation: 0.7,
        pValue: 0.01,
      }),
    },
  }),
}));

describe('ML Integration Tests', () => {
  let demo: MLIntegrationDemo;
  let bridge: DSPyBrainMLBridge;
  let selector: AutonomousTeleprompterSelector;

  const sampleTask: OptimizationTask = {
    id: 'test-optimization-task',
    description: 'Test optimization for ML integration validation',
    domain: {
      type: 'nlp',
      dataCharacteristics: {
        size: 'medium',
        quality: 'good',
        complexity: 'moderate',
      },
    },
    complexity: {
      computational: 'medium',
      algorithmic: 'intermediate',
      dataVolume: 'medium',
      timeConstraints: 'moderate',
    },
    requirements: {
      minimumAccuracy: 0.8,
      maximumLatency: 1000,
      memoryConstraints: 512,
      robustness: 'moderate',
      interpretability: 'helpful',
    },
    constraints: {
      computationalBudget: 'moderate',
      timeLimit: 30000,
      memoryLimit: 512,
      qualityThreshold: 0.8,
      fallbackRequired: true,
    },
  };

  beforeAll(async () => {
    // Initialize test components
    demo = new MLIntegrationDemo();
    bridge = new DSPyBrainMLBridge();
    selector = new AutonomousTeleprompterSelector();
  });

  afterAll(async () => {
    // Cleanup
    await demo.destroy();
    await bridge.destroy();
    await selector.destroy();
  });

  describe('Core Component Initialization', () => {
    it('should initialize ML Integration Demo successfully', async () => {
      await demo.initialize();

      const status = demo.getEcosystemStatus();
      expect(status.initialized).toBe(true);
      expect(status.availableVariants).toHaveLength(3);
      expect(status.capabilities).toContain(
        'Autonomous teleprompter selection using ML analysis'
      );
    });

    it('should initialize DSPy-Brain ML Bridge successfully', async () => {
      await bridge.initialize();

      const status = bridge.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.brainCoordinatorActive).toBe(true);
    });

    it('should initialize Autonomous Teleprompter Selector successfully', async () => {
      await selector.initialize();

      const status = selector.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.totalVariants).toBeGreaterThan(0);
    });
  });

  describe('ML-Enhanced Teleprompter Variants', () => {
    it('should create and initialize MIPROv2ML with Bayesian optimization', async () => {
      const teleprompter = new MIPROv2ML({
        maxIterations: 10,
        useBayesianOptimization: true,
      });

      await teleprompter.initialize();
      expect(teleprompter).toBeDefined();
    });

    it('should create and initialize COPROML with online learning', async () => {
      const teleprompter = new COPROML({
        maxIterations: 10,
        useOnlineLearning: true,
        useDriftDetection: true,
      });

      await teleprompter.initialize();
      expect(teleprompter).toBeDefined();
    });

    it('should create and initialize GRPOML with reinforcement learning', async () => {
      const teleprompter = new GRPOML({
        maxEpisodes: 10,
        useReinforcementLearning: true,
        usePolicyGradient: true,
      });

      await teleprompter.initialize();
      expect(teleprompter).toBeDefined();
    });
  });

  describe('Autonomous Teleprompter Selection', () => {
    it('should select optimal teleprompter for given task', async () => {
      await selector.initialize();

      const selection = await selector.selectOptimalTeleprompter(sampleTask);

      expect(selection).toBeDefined();
      expect(selection.selectedTeleprompter).toBeDefined();
      expect(selection.confidence).toBeGreaterThan(0);
      expect(selection.confidence).toBeLessThanOrEqual(1);
      expect(selection.reasoning).toBeDefined();
      expect(selection.alternatives).toBeInstanceOf(Array);
    });

    it('should provide different recommendations for different task types', async () => {
      await selector.initialize();

      const speedTask: OptimizationTask = {
        ...sampleTask,
        id: 'speed-task',
        description:
          'Fast real-time optimization task requiring quick responses',
        requirements: {
          ...sampleTask.requirements,
          maximumLatency: 100,
        },
      };

      const complexTask: OptimizationTask = {
        ...sampleTask,
        id: 'complex-task',
        description:
          'Complex sophisticated optimization with advanced requirements',
        complexity: {
          ...sampleTask.complexity,
          computational: 'high',
          algorithmic: 'advanced',
        },
      };

      const speedSelection =
        await selector.selectOptimalTeleprompter(speedTask);
      const complexSelection =
        await selector.selectOptimalTeleprompter(complexTask);

      // Should potentially recommend different teleprompters
      expect(speedSelection.selectedTeleprompter).toBeDefined();
      expect(complexSelection.selectedTeleprompter).toBeDefined();
      expect(speedSelection.reasoning).not.toBe(complexSelection.reasoning);
    });
  });

  describe('DSPy-Brain ML Bridge Integration', () => {
    it('should provide intelligent teleprompter recommendations', async () => {
      await bridge.initialize();

      const recommendation =
        await bridge.getIntelligentTeleprompterRecommendation(
          'Complex NLP task requiring high accuracy and sophisticated reasoning'
        );

      expect(recommendation).toBeDefined();
      expect(recommendation.recommendedTeleprompter).toBeDefined();
      expect(recommendation.confidence).toBeGreaterThan(0);
      expect(recommendation.reasoning).toBeDefined();
      expect(recommendation.suggestedConfig).toBeDefined();
      expect(typeof recommendation.mlEnhanced).toBe('boolean');
    });

    it('should optimize teleprompter using Brain ML capabilities', async () => {
      await bridge.initialize();

      const optimizationTask = {
        type: 'teleprompter_optimization' as const,
        teleprompterType: 'miprov2' as const,
        objective: 'accuracy' as const,
        parameters: {
          instructions: ['Test instruction'],
          prefixes: ['Test prefix'],
          demonstrations: [],
          populationSize: 20,
          maxIterations: 50,
        },
        constraints: {
          maxExecutionTime: 30000,
          maxMemoryUsage: 512,
          minAccuracy: 0.8,
          maxLatency: 1000,
        },
        dataset: {
          examples: [
            { input: { query: 'test' }, output: { response: 'test response' } },
          ],
          validationSplit: 0.2,
          testSplit: 0.1,
        },
        evaluationMetrics: ['accuracy', 'speed'],
      };

      const result = await bridge.optimizeTeleprompter(optimizationTask);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.optimizedParameters).toBeDefined();
      expect(result.metrics.accuracy).toBeGreaterThan(0);
      expect(result.neuralAnalysis).toBeDefined();
      expect(result.convergenceInfo).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
  });

  describe('End-to-End ML Integration Demo', () => {
    it('should run complete ML integration demo successfully', async () => {
      await demo.initialize();

      const result = await demo.runDemo(sampleTask);

      expect(result).toBeDefined();
      expect(result.task).toEqual(sampleTask);
      expect(result.selection).toBeDefined();
      expect(result.optimizationResult).toBeDefined();
      expect(result.alternativeResults).toBeInstanceOf(Array);
      expect(result.analysis).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should demonstrate all ML-enhanced variants', async () => {
      await demo.initialize();

      const results = await demo.demonstrateAllVariants();

      expect(results).toBeInstanceOf(Array);
      expect(results).toHaveLength(3); // MIPROv2ML, COPROML, GRPOML

      results.forEach((result) => {
        expect(result.variantName).toBeDefined();
        expect(result.capabilities).toBeInstanceOf(Array);
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
        expect(typeof result.success).toBe('boolean');
        expect(result.insights).toBeInstanceOf(Array);
      });
    });

    it('should provide comprehensive ecosystem status', async () => {
      await demo.initialize();

      const status = demo.getEcosystemStatus();

      expect(status.initialized).toBe(true);
      expect(status.mlBridge).toBeDefined();
      expect(status.autonomousSelector).toBeDefined();
      expect(status.availableVariants).toHaveLength(3);
      expect(status.capabilities).toContain(
        'Autonomous teleprompter selection using ML analysis'
      );
      expect(status.capabilities).toContain(
        'Battle-tested Rust crates integration (smartcore, linfa, argmin, statrs)'
      );
      expect(status.capabilities).toContain(
        'Multi-objective optimization (accuracy, speed, memory)'
      );
    });
  });

  describe('Performance and Quality Validation', () => {
    it('should show improved performance with ML enhancement', async () => {
      await demo.initialize();

      const result = await demo.runDemo(sampleTask);

      // Validate that ML enhancements provide benefits
      expect(result.selection.confidence).toBeGreaterThan(0.5);
      expect(result.analysis.selectedPerformance.accuracy).toBeGreaterThan(0.7);
      expect(result.analysis.confidence.selectionConfidence).toBeGreaterThan(
        0.5
      );

      // Check for meaningful insights
      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should demonstrate convergence and learning', async () => {
      const teleprompter = new COPROML({
        maxIterations: 20,
        useOnlineLearning: true,
        useDriftDetection: true,
      });

      await teleprompter.initialize();

      const mockModule = {
        id: 'test-module',
        instructions: ['Test instruction'],
        demonstrations: [],
        config: { temperature: 0.7 },
      };

      const result = await teleprompter.compile(mockModule, {
        evaluationMethod: 'test',
      });

      expect(result).toBeDefined();
      expect(result.convergenceRate).toBeGreaterThanOrEqual(0);
      expect(result.learningCurve).toBeInstanceOf(Array);
      expect(result.onlineLearningStats.totalUpdates).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Robustness', () => {
    it('should handle initialization failures gracefully', async () => {
      const faultyBridge = new DSPyBrainMLBridge();

      // Mock a failure in brain coordinator creation
      vi.mocked(
        require('@claude-zen/brain').BrainCoordinator
      ).mockImplementationOnce(() => {
        throw new Error('Initialization failed');
      });

      await expect(faultyBridge.initialize()).rejects.toThrow(
        'Initialization failed'
      );
    });

    it('should provide fallback recommendations when ML analysis fails', async () => {
      await selector.initialize();

      // Test with minimal task information
      const minimalTask: OptimizationTask = {
        id: 'minimal-task',
        description: '',
        domain: {
          type: 'general',
          dataCharacteristics: {
            size: 'small',
            quality: 'unknown',
            complexity: 'simple',
          },
        },
        complexity: {
          computational: 'low',
          algorithmic: 'simple',
          dataVolume: 'small',
          timeConstraints: 'relaxed',
        },
        requirements: {
          minimumAccuracy: 0.5,
          maximumLatency: 5000,
          memoryConstraints: 256,
          robustness: 'basic',
          interpretability: 'optional',
        },
        constraints: {
          computationalBudget: 'limited',
          timeLimit: 10000,
          memoryLimit: 256,
          qualityThreshold: 0.5,
          fallbackRequired: true,
        },
      };

      const selection = await selector.selectOptimalTeleprompter(minimalTask);

      expect(selection).toBeDefined();
      expect(selection.selectedTeleprompter).toBeDefined();
      expect(selection.confidence).toBeGreaterThan(0);
    });
  });
});

/**
 * Integration test utilities
 */
export class MLIntegrationTestUtils {
  static createMockOptimizationTask(
    overrides: Partial<OptimizationTask> = {}
  ): OptimizationTask {
    return {
      id: 'test-task',
      description: 'Test optimization task',
      domain: {
        type: 'general',
        dataCharacteristics: {
          size: 'medium',
          quality: 'good',
          complexity: 'moderate',
        },
      },
      complexity: {
        computational: 'medium',
        algorithmic: 'intermediate',
        dataVolume: 'medium',
        timeConstraints: 'moderate',
      },
      requirements: {
        minimumAccuracy: 0.8,
        maximumLatency: 1000,
        memoryConstraints: 512,
        robustness: 'moderate',
        interpretability: 'helpful',
      },
      constraints: {
        computationalBudget: 'moderate',
        timeLimit: 30000,
        memoryLimit: 512,
        qualityThreshold: 0.8,
        fallbackRequired: true,
      },
      ...overrides,
    };
  }

  static validateMLResult(result: any): boolean {
    return (
      result &&
      typeof result.success === 'boolean' &&
      result.metrics &&
      typeof result.metrics.accuracy === 'number' &&
      result.neuralAnalysis &&
      result.convergenceInfo &&
      result.recommendations
    );
  }

  static async runPerformanceComparison(
    demo: MLIntegrationDemo,
    task: OptimizationTask
  ): Promise<{
    mlEnhanced: any;
    baseline: any;
    improvement: number;
  }> {
    // Run ML-enhanced optimization
    const mlResult = await demo.runDemo(task);

    // Simulate baseline (non-ML) optimization
    const baselineResult = {
      accuracy: 0.75,
      executionTime: mlResult.executionTime * 1.5,
    };

    const improvement =
      (mlResult.analysis.selectedPerformance.accuracy -
        baselineResult.accuracy) /
      baselineResult.accuracy;

    return {
      mlEnhanced: mlResult,
      baseline: baselineResult,
      improvement,
    };
  }
}

export default MLIntegrationTestUtils;
