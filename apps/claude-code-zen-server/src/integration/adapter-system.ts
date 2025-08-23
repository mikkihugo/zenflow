/**
 * @file Adapter System for External Integrations
 *
 * Provides a standardized adapter pattern for integrating with external systems,
 * APIs, and services. Handles connection management, data transformation,
 * error handling, and retry logic.
 */

import {
  getLogger,
  TypedEventBase
} from '@claude-zen/foundation';
import type { LoggerInterface } from '@claude-zen/foundation';

export interface AdapterConfig {
  name: string;
  type: 'rest' | 'graphql' | 'websocket' | 'database' | 'file' | 'custom';
  connectionString?: string;
  credentials?: Record<string,
  unknown>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  healthCheckEndpoint?: string;
  metadata?: Record<string,
  unknown>

}

export interface AdapterStatus {
  name: string;
  connected: boolean;
  lastHealthCheck?: Date;
  errors: string[];
  connectionTime?: Date;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number

}

export abstract class BaseAdapter extends TypedEventBase {
  protected logger: LoggerInterface;
  protected config: AdapterConfig;
  protected status: AdapterStatus;

  constructor(config: AdapterConfig) {
    super();
    this.config = config;
    this.logger = getLogger(Adapter:' + config.name + ')';

    this.status = {
  name: config.name,
  connected: false,
  errors: [],
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0

}
}

  abstract connect(': Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract healthCheck(): Promise<boolean>;
  abstract request(method: string, data?: any): Promise<any>;

  getStatus(): AdapterStatus  {
    return { ...this.status }
}

  getConfig(): AdapterConfig  {
    return { ...this.config }
}

  protected recordRequest(success: boolean, error?: string): void  {
    this.status.totalRequests++;

    if (success) {
      this.status.successfulRequests++
} else {
      this.status.failedRequests++;
      if (error) {
        this.status.errors.push('' + new Date().toISOString() + ': ${error}')';
        // Keep only last 10 errors
        if (this.status.errors.length > 10' {
  this.status.errors = this.status.errors.slice(-10)

}
      }
    }
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = this.config.retryAttempts || 3,
    delay: number = this.config.retryDelay || 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
} catch (error) {
        lastError = error as Error;
        this.logger.warn(`Operation failed 'attempt ' + attempt + '/${maxAttempts}):', error)';

        if (attempt < maxAttempts' {
  await new Promise(resolve => setTimeout(resolve,
  delay * attempt))

}
      }
    }

    throw lastError!
}
}

export class RestAdapter extends BaseAdapter {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(config: AdapterConfig) {
    super(config);
    this.baseURL = config.connectionString || '';
    this.headers = {
  'Content-Type: 'application/json',
  'User-Agent: 'claude-code-zen-adapter/1.0'
};

    // Add authentication headers if credentials provided
    if (config.credentials) {
      if (config.credentials.apiKey) {
        this.headers['Authorization] = 'Bearer'' + config.credentials.apiKey + ''`
}
      if (config.credentials.username && config.credentials.password) {
        const auth = Buffer.from('' + config.credentials.username + ':${config.credentials.password}
        ).toString('base64)';
        this.headers['Authorization] = 'Basic'' + auth + '''
}
    }
  }

  async connect(): Promise<void>  {
    try {
      // Perform initial connection test
      await this.healthCheck();
      this.status.connected = true;
      this.status.connectionTime = new Date();
      this.emit('connected', { aapter: this.config.name })'
} catch (error) {
      this.status.connected = false;
      this.recordRequest(false, 'Connectionfailed: ' + error + ')';
      throw error
}
  }

  async disconnect(': Promise<void> {
    this.status.connected = false;
    this.emit('disconnected', { aapter: this.config.name })'
}

  async healthCheck(
  ': Promise<boolean> {
    try {
  const endpoint = this.config.healthCheckEndpoint || '/health';
      await this.request('GET',
  null,
  endpoint
)';
      this.status.lastHealthCheck = new Date();
      return true

} catch (error) {
  this.logger.warn('Health check failed:','
  error);;
      return false

}
  }

  async request(
  method: string,
  data?: any,
  endpoint?: string: Promise<any> {
    return this.retryOperation(async (
) => {
      try {
        const url = endpoint ? '' + this.baseURL + ${endpoint}' : this.baseURL;;

        const options: RequestInit = {
  method: method.toUpperCase(),
  headers: this.headers,
  signal: AbortSignal.timeout(this.config.timeout || 30000)

};

        if(
  data && ['POST',
  'PUT',
  'PATCH].includes(method.toUpperCase(
))) {
          options.body = JSON.stringify(data)
}

        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error('HTTP ' + response.status + ': ${response.statusText})'
}

        const result = await response.json();
        this.recordRequest(true);
        return result
} catch (error) {
        this.recordRequest(false, 'Requestfailed: ' + error + ');;
        throw error
}
    })
}
}

export class AdapterSystem extends TypedEventBase {
  private adapters: Map<string, BaseAdapter> = new Map();
  private logger: LoggerInterface;

  constructor(' {
  super();
    this.logger = getLogger('AdapterSystem)'

}

  registerAdapter(adapter: BaseAdapter: void {
    this.adapters.set(adapter.getConfig().name, adapter);

    // Forward adapter events
    adapter.on('connected', ('ata) => this.emit(adapter: connected, 'ata))';
    adapter.on('disconnected', ('ata) => this.emit(adapter: disconnected, 'ata))';

    this.logger.info('Registered adapter: ' + adapter.getConfig().name + '')'
}

  getAdapter(name: string: BaseAdapter | undefined {
    return this.adapters.get(name)
}

  async connectAll(): Promise<void>  {
    const connections = Array.from(this.adapters.values()).map(adapter =>
      adapter.connect().catch(error => {
        this.logger.error('Failed to connect adapter ' + adapter.getConfig().name + ':, error);;
        return error
})
    );

    await Promise.allSettled(connections)
}

  async disconnectAll(': Promise<void> {
    const disconnections = Array.from(this.adapters.values()).map(adapter =>
      adapter.disconnect().catch(error => {
        this.logger.error('Failed to disconnect adapter ' + adapter.getConfig().name + ':', error);
        return error
})
    );

    await Promise.allSettled(disconnections)
}

  async healthCheckAll(
  ': Promise<Record<string,
  boolean>> {
    const results: Record<string,
  boolean> = {};

    const checks = Array.from(this.adapters.entries(
)).map(async ([name, adapter]) => {
      try {
        results[name] = await adapter.healthCheck()
} catch (error) {
        this.logger.warn('Health check failed for adapter ' + name + ':', error)';
        results[name] = false
}
    });

    await Promise.allSettled(checks);
    return results
}

  getAllStatuses(
  ': Record<string,
  AdapterStatus> {
    const statuses: Record<string,
  AdapterStatus> = {};

    for (const [name, adapter] of this.adapters.entries(
)) {
      statuses[name] = adapter.getStatus()
}

    return statuses
}

  getSystemStatus(): {
  totalAdapters: number;
    connectedAdapters: number;
    healthyAdapters: number;
    adapters: Record<string,
  AdapterStatus>

} {
    const adapters = this.getAllStatuses();
    const connectedAdapters = Object.values(adapters).filter(s => s.connected).length;
    const healthyAdapters = Object.values(adapters).filter(s =>
      s.connected && s.lastHealthCheck &&
      (Date.now() - s.lastHealthCheck.getTime()) < 60000 // Healthy if checked within last minute
    ).length;

    return {
  totalAdapters: this.adapters.size,
  connectedAdapters,
  healthyAdapters,
  adapters

}
}

  async shutdown(): Promise<void>  {
  this.logger.info('Shutting down adapter system...);;
    await this.disconnectAll();
    this.adapters.clear();
    this.logger.info('Adapter system shutdown complete)'

}
}

// Factory functions for common adapter types
export function createRestAdapter(config: AdapterConfig: RestAdapter {
  return new RestAdapter({
  ...config,
  type: 'rest'
});
}

export function createAdapterFromConfig(config: AdapterConfig: BaseAdapter {
  switch (config.type) {
    case rest:
      return new RestAdapter(config);
    default:
      throw new Error('Unsupported adapter type: ' + config.type + ')`
}
}

// Default adapter system instance
export const adapterSystem = new AdapterSystem();