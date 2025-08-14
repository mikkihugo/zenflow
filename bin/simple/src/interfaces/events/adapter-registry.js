class EventAdapterRegistry {
    adapters = new Map();
    register(name, loader) {
        this.adapters.set(name, loader);
    }
    async get(name) {
        const loader = this.adapters.get(name);
        if (!loader)
            return null;
        return loader();
    }
    getRegisteredNames() {
        return Array.from(this.adapters.keys());
    }
    has(name) {
        return this.adapters.has(name);
    }
}
export const adapterRegistry = new EventAdapterRegistry();
export function registerDefaultAdapters() {
    adapterRegistry.register('workflow', async () => {
        const module = await import('./adapters/workflow-event-factory.ts');
        return module.WorkflowEventFactory;
    });
    adapterRegistry.register('neural', async () => {
        const module = await import('./adapters/neural-event-factory.ts');
        return module.NeuralEventFactory;
    });
    adapterRegistry.register('memory', async () => {
        const module = await import('./adapters/memory-event-factory.ts');
        return module.MemoryEventFactory;
    });
    adapterRegistry.register('interface', async () => {
        const module = await import('./adapters/interface-event-factory.ts');
        return module.InterfaceEventFactory;
    });
    adapterRegistry.register('database', async () => {
        const module = await import('./adapters/database-event-factory.ts');
        return module.DatabaseEventFactory;
    });
}
export function initializeAdapterRegistry() {
    registerDefaultAdapters();
}
export default adapterRegistry;
//# sourceMappingURL=adapter-registry.js.map