import { SwarmOrchestrator } from '../../../../coordination/orchestrator.ts';
import { CoordinationTestHelpers } from '../../../helpers/coordination-test-helpers.ts';
import { MockBuilder } from '../../../helpers/mock-builder.ts';

describe('Advanced Swarm Orchestration (London TDD)', () => {
  let swarmOrchestrator: SwarmOrchestrator;
  let mockAgentManager: jest.Mocked<AgentManager>;
  let mockTaskDistributionEngine: jest.Mocked<TaskDistributionEngine>;
  let mockLoadBalancingManager: jest.Mocked<LoadBalancingManager>;
  let testHelpers: CoordinationTestHelpers;
  let mockBuilder: MockBuilder;

  beforeEach(() => {
    testHelpers = new CoordinationTestHelpers();
    mockBuilder = new MockBuilder();

    mockAgentManager = mockBuilder.createMockAgentManager({
      poolSize: 20,
      enableAutoScaling: true,
      performanceTracking: true,
    });

    mockTaskDistributionEngine = mockBuilder.createMockTaskDistributionEngine({
      strategy: 'intelligent',
      enableLoadBalancing: true,
      optimizeForLatency: true,
    });

    mockLoadBalancingManager = mockBuilder.createMockLoadBalancingManager({
      algorithm: 'adaptive',
      enablePredictive: true,
      rebalanceThreshold: 0.8,
    });

    swarmOrchestrator = new SwarmOrchestrator(
      mockAgentManager,
      mockTaskDistributionEngine,
      mockLoadBalancingManager,
      {
        maxConcurrentWorkflows: 50,
        enableIntelligentRouting: true,
        faultTolerance: true,
      },
    );
  });

  describe('Complex Workflow Orchestration', () => {
    it('should orchestrate multi-phase dependency workflows', async () => {
      const complexWorkflow = {
        id: 'complex-workflow-001',
        name: 'Multi-phase Data Processing',
        phases: [
          {
            id: 'phase-1',
            name: 'Data Ingestion',
            tasks: [
              { id: 'ingest-1', type: 'data_collection', dependencies: [] },
              {
                id: 'ingest-2',
                type: 'data_validation',
                dependencies: ['ingest-1'],
              },
              {
                id: 'ingest-3',
                type: 'data_normalization',
                dependencies: ['ingest-2'],
              },
            ],
          },
          {
            id: 'phase-2',
            name: 'Data Processing',
            tasks: [
              {
                id: 'process-1',
                type: 'data_analysis',
                dependencies: ['ingest-3'],
              },
              {
                id: 'process-2',
                type: 'feature_extraction',
                dependencies: ['process-1'],
              },
              {
                id: 'process-3',
                type: 'data_transformation',
                dependencies: ['process-1'],
              },
            ],
          },
          {
            id: 'phase-3',
            name: 'Results Generation',
            tasks: [
              {
                id: 'result-1',
                type: 'report_generation',
                dependencies: ['process-2', 'process-3'],
              },
              {
                id: 'result-2',
                type: 'visualization',
                dependencies: ['result-1'],
              },
            ],
          },
        ],
        constraints: {
          maxParallelTasks: 5,
          timeoutPerPhase: 300000,
          retryPolicy: { maxRetries: 3, backoffMultiplier: 2 },
        },
      };

      const availableAgents = testHelpers.generateMockAgents(15, {
        capabilities: [
          'data_collection',
          'data_validation',
          'data_analysis',
          'feature_extraction',
          'report_generation',
        ],
      });

      mockAgentManager.getAllActiveAgents.mockResolvedValue(availableAgents);
      mockTaskDistributionEngine.analyzeWorkflow.mockResolvedValue({
        estimatedDuration: 900000, // 15 minutes
        criticalPath: [
          'ingest-1',
          'ingest-2',
          'ingest-3',
          'process-1',
          'process-2',
          'result-1',
          'result-2',
        ],
        parallelizationOpportunities: [
          ['process-2', 'process-3'],
          ['ingest-1'], // Can start immediately
        ],
        resourceRequirements: {
          minAgents: 5,
          recommendedAgents: 8,
          peakConcurrency: 3,
        },
      });

      mockTaskDistributionEngine.distributeTasks.mockImplementation(
        async (tasks, agents) => {
          const assignments = tasks.map((task, index) => ({
            taskId: task.id,
            agentId: agents[index % agents.length]?.id,
            estimatedStartTime: Date.now() + index * 1000,
            estimatedDuration: 30000,
          }));

          return {
            success: true,
            assignments,
            distributionStrategy: 'dependency_aware',
            parallelExecutionGroups: [
              [assignments[0]], // ingest-1 alone
              [assignments[1]], // ingest-2 after ingest-1
              [assignments[2]], // ingest-3 after ingest-2
              [assignments[3]], // process-1 after ingest-3
              [assignments[4], assignments[5]], // process-2 and process-3 parallel
              [assignments[6]], // result-1 after both process tasks
              [assignments[7]], // result-2 after result-1
            ],
          };
        },
      );

      mockLoadBalancingManager.optimizeDistribution.mockResolvedValue({
        optimizations: [
          {
            type: 'agent_rebalancing',
            from: 'agent-1',
            to: 'agent-5',
            taskCount: 1,
          },
          {
            type: 'resource_allocation',
            agentId: 'agent-3',
            additionalMemory: '512MB',
          },
        ],
        expectedImprovement: {
          latencyReduction: 0.15,
          throughputIncrease: 0.08,
          resourceUtilization: 0.92,
        },
      });

      const orchestrationResult =
        await swarmOrchestrator.executeWorkflow(complexWorkflow);

      // Verify workflow analysis was performed
      expect(mockTaskDistributionEngine.analyzeWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'complex-workflow-001',
          phases: expect.any(Array),
        }),
      );

      // Verify task distribution considered dependencies
      expect(mockTaskDistributionEngine.distributeTasks).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'ingest-1', dependencies: [] }),
          expect.objectContaining({
            id: 'ingest-2',
            dependencies: ['ingest-1'],
          }),
        ]),
        availableAgents,
        expect.objectContaining({
          respectDependencies: true,
          enableParallelization: true,
        }),
      );

      // Verify load balancing optimization was applied
      expect(mockLoadBalancingManager.optimizeDistribution).toHaveBeenCalled();

      expect(orchestrationResult).toMatchObject({
        success: true,
        workflowId: 'complex-workflow-001',
        executionPlan: expect.objectContaining({
          totalTasks: 8,
          estimatedDuration: expect.any(Number),
          parallelExecutionGroups: expect.any(Array),
        }),
        optimizations: expect.any(Array),
      });
    });

    it('should handle conditional workflow branching', async () => {
      const conditionalWorkflow = {
        id: 'conditional-workflow-001',
        name: 'Adaptive Analysis Pipeline',
        tasks: [
          {
            id: 'initial-analysis',
            type: 'data_assessment',
            conditions: [],
          },
          {
            id: 'simple-processing',
            type: 'basic_analysis',
            conditions: [
              {
                dependsOn: 'initial-analysis',
                condition: 'result.complexity === "low"',
              },
            ],
          },
          {
            id: 'complex-processing',
            type: 'advanced_analysis',
            conditions: [
              {
                dependsOn: 'initial-analysis',
                condition: 'result.complexity === "high"',
              },
            ],
          },
          {
            id: 'ml-processing',
            type: 'machine_learning',
            conditions: [
              {
                dependsOn: 'initial-analysis',
                condition: 'result.dataSize > 10000',
              },
            ],
          },
          {
            id: 'final-report',
            type: 'report_generation',
            conditions: [
              {
                anyOf: [
                  'simple-processing',
                  'complex-processing',
                  'ml-processing',
                ],
                condition: 'any_completed',
              },
            ],
          },
        ],
        conditionalLogic: {
          enableDynamicBranching: true,
          evaluateConditionsAt: 'runtime',
          allowMultipleBranches: true,
        },
      };

      const agents = testHelpers.generateMockAgents(10);
      mockAgentManager.getAllActiveAgents.mockResolvedValue(agents);

      // Mock condition evaluation
      mockTaskDistributionEngine.evaluateConditions.mockImplementation(
        async (task, context) => {
          if (task.id === 'simple-processing') {
            return { shouldExecute: false, reason: 'complexity is high' };
          }
          if (task.id === 'complex-processing') {
            return { shouldExecute: true, reason: 'complexity is high' };
          }
          if (task.id === 'ml-processing') {
            return { shouldExecute: true, reason: 'dataSize > 10000' };
          }
          return { shouldExecute: true, reason: 'unconditional' };
        },
      );

      mockTaskDistributionEngine.distributeTasks.mockResolvedValue({
        success: true,
        assignments: [
          { taskId: 'initial-analysis', agentId: 'agent-1' },
          { taskId: 'complex-processing', agentId: 'agent-2' },
          { taskId: 'ml-processing', agentId: 'agent-3' },
          { taskId: 'final-report', agentId: 'agent-4' },
        ],
        skippedTasks: ['simple-processing'],
        branchingDecisions: [
          {
            taskId: 'simple-processing',
            skipped: true,
            reason: 'condition not met',
          },
          {
            taskId: 'complex-processing',
            executed: true,
            reason: 'complexity is high',
          },
          {
            taskId: 'ml-processing',
            executed: true,
            reason: 'dataSize > 10000',
          },
        ],
      });

      const result =
        await swarmOrchestrator.executeWorkflow(conditionalWorkflow);

      // Verify condition evaluation was performed for conditional tasks
      expect(
        mockTaskDistributionEngine.evaluateConditions,
      ).toHaveBeenCalledTimes(4);
      expect(
        mockTaskDistributionEngine.evaluateConditions,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'simple-processing' }),
        expect.any(Object),
      );

      // Verify correct branching decisions
      expect(result?.success).toBe(true);
      expect(result?.executionPlan?.branchingDecisions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            taskId: 'simple-processing',
            skipped: true,
          }),
          expect.objectContaining({
            taskId: 'complex-processing',
            executed: true,
          }),
          expect.objectContaining({ taskId: 'ml-processing', executed: true }),
        ]),
      );

      expect(result?.executionPlan?.skippedTasks).toContain(
        'simple-processing',
      );
    });

    it('should optimize resource allocation across multiple concurrent workflows', async () => {
      const concurrentWorkflows = [
        {
          id: 'workflow-a',
          priority: 'high',
          resourceRequirements: { minAgents: 5, memory: '2GB', cpu: 0.8 },
          estimatedDuration: 600000,
        },
        {
          id: 'workflow-b',
          priority: 'medium',
          resourceRequirements: { minAgents: 3, memory: '1GB', cpu: 0.5 },
          estimatedDuration: 300000,
        },
        {
          id: 'workflow-c',
          priority: 'high',
          resourceRequirements: { minAgents: 4, memory: '1.5GB', cpu: 0.7 },
          estimatedDuration: 450000,
        },
        {
          id: 'workflow-d',
          priority: 'low',
          resourceRequirements: { minAgents: 2, memory: '512MB', cpu: 0.3 },
          estimatedDuration: 900000,
        },
      ];

      const availableAgents = testHelpers.generateMockAgents(20, {
        resources: { memory: '4GB', cpu: 1.0 },
      });

      mockAgentManager.getAllActiveAgents.mockResolvedValue(availableAgents);
      mockAgentManager.getResourceUtilization.mockResolvedValue({
        totalMemory: '80GB',
        usedMemory: '32GB',
        totalCpu: 20.0,
        usedCpu: 8.5,
        availableAgents: 20,
        busyAgents: 5,
      });

      mockLoadBalancingManager.allocateResources.mockResolvedValue({
        allocations: [
          {
            workflowId: 'workflow-a',
            agentIds: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'],
            resources: { memory: '2GB', cpu: 0.8 },
            priority: 1,
          },
          {
            workflowId: 'workflow-c',
            agentIds: ['agent-6', 'agent-7', 'agent-8', 'agent-9'],
            resources: { memory: '1.5GB', cpu: 0.7 },
            priority: 2,
          },
          {
            workflowId: 'workflow-b',
            agentIds: ['agent-10', 'agent-11', 'agent-12'],
            resources: { memory: '1GB', cpu: 0.5 },
            priority: 3,
          },
        ],
        queuedWorkflows: ['workflow-d'],
        resourceConstraints: {
          memoryUtilization: 0.75,
          cpuUtilization: 0.68,
          agentUtilization: 0.6,
        },
      });

      const allocationResult =
        await swarmOrchestrator.allocateResourcesForConcurrentWorkflows(
          concurrentWorkflows,
        );

      // Verify resource analysis was performed
      expect(mockAgentManager.getResourceUtilization).toHaveBeenCalled();

      // Verify resource allocation considered priorities
      expect(mockLoadBalancingManager.allocateResources).toHaveBeenCalledWith(
        concurrentWorkflows,
        expect.objectContaining({
          availableResources: expect.any(Object),
          priorityWeighting: true,
          optimizeForThroughput: true,
        }),
      );

      expect(allocationResult).toMatchObject({
        allocatedWorkflows: 3,
        queuedWorkflows: 1,
        resourceUtilization: expect.objectContaining({
          memory: expect.any(Number),
          cpu: expect.any(Number),
          agents: expect.any(Number),
        }),
        allocations: expect.arrayContaining([
          expect.objectContaining({
            workflowId: 'workflow-a',
            priority: 1,
            agentIds: expect.any(Array),
          }),
        ]),
      });

      // High priority workflows should be allocated first
      const highPriorityAllocations = allocationResult?.allocations?.filter(
        (allocation) => allocation.priority <= 2,
      );
      expect(highPriorityAllocations.length).toBe(2);
    });
  });

  describe('Fault-Tolerant Orchestration', () => {
    it('should handle agent failures during workflow execution', async () => {
      const resilientWorkflow = {
        id: 'resilient-workflow-001',
        tasks: [
          { id: 'task-1', type: 'processing', criticalPath: true },
          { id: 'task-2', type: 'analysis', criticalPath: false },
          {
            id: 'task-3',
            type: 'reporting',
            criticalPath: true,
            dependencies: ['task-1'],
          },
        ],
        faultTolerance: {
          enableAutoRecovery: true,
          maxFailuresPerTask: 2,
          failoverStrategy: 'immediate',
          checkpointInterval: 30000,
        },
      };

      const agents = testHelpers.generateMockAgents(8);
      mockAgentManager.getAllActiveAgents.mockResolvedValue(agents);

      // Mock initial distribution
      mockTaskDistributionEngine.distributeTasks.mockResolvedValueOnce({
        success: true,
        assignments: [
          { taskId: 'task-1', agentId: 'agent-1' },
          { taskId: 'task-2', agentId: 'agent-2' },
          { taskId: 'task-3', agentId: 'agent-3' },
        ],
      });

      // Mock agent failure detection
      mockAgentManager.detectFailures.mockResolvedValue([
        {
          agentId: 'agent-1',
          failureType: 'crash',
          affectedTasks: ['task-1'],
          failureTime: Date.now(),
          recoverable: true,
        },
      ]);

      // Mock failover redistribution
      mockTaskDistributionEngine.redistributeFailedTasks.mockResolvedValue({
        success: true,
        redistributions: [
          {
            originalAgentId: 'agent-1',
            newAgentId: 'agent-4',
            taskId: 'task-1',
            restartFromCheckpoint: true,
            checkpointData: { progress: 65, state: 'processing' },
          },
        ],
        impactAssessment: {
          delayEstimate: 45000, // 45 seconds
          criticalPathAffected: true,
          recoveryStrategy: 'checkpoint_restore',
        },
      });

      mockLoadBalancingManager.rebalanceAfterFailure.mockResolvedValue({
        rebalancing: [
          {
            from: 'agent-2',
            to: 'agent-5',
            taskId: 'task-2',
            reason: 'load_distribution',
          },
        ],
        newDistribution: {
          'agent-4': ['task-1'],
          'agent-5': ['task-2'],
          'agent-3': ['task-3'],
        },
      });

      const result =
        await swarmOrchestrator.executeWorkflowWithFaultTolerance(
          resilientWorkflow,
        );

      // Verify failure detection was performed
      expect(mockAgentManager.detectFailures).toHaveBeenCalled();

      // Verify failover redistribution
      expect(
        mockTaskDistributionEngine.redistributeFailedTasks,
      ).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            agentId: 'agent-1',
            failureType: 'crash',
            affectedTasks: ['task-1'],
          }),
        ]),
        expect.any(Array), // available agents
        expect.objectContaining({
          enableCheckpointRestore: true,
          prioritizeCriticalPath: true,
        }),
      );

      // Verify load rebalancing after failure
      expect(mockLoadBalancingManager.rebalanceAfterFailure).toHaveBeenCalled();

      expect(result).toMatchObject({
        success: true,
        workflowId: 'resilient-workflow-001',
        faultEvents: expect.arrayContaining([
          expect.objectContaining({
            type: 'agent_failure',
            agentId: 'agent-1',
            recoveryAction: 'failover_to_agent-4',
          }),
        ]),
        recovery: expect.objectContaining({
          totalFailures: 1,
          successfulRecoveries: 1,
          impactOnCompletion: expect.any(Number),
        }),
      });
    });

    it('should implement circuit breaker pattern for unstable components', async () => {
      const unstableWorkflow = {
        id: 'unstable-component-workflow',
        tasks: [
          {
            id: 'reliable-task',
            type: 'data_processing',
            serviceEndpoint: 'reliable-service',
          },
          {
            id: 'unstable-task',
            type: 'external_api_call',
            serviceEndpoint: 'unstable-service',
            circuitBreaker: {
              failureThreshold: 3,
              timeout: 5000,
              resetTimeout: 30000,
            },
          },
          {
            id: 'backup-task',
            type: 'fallback_processing',
            serviceEndpoint: 'backup-service',
            fallbackFor: 'unstable-task',
          },
        ],
      };

      const agents = testHelpers.generateMockAgents(5);
      mockAgentManager.getAllActiveAgents.mockResolvedValue(agents);

      // Mock circuit breaker state tracking
      mockTaskDistributionEngine.getCircuitBreakerState.mockResolvedValue({
        'unstable-service': {
          state: 'half-open',
          failureCount: 2,
          lastFailureTime: Date.now() - 10000,
          nextAttemptTime: Date.now() + 20000,
        },
      });

      // Mock task execution with circuit breaker logic
      mockTaskDistributionEngine.executeWithCircuitBreaker.mockImplementation(
        async (task, agent, circuitBreakerConfig) => {
          if (task.serviceEndpoint === 'unstable-service') {
            // Simulate circuit breaker opening
            return {
              success: false,
              circuitBreakerTripped: true,
              fallbackTriggered: true,
              fallbackTaskId: 'backup-task',
              error: 'Service unavailable - circuit breaker open',
            };
          }
          return {
            success: true,
            circuitBreakerTripped: false,
            result: { processed: true },
          };
        },
      );

      // Mock fallback task execution
      mockTaskDistributionEngine.executeFallbackTask.mockResolvedValue({
        success: true,
        taskId: 'backup-task',
        fallbackReason: 'circuit_breaker_open',
        result: { processed: true, method: 'fallback' },
      });

      const result =
        await swarmOrchestrator.executeWorkflowWithCircuitBreaker(
          unstableWorkflow,
        );

      // Verify circuit breaker state was checked
      expect(
        mockTaskDistributionEngine.getCircuitBreakerState,
      ).toHaveBeenCalledWith([
        'reliable-service',
        'unstable-service',
        'backup-service',
      ]);

      // Verify circuit breaker execution was attempted
      expect(
        mockTaskDistributionEngine.executeWithCircuitBreaker,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'unstable-task' }),
        expect.any(Object),
        expect.objectContaining({
          failureThreshold: 3,
          timeout: 5000,
        }),
      );

      // Verify fallback was executed
      expect(
        mockTaskDistributionEngine.executeFallbackTask,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'backup-task' }),
        expect.any(Object),
        expect.objectContaining({ fallbackReason: 'circuit_breaker_open' }),
      );

      expect(result).toMatchObject({
        success: true,
        workflowId: 'unstable-component-workflow',
        circuitBreakerEvents: expect.arrayContaining([
          expect.objectContaining({
            service: 'unstable-service',
            state: 'open',
            fallbackExecuted: true,
          }),
        ]),
        fallbackExecutions: expect.arrayContaining([
          expect.objectContaining({
            originalTask: 'unstable-task',
            fallbackTask: 'backup-task',
            reason: 'circuit_breaker_open',
          }),
        ]),
      });
    });

    it('should handle cascading failures with isolation', async () => {
      const cascadeProneWorkflow = {
        id: 'cascade-prone-workflow',
        tasks: [
          { id: 'upstream-1', type: 'data_source', criticality: 'high' },
          { id: 'upstream-2', type: 'data_source', criticality: 'medium' },
          {
            id: 'processor-1',
            type: 'processing',
            dependencies: ['upstream-1'],
            criticality: 'high',
          },
          {
            id: 'processor-2',
            type: 'processing',
            dependencies: ['upstream-2'],
            criticality: 'medium',
          },
          {
            id: 'aggregator',
            type: 'aggregation',
            dependencies: ['processor-1', 'processor-2'],
            criticality: 'high',
          },
          {
            id: 'downstream-1',
            type: 'output',
            dependencies: ['aggregator'],
            criticality: 'low',
          },
          {
            id: 'downstream-2',
            type: 'notification',
            dependencies: ['aggregator'],
            criticality: 'low',
          },
        ],
        cascadePrevention: {
          enableIsolation: true,
          isolationStrategy: 'dependency_aware',
          maxCascadeDepth: 2,
          criticalityThreshold: 'medium',
        },
      };

      const agents = testHelpers.generateMockAgents(10);
      mockAgentManager.getAllActiveAgents.mockResolvedValue(agents);

      // Mock cascade detection
      mockTaskDistributionEngine.detectPotentialCascade.mockResolvedValue({
        cascadeRisk: 'high',
        affectedTasks: [
          'processor-1',
          'aggregator',
          'downstream-1',
          'downstream-2',
        ],
        isolationRecommendation: {
          isolateTasks: ['processor-1'],
          alternativeStrategies: ['graceful_degradation', 'partial_execution'],
          riskMitigation: {
            isolateUpstream: true,
            enableDownstreamFallbacks: true,
          },
        },
      });

      // Mock isolation execution
      mockTaskDistributionEngine.executeWithIsolation.mockResolvedValue({
        isolatedTasks: ['processor-1'],
        continuedExecution: [
          'upstream-2',
          'processor-2',
          'aggregator',
          'downstream-1',
          'downstream-2',
        ],
        partialResults: {
          aggregator: { result: 'partial', dataSource: 'upstream-2-only' },
          'downstream-1': { result: 'degraded', quality: 'partial' },
          'downstream-2': {
            result: 'success',
            notification: 'partial_completion',
          },
        },
        cascadePrevented: true,
      });

      // Simulate initial failure
      mockAgentManager.simulateFailure.mockResolvedValue({
        failedAgent: 'agent-1',
        affectedTasks: ['upstream-1'],
        cascadeRisk: 'high',
      });

      const result =
        await swarmOrchestrator.executeWorkflowWithCascadePrevention(
          cascadeProneWorkflow,
        );

      // Verify cascade detection was performed
      expect(
        mockTaskDistributionEngine.detectPotentialCascade,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          failedTasks: ['upstream-1'],
          workflowStructure: expect.any(Object),
        }),
      );

      // Verify isolation was executed
      expect(
        mockTaskDistributionEngine.executeWithIsolation,
      ).toHaveBeenCalledWith(
        expect.arrayContaining(['processor-1']),
        expect.objectContaining({
          strategy: 'dependency_aware',
          enablePartialExecution: true,
        }),
      );

      expect(result).toMatchObject({
        success: true,
        workflowId: 'cascade-prone-workflow',
        cascadePrevention: expect.objectContaining({
          cascadeDetected: true,
          isolationApplied: true,
          isolatedTasks: ['processor-1'],
          partialCompletion: true,
        }),
        partialResults: expect.objectContaining({
          completedTasks: expect.any(Number),
          partialTasks: expect.any(Number),
          isolatedTasks: expect.any(Number),
        }),
      });
    });
  });

  describe('Performance Optimization', () => {
    it('should optimize task scheduling based on agent performance profiles', async () => {
      const performanceWorkflow = {
        id: 'performance-optimized-workflow',
        tasks: [
          {
            id: 'cpu-intensive',
            type: 'computation',
            requirements: { cpu: 'high', memory: 'medium' },
          },
          {
            id: 'memory-intensive',
            type: 'data_processing',
            requirements: { cpu: 'low', memory: 'high' },
          },
          {
            id: 'io-intensive',
            type: 'file_processing',
            requirements: { cpu: 'low', memory: 'low', io: 'high' },
          },
          {
            id: 'balanced',
            type: 'analysis',
            requirements: { cpu: 'medium', memory: 'medium', io: 'medium' },
          },
        ],
        optimization: {
          enablePerformanceMatching: true,
          prioritizeEfficiency: true,
          enablePredictiveScheduling: true,
        },
      };

      const agentsWithProfiles = [
        {
          id: 'agent-cpu-optimized',
          capabilities: ['computation', 'analysis'],
          performanceProfile: {
            cpuPerformance: 0.95,
            memoryEfficiency: 0.7,
            ioThroughput: 0.6,
            averageTaskDuration: { computation: 30000, analysis: 45000 },
          },
        },
        {
          id: 'agent-memory-optimized',
          capabilities: ['data_processing', 'analysis'],
          performanceProfile: {
            cpuPerformance: 0.6,
            memoryEfficiency: 0.95,
            ioThroughput: 0.5,
            averageTaskDuration: { data_processing: 25000, analysis: 50000 },
          },
        },
        {
          id: 'agent-io-optimized',
          capabilities: ['file_processing', 'analysis'],
          performanceProfile: {
            cpuPerformance: 0.5,
            memoryEfficiency: 0.6,
            ioThroughput: 0.95,
            averageTaskDuration: { file_processing: 20000, analysis: 60000 },
          },
        },
        {
          id: 'agent-balanced',
          capabilities: [
            'computation',
            'data_processing',
            'file_processing',
            'analysis',
          ],
          performanceProfile: {
            cpuPerformance: 0.8,
            memoryEfficiency: 0.8,
            ioThroughput: 0.8,
            averageTaskDuration: {
              computation: 35000,
              data_processing: 30000,
              file_processing: 25000,
              analysis: 40000,
            },
          },
        },
      ];

      mockAgentManager.getAllActiveAgents.mockResolvedValue(agentsWithProfiles);
      mockAgentManager.getPerformanceProfiles.mockResolvedValue(
        agentsWithProfiles.map((agent) => ({
          agentId: agent.id,
          profile: agent.performanceProfile,
        })),
      );

      mockTaskDistributionEngine.optimizeTaskAssignment.mockResolvedValue({
        optimizedAssignments: [
          {
            taskId: 'cpu-intensive',
            agentId: 'agent-cpu-optimized',
            matchScore: 0.95,
            estimatedDuration: 30000,
            reasoning: 'High CPU performance match',
          },
          {
            taskId: 'memory-intensive',
            agentId: 'agent-memory-optimized',
            matchScore: 0.93,
            estimatedDuration: 25000,
            reasoning: 'High memory efficiency match',
          },
          {
            taskId: 'io-intensive',
            agentId: 'agent-io-optimized',
            matchScore: 0.97,
            estimatedDuration: 20000,
            reasoning: 'High I/O throughput match',
          },
          {
            taskId: 'balanced',
            agentId: 'agent-balanced',
            matchScore: 0.85,
            estimatedDuration: 40000,
            reasoning: 'Balanced resource requirements match',
          },
        ],
        performanceGains: {
          expectedSpeedup: 1.35,
          resourceUtilizationImprovement: 0.28,
          estimatedCompletionTime: 95000,
        },
      });

      const result =
        await swarmOrchestrator.executePerformanceOptimizedWorkflow(
          performanceWorkflow,
        );

      // Verify performance profiles were retrieved
      expect(mockAgentManager.getPerformanceProfiles).toHaveBeenCalled();

      // Verify task assignment optimization
      expect(
        mockTaskDistributionEngine.optimizeTaskAssignment,
      ).toHaveBeenCalledWith(
        performanceWorkflow.tasks,
        agentsWithProfiles,
        expect.objectContaining({
          enablePerformanceMatching: true,
          optimizationCriteria: expect.arrayContaining([
            'efficiency',
            'speed',
            'resource_utilization',
          ]),
        }),
      );

      expect(result).toMatchObject({
        success: true,
        workflowId: 'performance-optimized-workflow',
        optimizations: expect.objectContaining({
          performanceMatching: true,
          expectedSpeedup: 1.35,
          resourceUtilizationImprovement: 0.28,
        }),
        assignments: expect.arrayContaining([
          expect.objectContaining({
            taskId: 'cpu-intensive',
            agentId: 'agent-cpu-optimized',
            matchScore: 0.95,
          }),
          expect.objectContaining({
            taskId: 'memory-intensive',
            agentId: 'agent-memory-optimized',
            matchScore: 0.93,
          }),
        ]),
      });
    });

    it('should implement predictive scaling based on workflow patterns', async () => {
      const predictiveWorkflow = {
        id: 'predictive-scaling-workflow',
        pattern: 'recurring_batch_processing',
        historicalData: {
          averageExecutionTime: 1800000, // 30 minutes
          peakResourceUsage: { agents: 15, memory: '8GB', cpu: 12.0 },
          typicalScalingEvents: [
            { time: 300000, action: 'scale_up', agents: 5 },
            { time: 1200000, action: 'scale_down', agents: 3 },
            { time: 1500000, action: 'scale_down', agents: 7 },
          ],
        },
        tasks: Array.from({ length: 50 }, (_, i) => ({
          id: `batch-task-${i}`,
          type: 'batch_processing',
          estimatedDuration: 120000,
        })),
        predictiveScaling: {
          enablePrediction: true,
          predictionHorizon: 900000, // 15 minutes
          scalingStrategy: 'proactive',
        },
      };

      const currentAgents = testHelpers.generateMockAgents(10);
      mockAgentManager.getAllActiveAgents.mockResolvedValue(currentAgents);

      // Mock predictive analysis
      mockLoadBalancingManager.predictResourceRequirements.mockResolvedValue({
        predictions: [
          {
            timeOffset: 0,
            requiredAgents: 10,
            confidence: 0.85,
            reasoning: 'Initial task distribution',
          },
          {
            timeOffset: 300000,
            requiredAgents: 15,
            confidence: 0.9,
            reasoning: 'Historical pattern indicates scale-up at 5 minutes',
          },
          {
            timeOffset: 1200000,
            requiredAgents: 12,
            confidence: 0.88,
            reasoning: 'Partial scale-down as tasks complete',
          },
          {
            timeOffset: 1500000,
            requiredAgents: 5,
            confidence: 0.92,
            reasoning: 'Final scale-down phase',
          },
        ],
        scalingRecommendations: [
          {
            scheduledTime: Date.now() + 250000, // Pre-emptive scaling
            action: 'scale_up',
            targetAgents: 15,
            reason: 'Anticipated workload increase',
          },
          {
            scheduledTime: Date.now() + 1150000,
            action: 'scale_down',
            targetAgents: 12,
            reason: 'Predicted workload decrease',
          },
        ],
      });

      // Mock proactive scaling execution
      mockAgentManager.scheduleScaling.mockResolvedValue({
        scheduledActions: [
          {
            actionId: 'scale-up-001',
            scheduledTime: Date.now() + 250000,
            action: 'spawn_agents',
            count: 5,
            agentType: 'batch_processor',
          },
          {
            actionId: 'scale-down-001',
            scheduledTime: Date.now() + 1150000,
            action: 'terminate_agents',
            count: 3,
            criteria: 'least_utilized',
          },
        ],
      });

      const result =
        await swarmOrchestrator.executeWorkflowWithPredictiveScaling(
          predictiveWorkflow,
        );

      // Verify predictive analysis was performed
      expect(
        mockLoadBalancingManager.predictResourceRequirements,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowPattern: 'recurring_batch_processing',
          historicalData: expect.any(Object),
          predictionHorizon: 900000,
        }),
      );

      // Verify proactive scaling was scheduled
      expect(mockAgentManager.scheduleScaling).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            action: 'scale_up',
            targetAgents: 15,
          }),
          expect.objectContaining({
            action: 'scale_down',
            targetAgents: 12,
          }),
        ]),
      );

      expect(result).toMatchObject({
        success: true,
        workflowId: 'predictive-scaling-workflow',
        predictiveScaling: expect.objectContaining({
          enabled: true,
          predictions: expect.any(Array),
          scheduledScalingActions: expect.any(Array),
        }),
        scalingOptimizations: expect.objectContaining({
          proactiveScaling: true,
          predictedResourceSavings: expect.any(Number),
          anticipatedPerformanceGains: expect.any(Number),
        }),
      });
    });
  });
});
