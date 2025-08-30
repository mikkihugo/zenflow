/**
 * @fileoverview Observable Utilities
 *
 * Professional reactive programming using RxJS library.
 * Focused on Observable creation and manipulation.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { BehaviorSubject, type Observable, Subject } from 'rxjs';
export declare class ObservableUtils {
  /**
   * Create delay observable
   */
  static delay(milliseconds: number): Observable<number>;
  /**
   * Create subject for event streaming
   */
  static createSubject<T>(): Subject<T>;
  /**
   * Create behavior subject with initial value
   */
  static createBehaviorSubject<T>(initialValue: T): BehaviorSubject<T>;
  /**
   * Create throttled stream
   */
  static throttleStream<T>(
    source: Observable<T>,
    milliseconds: number
  ): Observable<T>;
  /**
   * Create debounced stream
   */
  static debounceStream<T>(
    source: Observable<T>,
    milliseconds: number
  ): Observable<T>;
  /**
   * Filter distinct values in stream
   */
  static distinctStream<T>(source: Observable<T>): Observable<T>;
  /**
   * Create interval timer
   */
  static createInterval(milliseconds: number): Observable<number>;
  /**
   * Combine multiple observables
   */
  static combineStreams<T>(sources: Observable<T>[]): Observable<T[]>;
}
//# sourceMappingURL=observable-utils.d.ts.map
