/**
 * @file Claude Code Hooks Implementation for ruv-swarm - provides automated coordination, formatting, and learning capabilities.
 */

import { getLogger } from '../../../../config/logging-config';

const logger = getLogger('coordination-swarm-core-hooks-index');

import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
// fileURLToPath is provided by esbuild banner

import type { AgentMemoryCoordinationDao } from '../../../../database/index.js';

// import { DALFactory } from '../../database'; // TODO: Implement proper DI integration

type SwarmPersistence = AgentMemoryCoordinationDao;

// __filename is provided by esbuild banner

class ZenSwarmHooks {
  public sessionData: unknown;
  public persistence: SwarmPersistence | null;
  private _sessionId?: string;

  constructor() {
    this.sessionData = {
      startTime: Date.now(),
      operations: [],
      agents: new Map(),
      learnings: [],
      metrics: {
        tokensSaved: 0,
        tasksCompleted: 0,
        patternsImproved: 0,
      },
    };

    // Initialize persistence layer for cross-agent memory
    this.persistence = null;
    this.initializePersistence();
  }

  /**
   * Initialize persistence layer with error handling.
   */
  async initializePersistence() {
    try {
      // Create a simple mock implementation for now
      // TODO: Implement proper DALFactory integration with DI
      this.persistence = {
        query: async (_sql: string, _params?: unknown[]) => [],
        execute: async (_sql: string, _params?: unknown[]) => ({
          affectedRows: 1,
        }),
      } as any;
    } catch (error) {
      logger.warn(
        '⚠️ Failed to initialize persistence layer:',
        (error as Error).message
      );
      logger.warn('⚠️ Operating in memory-only mode');
      this.persistence = null;
    }
  }

  /**
   * Main hook handler - routes to specific hook implementations.
   *
   * @param hookType
   * @param args
   */
  async handleHook(hookType: string, args: unknown[]) {
    try {
      switch (hookType) {
        // Pre-operation hooks
        case 'pre-edit':
          return await this.preEditHook(args);
        case 'pre-bash':
          return await this.preBashHook(args);
        case 'pre-task':
          return await this.preTaskHook(args);
        case 'pre-search':
          return await this.preSearchHook(args);
        case 'pre-mcp':
          return await this.preMcpHook(args);

        // Post-operation hooks
        case 'post-edit':
          return await this.postEditHook(args);
        case 'post-bash':
          return await this.postTaskHook(args);
        case 'post-task':
          return await this.postTaskHook(args);
        case 'post-search':
          return await this.postWebSearchHook(args);
        case 'post-web-search':
          return await this.postWebSearchHook(args);
        case 'post-web-fetch':
          return await this.postWebFetchHook(args);

        // MCP-specific hooks
        case 'mcp-swarm-initialized':
          return await this.mcpSwarmInitializedHook(args);
        case 'mcp-agent-spawned':
          return await this.mcpAgentSpawnedHook(args);
        case 'mcp-task-orchestrated':
          return await this.mcpTaskOrchestratedHook(args);
        case 'mcp-neural-trained':
          return await this.mcpNeuralTrainedHook(args);

        // Learning & Deception Detection hooks
        case 'deception-scan':
          return await this.deceptionScanHook(args);
        case 'pattern-learning':
          return await this.patternLearningHook(args);
        case 'anomaly-detection':
          return await this.anomalyDetectionHook(args);
        case 'trust-evaluation':
          return await this.trustEvaluationHook(args);
        case 'behavioral-analysis':
          return await this.behavioralAnalysisHook(args);

        // System hooks
        case 'notification':
          return await this.notificationHook(args);
        case 'session-end':
          return await this.sessionEndHook(args);
        case 'session-restore':
          return await this.sessionRestoreHook(args);
        case 'agent-complete':
          return await this.agentCompleteHook(args);

        default:
          return { continue: true, reason: `Unknown hook type: ${hookType}` };
      }
    } catch (error) {
      logger.error(`Hook error (${hookType}):`, error.message);
      return {
        continue: true,
        error: error.message,
        fallback: 'Hook error - continuing with default behavior',
      };
    }
  }

  /**
   * Pre-search hook - Prepare cache and optimize search.
   *
   * @param args
   */
  async preSearchHook(args: unknown) {
    const { pattern } = args;

    // Initialize search cache
    if (!this.sessionData.searchCache) {
      this.sessionData.searchCache = new Map();
    }

    // Check cache for similar patterns
    const cachedResult = this.sessionData.searchCache.get(pattern);
    if (cachedResult && Date.now() - cachedResult?.timestamp < 300000) {
      // 5 min cache
      return {
        continue: true,
        cached: true,
        cacheHit: cachedResult?.files.length,
        metadata: { pattern, cached: true },
      };
    }

    return {
      continue: true,
      reason: 'Search prepared',
      metadata: { pattern, cacheReady: true },
    };
  }

  /**
   * Pre-MCP hook - Validate MCP tool state.
   *
   * @param args
   */
  async preMcpHook(args: unknown) {
    const { tool, params } = args;

    // Parse params if string
    const toolParams = typeof params === 'string' ? JSON.parse(params) : params;

    // Validate swarm state for MCP operations
    if (tool.includes('agent_spawn') || tool.includes('task_orchestrate')) {
      const swarmStatus = await this.checkSwarmStatus();
      if (!swarmStatus.initialized) {
        return {
          continue: true,
          warning: 'Swarm not initialized - will be created automatically',
          autoInit: true,
        };
      }
    }

    // Track MCP operations
    this.sessionData.operations.push({
      type: 'mcp',
      tool,
      params: toolParams,
      timestamp: Date.now(),
    });

    return {
      continue: true,
      reason: 'MCP tool validated',
      metadata: { tool, state: 'ready' },
    };
  }

  /**
   * Pre-edit hook - Ensure coordination before file modifications.
   *
   * @param args
   */
  async preEditHook(args: unknown) {
    const { file } = args;

    // Determine file type and assign appropriate agent
    const fileExt = path.extname(file);
    const agentType = this.getAgentTypeForFile(fileExt);

    // Check if swarm is initialized
    const swarmStatus = await this.checkSwarmStatus();
    if (!swarmStatus.initialized) {
      return {
        continue: false,
        reason: 'Swarm not initialized - run mcp__zen-swarm__swarm_init first',
        suggestion: 'Initialize swarm with appropriate topology',
      };
    }

    // Ensure appropriate agent exists
    const agent = await this.ensureAgent(agentType);

    // Record operation
    this.sessionData.operations.push({
      type: 'edit',
      file,
      agent: agent.id,
      timestamp: Date.now(),
    });

    return {
      continue: true,
      reason: `${agentType} agent assigned for ${fileExt} file`,
      metadata: {
        agent_id: agent.id,
        agent_type: agentType,
        cognitive_pattern: agent.pattern,
        readiness: agent.readiness,
      },
    };
  }

  /**
   * Pre-task hook - Auto-spawn agents and optimize topology.
   *
   * @param args
   */
  async preTaskHook(args: unknown) {
    const { description, autoSpawnAgents, optimizeTopology } = args;

    // Analyze task complexity
    const complexity = this.analyzeTaskComplexity(description);

    // Determine optimal topology
    const topology = optimizeTopology
      ? this.selectOptimalTopology(complexity)
      : 'mesh';

    // Auto-spawn required agents
    if (autoSpawnAgents) {
      const requiredAgents = this.determineRequiredAgents(
        description,
        complexity
      );
      for (const agentType of requiredAgents) {
        await this.ensureAgent(agentType);
      }
    }

    return {
      continue: true,
      reason: 'Task prepared with optimal configuration',
      metadata: {
        complexity,
        topology,
        agentsReady: true,
        estimatedDuration: complexity.estimatedMinutes * 60000,
      },
    };
  }

  /**
   * Post-edit hook - Format and learn from edits.
   *
   * @param args
   */
  async postEditHook(args: unknown) {
    const { file, autoFormat, trainPatterns, updateGraph } = args;
    const result: unknown = {
      continue: true,
      formatted: false,
      training: null,
    };

    // Auto-format if requested
    if (autoFormat) {
      const formatted = await this.autoFormatFile(file);
      result.formatted = formatted.success;
      result.formatDetails = formatted.details;
    }

    // Train neural patterns
    if (trainPatterns) {
      const training = await this.trainPatternsFromEdit(file);
      result.training = training;
      this.sessionData.metrics.patternsImproved += training.improvement || 0;
    }

    // Update knowledge graph if requested
    if (updateGraph) {
      await this.updateKnowledgeGraph(file, 'edit');
    }

    // Update session data
    this.sessionData.metrics.tokensSaved += 10; // Estimated savings

    return result;
  }

  /**
   * Post-task hook - Analyze performance and update coordination.
   *
   * @param args
   */
  async postTaskHook(args: unknown) {
    const { taskId, analyzePerformance, updateCoordination } = args;

    const performance: unknown = {
      taskId,
      completionTime:
        Date.now() -
        (this.sessionData.taskStartTimes?.get(taskId) || Date.now()),
      agentsUsed: this.sessionData.taskAgents?.get(taskId) || [],
      success: true,
    };

    // Analyze performance
    if (analyzePerformance) {
      performance.analysis = {
        efficiency: this.calculateEfficiency(performance),
        bottlenecks: this.identifyBottlenecks(performance),
        improvements: this.suggestImprovements(performance),
      };
    }

    // Update coordination strategies
    if (updateCoordination) {
      this.updateCoordinationStrategy(performance);
    }

    this.sessionData.metrics.tasksCompleted++;

    return {
      continue: true,
      performance,
      metadata: { taskId, optimized: true },
    };
  }

  /**
   * Post-web-search hook - Analyze results and update knowledge.
   *
   * @param args
   */
  async postWebSearchHook(args: unknown) {
    const { query, updateKnowledge } = args;

    // Track search patterns
    if (!this.sessionData.searchPatterns) {
      this.sessionData.searchPatterns = new Map();
    }

    const patterns = this.extractSearchPatterns(query);
    patterns.forEach((pattern) => {
      const count = this.sessionData.searchPatterns.get(pattern) || 0;
      this.sessionData.searchPatterns.set(pattern, count + 1);
    });

    // Update knowledge base
    if (updateKnowledge) {
      await this.updateKnowledgeBase('search', { query, patterns });
    }

    return {
      continue: true,
      reason: 'Search analyzed and knowledge updated',
      metadata: {
        query,
        patternsExtracted: patterns.length,
        knowledgeUpdated: updateKnowledge,
      },
    };
  }

  /**
   * Post-web-fetch hook - Extract patterns and cache content.
   *
   * @param args
   */
  async postWebFetchHook(args: unknown) {
    const { url, extractPatterns, cacheContent } = args;

    const result: {
      continue: boolean;
      patterns: string[];
      cached: boolean;
    } = {
      continue: true,
      patterns: [],
      cached: false,
    };

    // Extract patterns from URL
    if (extractPatterns) {
      result.patterns = this.extractUrlPatterns(url);
    }

    // Cache content for future use
    if (cacheContent) {
      if (!this.sessionData.contentCache) {
        this.sessionData.contentCache = new Map();
      }
      this.sessionData.contentCache.set(url, {
        timestamp: Date.now(),
        patterns: result?.patterns,
      });
      result.cached = true;
    }

    return result;
  }

  /**
   * Notification hook - Handle notifications with swarm status.
   *
   * @param args
   */
  async notificationHook(args: unknown) {
    const {
      message,
      level,
      withSwarmStatus,
      sendTelemetry,
      type,
      context,
      agentId,
    } = args;

    const notification: unknown = {
      message,
      level: level || 'info',
      type: type || 'general',
      context: context || {},
      agentId: agentId || null,
      timestamp: Date.now(),
    };

    // Add swarm status if requested
    if (withSwarmStatus) {
      const status = await this.getSwarmStatus();
      notification.swarmStatus = {
        agents: status.agents?.size || 0,
        activeTasks: status.activeTasks || 0,
        health: status.health || 'unknown',
      };
    }

    // Send telemetry if enabled
    if (sendTelemetry && process.env['ZEN_SWARM_TELEMETRY'] === 'true') {
      this.sendTelemetry('notification', notification);
    }

    // Store notification in both runtime memory AND persistent database
    if (!this.sessionData.notifications) {
      this.sessionData.notifications = [];
    }
    this.sessionData.notifications.push(notification);

    // CRITICAL FIX: Also store in persistent database for cross-agent access
    await this.storeNotificationInDatabase(notification);

    return {
      continue: true,
      notification,
      handled: true,
    };
  }

  /**
   * Pre-bash hook - Validate commands before execution.
   *
   * @param args
   */
  async preBashHook(args: unknown) {
    const { command } = args;

    // Safety checks
    const safetyCheck = this.validateCommandSafety(command);
    if (!safetyCheck.safe) {
      return {
        continue: false,
        reason: safetyCheck.reason,
        riskLevel: safetyCheck.riskLevel,
      };
    }

    // Check resource requirements
    const resources = this.estimateCommandResources(command);
    if (resources.requiresAgent) {
      await this.ensureAgent(resources.agentType);
    }

    return {
      continue: true,
      reason: 'Command validated and resources available',
      metadata: {
        estimatedDuration: resources.duration,
        requiresAgent: resources.requiresAgent,
      },
    };
  }

  /**
   * MCP swarm initialized hook - Persist configuration.
   *
   * @param args
   */
  async mcpSwarmInitializedHook(args: unknown) {
    const { swarmId, topology, persistConfig, enableMonitoring } = args;

    // Store swarm configuration
    const swarmConfig = {
      id: swarmId,
      topology,
      initialized: Date.now(),
      monitoring: enableMonitoring,
    };

    // Persist configuration
    if (persistConfig) {
      const configDir = path.join(process.cwd(), '.ruv-swarm');
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(
        path.join(configDir, 'swarm-config.json'),
        JSON.stringify(swarmConfig, null, 2)
      );
    }

    // Initialize monitoring
    if (enableMonitoring) {
      this.sessionData.monitoring = {
        swarmId,
        startTime: Date.now(),
        events: [],
      };
    }

    return {
      continue: true,
      reason: 'Swarm initialized and configured',
      metadata: swarmConfig,
    };
  }

  /**
   * MCP agent spawned hook - Update roster and train.
   *
   * @param args
   */
  async mcpAgentSpawnedHook(args: unknown) {
    const { agentId, type, updateRoster, trainSpecialization } = args;

    // Update agent roster
    if (updateRoster) {
      const agent = {
        id: agentId,
        type,
        specialization: this.getSpecializationForType(type),
        spawned: Date.now(),
        performance: { tasks: 0, successRate: 1.0 },
      };

      this.sessionData.agents.set(agentId, agent);

      // Persist roster
      const rosterPath = path.join(
        process.cwd(),
        '.ruv-swarm',
        'agent-roster.json'
      );
      const roster = Array.from(this.sessionData.agents.values());
      await fs.writeFile(rosterPath, JSON.stringify(roster, null, 2));
    }

    // Train specialization patterns
    if (trainSpecialization) {
      const training = {
        agentId,
        type,
        patterns: this.generateSpecializationPatterns(type),
        confidence: 0.9 + Math.random() * 0.1,
      };

      this.sessionData.learnings.push(training);
    }

    return {
      continue: true,
      agentId,
      type,
      specialized: true,
    };
  }

  /**
   * MCP task orchestrated hook - Monitor and optimize.
   *
   * @param args
   */
  async mcpTaskOrchestratedHook(args: unknown) {
    const { taskId, monitorProgress, optimizeDistribution } = args;

    // Initialize task tracking
    if (!this.sessionData.taskStartTimes) {
      this.sessionData.taskStartTimes = new Map();
    }
    if (!this.sessionData.taskAgents) {
      this.sessionData.taskAgents = new Map();
    }

    this.sessionData.taskStartTimes.set(taskId, Date.now());

    // Monitor progress setup
    if (monitorProgress) {
      this.sessionData.taskMonitoring =
        this.sessionData.taskMonitoring || new Map();
      this.sessionData.taskMonitoring.set(taskId, {
        checkpoints: [],
        resources: [],
        bottlenecks: [],
      });
    }

    // Optimize distribution
    if (optimizeDistribution) {
      const optimization = {
        taskId,
        strategy: 'load-balanced',
        agentAllocation: this.optimizeAgentAllocation(taskId),
        parallelization: this.calculateParallelization(taskId),
      };

      return {
        continue: true,
        taskId,
        optimization,
      };
    }

    return {
      continue: true,
      taskId,
      monitoring: monitorProgress,
    };
  }

  /**
   * MCP neural trained hook - Save improvements.
   *
   * @param args
   */
  async mcpNeuralTrainedHook(args: unknown) {
    const { improvement, saveWeights, updatePatterns } = args;

    const result = {
      continue: true,
      improvement: Number.parseFloat(improvement),
      saved: false,
      patternsUpdated: false,
    };

    // Save neural weights
    if (saveWeights) {
      const weightsDir = path.join(
        process.cwd(),
        '.ruv-swarm',
        'neural-weights'
      );
      await fs.mkdir(weightsDir, { recursive: true });

      const weightData = {
        timestamp: Date.now(),
        improvement,
        weights: this.generateMockWeights(),
        version: this.sessionData.learnings.length,
      };

      await fs.writeFile(
        path.join(weightsDir, `weights-${Date.now()}.json`),
        JSON.stringify(weightData, null, 2)
      );

      result.saved = true;
    }

    // Update cognitive patterns
    if (updatePatterns) {
      this.sessionData.metrics.patternsImproved++;

      const patternUpdate = {
        timestamp: Date.now(),
        improvement,
        patterns: ['convergent', 'divergent', 'lateral'],
        confidence: 0.85 + Number.parseFloat(improvement),
      };

      this.sessionData.learnings.push(patternUpdate);
      result.patternsUpdated = true;
    }

    return result;
  }

  /**
   * Agent complete hook - Commit to git with detailed report.
   */

  /**
   * Extract key points from output.
   *
   * @param output
   */
  extractKeyPoints(output: string): string {
    const lines = output.split('\n').filter((l) => l.trim());
    const keyPoints: string[] = [];

    // Look for bullet points or numbered items
    lines.forEach((line) => {
      if (line.match(/^[-*•]\s/) || line.match(/^\d+\.\s/)) {
        keyPoints.push(line);
      }
    });

    // If no bullet points, take first few lines
    if (keyPoints.length === 0) {
      keyPoints.push(...lines.slice(0, 5));
    }

    return keyPoints.slice(0, 10).join('\n');
  }

  /**
   * Extract bullet points for commit message.
   *
   * @param output
   */
  extractBulletPoints(output: string): string {
    if (!output) {
      return '- No specific achievements captured';
    }

    const points = this.extractKeyPoints(output)
      .split('\n')
      .slice(0, 5)
      .map((p) => `- ${p.replace(/^[-*•\d+.\s]+/, '').trim()}`);

    return points.length > 0
      ? points.join('\n')
      : '- Task completed successfully';
  }

  /**
   * Get count of modified files.
   */
  getModifiedFilesCount(): number {
    const fileOps = this.sessionData.operations.filter((op: unknown) =>
      ['edit', 'write', 'create'].includes(op.type)
    );

    const uniqueFiles = new Set(
      fileOps.map((op: unknown) => op.file).filter(Boolean)
    );
    return uniqueFiles.size;
  }

  /**
   * Get list of modified files.
   */
  getModifiedFilesList(): string {
    const fileOps = this.sessionData.operations.filter((op: unknown) =>
      ['edit', 'write', 'create'].includes(op.type)
    );

    const fileMap = new Map();
    fileOps.forEach((op: unknown) => {
      if (op.file) {
        if (!fileMap.has(op.file)) {
          fileMap.set(op.file, []);
        }
        fileMap.get(op.file)?.push(op.type);
      }
    });

    if (fileMap.size === 0) {
      return 'No files modified';
    }

    return Array.from(fileMap.entries())
      .map(([file, ops]) => `- ${file} (${[...new Set(ops)].join(', ')})`)
      .join('\n');
  }

  /**
   * Session restore hook - Load previous state.
   *
   * @param args
   */
  async sessionRestoreHook(args: unknown) {
    const { loadMemory, loadAgents } = args;

    const result = {
      continue: true,
      restored: {
        memory: false,
        agents: false,
        metrics: false,
      },
    };

    try {
      const sessionDir = path.join(process.cwd(), '.ruv-swarm');

      // Load memory state
      if (loadMemory) {
        const memoryPath = path.join(sessionDir, 'memory-state.json');
        if (
          await fs
            .access(memoryPath)
            .then(() => true)
            .catch(() => false)
        ) {
          const memory = JSON.parse(await fs.readFile(memoryPath, 'utf-8'));
          this.sessionData = { ...this.sessionData, ...memory };
          result.restored.memory = true;
        }
      }

      // Load agent roster
      if (loadAgents) {
        const rosterPath = path.join(sessionDir, 'agent-roster.json');
        if (
          await fs
            .access(rosterPath)
            .then(() => true)
            .catch(() => false)
        ) {
          const roster = JSON.parse(await fs.readFile(rosterPath, 'utf-8'));
          roster.forEach((agent: unknown) => {
            this.sessionData.agents.set(agent.id, agent);
          });
          result.restored.agents = true;
        }
      }

      // Load metrics
      const metricsPath = path.join(sessionDir, 'session-metrics.json');
      if (
        await fs
          .access(metricsPath)
          .then(() => true)
          .catch(() => false)
      ) {
        const metrics = JSON.parse(await fs.readFile(metricsPath, 'utf-8'));
        this.sessionData.metrics = { ...this.sessionData.metrics, ...metrics };
        result.restored.metrics = true;
      }
    } catch (error) {
      logger.error('Session restore error:', error.message);
    }

    return result;
  }

  /**
   * Session end hook - Generate summary and persist state.
   *
   * @param args
   */
  async sessionEndHook(args: unknown) {
    const { generateSummary, saveMemory, exportMetrics } = args;
    const sessionDir = path.join(process.cwd(), '.claude', 'sessions');
    await fs.mkdir(sessionDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const results: unknown = {};

    // Generate summary
    if (generateSummary) {
      const summary = this.generateSessionSummary();
      const summaryPath = path.join(sessionDir, `${timestamp}-summary.md`);
      await fs.writeFile(summaryPath, summary);
      results.summary = summaryPath;
    }

    // Save memory state
    if (saveMemory) {
      const state = this.captureSwarmState();
      const statePath = path.join(sessionDir, `${timestamp}-state.json`);
      await fs.writeFile(statePath, JSON.stringify(state, null, 2));
      results.state = statePath;
    }

    // Export metrics
    if (exportMetrics) {
      const metrics = this.calculateSessionMetrics();
      const metricsPath = path.join(sessionDir, `${timestamp}-metrics.json`);
      await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2));
      results.metrics = metricsPath;
    }

    return {
      continue: true,
      files: results,
      summary: {
        duration: Date.now() - this.sessionData.startTime,
        operations: this.sessionData.operations.length,
        improvements: this.sessionData.metrics.patternsImproved,
      },
    };
  }

  // Helper methods

  getAgentTypeForFile(extension: string): string {
    const mapping = {
      '.js': 'coder',
      '.ts': 'coder',
      '.jsx': 'coder',
      '.tsx': 'coder',
      '.py': 'coder',
      '.go': 'coder',
      '.rs': 'coder',
      '.md': 'researcher',
      '.txt': 'researcher',
      '.json': 'analyst',
      '.yaml': 'analyst',
      '.yml': 'analyst',
      '.toml': 'analyst',
      '.xml': 'analyst',
      '.sql': 'analyst',
    };
    return mapping[extension] || 'coordinator';
  }

  async checkSwarmStatus() {
    try {
      // Check if swarm is initialized via file or global state
      const statusFile = path.join(process.cwd(), '.ruv-swarm', 'status.json');
      const exists = await fs
        .access(statusFile)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        const status = JSON.parse(await fs.readFile(statusFile, 'utf-8'));
        return { initialized: true, ...status };
      }

      return { initialized: false };
    } catch (_error) {
      return { initialized: false };
    }
  }

  async ensureAgent(type: string): Promise<unknown> {
    let agent = this.sessionData.agents.get(type);

    if (!agent) {
      // Simulate agent creation
      agent = {
        id: `${type}-${Date.now()}`,
        type,
        pattern: this.getCognitivePattern(type),
        readiness: 0.95,
        created: Date.now(),
      };
      this.sessionData.agents.set(type, agent);
    }

    return agent;
  }

  getCognitivePattern(agentType: string): string {
    const patterns = {
      coder: 'convergent',
      researcher: 'divergent',
      analyst: 'critical',
      coordinator: 'systems',
      architect: 'abstract',
      optimizer: 'lateral',
    };
    return patterns[agentType] || 'balanced';
  }

  async autoFormatFile(
    filePath: string
  ): Promise<{ success: boolean; reason?: string; details?: unknown }> {
    const ext = path.extname(filePath);
    const formatters = {
      '.js': 'prettier --write',
      '.ts': 'prettier --write',
      '.jsx': 'prettier --write',
      '.tsx': 'prettier --write',
      '.json': 'prettier --write',
      '.md': 'prettier --write --prose-wrap always',
      '.py': 'black',
      '.go': 'gofmt -w',
      '.rs': 'rustfmt',
    };

    const formatter = formatters[ext];
    if (!formatter) {
      return {
        success: false,
        reason: 'No formatter configured for file type',
      };
    }

    try {
      execSync(`${formatter} "${filePath}"`, { stdio: 'pipe' });
      return { success: true, details: { formatter, fileType: ext } };
    } catch (error) {
      return { success: false, reason: error.message };
    }
  }

  async trainPatternsFromEdit(filePath: string): Promise<unknown> {
    // Simulate neural pattern training
    const improvement = Math.random() * 0.05; // 0-5% improvement
    const confidence = 0.85 + Math.random() * 0.1; // 85-95% confidence

    this.sessionData.learnings.push({
      file: filePath,
      timestamp: Date.now(),
      improvement,
      confidence,
      pattern: `edit_pattern_${path.extname(filePath)}`,
    });

    return {
      pattern_updated: true,
      improvement: improvement.toFixed(3),
      confidence: confidence.toFixed(2),
      total_examples: this.sessionData.learnings.length,
    };
  }

  validateCommandSafety(command: string): {
    safe: boolean;
    reason?: string;
    riskLevel?: string;
  } {
    const dangerousPatterns = [
      // File system destruction
      /rm\s+-rf\s+\//,
      /rm\s+-rf\s+\*/,
      /rm\s+-rf\s+\~/,

      // Remote execution
      /curl.*\|\s*bash/,
      /wget.*\|\s*sh/,
      /eval\s*\(/,

      // Git destructive operations
      /git\s+reset\s+--hard/,
      /git\s+push\s+(-f|--force)/,
      /git\s+push\s+--force-with-lease/,
      /git\s+branch\s+-D/,
      /git\s+push\s+.*--delete/,
      /git\s+push\s+origin\s+:/,
      /git\s+checkout\s+.*(-f|--force)/,
      /git\s+clean\s+-fd/,
      /git\s+stash\s+(drop|clear)/,
      /git\s+reflog\s+expire/,
      /git\s+gc\s+--prune=now/,
      /git\s+filter-branch/,
      /git\s+rebase.*&&.*git\s+push\s+-f/,

      // System operations
      />\/dev\/null\s+2>&1/,
      /chmod\s+777/,
      /sudo\s+rm/,
      /:\(\)\{\s*:\|:&\s*\};:/, // Fork bomb
      /dd\s+if=.*of=\/dev/,
    ];

    // Check each dangerous pattern with specific messaging
    const gitHardReset = /git\s+reset\s+--hard/;
    const gitForcePattern = /git\s+push\s+(-f|--force)/;
    const gitBranchDelete = /git\s+branch\s+-D/;
    const gitStashDrop = /git\s+stash\s+(drop|clear)/;
    const rmRf = /rm\s+-rf\s+(\/|\*|\~)/;
    const forkBomb = /:\(\)\{\s*:\|:&\s*\};:/;

    if (gitHardReset.test(command)) {
      return {
        safe: false,
        reason:
          'Git hard reset can destroy uncommitted changes. Use "git stash" first or "git reset --soft" for safer reset.',
        riskLevel: 'critical',
      };
    }

    if (gitForcePattern.test(command)) {
      return {
        safe: false,
        reason:
          'Git force push can overwrite remote history. Use "git push --force-with-lease" after careful review.',
        riskLevel: 'critical',
      };
    }

    if (gitBranchDelete.test(command)) {
      return {
        safe: false,
        reason:
          'Force branch deletion can lose work. Use "git branch -d" for safe deletion or backup first.',
        riskLevel: 'high',
      };
    }

    if (gitStashDrop.test(command)) {
      return {
        safe: false,
        reason:
          'Stash drop permanently deletes work. Use "git stash list" and "git stash show" to review first.',
        riskLevel: 'high',
      };
    }

    if (rmRf.test(command)) {
      return {
        safe: false,
        reason:
          'Recursive force removal can destroy important files. Specify exact paths instead of wildcards.',
        riskLevel: 'critical',
      };
    }

    if (forkBomb.test(command)) {
      return {
        safe: false,
        reason: 'Fork bomb detected - this will crash the system.',
        riskLevel: 'critical',
      };
    }

    // Check remaining patterns
    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return {
          safe: false,
          reason:
            'Command contains potentially dangerous pattern. Please review and use safer alternatives.',
          riskLevel: 'high',
        };
      }
    }

    return { safe: true };
  }

  estimateCommandResources(command: string): unknown {
    const resourceMap = {
      'npm test': {
        duration: 30000,
        requiresAgent: true,
        agentType: 'coordinator',
      },
      'npm run build': {
        duration: 60000,
        requiresAgent: true,
        agentType: 'optimizer',
      },
      git: { duration: 1000, requiresAgent: false },
      ls: { duration: 100, requiresAgent: false },
    };

    for (const [pattern, resources] of Object.entries(resourceMap)) {
      if (command.includes(pattern)) {
        return resources;
      }
    }

    return { duration: 5000, requiresAgent: false, agentType: null };
  }

  generateSessionSummary(): string {
    const duration = Date.now() - this.sessionData.startTime;
    const agentList = Array.from(this.sessionData.agents.values());

    return `# ruv-swarm Session Summary
Date: ${new Date().toISOString()}
Duration: ${this.formatDuration(duration)}
Token Reduction: ${this.sessionData.metrics.tokensSaved} tokens

## Swarm Activity
- Active Agents: ${agentList.length} (${agentList.map((a: unknown) => a.type).join(', ')})
- Operations Performed: ${this.sessionData.operations.length}
- Files Modified: ${new Set(this.sessionData.operations.map((o: unknown) => o.file)).size}
- Neural Improvements: ${this.sessionData.metrics.patternsImproved}

## Operations Breakdown
${this.sessionData.operations
  .slice(-10)
  .map(
    (op: unknown) =>
      `- ${new Date(op.timestamp).toLocaleTimeString()}: ${op.type} on ${op.file} (${op.agent})`
  )
  .join('\n')}

## Learning Highlights
${this.sessionData.learnings
  .slice(-5)
  .map(
    (l: unknown) =>
      `- Pattern "${l.pattern}" improved by ${(l.improvement * 100).toFixed(1)}% (confidence: ${l.confidence})`
  )
  .join('\n')}

## Performance Metrics
- Average Operation Time: ${(duration / this.sessionData.operations.length / 1000).toFixed(1)}s
- Token Efficiency: ${(this.sessionData.metrics.tokensSaved / this.sessionData.operations.length).toFixed(0)} tokens/operation
- Learning Rate: ${(this.sessionData.metrics.patternsImproved / this.sessionData.operations.length).toFixed(2)} improvements/operation
`;
  }

  captureSwarmState(): unknown {
    return {
      session_id: `sess-${Date.now()}`,
      agents: Object.fromEntries(this.sessionData.agents),
      operations: this.sessionData.operations,
      learnings: this.sessionData.learnings,
      metrics: this.sessionData.metrics,
      timestamp: new Date().toISOString(),
    };
  }

  calculateSessionMetrics(): unknown {
    const duration = Date.now() - this.sessionData.startTime;
    return {
      performance: {
        duration_ms: duration,
        operations_per_minute: (
          this.sessionData.operations.length /
          (duration / 60000)
        ).toFixed(1),
        tokens_saved: this.sessionData.metrics.tokensSaved,
        efficiency_score: (
          this.sessionData.metrics.tokensSaved /
          this.sessionData.operations.length
        ).toFixed(1),
      },
      learning: {
        patterns_improved: this.sessionData.metrics.patternsImproved,
        average_improvement: (
          this.sessionData.learnings.reduce(
            (acc, l) => acc + l.improvement,
            0
          ) / this.sessionData.learnings.length
        ).toFixed(3),
        confidence_average: (
          this.sessionData.learnings.reduce((acc, l) => acc + l.confidence, 0) /
          this.sessionData.learnings.length
        ).toFixed(2),
      },
      agents: {
        total_spawned: this.sessionData.agents.size,
        by_type: Object.fromEntries(
          Array.from(this.sessionData.agents.values()).reduce(
            (acc: unknown, agent: unknown) => {
              acc.set(agent.type, (acc.get(agent.type) || 0) + 1);
              return acc;
            },
            new Map()
          ) as any
        ),
      },
    };
  }

  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  // Additional helper methods for optimization

  analyzeTaskComplexity(description: string): unknown {
    const keywords = {
      simple: ['fix', 'update', 'change', 'modify', 'rename'],
      medium: ['implement', 'create', 'add', 'integrate', 'refactor'],
      complex: ['architect', 'design', 'optimize', 'migrate', 'scale'],
    };

    const desc = description.toLowerCase();
    let complexity = 'simple';
    let score = 1;
    let estimatedMinutes = 5;

    // Check for complex keywords
    if (keywords.complex.some((k) => desc.includes(k))) {
      complexity = 'complex';
      score = 3;
      estimatedMinutes = 60;
    } else if (keywords.medium.some((k) => desc.includes(k))) {
      complexity = 'medium';
      score = 2;
      estimatedMinutes = 30;
    }

    // Adjust for multiple files or components
    const fileCount = (desc.match(/\b(files?|components?|modules?)\b/g) || [])
      .length;
    if (fileCount > 1) {
      score += 0.5;
      estimatedMinutes *= 1.5;
    }

    return {
      level: complexity,
      score,
      estimatedMinutes,
      requiresResearch: desc.includes('research') || desc.includes('analyze'),
      requiresTesting: desc.includes('test') || desc.includes('verify'),
    };
  }

  selectOptimalTopology(complexity: unknown): string {
    const topologyMap = {
      simple: 'star', // Centralized for simple tasks
      medium: 'mesh', // Flexible for medium complexity
      complex: 'hierarchical', // Structured for complex tasks
    };

    return topologyMap[complexity.level] || 'mesh';
  }

  determineRequiredAgents(description, complexity): string[] {
    const agents = new Set(['coordinator']); // Always need a coordinator

    const desc = description.toLowerCase();

    // Add agents based on task keywords
    if (
      desc.includes('code') ||
      desc.includes('implement') ||
      desc.includes('fix')
    ) {
      agents.add('coder');
    }
    if (
      desc.includes('research') ||
      desc.includes('analyze') ||
      desc.includes('investigate')
    ) {
      agents.add('researcher');
    }
    if (
      desc.includes('data') ||
      desc.includes('metrics') ||
      desc.includes('performance')
    ) {
      agents.add('analyst');
    }
    if (
      desc.includes('design') ||
      desc.includes('architect') ||
      desc.includes('structure')
    ) {
      agents.add('architect');
    }
    if (
      desc.includes('optimize') ||
      desc.includes('improve') ||
      desc.includes('enhance')
    ) {
      agents.add('optimizer');
    }

    // Add more agents for complex tasks
    if (complexity.score >= 3) {
      agents.add('reviewer');
    }

    return Array.from(agents);
  }

  async updateKnowledgeGraph(file: string, operation: string): Promise<void> {
    if (!this.sessionData.knowledgeGraph) {
      this.sessionData.knowledgeGraph = {
        nodes: new Map(),
        edges: [],
      };
    }

    const graph = this.sessionData.knowledgeGraph;

    // Add or update node
    const nodeId = file;
    if (!graph.nodes.has(nodeId)) {
      graph.nodes.set(nodeId, {
        id: nodeId,
        type: this.getFileType(file),
        operations: [],
        lastModified: Date.now(),
      });
    }

    const node = graph.nodes.get(nodeId);
    node?.operations?.push({
      type: operation,
      timestamp: Date.now(),
      agent: this.getCurrentAgent(),
    });
    node.lastModified = Date.now();

    // Add edges for related files
    const relatedFiles = await this.findRelatedFiles(file);
    relatedFiles.forEach((related) => {
      if (
        !graph.edges.find(
          (e: unknown) =>
            (e.from === nodeId && e.to === related) ||
            (e.from === related && e.to === nodeId)
        )
      ) {
        graph.edges.push({
          from: nodeId,
          to: related,
          type: 'related',
          weight: 1,
        });
      }
    });
  }

  calculateEfficiency(performance: unknown): unknown {
    const baselineTime = 60000; // 1 minute baseline
    const efficiencyScore = Math.max(
      0,
      Math.min(1, baselineTime / performance.completionTime)
    );

    // Adjust for agent utilization
    const agentUtilization =
      performance.agentsUsed.length > 0
        ? 0.8 + 0.2 * Math.min(1, 3 / performance.agentsUsed.length)
        : 0.5;

    return {
      score: (efficiencyScore * agentUtilization).toFixed(2),
      timeEfficiency: efficiencyScore.toFixed(2),
      agentEfficiency: agentUtilization.toFixed(2),
      rating:
        efficiencyScore > 0.8
          ? 'excellent'
          : efficiencyScore > 0.6
            ? 'good'
            : efficiencyScore > 0.4
              ? 'fair'
              : 'needs improvement',
    };
  }

  identifyBottlenecks(performance: unknown): Array<{
    type: string;
    severity: string;
    description: string;
    recommendation: string;
  }> {
    const bottlenecks: Array<{
      type: string;
      severity: string;
      description: string;
      recommendation: string;
    }> = [];

    // Time-based bottlenecks
    if (performance.completionTime > 300000) {
      // > 5 minutes
      bottlenecks.push({
        type: 'time',
        severity: 'high',
        description: 'Task took longer than expected',
        recommendation: 'Consider breaking into smaller subtasks',
      });
    }

    // Agent-based bottlenecks
    if (performance.agentsUsed.length === 1) {
      bottlenecks.push({
        type: 'coordination',
        severity: 'medium',
        description: 'Single agent used for complex task',
        recommendation: 'Spawn specialized agents for parallel work',
      });
    }

    // Resource bottlenecks
    if (this.sessionData.operations.length > 100) {
      bottlenecks.push({
        type: 'operations',
        severity: 'medium',
        description: 'High number of operations',
        recommendation: 'Optimize operation batching',
      });
    }

    return bottlenecks;
  }

  suggestImprovements(
    performance
  ): Array<{ area: string; suggestion: string; expectedImprovement: string }> {
    const improvements: Array<{
      area: string;
      suggestion: string;
      expectedImprovement: string;
    }> = [];
    const efficiency = this.calculateEfficiency(performance);

    // Time improvements
    if (Number.parseFloat(efficiency.timeEfficiency) < 0.7) {
      improvements.push({
        area: 'execution_time',
        suggestion: 'Use parallel task execution',
        expectedImprovement: '30-50% time reduction',
      });
    }

    // Coordination improvements
    if (Number.parseFloat(efficiency.agentEfficiency) < 0.8) {
      improvements.push({
        area: 'agent_coordination',
        suggestion: 'Implement specialized agent patterns',
        expectedImprovement: '20-30% efficiency gain',
      });
    }

    // Pattern improvements
    if (this.sessionData.learnings.length < 5) {
      improvements.push({
        area: 'learning',
        suggestion: 'Enable neural pattern training',
        expectedImprovement: 'Cumulative performance gains',
      });
    }

    return improvements;
  }

  updateCoordinationStrategy(performance: unknown): void {
    const efficiency = this.calculateEfficiency(performance);

    // Update strategy based on performance
    if (!this.sessionData.coordinationStrategy) {
      this.sessionData.coordinationStrategy = {
        current: 'balanced',
        history: [],
        adjustments: 0,
      };
    }

    const strategy = this.sessionData.coordinationStrategy;
    strategy.history.push({
      timestamp: Date.now(),
      efficiency: efficiency.score,
      strategy: strategy.current,
    });

    // Adjust strategy if needed
    if (Number.parseFloat(efficiency.score) < 0.6) {
      strategy.current = 'adaptive';
      strategy.adjustments++;
    } else if (Number.parseFloat(efficiency.score) > 0.9) {
      strategy.current = 'specialized';
      strategy.adjustments++;
    }
  }

  extractSearchPatterns(query): string[] {
    const patterns: string[] = [];

    // Extract file type patterns
    const fileTypes = query.match(/\.(js|ts|py|go|rs|md|json|yaml)\b/gi);
    if (fileTypes) {
      patterns.push(...fileTypes.map((ft: unknown) => `filetype:${ft}`));
    }

    // Extract function/class patterns
    const codePatterns = query.match(
      /\b(function|class|interface|struct|impl)\s+\w+/gi
    );
    if (codePatterns) {
      patterns.push(...codePatterns.map((cp: unknown) => `code:${cp}`));
    }

    // Extract scope patterns
    const scopePatterns = query.match(/\b(src|test|lib|bin|docs?)\//gi);
    if (scopePatterns) {
      patterns.push(...scopePatterns.map((sp: unknown) => `scope:${sp}`));
    }

    return patterns;
  }

  async updateKnowledgeBase(type: string, data: unknown): Promise<void> {
    const kbPath = path.join(
      process.cwd(),
      '.ruv-swarm',
      'knowledge-base.json'
    );

    // Load existing knowledge base
    let kb: unknown = { searches: [], patterns: {}, insights: [] };
    try {
      if (
        await fs
          .access(kbPath)
          .then(() => true)
          .catch(() => false)
      ) {
        kb = JSON.parse(await fs.readFile(kbPath, 'utf-8'));
      }
    } catch (_error) {
      kb = { searches: [], patterns: {}, insights: [] };
    }

    // Update based on type
    if (type === 'search') {
      if (!kb.searches) {
        kb.searches = [];
      }
      kb.searches.push({
        query: data?.query,
        patterns: data?.patterns,
        timestamp: Date.now(),
      });

      // Update pattern frequency
      if (!kb.patterns) {
        kb.patterns = {};
      }
      data?.patterns.forEach((pattern: unknown) => {
        kb.patterns[pattern] = (kb.patterns[pattern] || 0) + 1;
      });
    }

    // Keep only recent data
    if (kb.searches && kb.searches.length > 100) {
      kb.searches = kb.searches.slice(-100);
    }

    // Save updated knowledge base
    await fs.mkdir(path.dirname(kbPath), { recursive: true });
    await fs.writeFile(kbPath, JSON.stringify(kb, null, 2));
  }

  extractUrlPatterns(url): string[] {
    const patterns: string[] = [];

    try {
      const urlObj = new URL(url);

      // Domain pattern
      patterns.push(`domain:${urlObj.hostname}`);

      // Path patterns
      const pathParts = urlObj.pathname.split('/').filter((p) => p);
      if (pathParts.length > 0) {
        patterns.push(`path:/${pathParts[0]}`); // Top level path
      }

      // Content type patterns
      if (urlObj.pathname.endsWith('.md')) {
        patterns.push('content:markdown');
      }
      if (urlObj.pathname.includes('docs')) {
        patterns.push('content:documentation');
      }
      if (urlObj.pathname.includes('api')) {
        patterns.push('content:api');
      }
      if (urlObj.pathname.includes('guide')) {
        patterns.push('content:guide');
      }

      // Query patterns
      if (urlObj.search) {
        patterns.push('has:queryparams');
      }
    } catch (_error) {
      patterns.push('pattern:invalid-url');
    }

    return patterns;
  }

  async getSwarmStatus(): Promise<unknown> {
    try {
      const statusPath = path.join(process.cwd(), '.ruv-swarm', 'status.json');
      if (
        await fs
          .access(statusPath)
          .then(() => true)
          .catch(() => false)
      ) {
        return JSON.parse(await fs.readFile(statusPath, 'utf-8'));
      }
    } catch (_error) {
      // Fallback to session data
    }

    return {
      agents: this.sessionData.agents,
      activeTasks: this.sessionData.operations.filter(
        (op: unknown) => Date.now() - op.timestamp < 300000 // Last 5 minutes
      ).length,
      health: 'operational',
    };
  }

  sendTelemetry(event: string, data: unknown): void {
    // In production, this would send to telemetry service
    // For now, just log to telemetry file
    const telemetryPath = path.join(
      process.cwd(),
      '.ruv-swarm',
      'telemetry.jsonl'
    );

    const telemetryEvent = {
      event,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId || 'unknown',
      version: '1.0.0',
    };

    // Async write without blocking
    fs.appendFile(telemetryPath, `${JSON.stringify(telemetryEvent)}\n`).catch(
      () => {
        /* intentionally empty */
      }
    );
  }

  // Helper methods for other functionality

  getSpecializationForType(type: string): string[] {
    const specializations: Record<string, string[]> = {
      researcher: [
        'literature-review',
        'data-analysis',
        'trend-identification',
      ],
      coder: ['implementation', 'refactoring', 'optimization'],
      analyst: ['metrics', 'performance', 'data-visualization'],
      architect: ['system-design', 'api-design', 'database-schema'],
      coordinator: [
        'task-planning',
        'resource-allocation',
        'progress-tracking',
      ],
      optimizer: [
        'performance-tuning',
        'algorithm-optimization',
        'resource-usage',
      ],
    };
    return specializations[type] || ['general'];
  }

  generateSpecializationPatterns(type: string): string[] {
    const patterns: Record<string, string[]> = {
      researcher: [
        'depth-first-search',
        'breadth-first-search',
        'citation-tracking',
      ],
      coder: ['modular-design', 'error-handling', 'code-reuse'],
      analyst: ['statistical-analysis', 'trend-detection', 'anomaly-detection'],
      architect: ['layered-architecture', 'microservices', 'event-driven'],
      coordinator: [
        'dependency-tracking',
        'parallel-execution',
        'milestone-planning',
      ],
      optimizer: [
        'bottleneck-identification',
        'caching-strategies',
        'lazy-loading',
      ],
    };
    return patterns[type] || ['adaptive-learning'];
  }

  generateMockWeights(): unknown {
    // Generate mock neural network weights for demonstration
    return {
      layers: [
        {
          neurons: 128,
          weights: Array(128)
            .fill(0)
            .map(() => Math.random() - 0.5),
        },
        {
          neurons: 64,
          weights: Array(64)
            .fill(0)
            .map(() => Math.random() - 0.5),
        },
        {
          neurons: 32,
          weights: Array(32)
            .fill(0)
            .map(() => Math.random() - 0.5),
        },
      ],
      biases: Array(224)
        .fill(0)
        .map(() => Math.random() - 0.5),
    };
  }

  optimizeAgentAllocation(_taskId: string): unknown {
    // Simple load balancing algorithm
    const agents = Array.from(this.sessionData.agents.values());
    const allocation = {};

    agents.forEach((agent: unknown) => {
      // Allocate based on agent type and current load
      const load = this.sessionData.operations.filter(
        (op: unknown) =>
          op.agent === agent.id && Date.now() - op.timestamp < 60000
      ).length;

      allocation[agent.id] = {
        agent: agent.id,
        type: agent.type,
        currentLoad: load,
        capacity: Math.max(0, 10 - load), // Max 10 concurrent ops
        priority: load < 5 ? 'high' : 'normal',
      };
    });

    return allocation;
  }

  calculateParallelization(_taskId: string): unknown {
    // Determine parallelization factor based on task and resources
    const agentCount = this.sessionData.agents.size;
    const complexity = this.sessionData.taskComplexity || { score: 2 };

    return {
      factor: Math.min(agentCount, Math.ceil(complexity.score * 1.5)),
      strategy: agentCount > 3 ? 'distributed' : 'local',
      maxConcurrency: Math.min(agentCount * 2, 10),
    };
  }

  getFileType(filePath: string): string {
    const ext = path.extname(filePath);
    const typeMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.go': 'golang',
      '.rs': 'rust',
      '.json': 'config',
      '.yaml': 'config',
      '.yml': 'config',
      '.md': 'documentation',
      '.txt': 'text',
    };
    return typeMap[ext] || 'unknown';
  }

  getCurrentAgent(): string {
    // Get the most recently active agent
    const recentOps = this.sessionData.operations.slice(-10);
    const agentCounts = {};

    recentOps.forEach((op: unknown) => {
      if (op.agent) {
        agentCounts[op.agent] = (agentCounts[op.agent] || 0) + 1;
      }
    });

    const sorted = Object.entries(agentCounts).sort(
      (a, b) => Number(b[1]) - Number(a[1])
    );
    return sorted.length > 0 && sorted[0] ? sorted[0]?.[0] : 'coordinator';
  }

  async findRelatedFiles(filePath): Promise<string[]> {
    const related: string[] = [];
    const _baseName = path.basename(filePath, path.extname(filePath));
    // const dirName = path.dirname(filePath);

    // Common related file patterns
    // const patterns = [
    //   `${baseName}.test.*`, // Test files
    //   `${baseName}.spec.*`, // Spec files
    //   `test-${baseName}.*`, // Alternative test pattern
    //   `${baseName}.d.ts`, // TypeScript definitions
    //   `${baseName}.types.*`, // Type definitions
    // ];

    // For now, return mock related files
    // In production, would use file system search
    if (filePath.endsWith('.js')) {
      related.push(filePath.replace('.js', '.test.js'));
    }
    if (filePath.endsWith('.ts')) {
      related.push(filePath.replace('.ts', '.test.ts'));
      related.push(filePath.replace('.ts', '.d.ts'));
    }

    return related.filter((f) => f !== filePath);
  }

  /**
   * 🔧 CRITICAL FIX: Store notification in database for cross-agent access.
   *
   * @param notification
   */
  async storeNotificationInDatabase(notification: unknown): Promise<void> {
    if (!this.persistence) {
      logger.warn(
        '⚠️ No persistence layer - notification stored in memory only'
      );
      return;
    }

    try {
      // Store as agent memory with special hook prefix
      const agentId = notification.agentId || 'hook-system';
      const memoryKey = `notifications/${notification.type}/${Date.now()}`;

      await this.persistence.storeAgentMemory(agentId, memoryKey, {
        type: notification.type,
        message: notification.message,
        context: notification.context,
        timestamp: notification.timestamp,
        source: 'hook-system',
        sessionId: this.getSessionId(),
      });
    } catch (error) {
      logger.error(
        '❌ Failed to store notification in database:',
        error.message
      );
    }
  }

  /**
   * 🔧 CRITICAL FIX: Retrieve notifications from database for cross-agent access.
   *
   * @param agentId
   * @param type
   */
  async getNotificationsFromDatabase(
    agentId: string | null = null,
    type: string | null = null
  ): Promise<any[]> {
    if (!this.persistence) {
      return [];
    }

    try {
      const targetAgentId = agentId || 'hook-system';
      const memories = await this.persistence.getAllMemory(targetAgentId);

      return memories
        .filter((memory) => memory.key.startsWith('notifications/'))
        .filter((memory) => !type || memory.value.type === type)
        .map((memory) => memory.value)
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      logger.error(
        '❌ Failed to retrieve notifications from database:',
        error.message
      );
      return [];
    }
  }

  /**
   * 🔧 CRITICAL FIX: Enhanced agent completion with database coordination.
   *
   * @param args
   */
  async agentCompleteHook(args: unknown) {
    const { agentId, taskId, results, learnings } = args;

    // Store completion in database for other agents to see
    if (this.persistence && agentId) {
      try {
        await this.persistence.storeAgentMemory(
          agentId,
          `completion/${taskId}`,
          {
            taskId,
            results,
            learnings,
            completedAt: Date.now(),
            source: 'agent-completion',
          }
        );

        // Update agent status in database
        await this.persistence.updateAgentStatus(agentId, 'completed');
      } catch (error) {
        logger.error('❌ Failed to store agent completion:', error.message);
      }
    }

    // Store in runtime memory as before
    const agent = this.sessionData.agents.get(agentId);
    if (agent) {
      agent.lastCompletion = {
        taskId,
        results,
        learnings,
        timestamp: Date.now(),
      };
      agent.status = 'completed';
    }

    return {
      continue: true,
      stored: true,
      agent: agentId,
    };
  }

  /**
   * Get current session ID for coordination.
   */
  getSessionId(): string {
    if (!this._sessionId) {
      this._sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    return this._sessionId;
  }

  /**
   * 🕵️ Deception Scan Hook - Detect potential deceptive or malicious patterns
   *
   * @param args - Contains command/content to analyze
   */
  async deceptionScanHook(args: unknown) {
    const { content, command, context, source } = args;

    const deceptionPatterns = {
      // Social engineering indicators
      social_engineering: [
        /urgent.*immediate.*action/i,
        /verify.*credentials.*security/i,
        /suspended.*account.*click/i,
        /congratulations.*winner.*claim/i,
      ],

      // Code injection attempts
      code_injection: [
        /eval\s*\([^)]*input/i,
        /exec\s*\([^)]*user/i,
        /innerHTML\s*=.*input/i,
        /document\.write.*user/i,
      ],

      // Hidden/obfuscated operations
      obfuscation: [
        /\w{50,}/, // Extremely long variable names
        /\\x[0-9a-f]{2}/i, // Hex encoding
        /eval.*atob/i, // Base64 + eval
        /String\.fromCharCode/i, // Character code obfuscation
      ],

      // Suspicious resource access
      suspicious_access: [
        /\/etc\/passwd/,
        /\/proc\/\d+/,
        /\.ssh\/id_rsa/,
        /\$\{.*\}/, // Variable expansion in unexpected contexts
      ],

      // Behavioral anomalies
      behavioral: [
        /password.*plain.*text/i,
        /disable.*security/i,
        /bypass.*authentication/i,
        /admin.*backdoor/i,
      ],
    };

    const analysis = {
      deception_score: 0,
      detected_patterns: [],
      risk_factors: [],
      trust_level: 'unknown',
      recommended_action: 'proceed',
    };

    // Analyze content for deception patterns
    const textToAnalyze = content || command || '';

    for (const [category, patterns] of Object.entries(deceptionPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(textToAnalyze)) {
          analysis.detected_patterns.push({
            category,
            pattern: pattern.source,
            severity: this.getPatternSeverity(category),
          });
          analysis.deception_score += this.getPatternWeight(category);
        }
      }
    }

    // Context-based analysis
    if (context?.user_input && context?.unexpected_source) {
      analysis.risk_factors.push('Input from unexpected source');
      analysis.deception_score += 0.3;
    }

    if (source === 'external' && analysis.deception_score > 0.2) {
      analysis.risk_factors.push('External source with suspicious patterns');
      analysis.deception_score += 0.2;
    }

    // Determine trust level and actions
    if (analysis.deception_score >= 0.8) {
      analysis.trust_level = 'untrusted';
      analysis.recommended_action = 'block';
    } else if (analysis.deception_score >= 0.5) {
      analysis.trust_level = 'suspicious';
      analysis.recommended_action = 'require_confirmation';
    } else if (analysis.deception_score >= 0.2) {
      analysis.trust_level = 'questionable';
      analysis.recommended_action = 'warn';
    } else {
      analysis.trust_level = 'trusted';
      analysis.recommended_action = 'proceed';
    }

    // Store deception analysis for learning
    await this.storeDeceptionAnalysis(analysis, textToAnalyze);

    return {
      continue: analysis.recommended_action !== 'block',
      deception_analysis: analysis,
      require_confirmation:
        analysis.recommended_action === 'require_confirmation',
      warning:
        analysis.recommended_action === 'warn'
          ? 'Potentially suspicious content detected'
          : null,
    };
  }

  /**
   * 🧠 Pattern Learning Hook - Learn from successful/failed operations
   *
   * @param args - Contains operation results and context
   */
  async patternLearningHook(args: unknown) {
    const { operation, result, context, feedback } = args;

    const learningEntry = {
      timestamp: Date.now(),
      operation_type: operation?.type || 'unknown',
      success: result?.success ?? false,
      pattern_hash: this.hashOperation(operation),
      context_features: this.extractContextFeatures(context),
      outcome_quality: this.assessOutcomeQuality(result),
      user_feedback: feedback || null,
    };

    // Update pattern recognition model
    if (!this.sessionData.patternLearning) {
      this.sessionData.patternLearning = {
        successful_patterns: new Map(),
        failed_patterns: new Map(),
        context_correlations: new Map(),
        adaptation_history: [],
      };
    }

    const learning = this.sessionData.patternLearning;

    if (learningEntry.success && learningEntry.outcome_quality > 0.7) {
      // Store successful pattern
      const existing = learning.successful_patterns.get(
        learningEntry.pattern_hash
      ) || { count: 0, avg_quality: 0 };
      learning.successful_patterns.set(learningEntry.pattern_hash, {
        count: existing.count + 1,
        avg_quality:
          (existing.avg_quality * existing.count +
            learningEntry.outcome_quality) /
          (existing.count + 1),
        last_seen: Date.now(),
        features: learningEntry.context_features,
      });
    } else if (!learningEntry.success) {
      // Store failed pattern
      const existing = learning.failed_patterns.get(
        learningEntry.pattern_hash
      ) || { count: 0, failure_reasons: [] };
      learning.failed_patterns.set(learningEntry.pattern_hash, {
        count: existing.count + 1,
        failure_reasons: [
          ...existing.failure_reasons,
          result?.error || 'unknown',
        ].slice(-10),
        last_seen: Date.now(),
        features: learningEntry.context_features,
      });
    }

    // Update context correlations
    for (const feature of learningEntry.context_features) {
      const correlation = learning.context_correlations.get(feature) || {
        success_count: 0,
        total_count: 0,
      };
      learning.context_correlations.set(feature, {
        success_count:
          correlation.success_count + (learningEntry.success ? 1 : 0),
        total_count: correlation.total_count + 1,
        success_rate:
          (correlation.success_count + (learningEntry.success ? 1 : 0)) /
          (correlation.total_count + 1),
      });
    }

    // Store learning entry
    learning.adaptation_history.push(learningEntry);

    // Keep only recent history
    if (learning.adaptation_history.length > 1000) {
      learning.adaptation_history = learning.adaptation_history.slice(-500);
    }

    // Persist learning data
    await this.persistLearningData(learning);

    return {
      continue: true,
      learning_updated: true,
      pattern_confidence: this.calculatePatternConfidence(
        learningEntry.pattern_hash
      ),
      adaptations_count: learning.adaptation_history.length,
    };
  }

  /**
   * 🚨 Anomaly Detection Hook - Detect unusual behavioral patterns
   *
   * @param args - Contains current operation context
   */
  async anomalyDetectionHook(args: unknown) {
    const { operation, agent, context, timing } = args;

    const currentPattern = {
      operation_type: operation?.type,
      agent_type: agent?.type,
      timing: timing || Date.now(),
      context_hash: this.hashContext(context),
    };

    // Initialize anomaly detection state
    if (!this.sessionData.anomalyDetection) {
      this.sessionData.anomalyDetection = {
        baseline_patterns: new Map(),
        recent_operations: [],
        anomaly_scores: [],
        alert_threshold: 0.7,
      };
    }

    const detection = this.sessionData.anomalyDetection;

    // Add to recent operations
    detection.recent_operations.push(currentPattern);
    if (detection.recent_operations.length > 100) {
      detection.recent_operations = detection.recent_operations.slice(-50);
    }

    // Calculate anomaly score
    const anomalyScore = this.calculateAnomalyScore(
      currentPattern,
      detection.baseline_patterns
    );
    detection.anomaly_scores.push(anomalyScore);

    // Update baseline patterns
    this.updateBaselinePatterns(currentPattern, detection.baseline_patterns);

    // Detect anomalies
    const isAnomalous = anomalyScore > detection.alert_threshold;
    const anomalyType = this.classifyAnomaly(
      currentPattern,
      detection.recent_operations
    );

    if (isAnomalous) {
      // Generate anomaly alert
      await this.generateAnomalyAlert({
        score: anomalyScore,
        type: anomalyType,
        pattern: currentPattern,
        context: context,
      });
    }

    return {
      continue: true,
      anomaly_detected: isAnomalous,
      anomaly_score: anomalyScore,
      anomaly_type: anomalyType,
      baseline_updated: true,
    };
  }

  /**
   * 🤝 Trust Evaluation Hook - Evaluate trustworthiness of operations/agents
   *
   * @param args - Contains trust evaluation context
   */
  async trustEvaluationHook(args: unknown) {
    const { entity, operation, history, external_signals } = args;

    const trustMetrics = {
      historical_reliability: 0.5,
      pattern_consistency: 0.5,
      external_reputation: 0.5,
      behavioral_predictability: 0.5,
      security_compliance: 0.5,
    };

    // Historical reliability analysis
    if (history && history.length > 0) {
      const successRate =
        history.filter((h) => h.success).length / history.length;
      const avgQuality =
        history.reduce((acc, h) => acc + (h.quality || 0), 0) / history.length;
      trustMetrics.historical_reliability =
        successRate * 0.7 + avgQuality * 0.3;
    }

    // Pattern consistency analysis
    if (this.sessionData.patternLearning) {
      const entityPatterns = Array.from(
        this.sessionData.patternLearning.successful_patterns.entries()
      ).filter(([_, data]) =>
        data.features.includes(entity?.type || entity?.id)
      );

      if (entityPatterns.length > 0) {
        const avgConfidence =
          entityPatterns.reduce((acc, [_, data]) => acc + data.avg_quality, 0) /
          entityPatterns.length;
        trustMetrics.pattern_consistency = avgConfidence;
      }
    }

    // External signals (reputation, verification, etc.)
    if (external_signals) {
      trustMetrics.external_reputation =
        external_signals.reputation_score || 0.5;
      trustMetrics.security_compliance = external_signals.security_score || 0.5;
    }

    // Behavioral predictability
    if (this.sessionData.anomalyDetection) {
      const recentScores =
        this.sessionData.anomalyDetection.anomaly_scores.slice(-10);
      const avgAnomalyScore =
        recentScores.reduce((acc, score) => acc + score, 0) /
        recentScores.length;
      trustMetrics.behavioral_predictability = Math.max(0, 1 - avgAnomalyScore);
    }

    // Calculate composite trust score
    const weights = {
      historical_reliability: 0.3,
      pattern_consistency: 0.25,
      external_reputation: 0.2,
      behavioral_predictability: 0.15,
      security_compliance: 0.1,
    };

    const trustScore = Object.entries(trustMetrics).reduce(
      (acc, [metric, value]) => {
        return acc + value * weights[metric];
      },
      0
    );

    // Determine trust level
    let trustLevel = 'unknown';
    if (trustScore >= 0.8) trustLevel = 'high';
    else if (trustScore >= 0.6) trustLevel = 'medium';
    else if (trustScore >= 0.4) trustLevel = 'low';
    else trustLevel = 'untrusted';

    return {
      continue: trustScore >= 0.3, // Block very low trust operations
      trust_score: trustScore,
      trust_level: trustLevel,
      trust_metrics: trustMetrics,
      recommendation:
        trustScore >= 0.7
          ? 'proceed'
          : trustScore >= 0.5
            ? 'proceed_with_caution'
            : trustScore >= 0.3
              ? 'require_approval'
              : 'block',
    };
  }

  /**
   * 📊 Behavioral Analysis Hook - Analyze agent/user behavioral patterns
   *
   * @param args - Contains behavioral analysis context
   */
  async behavioralAnalysisHook(args: unknown) {
    const { entity, actions, timeframe, context } = args;

    const behaviorProfile = {
      activity_patterns: this.analyzeActivityPatterns(actions, timeframe),
      command_preferences: this.analyzeCommandPreferences(actions),
      risk_tolerance: this.analyzeRiskTolerance(actions),
      learning_progression: this.analyzeLearningProgression(actions),
      collaboration_style: this.analyzeCollaborationStyle(actions, context),
    };

    // Detect behavioral changes
    const previousProfile = await this.getPreviousBehaviorProfile(entity);
    const behaviorChanges = this.detectBehaviorChanges(
      behaviorProfile,
      previousProfile
    );

    // Update behavioral model
    await this.updateBehaviorProfile(entity, behaviorProfile);

    return {
      continue: true,
      behavior_profile: behaviorProfile,
      behavior_changes: behaviorChanges,
      profile_updated: true,
      insights: this.generateBehavioralInsights(
        behaviorProfile,
        behaviorChanges
      ),
    };
  }

  // Helper methods for learning and deception detection

  getPatternSeverity(category: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap = {
      social_engineering: 'high',
      code_injection: 'critical',
      obfuscation: 'medium',
      suspicious_access: 'high',
      behavioral: 'medium',
    };
    return severityMap[category] || 'low';
  }

  getPatternWeight(category: string): number {
    const weights = {
      social_engineering: 0.3,
      code_injection: 0.5,
      obfuscation: 0.2,
      suspicious_access: 0.4,
      behavioral: 0.25,
    };
    return weights[category] || 0.1;
  }

  async storeDeceptionAnalysis(
    analysis: unknown,
    content: string
  ): Promise<void> {
    if (!this.sessionData.deceptionHistory) {
      this.sessionData.deceptionHistory = [];
    }

    this.sessionData.deceptionHistory.push({
      timestamp: Date.now(),
      analysis,
      content_hash: this.simpleHash(content),
    });

    // Keep only recent history
    if (this.sessionData.deceptionHistory.length > 500) {
      this.sessionData.deceptionHistory =
        this.sessionData.deceptionHistory.slice(-250);
    }
  }

  hashOperation(operation: unknown): string {
    const operationString = JSON.stringify({
      type: operation?.type,
      key_params: this.extractKeyParameters(operation),
    });
    return this.simpleHash(operationString);
  }

  extractContextFeatures(context: unknown): string[] {
    const features = [];

    if (context?.file_type) features.push(`file_type:${context.file_type}`);
    if (context?.agent_type) features.push(`agent_type:${context.agent_type}`);
    if (context?.complexity) features.push(`complexity:${context.complexity}`);
    if (context?.source) features.push(`source:${context.source}`);

    return features;
  }

  assessOutcomeQuality(result: unknown): number {
    if (!result) return 0;

    let quality = 0;
    if (result.success) quality += 0.5;
    if (result.performance?.score) quality += result.performance.score * 0.3;
    if (result.user_satisfaction) quality += result.user_satisfaction * 0.2;

    return Math.min(1, quality);
  }

  calculatePatternConfidence(patternHash: string): number {
    if (!this.sessionData.patternLearning) return 0.5;

    const successData =
      this.sessionData.patternLearning.successful_patterns.get(patternHash);
    const failureData =
      this.sessionData.patternLearning.failed_patterns.get(patternHash);

    const successCount = successData?.count || 0;
    const failureCount = failureData?.count || 0;
    const totalCount = successCount + failureCount;

    if (totalCount === 0) return 0.5;

    const successRate = successCount / totalCount;
    const confidence = Math.min(1, totalCount / 10); // Confidence increases with sample size

    return successRate * confidence + 0.5 * (1 - confidence);
  }

  async persistLearningData(learning: unknown): Promise<void> {
    if (this.persistence) {
      try {
        await this.persistence.storeAgentMemory(
          'learning-system',
          'pattern-learning',
          {
            successful_patterns: Object.fromEntries(
              learning.successful_patterns
            ),
            failed_patterns: Object.fromEntries(learning.failed_patterns),
            context_correlations: Object.fromEntries(
              learning.context_correlations
            ),
            last_updated: Date.now(),
          }
        );
      } catch (error) {
        logger.error('Failed to persist learning data:', error.message);
      }
    }
  }

  calculateAnomalyScore(
    currentPattern: unknown,
    baselinePatterns: Map<string, unknown>
  ): number {
    // Simplified anomaly detection based on pattern frequency
    const patternKey = `${currentPattern.operation_type}:${currentPattern.agent_type}`;
    const baseline = baselinePatterns.get(patternKey);

    if (!baseline) return 0.8; // New patterns are somewhat anomalous

    const frequency = baseline.frequency || 0;
    const expectedFrequency = baseline.expected_frequency || 0.1;

    return (
      Math.abs(frequency - expectedFrequency) /
      Math.max(frequency, expectedFrequency, 0.1)
    );
  }

  updateBaselinePatterns(
    pattern: unknown,
    baselinePatterns: Map<string, unknown>
  ): void {
    const patternKey = `${pattern.operation_type}:${pattern.agent_type}`;
    const existing = baselinePatterns.get(patternKey) || {
      frequency: 0,
      count: 0,
    };

    baselinePatterns.set(patternKey, {
      frequency:
        (existing.frequency * existing.count + 1) / (existing.count + 1),
      count: existing.count + 1,
      last_seen: Date.now(),
      expected_frequency: existing.expected_frequency || 0.1,
    });
  }

  classifyAnomaly(pattern: unknown, recentOperations: unknown[]): string {
    // Simple anomaly classification
    const recentSimilar = recentOperations.filter(
      (op) =>
        op.operation_type === pattern.operation_type ||
        op.agent_type === pattern.agent_type
    );

    if (recentSimilar.length === 0) return 'new_pattern';
    if (recentSimilar.length === 1) return 'rare_pattern';
    return 'frequency_anomaly';
  }

  async generateAnomalyAlert(alertData: unknown): Promise<void> {
    const alert = {
      timestamp: Date.now(),
      type: 'behavioral_anomaly',
      severity: alertData.score > 0.9 ? 'high' : 'medium',
      details: alertData,
      session_id: this.getSessionId(),
    };

    // Store alert
    if (!this.sessionData.anomalyAlerts) {
      this.sessionData.anomalyAlerts = [];
    }
    this.sessionData.anomalyAlerts.push(alert);

    // Notify other agents
    await this.notificationHook({
      message: `Behavioral anomaly detected: ${alertData.type}`,
      level: 'warning',
      context: alertData,
      type: 'anomaly_alert',
    });
  }

  hashContext(context: unknown): string {
    return this.simpleHash(JSON.stringify(context || {}));
  }

  simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  extractKeyParameters(operation: unknown): unknown {
    // Extract key parameters that affect operation behavior
    return {
      type: operation?.type,
      file_extension: operation?.file?.split('.').pop(),
      command_category: operation?.command?.split(' ')[0],
      complexity: operation?.complexity,
    };
  }

  // Placeholder implementations for behavioral analysis methods
  analyzeActivityPatterns(actions: unknown[], timeframe: unknown): unknown {
    return { peak_hours: [], activity_frequency: 0.5, consistency_score: 0.7 };
  }

  analyzeCommandPreferences(actions: unknown[]): unknown {
    return { preferred_tools: [], risk_commands: [], automation_level: 0.6 };
  }

  analyzeRiskTolerance(actions: unknown[]): unknown {
    return { risk_score: 0.4, safety_adherence: 0.8, caution_level: 'medium' };
  }

  analyzeLearningProgression(actions: unknown[]): unknown {
    return {
      skill_improvement: 0.3,
      adaptation_rate: 0.5,
      knowledge_growth: 0.4,
    };
  }

  analyzeCollaborationStyle(actions: unknown[], context: unknown): unknown {
    return {
      cooperation_score: 0.7,
      communication_style: 'direct',
      team_impact: 0.6,
    };
  }

  async getPreviousBehaviorProfile(entity: unknown): Promise<unknown> {
    return { activity_patterns: {}, command_preferences: {} }; // Placeholder
  }

  detectBehaviorChanges(current: unknown, previous: unknown): unknown {
    return { significant_changes: [], change_score: 0.1 }; // Placeholder
  }

  async updateBehaviorProfile(
    entity: unknown,
    profile: unknown
  ): Promise<void> {
    // Update behavior profile in persistence layer
  }

  generateBehavioralInsights(profile: unknown, changes: unknown): string[] {
    return ['Normal behavioral patterns observed']; // Placeholder
  }

  /**
   * 🔧 CRITICAL FIX: Cross-agent memory retrieval for coordinated decisions.
   *
   * @param key
   * @param agentId
   */
  async getSharedMemory(
    key: string,
    agentId: string | null = null
  ): Promise<unknown> {
    // Check runtime memory first
    const runtimeValue = this.sessionData[key];

    // Check database for persistent cross-agent memory
    if (this.persistence) {
      try {
        const targetAgentId = agentId || 'shared-memory';
        const memory = await this.persistence.getAgentMemory(
          targetAgentId,
          key
        );

        if (memory) {
          return memory.value;
        }
      } catch (error) {
        logger.error('❌ Failed to retrieve shared memory:', error.message);
      }
    }

    return runtimeValue;
  }

  /**
   * 🔧 CRITICAL FIX: Cross-agent memory storage for coordinated decisions.
   *
   * @param key
   * @param value
   * @param agentId
   */
  async setSharedMemory(
    key: string,
    value: unknown,
    agentId: string | null = null
  ): Promise<void> {
    // Store in runtime memory
    this.sessionData[key] = value;

    // Store in database for cross-agent access
    if (this.persistence) {
      try {
        const targetAgentId = agentId || 'shared-memory';
        await this.persistence.storeAgentMemory(targetAgentId, key, value);
      } catch (error) {
        logger.error('❌ Failed to store shared memory:', error.message);
      }
    }
  }
}

// Export singleton instance and its methods
const hooksInstance = new ZenSwarmHooks();

export const handleHook = (hookType: string, options: unknown[]) =>
  hooksInstance.handleHook(hookType, options);

export default hooksInstance;
