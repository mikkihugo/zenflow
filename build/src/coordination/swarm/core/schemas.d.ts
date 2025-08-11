/**
 * @file Coordination system: schemas.
 */
/**
 * Base validator class.
 *
 * @example
 */
declare class BaseValidator {
    static validate(value: any, schema: any, fieldName?: string): any;
    static validateValue(value: any, schema: any, fieldName: any): any;
    static validateType(value: any, expectedType: any): boolean;
}
/**
 * Schema definitions for all MCP tools.
 */
declare const MCPSchemas: {
    swarm_init: {
        topology: {
            type: string;
            enum: string[];
            default: string;
        };
        maxAgents: {
            type: string;
            integer: boolean;
            min: number;
            max: number;
            default: number;
        };
        strategy: {
            type: string;
            enum: string[];
            default: string;
        };
        enableCognitiveDiversity: {
            type: string;
            default: boolean;
        };
        enableNeuralAgents: {
            type: string;
            default: boolean;
        };
        enableForecasting: {
            type: string;
            default: boolean;
        };
    };
    agent_spawn: {
        type: {
            type: string;
            enum: string[];
            default: string;
        };
        name: {
            type: string;
            minLength: number;
            maxLength: number;
            required: boolean;
        };
        capabilities: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
            required: boolean;
        };
        cognitivePattern: {
            type: string;
            enum: string[];
            required: boolean;
        };
        swarmId: {
            type: string;
            pattern: string;
            required: boolean;
        };
    };
    task_orchestrate: {
        task: {
            type: string;
            required: boolean;
            minLength: number;
            maxLength: number;
        };
        priority: {
            type: string;
            enum: string[];
            default: string;
        };
        strategy: {
            type: string;
            enum: string[];
            default: string;
        };
        maxAgents: {
            type: string;
            integer: boolean;
            min: number;
            max: number;
            required: boolean;
        };
        swarmId: {
            type: string;
            pattern: string;
            required: boolean;
        };
        requiredCapabilities: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
            required: boolean;
        };
        estimatedDuration: {
            type: string;
            min: number;
            max: number;
            required: boolean;
        };
    };
    swarm_status: {
        verbose: {
            type: string;
            default: boolean;
        };
        swarmId: {
            type: string;
            pattern: string;
            required: boolean;
        };
    };
    task_status: {
        taskId: {
            type: string;
            pattern: string;
            required: boolean;
        };
        detailed: {
            type: string;
            default: boolean;
        };
    };
    task_results: {
        taskId: {
            type: string;
            required: boolean;
            pattern: string;
        };
        format: {
            type: string;
            enum: string[];
            default: string;
        };
        includeAgentResults: {
            type: string;
            default: boolean;
        };
    };
    agent_list: {
        filter: {
            type: string;
            enum: string[];
            default: string;
        };
        swarmId: {
            type: string;
            pattern: string;
            required: boolean;
        };
    };
    agent_metrics: {
        agentId: {
            type: string;
            pattern: string;
            required: boolean;
        };
        swarmId: {
            type: string;
            pattern: string;
            required: boolean;
        };
        metric: {
            type: string;
            enum: string[];
            default: string;
        };
    };
    benchmark_run: {
        type: {
            type: string;
            enum: string[];
            default: string;
        };
        iterations: {
            type: string;
            integer: boolean;
            min: number;
            max: number;
            default: number;
        };
        includeNeuralBenchmarks: {
            type: string;
            default: boolean;
        };
        includeSwarmBenchmarks: {
            type: string;
            default: boolean;
        };
    };
    features_detect: {
        category: {
            type: string;
            enum: string[];
            default: string;
        };
    };
    memory_usage: {
        detail: {
            type: string;
            enum: string[];
            default: string;
        };
    };
    neural_status: {
        agentId: {
            type: string;
            pattern: string;
            required: boolean;
        };
    };
    neural_train: {
        agentId: {
            type: string;
            required: boolean;
            pattern: string;
        };
        iterations: {
            type: string;
            integer: boolean;
            min: number;
            max: number;
            default: number;
        };
        learningRate: {
            type: string;
            min: number;
            max: number;
            default: number;
        };
        modelType: {
            type: string;
            enum: string[];
            default: string;
        };
        trainingData: {
            type: string;
            required: boolean;
        };
    };
    neural_patterns: {
        pattern: {
            type: string;
            enum: string[];
            default: string;
        };
    };
    daa_init: {
        enableCoordination: {
            type: string;
            default: boolean;
        };
        enableLearning: {
            type: string;
            default: boolean;
        };
        persistenceMode: {
            type: string;
            enum: string[];
            default: string;
        };
    };
    daa_agent_create: {
        id: {
            type: string;
            required: boolean;
            minLength: number;
            maxLength: number;
        };
        capabilities: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
            required: boolean;
        };
        cognitivePattern: {
            type: string;
            enum: string[];
            required: boolean;
        };
        enableMemory: {
            type: string;
            default: boolean;
        };
        learningRate: {
            type: string;
            min: number;
            max: number;
            default: number;
        };
    };
    daa_agent_adapt: {
        agent_id: {
            type: string;
            required: boolean;
            minLength: number;
        };
        agentId: {
            type: string;
            required: boolean;
            minLength: number;
        };
        feedback: {
            type: string;
            minLength: number;
            maxLength: number;
            required: boolean;
        };
        performanceScore: {
            type: string;
            min: number;
            max: number;
            required: boolean;
        };
        suggestions: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
            required: boolean;
        };
    };
    daa_workflow_create: {
        id: {
            type: string;
            required: boolean;
            minLength: number;
            maxLength: number;
        };
        name: {
            type: string;
            required: boolean;
            minLength: number;
            maxLength: number;
        };
        steps: {
            type: string;
            items: {
                type: string;
            };
            required: boolean;
        };
        dependencies: {
            type: string;
            required: boolean;
        };
        strategy: {
            type: string;
            enum: string[];
            default: string;
        };
    };
    daa_workflow_execute: {
        workflow_id: {
            type: string;
            required: boolean;
            minLength: number;
        };
        workflowId: {
            type: string;
            required: boolean;
            minLength: number;
        };
        agentIds: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
            required: boolean;
        };
        parallelExecution: {
            type: string;
            default: boolean;
        };
    };
    daa_knowledge_share: {
        source_agent: {
            type: string;
            required: boolean;
            minLength: number;
        };
        sourceAgentId: {
            type: string;
            required: boolean;
            minLength: number;
        };
        target_agents: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
            required: boolean;
            minItems: number;
        };
        targetAgentIds: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
            required: boolean;
            minLength: number;
        };
        knowledgeDomain: {
            type: string;
            minLength: number;
            required: boolean;
        };
        knowledgeContent: {
            type: string;
            required: boolean;
        };
    };
    daa_learning_status: {
        agentId: {
            type: string;
            required: boolean;
        };
        detailed: {
            type: string;
            default: boolean;
        };
    };
    daa_cognitive_pattern: {
        agentId: {
            type: string;
            required: boolean;
        };
        pattern: {
            type: string;
            enum: string[];
            required: boolean;
        };
        analyze: {
            type: string;
            default: boolean;
        };
    };
    daa_meta_learning: {
        sourceDomain: {
            type: string;
            minLength: number;
            required: boolean;
        };
        targetDomain: {
            type: string;
            minLength: number;
            required: boolean;
        };
        transferMode: {
            type: string;
            enum: string[];
            default: string;
        };
        agentIds: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
            required: boolean;
        };
    };
    daa_performance_metrics: {
        category: {
            type: string;
            enum: string[];
            default: string;
        };
        timeRange: {
            type: string;
            pattern: string;
            required: boolean;
        };
    };
    swarm_monitor: {
        swarmId: {
            type: string;
            pattern: string;
            required: boolean;
        };
        duration: {
            type: string;
            integer: boolean;
            min: number;
            max: number;
            default: number;
        };
        interval: {
            type: string;
            integer: boolean;
            min: number;
            max: number;
            default: number;
        };
        includeAgents: {
            type: string;
            default: boolean;
        };
        includeTasks: {
            type: string;
            default: boolean;
        };
        includeMetrics: {
            type: string;
            default: boolean;
        };
        realTime: {
            type: string;
            default: boolean;
        };
    };
};
/**
 * Validation utilities.
 *
 * @example
 */
declare class ValidationUtils {
    /**
     * Validate parameters against a schema.
     *
     * @param params
     * @param toolName
     */
    static validateParams(params: any, toolName: any): {};
    /**
     * Get schema documentation for a tool.
     *
     * @param toolName
     */
    static getSchemaDoc(toolName: any): {
        tool: any;
        parameters: {};
    } | null;
    /**
     * Generate human-readable description for a field.
     *
     * @param fieldName
     * @param schema
     */
    static generateFieldDescription(fieldName: any, schema: any): string;
    /**
     * Get all available tool schemas.
     */
    static getAllSchemas(): string[];
    /**
     * Validate a UUID string.
     *
     * @param str
     */
    static isValidUUID(str: any): boolean;
    /**
     * Sanitize input to prevent injection attacks.
     *
     * @param input
     */
    static sanitizeInput(input: any): any;
}
/**
 * Export validation schemas and utilities.
 */
export { MCPSchemas, BaseValidator, ValidationUtils };
export default ValidationUtils;
//# sourceMappingURL=schemas.d.ts.map