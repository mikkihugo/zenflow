/**
 * @fileoverview Agent Monitoring Event Bridge
 *
 * Bridges EventDrivenIntelligenceSystem to foundation EventBus without modifying the original.
 * Maintains ZERO IMPORTS rule for intelligence-system-event-driven.ts while enabling EventBus integration.
 */

import {
  EventBus,
  EventLogger,
  isValidEventName,
} from '@claude-zen/foundation';
import type { EventDrivenIntelligenceSystem } from './intelligence-system-event-driven.js';

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
  moduleId: 'agent-monitoring',
  heartbeatInterval: 5000, // 5 seconds
  enableLogging: true,
};

// =============================================================================
// AGENT MONITORING EVENT BRIDGE
// =============================================================================

/**
 * Bridges EventDrivenIntelligenceSystem events to foundation EventBus
 * 
 * Features:
 * - Re-emits all agent monitoring events to EventBus
 * - Validates event names and prefixes if needed
 * - Registers module with DynamicEventRegistry
 * - Sends periodic heartbeats with agent monitoring metadata
 * - Provides cleanup and stop functionality
 */
export class AgentMonitoringBridge {
  private readonly intelligenceSystem: EventDrivenIntelligenceSystem;
  private readonly eventBus: EventBus;
  private readonly config: BridgeConfig;
  private readonly eventListeners: Map<string, Function> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isStarted = false;
  private readonly startTime = Date.now();

  constructor(
    intelligenceSystem: EventDrivenIntelligenceSystem,
    config: Partial<BridgeConfig> = {}
  ) {
    this.intelligenceSystem = intelligenceSystem;
    this.eventBus = EventBus.getInstance();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the bridge - register module and set up event forwarding
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      EventLogger.logError('agent-monitoring-bridge:already-started', new Error('Bridge already started'), {
        component: this.config.moduleId
      });
      return;
    }

    try {
      // Register module with EventBus
      registerModuleWithEventBus(this.eventBus, {
        moduleId: this.config.moduleId,
        moduleName: 'Agent Monitoring Intelligence System',
        moduleType: 'monitoring-bridge',
        supportedEvents: this.getMonitoredEvents(),
        metadata: {
          bridgeVersion: '1.0.0',
          features: ['agent-health', 'task-prediction', 'performance-tracking', 'system-metrics'],
          startTime: this.startTime,
        },
      });

      // Set up event forwarding
      this.setupEventListeners();

      // Start heartbeat
      this.startHeartbeat();

      this.isStarted = true;

      EventLogger.log('agent-monitoring-bridge:started', {
        moduleId: this.config.moduleId,
        heartbeatInterval: this.config.heartbeatInterval,
        eventsToForward: this.getMonitoredEvents(),
      });

    } catch (error) {
      EventLogger.logError('agent-monitoring-bridge:start-failed', error as Error, {
        component: this.config.moduleId
      });
      // Fail-open: Don't throw, just log
    }
  }

  /**
   * Stop the bridge and clean up all listeners
   */
  async stop(): Promise<void> {
    if (!this.isStarted) return;

    try {
      // Clear heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Remove all event listeners
      this.eventListeners.clear();

      this.isStarted = false;

      EventLogger.log('agent-monitoring-bridge:stopped', {
        moduleId: this.config.moduleId,
        uptime: Date.now() - this.startTime,
      });

    } catch (error) {
      EventLogger.logError('agent-monitoring-bridge:stop-failed', error as Error, {
        component: this.config.moduleId
      });
      // Fail-open: Don't throw, just log
    }
  }

  /**
   * Set up listeners for all intelligence system events
   */
  private setupEventListeners(): void {
    const eventsToForward = this.getMonitoredEvents();

    eventsToForward.forEach((eventName) => {
      const listener = (payload: unknown) => {
        this.forwardEvent(eventName, payload);
      };

      // Store listener for cleanup
      this.eventListeners.set(eventName, listener);

      // Add listener to intelligence system
      this.intelligenceSystem.addEventListener(eventName as any, listener);
    });
  }

  /**
   * Forward an event from intelligence system to EventBus
   */
  private forwardEvent(eventName: string, payload: unknown): void {
    try {
      // Validate and normalize event name
      const validatedEventName = this.validateAndNormalizeEventName(eventName);
      if (!validatedEventName) {
        EventLogger.logError(
          'agent-monitoring-bridge:invalid-event-name',
          new Error(`Invalid event name: ${eventName}`),
          { component: this.config.moduleId }
        );
        return;
      }

      // Emit to EventBus
      this.eventBus.emit(validatedEventName, payload);

      if (this.config.enableLogging) {
        EventLogger.logFlow(
          'EventDrivenIntelligenceSystem',
          'EventBus',
          validatedEventName
        );
      }

    } catch (error) {
      EventLogger.logError(
        'agent-monitoring-bridge:forward-failed',
        error as Error,
        { component: this.config.moduleId }
      );
    }
  }

  /**
   * Validate and normalize event name with agent-monitoring prefix
   */
  private validateAndNormalizeEventName(eventName: string): string | null {
    // Check if already has agent-monitoring prefix (with or without space)
    if (eventName.startsWith('agent-monitoring:') || eventName.startsWith('agent-monitoring:
          ) {
      // For EventBus, normalize to use colon without space
      const normalizedName = eventName.replace('agent-monitoring: ', 'agent-monitoring:');
      return isValidEventName(normalizedName) ? normalizedName : null;
    }

    // Add agent-monitoring prefix for validation
    const normalizedName = `agent-monitoring:${eventName}`
    return isValidEventName(normalizedName) ? normalizedName : null;
  }

  /**
   * Start periodic heartbeat
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      try {
        const metadata = {
          uptime: Date.now() - this.startTime,
          isActive: this.isStarted,
          eventListenerCount: this.eventListeners.size,
          bridgeHealth: 'healthy',
          lastHeartbeat: new Date().toISOString(),
        };

        sendHeartbeatToEventBus(this.eventBus, this.config.moduleId, metadata);

        if (this.config.enableLogging) {
          EventLogger.log('agent-monitoring-bridge:heartbeat', {
            moduleId: this.config.moduleId,
            ...metadata,
          });
        }
      } catch (error) {
        EventLogger.logError(
          'agent-monitoring-bridge:heartbeat-failed',
          error as Error,
          { component: this.config.moduleId }
        );
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Get list of events to monitor and forward
   */
  private getMonitoredEvents(): string[] {
    return [
      'agent-monitoring: agent-health',
      'agent-monitoring: task-prediction',
      'agent-monitoring: system-health',
      'agent-monitoring: performance-updated',
      'agent-monitoring: metrics',
      'agent-monitoring: initialized',
      'agent-monitoring: error',
    ];
  }

  /**
   * Get bridge status and metrics
   */
  getStatus() {
    return {
      isStarted: this.isStarted,
      moduleId: this.config.moduleId,
      uptime: Date.now() - this.startTime,
      eventListenerCount: this.eventListeners.size,
      heartbeatActive: this.heartbeatInterval !== null,
      config: this.config,
    };
  }
}

// =============================================================================
// FACTORY AND UTILITIES
// =============================================================================

/**
 * Create and start an agent monitoring bridge
 */
export async function createAgentMonitoringBridge(
  intelligenceSystem: EventDrivenIntelligenceSystem,
  config?: Partial<BridgeConfig>
): Promise<AgentMonitoringBridge> {
  const bridge = new AgentMonitoringBridge(intelligenceSystem, config);
  await bridge.start();
  return bridge;
}

/**
 * Create bridge with custom configuration
 */
export function createAgentMonitoringBridgeConfig(overrides: Partial<BridgeConfig>): BridgeConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}