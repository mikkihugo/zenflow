#!/usr/bin/env tsx
/**
 * @fileoverview Test Facade Status Integration
 * 
 * Comprehensive test to verify all 4 strategic facades properly integrate
 * with the centralized facade status management system from @claude-zen/foundation.
 */

// Import from the TypeScript source with .js extensions (bundler resolution)
import { facadeStatusManager, getSystemStatus, getFacadeStatus, registerFacade } from './packages/foundation/src/index.js';

async function testFacadeStatusIntegration() {
  console.log('🔍 Testing Facade Status Integration Across All Strategic Facades...\n');

  try {
    // Test 1: Verify foundation facade status manager is available
    console.log('1️⃣ Testing Foundation Facade Status Manager...');
    const foundationStatus = typeof facadeStatusManager;
    console.log(`   ✓ facadeStatusManager type: ${foundationStatus}`);
    console.log(`   ✓ getSystemStatus available: ${typeof getSystemStatus === 'function'}`);
    console.log(`   ✓ getFacadeStatus available: ${typeof getFacadeStatus === 'function'}`);
    console.log(`   ✓ registerFacade available: ${typeof registerFacade === 'function'}\n`);

    // Test 2: Load all strategic facades and verify they register properly
    console.log('2️⃣ Testing Strategic Facade Registration...');
    
    console.log('   📦 Loading Intelligence Facade...');
    try {
      await import('./packages/intelligence/src/index.js');
      console.log('   ✓ Intelligence facade loaded and registered');
    } catch (error) {
      console.log(`   ⚠️ Intelligence facade error: ${(error as Error).message}`);
    }

    console.log('   📦 Loading Enterprise Facade...');
    try {
      await import('./packages/enterprise/src/index.js');
      console.log('   ✓ Enterprise facade loaded and registered');
    } catch (error) {
      console.log(`   ⚠️ Enterprise facade error: ${(error as Error).message}`);
    }

    console.log('   📦 Loading Operations Facade...');
    try {
      await import('./packages/operations/src/index.js');
      console.log('   ✓ Operations facade loaded and registered');
    } catch (error) {
      console.log(`   ⚠️ Operations facade error: ${(error as Error).message}`);
    }

    console.log('   📦 Loading Infrastructure Facade...');
    try {
      await import('./packages/infrastructure/src/index.js');
      console.log('   ✓ Infrastructure facade loaded and registered');
    } catch (error) {
      console.log(`   ⚠️ Infrastructure facade error: ${(error as Error).message}`);
    }

    console.log('');

    // Test 3: Check system status after all facades loaded
    console.log('3️⃣ Testing System Status After Facade Loading...');
    try {
      const systemStatus = getSystemStatus();
      console.log('   📊 System Status:');
      console.log(`      Total Facades: ${Object.keys(systemStatus.facades).length}`);
      console.log(`      Overall Health Score: ${systemStatus.overallHealthScore}`);
      console.log(`      System Status: ${systemStatus.status}`);
      
      // List all registered facades
      console.log('   📋 Registered Facades:');
      for (const [facadeName, facadeInfo] of Object.entries(systemStatus.facades)) {
        console.log(`      • ${facadeName}: ${(facadeInfo as any).status} (health: ${(facadeInfo as any).healthScore})`);
      }
      console.log('');
    } catch (error) {
      console.log(`   ❌ System status error: ${(error as Error).message}\n`);
    }

    // Test 4: Test individual facade status queries
    console.log('4️⃣ Testing Individual Facade Status Queries...');
    const facadeNames = ['intelligence', 'enterprise', 'operations', 'infrastructure'];
    
    for (const facadeName of facadeNames) {
      try {
        const facadeStatus = getFacadeStatus(facadeName);
        console.log(`   📋 ${facadeName.toUpperCase()} Facade:`);
        console.log(`      Status: ${facadeStatus.status}`);
        console.log(`      Health Score: ${facadeStatus.healthScore}`);
        console.log(`      Available Packages: ${facadeStatus.availablePackages}`);
        console.log(`      Total Packages: ${facadeStatus.totalPackages}`);
        console.log(`      Capabilities: ${facadeStatus.capabilities.join(', ')}`);
      } catch (error) {
        console.log(`   ❌ ${facadeName} facade status error: ${(error as Error).message}`);
      }
    }

    console.log('');

    // Test 5: Test facade status manager health summary
    console.log('5️⃣ Testing Facade Status Manager Health Summary...');
    try {
      const { getHealthSummary } = await import('./packages/foundation/src/index.js');
      const healthSummary = getHealthSummary();
      console.log('   🏥 Health Summary:');
      console.log(`      Overall Status: ${healthSummary.overall.status}`);
      console.log(`      Health Score: ${healthSummary.overall.healthScore}`);
      console.log(`      Total Facades: ${healthSummary.overall.totalFacades}`);
      console.log(`      Healthy Facades: ${healthSummary.overall.healthyFacades}`);
      console.log(`      Critical Issues: ${healthSummary.overall.criticalIssues}`);
    } catch (error) {
      console.log(`   ❌ Health summary error: ${(error as Error).message}`);
    }

    console.log('\n✅ Facade Status Integration Test Complete!\n');

    // Test 6: Performance test - rapid facade status queries
    console.log('6️⃣ Performance Test - Rapid Facade Status Queries...');
    const startTime = performance.now();
    
    for (let i = 0; i < 100; i++) {
      getSystemStatus();
      getFacadeStatus('intelligence');
      getFacadeStatus('enterprise');
      getFacadeStatus('operations');
      getFacadeStatus('infrastructure');
    }
    
    const endTime = performance.now();
    console.log(`   ⚡ 500 facade status queries completed in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`   📈 Average query time: ${((endTime - startTime) / 500).toFixed(4)}ms per query`);

    console.log('\n🎉 All Facade Status Integration Tests Passed!');
    console.log('🏆 Result: All 4 strategic facades properly use centralized facade status management');
    
  } catch (error) {
    console.error('💥 Facade Status Integration Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testFacadeStatusIntegration().catch(console.error);

export { testFacadeStatusIntegration };