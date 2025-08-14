import { EventEmitter } from 'node:events';
import HealthMonitor from '../../diagnostics/health-monitor.ts';
import ChaosEngineering from '../chaos-engineering/chaos-engineering.ts';
import ConnectionStateManager from '../connection-management/connection-state-manager.ts';
import { ErrorFactory } from './errors.ts';
import { Logger } from './logger.ts';
import MonitoringDashboard from './monitoring-dashboard.ts';
import RecoveryWorkflows from './recovery-workflows.ts';
export class RecoveryIntegration extends EventEmitter {
    options;
    logger;
    healthMonitor;
    recoveryWorkflows;
    connectionManager;
    monitoringDashboard;
    chaosEngineering;
    mcpTools;
    persistence;
    isInitialized;
    isRunning;
    components;
    integrationStatus;
    performanceMetrics;
    optimizationInterval;
    constructor(options = {}) {
        super();
        this.options = {
            enableHealthMonitoring: options?.enableHealthMonitoring !== false,
            enableRecoveryWorkflows: options?.enableRecoveryWorkflows !== false,
            enableConnectionManagement: options?.enableConnectionManagement !== false,
            enableMonitoringDashboard: options?.enableMonitoringDashboard !== false,
            enableChaosEngineering: options.enableChaosEngineering === true,
            autoIntegrate: options?.autoIntegrate !== false,
            configValidation: options?.configValidation !== false,
            performanceOptimization: options?.performanceOptimization !== false,
            ...options,
        };
        this.logger = new Logger({
            name: 'recovery-integration',
            level: process.env['LOG_LEVEL'] || 'INFO',
            metadata: { component: 'recovery-integration' },
        });
        this.healthMonitor = null;
        this.recoveryWorkflows = null;
        this.connectionManager = null;
        this.monitoringDashboard = null;
        this.chaosEngineering = null;
        this.mcpTools = null;
        this.persistence = null;
        this.isInitialized = false;
        this.isRunning = false;
        this.components = new Map();
        this.integrationStatus = new Map();
        this.performanceMetrics = {
            initializationTime: 0,
            componentStartupTimes: new Map(),
            integrationLatency: new Map(),
            totalMemoryUsage: 0,
        };
        this.optimizationInterval = null;
        this.initialize();
    }
    async initialize() {
        const startTime = Date.now();
        try {
            this.logger.info('Initializing Recovery Integration System');
            if (this.options.configValidation) {
                await this.validateConfiguration();
            }
            await this.initializeComponents();
            if (this.options.autoIntegrate) {
                await this.setupIntegrations();
            }
            if (this.options.performanceOptimization) {
                this.startPerformanceOptimization();
            }
            this.isInitialized = true;
            this.performanceMetrics.initializationTime = Date.now() - startTime;
            this.logger.info('Recovery Integration System initialized successfully', {
                initializationTime: this.performanceMetrics.initializationTime,
                componentsInitialized: this.components.size,
            });
            this.emit('integration:initialized');
        }
        catch (error) {
            const integrationError = ErrorFactory.createError('resource', 'Failed to initialize recovery integration system', {
                error: error.message,
                component: 'recovery-integration',
            });
            this.logger.error('Recovery Integration initialization failed', integrationError);
            throw integrationError;
        }
    }
    async initializeComponents() {
        if (this.options.enableHealthMonitoring) {
            await this.initializeComponent('healthMonitor', HealthMonitor, {
                checkInterval: 30000,
                systemCheckInterval: 60000,
                enableRealTimeMonitoring: true,
                enablePerformanceMetrics: true,
            });
        }
        if (this.options.enableRecoveryWorkflows) {
            await this.initializeComponent('recoveryWorkflows', RecoveryWorkflows, {
                maxRetries: 3,
                retryDelay: 5000,
                maxConcurrentRecoveries: 3,
                recoveryTimeout: 300000,
            });
        }
        if (this.options.enableConnectionManagement) {
            await this.initializeComponent('connectionManager', ConnectionStateManager, {
                maxConnections: 10,
                connectionTimeout: 30000,
                healthCheckInterval: 30000,
                persistenceEnabled: true,
            });
        }
        if (this.options.enableMonitoringDashboard) {
            await this.initializeComponent('monitoringDashboard', MonitoringDashboard, {
                enableRealTimeStreaming: true,
                enableTrendAnalysis: true,
                metricsRetentionPeriod: 86400000,
                aggregationInterval: 60000,
            });
        }
        if (this.options.enableChaosEngineering) {
            await this.initializeComponent('chaosEngineering', ChaosEngineering, {
                enableChaos: true,
                safetyEnabled: true,
                maxConcurrentExperiments: 2,
                blastRadiusLimit: 0.3,
            });
        }
    }
    async initializeComponent(name, ComponentClass, options = {}) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Initializing component: ${name}`);
            const componentOptions = {
                ...(this.options[name] || {}),
                ...options,
            };
            const component = new ComponentClass(componentOptions);
            await component.initialize();
            this[name] = component;
            this.components.set(name, {
                instance: component,
                status: 'initialized',
                initTime: Date.now() - startTime,
                options: componentOptions,
            });
            this.performanceMetrics.componentStartupTimes.set(name, Date.now() - startTime);
            this.logger.debug(`Component initialized: ${name}`, {
                initTime: Date.now() - startTime,
            });
            this.emit('component:initialized', { name, component });
        }
        catch (error) {
            this.logger.error(`Failed to initialize component: ${name}`, {
                error: error.message,
            });
            this.components.set(name, {
                instance: null,
                status: 'failed',
                error: error.message,
                initTime: Date.now() - startTime,
            });
            throw error;
        }
    }
    async setupIntegrations() {
        this.logger.info('Setting up component integrations');
        const integrations = [
            {
                from: 'healthMonitor',
                to: 'recoveryWorkflows',
                method: 'setHealthMonitor',
            },
            {
                from: 'healthMonitor',
                to: 'monitoringDashboard',
                method: 'setHealthMonitor',
            },
            {
                from: 'healthMonitor',
                to: 'chaosEngineering',
                method: 'setHealthMonitor',
            },
            {
                from: 'recoveryWorkflows',
                to: 'healthMonitor',
                method: 'setRecoveryWorkflows',
            },
            {
                from: 'recoveryWorkflows',
                to: 'monitoringDashboard',
                method: 'setRecoveryWorkflows',
            },
            {
                from: 'recoveryWorkflows',
                to: 'chaosEngineering',
                method: 'setRecoveryWorkflows',
            },
            {
                from: 'connectionManager',
                to: 'healthMonitor',
                method: 'setConnectionManager',
            },
            {
                from: 'connectionManager',
                to: 'recoveryWorkflows',
                method: 'setConnectionManager',
            },
            {
                from: 'connectionManager',
                to: 'monitoringDashboard',
                method: 'setConnectionManager',
            },
            {
                from: 'connectionManager',
                to: 'chaosEngineering',
                method: 'setConnectionManager',
            },
            {
                from: 'mcpTools',
                to: 'healthMonitor',
                method: 'setMCPTools',
            },
            {
                from: 'mcpTools',
                to: 'recoveryWorkflows',
                method: 'setMCPTools',
            },
            {
                from: 'mcpTools',
                to: 'monitoringDashboard',
                method: 'setMCPTools',
            },
            {
                from: 'mcpTools',
                to: 'chaosEngineering',
                method: 'setMCPTools',
            },
            {
                from: 'persistence',
                to: 'connectionManager',
                method: 'setPersistence',
            },
        ];
        for (const integration of integrations) {
            await this.setupIntegration(integration);
        }
        this.logger.info('Component integrations completed', {
            totalIntegrations: integrations.length,
            successfulIntegrations: Array.from(this.integrationStatus.values()).filter((status) => status.status === 'success').length,
        });
    }
    async setupIntegration(integration) {
        const { from, to, method } = integration;
        const integrationKey = `${from}->${to}`;
        try {
            const fromComponent = from === 'mcpTools'
                ? this.mcpTools
                : from === 'persistence'
                    ? this.persistence
                    : this[from];
            const toComponent = this[to];
            if (!(fromComponent && toComponent)) {
                this.integrationStatus.set(integrationKey, {
                    status: 'skipped',
                    reason: `Component not available: from=${!!fromComponent}, to=${!!toComponent}`,
                });
                return;
            }
            if (typeof toComponent[method] === 'function') {
                const startTime = Date.now();
                await toComponent[method](fromComponent);
                const latency = Date.now() - startTime;
                this.performanceMetrics.integrationLatency.set(integrationKey, latency);
                this.integrationStatus.set(integrationKey, {
                    status: 'success',
                    latency,
                });
                this.logger.debug(`Integration completed: ${integrationKey}`, {
                    latency,
                });
            }
            else {
                this.integrationStatus.set(integrationKey, {
                    status: 'failed',
                    reason: `Method '${method}' not found on component '${to}'`,
                });
            }
        }
        catch (error) {
            this.integrationStatus.set(integrationKey, {
                status: 'failed',
                error: error.message,
            });
            this.logger.error(`Integration failed: ${integrationKey}`, {
                error: error.message,
            });
        }
    }
    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        if (this.isRunning) {
            this.logger.warn('Recovery system already running');
            return;
        }
        try {
            this.logger.info('Starting Recovery Integration System');
            this.isRunning = true;
            this.logger.info('Recovery Integration System started successfully');
            this.emit('integration:started');
        }
        catch (error) {
            const startError = ErrorFactory.createError('resource', 'Failed to start recovery integration system', {
                error: error.message,
            });
            this.logger.error('Recovery Integration start failed', startError);
            throw startError;
        }
    }
    async stop() {
        if (!this.isRunning) {
            this.logger.warn('Recovery system not running');
            return;
        }
        try {
            this.logger.info('Stopping Recovery Integration System');
            this.isRunning = false;
            this.logger.info('Recovery Integration System stopped successfully');
            this.emit('integration:stopped');
        }
        catch (error) {
            this.logger.error('Error stopping recovery integration system', {
                error: error.message,
            });
            throw error;
        }
    }
    setMCPTools(mcpTools) {
        this.mcpTools = mcpTools;
        this.logger.info('MCP Tools integration configured');
        if (this.isInitialized && this.options.autoIntegrate) {
            this.propagateIntegration('mcpTools', mcpTools);
        }
    }
    setPersistence(persistence) {
        this.persistence = persistence;
        this.logger.info('Persistence integration configured');
        if (this.isInitialized && this.options.autoIntegrate) {
            this.propagateIntegration('persistence', persistence);
        }
    }
    async propagateIntegration(integrationType, integration) {
        const methodMap = {
            mcpTools: 'setMCPTools',
            persistence: 'setPersistence',
        };
        const method = methodMap[integrationType];
        if (!method)
            return;
        for (const [name, componentData] of this.components) {
            if (componentData?.instance &&
                typeof componentData?.instance?.[method] === 'function') {
                try {
                    await componentData?.instance?.[method](integration);
                    this.logger.debug(`Propagated ${integrationType} to ${name}`);
                }
                catch (error) {
                    this.logger.error(`Failed to propagate ${integrationType} to ${name}`, {
                        error: error.message,
                    });
                }
            }
        }
    }
    async registerSwarm(swarmId, swarmInstance) {
        this.logger.info(`Registering swarm across recovery system: ${swarmId}`);
        if (this.healthMonitor) {
        }
        if (this.connectionManager && swarmInstance.mcpConnections) {
            for (const [connectionId, connectionConfig] of Object.entries(swarmInstance.mcpConnections)) {
                await this.connectionManager.registerConnection({
                    id: connectionId,
                    ...connectionConfig,
                    metadata: { swarmId },
                });
            }
        }
        this.emit('swarm:registered', { swarmId, swarmInstance });
    }
    async unregisterSwarm(swarmId) {
        this.logger.info(`Unregistering swarm from recovery system: ${swarmId}`);
        if (this.healthMonitor) {
        }
        if (this.connectionManager) {
            const connectionStatus = this.connectionManager.getConnectionStatus();
            if (connectionStatus && connectionStatus.connections) {
                for (const [connectionId, connection] of Object.entries(connectionStatus.connections)) {
                    if (connection.metadata?.swarmId === swarmId) {
                        await this.connectionManager.removeConnection(connectionId);
                    }
                }
            }
        }
        this.emit('swarm:unregistered', { swarmId });
    }
    getSystemStatus() {
        const status = {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            components: {},
            integrations: Object.fromEntries(this.integrationStatus),
            performance: this.getPerformanceMetrics(),
            health: null,
            recovery: null,
            connections: null,
            monitoring: null,
            chaos: null,
        };
        for (const [name, componentData] of this.components) {
            status.components[name] = {
                status: componentData?.status,
                initTime: componentData?.initTime,
                error: componentData?.error,
            };
        }
        if (this.healthMonitor) {
            status.health = { placeholder: 'health_stats' };
        }
        if (this.recoveryWorkflows) {
            status.recovery = this.recoveryWorkflows.getRecoveryStats();
        }
        if (this.connectionManager) {
            const connectionStats = this.connectionManager.getConnectionStats();
            status.connections = connectionStats || {
                connectionCount: 0,
                healthyConnections: 0,
                reconnectingConnections: 0,
                totalConnections: 0,
                activeConnections: 0,
                failedConnections: 0,
                reconnectAttempts: 0,
                averageConnectionTime: 0,
                totalConnectionTime: 0,
            };
        }
        if (this.monitoringDashboard) {
            status.monitoring = this.monitoringDashboard.getMonitoringStats();
        }
        if (this.chaosEngineering) {
            const chaosStats = this.chaosEngineering.getChaosStats();
            status.chaos = chaosStats || {
                activeExperiments: 0,
                registeredExperiments: 0,
                enabledExperiments: 0,
                failureInjectors: 0,
                emergencyStop: false,
                totalExperiments: 0,
                successfulExperiments: 0,
                failedExperiments: 0,
                averageRecoveryTime: 0,
                totalRecoveryTime: 0,
            };
        }
        return status;
    }
    getPerformanceMetrics() {
        const memUsage = process.memoryUsage();
        this.performanceMetrics.totalMemoryUsage = memUsage.heapUsed;
        return {
            ...this.performanceMetrics,
            componentStartupTimes: Object.fromEntries(this.performanceMetrics.componentStartupTimes),
            integrationLatency: Object.fromEntries(this.performanceMetrics.integrationLatency),
            currentMemoryUsage: memUsage,
            timestamp: new Date(),
        };
    }
    startPerformanceOptimization() {
        this.logger.info('Starting performance optimization');
        const optimizationInterval = setInterval(() => {
            try {
                this.performMemoryOptimization();
            }
            catch (error) {
                this.logger.error('Error in performance optimization', {
                    error: error.message,
                });
            }
        }, 300000);
        this.optimizationInterval = optimizationInterval;
    }
    performMemoryOptimization() {
        const memUsage = process.memoryUsage();
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
        if (heapUsedMB > 512) {
            this.logger.info('Performing memory optimization', {
                heapUsedMB: heapUsedMB.toFixed(2),
            });
            if (global.gc) {
                global.gc();
            }
            this.optimizeComponentCaches();
            this.emit('performance:optimized', { heapUsedMB });
        }
    }
    optimizeComponentCaches() {
        if (this.healthMonitor) {
        }
        if (this.monitoringDashboard) {
        }
        this.logger.debug('Component caches optimized');
    }
    async validateConfiguration() {
        this.logger.debug('Validating recovery integration configuration');
        const validationErrors = [];
        if (this.options.enableHealthMonitoring && this.options.healthMonitor) {
            const healthConfig = this.options.healthMonitor;
            if (healthConfig?.checkInterval && healthConfig?.checkInterval < 5000) {
                validationErrors.push('Health check interval too low (minimum 5000ms)');
            }
        }
        if (this.options.enableRecoveryWorkflows &&
            this.options.recoveryWorkflows) {
            const recoveryConfig = this.options.recoveryWorkflows;
            if (recoveryConfig?.maxConcurrentRecoveries &&
                recoveryConfig?.maxConcurrentRecoveries > 10) {
                validationErrors.push('Too many concurrent recoveries (maximum 10)');
            }
        }
        if (this.options.enableChaosEngineering && this.options.chaosEngineering) {
            const chaosConfig = this.options.chaosEngineering;
            if (chaosConfig?.blastRadiusLimit &&
                chaosConfig?.blastRadiusLimit > 0.5) {
                validationErrors.push('Blast radius limit too high (maximum 0.5)');
            }
        }
        if (validationErrors.length > 0) {
            throw ErrorFactory.createError('configuration', `Configuration validation failed: ${validationErrors.join(', ')}`);
        }
        this.logger.debug('Configuration validation passed');
    }
    async runSystemHealthCheck() {
        const healthResults = {
            overall: 'healthy',
            components: {},
            issues: [],
        };
        for (const [name, componentData] of this.components) {
            if (componentData?.status === 'failed') {
                if (healthResults?.components)
                    healthResults.components[name] = 'failed';
                healthResults?.issues?.push(`Component ${name} failed to initialize`);
                healthResults.overall = 'degraded';
            }
            else if (healthResults?.components)
                healthResults.components[name] = 'healthy';
        }
        let failedIntegrations = 0;
        for (const [key, status] of this.integrationStatus) {
            if (status.status === 'failed') {
                failedIntegrations++;
                healthResults?.issues?.push(`Integration failed: ${key}`);
            }
        }
        if (failedIntegrations > 0) {
            healthResults.overall = failedIntegrations > 2 ? 'error' : 'degraded';
        }
        if (this.healthMonitor) {
            const systemHealth = { status: 'healthy', placeholder: true };
            if (systemHealth.status !== 'healthy') {
                healthResults.overall = systemHealth.status;
                healthResults?.issues?.push('System health monitor reports issues');
            }
        }
        return healthResults;
    }
    exportSystemData() {
        return {
            timestamp: new Date(),
            status: this.getSystemStatus(),
            health: this.healthMonitor ? {} : null,
            recovery: this.recoveryWorkflows
                ? this.recoveryWorkflows.exportRecoveryData()
                : null,
            connections: this.connectionManager
                ? this.connectionManager.exportConnectionData()
                : null,
            monitoring: this.monitoringDashboard
                ? this.monitoringDashboard.exportDashboardData()
                : null,
            chaos: this.chaosEngineering
                ? this.chaosEngineering.exportChaosData()
                : null,
        };
    }
    async emergencyShutdown(reason = 'Emergency shutdown') {
        this.logger.warn('EMERGENCY SHUTDOWN INITIATED', { reason });
        try {
            if (this.chaosEngineering) {
            }
            await this.shutdown();
            this.emit('emergency:shutdown', { reason });
        }
        catch (error) {
            this.logger.error('Error during emergency shutdown', {
                error: error.message,
            });
        }
    }
    async shutdown() {
        this.logger.info('Shutting down Recovery Integration System');
        if (this.optimizationInterval) {
            clearInterval(this.optimizationInterval);
        }
        const shutdownOrder = [
            'chaosEngineering',
            'monitoringDashboard',
            'connectionManager',
            'recoveryWorkflows',
            'healthMonitor',
        ];
        for (const componentName of shutdownOrder) {
            const component = this[componentName];
            if (component && typeof component.shutdown === 'function') {
                try {
                    await component.shutdown();
                    this.logger.debug(`Component shutdown: ${componentName}`);
                }
                catch (error) {
                    this.logger.error(`Error shutting down component: ${componentName}`, {
                        error: error.message,
                    });
                }
            }
        }
        this.components.clear();
        this.integrationStatus.clear();
        this.isInitialized = false;
        this.isRunning = false;
        this.emit('integration:shutdown');
    }
}
export default RecoveryIntegration;
//# sourceMappingURL=recovery-integration.js.map