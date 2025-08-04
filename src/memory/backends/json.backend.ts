/**
 * @fileoverview JSON file backend for memory storage.
 */

import {
  type BackendConfig,
  type BackendStats,
  type JSONValue,
  MemoryBackend,
  type StorageResult,
} from './memory-backend';

export class JSONBackend extends MemoryBackend {
  private data = new Map<string, { value: JSONValue; timestamp: number }>();
  private filepath: string;

  constructor(config: BackendConfig) {
    super(config);
    this.filepath = `${config.path}/memory-backend.json`;
  }

  async initialize(): Promise<void> {
    try {
      const fs = await import('node:fs/promises');
      const data = await fs.readFile(this.filepath, 'utf8');
      const parsed = JSON.parse(data);
      this.data = new Map(Object.entries(parsed));
    } catch {
      // File doesn't exist or is corrupted, start fresh
    }
  }

  async store(
    key: string,
    value: JSONValue,
    namespace: string = 'default'
  ): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();

    this.data.set(fullKey, { value, timestamp });
    await this.persist();

    return {
      id: fullKey,
      timestamp,
      status: 'success',
    };
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const fullKey = `${namespace}:${key}`;
    const entry = this.data.get(fullKey);
    return entry?.value ?? null;
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    const prefix = `${namespace}:`;
    for (const [key, entry] of Array.from(this.data.entries())) {
      if (key.startsWith(prefix) && key.includes(pattern)) {
        results[key.substring(prefix.length)] = entry.value;
      }
    }
    return results;
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    const fullKey = `${namespace}:${key}`;
    const deleted = this.data.delete(fullKey);
    if (deleted) await this.persist();
    return deleted;
  }

  async listNamespaces(): Promise<string[]> {
    const namespaces = new Set<string>();
    for (const key of Array.from(this.data.keys())) {
      const namespace = key.split(':')[0];
      namespaces.add(namespace);
    }
    return Array.from(namespaces);
  }

  async getStats(): Promise<BackendStats> {
    return {
      entries: this.data.size,
      size: JSON.stringify(Array.from(this.data.entries())).length,
      lastModified: Date.now(),
    };
  }

  private async persist(): Promise<void> {
    const fs = await import('node:fs/promises');
    const dir = this.filepath.substring(0, this.filepath.lastIndexOf('/'));

    await fs.mkdir(dir, { recursive: true });

    const obj: Record<string, any> = {};
    for (const [key, value] of Array.from(this.data.entries())) {
      obj[key] = value;
    }

    await fs.writeFile(this.filepath, JSON.stringify(obj, null, 2));
  }
}
