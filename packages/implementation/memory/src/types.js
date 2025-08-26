/**
 * @fileoverview Memory Domain Types - Single Source of Truth
 *
 * All memory-related types, interfaces, and configurations.
 * Following Google TypeScript style guide and domain architecture standard.
 */
// Re-export foundation error types and create memory-specific errors
export {
	ConfigurationError,
	ContextError,
	err,
	NetworkError,
	ok,
	ResourceError,
	Result,
	safe,
	safeAsync,
	TimeoutError,
	ValidationError,
	withContext,
	withRetry,
	withTimeout,
} from "@claude-zen/foundation";

import { ContextError } from "@claude-zen/foundation";
// Memory-specific error types extending foundation's ContextError
export class MemoryError extends ContextError {
	constructor(message, context = {}, code = "MEMORY_ERROR") {
		super(message, context, code);
		this.name = "MemoryError";
	}
}
export class MemoryConnectionError extends MemoryError {
	constructor(message, backend, context = {}) {
		super(message, { ...context, backend }, "MEMORY_CONNECTION_ERROR");
		this.name = "MemoryConnectionError";
	}
}
export class MemoryStorageError extends MemoryError {
	constructor(message, context = {}) {
		super(message, context, "MEMORY_STORAGE_ERROR");
		this.name = "MemoryStorageError";
	}
}
export class MemoryCapacityError extends MemoryError {
	constructor(message, currentSize, maxSize, context = {}) {
		super(
			message,
			{ ...context, currentSize, maxSize },
			"MEMORY_CAPACITY_ERROR",
		);
		this.name = "MemoryCapacityError";
	}
}
