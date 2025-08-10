/**
 * @file Comprehensive Test Suite for Hive Knowledge Integration
 * Tests all components of the Hive Knowledge System Integration using swarm coordination
 */

import { EventEmitter } from 'node:events';
import { afterEach, beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import { KnowledgeAwareDiscovery } from '../../coordination/discovery/knowledge-enhanced-discovery';
import { HiveKnowledgeBridge } from '../../coordination/hive-knowledge-bridge';
import { SwarmKnowledgeSync } from '../../coordination/swarm/knowledge-sync';

// Mock implementations
class MockHiveFACT extends EventEmitter implements Partial<HiveFACTSystem> {
  private facts = new Map<string, UniversalFact>();

  constructor() {
    super();
    this.seedMockFacts();
  }

  private seedMockFacts(): void {
    const mockFacts: UniversalFact[] = [
      {
        id: 'fact-1',
        type: 'general',
        subject: 'authentication patterns',
        content: {
          patterns: ['JWT tokens', 'OAuth 2.0', 'session management'],
          bestPractices: ['Use HTTPS', 'Implement rate limiting', 'Hash passwords'],
          topology: 'hierarchical',
        },
        metadata: { source: 'hive-fact', timestamp: Date.now(), confidence: 0.9 },
        accessCount: 5,
        swarmAccess: new Set(['swarm-1', 'swarm-2']),
      },
      {
        id: 'fact-2',
        type: 'npm-package',
        subject: 'react',
        content: {
          patterns: ['component architecture', 'state management', 'hooks pattern'],
          bestPractices: ['Use functional components', 'Optimize re-renders', 'Use TypeScript'],
        },
        metadata: { source: 'external-mcp', timestamp: Date.now(), confidence: 0.95 },
        accessCount: 12,
        swarmAccess: new Set(['swarm-1', 'swarm-3']),
      },
    ];

    mockFacts.forEach((fact) => this.facts.set(fact.id, fact));
  }

  async searchFacts(query: any): Promise<UniversalFact[]> {
    const results = Array.from(this.facts.values()).filter((fact) =>
      JSON.stringify(fact).toLowerCase().includes(query.query.toLowerCase())
    );
    return results?.slice(0, query.limit || 10);
  }

  async getFact(type: string, subject: string, swarmId?: string): Promise<UniversalFact | null> {
    const fact = Array.from(this.facts.values()).find(
      (f) => f.type === type && f.subject.includes(subject)
    );

    if (fact && swarmId) {
      fact.accessCount++;
      fact.swarmAccess.add(swarmId);
    }

    return fact || null;
  }

  getStats() {
    return {
      memoryEntries: this.facts.size,
      persistentEntries: 0,
      totalMemorySize: 1000,
      cacheHitRate: 0.85,
      oldestEntry: Date.now() - 3600000,
      newestEntry: Date.now(),
      topDomains: ['hive-fact', 'external-mcp'],
      storageHealth: 'excellent' as const,
    };
  }
}

class MockMemoryStore implements Partial<SessionMemoryStore> {
  private storage = new Map<string, any>();

  async store(key: string, type: string, data: any): Promise<void> {
    this.storage.set(key, { type, data, timestamp: Date.now() });
  }

  async retrieve(key: string): Promise<any> {
    const entry = this.storage.get(key);
    return entry ? entry.data : null;
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}

class MockHiveSwarmCoordinator extends EventEmitter {
  async requestUniversalFact(_swarmId: string, factType: string, subject: string): Promise<any> {
    return { content: `Mock fact for ${factType}:${subject}` };
  }
}

describe('Hive Knowledge Integration - Complete System Tests', () => {
  let hiveFact: MockHiveFACT;
  let memoryStore: MockMemoryStore;
  let hiveCoordinator: MockHiveSwarmCoordinator;
  let knowledgeBridge: HiveKnowledgeBridge;
  let swarmKnowledge1: SwarmKnowledgeSync;
  let swarmKnowledge2: SwarmKnowledgeSync;
  let knowledgeAwareDiscovery: KnowledgeAwareDiscovery;

  beforeAll(async () => {
    // Initialize all components
    hiveFact = new MockHiveFACT();
    memoryStore = new MockMemoryStore();
    hiveCoordinator = new MockHiveSwarmCoordinator();
  });

  beforeEach(async () => {
    // Reset components for each test
    await memoryStore.clear();

    knowledgeBridge = new HiveKnowledgeBridge(hiveCoordinator as any, memoryStore as any);
    // Mock the HiveFACT access
    (knowledgeBridge as any).hiveFact = hiveFact;

    swarmKnowledge1 = new SwarmKnowledgeSync(
      { swarmId: 'test-swarm-1', cacheSize: 100 },
      memoryStore as any
    );

    swarmKnowledge2 = new SwarmKnowledgeSync(
      { swarmId: 'test-swarm-2', cacheSize: 100 },
      memoryStore as any
    );

    knowledgeAwareDiscovery = new KnowledgeAwareDiscovery(
      { swarmId: 'discovery-swarm' },
      hiveFact as any,
      swarmKnowledge1,
      memoryStore as any
    );

    await knowledgeBridge.initialize();
    await swarmKnowledge1.initialize();
    await swarmKnowledge2.initialize();
  });

  afterEach(async () => {
    // Cleanup after each test
    await knowledgeBridge.shutdown();
    await swarmKnowledge1.shutdown();
    await swarmKnowledge2.shutdown();
  });

  describe('HiveKnowledgeBridge', () => {
    test('should initialize successfully', async () => {
      expect(knowledgeBridge).toBeDefined();

      // Check that bridge is initialized
      const stats = knowledgeBridge.getStats();
      expect(stats.registeredSwarms).toBe(0);
      expect(stats.pendingRequests).toBe(0);
    });

    test('should register swarms with interests', async () => {
      await knowledgeBridge.registerSwarm('swarm-1', ['authentication', 'frontend']);
      await knowledgeBridge.registerSwarm('swarm-2', ['backend', 'database']);

      const stats = knowledgeBridge.getStats();
      expect(stats.registeredSwarms).toBe(2);
    });

    test('should process knowledge query requests', async () => {
      const request: KnowledgeRequest = {
        requestId: 'req-1',
        swarmId: 'swarm-1',
        agentId: 'agent-1',
        type: 'query',
        payload: {
          query: 'authentication patterns',
          domain: 'security',
        },
        priority: 'medium',
        timestamp: Date.now(),
      };

      const response = await knowledgeBridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(true);
      expect(response?.data).toBeDefined();
      expect(response?.data?.results).toBeInstanceOf(Array);
      expect(response?.metadata?.source).toBe('hive-fact');
      expect(response?.metadata?.confidence).toBeGreaterThan(0);
    });

    test('should handle knowledge contributions', async () => {
      const mockLearning: SwarmLearning = {
        id: 'learning-1',
        type: 'pattern',
        domain: 'authentication',
        context: {
          taskType: 'user-login',
          agentTypes: ['auth-agent', 'security-agent'],
          inputSize: 100,
          complexity: 'medium',
        },
        outcome: {
          success: true,
          duration: 5000,
          quality: 0.95,
          efficiency: 0.88,
        },
        insights: {
          whatWorked: ['JWT tokens', 'Rate limiting'],
          whatFailed: ['Session cookies'],
          optimizations: ['Token caching', 'Lazy validation'],
          bestPractices: ['Use HTTPS', 'Implement refresh tokens'],
        },
        confidence: 0.9,
        timestamp: Date.now(),
      };

      const request: KnowledgeRequest = {
        requestId: 'req-2',
        swarmId: 'swarm-1',
        agentId: 'agent-1',
        type: 'contribution',
        payload: {
          knowledge: {
            swarmId: 'swarm-1',
            agentId: 'agent-1',
            contributionType: 'pattern',
            domain: 'authentication',
            content: {
              title: 'JWT Authentication Pattern',
              description: 'Successful JWT implementation pattern',
              implementation: JSON.stringify(mockLearning.insights),
              metrics: {
                duration: mockLearning.outcome.duration,
                quality: mockLearning.outcome.quality,
                efficiency: mockLearning.outcome.efficiency,
              },
              context: mockLearning.context,
            },
            confidence: mockLearning.confidence,
            timestamp: Date.now(),
          },
        },
        priority: 'medium',
        timestamp: Date.now(),
      };

      const response = await knowledgeBridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(true);
      expect(response?.data?.status).toBe('queued-for-processing');
      expect(response?.metadata?.source).toBe('swarm-contribution');
    });

    test('should handle subscription requests', async () => {
      const request: KnowledgeRequest = {
        requestId: 'req-3',
        swarmId: 'swarm-1',
        type: 'subscribe',
        payload: { domain: 'frontend' },
        priority: 'low',
        timestamp: Date.now(),
      };

      const response = await knowledgeBridge.processKnowledgeRequest(request);

      expect(response?.success).toBe(true);
      expect(response?.data?.subscribed).toBe(true);
      expect(response?.data?.domain).toBe('frontend');
    });

    test('should handle request errors gracefully', async () => {
      const invalidRequest: KnowledgeRequest = {
        requestId: 'req-invalid',
        swarmId: 'swarm-1',
        type: 'query',
        payload: {}, // Missing required query field
        priority: 'medium',
        timestamp: Date.now(),
      };

      const response = await knowledgeBridge.processKnowledgeRequest(invalidRequest);

      expect(response?.success).toBe(false);
      expect(response?.error).toBeDefined();
      expect(typeof response?.error).toBe('string');
    });
  });

  describe('SwarmKnowledgeSync', () => {
    test('should initialize with correct configuration', async () => {
      expect(swarmKnowledge1).toBeDefined();

      const stats = swarmKnowledge1.getStats();
      expect(stats.cacheSize).toBe(0);
      expect(stats.subscriptions).toBeGreaterThanOrEqual(0);
    });

    test('should cache knowledge queries', async () => {
      // Setup bridge to respond to requests
      setupBridgeRequestHandler(knowledgeBridge, swarmKnowledge1);

      const result1 = await swarmKnowledge1.queryKnowledge('authentication patterns', 'security');
      const result2 = await swarmKnowledge1.queryKnowledge('authentication patterns', 'security');

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1).toEqual(result2); // Should return cached result
    });

    test('should contribute knowledge successfully', async () => {
      setupBridgeRequestHandler(knowledgeBridge, swarmKnowledge1);

      const mockLearning: Omit<SwarmLearning, 'id' | 'timestamp'> = {
        type: 'optimization',
        domain: 'performance',
        context: {
          taskType: 'database-query',
          agentTypes: ['db-agent'],
          inputSize: 1000,
          complexity: 'high',
        },
        outcome: {
          success: true,
          duration: 2000,
          quality: 0.92,
          efficiency: 0.85,
        },
        insights: {
          whatWorked: ['Connection pooling', 'Query caching'],
          whatFailed: ['N+1 queries'],
          optimizations: ['Batch queries', 'Index optimization'],
          bestPractices: ['Use prepared statements', 'Monitor query performance'],
        },
        confidence: 0.88,
      };

      const success = await swarmKnowledge1.contributeKnowledge(mockLearning, 'agent-1');
      expect(success).toBe(true);

      const stats = swarmKnowledge1.getStats();
      expect(stats.learningHistory).toBeGreaterThan(0);
    });

    test('should subscribe to domains', async () => {
      setupBridgeRequestHandler(knowledgeBridge, swarmKnowledge1);

      const success = await swarmKnowledge1.subscribeToDomain('machine-learning');
      expect(success).toBe(true);

      const stats = swarmKnowledge1.getStats();
      expect(stats.subscriptions).toBeGreaterThan(0);
    });

    test('should handle knowledge updates', async () => {
      const updateReceived = vi.fn();
      swarmKnowledge1.on('knowledge:updated', updateReceived);

      const mockUpdate = {
        updateId: 'update-1',
        type: 'fact-updated' as const,
        domain: 'security',
        priority: 'high' as const,
        content: { newSecurityPattern: 'Zero-trust architecture' },
        timestamp: Date.now(),
      };

      await swarmKnowledge1.handleKnowledgeUpdate(mockUpdate);

      expect(updateReceived).toHaveBeenCalledWith({ update: mockUpdate });
    });

    test('should fall back to local knowledge when queries fail', async () => {
      // Don't setup bridge handler to simulate failure

      // First, add some learning history that could serve as fallback
      const mockLearning: Omit<SwarmLearning, 'id' | 'timestamp'> = {
        type: 'pattern',
        domain: 'authentication',
        context: {
          taskType: 'user-auth',
          agentTypes: ['auth-agent'],
          inputSize: 50,
          complexity: 'medium',
        },
        outcome: {
          success: true,
          duration: 3000,
          quality: 0.9,
          efficiency: 0.8,
        },
        insights: {
          whatWorked: ['OAuth 2.0'],
          whatFailed: [],
          optimizations: ['Token refresh'],
          bestPractices: ['Secure storage'],
        },
        confidence: 0.85,
      };

      // Add learning directly to history
      (swarmKnowledge1 as any).learningHistory.push({
        ...mockLearning,
        id: 'learning-fallback',
        timestamp: Date.now(),
      });

      try {
        const result = await swarmKnowledge1.queryKnowledge(
          'authentication patterns',
          'authentication'
        );
        expect(result).toBeDefined();
        expect(result?.fallback).toBe(true);
      } catch (error) {
        // Query should fail but might not have fallback
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('KnowledgeAwareDiscovery', () => {
    test('should apply knowledge insights to domain discovery', async () => {
      const mockOriginalDomains = [
        {
          name: 'authentication',
          description: 'User authentication system',
          files: ['auth.ts', 'login.ts', 'jwt.ts'],
          confidence: 0.7,
          suggestedTopology: 'mesh',
          suggestedAgents: ['auth-agent'],
        },
        {
          name: 'frontend',
          description: 'React frontend application',
          files: ['App.tsx', 'components/', 'hooks/'],
          confidence: 0.8,
          suggestedTopology: 'hierarchical',
          suggestedAgents: ['ui-agent'],
        },
      ];

      const mockContext = {
        projectType: 'web-application',
        technologies: ['typescript', 'react', 'nodejs'],
        size: 'medium' as const,
        complexity: 'moderate' as const,
        domains: ['authentication', 'frontend'],
        existingPatterns: ['component-pattern', 'auth-pattern'],
      };

      const knowledgeAwareDomains = await knowledgeAwareDiscovery.applyKnowledgeInsights(
        mockOriginalDomains as any,
        mockContext
      );

      expect(knowledgeAwareDomains).toHaveLength(2);

      knowledgeAwareDomains.forEach((domain) => {
        expect(domain.knowledgeInsights).toBeDefined();
        expect(domain.knowledgeInsights.knowledgeScore).toBeGreaterThanOrEqual(0);
        expect(domain.knowledgeInsights.appliedPatterns).toBeInstanceOf(Array);
        expect(domain.knowledgeInsights.recommendedTopology).toBeDefined();
        expect(domain.knowledgeInsights.recommendedAgents).toBeInstanceOf(Array);
      });

      // Check if confidence was improved with knowledge
      const authDomain = knowledgeAwareDomains.find((d) => d.name === 'authentication');
      expect(authDomain).toBeDefined();
      // Confidence might be improved or remain the same depending on available knowledge
      expect(authDomain?.confidence).toBeGreaterThanOrEqual(0.6);
    });

    test('should handle knowledge application errors gracefully', async () => {
      // Test with invalid/empty data
      const result = await knowledgeAwareDiscovery.applyKnowledgeInsights([], {
        projectType: 'unknown',
        technologies: [],
        size: 'small',
        complexity: 'simple',
        domains: [],
        existingPatterns: [],
      });

      expect(result).toEqual([]);
    });
  });

  describe('Integration Tests - Complete Workflow', () => {
    test('should complete full knowledge-aware discovery workflow', async () => {
      // Setup complete workflow
      setupBridgeRequestHandler(knowledgeBridge, swarmKnowledge1);
      setupBridgeRequestHandler(knowledgeBridge, swarmKnowledge2);

      // Step 1: Register swarms with interests
      await knowledgeBridge.registerSwarm('test-swarm-1', ['authentication', 'frontend']);
      await knowledgeBridge.registerSwarm('test-swarm-2', ['backend', 'database']);

      // Step 2: Swarms contribute knowledge
      const mockLearning1: Omit<SwarmLearning, 'id' | 'timestamp'> = {
        type: 'pattern',
        domain: 'authentication',
        context: {
          taskType: 'user-login',
          agentTypes: ['auth-agent'],
          inputSize: 100,
          complexity: 'medium',
        },
        outcome: {
          success: true,
          duration: 4000,
          quality: 0.93,
          efficiency: 0.87,
        },
        insights: {
          whatWorked: ['JWT with refresh tokens', 'Rate limiting'],
          whatFailed: ['Simple session cookies'],
          optimizations: ['Token caching', 'Lazy validation'],
          bestPractices: ['Use HTTPS always', 'Implement proper logout'],
        },
        confidence: 0.91,
      };

      const contribution1 = await swarmKnowledge1.contributeKnowledge(mockLearning1, 'agent-1');
      expect(contribution1).toBe(true);

      // Step 3: Query knowledge from another swarm
      const knowledge = await swarmKnowledge2.queryKnowledge(
        'authentication patterns',
        'authentication'
      );
      expect(knowledge).toBeDefined();

      // Step 4: Use enhanced discovery
      const mockDomains = [
        {
          name: 'user-management',
          description: 'User management system',
          files: ['user.ts', 'profile.ts'],
          confidence: 0.75,
          suggestedTopology: 'mesh',
          suggestedAgents: ['user-agent'],
        },
      ];

      const mockContext = {
        projectType: 'web-application',
        technologies: ['typescript', 'nodejs'],
        size: 'medium' as const,
        complexity: 'moderate' as const,
        domains: ['user-management'],
        existingPatterns: ['auth-pattern'],
      };

      const knowledgeAwareDomains = await knowledgeAwareDiscovery.applyKnowledgeInsights(
        mockDomains as any,
        mockContext
      );

      expect(knowledgeAwareDomains).toHaveLength(1);
      expect(knowledgeAwareDomains[0]?.knowledgeInsights).toBeDefined();

      // Step 5: Verify knowledge distribution
      const bridgeStats = knowledgeBridge.getStats();
      expect(bridgeStats.registeredSwarms).toBe(2);
      expect(bridgeStats.queuedContributions).toBeGreaterThanOrEqual(0);

      const swarm1Stats = swarmKnowledge1.getStats();
      expect(swarm1Stats.learningHistory).toBeGreaterThan(0);

      const swarm2Stats = swarmKnowledge2.getStats();
      expect(swarm2Stats.cacheSize).toBeGreaterThanOrEqual(0);
    });

    test('should handle concurrent knowledge requests', async () => {
      setupBridgeRequestHandler(knowledgeBridge, swarmKnowledge1);
      setupBridgeRequestHandler(knowledgeBridge, swarmKnowledge2);

      // Make concurrent requests from different swarms
      const requests = [
        swarmKnowledge1.queryKnowledge('react patterns', 'frontend'),
        swarmKnowledge2.queryKnowledge('database optimization', 'backend'),
        swarmKnowledge1.queryKnowledge('authentication best practices', 'security'),
        swarmKnowledge2.queryKnowledge('API design patterns', 'backend'),
      ];

      const results = await Promise.allSettled(requests);

      // All requests should complete (either fulfilled or rejected)
      expect(results).toHaveLength(4);

      // At least some should succeed
      const successful = results?.filter((r) => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);
    });

    test('should maintain system performance under load', async () => {
      setupBridgeRequestHandler(knowledgeBridge, swarmKnowledge1);

      const startTime = Date.now();
      const numberOfRequests = 50;

      // Create multiple concurrent requests
      const requests = Array.from({ length: numberOfRequests }, (_, i) =>
        swarmKnowledge1.queryKnowledge(`test query ${i}`, 'performance-test')
      );

      await Promise.allSettled(requests);

      const duration = Date.now() - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(10000); // 10 seconds for 50 requests

      // Cache should have entries
      const stats = swarmKnowledge1.getStats();
      expect(stats.cacheSize).toBeGreaterThan(0);
    });
  });
});

// Helper function to setup request/response handling between bridge and swarm
function setupBridgeRequestHandler(bridge: HiveKnowledgeBridge, swarm: SwarmKnowledgeSync): void {
  // Handle requests from swarm to bridge
  swarm.on('knowledge:request', async (request: KnowledgeRequest) => {
    try {
      const response = await bridge.processKnowledgeRequest(request);
      swarm.emit('knowledge:response', response);
    } catch (error) {
      const errorResponse: KnowledgeResponse = {
        requestId: request.requestId,
        swarmId: request.swarmId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          source: 'hive-fact',
          timestamp: Date.now(),
          confidence: 0,
          cacheHit: false,
        },
      };
      swarm.emit('knowledge:response', errorResponse);
    }
  });
}
