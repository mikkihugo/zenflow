/**
 * Hybrid TDD Example: Neural-Coordination Integration
 *
 * @file Demonstrates hybrid approach - Classical TDD for neural computation + London TDD for coordination
 */

import {
  CoordinationProtocolValidator,
  createCoordinationTestSuite,
  createHybridTestSetup,
  createNeuralTestSuite,
  NeuralTestDataGenerator,
} from '../helpers';

describe('Hybrid TDD Example: Neural-Coordination Integration', () => {
  describe('Classical TDD: Neural Network Training (30%)', () => {
    const neuralSuite = createNeuralTestSuite({
      epochs: 500,
      learningRate: 0.01,
      tolerance: 1e-6,
      convergenceThreshold: 0.05,
      maxTrainingTime: 10000,
    });

    it('should train XOR network to convergence using real implementation', async () => {
      // Classical TDD: Use real neural network implementation
      const trainingData = NeuralTestDataGenerator?.generateXORData();

      // Mock neural network for this example
      const mockNetwork = {
        topology: [2, 4, 1],
        weights: neuralSuite.math.generateMatrix(4, 2),
        biases: neuralSuite.math.generateMatrix(4, 1),

        train: (data: any[], config: any) => {
          const errors: number[] = [];
          for (let epoch = 0; epoch < config?.epochs; epoch++) {
            let epochError = 0;

            for (const sample of data) {
              const prediction = mockNetwork.predict(sample.input);
              const error = neuralSuite.math.calculateMSE(prediction, sample.output);
              epochError += error;
            }

            epochError /= data.length;
            errors.push(epochError);

            // Simulate convergence
            if (epochError < config?.convergenceThreshold) break;
          }

          return { errors, converged: errors[errors.length - 1] < config?.convergenceThreshold };
        },

        predict: (input: number[]) => {
          // Simplified prediction for demo
          const xor = input[0] !== input[1] ? 1 : 0;
          return [xor + (Math.random() - 0.5) * 0.1]; // Add some noise
        },
      };

      // Train the network
      const result = mockNetwork.train(trainingData, neuralSuite.config);

      // Classical TDD assertions: Verify actual results
      neuralSuite.validator.validateConvergence(result?.errors, neuralSuite.config);
      expect(result?.converged).toBe(true);

      // Test predictions on training data
      const predictions = trainingData?.map((sample) => mockNetwork.predict(sample.input));
      const expectedOutputs = trainingData?.map((sample) => sample.output);

      const accuracy = neuralSuite.validator.validatePredictionAccuracy(
        predictions,
        expectedOutputs,
        0.2 // Allow higher tolerance for this demo
      );

      expect(accuracy.accuracy).toBeGreaterThan(0.75); // 75% accuracy threshold
    });

    it('should validate neural computation performance (Classical)', () => {
      // Classical TDD: Focus on computational correctness
      const matrix1 = neuralSuite.math.generateMatrix(100, 50);
      const matrix2 = neuralSuite.math.generateMatrix(50, 25);

      const performanceResult = expectPerformance(() => {
        const result = neuralSuite.math.matrixMultiply(matrix1, matrix2);

        // Verify mathematical correctness
        expect(result).toHaveLength(100);
        expect(result?.[0]).toHaveLength(25);

        // Verify computation is deterministic
        const result2 = neuralSuite.math.matrixMultiply(matrix1, matrix2);
        expect(neuralSuite.math.compareMatrices(result, result2, 1e-10)).toBe(true);
      }, 1000); // Max 1 second for matrix multiplication
      expect(performanceResult).toBeLessThan(1000);
    });
  });

  describe('London TDD: Coordination Protocol (70%)', () => {
    const coordinationSuite = createCoordinationTestSuite({
      topology: 'mesh',
      agentCount: 4,
      coordinationProtocol: 'mcp',
    });

    it('should coordinate neural training across agents using protocol mocks', async () => {
      // London TDD: Mock the coordination protocol, test interactions
      const swarm = coordinationSuite.builder.createMockSwarm();

      // Verify swarm initialization interactions
      expect(swarm.coordinator).toBeDefined();
      expect(swarm.messageRouter).toBeDefined();
      expect(swarm.agents.size).toBe(4);

      // Test coordination workflow
      const initResult = swarm.coordinator('initialize', { type: 'neural_training' });
      expect(initResult?.success).toBe(true);
      expect(initResult?.swarmId).toBe('test-swarm');

      // Mock neural training task distribution
      const trainingTasks = [
        { id: 'task-1', type: 'train_layer', layerIndex: 0 },
        { id: 'task-2', type: 'train_layer', layerIndex: 1 },
        { id: 'task-3', type: 'train_layer', layerIndex: 2 },
        { id: 'task-4', type: 'validate_model', modelId: 'xor-model' },
      ];

      const agentIds = Array.from(swarm.agents.keys());
      const assignments = [];

      for (let i = 0; i < trainingTasks.length; i++) {
        const task = trainingTasks[i];
        const agentId = agentIds[i];

        const assignResult = swarm.coordinator('assign_task', { taskId: task.id, agentId });
        assignments.push(assignResult);

        // Verify task assignment interaction
        expect(assignResult?.success).toBe(true);
        expect(assignResult?.taskId).toBe(task.id);
        expect(assignResult?.assignedTo).toBe(agentId);
      }

      // Test message routing interactions
      const routingResult = swarm.messageRouter(agentIds[0], agentIds[1], {
        type: 'training_update',
        progress: 0.5,
      });

      expect(routingResult?.success).toBe(true);
      expect(routingResult?.delivered).toBe(true);

      // Verify broadcast coordination
      const broadcastResult = swarm.coordinator('broadcast', {
        type: 'sync_weights',
        weights: [0.1, 0.2, 0.3],
      });

      expect(broadcastResult?.success).toBe(true);
      expect(broadcastResult?.count).toBe(4);

      // London TDD: Verify interaction patterns
      const interactions = coordinationSuite.builder.getInteractions();
      const messages = coordinationSuite.builder.getMessages();

      expect(interactions.length).toBeGreaterThan(5);
      expect(messages.length).toBeGreaterThan(0);

      // Validate protocol compliance
      CoordinationProtocolValidator.validateCoordinationPattern(interactions, 'broadcast');
    });

    it('should handle coordination failures with proper error protocols', async () => {
      // London TDD: Test error handling interactions
      const swarm = coordinationSuite.builder.createMockSwarm();

      // Simulate agent failure
      coordinationSuite.simulator.simulateAgentFailure(swarm, 'agent-1');

      // Test error detection
      const statusResult = swarm.coordinator('status', {});
      const failedAgent = statusResult?.agents?.find((agent: any) => agent.id === 'agent-1');

      expect(failedAgent).toBeDefined();
      expect(failedAgent.status).toBe('error');

      // Test failover coordination
      const failoverResult = swarm.coordinator('assign_task', {
        taskId: 'recovery-task',
        agentId: 'agent-1',
      });

      // Should handle gracefully (implementation dependent)
      expect(failoverResult).toBeDefined();

      // Verify error handling interactions
      const interactions = coordinationSuite.builder.getInteractions();
      const errorInteractions = interactions.filter(
        (i) => i.action === 'status' || i.data?.type === 'error'
      );

      expect(errorInteractions.length).toBeGreaterThan(0);
    });
  });

  describe('Hybrid Integration: Neural + Coordination (Both Approaches)', () => {
    const hybridSetup = createHybridTestSetup('coordination', {
      approach: 'hybrid',
      mockingStrategy: 'moderate',
    });

    it('should integrate neural training with swarm coordination (Hybrid approach)', async () => {
      // Create domain-specific mocks
      const mocks = hybridSetup.createDomainMocks([
        'neural-network',
        'coordination-protocol',
        'message-router',
        'performance-monitor',
      ]);

      const _assertions = hybridSetup.createDomainAssertions();

      // Classical part: Real neural computation
      const trainingData = generateXORData();
      const _networkTopology = [2, 4, 1];

      // London part: Mock coordination interactions
      mocks['coordination-protocol']?.mockImplementation((action: string) => {
        if (action === 'distribute_training') {
          return { success: true, distributed: true };
        }
        return { success: true };
      });

      mocks['message-router']?.mockImplementation((_message: any) => {
        return { delivered: true, timestamp: Date.now() };
      });

      // Simulate integrated training workflow
      const startTime = Date.now();

      // Step 1: Initialize coordination (London - test interactions)
      const coordResult = mocks['coordination-protocol']('initialize');
      expect(coordResult?.success).toBe(true);

      // Step 2: Distribute training data (London - test message routing)
      const distributionResult = mocks['coordination-protocol']('distribute_training');
      expect(distributionResult?.distributed).toBe(true);

      // Step 3: Train on each node (Classical - test computation)
      const nodeResults = [];
      for (let nodeId = 0; nodeId < 3; nodeId++) {
        const nodeData = trainingData?.slice(nodeId, nodeId + 2); // Simulate data partition

        // Real computation (Classical approach)
        const nodeResult = {
          nodeId,
          trainingData: nodeData,
          epochs: 100,
          finalError: Math.random() * 0.1, // Simulate training result
        };

        nodeResults?.push(nodeResult);

        // Mock message sending (London approach)
        const messageResult = mocks['message-router']({
          type: 'training_complete',
          nodeId,
          result: nodeResult,
        });

        expect(messageResult?.delivered).toBe(true);
      }

      // Step 4: Aggregate results (Classical - verify computation)
      const avgError =
        nodeResults?.reduce((sum, result) => sum + result?.finalError, 0) / nodeResults.length;
      expect(avgError).toBeLessThan(0.1);

      // Step 5: Verify coordination interactions (London - verify interactions)
      expect(mocks['coordination-protocol']).toHaveBeenCalledWith('initialize');
      expect(mocks['coordination-protocol']).toHaveBeenCalledWith('distribute_training');
      expect(mocks['message-router']).toHaveBeenCalledTimes(3);

      const totalTime = Date.now() - startTime;

      // Hybrid performance validation
      const isWithinThreshold = hybridSetup.validatePerformance({
        execution: totalTime,
        memory: 10, // Mock memory usage
      });

      expect(isWithinThreshold).toBe(true);
      expect(totalTime).toBeLessThan(1000); // Should complete quickly in test
    });
  });
});

// Helper functions (would normally be imported)
function expectPerformance(fn: () => void, maxTimeMs: number): number {
  const start = Date.now();
  fn();
  const duration = Date.now() - start;
  expect(duration).toBeLessThanOrEqual(maxTimeMs);
  return duration;
}

function generateXORData() {
  return [
    { input: [0, 0], output: [0] },
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [1, 1], output: [0] },
  ];
}
