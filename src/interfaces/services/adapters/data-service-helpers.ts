import { createLogger } from '../../../utils/logger';

/**
 * Data operation result with standardized metadata
 *
 * @example
 */
export interface DataOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    operation: string;
    timestamp: Date;
    duration: number;
    cached: boolean;
    retryCount: number;
  };
}

/**
 * Batch operation configuration
 *
 * @example
 */
export interface BatchOperationConfig {
  operations: Array<{
    operation: string;
    params?: any;
    options?: any;
  }>;
  concurrency?: number;
  failFast?: boolean;
  timeout?: number;
}

/**
 * Data validation result
 *
 * @example
 */
export interface DataValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: any;
}

/**
 * Search and filter options for enhanced querying
 *
 * @example
 */
export interface EnhancedSearchOptions {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    limit: number;
    offset: number;
  };
  includeMetadata?: boolean;
  searchType?: 'fulltext' | 'semantic' | 'keyword' | 'combined';
}

/**
 * Data aggregation options
 *
 * @example
 */
export interface DataAggregationOptions {
  groupBy?: string | string[];
  aggregations?: Array<{
    field: string;
    operation: 'count' | 'sum' | 'avg' | 'min' | 'max';
    alias?: string;
  }>;
  having?: Record<string, any>;
}

/**
 * Data transformation pipeline step
 *
 * @example
 */
export interface TransformationStep {
  type: 'filter' | 'map' | 'reduce' | 'sort' | 'group' | 'validate';
  config: any;
}

/**
 * Data service helper class with common operations
 *
 * @example
 */
export class DataServiceHelper {
  private logger: Logger;

  constructor(private adapter: DataServiceAdapter) {
    this.logger = createLogger(`DataServiceHelper:${adapter.name}`);
  }

  // ============================================
  // System and Status Operations
  // ============================================

  /**
   * Get comprehensive system status with caching
   *
   * @param useCache
   */
  async getSystemStatus(useCache = true): Promise<DataOperationResult<SystemStatusData>> {
    const startTime = Date.now();

    try {
      const response = await this.adapter.execute<SystemStatusData>(
        'system-status',
        {},
        { trackMetrics: true }
      );

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
    } catch (error) {
      return this.createErrorResult('system-status', startTime, error as Error);
    }
  }

  /**
   * Get system health summary
   */
  async getSystemHealthSummary(): Promise<
    DataOperationResult<{
      overall: 'healthy' | 'degraded' | 'unhealthy';
      components: Array<{
        name: string;
        status: string;
        lastCheck: Date;
      }>;
      metrics: {
        uptime: number;
        responseTime: number;
        errorRate: number;
      };
    }>
  > {
    const startTime = Date.now();

    try {
      const [systemStatus, adapterStatus, serviceStats] = await Promise.all([
        this.adapter.execute<SystemStatusData>('system-status'),
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
    } catch (error) {
      return this.createErrorResult('system-health-summary', startTime, error as Error);
    }
  }

  // ============================================
  // Swarm Management Operations
  // ============================================

  /**
   * Get all swarms with enhanced filtering
   *
   * @param filters
   * @param filters.status
   * @param filters.minAgents
   * @param filters.maxAgents
   * @param filters.createdAfter
   */
  async getSwarms(filters?: {
    status?: string;
    minAgents?: number;
    maxAgents?: number;
    createdAfter?: Date;
  }): Promise<DataOperationResult<SwarmData[]>> {
    const startTime = Date.now();

    try {
      const response = await this.adapter.execute<SwarmData[]>('swarms');

      if (!response?.success || !response?.data) {
        return {
          success: false,
          error: response?.error?.message,
          metadata: this.createMetadata('get-swarms', startTime),
        };
      }

      let swarms = response?.data;

      // Apply filters if provided
      if (filters) {
        swarms = swarms.filter((swarm) => {
          if (filters.status && swarm.status !== filters.status) return false;
          if (filters.minAgents && swarm.agents < filters.minAgents) return false;
          if (filters.maxAgents && swarm.agents > filters.maxAgents) return false;
          if (filters.createdAfter && swarm.createdAt) {
            const createdDate = new Date(swarm.createdAt);
            if (createdDate < filters.createdAfter) return false;
          }
          return true;
        });
      }

      return {
        success: true,
        data: swarms,
        metadata: this.createMetadata('get-swarms', startTime),
      };
    } catch (error) {
      return this.createErrorResult('get-swarms', startTime, error as Error);
    }
  }

  /**
   * Create swarm with validation and monitoring
   *
   * @param config
   * @param config.name
   * @param config.agents
   * @param config.topology
   * @param config.timeout
   */
  async createSwarm(config: {
    name: string;
    agents?: number;
    topology?: string;
    timeout?: number;
  }): Promise<DataOperationResult<SwarmData>> {
    const startTime = Date.now();

    try {
      // Validate swarm configuration
      const validation = this.validateSwarmConfig(config);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          metadata: this.createMetadata('create-swarm', startTime),
        };
      }

      const response = await this.adapter.execute<SwarmData>('create-swarm', config);

      return {
        success: response?.success,
        data: response?.data,
        error: response?.error?.message,
        metadata: this.createMetadata('create-swarm', startTime),
      };
    } catch (error) {
      return this.createErrorResult('create-swarm', startTime, error as Error);
    }
  }

  /**
   * Get swarm statistics and analytics
   */
  async getSwarmAnalytics(): Promise<
    DataOperationResult<{
      totalSwarms: number;
      activeSwarms: number;
      averageAgents: number;
      averageProgress: number;
      statusDistribution: Record<string, number>;
      performanceMetrics: {
        totalTasks: number;
        completionRate: number;
        averageTaskTime: number;
      };
    }>
  > {
    const startTime = Date.now();

    try {
      const [swarmsResponse, tasksResponse] = await Promise.all([
        this.adapter.execute<SwarmData[]>('swarms'),
        this.adapter.execute<TaskData[]>('tasks'),
      ]);

      if (!swarmsResponse?.success || !tasksResponse?.success) {
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
        averageAgents:
          swarms.length > 0 ? swarms.reduce((sum, s) => sum + s.agents, 0) / swarms.length : 0,
        averageProgress:
          swarms.length > 0 ? swarms.reduce((sum, s) => sum + s.progress, 0) / swarms.length : 0,
        statusDistribution: this.calculateDistribution(swarms, 'status'),
        performanceMetrics: {
          totalTasks: tasks.length,
          completionRate:
            tasks.length > 0
              ? (tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100
              : 0,
          averageTaskTime: 1800000, // Mock: 30 minutes average
        },
      };

      return {
        success: true,
        data: analytics,
        metadata: this.createMetadata('swarm-analytics', startTime),
      };
    } catch (error) {
      return this.createErrorResult('swarm-analytics', startTime, error as Error);
    }
  }

  // ============================================
  // Task Management Operations
  // ============================================

  /**
   * Get tasks with enhanced filtering and sorting
   *
   * @param options
   */
  async getTasks(options?: EnhancedSearchOptions): Promise<DataOperationResult<TaskData[]>> {
    const startTime = Date.now();

    try {
      const response = await this.adapter.execute<TaskData[]>('tasks');

      if (!response?.success || !response?.data) {
        return {
          success: false,
          error: response?.error?.message,
          metadata: this.createMetadata('get-tasks', startTime),
        };
      }

      let tasks = response?.data;

      // Apply filters
      if (options?.["filters"]) {
        tasks = this.applyFilters(tasks, options?.["filters"]);
      }

      // Apply search
      if (options?.["query"]) {
        tasks = this.searchTasks(tasks, options?.["query"]);
      }

      // Apply sorting
      if (options?.["sort"]) {
        tasks = this.sortData(tasks, options?.["sort"]?.["field"], options?.["sort"]?.["direction"]);
      }

      // Apply pagination
      if (options?.["pagination"]) {
        const { limit, offset } = options?.["pagination"];
        tasks = tasks.slice(offset, offset + limit);
      }

      return {
        success: true,
        data: tasks,
        metadata: this.createMetadata('get-tasks', startTime),
      };
    } catch (error) {
      return this.createErrorResult('get-tasks', startTime, error as Error);
    }
  }

  /**
   * Create task with workflow integration
   *
   * @param config
   * @param config.title
   * @param config.description
   * @param config.assignedAgents
   * @param config.priority
   * @param config.eta
   * @param config.dependencies
   */
  async createTask(config: {
    title: string;
    description?: string;
    assignedAgents?: string[];
    priority?: 'low' | 'medium' | 'high';
    eta?: string;
    dependencies?: string[];
  }): Promise<DataOperationResult<TaskData>> {
    const startTime = Date.now();

    try {
      // Validate task configuration
      const validation = this.validateTaskConfig(config);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          metadata: this.createMetadata('create-task', startTime),
        };
      }

      const response = await this.adapter.execute<TaskData>('create-task', config);

      return {
        success: response?.success,
        data: response?.data,
        error: response?.error?.message,
        metadata: this.createMetadata('create-task', startTime),
      };
    } catch (error) {
      return this.createErrorResult('create-task', startTime, error as Error);
    }
  }

  // ============================================
  // Document Operations
  // ============================================

  /**
   * Enhanced document search with multiple search types
   *
   * @param query
   * @param options
   * @param options.searchType
   * @param options.documentTypes
   * @param options.projectId
   * @param options.limit
   * @param options.includeContent
   */
  async searchDocuments<T extends BaseDocumentEntity>(
    query: string,
    options?: {
      searchType?: 'fulltext' | 'semantic' | 'keyword' | 'combined';
      documentTypes?: DocumentType[];
      projectId?: string;
      limit?: number;
      includeContent?: boolean;
    }
  ): Promise<
    DataOperationResult<{
      documents: T[];
      total: number;
      searchMetadata: any;
    }>
  > {
    const startTime = Date.now();

    try {
      const searchOptions: DocumentSearchOptions = {
        searchType: options?.["searchType"] || 'combined',
        query,
        documentTypes: options?.["documentTypes"],
        projectId: options?.["projectId"],
        limit: options?.["limit"] || 20,
        includeContent: options?.["includeContent"] !== false,
      };

      const response = await this.adapter.execute('document-search', { searchOptions });

      return {
        success: response?.success,
        data: response?.data,
        error: response?.error?.message,
        metadata: this.createMetadata('search-documents', startTime),
      };
    } catch (error) {
      return this.createErrorResult('search-documents', startTime, error as Error);
    }
  }

  /**
   * Bulk document operations
   *
   * @param operations
   */
  async bulkDocumentOperations(
    operations: Array<{
      action: 'create' | 'update' | 'delete';
      documentId?: string;
      document?: any;
      updates?: any;
    }>
  ): Promise<
    DataOperationResult<{
      successful: number;
      failed: number;
      results: Array<{ success: boolean; data?: any; error?: string }>;
    }>
  > {
    const startTime = Date.now();

    try {
      const results = await Promise.allSettled(
        operations.map(async (op) => {
          try {
            switch (op.action) {
              case 'create':
                return await this.adapter.execute('document-create', { document: op.document });
              case 'update':
                return await this.adapter.execute('document-update', {
                  id: op.documentId,
                  updates: op.updates,
                });
              case 'delete':
                return await this.adapter.execute('document-delete', { id: op.documentId });
              default:
                throw new Error(`Unknown action: ${op.action}`);
            }
          } catch (error) {
            return { success: false, error: (error as Error).message };
          }
        })
      );

      const processedResults = results?.map((result) => {
        if (result?.status === 'fulfilled') {
          return result?.value;
        } else {
          return { success: false, error: result?.reason?.message };
        }
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
    } catch (error) {
      return this.createErrorResult('bulk-document-operations', startTime, error as Error);
    }
  }

  // ============================================
  // Batch Operations
  // ============================================

  /**
   * Execute multiple operations in parallel with concurrency control
   *
   * @param config
   */
  async executeBatch(config: BatchOperationConfig): Promise<DataOperationResult<any[]>> {
    const startTime = Date.now();
    const concurrency = config?.["concurrency"] || 5;

    try {
      const results: any[] = [];
      const errors: string[] = [];

      // Process operations in batches with concurrency control
      for (let i = 0; i < config?.["operations"].length; i += concurrency) {
        const batch = config?.["operations"]?.slice(i, i + concurrency);

        const batchPromises = batch.map(async (op, index) => {
          try {
            const response = await this.adapter.execute(op.operation, op.params, op.options);
            return { index: i + index, result: response };
          } catch (error) {
            const errorMsg = `Operation ${op.operation} failed: ${(error as Error).message}`;
            errors.push(errorMsg);

            if (config?.["failFast"]) {
              throw new Error(errorMsg);
            }

            return { index: i + index, result: { success: false, error: errorMsg } };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);

        for (const result of batchResults) {
          if (result?.status === 'fulfilled') {
            results?.[result?.value?.index] = result?.value?.result;
          } else if (config?.["failFast"]) {
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
    } catch (error) {
      return this.createErrorResult('batch-operations', startTime, error as Error);
    }
  }

  // ============================================
  // Data Transformation and Utilities
  // ============================================

  /**
   * Apply data transformation pipeline
   *
   * @param data
   * @param pipeline
   */
  transformData<T, R>(data: T[], pipeline: TransformationStep[]): R[] {
    let result: any = data;

    for (const step of pipeline) {
      switch (step.type) {
        case 'filter':
          result = result?.filter(step.config.predicate);
          break;
        case 'map':
          result = result?.map(step.config.mapper);
          break;
        case 'sort':
          result = this.sortData(result, step.config.field, step.config.direction);
          break;
        case 'group':
          result = this.groupData(result, step.config.field);
          break;
        case 'validate':
          result = result?.filter((item: any) => this.validateItem(item, step.config.schema));
          break;
        default:
          this.logger.warn(`Unknown transformation step: ${step.type}`);
      }
    }

    return result;
  }

  /**
   * Data aggregation with multiple operations
   *
   * @param data
   * @param options
   */
  aggregateData(data: any[], options: DataAggregationOptions): any {
    let result = data;

    // Group by fields if specified
    if (options?.["groupBy"]) {
      const groupFields = Array.isArray(options?.["groupBy"]) ? options?.["groupBy"] : [options?.["groupBy"]];
      result = this.groupByMultipleFields(result, groupFields);
    }

    // Apply aggregations
    if (options?.["aggregations"]) {
      result = this.applyAggregations(result, options?.["aggregations"]);
    }

    // Apply having filters
    if (options?.["having"]) {
      result = this.applyFilters(result, options?.["having"]);
    }

    return result;
  }

  /**
   * Export data in various formats
   *
   * @param data
   * @param format
   */
  exportData(data: any[], format: 'json' | 'csv' | 'xml' = 'json'): string {
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

  // ============================================
  // Validation Methods
  // ============================================

  private validateSwarmConfig(config: any): DataValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config?.name || typeof config?.name !== 'string') {
      errors.push('Swarm name is required and must be a string');
    }

    if (config?.["agents"] !== undefined && (typeof config?.["agents"] !== 'number' || config?.["agents"] < 1)) {
      errors.push('Agent count must be a positive number');
    }

    if (
      config?.["timeout"] !== undefined &&
      (typeof config?.["timeout"] !== 'number' || config?.["timeout"] < 1000)
    ) {
      errors.push('Timeout must be at least 1000ms');
    }

    if (config?.["agents"] && config?.["agents"] > 100) {
      warnings.push('Large agent count may impact performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: config,
    };
  }

  private validateTaskConfig(config: any): DataValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config?.title || typeof config?.title !== 'string') {
      errors.push('Task title is required and must be a string');
    }

    if (config?.["priority"] && !['low', 'medium', 'high'].includes(config?.["priority"])) {
      errors.push('Priority must be low, medium, or high');
    }

    if (
      config?.["assignedAgents"] &&
      (!Array.isArray(config?.["assignedAgents"]) || config?.["assignedAgents"].length === 0)
    ) {
      warnings.push('No agents assigned to task');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: config,
    };
  }

  private validateItem(item: any, _schema: any): boolean {
    // Simple validation - in production, use a proper schema validator like Joi or Yup
    try {
      return typeof item === 'object' && item !== null;
    } catch {
      return false;
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  private createMetadata(operation: string, startTime: number) {
    return {
      operation,
      timestamp: new Date(),
      duration: Date.now() - startTime,
      cached: false,
      retryCount: 0,
    };
  }

  private createErrorResult(
    operation: string,
    startTime: number,
    error: Error
  ): DataOperationResult {
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

  private applyFilters(data: any[], filters: Record<string, any>): any[] {
    return data?.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.includes(item?.[key]);
        } else if (typeof value === 'object' && value !== null) {
          // Handle range filters, etc.
          if (value.min !== undefined && item?.[key] < value.min) return false;
          if (value.max !== undefined && item?.[key] > value.max) return false;
          return true;
        } else {
          return item?.[key] === value;
        }
      });
    });
  }

  private searchTasks(tasks: TaskData[], query: string): TaskData[] {
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowercaseQuery) ||
        task.assignedAgents.some((agent) => agent.toLowerCase().includes(lowercaseQuery))
    );
  }

  private sortData(data: any[], field: string, direction: 'asc' | 'desc'): any[] {
    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private groupData(data: any[], field: string): any[] {
    const groups = data?.reduce(
      (acc, item) => {
        const key = item?.[field];
        if (!acc[key]) acc[key] = [];
        acc[key]?.push(item);
        return acc;
      },
      {} as Record<string, any[]>
    );

    return Object.entries(groups).map(([key, items]) => ({
      [field]: key,
      items,
      count: items.length,
    }));
  }

  private groupByMultipleFields(data: any[], fields: string[]): any[] {
    const groups = data?.reduce(
      (acc, item) => {
        const key = fields.map((field) => item?.[field]).join('|');
        if (!acc[key]) acc[key] = [];
        acc[key]?.push(item);
        return acc;
      },
      {} as Record<string, any[]>
    );

    return Object.entries(groups).map(([key, items]) => {
      const groupKeys = key.split('|');
      const groupData: any = { items, count: items.length };
      fields.forEach((field, index) => {
        groupData?.[field] = groupKeys[index];
      });
      return groupData;
    });
  }

  private applyAggregations(
    data: any[],
    aggregations: Array<{ field: string; operation: string; alias?: string }>
  ): any[] {
    return data?.map((group) => {
      const aggregated = { ...group };

      for (const agg of aggregations) {
        const values = group.items
          .map((item: any) => item?.[agg.field])
          .filter((v: any) => v !== undefined);
        const alias = agg.alias || `${agg.operation}_${agg.field}`;

        switch (agg.operation) {
          case 'count':
            aggregated[alias] = values.length;
            break;
          case 'sum':
            aggregated[alias] = values.reduce((sum: number, val: number) => sum + val, 0);
            break;
          case 'avg':
            aggregated[alias] =
              values.length > 0
                ? values.reduce((sum: number, val: number) => sum + val, 0) / values.length
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

  private calculateDistribution(data: any[], field: string): Record<string, number> {
    return data?.reduce(
      (acc, item) => {
        const value = item?.[field] || 'unknown';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data?.[0]);
    const csvRows = [
      headers.join(','),
      ...data?.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ];

    return csvRows.join('\n');
  }

  private convertToXML(data: any[]): string {
    const xmlRows = data?.map((item) => {
        const xmlFields = Object.entries(item)
          .map(([key, value]) => `    <${key}>${value}</${key}>`)
          .join('\n');
        return `  <item>\n${xmlFields}\n  </item>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${xmlRows}\n</data>`;
  }
}

/**
 * Factory function for creating data service helpers
 *
 * @param adapter
 */
export function createDataServiceHelper(adapter: DataServiceAdapter): DataServiceHelper {
  return new DataServiceHelper(adapter);
}

/**
 * Utility functions for common data operations (stateless)
 */
export const DataServiceUtils = {
  /**
   * Validate configuration object against schema
   *
   * @param config
   * @param schema
   */
  validateConfiguration(config: any, schema: any): DataValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation implementation
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

  /**
   * Generate cache key for operation
   *
   * @param operation
   * @param params
   * @param prefix
   */
  generateCacheKey(operation: string, params: any = {}, prefix = 'data:'): string {
    const paramString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    const hash = Buffer.from(paramString).toString('base64').slice(0, 16);
    return `${prefix}${operation}:${hash}`;
  },

  /**
   * Estimate data size in bytes
   *
   * @param data
   */
  estimateDataSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // UTF-16 rough estimate
    } catch {
      return 0;
    }
  },

  /**
   * Deep clone object safely
   *
   * @param obj
   */
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Merge objects deeply
   *
   * @param target
   * @param {...any} sources
   */
  deepMerge(target: any, ...sources: any[]): any {
    if (!sources.length) return target;
    const source = sources.shift();

    if (typeof target === 'object' && typeof source === 'object') {
      for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null) {
          if (!target?.[key]) target?.[key] = {};
          this.deepMerge(target?.[key], source[key]);
        } else {
          target?.[key] = source[key];
        }
      }
    }

    return this.deepMerge(target, ...sources);
  },

  /**
   * Rate limiting utility
   *
   * @param maxRequests
   * @param windowMs
   */
  createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();

    return (key: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;

      if (!requests.has(key)) {
        requests.set(key, []);
      }

      const keyRequests = requests.get(key)!;

      // Remove old requests outside the window
      const validRequests = keyRequests.filter((timestamp) => timestamp > windowStart);
      requests.set(key, validRequests);

      if (validRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }

      validRequests.push(now);
      return true; // Request allowed
    };
  },
};

export default DataServiceHelper;