/**
 * @file Type-Safe Event System
 *
 * Simple type-safe event system implementation.
 */
import { EventEmitter } from '@claude-zen/foundation';
/**
 * Type-safe event system.
 */
export class TypeSafeEventSystem extends EventEmitter {
    emitTyped(eventType, payload) {
        return this.emit(String(eventType), payload);
    }
    onTyped(eventType, listener) {
        return this.on(String(eventType), listener);
    }
    offTyped(eventType, listener) {
        return this.off(String(eventType), listener);
    }
}
