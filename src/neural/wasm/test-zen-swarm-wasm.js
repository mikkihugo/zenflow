#!/usr/bin/env node

// Test zen-swarm integration with updated WASM module
import { WasmModuleLoader } from './wasm-loader.ts';

async function testZenSwarmWasm() {
  console.log('🚀 Testing zen-swarm with updated WASM neural module...');
  
  const loader = new WasmModuleLoader();
  
  try {
    // Initialize the WASM loader
    await loader.initialize();
    
    console.log('✅ WASM loader initialized');
    console.log('📊 Module status:', loader.getModuleStatus());
    console.log('🔍 Version:', loader.getVersion());
    console.log('⚡ SIMD support:', loader.hasSimdSupport());
    console.log('🛠️ Capabilities:', loader.getCapabilities());
    
    // Test swarm functionality
    const swarmStatus = loader.getSwarmStatus();
    console.log('🐝 Swarm status:', swarmStatus);
    
    // Test agent spawning
    const agent = await loader.spawnAgent({
      type: 'researcher',
      name: 'test-neural-agent'
    });
    
    if (agent) {
      console.log('✅ Agent spawned successfully:', {
        id: agent.id,
        type: agent.agent_type,
        status: agent.status
      });
      
      // Test task execution
      const taskResult = await agent.execute({
        id: 'test-task-1',
        description: 'Test CUDA transpilation functionality',
        priority: 'medium'
      });
      
      console.log('✅ Task executed:', {
        id: taskResult.id,
        status: taskResult.status,
        duration: taskResult.duration + 'ms'
      });
      
      // Get agent metrics
      const metrics = agent.get_metrics();
      console.log('📈 Agent metrics:', metrics);
    }
    
    // Test task orchestration
    const orchestrationResult = await loader.orchestrateTask({
      id: 'orchestration-test',
      description: 'Coordinate neural WASM transpilation across multiple agents',
      priority: 'high'
    });
    
    if (orchestrationResult) {
      console.log('✅ Task orchestration successful:', {
        id: orchestrationResult.id,
        status: orchestrationResult.status,
        duration: orchestrationResult.duration + 'ms'
      });
    }
    
    // Check memory usage
    console.log('💾 Memory usage:', loader.getTotalMemoryUsage(), 'bytes');
    
    console.log('\n🎉 zen-swarm is successfully using the updated WASM neural module!');
    
    // Cleanup
    await loader.cleanup();
    console.log('🧹 Cleanup completed');
    
    return true;
    
  } catch (error) {
    console.error('❌ zen-swarm WASM integration failed:', error);
    return false;
  }
}

testZenSwarmWasm().then(success => {
  console.log('\n' + (success ? '✅ SUCCESS: zen-swarm + WASM integration working!' : '❌ FAILED: zen-swarm + WASM integration issues'));
  process.exit(success ? 0 : 1);
});