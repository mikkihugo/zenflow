/**
 * @file Neural Event Factory - Main Factory Class
 * 
 * Core factory class for creating neural event managers.
 */

import type { Config, Logger } from '@claude-zen/foundation';
import { TypedEventBase } from '@claude-zen/foundation';
import type { EventManager, EventManagerConfig, EventManagerFactory } from '../../core/interfaces';
import { createNeuralEventManager } from '../neural-event-manager';
import type { 
  NeuralEventFactoryConfig, 
  NeuralFactoryMetrics, 
  NeuralHealthResult 
} from './types';
import { NeuralFactoryHelpers } from './helpers';

/**
 * Neural Event Factory implementation.
 * 
 * Factory for creating and managing neural event manager instances
 * with comprehensive lifecycle management and neural model optimization.
 */
export class NeuralEventFactory extends TypedEventBase implements EventManagerFactory<EventManagerConfig> {
  private readonly logger: Logger;
  private readonly instances = new Map<string, EventManager>();
  private readonly startTime = new Date();
  private totalCreated = 0;
  private totalErrors = 0;
  private neuralMetrics = {
    totalInferences: 0,
    averageInferenceTime: 0,
    modelAccuracy: 0.75, // Default starting accuracy
    learningProgress: 0,
  };

  constructor(
    private readonly config: NeuralEventFactoryConfig = {},
    logger?: Logger,
    private readonly systemConfig?: Config
  ) {
    super();
    this.logger = logger || console as any;
    this.logger.info('Neural Event Factory initialized');
    
    // Start neural performance monitoring if enabled
    if (this.config.enableMonitoring !== false) {
      this.startNeuralMonitoring();
    }
  }

  /**
   * Create a new neural event manager instance.
   */
  async create(config: EventManagerConfig): Promise<EventManager> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Creating neural event manager: ${config?.name}`);
      
      // Validate configuration
      NeuralFactoryHelpers.validateConfig(config);
      
      // Apply neural-optimized defaults
      const optimizedConfig = NeuralFactoryHelpers.createDefaultConfig(config?.name, config);
      
      // Optimize neural parameters based on current performance
      if (this.neuralMetrics.modelAccuracy > 0) {
        const optimizedParams = NeuralFactoryHelpers.optimizeParameters(
          this.neuralMetrics.modelAccuracy,
          this.neuralMetrics.averageInferenceTime
        );
        
        optimizedConfig.processing = {
          ...optimizedConfig.processing,
          batchSize: optimizedParams.batchSize,
          timeout: optimizedParams.timeout,
        };
      }
      
      // Create manager instance
      const manager = await createNeuralEventManager(optimizedConfig);
      
      // Store in registry
      this.instances.set(config?.name, manager);
      this.totalCreated++;
      
      this.emit('instance:created', {
        name: config?.name,
        config: optimizedConfig,
        duration: Date.now() - startTime,
        timestamp: new Date()
      });
      
      this.logger.info(`Neural event manager created successfully: ${config?.name}`);
      return manager;
    } catch (error) {
      this.totalErrors++;
      this.emit('instance:error', {
        name: config?.name,
        error,
        duration: Date.now() - startTime,
        timestamp: new Date()
      });
      
      this.logger.error(`Failed to create neural event manager: ${config?.name}`, error);
      throw error;
    }
  }

  /**
   * Get an existing neural event manager instance.
   */
  get(name: string): EventManager | undefined {
    return this.instances.get(name);
  }

  /**
   * List all neural event manager instances.
   */
  list(): EventManager[] {
    return Array.from(this.instances.values());
  }

  /**
   * Check if a neural event manager instance exists.
   */
  has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Remove and destroy a neural event manager instance.
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
        timestamp: new Date()
      });
      
      this.logger.info(`Neural event manager removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove neural event manager ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get factory metrics including neural performance.
   */
  async getMetrics(): Promise<NeuralFactoryMetrics> {
    const runningInstances = (await Promise.all(
      Array.from(this.instances.values()).map(async (manager) => {
        try {
          return manager.isRunning() ? 1 : 0;
        } catch {
          return 0;
        }
      })
    )).reduce((sum, val) => sum + val, 0);

    return NeuralFactoryHelpers.calculateMetrics(
      this.totalCreated,
      this.totalErrors,
      this.instances.size,
      runningInstances,
      this.startTime,
      this.neuralMetrics
    );
  }

  /**
   * Perform health check on the factory and all instances.
   */
  async healthCheck(): Promise<NeuralHealthResult> {
    const metrics = await this.getMetrics();
    
    const instanceHealth = await Promise.all(
      Array.from(this.instances.entries()).map(async ([name, manager]) => {
        try {
          const status = await manager.healthCheck();
          return {
            name,
            status: status.status,
            modelAccuracy: this.neuralMetrics.modelAccuracy,
            lastCheck: status.lastCheck
          };
        } catch {
          return {
            name,
            status: 'unhealthy',
            modelAccuracy: 0,
            lastCheck: new Date()
          };
        }
      })
    );

    const status = this.determineOverallHealth(metrics, instanceHealth);
    const modelPerformance = this.neuralMetrics.modelAccuracy;
    
    return {
      status,
      activeInstances: metrics.activeInstances,
      runningInstances: metrics.runningInstances,
      errorRate: metrics.errorRate,
      modelPerformance,
      uptime: metrics.uptime,
      timestamp: new Date(),
      details: {
        factoryHealth: `Factory is ${status}`,
        modelHealth: `Model accuracy: ${(modelPerformance * 100).toFixed(1)}%`,
        instanceHealth
      }
    };
  }

  /**
   * Update neural metrics from training/inference results.
   */
  updateNeuralMetrics(metrics: Partial<typeof this.neuralMetrics>): void {
    this.neuralMetrics = { ...this.neuralMetrics, ...metrics };
    
    this.emit('neural:metrics:updated', {
      metrics: this.neuralMetrics,
      timestamp: new Date()
    });
  }

  /**
   * Shutdown the factory and all managed instances.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Neural Event Factory');
    
    try {
      // Shutdown all instances
      const shutdownPromises = Array.from(this.instances.entries()).map(
        async ([name, manager]) => {
          try {
            await manager.destroy();
            this.logger.debug(`Shutdown neural event manager: ${name}`);
          } catch (error) {
            this.logger.error(`Failed to shutdown manager ${name}:`, error);
          }
        }
      );
      
      await Promise.allSettled(shutdownPromises);
      this.instances.clear();
      
      this.emit('factory:shutdown', {
        timestamp: new Date()
      });
      
      this.logger.info('Neural Event Factory shutdown complete');
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

  private startNeuralMonitoring(): void {
    const interval = this.config.healthCheckInterval || 30000;
    
    setInterval(() => {
      // Simulate neural metrics updates (in real implementation, this would come from actual neural processing)
      const performanceEval = NeuralFactoryHelpers.evaluateModelPerformance(
        this.neuralMetrics.modelAccuracy,
        this.neuralMetrics.averageInferenceTime
      );
      
      if (performanceEval === 'poor') {
        this.logger.warn('Neural model performance is poor, considering optimization');
      }
      
      // Emit performance metrics
      this.emit('neural:performance', {
        accuracy: this.neuralMetrics.modelAccuracy,
        inferenceTime: this.neuralMetrics.averageInferenceTime,
        evaluation: performanceEval,
        timestamp: new Date()
      });
    }, interval);
  }

  private determineOverallHealth(
    metrics: NeuralFactoryMetrics, 
    instanceHealth: Array<{ name: string; status: string; modelAccuracy: number; lastCheck: Date }>
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // Check factory-level health
    if (metrics.errorRate > 0.5) return 'unhealthy';
    if (metrics.errorRate > 0.1) return 'degraded';
    
    // Check neural model health
    if (metrics.neuralMetrics.modelAccuracy < 0.5) return 'unhealthy';
    if (metrics.neuralMetrics.modelAccuracy < 0.7) return 'degraded';
    
    // Check inference performance
    if (metrics.neuralMetrics.averageInferenceTime > 2000) return 'degraded';
    if (metrics.neuralMetrics.averageInferenceTime > 5000) return 'unhealthy';
    
    // Check instance health
    const unhealthyCount = instanceHealth.filter(h => h.status === 'unhealthy').length;
    const degradedCount = instanceHealth.filter(h => h.status === 'degraded').length;
    const totalInstances = instanceHealth.length;
    
    if (totalInstances === 0) return 'healthy';
    
    const unhealthyRatio = unhealthyCount / totalInstances;
    const degradedRatio = (unhealthyCount + degradedCount) / totalInstances;
    
    if (unhealthyRatio > 0.5) return 'unhealthy';
    if (degradedRatio > 0.3) return 'degraded';
    
    return 'healthy';
  }
}