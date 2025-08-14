import { DIContainer } from './container/di-container.ts';
import { ScopedProvider } from './providers/scoped-provider.ts';
import { SingletonProvider } from './providers/singleton-provider.ts';
import { TransientProvider } from './providers/transient-provider.ts';
export { DIContainer } from './container/di-container.ts';
export { DIScope } from './container/di-scope.ts';
export { getInjectionToken, hasInjectionToken, inject, } from './decorators/inject.ts';
export { getInjectionMetadata, injectable, isInjectable, } from './decorators/injectable.ts';
export { FactoryProvider } from './providers/factory-provider.ts';
export { ScopedProvider } from './providers/scoped-provider.ts';
export { SingletonProvider } from './providers/singleton-provider.ts';
export { TransientProvider } from './providers/transient-provider.ts';
export { CORE_TOKENS } from './tokens/core-tokens.ts';
export { NEURAL_TOKENS } from './tokens/neural-tokens.ts';
export { SWARM_TOKENS } from './tokens/swarm-tokens.ts';
export { createToken, createTokenFromClass, getTokenName, isDIToken, tokensEqual, } from './tokens/token-factory.ts';
export * from './types/di-types.ts';
let globalContainer;
export function getGlobalContainer() {
    if (!globalContainer) {
        globalContainer = new DIContainer();
    }
    return globalContainer;
}
export function setGlobalContainer(container) {
    globalContainer = container;
}
export function clearGlobalContainer() {
    globalContainer = undefined;
}
export class DIContainerBuilder {
    container = new DIContainer();
    singleton(token, factory) {
        this.container.register(token, new SingletonProvider(factory));
        return this;
    }
    transient(token, factory) {
        this.container.register(token, new TransientProvider(factory));
        return this;
    }
    scoped(token, factory) {
        this.container.register(token, new ScopedProvider(factory));
        return this;
    }
    build() {
        return this.container;
    }
}
export function createContainerBuilder() {
    return new DIContainerBuilder();
}
//# sourceMappingURL=index.js.map