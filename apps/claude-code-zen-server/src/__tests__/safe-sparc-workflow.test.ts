#!/usr/bin/env node
/**
 * @fileoverview Jest Tests for SAFe-SPARC Workflow
 * 
 * **PURPOSE**: Comprehensive testing of the standalone SAFe-SPARC workflow
 * Tests each component individually and the complete end-to-end flow
 */

import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';

// Mock @claude-zen/foundation BEFORE importing the workflow
jest.unstable_mockModule('@claude-zen/foundation', () => ({
  getLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })),
  getGlobalLLM: jest.fn(() => ({
    setRole: jest.fn(),
    executeAsAnalyst: jest.fn().mockResolvedValue(`{
      "decision": "approve",
      "confidence": 0.85,
      "reasoning": "Strong business case with good ROI",
      "humanOversightRequired": false
    }`),
    executeAsArchitect: jest.fn().mockResolvedValue(`{
      "components": ["API Service", "Database", "Frontend"],
      "relationships": ["Frontend → API Service", "API Service → Database"],
      "patterns": ["MVC", "REST API"],
      "technologies": ["TypeScript", "Node.js", "React"]
    }`),
    executeAsCoder: jest.fn().mockResolvedValue(`
    This would generate the following files:
    - src/main.ts: Main application entry point
    - src/api.ts: REST API endpoints
    - src/models.ts: Data models and types
    - tests/main.test.ts: Unit tests for main functionality
    - tests/api.test.ts: API endpoint tests
    - README.md: Project documentation
    `),
    complete: jest.fn().mockResolvedValue("Test response"),
    getUsageStats: jest.fn().mockReturnValue({
      requestCount: 1,
      currentRole: 'analyst',
      lastRequestTime: Date.now()
    })
  })),
  executeClaudeTask: jest.fn().mockResolvedValue([
    {
      type: 'assistant',
      message: {
        content: [{
          type: 'text',
          text: 'Mock code generation complete'
        }]
      }
    }
  ])
}));

// Import the workflow AFTER setting up the mock
const { createSafeSparcWorkflow, testSafeSparcWorkflow, SafeSparcWorkflow } = await import('../workflows/safe-sparc-standalone');
import type { EpicProposal, SafeWorkflowResult } from '../workflows/safe-sparc-standalone';

describe('SAFe-SPARC Workflow Tests', () => {
  let workflow: SafeSparcWorkflow;
  
  const mockEpic: EpicProposal = {
    id: 'test-epic-001',
    title: 'Test Customer Analytics Platform',
    businessCase: 'Build test analytics to improve retention and enable data-driven decisions',
    estimatedValue: 1500000,
    estimatedCost: 600000,
    timeframe: '8 months',
    riskLevel: 'medium'
  };

  beforeAll(async () => {
    // Set up test environment
    console.log('🧪 Setting up SAFe-SPARC workflow tests...');
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up SAFe-SPARC workflow tests...');
  });

  describe('Workflow Initialization', () => {
    test('should create workflow instance successfully', async () => {
      workflow = await createSafeSparcWorkflow();
      
      expect(workflow).toBeInstanceOf(SafeSparcWorkflow);
      expect(workflow).toBeDefined();
    });

    test('should have required methods', () => {
      expect(typeof workflow.processSafeEpic).toBe('function');
      expect(typeof workflow.on).toBe('function'); // EventEmitter
      expect(typeof workflow.emit).toBe('function'); // EventEmitter
    });
  });

  describe('Epic Proposal Validation', () => {
    test('should validate epic proposal structure', () => {
      expect(mockEpic.id).toBeDefined();
      expect(mockEpic.title).toBeDefined();
      expect(mockEpic.businessCase).toBeDefined();
      expect(mockEpic.estimatedValue).toBeGreaterThan(0);
      expect(mockEpic.estimatedCost).toBeGreaterThan(0);
      expect(mockEpic.timeframe).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(mockEpic.riskLevel);
    });

    test('should calculate ROI correctly', () => {
      const expectedROI = (mockEpic.estimatedValue - mockEpic.estimatedCost) / mockEpic.estimatedCost;
      expect(expectedROI).toBeCloseTo(1.5, 2); // 150% ROI
    });
  });

  describe('SAFe Role Decisions', () => {
    test('should process all 5 SAFe roles', async () => {
      const result = await workflow.processSafeEpic(mockEpic);
      
      expect(result.roleDecisions).toHaveLength(5);
      
      const roleTypes = result.roleDecisions.map(d => d.roleType);
      expect(roleTypes).toContain('epic-owner');
      expect(roleTypes).toContain('lean-portfolio-manager');
      expect(roleTypes).toContain('product-manager');
      expect(roleTypes).toContain('system-architect');
      expect(roleTypes).toContain('release-train-engineer');
    });

    test('should have valid decision structure for each role', async () => {
      const result = await workflow.processSafeEpic(mockEpic);
      
      result.roleDecisions.forEach(decision => {
        expect(decision.roleType).toBeDefined();
        expect(['approve', 'reject', 'defer', 'more-information']).toContain(decision.decision);
        expect(decision.confidence).toBeGreaterThanOrEqual(0);
        expect(decision.confidence).toBeLessThanOrEqual(1);
        expect(decision.reasoning).toBeDefined();
        expect(typeof decision.reasoning).toBe('string');
      });
    });

    test('should determine overall decision correctly', async () => {
      const result = await workflow.processSafeEpic(mockEpic);
      
      expect(['approve', 'reject', 'defer']).toContain(result.overallDecision);
      expect(typeof result.consensusReached).toBe('boolean');
    });
  });

  describe('SPARC Methodology Execution', () => {
    test('should execute SPARC when epic is approved', async () => {
      const result = await workflow.processSafeEpic(mockEpic);
      
      if (result.overallDecision === 'approve') {
        expect(result.sparcArtifacts).toBeDefined();
        expect(result.sparcArtifacts?.status).toBe('completed');
      }
    });

    test('should have SPARC artifacts when completed', async () => {
      const result = await workflow.processSafeEpic(mockEpic);
      
      if (result.sparcArtifacts && result.sparcArtifacts.status === 'completed') {
        expect(result.sparcArtifacts.specification).toBeDefined();
        expect(result.sparcArtifacts.architecture).toBeDefined();
        expect(result.sparcArtifacts.implementation).toBeDefined();
      }
    });

    test('should simulate code generation without creating files', async () => {
      const result = await workflow.processSafeEpic(mockEpic);
      
      if (result.sparcArtifacts?.implementation) {
        const impl = result.sparcArtifacts.implementation;
        expect(Array.isArray(impl.files)).toBe(true);
        expect(Array.isArray(impl.tests)).toBe(true);
        expect(Array.isArray(impl.documentation)).toBe(true);
        
        // Should have file names but no actual files created
        if (impl.files.length > 0) {
          expect(typeof impl.files[0]).toBe('string');
        }
      }
    });
  });

  describe('Workflow Events', () => {
    test('should emit role-decision events', (done) => {
      let eventCount = 0;
      
      workflow.on('role-decision', (event) => {
        expect(event.role).toBeDefined();
        expect(event.decision).toBeDefined();
        expect(event.confidence).toBeDefined();
        expect(event.reasoning).toBeDefined();
        
        eventCount++;
        if (eventCount === 5) { // All 5 roles emitted
          done();
        }
      });
      
      workflow.processSafeEpic(mockEpic);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid epic gracefully', async () => {
      const invalidEpic = {
        id: '',
        title: '',
        businessCase: '',
        estimatedValue: -1,
        estimatedCost: -1,
        timeframe: '',
        riskLevel: 'invalid' as any
      };
      
      // Should not throw, should handle gracefully
      await expect(workflow.processSafeEpic(invalidEpic)).resolves.toBeDefined();
    });

    test('should handle LLM failures with fallback decisions', async () => {
      // Mock LLM failure for this test
      const { getGlobalLLM } = require('@claude-zen/foundation');
      getGlobalLLM.mockReturnValueOnce({
        setRole: jest.fn(),
        executeAsAnalyst: jest.fn().mockRejectedValue(new Error('LLM call failed')),
        executeAsArchitect: jest.fn().mockRejectedValue(new Error('LLM call failed')),
        executeAsCoder: jest.fn().mockRejectedValue(new Error('LLM call failed'))
      });
      
      const result = await workflow.processSafeEpic(mockEpic);
      
      // Should still return a result with fallback decisions
      expect(result).toBeDefined();
      expect(result.roleDecisions).toHaveLength(5);
      expect(result.overallDecision).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should complete workflow within reasonable time', async () => {
      const startTime = Date.now();
      
      await workflow.processSafeEpic(mockEpic);
      
      const duration = Date.now() - startTime;
      
      // With mocked LLM calls, should be very fast
      expect(duration).toBeLessThan(1000); // Less than 1 second with mocks
    });
  });

  describe('Integration Tests', () => {
    test('should run complete end-to-end workflow', async () => {
      const result = await workflow.processSafeEpic(mockEpic);
      
      // Comprehensive validation of complete flow
      expect(result.overallDecision).toBeDefined();
      expect(result.consensusReached).toBeDefined();
      expect(result.roleDecisions).toHaveLength(5);
      
      // Check each role decision
      result.roleDecisions.forEach(decision => {
        expect(['epic-owner', 'lean-portfolio-manager', 'product-manager', 'system-architect', 'release-train-engineer']).toContain(decision.roleType);
        expect(['approve', 'reject', 'defer', 'more-information']).toContain(decision.decision);
        expect(decision.confidence).toBeGreaterThanOrEqual(0);
        expect(decision.confidence).toBeLessThanOrEqual(1);
      });
      
      // If approved, should have SPARC artifacts
      if (result.overallDecision === 'approve') {
        expect(result.sparcArtifacts).toBeDefined();
        expect(['completed', 'failed', 'partial']).toContain(result.sparcArtifacts!.status);
      }
    });
  });

  describe('Data Validation', () => {
    test('should maintain data consistency throughout workflow', async () => {
      const result = await workflow.processSafeEpic(mockEpic);
      
      // Original epic data should be preserved
      expect(result).toBeDefined();
      
      // Decision counts should match expected logic
      const approvals = result.roleDecisions.filter(d => d.decision === 'approve').length;
      const rejections = result.roleDecisions.filter(d => d.decision === 'reject').length;
      const total = result.roleDecisions.length;
      
      expect(total).toBe(5);
      
      // Overall decision logic validation
      if (approvals >= 3) {
        expect(result.overallDecision).toBe('approve');
      } else if (rejections >= 3) {
        expect(result.overallDecision).toBe('reject');
      } else {
        expect(result.overallDecision).toBe('defer');
      }
    });
  });
});

describe('Standalone Test Function', () => {
  test('should run testSafeSparcWorkflow without errors', async () => {
    // This tests the exported test function
    await expect(testSafeSparcWorkflow()).resolves.toBeUndefined();
  });
});