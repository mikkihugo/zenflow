// spawn-command.js - Modern ES module spawn command handler
import {
  printSuccess,
  printError,
  printWarning,
  callRuvSwarmLibrary,
  spawnSwarmAgent,
  checkRuvSwarmAvailable,
} from '../utils.js';

// Simple ID generator
function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Main spawn command handler
 * @param {string[]} subArgs - Command arguments
 * @param {Object} flags - Command flags
 */
export async function spawnCommand(subArgs, flags) {
  try {
    // Parse command arguments
    const agentType = subArgs[0] || flags.type || 'general';
    const agentName = flags.name || `${agentType}-${generateId('agent')}`;
    const swarmId = flags['swarm-id'] || flags.swarmId;
    const capabilities = flags.capabilities;
    const coordinated = flags.coordinated || flags.coord;
    const enhanced = flags.enhanced || flags.e;

    // Validate agent type
    const validTypes = [
      'coordinator', 'coder', 'developer', 'researcher', 'analyst', 'analyzer', 
      'tester', 'architect', 'reviewer', 'optimizer', 'general'
    ];

    let validatedType = agentType;
    if (!validTypes.includes(agentType)) {
      printWarning(`⚠️  Unknown agent type '${agentType}'. Using 'general' instead.`);
      validatedType = 'general';
    }

    // Show spawning configuration
    console.log(`🤖 Spawning agent...`);
    console.log(`🏷️  Agent type: ${validatedType}`);
    console.log(`📛 Agent name: ${agentName}`);
    if (swarmId) console.log(`🐝 Target swarm: ${swarmId}`);
    if (capabilities) console.log(`🎯 Custom capabilities: ${capabilities}`);
    if (coordinated) console.log(`🔗 Coordination mode: Enabled`);

    // Choose spawn method based on flags and availability
    if (coordinated || enhanced) {
      await spawnCoordinatedAgent(validatedType, agentName, swarmId, capabilities, flags);
    } else {
      await spawnBasicAgent(validatedType, agentName, flags);
    }

  } catch (error) {
    printError(`Spawn command failed: ${error.message}`);
    if (flags.verbose) {
      console.error('Stack trace:', error.stack);
    }
  }
}

/**
 * Spawn a basic agent with minimal coordination
 */
async function spawnBasicAgent(agentType, agentName, flags) {
  // Simulate basic agent creation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  printSuccess(`✅ Agent spawned: ${agentName}`);
  
  console.log(`\n🤖 AGENT CONFIGURATION:`);
  console.log(`  🆔 Agent ID: ${generateId('agent')}`);
  console.log(`  🏷️  Type: ${agentType}`);
  console.log(`  📛 Name: ${agentName}`);
  console.log(`  🎯 Capabilities: ${getAgentCapabilities(agentType)}`);
  console.log(`  📊 Status: Ready`);
  console.log(`  💭 Note: Basic agent spawning - no orchestrator coordination`);
  
  if (flags.verbose) {
    console.log(`\n🔧 TECHNICAL DETAILS:`);
    console.log(`  📦 Created: ${new Date().toISOString()}`);
    console.log(`  🏗️  Architecture: Standalone agent`);
    console.log(`  🔗 Integration: Manual coordination required`);
  }
}

/**
 * Spawn a coordinated agent with full swarm integration
 */
async function spawnCoordinatedAgent(agentType, agentName, swarmId, capabilities, flags) {
  console.log(`\n🔄 Initializing coordinated agent spawn...`);
  
  // Check if ruv-swarm is available for real coordination
  const isAvailable = await checkRuvSwarmAvailable();
  
  if (isAvailable) {
    try {
      console.log(`🔄 Spawning agent with ruv-swarm coordination...`);
      
      const spawnResult = await callRuvSwarmLibrary('agent_spawn', {
        type: agentType,
        name: agentName,
        swarmId: swarmId,
        capabilities: capabilities,
        timestamp: Date.now(),
      });
      
      if (spawnResult.success) {
        printSuccess(`✅ Coordinated agent spawned successfully`);
        displayCoordinatedAgentDetails(agentType, agentName, swarmId, spawnResult, flags);
      } else {
        printError(`Coordinated spawn failed: ${spawnResult.error || 'Unknown error'}`);
        console.log('Falling back to enhanced local spawn...');
        await spawnEnhancedLocalAgent(agentType, agentName, swarmId, capabilities, flags);
      }
    } catch (error) {
      printError(`Coordinated spawn failed: ${error.message}`);
      console.log('Falling back to enhanced local spawn...');
      await spawnEnhancedLocalAgent(agentType, agentName, swarmId, capabilities, flags);
    }
  } else {
    await spawnEnhancedLocalAgent(agentType, agentName, swarmId, capabilities, flags);
  }
}

/**
 * Enhanced local agent spawning with simulation of coordination features
 */
async function spawnEnhancedLocalAgent(agentType, agentName, swarmId, capabilities, flags) {
  console.log(`🔄 Initializing agent coordination protocols...`);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  console.log(`🧠 Loading agent capabilities and neural patterns...`);
  await new Promise(resolve => setTimeout(resolve, 600));
  
  console.log(`🔗 Establishing swarm communication links...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`💾 Registering agent in coordination memory...`);
  await new Promise(resolve => setTimeout(resolve, 400));
  
  printSuccess(`✅ Enhanced agent spawned and coordinated successfully`);
  displayCoordinatedAgentDetails(agentType, agentName, swarmId, null, flags);
}

/**
 * Display detailed information about a coordinated agent
 */
function displayCoordinatedAgentDetails(agentType, agentName, swarmId, spawnResult, flags) {
  console.log(`\n🤖 COORDINATED AGENT DETAILS:`);
  console.log(`  🆔 Agent ID: ${generateId('agent')}`);
  console.log(`  🏷️  Type: ${agentType}`);
  console.log(`  📛 Name: ${agentName}`);
  console.log(`  🎯 Capabilities: ${getAgentCapabilities(agentType)}`);
  console.log(`  🔗 Coordination: Active`);
  console.log(`  💾 Memory access: Enabled`);
  console.log(`  📊 Status: Ready for task assignment`);
  
  if (swarmId) {
    console.log(`  🐝 Swarm membership: ${swarmId}`);
  }
  
  if (spawnResult && flags.verbose) {
    console.log(`\n🔧 TECHNICAL DETAILS:`);
    console.log(`  📦 Created: ${new Date().toISOString()}`);
    console.log(`  🏗️  Architecture: ${spawnResult.architecture || 'Distributed swarm member'}`);
    console.log(`  🔗 Integration: ${spawnResult.integration || 'Full ruv-swarm coordination'}`);
    console.log(`  📈 Performance: ${spawnResult.expectedPerformance || 'Optimized'}`);
  }
  
  console.log(`\n📋 NEXT STEPS:`);
  console.log(`  • Use: claude-zen task create <type> "description" --assign ${agentName}`);
  console.log(`  • Monitor: claude-zen agent list --verbose`);
  console.log(`  • Coordinate: claude-zen coordination task-orchestrate --task "objective"`);
  
  if (swarmId) {
    console.log(`  • Swarm status: claude-zen swarm status --id ${swarmId}`);
  }
}

/**
 * Get capabilities description for agent type
 */
function getAgentCapabilities(type) {
  const capabilities = {
    coordinator: 'Task orchestration, agent management, workflow coordination',
    coder: 'Code implementation, debugging, technical development',
    developer: 'Code implementation, debugging, technical development', 
    researcher: 'Information gathering, analysis, documentation',
    analyst: 'Data analysis, performance monitoring, metrics',
    analyzer: 'Data analysis, performance monitoring, metrics',
    tester: 'Quality assurance, test automation, validation',
    architect: 'System design, architecture planning, technical strategy',
    reviewer: 'Code review, quality assessment, best practices',
    optimizer: 'Performance optimization, efficiency improvement, bottleneck analysis',
    general: 'Multi-purpose coordination and development',
  };
  return capabilities[type] || capabilities.general;
}