/**
 * TypeScript declarations for SwarmPersistencePooled
 */

export interface SwarmPersistenceOptions {
  maxReaders?: number;
  maxWorkers?: number;
  [key: string]: any;
}

export declare class SwarmPersistencePooled {
  constructor(dbPath?: string, options?: SwarmPersistenceOptions);
  
  // Add common methods that might be used
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // Add any other methods as needed
  [key: string]: any;
}

export default SwarmPersistencePooled;