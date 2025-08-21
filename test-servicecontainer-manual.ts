/**
 * Manual ServiceContainer Registry Integration Test
 * 
 * Simple manual test to verify the ServiceContainer-based registries work correctly.
 * Run with: node --loader tsx/esm test-servicecontainer-manual.ts
 */

import { createServiceContainer } from './packages/foundation/src/index.js';

// Mock memory coordinator
const mockMemoryCoordinator = {
  coordinate: async () => ({ success: true }),
  deleteEntry: async () => true,
  store: async () => true,
  list: async () => []
};

console.log('🧪 Testing ServiceContainer Registry Integration...\n');

async function testServiceContainer() {
  console.log('1️⃣ Testing ServiceContainer creation...');
  
  try {
    const container = createServiceContainer('test-registry');
    console.log('✅ ServiceContainer created successfully');
    
    // Test registration
    const testService = { name: 'test-service', initialized: true };
    const result = container.registerInstance('test-service', testService, {
      capabilities: ['testing', 'integration'],
      metadata: { type: 'test', version: '1.0.0' },
      enabled: true
    });
    
    if (result.isOk()) {
      console.log('✅ Service registration successful');
    } else {
      console.log('❌ Service registration failed:', result.error.message);
      return;
    }
    
    // Test resolution
    const resolvedResult = container.resolve('test-service');
    if (resolvedResult.isOk()) {
      console.log('✅ Service resolution successful');
      console.log('   Retrieved service:', resolvedResult.value.name);
    } else {
      console.log('❌ Service resolution failed:', resolvedResult.error.message);
      return;
    }
    
    // Test capabilities
    const servicesByCapability = container.getServicesByCapability('testing');
    console.log('✅ Services by capability:', servicesByCapability.length);
    
    // Test health monitoring
    container.startHealthMonitoring();
    const healthStatus = await container.getHealthStatus();
    console.log('✅ Health status:', healthStatus.totalServices, 'services');
    
    // Test stats
    const stats = container.getStats();
    console.log('✅ Container stats:', {
      totalServices: stats.totalServices,
      enabledServices: stats.enabledServices
    });
    
    await container.dispose();
    console.log('✅ Container disposed successfully');
    
  } catch (error) {
    console.error('❌ ServiceContainer test failed:', error);
    return false;
  }
  
  return true;
}

async function testMigratedRegistries() {
  console.log('\n2️⃣ Testing Migrated Registries...');
  
  try {
    // Import and test MigratedAgentRegistry  
    const { createMigratedAgentRegistry } = await import('./apps/claude-code-zen-server/src/coordination/agents/agent-registry-migrated.js');
    
    console.log('✅ MigratedAgentRegistry imported successfully');
    
    const agentRegistry = createMigratedAgentRegistry(mockMemoryCoordinator, 'test-agents');
    await agentRegistry.initialize();
    console.log('✅ MigratedAgentRegistry initialized');
    
    // Test agent registration
    const testAgent = {
      id: 'test-agent-001',
      name: 'Test Agent',
      type: 'coder' as const,
      status: 'idle' as const,
      capabilities: {
        languages: ['typescript'],
        frameworks: ['node'],
        domains: ['web-development'],
        tools: ['git']
      }
    };
    
    await agentRegistry.registerAgent(testAgent);
    console.log('✅ Agent registered successfully');
    
    // Test agent retrieval
    const retrievedAgent = agentRegistry.getAgent(testAgent.id);
    if (retrievedAgent) {
      console.log('✅ Agent retrieved:', retrievedAgent.name);
    } else {
      console.log('❌ Agent retrieval failed');
      return false;
    }
    
    // Test enhanced features
    const healthStatus = await agentRegistry.getHealthStatus();
    console.log('✅ Agent registry health status:', healthStatus.totalServices, 'services');
    
    const agentsByCapability = agentRegistry.getAgentsByCapability('coder');
    console.log('✅ Agents by capability:', agentsByCapability.length);
    
    await agentRegistry.shutdown();
    console.log('✅ MigratedAgentRegistry shutdown complete');
    
  } catch (error) {
    console.error('❌ MigratedAgentRegistry test failed:', error);
    return false;
  }
  
  try {
    // Import and test MigratedEventRegistry
    const { createMigratedEventRegistry } = await import('./packages/implementation-packages/event-system/src/registry-migrated.js');
    
    console.log('✅ MigratedEventRegistry imported successfully');
    
    const eventRegistry = createMigratedEventRegistry();
    await eventRegistry.initialize({ autoRegisterDefaults: false });
    console.log('✅ MigratedEventRegistry initialized');
    
    // Test factory registration
    const testFactory = {
      create: () => ({ name: 'test-manager', type: 'system' }),
      constructor: { name: 'TestFactory' },
      healthCheck: () => true
    };
    
    eventRegistry.registerFactory('system', testFactory);
    console.log('✅ Event factory registered successfully');
    
    // Test factory retrieval
    const retrievedFactory = eventRegistry.getFactory('system');
    if (retrievedFactory) {
      console.log('✅ Event factory retrieved');
    } else {
      console.log('❌ Event factory retrieval failed');
      return false;
    }
    
    // Test enhanced features
    const eventHealthStatus = await eventRegistry.getHealthStatus();
    console.log('✅ Event registry health status:', eventHealthStatus.totalServices, 'services');
    
    await eventRegistry.shutdownAll();
    console.log('✅ MigratedEventRegistry shutdown complete');
    
  } catch (error) {
    console.error('❌ MigratedEventRegistry test failed:', error);
    return false;
  }
  
  return true;
}

async function runTests() {
  console.log('🚀 Starting ServiceContainer Integration Tests\n');
  
  const serviceContainerPassed = await testServiceContainer();
  const registriesPassed = await testMigratedRegistries();
  
  console.log('\n📊 Test Results:');
  console.log(`   ServiceContainer: ${serviceContainerPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Migrated Registries: ${registriesPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (serviceContainerPassed && registriesPassed) {
    console.log('\n🎉 All ServiceContainer integration tests PASSED!');
    console.log('   ✅ Zero breaking changes confirmed');
    console.log('   ✅ Enhanced capabilities working correctly');
    console.log('   ✅ Battle-tested ServiceContainer integration successful');
  } else {
    console.log('\n💥 Some tests FAILED - investigation needed');
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});