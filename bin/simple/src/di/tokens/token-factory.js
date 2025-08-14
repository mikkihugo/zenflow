export function createToken(name, type) {
    return {
        symbol: Symbol(name),
        name,
        ...(type !== undefined && { type }),
    };
}
export function createTokenFromClass(constructor) {
    return createToken(constructor.name, constructor);
}
export function isDIToken(value) {
    return (typeof value === 'object' &&
        value !== null &&
        typeof value.symbol === 'symbol' &&
        typeof value.name === 'string');
}
export function getTokenName(token) {
    return token.name;
}
export function tokensEqual(token1, token2) {
    return token1.symbol === token2.symbol;
}
//# sourceMappingURL=token-factory.js.map