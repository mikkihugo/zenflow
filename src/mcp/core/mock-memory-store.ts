/**
 * @fileoverview Mock SqliteMemoryStore implementation for testing
 * Provides basic functionality when sqlite store is not available
 */

export class SqliteMemoryStore {
  constructor(options = {}): any {
    this.options = options;
    this.storage = new Map();
    this.namespaces = new Map();
    console.warn('[Mock] Using mock SqliteMemoryStore implementation');
  }

  async initialize() {
    // Mock initialization
    return true;
  }

  async store(key, value, options = {}): any {
    let namespace = options.namespace || 'default';
    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(namespace, new Map());
    }

    const _nsStorage = this.namespaces.get(namespace);
    nsStorage.set(key, {
      value,
      timestamp = {}): any {
    const namespace = options.namespace || 'default';
    const nsStorage = this.namespaces.get(namespace);

    if (!nsStorage) return null;

    const item = nsStorage.get(key);
    if (!item) return null;

    // Check TTL
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      nsStorage.delete(key);
      return null;
    }

    return item.value;
  }

  async delete(key, options = {}): any {
    const namespace = options.namespace || 'default';
    const nsStorage = this.namespaces.get(namespace);

    if (nsStorage) {
      return nsStorage.delete(key);
    }

    return false;
  }

  async list(options = {}): any {
    const namespace = options.namespace || 'default';
    const nsStorage = this.namespaces.get(namespace);

    if (!nsStorage) return [];

    return Array.from(nsStorage.keys());
  }

  async search(pattern, options = {}): any {
    const namespace = options.namespace || 'default';
    const nsStorage = this.namespaces.get(namespace);

    if (!nsStorage) return [];

    const results = [];
    for (const [key, item] of nsStorage.entries()) {
      if (key.includes(pattern.replace(':', ''))) {
        results.push(item.value);
      }
    }

    return results;
  }

  async close() {
    this.storage.clear();
    this.namespaces.clear();
  }
}
