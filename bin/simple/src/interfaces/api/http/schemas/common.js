export const Schemas = {
    PaginationParams: {
        type: 'object',
        properties: {
            limit: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 20,
                description: 'Maximum number of items to return',
            },
            offset: {
                type: 'integer',
                minimum: 0,
                default: 0,
                description: 'Number of items to skip',
            },
        },
    },
    SortParams: {
        type: 'object',
        properties: {
            sortBy: {
                type: 'string',
                description: 'Field to sort by',
            },
            sortOrder: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'asc',
                description: 'Sort direction',
            },
        },
    },
    ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
            error: {
                type: 'object',
                required: ['code', 'message', 'timestamp', 'path', 'method'],
                properties: {
                    code: {
                        type: 'string',
                        description: 'Error code for programmatic handling',
                    },
                    message: {
                        type: 'string',
                        description: 'Human-readable error message',
                    },
                    details: {
                        type: 'object',
                        description: 'Additional error details',
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'When the error occurred',
                    },
                    path: {
                        type: 'string',
                        description: 'Request path that caused the error',
                    },
                    method: {
                        type: 'string',
                        description: 'HTTP method that caused the error',
                    },
                    traceId: {
                        type: 'string',
                        description: 'Trace ID for debugging',
                    },
                },
            },
        },
    },
    HealthResponse: {
        type: 'object',
        required: ['status', 'timestamp', 'version', 'uptime', 'environment'],
        properties: {
            status: {
                type: 'string',
                enum: ['healthy', 'unhealthy', 'degraded'],
                description: 'Overall system health status',
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'When health check was performed',
            },
            version: {
                type: 'string',
                description: 'Application version',
            },
            uptime: {
                type: 'number',
                description: 'System uptime in seconds',
            },
            environment: {
                type: 'string',
                enum: ['development', 'production', 'test'],
                description: 'Runtime environment',
            },
            services: {
                type: 'object',
                additionalProperties: {
                    type: 'string',
                    enum: ['healthy', 'unhealthy', 'degraded'],
                },
                description: 'Health status of individual services',
            },
        },
    },
    MetricsResponse: {
        type: 'object',
        required: ['timestamp', 'uptime', 'memory', 'cpu', 'process'],
        properties: {
            timestamp: {
                type: 'string',
                format: 'date-time',
            },
            uptime: {
                type: 'number',
                description: 'System uptime in seconds',
            },
            memory: {
                type: 'object',
                properties: {
                    rss: { type: 'number' },
                    heapTotal: { type: 'number' },
                    heapUsed: { type: 'number' },
                    external: { type: 'number' },
                    arrayBuffers: { type: 'number' },
                },
            },
            cpu: {
                type: 'object',
                properties: {
                    user: { type: 'number' },
                    system: { type: 'number' },
                },
            },
            process: {
                type: 'object',
                properties: {
                    pid: { type: 'number' },
                    version: { type: 'string' },
                    platform: { type: 'string' },
                    architecture: { type: 'string' },
                },
            },
        },
    },
};
//# sourceMappingURL=common.js.map