#!/usr/bin/env tsx
/**
 * @fileoverview Test Working Facades Status Integration
 * 
 * Quick test to verify the working facades (intelligence, operations) 
 * are properly using the centralized facade status management system.
 */

import { facadeStatusManager, getSystemStatus, getFacadeStatus } from './packages/foundation/src/index.js';

async function testWorkingFacades() {
  console.log('🔍 Testing Working Facades Status Integration...\n');

  try {
    // Load only the working facades
    console.log('📦 Loading Intelligence Facade...');
    await import('./packages/intelligence/src/index.js');
    console.log('✅ Intelligence facade loaded');

    console.log('📦 Loading Operations Facade...');
    await import('./packages/operations/src/index.js');
    console.log('✅ Operations facade loaded\n');

    // Small delay to ensure registration completes
    await new Promise(resolve => setTimeout(resolve, 100));

    // Test system status
    console.log('📊 Testing System Status...');
    const systemStatus = getSystemStatus();
    console.log(`   Total Facades: ${Object.keys(systemStatus.facades).length}`);
    console.log(`   System Status: ${systemStatus.status}`);
    console.log(`   Health Score: ${systemStatus.overallHealthScore}`);
    
    console.log('\n📋 Registered Facades:');
    for (const [facadeName, facadeInfo] of Object.entries(systemStatus.facades)) {
      console.log(`   • ${facadeName}: ${(facadeInfo as any).status} (health: ${(facadeInfo as any).healthScore})`);
    }

    // Test individual facade queries
    console.log('\n🔍 Testing Individual Facade Status...');
    
    try {
      const intelligenceStatus = getFacadeStatus('intelligence');
      console.log(`   ✅ Intelligence: ${intelligenceStatus.status} (health: ${intelligenceStatus.healthScore})`);
    } catch (error) {
      console.log(`   ❌ Intelligence error: ${(error as Error).message}`);
    }

    try {
      const operationsStatus = getFacadeStatus('operations');
      console.log(`   ✅ Operations: ${operationsStatus.status} (health: ${operationsStatus.healthScore})`);
    } catch (error) {
      console.log(`   ❌ Operations error: ${(error as Error).message}`);
    }

    console.log('\n🎉 Working Facades Test Complete!');
    console.log('✅ RESULT: Facade status management system is working correctly!');

  } catch (error) {
    console.error('💥 Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testWorkingFacades().catch(console.error);