/**
 * @fileoverview System Monitoring Event Bridge
 *
 * Bridges EventDrivenSystemMonitor to foundation EventBus without modifying the original.
 * Maintains ZERO IMPORTS rule for monitoring-event-driven.ts while enabling EventBus integration.
 */

import {
  EventBus,
  getLogger,
  isValidEventName,
} from '@claude-zen/foundation';
import type { EventDrivenSystemMonitor } from './monitoring-event-driven.js';

// =============================================================================
// DYNAMIC REGISTRY INTEGRATION (Workaround until exports fixed)
// =============================================================================

// Manual module registration via EventBus emissions
const registerModuleWithEventBus = (eventBus: EventBus, registration: {
  moduleId: string;
  moduleName: string;
  moduleType: string;
  supportedEvents: string[];
  metadata?: Record<string, unknown>;
}): void => {
  eventBus.emit('registry:module-register', registration);
};

const sendHeartbeatToEventBus = (eventBus: EventBus, moduleId: string, metadata?: Record<string, unknown>): void => {
  eventBus.emit('registry:heartbeat', { moduleId, metadata });
};

// =============================================================================
// EVENT BRIDGE CONFIGURATION
// =============================================================================

interface BridgeConfig {
  moduleId: string;
  heartbeatInterval: number;
  enableLogging: boolean;
}

const DEFAULT_CONFIG: BridgeConfig = {
  moduleId: 'system-monitoring',
  heartbeatInterval: 5000, // 5 seconds
  enableLogging: true,
};

// =============================================================================
// SYSTEM MONITORING EVENT BRIDGE
// =============================================================================

/**
 * Bridges EventDrivenSystemMonitor events to foundation EventBus
 * 
 * Features:
 * - Re-emits all monitor events to EventBus
 * - Validates event names and prefixes if needed
 * - Registers module with DynamicEventRegistry
 * - Sends periodic heartbeats with uptime metadata
 * - Provides cleanup and stop functionality
 */
export class EventDrivenSystemMonitorBridge {
  private monitor: EventDrivenSystemMonitor;
  private eventBus: EventBus;
  private config: BridgeConfig;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private startTime: number;
  private eventListeners: Map<string, Function> = new Map();
  private isStarted = false;
  private logger = getLogger('monitoring-bridge');

  constructor(
    monitor: EventDrivenSystemMonitor,
    config: Partial<BridgeConfig> = {}
  ) {
    this.monitor = monitor;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.eventBus = EventBus.getInstance();
    this.startTime = Date.now();
  }

  /**
   * Start the bridge - register module and set up event forwarding
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      this.logger.info('monitoring-bridge:already-started', { 
        moduleId: this.config.moduleId 
      });
      return;
    }

    try {
      // Register this module with the dynamic event registry
      registerModuleWithEventBus(this.eventBus, {
        moduleId: this.config.moduleId,
        moduleName: 'System Monitoring',
        moduleType: 'monitoring',
        supportedEvents: [
          'system-monitoring:tracking-started',
          'system-monitoring:tracking-stopped',
          'system-monitoring:metrics',
          'system-monitoring:health',
          'system-monitoring:error',
          'telemetry:record-metric',
          'telemetry:record-histogram',
          'telemetry:record-gauge',
        ],
        metadata: {
          startTime: this.startTime,
          version: '1.0.0',
          bridgeType: 'event-driven-monitor',
        },
      });

      // Set up event listeners for all monitor events
      this.setupEventListeners();

      // Start heartbeat
      this.startHeartbeat();

      this.isStarted = true;

      this.logger.info('monitoring-bridge:started', {
        moduleId: this.config.moduleId,
        heartbeatInterval: this.config.heartbeatInterval,
        eventsToForward: this.getMonitoredEvents(),
      });

    } catch (error) {
      this.logger.error('monitoring-bridge:start-failed', {
        error: (error as Error).message,
        component: this.config.moduleId
      });
      throw error;
    }
  }

  /**
   * Stop the bridge and clean up resources
   */
  stop(): void {
    if (!this.isStarted) {
      return;
    }

    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Remove all event listeners
    this.cleanupEventListeners();

    this.isStarted = false;

    this.logger.info('monitoring-bridge:stopped', {
      moduleId: this.config.moduleId,
      uptime: Date.now() - this.startTime,
    });
  }

  /**
   * Get bridge status and metrics
   */
  getStatus(): {
    isStarted: boolean;
    uptime: number;
    moduleId: string;
    eventListenerCount: number;
  } {
    return {
      isStarted: this.isStarted,
      uptime: Date.now() - this.startTime,
      moduleId: this.config.moduleId,
      eventListenerCount: this.eventListeners.size,
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Set up listeners for all monitor events
   */
  private setupEventListeners(): void {
    const eventsToForward = this.getMonitoredEvents();

    for (const eventName of eventsToForward) {
      const listener = (payload: unknown) => {
        this.forwardEvent(eventName, payload);
      };

      // Store listener for cleanup
      this.eventListeners.set(eventName, listener);

      // Add listener to monitor
      this.monitor.addEventListener(eventName as any, listener);
    }
  }

  /**
   * Clean up all event listeners
   */
  private cleanupEventListeners(): void {
    // Note: EventDrivenSystemMonitor doesn't expose removeEventListener
    // so we rely on the monitor's own cleanup when it shuts down
    this.eventListeners.clear();
  }

  /**
   * Forward an event from monitor to EventBus
   */
  private forwardEvent(eventName: string, payload: unknown): void {
    try {
      // Validate event name
      let validatedEventName = eventName;
      if (!isValidEventName(eventName)) {
        // If not valid, prefix with system-monitoring:
        validatedEventName = eventName.startsWith('system-monitoring:') 
          ? eventName 
          : `system-monitoring:${eventName}`
        
        if (this.config.enableLogging) {
          this.logger.debug('monitoring-bridge:event-name-prefixed', {
            original: eventName,
            prefixed: validatedEventName,
          });
        }
      }

      // Emit to EventBus
      this.eventBus.emit(validatedEventName, payload);

      if (this.config.enableLogging) {
        this.logger.debug('EventBus event emitted', {
          event: validatedEventName,
          module: 'EventDrivenSystemMonitor'
        });
      }

    } catch (error) {
      this.logger.error('monitoring-bridge:forward-failed', {
        error: (error as Error).message,
        component: this.config.moduleId
      });
    }
  }

  /**
   * Start periodic heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const uptime = Date.now() - this.startTime;
      
      sendHeartbeatToEventBus(this.eventBus, this.config.moduleId, {
        uptime,
        status: 'active',
        eventCount: this.eventListeners.size,
        lastUpdate: new Date().toISOString(),
        bridgeVersion: '1.0.0',
      });

      if (this.config.enableLogging) {
        this.logger.debug('monitoring-bridge:heartbeat', {
          moduleId: this.config.moduleId,
          uptime,
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Get list of events to monitor and forward
   */
  private getMonitoredEvents(): string[] {
    return [
      'system-monitoring:tracking-started',
      'system-monitoring:tracking-stopped', 
      'system-monitoring:metrics',
      'system-monitoring:health',
      'system-monitoring:error',
      'telemetry:record-metric',
      'telemetry:record-histogram',
      'telemetry:record-gauge',
    ];
  }
}

// =============================================================================
// CONVENIENCE FACTORY FUNCTION
// =============================================================================

/**
 * Create and start a system monitoring bridge
 */
export async function createSystemMonitoringBridge(
  monitor: EventDrivenSystemMonitor,
  config?: Partial<BridgeConfig>
): Promise<EventDrivenSystemMonitorBridge> {
  const bridge = new EventDrivenSystemMonitorBridge(monitor, config);
  await bridge.start();
  return bridge;
}

/**
 * Create bridge with custom module ID
 */
export async function createCustomSystemMonitoringBridge(
  monitor: EventDrivenSystemMonitor,
  moduleId: string,
  heartbeatInterval = 5000
): Promise<EventDrivenSystemMonitorBridge> {
  return createSystemMonitoringBridge(monitor, {
    moduleId,
    heartbeatInterval,
    enableLogging: true,
  });
}

export default EventDrivenSystemMonitorBridge;