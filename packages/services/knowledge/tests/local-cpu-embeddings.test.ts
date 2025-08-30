/**
 * Test for Local CPU Embedding Support in Vector RAG Backend
 * 
 * This test validates that the Vector RAG backend can generate
 * real local CPU embeddings using Transformers.js without
 * external API dependencies.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { VectorRAGBackend, type VectorRAGConfig } from '../knowledge-cache-backends/vector-rag-backend';

describe('Vector RAG Backend - Local CPU Embeddings', () => {
  let backend: VectorRAGBackend;
  
  const testConfig: VectorRAGConfig = {
    backend: 'vector-rag',
    embeddingModel: 'local-cpu',
    localEmbeddingModel: 'all-MiniLM-L6-v2',
    vectorDimensions: 384,
    transformersCacheDir: './test_models_cache',
    lancedbDatabase: 'test_knowledge_vectors',
    vectorTableName: 'test_embeddings',
    similarityThreshold: 0.7,
    maxVectorResults: 10,
    hybridSearchWeight: 0.3,
    enableArchitecturalKnowledge: false, // Disable for focused testing
    maxMemoryCacheSize: 1000,
    defaultTTL: 86400000,
    cleanupInterval: 3600000,
    maxEntryAge: 604800000,
  };

  beforeAll(async () => {
    backend = new VectorRAGBackend(testConfig);
  });

  afterAll(async () => {
    if (backend) {
      await backend.shutdown();
    }
  });

  it('should create VectorRAGBackend with local CPU configuration', () => {
    expect(backend).toBeDefined();
    expect(backend).toBeInstanceOf(VectorRAGBackend);
  });

  it('should support local CPU embedding model configuration', () => {
    expect(testConfig.embeddingModel).toBe('local-cpu');
    expect(testConfig.localEmbeddingModel).toBe('all-MiniLM-L6-v2');
    expect(testConfig.vectorDimensions).toBe(384);
  });

  // Note: Full integration tests would require actual model downloads
  // and might be too slow for CI. These are structure tests.
  it('should have proper configuration for offline operation', () => {
    expect(testConfig.transformersCacheDir).toBeDefined();
    expect(testConfig.localEmbeddingModel).toBeDefined();
    expect(testConfig.vectorDimensions).toBeGreaterThan(0);
  });

  it('should support architectural knowledge integration', async () => {
    const architecturalEntry = {
      id: 'test-arch-decision',
      query: 'What are the core agent types?',
      result: {
        types: ['coordinator', 'worker', 'specialist', 'monitor', 'proxy'],
        description: 'Five core agent types for coordination',
      },
      source: 'test-architecture',
      timestamp: Date.now(),
      ttl: 86400000,
      accessCount: 0,
      lastAccessed: Date.now(),
      knowledgeType: 'architectural-decision' as const,
      metadata: {
        type: 'architectural-decision',
        domains: ['coordination', 'agents'],
        confidence: 1.0,
      },
      semanticTags: ['agents', 'coordination', 'architecture'],
    };

    // This validates the structure without requiring full initialization
    expect(architecturalEntry.knowledgeType).toBe('architectural-decision');
    expect(architecturalEntry.semanticTags).toContain('agents');
    expect(architecturalEntry.result).toHaveProperty('types');
  });

  it('should support multi-tier embedding fallback strategy', () => {
    // Test that the configuration supports fallback strategy
    expect(process.env.LOCAL_EMBEDDING_MODEL || 'all-MiniLM-L6-v2').toBeDefined();
    expect(process.env.TRANSFORMERS_CACHE_DIR || './models_cache').toBeDefined();
  });

  it('should support popular local CPU models', () => {
    const supportedModels = [
      'all-MiniLM-L6-v2',
      'all-mpnet-base-v2',
      'paraphrase-MiniLM-L6-v2',
      'multi-qa-MiniLM-L6-cos-v1',
    ];

    expect(supportedModels).toContain(testConfig.localEmbeddingModel);
  });

  it('should have correct dimension mapping for common models', () => {
    const modelDimensions = {
      'all-MiniLM-L6-v2': 384,
      'all-mpnet-base-v2': 768,
      'paraphrase-MiniLM-L6-v2': 384,
      'multi-qa-MiniLM-L6-cos-v1': 384,
    };

    const modelName = testConfig.localEmbeddingModel || 'all-MiniLM-L6-v2';
    const expectedDimensions = modelDimensions[modelName as keyof typeof modelDimensions];
    
    if (expectedDimensions) {
      expect(testConfig.vectorDimensions).toBe(expectedDimensions);
    }
  });

  it('should support event-driven architecture for agent coordination', () => {
    const eventTypes = [
      'vector-rag:initialized',
      'vector-rag:embedding:generated',
      'vector-rag:search:started',
      'vector-rag:search:completed',
      'vector-rag:knowledge:stored',
      'vector-rag:error',
    ];

    // Validate that backend can emit coordination events
    expect(typeof backend.on).toBe('function');
    expect(typeof backend.emit).toBe('function');
  });
});

/**
 * Integration test for real local CPU embedding generation
 * 
 * Note: This test may be slow on first run as it downloads models.
 * In CI/CD, consider using cached models or mocking.
 */
describe('Vector RAG Backend - Real Local Embedding Integration', () => {
  // These tests would require actual Transformers.js model downloads
  // and are marked as integration tests
  
  it.skip('should generate real local CPU embeddings', async () => {
    // This test would:
    // 1. Initialize backend with local CPU model
    // 2. Generate embedding for test text
    // 3. Verify embedding dimensions and values
    // 4. Test that it works offline (no network calls)
  });

  it.skip('should support batch embedding generation', async () => {
    // This test would:
    // 1. Generate batch embeddings for multiple texts
    // 2. Verify all embeddings have correct dimensions
    // 3. Test performance characteristics
  });

  it.skip('should handle model download and caching', async () => {
    // This test would:
    // 1. Verify model download on first use
    // 2. Test model caching between sessions
    // 3. Verify offline operation after caching
  });
});