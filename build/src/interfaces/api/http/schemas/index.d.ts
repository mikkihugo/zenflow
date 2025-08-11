/**
 * REST API Schemas.
 *
 * Consolidated OpenAPI 3.0 schemas from all domains.
 * Provides single source of truth for API documentation and validation.
 *
 * @file REST API schemas for all domains.
 */
export type { Agent, CoordinationError, HealthStatus, PerformanceMetrics, SwarmConfig, Task, } from '../coordination/schemas';
export * from './common.ts';
export * from './neural.ts';
/**
 * Complete OpenAPI 3.0 Schema Definition
 * Combines all domain schemas into REST API specification.
 */
export declare const RestAPISchema: {
    readonly openapi: "3.0.0";
    readonly info: {
        readonly title: "Claude Code Flow API";
        readonly version: "1.0.0";
        readonly description: "Unified API for coordination, neural networks, memory, and database operations";
        readonly contact: {
            readonly name: "Claude Code Flow Team";
            readonly url: "https://github.com/claude-zen-flow";
        };
        readonly license: {
            readonly name: "MIT";
            readonly url: "https://opensource.org/licenses/MIT";
        };
    };
    readonly servers: readonly [{
        readonly url: any;
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
                    readonly 200: {
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
                    readonly 500: {
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
                    readonly 201: {
                        readonly description: "Agent created successfully";
                        readonly content: {
                            readonly 'application/json': {
                                readonly schema: {
                                    readonly $ref: "#/components/schemas/Agent";
                                };
                            };
                        };
                    };
                    readonly 400: {
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
        readonly '/api/v1/neural/networks': {
            readonly get: {
                readonly tags: readonly ["Neural Networks"];
                readonly summary: "List neural networks";
                readonly description: "Retrieve all available neural networks";
                readonly parameters: readonly [{
                    readonly in: "query";
                    readonly name: "type";
                    readonly schema: {
                        readonly type: "string";
                        readonly enum: readonly ["feedforward", "convolutional", "recurrent", "transformer"];
                    };
                }, {
                    readonly in: "query";
                    readonly name: "status";
                    readonly schema: {
                        readonly type: "string";
                        readonly enum: readonly ["untrained", "training", "trained", "deployed", "error"];
                    };
                }];
                readonly responses: {
                    readonly 200: {
                        readonly description: "List of neural networks";
                        readonly content: {
                            readonly 'application/json': {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly networks: {
                                            readonly type: "array";
                                            readonly items: {
                                                readonly $ref: "#/components/schemas/NeuralNetwork";
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly post: {
                readonly tags: readonly ["Neural Networks"];
                readonly summary: "Create neural network";
                readonly description: "Create a new neural network with specified architecture";
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly 'application/json': {
                            readonly schema: {
                                readonly type: "object";
                                readonly required: readonly ["type", "layers"];
                                readonly properties: {
                                    readonly type: {
                                        readonly type: "string";
                                        readonly enum: readonly ["feedforward", "convolutional", "recurrent", "transformer"];
                                    };
                                    readonly layers: {
                                        readonly type: "array";
                                        readonly items: {
                                            readonly type: "object";
                                            readonly required: readonly ["type", "size", "activation"];
                                            readonly properties: {
                                                readonly type: {
                                                    readonly type: "string";
                                                    readonly enum: readonly ["input", "hidden", "output", "convolutional", "pooling"];
                                                };
                                                readonly size: {
                                                    readonly type: "integer";
                                                    readonly minimum: 1;
                                                };
                                                readonly activation: {
                                                    readonly type: "string";
                                                    readonly enum: readonly ["relu", "sigmoid", "tanh", "softmax", "linear"];
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly 201: {
                        readonly description: "Neural network created";
                        readonly content: {
                            readonly 'application/json': {
                                readonly schema: {
                                    readonly $ref: "#/components/schemas/NeuralNetwork";
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
                    readonly 200: {
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
                    readonly 200: {
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
            readonly NeuralNetwork: {
                readonly type: "object";
                readonly required: readonly ["id", "type", "status", "layers", "created"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly pattern: "^neural-[0-9a-z]+-[0-9a-z]+$";
                        readonly description: "Unique neural network identifier";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly enum: readonly ["feedforward", "convolutional", "recurrent", "transformer"];
                        readonly description: "Neural network architecture type";
                    };
                    readonly status: {
                        readonly type: "string";
                        readonly enum: readonly ["untrained", "training", "trained", "deployed", "error"];
                        readonly description: "Current network status";
                    };
                    readonly layers: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly properties: {
                                readonly type: {
                                    readonly type: "string";
                                    readonly enum: readonly ["input", "hidden", "output", "convolutional", "pooling"];
                                };
                                readonly size: {
                                    readonly type: "integer";
                                    readonly minimum: 1;
                                };
                                readonly activation: {
                                    readonly type: "string";
                                    readonly enum: readonly ["relu", "sigmoid", "tanh", "softmax", "linear"];
                                };
                            };
                        };
                    };
                    readonly accuracy: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly maximum: 1;
                        readonly description: "Model accuracy (0-1)";
                    };
                    readonly created: {
                        readonly type: "string";
                        readonly format: "date-time";
                    };
                    readonly lastTrained: {
                        readonly type: "string";
                        readonly format: "date-time";
                    };
                };
            };
            readonly TrainingRequest: {
                readonly type: "object";
                readonly required: readonly ["networkId", "trainingData", "epochs"];
                readonly properties: {
                    readonly networkId: {
                        readonly type: "string";
                        readonly description: "ID of neural network to train";
                    };
                    readonly trainingData: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly properties: {
                                readonly input: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "number";
                                    };
                                };
                                readonly output: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "number";
                                    };
                                };
                            };
                        };
                    };
                    readonly epochs: {
                        readonly type: "integer";
                        readonly minimum: 1;
                        readonly maximum: 10000;
                        readonly description: "Number of training epochs";
                    };
                    readonly learningRate: {
                        readonly type: "number";
                        readonly minimum: 0.0001;
                        readonly maximum: 1;
                        readonly default: 0.001;
                    };
                    readonly batchSize: {
                        readonly type: "integer";
                        readonly minimum: 1;
                        readonly maximum: 1000;
                        readonly default: 32;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=index.d.ts.map