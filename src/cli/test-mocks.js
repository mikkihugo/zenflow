/**
 * Test Mocks for fixing broken imports
 * Provides missing exports that tests expect
 */

// Mock for missing showAllCommands
export function showAllCommands() {
  return {
    core: ['init', 'start', 'status', 'config'],
    coordination: ['hive-mind', 'swarm', 'agent', 'task'],
    management: ['memory', 'mcp', 'monitor', 'security'],
    development: ['github', 'deploy', 'workflow', 'analytics']
  };
}

// Mock Agent export for ruv-swarm
export class Agent {
  constructor(config = {}) {
    this.id = config.id || 'test-agent';
    this.type = config.type || 'test';
    this.config = config;
  }

  async initialize() {
    return true;
  }

  async execute(task) {
    return {
      success: true,
      result: `Mock execution of ${task}`,
      agent: this.id
    };
  }

  async cleanup() {
    return true;
  }
}

// Mock RuvSwarm export 
export class RuvSwarm {
  constructor(config = {}) {
    this.config = config;
    this.agents = new Map();
  }

  async init() {
    return true;
  }

  async spawnAgent(type, config) {
    const agent = new Agent({ type, ...config });
    this.agents.set(agent.id, agent);
    return agent;
  }

  async orchestrate(task) {
    return {
      success: true,
      result: `Mock orchestration of ${task}`,
      agents: this.agents.size
    };
  }
}

// Mock SwarmMemory export
export class SwarmMemory {
  constructor() {
    this.memory = new Map();
  }

  async store(key, value) {
    this.memory.set(key, value);
    return true;
  }

  async retrieve(key) {
    return this.memory.get(key);
  }

  async search(pattern) {
    const results = [];
    for (const [key, value] of this.memory.entries()) {
      if (key.includes(pattern)) {
        results.push({ key, value });
      }
    }
    return results;
  }
}

export default {
  showAllCommands,
  Agent,
  RuvSwarm,
  SwarmMemory
};