import { vi } from 'vitest';
export const createMockAgent = (overrides = {}) => ({
    id: 'test-agent-001',
    type: 'researcher',
    status: 'active',
    capabilities: ['search', 'analyze'],
    ...overrides,
});
export const createMockTask = (overrides = {}) => ({
    id: 'test-task-001',
    type: 'research',
    status: 'pending',
    priority: 'medium',
    ...overrides,
});
export const createMockSwarm = (overrides = {}) => ({
    swarmId: 'test-swarm-001',
    topology: 'mesh',
    agentCount: 3,
    status: 'active',
    ...overrides,
});
export const domainMatchers = {
    toBeValidAgent(received) {
        const pass = received &&
            typeof received.id === 'string' &&
            typeof received.type === 'string' &&
            ['active', 'idle', 'busy'].includes(received.status);
        return {
            message: () => `expected ${received} to be a valid agent`,
            pass,
        };
    },
    toBeValidTask(received) {
        const pass = received &&
            typeof received.id === 'string' &&
            typeof received.type === 'string' &&
            ['pending', 'in-progress', 'completed'].includes(received.status);
        return {
            message: () => `expected ${received} to be a valid task`,
            pass,
        };
    },
};
export const waitForAsyncOperation = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
export const mockAsyncFunction = (returnValue, delay = 0) => vi.fn().mockImplementation(async (...args) => {
    if (delay > 0)
        await waitForAsyncOperation(delay);
    return returnValue;
});
export const cleanupTestData = () => {
    vi.clearAllMocks();
};
//# sourceMappingURL=test-utils.js.map