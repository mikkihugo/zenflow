/**
 * @fileoverview DSPy Service Layer - @claude-zen/foundation Integration
 * 
 * Service layer that manages @claude-zen/foundation integration for DSPy operations.
 * Provides centralized access to LLM services, storage, logging, and configuration.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

// Direct foundation imports for proper integration
import {
  getGlobalLLM,          // Re-enabled in foundation
  type LLMProvider,      // Re-enabled in foundation
  getLogger,
  type Logger,
  getConfig,
  type Config
} from '@claude-zen/foundation';

// Database access from infrastructure facade
import {
  getDatabaseAccess,
  type DatabaseAccess
} from '@claude-zen/infrastructure';

// Legacy interfaces for backward compatibility
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

// Types exported at end of file

/**
 * DSPy Service - Central coordinator for @claude-zen/foundation integration
 */
export class DSPyService {
  private llmProvider: LLMProvider | null = null;
  private dbAccess: DatabaseAccess | null = null;
  private logger: Logger;
  private config: Config | null = null;
  private initialized = false;

  constructor() {
    // Initialize with foundation logger
    this.logger = getLogger('dspy-service');
    this.logger.info('DSPy Service initializing with @claude-zen/foundation integration');
  }

  /**
   * Initialize DSPy service with @claude-zen/foundation
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.debug('DSPy service already initialized');
      return;
    }

    try {
      // Initialize foundation components
      this.llmProvider = getGlobalLLM();
      this.dbAccess = getDatabaseAccess();
      this.config = getConfig();
      
      this.initialized = true;
      this.logger.info('DSPy service successfully initialized with @claude-zen/foundation');
    } catch (error) {
      this.logger.error('Failed to initialize DSPy service with foundation:', error);
      throw error;
    }
  }

  /**
   * Get LLM provider for DSPy operations
   */
  async getLLMProvider(): Promise<LLMProvider> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.llmProvider) {
      throw new Error('LLM provider not available - foundation not properly initialized');
    }
    
    return this.llmProvider;
  }

  /**
   * Execute DSPy prompt with foundation LLM
   */
  async executePrompt(prompt: string, options: {
    temperature?: number;
    maxTokens?: number;
    role?: 'user' | 'analyst' | 'architect';
  } = {}): Promise<string> {
    const llm = await this.getLLMProvider();
    
    // DSPy should use 'analyst' role by default (not 'coder' which is for tool access)
    // DSPy is pure LLM operations for prompt optimization, no tool access needed
    const dspyRole = options.role || 'analyst';
    llm.setRole(dspyRole);
    
    this.logger.debug('Executing DSPy prompt via foundation LLM', { 
      promptLength: prompt.length,
      role: dspyRole,
      options 
    });
    
    try {
      const result = await llm.complete(prompt, {
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 16384 // 16K default for DSPy operations
      });
      
      this.logger.debug('DSPy prompt execution completed', {
        resultLength: result.length,
        role: dspyRole
      });
      
      return result;
    } catch (error) {
      this.logger.error('DSPy prompt execution failed:', error);
      throw error;
    }
  }

  /**
   * Get storage for DSPy operations
   */
  async getStorage(): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.dbAccess) {
      throw new Error('Database access not available - foundation not properly initialized');
    }
    
    try {
      // Get DSPy-specific KV storage from foundation
      const kvStorage = await this.dbAccess.getKV('dspy');
      this.logger.debug('DSPy storage initialized via foundation database access');
      return kvStorage;
    } catch (error) {
      this.logger.error('Failed to get DSPy storage from foundation:', error);
      throw error;
    }
  }

  /**
   * Get logger for DSPy operations
   */
  getLogger(): SharedLogger {
    return this.logger;
  }

  /**
   * Get LLM service (backward compatibility wrapper)
   */
  async getLLMService(): Promise<SharedLLMService> {
    const llmProvider = await this.getLLMProvider();
    
    return {
      async analyze(prompt: string, options?: any): Promise<string> {
        return llmProvider.complete(prompt, {
          temperature: options?.temperature || 0.7,
          maxTokens: options?.maxTokens || 16384 // 16K for backward compatibility
        });
      },
      
      async createLLMProvider(): Promise<any> {
        return llmProvider;
      }
    };
  }

  /**
   * Get configuration
   */
  getConfig(): Config {
    if (!this.initialized) {
      throw new Error('DSPy service not initialized - call initialize() first');
    }
    
    if (this.config) {
      return this.config;
    }
    
    // If config not available, throw error - DSPy requires foundation
    throw new Error('Configuration not available - foundation not properly initialized');
  }

}

/**
 * Singleton DSPy service instance
 */
let dspyServiceInstance: DSPyService | null = null;

/**
 * Get the singleton DSPy service instance
 */
export async function getDSPyService(): Promise<DSPyService> {
  if (!dspyServiceInstance) {
    dspyServiceInstance = new DSPyService();
    await dspyServiceInstance.initialize();
  }
  return dspyServiceInstance;
}

/**
 * Initialize DSPy service (call this early in your application)
 */
export async function initializeDSPyService(): Promise<DSPyService> {
  const service = await getDSPyService();
  await service.initialize();
  return service;
}

// Export types
export type {
  SharedLLMService,
  SharedStorage,
  SharedLogger,
  Config,
  SharedModule
};