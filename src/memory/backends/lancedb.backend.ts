/**
 * @fileoverview LanceDB backend for memory storage.
 */

import { createRepository, createDAO, DatabaseTypes, EntityTypes } from '../../database/index';
import type { IRepository, IDataAccessObject } from '../../database/interfaces';
import {
  type BackendConfig,
  type BackendStats,
  type JSONValue,
  MemoryBackend,
  type StorageResult,
} from './memory-backend';

export class LanceDBBackend extends MemoryBackend {
  private vectorRepository: IRepository<any>;
  private vectorDAO: IDataAccessObject<any>;

  constructor(config: BackendConfig) {
    super(config);
  }

  async initialize(): Promise<void> {
    this.vectorRepository = await createRepository(
      EntityTypes.VectorDocument,
      DatabaseTypes.LanceDB,
      {
        database: `${this.config.path}/lancedb`,
        options: {
          vectorSize: this.config.vectorDimensions || 384,
          metricType: 'cosine'
        }
      }
    );
    
    this.vectorDAO = await createDAO(
      EntityTypes.VectorDocument,
      DatabaseTypes.LanceDB,
      {
        database: `${this.config.path}/lancedb`,
        options: { vectorSize: this.config.vectorDimensions || 384 }
      }
    );
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

    await this.vectorRepository.create(vectorDoc);

    return {
      id: fullKey,
      timestamp,
      status: 'success',
    };
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    try {
      const fullKey = `${namespace}:${key}`;
      const document = await this.vectorRepository.findById(fullKey);
      
      if (!document || !document.metadata) {
        return null;
      }

      const metadata = document.metadata;
      if (metadata.serialized_data) {
        return JSON.parse(metadata.serialized_data);
      }

      return null;
    } catch (_error) {
      return null;
    }
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};

    try {
      const allDocuments = await this.vectorRepository.findAll({ limit: 100 });

      for (const document of allDocuments || []) {
        try {
          const metadata = document.metadata || {};
          if (metadata.namespace === namespace && metadata.serialized_data) {
            const key = metadata.key;
            if (pattern === '*' || key.includes(pattern.replace('*', ''))) {
              results[key] = JSON.parse(metadata.serialized_data);
            }
          }
        } catch (_error) {
          // Skip invalid entries
        }
      }
    } catch (_error) {
      // Return empty results on error
    }

    return results;
  }

  async delete(_key: string, _namespace: string = 'default'): Promise<boolean> {
    console.warn('Delete operation not implemented for LanceDB backend');
    return false;
  }

  async listNamespaces(): Promise<string[]> {
    try {
      const allDocuments = await this.vectorRepository.findAll({ limit: 1000 });

      const namespaces = new Set<string>();
      for (const document of allDocuments || []) {
        try {
          const metadata = document.metadata || {};
          if (metadata.namespace) {
            namespaces.add(metadata.namespace);
          }
        } catch (_error) {
          // Skip invalid entries
        }
      }

      return Array.from(namespaces);
    } catch (_error) {
      return [];
    }
  }

  async getStats(): Promise<BackendStats> {
    try {
      const allDocuments = await this.vectorRepository.findAll();
      return {
        entries: allDocuments.length,
        size: allDocuments.length * (this.config.vectorDimensions || 384),
        lastModified: Date.now(),
      };
    } catch (_error) {
      return {
        entries: 0,
        size: 0,
        lastModified: Date.now(),
      };
    }
  }
}
