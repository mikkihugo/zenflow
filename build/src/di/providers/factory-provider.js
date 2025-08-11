/**
 * Factory provider implementation.
 * Uses a factory function to create instances.
 */
/**
 * @file Factory-provider implementation.
 */
export class FactoryProvider {
    factory;
    disposeFn;
    type = 'transient';
    constructor(factory, disposeFn) {
        this.factory = factory;
        this.disposeFn = disposeFn;
    }
    create(container) {
        return this.factory(container);
    }
    async dispose(instance) {
        if (this.disposeFn) {
            await this.disposeFn(instance);
        }
    }
}
