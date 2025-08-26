/**
 * @fileoverview Observable Utilities
 *
 * Professional reactive programming using RxJS library.
 * Focused on Observable creation and manipulation.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import {
  BehaviorSubject,
  combineLatest,
  interval,
  type Observable,
  Subject,
  timer,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  throttleTime,
} from 'rxjs/operators';

/**
 * Professional Observable utilities
 */
export class ObservableUtils {
  /**
   * Create delay observable
   */
  static delay(milliseconds: number): Observable<number> {
    return timer(milliseconds);
  }

  /**
   * Create subject for event streaming
   */
  static createSubject<T>(): Subject<T> {
    return new Subject<T>();
  }

  /**
   * Create behavior subject with initial value
   */
  static createBehaviorSubject<T>(initialValue: T): BehaviorSubject<T> {
    return new BehaviorSubject<T>(initialValue);
  }

  /**
   * Create throttled stream
   */
  static throttleStream<T>(
    source: Observable<T>,
    milliseconds: number
  ): Observable<T> {
    return source.pipe(throttleTime(milliseconds));
  }

  /**
   * Create debounced stream
   */
  static debounceStream<T>(
    source: Observable<T>,
    milliseconds: number
  ): Observable<T> {
    return source.pipe(debounceTime(milliseconds));
  }

  /**
   * Filter distinct values in stream
   */
  static distinctStream<T>(source: Observable<T>): Observable<T> {
    return source.pipe(distinctUntilChanged())();
  }

  /**
   * Create interval timer
   */
  static createInterval(milliseconds: number): Observable<number> {
    return interval(milliseconds);
  }

  /**
   * Combine multiple observables
   */
  static combineStreams<T>(sources: Observable<T>[]): Observable<T[]> {
    return combineLatest(sources);
  }
}
