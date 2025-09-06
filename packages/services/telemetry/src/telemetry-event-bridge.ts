/**
 * @fileoverview Telemetry Event Bridge
 *
 * Bridges EventDrivenTelemetryManager to foundation EventBus without modifying the original.
 * Maintains ZERO IMPORTS rule for telemetry-event-driven.ts while enabling EventBus integration.
 */

import { EventBus } from '@claude-zen/foundation';
import { EventLogger } from '@claude-zen/foundation/events';
import { isValidEventName } from '@claude-zen/foundation/events';
import type { EventDrivenTelemetryManager } from './telemetry-event-driven.js';

// Import TelemetryEvents interface from the event-driven module
interface TelemetryEvents {
  'telemetry:record-metric': { name: string; value: number; attributes?: Record<string, unknown>; timestamp: number; };
  'telemetry:record-histogram': { name: string; value: number; attributes?: Record<string, unknown>; timestamp: number; };
  'telemetry:record-gauge': { name: string; value: number; attributes?: Record<string, unknown>; timestamp: number; };
  'telemetry:record-event': { name: string; data?: unknown; timestamp: number; };
  'telemetry:start-trace': { name: string; traceId: string; attributes?: Record<string, unknown>; timestamp: number; };
  'telemetry:end-trace': { traceId: string; timestamp: number; };
  'telemetry:metrics': { requestId: string; metrics: Record<string, unknown>; timestamp: number; };
  'telemetry:traces': { requestId: string; traces: Record<string, unknown>; timestamp: number; };
  'telemetry:initialized': { requestId: string; success: boolean; serviceName: string; timestamp: number; };
  'telemetry:shutdown-complete': { requestId: string; success: boolean; timestamp: number; };
}

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
  moduleId: 'telemetry',
  heartbeatInterval: 5000, // 5 seconds
  enableLogging: true,
};

// =============================================================================
// TELEMETRY EVENT BRIDGE
// =============================================================================

/**
 * Bridges EventDrivenTelemetryManager events to foundation EventBus
 * 
 * Features:
 * - Re-emits all telemetry events to EventBus
 * - Validates event names and prefixes if needed
 * - Registers module with DynamicEventRegistry
 * - Sends periodic heartbeats with telemetry metadata
 * - Provides cleanup and stop functionality
 */
export class TelemetryEventBridge {
  private readonly telemetryManager: EventDrivenTelemetryManager;
  private readonly eventBus: EventBus;
  private readonly config: BridgeConfig;
  private readonly eventListeners: Map<string, (...args: unknown[]) => void> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isStarted = false;
  private readonly startTime = Date.now();

  constructor(
    telemetryManager: EventDrivenTelemetryManager,
    config: Partial<BridgeConfig> = {}
  ) {
    this.telemetryManager = telemetryManager;
    this.eventBus = EventBus.getInstance();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the bridge - register module and set up event forwarding
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      EventLogger.logError('telemetry-bridge:already-started', new Error('Bridge already started'), {
        component: this.config.moduleId
      });
      return;
    }

    try {
      // Register module with EventBus
      registerModuleWithEventBus(this.eventBus, {
        moduleId: this.config.moduleId,
        moduleName: 'Telemetry Event Manager',
        moduleType: 'telemetry-bridge',
        supportedEvents: this.getMonitoredEvents(),
        metadata: {
          version: '1.0.0',
          capabilities: ['metrics', 'tracing', 'event-logging'],
          startTime: this.startTime
        }
      });

      // Set up event forwarding from telemetry manager to EventBus
      await this.setupEventForwarding();

      // Start heartbeat
      this.startHeartbeat();

      this.isStarted = true;
      EventLogger.log('telemetry-bridge:started', {
        moduleId: this.config.moduleId,
        supportedEvents: this.getMonitoredEvents()
      });

    } catch (error) {
      EventLogger.logError('telemetry-bridge:start-failed', error as Error, {
        component: this.config.moduleId
      });
      throw error;
    }
  }

  /**
   * Stop the bridge and clean up resources
   */
  stop(): Promise<void> {
    if (!this.isStarted) {
      return Promise.resolve();
    }

    try {
      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Remove event listeners
      for (const [event, listener] of this.eventListeners.entries()) {
        this.eventBus.off(event, listener);
      }
      this.eventListeners.clear();

      this.isStarted = false;
      EventLogger.log('telemetry-bridge:stopped', {
        moduleId: this.config.moduleId
      });

      return Promise.resolve();
    } catch (error) {
      EventLogger.logError('telemetry-bridge:stop-failed', error as Error, {
        component: this.config.moduleId
      });
      return Promise.reject(error);
    }
  }

  /**
   * Set up event forwarding from telemetry manager to EventBus
   */
  private async setupEventForwarding(): Promise<void> {
    try {
      // Get the telemetry manager's event emitter
      const eventEmitter = await this.telemetryManager.getEventEmitter();

      if (!eventEmitter) {
        EventLogger.log('telemetry-bridge:no-event-emitter', {
          moduleId: this.config.moduleId
        });
        return;
      }

      // Forward all telemetry events to EventBus
      const eventsToForward = [
        'telemetry:record-metric',
        'telemetry:record-histogram',
        'telemetry:record-gauge',
        'telemetry:record-event',
        'telemetry:start-trace',
        'telemetry:end-trace',
        'telemetry:metrics',
        'telemetry:traces',
        'telemetry:initialized',
        'telemetry:shutdown-complete'
      ];

      // Clear existing listeners
      for (const [event, listener] of this.eventListeners.entries()) {
        this.eventBus.off(event, listener);
      }
      this.eventListeners.clear();

      // Set up new event forwarding
      for (const eventName of eventsToForward) {
        if (isValidEventName(eventName)) {
          const listener = (data: unknown) => {
            this.eventBus.emit(eventName, data);
          };
          
          eventEmitter.addEventListener(eventName as keyof TelemetryEvents, listener);
          this.eventListeners.set(eventName, listener);
        }
      }

      EventLogger.log('telemetry-bridge:event-forwarding-setup', {
        moduleId: this.config.moduleId,
        eventsForwarded: eventsToForward.length
      });

    } catch (error) {
      EventLogger.logError('telemetry-bridge:forwarding-setup-failed', error as Error, {
        component: this.config.moduleId
      });
    }
  }

  /**
   * Start periodic heartbeat to EventBus
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      try {
        const uptime = Date.now() - this.startTime;
        const metadata = {
          uptime,
          timestamp: new Date().toISOString(),
          status: 'healthy'
        };

        sendHeartbeatToEventBus(this.eventBus, this.config.moduleId, metadata);

      } catch (error) {
        EventLogger.logError('telemetry-bridge:heartbeat-failed', error as Error, {
          component: this.config.moduleId
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Get list of monitored events for registration
   */
  private getMonitoredEvents(): string[] {
    return [
      'telemetry:record-metric',
      'telemetry:record-histogram',
      'telemetry:record-gauge',
      'telemetry:record-event',
      'telemetry:start-trace',
      'telemetry:end-trace',
      'telemetry:metrics',
      'telemetry:traces',
      'telemetry:initialized',
      'telemetry:shutdown-complete'
    ];
  }

  /**
   * Get bridge status and metrics
   */
  getStatus() {
    return {
      moduleId: this.config.moduleId,
      isStarted: this.isStarted,
      uptime: Date.now() - this.startTime,
      eventListeners: this.eventListeners.size,
      heartbeatInterval: this.config.heartbeatInterval
    };
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createTelemetryEventBridge(
  telemetryManager: EventDrivenTelemetryManager,
  config?: Partial<BridgeConfig>
): TelemetryEventBridge {
  return new TelemetryEventBridge(telemetryManager, config);
}
