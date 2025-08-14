export class ScopedProvider {
    factory;
    disposeFn;
    type = 'scoped';
    scopedInstances = new WeakMap();
    constructor(factory, disposeFn) {
        this.factory = factory;
        this.disposeFn = disposeFn;
    }
    create(container) {
        const scope = this.findScope(container);
        if (this.scopedInstances.has(scope)) {
            return this.scopedInstances.get(scope);
        }
        const instance = this.factory(container);
        this.scopedInstances.set(scope, instance);
        return instance;
    }
    async dispose(instance) {
        if (this.disposeFn) {
            await this.disposeFn(instance);
        }
    }
    findScope(container) {
        if ('parent' in container) {
            return container;
        }
        return container.createScope();
    }
    clearInstances() {
    }
}
//# sourceMappingURL=scoped-provider.js.map