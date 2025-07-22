// Fallback memory store for MCP server
// Provides basic memory functionality when persistent storage is unavailable

class FallbackStore {
  constructor() {
    this.memory = new Map();
    this.contexts = new Map();
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
    return { success: true, message: 'Fallback store initialized' };
  }

  async store(key, value, options = {}) {
    try {
      const entry = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl || null,
        metadata: options.metadata || {}
      };
      this.memory.set(key, entry);
      return { success: true, key };
    } catch (error) {
      console.error('Fallback store error:', error);
      return { success: false, error: error.message };
    }
  }

  async retrieve(key) {
    try {
      const entry = this.memory.get(key);
      if (!entry) {
        return { success: false, error: 'Key not found' };
      }

      // Check TTL
      if (entry.ttl && Date.now() > entry.timestamp + entry.ttl) {
        this.memory.delete(key);
        return { success: false, error: 'Key expired' };
      }

      return { 
        success: true, 
        value: entry.value,
        metadata: entry.metadata,
        timestamp: entry.timestamp
      };
    } catch (error) {
      console.error('Fallback retrieve error:', error);
      return { success: false, error: error.message };
    }
  }

  async list(pattern = '*') {
    try {
      const keys = Array.from(this.memory.keys());
      const filteredKeys = pattern === '*' 
        ? keys 
        : keys.filter(key => key.includes(pattern.replace('*', '')));
      
      return { success: true, keys: filteredKeys };
    } catch (error) {
      console.error('Fallback list error:', error);
      return { success: false, error: error.message };
    }
  }

  async delete(key) {
    try {
      const exists = this.memory.has(key);
      this.memory.delete(key);
      return { success: true, deleted: exists };
    } catch (error) {
      console.error('Fallback delete error:', error);
      return { success: false, error: error.message };
    }
  }

  async clear() {
    try {
      this.memory.clear();
      this.contexts.clear();
      return { success: true };
    } catch (error) {
      console.error('Fallback clear error:', error);
      return { success: false, error: error.message };
    }
  }

  async getContext(contextId) {
    try {
      const context = this.contexts.get(contextId) || [];
      return { success: true, context };
    } catch (error) {
      console.error('Fallback getContext error:', error);
      return { success: false, error: error.message };
    }
  }

  async addToContext(contextId, item) {
    try {
      if (!this.contexts.has(contextId)) {
        this.contexts.set(contextId, []);
      }
      const context = this.contexts.get(contextId);
      context.push({
        ...item,
        timestamp: Date.now()
      });
      
      // Keep only last 100 items per context
      if (context.length > 100) {
        context.splice(0, context.length - 100);
      }
      
      return { success: true, contextId, itemCount: context.length };
    } catch (error) {
      console.error('Fallback addToContext error:', error);
      return { success: false, error: error.message };
    }
  }

  async getStats() {
    try {
      return {
        success: true,
        stats: {
          memoryEntries: this.memory.size,
          contexts: this.contexts.size,
          totalContextItems: Array.from(this.contexts.values()).reduce((sum, ctx) => sum + ctx.length, 0),
          type: 'fallback'
        }
      };
    } catch (error) {
      console.error('Fallback getStats error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export both default and named exports for compatibility
export default FallbackStore;
export const memoryStore = new FallbackStore();