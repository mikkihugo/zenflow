/**
 * @fileoverview Observable Utilities
 *
 * Professional reactive programming using RxJS library.
 * Focused on Observable creation and manipulation.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { Subject, BehaviorSubject, timer, interval, combineLatest } from 'rxjs';
import {
  throttleTime,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
/**
 * Professional Observable utilities
 */
export class ObservableUtils {
  /**
   * Create delay observable
   */
  static delay(milliseconds) {
    return timer(milliseconds);
  }
  /**
   * Create subject for event streaming
   */
  static createSubject() {
    return new Subject();
  }
  /**
   * Create behavior subject with initial value
   */
  static createBehaviorSubject(initialValue) {
    return new BehaviorSubject(initialValue);
  }
  /**
   * Create throttled stream
   */
  static throttleStream(source, milliseconds) {
    return source.pipe(throttleTime(milliseconds));
  }
  /**
   * Create debounced stream
   */
  static debounceStream(source, milliseconds) {
    return source.pipe(debounceTime(milliseconds));
  }
  /**
   * Filter distinct values in stream
   */
  static distinctStream(source) {
    return source.pipe(distinctUntilChanged());
  }
  /**
   * Create interval timer
   */
  static createInterval(milliseconds) {
    return interval(milliseconds);
  }
  /**
   * Combine multiple observables
   */
  static combineStreams(sources) {
    return combineLatest(sources);
  }
}
//# sourceMappingURL=observable-utils.js.map
