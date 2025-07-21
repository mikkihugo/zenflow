"use strict";
/**
 * Claude Flow v2.0.0 System Integration
 * Comprehensive integration manager for all system components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemIntegration = exports.SystemIntegration = void 0;
const event_bus_js_1 = require("../core/event-bus.js");
const logger_js_1 = require("../core/logger.js");
const error_handler_js_1 = require("../utils/error-handler.js");
class SystemIntegration {
    constructor() {
        this.orchestrator = null;
        this.configManager = null;
        this.memoryManager = null;
        this.agentManager = null;
        this.swarmCoordinator = null;
        this.taskEngine = null;
        this.monitor = null;
        this.mcpServer = null;
        this.initialized = false;
        this.componentStatuses = new Map();
        this.eventBus = event_bus_js_1.EventBus.getInstance();
        this.logger = new logger_js_1.Logger({ level: 'info', format: 'text', destination: 'console' });
        // Initialize configManager safely
        try {
            // Dynamic import for ConfigManager if available
            this.configManager = { getInstance: () => ({ load: async () => { }, get: () => null, set: () => { } }) };
        }
        catch (error) {
            this.logger.warn('ConfigManager not available, using mock');
            this.configManager = { load: async () => { }, get: () => null, set: () => { } };
        }
        this.setupEventHandlers();
    }
    static getInstance() {
        if (!SystemIntegration.instance) {
            SystemIntegration.instance = new SystemIntegration();
        }
        return SystemIntegration.instance;
    }
    /**
     * Initialize all system components in proper order
     */
    async initialize(config) {
        if (this.initialized) {
            this.logger.warn('System already initialized');
            return;
        }
        this.logger.info('🚀 Starting Claude Flow v2.0.0 System Integration');
        try {
            // Phase 1: Core Infrastructure
            await this.initializeCore(config);
            // Phase 2: Memory and Configuration
            await this.initializeMemoryAndConfig();
            // Phase 3: Agents and Coordination
            await this.initializeAgentsAndCoordination();
            // Phase 4: Task Management
            await this.initializeTaskManagement();
            // Phase 5: Monitoring and MCP
            await this.initializeMonitoringAndMcp();
            // Phase 6: Cross-component wiring
            await this.wireComponents();
            this.initialized = true;
            this.logger.info('✅ Claude Flow v2.0.0 System Integration Complete');
            // Emit system ready event
            this.eventBus.emit('system:ready', {
                timestamp: Date.now(),
                components: Array.from(this.componentStatuses.keys()),
                health: await this.getSystemHealth()
            });
        }
        catch (error) {
            this.logger.error('❌ System Integration Failed:', (0, error_handler_js_1.getErrorMessage)(error));
            throw error;
        }
    }
    /**
     * Initialize core infrastructure components
     */
    async initializeCore(config) {
        this.logger.info('🔧 Phase 1: Initializing Core Infrastructure');
        try {
            // Initialize configuration
            if (this.configManager && typeof this.configManager.load === 'function') {
                await this.configManager.load();
                this.updateComponentStatus('config', 'healthy', 'Configuration loaded');
            }
            else {
                this.updateComponentStatus('config', 'warning', 'Configuration manager not available');
            }
            // Try to initialize orchestrator if available
            try {
                const { Orchestrator } = await Promise.resolve().then(() => require('../core/orchestrator-fixed.js'));
                this.orchestrator = new Orchestrator(this.configManager, this.eventBus, this.logger);
                if (typeof this.orchestrator.initialize === 'function') {
                    await this.orchestrator.initialize();
                }
                this.updateComponentStatus('orchestrator', 'healthy', 'Orchestrator initialized');
            }
            catch (error) {
                this.logger.warn('Orchestrator not available:', (0, error_handler_js_1.getErrorMessage)(error));
                this.updateComponentStatus('orchestrator', 'warning', 'Orchestrator not available');
            }
            this.logger.info('✅ Core Infrastructure Ready');
        }
        catch (error) {
            this.logger.error('Core initialization failed:', (0, error_handler_js_1.getErrorMessage)(error));
            throw error;
        }
    }
    /**
     * Initialize memory and configuration management
     */
    async initializeMemoryAndConfig() {
        this.logger.info('🧠 Phase 2: Initializing Memory and Configuration');
        try {
            // Initialize memory manager
            try {
                const { MemoryManager } = await Promise.resolve().then(() => require('../memory/manager.js'));
                // Create default memory configuration
                const memoryConfig = {
                    backend: 'sqlite',
                    cacheSizeMB: 50,
                    syncInterval: 30000, // 30 seconds
                    conflictResolution: 'last-write',
                    retentionDays: 30,
                    sqlitePath: './.swarm/memory.db'
                };
                // Initialize MemoryManager with required parameters
                this.memoryManager = new MemoryManager(memoryConfig, this.eventBus, this.logger);
                if (typeof this.memoryManager.initialize === 'function') {
                    await this.memoryManager.initialize();
                }
                this.updateComponentStatus('memory', 'healthy', 'Memory manager initialized with SQLite backend');
                this.logger.info('Memory manager initialized successfully', {
                    backend: memoryConfig.backend,
                    cacheSizeMB: memoryConfig.cacheSizeMB,
                    sqlitePath: memoryConfig.sqlitePath
                });
            }
            catch (error) {
                this.logger.warn('Memory manager initialization failed:', (0, error_handler_js_1.getErrorMessage)(error));
                this.updateComponentStatus('memory', 'warning', 'Memory manager not available');
            }
            this.logger.info('✅ Memory and Configuration Ready');
        }
        catch (error) {
            this.logger.error('Memory initialization failed:', (0, error_handler_js_1.getErrorMessage)(error));
            throw error;
        }
    }
    /**
     * Initialize agents and coordination systems
     */
    async initializeAgentsAndCoordination() {
        this.logger.info('🤖 Phase 3: Initializing Agents and Coordination');
        try {
            // Initialize agent manager
            try {
                const { AgentManager } = await Promise.resolve().then(() => require('../agents/agent-manager.js'));
                this.agentManager = new AgentManager(this.eventBus, this.logger);
                if (typeof this.agentManager.initialize === 'function') {
                    await this.agentManager.initialize();
                }
                this.updateComponentStatus('agents', 'healthy', 'Agent manager initialized');
            }
            catch (error) {
                this.logger.warn('Agent manager not available, using mock:', (0, error_handler_js_1.getErrorMessage)(error));
                const { MockAgentManager } = await Promise.resolve().then(() => require('./mock-components.js'));
                this.agentManager = new MockAgentManager(this.eventBus, this.logger);
                await this.agentManager.initialize();
                this.updateComponentStatus('agents', 'warning', 'Using mock agent manager');
            }
            // Initialize swarm coordinator
            try {
                const { SwarmCoordinator } = await Promise.resolve().then(() => require('../coordination/swarm-coordinator.js'));
                this.swarmCoordinator = new SwarmCoordinator(this.eventBus, this.logger, this.memoryManager);
                if (typeof this.swarmCoordinator.initialize === 'function') {
                    await this.swarmCoordinator.initialize();
                }
                this.updateComponentStatus('swarm', 'healthy', 'Swarm coordinator initialized');
            }
            catch (error) {
                this.logger.warn('Swarm coordinator not available, using mock:', (0, error_handler_js_1.getErrorMessage)(error));
                const { MockSwarmCoordinator } = await Promise.resolve().then(() => require('./mock-components.js'));
                this.swarmCoordinator = new MockSwarmCoordinator(this.eventBus, this.logger, this.memoryManager);
                await this.swarmCoordinator.initialize();
                this.updateComponentStatus('swarm', 'warning', 'Using mock swarm coordinator');
            }
            this.logger.info('✅ Agents and Coordination Ready');
        }
        catch (error) {
            this.logger.error('Agents and coordination initialization failed:', (0, error_handler_js_1.getErrorMessage)(error));
            throw error;
        }
    }
    /**
     * Initialize task management system
     */
    async initializeTaskManagement() {
        this.logger.info('📋 Phase 4: Initializing Task Management');
        try {
            // Initialize task engine
            try {
                const { TaskEngine } = await Promise.resolve().then(() => require('../task/engine.js'));
                this.taskEngine = new TaskEngine(this.eventBus, this.logger, this.memoryManager);
                if (typeof this.taskEngine.initialize === 'function') {
                    await this.taskEngine.initialize();
                }
                this.updateComponentStatus('tasks', 'healthy', 'Task engine initialized');
            }
            catch (error) {
                this.logger.warn('Task engine not available, using mock:', (0, error_handler_js_1.getErrorMessage)(error));
                const { MockTaskEngine } = await Promise.resolve().then(() => require('./mock-components.js'));
                this.taskEngine = new MockTaskEngine(this.eventBus, this.logger, this.memoryManager);
                await this.taskEngine.initialize();
                this.updateComponentStatus('tasks', 'warning', 'Using mock task engine');
            }
            this.logger.info('✅ Task Management Ready');
        }
        catch (error) {
            this.logger.error('Task management initialization failed:', (0, error_handler_js_1.getErrorMessage)(error));
            throw error;
        }
    }
    /**
     * Initialize monitoring and MCP systems
     */
    async initializeMonitoringAndMcp() {
        this.logger.info('📊 Phase 5: Initializing Monitoring and MCP');
        try {
            // Initialize real-time monitor
            try {
                const { RealTimeMonitor } = await Promise.resolve().then(() => require('../monitoring/real-time-monitor.js'));
                this.monitor = new RealTimeMonitor(this.eventBus, this.logger);
                if (typeof this.monitor.initialize === 'function') {
                    await this.monitor.initialize();
                }
                this.updateComponentStatus('monitor', 'healthy', 'Real-time monitor initialized');
            }
            catch (error) {
                this.logger.warn('Real-time monitor not available, using mock:', (0, error_handler_js_1.getErrorMessage)(error));
                const { MockRealTimeMonitor } = await Promise.resolve().then(() => require('./mock-components.js'));
                this.monitor = new MockRealTimeMonitor(this.eventBus, this.logger);
                await this.monitor.initialize();
                this.updateComponentStatus('monitor', 'warning', 'Using mock monitor');
            }
            // Initialize MCP server
            try {
                const { McpServer } = await Promise.resolve().then(() => require('../mcp/server.js'));
                this.mcpServer = new McpServer(this.eventBus, this.logger);
                if (typeof this.mcpServer.initialize === 'function') {
                    await this.mcpServer.initialize();
                }
                this.updateComponentStatus('mcp', 'healthy', 'MCP server initialized');
            }
            catch (error) {
                this.logger.warn('MCP server not available, using mock:', (0, error_handler_js_1.getErrorMessage)(error));
                const { MockMcpServer } = await Promise.resolve().then(() => require('./mock-components.js'));
                this.mcpServer = new MockMcpServer(this.eventBus, this.logger);
                await this.mcpServer.initialize();
                this.updateComponentStatus('mcp', 'warning', 'Using mock MCP server');
            }
            this.logger.info('✅ Monitoring and MCP Ready');
        }
        catch (error) {
            this.logger.error('Monitoring and MCP initialization failed:', (0, error_handler_js_1.getErrorMessage)(error));
            throw error;
        }
    }
    /**
     * Wire all components together for proper communication
     */
    async wireComponents() {
        this.logger.info('🔗 Phase 6: Wiring Components');
        // Wire orchestrator to agents
        if (this.orchestrator && this.agentManager) {
            this.orchestrator.setAgentManager(this.agentManager);
            this.agentManager.setOrchestrator(this.orchestrator);
        }
        // Wire swarm coordinator to agents and tasks
        if (this.swarmCoordinator && this.agentManager && this.taskEngine) {
            this.swarmCoordinator.setAgentManager(this.agentManager);
            this.swarmCoordinator.setTaskEngine(this.taskEngine);
            this.taskEngine.setSwarmCoordinator(this.swarmCoordinator);
        }
        // Wire monitor to all components
        if (this.monitor) {
            this.monitor.attachToOrchestrator(this.orchestrator);
            this.monitor.attachToAgentManager(this.agentManager);
            this.monitor.attachToSwarmCoordinator(this.swarmCoordinator);
            this.monitor.attachToTaskEngine(this.taskEngine);
        }
        // Wire MCP server to core components
        if (this.mcpServer) {
            this.mcpServer.attachToOrchestrator(this.orchestrator);
            this.mcpServer.attachToAgentManager(this.agentManager);
            this.mcpServer.attachToSwarmCoordinator(this.swarmCoordinator);
            this.mcpServer.attachToTaskEngine(this.taskEngine);
            this.mcpServer.attachToMemoryManager(this.memoryManager);
        }
        this.logger.info('✅ Component Wiring Complete');
    }
    /**
     * Setup event handlers for cross-component communication
     */
    setupEventHandlers() {
        // System health monitoring
        this.eventBus.on('component:status', (event) => {
            this.updateComponentStatus(event.component, event.status, event.message);
        });
        // Error handling
        this.eventBus.on('system:error', (event) => {
            this.logger.error(`System Error in ${event.component}:`, event.error);
            this.updateComponentStatus(event.component, 'unhealthy', event.error.message);
        });
        // Performance monitoring
        this.eventBus.on('performance:metric', (event) => {
            this.logger.debug(`Performance Metric: ${event.metric} = ${event.value}`);
        });
    }
    /**
     * Update component status
     */
    updateComponentStatus(component, status, message) {
        const statusInfo = {
            component,
            status,
            message: message || '',
            timestamp: Date.now(),
            lastHealthCheck: Date.now()
        };
        this.componentStatuses.set(component, statusInfo);
        // Emit status update
        this.eventBus.emit('component:status:updated', statusInfo);
    }
    /**
     * Get system health status
     */
    async getSystemHealth() {
        const components = Array.from(this.componentStatuses.values());
        const healthyComponents = components.filter(c => c.status === 'healthy').length;
        const unhealthyComponents = components.filter(c => c.status === 'unhealthy').length;
        const warningComponents = components.filter(c => c.status === 'warning').length;
        let overallStatus = 'healthy';
        if (unhealthyComponents > 0) {
            overallStatus = 'unhealthy';
        }
        else if (warningComponents > 0) {
            overallStatus = 'warning';
        }
        return {
            overall: overallStatus,
            components: Object.fromEntries(this.componentStatuses),
            metrics: {
                totalComponents: components.length,
                healthyComponents,
                unhealthyComponents,
                warningComponents,
                uptime: Date.now() - (this.initialized ? Date.now() : 0)
            },
            timestamp: Date.now()
        };
    }
    /**
     * Get specific component
     */
    getComponent(name) {
        switch (name) {
            case 'orchestrator':
                return this.orchestrator;
            case 'configManager':
                return this.configManager;
            case 'memoryManager':
                return this.memoryManager;
            case 'agentManager':
                return this.agentManager;
            case 'swarmCoordinator':
                return this.swarmCoordinator;
            case 'taskEngine':
                return this.taskEngine;
            case 'monitor':
                return this.monitor;
            case 'mcpServer':
                return this.mcpServer;
            case 'eventBus':
                return this.eventBus;
            case 'logger':
                return this.logger;
            default:
                return null;
        }
    }
    /**
     * Shutdown all components gracefully
     */
    async shutdown() {
        this.logger.info('🛑 Shutting down Claude Flow v2.0.0');
        // Shutdown in reverse order
        if (this.mcpServer) {
            await this.mcpServer.shutdown();
        }
        if (this.monitor) {
            await this.monitor.shutdown();
        }
        if (this.taskEngine) {
            await this.taskEngine.shutdown();
        }
        if (this.swarmCoordinator) {
            await this.swarmCoordinator.shutdown();
        }
        if (this.agentManager) {
            await this.agentManager.shutdown();
        }
        if (this.memoryManager) {
            await this.memoryManager.shutdown();
        }
        if (this.orchestrator) {
            await this.orchestrator.shutdown();
        }
        this.initialized = false;
        this.logger.info('✅ Claude Flow v2.0.0 Shutdown Complete');
    }
    /**
     * Check if system is ready
     */
    isReady() {
        return this.initialized;
    }
    /**
     * Get initialization status
     */
    getInitializationStatus() {
        return {
            initialized: this.initialized,
            components: Array.from(this.componentStatuses.keys()),
            health: this.initialized ? null : null // Will be populated after initialization
        };
    }
}
exports.SystemIntegration = SystemIntegration;
// Export singleton instance
exports.systemIntegration = SystemIntegration.getInstance();
