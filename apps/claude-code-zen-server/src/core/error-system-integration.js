/**
 * Error System Integration.
 *
 * Central integration point for all error handling, recovery, monitoring,
 * and resilience systems in Claude-Zen.
 */
/**
 * @file Error-system-integration implementation.
 */
import { getLogger } from '../config/logging-config';
import { mcpErrorHandler } from '../coordination/swarm/mcp/error-handler';
import { errorMonitor } from './error-monitoring';
import { errorRecoveryOrchestrator } from './error-recovery';
import { BaseClaudeZenError, FACTError, NetworkError, RAGError, SwarmError, SystemError, WASMError, } from './errors';
import { systemResilienceOrchestrator } from './system-resilience';
const logger = getLogger('ErrorSystemIntegration');
export class IntegratedErrorHandler {
    config;
    initialized = false;
    emergencyMode = false;
    constructor(config = {}) {
        this.config = {
            maxRetries: 3,
            retryDelayMs: 1000,
            exponentialBackoff: true,
            circuitBreakerThreshold: 5,
            monitoringEnabled: true,
            monitoringIntervalMs: 60000, // 1 minute
            alertsEnabled: true,
            bulkheadsEnabled: true,
            errorBoundariesEnabled: true,
            resourceLimitsEnabled: true,
            emergencyShutdownEnabled: true,
            emergencyThresholds: {
                criticalErrorRate: 50, // 50 errors per minute
                memoryUsagePercent: 90, // 90% memory usage
                systemHealthScore: 20, // Below 20% health
            },
            ...config,
        };
    }
    async initialize() {
        if (this.initialized) {
            logger.warn('Error handling system already initialized');
            return;
        }
        logger.info('Initializing integrated error handling system');
        try {
            // Initialize monitoring system
            if (this.config.monitoringEnabled) {
                this.setupMonitoring();
                errorMonitor.startMonitoring(this.config.monitoringIntervalMs);
            }
            // Setup alerts
            if (this.config.alertsEnabled) {
                this.setupAlerts();
            }
            // Setup emergency procedures
            if (this.config.emergencyShutdownEnabled) {
                this.setupEmergencyProcedures();
            }
            // Setup error handling fallbacks for different systems
            this.setupSystemFallbacks();
            this.initialized = true;
            logger.info('Integrated error handling system initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize error handling system:', error);
            throw new SystemError(`Error system initialization failed: ${error instanceof Error ? error.message : String(error)}`, 'ERROR_SYSTEM_INIT_FAILED', 'critical');
        }
    }
    setupMonitoring() {
        // Add custom alert handlers
        errorMonitor.addAlertHandler(async (alert, message) => {
            logger.warn(`Alert triggered: ${alert.name}`, {
                severity: alert.severity,
                message,
            });
            // Check emergency thresholds
            if (alert.severity === 'critical') {
                await this.checkEmergencyThresholds();
            }
        });
        logger.info('Error monitoring configured');
    }
    setupAlerts() {
        // System-specific alerts for integrated error handling
        // FACT System Alert
        errorMonitor.addAlertHandler(async (_alert, message) => {
            if (message.includes('FACT') || message.includes('fact_')) {
                logger.error(`FACT System Alert: ${message}`);
                // Could implement FACT-specific recovery actions
                const factBoundary = systemResilienceOrchestrator.getErrorBoundary('fact');
                if (factBoundary) {
                    await factBoundary.attemptRecovery();
                }
            }
        });
        // Swarm Coordination Alert
        errorMonitor.addAlertHandler(async (_alert, message) => {
            if (message.includes('Swarm') ||
                message.includes('swarm_') ||
                message.includes('agent_')) {
                logger.error(`Swarm System Alert: ${message}`);
                // Could implement swarm-specific recovery actions
                const swarmBoundary = systemResilienceOrchestrator.getErrorBoundary('swarm');
                if (swarmBoundary) {
                    await swarmBoundary.attemptRecovery();
                }
            }
        });
        logger.info('Integrated alert system configured');
    }
    setupEmergencyProcedures() {
        // Add integrated emergency shutdown procedures
        const emergencySystem = systemResilienceOrchestrator.emergencyShutdown;
        // MCP tool shutdown
        emergencySystem.addProcedure({
            name: 'mcp_tool_shutdown',
            priority: 5,
            timeoutMs: 5000,
            procedure: async () => {
                // Stop all MCP tool executions
                logger.info('Emergency: Stopping MCP tool executions');
                // In production, this would stop active MCP operations
            },
        });
        // FACT system shutdown
        emergencySystem.addProcedure({
            name: 'fact_system_shutdown',
            priority: 6,
            timeoutMs: 8000,
            procedure: async () => {
                logger.info('Emergency: Shutting down FACT system');
                // In production, this would stop FACT operations and save state
            },
        });
        // Swarm coordination shutdown
        emergencySystem.addProcedure({
            name: 'swarm_shutdown',
            priority: 7,
            timeoutMs: 10000,
            procedure: async () => {
                logger.info('Emergency: Shutting down swarm coordination');
                // In production, this would gracefully shutdown all agents
            },
        });
        logger.info('Emergency procedures configured');
    }
    setupSystemFallbacks() {
        // FACT system fallbacks
        errorRecoveryOrchestrator.addFallbackStrategy('fact_gather', {
            name: 'cached_results',
            handler: async () => {
                logger.info('FACT fallback: Using cached results');
                return {
                    success: true,
                    content: [
                        {
                            type: 'text',
                            text: '⚠️ Using cached knowledge due to system issues. Results may not be current.',
                        },
                    ],
                };
            },
            condition: (error) => error instanceof FACTError || error instanceof NetworkError,
            priority: 1,
        });
        // RAG system fallbacks
        errorRecoveryOrchestrator.addFallbackStrategy('rag_search', {
            name: 'basic_text_search',
            handler: async () => {
                logger.info('RAG fallback: Using basic text search');
                return {
                    success: true,
                    content: [
                        {
                            type: 'text',
                            text: '⚠️ Vector search unavailable. Using basic text search with reduced accuracy.',
                        },
                    ],
                };
            },
            condition: (error) => error instanceof RAGError,
            priority: 1,
        });
        // Swarm coordination fallbacks
        errorRecoveryOrchestrator.addFallbackStrategy('swarm_coordination', {
            name: 'single_agent_mode',
            handler: async () => {
                logger.info('Swarm fallback: Single agent mode');
                return {
                    success: true,
                    content: [
                        {
                            type: 'text',
                            text: '⚠️ Swarm coordination unavailable. Operating in single agent mode.',
                        },
                    ],
                };
            },
            condition: (error) => error instanceof SwarmError,
            priority: 1,
        });
        // WASM computation fallbacks
        errorRecoveryOrchestrator.addFallbackStrategy('wasm_computation', {
            name: 'javascript_fallback',
            handler: async () => {
                logger.info('WASM fallback: JavaScript computation');
                return {
                    success: true,
                    content: [
                        {
                            type: 'text',
                            text: '⚠️ WASM computation unavailable. Using JavaScript fallback (slower performance).',
                        },
                    ],
                };
            },
            condition: (error) => error instanceof WASMError,
            priority: 1,
        });
        logger.info('System fallbacks configured');
    }
    async checkEmergencyThresholds() {
        if (this.emergencyMode || !this.config.emergencyShutdownEnabled) {
            return;
        }
        try {
            const systemHealth = errorMonitor.getSystemMetrics();
            const resilienceStatus = systemResilienceOrchestrator.getSystemStatus();
            let shouldShutdown = false;
            let shutdownReason = '';
            // Check critical error rate
            if (systemHealth.errorRate >
                this.config.emergencyThresholds.criticalErrorRate) {
                shouldShutdown = true;
                shutdownReason = `Critical error rate: ${systemHealth.errorRate}/min > ${this.config.emergencyThresholds.criticalErrorRate}/min`;
            }
            // Check memory usage
            const memoryUsagePercent = (resilienceStatus.resources.memoryUsageMB / 512) * 100; // Assuming 512MB limit
            if (memoryUsagePercent > this.config.emergencyThresholds.memoryUsagePercent) {
                shouldShutdown = true;
                shutdownReason = `Memory usage critical: ${memoryUsagePercent.toFixed(1)}% > ${this.config.emergencyThresholds.memoryUsagePercent}%`;
            }
            // Check system health score
            if (systemHealth.userSatisfactionScore <
                this.config.emergencyThresholds.systemHealthScore) {
                shouldShutdown = true;
                shutdownReason = `System health critical: ${systemHealth.userSatisfactionScore} < ${this.config.emergencyThresholds.systemHealthScore}`;
            }
            if (shouldShutdown) {
                this.emergencyMode = true;
                logger.error(`Emergency shutdown triggered: ${shutdownReason}`);
                await systemResilienceOrchestrator.initiateEmergencyShutdown(shutdownReason);
            }
        }
        catch (error) {
            logger.error('Failed to check emergency thresholds:', error);
        }
    }
    async handleError(error, context = {}, options = {}) {
        if (!this.initialized) {
            logger.warn('Error handling system not initialized, using basic handling');
            throw error;
        }
        const defaults = {
            useRecovery: true,
            useFallback: true,
            reportToMonitoring: true,
        };
        const finalOptions = { ...defaults, ...options };
        // Convert to Claude-Zen error if needed
        let claudeZenError;
        if (error instanceof BaseClaudeZenError) {
            claudeZenError = error;
        }
        else {
            claudeZenError = this.classifyError(error, context);
        }
        // Report to monitoring
        if (finalOptions?.reportToMonitoring) {
            errorMonitor.reportError(claudeZenError, context);
        }
        // Check if we're in emergency mode
        if (this.emergencyMode) {
            logger.warn('System in emergency mode - limited error recovery');
            return {
                recovered: false,
                finalError: new SystemError('System in emergency mode - functionality limited', 'EMERGENCY_MODE_ACTIVE', 'critical'),
            };
        }
        // Attempt recovery if enabled
        if (finalOptions?.useRecovery && claudeZenError.recoverable) {
            try {
                const operationName = context.operation || 'unknown_operation';
                const result = await errorRecoveryOrchestrator.executeWithRecovery(operationName, async () => {
                    // Re-throw the error to trigger recovery mechanisms
                    throw claudeZenError;
                }, {
                    maxRetries: this.config.maxRetries,
                    retryDelayMs: this.config.retryDelayMs,
                    exponentialBackoff: this.config.exponentialBackoff,
                    circuitBreakerThreshold: this.config.circuitBreakerThreshold,
                    fallbackEnabled: finalOptions?.useFallback,
                    gracefulDegradation: true,
                });
                return {
                    recovered: true,
                    result,
                };
            }
            catch (recoveryError) {
                logger.error('Error recovery failed:', recoveryError);
                return {
                    recovered: false,
                    finalError: recoveryError,
                };
            }
        }
        // No recovery attempted or available
        return {
            recovered: false,
            finalError: claudeZenError,
        };
    }
    classifyError(error, context) {
        // Use MCP error classifier if this is from an MCP operation
        if (context.component === 'MCP' || context.operation?.includes('mcp')) {
            return mcpErrorHandler.classifyError(error, {
                toolName: context.operation || 'unknown',
                startTime: context.timestamp || Date.now(),
                parameters: context.metadata || {},
                attempt: 1,
                correlationId: context.correlationId || 'unknown',
                operationId: `${context.operation}_${Date.now()}`,
                sessionId: context.sessionId || 'unknown',
                userId: context.userId || 'unknown',
            });
        }
        // Classify based on error characteristics
        if (error.message.includes('timeout')) {
            return new SystemError(error.message, 'TIMEOUT', 'high', context);
        }
        if (error.message.includes('network') ||
            error.message.includes('ECONNREFUSED')) {
            return new NetworkError(error.message, undefined, context.operation, 'medium');
        }
        if (context.component === 'FACT' ||
            context.operation?.startsWith('fact_')) {
            return new FACTError(error.message, 'medium', context);
        }
        if (context.component === 'RAG' || context.operation?.includes('rag_')) {
            return new RAGError(error.message, 'medium', context);
        }
        if (context.component === 'Swarm' ||
            context.operation?.includes('swarm_')) {
            return new SwarmError(error.message, undefined, 'medium', context);
        }
        if (context.component === 'WASM' || error.message.includes('wasm')) {
            return new WASMError(error.message, 'high', context);
        }
        // Default system error
        return new SystemError(error.message, 'UNCLASSIFIED_ERROR', 'medium', context);
    }
    async executeWithErrorHandling(operation, context, options = {}) {
        if (!this.initialized) {
            return await operation();
        }
        try {
            // Execute with resilience patterns if specified
            if (options?.resilience) {
                const resilienceOptions = {};
                if (options?.resilience?.bulkhead)
                    resilienceOptions.bulkhead = options?.resilience?.bulkhead;
                if (options?.resilience?.errorBoundary)
                    resilienceOptions.errorBoundary = options?.resilience?.errorBoundary;
                if (options?.resilience?.timeoutMs)
                    resilienceOptions.timeoutMs = options?.resilience?.timeoutMs;
                if (context.operation)
                    resilienceOptions.operationName = context.operation;
                return await systemResilienceOrchestrator.executeWithResilience(operation, resilienceOptions);
            }
            return await operation();
        }
        catch (error) {
            const handleResult = await this.handleError(error, context, {
                useRecovery: true,
                useFallback: options?.recovery?.fallbackEnabled !== false,
                reportToMonitoring: true,
            });
            if (handleResult?.recovered && handleResult?.result !== undefined) {
                return handleResult?.result;
            }
            throw handleResult?.finalError || error;
        }
    }
    getSystemStatus() {
        if (!this.initialized) {
            return {
                initialized: false,
                emergencyMode: false,
                errorHandling: null,
                monitoring: null,
                resilience: null,
                recovery: null,
            };
        }
        return {
            initialized: true,
            emergencyMode: this.emergencyMode,
            errorHandling: {
                config: this.config,
            },
            monitoring: errorMonitor.getSystemMetrics(),
            resilience: systemResilienceOrchestrator.getSystemStatus(),
            recovery: errorRecoveryOrchestrator.getSystemHealth(),
        };
    }
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        logger.info('Shutting down integrated error handling system');
        try {
            // Stop monitoring
            errorMonitor.stopMonitoring();
            // Reset recovery systems
            errorRecoveryOrchestrator.resetSystem();
            // If emergency shutdown is needed
            if (this.emergencyMode) {
                await systemResilienceOrchestrator.initiateEmergencyShutdown('System shutdown requested');
            }
            this.initialized = false;
            this.emergencyMode = false;
            logger.info('Integrated error handling system shutdown complete');
        }
        catch (error) {
            logger.error('Error during system shutdown:', error);
            throw error;
        }
    }
}
// ===============================
// Convenience Functions
// ===============================
// Global instance
let globalErrorHandler = null;
export function initializeErrorHandling(config) {
    if (globalErrorHandler) {
        logger.warn('Global error handler already initialized');
        return Promise.resolve();
    }
    globalErrorHandler = new IntegratedErrorHandler(config);
    return globalErrorHandler.initialize();
}
export function getErrorHandler() {
    if (!globalErrorHandler) {
        throw new SystemError('Error handling system not initialized. Call initializeErrorHandling() first.', 'ERROR_HANDLER_NOT_INITIALIZED', 'critical');
    }
    return globalErrorHandler;
}
export async function handleErrorGlobally(error, context) {
    return getErrorHandler().handleError(error, context);
}
export async function executeWithErrorHandling(operation, context, options) {
    return getErrorHandler().executeWithErrorHandling(operation, context, options);
}
export function getSystemStatus() {
    if (!globalErrorHandler) {
        return { initialized: false };
    }
    return globalErrorHandler.getSystemStatus();
}
export async function shutdownErrorHandling() {
    if (globalErrorHandler) {
        await globalErrorHandler.shutdown();
        globalErrorHandler = null;
    }
}
// ===============================
// Export Everything
// ===============================
// IntegratedErrorHandler already exported above
export * from './error-monitoring';
export * from './error-recovery';
// Re-export all error types and utilities
export * from './errors';
export * from './system-resilience';
//# sourceMappingURL=error-system-integration.js.map