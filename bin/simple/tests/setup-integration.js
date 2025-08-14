import { vi } from 'vitest';
beforeEach(async () => {
    await setupIntegrationEnvironment();
    await initializeTestStorage();
    setupNetworkMocking();
});
afterEach(async () => {
    await cleanupIntegrationState();
    resetNetworkMocks();
});
async function setupIntegrationEnvironment() {
    process.env['NODE_ENV'] = 'test';
    process.env['CLAUDE_ZEN_TEST_MODE'] = 'integration';
    process.env['CLAUDE_ZEN_LOG_LEVEL'] = 'error';
    global.testConfig = {
        database: {
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
        },
        redis: {
            host: 'localhost',
            port: 6379,
            db: 15,
        },
        ports: {
            mcp: 30001,
            web: 30002,
            api: 30003,
        },
    };
}
async function initializeTestStorage() {
    global.testDatabases = {
        main: null,
        vector: null,
        cache: null,
    };
    global.testFixtures = {
        users: [],
        swarms: [],
        agents: [],
        tasks: [],
    };
}
function setupNetworkMocking() {
    global.mockFetch = vi.fn();
    global.originalFetch = global.fetch;
    global.fetch = global.mockFetch;
    global.mockWebSocket = vi.fn();
    global.originalWebSocket = global.WebSocket;
    global.mockSpawn = vi.fn();
}
function resetNetworkMocks() {
    if (global.originalFetch) {
        global.fetch = global.originalFetch;
    }
    if (global.originalWebSocket) {
        global.WebSocket = global.originalWebSocket;
    }
    vi.clearAllMocks();
}
async function cleanupIntegrationState() {
    if (global.testDatabases) {
        for (const db of Object.values(global.testDatabases)) {
            if (db && typeof db.close === 'function') {
                await db.close();
            }
        }
    }
    global.testFixtures = {};
    process.env['CLAUDE_ZEN_TEST_MODE'] = undefined;
}
global.createTestServer = async (port, routes = []) => {
    const express = await import('express');
    const app = express.default();
    routes.forEach((route) => {
        app[route.method](route.path, route.handler);
    });
    return new Promise((resolve, reject) => {
        const server = app.listen(port, (err) => {
            if (err)
                reject(err);
            else
                resolve(server);
        });
    });
};
global.createTestClient = (baseURL) => {
    return {
        get: (path) => fetch(`${baseURL}${path}`),
        post: (path, data) => fetch(`${baseURL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),
        put: (path, data) => fetch(`${baseURL}${path}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),
        delete: (path) => fetch(`${baseURL}${path}`, { method: 'DELETE' }),
    };
};
global.waitForPort = async (port, timeout = 5000) => {
    const net = await import('node:net');
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            await new Promise((resolve, reject) => {
                const socket = net.createConnection(port, 'localhost');
                socket.on('connect', () => {
                    socket.destroy();
                    resolve(true);
                });
                socket.on('error', reject);
                setTimeout(() => reject(new Error('Timeout')), 1000);
            });
            return true;
        }
        catch {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
    throw new Error(`Port ${port} not available within ${timeout}ms`);
};
global.setupDatabaseFixtures = async (fixtures) => {
    for (const [table, data] of Object.entries(fixtures)) {
        global.testFixtures[table] = data;
    }
};
global.createMockSwarm = (agentCount = 3) => {
    const swarm = {
        id: `test-swarm-${Date.now()}`,
        agents: [],
        coordinator: null,
        status: 'active',
    };
    for (let i = 0; i < agentCount; i++) {
        swarm.agents.push({
            id: `agent-${i}`,
            type: 'worker',
            status: 'idle',
            tasks: [],
        });
    }
    return swarm;
};
global.simulateSwarmWorkflow = async (swarm, tasks) => {
    const results = [];
    for (const task of tasks) {
        const agent = swarm.agents.find((a) => a.status === 'idle');
        if (agent) {
            agent.status = 'working';
            agent.tasks.push(task);
            await new Promise((resolve) => setTimeout(resolve, 10));
            results.push({
                taskId: task.id,
                agentId: agent.id,
                result: 'completed',
                timestamp: Date.now(),
            });
            agent.status = 'idle';
            agent.tasks = agent.tasks.filter((t) => t.id !== task.id);
        }
    }
    return results;
};
global.createMockMCPClient = () => {
    return {
        send: vi.fn().mockResolvedValue({ success: true }),
        connect: vi.fn().mockResolvedValue(true),
        disconnect: vi.fn().mockResolvedValue(true),
        listTools: vi.fn().mockResolvedValue([]),
        callTool: vi.fn().mockResolvedValue({ result: 'mock' }),
    };
};
global.validateMCPProtocol = (message) => {
    expect(message).toHaveProperty('jsonrpc', '2.0');
    expect(message).toHaveProperty('id');
    expect(message).toHaveProperty('method');
    if (message.method !== 'notification') {
        expect(message).toHaveProperty('params');
    }
};
//# sourceMappingURL=setup-integration.js.map