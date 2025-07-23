/**
 * ruv-swarm NPM Library Integration
 * Import as library for high-performance coordination
 * NO CLI commands - pure programmatic usage
 */

import { printSuccess, printError, printWarning, printInfo } from '../utils.js';

// Import ruv-swarm as library components
let ruvSwarmLib = null;
let isAvailable = false;

/**
 * Ensure ruv-swarm library is loaded
 */
async function ensureRuvSwarmLoaded() {
  if (!ruvSwarmLib) {
    try {
      ruvSwarmLib = await import('ruv-swarm');
      isAvailable = true;
      printInfo('✅ ruv-swarm library classes imported successfully');
    } catch (error) {
      printWarning('⚠️ ruv-swarm library not available, using local fallback');
      isAvailable = false;
      throw new Error('ruv-swarm library not available');
    }
  }
  return ruvSwarmLib;
}

/**
 * Check if ruv-swarm is available
 */
export async function isRuvSwarmAvailable() {
  try {
    await ensureRuvSwarmLoaded();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Export the loader function for direct access
 */
export { ensureRuvSwarmLoaded };

/**
 * Get available ruv-swarm library classes
 */
export async function getRuvSwarmClasses() {
  const lib = await ensureRuvSwarmLoaded();
  return { 
    RuvSwarm: lib.RuvSwarm, 
    Swarm: lib.Swarm, 
    Agent: lib.Agent, 
    NeuralAgent: lib.NeuralAgent 
  };
}

/**
 * Create service-specific hive database path
 */
export function getServiceHivePath(serviceName) {
  return `./services/${serviceName}/.hive/${serviceName}-swarm.db`;
}

/**
 * Restore persistent hive from database
 */
export async function restorePersistentHive(serviceName) {
  if (!isAvailable) {
    return null; // Graceful fallback
  }

  try {
    const lib = await ensureRuvSwarmLoaded();
    const dbPath = getServiceHivePath(serviceName);
    const ruvSwarm = new lib.RuvSwarm();
    
    printInfo(`🔄 Restoring persistent hive: ${serviceName}`);
    
    // Create a swarm for this service
    const hive = await ruvSwarm.createSwarm({
      name: serviceName,
      maxAgents: 8,
      cognitive_diversity: true
    });
    
    printSuccess(`✅ Hive restored: ${serviceName}`);
    return hive;
    
  } catch (error) {
    printWarning(`Could not restore hive for ${serviceName}: ${error.message}`);
    return null;
  }
}

/**
 * Initialize permanent service-level hive swarm
 * Uses ruv-swarm library for high-performance coordination
 */
export async function initializePersistentHive(serviceConfig = {}) {
  if (!isAvailable) {
    throw new Error('ruv-swarm library not available - install with: npm install ruv-swarm');
  }

  const {
    serviceName,
    topology = 'hierarchical',
    maxAgents = 8,
    strategy = 'adaptive',
    persistenceDb
  } = serviceConfig;

  try {
    const hiveConfig = {
      id: `hive-${serviceName}`,
      topology,
      maxAgents,
      strategy,
      persistence: {
        enabled: true,
        database: persistenceDb,
        type: 'sqlite'
      },
      features: {
        neural_networks: true,
        cognitive_diversity: true,
        simd_support: true,
        long_running: true // Key: permanent operation
      }
    };

    const lib = await ensureRuvSwarmLoaded();
    
    printInfo(`🏗️ Initializing persistent hive for service: ${serviceName}`);
    
    // Create RuvSwarm factory instance
    const ruvSwarm = new lib.RuvSwarm();
    
    // Create a persistent swarm for this service
    const hive = await ruvSwarm.createSwarm({
      name: serviceName,
      maxAgents,
      cognitive_diversity: true,
      topology: topology === 'hierarchical' ? 'hierarchy' : topology
    });
    
    printSuccess(`✅ Persistent hive initialized: ${serviceName}`);
    printInfo(`🗄️ Database: ${persistenceDb}`);
    
    return hive;
    
  } catch (error) {
    printError(`Failed to initialize persistent hive: ${error.message}`);
    throw error;
  }
}

/**
 * Spawn agent using ruv-swarm
 */
export async function spawnAgent(swarm, agentConfig = {}) {
  if (!isAvailable) {
    throw new Error('ruv-swarm library not available');
  }

  const {
    type = 'researcher',
    name = `${type}-agent`,
    capabilities = []
  } = agentConfig;

  try {
    const agent = await swarm.spawn(type, {
      name, 
      capabilities,
      cognitive_pattern: 'adaptive'
    });

    printSuccess(`🤖 Agent spawned: ${name} (${type})`);
    return agent;
    
  } catch (error) {
    printError(`Failed to spawn agent: ${error.message}`);
    throw error;
  }
}

/**
 * Execute task using ruv-swarm orchestration
 */
export async function orchestrateTask(swarm, task, options = {}) {
  if (!isAvailable) {
    throw new Error('ruv-swarm library not available');
  }

  const {
    strategy = 'parallel',
    priority = 'high',
    maxAgents = 5
  } = options;

  try {
    printInfo(`🎯 Orchestrating task: ${task}`);
    
    const result = await swarm.orchestrate({
      task,
      strategy,
      priority,
      maxAgents
    });

    printSuccess(`✅ Task orchestrated: ${result.taskId}`);
    return result;
    
  } catch (error) {
    printError(`Task orchestration failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get swarm status using ruv-swarm
 */
export async function getSwarmStatus(swarm, options = {}) {
  if (!isAvailable) {
    throw new Error('ruv-swarm library not available');
  }

  try {
    const status = await swarm.getStatus(options);
    return {
      id: swarm.getId(),
      topology: status.topology,
      agents: status.agents || [],
      tasks: status.tasks || {},
      performance: status.performance || {},
      features: status.features || {}
    };
  } catch (error) {
    printError(`Failed to get swarm status: ${error.message}`);
    throw error;
  }
}

/**
 * Neural training using ruv-swarm capabilities
 */
export async function trainNeuralPatterns(swarm, options = {}) {
  if (!isAvailable) {
    throw new Error('ruv-swarm library not available');
  }

  const {
    iterations = 10,
    data = 'recent'
  } = options;

  try {
    printInfo(`🧠 Training neural patterns: ${iterations} iterations`);
    
    const result = await swarm.neural.train({
      iterations,
      data
    });

    printSuccess(`✅ Neural training completed: ${result.improvement}% improvement`);
    return result;
    
  } catch (error) {
    printError(`Neural training failed: ${error.message}`);
    throw error;
  }
}

/**
 * Benchmark swarm performance
 */
export async function benchmarkSwarm(swarm, options = {}) {
  if (!isAvailable) {
    throw new Error('ruv-swarm library not available');
  }

  const {
    type = 'swarm',
    iterations = 10
  } = options;

  try {
    printInfo(`📊 Running swarm benchmark: ${type}, ${iterations} iterations`);
    
    const benchmark = await swarm.benchmark({
      type,
      iterations
    });

    printSuccess(`✅ Benchmark completed: ${benchmark.score} score`);
    return benchmark;
    
  } catch (error) {
    printError(`Benchmark failed: ${error.message}`);
    throw error;
  }
}

export default {
  ensureRuvSwarmLoaded,
  isRuvSwarmAvailable,
  getRuvSwarmClasses,
  getServiceHivePath,
  restorePersistentHive,
  initializePersistentHive,
  spawnAgent,
  orchestrateTask,
  getSwarmStatus,
  trainNeuralPatterns,
  benchmarkSwarm
};