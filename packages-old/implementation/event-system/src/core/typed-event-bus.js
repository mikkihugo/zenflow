/**
 * @file Typed Event Bus
 *
 * Simple typed event bus implementation.
 */
import { EventEmitter } from '@claude-zen/foundation';
/**
 * Typed event bus with type safety.
 */
export class TypedEventBus extends EventEmitter {
    busConfig;
    constructor(config = {}) {
        super();
        this.busConfig = {
            maxListeners: 100,
            enableLogging: false,
            ...config,
        };
    }
    getConfig() {
        return { ...this.busConfig };
    }
}
export default TypedEventBus;
