#!/usr/bin/env tsx

/**
 * Test script for WASM Integration
 * Tests the real WASM loading implementation for swarm and persistence modules
 */

import { WasmModuleLoader } from './src/neural/wasm/wasm-loader.ts';
import { WasmEnhancedLoader } from './src/neural/wasm/wasm-enhanced-loader.ts';

async function testWasmIntegration() {
  console.log('🧪 Starting WASM Integration Test...\n');
  
  // Test 1: Basic WASM Module Loader
  console.log('📦 Test 1: Basic WASM Module Loader');
  const basicLoader = new WasmModuleLoader();
  
  try {
    await basicLoader.initialize();
    const status = basicLoader.getModuleStatus();
    
    console.log('Basic Loader Status:', {
      loaded: status.loaded,
      swarmLoaded: status.swarmLoaded,
      persistenceLoaded: status.persistenceLoaded,
      status: status.status,
      capabilities: status.capabilities
    });
    
    console.log('Version:', basicLoader.getVersion());
    console.log('SIMD Support:', basicLoader.hasSimdSupport());
    console.log('Memory Usage:', basicLoader.getTotalMemoryUsage(), 'bytes');
    
    if (status.error) {
      console.warn('⚠️ Basic loader error:', status.error);
    } else {
      console.log('✅ Basic loader initialized successfully');
    }
    
  } catch (error) {
    console.error('❌ Basic loader failed:', error);
  }
  
  console.log('\n---\n');
  
  // Test 2: Enhanced WASM Loader
  console.log('⚡ Test 2: Enhanced WASM Loader');
  const enhancedLoader = new WasmEnhancedLoader();
  
  try {
    await enhancedLoader.initialize();
    const enhancedStatus = enhancedLoader.getEnhancedStatus();
    
    console.log('Enhanced Loader Status:', {
      loaded: enhancedStatus.loaded,
      swarmLoaded: enhancedStatus.swarmLoaded,
      persistenceLoaded: enhancedStatus.persistenceLoaded,
      enhanced: enhancedStatus.enhanced,
      optimization: enhancedStatus.optimization,
      status: enhancedStatus.status
    });
    
    console.log('Performance Metrics:', enhancedStatus.performance);
    console.log('Capabilities:', enhancedStatus.capabilities);
    
    console.log('✅ Enhanced loader initialized successfully');
    
  } catch (error) {
    console.error('❌ Enhanced loader failed:', error);
  }
  
  console.log('\n---\n');
  
  // Test 3: Swarm Operations
  console.log('🐝 Test 3: Swarm Operations');
  
  try {
    const swarmInstance = basicLoader.getSwarmInstance();
    
    if (swarmInstance) {
      console.log('Swarm Instance Available:', swarmInstance.name);
      console.log('Max Agents:', swarmInstance.max_agents);
      
      // Test agent spawning
      const agent = await basicLoader.spawnAgent({
        type: 'researcher',
        name: 'test-researcher',
        capabilities: ['research', 'analysis'],
        cognitivePattern: 'convergent'
      });
      
      if (agent) {
        console.log('✅ Agent spawned successfully:', {
          id: agent.id,
          type: agent.agent_type,
          status: agent.status
        });
        
        // Test task execution
        const task = {
          description: 'Test task execution',
          priority: 'medium' as const,
          maxAgents: 1
        };
        
        const taskResult = await agent.execute(task);
        console.log('Task Result:', {
          id: taskResult.id,
          status: taskResult.status,
          duration: taskResult.duration
        });
        
        // Test metrics
        const metrics = agent.get_metrics();
        console.log('Agent Metrics:', metrics);
        
      } else {
        console.warn('⚠️ Agent spawning returned null');
      }
      
      // Test swarm status
      const swarmStatus = basicLoader.getSwarmStatus();
      console.log('Swarm Status:', swarmStatus);
      
      // Test task orchestration
      const orchestrationTask = {
        description: 'Test orchestration',
        priority: 'high' as const,
        maxAgents: 2
      };
      
      const orchestrationResult = await basicLoader.orchestrateTask(orchestrationTask);
      console.log('Orchestration Result:', {
        id: orchestrationResult?.id,
        status: orchestrationResult?.status,
        duration: orchestrationResult?.duration
      });
      
    } else {
      console.warn('⚠️ Swarm instance not available');
    }
    
  } catch (error) {
    console.error('❌ Swarm operations failed:', error);
  }
  
  console.log('\n---\n');
  
  // Test 4: Runtime Features
  console.log('🔧 Test 4: Runtime Features');
  
  try {
    const runtimeFeatures = basicLoader.getRuntimeFeatures();
    
    if (runtimeFeatures) {
      console.log('Runtime Features:', {
        simd: runtimeFeatures.simd_available,
        threads: runtimeFeatures.threads_available,
        memoryLimit: runtimeFeatures.memory_limit.toString()
      });
      
      const featuresJson = runtimeFeatures.get_features_json();
      console.log('Features JSON:', featuresJson);
      
    } else {
      console.warn('⚠️ Runtime features not available');
    }
    
  } catch (error) {
    console.error('❌ Runtime features test failed:', error);
  }
  
  console.log('\n---\n');
  
  // Test 5: Module Status Comparison
  console.log('📊 Test 5: Module Status Summary');
  
  const basicStatus = basicLoader.getModuleStatus();
  const enhancedStatus = enhancedLoader.getEnhancedStatus();
  
  console.log('Status Comparison:');
  console.table({
    'Basic Loader': {
      loaded: basicStatus.loaded,
      swarmLoaded: basicStatus.swarmLoaded,
      persistenceLoaded: basicStatus.persistenceLoaded,
      neuralLoaded: basicStatus.neuralLoaded,
      forecastingLoaded: basicStatus.forecastingLoaded,
      status: basicStatus.status,
      memoryUsage: basicStatus.memoryUsage
    },
    'Enhanced Loader': {
      loaded: enhancedStatus.loaded,
      swarmLoaded: enhancedStatus.swarmLoaded,
      persistenceLoaded: enhancedStatus.persistenceLoaded,
      neuralLoaded: enhancedStatus.neuralLoaded,
      forecastingLoaded: enhancedStatus.forecastingLoaded,
      status: enhancedStatus.status,
      memoryUsage: enhancedStatus.memoryUsage
    }
  });
  
  console.log('\n📋 Capabilities Summary:');
  console.log('Basic:', basicStatus.capabilities.join(', '));
  console.log('Enhanced:', enhancedStatus.capabilities.join(', '));
  
  // Test 6: Cleanup
  console.log('\n🧹 Test 6: Cleanup');
  
  try {
    await basicLoader.cleanup();
    await enhancedLoader.cleanup();
    
    console.log('✅ Cleanup completed successfully');
    
    // Verify cleanup
    const cleanedStatus = basicLoader.getModuleStatus();
    console.log('Post-cleanup status:', cleanedStatus.status);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
  
  console.log('\n🎉 WASM Integration Test Complete!\n');
}

// Run the test
testWasmIntegration().catch(console.error);