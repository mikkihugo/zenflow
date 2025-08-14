export * from './use-config.ts';
export { useConfig, } from './use-config.ts';
export * from './use-swarm-status.ts';
export { useSwarmStatus, } from './use-swarm-status.ts';
export const StateHookUtils = {
    debounce: (func, delay) => {
        let timeoutId;
        return ((...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        });
    },
    throttle: (func, delay) => {
        let lastCall = 0;
        return ((...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func(...args);
            }
        });
    },
};
//# sourceMappingURL=index.js.map