/**
 * @file System Event Manager - Concrete Implementation
 *
 * Concrete system event manager implementation.
 */

import type { Logger } from '@claude-zen/foundation';
import { BaseEventManager } from '../../core/base-event-manager';
import type { EventManagerConfig, SystemEvent } from '../../core/interfaces';

/**
 * Concrete system event manager implementation.
 */
export class SystemEventManager extends BaseEventManager {
  constructor(config: EventManagerConfig, logger?: Logger) {
    super(config, logger);
  }

  protected async processEvent<T extends SystemEvent>(event: T): Promise<void> {
    // Add system-specific event processing logic
    await super.processEvent(event);
  }
}