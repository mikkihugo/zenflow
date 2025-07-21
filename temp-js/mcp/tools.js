import { MCPError } from '../utils/errors.js';
import { EventEmitter } from 'node:events';
/**
 * Enhanced Tool registry implementation with capability negotiation
 */
export class ToolRegistry extends EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.tools = new Map();
        this.capabilities = new Map();
        this.metrics = new Map();
        this.categories = new Set();
        this.tags = new Set();
    }
    /**
     * Registers a new tool with enhanced capability information
     */
    register(tool, capability) {
        if (this.tools.has(tool.name)) {
            throw new MCPError(`Tool already registered: ${tool.name}`);
        }
        // Validate tool schema
        this.validateTool(tool);
        // Register tool
        this.tools.set(tool.name, tool);
        // Register capability if provided
        if (capability) {
            this.registerCapability(tool.name, capability);
        }
        else {
            // Create default capability
            const defaultCapability = {
                name: tool.name,
                version: '1.0.0',
                description: tool.description,
                category: this.extractCategory(tool.name),
                tags: this.extractTags(tool),
                supportedProtocolVersions: [{ major: 2024, minor: 11, patch: 5 }],
            };
            this.registerCapability(tool.name, defaultCapability);
        }
        // Initialize metrics
        this.metrics.set(tool.name, {
            name: tool.name,
            totalInvocations: 0,
            successfulInvocations: 0,
            failedInvocations: 0,
            averageExecutionTime: 0,
            totalExecutionTime: 0,
        });
        this.logger.debug('Tool registered', { name: tool.name });
        this.emit('toolRegistered', { name: tool.name, capability });
    }
    /**
     * Unregisters a tool
     */
    unregister(name) {
        if (!this.tools.has(name)) {
            throw new MCPError(`Tool not found: ${name}`);
        }
        this.tools.delete(name);
        this.logger.debug('Tool unregistered', { name });
    }
    /**
     * Gets a tool by name
     */
    getTool(name) {
        return this.tools.get(name);
    }
    /**
     * Lists all registered tools
     */
    listTools() {
        return Array.from(this.tools.values()).map(tool => ({
            name: tool.name,
            description: tool.description,
        }));
    }
    /**
     * Gets the number of registered tools
     */
    getToolCount() {
        return this.tools.size;
    }
    /**
     * Executes a tool with metrics tracking
     */
    async executeTool(name, input, context) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new MCPError(`Tool not found: ${name}`);
        }
        const startTime = Date.now();
        const metrics = this.metrics.get(name);
        this.logger.debug('Executing tool', { name, input });
        try {
            // Validate input against schema
            this.validateInput(tool, input);
            // Check tool capabilities and permissions
            await this.checkToolCapabilities(name, context);
            // Execute tool handler
            const result = await tool.handler(input, context);
            // Update success metrics
            if (metrics) {
                const executionTime = Date.now() - startTime;
                metrics.totalInvocations++;
                metrics.successfulInvocations++;
                metrics.totalExecutionTime += executionTime;
                metrics.averageExecutionTime = metrics.totalExecutionTime / metrics.totalInvocations;
                metrics.lastInvoked = new Date();
            }
            this.logger.debug('Tool executed successfully', { name, executionTime: Date.now() - startTime });
            this.emit('toolExecuted', { name, success: true, executionTime: Date.now() - startTime });
            return result;
        }
        catch (error) {
            // Update failure metrics
            if (metrics) {
                const executionTime = Date.now() - startTime;
                metrics.totalInvocations++;
                metrics.failedInvocations++;
                metrics.totalExecutionTime += executionTime;
                metrics.averageExecutionTime = metrics.totalExecutionTime / metrics.totalInvocations;
                metrics.lastInvoked = new Date();
            }
            this.logger.error('Tool execution failed', { name, error, executionTime: Date.now() - startTime });
            this.emit('toolExecuted', { name, success: false, error, executionTime: Date.now() - startTime });
            throw error;
        }
    }
    /**
     * Validates tool definition
     */
    validateTool(tool) {
        if (!tool.name || typeof tool.name !== 'string') {
            throw new MCPError('Tool name must be a non-empty string');
        }
        if (!tool.description || typeof tool.description !== 'string') {
            throw new MCPError('Tool description must be a non-empty string');
        }
        if (typeof tool.handler !== 'function') {
            throw new MCPError('Tool handler must be a function');
        }
        if (!tool.inputSchema || typeof tool.inputSchema !== 'object') {
            throw new MCPError('Tool inputSchema must be an object');
        }
        // Validate tool name format (namespace/name)
        if (!tool.name.includes('/')) {
            throw new MCPError('Tool name must be in format: namespace/name');
        }
    }
    /**
     * Validates input against tool schema
     */
    validateInput(tool, input) {
        // Simple validation - in production, use a JSON Schema validator
        const schema = tool.inputSchema;
        if (schema.type === 'object' && schema.properties) {
            if (typeof input !== 'object' || input === null) {
                throw new MCPError('Input must be an object');
            }
            const inputObj = input;
            // Check required properties
            if (schema.required && Array.isArray(schema.required)) {
                for (const prop of schema.required) {
                    if (!(prop in inputObj)) {
                        throw new MCPError(`Missing required property: ${prop}`);
                    }
                }
            }
            // Check property types
            for (const [prop, propSchema] of Object.entries(schema.properties)) {
                if (prop in inputObj) {
                    const value = inputObj[prop];
                    const expectedType = propSchema.type;
                    if (expectedType && !this.checkType(value, expectedType)) {
                        throw new MCPError(`Invalid type for property ${prop}: expected ${expectedType}`);
                    }
                }
            }
        }
    }
    /**
     * Checks if a value matches a JSON Schema type
     */
    checkType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number';
            case 'boolean':
                return typeof value === 'boolean';
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            case 'array':
                return Array.isArray(value);
            case 'null':
                return value === null;
            default:
                return true;
        }
    }
    /**
     * Register tool capability information
     */
    registerCapability(toolName, capability) {
        this.capabilities.set(toolName, capability);
        this.categories.add(capability.category);
        capability.tags.forEach(tag => this.tags.add(tag));
    }
    /**
     * Extract category from tool name
     */
    extractCategory(toolName) {
        const parts = toolName.split('/');
        return parts.length > 1 ? parts[0] : 'general';
    }
    /**
     * Extract tags from tool definition
     */
    extractTags(tool) {
        const tags = [];
        // Extract from description
        if (tool.description.toLowerCase().includes('file'))
            tags.push('filesystem');
        if (tool.description.toLowerCase().includes('search'))
            tags.push('search');
        if (tool.description.toLowerCase().includes('memory'))
            tags.push('memory');
        if (tool.description.toLowerCase().includes('swarm'))
            tags.push('swarm');
        if (tool.description.toLowerCase().includes('task'))
            tags.push('orchestration');
        return tags.length > 0 ? tags : ['general'];
    }
    /**
     * Check tool capabilities and permissions
     */
    async checkToolCapabilities(toolName, context) {
        const capability = this.capabilities.get(toolName);
        if (!capability) {
            return; // No capability checks needed
        }
        // Check if tool is deprecated
        if (capability.deprecated) {
            this.logger.warn('Using deprecated tool', {
                name: toolName,
                message: capability.deprecationMessage,
            });
        }
        // Check required permissions
        if (capability.requiredPermissions && context?.permissions) {
            const hasAllPermissions = capability.requiredPermissions.every(permission => context.permissions.includes(permission));
            if (!hasAllPermissions) {
                throw new MCPError(`Insufficient permissions for tool ${toolName}. Required: ${capability.requiredPermissions.join(', ')}`);
            }
        }
        // Check protocol version compatibility
        if (context?.protocolVersion) {
            const isCompatible = capability.supportedProtocolVersions.some(version => this.isProtocolVersionCompatible(context.protocolVersion, version));
            if (!isCompatible) {
                throw new MCPError(`Tool ${toolName} is not compatible with protocol version ${context.protocolVersion.major}.${context.protocolVersion.minor}.${context.protocolVersion.patch}`);
            }
        }
    }
    /**
     * Check protocol version compatibility
     */
    isProtocolVersionCompatible(client, supported) {
        if (client.major !== supported.major) {
            return false;
        }
        if (client.minor > supported.minor) {
            return false;
        }
        return true;
    }
    /**
     * Discover tools based on query criteria
     */
    discoverTools(query = {}) {
        const results = [];
        for (const [name, tool] of this.tools) {
            const capability = this.capabilities.get(name);
            if (!capability)
                continue;
            // Filter by category
            if (query.category && capability.category !== query.category) {
                continue;
            }
            // Filter by tags
            if (query.tags && !query.tags.some(tag => capability.tags.includes(tag))) {
                continue;
            }
            // Filter by capabilities
            if (query.capabilities && !query.capabilities.every(cap => capability.tags.includes(cap))) {
                continue;
            }
            // Filter by protocol version
            if (query.protocolVersion) {
                const isCompatible = capability.supportedProtocolVersions.some(version => this.isProtocolVersionCompatible(query.protocolVersion, version));
                if (!isCompatible)
                    continue;
            }
            // Filter deprecated tools
            if (!query.includeDeprecated && capability.deprecated) {
                continue;
            }
            // Filter by permissions
            if (query.permissions && capability.requiredPermissions) {
                const hasAllPermissions = capability.requiredPermissions.every(permission => query.permissions.includes(permission));
                if (!hasAllPermissions)
                    continue;
            }
            results.push({ tool, capability });
        }
        return results;
    }
    /**
     * Get tool capability information
     */
    getToolCapability(name) {
        return this.capabilities.get(name);
    }
    /**
     * Get tool metrics
     */
    getToolMetrics(name) {
        if (name) {
            const metrics = this.metrics.get(name);
            if (!metrics) {
                throw new MCPError(`Metrics not found for tool: ${name}`);
            }
            return metrics;
        }
        return Array.from(this.metrics.values());
    }
    /**
     * Get all available categories
     */
    getCategories() {
        return Array.from(this.categories);
    }
    /**
     * Get all available tags
     */
    getTags() {
        return Array.from(this.tags);
    }
    /**
     * Reset metrics for a tool or all tools
     */
    resetMetrics(toolName) {
        if (toolName) {
            const metrics = this.metrics.get(toolName);
            if (metrics) {
                Object.assign(metrics, {
                    totalInvocations: 0,
                    successfulInvocations: 0,
                    failedInvocations: 0,
                    averageExecutionTime: 0,
                    totalExecutionTime: 0,
                    lastInvoked: undefined,
                });
            }
        }
        else {
            for (const metrics of this.metrics.values()) {
                Object.assign(metrics, {
                    totalInvocations: 0,
                    successfulInvocations: 0,
                    failedInvocations: 0,
                    averageExecutionTime: 0,
                    totalExecutionTime: 0,
                    lastInvoked: undefined,
                });
            }
        }
        this.emit('metricsReset', { toolName });
    }
    /**
     * Get comprehensive registry statistics
     */
    getRegistryStats() {
        const stats = {
            totalTools: this.tools.size,
            toolsByCategory: {},
            toolsByTag: {},
            totalInvocations: 0,
            successRate: 0,
            averageExecutionTime: 0,
        };
        // Count by category
        for (const capability of this.capabilities.values()) {
            stats.toolsByCategory[capability.category] = (stats.toolsByCategory[capability.category] || 0) + 1;
            for (const tag of capability.tags) {
                stats.toolsByTag[tag] = (stats.toolsByTag[tag] || 0) + 1;
            }
        }
        // Calculate execution stats
        let totalExecutionTime = 0;
        let totalSuccessful = 0;
        for (const metrics of this.metrics.values()) {
            stats.totalInvocations += metrics.totalInvocations;
            totalSuccessful += metrics.successfulInvocations;
            totalExecutionTime += metrics.totalExecutionTime;
        }
        if (stats.totalInvocations > 0) {
            stats.successRate = (totalSuccessful / stats.totalInvocations) * 100;
            stats.averageExecutionTime = totalExecutionTime / stats.totalInvocations;
        }
        return stats;
    }
}
