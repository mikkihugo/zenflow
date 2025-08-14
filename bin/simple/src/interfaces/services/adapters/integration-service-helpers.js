import { getLogger } from '../../../config/logging-config.ts';
export class IntegrationServiceHelper {
    adapter;
    logger;
    constructor(adapter) {
        this.adapter = adapter;
        this.logger = getLogger(`IntegrationServiceHelper:${adapter.name}`);
    }
    async saveArchitectureEnhanced(architecture, config = {}) {
        try {
            if (config?.customValidation) {
                const isValid = await config?.customValidation(architecture);
                if (!isValid) {
                    return {
                        success: false,
                        error: {
                            code: 'VALIDATION_FAILED',
                            message: 'Custom validation failed for architecture',
                        },
                    };
                }
            }
            if (config?.tags) {
                architecture.metadata = {
                    ...architecture.metadata,
                    tags: config?.tags,
                };
            }
            const result = await this.adapter.execute('architecture-save', {
                architecture,
                projectId: config?.projectId,
            });
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'SAVE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: error,
                },
            };
        }
    }
    async batchSaveArchitectures(architectures, batchConfig = {}) {
        const { maxConcurrency = 5, failFast = false, operationTimeout = 30000, } = batchConfig;
        const results = [];
        const errors = [];
        try {
            for (let i = 0; i < architectures.length; i += maxConcurrency) {
                const batch = architectures.slice(i, i + maxConcurrency);
                const batchPromises = batch.map(async ({ architecture, config = {} }) => {
                    try {
                        const result = await Promise.race([
                            this.saveArchitectureEnhanced(architecture, config),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timeout')), operationTimeout)),
                        ]);
                        if (result?.success) {
                            return result?.data || null;
                        }
                        errors.push(result?.error);
                        if (failFast)
                            throw new Error(result?.error?.message || 'Batch operation failed');
                        return null;
                    }
                    catch (error) {
                        errors.push(error);
                        if (failFast)
                            throw error;
                        return null;
                    }
                });
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
            }
            const successfulResults = results.filter((r) => r !== null);
            return {
                success: errors.length === 0 || !failFast,
                data: successfulResults,
                error: errors.length > 0
                    ? {
                        code: 'BATCH_PARTIAL_FAILURE',
                        message: `${errors.length} operations failed out of ${architectures.length}`,
                        details: errors,
                    }
                    : undefined,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'BATCH_ERROR',
                    message: error instanceof Error ? error.message : 'Batch operation failed',
                    details: { processedCount: results.length, errors },
                },
            };
        }
    }
    async searchArchitecturesEnhanced(criteria) {
        try {
            const result = await this.adapter.execute('architecture-search', {
                criteria,
            });
            if (result?.success && result?.data && criteria.dateRange) {
                const { start, end } = criteria.dateRange;
                result.data = result?.data?.filter((arch) => {
                    const createdAt = new Date(arch.createdAt || Date.now());
                    return createdAt >= start && createdAt <= end;
                });
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'SEARCH_ERROR',
                    message: error instanceof Error ? error.message : 'Search operation failed',
                },
            };
        }
    }
    async apiRequestEnhanced(method, endpoint, data, config = {}) {
        try {
            const operation = `api-${method.toLowerCase()}`;
            const params = {
                endpoint,
                data,
                options: {
                    timeout: config?.timeout,
                    retries: config?.retries,
                    headers: config?.headers,
                },
            };
            const result = await this.adapter.execute(operation, params);
            if (result?.success && result?.data) {
                const apiResult = result?.data;
                if (apiResult?.success) {
                    return {
                        success: true,
                        data: apiResult?.data,
                        metadata: result?.metadata,
                    };
                }
                return {
                    success: false,
                    error: {
                        code: apiResult?.error?.code || 'API_ERROR',
                        message: apiResult?.error?.message || 'API request failed',
                        details: apiResult?.error?.details,
                    },
                    metadata: result?.metadata,
                };
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'REQUEST_ERROR',
                    message: error instanceof Error ? error.message : 'API request failed',
                },
            };
        }
    }
    async batchAPIRequests(requests, batchConfig = {}) {
        const { maxConcurrency = 10, failFast = false, operationTimeout = 30000, } = batchConfig;
        const results = [];
        const errors = [];
        try {
            for (let i = 0; i < requests.length; i += maxConcurrency) {
                const batch = requests.slice(i, i + maxConcurrency);
                const batchPromises = batch.map(async (request) => {
                    try {
                        const result = await Promise.race([
                            this.apiRequestEnhanced(request.method, request.endpoint, request.data, request.config),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), operationTimeout)),
                        ]);
                        if (result?.success) {
                            return result?.data || null;
                        }
                        errors.push(result?.error);
                        if (failFast)
                            throw new Error(result?.error?.message || 'Batch request failed');
                        return null;
                    }
                    catch (error) {
                        errors.push(error);
                        if (failFast)
                            throw error;
                        return null;
                    }
                });
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
            }
            const successfulResults = results.filter((r) => r !== null);
            return {
                success: errors.length === 0 || !failFast,
                data: successfulResults,
                error: errors.length > 0
                    ? {
                        code: 'BATCH_API_PARTIAL_FAILURE',
                        message: `${errors.length} requests failed out of ${requests.length}`,
                        details: errors,
                    }
                    : undefined,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'BATCH_API_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Batch API operation failed',
                    details: { processedCount: results.length, errors },
                },
            };
        }
    }
    async manageResource(operation, endpoint, data, _config = {}) {
        try {
            let operationName;
            let params;
            switch (operation) {
                case 'create':
                    operationName = 'api-create-resource';
                    params = { endpoint, data: data?.resourceData };
                    break;
                case 'read':
                    operationName = 'api-get-resource';
                    params = { endpoint, id: data?.id };
                    break;
                case 'update':
                    operationName = 'api-update-resource';
                    params = { endpoint, id: data?.id, data: data?.resourceData };
                    break;
                case 'delete':
                    operationName = 'api-delete-resource';
                    params = { endpoint, id: data?.id };
                    break;
                case 'list':
                    operationName = 'api-list-resources';
                    params = { endpoint, queryParams: data?.queryParams };
                    break;
                default:
                    throw new Error(`Unknown resource operation: ${operation}`);
            }
            return await this.adapter.execute(operationName, params);
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'RESOURCE_MANAGEMENT_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Resource operation failed',
                },
            };
        }
    }
    async protocolCommunicate(operation, config = {}) {
        try {
            let operationName;
            let params;
            switch (operation) {
                case 'connect':
                    operationName = 'protocol-connect';
                    params = {
                        protocol: config?.protocol,
                        config: {
                            timeout: config?.connectionTimeout,
                            usePooling: config?.useConnectionPooling,
                        },
                    };
                    break;
                case 'disconnect':
                    operationName = 'protocol-disconnect';
                    params = { protocol: config?.protocol };
                    break;
                case 'send':
                    operationName = 'protocol-send';
                    params = { protocol: config?.protocol, message: config?.message };
                    break;
                case 'receive':
                    operationName = 'protocol-receive';
                    params = { protocol: config?.protocol, timeout: config?.timeout };
                    break;
                case 'broadcast':
                    operationName = 'protocol-broadcast';
                    params = { message: config?.message, protocols: config?.protocols };
                    break;
                default:
                    throw new Error(`Unknown protocol operation: ${operation}`);
            }
            return await this.adapter.execute(operationName, params);
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'PROTOCOL_COMMUNICATION_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Protocol operation failed',
                },
            };
        }
    }
    async monitorProtocolHealth(protocols) {
        try {
            let targetProtocols;
            if (protocols) {
                targetProtocols = protocols;
            }
            else {
                const protocolListResult = await this.adapter.execute('protocol-list');
                if (!(protocolListResult?.success && protocolListResult?.data)) {
                    throw new Error('Failed to get protocol list');
                }
                targetProtocols = protocolListResult.data;
            }
            const healthResults = {};
            for (const protocol of targetProtocols) {
                try {
                    const startTime = Date.now();
                    const healthResult = await this.adapter.execute('protocol-health-check', {
                        protocol,
                    });
                    const latency = Date.now() - startTime;
                    healthResults[protocol] = {
                        status: healthResult?.success ? 'healthy' : 'unhealthy',
                        latency,
                        lastCheck: new Date(),
                        errorCount: healthResult?.success ? 0 : 1,
                    };
                }
                catch (_error) {
                    healthResults[protocol] = {
                        status: 'unhealthy',
                        latency: -1,
                        lastCheck: new Date(),
                        errorCount: 1,
                    };
                }
            }
            return {
                success: true,
                data: healthResults,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'PROTOCOL_HEALTH_MONITOR_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Protocol health monitoring failed',
                },
            };
        }
    }
    async getServiceStatistics() {
        try {
            const [serviceStats, cacheStats, protocolMetrics, endpointMetrics] = await Promise.all([
                this.adapter.execute('service-stats'),
                this.adapter.execute('cache-stats'),
                this.adapter.execute('protocol-metrics'),
                this.adapter.execute('endpoint-metrics'),
            ]);
            const statistics = {
                service: {
                    name: this.adapter.name,
                    type: this.adapter.type,
                    uptime: serviceStats.data?.uptime || 0,
                    operationCount: serviceStats.data?.operationCount || 0,
                    errorRate: serviceStats.data?.errorRate || 0,
                },
                cache: {
                    size: cacheStats.data?.size || 0,
                    hitRate: cacheStats.data?.hitRate || 0,
                    memoryUsage: cacheStats.data?.memoryUsage || 0,
                },
                protocols: protocolMetrics.success ? protocolMetrics.data : {},
                endpoints: endpointMetrics.success ? endpointMetrics.data : {},
            };
            return {
                success: true,
                data: statistics,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'STATISTICS_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to get service statistics',
                },
            };
        }
    }
    async validateConfiguration() {
        const issues = [];
        try {
            if (!this.adapter.isReady()) {
                issues.push({
                    severity: 'error',
                    component: 'service',
                    message: 'Service is not in ready state',
                    suggestion: 'Ensure service is properly initialized and started',
                });
            }
            const cacheStats = await this.adapter.execute('cache-stats');
            if (cacheStats.success && cacheStats.data) {
                const { size, maxSize } = cacheStats.data;
                if (size > maxSize * 0.9) {
                    issues.push({
                        severity: 'warning',
                        component: 'cache',
                        message: 'Cache utilization is high (>90%)',
                        suggestion: 'Consider increasing cache size or implementing better eviction policies',
                    });
                }
            }
            const protocolMetrics = await this.adapter.execute('protocol-metrics');
            if (protocolMetrics.success && protocolMetrics.data) {
                const protocols = protocolMetrics.data;
                protocols.forEach((protocol) => {
                    if (protocol.status !== 'healthy') {
                        issues.push({
                            severity: 'error',
                            component: 'protocol',
                            message: `Protocol ${protocol.protocol} is ${protocol.status}`,
                            suggestion: 'Check protocol configuration and network connectivity',
                        });
                    }
                });
            }
            return {
                success: true,
                data: {
                    valid: issues.filter((i) => i.severity === 'error').length === 0,
                    issues,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Configuration validation failed',
                },
            };
        }
    }
    async optimizePerformance() {
        const optimizations = [];
        try {
            const cacheStats = await this.adapter.execute('cache-stats');
            if (cacheStats.success &&
                cacheStats.data?.size > cacheStats.data?.maxSize * 0.8) {
                const clearResult = await this.adapter.execute('clear-cache');
                optimizations.push({
                    component: 'cache',
                    action: 'Cleared cache',
                    impact: 'Reduced memory usage and improved cache efficiency',
                    applied: clearResult?.success,
                });
            }
            const poolCleanup = await this.adapter.execute('connection-pool-cleanup');
            if (poolCleanup.success) {
                optimizations.push({
                    component: 'connection-pool',
                    action: 'Cleaned up idle connections',
                    impact: 'Reduced resource usage and improved connection efficiency',
                    applied: true,
                });
            }
            const successfulOptimizations = optimizations.filter((o) => o.applied).length;
            const overallImprovement = optimizations.length > 0
                ? (successfulOptimizations / optimizations.length) * 100
                : 0;
            return {
                success: true,
                data: {
                    optimizations,
                    overallImprovement,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'OPTIMIZATION_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Performance optimization failed',
                },
            };
        }
    }
}
export class IntegrationServiceUtils {
    static createHelper(adapter) {
        return new IntegrationServiceHelper(adapter);
    }
    static validateEndpoint(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    static generateOperationId() {
        return `op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    static calculateRetryDelay(attempt, baseDelay = 1000, maxDelay = 30000) {
        const delay = baseDelay * 2 ** (attempt - 1);
        return Math.min(delay + Math.random() * 1000, maxDelay);
    }
    static sanitizeArchitectureData(architecture) {
        const sanitized = JSON.parse(JSON.stringify(architecture));
        if (sanitized.metadata) {
            sanitized.metadata.internalNotes = undefined;
            sanitized.metadata.privateKeys = undefined;
        }
        if (!sanitized.id) {
            sanitized.id = `arch_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        }
        return sanitized;
    }
    static validateProtocolName(protocol) {
        const validProtocols = [
            'http',
            'https',
            'websocket',
            'mcp-http',
            'mcp-stdio',
            'tcp',
            'udp',
        ];
        return validProtocols.includes(protocol.toLowerCase());
    }
    static formatError(error) {
        if (error instanceof Error) {
            return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
        }
        return JSON.stringify(error, null, 2);
    }
    static calculateSuccessRate(results) {
        if (results.length === 0)
            return 0;
        const successCount = results.filter((r) => r.success).length;
        return (successCount / results.length) * 100;
    }
    static mergeConfigurations(base, override) {
        return {
            ...base,
            ...override,
            architectureStorage: {
                enabled: true,
                ...base.architectureStorage,
                ...override.architectureStorage,
            },
            safeAPI: {
                enabled: true,
                ...base.safeAPI,
                ...override.safeAPI,
            },
            protocolManagement: {
                enabled: true,
                supportedProtocols: ['http', 'https', 'websocket'],
                defaultProtocol: 'http',
                ...base.protocolManagement,
                ...override.protocolManagement,
            },
            performance: {
                ...base.performance,
                ...override.performance,
            },
            retry: {
                enabled: true,
                maxAttempts: 3,
                backoffMultiplier: 2,
                retryableOperations: ['GET', 'POST', 'PUT', 'DELETE'],
                ...base.retry,
                ...override.retry,
            },
            cache: {
                enabled: true,
                strategy: 'memory',
                defaultTTL: 300000,
                maxSize: 1000,
                keyPrefix: 'integration:',
                ...base.cache,
                ...override.cache,
            },
            security: {
                ...base.security,
                ...override.security,
            },
            multiProtocol: {
                ...base.multiProtocol,
                ...override.multiProtocol,
            },
        };
    }
    static extractMetrics(results) {
        const totalOperations = results.length;
        const successCount = results.filter((r) => r.success).length;
        const errorCount = totalOperations - successCount;
        const latencies = results
            .filter((r) => r.metadata?.duration)
            .map((r) => r.metadata.duration);
        const averageLatency = latencies.length > 0
            ? latencies.reduce((sum, lat) => (sum || 0) + (lat || 0), 0) /
                latencies.length
            : 0;
        const successRate = totalOperations > 0 ? (successCount / totalOperations) * 100 : 0;
        const errorRate = totalOperations > 0 ? (errorCount / totalOperations) * 100 : 0;
        return {
            totalOperations,
            successCount,
            errorCount,
            averageLatency,
            successRate,
            errorRate,
        };
    }
}
export default {
    IntegrationServiceHelper,
    IntegrationServiceUtils,
};
//# sourceMappingURL=integration-service-helpers.js.map