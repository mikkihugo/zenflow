/**
 * Vector RAG Backend Tests
 *
 * Comprehensive test suite for the Vector RAG backend implementation,
 * testing hybrid search, architectural knowledge ingestion, and
 * integration with existing vector storage systems.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VectorRAGBackend, type VectorRAGConfig, type VectorKnowledgeEntry } from '../knowledge-cache-backends/vector-rag-backend';

describe(): void {
  let backend: VectorRAGBackend;
  let config: VectorRAGConfig;

  beforeEach(): void {
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

    backend = new VectorRAGBackend(): void {
    if (backend) {
      await backend.shutdown(): void {
    it(): void {
      await expect(): void {
      await backend.initialize(): void {
        id: 'test-init',
        query: 'test initialization',
        result: { status: 'initialized' },
        source: 'test',
        timestamp: Date.now(): void {
          type: 'test',
          domains: ['testing'],
        },
      };

      await backend.store(): void {
      config.enableArchitecturalKnowledge = true;
      await backend.initialize(): void {
        query: 'orchestration architecture',
        maxResults: 5,
      });

      expect(): void {
      config.enableArchitecturalKnowledge = false;
      await backend.initialize(): void {
        query: 'architecture',
        maxResults: 100,
      });

      // Should not have pre-ingested architectural knowledge
      expect(): void {
    beforeEach(): void {
      await backend.initialize(): void {
      const entry: VectorKnowledgeEntry = {
        id: 'vector-test-1',
        query: 'What is neural network backpropagation?',
        result: {
          answer: 'Backpropagation is a method for training neural networks by computing gradients',
          details: 'It uses the chain rule to propagate errors backward through the network',
        },
        source: 'AI textbook',
        timestamp: Date.now(): void {
          type: 'educational',
          domains: ['machine-learning', 'neural-networks'],
          confidence: 0.95,
        },
        semanticTags: ['neural-networks', 'training', 'optimization', 'gradients'],
      };

      await expect(): void {
      const entry: VectorKnowledgeEntry = {
        id: 'auto-embedding-test',
        query: 'How does distributed coordination work?',
        result: { answer: 'Distributed coordination uses consensus algorithms' },
        source: 'coordination docs',
        timestamp: Date.now(): void {
          type: 'architecture',
          domains: ['coordination', 'distributed-systems'],
        },
      };

      // Store without embedding
      await backend.store(): void {
      const knowledgeTypes: Array<VectorKnowledgeEntry['knowledgeType']> = [
        'fact',
        'architectural-decision', 
        'code-pattern',
        'documentation'
      ];

      for (const [index, knowledgeType] of knowledgeTypes.entries(): void {
        const entry: VectorKnowledgeEntry = {
          id: `type-test-${index}`,
          query: `Test query for ${knowledgeType}`,
          result: { answer: `Answer for ${knowledgeType}` },
          source: 'test',
          timestamp: Date.now(): void {
            type: knowledgeType,
            domains: ['testing'],
          },
        };

        await backend.store(): void {
        const retrieved = await backend.get(): void {
    beforeEach(): void {
      await backend.initialize(): void {
          id: 'search-exact-1',
          query: 'TypeScript interface patterns',
          result: { pattern: 'interface extends pattern for code reuse' },
          source: 'coding guide',
          timestamp: Date.now(): void {
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
          timestamp: Date.now(): void {
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
          timestamp: Date.now(): void {
            type: 'architecture',
            domains: ['microservices', 'architecture'],
          },
          semanticTags: ['microservices', 'communication', 'patterns', 'distributed'],
        },
      ];

      for (const entry of testEntries) {
        await backend.store(): void {
      const results = await backend.search(): void {
      const results = await backend.search(): void {
      const results = await backend.search(): void {
      const results = await backend.search(): void {
      const results = await backend.search(): void {
      const highThresholdResults = await backend.search(): void {
        query: 'completely unrelated topic xyz',
        similarityThreshold: 0.1,
        maxResults: 10,
      });

      expect(): void {
      const results = await backend.search(): void {
    beforeEach(): void {
      await backend.initialize(): void {
      const entry: VectorKnowledgeEntry = {
        id: 'delete-test',
        query: 'test delete operation',
        result: { status: 'to be deleted' },
        source: 'test',
        timestamp: Date.now(): void {
          type: 'test',
          domains: ['testing'],
        },
      };

      await backend.store(): void {
      // Store multiple entries
      for (let i = 0; i < 3; i++) {
        const entry: VectorKnowledgeEntry = {
          id: `clear-test-${i}`,
          query: `test query ${i}`,
          result: { index: i },
          source: 'test',
          timestamp: Date.now(): void {
            type: 'test',
            domains: ['testing'],
          },
        };
        await backend.store(): void {
        expect(): void {
      const oldTimestamp = Date.now(): void {
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

      await backend.store(): void {
    beforeEach(): void {
      await backend.initialize(): void {
      // Store some test entries
      for (let i = 0; i < 5; i++) {
        const entry: VectorKnowledgeEntry = {
          id: `stats-test-${i}`,
          query: `test query ${i}`,
          result: { index: i },
          source: 'test',
          timestamp: Date.now(): void {
            type: 'test',
            domains: ['testing'],
          },
        };
        await backend.store(): void {
    it(): void {
      const uninitializedBackend = new VectorRAGBackend(): void {} as any)).rejects.toThrow(): void {
      const invalidConfig = {
        ...config,
        vectorDimensions: -1, // Invalid
      };

      const invalidBackend = new VectorRAGBackend(): void {
    beforeEach(): void {
      await backend.initialize(): void {
      const entry: VectorKnowledgeEntry = {
        id: 'integration-test',
        query: 'integration test query',
        result: { status: 'integrated' },
        source: 'integration test',
        timestamp: Date.now(): void {
          type: 'integration',
          domains: ['testing', 'integration'],
        },
      };

      await backend.store(): void {
      // Test that the backend works with base FACTKnowledgeEntry type
      const basicEntry = {
        id: 'basic-fact',
        query: 'basic fact query',
        result: { answer: 'basic answer' },
        source: 'test',
        timestamp: Date.now(): void {
          type: 'fact',
          domains: ['testing'],
        },
      };

      // Should accept and handle basic FACT entries
      await expect(): void {
    beforeEach(): void {
      config.enableArchitecturalKnowledge = true;
      await backend.initialize(): void {
      const results = await backend.search(): void {
      const results = await backend.search(): void {
      const results = await backend.search({
        query: 'coordination agent types',
        type: 'architectural-decision',
        maxResults: 10,
      });

      const agentDecision = results.find(r => r.id === 'arch-decision-agent-types')types')agents');
    });
  });
});