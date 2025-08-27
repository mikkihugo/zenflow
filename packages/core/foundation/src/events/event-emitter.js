/**
 * @file Fully Typed Event Emitter
 *
 * Complete EventEmitter replacement with full TypeScript typing.
 * Drop-in replacement for eventemitter3 with better performance and typing.
 */
import { EventEmitter as NodeEventEmitter } from 'events';
/**
 * Fully typed EventEmitter that's a complete drop-in replacement for eventemitter3.
 * Provides superior TypeScript typing and performance optimizations.
 *
 * Compatible with Node.js EventEmitter but with better typing.
 */
export class EventEmitter extends NodeEventEmitter {
    constructor(options) {
        super(options);
        this.setMaxListeners(100);
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    /**
     * Typed on method - supports both typed and untyped usage
     */
    on(event, listener) {
        return super.on(event, listener);
    }
    /**
     * Typed once method - supports both typed and untyped usage
     */
    once(event, listener) {
        return super.once(event, listener);
    }
    /**
     * Typed off method - supports both typed and untyped usage
     */
    off(event, listener) {
        return super.off(event, listener);
    }
    /**
     * Typed removeListener method - supports both typed and untyped usage
     */
    removeListener(event, listener) {
        return super.removeListener(event, listener);
    }
    /**
     * Typed listeners method - supports both typed and untyped usage
     */
    listeners(event) {
        return super.listeners(event);
    }
    /**
     * Typed listenerCount method - supports both typed and untyped usage
     */
    listenerCount(event) {
        return super.listenerCount(event);
    }
}
export default EventEmitter;
