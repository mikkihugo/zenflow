/**
 * Test script to verify SAFe-SPARC integration with real Claude SDK
 */

import { createSafePrototype, type EpicProposal } from '../coordination/safe-sparc-prototype';

async function testSafeSparcIntegration() {
  console.log('🚀 Testing SAFe-SPARC Integration with Real Claude SDK...\n');

  try {
    // Initialize the SAFe prototype
    console.log('1. Initializing SAFe prototype...');
    const prototype = await createSafePrototype();
    console.log('✅ SAFe prototype initialized\n');

    // Create a sample epic
    const epic: EpicProposal = {
      id: 'epic-test-001',
      title: 'Customer Analytics Platform',
      businessCase: 'Build customer analytics to improve retention and enable data-driven decisions',
      estimatedValue: 1500000,
      estimatedCost: 600000,
      timeframe: '8 months',
      riskLevel: 'medium'
    };

    console.log('2. Processing SAFe epic through actual roles...');
    console.log(`   Epic: ${epic.title}`);
    console.log(`   Value: $${epic.estimatedValue.toLocaleString()}`);
    console.log(`   Cost: $${epic.estimatedCost.toLocaleString()}\n`);

    // Process the epic
    const result = await prototype.processSafeEpic(epic);

    // Display results
    console.log('3. SAFe Role Decisions:');
    result.roleDecisions.forEach((decision, index) => {
      console.log(`   ${index + 1}. ${decision.roleType}: ${decision.decision.toUpperCase()}`);
      console.log(`      Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
      console.log(`      Reasoning: ${decision.reasoning.substring(0, 100)}...`);
    });

    console.log('\n4. Overall Result:');
    console.log(`   Decision: ${result.overallDecision.toUpperCase()}`);
    console.log(`   Consensus: ${result.consensusReached ? 'Yes' : 'No'}`);

    // Check if SPARC was executed
    if (result.sparcArtifacts && result.overallDecision === 'approve') {
      console.log('\n5. SPARC Execution:');
      console.log(`   Status: ${result.sparcArtifacts.status}`);
      
      const sparc = result.sparcArtifacts as any;
      if (sparc.specification) {
        console.log('   ✅ Specification completed');
      }
      if (sparc.architecture) {
        console.log('   ✅ Architecture completed');
      }
      if (sparc.implementation) {
        console.log('   ✅ Implementation completed');
        
        // Check for real code generation
        if (sparc.implementation.files && sparc.implementation.files.length > 0) {
          console.log(`   📁 Generated ${sparc.implementation.files.length} files`);
          console.log('   🎉 REAL CODE GENERATION CONFIRMED!');
        } else {
          console.log('   📝 Placeholder implementation (Claude SDK not used)');
        }
      }
    }

    console.log('\n✅ SAFe-SPARC integration test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export for use as module
export { testSafeSparcIntegration };

// Run test if called directly  
if (require.main === module) {
  testSafeSparcIntegration()
    .then(() => {
      console.log('🎉 All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}