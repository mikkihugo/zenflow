import { getLogger } from '../../../config/logging-config.ts';
export class DataServiceHelper {
    adapter;
    logger;
    constructor(adapter) {
        this.adapter = adapter;
        this.logger = getLogger(`DataServiceHelper:${adapter.name}`);
    }
    async getSystemStatus(useCache = true) {
        const startTime = Date.now();
        try {
            const response = await this.adapter.execute('system-status', {}, { trackMetrics: true });
            return {
                success: response?.success,
                data: response?.data,
                error: response?.error?.message,
                metadata: {
                    operation: 'system-status',
                    timestamp: new Date(),
                    duration: Date.now() - startTime,
                    cached: useCache,
                    retryCount: 0,
                },
            };
        }
        catch (error) {
            return this.createErrorResult('system-status', startTime, error);
        }
    }
    async getSystemHealthSummary() {
        const startTime = Date.now();
        try {
            const [systemStatus, adapterStatus, serviceStats] = await Promise.all([
                this.adapter.execute('system-status'),
                this.adapter.getStatus(),
                this.adapter.execute('service-stats'),
            ]);
            const healthData = {
                overall: adapterStatus.health,
                components: [
                    {
                        name: 'web-data-service',
                        status: systemStatus.data?.system || 'unknown',
                        lastCheck: new Date(),
                    },
                    {
                        name: 'adapter',
                        status: adapterStatus.lifecycle,
                        lastCheck: adapterStatus.lastCheck,
                    },
                ],
                metrics: {
                    uptime: adapterStatus.uptime,
                    responseTime: serviceStats.data?.avgLatency || 0,
                    errorRate: adapterStatus.errorRate,
                },
            };
            return {
                success: true,
                data: healthData,
                metadata: {
                    operation: 'system-health-summary',
                    timestamp: new Date(),
                    duration: Date.now() - startTime,
                    cached: false,
                    retryCount: 0,
                },
            };
        }
        catch (error) {
            return this.createErrorResult('system-health-summary', startTime, error);
        }
    }
    async getSwarms(filters) {
        const startTime = Date.now();
        try {
            const response = await this.adapter.execute('swarms');
            if (!(response?.success && response?.data)) {
                return {
                    success: false,
                    error: response?.error?.message,
                    metadata: this.createMetadata('get-swarms', startTime),
                };
            }
            let swarms = response?.data;
            if (filters) {
                swarms = swarms.filter((swarm) => {
                    if (filters.status && swarm.status !== filters.status)
                        return false;
                    if (filters.minAgents && swarm.agents < filters.minAgents)
                        return false;
                    if (filters.maxAgents && swarm.agents > filters.maxAgents)
                        return false;
                    if (filters.createdAfter && swarm.createdAt) {
                        const createdDate = new Date(swarm.createdAt);
                        if (createdDate < filters.createdAfter)
                            return false;
                    }
                    return true;
                });
            }
            return {
                success: true,
                data: swarms,
                metadata: this.createMetadata('get-swarms', startTime),
            };
        }
        catch (error) {
            return this.createErrorResult('get-swarms', startTime, error);
        }
    }
    async createSwarm(config) {
        const startTime = Date.now();
        try {
            const validation = this.validateSwarmConfig(config);
            if (!validation.valid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`,
                    metadata: this.createMetadata('create-swarm', startTime),
                };
            }
            const response = await this.adapter.execute('create-swarm', config);
            return {
                success: response?.success,
                data: response?.data,
                error: response?.error?.message,
                metadata: this.createMetadata('create-swarm', startTime),
            };
        }
        catch (error) {
            return this.createErrorResult('create-swarm', startTime, error);
        }
    }
    async getSwarmAnalytics() {
        const startTime = Date.now();
        try {
            const [swarmsResponse, tasksResponse] = await Promise.all([
                this.adapter.execute('swarms'),
                this.adapter.execute('tasks'),
            ]);
            if (!(swarmsResponse?.success && tasksResponse?.success)) {
                return {
                    success: false,
                    error: 'Failed to fetch swarm or task data',
                    metadata: this.createMetadata('swarm-analytics', startTime),
                };
            }
            const swarms = swarmsResponse?.data || [];
            const tasks = tasksResponse?.data || [];
            const analytics = {
                totalSwarms: swarms.length,
                activeSwarms: swarms.filter((s) => s.status === 'active').length,
                averageAgents: swarms.length > 0
                    ? swarms.reduce((sum, s) => sum + s.agents, 0) / swarms.length
                    : 0,
                averageProgress: swarms.length > 0
                    ? swarms.reduce((sum, s) => sum + s.progress, 0) / swarms.length
                    : 0,
                statusDistribution: this.calculateDistribution(swarms, 'status'),
                performanceMetrics: {
                    totalTasks: tasks.length,
                    completionRate: tasks.length > 0
                        ? (tasks.filter((t) => t.status === 'completed').length /
                            tasks.length) *
                            100
                        : 0,
                    averageTaskTime: 1800000,
                },
            };
            return {
                success: true,
                data: analytics,
                metadata: this.createMetadata('swarm-analytics', startTime),
            };
        }
        catch (error) {
            return this.createErrorResult('swarm-analytics', startTime, error);
        }
    }
    async getTasks(options) {
        const startTime = Date.now();
        try {
            const response = await this.adapter.execute('tasks');
            if (!(response?.success && response?.data)) {
                return {
                    success: false,
                    error: response?.error?.message,
                    metadata: this.createMetadata('get-tasks', startTime),
                };
            }
            let tasks = response?.data;
            if (options?.filters) {
                tasks = this.applyFilters(tasks, options?.filters);
            }
            if (options?.query) {
                tasks = this.searchTasks(tasks, options?.query);
            }
            if (options?.sort) {
                tasks = this.sortData(tasks, options?.sort?.field, options?.sort?.direction);
            }
            if (options?.pagination) {
                const { limit, offset } = options?.pagination;
                tasks = tasks.slice(offset, offset + limit);
            }
            return {
                success: true,
                data: tasks,
                metadata: this.createMetadata('get-tasks', startTime),
            };
        }
        catch (error) {
            return this.createErrorResult('get-tasks', startTime, error);
        }
    }
    async createTask(config) {
        const startTime = Date.now();
        try {
            const validation = this.validateTaskConfig(config);
            if (!validation.valid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`,
                    metadata: this.createMetadata('create-task', startTime),
                };
            }
            const response = await this.adapter.execute('create-task', config);
            return {
                success: response?.success,
                data: response?.data,
                error: response?.error?.message,
                metadata: this.createMetadata('create-task', startTime),
            };
        }
        catch (error) {
            return this.createErrorResult('create-task', startTime, error);
        }
    }
    async searchDocuments(query, options) {
        const startTime = Date.now();
        try {
            const searchOptions = {
                searchType: options?.searchType || 'combined',
                query,
                documentTypes: options?.documentTypes || undefined,
                projectId: options?.projectId || undefined,
                limit: options?.limit || 20,
                includeContent: options?.includeContent !== false,
            };
            const response = await this.adapter.execute('document-search', {
                searchOptions,
            });
            return {
                success: response?.success,
                data: response?.data,
                error: response?.error?.message,
                metadata: this.createMetadata('search-documents', startTime),
            };
        }
        catch (error) {
            return this.createErrorResult('search-documents', startTime, error);
        }
    }
    async bulkDocumentOperations(operations) {
        const startTime = Date.now();
        try {
            const results = await Promise.allSettled(operations.map(async (op) => {
                try {
                    switch (op.action) {
                        case 'create':
                            return await this.adapter.execute('document-create', {
                                document: op.document,
                            });
                        case 'update':
                            return await this.adapter.execute('document-update', {
                                id: op.documentId,
                                updates: op.updates,
                            });
                        case 'delete':
                            return await this.adapter.execute('document-delete', {
                                id: op.documentId,
                            });
                        default:
                            throw new Error(`Unknown action: ${op.action}`);
                    }
                }
                catch (error) {
                    return { success: false, error: error.message };
                }
            }));
            const processedResults = results.map((result) => {
                if (result?.status === 'fulfilled') {
                    return result?.value;
                }
                return { success: false, error: result?.reason?.message };
            });
            const successful = processedResults?.filter((r) => r.success).length;
            const failed = processedResults.length - successful;
            return {
                success: true,
                data: {
                    successful,
                    failed,
                    results: processedResults,
                },
                metadata: this.createMetadata('bulk-document-operations', startTime),
            };
        }
        catch (error) {
            return this.createErrorResult('bulk-document-operations', startTime, error);
        }
    }
    async executeBatch(config) {
        const startTime = Date.now();
        const concurrency = config?.concurrency || 5;
        try {
            const results = [];
            const errors = [];
            for (let i = 0; i < config?.operations.length; i += concurrency) {
                const batch = config?.operations?.slice(i, i + concurrency);
                const batchPromises = batch.map(async (op, index) => {
                    try {
                        const response = await this.adapter.execute(op.operation, op.params, op.options);
                        return { index: i + index, result: response };
                    }
                    catch (error) {
                        const errorMsg = `Operation ${op.operation} failed: ${error.message}`;
                        errors.push(errorMsg);
                        if (config?.failFast) {
                            throw new Error(errorMsg);
                        }
                        return {
                            index: i + index,
                            result: { success: false, error: errorMsg },
                        };
                    }
                });
                const batchResults = await Promise.allSettled(batchPromises);
                for (const result of batchResults) {
                    if (result?.status === 'fulfilled') {
                        results[result?.value?.index] = result?.value?.result;
                    }
                    else if (config?.failFast) {
                        throw new Error(result?.reason);
                    }
                }
            }
            return {
                success: errors.length === 0,
                data: results,
                error: errors.length > 0 ? errors.join('; ') : undefined,
                metadata: this.createMetadata('batch-operations', startTime),
            };
        }
        catch (error) {
            return this.createErrorResult('batch-operations', startTime, error);
        }
    }
    transformData(data, pipeline) {
        let result = data;
        for (const step of pipeline) {
            switch (step.type) {
                case 'filter':
                    if (typeof step.config['predicate'] === 'function') {
                        result = result?.filter(step.config['predicate']);
                    }
                    break;
                case 'map':
                    if (typeof step.config['mapper'] === 'function') {
                        result = result?.map(step.config['mapper']);
                    }
                    break;
                case 'sort':
                    if (typeof step.config['field'] === 'string' &&
                        typeof step.config['direction'] === 'string') {
                        result = this.sortData(result, step.config['field'], step.config['direction']);
                    }
                    break;
                case 'group':
                    if (typeof step.config['field'] === 'string') {
                        result = this.groupData(result, step.config['field']);
                    }
                    break;
                case 'validate':
                    if (typeof step.config['schema'] === 'object' &&
                        step.config['schema'] !== null) {
                        result = result?.filter((item) => this.validateItem(item, step.config['schema']));
                    }
                    break;
                default:
                    this.logger.warn(`Unknown transformation step: ${step.type}`);
            }
        }
        return result;
    }
    aggregateData(data, options) {
        let processedResult = data;
        if (options?.groupBy) {
            const groupFields = Array.isArray(options?.groupBy)
                ? options?.groupBy
                : [options?.groupBy];
            processedResult = this.groupByMultipleFields(processedResult, groupFields);
        }
        if (options?.aggregations) {
            processedResult = this.applyAggregations(processedResult, options?.aggregations);
        }
        if (options?.having) {
            processedResult = this.applyFilters(processedResult, options?.having);
        }
        return processedResult;
    }
    exportData(data, format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.convertToCSV(data);
            case 'xml':
                return this.convertToXML(data);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    validateSwarmConfig(config) {
        const errors = [];
        const warnings = [];
        if (!config['name'] || typeof config['name'] !== 'string') {
            errors.push('Swarm name is required and must be a string');
        }
        if (config['agents'] !== undefined &&
            (typeof config['agents'] !== 'number' || config['agents'] < 1)) {
            errors.push('Agent count must be a positive number');
        }
        if (config['timeout'] !== undefined &&
            (typeof config['timeout'] !== 'number' || config['timeout'] < 1000)) {
            errors.push('Timeout must be at least 1000ms');
        }
        if (config['agents'] && config['agents'] > 100) {
            warnings.push('Large agent count may impact performance');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            data: config,
        };
    }
    validateTaskConfig(config) {
        const errors = [];
        const warnings = [];
        if (!config['title'] || typeof config['title'] !== 'string') {
            errors.push('Task title is required and must be a string');
        }
        if (config['priority'] &&
            !['low', 'medium', 'high'].includes(config['priority'])) {
            errors.push('Priority must be low, medium, or high');
        }
        if (config['assignedAgents'] &&
            (!Array.isArray(config['assignedAgents']) ||
                config['assignedAgents'].length === 0)) {
            warnings.push('No agents assigned to task');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            data: config,
        };
    }
    validateItem(item, _schema) {
        try {
            return typeof item === 'object' && item !== null;
        }
        catch {
            return false;
        }
    }
    createMetadata(operation, startTime) {
        return {
            operation,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            cached: false,
            retryCount: 0,
        };
    }
    createErrorResult(operation, startTime, error) {
        return {
            success: false,
            error: error.message,
            metadata: {
                operation,
                timestamp: new Date(),
                duration: Date.now() - startTime,
                cached: false,
                retryCount: 0,
            },
        };
    }
    applyFilters(data, filters) {
        return data.filter((item) => {
            return Object.entries(filters).every(([key, value]) => {
                const typedItem = item;
                if (Array.isArray(value)) {
                    return value.includes(typedItem[key]);
                }
                if (typeof value === 'object' && value !== null) {
                    const rangeValue = value;
                    if (rangeValue.min !== undefined &&
                        typedItem[key] < rangeValue.min)
                        return false;
                    if (rangeValue.max !== undefined &&
                        typedItem[key] > rangeValue.max)
                        return false;
                    return true;
                }
                return typedItem[key] === value;
            });
        });
    }
    searchTasks(tasks, query) {
        const lowercaseQuery = query.toLowerCase();
        return tasks.filter((task) => task.title.toLowerCase().includes(lowercaseQuery) ||
            task.assignedAgents.some((agent) => agent.toLowerCase().includes(lowercaseQuery)));
    }
    sortData(data, field, direction) {
        return [...data].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            if (aVal < bVal)
                return direction === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    groupData(data, field) {
        const groups = data.reduce((acc, item) => {
            const key = String(item[field]);
            if (!acc[key])
                acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
        return Object.entries(groups).map(([key, items]) => ({
            [field]: key,
            items: items,
            count: items.length,
        }));
    }
    groupByMultipleFields(data, fields) {
        const groups = data.reduce((acc, item) => {
            const key = fields.map((field) => String(item[field] || '')).join('|');
            if (!acc[key])
                acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
        return Object.entries(groups).map(([key, items]) => {
            const groupKeys = key.split('|');
            const typedItems = items;
            const groupData = {
                items: typedItems,
                count: typedItems.length,
            };
            fields.forEach((field, index) => {
                groupData[field] = groupKeys[index];
            });
            return groupData;
        });
    }
    applyAggregations(data, aggregations) {
        return data.map((group) => {
            const aggregated = { ...group };
            for (const agg of aggregations) {
                const items = group['items'] || [];
                const values = items
                    .map((item) => item[agg.field])
                    .filter((v) => v !== undefined && typeof v === 'number');
                const alias = agg.alias || `${agg.operation}_${agg.field}`;
                switch (agg.operation) {
                    case 'count':
                        aggregated[alias] = values.length;
                        break;
                    case 'sum':
                        aggregated[alias] = values.reduce((sum, val) => sum + val, 0);
                        break;
                    case 'avg':
                        aggregated[alias] =
                            values.length > 0
                                ? values.reduce((sum, val) => sum + val, 0) /
                                    values.length
                                : 0;
                        break;
                    case 'min':
                        aggregated[alias] = Math.min(...values);
                        break;
                    case 'max':
                        aggregated[alias] = Math.max(...values);
                        break;
                }
            }
            return aggregated;
        });
    }
    calculateDistribution(data, field) {
        return data.reduce((acc, item) => {
            const value = String(item[field] || 'unknown');
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }
    convertToCSV(data) {
        if (data.length === 0)
            return '';
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map((row) => headers
                .map((header) => {
                const value = row[header];
                if (typeof value === 'string' &&
                    (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return String(value || '');
            })
                .join(',')),
        ];
        return csvRows.join('\n');
    }
    convertToXML(data) {
        const xmlRows = data
            ?.map((item) => {
            const xmlFields = Object.entries(item)
                .map(([key, value]) => `    <${key}>${value}</${key}>`)
                .join('\n');
            return `  <item>\n${xmlFields}\n  </item>`;
        })
            .join('\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${xmlRows}\n</data>`;
    }
}
export function createDataServiceHelper(adapter) {
    return new DataServiceHelper(adapter);
}
export const DataServiceUtils = {
    validateConfiguration(config, schema) {
        const errors = [];
        const warnings = [];
        if (schema.required) {
            for (const field of schema.required) {
                if (!(field in config)) {
                    errors.push(`Required field missing: ${field}`);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            data: config,
        };
    },
    generateCacheKey(operation, params = {}, prefix = 'data:') {
        const paramString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
        const hash = Buffer.from(paramString).toString('base64').slice(0, 16);
        return `${prefix}${operation}:${hash}`;
    },
    estimateDataSize(data) {
        try {
            return JSON.stringify(data).length * 2;
        }
        catch {
            return 0;
        }
    },
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    deepMerge(target, ...sources) {
        if (!sources.length)
            return target;
        const source = sources.shift();
        if (typeof target === 'object' && typeof source === 'object') {
            for (const key in source) {
                if (typeof source[key] === 'object' && source[key] !== null) {
                    if (!target[key])
                        target[key] = {};
                    this.deepMerge(target[key], source[key]);
                }
                else {
                    target[key] = source[key];
                }
            }
        }
        return this.deepMerge(target, ...sources);
    },
    createRateLimiter(maxRequests, windowMs) {
        const requests = new Map();
        return (key) => {
            const now = Date.now();
            const windowStart = now - windowMs;
            if (!requests.has(key)) {
                requests.set(key, []);
            }
            const keyRequests = requests.get(key);
            const validRequests = keyRequests.filter((timestamp) => timestamp > windowStart);
            requests.set(key, validRequests);
            if (validRequests.length >= maxRequests) {
                return false;
            }
            validRequests.push(now);
            return true;
        };
    },
};
export default DataServiceHelper;
//# sourceMappingURL=data-service-helpers.js.map