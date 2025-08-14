import { EventEmitter } from 'node:events';
export class EventBus extends EventEmitter {
    static instance;
    eventHistory = [];
    maxHistorySize = 1000;
    constructor() {
        super();
        this.setMaxListeners(100);
    }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    emitSystemEvent(event) {
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
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
export const eventBus = EventBus.getInstance();
//# sourceMappingURL=event-bus.js.map