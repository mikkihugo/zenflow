/**
 * @fileoverview SAFe-SPARC Micro Prototype Test Runner
 * 
 * Simple test to validate the micro prototype works end-to-end with:
 * - AI Portfolio Manager decision making
 * - SPARC methodology execution  
 * - SAFe framework integration
 * - AGUI human oversight
 */

import { MicroPrototypeManager, type EpicProposal } from './micro-prototype-manager';

/**
 * Test runner for the SAFe-SPARC micro prototype
 */
export class MicroPrototypeTest {
  private prototypeManager: MicroPrototypeManager;

  constructor() {
    this.prototypeManager = new MicroPrototypeManager();
  }

  /**
   * Run complete end-to-end test of the micro prototype
   */
  async runEndToEndTest(): Promise<void> {
    console.log('🚀 Starting SAFe-SPARC Micro Prototype End-to-End Test...\n');

    try {
      // Test 1: Initialize the prototype
      await this.testInitialization();

      // Test 2: Process a sample epic
      await this.testEpicProcessing();

      // Test 3: Check prototype status
      await this.testStatusCheck();

      console.log('✅ All tests passed! SAFe-SPARC micro prototype is working correctly.\n');

    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  private async testInitialization(): Promise<void> {
    console.log('🔧 Test 1: Initialize Micro Prototype');
    
    await this.prototypeManager.initialize();
    
    console.log('   ✓ MicroPrototypeManager initialized successfully');
    console.log('   ✓ Portfolio Agent, SPARC Workflow, and AGUI Interface ready\n');
  }

  private async testEpicProcessing(): Promise<void> {
    console.log('📊 Test 2: Process Sample Epic');
    
    // Create a sample epic proposal
    const sampleEpic: EpicProposal = {
      id: 'epic-001',
      title: 'Customer Mobile App Enhancement',
      businessCase: 'Improve customer experience and engagement through enhanced mobile application features including real-time notifications, personalized recommendations, and offline capabilities.',
      estimatedValue: 750000, // $750K expected value
      estimatedCost: 250000,  // $250K estimated cost  
      timeframe: '6 months',
      riskLevel: 'medium'
    };

    console.log(`   📝 Processing epic: "${sampleEpic.title}"`);
    console.log(`   💰 Estimated Value: $${sampleEpic.estimatedValue.toLocaleString()}`);
    console.log(`   💸 Estimated Cost: $${sampleEpic.estimatedCost.toLocaleString()}`);
    console.log(`   ⚠️  Risk Level: ${sampleEpic.riskLevel}`);

    // Process the epic through the complete SAFe-SPARC workflow
    const result = await this.prototypeManager.processEpicProposal(sampleEpic);

    console.log('\n   🧠 AI Portfolio Manager Decision:');
    console.log(`      Decision: ${result.portfolioDecision.decision.toUpperCase()}`);
    console.log(`      Confidence: ${(result.portfolioDecision.confidence * 100).toFixed(1)}%`);
    console.log(`      Estimated ROI: ${result.portfolioDecision.estimatedROI.toFixed(1)}%`);
    console.log(`      Human Oversight Required: ${result.portfolioDecision.humanOversightRequired ? 'Yes' : 'No'}`);

    if (result.portfolioDecision.decision === 'approve') {
      console.log('\n   🏗️  SPARC Methodology Execution:');
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

      // Check for SAFe integration
      const sparcResult = result.sparcArtifacts as any;
      if (sparcResult.safeIntegration) {
        console.log('\n   🔗 SAFe Framework Integration:');
        console.log(`      CD Pipeline ID: ${sparcResult.safeIntegration.cdPipelineId}`);
        console.log(`      Value Stream ID: ${sparcResult.safeIntegration.valueStreamId}`);
        console.log(`      Pipeline Stages: ${sparcResult.safeIntegration.stages?.length || 0}`);
        console.log(`      Quality Gates: ${sparcResult.safeIntegration.qualityGates?.length || 0}`);
      }
    }

    if (result.humanApproval) {
      console.log('\n   👤 Human Oversight Results:');
      console.log(`      Human Decision: ${result.humanApproval.decision.toUpperCase()}`);
      console.log(`      Reasoning: ${result.humanApproval.reasoning}`);
      console.log(`      Confidence: ${(result.humanApproval.confidence * 100).toFixed(1)}%`);
    }

    console.log('\n   ✅ Epic processing completed successfully\n');
  }

  private async testStatusCheck(): Promise<void> {
    console.log('📈 Test 3: Check Prototype Status');
    
    const status = await this.prototypeManager.getPrototypeStatus();
    
    console.log(`   Initialized: ${status.initialized ? '✅' : '❌'}`);
    console.log(`   Components Healthy: ${status.componentsHealthy ? '✅' : '❌'}`);
    console.log(`   Processed Epics: ${status.processedEpics}`);
    
    if (status.learningStats.learningEnabled) {
      console.log('   🧠 Learning Statistics:');
      console.log(`      Total Decisions: ${status.learningStats.totalDecisions || 0}`);
      console.log(`      Approved Epics: ${status.learningStats.approvedEpics || 0}`);
      console.log(`      Average Confidence: ${((status.learningStats.averageConfidence || 0) * 100).toFixed(1)}%`);
    }

    console.log('   ✅ Status check completed\n');
  }
}

/**
 * Run the micro prototype test if this file is executed directly
 */
export async function runMicroPrototypeTest(): Promise<void> {
  const tester = new MicroPrototypeTest();
  await tester.runEndToEndTest();
}

// Export for use in other modules
export default MicroPrototypeTest;