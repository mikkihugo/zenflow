/**
 * @file Type-Safe Event System
 *
 * Simple type-safe event system implementation.
 */
import { EventEmitter } from '@claude-zen/foundation';
export interface TypedEvent<T = unknown> {
    type: string;
    payload: T;
    timestamp: Date;
    id: string;
}
/**
 * Type-safe event system.
 */
export declare class TypeSafeEventSystem<TEventMap extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter {
    emitTyped<K extends keyof TEventMap>(eventType: K, payload: TEventMap[K]): boolean;
    onTyped<K extends keyof TEventMap>(eventType: K, listener: (payload: TEventMap[K]) => void): this;
    offTyped<K extends keyof TEventMap>(eventType: K, listener: (payload: TEventMap[K]) => void): this;
}
//# sourceMappingURL=type-safe-event-system.d.ts.map