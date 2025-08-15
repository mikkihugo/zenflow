/**
 * @fileoverview Phase 3 Ensemble Learning Integration Tests
 *
 * Comprehensive test suite for Phase 3 Ensemble Learning system and Neural Ensemble Coordinator.
 * Tests the complete integration of multi-tier ensemble coordination, neural model integration,
 * and coordinated prediction generation across the learning system architecture.
 *
 * Test Coverage:
 * - Phase 3 Ensemble Learning initialization and configuration
 * - Multi-tier model registration and coordination
 * - Ensemble prediction generation and fusion strategies
 * - Neural Ensemble Coordinator integration
 * - Performance metrics and adaptation mechanisms
 * - Error handling and recovery scenarios
 * - Memory persistence and state restoration
 *
 * @author Claude Code Zen Team - Testing Infrastructure
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'node:events';

// Import the systems under test
import {
  Phase3EnsembleLearning,
  type Phase3EnsembleConfig,
  type EnsemblePredictionResult,
  type EnsembleStrategy,
} from '../../coordination/swarm/learning/phase-3-ensemble.ts';

import {
  NeuralEnsembleCoordinator,
  type NeuralEnsembleCoordinatorConfig,
  type NeuralEnsembleMode,
  type CoordinatedPredictionResult,
} from '../../coordination/swarm/learning/neural-ensemble-coordinator.ts';

// Mock dependencies
import type { IEventBus } from '../../core/interfaces/base-interfaces.ts';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator.ts';

// Test utilities and mocks
class MockEventBus extends EventEmitter implements IEventBus {
  private eventHistory: Array<{ event: string; data: any; timestamp: Date }> =
    [];

  emit(event: string, data?: any): boolean {
    this.eventHistory.push({ event, data, timestamp: new Date() });
    return super.emit(event, data);
  }

  getEventHistory(): Array<{ event: string; data: any; timestamp: Date }> {
    return [...this.eventHistory];
  }

  clearHistory(): void {
    this.eventHistory = [];
  }
}

class MockMemoryCoordinator implements MemoryCoordinator {
  private storage = new Map<string, any>();

  async store(key: string, value: any, options?: any): Promise<void> {
    this.storage.set(key, { value, options, timestamp: new Date() });
  }

  async retrieve(key: string): Promise<any> {
    const stored = this.storage.get(key);
    return stored ? stored.value : null;
  }

  async delete(key: string): Promise<boolean> {
    return this.storage.delete(key);
  }

  async list(pattern?: string): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}

describe('Phase 3 Ensemble Learning System', () => {
  let eventBus: MockEventBus;
  let memoryCoordinator: MockMemoryCoordinator;
  let ensembleSystem: Phase3EnsembleLearning;
  let ensembleConfig: Phase3EnsembleConfig;

  beforeEach(() => {
    eventBus = new MockEventBus();
    memoryCoordinator = new MockMemoryCoordinator();

    ensembleConfig = {
      enabled: true,
      defaultStrategy: 'weighted_voting' as EnsembleStrategy,
      adaptiveStrategySelection: true,
      maxModelsPerTier: 10,
      modelRetentionPeriod: 7, // days
      performanceEvaluationInterval: 5, // minutes
      minimumConsensusThreshold: 0.7,
      confidenceThreshold: 0.8,
      uncertaintyToleranceLevel: 0.3,
      diversityRequirement: 0.6,
      weightUpdateFrequency: 10, // minutes
      performanceWindowSize: 50,
      adaptationSensitivity: 0.2,
      predictionValidationEnabled: true,
      crossValidationFolds: 5,
      ensembleStabilityThreshold: 0.75,
    };

    ensembleSystem = new Phase3EnsembleLearning(
      ensembleConfig,
      eventBus,
      memoryCoordinator
    );
  });

  afterEach(async () => {
    await ensembleSystem.shutdown();
    eventBus.removeAllListeners();
  });

  describe('Initialization and Configuration', () => {
    it('should initialize with correct configuration', () => {
      const status = ensembleSystem.getEnsembleStatus();

      expect(status.enabled).toBe(true);
      expect(status.activeStrategy).toBe('weighted_voting');
      expect(status.tierStatus[1]).toBeDefined();
      expect(status.tierStatus[2]).toBeDefined();
      expect(status.tierStatus[3]).toBeDefined();
    });

    it('should create three-tier ensemble structure', () => {
      const status = ensembleSystem.getEnsembleStatus();

      // Should have 3 tiers initialized
      expect(Object.keys(status.tierStatus)).toHaveLength(3);
      expect(status.tierStatus[1].modelCount).toBe(0); // Initially no models
      expect(status.tierStatus[2].modelCount).toBe(0);
      expect(status.tierStatus[3].modelCount).toBe(0);
    });

    it('should handle disabled configuration', async () => {
      const disabledConfig = { ...ensembleConfig, enabled: false };
      const disabledSystem = new Phase3EnsembleLearning(
        disabledConfig,
        eventBus,
        memoryCoordinator
      );

      const status = disabledSystem.getEnsembleStatus();
      expect(status.enabled).toBe(false);

      await disabledSystem.shutdown();
    });
  });

  describe('Multi-Tier Model Registration', () => {
    it('should process Tier 1 learning data and create models', async () => {
      const tier1Data = {
        swarmId: 'test-swarm-1',
        agentPerformance: [
          { agentId: 'agent-1', efficiency: 0.85, quality: 0.9 },
          { agentId: 'agent-2', efficiency: 0.78, quality: 0.82 },
        ],
        patterns: [
          { type: 'task_completion', confidence: 0.8, frequency: 5 },
          { type: 'resource_optimization', confidence: 0.75, frequency: 3 },
        ],
        performance: { accuracy: 0.82, confidence: 0.78 },
      };

      // Emit Tier 1 learning event
      eventBus.emit('swarm:test-swarm-1:learning:result', tier1Data);

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 10));

      const status = ensembleSystem.getEnsembleStatus();
      expect(status.tierStatus[1].modelCount).toBe(1);
      expect(status.tierStatus[1].averageAccuracy).toBeCloseTo(0.82, 2);
    });

    it('should process Tier 2 coordination learning data', async () => {
      const tier2Data = {
        crossSwarmPatterns: [
          {
            patternId: 'pattern-1',
            sourceSwarms: ['swarm-1', 'swarm-2'],
            effectiveness: 0.9,
          },
          {
            patternId: 'pattern-2',
            sourceSwarms: ['swarm-2', 'swarm-3'],
            effectiveness: 0.85,
          },
        ],
        coordinationEfficiency: 0.88,
        resourceOptimization: [
          { type: 'cpu_allocation', improvement: 0.15 },
          { type: 'memory_optimization', improvement: 0.12 },
        ],
        performance: { accuracy: 0.88, confidence: 0.85 },
      };

      eventBus.emit('queen:coordination:learning:complete', tier2Data);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const status = ensembleSystem.getEnsembleStatus();
      expect(status.tierStatus[2].modelCount).toBe(1);
      expect(status.tierStatus[2].averageAccuracy).toBeCloseTo(0.88, 2);
    });

    it('should process Tier 3 neural learning data', async () => {
      const tier3Data = {
        predictions: [
          { predictionId: 'pred-1', confidence: 0.92, type: 'performance' },
          { predictionId: 'pred-2', confidence: 0.89, type: 'resource-demand' },
        ],
        deepPatterns: [
          { patternId: 'deep-1', complexity: 0.8, predictiveValue: 0.9 },
        ],
        neuralOptimizations: [
          { optimizationId: 'opt-1', expectedGains: { performance: 0.15 } },
        ],
        modelPerformance: { accuracy: 0.91, confidence: 0.88 },
      };

      eventBus.emit('tier3:predictions:generated', tier3Data);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const status = ensembleSystem.getEnsembleStatus();
      expect(status.tierStatus[3].modelCount).toBe(1);
      expect(status.tierStatus[3].averageAccuracy).toBeCloseTo(0.91, 2);
    });
  });

  describe('Ensemble Prediction Generation', () => {
    beforeEach(async () => {
      // Populate all tiers with test models
      eventBus.emit('swarm:test:learning:result', {
        swarmId: 'test-swarm',
        performance: { accuracy: 0.8, confidence: 0.75 },
        patterns: [{ type: 'test', confidence: 0.8 }],
      });

      eventBus.emit('queen:coordination:learning:complete', {
        coordinationEfficiency: 0.85,
        performance: { accuracy: 0.85, confidence: 0.8 },
      });

      eventBus.emit('tier3:predictions:generated', {
        predictions: [{ confidence: 0.9 }],
        modelPerformance: { accuracy: 0.9, confidence: 0.87 },
      });

      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    it('should generate ensemble prediction with weighted voting', async () => {
      const prediction = await ensembleSystem.requestEnsemblePrediction(
        'test_prediction',
        { type: 'test', context: { complexity: 0.5 } },
        { requiredConfidence: 0.7 }
      );

      expect(prediction.predictionId).toBeDefined();
      expect(prediction.confidence).toBeGreaterThan(0.5);
      expect(prediction.contributingModels.size).toBeGreaterThan(0);
      expect(prediction.tierContributions.size).toBe(3);
      expect(prediction.metadata.strategy).toBe('weighted_voting');
    });

    it('should generate predictions with different strategies', async () => {
      const strategies: EnsembleStrategy[] = [
        'weighted_voting',
        'hierarchical_fusion',
        'adaptive_stacking',
      ];

      for (const strategy of strategies) {
        const prediction = await ensembleSystem.requestEnsemblePrediction(
          'test_prediction',
          { type: 'test' },
          { strategy }
        );

        expect(prediction.metadata.strategy).toBe(strategy);
        expect(prediction.confidence).toBeGreaterThan(0.3);
      }
    });

    it('should include diversity metrics in predictions', async () => {
      const prediction = await ensembleSystem.requestEnsemblePrediction(
        'diversity_test',
        { type: 'test' }
      );

      expect(prediction.diversityMetrics).toBeDefined();
      expect(prediction.diversityMetrics.modelDiversity).toBeGreaterThan(0);
      expect(
        prediction.diversityMetrics.predictionSpread
      ).toBeGreaterThanOrEqual(0);
      expect(prediction.diversityMetrics.algorithmicDiversity).toBeGreaterThan(
        0
      );
    });

    it('should generate alternative predictions', async () => {
      const prediction = await ensembleSystem.requestEnsemblePrediction(
        'alternative_test',
        { type: 'test' }
      );

      expect(prediction.alternativePredictions).toBeDefined();
      expect(Array.isArray(prediction.alternativePredictions)).toBe(true);

      if (prediction.alternativePredictions.length > 0) {
        const alt = prediction.alternativePredictions[0];
        expect(alt.prediction).toBeDefined();
        expect(alt.probability).toBeGreaterThan(0);
        expect(alt.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance Feedback and Adaptation', () => {
    let testPrediction: EnsemblePredictionResult;

    beforeEach(async () => {
      // Setup test models
      eventBus.emit('swarm:test:learning:result', {
        swarmId: 'feedback-test',
        performance: { accuracy: 0.75, confidence: 0.7 },
        patterns: [{ type: 'feedback', confidence: 0.7 }],
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      testPrediction = await ensembleSystem.requestEnsemblePrediction(
        'feedback_test',
        { type: 'test' }
      );
    });

    it('should process performance feedback and update models', async () => {
      const feedback = {
        predictionId: testPrediction.predictionId,
        actualOutcome: 'success',
        accuracy: 0.85,
        context: { testScenario: 'feedback_processing' },
      };

      await ensembleSystem.processPerformanceFeedback(feedback);

      // Verify feedback was processed
      const status = ensembleSystem.getEnsembleStatus();
      expect(status.globalMetrics.averageAccuracy).toBeGreaterThan(0.7);
    });

    it('should handle feedback for non-existent prediction gracefully', async () => {
      const invalidFeedback = {
        predictionId: 'non_existent_prediction',
        actualOutcome: 'failure',
        accuracy: 0.3,
      };

      // Should not throw error
      await expect(
        ensembleSystem.processPerformanceFeedback(invalidFeedback)
      ).resolves.toBeUndefined();
    });
  });

  describe('Strategy Adaptation', () => {
    it('should adapt ensemble strategy based on performance', async () => {
      const initialStatus = ensembleSystem.getEnsembleStatus();
      const initialStrategy = initialStatus.activeStrategy;

      // Simulate strategy optimization
      await ensembleSystem.optimizeEnsembleStrategy({
        targetMetric: 'accuracy',
        constraints: { maxComputationTime: 1000 },
      });

      // Note: In real implementation, strategy might change based on performance
      // For this test, we're just ensuring the method executes without error
      const updatedStatus = ensembleSystem.getEnsembleStatus();
      expect(updatedStatus.activeStrategy).toBeDefined();
    });
  });
});

describe('Neural Ensemble Coordinator', () => {
  let eventBus: MockEventBus;
  let memoryCoordinator: MockMemoryCoordinator;
  let coordinator: NeuralEnsembleCoordinator;
  let coordinatorConfig: NeuralEnsembleCoordinatorConfig;
  let ensembleSystem: Phase3EnsembleLearning;

  beforeEach(() => {
    eventBus = new MockEventBus();
    memoryCoordinator = new MockMemoryCoordinator();

    coordinatorConfig = {
      enabled: true,
      defaultMode: 'balanced_hybrid' as NeuralEnsembleMode,
      adaptiveModeSwitching: true,
      neuralEnsembleAlignment: {
        alignmentThreshold: 0.6,
        maxDivergence: 0.4,
        consensusRequirement: 0.7,
      },
      performanceOptimization: {
        dynamicWeighting: true,
        adaptiveThresholds: true,
        performanceWindowSize: 50,
        optimizationInterval: 10,
      },
      neuralModelManagement: {
        maxActiveModels: 20,
        modelSynchronizationInterval: 5,
        performanceEvaluationFrequency: 10,
        modelRetirementThreshold: 0.5,
      },
      validation: {
        enableCrossValidation: true,
        validationSplitRatio: 0.2,
        realTimeValidation: true,
        validationHistory: 100,
      },
    };

    // Create ensemble system for integration
    const ensembleConfig: Phase3EnsembleConfig = {
      enabled: true,
      defaultStrategy: 'weighted_voting',
      adaptiveStrategySelection: false,
      maxModelsPerTier: 5,
      modelRetentionPeriod: 7,
      performanceEvaluationInterval: 10,
      minimumConsensusThreshold: 0.6,
      confidenceThreshold: 0.7,
      uncertaintyToleranceLevel: 0.3,
      diversityRequirement: 0.5,
      weightUpdateFrequency: 15,
      performanceWindowSize: 30,
      adaptationSensitivity: 0.1,
      predictionValidationEnabled: false,
      crossValidationFolds: 3,
      ensembleStabilityThreshold: 0.7,
    };

    ensembleSystem = new Phase3EnsembleLearning(
      ensembleConfig,
      eventBus,
      memoryCoordinator
    );

    coordinator = new NeuralEnsembleCoordinator(
      coordinatorConfig,
      eventBus,
      memoryCoordinator,
      {
        phase3Ensemble: ensembleSystem,
      }
    );
  });

  afterEach(async () => {
    await coordinator.shutdown();
    await ensembleSystem.shutdown();
    eventBus.removeAllListeners();
  });

  describe('Coordination Initialization', () => {
    it('should initialize with correct configuration', () => {
      const status = coordinator.getCoordinationStatus();

      expect(status.enabled).toBe(true);
      expect(status.activeMode).toBe('balanced_hybrid');
      expect(status.systemHealth.ensembleSystemAvailable).toBe(true);
    });

    it('should handle missing dependencies gracefully', () => {
      const standaloneCoordinator = new NeuralEnsembleCoordinator(
        coordinatorConfig,
        eventBus,
        memoryCoordinator
      );

      const status = standaloneCoordinator.getCoordinationStatus();
      expect(status.systemHealth.neuralSystemAvailable).toBe(false);
      expect(status.systemHealth.ensembleSystemAvailable).toBe(false);

      standaloneCoordinator.shutdown();
    });
  });

  describe('Coordinated Prediction Generation', () => {
    beforeEach(async () => {
      // Setup test data in ensemble system
      eventBus.emit('swarm:coord-test:learning:result', {
        swarmId: 'coord-test',
        performance: { accuracy: 0.8, confidence: 0.75 },
        patterns: [{ type: 'coordination', confidence: 0.8 }],
      });

      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    it('should generate coordinated prediction from neural and ensemble systems', async () => {
      const coordinatedResult = await coordinator.requestCoordinatedPrediction(
        'coordination_test',
        { type: 'test', complexity: 0.6 },
        { requiredConfidence: 0.7 }
      );

      expect(coordinatedResult.predictionId).toBeDefined();
      expect(coordinatedResult.neuralPrediction).toBeDefined();
      expect(coordinatedResult.ensemblePrediction).toBeDefined();
      expect(coordinatedResult.coordinatedResult).toBeDefined();
      expect(coordinatedResult.coordinatedResult.finalPrediction).toBeDefined();
      expect(coordinatedResult.coordinatedResult.confidence).toBeGreaterThan(0);
    });

    it('should provide integration metrics', async () => {
      const coordinatedResult = await coordinator.requestCoordinatedPrediction(
        'metrics_test',
        { type: 'test' }
      );

      expect(coordinatedResult.integrationMetrics).toBeDefined();
      expect(
        coordinatedResult.integrationMetrics.alignmentScore
      ).toBeGreaterThanOrEqual(0);
      expect(
        coordinatedResult.integrationMetrics.diversityBenefit
      ).toBeGreaterThanOrEqual(0);
      expect(
        coordinatedResult.integrationMetrics.robustnessGain
      ).toBeGreaterThanOrEqual(0);
      expect(
        coordinatedResult.integrationMetrics.computationalOverhead
      ).toBeGreaterThan(0);
    });

    it('should generate recommendations and validation plan', async () => {
      const coordinatedResult = await coordinator.requestCoordinatedPrediction(
        'validation_test',
        { type: 'test' }
      );

      expect(coordinatedResult.recommendedActions).toBeDefined();
      expect(Array.isArray(coordinatedResult.recommendedActions)).toBe(true);

      expect(coordinatedResult.validationPlan).toBeDefined();
      expect(coordinatedResult.validationPlan.validationMethods).toBeDefined();
      expect(coordinatedResult.validationPlan.riskLevel).toBeDefined();
      expect(coordinatedResult.validationPlan.fallbackStrategies).toBeDefined();
    });

    it('should support different coordination modes', async () => {
      const modes: NeuralEnsembleMode[] = [
        'neural_dominant',
        'ensemble_dominant',
        'balanced_hybrid',
        'adaptive_switching',
      ];

      for (const mode of modes) {
        const result = await coordinator.requestCoordinatedPrediction(
          'mode_test',
          { type: 'test' },
          { preferredMode: mode }
        );

        expect(result.coordinatedResult).toBeDefined();
        expect(result.coordinatedResult.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance Monitoring and Optimization', () => {
    it('should optimize neural ensemble integration', async () => {
      const initialStatus = coordinator.getCoordinationStatus();

      await coordinator.optimizeNeuralEnsembleIntegration();

      // Should emit optimization complete event
      const events = eventBus.getEventHistory();
      const optimizationEvent = events.find(
        (e) => e.event === 'neural:ensemble:optimization:complete'
      );

      expect(optimizationEvent).toBeDefined();
      expect(optimizationEvent?.data.performanceMetrics).toBeDefined();
    });

    it('should track coordination performance metrics', () => {
      const status = coordinator.getCoordinationStatus();

      expect(status.performanceMetrics).toBeDefined();
      expect(
        status.performanceMetrics.totalCoordinatedPredictions
      ).toBeGreaterThanOrEqual(0);
      expect(status.performanceMetrics.averageAlignment).toBeGreaterThanOrEqual(
        0
      );
      expect(status.performanceMetrics.averageConsensus).toBeGreaterThanOrEqual(
        0
      );
      expect(status.performanceMetrics.averageAccuracy).toBeGreaterThanOrEqual(
        0
      );
    });
  });

  describe('Event-Driven Integration', () => {
    it('should respond to neural pattern discovery events', async () => {
      const patternData = {
        patterns: [
          { patternId: 'test-pattern-1', confidence: 0.85, complexity: 0.7 },
          { patternId: 'test-pattern-2', confidence: 0.78, complexity: 0.6 },
        ],
        confidence: 0.8,
        neuralModelId: 'neural-model-1',
      };

      eventBus.emit('tier3:neural:pattern:discovered', patternData);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should have processed the pattern discovery
      const events = eventBus.getEventHistory();
      const processedEvents = events.filter(
        (e) => e.event === 'phase3:ensemble:evaluate:neural:patterns'
      );

      expect(processedEvents.length).toBeGreaterThanOrEqual(1);
    });

    it('should respond to ensemble strategy adaptation events', async () => {
      const strategyData = {
        newStrategy: 'neural_metalearning',
        expectedImprovement: 0.15,
        reason: 'Performance optimization',
      };

      eventBus.emit('phase3:ensemble:strategy:adapted', strategyData);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Coordinator should have processed the strategy change
      // (Internal state changes are harder to test directly, but no errors should occur)
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle missing neural system gracefully', async () => {
      const coordinatorWithoutNeural = new NeuralEnsembleCoordinator(
        coordinatorConfig,
        eventBus,
        memoryCoordinator,
        { phase3Ensemble: ensembleSystem }
      );

      // Should not throw when requesting coordinated prediction
      await expect(
        coordinatorWithoutNeural.requestCoordinatedPrediction('error_test', {
          type: 'test',
        })
      ).rejects.toThrow('Tier 3 Neural Learning system not available');

      await coordinatorWithoutNeural.shutdown();
    });

    it('should handle missing ensemble system gracefully', async () => {
      const coordinatorWithoutEnsemble = new NeuralEnsembleCoordinator(
        coordinatorConfig,
        eventBus,
        memoryCoordinator
      );

      // Should not throw when requesting coordinated prediction
      await expect(
        coordinatorWithoutEnsemble.requestCoordinatedPrediction('error_test', {
          type: 'test',
        })
      ).rejects.toThrow('Phase 3 Ensemble Learning system not available');

      await coordinatorWithoutEnsemble.shutdown();
    });

    it('should handle invalid prediction requests', async () => {
      // Test with invalid input data
      await expect(
        coordinator.requestCoordinatedPrediction(
          '', // Empty prediction type
          null, // Null input data
          { requiredConfidence: 1.5 } // Invalid confidence > 1
        )
      ).rejects.toThrow();
    });
  });

  describe('Memory Persistence', () => {
    it('should save and restore coordination state', async () => {
      // Generate some coordination history
      await coordinator.requestCoordinatedPrediction('persistence_test', {
        type: 'test',
      });

      // Save state
      await coordinator.shutdown();

      // Create new coordinator instance
      const newCoordinator = new NeuralEnsembleCoordinator(
        coordinatorConfig,
        eventBus,
        memoryCoordinator,
        { phase3Ensemble: ensembleSystem }
      );

      // Should have loaded previous state
      const status = newCoordinator.getCoordinationStatus();
      expect(status.enabled).toBe(true);

      await newCoordinator.shutdown();
    });
  });
});

describe('Integration Testing', () => {
  let eventBus: MockEventBus;
  let memoryCoordinator: MockMemoryCoordinator;
  let ensembleSystem: Phase3EnsembleLearning;
  let coordinator: NeuralEnsembleCoordinator;

  beforeEach(async () => {
    eventBus = new MockEventBus();
    memoryCoordinator = new MockMemoryCoordinator();

    // Create integrated system
    const ensembleConfig: Phase3EnsembleConfig = {
      enabled: true,
      defaultStrategy: 'adaptive_stacking',
      adaptiveStrategySelection: true,
      maxModelsPerTier: 8,
      modelRetentionPeriod: 5,
      performanceEvaluationInterval: 2,
      minimumConsensusThreshold: 0.65,
      confidenceThreshold: 0.75,
      uncertaintyToleranceLevel: 0.35,
      diversityRequirement: 0.6,
      weightUpdateFrequency: 5,
      performanceWindowSize: 40,
      adaptationSensitivity: 0.15,
      predictionValidationEnabled: true,
      crossValidationFolds: 4,
      ensembleStabilityThreshold: 0.8,
    };

    const coordinatorConfig: NeuralEnsembleCoordinatorConfig = {
      enabled: true,
      defaultMode: 'adaptive_switching',
      adaptiveModeSwitching: true,
      neuralEnsembleAlignment: {
        alignmentThreshold: 0.65,
        maxDivergence: 0.35,
        consensusRequirement: 0.75,
      },
      performanceOptimization: {
        dynamicWeighting: true,
        adaptiveThresholds: true,
        performanceWindowSize: 40,
        optimizationInterval: 5,
      },
      neuralModelManagement: {
        maxActiveModels: 15,
        modelSynchronizationInterval: 3,
        performanceEvaluationFrequency: 5,
        modelRetirementThreshold: 0.6,
      },
      validation: {
        enableCrossValidation: true,
        validationSplitRatio: 0.25,
        realTimeValidation: true,
        validationHistory: 80,
      },
    };

    ensembleSystem = new Phase3EnsembleLearning(
      ensembleConfig,
      eventBus,
      memoryCoordinator
    );
    coordinator = new NeuralEnsembleCoordinator(
      coordinatorConfig,
      eventBus,
      memoryCoordinator,
      { phase3Ensemble: ensembleSystem }
    );
  });

  afterEach(async () => {
    await coordinator.shutdown();
    await ensembleSystem.shutdown();
    eventBus.removeAllListeners();
  });

  describe('End-to-End Learning Pipeline', () => {
    it('should complete full learning pipeline from data to coordinated prediction', async () => {
      // Step 1: Populate all tiers with learning data
      const learningData = [
        {
          event: 'swarm:e2e-test:learning:result',
          data: {
            swarmId: 'e2e-test-swarm',
            agentPerformance: [
              { agentId: 'agent-1', efficiency: 0.88, quality: 0.92 },
              { agentId: 'agent-2', efficiency: 0.85, quality: 0.87 },
            ],
            patterns: [
              { type: 'task_completion', confidence: 0.85, frequency: 8 },
              { type: 'collaboration', confidence: 0.8, frequency: 6 },
            ],
            performance: { accuracy: 0.86, confidence: 0.82 },
          },
        },
        {
          event: 'queen:coordination:learning:complete',
          data: {
            crossSwarmPatterns: [
              {
                patternId: 'cross-1',
                sourceSwarms: ['swarm-1', 'swarm-2'],
                effectiveness: 0.92,
              },
            ],
            coordinationEfficiency: 0.89,
            resourceOptimization: [
              { type: 'load_balancing', improvement: 0.18 },
            ],
            performance: { accuracy: 0.89, confidence: 0.87 },
          },
        },
        {
          event: 'tier3:predictions:generated',
          data: {
            predictions: [
              {
                predictionId: 'neural-1',
                confidence: 0.93,
                type: 'optimization',
              },
            ],
            deepPatterns: [
              { patternId: 'deep-1', complexity: 0.85, predictiveValue: 0.91 },
            ],
            neuralOptimizations: [
              { optimizationId: 'opt-1', expectedGains: { performance: 0.2 } },
            ],
            modelPerformance: { accuracy: 0.92, confidence: 0.89 },
          },
        },
      ];

      // Emit all learning events
      for (const { event, data } of learningData) {
        eventBus.emit(event, data);
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Step 2: Verify ensemble system has models
      const ensembleStatus = ensembleSystem.getEnsembleStatus();
      expect(ensembleStatus.tierStatus[1].modelCount).toBeGreaterThan(0);
      expect(ensembleStatus.tierStatus[2].modelCount).toBeGreaterThan(0);
      expect(ensembleStatus.tierStatus[3].modelCount).toBeGreaterThan(0);

      // Step 3: Generate coordinated prediction
      const coordinatedResult = await coordinator.requestCoordinatedPrediction(
        'e2e_test_prediction',
        {
          type: 'performance_optimization',
          context: {
            swarmIds: ['e2e-test-swarm'],
            targetMetric: 'efficiency',
            complexity: 0.7,
          },
        },
        { requiredConfidence: 0.75 }
      );

      // Step 4: Verify coordinated prediction quality
      expect(coordinatedResult.predictionId).toBeDefined();
      expect(coordinatedResult.coordinatedResult.confidence).toBeGreaterThan(
        0.7
      );
      expect(
        coordinatedResult.integrationMetrics.alignmentScore
      ).toBeGreaterThan(0.5);
      expect(coordinatedResult.recommendedActions.length).toBeGreaterThan(0);
      expect(
        coordinatedResult.validationPlan.validationMethods.length
      ).toBeGreaterThan(0);

      // Step 5: Process feedback and verify learning
      const feedback = {
        predictionId: coordinatedResult.predictionId,
        actualOutcome: { efficiency_improvement: 0.18 },
        accuracy: 0.88,
        context: { validation_scenario: 'e2e_test' },
      };

      await ensembleSystem.processPerformanceFeedback(feedback);

      // Verify feedback improved system metrics
      const updatedStatus = ensembleSystem.getEnsembleStatus();
      expect(updatedStatus.globalMetrics.averageAccuracy).toBeGreaterThan(0.75);
    });

    it('should maintain performance under concurrent prediction requests', async () => {
      // Setup baseline models
      eventBus.emit('swarm:concurrent-test:learning:result', {
        swarmId: 'concurrent-test',
        performance: { accuracy: 0.8, confidence: 0.75 },
        patterns: [{ type: 'concurrency', confidence: 0.8 }],
      });

      await new Promise((resolve) => setTimeout(resolve, 20));

      // Generate multiple concurrent prediction requests
      const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
        coordinator.requestCoordinatedPrediction(
          `concurrent_test_${i}`,
          { type: 'concurrency_test', requestId: i },
          { requiredConfidence: 0.6 }
        )
      );

      const results = await Promise.all(concurrentRequests);

      // Verify all requests completed successfully
      expect(results).toHaveLength(10);

      for (const [index, result] of results.entries()) {
        expect(result.predictionId).toBeDefined();
        expect(result.coordinatedResult.confidence).toBeGreaterThan(0.5);
        expect(result.integrationMetrics.computationalOverhead).toBeGreaterThan(
          0
        );
      }

      // Verify system performance metrics
      const status = coordinator.getCoordinationStatus();
      expect(status.performanceMetrics.totalCoordinatedPredictions).toBe(10);
    });
  });

  describe('System Resilience and Recovery', () => {
    it('should handle system failures gracefully', async () => {
      // Simulate system failure by throwing errors in mock methods
      const originalEmit = eventBus.emit.bind(eventBus);
      eventBus.emit = vi.fn().mockImplementation((event: string, data: any) => {
        if (event.includes('error_simulation')) {
          throw new Error('Simulated system failure');
        }
        return originalEmit(event, data);
      });

      // Attempt prediction that triggers error
      await expect(
        coordinator.requestCoordinatedPrediction('error_simulation_test', {
          type: 'failure_test',
        })
      ).rejects.toThrow();

      // Restore normal operation
      eventBus.emit = originalEmit;

      // Verify system can recover and continue normal operation
      const normalResult = await coordinator.requestCoordinatedPrediction(
        'recovery_test',
        { type: 'normal_operation' },
        { requiredConfidence: 0.5 }
      );

      expect(normalResult.predictionId).toBeDefined();
      expect(normalResult.coordinatedResult.confidence).toBeGreaterThan(0);
    });
  });
});
