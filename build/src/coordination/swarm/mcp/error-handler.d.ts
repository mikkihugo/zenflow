/**
 * Unified MCP Error Handler for Coordination and Swarm.
 * Consolidates error handling from the removed coordination/mcp directory.
 */
/**
 * @file Coordination system: error-handler.
 */
export declare class ValidationError extends Error {
    field?: string | undefined;
    constructor(message: string, field?: string);
}
export declare class MCPErrorHandler {
    static handleError(error: any, context?: string): never;
    static validateParameters(params: any, schema: any): void;
    static classifyError(error: Error, context: any): any;
}
export declare class MCPToolWrapper {
    static wrap(toolFn: Function, toolName: string): (params: any) => Promise<any>;
}
export declare class MCPParameterValidator {
    static validate(_params: any, _schema: any): boolean;
    static validateParams(params: any, toolName: string): any;
    static sanitizeInput(input: string): string;
}
export declare class AgentError extends Error {
    agentId?: string | undefined;
    constructor(message: string, agentId?: string | undefined);
}
export declare class NeuralError extends Error {
    modelId?: string | undefined;
    operation?: string | undefined;
    constructor(message: string, modelId?: string | undefined, operation?: string | undefined);
}
export declare class PersistenceError extends Error {
    key?: string | undefined;
    operation?: string | undefined;
    constructor(message: string, key?: string | undefined, operation?: string | undefined);
}
export declare class ResourceError extends Error {
    resourceType?: string | undefined;
    resourceId?: string | undefined;
    constructor(message: string, resourceType?: string | undefined, resourceId?: string | undefined);
}
export declare class SwarmError extends Error {
    swarmId?: string | undefined;
    agentCount?: number | undefined;
    constructor(message: string, swarmId?: string | undefined, agentCount?: number | undefined);
}
export declare class TaskError extends Error {
    taskId?: string | undefined;
    taskType?: string | undefined;
    constructor(message: string, taskId?: string | undefined, taskType?: string | undefined);
}
export declare class WasmError extends Error {
    module?: string | undefined;
    functionName?: string | undefined;
    constructor(message: string, module?: string | undefined, functionName?: string | undefined);
}
export declare class ZenSwarmError extends Error {
    swarmType?: string | undefined;
    coordination?: string | undefined;
    constructor(message: string, swarmType?: string | undefined, coordination?: string | undefined);
}
export interface ErrorContext {
    operation: string;
    timestamp: Date;
    metadata?: Record<string, any> | undefined;
    stackTrace?: string | undefined;
    userId?: string | undefined;
    sessionId?: string | undefined;
}
export declare class ErrorContextFactory {
    static create(operation: string, metadata?: Record<string, any>): ErrorContext;
}
export declare class ErrorFactory {
    static createValidationError(message: string, field?: string): ValidationError;
    static createAgentError(message: string, agentId?: string): AgentError;
    static createNeuralError(message: string, modelId?: string, operation?: string): NeuralError;
    static createPersistenceError(message: string, key?: string, operation?: string): PersistenceError;
    static createResourceError(message: string, resourceType?: string, resourceId?: string): ResourceError;
    static createSwarmError(message: string, swarmId?: string, agentCount?: number): SwarmError;
    static createTaskError(message: string, taskId?: string, taskType?: string): TaskError;
    static createWasmError(message: string, module?: string, functionName?: string): WasmError;
    static createZenSwarmError(message: string, swarmType?: string, coordination?: string): ZenSwarmError;
    static createErrorWithContext(ErrorClass: new (message: string, ...args: any[]) => Error, message: string, context: ErrorContext, ...args: any[]): Error;
    static createError(errorType: string, message: string, metadata?: Record<string, any>): Error;
}
declare const mcpErrorHandler: {
    classifyError: typeof MCPErrorHandler.classifyError;
    handleError: typeof MCPErrorHandler.handleError;
    validateParameters: typeof MCPErrorHandler.validateParameters;
};
export { mcpErrorHandler };
export default mcpErrorHandler;
//# sourceMappingURL=error-handler.d.ts.map