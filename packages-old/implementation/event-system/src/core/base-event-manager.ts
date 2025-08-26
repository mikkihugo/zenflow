/**
 * @fileoverview Base Event Manager Implementation
 *
 * Base class for all event managers providing common functionality including
 * event emission, subscription management, filtering, health checking, and
 * performance monitoring. All specialized event managers extend this base.
 */

import type { Logger } from '@claude-zen/foundation';
import type {
  EventManagerConfig,
  EventManager,
  EventManagerType,
  SystemEvent,
  EventSubscription,
  EventListener,
} from './interfaces';

/**
 * Base Event Manager providing core event management functionality.
 */
export abstract class BaseEventManager implements EventManager {
  readonly config: EventManagerConfig;
  readonly name: string;
  readonly type: EventManagerType;

  private _isRunning = false;
  private _subscriptions = new Map<string, EventSubscription<SystemEvent>>();
  private _eventQueue: SystemEvent[] = [];
  private _processingInterval?: NodeJS.Timeout;
  private _logger?: Logger;
  private _startTime = Date.now();
  private _stats = {
    eventsEmitted: 0,
    eventsProcessed: 0,
    subscriptionsCreated: 0,
    subscriptionsRemoved: 0,
    errorCount: 0,
  };

  constructor(config: EventManagerConfig, logger?: Logger) {
    this.config = config;
    this.name = config.name;
    this.type = config.type;
    this._logger = logger;
  }

  // Lifecycle methods
  async start(): Promise<void> {
    if (this._isRunning) return;
    
    this._isRunning = true;
    this._logger?.info(`Event manager ${this.name} started`);
    
    if (this.config.processing.strategy === 'queued') {
      this.startProcessingLoop();
    }
  }

  async stop(): Promise<void> {
    if (!this._isRunning) return;
    
    this._isRunning = false;
    this._logger?.info(`Event manager ${this.name} stopped`);
    
    if (this._processingInterval) {
      clearInterval(this._processingInterval);
      this._processingInterval = undefined;
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  isRunning(): boolean {
    return this._isRunning;
  }

  // Event emission
  async emit<T extends SystemEvent>(event: T): Promise<void> {
    if (!this._isRunning) {
      throw new Error(`Event manager ${this.name} is not running`);
    }

    try {
      this._stats.eventsEmitted++;

      switch (this.config.processing.strategy) {
        case 'immediate':
          await this.processEvent(event);
          break;
        case 'queued':
          this._eventQueue.push(event);
          break;
        case 'batched':
          this._eventQueue.push(event);
          if (this._eventQueue.length >= (this.config.processing.batchSize || 10)) {
            await this.processBatch();
          }
          break;
        case 'throttled':
          // Implement throttling logic
          this._eventQueue.push(event);
          break;
      }
    } catch (error) {
      this._stats.errorCount++;
      this._logger?.error(`Failed to emit event in ${this.name}:`, error);
      throw error;
    }
  }

  async emitBatch<T extends SystemEvent>(events: T[]): Promise<void> {
    for (const event of events) {
      await this.emit(event);
    }
  }

  // Event subscription
  subscribe<T extends SystemEvent>(
    eventTypes: string | string[],
    listener: EventListener<T>
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    const subscription: EventSubscription<T> = {
      id: subscriptionId,
      eventTypes: types,
      listener,
      priority: 'medium',
      created: new Date(),
      active: true,
    };

    this._subscriptions.set(subscriptionId, subscription as EventSubscription<SystemEvent>);
    this._stats.subscriptionsCreated++;

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): boolean {
    const subscription = this._subscriptions.get(subscriptionId);
    if (subscription) {
      this._subscriptions.delete(subscriptionId);
      this._stats.subscriptionsRemoved++;
      return true;
    }
    return false;
  }

  unsubscribeAll(eventType?: string): number {
    let removed = 0;
    for (const [id, subscription] of this._subscriptions) {
      if (!eventType || subscription.eventTypes.includes(eventType)) {
        this._subscriptions.delete(id);
        removed++;
      }
    }
    this._stats.subscriptionsRemoved += removed;
    return removed;
  }

  // Health and cleanup
  async destroy(): Promise<void> {
    await this.stop();
    this._subscriptions.clear();
    this._eventQueue = [];
    this._logger?.info(`Event manager ${this.name} destroyed`);
  }

  // Protected methods for subclasses
  protected async processEvent<T extends SystemEvent>(event: T): Promise<void> {
    this._stats.eventsProcessed++;

    for (const subscription of this._subscriptions.values()) {
      if (subscription.active && this.eventMatches(event, subscription)) {
        try {
          await subscription.listener(event);
        } catch (error) {
          this._stats.errorCount++;
          this._logger?.error(`Subscription listener failed:`, error);
        }
      }
    }
  }

  protected async processBatch(): Promise<void> {
    const batch = this._eventQueue.splice(0, this.config.processing.batchSize || 10);
    
    for (const event of batch) {
      await this.processEvent(event);
    }
  }

  protected eventMatches<T extends SystemEvent>(
    event: T,
    subscription: EventSubscription
  ): boolean {
    return subscription.eventTypes.includes(event.type);
  }

  private startProcessingLoop(): void {
    this._processingInterval = setInterval(async () => {
      if (this._eventQueue.length > 0) {
        const event = this._eventQueue.shift();
        if (event) {
          await this.processEvent(event);
        }
      }
    }, 100);
  }

  // Statistics
  getStats() {
    return {
      ...this._stats,
      subscriptions: this._subscriptions.size,
      queueSize: this._eventQueue.length,
      isRunning: this._isRunning,
    };
  }

  // Health and monitoring
  async healthCheck(): Promise<import('./interfaces').EventManagerStatus> {
    const stats = this.getStats();
    const isHealthy = stats.errorCount < 10 && stats.isRunning;
    
    return {
      name: this.name,
      type: this.type,
      status: isHealthy ? 'healthy' : 'unhealthy',
      isRunning: stats.isRunning,
      isHealthy,
      subscriptionCount: stats.subscriptions,
      eventCount: stats.eventsProcessed,
      errorCount: stats.errorCount,
      lastEventTime: new Date(),
      uptime: Date.now() - this._startTime,
    };
  }

  async getMetrics(): Promise<import('./interfaces').EventManagerMetrics> {
    const stats = this.getStats();
    
    return {
      name: this.name,
      type: this.type,
      eventsEmitted: stats.eventsEmitted,
      eventsReceived: stats.eventsProcessed,
      eventsProcessed: stats.eventsProcessed,
      eventsFailed: stats.errorCount,
      subscriptionsCreated: stats.subscriptionsCreated,
      subscriptionsRemoved: stats.subscriptionsRemoved,
      errorCount: stats.errorCount,
      averageProcessingTime: 0, // TODO: Implement timing
      maxProcessingTime: 0,
      minProcessingTime: 0,
    };
  }
}