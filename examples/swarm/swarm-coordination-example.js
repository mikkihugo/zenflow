/**
 * Advanced Swarm Coordination Example
 * Demonstrates sophisticated swarm patterns and coordination strategies
 */

import { EventEmitter } from 'node:events';
import { ParallelSwarmOrchestrator } from '../src/coordination/parallel-swarm-orchestrator.js';

class SwarmCoordinationExample extends EventEmitter {
  constructor() {
    super();
    this.orchestrator = null;
    this.swarms = new Map();
    this.activeWorkflows = new Map();
  }

  async initialize() {
    console.warn('🚀 Initializing Advanced Swarm Coordination Example');

    this.orchestrator = new ParallelSwarmOrchestrator({
      parallelMode: true,
      maxWorkers: 8,
      loadBalancingStrategy: 'capability-based',
    });

    await this.orchestrator.initialize();

    // Set up event handlers
    this.setupEventHandlers();

    console.warn('✅ Swarm coordinator initialized');
    return this;
  }

  setupEventHandlers() {
    this.orchestrator.on('swarm-created', (data) => {
      console.warn(`🐝 Swarm created: ${data.swarmId} (${data.topology})`);
    });

    this.orchestrator.on('task-completed', (data) => {
      console.warn(`✅ Task completed: ${data.taskId} by ${data.agentId}`);
    });

    this.orchestrator.on('swarm-metrics', (data) => {
      console.warn(`📊 Swarm metrics: ${JSON.stringify(data)}`);
    });
  }

  // Example 1: Hierarchical Code Analysis Swarm
  async hierarchicalAnalysisExample() {
    console.warn('\n🏗️ === Hierarchical Code Analysis Swarm ===');

    const swarmConfig = {
      id: 'analysis-swarm-001',
      topology: 'hierarchical',
      strategy: 'specialized',
      maxAgents: 12,
      queens: 2,
    };

    // Create hierarchical swarm
    const swarm = await this.createSwarm(swarmConfig);

    // Spawn Queen coordinators
    await this.spawnQueen(swarm.id, {
      name: 'AnalysisQueen',
      capabilities: ['orchestration', 'analysis-coordination', 'reporting'],
    });

    await this.spawnQueen(swarm.id, {
      name: 'OptimizationQueen',
      capabilities: ['optimization', 'performance-analysis', 'recommendations'],
    });

    // Spawn specialized agents in hierarchy
    const agents = [
      {
        type: 'architect',
        name: 'ArchAnalyzer',
        capabilities: ['architecture-review', 'design-patterns'],
      },
      { type: 'coder', name: 'CodeAnalyzer', capabilities: ['code-quality', 'best-practices'] },
      { type: 'tester', name: 'TestAnalyzer', capabilities: ['test-coverage', 'test-quality'] },
      {
        type: 'reviewer',
        name: 'SecurityAnalyzer',
        capabilities: ['security-audit', 'vulnerability-scan'],
      },
      {
        type: 'optimizer',
        name: 'PerfAnalyzer',
        capabilities: ['performance-analysis', 'bottleneck-detection'],
      },
      {
        type: 'documenter',
        name: 'DocAnalyzer',
        capabilities: ['documentation-analysis', 'completeness-check'],
      },
    ];

    for (const agent of agents) {
      await this.spawnAgent(swarm.id, agent);
    }

    // Orchestrate complex analysis workflow
    const analysisTask = {
      id: 'repo-analysis-001',
      type: 'multi-stage-analysis',
      target: 'claude-code-zen repository',
      stages: [
        { name: 'architecture-analysis', assignee: 'ArchAnalyzer', parallel: false },
        { name: 'code-quality-analysis', assignee: 'CodeAnalyzer', parallel: true },
        { name: 'security-analysis', assignee: 'SecurityAnalyzer', parallel: true },
        { name: 'performance-analysis', assignee: 'PerfAnalyzer', parallel: true },
        { name: 'test-analysis', assignee: 'TestAnalyzer', parallel: true },
        { name: 'documentation-analysis', assignee: 'DocAnalyzer', parallel: true },
        { name: 'optimization-recommendations', assignee: 'OptimizationQueen', parallel: false },
      ],
    };

    const result = await this.orchestrateTask(swarm.id, analysisTask);
    console.warn('Analysis Result:', result);

    return { swarm, result };
  }

  // Example 2: Mesh Network Resilient Processing
  async meshResilienceExample() {
    console.warn('\n🕸️ === Mesh Network Resilient Processing ===');

    const swarmConfig = {
      id: 'resilient-swarm-002',
      topology: 'mesh',
      strategy: 'balanced',
      maxAgents: 9,
      faultTolerance: true,
    };

    const swarm = await this.createSwarm(swarmConfig);

    // Create mesh of redundant agents
    const meshAgents = [];
    for (let i = 1; i <= 9; i++) {
      meshAgents.push({
        type: 'processor',
        name: `MeshProcessor-${i}`,
        capabilities: ['data-processing', 'fault-tolerance', 'redundancy'],
        position: { x: (i - 1) % 3, y: Math.floor((i - 1) / 3) },
      });
    }

    for (const agent of meshAgents) {
      await this.spawnAgent(swarm.id, agent);
    }

    // Set up full connectivity
    await this.establishMeshConnections(swarm.id, meshAgents);

    // Demonstrate fault tolerance
    const resilientTask = {
      id: 'resilient-processing-001',
      type: 'distributed-processing',
      data: this.generateLargeDataset(1000),
      redundancyLevel: 3,
      faultTolerance: {
        maxFailures: 2,
        retryStrategy: 'exponential-backoff',
        failoverTime: 1000,
      },
    };

    // Simulate failures during processing
    setTimeout(() => this.simulateAgentFailure(swarm.id, 'MeshProcessor-5'), 2000);
    setTimeout(() => this.simulateAgentFailure(swarm.id, 'MeshProcessor-7'), 4000);

    const result = await this.orchestrateTask(swarm.id, resilientTask);
    console.warn('Resilient Processing Result:', result);

    return { swarm, result };
  }

  // Example 3: Pipeline Processing with Ring Topology
  async pipelineProcessingExample() {
    console.warn('\n🔄 === Pipeline Processing with Ring Topology ===');

    const swarmConfig = {
      id: 'pipeline-swarm-003',
      topology: 'ring',
      strategy: 'sequential',
      maxAgents: 8,
    };

    const swarm = await this.createSwarm(swarmConfig);

    // Create pipeline stages
    const pipelineStages = [
      { name: 'DataIngestion', capabilities: ['data-ingestion', 'validation'] },
      { name: 'DataCleaning', capabilities: ['data-cleaning', 'normalization'] },
      { name: 'FeatureExtraction', capabilities: ['feature-extraction', 'analysis'] },
      { name: 'DataTransformation', capabilities: ['transformation', 'enrichment'] },
      { name: 'QualityAssurance', capabilities: ['quality-check', 'validation'] },
      { name: 'DataAggregation', capabilities: ['aggregation', 'summarization'] },
      { name: 'ResultFormatting', capabilities: ['formatting', 'output-generation'] },
      { name: 'DataExport', capabilities: ['export', 'delivery'] },
    ];

    for (const stage of pipelineStages) {
      await this.spawnAgent(swarm.id, {
        type: 'processor',
        name: stage.name,
        capabilities: stage.capabilities,
      });
    }

    // Establish ring connections
    await this.establishRingConnections(swarm.id, pipelineStages);

    // Process data through pipeline
    const pipelineTask = {
      id: 'pipeline-processing-001',
      type: 'sequential-pipeline',
      inputData: this.generateSampleData(),
      pipeline: pipelineStages.map((stage) => stage.name),
      checkpoints: true, // Enable progress checkpoints
      rollbackOnFailure: true,
    };

    const result = await this.orchestrateTask(swarm.id, pipelineTask);
    console.warn('Pipeline Processing Result:', result);

    return { swarm, result };
  }

  // Example 4: Dynamic Load Balancing
  async dynamicLoadBalancingExample() {
    console.warn('\n⚖️ === Dynamic Load Balancing Example ===');

    const swarmConfig = {
      id: 'loadbalanced-swarm-004',
      topology: 'star',
      strategy: 'adaptive',
      maxAgents: 10,
      loadBalancing: {
        enabled: true,
        strategy: 'least-loaded',
        rebalanceInterval: 5000,
        threshold: 0.8,
      },
    };

    const swarm = await this.createSwarm(swarmConfig);

    // Central coordinator
    await this.spawnAgent(swarm.id, {
      type: 'coordinator',
      name: 'LoadBalancer',
      capabilities: ['load-balancing', 'task-distribution', 'monitoring'],
    });

    // Variable-capacity workers
    const workers = [];
    for (let i = 1; i <= 8; i++) {
      workers.push({
        type: 'worker',
        name: `Worker-${i}`,
        capabilities: ['task-processing', 'computation'],
        capacity: Math.floor(Math.random() * 10) + 5, // Random capacity 5-15
        performance: Math.random() * 0.5 + 0.75, // Random performance 0.75-1.25
      });
    }

    for (const worker of workers) {
      await this.spawnAgent(swarm.id, worker);
    }

    // Generate varying workload
    const tasks = this.generateVariableWorkload(100);

    // Monitor load balancing
    const monitor = setInterval(async () => {
      const metrics = await this.getSwarmMetrics(swarm.id);
      console.warn('Load Distribution:', metrics.loadDistribution);
    }, 2000);

    const result = await this.distributeWorkload(swarm.id, tasks);
    clearInterval(monitor);

    console.warn('Load Balancing Result:', result);
    return { swarm, result };
  }

  // Example 5: Multi-Swarm Coordination
  async multiSwarmCoordinationExample() {
    console.warn('\n🌐 === Multi-Swarm Coordination Example ===');

    // Create specialized swarms
    const analysisSwarm = await this.createSwarm({
      id: 'analysis-swarm',
      topology: 'hierarchical',
      specialization: 'analysis',
    });

    const processingSwarm = await this.createSwarm({
      id: 'processing-swarm',
      topology: 'mesh',
      specialization: 'processing',
    });

    const reportingSwarm = await this.createSwarm({
      id: 'reporting-swarm',
      topology: 'star',
      specialization: 'reporting',
    });

    // Set up inter-swarm communication
    await this.establishInterSwarmCommunication([
      analysisSwarm.id,
      processingSwarm.id,
      reportingSwarm.id,
    ]);

    // Coordinate complex multi-swarm workflow
    const multiSwarmTask = {
      id: 'multi-swarm-workflow-001',
      type: 'cross-swarm-collaboration',
      workflow: [
        { swarm: analysisSwarm.id, task: 'initial-analysis', output: 'analysis-results' },
        {
          swarm: processingSwarm.id,
          task: 'data-processing',
          input: 'analysis-results',
          output: 'processed-data',
        },
        {
          swarm: reportingSwarm.id,
          task: 'generate-report',
          input: 'processed-data',
          output: 'final-report',
        },
      ],
      synchronization: 'barrier', // Wait for each stage to complete
      errorHandling: 'cascade-rollback',
    };

    const result = await this.orchestrateMultiSwarmTask(multiSwarmTask);
    console.warn('Multi-Swarm Result:', result);

    return { swarms: [analysisSwarm, processingSwarm, reportingSwarm], result };
  }

  // Helper methods for swarm operations
  async createSwarm(config) {
    console.warn(`🐝 Creating swarm: ${config.id} (${config.topology})`);

    const swarm = {
      id: config.id,
      topology: config.topology,
      strategy: config.strategy,
      agents: new Map(),
      queens: new Map(),
      createdAt: new Date(),
      status: 'active',
    };

    this.swarms.set(config.id, swarm);
    this.emit('swarm-created', { swarmId: config.id, topology: config.topology });

    return swarm;
  }

  async spawnQueen(swarmId, queenConfig) {
    console.warn(`👑 Spawning Queen: ${queenConfig.name} in swarm ${swarmId}`);

    const swarm = this.swarms.get(swarmId);
    if (!swarm) throw new Error(`Swarm ${swarmId} not found`);

    const queen = {
      id: `queen-${queenConfig.name.toLowerCase()}`,
      name: queenConfig.name,
      type: 'queen',
      capabilities: queenConfig.capabilities,
      swarmId,
      status: 'active',
      spawnedAt: new Date(),
    };

    swarm.queens.set(queen.id, queen);
    this.emit('queen-spawned', { swarmId, queenId: queen.id });

    return queen;
  }

  async spawnAgent(swarmId, agentConfig) {
    console.warn(`🤖 Spawning agent: ${agentConfig.name} in swarm ${swarmId}`);

    const swarm = this.swarms.get(swarmId);
    if (!swarm) throw new Error(`Swarm ${swarmId} not found`);

    const agent = {
      id: `agent-${agentConfig.name.toLowerCase()}`,
      name: agentConfig.name,
      type: agentConfig.type,
      capabilities: agentConfig.capabilities,
      swarmId,
      status: 'active',
      spawnedAt: new Date(),
      ...agentConfig,
    };

    swarm.agents.set(agent.id, agent);
    this.emit('agent-spawned', { swarmId, agentId: agent.id });

    return agent;
  }

  async orchestrateTask(swarmId, task) {
    console.warn(`📋 Orchestrating task: ${task.id} in swarm ${swarmId}`);

    const startTime = Date.now();

    // Simulate task execution
    return new Promise((resolve) => {
      setTimeout(
        () => {
          const result = {
            taskId: task.id,
            swarmId,
            status: 'completed',
            executionTime: Date.now() - startTime,
            results: `Task ${task.id} completed successfully`,
            metrics: {
              agentsUsed: Math.floor(Math.random() * 5) + 3,
              efficiency: Math.random() * 0.3 + 0.7,
            },
          };

          this.emit('task-completed', result);
          resolve(result);
        },
        Math.random() * 3000 + 1000
      ); // 1-4 seconds
    });
  }

  // Utility methods
  generateLargeDataset(size) {
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      data: `data-${i}`,
      value: Math.random() * 100,
    }));
  }

  generateSampleData() {
    return {
      records: 1000,
      format: 'JSON',
      source: 'API',
      timestamp: new Date().toISOString(),
    };
  }

  generateVariableWorkload(taskCount) {
    return Array.from({ length: taskCount }, (_, i) => ({
      id: `task-${i}`,
      complexity: Math.floor(Math.random() * 5) + 1,
      priority: Math.floor(Math.random() * 3) + 1,
      estimatedTime: Math.random() * 5000 + 1000,
    }));
  }

  async establishMeshConnections(swarmId, _agents) {
    console.warn(`🕸️ Establishing mesh connections for swarm ${swarmId}`);
    // Implementation would set up full connectivity between all agents
  }

  async establishRingConnections(swarmId, _stages) {
    console.warn(`🔄 Establishing ring connections for swarm ${swarmId}`);
    // Implementation would set up circular connections
  }

  async establishInterSwarmCommunication(swarmIds) {
    console.warn(`🌐 Establishing inter-swarm communication between ${swarmIds.join(', ')}`);
    // Implementation would set up communication channels between swarms
  }

  async simulateAgentFailure(swarmId, agentName) {
    console.warn(`⚠️ Simulating failure of agent ${agentName} in swarm ${swarmId}`);
    this.emit('agent-failure', { swarmId, agentName });
  }

  async getSwarmMetrics(swarmId) {
    const swarm = this.swarms.get(swarmId);
    return {
      agentCount: swarm.agents.size,
      queenCount: swarm.queens.size,
      loadDistribution: this.calculateLoadDistribution(swarm),
      performance: Math.random() * 0.3 + 0.7,
    };
  }

  calculateLoadDistribution(swarm) {
    // Simulate load distribution calculation
    const distribution = {};
    for (const [agentId] of swarm.agents) {
      distribution[agentId] = Math.random() * 100;
    }
    return distribution;
  }

  async distributeWorkload(swarmId, tasks) {
    console.warn(`⚖️ Distributing ${tasks.length} tasks across swarm ${swarmId}`);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalTasks: tasks.length,
          completedTasks: tasks.length,
          averageTime: Math.random() * 2000 + 1000,
          loadBalance: 'optimal',
        });
      }, 5000);
    });
  }

  async orchestrateMultiSwarmTask(task) {
    console.warn(`🌐 Orchestrating multi-swarm task: ${task.id}`);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          taskId: task.id,
          status: 'completed',
          swarmsUsed: task.workflow.length,
          totalTime: Math.random() * 5000 + 3000,
          result: 'Multi-swarm collaboration successful',
        });
      }, 8000);
    });
  }

  // Run all examples
  async runAllExamples() {
    console.warn('\n🎯 Running all swarm coordination examples...');

    try {
      await this.hierarchicalAnalysisExample();
      await this.meshResilienceExample();
      await this.pipelineProcessingExample();
      await this.dynamicLoadBalancingExample();
      await this.multiSwarmCoordinationExample();

      console.warn('\n✅ All swarm coordination examples completed successfully');
    } catch (error) {
      console.error('❌ Swarm coordination example failed:', error);
    }
  }
}

// CLI runner
async function main() {
  const example = process.argv[2];

  const coordinator = new SwarmCoordinationExample();
  await coordinator.initialize();

  switch (example) {
    case 'hierarchical':
      await coordinator.hierarchicalAnalysisExample();
      break;
    case 'mesh':
      await coordinator.meshResilienceExample();
      break;
    case 'pipeline':
      await coordinator.pipelineProcessingExample();
      break;
    case 'loadbalancing':
      await coordinator.dynamicLoadBalancingExample();
      break;
    case 'multiswarm':
      await coordinator.multiSwarmCoordinationExample();
      break;
    case 'all':
      await coordinator.runAllExamples();
      break;
    default:
      console.warn(
        'Usage: node swarm-coordination-example.js [hierarchical|mesh|pipeline|loadbalancing|multiswarm|all]'
      );
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SwarmCoordinationExample };
