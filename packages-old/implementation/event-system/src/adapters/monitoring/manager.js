/**
 * @file Monitoring Event Manager - Concrete Implementation
 *
 * Concrete monitoring event manager implementation.
 */
import { BaseEventManager } from '../../core/base-event-manager';
/**
 * Concrete monitoring event manager implementation.
 */
export class MonitoringEventManager extends BaseEventManager {
    constructor(config, logger) {
        super(config, logger);
    }
    async processEvent(event) {
        // Add monitoring-specific event processing logic
        await super.processEvent(event);
    }
}
