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
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number;
  ):T & { cancel(): void; flush(): void} {
    return debounce(func, wait) as unknown as T & {
      cancel():void;
      flush():void;
};
}
  /**
   * Create throttled function
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ):T & { cancel(): void; flush(): void} {
    return throttle(func, wait) as unknown as T & {
      cancel():void;
      flush():void;
};
}
  /**
   * Create promise-based delay
   */
  static createDelay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds);
}
  /**
   * Create timeout promise
   */
  static createTimeout<T>(
    promise: Promise<T>,
    milliseconds: number
  ):Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_resolve, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), milliseconds)';
      ),
]);
};)};;
