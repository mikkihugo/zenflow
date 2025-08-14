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
    get hasInstance() {
        return this.instance !== undefined;
    }
    get currentInstance() {
        return this.instance;
    }
}
//# sourceMappingURL=singleton-provider.js.map