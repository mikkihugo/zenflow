/**
 * Singleton provider implementation.
 * Ensures only one instance of a service exists throughout the application lifetime.
 */
/**
 * @file Singleton-provider implementation.
 */
export class SingletonProvider {
    factory;
    disposeFn;
    type = 'singleton';
    instance;
    isCreating = false;
    constructor(factory, disposeFn) {
        this.factory = factory;
        this.disposeFn = disposeFn;
    }
    create(container) {
        if (this.instance !== undefined) {
            return this.instance;
        }
        if (this.isCreating) {
            throw new Error('Circular dependency detected during singleton creation');
        }
        this.isCreating = true;
        try {
            this.instance = this.factory(container);
            return this.instance;
        }
        finally {
            this.isCreating = false;
        }
    }
    async dispose(instance) {
        if (this.disposeFn) {
            await this.disposeFn(instance);
        }
        this.instance = undefined;
    }
    /**
     * Check if instance has been created.
     */
    get hasInstance() {
        return this.instance !== undefined;
    }
    /**
     * Get the instance without creating it (returns undefined if not created).
     */
    get currentInstance() {
        return this.instance;
    }
}
