/**
 * @fileoverview Memory Domain Types - Single Source of Truth
 *
 * All memory-related types, interfaces, and configurations.
 * Following Google TypeScript style guide and domain architecture standard.
 */
// Error types
export class MemoryError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'MemoryError';
    }
}
export class MemoryConnectionError extends MemoryError {
    backend;
    constructor(message, backend) {
        super(message, 'MEMORY_CONNECTION_ERROR');
        this.backend = backend;
        this.name = 'MemoryConnectionError';
    }
}
export class MemoryStorageError extends MemoryError {
    key;
    operation;
    constructor(message, key, operation) {
        super(message, 'MEMORY_STORAGE_ERROR');
        this.key = key;
        this.operation = operation;
        this.name = 'MemoryStorageError';
    }
}
export class MemoryCapacityError extends MemoryError {
    currentSize;
    maxSize;
    constructor(message, currentSize, maxSize) {
        super(message, 'MEMORY_CAPACITY_ERROR');
        this.currentSize = currentSize;
        this.maxSize = maxSize;
        this.name = 'MemoryCapacityError';
    }
}
//# sourceMappingURL=types.js.map