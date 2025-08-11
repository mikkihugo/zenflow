/**
 * Unified Memory System Stub.
 *
 * Simple stub implementation for compatibility with existing test files.
 */
/**
 * @file Unified-memory-system implementation.
 */
export interface MemoryConfig {
    backend?: string;
    capacity?: number;
}
export declare class MemorySystem {
    private config;
    private storage;
    constructor(config?: UnifiedMemoryConfig);
    initialize(): Promise<void>;
    store(key: string, value: any): Promise<void>;
    retrieve(key: string): Promise<any>;
    clear(): Promise<void>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=unified-memory-system.d.ts.map