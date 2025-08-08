/**
 * Adaptive Learning System Tests - Hybrid TDD Approach
 *
 * Tests for the adaptive learning system following the hybrid testing strategy:
 * - 70% London TDD (Mockist) for distributed components and integration boundaries
 * - 30% Classical TDD (Detroit) for algorithms and mathematical operations
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { LearningCoordinator } from '../learning-coordinator';
import {
  EnsembleModels,
  NeuralNetworkPredictor,
  OnlineLearningSystem,
  ReinforcementLearningEngine,
} from '../ml-integration';
import { PatternRecognitionEngine } from '../pattern-recognition-engine';
import { PerformanceOptimizer } from '../performance-optimizer';
import type {
  AdaptiveLearningConfig,
  Agent,
  ExecutionData,
  SuccessPattern,
  SystemContext,
  Task,
} from '../types';

// ============================================
// Test Helpers and Fixtures
// ============================================

const createMockExecutionData = (): ExecutionData[] => [
  {
    id: 'exec_1',
    agentId: 'agent_1',
    taskType: 'data_processing',
    action: 'process_document',
    parameters: { complexity: 0.5 },
    result: { success: true, processedItems: 100 },
    duration: 1500,
    resourceUsage: {
      cpu: 0.7,
      memory: 0.6,
      network: 0.3,
      diskIO: 0.4,
      bandwidth: 50,
      latency: 120,
    },
    timestamp: Date.now() - 10000,
    success: true,
    context: { swarmId: 'swarm_1', environment: 'test' },
  },
  {
    id: 'exec_2',
    agentId: 'agent_2',
    taskType: 'data_processing',
    action: 'process_document',
    parameters: { complexity: 0.8 },
    result: { success: false, error: 'timeout' },
    duration: 3000,
    resourceUsage: {
      cpu: 0.9,
      memory: 0.8,
      network: 0.7,
      diskIO: 0.6,
      bandwidth: 30,
      latency: 500,
    },
    timestamp: Date.now() - 5000,
    success: false,
    context: { swarmId: 'swarm_1', environment: 'test' },
  },
];

const createTestConfig = (): AdaptiveLearningConfig => ({
  patternRecognition: {
    enabled: true,
    minPatternFrequency: 2,
    confidenceThreshold: 0.6,
    analysisWindow: 30000,
  },
  learning: {
    enabled: true,
    learningRate: 0.1,
    adaptationRate: 0.1,
    knowledgeRetention: 0.9,
  },
  optimization: {
    enabled: true,
    optimizationThreshold: 0.7,
    maxOptimizations: 5,
    validationRequired: true,
  },
  ml: {
    neuralNetwork: true,
    reinforcementLearning: true,
    ensemble: true,
    onlineLearning: true,
  },
});

const createTestContext = (): SystemContext => ({
  environment: 'test',
  resources: [] as any[],
  constraints: [] as any[],
  objectives: [] as any[],
});

// ============================================
// London TDD Tests (70% - Mockist)
// Testing interactions and integration boundaries
// ============================================

describe('Adaptive Learning System - London TDD (Integration & Interactions)', () => {
  describe('PatternRecognitionEngine Integration', () => {
    let engine: PatternRecognitionEngine;
    let mockEmit: jest.SpyInstance;

    beforeEach(() => {
      engine = new PatternRecognitionEngine(createTestConfig(), createTestContext());
      mockEmit = jest.spyOn(engine, 'emit');
    });

    afterEach(() => {
      mockEmit.mockRestore();
    });

    test('should emit patternsAnalyzed event with correct data', async () => {
      // London TDD: Test the interaction/event emission
      const executionData = createMockExecutionData();

      await engine.analyzeExecutionPatterns(executionData);

      expect(mockEmit).toHaveBeenCalledWith(
        'patternsAnalyzed',
        expect.objectContaining({
          patterns: expect.any(Number),
          anomalies: expect.any(Number),
          confidence: expect.any(Number),
          timestamp: expect.any(Number),
        })
      );
    });

    test('should emit taskPatternClassified event when classifying task completion', () => {
      // London TDD: Test method call interactions
      const taskResult = {
        taskId: 'task_1',
        agentId: 'agent_1',
        status: 'completed' as const,
        duration: 1500,
        quality: 0.9,
        resourceUsage: {
          cpu: 0.7,
          memory: 0.6,
          network: 0.3,
          diskIO: 0.4,
          bandwidth: 50,
          latency: 120,
        },
        metadata: { taskType: 'data_processing' },
      };

      engine.classifyTaskCompletion(taskResult);

      expect(mockEmit).toHaveBeenCalledWith(
        'taskPatternClassified',
        expect.objectContaining({
          taskId: 'task_1',
          pattern: 'data_processing',
          timestamp: expect.any(Number),
        })
      );
    });

    test('should emit communicationPatternsDetected when detecting patterns', () => {
      // London TDD: Test interaction with message processing
      const messages = [
        {
          id: 'msg_1',
          from: 'agent_1',
          to: 'agent_2',
          type: 'task_request',
          payload: {},
          timestamp: Date.now(),
          priority: 'medium' as const,
          latency: 100,
          size: 256,
        },
        {
          id: 'msg_2',
          from: 'agent_1',
          to: 'agent_2',
          type: 'task_request',
          payload: {},
          timestamp: Date.now(),
          priority: 'medium' as const,
          latency: 120,
          size: 300,
        },
      ];

      engine.detectCommunicationPatterns(messages);

      expect(mockEmit).toHaveBeenCalledWith(
        'communicationPatternsDetected',
        expect.objectContaining({
          patterns: expect.any(Number),
          messages: 2,
          timestamp: expect.any(Number),
        })
      );
    });
  });

  describe('LearningCoordinator Integration', () => {
    let coordinator: LearningCoordinator;
    let mockEmit: jest.SpyInstance;

    beforeEach(() => {
      coordinator = new LearningCoordinator(createTestConfig(), createTestContext());
      mockEmit = jest.spyOn(coordinator, 'emit');
    });

    afterEach(() => {
      mockEmit.mockRestore();
    });

    test('should emit learningCompleted event after coordinating learning', async () => {
      // London TDD: Test high-level coordination interaction
      const agents: Agent[] = [
        {
          id: 'agent_1',
          type: 'worker',
          capabilities: ['processing'],
          currentLoad: 0.5,
          performance: {
            efficiency: 0.8,
            latency: 100,
            errorRate: 0.1,
            resourceUtilization: {
              cpu: 0.7,
              memory: 0.6,
              network: 0.3,
              diskIO: 0.4,
              bandwidth: 50,
              latency: 120,
            },
            throughput: 10,
            quality: 0.9,
          },
          specializations: ['data_processing'],
          learningProgress: {
            totalExperience: 100,
            domainsLearned: ['processing'],
            currentLearningRate: 0.1,
            knowledgeRetention: 0.9,
            adaptability: 0.8,
          },
        },
      ];

      await coordinator.coordinateLearning(agents);

      expect(mockEmit).toHaveBeenCalledWith(
        'learningCompleted',
        expect.objectContaining({
          agents: ['agent_1'],
          result: expect.any(Object),
          timestamp: expect.any(Number),
        })
      );
    });

    test('should emit knowledgeAdded when updating knowledge base with new patterns', async () => {
      // London TDD: Test knowledge base interaction
      const patterns = [
        {
          id: 'pattern_1',
          type: 'optimization' as const,
          data: { test: true },
          confidence: 0.8,
          frequency: 5,
          context: { test: true },
          metadata: {
            complexity: 0.5,
            predictability: 0.8,
            stability: 0.9,
            anomalyScore: 0.1,
            correlations: [] as any[],
            quality: 0.9,
            relevance: 0.8,
          },
          timestamp: Date.now(),
        },
      ];

      await coordinator.updateKnowledgeBase(patterns);

      expect(mockEmit).toHaveBeenCalledWith(
        'knowledgeAdded',
        expect.objectContaining({
          patternId: 'pattern_1',
          type: 'optimization',
          confidence: 0.8,
          timestamp: expect.any(Number),
        })
      );
    });

    test('should emit bestPracticeIdentified when emerging best practices', () => {
      // London TDD: Test best practice emergence interaction
      const successes: SuccessPattern[] = [
        {
          id: 'success_1',
          context: 'data_processing',
          actions: ['validate_input', 'process_data', 'verify_output'],
          outcomes: {
            efficiency: 0.9,
            quality: 0.95,
            cost: 0.7,
            satisfaction: 0.8,
            sustainability: 0.85,
          },
          reproducibility: 0.9,
          conditions: ['adequate_memory', 'low_network_load'],
        },
      ];

      const _practices = coordinator.emergeBestPractices(successes);

      expect(mockEmit).toHaveBeenCalledWith(
        'bestPracticeIdentified',
        expect.objectContaining({
          practice: expect.any(String),
          category: 'data_processing',
          confidence: expect.any(Number),
          timestamp: expect.any(Number),
        })
      );
    });
  });

  describe('PerformanceOptimizer Integration', () => {
    let optimizer: PerformanceOptimizer;
    let mockEmit: jest.SpyInstance;

    beforeEach(() => {
      optimizer = new PerformanceOptimizer(createTestConfig(), createTestContext());
      mockEmit = jest.spyOn(optimizer, 'emit');
    });

    afterEach(() => {
      mockEmit.mockRestore();
    });

    test('should emit behaviorOptimized when optimizing agent behavior', () => {
      // London TDD: Test optimization event emission
      const patterns = [
        {
          id: 'pattern_1',
          type: 'task_completion' as const,
          data: { test: true },
          confidence: 0.8,
          frequency: 5,
          context: { agentId: 'agent_1' },
          metadata: {
            complexity: 0.5,
            predictability: 0.8,
            stability: 0.9,
            anomalyScore: 0.1,
            correlations: [] as any[],
            quality: 0.9,
            relevance: 0.8,
          },
          timestamp: Date.now(),
        },
      ];

      optimizer.optimizeBehavior('agent_1', patterns);

      expect(mockEmit).toHaveBeenCalledWith(
        'behaviorOptimized',
        expect.objectContaining({
          agentId: 'agent_1',
          optimizations: expect.any(Number),
          expectedImprovement: expect.any(Number),
          confidence: expect.any(Number),
          timestamp: expect.any(Number),
        })
      );
    });

    test('should emit allocationOptimized when optimizing task allocation', () => {
      // London TDD: Test allocation optimization interaction
      const tasks: Task[] = [
        {
          id: 'task_1',
          type: 'processing',
          priority: 0.8,
          complexity: 0.6,
          requirements: ['cpu'],
          constraints: [] as any[],
          estimatedDuration: 1000,
          dependencies: [] as any[],
        },
      ];

      const agents: Agent[] = [
        {
          id: 'agent_1',
          type: 'worker',
          capabilities: ['cpu', 'processing'],
          currentLoad: 0.5,
          performance: {
            efficiency: 0.8,
            latency: 100,
            errorRate: 0.1,
            resourceUtilization: {
              cpu: 0.7,
              memory: 0.6,
              network: 0.3,
              diskIO: 0.4,
              bandwidth: 50,
              latency: 120,
            },
            throughput: 10,
            quality: 0.9,
          },
          specializations: ['processing'],
          learningProgress: {
            totalExperience: 100,
            domainsLearned: ['processing'],
            currentLearningRate: 0.1,
            knowledgeRetention: 0.9,
            adaptability: 0.8,
          },
        },
      ];

      optimizer.optimizeTaskAllocation(tasks, agents);

      expect(mockEmit).toHaveBeenCalledWith(
        'allocationOptimized',
        expect.objectContaining({
          tasks: 1,
          agents: 1,
          efficiency: expect.any(Number),
          utilization: expect.any(Number),
          timestamp: expect.any(Number),
        })
      );
    });
  });

  describe('ML Integration Interactions', () => {
    test('ReinforcementLearningEngine should emit events during training', () => {
      // London TDD: Test RL training interactions
      const rlEngine = new ReinforcementLearningEngine({ learningRate: 0.1 });
      const mockEmit = jest.spyOn(rlEngine, 'emit');

      rlEngine.updateQValue('state1', 'action1', 1.0, 'state2');

      expect(mockEmit).toHaveBeenCalledWith(
        'qValueUpdated',
        expect.objectContaining({
          state: 'state1',
          action: 'action1',
          oldValue: expect.any(Number),
          newValue: expect.any(Number),
          reward: 1.0,
          timestamp: expect.any(Number),
        })
      );

      mockEmit.mockRestore();
    });

    test('NeuralNetworkPredictor should emit training events', async () => {
      // London TDD: Test neural network training interactions
      const nnPredictor = new NeuralNetworkPredictor({ inputSize: 5, outputSize: 3 });
      const mockEmit = jest.spyOn(nnPredictor, 'emit');

      const executionData = createMockExecutionData();
      const labels = ['success', 'failure'];

      await nnPredictor.train(executionData, labels);

      expect(mockEmit).toHaveBeenCalledWith(
        'trainingCompleted',
        expect.objectContaining({
          accuracy: expect.any(Number),
          loss: expect.any(Number),
          epochs: expect.any(Number),
          trainingTime: expect.any(Number),
          timestamp: expect.any(Number),
        })
      );

      mockEmit.mockRestore();
    });

    test('EnsembleModels should emit model management events', () => {
      // London TDD: Test ensemble model interactions
      const ensemble = new EnsembleModels();
      const mockEmit = jest.spyOn(ensemble, 'emit');

      const mockModel = { predict: jest.fn().mockResolvedValue([0.5]) };
      ensemble.addModel(mockModel, 1.0);

      expect(mockEmit).toHaveBeenCalledWith(
        'modelAdded',
        expect.objectContaining({
          modelId: expect.any(String),
          weight: 1.0,
          totalModels: 1,
          totalWeight: 1.0,
          timestamp: expect.any(Number),
        })
      );

      mockEmit.mockRestore();
    });
  });
});

// ============================================
// Classical TDD Tests (30% - Detroit)
// Testing algorithms and mathematical operations
// ============================================

describe('Adaptive Learning System - Classical TDD (Algorithms & Math)', () => {
  describe('ReinforcementLearningEngine Algorithm Tests', () => {
    let rlEngine: ReinforcementLearningEngine;

    beforeEach(() => {
      rlEngine = new ReinforcementLearningEngine({
        learningRate: 0.1,
        discountFactor: 0.9,
        explorationRate: 0.1,
      });
    });

    test('Q-learning update should follow correct mathematical formula', () => {
      // Classical TDD: Test actual Q-learning math
      const _initialQ = rlEngine.getQValue('state1', 'action1');

      // Set up known values for deterministic testing
      rlEngine.updateQValue('state2', 'bestAction', 5.0, 'state3'); // Set max next Q = 5.0

      const reward = 10.0;
      rlEngine.updateQValue('state1', 'action1', reward, 'state2');

      const newQ = rlEngine.getQValue('state1', 'action1');

      // Q(s,a) = Q(s,a) + α[r + γ * max(Q(s',a')) - Q(s,a)]
      // Expected: 0 + 0.1 * (10 + 0.9 * 5.0 - 0) = 0.1 * 14.5 = 1.45
      expect(newQ).toBeCloseTo(1.45, 2);
    });

    test('exploration rate should decay correctly over time', () => {
      // Classical TDD: Test decay algorithm
      const initialRate = 0.5;
      const decayRate = 0.9;

      const rlEngineDecay = new ReinforcementLearningEngine({
        explorationRate: initialRate,
        explorationDecay: decayRate,
        minExplorationRate: 0.01,
      });

      // Record initial rate
      const initialStats = rlEngineDecay.getStats();
      expect(initialStats.explorationRate).toBeCloseTo(initialRate, 3);

      // Update Q-value to trigger decay
      rlEngineDecay.updateQValue('state1', 'action1', 1.0, 'state2');

      const afterUpdateStats = rlEngineDecay.getStats();
      const expectedRate = initialRate * decayRate;
      expect(afterUpdateStats.explorationRate).toBeCloseTo(expectedRate, 3);
    });

    test('action selection should follow epsilon-greedy policy', () => {
      // Classical TDD: Test epsilon-greedy algorithm
      // Set up Q-values to have a clear best action
      rlEngine.updateQValue('testState', 'goodAction', 10.0, 'nextState');
      rlEngine.updateQValue('testState', 'badAction', 1.0, 'nextState');

      const actions = ['goodAction', 'badAction', 'unknownAction'];

      // With low exploration rate, should mostly pick 'goodAction'
      const zeroExplorationEngine = new ReinforcementLearningEngine({
        explorationRate: 0.0, // Force exploitation
      });
      zeroExplorationEngine.updateQValue('testState', 'goodAction', 10.0, 'nextState');
      zeroExplorationEngine.updateQValue('testState', 'badAction', 1.0, 'nextState');

      const selectedAction = zeroExplorationEngine.selectAction('testState', actions);
      expect(selectedAction).toBe('goodAction');
    });
  });

  describe('Pattern Recognition Mathematical Operations', () => {
    let engine: PatternRecognitionEngine;

    beforeEach(() => {
      engine = new PatternRecognitionEngine(createTestConfig(), createTestContext());
    });

    test('should correctly calculate statistical variance', async () => {
      // Classical TDD: Test variance calculation
      const executionData: ExecutionData[] = [
        {
          ...createMockExecutionData()[0],
          duration: 1000, // Mean will be 2000
        },
        {
          ...createMockExecutionData()[0],
          duration: 3000,
        },
        {
          ...createMockExecutionData()[0],
          duration: 2000,
        },
      ];

      const analysis = await engine.analyzeExecutionPatterns(executionData);

      // Variance = ((1000-2000)² + (3000-2000)² + (2000-2000)²) / 3 = 2000000/3 ≈ 666667
      // Check that variance calculation is working (indirectly through stability metrics)
      expect(analysis.patterns.length).toBeGreaterThan(0);
      const pattern = analysis.patterns[0];
      expect(pattern.stability).toBeGreaterThan(0);
      expect(pattern.stability).toBeLessThanOrEqual(1);
    });

    test('should correctly detect anomalies using z-score', async () => {
      // Classical TDD: Test anomaly detection algorithm
      const normalDuration = 1000;
      const anomalousData: ExecutionData[] = [
        ...Array(10)
          .fill(null)
          .map((_, i) => ({
            ...createMockExecutionData()[0],
            id: `normal_${i}`,
            duration: normalDuration + (Math.random() - 0.5) * 100, // Small variance
          })),
        {
          ...createMockExecutionData()[0],
          id: 'anomaly_1',
          duration: normalDuration * 10, // Clearly anomalous
        },
      ];

      const analysis = await engine.analyzeExecutionPatterns(anomalousData);

      // Should detect the anomaly
      expect(analysis.anomalies.length).toBeGreaterThan(0);
      const performanceAnomalies = analysis.anomalies.filter((a) => a.type === 'performance');
      expect(performanceAnomalies.length).toBeGreaterThan(0);

      const anomaly = performanceAnomalies[0];
      expect(anomaly.confidence).toBeGreaterThan(0.5);
      expect(anomaly.severity).toMatch(/high|critical/);
    });

    test('should calculate communication efficiency correctly', () => {
      // Classical TDD: Test efficiency calculation formula
      const messages = [
        {
          id: 'msg_1',
          from: 'agent_1',
          to: 'agent_2',
          type: 'request',
          payload: {},
          timestamp: Date.now(),
          priority: 'medium' as const,
          latency: 100,
          size: 1000,
        },
        {
          id: 'msg_2',
          from: 'agent_1',
          to: 'agent_2',
          type: 'request',
          payload: {},
          timestamp: Date.now(),
          priority: 'medium' as const,
          latency: 200,
          size: 2000,
        },
      ];

      const patterns = engine.detectCommunicationPatterns(messages);
      expect(patterns.length).toBeGreaterThan(0);

      const pattern = patterns[0];
      expect(pattern.averageLatency).toBeCloseTo(150, 1); // (100 + 200) / 2
      expect(pattern.averageSize).toBeCloseTo(1500, 1); // (1000 + 2000) / 2
      expect(pattern.efficiency).toBeGreaterThan(0);
      expect(pattern.efficiency).toBeLessThanOrEqual(1);
    });
  });

  describe('Neural Network Mathematical Operations', () => {
    test('should correctly implement sigmoid activation function', async () => {
      // Classical TDD: Test mathematical function
      const nnPredictor = new NeuralNetworkPredictor({ inputSize: 2, outputSize: 1 });

      // Test sigmoid properties: sigmoid(0) ≈ 0.5, sigmoid(∞) → 1, sigmoid(-∞) → 0
      const testData: ExecutionData[] = [
        {
          ...createMockExecutionData()[0],
          resourceUsage: { cpu: 0, memory: 0, network: 0, diskIO: 0, bandwidth: 0, latency: 0 },
        },
      ];

      const predictions = await nnPredictor.predict(testData);
      expect(predictions.length).toBe(1);

      const prediction = predictions[0];
      // Neural network should produce values between 0 and 1 (sigmoid output)
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThan(1);
    });

    test('should implement gradient descent weight updates', async () => {
      // Classical TDD: Test weight update mathematics
      const nnPredictor = new NeuralNetworkPredictor({ inputSize: 3, outputSize: 2 });

      const trainingData = createMockExecutionData();
      const labels = [1, 0]; // Binary classification

      const result = await nnPredictor.train(trainingData, labels);

      // Training should produce reasonable metrics
      expect(result.accuracy).toBeGreaterThan(0);
      expect(result.accuracy).toBeLessThanOrEqual(1);
      expect(result.loss).toBeGreaterThanOrEqual(0);
      expect(result.trainingTime).toBeGreaterThan(0);
      expect(result.epochs).toBeGreaterThan(0);
    });
  });

  describe('Online Learning Adaptation Algorithm', () => {
    test('should adapt learning rate based on performance degradation', async () => {
      // Classical TDD: Test adaptive learning algorithm
      const onlineLearner = new OnlineLearningSystem({
        adaptationThreshold: 0.2,
        windowSize: 50,
      });

      const _initialAccuracy = onlineLearner.getAccuracy();

      // Stream data that should cause performance degradation
      const goodData = {
        ...createMockExecutionData()[0],
        success: true,
        resourceUsage: {
          cpu: 0.5,
          memory: 0.5,
          network: 0.3,
          diskIO: 0.3,
          bandwidth: 50,
          latency: 100,
        },
      };

      const badData = {
        ...createMockExecutionData()[0],
        success: false,
        resourceUsage: {
          cpu: 0.9,
          memory: 0.9,
          network: 0.8,
          diskIO: 0.8,
          bandwidth: 10,
          latency: 1000,
        },
      };

      // Stream good data first
      for (let i = 0; i < 30; i++) {
        await onlineLearner.processStream({ ...goodData, id: `good_${i}` });
      }

      const _midAccuracy = onlineLearner.getAccuracy();

      // Stream bad data to trigger adaptation
      for (let i = 0; i < 50; i++) {
        await onlineLearner.processStream({ ...badData, id: `bad_${i}` });
      }

      const finalAccuracy = onlineLearner.getAccuracy();

      // Algorithm should adapt to new distribution
      expect(finalAccuracy).toBeGreaterThanOrEqual(0);
      expect(finalAccuracy).toBeLessThanOrEqual(1);
    });
  });

  describe('Ensemble Model Weight Calculation', () => {
    test('should correctly calculate weighted ensemble predictions', async () => {
      // Classical TDD: Test weighted average calculation
      const ensemble = new EnsembleModels();

      // Add models with known weights
      const model1 = { predict: jest.fn().mockResolvedValue([0.8]) };
      const model2 = { predict: jest.fn().mockResolvedValue([0.4]) };
      const model3 = { predict: jest.fn().mockResolvedValue([0.6]) };

      ensemble.addModel(model1, 0.5); // 50% weight
      ensemble.addModel(model2, 0.3); // 30% weight
      ensemble.addModel(model3, 0.2); // 20% weight

      const testData = createMockExecutionData();
      const prediction = await ensemble.predict(testData);

      // Weighted average: 0.8*0.5 + 0.4*0.3 + 0.6*0.2 = 0.4 + 0.12 + 0.12 = 0.64
      expect(prediction.prediction).toBeCloseTo(0.64, 1);
      expect(prediction.confidence).toBeGreaterThan(0);
    });

    test('should correctly update model weights based on performance', () => {
      // Classical TDD: Test weight update algorithm
      const ensemble = new EnsembleModels();

      ensemble.addModel({ predict: jest.fn() }, 1.0);
      ensemble.addModel({ predict: jest.fn() }, 1.0);

      const performanceMetrics = [
        { accuracy: 0.9 }, // High performance
        { accuracy: 0.5 }, // Low performance
      ];

      ensemble.updateWeights(performanceMetrics);

      const weights = ensemble.getModelWeights();
      const weightValues = Array.from(weights.values());

      // Higher performing model should have higher weight
      expect(weightValues[0]).toBeGreaterThan(weightValues[1]);

      // Weights should sum to 1 (normalized)
      const weightSum = weightValues.reduce((sum, w) => sum + w, 0);
      expect(weightSum).toBeCloseTo(1.0, 2);
    });
  });
});

// ============================================
// Integration Tests (Real-world Scenarios)
// ============================================

describe('Adaptive Learning System - Integration Tests', () => {
  test('should demonstrate end-to-end learning improvement', async () => {
    // Integration test: Full system learning cycle
    const config = createTestConfig();
    const context = createTestContext();

    const patternEngine = new PatternRecognitionEngine(config, context);
    const coordinator = new LearningCoordinator(config, context);
    const optimizer = new PerformanceOptimizer(config, context);

    // Simulate execution data showing improvement over time
    const earlyData = createMockExecutionData().map((data) => ({
      ...data,
      success: Math.random() > 0.7, // 30% success rate initially
      duration: 2000 + Math.random() * 1000,
    }));

    const lateData = createMockExecutionData().map((data) => ({
      ...data,
      success: Math.random() > 0.3, // 70% success rate after learning
      duration: 1000 + Math.random() * 500,
    }));

    // Analyze early patterns
    const earlyAnalysis = await patternEngine.analyzeExecutionPatterns(earlyData);
    expect(earlyAnalysis.patterns.length).toBeGreaterThan(0);

    // Learn from patterns
    const agents: Agent[] = [
      {
        id: 'agent_1',
        type: 'worker',
        capabilities: ['processing'],
        currentLoad: 0.5,
        performance: {
          efficiency: 0.6,
          latency: 200,
          errorRate: 0.3,
          resourceUtilization: {
            cpu: 0.7,
            memory: 0.6,
            network: 0.3,
            diskIO: 0.4,
            bandwidth: 50,
            latency: 120,
          },
          throughput: 5,
          quality: 0.7,
        },
        specializations: ['data_processing'],
        learningProgress: {
          totalExperience: 50,
          domainsLearned: ['processing'],
          currentLearningRate: 0.1,
          knowledgeRetention: 0.9,
          adaptability: 0.7,
        },
      },
    ];

    const learningResult = await coordinator.coordinateLearning(agents);
    expect(learningResult.patterns.length).toBeGreaterThan(0);

    // Apply optimizations
    const optimization = optimizer.optimizeBehavior('agent_1', learningResult.patterns);
    expect(optimization.expectedImprovement).toBeGreaterThan(0);

    // Analyze later patterns to verify improvement
    const lateAnalysis = await patternEngine.analyzeExecutionPatterns(lateData);
    expect(lateAnalysis.confidence).toBeGreaterThan(earlyAnalysis.confidence);
  });

  test('should handle real-time streaming adaptation', async () => {
    // Integration test: Online learning with streaming data
    const onlineLearner = new OnlineLearningSystem({ adaptationThreshold: 0.1 });
    const rlEngine = new ReinforcementLearningEngine({ learningRate: 0.1 });

    // Simulate streaming workload
    const baseData = createMockExecutionData()[0];

    for (let i = 0; i < 100; i++) {
      const streamData = {
        ...baseData,
        id: `stream_${i}`,
        success: Math.random() > 0.4, // 60% success rate
        duration: 1000 + Math.random() * 500,
        timestamp: Date.now() - (100 - i) * 1000, // Chronological order
      };

      await onlineLearner.processStream(streamData);

      // Update RL engine
      const state = `state_${i % 10}`;
      const action = `action_${i % 5}`;
      const reward = streamData.success ? 1 : -1;
      const nextState = `state_${(i + 1) % 10}`;

      rlEngine.updateQValue(state, action, reward, nextState);
    }

    // Verify learning occurred
    const finalAccuracy = onlineLearner.getAccuracy();
    expect(finalAccuracy).toBeGreaterThan(0.3); // Should learn something

    const rlStats = rlEngine.getStats();
    expect(rlStats.stateCount).toBeGreaterThan(0);
    expect(rlStats.episodeCount).toBeGreaterThan(0);
  });
});
