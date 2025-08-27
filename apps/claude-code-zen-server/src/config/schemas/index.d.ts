export * from './common';
/**
 * Re-export commonly used types.
 * These would normally come from the respective domain packages.
 */
export interface Agent {
    id: string;
    type: 'researcher' | 'coder' | 'analyst' | 'tester' | 'coordinator';
    status: 'idle' | 'busy' | 'error' | 'offline';
    capabilities: string[];
    created: string;
    lastHeartbeat: string;
    taskCount: number;
    workload: number;
}
export interface Task {
    id: string;
    type: string;
    description: string;
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
    priority: number;
    created: string;
    deadline?: string;
    assignedTo?: string;
}
export interface CoordinationError {
    code: string;
    message: string;
    timestamp: string;
}
export interface SwarmConfig {
    maxAgents: number;
    strategy: 'parallel' | 'sequential' | 'adaptive';
    timeout: number;
    retryAttempts: number;
}
export interface PerformanceMetrics {
    cpu: number;
    memory: number;
    requests: {
        total: number;
        successful: number;
        failed: number;
        avgResponseTime: number;
    };
}
/**
 * Complete OpenAPI 3.0 Schema Definition
 * Combines all domain schemas into REST API specification.
 */
export declare const restAPISchema: {
    readonly openapi: "3.0.0";
    readonly info: {
        readonly title: "Claude Code Zen API";
        readonly version: "1.0.0";
        readonly description: "Unified API for coordination, neural networks, memory, and database operations";
        readonly contact: {
            readonly name: "Claude Code Zen Team";
            readonly url: "https://github.com/claude-zen-flow";
        };
        readonly license: {
            readonly name: "MIT";
            readonly url: "https://opensource.org/licenses/MIT";
        };
    };
    readonly servers: readonly [{
        readonly url: string;
        readonly description: "Development server";
    }, {
        readonly url: "https://api.claude-zen-flow.com";
        readonly description: "Production server";
    }];
    readonly paths: {
        readonly '/api/v1/coordination/agents': {
            readonly get: {
                readonly tags: readonly ["Agents"];
                readonly summary: "List all agents";
                readonly description: "Retrieve a list of all agents in the coordination system";
                readonly parameters: readonly [{
                    readonly in: "query";
                    readonly name: "status";
                    readonly schema: {
                        readonly type: "string";
                        readonly enum: readonly ["idle", "busy", "error", "offline"];
                    };
                    readonly description: "Filter agents by status";
                }, {
                    readonly in: "query";
                    readonly name: "type";
                    readonly schema: {
                        readonly type: "string";
                        readonly enum: readonly ["researcher", "coder", "analyst", "tester", "coordinator"];
                    };
                    readonly description: "Filter agents by type";
                }, {
                    readonly in: "query";
                    readonly name: "limit";
                    readonly schema: {
                        readonly type: "integer";
                        readonly minimum: 1;
                        readonly maximum: 100;
                        readonly default: 20;
                    };
                    readonly description: "Maximum number of agents to return";
                }, {
                    readonly in: "query";
                    readonly name: "offset";
                    readonly schema: {
                        readonly type: "integer";
                        readonly minimum: 0;
                        readonly default: 0;
                    };
                    readonly description: "Number of agents to skip";
                }];
                readonly responses: {
                    readonly '200': {
                        readonly description: "List of agents";
                        readonly content: {
                            readonly 'application/json': {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly agents: {
                                            readonly type: "array";
                                            readonly items: {
                                                readonly $ref: "#/components/schemas/Agent";
                                            };
                                        };
                                        readonly total: {
                                            readonly type: "integer";
                                        };
                                        readonly offset: {
                                            readonly type: "integer";
                                        };
                                        readonly limit: {
                                            readonly type: "integer";
                                        };
                                    };
                                };
                            };
                        };
                    };
                    readonly '500': {
                        readonly description: "Internal server error";
                        readonly content: {
                            readonly 'application/json': {
                                readonly schema: {
                                    readonly $ref: "#/components/schemas/Error";
                                };
                            };
                        };
                    };
                };
            };
            readonly post: {
                readonly tags: readonly ["Agents"];
                readonly summary: "Create a new agent";
                readonly description: "Create and register a new agent in the coordination system";
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly 'application/json': {
                            readonly schema: {
                                readonly type: "object";
                                readonly required: readonly ["type", "capabilities"];
                                readonly properties: {
                                    readonly type: {
                                        readonly type: "string";
                                        readonly enum: readonly ["researcher", "coder", "analyst", "tester", "coordinator"];
                                    };
                                    readonly capabilities: {
                                        readonly type: "array";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                        readonly minItems: 1;
                                    };
                                };
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly '201': {
                        readonly description: "Agent created successfully";
                        readonly content: {
                            readonly 'application/json': {
                                readonly schema: {
                                    readonly $ref: "#/components/schemas/Agent";
                                };
                            };
                        };
                    };
                    readonly '400': {
                        readonly description: "Invalid request";
                        readonly content: {
                            readonly 'application/json': {
                                readonly schema: {
                                    readonly $ref: "#/components/schemas/Error";
                                };
                            };
                        };
                    };
                };
            };
        };
        readonly '/health': {
            readonly get: {
                readonly tags: readonly ["System"];
                readonly summary: "System health check";
                readonly description: "Get overall system health status";
                readonly responses: {
                    readonly '200': {
                        readonly description: "System is healthy";
                        readonly content: {
                            readonly 'application/json': {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly status: {
                                            readonly type: "string";
                                            readonly example: "healthy";
                                        };
                                        readonly timestamp: {
                                            readonly type: "string";
                                            readonly format: "date-time";
                                        };
                                        readonly version: {
                                            readonly type: "string";
                                        };
                                        readonly uptime: {
                                            readonly type: "number";
                                        };
                                        readonly environment: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        readonly '/api/v1/system/health': {
            readonly get: {
                readonly tags: readonly ["System"];
                readonly summary: "Detailed health check";
                readonly description: "Get detailed system health with all services";
                readonly responses: {
                    readonly '200': {
                        readonly description: "Detailed system health";
                        readonly content: {
                            readonly 'application/json': {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly status: {
                                            readonly type: "string";
                                        };
                                        readonly timestamp: {
                                            readonly type: "string";
                                            readonly format: "date-time";
                                        };
                                        readonly services: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly coordination: {
                                                    readonly type: "string";
                                                };
                                                readonly neural: {
                                                    readonly type: "string";
                                                };
                                                readonly memory: {
                                                    readonly type: "string";
                                                };
                                                readonly database: {
                                                    readonly type: "string";
                                                };
                                            };
                                        };
                                        readonly uptime: {
                                            readonly type: "number";
                                        };
                                        readonly memory: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly rss: {
                                                    readonly type: "number";
                                                };
                                                readonly heapTotal: {
                                                    readonly type: "number";
                                                };
                                                readonly heapUsed: {
                                                    readonly type: "number";
                                                };
                                                readonly external: {
                                                    readonly type: "number";
                                                };
                                            };
                                        };
                                        readonly version: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly Error: {
                readonly type: "object";
                readonly required: readonly ["error"];
                readonly properties: {
                    readonly error: {
                        readonly type: "object";
                        readonly required: readonly ["code", "message", "timestamp", "path", "method"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly type: "string";
                            };
                            readonly details: {
                                readonly type: "object";
                            };
                            readonly timestamp: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly path: {
                                readonly type: "string";
                            };
                            readonly method: {
                                readonly type: "string";
                            };
                            readonly traceId: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
            readonly Agent: {
                readonly type: "object";
                readonly required: readonly ["id", "type", "status", "capabilities", "created", "lastHeartbeat", "taskCount", "workload"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly pattern: "^[a-z]+-[0-9a-z]+-[0-9a-z]+$";
                        readonly description: "Unique agent identifier";
                        readonly example: "researcher-1a2b3c-4d5e6f";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly enum: readonly ["researcher", "coder", "analyst", "tester", "coordinator"];
                        readonly description: "Agent specialization type";
                    };
                    readonly status: {
                        readonly type: "string";
                        readonly enum: readonly ["idle", "busy", "error", "offline"];
                        readonly description: "Current agent status";
                    };
                    readonly capabilities: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly description: "List of agent capabilities";
                        readonly example: readonly ["code_analysis", "bug_detection", "performance_optimization"];
                    };
                    readonly created: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "Agent creation timestamp";
                    };
                    readonly lastHeartbeat: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "Last heartbeat timestamp";
                    };
                    readonly taskCount: {
                        readonly type: "integer";
                        readonly minimum: 0;
                        readonly description: "Number of completed tasks";
                    };
                    readonly workload: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly maximum: 100;
                        readonly description: "Current workload percentage";
                    };
                };
            };
            readonly Task: {
                readonly type: "object";
                readonly required: readonly ["id", "type", "description", "status", "priority", "created"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly pattern: "^task-[a-z]+-[0-9a-z]+-[0-9a-z]+$";
                        readonly description: "Unique task identifier";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly description: "Task type/category";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly maxLength: 500;
                        readonly description: "Task description";
                    };
                    readonly status: {
                        readonly type: "string";
                        readonly enum: readonly ["pending", "assigned", "in_progress", "completed", "failed"];
                        readonly description: "Current task status";
                    };
                    readonly priority: {
                        readonly type: "integer";
                        readonly minimum: 0;
                        readonly maximum: 100;
                        readonly description: "Task priority (0-100)";
                    };
                    readonly created: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "Task creation timestamp";
                    };
                    readonly deadline: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "Task deadline";
                    };
                    readonly assignedTo: {
                        readonly type: "string";
                        readonly description: "ID of assigned agent";
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=index.d.ts.map