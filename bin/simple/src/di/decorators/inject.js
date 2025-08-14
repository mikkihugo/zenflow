import 'reflect-metadata';
import { getInjectionTokens, setInjectionTokens } from './injectable.ts';
export function inject(token) {
    return (target, propertyKey, parameterIndex) => {
        const existingTokens = getInjectionTokens(target) || [];
        while (existingTokens.length <= parameterIndex) {
            existingTokens.push(undefined);
        }
        existingTokens[parameterIndex] = token;
        setInjectionTokens(target, existingTokens);
    };
}
export function getInjectionToken(constructor, parameterIndex) {
    const tokens = getInjectionTokens(constructor);
    return tokens?.[parameterIndex];
}
export function hasInjectionToken(constructor, parameterIndex) {
    return getInjectionToken(constructor, parameterIndex) !== undefined;
}
//# sourceMappingURL=inject.js.map