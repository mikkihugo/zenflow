/**
 * @fileoverview Phase 3 Data Flow Integration Test
 *
 * This test verifies that the Phase 3 integration bridge correctly connects
 * swarm agents to the ensemble learning system and enables real data flow
 * to the Learning Monitor instead of showing zero states.
 *
 * Test Coverage:
 * - Phase3DataBridge data collection and aggregation
 * - SwarmEnsembleIntegrator real-time metrics
 * - Phase3IntegratorService orchestration
 * - Learning Monitor data integration
 * - End-to-end data flow verification
 *
 * @author Claude Code Zen Team - Phase3Integrator Agent
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'node:events';

// Import integration components
import {
  Phase3DataBridge,
  type Phase3DataBridgeConfig,
} from '../../coordination/swarm/integration/phase3-data-bridge.ts';
import {
  SwarmEnsembleIntegrator,
  type SwarmEnsembleIntegratorConfig,
} from '../../coordination/swarm/integration/swarm-ensemble-integrator.ts';
import {
  Phase3IntegratorService,
  type Phase3IntegratorServiceConfig,
} from '../../coordination/swarm/integration/phase3-integrator-service.ts';
import { Phase3IntegrationFactory } from '../../coordination/swarm/integration/phase3-integration-factory.ts';

// Import Phase 3 systems
import {
  Phase3EnsembleLearning,
  type Phase3EnsembleConfig,
} from '../../coordination/swarm/learning/phase-3-ensemble.ts';
import {
  NeuralEnsembleCoordinator,
  type NeuralEnsembleCoordinatorConfig,
} from '../../coordination/swarm/learning/neural-ensemble-coordinator.ts';

// Mock dependencies
import type { IEventBus } from '../../core/interfaces/base-interfaces';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator.ts';
import type { SwarmService } from '../../services/coordination/swarm-service.ts';

// Mock logger to prevent test output noise
vi.mock('../../config/logging-config.ts', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe('Phase 3 Data Flow Integration', () => {
  let eventBus: IEventBus;
  let memoryCoordinator: MemoryCoordinator;
  let mockSwarmService: SwarmService;
  let dataBridge: Phase3DataBridge;
  let swarmIntegrator: SwarmEnsembleIntegrator;
  let integratorService: Phase3IntegratorService;
  let factory: Phase3IntegrationFactory;

  beforeEach(async () => {
    // Create mock event bus
    eventBus = new EventEmitter() as IEventBus;
    eventBus.emit = vi.fn((...args) =>
      EventEmitter.prototype.emit.apply(eventBus, args)
    );

    // Create mock memory coordinator
    memoryCoordinator = {
      store: vi.fn().mockResolvedValue(undefined),
      retrieve: vi.fn().mockResolvedValue(null),
      list: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(true),
    } as any;

    // Create mock swarm service
    mockSwarmService = {
      getSwarmStatus: vi.fn().mockReturnValue({
        activeAgents: 5,
        completedTasks: 23,
        successRate: 0.87,
      }),
    } as any;

    // Initialize factory
    factory = new Phase3IntegrationFactory();
  });

  afterEach(async () => {
    // Clean up all services
    if (integratorService) {
      await integratorService.shutdown();
    }
    if (swarmIntegrator) {
      await swarmIntegrator.shutdown();
    }
    if (dataBridge) {
      await dataBridge.shutdown();
    }
  });

  describe('Phase3DataBridge', () => {
    beforeEach(() => {
      const config: Phase3DataBridgeConfig = {
        enabled: true,
        refreshInterval: 100, // Fast for testing
        metricsHistory: 10,
        aggregationWindow: 200,
        learningEventThreshold: 3,
        coordinationTimeout: 1000,
      };

      dataBridge = new Phase3DataBridge(config, eventBus, memoryCoordinator, {
        swarmService: mockSwarmService,
      });
    });

    it('should initialize and start data collection', async () => {
      expect(dataBridge.getBridgeStatus().isCollecting).toBe(false);

      await dataBridge.startDataCollection();

      expect(dataBridge.getBridgeStatus().isCollecting).toBe(true);
      expect(dataBridge.getBridgeStatus().swarmServiceConnected).toBe(true);
    });

    it('should collect and aggregate metrics', async () => {
      await dataBridge.startDataCollection();

      // Wait for initial collection
      await new Promise((resolve) => setTimeout(resolve, 150));

      const metrics = dataBridge.getLatestMetrics();
      expect(metrics).toBeTruthy();

      if (metrics) {
        expect(metrics.ensemble.accuracy).toBeGreaterThan(0);
        expect(metrics.ensemble.totalPredictions).toBeGreaterThan(0);
        expect(metrics.tierPerformance.tier1.active).toBe(true);
        expect(metrics.tierPerformance.tier2.active).toBe(true);
        expect(metrics.tierPerformance.tier3.active).toBe(true);
        expect(metrics.learning.isLearning).toBe(true);
        expect(metrics.liveMetrics.swarmActivity.activeAgents).toBeGreaterThan(
          0
        );
      }
    });

    it('should generate realistic learning events', async () => {
      await dataBridge.startDataCollection();

      // Wait for collection
      await new Promise((resolve) => setTimeout(resolve, 150));

      const metrics = dataBridge.getLatestMetrics();
      expect(metrics?.recentEvents).toBeDefined();
      expect(metrics?.recentEvents.length).toBeGreaterThan(0);

      const event = metrics?.recentEvents[0];
      expect(event?.timestamp).toBeInstanceOf(Date);
      expect(event?.type).toBeTruthy();
      expect(event?.message).toBeTruthy();
    });

    it('should update metrics periodically', async () => {
      await dataBridge.startDataCollection();

      const initialMetrics = dataBridge.getLatestMetrics();
      const initialTimestamp =
        initialMetrics?.liveMetrics.swarmActivity.learningEvents[0]?.timestamp;

      // Wait for next update cycle
      await new Promise((resolve) => setTimeout(resolve, 250));

      const updatedMetrics = dataBridge.getLatestMetrics();
      const updatedTimestamp =
        updatedMetrics?.liveMetrics.swarmActivity.learningEvents[0]?.timestamp;

      // Timestamps should be different (metrics updated)
      expect(updatedTimestamp?.getTime()).not.toBe(initialTimestamp?.getTime());
    });
  });

  describe('SwarmEnsembleIntegrator', () => {
    let ensemble: Phase3EnsembleLearning;
    let neuralCoordinator: NeuralEnsembleCoordinator;

    beforeEach(async () => {
      // Create Phase 3 systems for integration
      const ensembleConfig: Phase3EnsembleConfig = {
        enabled: true,
        defaultStrategy: 'adaptive_stacking',
        adaptiveStrategySelection: false,
        maxModelsPerTier: 3,
        modelRetentionPeriod: 1,
        performanceEvaluationInterval: 1,
        minimumConsensusThreshold: 0.6,
        confidenceThreshold: 0.7,
        uncertaintyToleranceLevel: 0.3,
        diversityRequirement: 0.5,
        weightUpdateFrequency: 1,
        performanceWindowSize: 5,
        adaptationSensitivity: 0.5,
        predictionValidationEnabled: false,
        crossValidationFolds: 3,
        ensembleStabilityThreshold: 0.7,
      };

      ensemble = new Phase3EnsembleLearning(
        ensembleConfig,
        eventBus,
        memoryCoordinator
      );

      const coordinatorConfig: NeuralEnsembleCoordinatorConfig = {
        enabled: true,
        defaultMode: 'balanced_hybrid',
        adaptiveModeSwitching: false,
        neuralEnsembleAlignment: {
          alignmentThreshold: 0.5,
          maxDivergence: 0.5,
          consensusRequirement: 0.5,
        },
        performanceOptimization: {
          dynamicWeighting: false,
          adaptiveThresholds: false,
          performanceWindowSize: 10,
          optimizationInterval: 5,
        },
        neuralModelManagement: {
          maxActiveModels: 2,
          modelSynchronizationInterval: 5,
          performanceEvaluationFrequency: 5,
          modelRetirementThreshold: 0.2,
        },
        validation: {
          enableCrossValidation: false,
          validationSplitRatio: 0.1,
          realTimeValidation: false,
          validationHistory: 10,
        },
      };

      neuralCoordinator = new NeuralEnsembleCoordinator(
        coordinatorConfig,
        eventBus,
        memoryCoordinator,
        { phase3Ensemble: ensemble }
      );

      const integratorConfig: SwarmEnsembleIntegratorConfig = {
        enabled: true,
        agentMonitoringInterval: 100,
        performanceAggregationWindow: 200,
        learningEventThreshold: 3,
        feedbackLoopEnabled: false,
        adaptiveCapabilityTracking: false,
      };

      const dataBridgeConfig: Phase3DataBridgeConfig = {
        enabled: true,
        refreshInterval: 100,
        metricsHistory: 10,
        aggregationWindow: 200,
        learningEventThreshold: 3,
        coordinationTimeout: 1000,
      };

      swarmIntegrator = new SwarmEnsembleIntegrator(
        integratorConfig,
        eventBus,
        memoryCoordinator,
        dataBridgeConfig,
        {
          swarmService: mockSwarmService,
          phase3Ensemble: ensemble,
          neuralCoordinator: neuralCoordinator,
        }
      );
    });

    afterEach(async () => {
      if (neuralCoordinator) {
        await neuralCoordinator.shutdown();
      }
      if (ensemble) {
        await ensemble.shutdown();
      }
    });

    it('should initialize and start integration', async () => {
      const status = swarmIntegrator.getIntegrationStatus();
      expect(status.isIntegrating).toBe(false);

      await swarmIntegrator.startIntegration();

      const startedStatus = swarmIntegrator.getIntegrationStatus();
      expect(startedStatus.isIntegrating).toBe(true);
      expect(startedStatus.dataBridgeStatus.isCollecting).toBe(true);
    });

    it('should collect agent performance data', async () => {
      await swarmIntegrator.startIntegration();

      // Wait for initial data collection
      await new Promise((resolve) => setTimeout(resolve, 150));

      const performanceData = swarmIntegrator.getAgentPerformanceData();
      expect(performanceData.length).toBeGreaterThan(0);

      const agentData = performanceData[0];
      expect(agentData.agentId).toBeTruthy();
      expect(agentData.agentType).toBeTruthy();
      expect(agentData.taskMetrics.completedTasks).toBeGreaterThanOrEqual(0);
      expect(agentData.coordinationMetrics.collaborationScore).toBeGreaterThan(
        0
      );
      expect(
        agentData.learningIndicators.improvementRate
      ).toBeGreaterThanOrEqual(0);
    });

    it('should provide metrics for Learning Monitor', async () => {
      await swarmIntegrator.startIntegration();

      // Wait for data collection
      await new Promise((resolve) => setTimeout(resolve, 150));

      const metrics = swarmIntegrator.getLatestMetricsForLearningMonitor();
      expect(metrics).toBeTruthy();

      if (metrics) {
        expect(metrics.ensemble.accuracy).toBeGreaterThan(0);
        expect(metrics.ensemble.confidence).toBeGreaterThan(0);
        expect(metrics.tierPerformance.tier1.active).toBe(true);
        expect(metrics.tierPerformance.tier2.active).toBe(true);
        expect(metrics.tierPerformance.tier3.active).toBe(true);
        expect(metrics.learning.isLearning).toBe(true);
      }
    });

    it('should respond to swarm events', async () => {
      await swarmIntegrator.startIntegration();

      // Simulate agent status change
      eventBus.emit('swarm:agent:status:changed', {
        agentId: 'test-agent-1',
        oldStatus: 'idle',
        newStatus: 'active',
        timestamp: new Date(),
      });

      // Simulate task completion
      eventBus.emit('swarm:task:completed', {
        taskId: 'test-task-1',
        agentId: 'test-agent-1',
        taskType: 'research',
        success: true,
        duration: 1500,
        timestamp: new Date(),
      });

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = swarmIntegrator.getIntegrationStatus();
      expect(status.metrics.tasksProcessed).toBeGreaterThan(0);
    });
  });

  describe('Phase3IntegratorService', () => {
    beforeEach(() => {
      const config: Phase3IntegratorServiceConfig = {
        enabled: true,
        autoDiscovery: false,
        enableDataBridge: true,
        enableSwarmIntegrator: true,
        updateInterval: 100,
        healthCheckInterval: 200,
        fallbackDataEnabled: true,
      };

      integratorService = new Phase3IntegratorService(
        config,
        eventBus,
        memoryCoordinator
      );
    });

    it('should initialize and start successfully', async () => {
      expect(integratorService.isOperational()).toBe(false);

      await integratorService.initialize({
        swarmService: mockSwarmService,
      });

      await integratorService.start();

      expect(integratorService.isOperational()).toBe(true);

      const health = integratorService.getServiceHealth();
      expect(health.overall).not.toBe('offline');
      expect(health.components.systemConnections.swarmService).toBe(true);
    });

    it('should provide learning metrics for Learning Monitor', async () => {
      await integratorService.initialize({ swarmService: mockSwarmService });
      await integratorService.start();

      // Wait for initial data collection
      await new Promise((resolve) => setTimeout(resolve, 150));

      const metrics = integratorService.getCurrentLearningMetrics();
      expect(metrics).toBeTruthy();

      if (metrics) {
        expect(metrics.ensemble.accuracy).toBeGreaterThan(0);
        expect(metrics.ensemble.confidence).toBeGreaterThan(0);
        expect(metrics.ensemble.totalPredictions).toBeGreaterThan(0);
        expect(metrics.tierPerformance.tier1.active).toBe(true);
        expect(metrics.learning.isLearning).toBe(true);
        expect(metrics.recentEvents.length).toBeGreaterThan(0);
      }
    });

    it('should provide fallback data when no real systems are available', async () => {
      await integratorService.initialize(); // No systems provided
      await integratorService.start();

      const metrics = integratorService.getCurrentLearningMetrics();
      expect(metrics).toBeTruthy();

      // Should still provide realistic fallback data
      if (metrics) {
        expect(metrics.ensemble.accuracy).toBeGreaterThan(70);
        expect(metrics.ensemble.confidence).toBeGreaterThan(70);
        expect(metrics.tierPerformance.tier1.active).toBe(true);
        expect(metrics.recentEvents.length).toBeGreaterThan(0);
      }
    });

    it('should monitor service health', async () => {
      await integratorService.initialize({ swarmService: mockSwarmService });
      await integratorService.start();

      const health = integratorService.getServiceHealth();
      expect(health.overall).toBe('healthy');
      expect(health.uptime).toBeGreaterThan(0);
      expect(health.lastHealthCheck).toBeInstanceOf(Date);

      const availability = integratorService.getSystemAvailability();
      expect(availability.swarmService).toBe(true);
      expect(availability.dataBridge).toBe(true);
    });
  });

  describe('Phase3IntegrationFactory', () => {
    it('should create simple integration for development', async () => {
      const service = await factory.createSimpleIntegration(
        eventBus,
        memoryCoordinator,
        'development'
      );

      expect(service).toBeInstanceOf(Phase3IntegratorService);
      expect(service.isOperational()).toBe(false); // Not started yet

      // Clean up
      await service.shutdown();
    });

    it('should create Learning Monitor integration with auto-start', async () => {
      const service = await factory.createLearningMonitorIntegration(
        eventBus,
        memoryCoordinator,
        { swarmService: mockSwarmService }
      );

      expect(service).toBeInstanceOf(Phase3IntegratorService);
      expect(service.isOperational()).toBe(true); // Should be started

      // Should provide metrics immediately
      const metrics = service.getCurrentLearningMetrics();
      expect(metrics).toBeTruthy();

      // Clean up
      await service.shutdown();
    });

    it('should create integration bundle with all components', async () => {
      const config = {
        profile: 'development' as const,
        enableRealSystems: true,
        enableFallbackData: true,
        enableAutoDiscovery: false,
      };

      const bundle = await factory.createIntegrationBundle(
        eventBus,
        memoryCoordinator,
        config,
        { swarmService: mockSwarmService }
      );

      expect(bundle.integratorService).toBeInstanceOf(Phase3IntegratorService);
      expect(bundle.ensembleSystem).toBeInstanceOf(Phase3EnsembleLearning);
      expect(bundle.neuralCoordinator).toBeInstanceOf(
        NeuralEnsembleCoordinator
      );
      expect(bundle.isInitialized).toBe(true);
      expect(bundle.systemsConnected).toContain('swarm-service');
      expect(bundle.systemsConnected).toContain('phase3-ensemble');
      expect(bundle.systemsConnected).toContain('neural-coordinator');

      // Clean up
      await factory.shutdownIntegrationBundle(bundle);
    });
  });

  describe('End-to-End Data Flow', () => {
    it('should provide real data to Learning Monitor interface', async () => {
      // Create complete integration
      const service = await factory.createLearningMonitorIntegration(
        eventBus,
        memoryCoordinator,
        { swarmService: mockSwarmService }
      );

      // Simulate Learning Monitor requesting metrics
      const metrics = service.getCurrentLearningMetrics();

      // Verify we get real data instead of zero state
      expect(metrics).toBeTruthy();

      if (metrics) {
        // Ensemble metrics should be active
        expect(metrics.ensemble.accuracy).toBeGreaterThan(0);
        expect(metrics.ensemble.confidence).toBeGreaterThan(0);
        expect(metrics.ensemble.totalPredictions).toBeGreaterThan(0);
        expect(metrics.ensemble.adaptationCount).toBeGreaterThan(0);

        // Tier performance should show active models
        expect(metrics.tierPerformance.tier1.active).toBe(true);
        expect(metrics.tierPerformance.tier1.models).toBeGreaterThan(0);
        expect(metrics.tierPerformance.tier1.accuracy).toBeGreaterThan(0);

        expect(metrics.tierPerformance.tier2.active).toBe(true);
        expect(metrics.tierPerformance.tier2.models).toBeGreaterThan(0);
        expect(metrics.tierPerformance.tier2.accuracy).toBeGreaterThan(0);

        expect(metrics.tierPerformance.tier3.active).toBe(true);
        expect(metrics.tierPerformance.tier3.models).toBeGreaterThan(0);
        expect(metrics.tierPerformance.tier3.accuracy).toBeGreaterThan(0);

        // Neural coordination should be available
        expect(metrics.neuralCoordination).toBeTruthy();
        if (metrics.neuralCoordination) {
          expect(metrics.neuralCoordination.alignment).toBeGreaterThan(0);
          expect(metrics.neuralCoordination.consensus).toBeGreaterThan(0);
          expect(metrics.neuralCoordination.activeIntegrations).toBeGreaterThan(
            0
          );
          expect(
            metrics.neuralCoordination.coordinationAccuracy
          ).toBeGreaterThan(0);
        }

        // Learning activity should be active
        expect(metrics.learning.isLearning).toBe(true);
        expect(metrics.learning.modelUpdates).toBeGreaterThan(0);
        expect(metrics.learning.strategyAdaptations).toBeGreaterThan(0);

        // Recent events should be populated
        expect(metrics.recentEvents.length).toBeGreaterThan(0);
        const event = metrics.recentEvents[0];
        expect(event.timestamp).toBeInstanceOf(Date);
        expect(event.type).toBeTruthy();
        expect(event.message).toBeTruthy();
      }

      // Clean up
      await service.shutdown();
    });

    it('should respond to real-time swarm events', async () => {
      const service = await factory.createLearningMonitorIntegration(
        eventBus,
        memoryCoordinator,
        { swarmService: mockSwarmService }
      );

      // Get initial metrics
      const initialMetrics = service.getCurrentLearningMetrics();
      const initialTaskCount = initialMetrics?.ensemble.totalPredictions || 0;

      // Simulate swarm activity
      eventBus.emit('swarm:task:completed', {
        taskId: 'real-time-task-1',
        agentId: 'agent-1',
        success: true,
        duration: 2000,
        timestamp: new Date(),
      });

      eventBus.emit('phase3:ensemble:prediction:result', {
        prediction: {
          predictionId: 'pred-1',
          confidence: 0.85,
        },
        timestamp: new Date(),
      });

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Force update to get latest metrics
      await service.forceUpdate();

      const updatedMetrics = service.getCurrentLearningMetrics();

      // Should reflect the new activity
      expect(updatedMetrics?.ensemble.totalPredictions).toBeGreaterThan(
        initialTaskCount
      );

      // Clean up
      await service.shutdown();
    });
  });
});
