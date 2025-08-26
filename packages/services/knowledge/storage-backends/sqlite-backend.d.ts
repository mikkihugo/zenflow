/**
 * @file Sqlite-backend implementation.
 */
import { DatabaseProviderFactory } from '../../database/providers/database-providers';
import type {
  FACTKnowledgeEntry,
  FACTSearchQuery,
  FACTStorageBackend,
  FACTStorageStats,
} from '../storage-interface';
interface SQLiteBackendConfig {
  dbPath: string;
  tableName: string;
  enableWAL: boolean;
  enableFullTextSearch: boolean;
  enablePerformanceIndexes: boolean;
}
export declare class SQLiteBackend implements FACTStorageBackend {
  private config;
  private dalAdapter?;
  private dalFactory;
  private isInitialized;
  constructor(
    config?: Partial<SQLiteBackendConfig>,
    dalFactory?: DatabaseProviderFactory
  );
  initialize(): Promise<void>;
  store(entry: FACTKnowledgeEntry): Promise<void>;
  get(id: string): Promise<FACTKnowledgeEntry|null>;
  search(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
  delete(id: string): Promise<boolean>;
  cleanup(maxAge: number): Promise<number>;
  getStats(): Promise<Partial<FACTStorageStats>>;
  clear(): Promise<void>;
  shutdown(): Promise<void>;
  clearByQuality(minQuality: number): Promise<number>;
  clearByAge(maxAgeMs: number): Promise<number>;
  clearMemoryCache(): Promise<number>;
  clearAll(): Promise<number>;
  optimize(strategy?:'aggressive|balanced|conservative'): Promise<{'
    optimized: boolean;
    details: string;
  }>;
  getStorageStats(): Promise<FACTStorageStats>;
  private createTables;
  private createIndexes;
}
export default SQLiteBackend;
//# sourceMappingURL=sqlite-backend.d.ts.map
