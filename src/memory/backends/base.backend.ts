/**
 * @fileoverview Base class and interfaces for memory backends.
 */

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export interface StorageResult {
  id: string;
  timestamp: number;
  status: 'success' | 'error';
  error?: string;
}

export interface BackendStats {
  entries: number;
  size: number;
  lastModified: number;
  namespaces?: number;
}

export interface BackendConfig {
  type: 'lancedb' | 'sqlite' | 'json' | 'kuzu';
  path: string;
  enabled?: boolean;
  [key: string]: any;
}

export interface BackendInterface {
  initialize(): Promise<void>;
  store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
  retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
  search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
  delete(key: string, namespace?: string): Promise<boolean>;
  listNamespaces(): Promise<string[]>;
  getStats(): Promise<BackendStats>;
  healthCheck?(): Promise<{ status: string; score: number; issues: string[]; lastCheck: Date }>;
}

export abstract class BaseBackend implements BackendInterface {
  protected config: BackendConfig;

  constructor(config: BackendConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
  abstract retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
  abstract search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
  abstract delete(key: string, namespace?: string): Promise<boolean>;
  abstract listNamespaces(): Promise<string[]>;
  abstract getStats(): Promise<BackendStats>;

  async healthCheck() {
    return {
      status: 'healthy',
      score: 100,
      issues: [],
      lastCheck: new Date(),
    };
  }
}
