/**
 * Transient provider implementation.
 * Creates a new instance every time the service is resolved.
 */
/**
 * @file Transient-provider implementation.
 */
export class TransientProvider {
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
