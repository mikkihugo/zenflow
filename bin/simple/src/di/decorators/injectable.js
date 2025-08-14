import 'reflect-metadata';
const INJECTION_TOKENS_KEY = Symbol('injection_tokens');
const INJECTABLE_KEY = Symbol('injectable');
export function injectable(constructor) {
    Reflect.defineMetadata(INJECTABLE_KEY, true, constructor);
    const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) || [];
    const injectionTokens = getInjectionTokens(constructor) || new Array(paramTypes.length);
    setInjectionMetadata(constructor, {
        parameterTypes: paramTypes,
        injectionTokens: injectionTokens,
    });
    return constructor;
}
export function inject(token) {
    return (target, _propertyKey, parameterIndex) => {
        const existingTokens = Reflect.getMetadata(INJECTION_TOKENS_KEY, target) || [];
        existingTokens[parameterIndex] = token;
        Reflect.defineMetadata(INJECTION_TOKENS_KEY, existingTokens, target);
    };
}
export function isInjectable(constructor) {
    return Reflect.getMetadata(INJECTABLE_KEY, constructor) === true;
}
export function getInjectionTokens(constructor) {
    return Reflect.getMetadata(INJECTION_TOKENS_KEY, constructor);
}
export function setInjectionTokens(constructor, tokens) {
    Reflect.defineMetadata(INJECTION_TOKENS_KEY, tokens, constructor);
}
export function getInjectionMetadata(constructor) {
    const parameterTypes = Reflect.getMetadata('design:paramtypes', constructor);
    const injectionTokens = getInjectionTokens(constructor);
    if (!parameterTypes) {
        return undefined;
    }
    return {
        parameterTypes,
        injectionTokens: injectionTokens || new Array(parameterTypes.length),
    };
}
export function setInjectionMetadata(constructor, metadata) {
    Reflect.defineMetadata('design:paramtypes', metadata?.parameterTypes, constructor);
    setInjectionTokens(constructor, metadata?.injectionTokens);
}
export function copyMetadata(source, target) {
    const keys = Reflect.getMetadataKeys(source);
    for (const key of keys) {
        const metadata = Reflect.getMetadata(key, source);
        Reflect.defineMetadata(key, metadata, target);
    }
}
//# sourceMappingURL=injectable.js.map