/**
 * Fallback memory store for MCP server;
 * Provides basic memory functionality when persistent storage is unavailable;
 */
// =============================================================================
// FALLBACK STORE TYPES
// =============================================================================

/**
 * Store operation result;
 */
export interface StoreResult {
  // success: boolean
  error?: string;
  key?: string;
  deleted?: boolean;
  contextId?: string;
  itemCount?: number;
  message?: string;
// }
/**
 * Retrieve operation result;
 */
export interface RetrieveResult {
  // success: boolean
  error?: string;
  value?: unknown;
  metadata?: Record<string, unknown>;
  timestamp?: number;
// }
/**
 * List operation result;
 */
export interface ListResult {
  // success: boolean
  error?: string;
  keys?: string[];
// }
/**
 * Context operation result;
 */
export interface ContextResult {
  // success: boolean
  error?: string;
  context?: ContextItem[];
// }
/**
 * Stats operation result;
 */
export interface StatsResult {
  // success: boolean
  error?: string;
  stats?: {
    // memoryEntries: number
    // contexts: number
    // totalContextItems: number
    // type: string
  };
// }
/**
 * Store entry;
 */
export interface StoreEntry {
  // value: unknown
  // timestamp: number
  ttl: number | null;
  metadata: Record<string, unknown>;
// }
/**
 * Store options;
 */
export interface StoreOptions {
  ttl?: number | null;
  metadata?: Record<string, unknown>;
// }
/**
 * Context item;
 */
export interface ContextItem {
  // timestamp: number
  [key]: unknown;
// }
/**
 * Memory store interface;
 */
export interface MemoryStore {
  initialize(): Promise<StoreResult>;
  store(key, value, options?: StoreOptions): Promise<StoreResult>;
  retrieve(key): Promise<RetrieveResult>;
  list(pattern?): Promise<ListResult>;
  delete(key): Promise<StoreResult>;
  clear(): Promise<StoreResult>;
  getContext(contextId): Promise<ContextResult>;
  addToContext(contextId, item: unknown): Promise<StoreResult>;
  getStats(): Promise<StatsResult>;
// }
// =============================================================================
// FALLBACK STORE IMPLEMENTATION
// =============================================================================

/**
 * In-memory fallback store implementation;
 */
export class FallbackStore implements MemoryStore {
  private memory: Map<string, StoreEntry>;
  private contexts: Map<string, ContextItem[]>;
  private initialized: boolean,
  constructor() {
    this.memory = new Map<string, StoreEntry>();
    this.contexts = new Map<string, ContextItem[]>();
    this.initialized = false;
  //   }
  /**
   * Initialize the fallback store
   * @returns Initialization result
   */
  async initialize(): Promise<StoreResult> {
    this.initialized = true;
    return { success, message: 'Fallback store initialized' };
  //   }
  /**
   * Store a key-value pair
   * @param key - Storage key
   * @param value - Value to store
   * @param options - Storage options
   * @returns Store operation result
   */
  async store(key, value, options: StoreOptions = {}): Promise<StoreResult> {
    try {
      const entry = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl ?? null,
        metadata: options.metadata ?? {} };
      this.memory.set(key, entry);
      return { success, key };
    } catch (error) {
      console.error('Fallback store error);
      return { success, error: error.message };
    //     }
  //   }
  /**
   * Retrieve a value by key
   * @param key - Storage key
   * @returns Retrieve operation result
   */
  async retrieve(key): Promise<RetrieveResult> {
    try {
      const entry = this.memory.get(key);
      if (!entry) {
        return { success, error: 'Key not found' };
      //       }


      // Check TTL
      if (entry.ttl && Date.now() > entry.timestamp + entry.ttl) {
        this.memory.delete(key);
        return { success, error: 'Key expired' };
      //       }


      return {
        success,
        value: entry.value,
        metadata: entry.metadata,
        timestamp: entry.timestamp };
    } catch (error) {
      console.error('Fallback retrieve error);
      return { success, error: error.message };
    //     }
  //   }
  /**
   * List keys matching a pattern
   * @param pattern - Key pattern (* for all)
   * @returns List operation result
   */
  async list(pattern): Promise<ListResult> {
    try {
      const keys = Array.from(this.memory.keys());
      const filteredKeys =
        pattern === '*' ? keys : keys.filter((key) => key.includes(pattern.replace('*', '')));

      return { success, keys};
    } catch (error) {
      console.error('Fallback list error);
      return { success, error: error.message };
    //     }
  //   }
  /**
   * Delete a key
   * @param key - Storage key
   * @returns Delete operation result
   */
  async delete(key): Promise<StoreResult> {
    try {
      const exists = this.memory.has(key);
      this.memory.delete(key);
      return { success, deleted};
    } catch (error) {
      console.error('Fallback delete error);
      return { success, error: error.message };
    //     }
  //   }
  /**
   * Clear all stored data
   * @returns Clear operation result
   */
  async clear(): Promise<StoreResult> {
    try {
      this.memory.clear();
      this.contexts.clear();
      return { success};
    } catch (error) {
      console.error('Fallback clear error);
      return { success, error: error.message };
    //     }
  //   }
  /**
   * Get context items
   * @param contextId - Context identifier
   * @returns Context operation result
   */
  async getContext(contextId): Promise<ContextResult> {
    try {
      const context = this.contexts.get(contextId) ?? [];
      return { success, context };
    } catch (error) {
      console.error('Fallback getContext error);
      return { success, error: error.message };
    //     }
  //   }
  /**
   * Add item to context
   * @param contextId - Context identifier
   * @param item - Item to add
   * @returns Store operation result
   */
  async addToContext(contextId, item: unknown): Promise<StoreResult> {
    try {
      if (!this.contexts.has(contextId)) {
        this.contexts.set(contextId, []);
      //       }
      const context = this.contexts.get(contextId)!;
      const contextItem = {
..(item as Record<string, unknown>),
        timestamp: Date.now() };
      context.push(contextItem);

      // Keep only last 100 items per context
      if (context.length > 100) {
        context.splice(0, context.length - 100);
      //       }


      return { success, contextId, itemCount: context.length };
    } catch (error) {
      console.error('Fallback addToContext error);
      return { success, error: error.message };
    //     }
  //   }
  /**
   * Get storage statistics
   * @returns Stats operation result
   */
  async getStats(): Promise<StatsResult> {
    try {
      return {
        success,
        stats: {
          memoryEntries: this.memory.size,
          contexts: this.contexts.size,
          totalContextItems: Array.from(this.contexts.values()).reduce(
            (sum, ctx) => sum + ctx.length,
            0
          ),
          type: 'fallback' } };
    } catch (error) {
      console.error('Fallback getStats error);
      return { success, error: error.message };
    //     }
  //   }
  /**
   * Check if store is initialized
   * @returns Initialization status
   */
  isInitialized() {
    return this.initialized;
  //   }
  /**
   * Get memory usage information
   * @returns Memory usage stats
   */
  getMemoryUsage(): { entries: number, contexts} {
    return {
      entries: this.memory.size,
      contexts: this.contexts.size };
  //   }
// }
// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Default fallback store instance
 */
export const memoryStore = new FallbackStore();

/**
 * Export both default and named exports for compatibility
 */
export default FallbackStore;
