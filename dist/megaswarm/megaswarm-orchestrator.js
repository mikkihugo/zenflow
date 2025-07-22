/**
 * MEGASWARM ORCHESTRATOR
 * Context-preserving Claude instance spawning and coordination
 * Auto-scaling swarm intelligence with real-time synchronization
 */

import { Task } from '../../lib/tools.js'; // Claude Code Task tool for spawning
import { UNIFIED_COMMAND_SCHEMA } from './unified-command-schema.js';
import { SqliteMemoryStore } from '../memory/sqlite-store.js';
import { SwarmOrchestrator } from '../cli/command-handlers/swarm-orchestrator.js';
import { printSuccess, printError, printWarning, printInfo } from '../cli/utils.js';
import { EventEmitter } from 'events';

/**
 * Megaswarm: Advanced multi-Claude orchestration with context preservation
 */
export class MegaswarmOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      maxInstances: options.maxInstances || 50,
      defaultTimeout: options.defaultTimeout || 300000, // 5 minutes
      contextMode: options.contextMode || 'hybrid',
      autoScale: options.autoScale !== false,
      persistence: options.persistence !== false,
      monitoring: options.monitoring !== false,
      ...options
    };

    this.instances = new Map(); // Active Claude instances
    this.swarms = new Map(); // Active swarms
    this.contextStore = null; // Shared context storage
    this.coordinationChannel = new EventEmitter(); // Inter-instance communication
    this.isInitialized = false;
    this.metrics = {
      totalSpawned: 0,
      activeInstances: 0,
      totalTasks: 0,
      successRate: 0
    };
  }

  /**
   * Initialize the megaswarm system
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      printInfo('🌊 Initializing Megaswarm Orchestrator...');

      // Initialize shared context store
      this.contextStore = new SqliteMemoryStore({
        dbName: 'megaswarm-context.db',
        directory: '.swarm',
        enableWAL: true
      });
      await this.contextStore.initialize();

      // Setup coordination channels
      this.setupCoordinationChannels();

      // Initialize monitoring if enabled
      if (this.options.monitoring) {
        this.startMonitoring();
      }

      this.isInitialized = true;
      printSuccess('✅ Megaswarm Orchestrator initialized successfully');
      
    } catch (error) {
      printError(`Failed to initialize Megaswarm: ${error.message}`);
      throw error;
    }
  }

  /**
   * Launch a megaswarm with specified parameters
   */
  async launchMegaswarm(objective, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const megaswarmId = `megaswarm-${Date.now()}`;
    const config = {
      id: megaswarmId,
      objective,
      instances: options.instances || 5,
      topology: options.topology || 'hierarchical',
      contextMode: options.contextMode || 'hybrid',
      autoScale: options.autoScale !== false,
      persistence: options.persistence !== false,
      ...options
    };

    printInfo(`🚀 Launching Megaswarm: ${megaswarmId}`);
    printInfo(`🎯 Objective: "${objective}"`);
    printInfo(`👥 Instances: ${config.instances}`);
    printInfo(`🏗️ Topology: ${config.topology}`);

    try {
      // Create shared context for this megaswarm
      await this.createSharedContext(megaswarmId, objective, config);

      // Spawn Claude instances in parallel
      const spawnPromises = [];
      for (let i = 0; i < config.instances; i++) {
        spawnPromises.push(this.spawnClaudeInstance(megaswarmId, {
          role: this.determineInstanceRole(i, config.instances),
          instanceIndex: i,
          totalInstances: config.instances
        }));
      }

      const spawnedInstances = await Promise.allSettled(spawnPromises);
      const successfulInstances = spawnedInstances
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulInstances.length === 0) {
        throw new Error('Failed to spawn any Claude instances');
      }

      // Create coordination structure
      const swarm = await this.createCoordinatedSwarm(megaswarmId, successfulInstances, config);
      this.swarms.set(megaswarmId, swarm);

      // Start coordination
      await this.initiateCoordination(megaswarmId, objective);

      printSuccess(`✅ Megaswarm launched: ${successfulInstances.length}/${config.instances} instances active`);
      
      return {
        megaswarmId,
        activeInstances: successfulInstances.length,
        config,
        swarm: swarm.getStatus()
      };

    } catch (error) {
      printError(`Failed to launch Megaswarm: ${error.message}`);
      await this.cleanup(megaswarmId);
      throw error;
    }
  }

  /**
   * Spawn a new Claude instance using the Task tool
   */
  async spawnClaudeInstance(megaswarmId, config = {}) {
    const instanceId = `claude-${megaswarmId}-${config.instanceIndex || Date.now()}`;
    
    try {
      printInfo(`🔄 Spawning Claude instance: ${instanceId}`);

      // Prepare context-preserving prompt for the new instance
      const contextPrompt = await this.prepareContextPrompt(megaswarmId, config);

      // Use Task tool to spawn new Claude instance
      const taskConfig = {
        description: `Megaswarm Claude Instance ${config.instanceIndex + 1}`,
        prompt: contextPrompt
      };

      // Spawn the Claude instance
      const spawnedInstance = new Task(taskConfig.description, taskConfig.prompt);
      
      // Register the instance
      const instanceData = {
        id: instanceId,
        megaswarmId,
        role: config.role || 'general',
        spawnedAt: new Date().toISOString(),
        status: 'active',
        task: spawnedInstance,
        context: {
          shared: true,
          lastSync: new Date().toISOString(),
          accessLevel: 'full'
        }
      };

      this.instances.set(instanceId, instanceData);
      this.metrics.totalSpawned++;
      this.metrics.activeInstances++;

      // Share context with the new instance
      await this.shareContextWithInstance(instanceId, megaswarmId);

      printSuccess(`✅ Claude instance spawned: ${instanceId}`);
      return instanceData;

    } catch (error) {
      printError(`Failed to spawn Claude instance ${instanceId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create shared context for megaswarm coordination
   */
  async createSharedContext(megaswarmId, objective, config) {
    const contextData = {
      megaswarmId,
      objective,
      config,
      createdAt: new Date().toISOString(),
      sharedMemory: new Map(),
      coordination: {
        topology: config.topology,
        roles: {},
        taskDistribution: 'adaptive',
        consensusThreshold: 0.66
      },
      realTimeUpdates: []
    };

    // Store in persistent context
    await this.contextStore.store(
      `megaswarm/${megaswarmId}/context`,
      JSON.stringify(contextData)
    );

    // Store individual context entries
    await this.contextStore.store(
      `megaswarm/${megaswarmId}/objective`,
      objective
    );

    await this.contextStore.store(
      `megaswarm/${megaswarmId}/config`,
      JSON.stringify(config)
    );

    printInfo(`💾 Shared context created for ${megaswarmId}`);
    return contextData;
  }

  /**
   * Prepare context-preserving prompt for Claude instance
   */
  async prepareContextPrompt(megaswarmId, config) {
    // Retrieve shared context
    const contextJson = await this.contextStore.retrieve(`megaswarm/${megaswarmId}/context`);
    const context = JSON.parse(contextJson || '{}');
    
    const objective = context.objective || 'Unknown objective';
    const role = config.role || 'general';
    const instanceIndex = config.instanceIndex || 0;

    return `
# 🌊 MEGASWARM CLAUDE INSTANCE #${instanceIndex + 1}

You are Claude Instance #${instanceIndex + 1} in a coordinated megaswarm with context preservation.

## 🎯 MEGASWARM OBJECTIVE
${objective}

## 🤖 YOUR ROLE & IDENTITY
- **Role**: ${role}
- **Instance ID**: claude-${megaswarmId}-${instanceIndex}
- **Megaswarm ID**: ${megaswarmId}
- **Topology**: ${context.config?.topology || 'hierarchical'}

## 🧠 CONTEXT PRESERVATION PROTOCOL

**CRITICAL**: You are part of a larger coordinated effort. Your actions contribute to the collective intelligence.

### 📋 COORDINATION RULES:
1. **Memory Sharing**: All decisions and findings must be shared via context updates
2. **Role Focus**: Specialize in your role while maintaining awareness of the bigger picture  
3. **Real-time Updates**: Communicate progress and insights continuously
4. **Consensus Building**: Collaborate with other instances for optimal solutions
5. **Context Continuity**: Build upon previous instances' work and maintain consistency

### 🔧 AVAILABLE COORDINATION TOOLS:
- Use context synchronization for sharing insights
- Coordinate task distribution with other instances
- Maintain real-time progress updates
- Participate in consensus building for major decisions

### 🎨 YOUR SPECIALIZED ROLE: ${role.toUpperCase()}
${this.getRoleInstructions(role)}

## 🚀 EXECUTION CONTEXT
- **Total Instances**: ${config.totalInstances || 1}
- **Your Index**: ${instanceIndex}
- **Context Mode**: ${context.config?.contextMode || 'hybrid'}
- **Coordination**: Real-time with ${context.config?.topology || 'hierarchical'} topology

Begin your specialized contribution to the megaswarm objective. Remember: you are part of a coordinated intelligence system designed for maximum effectiveness through context preservation and real-time collaboration.
`;
  }

  /**
   * Get role-specific instructions
   */
  getRoleInstructions(role) {
    const instructions = {
      coordinator: `
🎯 **COORDINATOR ROLE**:
- Orchestrate overall task distribution
- Monitor progress of all instances
- Make high-level strategic decisions
- Ensure coordination alignment
- Handle inter-instance communication`,

      researcher: `
🔬 **RESEARCHER ROLE**:
- Gather comprehensive information
- Analyze data and extract insights
- Provide evidence-based recommendations
- Explore multiple information sources
- Share findings with the swarm`,

      coder: `
💻 **CODER ROLE**:
- Implement technical solutions
- Write and optimize code
- Handle development tasks
- Debug and troubleshoot issues
- Share code insights and patterns`,

      analyst: `
📊 **ANALYST ROLE**:
- Analyze data and patterns
- Generate insights and reports
- Identify optimization opportunities
- Monitor performance metrics
- Provide analytical recommendations`,

      architect: `
🏗️ **ARCHITECT ROLE**:
- Design system architecture
- Plan technical strategies
- Ensure scalability and maintainability
- Define integration patterns
- Guide technical decision-making`,

      tester: `
🧪 **TESTER ROLE**:
- Validate solutions and implementations
- Design and execute test scenarios
- Ensure quality and reliability
- Report issues and improvements
- Verify swarm coordination effectiveness`,

      optimizer: `
⚡ **OPTIMIZER ROLE**:
- Identify performance bottlenecks
- Optimize processes and workflows
- Improve efficiency and speed
- Monitor resource utilization
- Suggest enhancement opportunities`
    };

    return instructions[role] || `
🎯 **GENERAL ROLE**:
- Contribute to the overall objective
- Collaborate with other instances
- Share insights and progress
- Adapt to task requirements
- Maintain context continuity`;
  }

  /**
   * Share context with a specific instance
   */
  async shareContextWithInstance(instanceId, megaswarmId) {
    try {
      // Get shared context
      const sharedContext = await this.contextStore.retrieve(`megaswarm/${megaswarmId}/context`);
      const recentUpdates = await this.contextStore.search(`megaswarm/${megaswarmId}/updates`);

      // Update instance context access
      const instance = this.instances.get(instanceId);
      if (instance) {
        instance.context.lastSync = new Date().toISOString();
        instance.context.sharedData = JSON.parse(sharedContext || '{}');
        
        printInfo(`📤 Context shared with instance: ${instanceId}`);
      }

    } catch (error) {
      printWarning(`Failed to share context with ${instanceId}: ${error.message}`);
    }
  }

  /**
   * Create coordinated swarm from spawned instances
   */
  async createCoordinatedSwarm(megaswarmId, instances, config) {
    const swarmOrchestrator = new SwarmOrchestrator({
      maxConcurrentSwarms: 1,
      defaultTopology: config.topology,
      defaultStrategy: 'adaptive',
      enableNeuralLearning: true,
      enableHooks: false, // We handle coordination ourselves
      telemetryEnabled: true
    });

    await swarmOrchestrator.initialize();

    // Create coordinated structure with spawned instances
    const swarmConfig = {
      id: megaswarmId,
      name: `Megaswarm-${megaswarmId}`,
      objective: config.objective,
      topology: config.topology,
      instances: instances.map(inst => ({
        id: inst.id,
        role: inst.role,
        claudeInstance: inst.task,
        capabilities: this.getRoleCapabilities(inst.role)
      }))
    };

    return swarmOrchestrator;
  }

  /**
   * Get capabilities for a specific role
   */
  getRoleCapabilities(role) {
    const capabilities = {
      coordinator: ['planning', 'coordination', 'monitoring', 'decision-making'],
      researcher: ['information-gathering', 'analysis', 'documentation', 'web-search'],
      coder: ['implementation', 'debugging', 'optimization', 'testing'],
      analyst: ['data-analysis', 'pattern-recognition', 'reporting', 'insights'],
      architect: ['system-design', 'patterns', 'scalability', 'integration'],
      tester: ['testing', 'validation', 'quality-assurance', 'debugging'],
      optimizer: ['performance-optimization', 'bottleneck-analysis', 'efficiency']
    };

    return capabilities[role] || ['general-purpose', 'coordination', 'analysis'];
  }

  /**
   * Determine role for instance based on position and requirements
   */
  determineInstanceRole(index, totalInstances) {
    if (totalInstances === 1) return 'coordinator';
    if (index === 0) return 'coordinator';
    
    const roles = ['researcher', 'coder', 'analyst', 'architect', 'tester', 'optimizer'];
    return roles[index % roles.length];
  }

  /**
   * Initiate coordination between instances
   */
  async initiateCoordination(megaswarmId, objective) {
    printInfo(`🤝 Initiating coordination for ${megaswarmId}`);
    
    // Send coordination message to all instances
    const instances = Array.from(this.instances.values())
      .filter(inst => inst.megaswarmId === megaswarmId);

    for (const instance of instances) {
      try {
        await this.sendCoordinationMessage(instance.id, {
          type: 'coordination_start',
          objective,
          peers: instances.map(i => ({ id: i.id, role: i.role })),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        printWarning(`Failed to send coordination message to ${instance.id}`);
      }
    }

    printSuccess(`✅ Coordination initiated for ${instances.length} instances`);
  }

  /**
   * Send coordination message to an instance
   */
  async sendCoordinationMessage(instanceId, message) {
    // Store message in shared context for instance to access
    await this.contextStore.store(
      `instance/${instanceId}/messages/${Date.now()}`,
      JSON.stringify(message)
    );

    // Emit coordination event
    this.coordinationChannel.emit('message', { instanceId, message });
  }

  /**
   * Setup coordination channels for inter-instance communication
   */
  setupCoordinationChannels() {
    this.coordinationChannel.on('message', async (data) => {
      // Handle coordination messages between instances
      printInfo(`📨 Coordination message: ${data.instanceId} -> ${data.message.type}`);
    });

    this.coordinationChannel.on('context_update', async (data) => {
      // Handle context updates from instances
      await this.handleContextUpdate(data);
    });
  }

  /**
   * Handle context updates from instances
   */
  async handleContextUpdate(data) {
    const { instanceId, update } = data;
    
    try {
      // Store the context update
      await this.contextStore.store(
        `updates/${instanceId}/${Date.now()}`,
        JSON.stringify(update)
      );

      // Broadcast to other instances if needed
      if (update.broadcast) {
        const megaswarmId = this.instances.get(instanceId)?.megaswarmId;
        if (megaswarmId) {
          await this.broadcastContextUpdate(megaswarmId, instanceId, update);
        }
      }

    } catch (error) {
      printError(`Failed to handle context update from ${instanceId}: ${error.message}`);
    }
  }

  /**
   * Broadcast context update to other instances
   */
  async broadcastContextUpdate(megaswarmId, sourceInstanceId, update) {
    const instances = Array.from(this.instances.values())
      .filter(inst => inst.megaswarmId === megaswarmId && inst.id !== sourceInstanceId);

    for (const instance of instances) {
      try {
        await this.sendCoordinationMessage(instance.id, {
          type: 'context_update',
          source: sourceInstanceId,
          update,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        printWarning(`Failed to broadcast update to ${instance.id}`);
      }
    }
  }

  /**
   * Start monitoring system
   */
  startMonitoring() {
    setInterval(() => {
      this.updateMetrics();
      this.emit('metrics', this.metrics);
    }, 5000); // Update every 5 seconds

    printInfo('📊 Monitoring started');
  }

  /**
   * Update system metrics
   */
  updateMetrics() {
    this.metrics.activeInstances = this.instances.size;
    // Calculate success rate, etc.
  }

  /**
   * Get megaswarm status
   */
  getStatus(megaswarmId = null) {
    if (megaswarmId) {
      const swarm = this.swarms.get(megaswarmId);
      const instances = Array.from(this.instances.values())
        .filter(inst => inst.megaswarmId === megaswarmId);

      return {
        id: megaswarmId,
        status: swarm ? 'active' : 'unknown',
        instances: instances.length,
        instanceDetails: instances.map(inst => ({
          id: inst.id,
          role: inst.role,
          status: inst.status,
          spawnedAt: inst.spawnedAt
        }))
      };
    }

    return {
      totalMegaswarms: this.swarms.size,
      totalInstances: this.instances.size,
      metrics: this.metrics,
      activeMegaswarms: Array.from(this.swarms.keys())
    };
  }

  /**
   * Cleanup megaswarm resources
   */
  async cleanup(megaswarmId) {
    try {
      // Clean up instances
      const instances = Array.from(this.instances.values())
        .filter(inst => inst.megaswarmId === megaswarmId);

      for (const instance of instances) {
        this.instances.delete(instance.id);
        this.metrics.activeInstances--;
      }

      // Clean up swarm
      this.swarms.delete(megaswarmId);

      printInfo(`🧹 Cleaned up megaswarm: ${megaswarmId}`);

    } catch (error) {
      printError(`Failed to cleanup ${megaswarmId}: ${error.message}`);
    }
  }
}

// Export singleton instance
export const megaswarmOrchestrator = new MegaswarmOrchestrator();
export default MegaswarmOrchestrator;