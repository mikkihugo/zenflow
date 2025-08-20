/**
 * @fileoverview DSPy Service Layer - @claude-zen/foundation Integration
 *
 * Service layer that manages @claude-zen/foundation integration for DSPy operations.
 * Provides centralized access to LLM services, storage, logging, and configuration.
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 */
import { type LLMProvider, type Config } from '@claude-zen/foundation';
interface SharedLLMService {
    analyze(prompt: string, options?: any): Promise<string>;
    createLLMProvider(): Promise<any>;
}
interface SharedStorage {
    getLibKV(libName: string): Promise<any>;
}
interface SharedLogger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}
interface SharedModule {
    llm: SharedLLMService;
    storage: SharedStorage;
    logger: SharedLogger;
    config: Config;
}
/**
 * DSPy Service - Central coordinator for @claude-zen/foundation integration
 */
export declare class DSPyService {
    private llmProvider;
    private dbAccess;
    private logger;
    private config;
    private initialized;
    constructor();
    /**
     * Initialize DSPy service with @claude-zen/foundation
     */
    initialize(): Promise<void>;
    /**
     * Get LLM provider for DSPy operations
     */
    getLLMProvider(): Promise<LLMProvider>;
    /**
     * Execute DSPy prompt with foundation LLM
     */
    executePrompt(prompt: string, options?: {
        temperature?: number;
        maxTokens?: number;
        role?: 'user' | 'analyst' | 'architect';
    }): Promise<string>;
    /**
     * Get storage for DSPy operations
     */
    getStorage(): Promise<any>;
    /**
     * Get logger for DSPy operations
     */
    getLogger(): SharedLogger;
    /**
     * Get LLM service (backward compatibility wrapper)
     */
    getLLMService(): Promise<SharedLLMService>;
    /**
     * Get configuration
     */
    getConfig(): Config;
}
/**
 * Get the singleton DSPy service instance
 */
export declare function getDSPyService(): Promise<DSPyService>;
/**
 * Initialize DSPy service (call this early in your application)
 */
export declare function initializeDSPyService(): Promise<DSPyService>;
export type { SharedLLMService, SharedStorage, SharedLogger, Config, SharedModule };
//# sourceMappingURL=service.d.ts.map