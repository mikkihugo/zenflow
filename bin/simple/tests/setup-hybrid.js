import 'jest-extended';
import { vi } from 'vitest';
const HYBRID_CONFIG = {
    domain: 'hybrid',
    testStyle: 'hybrid',
    mockingStrategy: 'selective',
    performanceThresholds: {
        coordinationLatency: 100,
        neuralComputation: 1000,
        memoryAccess: 50,
    },
};
beforeEach(() => {
    vi.clearAllMocks();
    const testPath = expect.getState().testPath || '';
    if (testPath.includes('/coordination/')) {
        setupLondonTDD();
    }
    else if (testPath.includes('/interfaces/')) {
        setupLondonTDD();
    }
    else if (testPath.includes('/neural/')) {
        setupClassicalTDD();
    }
    else if (testPath.includes('/memory/')) {
        setupHybridTDD();
    }
    else {
        setupHybridTDD();
    }
});
afterEach(() => {
    const testPath = expect.getState().testPath || '';
    if (testPath.includes('/neural/')) {
        cleanupClassicalResources();
    }
    vi.clearAllMocks();
});
function setupLondonTDD() {
    vi.useFakeTimers();
    createInteractionSpy = (name) => {
        return vi.fn().mockName(name);
    };
    createCoordinationMock = (defaults = {}) => {
        return (overrides = {}) => ({
            ...defaults,
            ...overrides,
        });
    };
}
function setupClassicalTDD() {
    globalThis.testStartTime = Date.now();
    if (typeof globalThis.gc === 'function') {
        try {
            globalThis.gc?.();
        }
        catch {
        }
        globalThis.testStartMemory = process.memoryUsage();
    }
    generateNeuralTestData = (config) => {
        switch (config.type) {
            case 'xor':
                return [
                    { input: [0, 0], output: [0] },
                    { input: [0, 1], output: [1] },
                    { input: [1, 0], output: [1] },
                    { input: [1, 1], output: [0] },
                ];
            case 'linear':
                return Array.from({ length: config.samples || 100 }, (_, _i) => {
                    const x = Math.random() * 10;
                    const y = 2 * x + 3 + (Math.random() - 0.5) * (config.noise || 0.1);
                    return { input: [x], output: [y] };
                });
            default:
                return [];
        }
    };
    expectNearlyEqual = (actual, expected, tolerance = 1e-10) => {
        expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
    };
}
function setupHybridTDD() {
    setupLondonTDD();
    setupClassicalTDD();
    testWithApproach = (approach, testFn) => {
        if (approach === 'london') {
            return testFn();
        }
        return testFn();
    };
    createMemoryTestScenario = (type) => {
        switch (type) {
            case 'sqlite':
                return {
                    backend: 'sqlite',
                    connection: ':memory:',
                    testData: { id: 1, data: 'test' },
                };
            case 'lancedb':
                return {
                    backend: 'lancedb',
                    table: 'test_vectors',
                    testData: { id: 'vec-1', vector: [0.1, 0.2, 0.3] },
                };
            case 'json':
                return {
                    backend: 'json',
                    file: '/tmp/test.json',
                    testData: { key: 'value' },
                };
            default:
                return {};
        }
    };
}
function cleanupClassicalResources() {
    const g = globalThis.gc;
    const startMem = globalThis.testStartMemory;
    if (typeof g === 'function' && startMem) {
        try {
            g();
        }
        catch {
        }
        const endMemory = process.memoryUsage();
        globalThis.lastTestMemoryDelta = {
            rss: endMemory.rss - startMem.rss,
            heapUsed: endMemory.heapUsed - startMem.heapUsed,
            heapTotal: endMemory.heapTotal - startMem.heapTotal,
        };
    }
}
globalThis.expectPerformanceWithinThreshold = (operation, actualTime) => {
    const threshold = HYBRID_CONFIG.performanceThresholds[operation === 'coordination'
        ? 'coordinationLatency'
        : operation === 'neural'
            ? 'neuralComputation'
            : 'memoryAccess'];
    expect(actualTime).toBeLessThanOrEqual(threshold);
};
globalThis.createTestContainer = () => {
    const mockContainer = {
        register: vi.fn(),
        resolve: vi.fn(),
        createScope: vi.fn(),
        dispose: vi.fn(),
    };
    return mockContainer;
};
globalThis.createSPARCTestScenario = (phase) => {
    return {
        phase,
        input: `test-input-${phase}`,
        expectedOutput: `test-output-${phase}`,
        context: { swarmId: 'test-swarm', agentCount: 5 },
    };
};
export { HYBRID_CONFIG };
//# sourceMappingURL=setup-hybrid.js.map