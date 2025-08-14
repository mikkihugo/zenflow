export class ZenOrchestratorWrapper {
    config;
    integration;
    constructor(config = {}) {
        this.config = config;
        this.config = {
            enabled: true,
            host: 'localhost',
            port: 4003,
            storage_path: '.zen/collective',
            a2a_server_port: 4005,
            heartbeat_timeout_sec: 300,
            message_timeout_ms: 30000,
            use_websocket_transport: true,
            websocket_port: 4006,
            enable_zen_neural: true,
            enable_zen_forecasting: true,
            enable_zen_compute: true,
            gpu_enabled: false,
            enable_quantum: true,
            quantum_backend: 'ibmq_qasm_simulator',
            debug_mode: false,
            log_level: 'info',
            ...config
        };
    }
    async initialize() {
        if (!this.integration) {
            const { getZenSwarmOrchestratorIntegration } = await import('../zen-orchestrator-integration.js');
            this.integration = getZenSwarmOrchestratorIntegration(this.config);
        }
        if (this.integration && typeof this.integration.initialize === 'function') {
            await this.integration.initialize();
        }
    }
    async isReady() {
        return this.integration?.isReady() ?? false;
    }
    async getStatus() {
        if (!this.integration) {
            return { success: false, error: 'Integration not initialized' };
        }
        return this.integration.getStatus();
    }
    async sendA2AMessage(messageType, payload, targetSwarm) {
        if (!this.integration) {
            return { success: false, error: 'Integration not initialized' };
        }
        return this.integration.sendA2AMessage(messageType, payload, targetSwarm);
    }
    async executeNeuralService(taskType, inputData, config) {
        if (!this.integration) {
            return { success: false, error: 'Integration not initialized' };
        }
        return this.integration.executeNeuralService(taskType, inputData, config);
    }
    async listServices() {
        if (!this.integration) {
            return { success: false, error: 'Integration not initialized' };
        }
        return this.integration.listServices();
    }
    async getMetrics() {
        if (!this.integration) {
            return { success: false, error: 'Integration not initialized' };
        }
        return this.integration.getMetrics();
    }
    async shutdown() {
        if (this.integration) {
            await this.integration.shutdown();
            this.integration = null;
        }
    }
}
export default ZenOrchestratorWrapper;
//# sourceMappingURL=zen-orchestrator-wrapper.js.map