/**
 * @fileoverview Kanban Workflow Engine - Event-Driven Architecture
 *
 * Enterprise kanban workflow engine with pure event-driven coordination.
 * Provides complete kanban functionality via event orchestration for real workflows.
 *
 * **Architecture:**
 * - Domain Services: Pure business logic (tasks, WIP, flow, bottlenecks, health)
 * - Infrastructure Services: Technical concerns (events, persistence, performance, state machines)
 * - Event Coordination: Pure event-driven workflow orchestration
 * - No API Methods: 100% event-based for WebSocket + Svelte frontend
 *
 * **Real Workflow Events:**
 * - kanban:requestWIPLimits / kanban:wipLimitsResponse - WIP coordination
 * - kanban:updateWIPLimits / kanban:wipLimitsUpdated - WIP management
 * - kanban:requestBottleneckAnalysis / kanban:bottleneckAnalysisResponse - Bottleneck detection
 * - kanban:requestFlowMetrics / kanban:flowMetricsResponse - Flow analysis
 * - kanban:requestHealthCheck / kanban:healthCheckResponse - System health
 * - kanban:wip:status / kanban:wip:violations - Live WIP monitoring
 * - kanban:flow:metrics / kanban:flow:statistics - Live flow tracking
 * - kanban:health:status - Live health monitoring
 *
 * **Benefits:**
 * - Pure event-driven real workflow coordination
 * - WebSocket streaming for live frontend updates
 * - No API interfaces - 100% event-based
 * - Professional enterprise kanban patterns
 * - Real workflow orchestration and optimization
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger, EventLogger } from '@claude-zen/foundation';
import type {
  BottleneckReport,
  FlowMetrics,
  HealthCheckResult,
  TaskState,
  TimeRange,
  WIPLimits,
  WorkflowKanbanConfig,
  WorkflowKanbanEvents,
  WorkflowStatistics,
  WorkflowTask,
} from '../types/index';
// Domain Services
import {
  DomainServicesFactory,
  type TaskCreationInput,
  type TaskUpdateInput,
  type KanbanOperationResult,
} from '../domain/index';
// Infrastructure Services
import {
  InfrastructureServicesFactory,
  type EventCoordinatorService,
  type StateMachineCoordinatorService,
  type PerformanceTrackerService,
  type PersistenceCoordinatorService,
} from '../infrastructure/index';
const logger = getLogger('KanbanEngine'');

/**
 * Default configuration for clean workflow kanban
 */
const DEFAULT_CONFIG: WorkflowKanbanConfig = {
  enableIntelligentWIP: true,
  enableBottleneckDetection: true,
  enableFlowOptimization: true,
  enableHealthMonitoring: true,
  enableEventSystem: true,
  wipLimits: {
    analysis: 5,
    development: 8,
    testing: 6,
    review: 4,
    deployment: 3,
    blocked: 10,
    done: 1000,
  },
  maxConcurrentTasks: 50,
  performanceTrackingEnabled: true,
};

/**
 * Kanban Engine
 *
 * Production kanban workflow engine with enterprise-grade architecture.
 * Provides complete kanban functionality via pure event coordination.
 */
export class KanbanEngine {
  private readonly config: WorkflowKanbanConfig;
  private readonly domainFactory: DomainServicesFactory;
  private readonly infrastructureFactory: InfrastructureServicesFactory;
  
  // Service instances
  private domainServices!: ReturnType<DomainServicesFactory['createAllServices']>';
  private infrastructureServices!: ReturnType<InfrastructureServicesFactory['createAllServices']>';
  private initialized = false;

  constructor(config: Partial<WorkflowKanbanConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.domainFactory = new DomainServicesFactory();
    this.infrastructureFactory = new InfrastructureServicesFactory();

    logger.info('KanbanEngine created with event-driven architecture,{
      enableIntelligentWIP: this.config.enableIntelligentWIP,
      enableBottleneckDetection: this.config.enableBottleneckDetection,
      enableFlowOptimization: this.config.enableFlowOptimization,
    });
  }

  /**
   * Initialize the kanban workflow system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('KanbanEngine already initialized'');
      return;
    }

    try {
      logger.info('Initializing KanbanEngine with event-driven architecture'');

      // Create all services
      this.infrastructureServices = this.infrastructureFactory.createAllServices({
        eventCoordinator: { enableMonitoring: this.config.performanceTrackingEnabled },
        performance: { enableDetailedTracking: this.config.performanceTrackingEnabled },
        persistence: { enableCaching: true },
      });

      this.domainServices = this.domainFactory.createAllServices({
        wipLimits: this.config.wipLimits,
        bottleneckDetection: { confidenceThreshold: 0.6 },
        healthMonitoring: { warningThreshold: 0.7, criticalThreshold: 0.3 },
      });

      // Initialize infrastructure services
      await this.infrastructureFactory.initializeAllServices();

      // Setup event-based workflow coordination
      await this.setupEventCoordination();

      this.initialized = true;
      logger.info('KanbanEngine initialized successfully with event-driven architecture'');

      // Emit initialization event
      const initPayload = {
        timestamp: new Date(),
        config: this.config,
      };
      EventLogger.log('kanban:initialized,initPayload');
      await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:initialized,initPayload');

    } catch (error) {
      logger.error('Failed to initialize KanbanEngine:,error');
      throw error;
    }
  }

  /**
   * Setup event listeners for coordination
   */
  private async setupEventCoordination(): Promise<void> {
    // Setup event-based workflow coordination
    const readyPayload = {
      timestamp: new Date(),
      config: this.config,
    };
    EventLogger.log('kanban:ready,readyPayload');
    await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:ready,readyPayload');

    // Listen for workflow coordination events
    await this.setupWorkflowEventHandlers();

    // Start background monitoring if enabled
    if (this.config.enableBottleneckDetection) {
      this.startBottleneckMonitoring();
    }
    
    if (this.config.enableHealthMonitoring) {
      this.startHealthMonitoring();
    }

    // Start WIP monitoring for real workflow coordination
    if (this.config.enableIntelligentWIP) {
      this.startWIPMonitoring();
    }

    // Start flow metrics tracking for workflow optimization
    if (this.config.enableFlowOptimization) {
      this.startFlowMetricsTracking();
    }
  }

  /**
   * Setup event handlers for workflow coordination
   */
  private async setupWorkflowEventHandlers(): Promise<void> {
    // These events drive real workflows, not just UI updates
    
    // WIP limit coordination events
    this.infrastructureServices.eventCoordinator.on('kanban:requestWIPLimits,async (data) => {
      try {
        const wipLimits = await this.domainServices.wipManagement.getWIPLimits();
        const wipResponse = {
          requestId: data.requestId,
          wipLimits,
          timestamp: new Date(),
        };
        EventLogger.log('kanban:wipLimitsResponse,wipResponse');
        await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:wipLimitsResponse,wipResponse');
      } catch (error) {
        logger.error('Failed to handle WIP limits request:,error');
      }
    });

    this.infrastructureServices.eventCoordinator.on('kanban:updateWIPLimits,async (data) => {
      try {
        await this.domainServices.wipManagement.updateWIPLimits(data.newLimits);
        const updatedLimits = await this.domainServices.wipManagement.getWIPLimits();
        await this.infrastructureServices.persistenceCoordinator.saveWIPLimits(updatedLimits);
        
        const wipUpdatePayload = {
          wipLimits: updatedLimits,
          timestamp: new Date(),
        };
        EventLogger.log('kanban:wipLimitsUpdated,wipUpdatePayload');
        await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:wipLimitsUpdated,wipUpdatePayload');
      } catch (error) {
        logger.error('Failed to update WIP limits:,error');
      }
    });

    // Bottleneck detection coordination events  
    this.infrastructureServices.eventCoordinator.on('kanban:requestBottleneckAnalysis,async (data) => {
      try {
        const allTasks = await this.infrastructureServices.persistenceCoordinator.loadAllTasks();
        if (allTasks.success && allTasks.data) {
          const wipLimits = await this.domainServices.wipManagement.getWIPLimits();
          const bottlenecks = await this.domainServices.bottleneckDetection.detectBottlenecks(allTasks.data, wipLimits);
          
          const bottleneckResponse = {
            requestId: data.requestId,
            bottleneckReport: bottlenecks,
            timestamp: new Date(),
          };
          EventLogger.log('kanban:bottleneckAnalysisResponse,bottleneckResponse');
          await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:bottleneckAnalysisResponse,bottleneckResponse');
        }
      } catch (error) {
        logger.error('Failed to handle bottleneck analysis request:,error');
      }
    });

    // Flow metrics coordination events
    this.infrastructureServices.eventCoordinator.on('kanban:requestFlowMetrics,async (data) => {
      try {
        const allTasks = await this.infrastructureServices.persistenceCoordinator.loadAllTasks();
        if (allTasks.success && allTasks.data) {
          const flowMetrics = await this.domainServices.flowAnalysis.calculateFlowMetrics(allTasks.data);
          
          const flowResponse = {
            requestId: data.requestId,
            flowMetrics,
            timestamp: new Date(),
          };
          EventLogger.log('kanban:flowMetricsResponse,flowResponse');
          await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:flowMetricsResponse,flowResponse');
        }
      } catch (error) {
        logger.error('Failed to handle flow metrics request:,error');
      }
    });

    // Health check coordination events
    this.infrastructureServices.eventCoordinator.on('kanban:requestHealthCheck,async (data) => {
      try {
        const allTasks = await this.infrastructureServices.persistenceCoordinator.loadAllTasks();
        if (allTasks.success && allTasks.data) {
          const wipLimits = await this.domainServices.wipManagement.getWIPLimits();
          const bottlenecks = await this.domainServices.bottleneckDetection.detectBottlenecks(allTasks.data, wipLimits);
          const flowMetrics = await this.domainServices.flowAnalysis.calculateFlowMetrics(allTasks.data);
          const health = await this.domainServices.healthMonitoring.performHealthCheck(allTasks.data, bottlenecks, flowMetrics);
          
          const healthResponse = {
            requestId: data.requestId,
            healthCheck: health,
            timestamp: new Date(),
          };
          EventLogger.log('kanban:healthCheckResponse,healthResponse');
          await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:healthCheckResponse,healthResponse');
        }
      } catch (error) {
        logger.error('Failed to handle health check request:,error');
      }
    });

    logger.info('Workflow event handlers setup complete'');
  }

  /**
   * Start background bottleneck monitoring
   */
  private startBottleneckMonitoring(): void {
    setInterval(async () => {
      try {
        const allTasks = await this.infrastructureServices.persistenceCoordinator.loadAllTasks();
        if (allTasks.success && allTasks.data) {
          const wipLimits = await this.domainServices.wipManagement.getWIPLimits();
          const bottlenecks = await this.domainServices.bottleneckDetection.detectBottlenecks(allTasks.data, wipLimits);
          
          if (bottlenecks.bottlenecks.length > 0) {
            EventLogger.log('bottleneck:detected,bottlenecks');
            await this.infrastructureServices.eventCoordinator.emitEventSafe('bottleneck:detected,bottlenecks');
          }
        }
      } catch (error) {
        logger.error('Bottleneck monitoring failed:,error');
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Start background health monitoring  
   */
  private startHealthMonitoring(): void {
    setInterval(async () => {
      try {
        const allTasks = await this.infrastructureServices.persistenceCoordinator.loadAllTasks();
        if (allTasks.success && allTasks.data) {
          const wipLimits = await this.domainServices.wipManagement.getWIPLimits();
          const bottlenecks = await this.domainServices.bottleneckDetection.detectBottlenecks(allTasks.data, wipLimits);
          const flowMetrics = await this.domainServices.flowAnalysis.calculateFlowMetrics(allTasks.data);
          const health = await this.domainServices.healthMonitoring.performHealthCheck(allTasks.data, bottlenecks, flowMetrics);
          
          EventLogger.log('kanban:health:status,health');
          await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:health:status,health');
        }
      } catch (error) {
        logger.error('Health monitoring failed:,error');
      }
    }, 60000); // Check every minute
  }

  /**
   * Start background WIP monitoring for workflow coordination
   */
  private startWIPMonitoring(): void {
    setInterval(async () => {
      try {
        const allTasks = await this.infrastructureServices.persistenceCoordinator.loadAllTasks();
        if (allTasks.success && allTasks.data) {
          const wipLimits = await this.domainServices.wipManagement.getWIPLimits();
          const currentWIP = await this.domainServices.wipManagement.calculateCurrentWIP(allTasks.data);
          
          // Emit WIP status for workflow coordination
          const wipStatusPayload = {
            wipLimits,
            currentWIP,
            timestamp: new Date(),
          };
          EventLogger.log('kanban:wip:status,wipStatusPayload');
          await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:wip:status,wipStatusPayload');

          // Check for WIP violations and coordinate workflow adjustments
          const violations = await this.domainServices.wipManagement.checkWIPViolations(allTasks.data, wipLimits);
          if (violations.length > 0) {
            const violationsPayload = {
              violations,
              timestamp: new Date(),
            };
            EventLogger.log('kanban:wip:violations,violationsPayload');
            await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:wip:violations,violationsPayload');
          }
        }
      } catch (error) {
        logger.error('WIP monitoring failed:,error');
      }
    }, 45000); // Check every 45 seconds for workflow coordination
  }

  /**
   * Start background flow metrics tracking for workflow optimization
   */
  private startFlowMetricsTracking(): void {
    setInterval(async () => {
      try {
        const allTasks = await this.infrastructureServices.persistenceCoordinator.loadAllTasks();
        if (allTasks.success && allTasks.data) {
          const flowMetrics = await this.domainServices.flowAnalysis.calculateFlowMetrics(allTasks.data);
          
          // Emit flow metrics for workflow optimization
          const flowMetricsPayload = {
            flowMetrics,
            timestamp: new Date(),
          };
          EventLogger.log('kanban:flow:metrics,flowMetricsPayload');
          await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:flow:metrics,flowMetricsPayload');

          // Analyze flow efficiency and emit optimization suggestions
          const statistics = await this.domainServices.flowAnalysis.calculateWorkflowStatistics(allTasks.data);
          const statisticsPayload = {
            statistics,
            timestamp: new Date(),
          };
          EventLogger.log('kanban:flow:statistics,statisticsPayload');
          await this.infrastructureServices.eventCoordinator.emitEventSafe('kanban:flow:statistics,statisticsPayload');
        }
      } catch (error) {
        logger.error('Flow metrics tracking failed:,error');
      }
    }, 90000); // Check every 90 seconds for flow analysis
  }







  /**
   * Get system health status
   */
  getSystemHealth(): {
    kanban: boolean;
    services: ReturnType<InfrastructureServicesFactory['getHealthStatus']>';
  } {
    if (!this.initialized) {
      return {
        kanban: false,
        services: {
          eventCoordinator: false,
          stateMachineCoordinator: false,
          performanceTracker: false,
          persistenceCoordinator: false,
          overall: false,
        },
      };
    }

    return {
      kanban: this.initialized,
      services: this.infrastructureFactory.getHealthStatus(),
    };
  }

  /**
   * Shutdown the kanban workflow system
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      logger.info('Shutting down KanbanEngine'');

      // Shutdown services in proper order
      await this.infrastructureFactory.shutdownAllServices();
      this.domainFactory.resetAllServices();

      this.initialized = false;
      logger.info('KanbanEngine shutdown complete'');

    } catch (error) {
      logger.error('Error during KanbanEngine shutdown:,error');
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('KanbanEngine not initialized. Call initialize() first.'');
    }
  }
}

// Export the kanban engine as the default workflow kanban implementation
export { KanbanEngine as WorkflowKanban };