/**
 * Vector RAG Backend Tests
 *
 * Comprehensive test suite for the Vector RAG backend implementation,
 * testing hybrid search, architectural knowledge ingestion, and
 * integration with existing vector storage systems.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VectorRAGBackend, type VectorRAGConfig, type VectorKnowledgeEntry } from '../knowledge-cache-backends/vector-rag-backend';

describe('VectorRAGBackend', () => {
  let backend: VectorRAGBackend;
  let config: VectorRAGConfig;

  beforeEach(() => {
    config = {
      backend: 'vector-rag',
      maxMemoryCacheSize: 1000,
      defaultTTL: 3600000,
      cleanupInterval: 60000,
      maxEntryAge: 86400000,
      vectorDimensions: 384,
      embeddingModel: 'text-embedding-3-small',
      similarityThreshold: 0.7,
      maxVectorResults: 10,
      hybridSearchWeight: 0.5, // 50% text, 50% semantic
      enableArchitecturalKnowledge: true,
      architecturalDocsPath: './test-docs',
      backendConfig: {
        dbPath: ':memory:',
        enableWAL: false,
        enableFullTextSearch: true,
      },
    };

    backend = new VectorRAGBackend(config);
  });

  afterEach(async () => {
    if (backend) {
      await backend.shutdown();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid configuration', async () => {
      await expect(backend.initialize()).resolves.not.toThrow();
    });

    it('should initialize SQLite backend and vector storage', async () => {
      await backend.initialize();
      
      // Test that both backends are working by storing and retrieving
      const testEntry: VectorKnowledgeEntry = {
        id: 'test-init',
        query: 'test initialization',
        result: { status: 'initialized' },
        source: 'test',
        timestamp: Date.now(),
        ttl: 3600000,
        accessCount: 0,
        lastAccessed: Date.now(),
        knowledgeType: 'fact',
        metadata: {
          type: 'test',
          domains: ['testing'],
        },
      };

      await backend.store(testEntry);
      const retrieved = await backend.get('test-init');
      expect(retrieved).toEqual(testEntry);
    });

    it('should ingest architectural knowledge when enabled', async () => {
      config.enableArchitecturalKnowledge = true;
      await backend.initialize();

      // Test that architectural knowledge was ingested
      const architecturalResults = await backend.search({
        query: 'orchestration architecture',
        maxResults: 5,
      });

      expect(architecturalResults.length).toBeGreaterThan(0);
      expect(architecturalResults.some(r => r.knowledgeType === 'architectural-decision')).toBe(true);
    });

    it('should skip architectural knowledge when disabled', async () => {
      config.enableArchitecturalKnowledge = false;
      await backend.initialize();

      const allResults = await backend.search({
        query: 'architecture',
        maxResults: 100,
      });

      // Should not have pre-ingested architectural knowledge
      expect(allResults.filter(r => r.knowledgeType === 'architectural-decision')).toHaveLength(0);
    });
  });

  describe('Vector Knowledge Storage', () => {
    beforeEach(async () => {
      await backend.initialize();
    });

    it('should store knowledge entry with vector embedding', async () => {
      const entry: VectorKnowledgeEntry = {
        id: 'vector-test-1',
        query: 'What is neural network backpropagation?',
        result: {
          answer: 'Backpropagation is a method for training neural networks by computing gradients',
          details: 'It uses the chain rule to propagate errors backward through the network',
        },
        source: 'AI textbook',
        timestamp: Date.now(),
        ttl: 86400000,
        accessCount: 0,
        lastAccessed: Date.now(),
        knowledgeType: 'documentation',
        metadata: {
          type: 'educational',
          domains: ['machine-learning', 'neural-networks'],
          confidence: 0.95,
        },
        semanticTags: ['neural-networks', 'training', 'optimization', 'gradients'],
      };

      await expect(backend.store(entry)).resolves.not.toThrow();

      const retrieved = await backend.get('vector-test-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.knowledgeType).toBe('documentation');
      expect(retrieved?.semanticTags).toEqual(['neural-networks', 'training', 'optimization', 'gradients']);
    });

    it('should generate embeddings for entries without them', async () => {
      const entry: VectorKnowledgeEntry = {
        id: 'auto-embedding-test',
        query: 'How does distributed coordination work?',
        result: { answer: 'Distributed coordination uses consensus algorithms' },
        source: 'coordination docs',
        timestamp: Date.now(),
        ttl: 86400000,
        accessCount: 0,
        lastAccessed: Date.now(),
        knowledgeType: 'architectural-decision',
        metadata: {
          type: 'architecture',
          domains: ['coordination', 'distributed-systems'],
        },
      };

      // Store without embedding
      await backend.store(entry);

      // Verify it was stored successfully
      const retrieved = await backend.get('auto-embedding-test');
      expect(retrieved).toBeDefined();
      expect(retrieved?.query).toBe('How does distributed coordination work?');
    });

    it('should store multiple knowledge types', async () => {
      const knowledgeTypes: Array<VectorKnowledgeEntry['knowledgeType']> = [
        'fact',
        'architectural-decision', 
        'code-pattern',
        'documentation'
      ];

      for (const [index, knowledgeType] of knowledgeTypes.entries()) {
        const entry: VectorKnowledgeEntry = {
          id: `type-test-${index}`,
          query: `Test query for ${knowledgeType}`,
          result: { answer: `Answer for ${knowledgeType}` },
          source: 'test',
          timestamp: Date.now(),
          ttl: 86400000,
          accessCount: 0,
          lastAccessed: Date.now(),
          knowledgeType,
          metadata: {
            type: knowledgeType,
            domains: ['testing'],
          },
        };

        await backend.store(entry);
      }

      // Verify all types were stored
      for (const [index] of knowledgeTypes.entries()) {
        const retrieved = await backend.get(`type-test-${index}`);
        expect(retrieved).toBeDefined();
      }
    });
  });

  describe('Hybrid Search Functionality', () => {
    beforeEach(async () => {
      await backend.initialize();

      // Store test knowledge entries for search
      const testEntries: VectorKnowledgeEntry[] = [
        {
          id: 'search-exact-1',
          query: 'TypeScript interface patterns',
          result: { pattern: 'interface extends pattern for code reuse' },
          source: 'coding guide',
          timestamp: Date.now(),
          ttl: 86400000,
          accessCount: 0,
          lastAccessed: Date.now(),
          knowledgeType: 'code-pattern',
          metadata: {
            type: 'pattern',
            domains: ['typescript', 'programming'],
          },
          semanticTags: ['typescript', 'interfaces', 'patterns', 'inheritance'],
        },
        {
          id: 'search-semantic-1',
          query: 'Neural network optimization techniques',
          result: { techniques: ['Adam optimizer', 'learning rate scheduling', 'regularization'] },
          source: 'ML research',
          timestamp: Date.now(),
          ttl: 86400000,
          accessCount: 0,
          lastAccessed: Date.now(),
          knowledgeType: 'documentation',
          metadata: {
            type: 'research',
            domains: ['machine-learning', 'optimization'],
          },
          semanticTags: ['neural-networks', 'optimization', 'training', 'performance'],
        },
        {
          id: 'search-architectural-1',
          query: 'Microservices communication patterns',
          result: { patterns: ['API Gateway', 'Event Sourcing', 'CQRS', 'Service Mesh'] },
          source: 'architecture guide',
          timestamp: Date.now(),
          ttl: 86400000,
          accessCount: 0,
          lastAccessed: Date.now(),
          knowledgeType: 'architectural-decision',
          metadata: {
            type: 'architecture',
            domains: ['microservices', 'architecture'],
          },
          semanticTags: ['microservices', 'communication', 'patterns', 'distributed'],
        },
      ];

      for (const entry of testEntries) {
        await backend.store(entry);
      }
    });

    it('should perform exact text search', async () => {
      const results = await backend.search({
        query: 'TypeScript interface',
        searchType: 'exact',
        maxResults: 10,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.id === 'search-exact-1')).toBe(true);
    });

    it('should perform semantic vector search', async () => {
      const results = await backend.search({
        query: 'machine learning training optimization',
        searchType: 'semantic',
        maxResults: 10,
        similarityThreshold: 0.1, // Lower threshold for mock embeddings
      });

      expect(results.length).toBeGreaterThan(0);
      // Should find semantically related content even with different wording
    });

    it('should perform hybrid search combining exact and semantic', async () => {
      const results = await backend.search({
        query: 'architecture patterns distributed systems',
        searchType: 'hybrid',
        maxResults: 10,
      });

      expect(results.length).toBeGreaterThan(0);
      // Should combine both exact matches and semantic similarity
    });

    it('should filter search results by knowledge type', async () => {
      const results = await backend.search({
        query: 'patterns',
        type: 'architectural-decision',
        maxResults: 10,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.knowledgeType === 'architectural-decision')).toBe(true);
    });

    it('should filter search results by domains', async () => {
      const results = await backend.search({
        query: 'optimization',
        domains: ['machine-learning'],
        maxResults: 10,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.metadata.domains.includes('machine-learning'))).toBe(true);
    });

    it('should respect similarity threshold', async () => {
      const highThresholdResults = await backend.search({
        query: 'completely unrelated topic xyz',
        similarityThreshold: 0.9,
        maxResults: 10,
      });

      const lowThresholdResults = await backend.search({
        query: 'completely unrelated topic xyz',
        similarityThreshold: 0.1,
        maxResults: 10,
      });

      expect(lowThresholdResults.length).toBeGreaterThanOrEqual(highThresholdResults.length);
    });

    it('should limit results to maxResults parameter', async () => {
      const results = await backend.search({
        query: 'patterns',
        maxResults: 2,
      });

      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(async () => {
      await backend.initialize();
    });

    it('should delete knowledge entries from both SQLite and vector storage', async () => {
      const entry: VectorKnowledgeEntry = {
        id: 'delete-test',
        query: 'test delete operation',
        result: { status: 'to be deleted' },
        source: 'test',
        timestamp: Date.now(),
        ttl: 86400000,
        accessCount: 0,
        lastAccessed: Date.now(),
        knowledgeType: 'fact',
        metadata: {
          type: 'test',
          domains: ['testing'],
        },
      };

      await backend.store(entry);
      
      // Verify it exists
      expect(await backend.get('delete-test')).toBeDefined();

      // Delete it
      const deleted = await backend.delete('delete-test');
      expect(deleted).toBe(true);

      // Verify it's gone
      expect(await backend.get('delete-test')).toBeNull();
    });

    it('should clear all knowledge entries', async () => {
      // Store multiple entries
      for (let i = 0; i < 3; i++) {
        const entry: VectorKnowledgeEntry = {
          id: `clear-test-${i}`,
          query: `test query ${i}`,
          result: { index: i },
          source: 'test',
          timestamp: Date.now(),
          ttl: 86400000,
          accessCount: 0,
          lastAccessed: Date.now(),
          knowledgeType: 'fact',
          metadata: {
            type: 'test',
            domains: ['testing'],
          },
        };
        await backend.store(entry);
      }

      // Clear all
      await backend.clear();

      // Verify all are gone
      for (let i = 0; i < 3; i++) {
        expect(await backend.get(`clear-test-${i}`)).toBeNull();
      }
    });

    it('should cleanup old entries based on maxAge', async () => {
      const oldTimestamp = Date.now() - 86400000 * 2; // 2 days ago
      const recentTimestamp = Date.now();

      // Store old entry
      const oldEntry: VectorKnowledgeEntry = {
        id: 'old-entry',
        query: 'old knowledge',
        result: { status: 'old' },
        source: 'test',
        timestamp: oldTimestamp,
        ttl: 86400000,
        accessCount: 0,
        lastAccessed: oldTimestamp,
        knowledgeType: 'fact',
        metadata: {
          type: 'test',
          domains: ['testing'],
        },
      };

      // Store recent entry
      const recentEntry: VectorKnowledgeEntry = {
        id: 'recent-entry',
        query: 'recent knowledge',
        result: { status: 'recent' },
        source: 'test',
        timestamp: recentTimestamp,
        ttl: 86400000,
        accessCount: 0,
        lastAccessed: recentTimestamp,
        knowledgeType: 'fact',
        metadata: {
          type: 'test',
          domains: ['testing'],
        },
      };

      await backend.store(oldEntry);
      await backend.store(recentEntry);

      // Cleanup entries older than 1 day
      const cleanedCount = await backend.cleanup(86400000);

      expect(cleanedCount).toBeGreaterThan(0);
      expect(await backend.get('recent-entry')).toBeDefined();
    });
  });

  describe('Statistics and Monitoring', () => {
    beforeEach(async () => {
      await backend.initialize();
    });

    it('should provide comprehensive statistics', async () => {
      // Store some test entries
      for (let i = 0; i < 5; i++) {
        const entry: VectorKnowledgeEntry = {
          id: `stats-test-${i}`,
          query: `test query ${i}`,
          result: { index: i },
          source: 'test',
          timestamp: Date.now(),
          ttl: 86400000,
          accessCount: 0,
          lastAccessed: Date.now(),
          knowledgeType: 'fact',
          metadata: {
            type: 'test',
            domains: ['testing'],
          },
        };
        await backend.store(entry);
      }

      const stats = await backend.getStats();

      expect(stats).toBeDefined();
      expect(stats.persistentEntries).toBeGreaterThan(0);
      expect(stats.vectorEntries).toBeDefined();
      expect(stats.embeddingModel).toBe('text-embedding-3-small');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when not initialized', async () => {
      const uninitializedBackend = new VectorRAGBackend(config);

      await expect(uninitializedBackend.store({} as any)).rejects.toThrow('not initialized');
      await expect(uninitializedBackend.get('test')).rejects.toThrow('not initialized');
      await expect(uninitializedBackend.search({})).rejects.toThrow('not initialized');
      await expect(uninitializedBackend.delete('test')).rejects.toThrow('not initialized');
      await expect(uninitializedBackend.cleanup(1000)).rejects.toThrow('not initialized');
      await expect(uninitializedBackend.clear()).rejects.toThrow('not initialized');
      await expect(uninitializedBackend.getStats()).rejects.toThrow('not initialized');
    });

    it('should handle invalid configuration gracefully', async () => {
      const invalidConfig = {
        ...config,
        vectorDimensions: -1, // Invalid
      };

      const invalidBackend = new VectorRAGBackend(invalidConfig);
      
      // Should still initialize but may have limited functionality
      await expect(invalidBackend.initialize()).resolves.not.toThrow();
    });
  });

  describe('Integration with Existing Systems', () => {
    beforeEach(async () => {
      await backend.initialize();
    });

    it('should work with SQLite backend configuration', async () => {
      const entry: VectorKnowledgeEntry = {
        id: 'integration-test',
        query: 'integration test query',
        result: { status: 'integrated' },
        source: 'integration test',
        timestamp: Date.now(),
        ttl: 86400000,
        accessCount: 0,
        lastAccessed: Date.now(),
        knowledgeType: 'fact',
        metadata: {
          type: 'integration',
          domains: ['testing', 'integration'],
        },
      };

      await backend.store(entry);
      const retrieved = await backend.get('integration-test');
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.metadata.type).toBe('integration');
    });

    it('should maintain compatibility with FACT types', async () => {
      // Test that the backend works with base FACTKnowledgeEntry type
      const basicEntry = {
        id: 'basic-fact',
        query: 'basic fact query',
        result: { answer: 'basic answer' },
        source: 'test',
        timestamp: Date.now(),
        ttl: 86400000,
        accessCount: 0,
        lastAccessed: Date.now(),
        metadata: {
          type: 'fact',
          domains: ['testing'],
        },
      };

      // Should accept and handle basic FACT entries
      await expect(backend.store(basicEntry as any)).resolves.not.toThrow();
      
      const retrieved = await backend.get('basic-fact');
      expect(retrieved).toBeDefined();
    });
  });

  describe('Architectural Knowledge', () => {
    beforeEach(async () => {
      config.enableArchitecturalKnowledge = true;
      await backend.initialize();
    });

    it('should find architectural decisions through semantic search', async () => {
      const results = await backend.search({
        query: 'What agent types are available for coordination?',
        maxResults: 5,
      });

      expect(results.length).toBeGreaterThan(0);
      
      const agentTypesResult = results.find(r => 
        r.knowledgeType === 'architectural-decision' &&
        r.metadata.domains.includes('coordination')
      );
      
      expect(agentTypesResult).toBeDefined();
    });

    it('should find orchestration architecture information', async () => {
      const results = await backend.search({
        query: 'multi-level orchestration parallel streams',
        maxResults: 5,
      });

      expect(results.length).toBeGreaterThan(0);
      
      const orchestrationResult = results.find(r => 
        r.knowledgeType === 'architectural-decision' &&
        r.metadata.domains.includes('orchestration')
      );
      
      expect(orchestrationResult).toBeDefined();
    });

    it('should provide detailed architectural decision context', async () => {
      const results = await backend.search({
        query: 'coordination agent types',
        type: 'architectural-decision',
        maxResults: 10,
      });

      const agentDecision = results.find(r => r.id === 'arch-decision-agent-types');
      expect(agentDecision).toBeDefined();
      expect(agentDecision?.result).toHaveProperty('types');
      expect(agentDecision?.semanticTags).toContain('agents');
    });
  });
});