/**
 * @file Observer System
 *
 * Simple observer pattern implementation.
 */
export interface Observer<T = unknown> {
    update(data: T): void;
}
export interface Observable<T = unknown> {
    addObserver(observer: Observer<T>): void;
    removeObserver(observer: Observer<T>): void;
    notifyObservers(data: T): void;
}
/**
 * Simple observable implementation.
 */
export declare class SimpleObservable<T = unknown> implements Observable<T> {
    private observers;
    addObserver(observer: Observer<T>): void;
    removeObserver(observer: Observer<T>): void;
    notifyObservers(data: T): void;
}
//# sourceMappingURL=observer-system.d.ts.map