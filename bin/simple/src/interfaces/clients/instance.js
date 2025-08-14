import { getLogger } from '../../config/logging-config.ts';
import { ClientManager } from './manager.ts';
const logger = getLogger('interfaces-clients-instance');
class UACL extends ClientManager {
    static instance;
    initialized = false;
    constructor(config) {
        super(config);
        logger.debug('UACL instance created');
    }
    static getInstance(config) {
        if (!UACL.instance) {
            UACL.instance = new UACL(config);
        }
        return UACL.instance;
    }
    async initialize(config) {
        if (this.initialized) {
            logger.debug('UACL already initialized');
            return;
        }
        logger.info('Initializing UACL system...');
        await super.initialize();
        this.initialized = true;
        logger.info('✅ UACL system initialized successfully');
    }
    isInitialized() {
        return this.initialized;
    }
    getMetrics() {
        return {
            initialized: this.initialized,
            clientCount: this.getAllClients().length,
            activeTypes: Object.keys(this.getClientsByType('http')).length,
            timestamp: Date.now(),
        };
    }
    getHealthStatus() {
        return {
            status: this.initialized ? 'healthy' : 'not_initialized',
            initialized: this.initialized,
            clientsActive: this.getAllClients().length > 0,
            timestamp: Date.now(),
        };
    }
}
export const uacl = UACL.getInstance();
export const UACLHelpers = {
    getQuickStatus() {
        const metrics = uacl.getMetrics();
        return {
            status: uacl.isInitialized() ? 'ready' : 'not_ready',
            initialized: metrics.initialized,
            clientCount: metrics.clientCount,
        };
    },
    async performHealthCheck() {
        const results = [];
        results.push({
            component: 'UACL_Core',
            status: uacl.isInitialized() ? 'healthy' : 'unhealthy',
            details: uacl.getHealthStatus(),
        });
        const allClients = uacl.getAllClients();
        results.push({
            component: 'Client_Registry',
            status: allClients.length > 0 ? 'healthy' : 'warning',
            details: { clientCount: allClients.length },
        });
        try {
            const testConfig = { baseURL: 'https://httpbin.org', timeout: 5000 };
            const testClient = await uacl.createHTTPClient('health_test', testConfig.baseURL, testConfig);
            results.push({
                component: 'Client_Creation',
                status: 'healthy',
                details: { testClientId: testClient.id },
            });
            uacl.removeClient('health_test');
        }
        catch (error) {
            results.push({
                component: 'Client_Creation',
                status: 'unhealthy',
                details: { error: error.message },
            });
        }
        return results;
    },
    async initialize(config) {
        return uacl.initialize(config);
    },
};
export async function initializeUACL(config) {
    return uacl.initialize(config);
}
export { UACL };
//# sourceMappingURL=instance.js.map