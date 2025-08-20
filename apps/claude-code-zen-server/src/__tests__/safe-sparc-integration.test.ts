/**
 * @fileoverview SAFe-SPARC Integration Tests - Real LLM Calls
 * 
 * **INTEGRATION MODE**: Tests with actual LLMProvider calls, no mocking
 * Lightweight tests that validate the complete workflow end-to-end
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { createSafeSparcWorkflow } from '../workflows/safe-sparc-standalone';
import type { EpicProposal } from '../workflows/safe-sparc-standalone';

describe('SAFe-SPARC Integration Tests (Real LLM)', () => {
  let workflow: any;

  const testEpic: EpicProposal = {
    id: 'integration-test-001',
    title: 'Simple Analytics Dashboard',
    businessCase: 'Create a basic analytics dashboard for user engagement metrics',
    estimatedValue: 500000,
    estimatedCost: 200000,
    timeframe: '4 months',
    riskLevel: 'low'
  };

  beforeAll(async () => {
    console.log('🧪 Setting up SAFe-SPARC integration test with real LLM...');
    workflow = await createSafeSparcWorkflow();
  });

  test('should complete full SAFe-SPARC workflow with real LLM calls', async () => {
    console.log(`\n🎯 Starting integration test for epic: ${testEpic.title}`);
    console.log(`💰 ROI: ${((testEpic.estimatedValue - testEpic.estimatedCost) / testEpic.estimatedCost * 100).toFixed(1)}%`);

    const startTime = Date.now();

    try {
      const result = await workflow.processSafeEpic(testEpic);
      const duration = Date.now() - startTime;

      console.log(`⏱️  Total execution time: ${duration}ms`);
      console.log(`🏛️ Overall decision: ${result.overallDecision}`);
      console.log(`🤝 Consensus reached: ${result.consensusReached}`);

      // Validate basic result structure
      expect(result).toBeDefined();
      expect(result.overallDecision).toBeDefined();
      expect(['approve', 'reject', 'defer']).toContain(result.overallDecision);
      expect(typeof result.consensusReached).toBe('boolean');

      // Validate SAFe role decisions
      expect(Array.isArray(result.roleDecisions)).toBe(true);
      expect(result.roleDecisions.length).toBe(5);

      console.log('\n📊 Role Decisions:');
      result.roleDecisions.forEach((decision: any, index: number) => {
        console.log(`  ${index + 1}. ${decision.roleType}: ${decision.decision} (${(decision.confidence * 100).toFixed(0)}%)`);
        console.log(`     Reasoning: ${decision.reasoning.substring(0, 100)}...`);
        
        // Validate decision structure
        expect(['epic-owner', 'lean-portfolio-manager', 'product-manager', 'system-architect', 'release-train-engineer']).toContain(decision.roleType);
        expect(['approve', 'reject', 'defer', 'more-information']).toContain(decision.decision);
        expect(decision.confidence).toBeGreaterThanOrEqual(0);
        expect(decision.confidence).toBeLessThanOrEqual(1);
        expect(typeof decision.reasoning).toBe('string');
        expect(decision.reasoning.length).toBeGreaterThan(10);
      });

      // If approved, validate SPARC artifacts
      if (result.overallDecision === 'approve' && result.sparcArtifacts) {
        console.log('\n🏗️ SPARC Artifacts Generated:');
        console.log(`   Status: ${result.sparcArtifacts.status}`);
        
        expect(['completed', 'failed', 'partial']).toContain(result.sparcArtifacts.status);
        
        if (result.sparcArtifacts.status === 'completed') {
          // Validate SPARC structure
          expect(result.sparcArtifacts.specification).toBeDefined();
          expect(result.sparcArtifacts.architecture).toBeDefined();
          expect(result.sparcArtifacts.implementation).toBeDefined();

          console.log(`   📋 Requirements: ${result.sparcArtifacts.specification?.requirements?.length || 0}`);
          console.log(`   🏗️ Components: ${result.sparcArtifacts.architecture?.components?.length || 0}`);
          console.log(`   📄 Files: ${result.sparcArtifacts.implementation?.files?.length || 0}`);
        }
      }

      console.log('\n✅ Integration test completed successfully!');
      
      // Performance validation
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(120000); // Should complete within 2 minutes

    } catch (error) {
      console.error('❌ Integration test failed:', error);
      throw error;
    }
  }, 180000); // 3 minute timeout for real LLM calls

  test('should handle different epic scenarios', async () => {
    const highRiskEpic: EpicProposal = {
      id: 'integration-test-002',
      title: 'Complex AI Platform',
      businessCase: 'Advanced AI platform with machine learning capabilities',
      estimatedValue: 2000000,
      estimatedCost: 1500000,
      timeframe: '12 months',
      riskLevel: 'high'
    };

    console.log(`\n🎯 Testing high-risk epic: ${highRiskEpic.title}`);
    console.log(`💰 ROI: ${((highRiskEpic.estimatedValue - highRiskEpic.estimatedCost) / highRiskEpic.estimatedCost * 100).toFixed(1)}%`);

    const result = await workflow.processSafeEpic(highRiskEpic);

    expect(result).toBeDefined();
    expect(result.overallDecision).toBeDefined();
    expect(result.roleDecisions).toHaveLength(5);

    console.log(`🏛️ High-risk epic decision: ${result.overallDecision}`);
    
    // High-risk epics might get more scrutiny
    const avgConfidence = result.roleDecisions.reduce((sum: number, d: any) => sum + d.confidence, 0) / result.roleDecisions.length;
    console.log(`📊 Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);

  }, 180000);

  test('should process low-value epic appropriately', async () => {
    const lowValueEpic: EpicProposal = {
      id: 'integration-test-003', 
      title: 'Simple Bug Fix',
      businessCase: 'Fix minor UI bug in dashboard',
      estimatedValue: 10000,
      estimatedCost: 5000,
      timeframe: '2 weeks',
      riskLevel: 'low'
    };

    console.log(`\n🎯 Testing low-value epic: ${lowValueEpic.title}`);

    const result = await workflow.processSafeEpic(lowValueEpic);

    expect(result).toBeDefined();
    expect(result.roleDecisions).toHaveLength(5);

    console.log(`🏛️ Low-value epic decision: ${result.overallDecision}`);
    
    // Low-value epics might get different treatment
    const hasDefers = result.roleDecisions.some((d: any) => d.decision === 'defer');
    if (hasDefers) {
      console.log('📝 Some roles deferred due to low value proposition');
    }

  }, 180000);
});

describe('LLM Provider Integration', () => {
  test('should validate LLMProvider is working', async () => {
    const { getGlobalLLM } = await import('@claude-zen/foundation');
    const llm = getGlobalLLM();
    
    expect(llm).toBeDefined();
    expect(typeof llm.setRole).toBe('function');
    expect(typeof llm.executeAsAnalyst).toBe('function');

    console.log('✅ LLMProvider is properly configured and accessible');
  });
});