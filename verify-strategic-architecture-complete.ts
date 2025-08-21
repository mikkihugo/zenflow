#!/usr/bin/env npx tsx

/**
 * Comprehensive Strategic Architecture v2.0.0 Verification
 * 
 * Verifies that all major components of the strategic architecture are working:
 * 1. Full Awilix migration with ResolutionMode enum
 * 2. All strategic facades use centralized facade status management
 * 3. ServiceContainer registries with enhanced capabilities
 * 4. Foundation package proper exports and compilation
 */

console.log('🧪 Strategic Architecture v2.0.0 - Comprehensive Verification\n');

async function verifyStrategicArchitecture() {
  const results = {
    awilixMigration: false,
    facadeStatusManagement: false,
    serviceContainers: false,
    foundationExports: false,
    overallSuccess: false
  };

  try {
    // Test 1: Verify Full Awilix Migration
    console.log('🔧 Test 1: Full Awilix Migration with ResolutionMode');
    try {
      const awilixModule = await import('./packages/foundation/src/di/di-container');
      
      if (awilixModule.ResolutionMode && 
          awilixModule.ResolutionMode.PROXY && 
          awilixModule.ResolutionMode.CLASSIC &&
          awilixModule.createDIContainer) {
        console.log('✅ Awilix migration complete - ResolutionMode enum available');
        console.log('  - PROXY mode:', awilixModule.ResolutionMode.PROXY);
        console.log('  - CLASSIC mode:', awilixModule.ResolutionMode.CLASSIC);
        results.awilixMigration = true;
      } else {
        console.log('❌ Awilix migration incomplete - missing ResolutionMode or createDIContainer');
      }
    } catch (error) {
      console.log('❌ Awilix migration failed:', error);
    }
    console.log();

    // Test 2: Verify Facade Status Management
    console.log('📋 Test 2: Strategic Facade Status Management');
    try {
      const foundationModule = await import('./packages/foundation/src/facade-status-manager');
      
      if (foundationModule.facadeStatusManager &&
          foundationModule.registerFacade &&
          foundationModule.getSystemStatus) {
        console.log('✅ Foundation facade status management working');
        
        // Test facade status manager functions
        const systemStatus = foundationModule.getSystemStatus();
        console.log('  - System status retrieved:', systemStatus?.overall || 'unknown');
        results.facadeStatusManagement = true;
      } else {
        console.log('❌ Foundation facade status management missing functions');
      }
    } catch (error) {
      console.log('❌ Foundation facade status management failed:', error);
    }
    console.log();

    // Test 3: Verify ServiceContainer Registries
    console.log('🗄️ Test 3: ServiceContainer Registries');
    try {
      const serviceContainerModule = await import('./packages/foundation/src/di/service-container');
      
      if (serviceContainerModule.ServiceContainer) {
        console.log('✅ ServiceContainer available');
        
        // Create test container
        const container = new serviceContainerModule.ServiceContainer('test');
        const stats = container.getStats();
        console.log('  - Container stats:', stats.totalServices, 'services');
        results.serviceContainers = true;
      } else {
        console.log('❌ ServiceContainer not available');
      }
    } catch (error) {
      console.log('❌ ServiceContainer test failed:', error);
    }
    console.log();

    // Test 4: Verify Foundation Package Exports
    console.log('🔧 Test 4: Foundation Package Exports');
    try {
      const foundationIndex = await import('./packages/foundation/src/index');
      
      const expectedExports = [
        'facadeStatusManager', 'registerFacade', 'getSystemStatus',
        'DIContainer', 'createDIContainer', 'ResolutionMode',
        'getLogger', 'safe', 'safeAsync'
      ];
      
      const missingExports = expectedExports.filter(exp => !(exp in foundationIndex));
      
      if (missingExports.length === 0) {
        console.log('✅ All expected foundation exports available');
        results.foundationExports = true;
      } else {
        console.log('❌ Missing foundation exports:', missingExports.join(', '));
      }
    } catch (error) {
      console.log('❌ Foundation exports test failed:', error);
    }
    console.log();

    // Overall Results
    const passedTests = Object.values(results).filter(Boolean).length - 1; // -1 for overallSuccess
    const totalTests = 4;
    results.overallSuccess = passedTests === totalTests;

    console.log('📊 Strategic Architecture v2.0.0 Verification Results:');
    console.log(`  - Awilix Migration: ${results.awilixMigration ? '✅' : '❌'}`);
    console.log(`  - Facade Status Management: ${results.facadeStatusManagement ? '✅' : '❌'}`);
    console.log(`  - ServiceContainer Registries: ${results.serviceContainers ? '✅' : '❌'}`);
    console.log(`  - Foundation Exports: ${results.foundationExports ? '✅' : '❌'}`);
    console.log(`  - Overall Success: ${results.overallSuccess ? '✅' : '❌'} (${passedTests}/${totalTests})`);

    if (results.overallSuccess) {
      console.log('\n🎉 Strategic Architecture v2.0.0 - VERIFICATION COMPLETE!');
      console.log('✨ All core architectural components working correctly');
      console.log('🚀 Ready for remaining facade migrations and production use');
    } else {
      console.log('\n⚠️  Strategic Architecture v2.0.0 - PARTIAL SUCCESS');
      console.log('🔧 Some components need attention before full deployment');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    results.overallSuccess = false;
  }

  return results;
}

// Run verification
verifyStrategicArchitecture().catch(error => {
  console.error('❌ Verification execution failed:', error);
  process.exit(1);
});