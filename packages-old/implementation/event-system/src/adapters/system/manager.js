/**
 * @file System Event Manager - Concrete Implementation
 *
 * Concrete system event manager implementation.
 */
import { BaseEventManager } from '../../core/base-event-manager';
/**
 * Concrete system event manager implementation.
 */
export class SystemEventManager extends BaseEventManager {
    constructor(config, logger) {
        super(config, logger);
    }
    async processEvent(event) {
        // Add system-specific event processing logic
        await super.processEvent(event);
    }
}
