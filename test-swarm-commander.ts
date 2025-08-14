#!/usr/bin/env ts-node

/**
 * Quick test of SwarmCommander capabilities
 * Tests the native swarm coordination without MCP layer
 */

import { SwarmCommander } from './src/coordination/agents/swarm-commander';

async function testSwarmCommander() {
  console.log('🐝 Testing SwarmCommander capabilities...');
  
  try {
    // Create SwarmCommander instance
    const commander = new SwarmCommander({
      id: 'test-commander',
      maxAgents: 5,
      sparcEnabled: true,
      neuralEnabled: true
    });

    console.log('✅ SwarmCommander instantiated successfully');
    
    // Test basic coordination
    const result = await commander.coordinateTask({
      description: 'Test task coordination',
      priority: 'medium',
      estimatedDuration: 60
    });

    console.log('✅ Task coordination result:', result);
    
  } catch (error) {
    console.error('❌ SwarmCommander test failed:', error.message);
    console.log('📋 This indicates the TypeScript compilation issues are blocking usage');
  }
}

testSwarmCommander();