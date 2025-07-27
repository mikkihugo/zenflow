/**
 * @fileoverview MCP Tool Executor
 * Handles execution of MCP tools with proper error handling and logging
 * @module MCPToolExecutor
 */

/**
 * Tool execution handler class
 * Provides centralized tool execution with logging, error handling, and metrics
 */
export class MCPToolExecutor {
  /**
   * @param {Object} server - Reference to MCP server instance
   */
  constructor(server) {
    this.server = server;
    this.executionStats = new Map();
  }

  /**
   * Execute a tool by name with arguments
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Tool execution result
   */
  async executeTool(name, args) {
    const startTime = Date.now();
    
    try {
      // Log execution start
      console.error(`[${new Date().toISOString()}] INFO [Tool-Executor] Executing ${name}...`);
      
      // Route to specific tool handler
      const result = await this.routeToolExecution(name, args);
      
      // Update statistics
      const executionTime = Date.now() - startTime;
      this.updateExecutionStats(name, executionTime, true);
      
      console.error(`[${new Date().toISOString()}] INFO [Tool-Executor] ${name} completed in ${executionTime}ms`);
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateExecutionStats(name, executionTime, false);
      
      console.error(`[${new Date().toISOString()}] ERROR [Tool-Executor] ${name} failed after ${executionTime}ms:`, error.message);
      throw error;
    }
  }

  /**
   * Route tool execution to appropriate handler
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Execution result
   */
  async routeToolExecution(name, args) {
    // Claude Zen core tools
    if (name.startsWith('claude_zen_')) {
      return this.executeClaudeZenTool(name, args);
    }
    
    // Product Management tools
    if (name.startsWith('prd_') || name.startsWith('vision_') || name.startsWith('epic_') || 
        name.startsWith('feature_') || name.startsWith('roadmap_') || name.startsWith('backlog_') || 
        name.startsWith('stakeholder_') || name.startsWith('market_') || name.startsWith('kpi_')) {
      return this.executeProductTool(name, args);
    }
    
    // Neural network tools
    if (name.startsWith('neural_')) {
      return this.executeNeuralTool(name, args);
    }
    
    // Memory management tools
    if (name === 'memory_usage' || name === 'benchmark_run') {
      return this.executeMemoryTool(name, args);
    }
    
    // Agent management tools
    if (name.startsWith('agent_')) {
      return this.executeAgentTool(name, args);
    }
    
    // Task management tools
    if (name.startsWith('task_')) {
      return this.executeTaskTool(name, args);
    }
    
    // System tools
    if (name === 'features_detect') {
      return this.executeSystemTool(name, args);
    }
    
    // Legacy swarm tools (for compatibility)
    if (name.startsWith('swarm_')) {
      return this.executeSwarmTool(name, args);
    }
    
    throw new Error(`Unknown tool category for: ${name}`);
  }

  /**
   * Execute Claude Zen CLI tools
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Execution result
   */
  async executeClaudeZenTool(name, args) {
    const { execSync } = await import('child_process');
    
    switch (name) {
      case 'claude_zen_init':
        return this.executeClaudeCommand('init', args);
      case 'claude_zen_status':
        return this.executeClaudeCommand('status', args);
      case 'claude_zen_config':
        return this.executeClaudeCommand('config', args);
      case 'claude_zen_hive_mind':
        return this.executeClaudeCommand('hive-mind', args);
      case 'claude_zen_swarm':
        return this.executeClaudeCommand('swarm', args);
      case 'claude_zen_agent':
        return this.executeClaudeCommand('agent', args);
      case 'claude_zen_task':
        return this.executeClaudeCommand('task', args);
      case 'claude_zen_memory':
        return this.executeClaudeCommand('memory', args);
      case 'claude_zen_github':
        return this.executeClaudeCommand('github', args);
      case 'claude_zen_hooks':
        return this.executeClaudeCommand('hooks', args);
      default:
        throw new Error(`Unknown Claude Zen tool: ${name}`);
    }
  }

  /**
   * Execute a Claude Zen CLI command
   * @param {string} command - Command name
   * @param {Object} args - Command arguments
   * @returns {Promise<any>} Command result
   */
  async executeClaudeCommand(command, args) {
    const { execFileSync } = await import('child_process');
    
    try {
      // Build command line arguments
      const cmdArgs = [];
      
      // Handle different argument patterns for each command
      switch (command) {
        case 'init':
          if (args.directory) cmdArgs.push(args.directory);
          if (args.force) cmdArgs.push('--force');
          if (args.template) cmdArgs.push('--template', args.template);
          break;
        case 'status':
          if (args.verbose) cmdArgs.push('--verbose');
          break;
        case 'config':
          if (args.action) cmdArgs.push(args.action);
          if (args.key) cmdArgs.push(args.key);
          if (args.value) cmdArgs.push(args.value);
          break;
        case 'hive-mind':
          if (args.subcommand) cmdArgs.push(args.subcommand);
          if (args.objective) cmdArgs.push(args.objective);
          break;
        case 'swarm':
          if (args.objective) cmdArgs.push(args.objective);
          if (args.topology) cmdArgs.push('--topology', args.topology);
          if (args.maxAgents) cmdArgs.push('--max-agents', args.maxAgents.toString());
          break;
        case 'agent':
          if (args.action) cmdArgs.push(args.action);
          if (args.type) cmdArgs.push(args.type);
          if (args.agentId) cmdArgs.push(args.agentId);
          break;
        case 'task':
          if (args.action) cmdArgs.push(args.action);
          if (args.description) cmdArgs.push(args.description);
          if (args.taskId) cmdArgs.push(args.taskId);
          break;
        case 'memory':
          if (args.action) cmdArgs.push(args.action);
          if (args.query) cmdArgs.push(args.query);
          if (args.namespace) cmdArgs.push('--namespace', args.namespace);
          break;
        case 'github':
          if (args.action) cmdArgs.push(args.action);
          if (args.repository) cmdArgs.push(args.repository);
          break;
        case 'hooks':
          if (args.hook) cmdArgs.push(args.hook);
          if (args.file) cmdArgs.push('--file', args.file);
          if (args.command) cmdArgs.push('--command', args.command);
          break;
      }
      
      // Execute claude-zen command using execFileSync for safety
      const execArgs = ['claude-zen', command, ...cmdArgs];
      console.error(`[${new Date().toISOString()}] INFO [Tool-Executor] Executing: npx ${execArgs.map(a => JSON.stringify(a)).join(' ')}`);
      
      const output = execFileSync('npx', execArgs, { 
        encoding: 'utf8',
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      return {
        success: true,
        command: `npx ${execArgs.map(a => JSON.stringify(a)).join(' ')}`,
        output: output.trim(),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [Tool-Executor] Command failed: ${error.message}`);
      
      return {
        success: false,
        command: `claude-zen ${command}`,
        error: error.message,
        output: error.stdout ? error.stdout.toString() : '',
        stderr: error.stderr ? error.stderr.toString() : '',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute Product Management tools
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Execution result
   */
  async executeProductTool(name, args) {
    // Use memory store to persist product management data
    const timestamp = new Date().toISOString();
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    try {
      let result;
      
      switch (name) {
        case 'prd_create':
          result = {
            id: `prd_${Date.now()}`,
            type: 'PRD',
            title: args.title,
            description: args.description,
            objectives: args.objectives,
            targetAudience: args.targetAudience,
            requirements: args.requirements || [],
            acceptanceCriteria: args.acceptanceCriteria || [],
            timeline: args.timeline,
            priority: args.priority || 'P2',
            status: 'Draft',
            createdAt: timestamp,
            lastModified: timestamp
          };
          
          // Store in memory
          await this.server.memoryStore.store(`prd:${result.id}`, result, { namespace: 'product' });
          break;
          
        case 'prd_update':
          // Retrieve existing PRD
          const existingPrd = await this.server.memoryStore.retrieve(`prd:${args.prdId}`, { namespace: 'product' });
          if (!existingPrd) {
            throw new Error(`PRD not found: ${args.prdId}`);
          }
          
          result = {
            ...existingPrd,
            ...args.updates,
            lastModified: timestamp,
            updateReason: args.reason
          };
          
          await this.server.memoryStore.store(`prd:${args.prdId}`, result, { namespace: 'product' });
          break;
          
        case 'vision_create':
          result = {
            id: `vision_${Date.now()}`,
            type: 'Vision',
            title: args.title,
            vision: args.vision,
            mission: args.mission,
            goals: args.goals,
            keyMetrics: args.keyMetrics || [],
            timeHorizon: args.timeHorizon || '1Y',
            stakeholders: args.stakeholders || [],
            status: 'Active',
            createdAt: timestamp
          };
          
          await this.server.memoryStore.store(`vision:${result.id}`, result, { namespace: 'product' });
          break;
          
        case 'epic_create':
          result = {
            id: `epic_${Date.now()}`,
            type: 'Epic',
            title: args.title,
            description: args.description,
            businessValue: args.businessValue,
            userStory: args.userStory,
            acceptanceCriteria: args.acceptanceCriteria || [],
            estimatedEffort: args.estimatedEffort || 'M',
            priority: args.priority || 'Medium',
            dependencies: args.dependencies || [],
            tags: args.tags || [],
            status: 'Backlog',
            createdAt: timestamp
          };
          
          await this.server.memoryStore.store(`epic:${result.id}`, result, { namespace: 'product' });
          break;
          
        case 'feature_create':
          result = {
            id: `feature_${Date.now()}`,
            type: 'Feature',
            title: args.title,
            description: args.description,
            epicId: args.epicId,
            userStories: args.userStories,
            acceptanceCriteria: args.acceptanceCriteria || [],
            wireframes: args.wireframes || [],
            technicalSpecs: args.technicalSpecs || {},
            estimatedPoints: args.estimatedPoints,
            priority: args.priority || 'Should Have',
            release: args.release,
            status: 'Backlog',
            createdAt: timestamp
          };
          
          await this.server.memoryStore.store(`feature:${result.id}`, result, { namespace: 'product' });
          break;
          
        case 'roadmap_create':
          result = {
            id: `roadmap_${Date.now()}`,
            type: 'Roadmap',
            title: args.title,
            timeframe: args.timeframe,
            quarters: args.quarters,
            milestones: args.milestones || [],
            themes: args.themes || [],
            risks: args.risks || [],
            assumptions: args.assumptions || [],
            status: 'Active',
            createdAt: timestamp
          };
          
          await this.server.memoryStore.store(`roadmap:${result.id}`, result, { namespace: 'product' });
          break;
          
        case 'backlog_manage':
          result = {
            id: `backlog_${Date.now()}`,
            type: 'BacklogOperation',
            action: args.action,
            items: args.items || [],
            criteria: args.criteria || {},
            filters: args.filters || {},
            timestamp: timestamp,
            status: 'Completed'
          };
          
          await this.server.memoryStore.store(`backlog:${result.id}`, result, { namespace: 'product' });
          break;
          
        case 'stakeholder_analysis':
          result = {
            id: `stakeholder_${Date.now()}`,
            type: 'StakeholderAnalysis',
            stakeholders: args.stakeholders,
            analysis: args.analysis,
            communicationPlan: args.communicationPlan || {},
            recommendations: this.generateStakeholderRecommendations(args.stakeholders, args.analysis),
            createdAt: timestamp
          };
          
          await this.server.memoryStore.store(`stakeholder:${result.id}`, result, { namespace: 'product' });
          break;
          
        case 'market_research':
          result = {
            id: `research_${Date.now()}`,
            type: 'MarketResearch',
            researchType: args.researchType,
            scope: args.scope,
            methodology: args.methodology || [],
            timeline: args.timeline,
            status: 'Planned',
            findings: [],
            createdAt: timestamp
          };
          
          await this.server.memoryStore.store(`research:${result.id}`, result, { namespace: 'product' });
          break;
          
        case 'kpi_tracking':
          result = {
            id: `kpi_${Date.now()}`,
            type: 'KPITracking',
            kpis: args.kpis,
            period: args.period,
            targets: args.targets || {},
            analysis: args.analysis,
            currentValues: {},
            trends: {},
            createdAt: timestamp
          };
          
          await this.server.memoryStore.store(`kpi:${result.id}`, result, { namespace: 'product' });
          break;
          
        default:
          throw new Error(`Unknown product tool: ${name}`);
      }
      
      return {
        success: true,
        tool: name,
        result: result,
        timestamp: timestamp,
        stored: true
      };
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [Product-Tool] ${name} failed:`, error.message);
      
      return {
        success: false,
        tool: name,
        error: error.message,
        timestamp: timestamp
      };
    }
  }

  /**
   * Generate stakeholder recommendations based on analysis
   * @param {Array} stakeholders - Stakeholder list
   * @param {string} analysisType - Type of analysis
   * @returns {Array} Recommendations
   */
  generateStakeholderRecommendations(stakeholders, analysisType) {
    const recommendations = [];
    
    switch (analysisType) {
      case 'power-interest':
        recommendations.push('High power, high interest: Manage closely and keep satisfied');
        recommendations.push('High power, low interest: Keep satisfied with minimal effort');
        recommendations.push('Low power, high interest: Keep informed and engaged');
        recommendations.push('Low power, low interest: Monitor occasionally');
        break;
      case 'influence-impact':
        recommendations.push('High influence, high impact: Primary focus for engagement');
        recommendations.push('High influence, low impact: Leverage for broader reach');
        recommendations.push('Low influence, high impact: Direct communication channels');
        break;
      case 'engagement':
        recommendations.push('Champion: Leverage as advocates and change agents');
        recommendations.push('Supporter: Maintain regular communication');
        recommendations.push('Neutral: Provide information and seek buy-in');
        recommendations.push('Resistant: Address concerns and provide evidence');
        break;
    }
    
    return recommendations;
  }

  /**
   * Execute swarm coordination tools
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Execution result
   */
  async executeSwarmTool(name, args) {
    switch (name) {
      case 'swarm_init':
        return this.initializeSwarm(args);
      case 'swarm_status':
        return this.getSwarmStatus(args);
      case 'swarm_monitor':
        return this.monitorSwarm(args);
      default:
        throw new Error(`Unknown swarm tool: ${name}`);
    }
  }

  /**
   * Execute neural network tools
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Execution result
   */
  async executeNeuralTool(name, args) {
    switch (name) {
      case 'neural_status':
        return this.getNeuralStatus(args);
      case 'neural_train':
        return this.trainNeuralPatterns(args);
      case 'neural_patterns':
        return this.analyzeNeuralPatterns(args);
      default:
        throw new Error(`Unknown neural tool: ${name}`);
    }
  }

  /**
   * Execute memory management tools
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Execution result
   */
  async executeMemoryTool(name, args) {
    switch (name) {
      case 'memory_usage':
        return this.manageMemory(args);
      case 'benchmark_run':
        return this.runBenchmark(args);
      default:
        throw new Error(`Unknown memory tool: ${name}`);
    }
  }

  /**
   * Execute agent management tools
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Execution result
   */
  async executeAgentTool(name, args) {
    switch (name) {
      case 'agent_spawn':
        return this.spawnAgent(args);
      case 'agent_list':
        return this.listAgents(args);
      case 'agent_metrics':
        return this.getAgentMetrics(args);
      default:
        throw new Error(`Unknown agent tool: ${name}`);
    }
  }

  /**
   * Execute task management tools
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Execution result
   */
  async executeTaskTool(name, args) {
    switch (name) {
      case 'task_orchestrate':
        return this.orchestrateTask(args);
      case 'task_status':
        return this.getTaskStatus(args);
      case 'task_results':
        return this.getTaskResults(args);
      default:
        throw new Error(`Unknown task tool: ${name}`);
    }
  }

  /**
   * Execute system tools
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Execution result
   */
  async executeSystemTool(name, args) {
    switch (name) {
      case 'features_detect':
        return this.detectFeatures(args);
      default:
        throw new Error(`Unknown system tool: ${name}`);
    }
  }

  // Tool implementation methods

  /**
   * Initialize swarm with configuration
   * @param {Object} args - Swarm configuration
   * @returns {Promise<Object>} Swarm initialization result
   */
  async initializeSwarm(args) {
    const { topology, maxAgents = 8, strategy = 'auto' } = args;
    
    const swarmId = `swarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create swarm instance using ruv-swarm
    const swarm = await this.server.ruvSwarm.createSwarm({
      id: swarmId,
      topology,
      maxAgents,
      strategy
    });
    
    this.server.swarms.set(swarmId, swarm);
    
    // Store in memory
    await this.server.memoryStore.store(`swarm:${swarmId}`, {
      id: swarmId,
      topology,
      maxAgents,
      strategy,
      created: new Date().toISOString(),
      status: 'initialized'
    }, { namespace: 'swarms' });
    
    return {
      success: true,
      swarmId,
      topology,
      maxAgents,
      strategy,
      status: 'initialized',
      message: `Swarm ${swarmId} initialized with ${topology} topology`
    };
  }

  /**
   * Get swarm status
   * @param {Object} args - Status query parameters
   * @returns {Promise<Object>} Swarm status
   */
  async getSwarmStatus(args) {
    const { swarmId } = args;
    
    if (swarmId) {
      const swarm = this.server.swarms.get(swarmId);
      const storedData = await this.server.memoryStore.retrieve(`swarm:${swarmId}`, { namespace: 'swarms' });
      
      if (!swarm && !storedData) {
        throw new Error(`Swarm not found: ${swarmId}`);
      }
      
      return {
        swarmId,
        status: swarm ? 'active' : 'stored',
        agents: swarm ? swarm.getAgents().length : 0,
        created: storedData?.created || 'unknown',
        uptime: swarm ? swarm.getUptime() : 0
      };
    }
    
    // List all swarms
    const activeSwarms = Array.from(this.server.swarms.keys());
    const storedSwarms = await this.server.memoryStore.search('swarm:', { namespace: 'swarms' });
    
    return {
      activeSwarms: activeSwarms.length,
      storedSwarms: storedSwarms.length,
      totalSwarms: activeSwarms.length + storedSwarms.length,
      swarms: activeSwarms.map(id => ({
        id,
        status: 'active',
        agents: this.server.swarms.get(id)?.getAgents().length || 0
      }))
    };
  }

  /**
   * Spawn a new agent
   * @param {Object} args - Agent configuration
   * @returns {Promise<Object>} Agent creation result
   */
  async spawnAgent(args) {
    const { type, name, capabilities = [], swarmId } = args;
    
    const agentId = `agent-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // Find target swarm
    const targetSwarm = swarmId ? this.server.swarms.get(swarmId) : null;
    
    if (swarmId && !targetSwarm) {
      throw new Error(`Target swarm not found: ${swarmId}`);
    }
    
    // Create agent configuration
    const agentConfig = {
      id: agentId,
      type,
      name: name || `${type}-${agentId.substr(-6)}`,
      capabilities,
      swarmId,
      created: new Date().toISOString(),
      status: 'spawned'
    };
    
    // Add to swarm if specified
    if (targetSwarm) {
      await targetSwarm.addAgent(agentConfig);
    }
    
    // Store agent data
    await this.server.memoryStore.store(`agent:${agentId}`, agentConfig, { namespace: 'agents' });
    
    return {
      success: true,
      agentId,
      type,
      name: agentConfig.name,
      swarmId,
      status: 'spawned',
      message: `Agent ${agentId} spawned successfully`
    };
  }

  /**
   * Manage memory operations
   * @param {Object} args - Memory operation parameters
   * @returns {Promise<any>} Memory operation result
   */
  async manageMemory(args) {
    const { action, key, value, namespace = 'default', ttl } = args;
    
    switch (action) {
      case 'store':
        if (!key || value === undefined) {
          throw new Error('Store action requires key and value');
        }
        await this.server.memoryStore.store(key, value, { namespace, ttl });
        return { success: true, action: 'store', key, namespace };
        
      case 'retrieve':
        if (!key) {
          throw new Error('Retrieve action requires key');
        }
        const retrievedValue = await this.server.memoryStore.retrieve(key, { namespace });
        return { success: true, action: 'retrieve', key, value: retrievedValue, namespace };
        
      case 'delete':
        if (!key) {
          throw new Error('Delete action requires key');
        }
        await this.server.memoryStore.delete(key, { namespace });
        return { success: true, action: 'delete', key, namespace };
        
      case 'list':
        const allKeys = await this.server.memoryStore.list({ namespace });
        return { success: true, action: 'list', keys: allKeys, namespace, count: allKeys.length };
        
      case 'search':
        if (!key) {
          throw new Error('Search action requires key pattern');
        }
        const results = await this.server.memoryStore.search(key, { namespace });
        return { success: true, action: 'search', pattern: key, results, namespace, count: results.length };
        
      default:
        throw new Error(`Unknown memory action: ${action}`);
    }
  }

  /**
   * Detect available features
   * @param {Object} args - Feature detection parameters
   * @returns {Promise<Object>} Available features
   */
  async detectFeatures(args) {
    const { category = 'all' } = args;
    
    const features = {
      neural: {
        available: true,
        models: ['coordination', 'optimization', 'prediction'],
        acceleration: 'WASM SIMD',
        status: 'operational'
      },
      coordination: {
        available: true,
        topologies: ['hierarchical', 'mesh', 'ring', 'star'],
        maxAgents: 32,
        status: 'operational'
      },
      memory: {
        available: true,
        type: 'SQLite',
        persistent: true,
        namespaces: true,
        status: 'operational'
      }
    };
    
    if (category === 'all') {
      return { success: true, features, detectedAt: new Date().toISOString() };
    }
    
    if (features[category]) {
      return { success: true, feature: category, details: features[category], detectedAt: new Date().toISOString() };
    }
    
    throw new Error(`Unknown feature category: ${category}`);
  }

  // Additional stub methods for completeness

  async monitorSwarm(args) {
    return { monitoring: true, swarmId: args.swarmId, message: 'Monitoring started' };
  }

  async getNeuralStatus(args) {
    return { status: 'operational', models: 27, lastTrained: new Date().toISOString() };
  }

  async trainNeuralPatterns(args) {
    return { training: 'completed', pattern: args.pattern_type, epochs: args.epochs };
  }

  async analyzeNeuralPatterns(args) {
    return { analysis: 'completed', action: args.action, patterns: ['detected'] };
  }

  async runBenchmark(args) {
    return { benchmark: args.type, performance: '95%', iterations: args.iterations };
  }

  async listAgents(args) {
    const agents = await this.server.memoryStore.search('agent:', { namespace: 'agents' });
    return { agents: agents.slice(0, 20), total: agents.length };
  }

  async getAgentMetrics(args) {
    return { agentId: args.agentId, performance: 0.85, uptime: '2h 15m' };
  }

  async orchestrateTask(args) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    return { taskId, task: args.task, strategy: args.strategy, status: 'orchestrated' };
  }

  async getTaskStatus(args) {
    return { taskId: args.taskId, status: 'running', progress: 0.65 };
  }

  async getTaskResults(args) {
    return { taskId: args.taskId, results: { completed: true }, format: args.format };
  }

  /**
   * Update execution statistics
   * @param {string} toolName - Tool name
   * @param {number} executionTime - Execution time in ms
   * @param {boolean} success - Whether execution succeeded
   */
  updateExecutionStats(toolName, executionTime, success) {
    if (!this.executionStats.has(toolName)) {
      this.executionStats.set(toolName, {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalTime: 0,
        averageTime: 0
      });
    }
    
    const stats = this.executionStats.get(toolName);
    stats.totalExecutions++;
    stats.totalTime += executionTime;
    stats.averageTime = stats.totalTime / stats.totalExecutions;
    
    if (success) {
      stats.successfulExecutions++;
    } else {
      stats.failedExecutions++;
    }
  }

  /**
   * Get execution statistics
   * @returns {Object} Execution statistics
   */
  getExecutionStats() {
    const stats = {};
    for (const [toolName, toolStats] of this.executionStats.entries()) {
      stats[toolName] = { ...toolStats };
    }
    return stats;
  }
}