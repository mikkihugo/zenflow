/**
 * @file Unit Tests for HiveKnowledgeBridge
 * Focused testing of the bridge component between Hive FACT and swarm coordination
 */

import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  CollectiveKnowledgeBridge,
  type KnowledgeRequest,
} from '../../coordination/collective-knowledge-bridge.ts';

// Mock dependencies
const mockHiveFACT = {
  searchFacts: vi.fn(),
  getFact: vi.fn(),
  on: vi.fn(),
  emit: vi.fn(),
};

const mockHiveCoordinator = new EventEmitter();
const mockMemoryStore = {
  store: vi.fn(),
  retrieve: vi.fn(),
};

describe('CollectiveKnowledgeBridge Unit Tests', () => {
  let bridge: CollectiveKnowledgeBridge;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    bridge = new CollectiveKnowledgeBridge(
      mockHiveCoordinator as any,
      mockMemoryStore as any
    );
    (bridge as any).hiveFact = mockHiveFACT;

    await bridge.initialize();
  });

  afterEach(async () => {
    await bridge.shutdown();
  });

  describe('Initialization', () => {
    test('should initialize successfully with valid dependencies', async () => {
      const newBridge = new CollectiveKnowledgeBridge(
        mockHiveCoordinator as any,
        mockMemoryStore as any
      );
      (newBridge as any).hiveFact = mockHiveFACT;

      await expect(newBridge.initialize()).resolves.not.toThrow();
      await newBridge.shutdown();
    });

    test('should throw error when HiveFACT is not available', async () => {
      const newBridge = new CollectiveKnowledgeBridge(
        mockHiveCoordinator as any,
        mockMemoryStore as any
      );
      // Don't set hiveFact

      await expect(newBridge.initialize()).rejects.toThrow(
        'HiveFACT system not available'
      );
    });
  });

  describe('Swarm Registration', () => {
    test('should register swarm with interests', async () => {
      await bridge.registerSwarm('swarm-1', ['authentication', 'frontend']);

      const stats = bridge.getStats();
      expect(stats.registeredSwarms).toBe(1);
      expect(mockMemoryStore.store).toHaveBeenCalledWith(
        'hive-bridge/swarms/swarm-1',
        'registration',
        expect.objectContaining({
          swarmId: 'swarm-1',
          interests: ['authentication', 'frontend'],
        })
      );
    });

    test('should update interests for existing swarm', async () => {
      await bridge.registerSwarm('swarm-1', ['authentication']);
      await bridge.registerSwarm('swarm-1', ['frontend', 'backend']);

      const stats = bridge.getStats();
      expect(stats.registeredSwarms).toBe(1); // Still just one swarm

      // Should be called twice
      expect(mockMemoryStore.store).toHaveBeenCalledTimes(2);
    });
  });

  describe('Knowledge Query Processing', () => {
    test('should process valid knowledge query', async () => {
      const mockFacts = [
        {
          id: 'fact-1',
          type: 'general',
          subject: 'authentication',
          content: { patterns: ['JWT', 'OAuth'] },
          metadata: {
            source: 'hive-fact',
            timestamp: Date.now(),
            confidence: 0.9,
          },
          accessCount: 1,
          cubeAccess: new Set(['cube-1']),
          swarmAccess: new Set(['swarm-1']),
        },
      ];

      mockHiveFACT.searchFacts.mockResolvedValue(mockFacts);

      const request: KnowledgeRequest = {
        requestId: 'req-1',
        swarmId: 'swarm-1',
        type: 'query',
        payload: { query: 'authentication patterns', domain: 'security' },
        priority: 'medium',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(true);
      expect((response?.data as any)?.results).toHaveLength(1);
      expect(response?.metadata?.source).toBe('hive-fact');
      expect(mockHiveFACT.searchFacts).toHaveBeenCalledWith({
        query: 'authentication patterns',
        domains: ['security'],
        limit: 10,
        sortBy: 'relevance',
      });
    });

    test('should handle query without domain', async () => {
      mockHiveFACT.searchFacts.mockResolvedValue([]);

      const request: KnowledgeRequest = {
        requestId: 'req-2',
        swarmId: 'swarm-1',
        type: 'query',
        payload: { query: 'general patterns' },
        priority: 'low',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(true);
      expect(mockHiveFACT.searchFacts).toHaveBeenCalledWith({
        query: 'general patterns',
        domains: undefined,
        limit: 10,
        sortBy: 'relevance',
      });
    });

    test('should handle query failure gracefully', async () => {
      mockHiveFACT.searchFacts.mockRejectedValue(new Error('Search failed'));

      const request: KnowledgeRequest = {
        requestId: 'req-3',
        swarmId: 'swarm-1',
        type: 'query',
        payload: { query: 'failing query' },
        priority: 'high',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(false);
      expect(response?.error).toBe('Search failed');
    });

    test('should enhance results with swarm context', async () => {
      const mockFacts = [
        {
          id: 'fact-1',
          type: 'general',
          subject: 'patterns',
          content: { data: 'test' },
          metadata: {
            source: 'hive-fact',
            timestamp: Date.now(),
            confidence: 0.8,
          },
          accessCount: 3,
          cubeAccess: new Set(['cube-1', 'cube-2']),
          swarmAccess: new Set(['swarm-1', 'swarm-2']),
        },
      ];

      mockHiveFACT.searchFacts.mockResolvedValue(mockFacts);

      const request: KnowledgeRequest = {
        requestId: 'req-4',
        swarmId: 'swarm-1',
        agentId: 'agent-1',
        type: 'query',
        payload: { query: 'test patterns' },
        priority: 'medium',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(true);
      expect((response?.data as any)?.results?.[0]).toHaveProperty('swarmContext');
      expect((response?.data as any)?.results?.[0]?.swarmContext).toHaveProperty(
        'relevanceScore'
      );
      expect((response?.data as any)?.results?.[0]?.swarmContext).toHaveProperty(
        'usageHistory'
      );
      expect((response?.data as any)?.results?.[0]?.swarmContext?.usageHistory).toBe(
        'previously-used'
      );
    });
  });

  describe('Knowledge Contribution Processing', () => {
    test('should process valid knowledge contribution', async () => {
      const contribution = {
        swarmId: 'swarm-1',
        agentId: 'agent-1',
        contributionType: 'pattern',
        domain: 'authentication',
        content: {
          title: 'JWT Pattern',
          description: 'Successful JWT implementation',
          implementation: '{"pattern": "jwt"}',
          metrics: { duration: 1000, quality: 0.9 },
          context: { taskType: 'auth', complexity: 'medium' },
        },
        confidence: 0.85,
        timestamp: Date.now(),
      };

      const request: KnowledgeRequest = {
        requestId: 'req-5',
        swarmId: 'swarm-1',
        type: 'contribution',
        payload: { knowledge: contribution },
        priority: 'medium',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(true);
      expect((response?.data as any)?.status).toBe('queued-for-processing');
      expect(response?.metadata?.source).toBe('swarm-contribution');
      expect(mockMemoryStore.store).toHaveBeenCalledWith(
        expect.stringContaining('hive-bridge/contributions/swarm-1/'),
        'contribution',
        contribution
      );
    });

    test('should reject contribution without required data', async () => {
      const request: KnowledgeRequest = {
        requestId: 'req-6',
        swarmId: 'swarm-1',
        type: 'contribution',
        payload: {}, // Missing knowledge data
        priority: 'medium',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(false);
      expect(response?.error).toBe('Knowledge contribution data is required');
    });
  });

  describe('Knowledge Update Processing', () => {
    test('should process knowledge update request', async () => {
      const updateData = {
        factId: 'fact-1',
        updates: { confidence: 0.95, newData: 'updated content' },
      };

      const request: KnowledgeRequest = {
        requestId: 'req-7',
        swarmId: 'swarm-1',
        type: 'update',
        payload: { knowledge: updateData },
        priority: 'high',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(true);
      expect((response?.data as any)?.status).toBe('update-queued');
      expect((response?.data as any)?.factId).toBe('fact-1');
    });

    test('should reject update without fact ID', async () => {
      const request: KnowledgeRequest = {
        requestId: 'req-8',
        swarmId: 'swarm-1',
        type: 'update',
        payload: { knowledge: {} }, // Missing factId
        priority: 'high',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(false);
      expect(response?.error).toBe('Fact ID is required for knowledge update');
    });
  });

  describe('Subscription Processing', () => {
    test('should process subscription request', async () => {
      const request: KnowledgeRequest = {
        requestId: 'req-9',
        swarmId: 'swarm-1',
        type: 'subscribe',
        payload: { domain: 'machine-learning' },
        priority: 'low',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(true);
      expect((response?.data as any)?.subscribed).toBe(true);
      expect((response?.data as any)?.domain).toBe('machine-learning');
    });

    test('should reject subscription without domain', async () => {
      const request: KnowledgeRequest = {
        requestId: 'req-10',
        swarmId: 'swarm-1',
        type: 'subscribe',
        payload: {}, // Missing domain
        priority: 'low',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(false);
      expect(response?.error).toBe(
        'Domain is required for knowledge subscription'
      );
    });
  });

  describe('Statistics and Monitoring', () => {
    test('should provide accurate statistics', async () => {
      // Register some swarms
      await bridge.registerSwarm('swarm-1', ['domain1']);
      await bridge.registerSwarm('swarm-2', ['domain2']);

      // Add some contributions to queue
      const contribution = {
        swarmId: 'swarm-1',
        agentId: 'agent-1',
        contributionType: 'pattern',
        domain: 'test',
        content: { title: 'test', description: 'test', context: {} },
        confidence: 0.8,
        timestamp: Date.now(),
      };

      await bridge.processKnowledgeRequest({
        requestId: 'req-stats',
        swarmId: 'swarm-1',
        type: 'contribution',
        payload: { knowledge: contribution },
        priority: 'medium',
        timestamp: Date.now(),
      });

      const stats = bridge.getStats();

      expect(stats.registeredSwarms).toBe(2);
      expect(stats.pendingRequests).toBe(0);
      expect(stats.queuedContributions).toBeGreaterThanOrEqual(0);
      expect(typeof stats.totalRequests).toBe('number');
      expect(typeof stats.averageResponseTime).toBe('number');
    });
  });

  describe('Error Handling', () => {
    test('should handle unsupported request types', async () => {
      const request = {
        requestId: 'req-unsupported',
        swarmId: 'swarm-1',
        type: 'unsupported-type' as any,
        payload: {},
        priority: 'medium' as const,
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(false);
      expect(response?.error).toContain('Unsupported request type');
    });

    test('should clean up pending requests on failure', async () => {
      mockHiveFACT.searchFacts.mockRejectedValue(new Error('System failure'));

      const request: KnowledgeRequest = {
        requestId: 'req-cleanup',
        swarmId: 'swarm-1',
        type: 'query',
        payload: { query: 'test' },
        priority: 'medium',
        timestamp: Date.now(),
      };

      const response = await bridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(false);

      // Pending request should be cleaned up
      const stats = bridge.getStats();
      expect(stats.pendingRequests).toBe(0);
    });
  });

  describe('Event Handling', () => {
    test('should emit events for significant operations', async () => {
      const eventsEmitted: string[] = [];

      bridge.on('swarm:registered', () =>
        eventsEmitted.push('swarm:registered')
      );
      bridge.on('knowledge:contributed', () =>
        eventsEmitted.push('knowledge:contributed')
      );
      bridge.on('knowledge:distributed', () =>
        eventsEmitted.push('knowledge:distributed')
      );

      // Register swarm
      await bridge.registerSwarm('swarm-test', ['test-domain']);

      // Make contribution
      const contribution = {
        swarmId: 'swarm-test',
        agentId: 'agent-1',
        contributionType: 'pattern',
        domain: 'test',
        content: { title: 'test', description: 'test', context: {} },
        confidence: 0.8,
        timestamp: Date.now(),
      };

      await bridge.processKnowledgeRequest({
        requestId: 'req-events',
        swarmId: 'swarm-test',
        type: 'contribution',
        payload: { knowledge: contribution },
        priority: 'medium',
        timestamp: Date.now(),
      });

      expect(eventsEmitted).toContain('swarm:registered');
      expect(eventsEmitted).toContain('knowledge:contributed');
    });
  });
});
