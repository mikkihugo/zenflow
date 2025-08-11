/**
 * Unified Base Interfaces for Interface Contract Standardization.
 *
 * This file provides standardized base interfaces that all domain-specific.
 * Implementations must conform to, eliminating interface contract mismatches..
 *
 * @file Core base interfaces for cross-domain compatibility.
 */

// Re-export core token interfaces for consistency
export { IConfig, IDatabase, IEventBus, ILogger } from '../../di/tokens/core-tokens.ts';

/**
 * Base database adapter interface that all database implementations must follow.
 *
 * @example
 */
export interface DatabaseAdapter {
  /** Establish database connection */
  connect(): Promise<void>;
  /** Close database connection */
  disconnect(): Promise<void>;
  /** Execute a SELECT query */
  query(sql: string, params?: any[]): Promise<QueryResult>;
  /** Execute an INSERT/UPDATE/DELETE command */
  execute(sql: string, params?: any[]): Promise<ExecuteResult>;
  /** Execute multiple commands in a transaction */
  transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
  /** Check database health status */
  health(): Promise<boolean>;
  /** Get database schema information */
  getSchema(): Promise<SchemaInfo>;
  /** Get connection pool statistics */
  getConnectionStats(): Promise<ConnectionStats>;
}

/**
 * Standardized query result interface.
 *
 * @example
 */
export interface QueryResult {
  /** Result rows */
  rows: any[];
  /** Number of rows returned */
  rowCount: number;
  /** Column metadata */
  fields?: Array<{
    name: string;
    type: string;
    nullable: boolean;
  }>;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Standardized execute result interface.
 *
 * @example
 */
export interface ExecuteResult {
  /** Number of affected rows */
  affectedRows: number;
  /** Last inserted ID (if applicable) */
  insertId?: any;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Standardized transaction context interface.
 *
 * @example
 */
export interface TransactionContext {
  /** Execute a query within the transaction */
  query(sql: string, params?: any[]): Promise<QueryResult>;
  /** Execute a command within the transaction */
  execute(sql: string, params?: any[]): Promise<ExecuteResult>;
  /** Commit the transaction */
  commit(): Promise<void>;
  /** Rollback the transaction */
  rollback(): Promise<void>;
}

/**
 * Standardized schema information interface.
 *
 * @example
 */
export interface SchemaInfo {
  /** Database tables */
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      defaultValue?: any;
      isPrimaryKey: boolean;
      isForeignKey: boolean;
    }>;
    indexes: Array<{
      name: string;
      columns: string[];
      unique: boolean;
    }>;
  }>;
  /** Database views */
  views: Array<{
    name: string;
    definition: string;
  }>;
  /** Database version */
  version: string;
}

/**
 * Standardized connection statistics interface.
 *
 * @example
 */
export interface ConnectionStats {
  /** Total number of connections */
  total: number;
  /** Number of active connections */
  active: number;
  /** Number of idle connections */
  idle: number;
  /** Connection pool utilization percentage */
  utilization: number;
  /** Average connection time */
  averageConnectionTime: number;
}

/**
 * Base memory store interface that all memory implementations must follow.
 *
 * @example
 */
export interface IMemoryStore {
  /** Initialize the memory store */
  initialize(): Promise<void>;
  /** Store data with optional TTL */
  store(key: string, data: any, options?: StoreOptions): Promise<void>;
  /** Retrieve data by key */
  retrieve(key: string): Promise<any>;
  /** Delete data by key */
  delete(key: string): Promise<boolean>;
  /** Clear all data (optional) */
  clear?(): Promise<void>;
  /** Get store statistics */
  getStats?(): Promise<MemoryStats>;
  /** Shutdown the store gracefully */
  shutdown(): Promise<void>;
}

/**
 * Memory store options interface.
 *
 * @example
 */
export interface StoreOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Tags for categorization */
  tags?: string[];
  /** Priority level */
  priority?: 'low' | 'medium' | 'high';
  /** Vector data for similarity search */
  vector?: number[];
}

/**
 * Memory store statistics interface.
 *
 * @example
 */
export interface MemoryStats {
  /** Number of entries */
  entries: number;
  /** Total size in bytes */
  size: number;
  /** Last modification timestamp */
  lastModified: number;
  /** Number of namespaces */
  namespaces?: number;
}

/**
 * Base neural network interface for WASM compatibility.
 *
 * @example
 */
export interface NeuralNetworkInterface {
  /** Initialize the neural network */
  initialize(config: NeuralConfig): Promise<void>;
  /** Train the network with data */
  train(data: TrainingData, options?: TrainingOptions): Promise<TrainingResult>;
  /** Make a prediction */
  predict(input: number[]): Promise<number[]>;
  /** Export model state */
  export(): Promise<ModelState>;
  /** Import model state */
  import(state: ModelState): Promise<void>;
  /** Get network performance metrics */
  getMetrics(): Promise<NetworkMetrics>;
}

/**
 * Neural network configuration interface.
 *
 * @example
 */
export interface NeuralConfig {
  /** Network architecture layers */
  layers: number[];
  /** Activation function */
  activation?: string;
  /** Learning rate */
  learningRate?: number;
  /** Use WASM acceleration */
  useWasm?: boolean;
}

/**
 * Training data interface.
 *
 * @example
 */
export interface TrainingData {
  /** Input vectors */
  inputs: number[][];
  /** Expected outputs */
  outputs: number[][];
}

/**
 * Training options interface.
 *
 * @example
 */
export interface TrainingOptions {
  /** Number of epochs */
  epochs?: number;
  /** Batch size */
  batchSize?: number;
  /** Validation split ratio */
  validationSplit?: number;
}

/**
 * Training result interface.
 *
 * @example
 */
export interface TrainingResult {
  /** Final training error */
  finalError: number;
  /** Number of epochs completed */
  epochsCompleted: number;
  /** Training duration in milliseconds */
  duration: number;
  /** Convergence achieved */
  converged: boolean;
}

/**
 * Model state interface for serialization.
 *
 * @example
 */
export interface ModelState {
  /** Model weights */
  weights: number[][];
  /** Model biases */
  biases: number[][];
  /** Configuration */
  config: NeuralConfig;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Network performance metrics interface.
 *
 * @example
 */
export interface NetworkMetrics {
  /** Training accuracy */
  accuracy: number;
  /** Training loss */
  loss: number;
  /** Prediction time in milliseconds */
  predictionTime: number;
  /** Memory usage in bytes */
  memoryUsage: number;
}

/**
 * WASM neural binding interface for type safety.
 *
 * @example
 */
export interface WasmNeuralBinding {
  /** Load WASM module */
  loadWasm(): Promise<any>;
  /** Check WASM availability */
  isWasmAvailable(): boolean;
  /** Get WASM capabilities */
  getWasmCapabilities(): string[];
  /** Create neural network instance */
  createNeuralNetwork(config: NeuralConfig): Promise<NeuralNetworkInterface>;
}
