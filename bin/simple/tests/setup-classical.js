import 'jest-extended';
import { vi } from 'vitest';
beforeEach(() => {
    vi.restoreAllMocks();
    setupPerformanceMonitoring();
    initializeTestDataGenerators();
});
afterEach(() => {
    cleanupTestState();
    collectPerformanceMetrics();
});
function setupPerformanceMonitoring() {
    globalThis.testStartTime = Date.now();
    if (typeof globalThis.gc === 'function') {
        try {
            globalThis.gc?.();
        }
        catch {
        }
        globalThis.testStartMemory = process.memoryUsage();
    }
}
function initializeTestDataGenerators() {
    Math.seedrandom = (seed) => {
        const seedNum = hashCode(seed);
        let x = Math.sin(seedNum) * 10000;
        return () => {
            x = Math.sin(x) * 10000;
            return x - Math.floor(x);
        };
    };
}
function cleanupTestState() {
    const start = globalThis.testStartTime;
    if (typeof start === 'number') {
        const executionTime = Date.now() - start;
        globalThis.lastTestExecutionTime = executionTime;
    }
}
function collectPerformanceMetrics() {
    const startMem = globalThis.testStartMemory;
    if (typeof globalThis.gc === 'function' && startMem) {
        try {
            globalThis.gc?.();
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
function hashCode(str) {
    let hash = 0;
    if (str.length === 0)
        return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash;
}
globalThis.generateTestMatrix = (rows, cols, fillFn) => {
    const matrix = new Array(rows);
    for (let i = 0; i < rows; i++) {
        const row = new Array(cols);
        for (let j = 0; j < cols; j++) {
            row[j] = fillFn ? fillFn(i, j) : Math.random();
        }
        matrix[i] = row;
    }
    return matrix;
};
globalThis.generateTestVector = (size, fillFn) => {
    const vector = [];
    for (let i = 0; i < size; i++) {
        vector[i] = fillFn ? fillFn(i) : Math.random();
    }
    return vector;
};
globalThis.generateXORData = () => [
    { input: [0, 0], output: [0] },
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [1, 1], output: [0] },
];
globalThis.generateLinearData = (samples, noise = 0.1) => {
    const data = [];
    for (let i = 0; i < samples; i++) {
        const x = Math.random() * 10;
        const y = 2 * x + 3 + (Math.random() - 0.5) * noise;
        data.push({ input: [x], output: [y] });
    }
    return data;
};
globalThis.expectPerformance = (fn, maxTimeMs) => {
    const start = Date.now();
    fn();
    const duration = Date.now() - start;
    expect(duration).toBeLessThanOrEqual(maxTimeMs);
    return duration;
};
globalThis.expectMemoryUsage = (fn, maxMemoryMB) => {
    const g = globalThis.gc;
    if (typeof g !== 'function')
        return;
    try {
        g();
    }
    catch {
    }
    const startMemory = process.memoryUsage().heapUsed;
    fn();
    try {
        g();
    }
    catch {
    }
    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsedMB = (endMemory - startMemory) / 1024 / 1024;
    expect(memoryUsedMB).toBeLessThanOrEqual(maxMemoryMB);
    return memoryUsedMB;
};
globalThis.expectNearlyEqual = (actual, expected, tolerance = 1e-10) => {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
};
globalThis.expectArrayNearlyEqual = (actual, expected, tolerance = 1e-10) => {
    expect(actual).toHaveLength(expected.length);
    for (let i = 0; i < actual.length; i++) {
        globalThis.expectNearlyEqual(actual[i], expected[i], tolerance);
    }
};
globalThis.expectMatrixNearlyEqual = (actual, expected, tolerance = 1e-10) => {
    expect(actual).toHaveLength(expected.length);
    for (let i = 0; i < actual.length; i++) {
        globalThis.expectArrayNearlyEqual(actual[i], expected[i], tolerance);
    }
};
//# sourceMappingURL=setup-classical.js.map