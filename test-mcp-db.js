#!/usr/bin/env node

import { ClaudeFlowMCPServer } from './src/mcp/mcp-server.js';

async function testDatabaseConnection() {
  console.log('Testing MCP server database connection...');
  
  const server = new ClaudeFlowMCPServer();
  
  // Wait for database initialization
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Database manager initialized:', !!server.databaseManager);
  
  if (server.databaseManager) {
    // Test swarm creation
    const result = await server.executeTool('swarm_init', {
      topology: 'hierarchical',
      maxAgents: 5,
      strategy: 'test'
    });
    
    console.log('Swarm creation result:', {
      success: result.success,
      swarmId: result.swarmId,
      persisted: result.persisted
    });
    
    // Check if swarm was actually stored in database
    if (result.persisted && result.swarmId) {
      try {
        const swarm = await server.databaseManager.getSwarm(result.swarmId);
        console.log('Swarm found in database:', !!swarm);
        console.log('Swarm data:', swarm ? {
          id: swarm.id,
          topology: swarm.topology,
          maxAgents: swarm.maxAgents
        } : null);
      } catch (error) {
        console.error('Failed to retrieve swarm:', error.message);
      }
    }
  } else {
    console.log('Database manager failed to initialize');
  }
  
  process.exit(0);
}

testDatabaseConnection().catch(console.error);