/**
 * Custom error types for Claude-Flow
 */
/**
 * Base error class for all Claude-Flow errors
 */
export class ClaudeFlowError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ClaudeFlowError';
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            stack: this.stack,
        };
    }
}
/**
 * Terminal-related errors
 */
export class TerminalError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'TERMINAL_ERROR', details);
        this.name = 'TerminalError';
    }
}
export class TerminalSpawnError extends TerminalError {
    constructor(message, details) {
        super(message, details);
        this.code = 'TERMINAL_SPAWN_ERROR';
    }
}
export class TerminalCommandError extends TerminalError {
    constructor(message, details) {
        super(message, details);
        this.code = 'TERMINAL_COMMAND_ERROR';
    }
}
/**
 * Memory-related errors
 */
export class MemoryError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'MEMORY_ERROR', details);
        this.name = 'MemoryError';
    }
}
export class MemoryBackendError extends MemoryError {
    constructor(message, details) {
        super(message, details);
        this.code = 'MEMORY_BACKEND_ERROR';
    }
}
export class MemoryConflictError extends MemoryError {
    constructor(message, details) {
        super(message, details);
        this.code = 'MEMORY_CONFLICT_ERROR';
    }
}
/**
 * Coordination-related errors
 */
export class CoordinationError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'COORDINATION_ERROR', details);
        this.name = 'CoordinationError';
    }
}
export class DeadlockError extends CoordinationError {
    constructor(message, agents, resources) {
        super(message, { agents, resources });
        this.agents = agents;
        this.resources = resources;
        this.code = 'DEADLOCK_ERROR';
    }
}
export class ResourceLockError extends CoordinationError {
    constructor(message, details) {
        super(message, details);
        this.code = 'RESOURCE_LOCK_ERROR';
    }
}
/**
 * MCP-related errors
 */
export class MCPError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'MCP_ERROR', details);
        this.name = 'MCPError';
    }
}
export class MCPTransportError extends MCPError {
    constructor(message, details) {
        super(message, details);
        this.code = 'MCP_TRANSPORT_ERROR';
    }
}
export class MCPMethodNotFoundError extends MCPError {
    constructor(method) {
        super(`Method not found: ${method}`, { method });
        this.code = 'MCP_METHOD_NOT_FOUND';
    }
}
/**
 * Configuration errors
 */
export class ConfigError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'CONFIG_ERROR', details);
        this.name = 'ConfigError';
    }
}
export class ValidationError extends ConfigError {
    constructor(message, details) {
        super(message, details);
        this.code = 'VALIDATION_ERROR';
    }
}
/**
 * Task-related errors
 */
export class TaskError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'TASK_ERROR', details);
        this.name = 'TaskError';
    }
}
export class TaskTimeoutError extends TaskError {
    constructor(taskId, timeout) {
        super(`Task ${taskId} timed out after ${timeout}ms`, { taskId, timeout });
        this.code = 'TASK_TIMEOUT_ERROR';
    }
}
export class TaskDependencyError extends TaskError {
    constructor(taskId, dependencies) {
        super(`Task ${taskId} has unmet dependencies`, { taskId, dependencies });
        this.code = 'TASK_DEPENDENCY_ERROR';
    }
}
/**
 * System errors
 */
export class SystemError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'SYSTEM_ERROR', details);
        this.name = 'SystemError';
    }
}
export class InitializationError extends SystemError {
    constructor(componentOrMessage, details) {
        // If the message already contains the word "initialize", use it as-is
        const message = componentOrMessage.includes('initialize')
            ? componentOrMessage
            : `Failed to initialize ${componentOrMessage}`;
        super(message, details ? { component: componentOrMessage, ...details } : { component: componentOrMessage });
        this.code = 'INITIALIZATION_ERROR';
    }
}
export class ShutdownError extends SystemError {
    constructor(message, details) {
        super(message, details);
        this.code = 'SHUTDOWN_ERROR';
    }
}
/**
 * Error utilities
 */
export function isClaudeFlowError(error) {
    return error instanceof ClaudeFlowError;
}
export function formatError(error) {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}`;
    }
    return String(error);
}
export function getErrorDetails(error) {
    if (isClaudeFlowError(error)) {
        return error.details;
    }
    return undefined;
}
