/**
 * @file Observer System
 * 
 * Simple observer pattern implementation.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('ObserverSystem');

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
export class SimpleObservable<T = unknown> implements Observable<T> {
  private observers: Observer<T>[] = [];

  addObserver(observer: Observer<T>): void {
    this.observers.push(observer);
    logger.debug('Observer added');
  }

  removeObserver(observer: Observer<T>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      logger.debug('Observer removed');
    }
  }

  notifyObservers(data: T): void {
    for (const observer of this.observers) {
      try {
        observer.update(data);
      } catch (error) {
        logger.error('Observer update failed:', error);
      }
    }
  }
}