"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPUtils = exports.DefaultMCPConfigs = exports.MCPIntegrationFactory = exports.createSwarmTools = exports.createClaudeFlowTools = exports.RequestQueue = exports.LoadBalancer = exports.SessionManager = exports.RequestRouter = exports.HttpTransport = exports.StdioTransport = exports.MCPOrchestrationIntegration = exports.MCPPerformanceMonitor = exports.Permissions = exports.AuthManager = exports.MCPProtocolManager = exports.ToolRegistry = exports.LifecycleState = exports.MCPLifecycleManager = exports.MCPServer = void 0;
/**
 * MCP (Model Context Protocol) Module
 * Export all MCP components for easy integration
 */
// Core MCP Server
var server_js_1 = require("./server.js");
Object.defineProperty(exports, "MCPServer", { enumerable: true, get: function () { return server_js_1.MCPServer; } });
// Lifecycle Management
var lifecycle_manager_js_1 = require("./lifecycle-manager.js");
Object.defineProperty(exports, "MCPLifecycleManager", { enumerable: true, get: function () { return lifecycle_manager_js_1.MCPLifecycleManager; } });
Object.defineProperty(exports, "LifecycleState", { enumerable: true, get: function () { return lifecycle_manager_js_1.LifecycleState; } });
// Tool Registry and Management
var tools_js_1 = require("./tools.js");
Object.defineProperty(exports, "ToolRegistry", { enumerable: true, get: function () { return tools_js_1.ToolRegistry; } });
// Protocol Management
var protocol_manager_js_1 = require("./protocol-manager.js");
Object.defineProperty(exports, "MCPProtocolManager", { enumerable: true, get: function () { return protocol_manager_js_1.MCPProtocolManager; } });
// Authentication and Authorization
var auth_js_1 = require("./auth.js");
Object.defineProperty(exports, "AuthManager", { enumerable: true, get: function () { return auth_js_1.AuthManager; } });
Object.defineProperty(exports, "Permissions", { enumerable: true, get: function () { return auth_js_1.Permissions; } });
// Performance Monitoring
var performance_monitor_js_1 = require("./performance-monitor.js");
Object.defineProperty(exports, "MCPPerformanceMonitor", { enumerable: true, get: function () { return performance_monitor_js_1.MCPPerformanceMonitor; } });
// Orchestration Integration
var orchestration_integration_js_1 = require("./orchestration-integration.js");
Object.defineProperty(exports, "MCPOrchestrationIntegration", { enumerable: true, get: function () { return orchestration_integration_js_1.MCPOrchestrationIntegration; } });
var stdio_js_1 = require("./transports/stdio.js");
Object.defineProperty(exports, "StdioTransport", { enumerable: true, get: function () { return stdio_js_1.StdioTransport; } });
var http_js_1 = require("./transports/http.js");
Object.defineProperty(exports, "HttpTransport", { enumerable: true, get: function () { return http_js_1.HttpTransport; } });
// Request Routing
var router_js_1 = require("./router.js");
Object.defineProperty(exports, "RequestRouter", { enumerable: true, get: function () { return router_js_1.RequestRouter; } });
// Session Management
var session_manager_js_1 = require("./session-manager.js");
Object.defineProperty(exports, "SessionManager", { enumerable: true, get: function () { return session_manager_js_1.SessionManager; } });
// Load Balancing
var load_balancer_js_1 = require("./load-balancer.js");
Object.defineProperty(exports, "LoadBalancer", { enumerable: true, get: function () { return load_balancer_js_1.LoadBalancer; } });
Object.defineProperty(exports, "RequestQueue", { enumerable: true, get: function () { return load_balancer_js_1.RequestQueue; } });
// Tool Implementations
var claude_flow_tools_js_1 = require("./claude-flow-tools.js");
Object.defineProperty(exports, "createClaudeFlowTools", { enumerable: true, get: function () { return claude_flow_tools_js_1.createClaudeFlowTools; } });
var swarm_tools_js_1 = require("./swarm-tools.js");
Object.defineProperty(exports, "createSwarmTools", { enumerable: true, get: function () { return swarm_tools_js_1.createSwarmTools; } });
/**
 * MCP Integration Factory
 * Provides a simple way to create a complete MCP integration
 */
class MCPIntegrationFactory {
    /**
     * Create a complete MCP integration with all components
     */
    static async createIntegration(config) {
        const { mcpConfig, orchestrationConfig = {}, components = {}, logger } = config;
        const integration = new MCPOrchestrationIntegration(mcpConfig, {
            enabledIntegrations: {
                orchestrator: true,
                swarm: true,
                agents: true,
                resources: true,
                memory: true,
                monitoring: true,
                terminals: true,
            },
            autoStart: true,
            healthCheckInterval: 30000,
            reconnectAttempts: 3,
            reconnectDelay: 5000,
            enableMetrics: true,
            enableAlerts: true,
            ...orchestrationConfig,
        }, components, logger);
        return integration;
    }
    /**
     * Create a standalone MCP server (without orchestration integration)
     */
    static async createStandaloneServer(config) {
        const { mcpConfig, logger, enableLifecycleManagement = true, enablePerformanceMonitoring = true } = config;
        const eventBus = new (await Promise.resolve().then(() => require('node:events'))).EventEmitter();
        const server = new MCPServer(mcpConfig, eventBus, logger);
        let lifecycleManager;
        let performanceMonitor;
        if (enableLifecycleManagement) {
            lifecycleManager = new MCPLifecycleManager(mcpConfig, logger, () => server);
        }
        if (enablePerformanceMonitoring) {
            performanceMonitor = new MCPPerformanceMonitor(logger);
        }
        return {
            server,
            lifecycleManager,
            performanceMonitor,
        };
    }
    /**
     * Create a development/testing MCP setup
     */
    static async createDevelopmentSetup(logger) {
        const mcpConfig = {
            transport: 'stdio',
            enableMetrics: true,
            auth: {
                enabled: false,
                method: 'token',
            },
        };
        const { server, lifecycleManager, performanceMonitor } = await this.createStandaloneServer({
            mcpConfig,
            logger,
            enableLifecycleManagement: true,
            enablePerformanceMonitoring: true,
        });
        const protocolManager = new MCPProtocolManager(logger);
        return {
            server,
            lifecycleManager: lifecycleManager,
            performanceMonitor: performanceMonitor,
            protocolManager,
        };
    }
}
exports.MCPIntegrationFactory = MCPIntegrationFactory;
/**
 * Default MCP configuration for common use cases
 */
exports.DefaultMCPConfigs = {
    /**
     * Development configuration with stdio transport
     */
    development: {
        transport: 'stdio',
        enableMetrics: true,
        auth: {
            enabled: false,
            method: 'token',
        },
    },
    /**
     * Production configuration with HTTP transport and authentication
     */
    production: {
        transport: 'http',
        host: '0.0.0.0',
        port: 3000,
        tlsEnabled: true,
        enableMetrics: true,
        auth: {
            enabled: true,
            method: 'token',
        },
        loadBalancer: {
            enabled: true,
            maxRequestsPerSecond: 100,
            maxConcurrentRequests: 50,
        },
        sessionTimeout: 3600000, // 1 hour
        maxSessions: 1000,
    },
    /**
     * Testing configuration with minimal features
     */
    testing: {
        transport: 'stdio',
        enableMetrics: false,
        auth: {
            enabled: false,
            method: 'token',
        },
    },
};
/**
 * MCP Utility Functions
 */
exports.MCPUtils = {
    /**
     * Validate MCP protocol version
     */
    isValidProtocolVersion(version) {
        return (typeof version.major === 'number' &&
            typeof version.minor === 'number' &&
            typeof version.patch === 'number' &&
            version.major > 0);
    },
    /**
     * Compare two protocol versions
     */
    compareVersions(a, b) {
        if (a.major !== b.major)
            return a.major - b.major;
        if (a.minor !== b.minor)
            return a.minor - b.minor;
        return a.patch - b.patch;
    },
    /**
     * Format protocol version as string
     */
    formatVersion(version) {
        return `${version.major}.${version.minor}.${version.patch}`;
    },
    /**
     * Parse protocol version from string
     */
    parseVersion(versionString) {
        const parts = versionString.split('.').map(p => parseInt(p, 10));
        if (parts.length !== 3 || parts.some(p => isNaN(p))) {
            throw new Error(`Invalid version string: ${versionString}`);
        }
        return {
            major: parts[0],
            minor: parts[1],
            patch: parts[2],
        };
    },
    /**
     * Generate a random session ID
     */
    generateSessionId() {
        return `mcp_session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    },
    /**
     * Generate a random request ID
     */
    generateRequestId() {
        return `mcp_req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    },
};
