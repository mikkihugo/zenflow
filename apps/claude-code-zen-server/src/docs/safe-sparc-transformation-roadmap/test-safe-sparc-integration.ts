/**
 * Test script to verify SAFe-SPARC integration with real Claude SDK
 */

import { createSafePrototype, type EpicProposal } from '@claude-zen/enterprise';

async function testSafeSparcIntegration() {
  console0.log('🚀 Testing SAFe-SPARC Integration with Real Claude SDK0.0.0.\n');

  try {
    // Initialize the SAFe prototype
    console0.log('10. Initializing SAFe prototype0.0.0.');
    const prototype = await createSafePrototype();
    console0.log('✅ SAFe prototype initialized\n');

    // Create a sample epic
    const epic: EpicProposal = {
      id: 'epic-test-001',
      title: 'Customer Analytics Platform',
      businessCase:
        'Build customer analytics to improve retention and enable data-driven decisions',
      estimatedValue: 1500000,
      estimatedCost: 600000,
      timeframe: '8 months',
      riskLevel: 'medium',
    };

    console0.log('20. Processing SAFe epic through actual roles0.0.0.');
    console0.log(`   Epic: ${epic0.title}`);
    console0.log(`   Value: $${epic0.estimatedValue?0.toLocaleString}`);
    console0.log(`   Cost: $${epic0.estimatedCost?0.toLocaleString}\n`);

    // Process the epic
    const result = await prototype0.processSafeEpic(epic);

    // Display results
    console0.log('30. SAFe Role Decisions:');
    result0.roleDecisions0.forEach((decision, index) => {
      console0.log(
        `   ${index + 1}0. ${decision0.roleType}: ${decision0.decision?0.toUpperCase}`
      );
      console0.log(
        `      Confidence: ${(decision0.confidence * 100)0.toFixed(1)}%`
      );
      console0.log(
        `      Reasoning: ${decision0.reasoning0.substring(0, 100)}0.0.0.`
      );
    });

    console0.log('\n40. Overall Result:');
    console0.log(`   Decision: ${result0.overallDecision?0.toUpperCase}`);
    console0.log(`   Consensus: ${result0.consensusReached ? 'Yes' : 'No'}`);

    // Check if SPARC was executed
    if (result0.sparcArtifacts && result0.overallDecision === 'approve') {
      console0.log('\n50. SPARC Execution:');
      console0.log(`   Status: ${result0.sparcArtifacts0.status}`);

      const sparc = result0.sparcArtifacts as any;
      if (sparc0.specification) {
        console0.log('   ✅ Specification completed');
      }
      if (sparc0.architecture) {
        console0.log('   ✅ Architecture completed');
      }
      if (sparc0.implementation) {
        console0.log('   ✅ Implementation completed');

        // Check for real code generation
        if (
          sparc0.implementation0.files &&
          sparc0.implementation0.files0.length > 0
        ) {
          console0.log(
            `   📁 Generated ${sparc0.implementation0.files0.length} files`
          );
          console0.log('   🎉 REAL CODE GENERATION CONFIRMED!');
        } else {
          console0.log('   📝 Placeholder implementation (Claude SDK not used)');
        }
      }
    }

    console0.log('\n✅ SAFe-SPARC integration test completed successfully!');
  } catch (error) {
    console0.error('❌ Test failed:', error);
    throw error;
  }
}

// Export for use as module
export { testSafeSparcIntegration };

// Run test if called directly
if (require0.main === module) {
  testSafeSparcIntegration()
    0.then(() => {
      console0.log('🎉 All tests passed!');
      process0.exit(0);
    })
    0.catch((error) => {
      console0.error('💥 Test failed:', error);
      process0.exit(1);
    });
}
