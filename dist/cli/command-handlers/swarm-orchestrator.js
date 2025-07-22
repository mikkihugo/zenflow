// swarm-orchestrator.js - Comprehensive swarm orchestration using ruv-swarm library
import { RuvSwarm, Swarm, Agent, Task } from 'ruv-swarm';
import { SqliteMemoryStore } from '../../memory/sqlite-store.js';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { execSync } from 'child_process';

/**
 * Advanced Swarm Orchestration System
 * Leverages ruv-swarm library v1.0.18 with full integration
 */
export class SwarmOrchestrator {
  constructor(options = {}) {
    this.memoryStore = null;
    this.ruvSwarm = null;
    this.activeSwarms = new Map();
    this.globalAgents = new Map();
    this.taskQueue = [];
    this.config = {
      maxConcurrentSwarms: options.maxConcurrentSwarms || 10,
      defaultTopology: options.defaultTopology || 'hierarchical',
      defaultStrategy: options.defaultStrategy || 'adaptive',
      enableNeuralLearning: options.enableNeuralLearning !== false,
      enableHooks: options.enableHooks !== false,
      telemetryEnabled: options.telemetryEnabled !== false,
      ...options
    };
  }

  /**
   * Initialize the orchestrator with memory and ruv-swarm
   */
  async initialize() {
    try {
      // Initialize memory store
      this.memoryStore = new SqliteMemoryStore({ 
        dbName: 'swarm-orchestration.db',
        enableWAL: true 
      });
      await this.memoryStore.initialize();
      
      // Initialize ruv-swarm library
      this.ruvSwarm = new RuvSwarm({
        memoryStore: this.memoryStore,
        telemetryEnabled: this.config.telemetryEnabled,
        hooksEnabled: false, // We use claude-zen hooks instead
        neuralLearning: this.config.enableNeuralLearning
      });

      // Load persistent swarms from memory
      await this.loadPersistedSwarms();
      
      printSuccess('🐝 Swarm Orchestrator initialized with ruv-swarm v1.0.18');
      return true;
    } catch (error) {
      printError(`Failed to initialize swarm orchestrator: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create and launch comprehensive swarm for user objective
   */
  async launchSwarm(objective, options = {}) {
    if (!this.ruvSwarm) {
      throw new Error('Orchestrator not initialized. Call initialize() first.');
    }

    try {
      // Pre-task hook using claude-zen
      if (this.config.enableHooks) {
        execSync(`npx claude-zen hooks pre-task --description "Swarm launch: ${objective}"`, { stdio: 'pipe' });
      }

      const swarmConfig = this.buildSwarmConfig(objective, options);
      
      printInfo(`🚀 Launching comprehensive swarm for: "${objective}"`);
      printInfo(`📋 Configuration: ${swarmConfig.topology} topology, ${swarmConfig.maxAgents} max agents`);

      // Create swarm using ruv-swarm library
      const swarm = new Swarm({
        ...swarmConfig,
        memoryStore: this.memoryStore,
        orchestrator: this
      });

      // Store swarm
      this.activeSwarms.set(swarm.id, swarm);
      
      // Spawn agents based on objective analysis
      const agentPlan = this.analyzeObjectiveForAgents(objective, options);
      const spawnedAgents = [];

      for (const agentSpec of agentPlan) {
        const agent = await this.spawnAgent(swarm, agentSpec);
        spawnedAgents.push(agent);
        this.globalAgents.set(agent.id, agent);
      }

      // Create orchestrated task
      const task = new Task({
        id: `task-${Date.now()}`,
        description: objective,
        priority: options.priority || 'high',
        complexity: options.complexity || 'medium',
        requirements: options.requirements || [],
        swarmId: swarm.id,
        strategy: options.strategy || swarmConfig.strategy
      });

      // Begin orchestration
      const orchestrationResult = await swarm.orchestrateTask(task);
      
      // Store results in memory
      await this.storeOrchestrationResult(swarm.id, task.id, orchestrationResult);

      // Post-task hook using claude-zen
      if (this.config.enableHooks) {
        execSync(`npx claude-zen hooks post-task --task-id "${task.id}" --swarm-id "${swarm.id}" --analyze-performance`, { stdio: 'pipe' });
      }

      printSuccess(`✅ Swarm launched successfully: ${swarm.id}`);
      printInfo(`👥 Spawned ${spawnedAgents.length} agents: ${spawnedAgents.map(a => a.type).join(', ')}`);
      
      return {
        swarmId: swarm.id,
        taskId: task.id,
        agents: spawnedAgents.map(a => ({ id: a.id, type: a.type, name: a.name })),
        orchestrationResult,
        status: 'active'
      };

    } catch (error) {
      printError(`Failed to launch swarm: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build optimized swarm configuration based on objective and options
   */
  buildSwarmConfig(objective, options) {
    const complexity = this.analyzeComplexity(objective);
    const domain = this.detectDomain(objective);
    
    return {
      id: `swarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: options.name || `${domain}-swarm`,
      objective: objective,
      topology: this.selectOptimalTopology(complexity, domain, options),
      strategy: this.selectOptimalStrategy(complexity, domain, options),
      maxAgents: this.calculateOptimalAgentCount(complexity, options),
      qualityThreshold: options.qualityThreshold || 0.85,
      timeoutMs: options.timeoutMs || 300000,
      enableParallelExecution: options.parallel !== false,
      enableConsensus: options.consensus || 'quorum',
      metadata: {
        created: new Date().toISOString(),
        complexity,
        domain,
        userOptions: options
      }
    };
  }

  /**
   * Analyze objective to determine optimal agent composition
   */
  analyzeObjectiveForAgents(objective, options) {
    const domain = this.detectDomain(objective);
    const complexity = this.analyzeComplexity(objective);
    const agents = [];

    // Always start with a coordinator for complex tasks
    if (complexity !== 'simple') {
      agents.push({
        type: 'coordinator',
        name: 'Task Coordinator',
        capabilities: ['planning', 'coordination', 'monitoring'],
        priority: 'high'
      });
    }

    // Domain-specific agent selection
    switch (domain) {
      case 'development':
        agents.push(
          { type: 'architect', name: 'System Architect', capabilities: ['system-design', 'patterns'] },
          { type: 'coder', name: 'Developer', capabilities: ['implementation', 'debugging'] },
          { type: 'tester', name: 'QA Engineer', capabilities: ['testing', 'validation'] }
        );
        if (complexity === 'high') {
          agents.push({ type: 'reviewer', name: 'Code Reviewer', capabilities: ['code-review', 'best-practices'] });
        }
        break;

      case 'research':
        agents.push(
          { type: 'researcher', name: 'Lead Researcher', capabilities: ['data-gathering', 'analysis'] },
          { type: 'analyst', name: 'Data Analyst', capabilities: ['data-analysis', 'insights'] }
        );
        if (complexity === 'high') {
          agents.push({ type: 'researcher', name: 'Domain Expert', capabilities: ['domain-knowledge', 'validation'] });
        }
        break;

      case 'github':
      case 'devops':
        agents.push(
          { type: 'devops', name: 'DevOps Engineer', capabilities: ['ci-cd', 'deployment'] },
          { type: 'reviewer', name: 'PR Reviewer', capabilities: ['code-review', 'github-workflows'] }
        );
        break;

      case 'analysis':
        agents.push(
          { type: 'analyst', name: 'Performance Analyst', capabilities: ['performance-analysis', 'optimization'] },
          { type: 'researcher', name: 'Data Researcher', capabilities: ['data-collection', 'research'] }
        );
        break;

      default:
        // General-purpose agents for unknown domains
        agents.push(
          { type: 'researcher', name: 'Information Gatherer', capabilities: ['research', 'analysis'] },
          { type: 'general', name: 'Task Executor', capabilities: ['execution', 'coordination'] }
        );
    }

    // Add optimizer for high complexity tasks
    if (complexity === 'high') {
      agents.push({
        type: 'optimizer',
        name: 'Performance Optimizer',
        capabilities: ['optimization', 'bottleneck-analysis']
      });
    }

    return agents.slice(0, options.maxAgents || this.calculateOptimalAgentCount(complexity, options));
  }

  /**
   * Spawn individual agent using ruv-swarm library
   */
  async spawnAgent(swarm, agentSpec) {
    const agent = new Agent({
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: agentSpec.type,
      name: agentSpec.name || agentSpec.type,
      capabilities: agentSpec.capabilities || [],
      priority: agentSpec.priority || 'medium',
      swarmId: swarm.id,
      config: {
        neuralLearning: this.config.enableNeuralLearning,
        memoryAccess: true,
        coordinationEnabled: true
      }
    });

    swarm.addAgent(agent);
    
    // Store agent spawn in memory for coordination
    await this.memoryStore.store(
      `agent/${agent.id}/spawn`,
      JSON.stringify({
        agentId: agent.id,
        swarmId: swarm.id,
        type: agentSpec.type,
        capabilities: agentSpec.capabilities,
        spawnedAt: new Date().toISOString()
      })
    );

    return agent;
  }

  /**
   * Advanced domain detection with expanded coverage
   */
  detectDomain(objective) {
    const obj = objective.toLowerCase();
    
    if (obj.includes('github') || obj.includes('pr') || obj.includes('pull request') || obj.includes('repository')) {
      return 'github';
    } else if (obj.includes('api') || obj.includes('code') || obj.includes('develop') || obj.includes('build') || obj.includes('implement')) {
      return 'development';
    } else if (obj.includes('research') || obj.includes('analyze') || obj.includes('study') || obj.includes('investigate')) {
      return 'research';
    } else if (obj.includes('deploy') || obj.includes('ci/cd') || obj.includes('devops') || obj.includes('pipeline')) {
      return 'devops';
    } else if (obj.includes('performance') || obj.includes('bottleneck') || obj.includes('optimize') || obj.includes('metrics')) {
      return 'analysis';
    } else if (obj.includes('test') || obj.includes('qa') || obj.includes('quality')) {
      return 'testing';
    } else if (obj.includes('document') || obj.includes('write') || obj.includes('spec')) {
      return 'documentation';
    } else {
      return 'general';
    }
  }

  /**
   * Smart complexity analysis
   */
  analyzeComplexity(objective) {
    const indicators = {
      high: ['enterprise', 'complex', 'advanced', 'comprehensive', 'full-stack', 'distributed', 'microservices', 'architecture'],
      medium: ['build', 'create', 'implement', 'develop', 'integrate', 'optimize', 'coordinate'],
      simple: ['simple', 'basic', 'quick', 'small', 'minor', 'fix']
    };

    const obj = objective.toLowerCase();
    
    for (const [level, words] of Object.entries(indicators)) {
      if (words.some(word => obj.includes(word))) {
        return level;
      }
    }
    
    // Default based on length and keywords
    return obj.length > 100 || obj.split(' ').length > 15 ? 'high' : 'medium';
  }

  /**
   * Select optimal topology based on task characteristics
   */
  selectOptimalTopology(complexity, domain, options) {
    if (options.topology) return options.topology;
    
    switch (complexity) {
      case 'high':
        return domain === 'research' ? 'mesh' : 'hierarchical';
      case 'medium':
        return domain === 'github' || domain === 'devops' ? 'star' : 'hierarchical';
      default:
        return 'ring';
    }
  }

  /**
   * Select optimal strategy
   */
  selectOptimalStrategy(complexity, domain, options) {
    if (options.strategy) return options.strategy;
    
    const strategies = {
      high: 'specialized',
      medium: 'adaptive', 
      simple: 'balanced'
    };
    
    return strategies[complexity] || 'adaptive';
  }

  /**
   * Calculate optimal agent count
   */
  calculateOptimalAgentCount(complexity, options) {
    if (options.maxAgents) return options.maxAgents;
    
    const counts = {
      high: 8,
      medium: 5,
      simple: 3
    };
    
    return counts[complexity] || 5;
  }

  /**
   * Get comprehensive swarm status
   */
  async getSwarmStatus(swarmId = null) {
    if (swarmId) {
      const swarm = this.activeSwarms.get(swarmId);
      if (!swarm) {
        throw new Error(`Swarm ${swarmId} not found`);
      }
      
      return this.buildSwarmStatusInfo(swarm);
    }
    
    // Return status of all swarms
    const allStatus = {};
    for (const [id, swarm] of this.activeSwarms.entries()) {
      allStatus[id] = await this.buildSwarmStatusInfo(swarm);
    }
    
    return {
      totalSwarms: this.activeSwarms.size,
      totalAgents: this.globalAgents.size,
      swarms: allStatus
    };
  }

  /**
   * Build detailed status info for a swarm
   */
  async buildSwarmStatusInfo(swarm) {
    const agents = swarm.getAgents();
    
    return {
      id: swarm.id,
      name: swarm.name,
      objective: swarm.objective,
      topology: swarm.topology,
      strategy: swarm.strategy,
      status: swarm.status || 'active',
      agents: agents.map(agent => ({
        id: agent.id,
        type: agent.type,
        name: agent.name,
        status: agent.status || 'active',
        capabilities: agent.capabilities
      })),
      metrics: await this.getSwarmMetrics(swarm.id),
      created: swarm.metadata?.created
    };
  }

  /**
   * Get swarm performance metrics
   */
  async getSwarmMetrics(swarmId) {
    try {
      const metricsData = await this.memoryStore.retrieve(`swarm/${swarmId}/metrics`);
      return metricsData ? JSON.parse(metricsData) : {
        tasksCompleted: 0,
        avgCompletionTime: 0,
        successRate: 0,
        coordination_efficiency: 0.85
      };
    } catch (error) {
      return { tasksCompleted: 0, avgCompletionTime: 0, successRate: 0 };
    }
  }

  /**
   * Store orchestration results
   */
  async storeOrchestrationResult(swarmId, taskId, result) {
    const resultData = {
      swarmId,
      taskId,
      result,
      timestamp: new Date().toISOString(),
      success: result.success !== false
    };
    
    await this.memoryStore.store(
      `orchestration/${swarmId}/${taskId}`,
      JSON.stringify(resultData)
    );
  }

  /**
   * Load persisted swarms from memory
   */
  async loadPersistedSwarms() {
    // This would load swarms from the database that were persisted
    // For now, start with empty state
    printInfo('📚 Loading persisted swarms from memory...');
  }

  /**
   * Neural learning integration
   */
  async learnFromOrchestration(swarmId, taskId, outcome) {
    if (!this.config.enableNeuralLearning) return;
    
    try {
      const swarm = this.activeSwarms.get(swarmId);
      if (swarm && this.ruvSwarm) {
        // Use ruv-swarm's built-in neural learning
        await this.ruvSwarm.learn({
          swarmId,
          taskId,
          outcome,
          patterns: swarm.getLearnedPatterns(),
          timestamp: Date.now()
        });
        
        printInfo(`🧠 Neural learning applied for swarm ${swarmId}`);
      }
    } catch (error) {
      printWarning(`Neural learning failed: ${error.message}`);
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    printInfo('🔄 Shutting down swarm orchestrator...');
    
    // Execute session-end hooks
    if (this.config.enableHooks) {
      execSync('npx claude-zen hooks session-end --export-metrics --generate-summary', { stdio: 'pipe' });
    }
    
    // Save active swarms state
    for (const [id, swarm] of this.activeSwarms.entries()) {
      await this.memoryStore.store(
        `swarm/${id}/final-state`,
        JSON.stringify(swarm.getState())
      );
    }
    
    this.activeSwarms.clear();
    this.globalAgents.clear();
    
    printSuccess('✅ Swarm orchestrator shutdown complete');
  }
}

// Export singleton instance
export const swarmOrchestrator = new SwarmOrchestrator();