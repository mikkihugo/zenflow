import { randomBytes } from 'node:crypto';
export function generateId() {
    return randomBytes(16).toString('hex');
}
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await sleep(baseDelay * 2 ** i);
            }
        }
    }
    throw lastError;
}
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
export function isEmpty(value) {
    if (value == null)
        return true;
    if (typeof value === 'string')
        return value.length === 0;
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
}
//# sourceMappingURL=helpers.js.map