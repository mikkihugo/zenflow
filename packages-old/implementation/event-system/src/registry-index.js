/**
 * @file Registry Index
 *
 * Simple registry index for the event system.
 */
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('RegistryIndex');
/**
 * Simple registry for managing indexed items.
 */
export class RegistryIndex {
    items = new Map();
    register(key, item) {
        this.items.set(key, item);
        logger.debug(`Item registered: ${key}`);
    }
    unregister(key) {
        const result = this.items.delete(key);
        if (result) {
            logger.debug(`Item unregistered: ${key}`);
        }
        return result;
    }
    get(key) {
        return this.items.get(key);
    }
    has(key) {
        return this.items.has(key);
    }
    keys() {
        return this.items.keys();
    }
    values() {
        return this.items.values();
    }
    clear() {
        this.items.clear();
        logger.debug('Registry cleared');
    }
}
