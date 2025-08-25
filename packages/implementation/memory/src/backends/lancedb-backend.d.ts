/**
 * LanceDB Backend Stub
 * Compatibility stub for vector database performance tests
 */
export interface VectorStoreConfig {
  path: string;
  vectorDimension: number;
}
export interface VectorInsertData {
  vector: number[];
  metadata: Record<string, any>;
}
export interface VectorInsertResult {
  success: boolean;
  id?: string;
  insertedCount?: number;
  failedCount?: number;
}
export interface VectorSearchOptions {
  vector: number[];
  k: number;
  threshold?: number;
  filter?: Record<string, any>;
  exact?: boolean;
  approximationFactor?: number;
}
export interface VectorSearchResult {
  similarity: number;
  metadata: Record<string, any>;
}
/**
 * VectorStore stub implementation
 */
export declare class VectorStore {
  private adapter;
  constructor(adapter: any);
  initialize(): Promise<void>;
  close(): Promise<void>;
  insert(data: VectorInsertData): Promise<VectorInsertResult>;
  batchInsert(data: VectorInsertData[]): Promise<VectorInsertResult>;
  similaritySearch(options: VectorSearchOptions): Promise<VectorSearchResult[]>;
  rangeSearch(options: {
    vector: number[];
    radius: number;
    maxResults: number;
  }): Promise<VectorSearchResult[]>;
  getById(id: string): Promise<any>;
  update(id: string, data: VectorInsertData): Promise<VectorInsertResult>;
  buildIndexes(config: any): Promise<void>;
  analyzeDataDistribution(): Promise<any>;
  optimizeIndex(config: any): Promise<any>;
  getStorageInfo(): Promise<any>;
  compressVectors(config: any): Promise<any>;
}
//# sourceMappingURL=lancedb-backend.d.ts.map
