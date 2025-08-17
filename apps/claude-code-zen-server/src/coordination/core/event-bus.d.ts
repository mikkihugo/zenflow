/**
 * @file Event bus for coordinating system-wide events and messaging
 */
import { EventEmitter } from 'node:events';
export interface SystemEvent {
    id: string;
    type: string;
    payload: Record<string, unknown>;
    timestamp: Date;
    source: string;
}
export interface EventBusInterface {
    emit(eventName: string, ...args: unknown[]): boolean;
    emitSystemEvent(event: SystemEvent): boolean;
    on(eventType: string, handler: (event: SystemEvent) => void): this;
    off(eventType: string, handler: (event: SystemEvent) => void): this;
    once(eventType: string, handler: (event: SystemEvent) => void): this;
    removeAllListeners(eventType?: string): this;
}
export declare class EventBus extends EventEmitter implements EventBusInterface {
    private static instance;
    private eventHistory;
    private maxHistorySize;
    constructor();
    static getInstance(): EventBus;
    emitSystemEvent(event: SystemEvent): boolean;
    on(eventType: string, handler: (event: SystemEvent) => void): this;
    off(eventType: string, handler: (event: SystemEvent) => void): this;
    once(eventType: string, handler: (event: SystemEvent) => void): this;
    removeAllListeners(eventType?: string): this;
    getEventHistory(eventType?: string): SystemEvent[];
    clearHistory(): void;
}
export declare const eventBus: EventBus;
//# sourceMappingURL=event-bus.d.ts.map