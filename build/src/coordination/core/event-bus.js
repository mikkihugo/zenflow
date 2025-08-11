/**
 * @file Event bus for coordinating system-wide events and messaging
 */
import { EventEmitter } from 'node:events';
export class EventBus extends EventEmitter {
    static instance;
    eventHistory = [];
    maxHistorySize = 1000;
    constructor() {
        super();
        this.setMaxListeners(100); // Support many listeners
    }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    emitSystemEvent(event) {
        // Store in history
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
        // Emit to listeners
        return super.emit(event.type, event);
    }
    on(eventType, handler) {
        return super.on(eventType, handler);
    }
    off(eventType, handler) {
        return super.off(eventType, handler);
    }
    once(eventType, handler) {
        return super.once(eventType, handler);
    }
    removeAllListeners(eventType) {
        return super.removeAllListeners(eventType);
    }
    getEventHistory(eventType) {
        if (eventType) {
            return this.eventHistory.filter((event) => event.type === eventType);
        }
        return [...this.eventHistory];
    }
    clearHistory() {
        this.eventHistory = [];
    }
}
// Export singleton instance
export const eventBus = EventBus.getInstance();
