export class DIScope {
    parent;
    scopedProviders = new Map();
    scopedInstances = new Map();
    children = new Set();
    constructor(parent) {
        this.parent = parent;
    }
    register(token, provider) {
        this.scopedProviders.set(token.symbol, provider);
    }
    resolve(token) {
        const scopedProvider = this.scopedProviders.get(token.symbol);
        if (scopedProvider) {
            return this.resolveScoped(token, scopedProvider);
        }
        return this.parent.resolve(token);
    }
    createScope() {
        const child = new DIScope(this);
        this.children.add(child);
        return child;
    }
    createChild() {
        return this.createScope();
    }
    async dispose() {
        const disposalPromises = [];
        for (const [symbol, instance] of this.scopedInstances) {
            const provider = this.scopedProviders.get(symbol);
            if (provider?.dispose) {
                disposalPromises.push(provider.dispose(instance));
            }
        }
        for (const child of this.children) {
            disposalPromises.push(child?.dispose());
        }
        await Promise.all(disposalPromises);
        this.scopedInstances.clear();
        this.scopedProviders.clear();
        this.children.clear();
    }
    isRegisteredInScope(token) {
        return this.scopedProviders.has(token.symbol);
    }
    resolveScoped(token, provider) {
        if (this.scopedInstances.has(token.symbol)) {
            return this.scopedInstances.get(token.symbol);
        }
        const instance = provider.create(this);
        this.scopedInstances.set(token.symbol, instance);
        return instance;
    }
}
//# sourceMappingURL=di-scope.js.map