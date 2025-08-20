#!/usr/bin/env tsx
/**
 * @fileoverview Setup Integration Test - Configure LLM and Run Basic Test
 * 
 * This script sets up the LLMProvider with a real LLM and runs a basic integration test
 * Run with: npx tsx src/__tests__/setup-integration-test.ts
 */

async function runIntegrationSetup() {
  console.log('🎯 Setting up SAFe-SPARC Integration Test');
  console.log('=====================================\n');

  try {
    // Import LLM components
    console.log('📦 Importing LLM components...');
    const { getGlobalLLM, setGlobalLLM, LLMProvider } = await import('@claude-zen/foundation');
    
    // Check current LLM status
    console.log('🔍 Checking current LLM configuration...');
    let llm = getGlobalLLM();
    
    if (!llm) {
      console.log('⚠️  No global LLM configured');
      console.log('💡 You need to set up an LLM provider for integration testing\n');
      
      console.log('🛠️  To set up LLM for integration tests:');
      console.log('   1. Configure API keys (OpenAI, Claude, etc.)');
      console.log('   2. Initialize LLMProvider with your preferred provider');
      console.log('   3. Set it as global: setGlobalLLM(provider)\n');
      
      // Try to create a mock LLM for demonstration
      console.log('🔧 Creating demo LLM provider...');
      
      const demoProvider = new LLMProvider();
      // Note: This won't work without actual API configuration
      // But shows the structure needed
      
      console.log('📋 Demo provider created (not functional without API keys)');
      console.log('   Provider type:', typeof demoProvider);
      console.log('   Has setRole:', typeof demoProvider.setRole);
      console.log('   Has executeAsAnalyst:', typeof demoProvider.executeAsAnalyst);
      
    } else {
      console.log('✅ Global LLM is configured');
      console.log('🧪 Testing basic LLM functionality...');
      
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          llm.executeAsAnalyst('Test: What is 1+1? Answer briefly.'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
        ]);
        const duration = Date.now() - startTime;
        
        console.log(`✅ LLM call successful! (${duration}ms)`);
        console.log(`📝 Response: ${result}\n`);
        
        // Now test the actual workflow
        console.log('🎯 Testing SAFe-SPARC workflow...');
        const { createSafeSparcWorkflow } = await import('../workflows/safe-sparc-standalone');
        
        const workflow = await createSafeSparcWorkflow();
        console.log('✅ Workflow created successfully');
        
        const testEpic = {
          id: 'setup-test-001',
          title: 'Test Analytics Dashboard',
          businessCase: 'Simple test case for integration validation',
          estimatedValue: 100000,
          estimatedCost: 50000,
          timeframe: '2 months',
          riskLevel: 'low' as const
        };
        
        console.log(`\n🚀 Running mini workflow test for: ${testEpic.title}`);
        console.log(`💰 ROI: ${((testEpic.estimatedValue - testEpic.estimatedCost) / testEpic.estimatedCost * 100).toFixed(1)}%`);
        
        const workflowStart = Date.now();
        const result2 = await workflow.processSafeEpic(testEpic);
        const workflowDuration = Date.now() - workflowStart;
        
        console.log(`\n✅ Workflow completed! (${workflowDuration}ms)`);
        console.log(`🏛️ Overall decision: ${result2.overallDecision}`);
        console.log(`🤝 Consensus: ${result2.consensusReached}`);
        console.log(`📊 Role decisions: ${result2.roleDecisions.length}`);
        
        if (result2.sparcArtifacts) {
          console.log(`🏗️ SPARC status: ${result2.sparcArtifacts.status}`);
        }
        
        console.log('\n🎉 Full integration test SUCCESSFUL!');
        
      } catch (error) {
        console.error('❌ LLM/Workflow test failed:', error);
        
        if (error.message.includes('Timeout')) {
          console.log('⚠️  LLM calls are timing out - check API configuration');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Integration setup failed:', error);
  }
  
  console.log('\n=====================================');
  console.log('🔚 Integration setup complete');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationSetup().catch(console.error);
}

export default runIntegrationSetup;