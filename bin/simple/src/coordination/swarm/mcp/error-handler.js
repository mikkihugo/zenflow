import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('MCP-ErrorHandler');
export class ValidationError extends Error {
    field;
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}
export class MCPErrorHandler {
    static handleError(error, context) {
        logger.error(`MCP Error${context ? ` in ${context}` : ''}:`, error);
        throw error;
    }
    static validateParameters(params, schema) {
        if (!params && schema.required) {
            throw new Error('Missing required parameters');
        }
    }
    static classifyError(error, context) {
        return {
            type: error.constructor.name,
            message: error.message,
            severity: 'medium',
            recoverable: true,
            context: context,
        };
    }
}
export class MCPToolWrapper {
    static wrap(toolFn, toolName) {
        return async (params) => {
            try {
                return await toolFn(params);
            }
            catch (error) {
                logger.error(`Tool ${toolName} failed:`, error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        };
    }
}
export class MCPParameterValidator {
    static validate(_params, _schema) {
        return true;
    }
    static validateParams(params, toolName) {
        if (!params) {
            throw new ValidationError(`Missing parameters for tool: ${toolName}`);
        }
        return params;
    }
    static sanitizeInput(input) {
        return input.replace(/[<>]/g, '');
    }
}
export class AgentError extends Error {
    agentId;
    constructor(message, agentId) {
        super(message);
        this.agentId = agentId;
        this.name = 'AgentError';
    }
}
export class NeuralError extends Error {
    modelId;
    operation;
    constructor(message, modelId, operation) {
        super(message);
        this.modelId = modelId;
        this.operation = operation;
        this.name = 'NeuralError';
    }
}
export class PersistenceError extends Error {
    key;
    operation;
    constructor(message, key, operation) {
        super(message);
        this.key = key;
        this.operation = operation;
        this.name = 'PersistenceError';
    }
}
export class ResourceError extends Error {
    resourceType;
    resourceId;
    constructor(message, resourceType, resourceId) {
        super(message);
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.name = 'ResourceError';
    }
}
export class SwarmError extends Error {
    swarmId;
    agentCount;
    constructor(message, swarmId, agentCount) {
        super(message);
        this.swarmId = swarmId;
        this.agentCount = agentCount;
        this.name = 'SwarmError';
    }
}
export class TaskError extends Error {
    taskId;
    taskType;
    constructor(message, taskId, taskType) {
        super(message);
        this.taskId = taskId;
        this.taskType = taskType;
        this.name = 'TaskError';
    }
}
export class WasmError extends Error {
    module;
    functionName;
    constructor(message, module, functionName) {
        super(message);
        this.module = module;
        this.functionName = functionName;
        this.name = 'WasmError';
    }
}
export class ZenSwarmError extends Error {
    swarmType;
    coordination;
    constructor(message, swarmType, coordination) {
        super(message);
        this.swarmType = swarmType;
        this.coordination = coordination;
        this.name = 'ZenSwarmError';
    }
}
export class ErrorContextFactory {
    static create(operation, metadata) {
        return {
            operation,
            timestamp: new Date(),
            metadata: metadata || {},
            stackTrace: new Error().stack ?? undefined,
        };
    }
}
export class ErrorFactory {
    static createValidationError(message, field) {
        return new ValidationError(message, field);
    }
    static createAgentError(message, agentId) {
        return new AgentError(message, agentId);
    }
    static createNeuralError(message, modelId, operation) {
        return new NeuralError(message, modelId, operation);
    }
    static createPersistenceError(message, key, operation) {
        return new PersistenceError(message, key, operation);
    }
    static createResourceError(message, resourceType, resourceId) {
        return new ResourceError(message, resourceType, resourceId);
    }
    static createSwarmError(message, swarmId, agentCount) {
        return new SwarmError(message, swarmId, agentCount);
    }
    static createTaskError(message, taskId, taskType) {
        return new TaskError(message, taskId, taskType);
    }
    static createWasmError(message, module, functionName) {
        return new WasmError(message, module, functionName);
    }
    static createZenSwarmError(message, swarmType, coordination) {
        return new ZenSwarmError(message, swarmType, coordination);
    }
    static createErrorWithContext(ErrorClass, message, context, ...args) {
        const error = new ErrorClass(message, ...args);
        error.context = context;
        return error;
    }
    static createError(errorType, message, metadata) {
        const context = ErrorContextFactory.create(`create-${errorType}`, metadata);
        switch (errorType.toLowerCase()) {
            case 'validation':
                return ErrorFactory.createErrorWithContext(ValidationError, message, context, metadata?.['field']);
            case 'agent':
                return ErrorFactory.createErrorWithContext(AgentError, message, context, metadata?.['agentId']);
            case 'neural':
                return ErrorFactory.createErrorWithContext(NeuralError, message, context, metadata?.['modelId'], metadata?.['operation']);
            case 'persistence':
                return ErrorFactory.createErrorWithContext(PersistenceError, message, context, metadata?.['key'], metadata?.['operation']);
            case 'resource':
                return ErrorFactory.createErrorWithContext(ResourceError, message, context, metadata?.['resourceType'], metadata?.['resourceId']);
            case 'swarm':
                return ErrorFactory.createErrorWithContext(SwarmError, message, context, metadata?.['swarmId'], metadata?.['agentCount']);
            case 'task':
                return ErrorFactory.createErrorWithContext(TaskError, message, context, metadata?.['taskId'], metadata?.['taskType']);
            case 'wasm':
                return ErrorFactory.createErrorWithContext(WasmError, message, context, metadata?.['module'], metadata?.['functionName']);
            case 'zenswarm':
                return ErrorFactory.createErrorWithContext(ZenSwarmError, message, context, metadata?.['swarmType'], metadata?.['coordination']);
            default: {
                const error = new Error(message);
                error.context = context;
                error.type = errorType;
                return error;
            }
        }
    }
}
const mcpErrorHandler = {
    classifyError: MCPErrorHandler.classifyError,
    handleError: MCPErrorHandler.handleError,
    validateParameters: MCPErrorHandler.validateParameters,
};
export { mcpErrorHandler };
export default mcpErrorHandler;
//# sourceMappingURL=error-handler.js.map