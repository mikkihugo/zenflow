export const UEL_CONFIG = {
    DEFAULT_TIMEOUT: 5000,
    MAX_RETRIES: 3,
    EVENT_HISTORY_LIMIT: 100,
};
export const UEL_EVENTS = {
    INITIALIZED: 'uel:initialized',
    ERROR: 'uel:error',
    SHUTDOWN: 'uel:shutdown',
    RESTART: 'uel:restart',
};
export function createUELConfig(partial) {
    return {
        timeout: UEL_CONFIG.DEFAULT_TIMEOUT,
        retries: UEL_CONFIG.MAX_RETRIES,
        ...partial,
    };
}
export function isValidUELEvent(event) {
    return Object.values(UEL_EVENTS).includes(event);
}
//# sourceMappingURL=uel-shared.js.map