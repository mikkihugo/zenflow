import { expect, vi } from 'vitest';
expect.extend({
    toBeWithinRange(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true,
            };
        }
        return {
            message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
            pass: false,
        };
    },
    toHaveBeenCalledWithObjectContaining(received, expected) {
        const pass = received.mock.calls.some((call) => call.some((arg) => typeof arg === 'object' &&
            arg !== null &&
            Object.keys(expected).every((key) => key in arg && arg[key] === expected[key])));
        return {
            message: () => pass
                ? `expected mock not to have been called with object containing ${JSON.stringify(expected)}`
                : `expected mock to have been called with object containing ${JSON.stringify(expected)}`,
            pass,
        };
    },
});
globalThis.testUtils = {
    createMockLogger: () => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
    }),
    createMockConfig: (overrides = {}) => ({
        database: {
            type: 'sqlite',
            path: ':memory:',
            ...overrides.database,
        },
        memory: {
            type: 'memory',
            maxSize: 1000,
            ...overrides.memory,
        },
        neural: {
            enabled: false,
            ...overrides.neural,
        },
        ...overrides,
    }),
    wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    createTempDir: async () => {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const os = await import('node:os');
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-zen-test-'));
        return tempDir;
    },
    cleanupTempDir: async (dirPath) => {
        const fs = await import('node:fs/promises');
        try {
            await fs.rm(dirPath, { recursive: true, force: true });
        }
        catch (_error) {
        }
    },
};
const originalConsole = { ...console };
globalThis.restoreConsole = () => {
    Object.assign(console, originalConsole);
};
console.log = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();
console.info = vi.fn();
console.debug = vi.fn();
process.env['NODE_ENV'] = 'test';
process.env['CLAUDE_ZEN_TEST_MODE'] = 'true';
vi.setConfig({ testTimeout: 30000 });
import { domainMatchers } from '../src/__tests__/helpers/test-utils.js';
expect.extend(domainMatchers);
//# sourceMappingURL=vitest-setup.js.map