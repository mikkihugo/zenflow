"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShutdownError = exports.InitializationError = exports.SystemError = exports.TaskDependencyError = exports.TaskTimeoutError = exports.TaskError = exports.ValidationError = exports.ConfigError = exports.MCPMethodNotFoundError = exports.MCPTransportError = exports.MCPError = exports.ResourceLockError = exports.DeadlockError = exports.CoordinationError = exports.MemoryConflictError = exports.MemoryBackendError = exports.MemoryError = exports.TerminalCommandError = exports.TerminalSpawnError = exports.TerminalError = exports.ClaudeFlowError = void 0;
exports.isClaudeFlowError = isClaudeFlowError;
exports.formatError = formatError;
exports.getErrorDetails = getErrorDetails;
/**
 * Custom error types for Claude-Flow
 */
/**
 * Base error class for all Claude-Flow errors
 */
class ClaudeFlowError extends Error {
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
exports.ClaudeFlowError = ClaudeFlowError;
/**
 * Terminal-related errors
 */
class TerminalError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'TERMINAL_ERROR', details);
        this.name = 'TerminalError';
    }
}
exports.TerminalError = TerminalError;
class TerminalSpawnError extends TerminalError {
    constructor(message, details) {
        super(message, details);
        this.code = 'TERMINAL_SPAWN_ERROR';
    }
}
exports.TerminalSpawnError = TerminalSpawnError;
class TerminalCommandError extends TerminalError {
    constructor(message, details) {
        super(message, details);
        this.code = 'TERMINAL_COMMAND_ERROR';
    }
}
exports.TerminalCommandError = TerminalCommandError;
/**
 * Memory-related errors
 */
class MemoryError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'MEMORY_ERROR', details);
        this.name = 'MemoryError';
    }
}
exports.MemoryError = MemoryError;
class MemoryBackendError extends MemoryError {
    constructor(message, details) {
        super(message, details);
        this.code = 'MEMORY_BACKEND_ERROR';
    }
}
exports.MemoryBackendError = MemoryBackendError;
class MemoryConflictError extends MemoryError {
    constructor(message, details) {
        super(message, details);
        this.code = 'MEMORY_CONFLICT_ERROR';
    }
}
exports.MemoryConflictError = MemoryConflictError;
/**
 * Coordination-related errors
 */
class CoordinationError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'COORDINATION_ERROR', details);
        this.name = 'CoordinationError';
    }
}
exports.CoordinationError = CoordinationError;
class DeadlockError extends CoordinationError {
    constructor(message, agents, resources) {
        super(message, { agents, resources });
        this.agents = agents;
        this.resources = resources;
        this.code = 'DEADLOCK_ERROR';
    }
}
exports.DeadlockError = DeadlockError;
class ResourceLockError extends CoordinationError {
    constructor(message, details) {
        super(message, details);
        this.code = 'RESOURCE_LOCK_ERROR';
    }
}
exports.ResourceLockError = ResourceLockError;
/**
 * MCP-related errors
 */
class MCPError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'MCP_ERROR', details);
        this.name = 'MCPError';
    }
}
exports.MCPError = MCPError;
class MCPTransportError extends MCPError {
    constructor(message, details) {
        super(message, details);
        this.code = 'MCP_TRANSPORT_ERROR';
    }
}
exports.MCPTransportError = MCPTransportError;
class MCPMethodNotFoundError extends MCPError {
    constructor(method) {
        super(`Method not found: ${method}`, { method });
        this.code = 'MCP_METHOD_NOT_FOUND';
    }
}
exports.MCPMethodNotFoundError = MCPMethodNotFoundError;
/**
 * Configuration errors
 */
class ConfigError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'CONFIG_ERROR', details);
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
class ValidationError extends ConfigError {
    constructor(message, details) {
        super(message, details);
        this.code = 'VALIDATION_ERROR';
    }
}
exports.ValidationError = ValidationError;
/**
 * Task-related errors
 */
class TaskError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'TASK_ERROR', details);
        this.name = 'TaskError';
    }
}
exports.TaskError = TaskError;
class TaskTimeoutError extends TaskError {
    constructor(taskId, timeout) {
        super(`Task ${taskId} timed out after ${timeout}ms`, { taskId, timeout });
        this.code = 'TASK_TIMEOUT_ERROR';
    }
}
exports.TaskTimeoutError = TaskTimeoutError;
class TaskDependencyError extends TaskError {
    constructor(taskId, dependencies) {
        super(`Task ${taskId} has unmet dependencies`, { taskId, dependencies });
        this.code = 'TASK_DEPENDENCY_ERROR';
    }
}
exports.TaskDependencyError = TaskDependencyError;
/**
 * System errors
 */
class SystemError extends ClaudeFlowError {
    constructor(message, details) {
        super(message, 'SYSTEM_ERROR', details);
        this.name = 'SystemError';
    }
}
exports.SystemError = SystemError;
class InitializationError extends SystemError {
    constructor(componentOrMessage, details) {
        // If the message already contains the word "initialize", use it as-is
        const message = componentOrMessage.includes('initialize')
            ? componentOrMessage
            : `Failed to initialize ${componentOrMessage}`;
        super(message, details ? { component: componentOrMessage, ...details } : { component: componentOrMessage });
        this.code = 'INITIALIZATION_ERROR';
    }
}
exports.InitializationError = InitializationError;
class ShutdownError extends SystemError {
    constructor(message, details) {
        super(message, details);
        this.code = 'SHUTDOWN_ERROR';
    }
}
exports.ShutdownError = ShutdownError;
/**
 * Error utilities
 */
function isClaudeFlowError(error) {
    return error instanceof ClaudeFlowError;
}
function formatError(error) {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}`;
    }
    return String(error);
}
function getErrorDetails(error) {
    if (isClaudeFlowError(error)) {
        return error.details;
    }
    return undefined;
}
