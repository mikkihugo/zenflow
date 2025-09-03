/**
 * @fileoverview Telemetry Event Bridge
 *
 * Bridges EventDrivenTelemetryManager to foundation EventBus without modifying the original.
 * Maintains ZERO IMPORTS rule for telemetry-event-driven.ts while enabling EventBus integration.
 */

import {
  EventBus,
  EventLogger,
  isValidEventName,
} from '@claude-zen/foundation';
import type { EventDrivenTelemetryManager } from './telemetry-event-driven.js';

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
  private readonly eventListeners: Map<string, Function> = new Map();
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
  async stop(): Promise<void> {
    if (!this.isStarted) {
      return;
    }

    try {
      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Remove event listeners
      this.eventListeners.forEach((listener, event) => {
        this.eventBus.off(event, listener);
      });
      this.eventListeners.clear();

      this.isStarted = false;
      EventLogger.log('telemetry-bridge:stopped', {
        moduleId: this.config.moduleId
      });

    } catch (error) {
      EventLogger.logError('telemetry-bridge:stop-failed', error as Error, {
        component: this.config.moduleId
      });
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
        'telemetry:shutdown'
      ];

      eventsToForward.forEach(eventName => {
        if (isValidEventName(eventName)) {
          const listener = (data: unknown) => {
            this.eventBus.emit(eventName, data);
          };
          
          eventEmitter.on(eventName, listener);
          this.eventListeners.set(eventName, listener);
        }
      });

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
      'telemetry:shutdown'
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

/**
 * Create and return a TelemetryEventBridge instance wired to the given telemetry manager.
 *
 * The returned bridge is constructed with the provided partial configuration merged against the bridge defaults.
 *
 * @param config - Optional partial BridgeConfig to override defaults (e.g., moduleId, heartbeatInterval, enableLogging)
 * @returns A new TelemetryEventBridge bound to the provided telemetry manager
 */
export function createTelemetryEventBridge(
  telemetryManager: EventDrivenTelemetryManager,
  config?: Partial<BridgeConfig>
): TelemetryEventBridge {
  return new TelemetryEventBridge(telemetryManager, config);
}

/**
 * Returns the default BridgeConfig for the TelemetryEventBridge.
 *
 * The returned object is a shallow copy of the module's DEFAULT_CONFIG and can
 * be safely mutated by callers without affecting the internal default.
 *
 * @returns A default BridgeConfig object
 */
export function getDefaultTelemetryBridgeConfig(): BridgeConfig {
  return { ...DEFAULT_CONFIG };
}