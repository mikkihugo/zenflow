import { createHTTPClient, createHTTPClientWithPreset, createLoadBalancedHTTPClients, HTTPClientFactory, isAuthenticationError, isClientError, isConnectionError, } from '../index.ts';
async function basicUsage() {
    const client = await createHTTPClient({
        name: 'api-client',
        baseURL: 'https://api.example.com',
        timeout: 30000,
    });
    try {
        const users = await client.get('/users');
        const newUser = await client.post('/users', {
            name: 'John Doe',
            email: 'john@example.com',
        });
        const status = await client.healthCheck();
        const metrics = await client.getMetrics();
    }
    catch (error) {
        if (isClientError(error)) {
            console.error(`Client error: ${error.code} - ${error.message}`);
        }
        else {
            console.error('Unknown error:', error);
        }
    }
    finally {
        await client.destroy();
    }
}
async function bearerTokenAuth() {
    const client = await createHTTPClient({
        name: 'auth-api-client',
        baseURL: 'https://api.example.com',
        authentication: {
            type: 'bearer',
            token: 'your-jwt-token-here',
        },
    });
    try {
        const profile = await client.get('/profile');
    }
    catch (error) {
        if (isAuthenticationError(error)) {
            console.error('Authentication failed - token may be expired');
        }
    }
    finally {
        await client.destroy();
    }
}
async function apiKeyAuth() {
    const client = await createHTTPClient({
        name: 'api-key-client',
        baseURL: 'https://api.example.com',
        authentication: {
            type: 'apikey',
            apiKey: 'your-api-key-here',
            apiKeyHeader: 'X-API-Key',
        },
    });
    try {
        const data = await client.get('/protected-endpoint');
    }
    finally {
        await client.destroy();
    }
}
async function oauthAuth() {
    const client = await createHTTPClient({
        name: 'oauth-client',
        baseURL: 'https://api.example.com',
        authentication: {
            type: 'oauth',
            credentials: {
                clientId: 'your-client-id',
                clientSecret: 'your-client-secret',
                tokenUrl: 'https://auth.example.com/token',
                scope: 'read write',
                accessToken: 'current-access-token',
                refreshToken: 'refresh-token',
                expiresAt: new Date(Date.now() + 3600000),
            },
        },
    });
    try {
        const data = await client.get('/protected-resource');
    }
    finally {
        await client.destroy();
    }
}
async function retryConfiguration() {
    const client = await createHTTPClient({
        name: 'resilient-client',
        baseURL: 'https://api.example.com',
        retry: {
            attempts: 5,
            delay: 1000,
            backoff: 'exponential',
            maxDelay: 10000,
            retryStatusCodes: [408, 429, 500, 502, 503, 504],
            retryMethods: ['GET', 'POST', 'PUT'],
            retryCondition: (error) => {
                return error.response?.status >= 500 || !error.response;
            },
        },
    });
    client.on('retry', (info) => { });
    try {
        const data = await client.get('/unreliable-endpoint');
    }
    finally {
        await client.destroy();
    }
}
async function monitoringExample() {
    const client = await createHTTPClient({
        name: 'monitored-client',
        baseURL: 'https://api.example.com',
        monitoring: {
            enabled: true,
            metricsInterval: 30000,
            trackLatency: true,
            trackThroughput: true,
            trackErrors: true,
        },
        health: {
            endpoint: '/health',
            interval: 10000,
            timeout: 5000,
            failureThreshold: 3,
            successThreshold: 2,
        },
    });
    client.on('connect', () => { });
    client.on('disconnect', () => { });
    client.on('error', (error) => {
        console.error('Client error:', error);
    });
    try {
        await client.connect();
        for (let i = 0; i < 10; i++) {
            try {
                await client.get(`/data/${i}`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            catch (error) {
                console.error(`Request ${i} failed:`, error);
            }
        }
        const metrics = await client.getMetrics();
    }
    finally {
        await client.destroy();
    }
}
async function factoryUsage() {
    const factory = new HTTPClientFactory();
    try {
        const _clients = await factory.createMultiple([
            {
                name: 'users-api',
                baseURL: 'https://users.example.com',
                authentication: { type: 'bearer', token: 'users-token' },
            },
            {
                name: 'orders-api',
                baseURL: 'https://orders.example.com',
                authentication: { type: 'apikey', apiKey: 'orders-key' },
            },
            {
                name: 'inventory-api',
                baseURL: 'https://inventory.example.com',
                authentication: {
                    type: 'basic',
                    username: 'admin',
                    password: 'secret',
                },
            },
        ]);
        const usersClient = factory.get('users-api');
        if (usersClient) {
            const users = await usersClient.get('/users');
        }
        const healthResults = await factory.healthCheckAll();
        for (const [name, status] of healthResults) {
        }
        const metricsResults = await factory.getMetricsAll();
        for (const [name, metrics] of metricsResults) {
        }
    }
    finally {
        await factory.shutdown();
    }
}
async function presetUsage() {
    const devClient = await createHTTPClientWithPreset('dev-client', 'https://dev-api.example.com', 'development');
    const prodClient = await createHTTPClientWithPreset('prod-client', 'https://api.example.com', 'production', {
        authentication: {
            type: 'bearer',
            token: 'production-token',
        },
    });
    const haClient = await createHTTPClientWithPreset('ha-client', 'https://ha-api.example.com', 'highAvailability');
    try {
        const devData = await devClient.get('/test');
        const prodData = await prodClient.get('/data');
        const haData = await haClient.get('/critical');
    }
    finally {
        await Promise.all([
            devClient.destroy(),
            prodClient.destroy(),
            haClient.destroy(),
        ]);
    }
}
async function loadBalancingExample() {
    const clients = await createLoadBalancedHTTPClients('api-cluster', [
        'https://api1.example.com',
        'https://api2.example.com',
        'https://api3.example.com',
    ], 'production');
    try {
        for (let i = 0; i < 10; i++) {
            const client = clients[i % clients.length];
            try {
                const response = await client.get('/data');
            }
            catch (error) {
                console.error(`Request ${i} failed on ${client.name}:`, error);
            }
        }
    }
    finally {
        await Promise.all(clients.map((client) => client.destroy()));
    }
}
async function backwardCompatibility() {
    const { APIClient, createAPIClient } = await import('../wrappers/api-client-wrapper.ts');
    const apiClient = createAPIClient({
        baseURL: 'https://api.example.com',
        bearerToken: 'your-token-here',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
    });
    try {
        const agents = await apiClient.coordination.listAgents();
        const networks = await apiClient.neural.listNetworks();
        const status = await apiClient.getClientStatus();
        const metrics = await apiClient.getClientMetrics();
        const isOnline = await apiClient.ping();
    }
    finally {
        await apiClient.destroy();
    }
}
async function errorHandlingExample() {
    const client = await createHTTPClient({
        name: 'error-demo-client',
        baseURL: 'https://httpstat.us',
        retry: {
            attempts: 2,
            delay: 1000,
            backoff: 'fixed',
        },
    });
    const testCases = [
        { endpoint: '/200', description: 'Success' },
        { endpoint: '/404', description: 'Not Found' },
        { endpoint: '/401', description: 'Unauthorized' },
        { endpoint: '/500', description: 'Server Error' },
        { endpoint: '/timeout', description: 'Timeout' },
    ];
    for (const testCase of testCases) {
        try {
            const response = await client.get(testCase.endpoint);
        }
        catch (error) {
            if (isConnectionError(error)) {
                console.error(`❌ Connection Error: ${error.message}`);
            }
            else if (isAuthenticationError(error)) {
                console.error(`❌ Auth Error: ${error.message}`);
            }
            else if (isClientError(error)) {
                console.error(`❌ Client Error: ${error.code} - ${error.message}`);
            }
            else {
                console.error(`❌ Unknown Error: ${error}`);
            }
        }
    }
    await client.destroy();
}
async function runAllExamples() {
    const examples = [
        basicUsage,
        bearerTokenAuth,
        apiKeyAuth,
        oauthAuth,
        retryConfiguration,
        monitoringExample,
        factoryUsage,
        presetUsage,
        loadBalancingExample,
        backwardCompatibility,
        errorHandlingExample,
    ];
    for (const example of examples) {
        try {
            await example();
        }
        catch (error) {
            console.error(`Example ${example.name} failed:`, error);
        }
    }
}
export { basicUsage, bearerTokenAuth, apiKeyAuth, oauthAuth, retryConfiguration, monitoringExample, factoryUsage, presetUsage, loadBalancingExample, backwardCompatibility, errorHandlingExample, runAllExamples, };
if (require.main === module) {
    runAllExamples().catch(console.error);
}
//# sourceMappingURL=http-client-usage.js.map