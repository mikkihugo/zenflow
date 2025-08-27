/**
 * @file Typed Event Bus
 *
 * Simple typed event bus implementation.
 */
import { EventEmitter } from '@claude-zen/foundation';
export interface TypedEventBusConfig {
    maxListeners?: number;
    enableLogging?: boolean;
}
/**
 * Typed event bus with type safety.
 */
export declare class TypedEventBus extends EventEmitter {
    private busConfig;
    constructor(config?: TypedEventBusConfig);
    getConfig(): TypedEventBusConfig;
}
export default TypedEventBus;
//# sourceMappingURL=typed-event-bus.d.ts.map