import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('ErrorSystem');
export class BaseClaudeZenError extends Error {
    context;
    severity;
    category;
    recoverable;
    retryCount = 0;
    constructor(message, category, severity = 'medium', context = {}, recoverable = true) {
        super(message);
        this.category = category;
        this.severity = severity;
        this.recoverable = recoverable;
        this.context = {
            timestamp: Date.now(),
            component: category,
            stackTrace: this.stack || '',
            ...context,
        };
        this.logError();
    }
    logError() {
        const logLevel = this.severity === 'critical'
            ? 'error'
            : this.severity === 'high'
                ? 'warn'
                : 'info';
        logger[logLevel](`[${this.category}] ${this.message}`, {
            severity: this.severity,
            context: this.context,
            recoverable: this.recoverable,
        });
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            category: this.category,
            severity: this.severity,
            recoverable: this.recoverable,
            context: this.context,
            retryCount: this.retryCount,
        };
    }
}
export class FACTError extends BaseClaudeZenError {
    constructor(message, severity = 'medium', context = {}) {
        super(message, 'FACT', severity, context);
        this.name = 'FACTError';
    }
}
export class FACTStorageError extends FACTError {
    backend;
    operation;
    constructor(message, backend, operation, severity = 'high') {
        super(message, severity, { operation, metadata: { backend } });
        this.backend = backend;
        this.operation = operation;
        this.name = 'FACTStorageError';
    }
}
export class FACTGatheringError extends FACTError {
    query;
    sources;
    constructor(message, query, sources, severity = 'medium') {
        super(message, severity, { metadata: { query, sources } });
        this.query = query;
        this.sources = sources;
        this.name = 'FACTGatheringError';
    }
}
export class FACTProcessingError extends FACTError {
    processType;
    dataId;
    constructor(message, processType, dataId, severity = 'medium') {
        super(message, severity, { metadata: { processType, dataId } });
        this.processType = processType;
        this.dataId = dataId;
        this.name = 'FACTProcessingError';
    }
}
export class RAGError extends BaseClaudeZenError {
    constructor(message, severity = 'medium', context = {}) {
        super(message, 'RAG', severity, context);
        this.name = 'RAGError';
    }
}
export class RAGVectorError extends RAGError {
    operation;
    vectorDimension;
    constructor(message, operation, vectorDimension, severity = 'high') {
        super(message, severity, { operation, metadata: { vectorDimension } });
        this.operation = operation;
        this.vectorDimension = vectorDimension;
        this.name = 'RAGVectorError';
    }
}
export class RAGEmbeddingError extends RAGError {
    modelName;
    textLength;
    constructor(message, modelName, textLength, severity = 'high') {
        super(message, severity, { metadata: { modelName, textLength } });
        this.modelName = modelName;
        this.textLength = textLength;
        this.name = 'RAGEmbeddingError';
    }
}
export class RAGRetrievalError extends RAGError {
    query;
    similarityThreshold;
    constructor(message, query, similarityThreshold, severity = 'medium') {
        super(message, severity, { metadata: { query, similarityThreshold } });
        this.query = query;
        this.similarityThreshold = similarityThreshold;
        this.name = 'RAGRetrievalError';
    }
}
export class SwarmError extends BaseClaudeZenError {
    swarmId;
    constructor(message, swarmId, severity = 'medium', context = {}) {
        super(message, 'Swarm', severity, { ...context, metadata: { swarmId } });
        this.swarmId = swarmId;
        this.name = 'SwarmError';
    }
}
export class AgentError extends BaseClaudeZenError {
    agentId;
    agentType;
    constructor(message, agentId, agentType, severity = 'medium') {
        super(message, 'Agent', severity, { metadata: { agentId, agentType } });
        this.agentId = agentId;
        this.agentType = agentType;
        this.name = 'AgentError';
    }
}
export class SwarmCommunicationError extends SwarmError {
    fromAgent;
    toAgent;
    messageType;
    constructor(message, fromAgent, toAgent, messageType, severity = 'high') {
        super(message, undefined, severity, {
            metadata: { fromAgent, toAgent, messageType },
        });
        this.fromAgent = fromAgent;
        this.toAgent = toAgent;
        this.messageType = messageType;
        this.name = 'SwarmCommunicationError';
    }
}
export class SwarmCoordinationError extends SwarmError {
    coordinationType;
    participantCount;
    constructor(message, coordinationType, participantCount, severity = 'high') {
        super(message, undefined, severity, {
            metadata: { coordinationType, participantCount },
        });
        this.coordinationType = coordinationType;
        this.participantCount = participantCount;
        this.name = 'SwarmCoordinationError';
    }
}
export class MCPError extends BaseClaudeZenError {
    toolName;
    constructor(message, toolName, severity = 'medium', context = {}) {
        super(message, 'MCP', severity, { ...context, metadata: { toolName } });
        this.toolName = toolName;
        this.name = 'MCPError';
    }
}
export class MCPValidationError extends MCPError {
    parameterName;
    expectedType;
    actualValue;
    constructor(message, parameterName, expectedType, actualValue, toolName) {
        super(message, toolName, 'medium', {
            metadata: { parameterName, expectedType, actualValue },
        });
        this.parameterName = parameterName;
        this.expectedType = expectedType;
        this.actualValue = actualValue;
        this.name = 'MCPValidationError';
    }
}
export class MCPExecutionError extends MCPError {
    executionPhase;
    originalError;
    constructor(message, toolName, executionPhase, originalError, severity = 'high') {
        super(message, toolName, severity, {
            metadata: { executionPhase, originalError: originalError?.message },
        });
        this.executionPhase = executionPhase;
        this.originalError = originalError;
        this.name = 'MCPExecutionError';
    }
}
export class MCPTimeoutError extends MCPError {
    timeoutMs;
    actualTimeMs;
    constructor(message, toolName, timeoutMs, actualTimeMs) {
        super(message, toolName, 'high', { metadata: { timeoutMs, actualTimeMs } });
        this.timeoutMs = timeoutMs;
        this.actualTimeMs = actualTimeMs;
        this.name = 'MCPTimeoutError';
    }
}
export class WASMError extends BaseClaudeZenError {
    constructor(message, severity = 'medium', context = {}) {
        super(message, 'WASM', severity, context);
        this.name = 'WASMError';
    }
}
export class WASMLoadingError extends WASMError {
    moduleName;
    moduleSize;
    constructor(message, moduleName, moduleSize, severity = 'critical') {
        super(message, severity, { metadata: { moduleName, moduleSize } });
        this.moduleName = moduleName;
        this.moduleSize = moduleSize;
        this.name = 'WASMLoadingError';
    }
}
export class WASMExecutionError extends WASMError {
    functionName;
    parameters;
    constructor(message, functionName, parameters, severity = 'high') {
        super(message, severity, { metadata: { functionName, parameters } });
        this.functionName = functionName;
        this.parameters = parameters;
        this.name = 'WASMExecutionError';
    }
}
export class WASMMemoryError extends WASMError {
    memoryUsage;
    memoryLimit;
    constructor(message, memoryUsage, memoryLimit, severity = 'critical') {
        super(message, severity, { metadata: { memoryUsage, memoryLimit } });
        this.memoryUsage = memoryUsage;
        this.memoryLimit = memoryLimit;
        this.name = 'WASMMemoryError';
    }
}
export class SystemError extends BaseClaudeZenError {
    code;
    constructor(message, code, severity = 'high', context = {}) {
        super(message, 'System', severity, { ...context, metadata: { code } });
        this.code = code;
        this.name = 'SystemError';
    }
}
export class ValidationError extends BaseClaudeZenError {
    field;
    expectedValue;
    actualValue;
    constructor(message, field, expectedValue, actualValue) {
        super(message, 'Validation', 'medium', {
            metadata: { field, expectedValue, actualValue },
        });
        this.field = field;
        this.expectedValue = expectedValue;
        this.actualValue = actualValue;
        this.name = 'ValidationError';
    }
}
export class NotFoundError extends BaseClaudeZenError {
    resource;
    resourceId;
    constructor(message, resource, resourceId) {
        super(message, 'NotFound', 'medium', {
            metadata: { resource, resourceId },
        });
        this.resource = resource;
        this.resourceId = resourceId;
        this.name = 'NotFoundError';
    }
}
export class TimeoutError extends BaseClaudeZenError {
    timeoutMs;
    actualTimeMs;
    constructor(message, timeoutMs, actualTimeMs, severity = 'high') {
        super(message, 'Timeout', severity, { metadata: { timeoutMs, actualTimeMs } }, false);
        this.timeoutMs = timeoutMs;
        this.actualTimeMs = actualTimeMs;
        this.name = 'TimeoutError';
    }
}
export class ConfigurationError extends BaseClaudeZenError {
    configKey;
    configValue;
    constructor(message, configKey, configValue) {
        super(message, 'Configuration', 'high', { metadata: { configKey, configValue } }, false);
        this.configKey = configKey;
        this.configValue = configValue;
        this.name = 'ConfigurationError';
    }
}
export class NetworkError extends BaseClaudeZenError {
    statusCode;
    endpoint;
    constructor(message, statusCode, endpoint, severity = 'medium') {
        super(message, 'Network', severity, { metadata: { statusCode, endpoint } });
        this.statusCode = statusCode;
        this.endpoint = endpoint;
        this.name = 'NetworkError';
    }
}
export class TaskError extends BaseClaudeZenError {
    taskId;
    taskType;
    constructor(message, taskId, taskType, severity = 'medium') {
        super(message, 'Task', severity, { metadata: { taskId, taskType } });
        this.taskId = taskId;
        this.taskType = taskType;
        this.name = 'TaskError';
    }
}
export class StorageError extends BaseClaudeZenError {
    storageType;
    operation;
    constructor(message, storageType, operation, severity = 'high') {
        super(message, 'Storage', severity, {
            operation,
            metadata: { storageType },
        });
        this.storageType = storageType;
        this.operation = operation;
        this.name = 'StorageError';
    }
}
export class DatabaseError extends StorageError {
    query;
    connectionId;
    constructor(message, query, connectionId, severity = 'high') {
        super(message, 'sqlite', 'database', severity);
        this.query = query;
        this.connectionId = connectionId;
        this.context.metadata = { ...this.context.metadata, query, connectionId };
        this.name = 'DatabaseError';
    }
}
export class TransactionError extends DatabaseError {
    transactionId;
    rollbackSuccess;
    constructor(message, transactionId, rollbackSuccess = false) {
        super(message, undefined, undefined, 'critical');
        this.transactionId = transactionId;
        this.rollbackSuccess = rollbackSuccess;
        this.context.metadata = {
            ...this.context.metadata,
            transactionId,
            rollbackSuccess,
        };
        this.name = 'TransactionError';
    }
}
export function isRecoverableError(error) {
    if (error instanceof BaseClaudeZenError) {
        return error.recoverable;
    }
    return !(error instanceof TypeError ||
        error instanceof ReferenceError ||
        error.message.includes('out of memory') ||
        error.message.includes('segmentation fault'));
}
export function getErrorSeverity(error) {
    if (error instanceof BaseClaudeZenError) {
        return error.severity;
    }
    if (error.message.includes('timeout') || error.message.includes('network')) {
        return 'medium';
    }
    if (error.message.includes('memory') || error.message.includes('critical')) {
        return 'critical';
    }
    return 'high';
}
export function shouldRetry(error, attempt, maxRetries = 3) {
    if (attempt >= maxRetries)
        return false;
    if (!isRecoverableError(error))
        return false;
    if (error instanceof ValidationError || error instanceof ConfigurationError) {
        return false;
    }
    return true;
}
//# sourceMappingURL=errors.js.map