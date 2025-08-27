/**
 * @file Observer System
 *
 * Simple observer pattern implementation.
 */
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('ObserverSystem');
/**
 * Simple observable implementation.
 */
export class SimpleObservable {
    observers = [];
    addObserver(observer) {
        this.observers.push(observer);
        logger.debug('Observer added');
    }
    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
            logger.debug('Observer removed');
        }
    }
    notifyObservers(data) {
        for (const observer of this.observers) {
            try {
                observer.update(data);
            }
            catch (error) {
                logger.error('Observer update failed:', error);
            }
        }
    }
}
