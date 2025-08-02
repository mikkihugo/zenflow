/**
 * @fileoverview LanceDB backend for memory storage.
 */

import { LanceDBInterface } from '../../database/lancedb-interface';
import {
  type BackendConfig,
  type BackendStats,
  BaseBackend,
  type JSONValue,
  type StorageResult,
} from './base.backend';

export class LanceDBBackend extends BaseBackend {
  private lanceInterface: LanceDBInterface;

  constructor(config: BackendConfig) {
    super(config);
    this.lanceInterface = new LanceDBInterface({
      dbPath: `${config.path}/lancedb`,
    });
  }

  async initialize(): Promise<void> {
    await this.lanceInterface.initialize();
  }

  async store(
    key: string,
    value: JSONValue,
    namespace: string = 'default'
  ): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();

    const serializedValue = JSON.stringify(value);

    const documentText =
      typeof value === 'object' && value && 'content' in value
        ? (value as any).content
        : serializedValue;

    const vectorDoc = {
      id: fullKey,
      vector: new Array(384).fill(0), // placeholder vector
      metadata: {
        key,
        namespace,
        timestamp,
        serialized_data: serializedValue,
        content: documentText,
      },
    };

    await this.lanceInterface.insertVectors('documents', [vectorDoc]);

    return {
      id: fullKey,
      timestamp,
      status: 'success',
    };
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    try {
      const searchResult = await this.lanceInterface.searchSimilar(
        'documents',
        new Array(384).fill(0),
        1,
        {
          key: key,
          namespace: namespace,
        }
      );

      if (!searchResult || searchResult.length === 0) {
        return null;
      }

      const result = searchResult[0];
      const metadata = result.metadata || {};

      if (metadata.serialized_data) {
        return JSON.parse(metadata.serialized_data);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};

    try {
      const searchResult = await this.lanceInterface.searchSimilar(
        'documents',
        new Array(384).fill(0),
        100,
        {
          namespace: namespace,
        }
      );

      for (const result of searchResult || []) {
        try {
          const metadata = result.metadata || {};
          if (metadata.namespace === namespace && metadata.serialized_data) {
            const key = metadata.key;
            if (pattern === '*' || key.includes(pattern.replace('*', ''))) {
              results[key] = JSON.parse(metadata.serialized_data);
            }
          }
        } catch (error) {
          // Skip invalid entries
        }
      }
    } catch (error) {
      // Return empty results on error
    }

    return results;
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    console.warn('Delete operation not implemented for LanceDB backend');
    return false;
  }

  async listNamespaces(): Promise<string[]> {
    try {
      const searchResult = await this.lanceInterface.searchSimilar(
        'documents',
        new Array(384).fill(0),
        1000
      );

      const namespaces = new Set<string>();
      for (const result of searchResult || []) {
        try {
          const metadata = result.metadata || {};
          if (metadata.namespace) {
            namespaces.add(metadata.namespace);
          }
        } catch (error) {
          // Skip invalid entries
        }
      }

      return Array.from(namespaces);
    } catch (error) {
      return [];
    }
  }

  async getStats(): Promise<BackendStats> {
    const stats = await this.lanceInterface.getStats();
    return {
      entries: stats.totalVectors || 0,
      size: stats.indexedVectors || 0,
      lastModified: Date.now(),
    };
  }
}
