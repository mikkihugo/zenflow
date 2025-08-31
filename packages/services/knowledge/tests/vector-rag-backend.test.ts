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
        _result: { status: 'initialized' },
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
        _result: {
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
        _result: { answer: 'Distributed coordination uses consensus algorithms' },
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
          id: `type-test-${index}"Fixed unterminated template" `Test query for ${knowledgeType}"Fixed unterminated template" `Answer for ${knowledgeType}"Fixed unterminated template" `clear-test-${i}"Fixed unterminated template" `test query ${i}"Fixed unterminated template" `stats-test-${i}"Fixed unterminated template" `test query ${i}"Fixed unterminated template"