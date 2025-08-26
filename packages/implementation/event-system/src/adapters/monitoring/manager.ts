/**
 * @file Monitoring Event Manager - Concrete Implementation
 *
 * Concrete monitoring event manager implementation.
 */

import type { Logger } from '@claude-zen/foundation';
import { BaseEventManager } from '../../core/base-event-manager';
import type { EventManagerConfig, SystemEvent } from '../../core/interfaces';

/**
 * Concrete monitoring event manager implementation.
 */
export class MonitoringEventManager extends BaseEventManager {
  constructor(config: EventManagerConfig, logger?: Logger) {
    super(config, logger);
  }

  protected async processEvent<T extends SystemEvent>(event: T): Promise<void> {
    // Add monitoring-specific event processing logic
    await super.processEvent(event);
  }
}