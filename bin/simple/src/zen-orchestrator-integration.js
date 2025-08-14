import { getLogger } from './config/logging-config.js';
const logger = getLogger('ZenSwarmOrchestrator');
let nativeBinding = null;
async function loadNativeBinding() {
    if (!nativeBinding) {
        try {
            nativeBinding = await import('../bindings/zen-code-bindings.linux-x64-gnu.node');
            logger.info('✅ Native zen-swarm-orchestrator binding loaded successfully');
        }
        catch (error) {
            logger.error('❌ Failed to load zen-swarm-orchestrator native binding:', error);
            throw new Error(`Failed to load native binding: ${error}`);
        }
    }
    return nativeBinding;
}
export class ZenOrchestratorIntegration {
    zenSwarmOrchestrator = null;
    isInitialized = false;
    config;
    constructor(config) {
        this.config = {
            host: config?.host || 'localhost',
            port: config?.port || 4003,
            storage_path: config?.storage_path || '.zen/collective',
            enabled: config?.enabled ?? true,
            a2a_server_port: config?.a2a_server_port || 4005,
            a2a_client_endpoint: config?.a2a_client_endpoint,
            heartbeat_timeout_sec: config?.heartbeat_timeout_sec || 300,
            message_timeout_ms: config?.message_timeout_ms || 30000,
            use_websocket_transport: config?.use_websocket_transport ?? true,
            websocket_port: config?.websocket_port || 4006,
            websocket_endpoint: config?.websocket_endpoint,
            enable_zen_neural: config?.enable_zen_neural ?? true,
            enable_zen_forecasting: config?.enable_zen_forecasting ?? true,
            enable_zen_compute: config?.enable_zen_compute ?? true,
            gpu_enabled: config?.gpu_enabled ?? false,
            enable_quantum: config?.enable_quantum ?? true,
            quantum_backend: config?.quantum_backend ?? 'ibmq_qasm_simulator',
        };
        logger.info('🚀 ZenSwarmOrchestratorIntegration created with config:', {
            ...this.config,
            a2a_client_endpoint: this.config.a2a_client_endpoint
                ? '[CONFIGURED]'
                : '[NOT_SET]',
        });
    }
    async initialize() {
        if (this.isInitialized) {
            logger.warn('⚠️ zen-orchestrator already initialized');
            return;
        }
        try {
            const binding = await loadNativeBinding();
            this.zenSwarmOrchestrator = new binding.ZenSwarmOrchestrator(this.config);
            const result = await this.zenSwarmOrchestrator.initialize();
            if (!result) {
                throw new Error('zen-orchestrator initialization returned false');
            }
            this.isInitialized = true;
            logger.info('✅ zen-orchestrator initialized successfully');
            const status = await this.getStatus();
            logger.info('📊 Initialization status:', JSON.parse(status.data || '{}'));
        }
        catch (error) {
            logger.error('❌ Failed to initialize zen-orchestrator:', error);
            throw error;
        }
    }
    async isReady() {
        return this.isInitialized && this.zenSwarmOrchestrator !== null;
    }
    async getStatus() {
        if (!(await this.isReady())) {
            return {
                success: false,
                error: 'zen-swarm-orchestrator not initialized',
            };
        }
        try {
            const statusJson = await this.zenSwarmOrchestrator.getStatus();
            const statusData = JSON.parse(statusJson);
            return {
                success: true,
                data: statusData,
            };
        }
        catch (error) {
            logger.error('❌ Failed to get zen-orchestrator status:', error);
            return {
                success: false,
                error: `Status request failed: ${error}`,
            };
        }
    }
    async sendA2AMessage(messageType, payload, targetSwarm) {
        if (!(await this.isReady())) {
            return {
                success: false,
                error: 'zen-swarm-orchestrator not initialized',
            };
        }
        try {
            const message = {
                id: `a2a-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                task_id: targetSwarm ? `task-${targetSwarm}` : undefined,
                message_type: messageType,
                content: JSON.stringify(payload),
                role: 'user',
                timestamp: Date.now(),
                metadata: targetSwarm
                    ? JSON.stringify({ target_swarm: targetSwarm })
                    : undefined,
            };
            const result = await this.zenSwarmOrchestrator.sendA2AMessage(message);
            return {
                success: result.success,
                data: result.result ? JSON.parse(result.result) : undefined,
                error: result.error,
                executionTimeMs: result.execution_time_ms,
            };
        }
        catch (error) {
            logger.error('❌ Failed to send A2A message:', error);
            return {
                success: false,
                error: `A2A message failed: ${error}`,
            };
        }
    }
    async executeNeuralService(taskType, inputData, config) {
        if (!(await this.isReady())) {
            return {
                success: false,
                error: 'zen-swarm-orchestrator not initialized',
            };
        }
        try {
            const task = {
                task_type: taskType,
                input_data: JSON.stringify(inputData),
                config: config ? JSON.stringify(config) : undefined,
                timeout_ms: 30000,
            };
            const result = await this.zenSwarmOrchestrator.executeNeuralService(task);
            const response = {
                success: result.success,
                data: result.result ? JSON.parse(result.result) : undefined,
                error: result.error,
                executionTimeMs: result.execution_time_ms,
                metadata: {
                    execution_path: result.execution_path,
                    resource_usage: result.resource_usage,
                    neural_metadata: result.neural_metadata
                        ? JSON.parse(result.neural_metadata)
                        : undefined,
                },
            };
            if (result.success) {
                logger.info(`✅ Neural service executed: ${taskType} via ${result.execution_path} in ${result.execution_time_ms}ms`);
            }
            else {
                logger.error(`❌ Neural service failed: ${taskType} - ${result.error}`);
            }
            return response;
        }
        catch (error) {
            logger.error('❌ Failed to execute neural service:', error);
            return {
                success: false,
                error: `Neural service execution failed: ${error}`,
            };
        }
    }
    async executeService(serviceName, parameters = {}) {
        const taskTypeMap = {
            'neural-forecast': 'forecasting-predict',
            'neural-compute': 'compute-execute',
            'collective-intelligence': 'collective-intelligence',
            'health-check': 'neural-forward',
            echo: 'neural-forward',
            'quantum-test': 'quantum-test',
            'quantum-execute': 'quantum-execute',
            'quantum-backends': 'quantum-backends',
            'quantum-submit': 'quantum-submit',
        };
        const taskType = taskTypeMap[serviceName] || serviceName;
        const result = await this.executeNeuralService(taskType, parameters);
        return {
            success: result.success,
            data: result.data,
            error: result.error,
            executionTimeMs: result.executionTimeMs,
        };
    }
    async listServices() {
        if (!(await this.isReady())) {
            return {
                success: false,
                error: 'zen-swarm-orchestrator not initialized',
            };
        }
        try {
            const services = await this.zenSwarmOrchestrator.listServices();
            return {
                success: true,
                data: services,
            };
        }
        catch (error) {
            logger.error('❌ Failed to list services:', error);
            return {
                success: false,
                error: `List services failed: ${error}`,
            };
        }
    }
    async getA2AServerStatus() {
        if (!(await this.isReady())) {
            return {
                success: false,
                error: 'zen-swarm-orchestrator not initialized',
            };
        }
        try {
            const statusJson = await this.zenSwarmOrchestrator.getA2AServerStatus();
            const statusData = JSON.parse(statusJson);
            return {
                success: true,
                data: statusData,
            };
        }
        catch (error) {
            logger.error('❌ Failed to get A2A server status:', error);
            return {
                success: false,
                error: `A2A server status failed: ${error}`,
            };
        }
    }
    async getMetrics() {
        if (!(await this.isReady())) {
            return {
                success: false,
                error: 'zen-swarm-orchestrator not initialized',
            };
        }
        try {
            const metricsJson = await this.zenSwarmOrchestrator.getMetrics();
            const metricsData = JSON.parse(metricsJson);
            return {
                success: true,
                data: metricsData,
            };
        }
        catch (error) {
            logger.error('❌ Failed to get metrics:', error);
            return {
                success: false,
                error: `Metrics request failed: ${error}`,
            };
        }
    }
    getVersion() {
        return 'zen-swarm-orchestrator-1.0.0';
    }
    async shutdown() {
        if (!this.isInitialized || !this.zenSwarmOrchestrator) {
            logger.warn('⚠️ zen-swarm-orchestrator not initialized, nothing to shutdown');
            return;
        }
        try {
            await this.zenSwarmOrchestrator.shutdown();
            this.zenSwarmOrchestrator = null;
            this.isInitialized = false;
            logger.info('✅ zen-orchestrator shutdown successfully');
        }
        catch (error) {
            logger.error('❌ Failed to shutdown zen-orchestrator:', error);
            throw error;
        }
    }
}
let zenSwarmOrchestratorInstance = null;
export function getZenSwarmOrchestratorIntegration(config) {
    if (!zenSwarmOrchestratorInstance) {
        zenSwarmOrchestratorInstance = new ZenOrchestratorIntegration(config);
        if (config?.enabled !== false) {
            zenSwarmOrchestratorInstance.initialize().catch((error) => {
                logger.error('❌ Failed to auto-initialize zen-swarm-orchestrator:', error);
            });
        }
    }
    return zenSwarmOrchestratorInstance;
}
export function resetZenSwarmOrchestratorIntegration() {
    if (zenSwarmOrchestratorInstance) {
        zenSwarmOrchestratorInstance.shutdown().catch((error) => {
            logger.error('❌ Failed to shutdown zen-swarm-orchestrator during reset:', error);
        });
    }
    zenSwarmOrchestratorInstance = null;
}
//# sourceMappingURL=zen-orchestrator-integration.js.map