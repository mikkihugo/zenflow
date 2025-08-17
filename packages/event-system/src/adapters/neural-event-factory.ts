/**
 * @fileoverview Neural Event Manager Factory Implementation
 *
 * Factory for creating neural event managers that handle AI/ML operations,
 * model training, inference requests, and neural network lifecycle events.
 * Provides specialized event management for machine learning workflows.
 *
 * ## Features
 *
 * - **Training Events**: Model training progress, checkpoints, completion
 * - **Inference Events**: Prediction requests, batch processing, results
 * - **Model Lifecycle**: Loading, optimization, versioning, deployment
 * - **Performance Monitoring**: Training metrics, inference latency, accuracy
 * - **Resource Management**: GPU utilization, memory usage, compute allocation
 *
 * ## Event Types Handled
 *
 * - `neural:training` - Model training and optimization events
 * - `neural:inference` - Prediction and inference request events
 * - `neural:model` - Model lifecycle and management events
 * - `neural:performance` - Performance metrics and monitoring events
 * - `neural:resource` - Compute resource allocation and usage events
 *
 * @example
 * ```typescript
 * const factory = new NeuralEventManagerFactory(logger, config);
 * const manager = await factory.create({
 *   name: 'ai-neural',
 *   type: 'neural',
 *   maxListeners: 200,
 *   processing: {
 *     strategy: 'queued',
 *     batchSize: 50
 *   }
 * });
 *
 * // Subscribe to training events
 * manager.subscribeTrainingEvents((event) => {
 *   console.log(`Training progress: ${event.details.epoch}/${event.details.totalEpochs}`);
 * });
 *
 * // Emit neural event
 * await manager.emitNeuralEvent({
 *   id: 'train-001',
 *   timestamp: new Date(),
 *   source: 'training-engine',
 *   type: 'neural:training',
 *   operation: 'epoch-complete',
 *   modelId: 'gpt-classifier-v1',
 *   data: {
 *     epoch: 5,
 *     totalEpochs: 100,
 *     loss: 0.234,
 *     accuracy: 0.876
 *   }
 * });
 * ```
 *
 * @author Claude Code Zen Team
 * @version 1.0.0-alpha.43
 * @since 1.0.0
 */

import type {
  SharedConfig,
  Logger,
} from '@claude-zen/foundation';
import { BaseEventManager } from '../core/base-event-manager';
import type {
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventManager,
  EventManagerFactory,
  EventManagerType,
  SystemEvent,
} from '../core/interfaces';
import type { NeuralEvent } from '../types';

/**
 * Neural Event Manager implementation for AI/ML operations.
 *
 * Specialized event manager for handling machine learning and neural network
 * events including training, inference, model management, and performance
 * monitoring. Optimized for high-throughput ML workloads.
 *
 * ## Operation Types
 *
 * - **Training Operations**: Model training, validation, checkpointing
 * - **Inference Operations**: Prediction, batch processing, real-time inference
 * - **Model Operations**: Loading, saving, optimization, deployment
 * - **Resource Operations**: GPU allocation, memory management, scaling
 *
 * ## Performance Features
 *
 * - **Batch Processing**: Efficient handling of training/inference batches
 * - **Async Operations**: Non-blocking ML operations with progress tracking
 * - **Resource Monitoring**: GPU/CPU utilization and memory tracking
 * - **Model Metrics**: Training loss, accuracy, validation scores
 */
class NeuralEventManager
  extends BaseEventManager
  implements EventManager
{
  private neuralMetrics = {
    trainingJobs: 0,
    inferenceRequests: 0,
    modelsLoaded: 0,
    totalTrainingTime: 0,
    totalInferenceTime: 0,
    averageAccuracy: 0,
    errorCount: 0,
    activeModels: new Set<string>(),
    resourceUsage: {
      gpuUtilization: 0,
      memoryUsage: 0,
      computeHours: 0,
    },
  };

  private subscriptions = {
    training: new Map<string, (event: NeuralEvent) => void>(),
    inference: new Map<string, (event: NeuralEvent) => void>(),
    model: new Map<string, (event: NeuralEvent) => void>(),
    performance: new Map<string, (event: NeuralEvent) => void>(),
    resource: new Map<string, (event: NeuralEvent) => void>(),
  };

  private loadedModels = new Set<string>();
  private processingStats = {
    batchesProcessed: 0,
    totalSamples: 0,
  };

  constructor(config: EventManagerConfig, logger: Logger) {
    super(config, logger);
    this.initializeNeuralHandlers();
  }

  /** Override type property to be neural type */
  public readonly type: EventManagerType = 'neural' as EventManagerType;

  /**
   * Emit neural-specific event with ML context.
   */
  async emitNeuralEvent(event: NeuralEvent): Promise<void> {
    try {
      // Update neural metrics
      this.updateNeuralMetrics(event);

      // Add neural-specific metadata
      const enrichedEvent = {
        ...event,
        metadata: {
          ...event.metadata,
          timestamp: new Date(),
          processingTime: Date.now(),
          modelVersion: (event.details as any)?.modelVersion || 'unknown',
          computeResource: (event.details as any)?.computeResource || 'cpu',
        },
      };

      // Emit through base manager
      await this.emit(enrichedEvent);

      // Route to specific neural handlers
      await this.routeNeuralEvent(enrichedEvent);

      this.logger.debug(
        `Neural event emitted: ${event.operation} for model ${event.modelId}`
      );
    } catch (error) {
      this.neuralMetrics.errorCount++;
      this.logger.error('Failed to emit neural event:', error);
      throw error;
    }
  }

  /**
   * Subscribe to training events.
   */
  subscribeTrainingEvents(listener: (event: NeuralEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.training.set(subscriptionId, listener);

    this.logger.debug(`Training event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to inference events.
   */
  subscribeInferenceEvents(listener: (event: NeuralEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.inference.set(subscriptionId, listener);

    this.logger.debug(
      `Inference event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to model lifecycle events.
   */
  subscribeModelEvents(listener: (event: NeuralEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.model.set(subscriptionId, listener);

    this.logger.debug(`Model event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to performance monitoring events.
   */
  subscribePerformanceEvents(listener: (event: NeuralEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.performance.set(subscriptionId, listener);

    this.logger.debug(
      `Performance event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to resource management events.
   */
  subscribeResourceEvents(listener: (event: NeuralEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.resource.set(subscriptionId, listener);

    this.logger.debug(`Resource event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Get neural-specific metrics and ML performance data.
   */
  async getNeuralMetrics(): Promise<{
    activeModels: number;
    trainingJobs: number;
    inferenceRequests: number;
    averageAccuracy: number;
    resourceUtilization: {
      gpu: number;
      memory: number;
      computeHours: number;
    };
    performance: {
      trainingTime: number;
      inferenceTime: number;
      errorRate: number;
    };
  }> {
    const totalOperations =
      this.neuralMetrics.trainingJobs + this.neuralMetrics.inferenceRequests;
    const errorRate =
      totalOperations > 0 ? this.neuralMetrics.errorCount / totalOperations : 0;

    return {
      activeModels: this.neuralMetrics.activeModels.size,
      trainingJobs: this.neuralMetrics.trainingJobs,
      inferenceRequests: this.neuralMetrics.inferenceRequests,
      averageAccuracy: this.neuralMetrics.averageAccuracy,
      resourceUtilization: {
        gpu: this.neuralMetrics.resourceUsage.gpuUtilization,
        memory: this.neuralMetrics.resourceUsage.memoryUsage,
        computeHours: this.neuralMetrics.resourceUsage.computeHours,
      },
      performance: {
        trainingTime: this.neuralMetrics.totalTrainingTime,
        inferenceTime: this.neuralMetrics.totalInferenceTime,
        errorRate,
      },
    };
  }

  /**
   * Get comprehensive event manager metrics.
   */
  async getMetrics(): Promise<EventManagerMetrics> {
    const baseMetrics = await super.getMetrics();
    const neuralMetrics = await this.getNeuralMetrics();

    return {
      ...baseMetrics,
      neural: neuralMetrics, // Add neural metrics as top-level property
    } as any; // Type assertion for extended metrics
  }

  /**
   * Health check with neural-specific validation.
   */
  async healthCheck(): Promise<EventManagerStatus> {
    const baseStatus = await super.healthCheck();
    const neuralMetrics = await this.getNeuralMetrics();

    // Neural-specific health checks
    const highErrorRate = neuralMetrics.performance.errorRate > 0.05; // 5% error threshold
    const lowAccuracy = neuralMetrics.averageAccuracy < 0.5; // 50% accuracy threshold
    const highResourceUsage = neuralMetrics.resourceUtilization.gpu > 0.95; // 95% GPU usage

    const isHealthy =
      baseStatus.status === 'healthy' &&
      !highErrorRate &&
      !lowAccuracy &&
      !highResourceUsage;

    return {
      ...baseStatus,
      status: isHealthy ? 'healthy' : 'degraded',
      metadata: {
        ...baseStatus.metadata,
        neural: {
          activeModels: neuralMetrics.activeModels,
          averageAccuracy: neuralMetrics.averageAccuracy,
          errorRate: neuralMetrics.performance.errorRate,
          resourceUtilization: neuralMetrics.resourceUtilization,
        },
      },
    };
  }

  /**
   * Private helper methods.
   */

  private initializeNeuralHandlers(): void {
    this.logger.debug('Initializing neural event handlers');

    // Set up event type routing
    this.subscribe(
      [
        'neural:training',
        'neural:inference',
        'neural:model',
        'neural:performance',
        'neural:resource',
      ],
      this.handleNeuralEvent.bind(this)
    );
  }

  private async handleNeuralEvent(event: SystemEvent): Promise<void> {
    const neuralEvent = event as NeuralEvent;
    const startTime = Date.now();

    try {
      // Route based on operation type
      const operationType = neuralEvent.type.split(':')[1];

      switch (operationType) {
        case 'training':
          await this.notifyNeuralSubscribers(this.subscriptions.training, neuralEvent);
          break;
        case 'inference':
          await this.notifyNeuralSubscribers(this.subscriptions.inference, neuralEvent);
          break;
        case 'optimization':
          await this.notifyNeuralSubscribers(this.subscriptions.model, neuralEvent);
          break;
        case 'evaluation':
          await this.notifyNeuralSubscribers(this.subscriptions.performance, neuralEvent);
          break;
        default:
          this.logger.warn(`Unknown neural operation type: ${operationType}`);
      }

      // Track processing time
      const processingTime = Date.now() - startTime;
      if (operationType === 'training') {
        this.neuralMetrics.totalTrainingTime += processingTime;
      } else if (operationType === 'inference') {
        this.neuralMetrics.totalInferenceTime += processingTime;
      }
    } catch (error) {
      this.neuralMetrics.errorCount++;
      this.logger.error('Neural event handling failed:', error);
      throw error;
    }
  }

  private async routeNeuralEvent(event: NeuralEvent): Promise<void> {
    // Track active models
    if (event.modelId) {
      this.neuralMetrics.activeModels.add(event.modelId);
    }

    // Handle special neural operations
    switch (event.operation) {
      case 'train':
        this.logger.info(`Training started for model: ${event.modelId}`);
        if (event.details?.accuracy !== undefined) {
          this.updateAverageAccuracy(event.details.accuracy);
        }
        break;
      case 'evaluate':
        this.logger.info(`Evaluation completed for model: ${event.modelId}`);
        break;
      case 'load':
        this.neuralMetrics.modelsLoaded++;
        this.loadedModels.add(event.modelId);
        this.logger.info(`Model loaded: ${event.modelId}`);
        break;
      case 'save':
        this.logger.info(`Model saved: ${event.modelId}`);
        break;
      case 'predict':
        this.logger.debug(
          `Inference completed for model: ${event.modelId}`
        );
        this.processingStats.batchesProcessed += event.details?.batchSize || 1;
        break;
      case 'optimize':
        this.logger.info(`Optimization completed for model: ${event.modelId}`);
        break;
      case 'export':
        this.logger.info(`Model exported: ${event.modelId}`);
        break;
    }
  }

  private updateNeuralMetrics(event: NeuralEvent): void {
    const operationType = event.type.split(':')[1];

    switch (operationType) {
      case 'training':
        this.neuralMetrics.trainingJobs++;
        break;
      case 'inference':
        this.neuralMetrics.inferenceRequests++;
        break;
    }

    // Update resource usage if provided
    if ((event.details as any)?.resourceUsage) {
      this.neuralMetrics.resourceUsage = {
        ...this.neuralMetrics.resourceUsage,
        ...(event.details as any).resourceUsage,
      };
    }
  }

  private updateAverageAccuracy(newAccuracy: number): void {
    if (this.neuralMetrics.trainingJobs === 0) {
      this.neuralMetrics.averageAccuracy = newAccuracy;
    } else {
      // Running average calculation
      const totalWeight = this.neuralMetrics.trainingJobs;
      this.neuralMetrics.averageAccuracy =
        (this.neuralMetrics.averageAccuracy * (totalWeight - 1) + newAccuracy) /
        totalWeight;
    }
  }

  private async notifyNeuralSubscribers(
    subscribers: Map<string, (event: NeuralEvent) => void>,
    event: NeuralEvent
  ): Promise<void> {
    const notifications = Array.from(subscribers.values()).map(
      async (listener) => {
        try {
          await listener(event);
        } catch (error) {
          this.logger.error('Neural event listener failed:', error);
        }
      }
    );

    await Promise.allSettled(notifications);
  }

  protected generateSubscriptionId(): string {
    return `neural-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Factory for creating NeuralEventManager instances.
 *
 * Provides configuration management and instance creation for neural
 * event managers with optimized settings for ML workloads and
 * high-throughput neural network operations.
 *
 * ## Configuration Options
 *
 * - **Batch Processing**: Efficient handling of training/inference batches
 * - **Resource Monitoring**: GPU and memory usage tracking
 * - **Performance Analytics**: Training metrics and model performance
 * - **Error Recovery**: Robust handling of ML operation failures
 *
 * @example
 * ```typescript
 * const factory = new NeuralEventManagerFactory(logger, config);
 *
 * const trainingManager = await factory.create({
 *   name: 'training-neural',
 *   type: 'neural',
 *   maxListeners: 100,
 *   processing: {
 *     strategy: 'queued',
 *     batchSize: 100,
 *     timeout: 30000
 *   }
 * });
 *
 * const inferenceManager = await factory.create({
 *   name: 'inference-neural',
 *   type: 'neural',
 *   processing: {
 *     strategy: 'immediate',
 *     timeout: 1000
 *   }
 * });
 * ```
 */
export class NeuralEventManagerFactory
  implements Partial<EventManagerFactory<EventManagerConfig>>
{
  constructor(
    private logger: Logger,
    private config: SharedConfig
  ) {
    this.logger.debug('NeuralEventManagerFactory initialized');
  }

  /**
   * Create a new NeuralEventManager instance.
   *
   * @param config - Configuration for the neural event manager
   * @returns Promise resolving to configured manager instance
   */
  async create(config: EventManagerConfig): Promise<NeuralEventManager> {
    this.logger.info(`Creating neural event manager: ${config.name}`);

    // Validate neural-specific configuration
    this.validateConfig(config);

    // Apply neural-optimized defaults
    const optimizedConfig = this.applyNeuralDefaults(config);

    // Create and configure manager
    const manager = new NeuralEventManager(optimizedConfig, this.logger);

    // Initialize with neural-specific settings
    await this.configureNeuralManager(manager, optimizedConfig);

    this.logger.info(
      `Neural event manager created successfully: ${config.name}`
    );
    return manager;
  }

  /**
   * Validate neural event manager configuration.
   */
  private validateConfig(config: EventManagerConfig): void {
    if (!config.name) {
      throw new Error('Neural event manager name is required');
    }

    if (config.type !== 'neural') {
      throw new Error('Manager type must be "neural"');
    }

    // Validate neural-specific settings
    // Neural-specific validations can be added here

    if (config.maxListeners && config.maxListeners < 50) {
      this.logger.warn(
        'Neural managers should support at least 50 listeners for ML workflows'
      );
    }
  }

  /**
   * Apply neural-optimized default configuration.
   */
  private applyNeuralDefaults(config: EventManagerConfig): EventManagerConfig {
    return {
      ...config,
      maxListeners: config.maxListeners || 200,
      processing: {
        batchSize: 50, // Efficient batch processing
        ...config.processing,
        strategy: 'queued', // ML operations benefit from queuing (override)
      } as any, // Type assertion for neural-specific properties
      // persistence configuration removed - not part of base interface
      monitoring: {
        enabled: true,
        metricsInterval: 60000, // 1 minute metrics collection
        ...config.monitoring,
      } as any, // Type assertion for neural-specific properties
    };
  }

  /**
   * Configure neural-specific manager settings.
   */
  private async configureNeuralManager(
    manager: NeuralEventManager,
    config: EventManagerConfig
  ): Promise<void> {
    // Start monitoring if enabled
    if (config.monitoring?.enabled) {
      await manager.start();
      this.logger.debug(
        `Neural event manager monitoring started: ${config.name}`
      );
    }

    // Set up health checking with ML-specific intervals
    if (config.monitoring?.enabled) {
      setInterval(async () => {
        try {
          const status = await manager.healthCheck();
          if (status.status !== 'healthy') {
            this.logger.warn(
              `Neural manager health degraded: ${config.name}`,
              status.metadata
            );
          }
        } catch (error) {
          this.logger.error(
            `Neural manager health check failed: ${config.name}`,
            error
          );
        }
      }, 300000); // 5 minute health checks
    }
  }
}

export default NeuralEventManagerFactory;
