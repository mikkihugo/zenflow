/**
 * @file Shared FACT System Integration Tests
 * Tests that ALL hierarchy levels have proper shared FACT access.
 *
 * CRITICAL VALIDATION:
 * Ensures FACT system is SHARED like "manuals of the internet" - same access for ALL levels
 * (Cubes, Matrons, Queens, SwarmCommanders, Agents)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  getUniversalFACTAccess,
  validateUniversalFACTAccess,
  initializeUniversalFACTAccess,
} from '../../coordination/shared-fact-access.js';
import {
  hierarchyFACTValidator,
  quickValidateSharedFACT,
} from '../../coordination/hierarchy-fact-validation.js';
import {
  getDSPySharedFACTSystem,
  initializeDSPySharedFACT,
} from '../../coordination/shared-fact-integration.js';
import { EnhancedBaseAgent } from '../../coordination/agents/enhanced-base-agent.js';

describe('Shared FACT System Integration', () => {
  beforeAll(async () => {
    // Initialize the universal FACT access system
    await initializeUniversalFACTAccess();
    await initializeDSPySharedFACT();
  });

  describe('Universal FACT Access', () => {
    it('should provide same FACT instance to all hierarchy levels', async () => {
      const hierarchyLevels = [
        'Cube',
        'Matron',
        'Queen',
        'SwarmCommander',
        'Agent',
      ] as const;

      // Get FACT system for each hierarchy level
      const factSystems = await Promise.all(
        hierarchyLevels.map((level) => getUniversalFACTAccess(level))
      );

      // Verify all levels get the same instance
      const firstInstance = factSystems[0];
      for (let i = 1; i < factSystems.length; i++) {
        expect(factSystems[i]).toBe(firstInstance);
      }
    });

    it('should validate universal access across all levels', async () => {
      const validation = await validateUniversalFACTAccess();

      expect(validation.success).toBe(true);
      expect(validation.accessLevels).toBeDefined();

      // All levels should have access
      const levels = ['Cube', 'Matron', 'Queen', 'SwarmCommander', 'Agent'];
      for (const level of levels) {
        expect(validation.accessLevels[level]).toBe(true);
      }
    });

    it('should allow all hierarchy levels to search facts', async () => {
      const hierarchyLevels = [
        'Cube',
        'Matron',
        'Queen',
        'SwarmCommander',
        'Agent',
      ] as const;

      for (const level of hierarchyLevels) {
        const factSystem = await getUniversalFACTAccess(level);

        const searchResults = await factSystem.searchFacts({
          query: `test-${level.toLowerCase()}-search`,
          limit: 5,
        });

        expect(Array.isArray(searchResults)).toBe(true);
      }
    });

    it('should allow all hierarchy levels to store facts', async () => {
      const hierarchyLevels = [
        'Cube',
        'Matron',
        'Queen',
        'SwarmCommander',
        'Agent',
      ] as const;

      for (const level of hierarchyLevels) {
        const factSystem = await getUniversalFACTAccess(level);

        const testFact = {
          id: `test-${level.toLowerCase()}-${Date.now()}`,
          type: 'general' as const,
          category: 'test',
          subject: `test-fact-${level}`,
          content: { test: true, level, timestamp: Date.now() },
          source: `${level}-test`,
          confidence: 0.95,
          timestamp: Date.now(),
          metadata: {
            source: `${level}-test`,
            timestamp: Date.now(),
            confidence: 0.95,
            testFact: true,
          },
          accessCount: 0,
          cubeAccess: new Set<string>(),
          swarmAccess: new Set<string>(),
        };

        // Should not throw error
        await expect(factSystem.storeFact(testFact)).resolves.not.toThrow();
      }
    });
  });

  describe('Hierarchy Validation', () => {
    it('should run comprehensive hierarchy validation successfully', async () => {
      const validation =
        await hierarchyFACTValidator.validateCompleteHierarchy();

      expect(validation.success).toBe(true);
      expect(validation.universalAccessValidated).toBe(true);
      expect(validation.sharedFACTSystemActive).toBe(true);
      expect(validation.hierarchyLevels).toHaveLength(5);

      // All hierarchy levels should pass validation
      for (const levelValidation of validation.hierarchyLevels) {
        expect(levelValidation.hasAccess).toBe(true);
        expect(levelValidation.canSearch).toBe(true);
        expect(levelValidation.canStore).toBe(true);
        expect(levelValidation.sharedInstance).toBe(true);
      }
    });

    it('should pass quick health check', async () => {
      const healthCheck = await quickValidateSharedFACT();

      expect(healthCheck.healthy).toBe(true);
      expect(healthCheck.issues).toHaveLength(0);
      expect(healthCheck.timestamp).toBeGreaterThan(0);
    });

    it('should have reasonable performance metrics', async () => {
      const validation =
        await hierarchyFACTValidator.validateCompleteHierarchy();

      // Performance should be reasonable (less than 2 seconds per operation)
      expect(validation.performanceMetrics.averageSearchTime).toBeLessThan(
        2000
      );
      expect(validation.performanceMetrics.averageStoreTime).toBeLessThan(2000);
      expect(validation.performanceMetrics.totalValidationTime).toBeLessThan(
        10000
      );
    });
  });

  describe('DSPy Integration', () => {
    it('should initialize DSPy shared FACT system', async () => {
      const dspySystem = getDSPySharedFACTSystem();
      expect(dspySystem).toBeDefined();
    });

    it('should support DSPy learning from fact access', async () => {
      const dspySystem = getDSPySharedFACTSystem();

      // Should not throw error
      await expect(
        dspySystem.learnFromFactAccess('test-fact-id', 'SwarmCommander', true)
      ).resolves.not.toThrow();
    });

    it('should support DSPy fact retrieval optimization', async () => {
      const dspySystem = getDSPySharedFACTSystem();

      const optimizedResults = await dspySystem.optimizeFactRetrieval({
        query: 'test optimization',
        hierarchyLevel: 'Agent',
        context: { test: true },
      });

      expect(optimizedResults).toBeDefined();
    });

    it('should support DSPy relevance prediction', async () => {
      const dspySystem = getDSPySharedFACTSystem();

      const relevance = await dspySystem.predictFactRelevance(
        {
          id: 'test-fact',
          type: 'npm-package',
          subject: 'react',
          confidence: 0.9,
        },
        {
          hierarchyLevel: 'SwarmCommander',
          queryType: 'package-info',
        }
      );

      expect(relevance).toBeGreaterThanOrEqual(0);
      expect(relevance).toBeLessThanOrEqual(1);
    });

    it('should support DSPy fact embeddings generation', async () => {
      const dspySystem = getDSPySharedFACTSystem();

      const embeddings = await dspySystem.generateFactEmbeddings({
        subject: 'test fact',
        content: { description: 'test fact content' },
        type: 'general',
      });

      expect(Array.isArray(embeddings)).toBe(true);
      expect(embeddings.length).toBe(384); // Standard embedding dimension
    });
  });

  describe('Enhanced Agent Integration', () => {
    it('should create enhanced agents with FACT access', async () => {
      const agent = new EnhancedBaseAgent({
        id: 'test-enhanced-agent',
        type: 'researcher',
        name: 'Test Enhanced Agent',
      });

      await agent.initialize();

      // Agent should have FACT capabilities
      expect(typeof agent.getSharedFACTSystem).toBe('function');
      expect(typeof agent.searchSharedFacts).toBe('function');
      expect(typeof agent.storeSharedFact).toBe('function');
    });

    it('should allow enhanced agents to access shared FACT system', async () => {
      const agent = new EnhancedBaseAgent({
        id: 'test-fact-agent',
        type: 'coder',
        name: 'Test FACT Agent',
      });

      await agent.initialize();

      // Agent should be able to access FACT system
      const factSystem = await agent.getSharedFACTSystem();
      expect(factSystem).toBeDefined();

      // Agent should be able to search facts
      const searchResults = await agent.searchSharedFacts({
        query: 'test agent search',
        limit: 3,
      });
      expect(Array.isArray(searchResults)).toBe(true);
    });

    it('should allow enhanced agents to store facts', async () => {
      const agent = new EnhancedBaseAgent({
        id: 'test-store-agent',
        type: 'analyst',
        name: 'Test Store Agent',
      });

      await agent.initialize();

      // Agent should be able to store facts
      await expect(
        agent.storeSharedFact({
          type: 'general',
          subject: 'test-agent-fact',
          content: { agentGenerated: true, timestamp: Date.now() },
          source: 'test-enhanced-agent',
          confidence: 0.8,
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Cross-Level Knowledge Sharing', () => {
    it('should allow facts stored by one level to be accessible by all levels', async () => {
      const swarmCommanderFACT = await getUniversalFACTAccess('SwarmCommander');
      const agentFACT = await getUniversalFACTAccess('Agent');
      const queenFACT = await getUniversalFACTAccess('Queen');

      // Store fact via SwarmCommander
      const testFact = {
        id: `cross-level-test-${Date.now()}`,
        type: 'general' as const,
        category: 'cross-level-test',
        subject: 'cross-level-knowledge',
        content: {
          message: 'This fact should be accessible to all hierarchy levels',
          storedBy: 'SwarmCommander',
          timestamp: Date.now(),
        },
        source: 'SwarmCommander-test',
        confidence: 0.95,
        timestamp: Date.now(),
        metadata: {
          source: 'SwarmCommander-test',
          timestamp: Date.now(),
          confidence: 0.95,
          crossLevelTest: true,
        },
        accessCount: 0,
        cubeAccess: new Set<string>(),
        swarmAccess: new Set<string>(),
      };

      await swarmCommanderFACT.storeFact(testFact);

      // Verify Agent can find the fact
      const agentResults = await agentFACT.searchFacts({
        query: 'cross-level-knowledge',
        limit: 5,
      });
      expect(agentResults.length).toBeGreaterThan(0);

      // Verify Queen can find the fact
      const queenResults = await queenFACT.searchFacts({
        query: 'cross-level-knowledge',
        limit: 5,
      });
      expect(queenResults.length).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    // Cleanup test facts and resources
    try {
      const factSystem = await getUniversalFACTAccess('Agent');
      // In a production system, we might clean up test facts here

      console.log('✅ Shared FACT system tests completed successfully');
    } catch (error) {
      console.warn('Test cleanup failed:', error);
    }
  });
});
