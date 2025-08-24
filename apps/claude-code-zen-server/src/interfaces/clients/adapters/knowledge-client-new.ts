/**
 * Knowledge Client Adapter for UACL
 * 
 * Provides specialized client interface for knowledge management systems,
 * vector databases, and semantic search engines.
 */

import { EventEmitter } from 'events';
import { getLogger } from '@claude-zen/foundation';
import type {
  BaseClientAdapter,
  ClientConfig,
  ClientErrorDetails,
  ClientResponse,
  ClientCapabilities,
  ClientRequest,
  RequestMetadata
} from '../core/interfaces';
import type { ProtocolType } from '../types';
import {
  ClientStatuses,
  ProtocolTypes
} from '../types';

const logger = getLogger('KnowledgeClientAdapter');

/**
 * Knowledge client specific interfaces for UACL integration.
 */
export interface KnowledgeQueryOptions {
  includeMetadata?: boolean;
  timeout?: number;
  filters?: Record<string, unknown>;
}

export interface KnowledgeSearchOptions {
  query: string;
  limit?: number;
  threshold?: number;
  includeEmbeddings?: boolean;
  namespace?: string;
}

export interface KnowledgeEntry {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
  score?: number;
}

export interface KnowledgeQueryResult {
  entries: KnowledgeEntry[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}

export interface KnowledgeIndexOptions {
  namespace?: string;
  batchSize?: number;
  overwrite?: boolean;
}

export interface KnowledgeClientConfig extends ClientConfig {
  apiKey?: string;
  endpoint: string;
  namespace?: string;
  indexName?: string;
  dimensions?: number;
  metric?: 'cosine' | 'euclidean' | 'dotproduct';
  maxRetries?: number;
  timeout?: number;
}

/**
 * Knowledge Client Adapter
 * 
 * Handles connections to various knowledge management systems including:
 * - Vector databases (Pinecone, Weaviate, Chroma)
 * - Semantic search engines
 * - Knowledge graphs
 * - Document stores with vector capabilities
 */
export class KnowledgeClientAdapter extends EventEmitter implements BaseClientAdapter {
  private config: KnowledgeClientConfig;
  private isConnected = false;
  private requestQueue: Array<{ request: ClientRequest; resolve: (value: any) => void; reject: (reason?: any) => void }> = [];
  private activeRequests = 0;
  private connectionRetries = 0;
  private maxConnectionRetries = 3;

  constructor(config: KnowledgeClientConfig) {
    super();
    this.config = {
      maxRetries: 3,
      timeout: 30000,
      ...config
    };
  }

  /**
   * Connect to the knowledge management system
   */
  async connect(): Promise<void> {
    try {
      logger.info('Connecting to knowledge system', { endpoint: this.config.endpoint });
      
      // Validate configuration
      if (!this.config.endpoint) {
        throw new Error('Knowledge system endpoint is required');
      }

      // Initialize connection logic here
      await this.initializeConnection();
      
      this.isConnected = true;
      this.connectionRetries = 0;
      
      this.emit('connected');
      logger.info('Successfully connected to knowledge system');
      
    } catch (error) {
      this.connectionRetries++;
      logger.error('Failed to connect to knowledge system', error);
      
      if (this.connectionRetries <= this.maxConnectionRetries) {
        const delay = Math.pow(2, this.connectionRetries) * 1000;
        setTimeout(() => this.connect(), delay);
      } else {
        this.emit('error', error);
        throw error;
      }
    }
  }

  /**
   * Disconnect from the knowledge management system
   */
  async disconnect(): Promise<void> {
    try {
      logger.info('Disconnecting from knowledge system');
      
      // Wait for active requests to complete
      while (this.activeRequests > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.isConnected = false;
      this.emit('disconnected');
      logger.info('Disconnected from knowledge system');
      
    } catch (error) {
      logger.error('Error during knowledge system disconnect', error);
      throw error;
    }
  }

  /**
   * Send a request to the knowledge system
   */
  async request<TRequest, TResponse>(
    request: ClientRequest<TRequest>
  ): Promise<ClientResponse<TResponse>> {
    if (!this.isConnected) {
      throw new Error('Knowledge client is not connected');
    }

    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Query the knowledge base
   */
  async query(
    query: string,
    options: KnowledgeQueryOptions = {}
  ): Promise<KnowledgeQueryResult> {
    const request: ClientRequest = {
      id: this.generateRequestId(),
      method: 'query',
      data: { query, options },
      timestamp: Date.now()
    };

    const response = await this.request<any, KnowledgeQueryResult>(request);
    return response.data;
  }

  /**
   * Perform semantic search
   */
  async search(options: KnowledgeSearchOptions): Promise<KnowledgeQueryResult> {
    const request: ClientRequest = {
      id: this.generateRequestId(),
      method: 'search',
      data: options,
      timestamp: Date.now()
    };

    const response = await this.request<any, KnowledgeQueryResult>(request);
    return response.data;
  }

  /**
   * Index new entries in the knowledge base
   */
  async index(
    entries: KnowledgeEntry[],
    options: KnowledgeIndexOptions = {}
  ): Promise<{ success: boolean; indexed: number }> {
    const request: ClientRequest = {
      id: this.generateRequestId(),
      method: 'index',
      data: { entries, options },
      timestamp: Date.now()
    };

    const response = await this.request(request);
    return response.data;
  }

  /**
   * Delete entries from the knowledge base
   */
  async delete(ids: string[]): Promise<{ success: boolean; deleted: number }> {
    const request: ClientRequest = {
      id: this.generateRequestId(),
      method: 'delete',
      data: { ids },
      timestamp: Date.now()
    };

    const response = await this.request(request);
    return response.data;
  }

  /**
   * Get client capabilities
   */
  getCapabilities(): ClientCapabilities {
    return {
      protocols: [ProtocolTypes.HTTP, ProtocolTypes.WEBSOCKET],
      features: [
        'vector-search',
        'semantic-query',
        'metadata-filtering',
        'batch-indexing',
        'real-time-updates'
      ],
      limits: {
        maxRequestSize: 10 * 1024 * 1024, // 10MB
        maxBatchSize: 1000,
        rateLimits: {
          requests: 100,
          window: 60000 // per minute
        }
      }
    };
  }

  /**
   * Get current client status
   */
  getStatus(): string {
    if (this.isConnected) {
      return ClientStatuses.CONNECTED;
    } else if (this.connectionRetries > 0) {
      return ClientStatuses.CONNECTING;
    } else {
      return ClientStatuses.DISCONNECTED;
    }
  }

  /**
   * Check if client supports a specific protocol
   */
  supportsProtocol(protocol: ProtocolType): boolean {
    const capabilities = this.getCapabilities();
    return capabilities.protocols.includes(protocol);
  }

  /**
   * Initialize the connection to knowledge system
   */
  private async initializeConnection(): Promise<void> {
    // Implementation depends on the specific knowledge system
    // This is a placeholder for the actual connection logic
    
    // Example: HTTP health check
    try {
      const healthEndpoint = `${this.config.endpoint}/health`;
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to initialize knowledge system connection: ${error.message}`);
    }
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0 || this.activeRequests >= 10) {
      return;
    }

    const { request, resolve, reject } = this.requestQueue.shift()!;
    this.activeRequests++;

    try {
      const response = await this.executeRequest(request);
      resolve(response);
    } catch (error) {
      reject(error);
    } finally {
      this.activeRequests--;
      // Process next request in queue
      if (this.requestQueue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  /**
   * Execute a single request
   */
  private async executeRequest<TRequest, TResponse>(
    request: ClientRequest<TRequest>
  ): Promise<ClientResponse<TResponse>> {
    const startTime = Date.now();
    
    try {
      // Build request URL and options based on method
      const url = this.buildRequestUrl(request);
      const options = this.buildRequestOptions(request);
      
      // Make the actual HTTP request
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });
      
      if (!response.ok) {
        const errorDetails: ClientErrorDetails = {
          code: response.status,
          message: response.statusText,
          details: await response.text()
        };
        throw new Error(`Request failed: ${errorDetails.message}`);
      }
      
      const responseData = await response.json();
      const duration = Date.now() - startTime;
      
      return {
        id: request.id,
        status: 'success',
        data: responseData,
        metadata: {
          requestId: request.id,
          duration,
          timestamp: Date.now()
        }
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      throw new Error(`Knowledge request failed: ${error.message}`, {
        cause: {
          requestId: request.id,
          duration,
          originalError: error
        }
      });
    }
  }

  /**
   * Build request URL based on method and data
   */
  private buildRequestUrl(request: ClientRequest): string {
    const baseUrl = this.config.endpoint.replace(/\/$/, ''); // Remove trailing slash
    
    switch (request.method) {
      case 'query':
        return `${baseUrl}/query`;
      case 'search':
        return `${baseUrl}/search`;
      case 'index':
        return `${baseUrl}/index`;
      case 'delete':
        return `${baseUrl}/delete`;
      default:
        return `${baseUrl}/${request.method}`;
    }
  }

  /**
   * Build request options for fetch
   */
  private buildRequestOptions(request: ClientRequest): RequestInit {
    return {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.data)
    };
  }

  /**
   * Get common headers for all requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'KnowledgeClientAdapter/1.0.0',
      'Accept': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    if (this.config.namespace) {
      headers['X-Namespace'] = this.config.namespace;
    }

    return headers;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default KnowledgeClientAdapter;