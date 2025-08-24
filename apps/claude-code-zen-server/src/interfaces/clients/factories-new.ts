/**
 * UACL Client Factories
 * 
 * Factory implementations for creating different types of clients
 * with consistent interface, error handling, and resource management.
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  Client,
  ClientFactory,
  ClientConfig
} from './core/interfaces';
import type { ProtocolType } from './types';
import { ProtocolTypes } from './types';
import { ClientRegistry } from './core/client-registry';

const logger = getLogger('UACLFactories');

/**
 * Factory configuration for client creation
 */
export interface ClientFactoryConfig {
  /** Type of client to create */
  clientType: 'http' | 'websocket' | 'knowledge' | 'mcp';
  
  /** Protocol to use */
  protocol: ProtocolType;
  
  /** Connection URL or endpoint */
  url?: string;
  
  /** Client ID for tracking */
  id?: string;
  
  /** Configuration options */
  options?: Record<string, any>;
  
  /** Factory metadata */
  metadata?: Record<string, any>;
  
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Client type mapping for type safety
 */
export interface ClientTypeMap<T = any> {
  client: T;
  id: string;
  type: string;
  protocol: ProtocolType;
  metadata: Record<string, any>;
}

/**
 * Factory transaction for tracking client creation
 */
export interface ClientTransaction {
  id: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'success' | 'error';
  error?: Error;
  config: ClientFactoryConfig;
  result?: ClientTypeMap;
}

/**
 * Abstract base factory for all client types
 */
export abstract class BaseClientFactory implements ClientFactory {
  protected logger = getLogger(this.constructor.name);

  abstract create(protocol: ProtocolType, config: ClientConfig): Promise<Client>;
  
  abstract supportsProtocol(protocol: ProtocolType): boolean;
  
  abstract getSupportedProtocols(): ProtocolType[];

  /**
   * Validate client configuration
   */
  protected validateConfig(config: ClientConfig): void {
    if (!config) {
      throw new Error('Client configuration is required');
    }
    
    if (typeof config !== 'object') {
      throw new Error('Client configuration must be an object');
    }
  }

  /**
   * Create client with error handling
   */
  protected async createWithErrorHandling<T extends Client>(
    protocol: ProtocolType,
    config: ClientConfig,
    createFn: () => Promise<T>
  ): Promise<T> {
    this.validateConfig(config);
    
    if (!this.supportsProtocol(protocol)) {
      throw new Error(`Protocol '${protocol}' is not supported by ${this.constructor.name}`);
    }

    try {
      this.logger.info('Creating client', { protocol, factoryType: this.constructor.name });
      const client = await createFn();
      this.logger.info('Client created successfully', { protocol, factoryType: this.constructor.name });
      return client;
    } catch (error) {
      this.logger.error('Failed to create client', { protocol, factoryType: this.constructor.name, error });
      throw error;
    }
  }
}

/**
 * HTTP Client Factory
 */
export class HTTPClientFactory extends BaseClientFactory {
  async create(protocol: ProtocolType, config: ClientConfig): Promise<Client> {
    return this.createWithErrorHandling(protocol, config, async () => {
      const { HTTPClientAdapter } = await import('./adapters/http-client-adapter');
      return new HTTPClientAdapter(config);
    });
  }

  supportsProtocol(protocol: ProtocolType): boolean {
    return protocol === ProtocolTypes.HTTP;
  }

  getSupportedProtocols(): ProtocolType[] {
    return [ProtocolTypes.HTTP];
  }
}

/**
 * WebSocket Client Factory
 */
export class WebSocketClientFactory extends BaseClientFactory {
  async create(protocol: ProtocolType, config: ClientConfig): Promise<Client> {
    return this.createWithErrorHandling(protocol, config, async () => {
      const { WebSocketClientAdapter } = await import('./adapters/websocket-client-adapter');
      return new WebSocketClientAdapter(config);
    });
  }

  supportsProtocol(protocol: ProtocolType): boolean {
    return protocol === ProtocolTypes.WEBSOCKET;
  }

  getSupportedProtocols(): ProtocolType[] {
    return [ProtocolTypes.WEBSOCKET];
  }
}

/**
 * Knowledge Client Factory
 */
export class KnowledgeClientFactory extends BaseClientFactory {
  async create(protocol: ProtocolType, config: ClientConfig): Promise<Client> {
    return this.createWithErrorHandling(protocol, config, async () => {
      const { KnowledgeClientAdapter } = await import('./adapters/knowledge-client-adapter');
      return new KnowledgeClientAdapter(config);
    });
  }

  supportsProtocol(protocol: ProtocolType): boolean {
    return protocol === ProtocolTypes.KNOWLEDGE;
  }

  getSupportedProtocols(): ProtocolType[] {
    return [ProtocolTypes.KNOWLEDGE];
  }
}

/**
 * Universal Client Factory Manager
 * 
 * Manages multiple factory instances and provides unified interface
 * for creating clients of any supported type.
 */
export class UACLFactory {
  private factories = new Map<ProtocolType, ClientFactory>();
  private clientRegistry = new ClientRegistry();
  private transactionLog = new Map<string, ClientTransaction>();

  constructor() {
    this.initializeFactories();
  }

  /**
   * Initialize built-in factories
   */
  private initializeFactories(): void {
    logger.info('Initializing UACL factories');
    
    // Register built-in factories
    this.registerFactory(ProtocolTypes.HTTP, new HTTPClientFactory());
    this.registerFactory(ProtocolTypes.WEBSOCKET, new WebSocketClientFactory());
    this.registerFactory(ProtocolTypes.KNOWLEDGE, new KnowledgeClientFactory());
    
    logger.info('UACL factories initialized', { 
      count: this.factories.size,
      protocols: Array.from(this.factories.keys())
    });
  }

  /**
   * Register a factory for a protocol
   */
  registerFactory(protocol: ProtocolType, factory: ClientFactory): void {
    if (this.factories.has(protocol)) {
      logger.warn('Overriding existing factory for protocol', { protocol });
    }
    
    this.factories.set(protocol, factory);
    this.clientRegistry.registerFactory(`${protocol}-factory`, factory);
    logger.info('Registered factory', { protocol, factoryType: factory.constructor.name });
  }

  /**
   * Unregister a factory for a protocol
   */
  unregisterFactory(protocol: ProtocolType): boolean {
    const factory = this.factories.get(protocol);
    if (!factory) {
      return false;
    }
    
    this.factories.delete(protocol);
    this.clientRegistry.unregisterFactory(`${protocol}-factory`);
    logger.info('Unregistered factory', { protocol });
    return true;
  }

  /**
   * Create a client instance
   */
  async createClient<T = any>(
    factoryConfig: ClientFactoryConfig
  ): Promise<ClientTypeMap<T>> {
    const transactionId = this.generateTransactionId();
    const transaction: ClientTransaction = {
      id: transactionId,
      startTime: Date.now(),
      status: 'pending',
      config: factoryConfig
    };
    
    this.transactionLog.set(transactionId, transaction);
    
    try {
      logger.info('Creating client via factory', { 
        transactionId,
        clientType: factoryConfig.clientType,
        protocol: factoryConfig.protocol 
      });
      
      const factory = this.factories.get(factoryConfig.protocol);
      if (!factory) {
        throw new Error(`No factory registered for protocol: ${factoryConfig.protocol}`);
      }

      // Prepare client configuration
      const clientConfig: ClientConfig = {
        url: factoryConfig.url,
        ...factoryConfig.options
      };

      // Create client using factory
      const client = await factory.create(factoryConfig.protocol, clientConfig);
      
      // Generate client ID
      const clientId = factoryConfig.id || this.generateClientId(factoryConfig.clientType);
      
      // Register client in registry
      this.clientRegistry.registerClient(
        clientId,
        client,
        clientConfig,
        factoryConfig.protocol,
        {
          factory,
          tags: factoryConfig.tags,
          metadata: factoryConfig.metadata
        }
      );

      // Create result
      const result: ClientTypeMap<T> = {
        client: client as T,
        id: clientId,
        type: factoryConfig.clientType,
        protocol: factoryConfig.protocol,
        metadata: factoryConfig.metadata || {}
      };

      // Update transaction
      transaction.status = 'success';
      transaction.endTime = Date.now();
      transaction.result = result;

      logger.info('Client created successfully via factory', {
        transactionId,
        clientId,
        clientType: factoryConfig.clientType,
        duration: transaction.endTime - transaction.startTime
      });

      return result;

    } catch (error) {
      transaction.status = 'error';
      transaction.endTime = Date.now();
      transaction.error = error instanceof Error ? error : new Error(String(error));

      logger.error('Failed to create client via factory', {
        transactionId,
        clientType: factoryConfig.clientType,
        protocol: factoryConfig.protocol,
        error,
        duration: transaction.endTime - transaction.startTime
      });

      throw error;
    }
  }

  /**
   * Get factory for protocol
   */
  getFactory(protocol: ProtocolType): ClientFactory | undefined {
    return this.factories.get(protocol);
  }

  /**
   * Get all supported protocols
   */
  getSupportedProtocols(): ProtocolType[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Check if protocol is supported
   */
  supportsProtocol(protocol: ProtocolType): boolean {
    return this.factories.has(protocol);
  }

  /**
   * Get client registry
   */
  getClientRegistry(): ClientRegistry {
    return this.clientRegistry;
  }

  /**
   * Get transaction log
   */
  getTransactionLog(): Map<string, ClientTransaction> {
    return new Map(this.transactionLog);
  }

  /**
   * Get transaction by ID
   */
  getTransaction(id: string): ClientTransaction | undefined {
    return this.transactionLog.get(id);
  }

  /**
   * Clear completed transactions (cleanup)
   */
  clearTransactionLog(olderThan?: number): number {
    const cutoff = olderThan || Date.now() - 3600000; // 1 hour ago
    let cleared = 0;

    for (const [id, transaction] of this.transactionLog) {
      if (transaction.endTime && transaction.endTime < cutoff) {
        this.transactionLog.delete(id);
        cleared++;
      }
    }

    if (cleared > 0) {
      logger.info('Cleared transaction log entries', { cleared, remaining: this.transactionLog.size });
    }

    return cleared;
  }

  /**
   * Shutdown factory and cleanup resources
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down UACL factory');
    
    // Shutdown client registry
    await this.clientRegistry.shutdown();
    
    // Clear factories
    this.factories.clear();
    
    // Clear transaction log
    this.transactionLog.clear();
    
    logger.info('UACL factory shutdown complete');
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(clientType: string): string {
    return `${clientType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global factory instance
export const globalUACLFactory = new UACLFactory();

/**
 * Convenience functions for client creation
 */
export async function createHTTPClient(config: ClientConfig, options?: { id?: string; tags?: string[] }) {
  return globalUACLFactory.createClient({
    clientType: 'http',
    protocol: ProtocolTypes.HTTP,
    url: config.url,
    id: options?.id,
    options: config,
    tags: options?.tags
  });
}

export async function createWebSocketClient(config: ClientConfig, options?: { id?: string; tags?: string[] }) {
  return globalUACLFactory.createClient({
    clientType: 'websocket',
    protocol: ProtocolTypes.WEBSOCKET,
    url: config.url,
    id: options?.id,
    options: config,
    tags: options?.tags
  });
}

export async function createKnowledgeClient(config: ClientConfig, options?: { id?: string; tags?: string[] }) {
  return globalUACLFactory.createClient({
    clientType: 'knowledge',
    protocol: ProtocolTypes.KNOWLEDGE,
    url: config.url,
    id: options?.id,
    options: config,
    tags: options?.tags
  });
}

export default {
  UACLFactory,
  HTTPClientFactory,
  WebSocketClientFactory,
  KnowledgeClientFactory,
  globalUACLFactory,
  createHTTPClient,
  createWebSocketClient,
  createKnowledgeClient
};