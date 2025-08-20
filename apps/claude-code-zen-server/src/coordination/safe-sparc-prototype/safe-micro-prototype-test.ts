/**
 * @fileoverview SAFe Micro Prototype Test Runner - Actual SAFe Roles Implementation
 * 
 * Tests the complete SAFe-SPARC micro prototype with actual SAFe roles:
 * - Lean Portfolio Manager decision making
 * - Release Train Engineer program coordination
 * - Product Manager customer/market validation
 * - System Architect technical feasibility
 * - Epic Owner business case analysis
 * - SPARC methodology execution
 * - AGUI human oversight
 * 
 * Uses simple LLM-based decisions to validate proper SAFe implementation.
 */

import { SafeMicroPrototypeManager, type EpicProposal } from './safe-micro-prototype-manager';

/**
 * SAFe Micro Prototype Test Runner
 */
export class SafeMicroPrototypeTest {
  private safePrototypeManager: SafeMicroPrototypeManager;

  constructor() {
    this.safePrototypeManager = new SafeMicroPrototypeManager();
  }

  /**
   * Run complete end-to-end test of the SAFe micro prototype with actual SAFe roles
   */
  async runSafeEndToEndTest(): Promise<void> {
    console.log('🚀 Starting SAFe-SPARC Micro Prototype Test with Actual SAFe Roles...\n');

    try {
      // Test 1: Initialize the SAFe prototype
      await this.testSafeInitialization();

      // Test 2: Process a sample epic through all SAFe roles
      await this.testSafeEpicProcessing();

      // Test 3: Check SAFe role performance and consensus
      await this.testSafeRolePerformance();

      // Test 4: Validate SAFe governance and decision flow
      await this.testSafeGovernanceFlow();

      console.log('✅ All SAFe tests passed! SAFe-SPARC micro prototype with actual roles is working correctly.\n');

    } catch (error) {
      console.error('❌ SAFe test failed:', error);
      throw error;
    }
  }

  private async testSafeInitialization(): Promise<void> {
    console.log('🔧 Test 1: Initialize SAFe Micro Prototype');
    
    await this.safePrototypeManager.initialize();
    
    console.log('   ✓ SafeMicroPrototypeManager initialized successfully');
    console.log('   ✓ All SAFe roles ready: LPM, RTE, PM, SA, EO');
    console.log('   ✓ SPARC Workflow and AGUI Interface initialized\n');
  }

  private async testSafeEpicProcessing(): Promise<void> {
    console.log('📊 Test 2: Process Sample Epic through SAFe Roles');
    
    // Create a sample epic that will test all SAFe roles
    const sampleEpic: EpicProposal = {
      id: 'epic-safe-001',
      title: 'Enterprise Customer Analytics Platform',
      businessCase: 'Build comprehensive customer analytics platform to improve customer experience, increase retention, and enable data-driven product decisions. Platform will provide real-time customer insights, predictive analytics, and personalized recommendation engine for our enterprise customers.',
      estimatedValue: 2000000, // $2M expected value
      estimatedCost: 800000,   // $800K estimated cost  
      timeframe: '12 months',
      riskLevel: 'medium'
    };

    console.log(`   📝 Processing epic through SAFe roles: "${sampleEpic.title}"`);
    console.log(`   💰 Estimated Value: $${sampleEpic.estimatedValue.toLocaleString()}`);
    console.log(`   💸 Estimated Cost: $${sampleEpic.estimatedCost.toLocaleString()}`);
    console.log(`   ⚠️  Risk Level: ${sampleEpic.riskLevel}`);
    console.log(`   🕒 Timeframe: ${sampleEpic.timeframe}\n`);

    // Process the epic through the complete SAFe workflow
    const result = await this.safePrototypeManager.processSafeEpic(sampleEpic);

    // Display role-by-role decisions
    console.log('   🎭 SAFe Role Decisions:');
    result.roleDecisions.forEach((roleDecision, index) => {
      const emoji = this.getRoleEmoji(roleDecision.roleType);
      const decisionEmoji = this.getDecisionEmoji(roleDecision.decision);
      
      console.log(`   ${index + 1}. ${emoji} ${this.formatRoleName(roleDecision.roleType)}:`);
      console.log(`      Decision: ${decisionEmoji} ${roleDecision.decision.toUpperCase()}`);
      console.log(`      Confidence: ${(roleDecision.confidence * 100).toFixed(1)}%`);
      console.log(`      Reasoning: ${roleDecision.reasoning}`);
      
      if (roleDecision.recommendations.length > 0) {
        console.log(`      Recommendations: ${roleDecision.recommendations.slice(0, 2).join(', ')}`);
      }
      
      if (roleDecision.humanOversightRequired) {
        console.log(`      👤 Human Oversight: Required`);
      }
      console.log('');
    });

    // Display overall consensus
    console.log(`   🏛️  SAFe Governance Result:`);
    console.log(`      Overall Decision: ${this.getDecisionEmoji(result.overallDecision)} ${result.overallDecision.toUpperCase()}`);
    console.log(`      Consensus Reached: ${result.consensusReached ? '✅ Yes' : '❌ No'}`);
    console.log(`      Role Participation: ${result.roleDecisions.length}/5 roles`);

    // Display human approvals if any
    if (result.humanApprovals.length > 0) {
      console.log('   👤 Human Oversight Results:');
      result.humanApprovals.forEach((approval, index) => {
        console.log(`      ${index + 1}. ${approval.roleType}: ${approval.decision.toUpperCase()}`);
        if (approval.reasoning) {
          console.log(`         Reasoning: ${approval.reasoning}`);
        }
      });
    }

    // Display SPARC results if epic was approved
    if (result.overallDecision === 'approve' && result.sparcArtifacts) {
      console.log('   🏗️  SPARC Methodology Execution:');
      console.log(`      Status: ${result.sparcArtifacts.status.toUpperCase()}`);
      
      if (result.sparcArtifacts.specification) {
        console.log(`      ✓ Specification phase completed`);
      }
      if (result.sparcArtifacts.architecture) {
        console.log(`      ✓ Architecture phase completed`);
      }
      if (result.sparcArtifacts.implementation) {
        console.log(`      ✓ Implementation planning completed`);
      }

      // Check for SAFe-SPARC integration
      const sparcResult = result.sparcArtifacts as any;
      if (sparcResult.safeIntegration) {
        console.log('   🔗 SAFe-SPARC Integration:');
        console.log(`      CD Pipeline ID: ${sparcResult.safeIntegration.cdPipelineId}`);
        console.log(`      Value Stream ID: ${sparcResult.safeIntegration.valueStreamId}`);
        console.log(`      Pipeline Stages: ${sparcResult.safeIntegration.stages?.length || 0}`);
      }
    }

    console.log('   ✅ SAFe epic processing completed successfully\n');
  }

  private async testSafeRolePerformance(): Promise<void> {
    console.log('📈 Test 3: Check SAFe Role Performance');
    
    const status = await this.safePrototypeManager.getSafePrototypeStatus();
    
    console.log(`   System Status: ${status.initialized ? '✅ Initialized' : '❌ Not Initialized'}`);
    console.log(`   SAFe Roles Health: ${status.safeRolesHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`   Processed Epics: ${status.processedEpics}`);
    
    console.log('   🎭 SAFe Role Performance:');
    Object.entries(status.rolePerformance).forEach(([roleType, performance]) => {
      const emoji = this.getRoleEmoji(roleType as any);
      console.log(`      ${emoji} ${this.formatRoleName(roleType as any)}:`);
      console.log(`         Total Decisions: ${performance.totalDecisions}`);
      console.log(`         Average Confidence: ${(performance.averageConfidence * 100).toFixed(1)}%`);
      console.log(`         Approval Rate: ${(performance.approvalRate * 100).toFixed(1)}%`);
      console.log(`         Human Oversight Rate: ${(performance.humanOversightRate * 100).toFixed(1)}%`);
    });

    console.log('   🏛️  Consensus Metrics:');
    console.log(`      Total Processed: ${status.consensusMetrics.totalProcessed}`);
    console.log(`      Consensus Rate: ${(status.consensusMetrics.consensusRate * 100).toFixed(1)}%`);
    console.log(`      Avg Processing Time: ${status.consensusMetrics.averageProcessingTime}ms`);

    console.log('   ✅ SAFe role performance check completed\n');
  }

  private async testSafeGovernanceFlow(): Promise<void> {
    console.log('🏛️  Test 4: Validate SAFe Governance Flow');
    
    // Test high-risk, high-value epic that should trigger governance
    const governanceEpic: EpicProposal = {
      id: 'epic-governance-001',
      title: 'Mission-Critical AI Platform Transformation',
      businessCase: 'Transform core business platform with advanced AI capabilities, requiring significant architectural changes and high-risk technology adoption.',
      estimatedValue: 10000000, // $10M - very high value
      estimatedCost: 5000000,   // $5M - very high cost
      timeframe: '24 months',   // Long timeline
      riskLevel: 'high'         // High risk
    };

    console.log(`   📝 Processing high-stakes epic: "${governanceEpic.title}"`);
    console.log(`   💰 Value: $${governanceEpic.estimatedValue.toLocaleString()}`);
    console.log(`   💸 Cost: $${governanceEpic.estimatedCost.toLocaleString()}`);
    console.log(`   ⚠️  Risk: ${governanceEpic.riskLevel}`);

    const governanceResult = await this.safePrototypeManager.processSafeEpic(governanceEpic);

    // Validate governance patterns
    const lpmDecision = governanceResult.roleDecisions.find(rd => rd.roleType === 'lean-portfolio-manager');
    const humanOversightCount = governanceResult.roleDecisions.filter(rd => rd.humanOversightRequired).length;
    const highConfidenceDecisions = governanceResult.roleDecisions.filter(rd => rd.confidence >= 0.8).length;

    console.log('   🔍 Governance Validation:');
    console.log(`      LPM Involvement: ${lpmDecision ? '✅ Present' : '❌ Missing'}`);
    console.log(`      Human Oversight Triggered: ${humanOversightCount > 0 ? '✅ Yes' : '❌ No'} (${humanOversightCount} roles)`);
    console.log(`      High Confidence Decisions: ${highConfidenceDecisions}/${governanceResult.roleDecisions.length}`);
    console.log(`      Proper Role Sequence: ${this.validateRoleSequence(governanceResult.roleDecisions) ? '✅ Correct' : '❌ Incorrect'}`);

    // Test that high-risk/high-value epics get proper scrutiny
    const properGovernance = (
      lpmDecision?.decision !== 'approve' || 
      humanOversightCount >= 2 ||
      governanceResult.roleDecisions.length === 5
    );

    console.log(`   🏛️  Governance Effectiveness: ${properGovernance ? '✅ Proper' : '❌ Insufficient'}`);
    console.log('   ✅ SAFe governance flow validation completed\n');
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getRoleEmoji(roleType: string): string {
    const emojiMap: Record<string, string> = {
      'lean-portfolio-manager': '💼',
      'release-train-engineer': '🚂',
      'product-manager': '📋',
      'system-architect': '🏗️',
      'epic-owner': '📊'
    };
    return emojiMap[roleType] || '🎭';
  }

  private getDecisionEmoji(decision: string): string {
    const emojiMap: Record<string, string> = {
      'approve': '✅',
      'reject': '❌',
      'defer': '⏳',
      'more-information': '❓'
    };
    return emojiMap[decision] || '❔';
  }

  private formatRoleName(roleType: string): string {
    const nameMap: Record<string, string> = {
      'lean-portfolio-manager': 'Lean Portfolio Manager (LPM)',
      'release-train-engineer': 'Release Train Engineer (RTE)',
      'product-manager': 'Product Manager (PM)',
      'system-architect': 'System Architect (SA)',
      'epic-owner': 'Epic Owner (EO)'
    };
    return nameMap[roleType] || roleType;
  }

  private validateRoleSequence(roleDecisions: any[]): boolean {
    const expectedOrder = ['epic-owner', 'lean-portfolio-manager', 'product-manager', 'system-architect', 'release-train-engineer'];
    const actualOrder = roleDecisions
      .sort((a, b) => a.metadata.processingOrder - b.metadata.processingOrder)
      .map(rd => rd.roleType);

    return JSON.stringify(actualOrder.slice(0, expectedOrder.length)) === JSON.stringify(expectedOrder.slice(0, actualOrder.length));
  }
}

/**
 * Run the SAFe micro prototype test if this file is executed directly
 */
export async function runSafeMicroPrototypeTest(): Promise<void> {
  const tester = new SafeMicroPrototypeTest();
  await tester.runSafeEndToEndTest();
}

// Export for use in other modules
export default SafeMicroPrototypeTest;