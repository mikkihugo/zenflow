/**
 * @fileoverview Knowledge Event Bridge
 *
 * Bridges EventDrivenKnowledgeSystem to foundation EventBus without modifying the original.
 * Maintains ZERO IMPORTS rule for knowledge-event-driven.ts while enabling EventBus integration.
 */

import {
  EventBus,
  EventLogger,
  isValidEventName,
} from '@claude-zen/foundation';
import type { EventDrivenKnowledgeSystem } from './knowledge-event-driven.js';

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
  moduleId: 'knowledge',
  heartbeatInterval: 5000, // 5 seconds
  enableLogging: true,
};

// =============================================================================
// KNOWLEDGE EVENT BRIDGE
// =============================================================================

/**
 * Bridges EventDrivenKnowledgeSystem events to foundation EventBus
 * 
 * Features:
 * - Re-emits all knowledge events to EventBus
 * - Validates event names and prefixes if needed
 * - Registers module with DynamicEventRegistry
 * - Sends periodic heartbeats with knowledge metadata
 * - Provides cleanup and stop functionality
 */
export class KnowledgeEventBridge {
  private readonly knowledgeSystem: EventDrivenKnowledgeSystem;
  private readonly eventBus: EventBus;
  private readonly config: BridgeConfig;
  private readonly eventListeners: Map<string, Function> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isStarted = false;
  private readonly startTime = Date.now();

  constructor(
    knowledgeSystem: EventDrivenKnowledgeSystem,
    config: Partial<BridgeConfig> = {}
  ) {
    this.knowledgeSystem = knowledgeSystem;
    this.eventBus = EventBus.getInstance();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the bridge - register module and set up event forwarding
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      EventLogger.logError('knowledge-bridge:already-started', new Error('Bridge already started'), {
        component: this.config.moduleId
      });
      return;
    }

    try {
      // Register module with EventBus
      registerModuleWithEventBus(this.eventBus, {
        moduleId: this.config.moduleId,
        moduleName: 'Knowledge Management System',
        moduleType: 'knowledge-bridge',
        supportedEvents: this.getMonitoredEvents(),
        metadata: {
          version: '1.0.0',
          capabilities: ['knowledge-storage', 'knowledge-query', 'knowledge-search', 'fact-system'],
          startTime: this.startTime
        }
      });

      // Set up event forwarding from knowledge system to EventBus
      await this.setupEventForwarding();

      // Start heartbeat
      this.startHeartbeat();

      this.isStarted = true;
      EventLogger.log('knowledge-bridge:started', {
        moduleId: this.config.moduleId,
        supportedEvents: this.getMonitoredEvents()
      });

    } catch (error) {
      EventLogger.logError('knowledge-bridge:start-failed', error as Error, {
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
      for (const [event, listener] of this.eventListeners.entries()) {
        this.eventBus.off(event, listener);
      }
      this.eventListeners.clear();

      this.isStarted = false;
      EventLogger.log('knowledge-bridge:stopped', {
        moduleId: this.config.moduleId
      });

    } catch (error) {
      EventLogger.logError('knowledge-bridge:stop-failed', error as Error, {
        component: this.config.moduleId
      });
    }
  }

  /**
   * Set up event forwarding from knowledge system to EventBus
   */
  private async setupEventForwarding(): Promise<void> {
    try {
      // Get the knowledge system's event emitter
      const eventEmitter = await this.knowledgeSystem.getEventEmitter();

      if (!eventEmitter) {
        EventLogger.log('knowledge-bridge:no-event-emitter', {
          moduleId: this.config.moduleId
        });
        return;
      }

      // Forward all knowledge events to EventBus
      const eventsToForward = [
        'knowledge:item-stored',
        'knowledge:item',
        'knowledge:query-results',
        'knowledge:item-updated',
        'knowledge:item-deleted',
        'knowledge:stats',
        'knowledge:search-results',
        'knowledge:initialized',
        'knowledge:error'
      ];

      for (const eventName of eventsToForward) {
        if (isValidEventName(eventName)) {
          const listener = (data: unknown) => {
            this.eventBus.emit(eventName, data);
          };
          
          eventEmitter.on(eventName, listener);
          this.eventListeners.set(eventName, listener);
        }
      }

      EventLogger.log('knowledge-bridge:event-forwarding-setup', {
        moduleId: this.config.moduleId,
        eventsForwarded: eventsToForward.length
      });

    } catch (error) {
      EventLogger.logError('knowledge-bridge:forwarding-setup-failed', error as Error, {
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
        EventLogger.logError('knowledge-bridge:heartbeat-failed', error as Error, {
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
      'knowledge:item-stored',
      'knowledge:item',
      'knowledge:query-results',
      'knowledge:item-updated',
      'knowledge:item-deleted',
      'knowledge:stats',
      'knowledge:search-results',
      'knowledge:initialized',
      'knowledge:error'
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
 * Create a knowledge event bridge
 */
export function createKnowledgeEventBridge(
  knowledgeSystem: EventDrivenKnowledgeSystem,
  config?: Partial<BridgeConfig>
): KnowledgeEventBridge {
  return new KnowledgeEventBridge(knowledgeSystem, config);
}

/**
 * Get default knowledge event bridge configuration
 */
export function getDefaultKnowledgeBridgeConfig(): BridgeConfig {
  return { ...DEFAULT_CONFIG };
}
