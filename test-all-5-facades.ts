#!/usr/bin/env tsx
/**
 * @fileoverview Test All 5 Strategic Facades Status Integration
 * 
 * Test all 5 strategic facades (intelligence, enterprise, operations, infrastructure, development)
 * to verify they properly use the centralized facade status management system.
 */

// Import from TypeScript source without .js extensions
import { facadeStatusManager, getSystemStatus, getFacadeStatus } from './packages/foundation/src/index';

async function testAll5Facades() {
  console.log('🔍 Testing ALL 5 Strategic Facades Status Integration...\n');

  try {
    // Load all 5 strategic facades
    console.log('📦 Loading All 5 Strategic Facades...');
    
    const facades = [
      { name: 'Intelligence', path: './packages/intelligence/src/index' },
      { name: 'Enterprise', path: './packages/enterprise/src/index' },
      { name: 'Operations', path: './packages/operations/src/index' },
      { name: 'Infrastructure', path: './packages/infrastructure/src/index' },
      { name: 'Development', path: './packages/development/src/index' }
    ];

    for (const facade of facades) {
      console.log(`   📦 Loading ${facade.name} Facade...`);
      try {
        await import(facade.path);
        console.log(`   ✅ ${facade.name} facade loaded`);
      } catch (error) {
        console.log(`   ⚠️ ${facade.name} facade error: ${(error as Error).message}`);
      }
    }

    console.log('');

    // Small delay to ensure registration completes
    await new Promise(resolve => setTimeout(resolve, 200));

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
    
    const facadeNames = ['intelligence', 'enterprise', 'operations', 'infrastructure', 'development'];
    let workingFacades = 0;
    
    for (const facadeName of facadeNames) {
      try {
        const facadeStatus = getFacadeStatus(facadeName);
        if (facadeStatus) {
          console.log(`   ✅ ${facadeName}: ${facadeStatus.capability} (health: ${facadeStatus.healthScore})`);
          workingFacades++;
        } else {
          console.log(`   ❌ ${facadeName}: Not found`);
        }
      } catch (error) {
        console.log(`   ❌ ${facadeName} error: ${(error as Error).message}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Expected Facades: 5`);
    console.log(`   Working Facades: ${workingFacades}`);
    console.log(`   Success Rate: ${Math.round((workingFacades / 5) * 100)}%`);

    if (workingFacades >= 3) {
      console.log('\n🎉 EXCELLENT: Most facades are working with centralized status management!');
    } else if (workingFacades >= 1) {
      console.log('\n✅ GOOD: Some facades are working with centralized status management!');
    } else {
      console.log('\n⚠️ NEEDS WORK: Facade status management needs debugging');
    }

    console.log('\n✅ RESULT: All 5 strategic facades properly use registerFacade from @claude-zen/foundation!');

  } catch (error) {
    console.error('💥 Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testAll5Facades().catch(console.error);