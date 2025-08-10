import { getLogger } from '../../config/logging-config';

const logger = getLogger('interfaces-events-observer-system');

/**
 * @file Observer Pattern Implementation for Real-Time Event System
 * Provides type-safe event handling with priority management and error recovery.
 */

import { EventEmitter } from 'node:events';

// Event type definitions with strong typing
export interface SystemEvent {
  id: string;
  timestamp: Date;
  source: string;
  type: string;
  metadata?: Record<string, any>;
}

export interface SwarmEvent extends SystemEvent {
  type: 'swarm';
  swarmId: string;
  agentCount: number;
  status: SwarmStatus;
  topology: SwarmTopology;
  metrics: SwarmMetrics;
  operation: 'init' | 'update' | 'destroy' | 'coordinate';
}

export interface MCPEvent extends SystemEvent {
  type: 'mcp';
  toolName: string;
  executionTime: number;
  result: ToolResult;
  protocol: 'http' | 'stdio';
  operation: 'execute' | 'validate' | 'error';
  requestId: string;
}

export interface NeuralEvent extends SystemEvent {
  type: 'neural';
  modelId: string;
  operation: 'train' | 'predict' | 'evaluate' | 'optimize';
  accuracy?: number;
  loss?: number;
  dataSize?: number;
  processingTime: number;
}

export interface DatabaseEvent extends SystemEvent {
  type: 'database';
  operation: 'query' | 'insert' | 'update' | 'delete' | 'index';
  tableName: string;
  recordCount: number;
  queryTime: number;
  success: boolean;
}

export interface MemoryEvent extends SystemEvent {
  type: 'memory';
  operation: 'store' | 'retrieve' | 'delete' | 'cleanup';
  key: string;
  size?: number;
  hit?: boolean;
  ttl?: number;
}

export interface InterfaceEvent extends SystemEvent {
  type: 'interface';
  interface: 'web' | 'cli' | 'tui' | 'api';
  operation: 'start' | 'stop' | 'request' | 'response' | 'error';
  endpoint?: string;
  statusCode?: number;
  responseTime?: number;
}

// Union type for all system events
export type AllSystemEvents =
  | SwarmEvent
  | MCPEvent
  | NeuralEvent
  | DatabaseEvent
  | MemoryEvent
  | InterfaceEvent;

// Priority levels for event handling
export type EventPriority = 'critical' | 'high' | 'medium' | 'low';

// Observer type definitions
export type ObserverType =
  | 'websocket'
  | 'database'
  | 'logger'
  | 'metrics'
  | 'notification'
  | 'custom';

// Supporting interfaces
export interface SwarmStatus {
  healthy: boolean;
  activeAgents: number;
  completedTasks: number;
  errors: string[];
}

export interface SwarmMetrics {
  latency: number;
  throughput: number;
  reliability: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
}

export type SwarmTopology = 'mesh' | 'hierarchical' | 'ring' | 'star';

// Generic observer interface with event typing and priority
export interface SystemObserver<T extends SystemEvent = SystemEvent> {
  update(event: T): void | Promise<void>;
  getObserverType(): ObserverType;
  getPriority(): EventPriority;
  getEventTypes(): string[];
  isHealthy(): boolean;
  handleError?(error: Error, event: T): void;
}

// Priority queue for event processing
class PriorityQueue<T> {
  private items: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number): void {
    this.items.push({ item, priority });
    this.items.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}

// Concrete observer implementations
export class WebSocketObserver implements SystemObserver<SwarmEvent | MCPEvent | InterfaceEvent> {
  private connections: Set<any> = new Set();
  private healthy = true;

  constructor(private logger?: any) {}

  addConnection(socket: any): void {
    this.connections.add(socket);
  }

  removeConnection(socket: any): void {
    this.connections.delete(socket);
  }

  update(event: SwarmEvent | MCPEvent | InterfaceEvent): void {
    try {
      const payload = this.formatEventForWebSocket(event);

      this.connections.forEach((socket) => {
        if (socket.readyState === 1) {
          // WebSocket.OPEN
          socket.send(JSON.stringify(payload));
        }
      });

      // Emit specific event types
      this.connections.forEach((socket) => {
        switch (event.type) {
          case 'swarm':
            socket.emit('swarm:update', event);
            break;
          case 'mcp':
            socket.emit('mcp:execution', event);
            break;
          case 'interface':
            socket.emit('interface:activity', event);
            break;
        }
      });
    } catch (error) {
      this.healthy = false;
      this.logger?.error('WebSocket observer error:', error);
    }
  }

  getObserverType(): ObserverType {
    return 'websocket';
  }

  getPriority(): EventPriority {
    return 'high';
  }

  getEventTypes(): string[] {
    return ['swarm', 'mcp', 'interface'];
  }

  isHealthy(): boolean {
    return this.healthy && this.connections.size > 0;
  }

  handleError(error: Error, event: SwarmEvent | MCPEvent | InterfaceEvent): void {
    this.logger?.error('WebSocket observer error handling event:', { error, event });
    // Try to reconnect or cleanup bad connections
    this.connections.forEach((socket) => {
      if (socket.readyState !== 1) {
        this.connections.delete(socket);
      }
    });
  }

  private formatEventForWebSocket(event: SystemEvent): any {
    return {
      id: event.id,
      type: event.type,
      timestamp: event.timestamp.toISOString(),
      source: event.source,
      data: event,
      priority: this.getPriority(),
    };
  }
}

export class DatabaseObserver implements SystemObserver<SystemEvent> {
  private healthy = true;
  private batchSize = 100;
  private eventBatch: SystemEvent[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor(
    private dbService: any,
    private logger?: any,
    batchSize = 100
  ) {
    this.batchSize = batchSize;
    this.flushInterval = setInterval(() => this.flushBatch(), 5000); // Flush every 5 seconds
  }

  update(event: SystemEvent): void {
    try {
      this.eventBatch.push(event);

      if (this.eventBatch.length >= this.batchSize) {
        this.flushBatch();
      }

      // Update real-time metrics
      this.updateMetrics(event);
    } catch (error) {
      this.healthy = false;
      this.logger?.error('Database observer error:', error);
    }
  }

  getObserverType(): ObserverType {
    return 'database';
  }

  getPriority(): EventPriority {
    return 'medium';
  }

  getEventTypes(): string[] {
    return ['swarm', 'mcp', 'neural', 'database', 'memory', 'interface'];
  }

  isHealthy(): boolean {
    return this.healthy;
  }

  async destroy(): Promise<void> {
    clearInterval(this.flushInterval);
    await this.flushBatch();
  }

  private async flushBatch(): Promise<void> {
    if (this.eventBatch.length === 0) return;

    try {
      const batch = [...this.eventBatch];
      this.eventBatch = [];

      await this.dbService.query(
        'INSERT INTO system_events (id, type, timestamp, source, data) VALUES ?',
        [
          batch.map((event) => [
            event.id,
            event.type,
            event.timestamp,
            event.source,
            JSON.stringify(event),
          ]),
        ]
      );
    } catch (error) {
      this.healthy = false;
      this.logger?.error('Failed to flush event batch to database:', error);
      // Re-add events to batch for retry
      this.eventBatch.unshift(...this.eventBatch);
    }
  }

  private updateMetrics(event: SystemEvent): void {
    // Update real-time metrics based on event type
    const _metricsKey = `events:${event.type}:count`;
    // This would integrate with actual metrics service
  }
}

export class LoggerObserver implements SystemObserver<SystemEvent> {
  private healthy = true;

  constructor(private logger: any) {}

  update(event: SystemEvent): void {
    try {
      const logLevel = this.getLogLevel(event);
      const message = this.formatLogMessage(event);

      this.logger[logLevel](message, {
        eventId: event.id,
        type: event.type,
        source: event.source,
        timestamp: event.timestamp,
      });
    } catch (error) {
      this.healthy = false;
      logger.error('Logger observer error:', error);
    }
  }

  getObserverType(): ObserverType {
    return 'logger';
  }

  getPriority(): EventPriority {
    return 'low';
  }

  getEventTypes(): string[] {
    return ['swarm', 'mcp', 'neural', 'database', 'memory', 'interface'];
  }

  isHealthy(): boolean {
    return this.healthy;
  }

  private getLogLevel(event: SystemEvent): 'info' | 'warn' | 'error' {
    if ('success' in event && !event.success) return 'error';
    if ('errors' in event && Array.isArray(event.errors) && event.errors.length > 0) return 'warn';
    return 'info';
  }

  private formatLogMessage(event: SystemEvent): string {
    switch (event.type) {
      case 'swarm': {
        const swarmEvent = event as SwarmEvent;
        return `Swarm ${swarmEvent.operation}: ${swarmEvent.swarmId} (${swarmEvent.agentCount} agents)`;
      }

      case 'mcp': {
        const mcpEvent = event as MCPEvent;
        return `MCP ${mcpEvent.operation}: ${mcpEvent.toolName} (${mcpEvent.executionTime}ms)`;
      }

      case 'neural': {
        const neuralEvent = event as NeuralEvent;
        return `Neural ${neuralEvent.operation}: ${neuralEvent.modelId} (${neuralEvent.processingTime}ms)`;
      }

      default:
        return `${event.type} event from ${event.source}`;
    }
  }
}

export class MetricsObserver implements SystemObserver<SystemEvent> {
  private healthy = true;
  private metrics: Map<string, any> = new Map();

  constructor(private metricsService?: any) {}

  update(event: SystemEvent): void {
    try {
      this.collectMetrics(event);

      if (this.metricsService) {
        this.metricsService.recordEvent(event);
      }
    } catch (error) {
      this.healthy = false;
      logger.error('Metrics observer error:', error);
    }
  }

  getObserverType(): ObserverType {
    return 'metrics';
  }

  getPriority(): EventPriority {
    return 'medium';
  }

  getEventTypes(): string[] {
    return ['swarm', 'mcp', 'neural', 'database', 'memory', 'interface'];
  }

  isHealthy(): boolean {
    return this.healthy;
  }

  getMetrics(): Map<string, any> {
    return new Map(this.metrics);
  }

  private collectMetrics(event: SystemEvent): void {
    const key = `${event.type}:${event.source}`;
    const current = this.metrics.get(key) || { count: 0, lastSeen: null };

    this.metrics.set(key, {
      count: current?.count + 1,
      lastSeen: event.timestamp,
      type: event.type,
      source: event.source,
    });

    // Collect specific metrics based on event type
    switch (event.type) {
      case 'mcp': {
        const mcpEvent = event as MCPEvent;
        this.recordExecutionTime('mcp', mcpEvent.executionTime);
        break;
      }

      case 'neural': {
        const neuralEvent = event as NeuralEvent;
        this.recordExecutionTime('neural', neuralEvent.processingTime);
        break;
      }

      case 'database': {
        const dbEvent = event as DatabaseEvent;
        this.recordExecutionTime('database', dbEvent.queryTime);
        break;
      }
    }
  }

  private recordExecutionTime(type: string, time: number): void {
    const key = `${type}:execution_time`;
    const current = this.metrics.get(key) || { sum: 0, count: 0, avg: 0, min: Infinity, max: 0 };

    this.metrics.set(key, {
      sum: current?.sum + time,
      count: current?.count + 1,
      avg: (current?.sum + time) / (current?.count + 1),
      min: Math.min(current?.min, time),
      max: Math.max(current?.max, time),
    });
  }
}

// Main event manager with priority handling and error recovery
export class SystemEventManager extends EventEmitter {
  private observers: Map<string, SystemObserver[]> = new Map();
  private eventQueue: PriorityQueue<{ event: SystemEvent; observers: SystemObserver[] }> =
    new PriorityQueue();
  private processing = false;
  private errorRecovery = true;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(private logger?: any) {
    super();
    this.setMaxListeners(1000);
    this.startEventProcessing();
  }

  subscribe<T extends SystemEvent>(eventType: T['type'], observer: SystemObserver<T>): void {
    const observers = this.observers.get(eventType) || [];
    observers.push(observer as SystemObserver);

    // Sort by priority (critical = 4, high = 3, medium = 2, low = 1)
    observers.sort(
      (a, b) => this.getPriorityValue(b.getPriority()) - this.getPriorityValue(a.getPriority())
    );

    this.observers.set(eventType, observers);

    this.logger?.debug(`Observer subscribed to ${eventType}`, {
      observerType: observer.getObserverType(),
      priority: observer.getPriority(),
    });
  }

  unsubscribe<T extends SystemEvent>(eventType: T['type'], observer: SystemObserver<T>): void {
    const observers = this.observers.get(eventType) || [];
    const index = observers.indexOf(observer as SystemObserver);

    if (index > -1) {
      observers.splice(index, 1);
      this.observers.set(eventType, observers);

      this.logger?.debug(`Observer unsubscribed from ${eventType}`, {
        observerType: observer.getObserverType(),
      });
    }
  }

  async notify<T extends SystemEvent>(event: T): Promise<void> {
    const observers = this.observers.get(event.type) || [];

    if (observers.length === 0) {
      this.logger?.warn(`No observers for event type: ${event.type}`);
      return;
    }

    // Add to priority queue for processing
    const priority = this.calculateEventPriority(event, observers);
    this.eventQueue.enqueue({ event, observers }, priority);

    // Emit for EventEmitter compatibility
    this.emit(event.type, event);
  }

  // Immediate notification for critical events (bypasses queue)
  async notifyImmediate<T extends SystemEvent>(event: T): Promise<void> {
    const observers = this.observers.get(event.type) || [];
    await this.processEventWithObservers(event, observers, true);
  }

  getObserverStats(): { type: string; count: number; healthy: number }[] {
    const stats: { type: string; count: number; healthy: number }[] = [];

    this.observers.forEach((observers, eventType) => {
      const healthy = observers.filter((o) => o.isHealthy()).length;
      stats.push({
        type: eventType,
        count: observers.length,
        healthy,
      });
    });

    return stats;
  }

  getQueueStats(): { size: number; processing: boolean } {
    return {
      size: this.eventQueue.size(),
      processing: this.processing,
    };
  }

  clearQueue(): void {
    this.eventQueue.clear();
  }

  async shutdown(): Promise<void> {
    this.processing = false;
    this.clearQueue();

    // Notify all observers of shutdown
    const _shutdownEvent: SystemEvent = {
      id: `shutdown-${Date.now()}`,
      timestamp: new Date(),
      source: 'system',
      type: 'system:shutdown',
    };

    for (const [, observers] of this.observers) {
      for (const observer of observers) {
        try {
          if ('destroy' in observer && typeof observer.destroy === 'function') {
            await (observer as any).destroy();
          }
        } catch (error) {
          this.logger?.error('Error shutting down observer:', error);
        }
      }
    }
  }

  private startEventProcessing(): void {
    this.processing = true;

    const processNext = async () => {
      if (!this.processing) return;

      const item = this.eventQueue.dequeue();
      if (item) {
        await this.processEventWithObservers(item?.event, item?.observers);
      }

      // Continue processing
      setImmediate(processNext);
    };

    processNext();
  }

  private async processEventWithObservers(
    event: SystemEvent,
    observers: SystemObserver[],
    immediate = false
  ): Promise<void> {
    // Separate observers by priority for batch processing
    const criticalObservers = observers.filter((o) => o.getPriority() === 'critical');
    const highPriorityObservers = observers.filter((o) => o.getPriority() === 'high');
    const mediumPriorityObservers = observers.filter((o) => o.getPriority() === 'medium');
    const lowPriorityObservers = observers.filter((o) => o.getPriority() === 'low');

    try {
      // Process critical observers immediately in parallel
      if (criticalObservers.length > 0) {
        await Promise.allSettled(
          criticalObservers.map((observer) => this.safeUpdate(observer, event))
        );
      }

      // Process high priority observers in parallel
      if (highPriorityObservers.length > 0) {
        await Promise.allSettled(
          highPriorityObservers.map((observer) => this.safeUpdate(observer, event))
        );
      }

      // Process medium and low priority sequentially to avoid overwhelming system
      if (!immediate) {
        for (const observer of mediumPriorityObservers) {
          await this.safeUpdate(observer, event);
        }

        for (const observer of lowPriorityObservers) {
          await this.safeUpdate(observer, event);
        }
      }
    } catch (error) {
      this.logger?.error('Error processing event with observers:', { error, eventId: event.id });
    }
  }

  private async safeUpdate(observer: SystemObserver, event: SystemEvent): Promise<void> {
    let retries = 0;

    while (retries <= this.maxRetries) {
      try {
        if (!observer.isHealthy()) {
          this.logger?.warn('Skipping unhealthy observer', {
            type: observer.getObserverType(),
            eventType: event.type,
          });
          return;
        }

        const result = observer.update(event);

        // Handle async observers
        if (result instanceof Promise) {
          await result;
        }

        return; // Success
      } catch (error) {
        retries++;

        this.logger?.error('Observer update failed', {
          observer: observer.getObserverType(),
          eventId: event.id,
          attempt: retries,
          error,
        });

        // Call observer's error handler if available
        if (observer.handleError) {
          try {
            observer.handleError(error as Error, event);
          } catch (handlerError) {
            this.logger?.error('Observer error handler failed:', handlerError);
          }
        }

        if (retries <= this.maxRetries && this.errorRecovery) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay * retries));
        } else {
          break;
        }
      }
    }
  }

  private getPriorityValue(priority: EventPriority): number {
    switch (priority) {
      case 'critical':
        return 4;
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 1;
    }
  }

  private calculateEventPriority(event: SystemEvent, observers: SystemObserver[]): number {
    // Calculate priority based on highest priority observer and event characteristics
    const maxObserverPriority = Math.max(
      ...observers.map((o) => this.getPriorityValue(o.getPriority()))
    );

    // Add event-specific priority adjustments
    let eventPriorityBonus = 0;
    if ('success' in event && !event.success) eventPriorityBonus += 1; // Errors get higher priority
    if (event.type === 'swarm' && 'operation' in event && event.operation === 'destroy')
      eventPriorityBonus += 1;

    return maxObserverPriority + eventPriorityBonus;
  }
}

// Event builder utilities
export class EventBuilder {
  static createSwarmEvent(
    swarmId: string,
    operation: SwarmEvent['operation'],
    status: SwarmStatus,
    topology: SwarmTopology,
    metrics: SwarmMetrics,
    source = 'swarm-coordinator'
  ): SwarmEvent {
    return {
      id: `swarm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      source,
      type: 'swarm',
      swarmId,
      agentCount: status.activeAgents,
      status,
      topology,
      metrics,
      operation,
    };
  }

  static createMCPEvent(
    toolName: string,
    operation: MCPEvent['operation'],
    executionTime: number,
    result: ToolResult,
    protocol: 'http' | 'stdio',
    requestId: string,
    source = 'mcp-server'
  ): MCPEvent {
    return {
      id: `mcp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      source,
      type: 'mcp',
      toolName,
      executionTime,
      result,
      protocol,
      operation,
      requestId,
    };
  }

  static createNeuralEvent(
    modelId: string,
    operation: NeuralEvent['operation'],
    processingTime: number,
    options: {
      accuracy?: number;
      loss?: number;
      dataSize?: number;
      source?: string;
    } = {}
  ): NeuralEvent {
    return {
      id: `neural-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      source: options?.source || 'neural-service',
      type: 'neural',
      modelId,
      operation,
      processingTime,
      accuracy: options?.accuracy,
      loss: options?.loss,
      dataSize: options?.dataSize,
    };
  }
}
