/**
 * @file Coordination Event Adapter - Main Class
 *
 * Unified Coordination Event Adapter implementing the EventManager interface.
 */

import { type Logger } from '@claude-zen/foundation';
import type {
  EventManagerConfig,
  EventManagerStatus,
  EventManagerMetrics,
  SystemEvent,
} from '../../core/interfaces';
import type { CoordinationEventManager } from '../../event-manager-types';
import { BaseEventManager } from '../../core/base-event-manager';

/**
 * Coordination-specific event for distributed operations.
 */
export interface CoordinationEvent extends SystemEvent {
  operationId?: string;
  participants?: string[];
  status?: 'pending' | 'coordinating' | 'completed' | 'failed';
  progress?: number;
}

/**
 * Configuration for coordination event adapter.
 */
export interface CoordinationEventAdapterConfig extends EventManagerConfig {
  maxParticipants?: number;
  coordinationTimeout?: number;
  retryAttempts?: number;
}

/**
 * Coordination Event Adapter implementation.
 */
export class CoordinationEventAdapter extends BaseEventManager implements CoordinationEventManager {
  private operations = new Map<string, {
    participants: string[];
    status: 'pending' | 'coordinating' | 'completed' | 'failed';
    progress: number;
    startTime: Date;
  }>();

  private coordinationStats = {
    operationsStarted: 0,
    operationsCompleted: 0,
    operationsFailed: 0,
  };

  private startTime = new Date();

  constructor(config: CoordinationEventAdapterConfig, logger?: Logger) {
    super(config, logger);
  }

  async coordinateOperation(operationId: string, participants: string[]): Promise<void> {
    this.coordinationStats.operationsStarted++;
    
    this.operations.set(operationId, {
      participants,
      status: 'pending',
      progress: 0,
      startTime: new Date(),
    });

    const event: CoordinationEvent = {
      id: `coord_${operationId}_${Date.now()}`,
      timestamp: new Date(),
      source: 'coordination-adapter',
      type: 'coordination:start',
      payload: {
        operationId,
        participants,
      },
      operationId,
      participants,
      status: 'pending',
      progress: 0,
    };

    await this.emit(event);

    // Simulate coordination logic
    setTimeout(() => this.completeOperation(operationId), 1000);
  }

  async getCoordinationStatus(operationId: string): Promise<{
    status: 'pending' | 'coordinating' | 'completed' | 'failed';
    participants: string[];
    progress: number;
  }> {
    const operation = this.operations.get(operationId);
    
    if (!operation) {
      throw new Error(`Operation not found: ${operationId}`);
    }

    return {
      status: operation.status,
      participants: operation.participants,
      progress: operation.progress,
    };
  }

  private async completeOperation(operationId: string): Promise<void> {
    const operation = this.operations.get(operationId);
    if (!operation) return;

    operation.status = 'completed';
    operation.progress = 100;
    this.coordinationStats.operationsCompleted++;

    const event: CoordinationEvent = {
      id: `coord_${operationId}_complete_${Date.now()}`,
      timestamp: new Date(),
      source: 'coordination-adapter',
      type: 'coordination:complete',
      payload: {
        operationId,
        participants: operation.participants,
        duration: Date.now() - operation.startTime.getTime(),
      },
      operationId,
      participants: operation.participants,
      status: 'completed',
      progress: 100,
    };

    await this.emit(event);
  }

  getCoordinationStats() {
    return {
      ...this.getStats(),
      coordination: {
        ...this.coordinationStats,
        activeOperations: this.operations.size,
      },
    };
  }

  async healthCheck(): Promise<EventManagerStatus> {
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
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  async getMetrics(): Promise<EventManagerMetrics> {
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
      averageProcessingTime: 0, // TODO: Implement timing tracking
      maxProcessingTime: 0,
      minProcessingTime: 0,
    };
  }

  // EventEmitter compatibility methods
  on(event: string, listener: (...args: any[]) => void): this {
    this.subscribe([event], listener);
    return this;
  }

  off(event: string, listener: (...args: any[]) => void): this {
    // Find and remove subscription - simplified implementation
    for (const [id, subscription] of (this as any)._subscriptions) {
      if (subscription.eventTypes.includes(event) && subscription.listener === listener) {
        this.unsubscribe(id);
        break;
      }
    }
    return this;
  }

  emitSimple(eventType: string, ...args: any[]): boolean {
    const event = {
      id: `${eventType}_${Date.now()}`,
      timestamp: new Date(),
      source: this.name,
      type: eventType,
      payload: args.length === 1 ? args[0] : args,
    };
    
    super.emit(event as SystemEvent).catch(() => {});
    return true;
  }
}

/**
 * Factory function to create coordination event adapter.
 */
export function createCoordinationEventAdapter(
  config: CoordinationEventAdapterConfig,
  logger?: Logger
): CoordinationEventAdapter {
  return new CoordinationEventAdapter(config, logger);
}