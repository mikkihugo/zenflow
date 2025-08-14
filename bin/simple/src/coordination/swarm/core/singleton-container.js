import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-core-singleton-container');
class SingletonContainer {
    instances;
    factories;
    isDestroying;
    constructor() {
        this.instances = new Map();
        this.factories = new Map();
        this.isDestroying = false;
    }
    register(key, factory, options = {}) {
        if (typeof factory !== 'function') {
            throw new Error(`Factory for '${key}' must be a function`);
        }
        this.factories.set(key, {
            factory,
            lazy: options?.lazy !== false,
            singleton: options?.singleton !== false,
            dependencies: options?.dependencies || [],
        });
    }
    get(key) {
        if (this.isDestroying) {
            throw new Error(`Cannot get instance '${key}' during container destruction`);
        }
        if (this.instances.has(key)) {
            return this.instances.get(key);
        }
        const config = this.factories.get(key);
        if (!config) {
            throw new Error(`No factory registered for '${key}'`);
        }
        const dependencies = config?.dependencies?.map((dep) => this.get(dep));
        try {
            const instance = config?.factory(...dependencies);
            if (config?.singleton) {
                this.instances.set(key, instance);
            }
            return instance;
        }
        catch (error) {
            throw new Error(`Failed to create instance '${key}': ${error.message}`);
        }
    }
    has(key) {
        return this.factories.has(key) || this.instances.has(key);
    }
    clear(key) {
        const instance = this.instances.get(key);
        if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
        }
        this.instances.delete(key);
    }
    destroy() {
        this.isDestroying = true;
        const instances = Array.from(this.instances.entries()).reverse();
        for (const [key, instance] of instances) {
            try {
                if (instance && typeof instance.destroy === 'function') {
                    instance.destroy();
                }
            }
            catch (error) {
                logger.warn(`Error destroying instance '${key}':`, error.message);
            }
        }
        this.instances.clear();
        this.factories.clear();
    }
    reset() {
        this.destroy();
        this.isDestroying = false;
    }
    getStats() {
        return {
            registeredServices: this.factories.size,
            activeInstances: this.instances.size,
            services: Array.from(this.factories.keys()),
            instances: Array.from(this.instances.keys()),
        };
    }
}
let globalContainer = null;
export function getContainer() {
    if (!globalContainer) {
        globalContainer = new SingletonContainer();
        if (typeof process !== 'undefined') {
            process.on('exit', () => {
                if (globalContainer) {
                    globalContainer.destroy();
                    globalContainer = null;
                }
            });
            process.on('SIGINT', () => {
                if (globalContainer) {
                    globalContainer.destroy();
                    globalContainer = null;
                }
                process.exit(0);
            });
        }
    }
    return globalContainer;
}
export function resetContainer() {
    if (globalContainer) {
        globalContainer.destroy();
    }
    globalContainer = null;
}
export { SingletonContainer };
//# sourceMappingURL=singleton-container.js.map