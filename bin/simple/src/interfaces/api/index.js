import { getWebDashboardURL } from '../../config/defaults.js';
export * from './http/index.ts';
export * from './websocket/index.ts';
import { WebSocketClient } from './websocket/client.ts';
export { WebSocketClient };
export const APIUtils = {
    createWebSocketUrl: (baseUrl) => {
        return `${baseUrl.replace(/^http/, 'ws').replace(/\/$/, '')}/ws`;
    },
    validateConfig: (config) => {
        return Boolean(config?.baseUrl || config?.websocketUrl);
    },
    parseResponse: (response) => {
        if (response && typeof response === 'object') {
            if (response?.error) {
                return { success: false, error: response?.error };
            }
            return { success: true, data: response };
        }
        return { success: true, data: response };
    },
    formatRequest: (method, params = {}) => {
        return {
            jsonrpc: '2.0',
            method,
            params,
            id: Date.now(),
        };
    },
};
export class APIClientFactory {
    static instances = new Map();
    static getWebSocketClient(url, instanceKey = 'default') {
        const key = `ws:${instanceKey}`;
        if (!APIClientFactory.instances.has(key)) {
            const client = new WebSocketClient(url);
            APIClientFactory.instances.set(key, client);
        }
        return APIClientFactory.instances.get(key);
    }
    static clearInstances() {
        for (const [, client] of APIClientFactory.instances) {
            client.disconnect();
        }
        APIClientFactory.instances.clear();
    }
    static getActiveInstances() {
        return Array.from(APIClientFactory.instances.keys());
    }
}
export const DEFAULT_API_CONFIG = {
    baseUrl: getWebDashboardURL(),
    websocketUrl: `${getWebDashboardURL({ protocol: 'ws' }).replace(/^https?/, 'ws')}/ws`,
    timeout: 5000,
    retries: 3,
    reconnect: true,
};
//# sourceMappingURL=index.js.map