#!/usr/bin/env tsx

/**
 * Test MCP Module Status - Shows the current status of modules for MCP tools
 */

import { WasmModuleLoader } from './src/neural/wasm/wasm-loader.js';

async function testMcpModuleStatus() {
  console.log('🔍 Testing MCP Module Status...\n');
  
  // Initialize the WASM loader
  const loader = new WasmModuleLoader();
  await loader.initialize();
  
  // Get the module status
  const status = loader.getModuleStatus();
  
  console.log('📊 Module Status for MCP Tools:');
  console.log('=====================================');
  
  console.log(`Overall Status: ${status.status}`);
  console.log(`Loaded: ${status.loaded}`);
  console.log('');
  
  console.log('Module-Specific Status:');
  console.log(`  🐝 Swarm Module: ${status.swarmLoaded ? '✅ LOADED' : '❌ NOT LOADED'}`);
  console.log(`  💾 Persistence Module: ${status.persistenceLoaded ? '✅ LOADED' : '❌ NOT LOADED'}`);
  console.log(`  🧠 Neural Module: ${status.neuralLoaded ? '✅ LOADED' : '❌ NOT LOADED'}`);
  console.log(`  📈 Forecasting Module: ${status.forecastingLoaded ? '✅ LOADED' : '❌ NOT LOADED'}`);
  console.log('');
  
  console.log('System Information:');
  console.log(`  Version: ${loader.getVersion()}`);
  console.log(`  SIMD Support: ${loader.hasSimdSupport() ? '✅ Available' : '❌ Not Available'}`);
  console.log(`  Memory Usage: ${loader.getTotalMemoryUsage()} bytes`);
  console.log('');
  
  console.log('Available Capabilities:');
  const capabilities = loader.getCapabilities();
  capabilities.forEach(cap => {
    console.log(`  • ${cap}`);
  });
  console.log('');
  
  if (status.error) {
    console.log('⚠️ Error Details:');
    console.log(`  ${status.error}`);
    console.log('');
  }
  
  // Test swarm functionality
  console.log('🧪 Testing Swarm Functionality:');
  const swarmInstance = loader.getSwarmInstance();
  
  if (swarmInstance) {
    console.log(`  Swarm Name: ${swarmInstance.name}`);
    console.log(`  Max Agents: ${swarmInstance.max_agents}`);
    console.log(`  Agent Count: ${swarmInstance.agent_count}`);
    
    try {
      const testAgent = await loader.spawnAgent({
        type: 'coordinator',
        name: 'status-test-agent'
      });
      
      if (testAgent) {
        console.log(`  ✅ Agent Spawn Test: SUCCESS (${testAgent.id})`);
        
        const task = {
          description: 'MCP status test task',
          priority: 'low' as const
        };
        
        const result = await testAgent.execute(task);
        console.log(`  ✅ Task Execution Test: SUCCESS (${result.status})`);
        
        // Clean up
        testAgent.reset();
      } else {
        console.log('  ❌ Agent Spawn Test: FAILED');
      }
    } catch (error) {
      console.log(`  ❌ Swarm Test Error: ${error}`);
    }
  } else {
    console.log('  ❌ Swarm Instance: NOT AVAILABLE');
  }
  
  console.log('');
  console.log('🏁 MCP Module Status Test Complete!');
  console.log('');
  
  // Summary for MCP integration
  console.log('📋 Summary for MCP Integration:');
  console.log('================================');
  
  const allModulesLoaded = status.swarmLoaded && status.persistenceLoaded && 
                          status.neuralLoaded && status.forecastingLoaded;
  
  if (allModulesLoaded) {
    console.log('✅ ALL MODULES LOADED - MCP tools will work with full WASM integration');
  } else {
    console.log('⚠️ Some modules not loaded - MCP tools using fallback/placeholder functionality');
  }
  
  console.log(`Status: ${status.status.toUpperCase()}`);
  console.log(`Capabilities: ${capabilities.length} available`);
  
  if (swarmInstance) {
    console.log('✅ Swarm coordination available for MCP tools');
  } else {
    console.log('❌ Swarm coordination not available for MCP tools');
  }
  
  // Clean up
  await loader.cleanup();
}

testMcpModuleStatus().catch(console.error);