import 'jest-extended';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
beforeAll(async () => {
    await setupE2EEnvironment();
    await startTestServices();
    await initializeE2EData();
}, 180000);
afterAll(async () => {
    await cleanupE2EState();
    await stopTestServices();
}, 60000);
beforeEach(async () => {
    await resetSystemState();
});
afterEach(async () => {
    await collectTestMetrics();
});
async function setupE2EEnvironment() {
    process.env.NODE_ENV = 'test';
    process.env.CLAUDE_ZEN_E2E_MODE = 'true';
    process.env.CLAUDE_ZEN_LOG_LEVEL = 'warn';
    process.env.CLAUDE_ZEN_TEST_TIMEOUT = '300000';
    global.e2eConfig = {
        services: {
            mcp: { port: 40001, process: null },
            web: { port: 40002, process: null },
            api: { port: 40003, process: null },
            swarm: { port: 40004, process: null },
        },
        timeout: {
            startup: 60000,
            operation: 30000,
            shutdown: 30000,
        },
        paths: {
            root: process.cwd(),
            bin: path.join(process.cwd(), 'bin'),
            dist: path.join(process.cwd(), 'dist'),
        },
    };
    global.testProcesses = new Map();
    global.testMetrics = {
        startTime: Date.now(),
        operations: [],
        performance: {},
    };
}
async function startTestServices() {
    const { services } = global.e2eConfig;
    await buildProject();
    await startService('mcp', [
        'npx',
        'tsx',
        'src/interfaces/mcp/start-server.ts',
        '--port',
        services.mcp.port.toString(),
    ]);
    await startService('web', [
        'npx',
        'tsx',
        'src/interfaces/web/web-interface.ts',
        '--port',
        services.web.port.toString(),
        '--daemon',
    ]);
    await startService('swarm', [
        'npx',
        'tsx',
        'src/coordination/mcp/mcp-server.ts',
    ]);
    await waitForServicesReady();
}
async function buildProject() {
    return new Promise((resolve, reject) => {
        const buildProcess = spawn('npm', ['run', 'build'], {
            cwd: global.e2eConfig.paths.root,
            stdio: 'pipe',
        });
        buildProcess.on('close', (code) => {
            if (code === 0)
                resolve();
            else
                reject(new Error(`Build failed with code ${code}`));
        });
        setTimeout(() => {
            buildProcess.kill();
            reject(new Error('Build timeout'));
        }, 120000);
    });
}
async function startService(name, command) {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command;
        const process = spawn(cmd, args, {
            cwd: global.e2eConfig.paths.root,
            stdio: 'pipe',
            env: { ...process.env, ...getServiceEnv(name) },
        });
        global.testProcesses.set(name, process);
        let output = '';
        process.stdout?.on('data', (data) => {
            output += data.toString();
            if (isServiceReady(name, output)) {
                resolve();
            }
        });
        process.stderr?.on('data', (data) => {
            console.warn(`${name} stderr:`, data.toString());
        });
        process.on('error', reject);
        process.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                reject(new Error(`${name} exited with code ${code}`));
            }
        });
        setTimeout(() => {
            if (!isServiceReady(name, output)) {
                reject(new Error(`${name} startup timeout`));
            }
        }, global.e2eConfig.timeout.startup);
    });
}
function getServiceEnv(serviceName) {
    const service = global.e2eConfig.services[serviceName];
    return {
        PORT: service.port.toString(),
        CLAUDE_ZEN_SERVICE: serviceName,
        CLAUDE_ZEN_E2E_MODE: 'true',
    };
}
function isServiceReady(serviceName, output) {
    const readyPatterns = {
        mcp: /MCP server listening on port/i,
        web: /Web server listening on port/i,
        api: /API server ready/i,
        swarm: /Swarm coordination server ready/i,
    };
    const pattern = readyPatterns[serviceName];
    return pattern ? pattern.test(output) : false;
}
async function waitForServicesReady() {
    const { services } = global.e2eConfig;
    for (const [_name, config] of Object.entries(services)) {
        await waitForPort(config.port, global.e2eConfig.timeout.startup);
    }
}
async function waitForPort(port, timeout = 30000) {
    const net = await import('node:net');
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            await new Promise((resolve, reject) => {
                const socket = net.createConnection(port, 'localhost');
                socket.on('connect', () => {
                    socket.destroy();
                    resolve();
                });
                socket.on('error', reject);
                setTimeout(() => reject(new Error('Connection timeout')), 2000);
            });
            return;
        }
        catch {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
    throw new Error(`Port ${port} not ready within ${timeout}ms`);
}
async function initializeE2EData() {
    global.e2eTestData = {
        users: [
            { id: 'test-user-1', name: 'Test User', role: 'admin' },
            { id: 'test-user-2', name: 'Agent User', role: 'agent' },
        ],
        swarms: [
            { id: 'test-swarm-1', name: 'Test Swarm', agents: 3 },
            { id: 'test-swarm-2', name: 'Performance Swarm', agents: 5 },
        ],
        tasks: [
            { id: 'task-1', type: 'analysis', priority: 'high' },
            { id: 'task-2', type: 'generation', priority: 'medium' },
        ],
    };
}
async function resetSystemState() {
    try {
        await clearSystemCaches();
        await resetDatabaseState();
        await clearMemoryState();
    }
    catch (error) {
        console.warn('Failed to reset system state:', error);
    }
}
async function clearSystemCaches() {
    const cacheEndpoints = [
        `http://localhost:${global.e2eConfig.services.api.port}/cache/clear`,
        `http://localhost:${global.e2eConfig.services.web.port}/api/cache/clear`,
    ];
    for (const endpoint of cacheEndpoints) {
        try {
            await fetch(endpoint, { method: 'POST' });
        }
        catch (_error) {
        }
    }
}
async function resetDatabaseState() {
    const dbEndpoints = [
        `http://localhost:${global.e2eConfig.services.api.port}/test/reset`,
    ];
    for (const endpoint of dbEndpoints) {
        try {
            await fetch(endpoint, { method: 'POST' });
        }
        catch (_error) {
        }
    }
}
async function clearMemoryState() {
    const memoryEndpoints = [
        `http://localhost:${global.e2eConfig.services.web.port}/api/memory/clear`,
        `http://localhost:${global.e2eConfig.services.swarm.port}/memory/clear`,
    ];
    for (const endpoint of memoryEndpoints) {
        try {
            await fetch(endpoint, { method: 'POST' });
        }
        catch (_error) {
        }
    }
}
async function collectTestMetrics() {
    const endTime = Date.now();
    const testDuration = endTime - global.testMetrics.startTime;
    global.testMetrics.operations.push({
        timestamp: endTime,
        duration: testDuration,
        memory: process.memoryUsage(),
    });
}
async function stopTestServices() {
    for (const [name, process] of global.testProcesses.entries()) {
        try {
            process.kill('SIGTERM');
            await waitForProcessExit(process, 10000);
        }
        catch (_error) {
            console.warn(`Failed to stop ${name} gracefully, force killing`);
            process.kill('SIGKILL');
        }
    }
    global.testProcesses.clear();
}
async function waitForProcessExit(process, timeout) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Process exit timeout'));
        }, timeout);
        process.on('exit', () => {
            clearTimeout(timer);
            resolve();
        });
    });
}
async function cleanupE2EState() {
    process.env.CLAUDE_ZEN_E2E_MODE = undefined;
    process.env.CLAUDE_ZEN_TEST_TIMEOUT = undefined;
    await generateE2EReport();
}
async function generateE2EReport() {
    const _report = {
        duration: Date.now() - global.testMetrics.startTime,
        operations: global.testMetrics.operations,
        services: Object.keys(global.e2eConfig.services),
        summary: {
            totalOperations: global.testMetrics.operations.length,
            avgDuration: global.testMetrics.operations.reduce((sum, op) => sum + op.duration, 0) / global.testMetrics.operations.length || 0,
        },
    };
}
global.createE2EClient = (serviceName) => {
    const service = global.e2eConfig.services[serviceName];
    const baseURL = `http://localhost:${service.port}`;
    return {
        get: (path) => fetch(`${baseURL}${path}`),
        post: (path, data) => fetch(`${baseURL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data ? JSON.stringify(data) : undefined,
        }),
        put: (path, data) => fetch(`${baseURL}${path}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: data ? JSON.stringify(data) : undefined,
        }),
        delete: (path) => fetch(`${baseURL}${path}`, { method: 'DELETE' }),
    };
};
global.runE2EWorkflow = async (workflow) => {
    const results = [];
    for (const step of workflow) {
        const start = Date.now();
        try {
            const result = await executeWorkflowStep(step);
            results.push({
                step: step.name,
                success: true,
                result,
                duration: Date.now() - start,
            });
        }
        catch (error) {
            results.push({
                step: step.name,
                success: false,
                error: error instanceof Error ? error.message : String(error),
                duration: Date.now() - start,
            });
            throw error;
        }
    }
    return results;
};
async function executeWorkflowStep(step) {
    switch (step.type) {
        case 'http': {
            if (!(step.service && step.method && step.path)) {
                throw new Error('HTTP step requires service, method, and path');
            }
            const client = global.createE2EClient(step.service);
            return await client[step.method](step.path, step.data);
        }
        case 'delay':
            if (typeof step.duration !== 'number') {
                throw new Error('Delay step requires duration');
            }
            await new Promise((resolve) => setTimeout(resolve, step.duration));
            return { delayed: step.duration };
        case 'custom':
            if (!step.execute) {
                throw new Error('Custom step requires execute function');
            }
            return await step.execute();
        default:
            throw new Error(`Unknown workflow step type: ${step.type}`);
    }
}
global.measureE2EPerformance = async (operation, expectedMaxTime) => {
    const start = Date.now();
    const result = await operation();
    const duration = Date.now() - start;
    expect(duration).toBeLessThanOrEqual(expectedMaxTime);
    return {
        result,
        duration,
        performance: {
            withinExpected: duration <= expectedMaxTime,
            efficiency: expectedMaxTime / duration,
        },
    };
};
//# sourceMappingURL=setup-e2e.js.map