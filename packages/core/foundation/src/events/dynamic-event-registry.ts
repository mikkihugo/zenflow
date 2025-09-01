/**
 * @fileoverview Dynamic Event Registry - Real-Time Event Discovery
 *
 * Dynamic event catalog system that discovers active EventBus modules,
 * tracks event flows in real-time, and provides comprehensive event monitoring.
 */

import { EventBus } from './event-bus.js';
import { EventLogger } from './event-logger.js';
import { EVENT_CATALOG, EventName, getAllEventNames } from './event-catalog.js';

// ============================================================================
// DYNAMIC EVENT DISCOVERY INTERFACES
// ============================================================================

export interface ActiveModule {
  id: string;
  name: string;
  type:
    | 'sparc'
    | 'brain'
    | 'dspy'
    | 'teamwork'
    | 'llm'
    | 'git'
    | 'system'
    | 'safe'
    | 'claude-code';
  status: 'active' | 'idle' | 'error' | 'disconnected';
  lastSeen: Date;
  eventCount: number;
  events: EventName[];
  metadata: {
    version?: string;
    description?: string;
    uptime: number;
    memoryUsage?: number;
  };
}

export interface EventFlow {
  id: string;
  eventName: EventName;
  source: string;
  target: string;
  payload?: unknown;
  timestamp: Date;
  latency: number;
  success: boolean;
  retries?: number;
}

export interface EventMetrics {
  totalEvents: number;
  eventsPerSecond: number;
  averageLatency: number;
  errorRate: number;
  activeModules: number;
  peakEventsPerSecond: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  // Base EventBus compatibility
  eventCount: number;
  eventTypes: Record<string, number>;
  avgProcessingTime: number;
  errorCount: number;
  listenerCount: number;
}

export interface ModuleRegistration {
  moduleId: string;
  moduleName: string;
  moduleType: string;
  supportedEvents: EventName[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// DYNAMIC EVENT REGISTRY
// ============================================================================

/**
 * Dynamic event registry that tracks active modules and event flows
 */
export class DynamicEventRegistry extends EventBus {
  private activeModules = new Map<string, ActiveModule>();
  private eventFlows = new Map<string, EventFlow[]>();
  private eventMetrics: EventMetrics = {
    totalEvents: 0,
    eventsPerSecond: 0,
    averageLatency: 0,
    errorRate: 0,
    activeModules: 0,
    peakEventsPerSecond: 0,
    systemHealth: 'healthy',
    // Base EventBus compatibility
    eventCount: 0,
    eventTypes: {},
    avgProcessingTime: 0,
    errorCount: 0,
    listenerCount: 0,
  };
  private metricsHistory: Array<{ timestamp: Date; metrics: EventMetrics }> =
    [];
  private eventBuffer: EventFlow[] = [];
  private metricsInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.setupEventDiscovery();
    this.startMetricsCollection();
    EventLogger.log('dynamic-registry:initialized', {
      registryId: this.constructor.name,
    });
  }

  /**
   * Setup event discovery and monitoring
   */
  private setupEventDiscovery(): void {
    // Listen for module registrations
    this.on(
      'registry:module-register',
      this.handleModuleRegistration.bind(this)
    );
    this.on(
      'registry:module-unregister',
      this.handleModuleUnregistration.bind(this)
    );

    // Listen for event flows (all events go through here)
    this.on('*', this.handleEventFlow.bind(this));

    // Listen for module heartbeats
    this.on('registry:heartbeat', this.handleModuleHeartbeat.bind(this));
  }

  /**
   * Register a new module with the registry
   */
  registerModule(registration: ModuleRegistration): void {
    const module: ActiveModule = {
      id: registration.moduleId,
      name: registration.moduleName,
      type: this.inferModuleType(registration.moduleType),
      status: 'active',
      lastSeen: new Date(),
      eventCount: 0,
      events: registration.supportedEvents,
      metadata: {
        ...registration.metadata,
        uptime: 0,
        version: (registration.metadata?.['version'] as string) || '1.0.0',
        description:
          (registration.metadata?.['description'] as string) ||
          registration.moduleName + ' module',
      },
    };

    this.activeModules.set(registration.moduleId, module);
    this.updateMetrics();

    EventLogger.log('registry:module-registered', {
      moduleId: registration.moduleId,
      moduleName: registration.moduleName,
      supportedEvents: registration.supportedEvents,
    });

    this.emit('registry:module-registered', module);
  }

  /**
   * Unregister a module from the registry
   */
  unregisterModule(moduleId: string): void {
    const module = this.activeModules.get(moduleId);
    if (module) {
      this.activeModules.delete(moduleId);
      this.updateMetrics();

      EventLogger.log('registry:module-unregistered', { moduleId });
      this.emit('registry:module-unregistered', module);
    }
  }

  /**
   * Handle module registration events
   */
  private handleModuleRegistration(...args: unknown[]): void {
    const registration = args[0] as ModuleRegistration;
    this.registerModule(registration);
  }

  /**
   * Handle module unregistration events
   */
  private handleModuleUnregistration(...args: unknown[]): void {
    const moduleId = args[0] as string;
    this.unregisterModule(moduleId);
  }

  /**
   * Handle module heartbeat events
   */
  private handleModuleHeartbeat(...args: unknown[]): void {
    const data = args[0] as {
      moduleId: string;
      metadata?: Record<string, unknown>;
    };
    const module = this.activeModules.get(data.moduleId);
    if (module) {
      module.lastSeen = new Date();
      module.status = 'active';
      module.metadata.uptime = Date.now() - module.lastSeen.getTime();

      if (data.metadata) {
        module.metadata = { ...module.metadata, ...data.metadata };
      }
    }
  }

  /**
   * Handle all event flows for monitoring
   */
  private handleEventFlow(...args: unknown[]): void {
    const eventName = args[0] as string;
    const payload = args[1];

    if (eventName.startsWith('registry:
          ) {
      return; // Don't track registry events to avoid recursion
    }

    const flow: EventFlow = {
      id: 'flow-' + (Date.now()) + '-' + Math.random().toString(36).substr(2, 9),
      eventName: eventName as EventName,
      source: this.inferEventSource(eventName),
      target: this.inferEventTarget(eventName),
      payload,
      timestamp: new Date(),
      latency: 0, // Will be calculated later
      success: true, // Assume success unless we get error events
      retries: 0,
    };

    // Add to event buffer
    this.eventBuffer.push(flow);

    // Update module event counts
    const sourceModule = this.findModuleByName(flow.source);
    if (sourceModule) {
      sourceModule.eventCount++;
      sourceModule.lastSeen = new Date();
    }

    // Store flow history (keep last 1000 flows per event)
    const eventFlows = this.eventFlows.get(eventName) || [];
    eventFlows.push(flow);

    if (eventFlows.length > 1000) {
      eventFlows.shift(); // Remove oldest flow
    }

    this.eventFlows.set(eventName, eventFlows);
  }

  /**
   * Start metrics collection interval
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
      this.processEventBuffer();
      this.checkModuleHealth();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Update system metrics
   */
  private updateMetrics(): void {
    const now = new Date();
    const lastMinuteFlows = this.eventBuffer.filter(
      (flow) => now.getTime() - flow.timestamp.getTime() < 60000
    );

    // Calculate event type distribution
    const eventTypes: Record<string, number> = {};
    for (const flow of this.eventBuffer) {
      eventTypes[flow.eventName] = (eventTypes[flow.eventName] || 0) + 1;
    }

    this.eventMetrics = {
      totalEvents: this.eventBuffer.length,
      eventsPerSecond: lastMinuteFlows.length / 60,
      averageLatency: this.calculateAverageLatency(lastMinuteFlows),
      errorRate: this.calculateErrorRate(lastMinuteFlows),
      activeModules: this.activeModules.size,
      peakEventsPerSecond: Math.max(
        this.eventMetrics.peakEventsPerSecond,
        lastMinuteFlows.length / 60
      ),
      systemHealth: this.calculateSystemHealth(),
      // Base EventBus compatibility
      eventCount: this.eventBuffer.length,
      eventTypes,
      avgProcessingTime: this.calculateAverageLatency(lastMinuteFlows),
      errorCount: lastMinuteFlows.filter((f) => !f.success).length,
      listenerCount: this.eventNames().reduce(
        (sum, name) => sum + this.listenerCount(name),
        0
      ),
    };

    // Store metrics history (keep last 100 entries)
    this.metricsHistory.push({
      timestamp: now,
      metrics: { ...this.eventMetrics },
    });
    if (this.metricsHistory.length > 100) {
      this.metricsHistory.shift();
    }
  }

  /**
   * Process event buffer and clean up old events
   */
  private processEventBuffer(): void {
    const cutoff = Date.now() - 60 * 60 * 1000; // Keep last hour
    this.eventBuffer = this.eventBuffer.filter(
      (flow) => flow.timestamp.getTime() > cutoff
    );
  }

  /**
   * Check health of registered modules
   */
  private checkModuleHealth(): void {
    const staleThreshold = 30000; // 30 seconds
    const now = Date.now();

    for (const [moduleId, module] of this.activeModules) {
      const timeSinceLastSeen = now - module.lastSeen.getTime();

      if (timeSinceLastSeen > staleThreshold && module.status === 'active') {
        module.status = 'idle';
        EventLogger.logError(
          'registry:module-idle',
          `Module ${moduleId} is idle`,
          { component: ' DynamicEventRegistry' }
        );
      }

      if (timeSinceLastSeen > staleThreshold * 3) {
        module.status = 'disconnected';
        EventLogger.logError(
          'registry:module-disconnected',
          `Module ${moduleId} disconnected`,
          { component: ' DynamicEventRegistry' }
        );
      }
    }
  }

  /**
   * Get all active modules
   */
  getActiveModules(): ActiveModule[] {
    return Array.from(this.activeModules.values());
  }

  /**
   * Get event flows for a specific event
   */
  getEventFlows(eventName?: EventName): EventFlow[] {
    if (eventName) {
      return this.eventFlows.get(eventName) || [];
    }

    // Return all flows
    const allFlows: EventFlow[] = [];
    for (const flows of this.eventFlows.values()) {
      allFlows.push(...flows);
    }

    return allFlows.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get current system metrics
   */
  override getMetrics(): EventMetrics {
    return { ...this.eventMetrics };
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(): Array<{ timestamp: Date; metrics: EventMetrics }> {
    return [...this.metricsHistory];
  }

  /**
   * Get event catalog with dynamic data
   */
  getDynamicEventCatalog(): Record<
    string,
    {
      type: string;
      flows: number;
      lastSeen?: Date;
      activeModules: string[];
    }
  > {
    const catalog: Record<
      string,
      {
        type: string;
        flows: number;
        lastSeen?: Date;
        activeModules: string[];
      }
    > = {};

    for (const eventName of getAllEventNames()) {
      const flows = this.eventFlows.get(eventName) || [];
      const modules = this.getModulesForEvent(eventName);

      catalog[eventName] = {
        type: EVENT_CATALOG[eventName],
        flows: flows.length,
        lastSeen:
          flows.length > 0 ? flows[flows.length - 1]?.timestamp : undefined,
        activeModules: modules.map((m) => m.name),
      };
    }

    return catalog;
  }

  /**
   * Utility methods
   */
  private inferModuleType(moduleType: string): ActiveModule['type'] {
    const typeMap: Record<string, ActiveModule['type']> = {
      sparc: 'sparc',
      brain: 'brain',
      dspy: 'dspy',
      teamwork: 'teamwork',
      llm: 'llm',
      git: 'git',
      system: 'system',
      safe: 'safe',
      'claude-code': 'claude-code',
    };

    return typeMap[moduleType.toLowerCase()] || 'system';
  }

  private inferEventSource(eventName: string): string {
    const prefix = eventName.split(':
          [0];
    return prefix || 'unknown';
  }

  private inferEventTarget(eventName: string): string {
    // Simple heuristic - could be enhanced
    if (eventName.includes('request')) return ' processor';
    if (eventName.includes('complete')) return ' caller';
    if (eventName.includes('failed')) return ' error-handler';
    return 'unknown';
  }

  private findModuleByName(name: string): ActiveModule | undefined {
    for (const module of this.activeModules.values()) {
      if (
        module.name.toLowerCase().includes(name.toLowerCase()) ||
        module.type === name
      ) {
        return module;
      }
    }
    return undefined;
  }

  private getModulesForEvent(eventName: EventName): ActiveModule[] {
    return Array.from(this.activeModules.values()).filter((module) =>
      module.events.includes(eventName)
    );
  }

  private calculateAverageLatency(flows: EventFlow[]): number {
    if (flows.length === 0) return 0;
    const totalLatency = flows.reduce((sum, flow) => sum + flow.latency, 0);
    return totalLatency / flows.length;
  }

  private calculateErrorRate(flows: EventFlow[]): number {
    if (flows.length === 0) return 0;
    const errorCount = flows.filter((flow) => !flow.success).length;
    return (errorCount / flows.length) * 100;
  }

  private calculateSystemHealth(): EventMetrics['systemHealth'] {
    const { errorRate } = this.eventMetrics;
    const { activeModules } = this.eventMetrics;

    if (errorRate > 10 || activeModules === 0) return 'critical';
    if (errorRate > 5 || activeModules < 3) return 'degraded';
    return 'healthy';
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.activeModules.clear();
    this.eventFlows.clear();
    this.eventBuffer = [];
    this.metricsHistory = [];
  }
}

// ============================================================================
// SINGLETON REGISTRY INSTANCE
// ============================================================================

export const dynamicEventRegistry = new DynamicEventRegistry();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Register a module with the dynamic registry
 */
export function registerEventModule(registration: ModuleRegistration): void {
  dynamicEventRegistry.registerModule(registration);
}

/**
 * Send heartbeat for a module
 */
export function sendModuleHeartbeat(
  moduleId: string,
  metadata?: Record<string, unknown>
): void {
  dynamicEventRegistry.emit('registry:heartbeat', { moduleId, metadata });
}

/**
 * Get current active modules
 */
export function getActiveModules(): ActiveModule[] {
  return dynamicEventRegistry.getActiveModules();
}

/**
 * Get current system metrics
 */
export function getEventMetrics(): EventMetrics {
  return dynamicEventRegistry.getMetrics();
}

/**
 * Get event flows
 */
export function getEventFlows(eventName?: EventName): EventFlow[] {
  return dynamicEventRegistry.getEventFlows(eventName);
}

/**
 * Get dynamic event catalog
 */
export function getDynamicEventCatalog() {
  return dynamicEventRegistry.getDynamicEventCatalog();
}
