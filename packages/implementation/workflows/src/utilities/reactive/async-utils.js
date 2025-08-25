/**
 * @fileoverview Async Utilities
 *
 * Professional async utilities using lodash-es.
 * Focused on function wrapping and async coordination.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { debounce, throttle } from 'lodash-es';
/**
 * Professional async utilities
 */
export class AsyncUtils {
    /**
     * Create debounced function
     */
    static debounce(func, wait) {
        return debounce(func, wait);
    }
    /**
     * Create throttled function
     */
    static throttle(func, wait) {
        return throttle(func, wait);
    }
    /**
     * Create promise-based delay
     */
    static createDelay(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    /**
     * Create timeout promise
     */
    static createTimeout(promise, milliseconds) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), milliseconds))
        ]);
    }
}
//# sourceMappingURL=async-utils.js.map