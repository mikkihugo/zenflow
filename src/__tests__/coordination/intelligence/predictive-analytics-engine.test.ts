/**
 * @fileoverview Tests for Predictive Analytics Engine - TIER 3 Intelligence System
 *
 * Comprehensive test suite for the Predictive Analytics Engine that validates all
 * predictive capabilities including task duration prediction, performance forecasting,
 * knowledge transfer success prediction, emergent behavior analysis, and adaptive
 * learning model updates.
 *
 * @author Claude Code Zen Team - Predictive Analytics Test Suite
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import {
  PredictiveAnalyticsEngine,
  createPredictiveAnalyticsEngine,
  DEFAULT_PREDICTIVE_ANALYTICS_CONFIG,
  isHighConfidencePrediction,
  formatPredictionDuration,
  type PredictiveAnalyticsConfig,
  type MultiHorizonTaskPrediction,
  type PerformanceOptimizationForecast,
  type KnowledgeTransferPrediction,
  type EmergentBehaviorPrediction,
  type AdaptiveLearningUpdate,
  type ForecastHorizon,
} from '../../../coordination/intelligence/predictive-analytics-engine.ts';

// Mock dependencies
const mockTaskPredictor = {
  predictTaskDuration: vi.fn().mockResolvedValue({
    duration: 3600000, // 1 hour
    confidence: 0.85,
    factors: [{ name: 'complexity', impact: 0.3, confidence: 0.8 }],
    metadata: { sampleSize: 100 },
  }),
};

const mockLearningSystem = {
  updateAgentPerformance: vi.fn(),
  getAgentLearningState: vi.fn().mockReturnValue({
    successRate: 0.85,
    averageDuration: 3000,
    learningRate: 0.1,
  }),
};

const mockHealthMonitor = {
  getAgentHealth: vi.fn().mockReturnValue({
    status: 'healthy',
    healthScore: 0.9,
    trend: 'stable',
  }),
  getHealthTrend: vi.fn().mockReturnValue({
    trend: 'stable',
    confidence: 0.8,
  }),
};

const mockNeuralLearning = {
  getDeepLearningStatus: vi.fn().mockReturnValue({
    enabled: true,
    modelsLoaded: 4,
    deepPatterns: 5,
    activePredictions: 10,
  }),
};

const mockMLRegistry = {
  neuralNetwork: {
    predict: vi.fn().mockResolvedValue([
      { id: 'pattern1', confidence: 0.8, type: 'optimization' }
    ]),
  },
  reinforcementLearning: {
    selectAction: vi.fn().mockReturnValue('optimize'),
    getStats: vi.fn().mockReturnValue({ episodeCount: 100, explorationRate: 0.1 }),
  },
  ensemble: {
    predict: vi.fn().mockResolvedValue({
      prediction: { value: 0.8 },
      confidence: 0.85,
    }),
  },
};

const mockDatabaseManager = {
  getSwarmPerformanceHistory: vi.fn().mockResolvedValue([]),
  storePerformanceForecast: vi.fn().mockResolvedValue(true),
};

describe('PredictiveAnalyticsEngine', () => {
  let analyticsEngine: PredictiveAnalyticsEngine;
  let config: PredictiveAnalyticsConfig;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create test configuration
    config = {
      ...DEFAULT_PREDICTIVE_ANALYTICS_CONFIG,
      updateInterval: 100, // Fast updates for testing
      caching: {
        enabled: true,
        ttl: 1000, // Short TTL for testing
        maxSize: 10,
      },
    };

    // Create analytics engine with mocked dependencies
    analyticsEngine = new PredictiveAnalyticsEngine(config, {
      taskPredictor: mockTaskPredictor as any,
      learningSystem: mockLearningSystem as any,
      healthMonitor: mockHealthMonitor as any,
      neuralLearning: mockNeuralLearning as any,
      mlRegistry: mockMLRegistry as any,
      databaseManager: mockDatabaseManager as any,
    });
  });

  afterEach(async () => {
    await analyticsEngine.shutdown();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const engine = createPredictiveAnalyticsEngine();
      expect(engine).toBeInstanceOf(PredictiveAnalyticsEngine);
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        enableTaskDurationPrediction: false,
        confidenceThreshold: 0.9,
      };
      
      const engine = createPredictiveAnalyticsEngine(customConfig);
      expect(engine).toBeInstanceOf(PredictiveAnalyticsEngine);
    });

    it('should emit initialized event', (done) => {
      const engine = createPredictiveAnalyticsEngine();
      
      engine.on('initialized', () => {
        engine.shutdown();
        done();
      });
    });
  });

  describe('Multi-Horizon Task Duration Prediction', () => {
    it('should predict task duration across multiple horizons', async () => {
      const prediction = await analyticsEngine.predictTaskDurationMultiHorizon(
        'agent-1',
        'feature-development',
        { complexity: 'high', priority: 'urgent' }
      );

      expect(prediction).toBeDefined();
      expect(prediction.agentId).toBe('agent-1');
      expect(prediction.taskType).toBe('feature-development');
      
      // Check that all configured horizons are present
      config.forecastHorizons.forEach(horizon => {
        expect(prediction.predictions[horizon]).toBeDefined();
        expect(prediction.predictions[horizon].duration).toBeGreaterThan(0);
        expect(prediction.predictions[horizon].confidence).toBeGreaterThan(0);
        expect(prediction.predictions[horizon].confidence).toBeLessThanOrEqual(1);
      });

      // Validate ensemble prediction
      expect(prediction.ensemblePrediction).toBeDefined();
      expect(prediction.ensemblePrediction.duration).toBeGreaterThan(0);
      expect(prediction.ensemblePrediction.confidence).toBeGreaterThan(0);

      // Validate recommendations are provided
      expect(prediction.recommendations).toBeDefined();
      expect(Array.isArray(prediction.recommendations)).toBe(true);
    });

    it('should use cached results when available', async () => {
      const agentId = 'agent-1';
      const taskType = 'test-task';
      const context = { test: true };

      // First call
      const prediction1 = await analyticsEngine.predictTaskDurationMultiHorizon(
        agentId,
        taskType,
        context
      );

      // Second call should use cache
      const prediction2 = await analyticsEngine.predictTaskDurationMultiHorizon(
        agentId,
        taskType,
        context
      );

      expect(prediction1.metadata.lastUpdate).toBe(prediction2.metadata.lastUpdate);
      expect(mockTaskPredictor.predictTaskDuration).toHaveBeenCalledTimes(1);
    });

    it('should provide confidence intervals for each horizon', async () => {
      const prediction = await analyticsEngine.predictTaskDurationMultiHorizon(
        'agent-1',
        'bug-fix'
      );

      Object.values(prediction.predictions).forEach(horizonPrediction => {
        expect(horizonPrediction.confidenceInterval).toBeDefined();
        expect(horizonPrediction.confidenceInterval.lower).toBeLessThan(
          horizonPrediction.confidenceInterval.upper
        );
        expect(horizonPrediction.confidenceInterval.lower).toBeGreaterThan(0);
      });
    });

    it('should throw error when task prediction is disabled', async () => {
      const disabledEngine = new PredictiveAnalyticsEngine({
        ...config,
        enableTaskDurationPrediction: false,
      });

      await expect(
        disabledEngine.predictTaskDurationMultiHorizon('agent-1', 'task')
      ).rejects.toThrow('Task duration prediction is disabled');

      await disabledEngine.shutdown();
    });
  });

  describe('Performance Optimization Forecasting', () => {
    it('should forecast performance optimization opportunities', async () => {
      const forecast = await analyticsEngine.forecastPerformanceOptimization(
        'swarm-1',
        'medium'
      );

      expect(forecast).toBeDefined();
      expect(forecast.swarmId).toBe('swarm-1');
      expect(forecast.timeHorizon).toBe('medium');

      // Validate performance snapshots
      expect(forecast.currentPerformance).toBeDefined();
      expect(forecast.forecastedPerformance).toBeDefined();
      expect(forecast.currentPerformance.timestamp).toBeLessThan(
        forecast.forecastedPerformance.timestamp
      );

      // Validate optimization opportunities
      expect(Array.isArray(forecast.optimizationOpportunities)).toBe(true);

      // Validate trend analysis
      expect(forecast.trendAnalysis).toBeDefined();
      expect(['improving', 'stable', 'declining']).toContain(
        forecast.trendAnalysis.direction
      );

      // Validate resource forecast
      expect(forecast.resourceForecast).toBeDefined();
      expect(forecast.resourceForecast.cpu).toBeDefined();
      expect(forecast.resourceForecast.memory).toBeDefined();
      expect(forecast.resourceForecast.network).toBeDefined();
    });

    it('should predict bottlenecks with preventive actions', async () => {
      const forecast = await analyticsEngine.forecastPerformanceOptimization(
        'swarm-1'
      );

      expect(forecast.bottleneckPrediction).toBeDefined();
      expect(Array.isArray(forecast.bottleneckPrediction.predictedBottlenecks)).toBe(true);
      expect(Array.isArray(forecast.bottleneckPrediction.preventiveActions)).toBe(true);

      if (forecast.bottleneckPrediction.predictedBottlenecks.length > 0) {
        const bottleneck = forecast.bottleneckPrediction.predictedBottlenecks[0];
        expect(bottleneck.component).toBeDefined();
        expect(bottleneck.severity).toBeGreaterThan(0);
        expect(bottleneck.severity).toBeLessThanOrEqual(1);
        expect(bottleneck.timeToOccurrence).toBeGreaterThan(0);
      }
    });

    it('should throw error when performance forecasting is disabled', async () => {
      const disabledEngine = new PredictiveAnalyticsEngine({
        ...config,
        enablePerformanceForecasting: false,
      });

      await expect(
        disabledEngine.forecastPerformanceOptimization('swarm-1')
      ).rejects.toThrow('Performance forecasting is disabled');

      await disabledEngine.shutdown();
    });
  });

  describe('Knowledge Transfer Success Prediction', () => {
    it('should predict knowledge transfer success', async () => {
      const patterns = [
        {
          id: 'pattern-1',
          type: 'optimization' as const,
          confidence: 0.8,
          frequency: 5,
          data: { test: true },
          context: {},
          metadata: {},
          timestamp: Date.now(),
        },
      ];

      const prediction = await analyticsEngine.predictKnowledgeTransferSuccess(
        'source-swarm',
        'target-swarm',
        patterns
      );

      expect(prediction).toBeDefined();
      expect(prediction.sourceSwarmId).toBe('source-swarm');
      expect(prediction.targetSwarmId).toBe('target-swarm');
      expect(prediction.patterns).toBe(patterns);

      // Validate transfer probability
      expect(prediction.transferProbability).toBeDefined();
      expect(prediction.transferProbability.overall).toBeGreaterThan(0);
      expect(prediction.transferProbability.overall).toBeLessThanOrEqual(1);

      // Validate compatibility score
      expect(prediction.compatibilityScore).toBeDefined();
      expect(prediction.compatibilityScore.overall).toBeGreaterThan(0);
      expect(prediction.compatibilityScore.overall).toBeLessThanOrEqual(1);

      // Validate risk assessment
      expect(prediction.riskAssessment).toBeDefined();
      expect(Array.isArray(prediction.riskAssessment.recommendations)).toBe(true);

      // Validate optimal timing
      expect(prediction.optimalTransferTiming).toBeDefined();
      expect(prediction.optimalTransferTiming.recommendedTime).toBeInstanceOf(Date);

      // Validate expected outcome
      expect(prediction.expectedOutcome).toBeDefined();
      expect(prediction.expectedOutcome.successProbability).toBeGreaterThan(0);
      expect(prediction.expectedOutcome.successProbability).toBeLessThanOrEqual(1);
    });

    it('should assess compatibility across multiple dimensions', async () => {
      const patterns = [{ 
        id: 'test-pattern',
        type: 'optimization' as const,
        confidence: 0.8,
        frequency: 1,
        data: {},
        context: {},
        metadata: {},
        timestamp: Date.now(),
      }];

      const prediction = await analyticsEngine.predictKnowledgeTransferSuccess(
        'swarm-a',
        'swarm-b',
        patterns
      );

      const compatibility = prediction.compatibilityScore;
      expect(compatibility.technical).toBeGreaterThan(0);
      expect(compatibility.contextual).toBeGreaterThan(0);
      expect(compatibility.cultural).toBeGreaterThan(0);
      expect(compatibility.overall).toBeGreaterThan(0);

      // Overall should be influenced by all dimensions
      expect(compatibility.overall).toBeLessThanOrEqual(
        Math.max(compatibility.technical, compatibility.contextual, compatibility.cultural)
      );
    });

    it('should throw error when knowledge transfer prediction is disabled', async () => {
      const disabledEngine = new PredictiveAnalyticsEngine({
        ...config,
        enableKnowledgeTransferPrediction: false,
      });

      await expect(
        disabledEngine.predictKnowledgeTransferSuccess('a', 'b', [])
      ).rejects.toThrow('Knowledge transfer prediction is disabled');

      await disabledEngine.shutdown();
    });
  });

  describe('Emergent Behavior Prediction', () => {
    it('should predict emergent behavior patterns', async () => {
      const prediction = await analyticsEngine.predictEmergentBehavior();

      expect(prediction).toBeDefined();
      expect(prediction.predictionId).toBeDefined();

      // Validate emergent patterns
      expect(Array.isArray(prediction.emergentPatterns)).toBe(true);

      // Validate system convergence prediction
      expect(prediction.systemConvergencePrediction).toBeDefined();
      expect(prediction.systemConvergencePrediction.convergenceTime).toBeGreaterThan(0);
      expect(prediction.systemConvergencePrediction.finalState).toBeDefined();

      // Validate learning velocity forecast
      expect(prediction.learningVelocityForecast).toBeDefined();
      expect(prediction.learningVelocityForecast.currentVelocity).toBeGreaterThan(0);
      expect(prediction.learningVelocityForecast.forecastedVelocity).toBeGreaterThan(0);

      // Validate pattern evolution prediction
      expect(prediction.patternEvolutionPrediction).toBeDefined();
      expect(Array.isArray(prediction.patternEvolutionPrediction.evolvingPatterns)).toBe(true);

      // Validate system-wide optimizations
      expect(Array.isArray(prediction.systemWideOptimizations)).toBe(true);

      // Validate confidence metrics
      expect(prediction.confidenceMetrics).toBeDefined();
      expect(prediction.confidenceMetrics.patternDetection).toBeGreaterThan(0);
      expect(prediction.confidenceMetrics.patternDetection).toBeLessThanOrEqual(1);
    });

    it('should include metadata with analysis depth', async () => {
      const prediction = await analyticsEngine.predictEmergentBehavior();

      expect(prediction.metadata).toBeDefined();
      expect(prediction.metadata.analysisDepth).toBeGreaterThan(0);
      expect(prediction.metadata.dataPoints).toBeGreaterThan(0);
      expect(prediction.metadata.modelComplexity).toBeGreaterThan(0);
      expect(prediction.metadata.lastUpdate).toBeGreaterThan(0);
    });

    it('should throw error when emergent behavior prediction is disabled', async () => {
      const disabledEngine = new PredictiveAnalyticsEngine({
        ...config,
        enableEmergentBehaviorPrediction: false,
      });

      await expect(
        disabledEngine.predictEmergentBehavior()
      ).rejects.toThrow('Emergent behavior prediction is disabled');

      await disabledEngine.shutdown();
    });
  });

  describe('Adaptive Learning Model Updates', () => {
    it('should update adaptive learning models', async () => {
      const update = await analyticsEngine.updateAdaptiveLearningModels();

      expect(update).toBeDefined();
      expect(update.updateId).toBeDefined();

      // Validate models updated
      expect(Array.isArray(update.modelsUpdated)).toBe(true);

      // Validate performance improvements
      expect(update.performanceImprovements).toBeDefined();
      expect(typeof update.performanceImprovements).toBe('object');

      // Validate real-time adaptations
      expect(Array.isArray(update.realTimeAdaptations)).toBe(true);

      // Validate confidence intervals
      expect(update.confidenceIntervals).toBeDefined();
      expect(typeof update.confidenceIntervals).toBe('object');

      // Validate predictive accuracy
      expect(update.predictiveAccuracy).toBeDefined();
      expect(update.predictiveAccuracy.overall).toBeGreaterThan(0);
      expect(update.predictiveAccuracy.overall).toBeLessThanOrEqual(1);

      // Validate model recommendations
      expect(Array.isArray(update.modelRecommendations)).toBe(true);

      // Validate uncertainty quantification
      expect(update.uncertaintyQuantification).toBeDefined();
      expect(update.uncertaintyQuantification.total).toBeGreaterThan(0);

      // Validate next update schedule
      expect(update.nextUpdateSchedule).toBeDefined();
      expect(update.nextUpdateSchedule.scheduled).toBeInstanceOf(Date);
    });

    it('should emit adaptive learning updated event', (done) => {
      analyticsEngine.on('adaptiveLearningUpdated', (data) => {
        expect(data.updateId).toBeDefined();
        expect(data.modelsUpdated).toBeGreaterThan(0);
        expect(data.timestamp).toBeGreaterThan(0);
        done();
      });

      analyticsEngine.updateAdaptiveLearningModels();
    });

    it('should throw error when adaptive learning is disabled', async () => {
      const disabledEngine = new PredictiveAnalyticsEngine({
        ...config,
        enableAdaptiveLearning: false,
      });

      await expect(
        disabledEngine.updateAdaptiveLearningModels()
      ).rejects.toThrow('Adaptive learning is disabled');

      await disabledEngine.shutdown();
    });
  });

  describe('Caching and Performance', () => {
    it('should respect cache TTL settings', async () => {
      const shortTTLConfig = {
        ...config,
        caching: {
          enabled: true,
          ttl: 10, // Very short TTL
          maxSize: 100,
        },
      };

      const engine = new PredictiveAnalyticsEngine(shortTTLConfig, {
        taskPredictor: mockTaskPredictor as any,
      });

      // First call
      await engine.predictTaskDurationMultiHorizon('agent-1', 'task-1');
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 15));
      
      // Second call should not use cache
      await engine.predictTaskDurationMultiHorizon('agent-1', 'task-1');
      
      expect(mockTaskPredictor.predictTaskDuration).toHaveBeenCalledTimes(2);

      await engine.shutdown();
    });

    it('should handle cache size limits', async () => {
      const smallCacheConfig = {
        ...config,
        caching: {
          enabled: true,
          ttl: 60000,
          maxSize: 2, // Very small cache
        },
      };

      const engine = new PredictiveAnalyticsEngine(smallCacheConfig, {
        taskPredictor: mockTaskPredictor as any,
      });

      // Fill cache beyond limit
      await engine.predictTaskDurationMultiHorizon('agent-1', 'task-1');
      await engine.predictTaskDurationMultiHorizon('agent-2', 'task-2');
      await engine.predictTaskDurationMultiHorizon('agent-3', 'task-3'); // Should evict first entry

      // First call should be evicted, requiring new prediction
      mockTaskPredictor.predictTaskDuration.mockClear();
      await engine.predictTaskDurationMultiHorizon('agent-1', 'task-1');
      
      expect(mockTaskPredictor.predictTaskDuration).toHaveBeenCalled();

      await engine.shutdown();
    });
  });

  describe('Utility Functions', () => {
    describe('isHighConfidencePrediction', () => {
      it('should identify high confidence predictions', () => {
        expect(isHighConfidencePrediction({ confidence: 0.9 })).toBe(true);
        expect(isHighConfidencePrediction({ confidence: 0.7 })).toBe(false);
        expect(isHighConfidencePrediction({ confidence: 0.8 }, 0.8)).toBe(true);
        expect(isHighConfidencePrediction({ confidence: 0.79 }, 0.8)).toBe(false);
      });
    });

    describe('formatPredictionDuration', () => {
      it('should format durations correctly', () => {
        expect(formatPredictionDuration(1000)).toBe('1s');
        expect(formatPredictionDuration(60000)).toBe('1m 0s');
        expect(formatPredictionDuration(3661000)).toBe('1h 1m');
        expect(formatPredictionDuration(90000)).toBe('1m 30s');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing dependencies gracefully', async () => {
      const engineWithoutDependencies = new PredictiveAnalyticsEngine(config);

      // Should not throw, but should handle missing dependencies
      await expect(
        engineWithoutDependencies.predictTaskDurationMultiHorizon('agent-1', 'task')
      ).resolves.toBeDefined();

      await engineWithoutDependencies.shutdown();
    });

    it('should handle prediction errors gracefully', async () => {
      const failingTaskPredictor = {
        predictTaskDuration: vi.fn().mockRejectedValue(new Error('Prediction failed')),
      };

      const engine = new PredictiveAnalyticsEngine(config, {
        taskPredictor: failingTaskPredictor as any,
      });

      await expect(
        engine.predictTaskDurationMultiHorizon('agent-1', 'task')
      ).rejects.toThrow('Prediction failed');

      await engine.shutdown();
    });
  });

  describe('Event Emission', () => {
    it('should emit events for major operations', (done) => {
      let eventsReceived = 0;
      const expectedEvents = 1;

      const engine = createPredictiveAnalyticsEngine();

      engine.on('initialized', () => {
        eventsReceived++;
        if (eventsReceived === expectedEvents) {
          engine.shutdown().then(() => done());
        }
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should handle invalid forecast horizons gracefully', () => {
      const invalidConfig = {
        ...config,
        forecastHorizons: ['invalid' as any],
      };

      // Should not throw during construction
      const engine = new PredictiveAnalyticsEngine(invalidConfig);
      expect(engine).toBeInstanceOf(PredictiveAnalyticsEngine);
      engine.shutdown();
    });

    it('should handle zero confidence threshold', () => {
      const zeroThresholdConfig = {
        ...config,
        confidenceThreshold: 0,
      };

      const engine = new PredictiveAnalyticsEngine(zeroThresholdConfig);
      expect(engine).toBeInstanceOf(PredictiveAnalyticsEngine);
      engine.shutdown();
    });
  });

  describe('Integration with Neural Learning', () => {
    it('should leverage neural learning patterns', async () => {
      const prediction = await analyticsEngine.predictEmergentBehavior();

      // Should call neural learning system to get patterns
      expect(mockNeuralLearning.getDeepLearningStatus).toHaveBeenCalled();
      expect(prediction.emergentPatterns.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-Algorithm Ensemble', () => {
    it('should use ensemble weights for predictions', async () => {
      const prediction = await analyticsEngine.predictTaskDurationMultiHorizon(
        'agent-1',
        'complex-task'
      );

      // Ensemble prediction should be influenced by multiple algorithms
      expect(prediction.ensemblePrediction.consensus).toBeGreaterThan(0);
      expect(prediction.ensemblePrediction.uncertainty).toBeGreaterThanOrEqual(0);
    });

    it('should handle algorithm failures gracefully in ensemble', async () => {
      // Mock one algorithm to fail
      mockMLRegistry.neuralNetwork.predict.mockRejectedValueOnce(new Error('Algorithm failed'));

      const prediction = await analyticsEngine.predictTaskDurationMultiHorizon(
        'agent-1',
        'task'
      );

      // Should still provide prediction using other algorithms
      expect(prediction).toBeDefined();
      expect(prediction.ensemblePrediction.duration).toBeGreaterThan(0);
    });
  });
});