/**
 * @file Workflow Event Factory - Main Factory Class
 *
 * Core factory class for creating workflow event managers.
 */

import type { Config, Logger } from '@claude-zen/foundation';
import { EventEmitter, type EventMap } from '@claude-zen/foundation';
import type {
  EventManager,
  EventManagerConfig,
  EventManagerFactory,
} from '../../core/interfaces';
import { createWorkflowEventManager } from '../workflow-event-manager';
import type {
  WorkflowEventFactoryConfig,
  WorkflowFactoryMetrics,
  WorkflowHealthResult,
} from './types';
import { WorkflowFactoryHelpers } from './helpers';

/**
 * Workflow Event Factory implementation.
 *
 * Factory for creating and managing workflow event manager instances
 * with comprehensive lifecycle management and workflow orchestration.
 */
export class WorkflowEventFactory
  extends EventEmitter<EventMap>
  implements EventManagerFactory<EventManagerConfig>
{
  private readonly logger: Logger;
  private readonly instances = new Map<string, EventManager>();
  private readonly startTime = new Date();
  private totalCreated = 0;
  private totalErrors = 0;
  private workflowMetrics = {
    totalWorkflows: 0,
    completedWorkflows: 0,
    failedWorkflows: 0,
    averageExecutionTime: 5000, // Default 5 seconds
  };

  constructor(
    private readonly factoryConfig: WorkflowEventFactoryConfig = {},
    logger?: Logger,
    private readonly systemConfig?: Config
  ) {
    super();
    this.logger = logger || (console as any);
    this.logger.info('Workflow Event Factory initialized');

    // Start workflow monitoring if enabled
    if (this.factoryConfig.enableMonitoring !== false) {
      this.startWorkflowMonitoring();
    }
  }

  /**
   * Create a new workflow event manager instance.
   */
  async create(config: EventManagerConfig): Promise<EventManager> {
    const startTime = Date.now();

    try {
      this.logger.info(`Creating workflow event manager: ${config?.name}`);

      // Validate configuration
      WorkflowFactoryHelpers.validateConfig(config);

      // Apply workflow-optimized defaults
      const optimizedConfig = WorkflowFactoryHelpers.createDefaultConfig(
        config?.name,
        config
      );

      // Optimize workflow parameters based on current performance
      const successRate = WorkflowFactoryHelpers.calculateWorkflowSuccessRate(
        this.workflowMetrics.completedWorkflows,
        this.workflowMetrics.failedWorkflows
      );

      if (successRate > 0) {
        const optimizedParams =
          WorkflowFactoryHelpers.optimizeWorkflowParameters({
            successRate,
            averageExecutionTime: this.workflowMetrics.averageExecutionTime,
            errorRate: this.totalErrors / Math.max(this.totalCreated, 1)
          });

        optimizedConfig.processing = {
          ...optimizedConfig.processing,
          queueSize: optimizedParams.queueSize || 3000,
          batchSize: optimizedParams.batchSize || 20,
          throttleMs: optimizedParams.throttleMs || 750,
        };
      }

      // Create manager instance
      const manager = await createWorkflowEventManager(optimizedConfig);

      // Store in registry
      this.instances.set(config?.name, manager);
      this.totalCreated++;

      this.emit('instance:created', {
        name: config?.name,
        config: optimizedConfig,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });

      this.logger.info(
        `Workflow event manager created successfully: ${config?.name}`
      );
      return manager;
    } catch (error) {
      this.totalErrors++;
      this.emit('instance:error', {
        name: config?.name,
        error,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });

      this.logger.error(
        `Failed to create workflow event manager: ${config?.name}`,
        error
      );
      throw error;
    }
  }

  /**
   * Create multiple workflow event managers.
   */
  async createMultiple(configs: EventManagerConfig[]): Promise<EventManager[]> {
    const results: EventManager[] = [];
    const errors: Array<{ name: string; error: Error }> = [];

    for (const config of configs) {
      try {
        const manager = await this.create(config);
        results.push(manager);
      } catch (error) {
        errors.push({ name: config.name, error: error as Error });
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`Failed to create ${errors.length} workflow event managers:`, errors);
    }

    return results;
  }

  /**
   * Get an existing workflow event manager instance.
   */
  get(name: string): EventManager | undefined {
    return this.instances.get(name);
  }

  /**
   * List all workflow event manager instances.
   */
  list(): EventManager[] {
    return Array.from(this.instances.values());
  }

  /**
   * Check if a workflow event manager instance exists.
   */
  has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Remove and destroy a workflow event manager instance.
   */
  async remove(name: string): Promise<boolean> {
    const manager = this.instances.get(name);
    if (!manager) {
      return false;
    }

    try {
      await manager.destroy();
      this.instances.delete(name);

      this.emit('instance:removed', {
        name,
        timestamp: new Date(),
      });

      this.logger.info(`Workflow event manager removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to remove workflow event manager ${name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get factory metrics including workflow performance.
   */
  async getFactoryMetrics(): Promise<WorkflowFactoryMetrics> {
    const runningInstances = (
      await Promise.all(
        Array.from(this.instances.values()).map(async (manager) => {
          try {
            return manager.isRunning() ? 1 : 0;
          } catch {
            return 0;
          }
        })
      )
    ).reduce((sum: number, val: number) => sum + val, 0);

    const baseMetrics = WorkflowFactoryHelpers.calculateMetrics(
      this.totalCreated,
      this.totalErrors,
      this.instances.size,
      runningInstances,
      this.startTime
    );

    return {
      ...baseMetrics,
      workflowMetrics: this.workflowMetrics,
    };
  }

  /**
   * Perform health check on the factory and all instances.
   */
  async healthCheck(): Promise<WorkflowHealthResult> {
    const metrics = await this.getFactoryMetrics();

    const instanceHealth = await Promise.all(
      Array.from(this.instances.entries()).map(async ([name, manager]) => {
        try {
          const status = await manager.healthCheck();
          return {
            name,
            status: status.status || 'unknown',
            activeWorkflows: 0, // This would come from actual workflow tracking
            lastCheck: status.lastCheck || new Date(),
          };
        } catch {
          return {
            name,
            status: 'unhealthy',
            activeWorkflows: 0,
            lastCheck: new Date(),
          };
        }
      })
    );

    const status = this.determineOverallHealth(metrics, instanceHealth);
    const workflowSuccessRate =
      WorkflowFactoryHelpers.calculateWorkflowSuccessRate(
        this.workflowMetrics.completedWorkflows,
        this.workflowMetrics.failedWorkflows
      );

    return {
      status,
      activeInstances: metrics.activeInstances,
      runningInstances: metrics.runningInstances,
      errorRate: metrics.errorRate,
      workflowSuccessRate,
      uptime: metrics.uptime,
      timestamp: new Date(),
      details: {
        factoryHealth: `Factory is ${status}`,
        workflowHealth: `Success rate: ${(workflowSuccessRate * 100).toFixed(1)}%`,
        instanceHealth: instanceHealth.map(h => ({
          ...h,
          status: h.status || 'unknown',
          lastCheck: h.lastCheck || new Date()
        })),
      },
    };
  }

  /**
   * Update workflow metrics from execution results.
   */
  updateWorkflowMetrics(metrics: Partial<typeof this.workflowMetrics>): void {
    this.workflowMetrics = { ...this.workflowMetrics, ...metrics };

    this.emit('workflow:metrics:updated', {
      metrics: this.workflowMetrics,
      timestamp: new Date(),
    });
  }

  /**
   * Shutdown the factory and all managed instances.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Workflow Event Factory');

    try {
      // Shutdown all instances
      const shutdownPromises = Array.from(this.instances.entries()).map(
        async ([name, manager]) => {
          try {
            await manager.destroy();
            this.logger.debug(`Shutdown workflow event manager: ${name}`);
          } catch (error) {
            this.logger.error(`Failed to shutdown manager ${name}:`, error);
          }
        }
      );

      await Promise.allSettled(shutdownPromises);
      this.instances.clear();

      this.emit('factory:shutdown', {
        timestamp: new Date(),
      });

      this.logger.info('Workflow Event Factory shutdown complete');
    } catch (error) {
      this.logger.error('Error during factory shutdown:', error);
      throw error;
    }
  }

  /**
   * Get the number of active instances.
   */
  getActiveCount(): number {
    return this.instances.size;
  }

  private startWorkflowMonitoring(): void {
    const interval = this.factoryConfig.healthCheckInterval || 30000;

    setInterval(() => {
      const successRate = WorkflowFactoryHelpers.calculateWorkflowSuccessRate(
        this.workflowMetrics.completedWorkflows,
        this.workflowMetrics.failedWorkflows
      );

      if (successRate < 0.8) {
        this.logger.warn(
          'Workflow success rate is low, considering optimization'
        );
      }

      // Emit workflow performance metrics
      this.emit('workflow:performance', {
        successRate,
        averageExecutionTime: this.workflowMetrics.averageExecutionTime,
        totalWorkflows: this.workflowMetrics.totalWorkflows,
        timestamp: new Date(),
      });
    }, interval);
  }

  private determineOverallHealth(
    metrics: WorkflowFactoryMetrics,
    instanceHealth: Array<{
      name: string;
      status: string;
      activeWorkflows: number;
      lastCheck: Date;
    }>
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // Check factory-level health
    if (metrics.errorRate > 0.5) return 'unhealthy';
    if (metrics.errorRate > 0.1) return 'degraded';

    // Check workflow success rate
    const successRate = WorkflowFactoryHelpers.calculateWorkflowSuccessRate(
      metrics.workflowMetrics.completedWorkflows,
      metrics.workflowMetrics.failedWorkflows
    );

    if (successRate < 0.5) return 'unhealthy';
    if (successRate < 0.8) return 'degraded';

    // Check average execution time
    if (metrics.workflowMetrics.averageExecutionTime > 30000) return 'degraded';
    if (metrics.workflowMetrics.averageExecutionTime > 60000)
      return 'unhealthy';

    // Check instance health
    const unhealthyCount = instanceHealth.filter(
      (h) => h.status === 'unhealthy'
    ).length;
    const degradedCount = instanceHealth.filter(
      (h) => h.status === 'degraded'
    ).length;
    const totalInstances = instanceHealth.length;

    if (totalInstances === 0) return 'healthy';

    const unhealthyRatio = unhealthyCount / totalInstances;
    const degradedRatio = (unhealthyCount + degradedCount) / totalInstances;

    if (unhealthyRatio > 0.5) return 'unhealthy';
    if (degradedRatio > 0.3) return 'degraded';

    return 'healthy';
  }
}
