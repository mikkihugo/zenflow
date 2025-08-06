/**
 * DSPy Agent Prompt Database
 *
 * Dedicated LanceDB vector database for storing and analyzing ALL agent prompts
 * across the entire Claude-Zen system. This enables DSPy neural enhancement
 * to automatically improve agent prompts through pattern analysis and optimization.
 */

import { connect, type Table } from '@lancedb/lancedb';
import { createLogger } from '../../core/logger';
import type { AgentType } from '../../types/agent-types';

const logger = createLogger({ prefix: 'DSPyAgentPromptDB' });

/**
 * Agent Prompt Record Structure for Vector Database
 *
 * @example
 */
export interface AgentPromptRecord {
  id: string;
  agentType: AgentType;
  category: 'system' | 'behavior' | 'expertise' | 'task' | 'instruction' | 'optimization';
  prompt: string;
  promptVector: number[]; // Vector embedding of the prompt
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
    performanceMetrics?: {
      accuracy: number;
      effectiveness: number;
      usageCount: number;
      successRate: number;
    };
    optimization?: {
      optimizedBy: 'dspy' | 'human' | 'neural-enhancer';
      optimizationRound: number;
      baselinePrompt?: string;
      improvements: string[];
    };
    tags: string[];
    domain: string;
  };
}

/**
 * Agent Instance Record Structure for Vector Database
 *
 * @example
 */
export interface AgentInstanceRecord {
  id: string;
  agentType: AgentType;
  swarmId: string;
  status: 'idle' | 'busy' | 'offline' | 'error';
  capabilities: string[];
  currentPrompts: {
    systemPrompt: string;
    behaviorPrompt: string;
    expertisePrompt: string;
    taskPrompt: string;
  };
  promptVectors: {
    systemVector: number[];
    behaviorVector: number[];
    expertiseVector: number[];
    taskVector: number[];
  };
  performance: {
    tasksCompleted: number;
    averageResponseTime: number;
    errorRate: number;
    successRate: number;
    lastActivity: string;
  };
  learningHistory: Array<{
    timestamp: string;
    task: string;
    performance: number;
    feedback: string;
    adaptations: string[];
  }>;
  optimizationHistory: Array<{
    timestamp: string;
    optimizedBy: 'dspy' | 'neural-enhancer' | 'human';
    changedPrompts: string[];
    performanceImprovement: number;
    techniques: string[];
  }>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    domain: string;
    specialization: string[];
    tags: string[];
  };
}

/**
 * DSPy Agent Prompt Database Manager
 *
 * @example
 */
export class DSPyAgentPromptDatabase {
  private db: any;
  private promptTable: Table<AgentPromptRecord> | null = null;
  private agentTable: Table<AgentInstanceRecord> | null = null;
  private dbPath: string;

  constructor(dbPath: string = './.claude/databases/agent-ecosystem.lancedb') {
    this.dbPath = dbPath;
    // Ensure Claude directory structure exists
    this.ensureClaudeDirectoryStructure();
  }

  /**
   * Ensure .claude directory structure exists for Claude Code integration
   */
  private ensureClaudeDirectoryStructure(): void {
    const fs = require('node:fs');
    const path = require('node:path');

    const baseDir = './.claude';
    const subdirs = [
      'databases', // LanceDB, SQLite databases
      'hive', // Hive mind coordination data
      'cache', // Embeddings, sessions, tools cache
      'memory', // Agent/swarm/neural memory
      'logs', // System logs
      'analytics', // Performance analytics
      'neural', // Neural patterns, models, DSPy data
      'backups', // System backups
      'workflows', // Workflow definitions
      'agents', // Agent-specific data
    ];

    // Create base directory
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
      logger.info('Created .claude base directory for Claude Code integration');
    }

    // Create subdirectories
    subdirs.forEach((subdir) => {
      const dirPath = path.join(baseDir, subdir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.debug(`Created .claude/${subdir} directory`);
      }
    });

    // Create nested subdirectories for organization
    const nestedDirs = [
      'cache/embeddings',
      'cache/sessions',
      'cache/tools',
      'cache/external-mcp',
      'memory/agents',
      'memory/swarms',
      'memory/projects',
      'neural/dspy',
      'neural/models',
      'neural/patterns',
      'neural/wasm',
      'hive/coordination',
      'hive/swarms',
      'hive/intelligence',
      'workflows/templates',
      'workflows/history',
      'agents/prompts',
      'agents/instances',
      'backups/daily',
      'backups/weekly',
    ];

    nestedDirs.forEach((nestedDir) => {
      const dirPath = path.join(baseDir, nestedDir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    logger.info('Claude directory structure initialized', {
      baseDir,
      subdirectories: subdirs.length,
      nestedDirectories: nestedDirs.length,
    });
  }

  /**
   * Initialize the LanceDB database and create schemas
   */
  async initialize(): Promise<void> {
    try {
      this.db = await connect(this.dbPath);

      // Initialize Agent Prompts Table
      try {
        this.promptTable = await this.db.openTable('agent_prompts');
        logger.info('Opened existing agent prompts table');
      } catch (_error) {
        this.promptTable = await this.db.createTable('agent_prompts', []);
        logger.info('Created new agent prompts table');
      }

      // Initialize Agent Instances Table
      try {
        this.agentTable = await this.db.openTable('agent_instances');
        logger.info('Opened existing agent instances table');
      } catch (_error) {
        this.agentTable = await this.db.createTable('agent_instances', []);
        logger.info('Created new agent instances table');
      }

      await this.populateInitialPrompts();

      logger.info('DSPy Agent Ecosystem Database initialized', {
        dbPath: this.dbPath,
        promptTable: !!this.promptTable,
        agentTable: !!this.agentTable,
      });
    } catch (error) {
      logger.error('Failed to initialize DSPy Agent Ecosystem Database', { error });
      throw error;
    }
  }

  /**
   * Store agent prompt with vector embedding
   *
   * @param agentType
   * @param category
   * @param prompt
   * @param metadata
   */
  async storeAgentPrompt(
    agentType: AgentType,
    category: AgentPromptRecord['category'],
    prompt: string,
    metadata: Partial<AgentPromptRecord['metadata']> = {}
  ): Promise<string> {
    if (!this.promptTable) {
      throw new Error('Database not initialized');
    }

    const id = `${agentType}-${category}-${Date.now()}`;
    const promptVector = await this.generateEmbedding(prompt);

    const record: AgentPromptRecord = {
      id,
      agentType,
      category,
      prompt,
      promptVector,
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        domain: this.inferDomain(agentType),
        ...metadata,
      },
    };

    await this.promptTable.add([record]);

    logger.debug('Stored agent prompt', {
      id,
      agentType,
      category,
      promptLength: prompt.length,
    });

    return id;
  }

  /**
   * Find similar prompts using vector similarity search
   *
   * @param queryPrompt
   * @param limit
   * @param agentType
   * @param category
   */
  async findSimilarPrompts(
    queryPrompt: string,
    limit: number = 10,
    agentType?: AgentType,
    category?: AgentPromptRecord['category']
  ): Promise<AgentPromptRecord[]> {
    if (!this.promptTable) {
      throw new Error('Database not initialized');
    }

    const queryVector = await this.generateEmbedding(queryPrompt);

    let query = this.promptTable.search(queryVector).limit(limit);

    if (agentType) {
      query = query.where(`agentType = '${agentType}'`);
    }

    if (category) {
      query = query.where(`category = '${category}'`);
    }

    const results = await query.toArray();

    logger.debug('Found similar prompts', {
      queryLength: queryPrompt.length,
      resultsCount: results.length,
      agentType,
      category,
    });

    return results;
  }

  /**
   * Get all prompts for a specific agent type
   *
   * @param agentType
   */
  async getAgentPrompts(agentType: AgentType): Promise<AgentPromptRecord[]> {
    if (!this.promptTable) {
      throw new Error('Database not initialized');
    }

    const results = await this.promptTable.search().where(`agentType = '${agentType}'`).toArray();

    return results;
  }

  /**
   * Update prompt with DSPy optimization results
   *
   * @param promptId
   * @param optimizedPrompt
   * @param optimizationData
   * @param optimizationData.optimizedBy
   * @param optimizationData.baselineAccuracy
   * @param optimizationData.optimizedAccuracy
   * @param optimizationData.improvements
   */
  async updatePromptWithOptimization(
    promptId: string,
    optimizedPrompt: string,
    optimizationData: {
      optimizedBy: 'dspy' | 'neural-enhancer';
      baselineAccuracy: number;
      optimizedAccuracy: number;
      improvements: string[];
    }
  ): Promise<void> {
    if (!this.promptTable) {
      throw new Error('Database not initialized');
    }

    // Get the current record
    const currentRecords = await this.promptTable.search().where(`id = '${promptId}'`).toArray();

    if (currentRecords.length === 0) {
      throw new Error(`Prompt with id ${promptId} not found`);
    }

    const currentRecord = currentRecords[0];
    const optimizedVector = await this.generateEmbedding(optimizedPrompt);

    // Create new optimized version
    const optimizedRecord: AgentPromptRecord = {
      ...currentRecord,
      id: `${promptId}-optimized-${Date.now()}`,
      prompt: optimizedPrompt,
      promptVector: optimizedVector,
      metadata: {
        ...currentRecord.metadata,
        version: this.incrementVersion(currentRecord.metadata.version),
        updatedAt: new Date().toISOString(),
        performanceMetrics: {
          accuracy: optimizationData.optimizedAccuracy,
          effectiveness: optimizationData.optimizedAccuracy / optimizationData.baselineAccuracy,
          usageCount: 0,
          successRate: 0,
        },
        optimization: {
          optimizedBy: optimizationData.optimizedBy,
          optimizationRound: (currentRecord.metadata.optimization?.optimizationRound || 0) + 1,
          baselinePrompt: currentRecord.prompt,
          improvements: optimizationData.improvements,
        },
      },
    };

    await this.promptTable.add([optimizedRecord]);

    logger.info('Updated prompt with optimization', {
      originalId: promptId,
      optimizedId: optimizedRecord.id,
      accuracyImprovement: optimizationData.optimizedAccuracy - optimizationData.baselineAccuracy,
    });
  }

  /**
   * Get optimization history for pattern analysis
   */
  async getOptimizationPatterns(): Promise<{
    totalOptimizations: number;
    averageImprovement: number;
    topImprovements: Array<{
      agentType: AgentType;
      category: string;
      improvement: number;
      techniques: string[];
    }>;
    commonPatterns: string[];
  }> {
    if (!this.promptTable) {
      throw new Error('Database not initialized');
    }

    const allRecords = await this.promptTable
      .search()
      .where('metadata.optimization IS NOT NULL')
      .toArray();

    const totalOptimizations = allRecords.length;
    const improvements = allRecords
      .map((record) => record.metadata.performanceMetrics?.effectiveness || 1)
      .filter((eff) => eff > 1);

    const averageImprovement =
      improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length || 1;

    const topImprovements = allRecords
      .filter(
        (record) =>
          record.metadata.performanceMetrics?.effectiveness &&
          record.metadata.performanceMetrics.effectiveness > 1
      )
      .sort(
        (a, b) =>
          (b.metadata.performanceMetrics?.effectiveness || 0) -
          (a.metadata.performanceMetrics?.effectiveness || 0)
      )
      .slice(0, 10)
      .map((record) => ({
        agentType: record.agentType,
        category: record.category,
        improvement: record.metadata.performanceMetrics?.effectiveness || 0,
        techniques: record.metadata.optimization?.improvements || [],
      }));

    // Extract common improvement patterns
    const allImprovements = allRecords.flatMap(
      (record) => record.metadata.optimization?.improvements || []
    );
    const improvementCounts = allImprovements.reduce(
      (counts, improvement) => {
        counts[improvement] = (counts[improvement] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    const commonPatterns = Object.entries(improvementCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([pattern]) => pattern);

    return {
      totalOptimizations,
      averageImprovement,
      topImprovements,
      commonPatterns,
    };
  }

  /**
   * Populate database with all existing agent prompts
   */
  private async populateInitialPrompts(): Promise<void> {
    // Check if already populated
    if (!this.promptTable) return;

    const existingCount = await this.promptTable.countRows();
    if (existingCount > 0) {
      logger.debug('Database already populated', { existingPrompts: existingCount });
      return;
    }

    logger.info('Populating database with initial agent prompts...');

    // Get all agent types and create comprehensive prompts for each
    const allAgentTypes: AgentType[] = [
      // Core Foundation Agents
      'coder',
      'analyst',
      'researcher',
      'coordinator',
      'tester',
      'architect',
      'debug',
      'queen',
      'specialist',
      'reviewer',
      'optimizer',
      'documenter',

      // Development Agents
      'requirements-engineer',
      'design-architect',
      'task-planner',
      'developer',
      'system-architect',
      'frontend-dev',
      'fullstack-dev',
      'api-dev',

      // Testing Agents
      'unit-tester',
      'integration-tester',
      'e2e-tester',
      'performance-tester',

      // DSPy Neural Enhancement Agents
      'prompt-optimizer',
      'example-generator',
      'metric-analyzer',
      'pipeline-tuner',
      'neural-enhancer',

      // Add more as needed...
    ];

    for (const agentType of allAgentTypes) {
      await this.createAgentPrompts(agentType);
    }

    logger.info('Initial agent prompts populated', { agentTypes: allAgentTypes.length });
  }

  /**
   * Create comprehensive prompts for a specific agent type
   *
   * @param agentType
   */
  private async createAgentPrompts(agentType: AgentType): Promise<void> {
    const prompts = this.generateAgentPrompts(agentType);

    for (const [category, prompt] of Object.entries(prompts)) {
      await this.storeAgentPrompt(agentType, category as AgentPromptRecord['category'], prompt, {
        tags: this.generateTags(agentType, category),
        performanceMetrics: {
          accuracy: 0.8, // Default baseline
          effectiveness: 1.0,
          usageCount: 0,
          successRate: 0.8,
        },
      });
    }
  }

  /**
   * Generate comprehensive prompts for any agent type
   *
   * @param agentType
   */
  private generateAgentPrompts(agentType: AgentType): Record<string, string> {
    const agentName = agentType
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      system: `You are a specialized ${agentName} agent in the Claude-Zen swarm coordination system. Your role is critical to the success of complex multi-agent workflows.`,

      behavior: this.generateBehaviorPrompt(agentType),

      expertise: this.generateExpertisePrompt(agentType),

      task: this.generateTaskPrompt(agentType),

      instruction: `When working as a ${agentName}:
1. Analyze the current context and requirements
2. Apply your specialized knowledge and skills
3. Coordinate effectively with other agents
4. Deliver high-quality results within scope
5. Document your decisions and rationale
6. Provide feedback for continuous improvement`,

      optimization: `Optimization guidelines for ${agentName}:
- Focus on your core competencies
- Leverage swarm intelligence and coordination
- Continuously learn from successful patterns
- Adapt to changing requirements and contexts
- Maintain quality while optimizing for efficiency`,
    };
  }

  /**
   * Generate behavior prompt based on agent type
   *
   * @param agentType
   */
  private generateBehaviorPrompt(agentType: AgentType): string {
    const behaviorMap: Partial<Record<AgentType, string>> = {
      coder: 'Write clean, efficient, and maintainable code following best practices.',
      analyst: 'Analyze complex data and requirements to provide actionable insights.',
      researcher: 'Conduct thorough research and gather relevant information.',
      coordinator: 'Coordinate between multiple agents and manage workflow dependencies.',
      tester: 'Design and execute comprehensive testing strategies.',
      architect: 'Design scalable system architectures and technical solutions.',
      'prompt-optimizer': 'Systematically optimize prompts for maximum LLM performance.',
      'neural-enhancer':
        'Automatically enhance workflows using neural intelligence and pattern recognition.',
    };

    return (
      behaviorMap[agentType] ||
      `Perform specialized tasks related to ${agentType} with excellence and attention to detail.`
    );
  }

  /**
   * Generate expertise prompt based on agent type
   *
   * @param agentType
   */
  private generateExpertisePrompt(agentType: AgentType): string {
    const expertiseMap: Partial<Record<AgentType, string>> = {
      coder: 'Programming languages, frameworks, design patterns, code quality, testing.',
      analyst: 'Data analysis, requirements gathering, business process modeling, metrics.',
      researcher: 'Information gathering, source evaluation, synthesis, documentation.',
      coordinator: 'Project management, workflow orchestration, dependency management.',
      tester: 'Test design, automation, quality assurance, bug identification.',
      architect: 'System design, scalability, performance, security, integration patterns.',
      'prompt-optimizer':
        'Prompt engineering, few-shot learning, instruction tuning, optimization techniques.',
      'neural-enhancer':
        'Neural intelligence, cognitive patterns, adaptive learning, automatic optimization.',
    };

    return expertiseMap[agentType] || `Specialized knowledge and skills in ${agentType} domain.`;
  }

  /**
   * Generate task prompt based on agent type
   *
   * @param agentType
   */
  private generateTaskPrompt(agentType: AgentType): string {
    return `When assigned tasks as a ${agentType}:
1. Understand the specific requirements and context
2. Apply domain-specific best practices
3. Collaborate effectively with other agents
4. Deliver results that meet quality standards
5. Provide clear documentation and rationale`;
  }

  /**
   * Generate embeddings for prompt text (mock implementation)
   *
   * @param text
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // In a real implementation, this would use OpenAI's embedding API
    // For now, create a mock embedding based on text characteristics
    const embedding = new Array(768).fill(0);

    // Simple hash-based embedding for demonstration
    for (let i = 0; i < text.length && i < 768; i++) {
      embedding[i % 768] += text.charCodeAt(i) / 255;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => val / magnitude);
  }

  /**
   * Infer domain from agent type
   *
   * @param agentType
   */
  private inferDomain(agentType: AgentType): string {
    if (agentType.includes('test')) return 'testing';
    if (agentType.includes('dev') || agentType === 'coder') return 'development';
    if (agentType.includes('arch')) return 'architecture';
    if (agentType.includes('dspy') || ['prompt-optimizer', 'neural-enhancer'].includes(agentType))
      return 'neural-enhancement';
    if (agentType.includes('coord')) return 'coordination';
    return 'general';
  }

  /**
   * Generate tags for categorization
   *
   * @param agentType
   * @param category
   */
  private generateTags(agentType: AgentType, category: string): string[] {
    const tags = [agentType, category, this.inferDomain(agentType)];

    if (agentType.includes('dspy')) tags.push('dspy', 'neural');
    if (agentType.includes('test')) tags.push('quality-assurance');
    if (agentType.includes('dev') || agentType === 'coder') tags.push('programming');

    return tags;
  }

  /**
   * Increment version string
   *
   * @param version
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * 🤖 AGENT INSTANCE MANAGEMENT METHODS
   */

  /**
   * Register an agent instance in the database
   *
   * @param agentId
   * @param agentType
   * @param swarmId
   * @param capabilities
   * @param currentPrompts
   */
  async registerAgentInstance(
    agentId: string,
    agentType: AgentType,
    swarmId: string,
    capabilities: string[],
    currentPrompts: AgentInstanceRecord['currentPrompts']
  ): Promise<void> {
    if (!this.agentTable) {
      throw new Error('Agent table not initialized');
    }

    // Generate vectors for all prompts
    const promptVectors = {
      systemVector: await this.generateEmbedding(currentPrompts.systemPrompt),
      behaviorVector: await this.generateEmbedding(currentPrompts.behaviorPrompt),
      expertiseVector: await this.generateEmbedding(currentPrompts.expertisePrompt),
      taskVector: await this.generateEmbedding(currentPrompts.taskPrompt),
    };

    const agentRecord: AgentInstanceRecord = {
      id: agentId,
      agentType,
      swarmId,
      status: 'idle',
      capabilities,
      currentPrompts,
      promptVectors,
      performance: {
        tasksCompleted: 0,
        averageResponseTime: 0,
        errorRate: 0,
        successRate: 1.0,
        lastActivity: new Date().toISOString(),
      },
      learningHistory: [],
      optimizationHistory: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        domain: this.inferDomain(agentType),
        specialization: capabilities,
        tags: this.generateTags(agentType, 'instance'),
      },
    };

    await this.agentTable.add([agentRecord]);

    logger.info('Registered agent instance', { agentId, agentType, swarmId });
  }

  /**
   * Update agent performance metrics
   *
   * @param agentId
   * @param performanceUpdate
   * @param performanceUpdate.taskCompleted
   * @param performanceUpdate.responseTime
   * @param performanceUpdate.errorOccurred
   * @param performanceUpdate.taskDescription
   * @param performanceUpdate.feedback
   */
  async updateAgentPerformance(
    agentId: string,
    performanceUpdate: {
      taskCompleted: boolean;
      responseTime: number;
      errorOccurred: boolean;
      taskDescription: string;
      feedback?: string;
    }
  ): Promise<void> {
    if (!this.agentTable) {
      throw new Error('Agent table not initialized');
    }

    // Get current agent record
    const currentRecords = await this.agentTable.search().where(`id = '${agentId}'`).toArray();

    if (currentRecords.length === 0) {
      logger.warn('Agent not found for performance update', { agentId });
      return;
    }

    const currentRecord = currentRecords[0];

    // Update performance metrics
    const updatedPerformance = {
      tasksCompleted:
        currentRecord.performance.tasksCompleted + (performanceUpdate.taskCompleted ? 1 : 0),
      averageResponseTime:
        (currentRecord.performance.averageResponseTime + performanceUpdate.responseTime) / 2,
      errorRate: performanceUpdate.errorOccurred
        ? (currentRecord.performance.errorRate + 1) / (currentRecord.performance.tasksCompleted + 1)
        : (currentRecord.performance.errorRate * currentRecord.performance.tasksCompleted) /
          (currentRecord.performance.tasksCompleted + 1),
      successRate: performanceUpdate.taskCompleted
        ? (currentRecord.performance.successRate * currentRecord.performance.tasksCompleted + 1) /
          (currentRecord.performance.tasksCompleted + 1)
        : (currentRecord.performance.successRate * currentRecord.performance.tasksCompleted) /
          (currentRecord.performance.tasksCompleted + 1),
      lastActivity: new Date().toISOString(),
    };

    // Add to learning history
    const learningEntry = {
      timestamp: new Date().toISOString(),
      task: performanceUpdate.taskDescription,
      performance: performanceUpdate.taskCompleted ? 1 : 0,
      feedback: performanceUpdate.feedback || '',
      adaptations: [], // Could be filled by neural enhancement
    };

    // Update the record
    await this.agentTable.delete(`id = '${agentId}'`);
    await this.agentTable.add([
      {
        ...currentRecord,
        performance: updatedPerformance,
        learningHistory: [...currentRecord.learningHistory, learningEntry],
        metadata: {
          ...currentRecord.metadata,
          updatedAt: new Date().toISOString(),
        },
      },
    ]);

    logger.debug('Updated agent performance', {
      agentId,
      taskCompleted: performanceUpdate.taskCompleted,
      newSuccessRate: updatedPerformance.successRate,
    });
  }

  /**
   * Find agents similar to a given agent (by prompt similarity)
   *
   * @param agentId
   * @param limit
   */
  async findSimilarAgents(agentId: string, limit: number = 5): Promise<AgentInstanceRecord[]> {
    if (!this.agentTable) {
      throw new Error('Agent table not initialized');
    }

    // Get the reference agent
    const referenceAgent = await this.agentTable.search().where(`id = '${agentId}'`).toArray();

    if (referenceAgent.length === 0) {
      return [];
    }

    const refAgent = referenceAgent[0];

    // Search by system prompt similarity (could also combine other vectors)
    const similarAgents = await this.agentTable
      .search(refAgent.promptVectors.systemVector)
      .where(`id != '${agentId}'`)
      .limit(limit)
      .toArray();

    return similarAgents;
  }

  /**
   * Get all agents in a swarm
   *
   * @param swarmId
   */
  async getSwarmAgents(swarmId: string): Promise<AgentInstanceRecord[]> {
    if (!this.agentTable) {
      throw new Error('Agent table not initialized');
    }

    return await this.agentTable.search().where(`swarmId = '${swarmId}'`).toArray();
  }

  /**
   * Optimize agent prompts using DSPy neural enhancement
   *
   * @param agentId
   * @param optimizationData
   * @param optimizationData.optimizedPrompts
   * @param optimizationData.performanceImprovement
   * @param optimizationData.techniques
   */
  async optimizeAgentPrompts(
    agentId: string,
    optimizationData: {
      optimizedPrompts: AgentInstanceRecord['currentPrompts'];
      performanceImprovement: number;
      techniques: string[];
    }
  ): Promise<void> {
    if (!this.agentTable) {
      throw new Error('Agent table not initialized');
    }

    const currentRecords = await this.agentTable.search().where(`id = '${agentId}'`).toArray();

    if (currentRecords.length === 0) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const currentRecord = currentRecords[0];

    // Generate new vectors for optimized prompts
    const newPromptVectors = {
      systemVector: await this.generateEmbedding(optimizationData.optimizedPrompts.systemPrompt),
      behaviorVector: await this.generateEmbedding(
        optimizationData.optimizedPrompts.behaviorPrompt
      ),
      expertiseVector: await this.generateEmbedding(
        optimizationData.optimizedPrompts.expertisePrompt
      ),
      taskVector: await this.generateEmbedding(optimizationData.optimizedPrompts.taskPrompt),
    };

    // Add optimization history entry
    const optimizationEntry = {
      timestamp: new Date().toISOString(),
      optimizedBy: 'neural-enhancer' as const,
      changedPrompts: Object.keys(optimizationData.optimizedPrompts),
      performanceImprovement: optimizationData.performanceImprovement,
      techniques: optimizationData.techniques,
    };

    // Update the agent with optimized prompts
    await this.agentTable.delete(`id = '${agentId}'`);
    await this.agentTable.add([
      {
        ...currentRecord,
        currentPrompts: optimizationData.optimizedPrompts,
        promptVectors: newPromptVectors,
        optimizationHistory: [...currentRecord.optimizationHistory, optimizationEntry],
        metadata: {
          ...currentRecord.metadata,
          updatedAt: new Date().toISOString(),
          version: this.incrementVersion(currentRecord.metadata.version),
        },
      },
    ]);

    logger.info('Optimized agent prompts', {
      agentId,
      performanceImprovement: optimizationData.performanceImprovement,
      techniques: optimizationData.techniques,
    });
  }

  /**
   * Get comprehensive analytics for DSPy optimization
   */
  async getAgentEcosystemAnalytics(): Promise<{
    totalAgents: number;
    activeAgents: number;
    averagePerformance: number;
    topPerformingAgents: Array<{
      id: string;
      type: AgentType;
      successRate: number;
      optimizations: number;
    }>;
    optimizationImpact: {
      totalOptimizations: number;
      averageImprovement: number;
      mostEffectiveTechniques: string[];
    };
    agentTypeDistribution: Record<AgentType, number>;
    domainCoverage: Record<string, number>;
  }> {
    if (!this.agentTable) {
      throw new Error('Agent table not initialized');
    }

    const allAgents = await this.agentTable.search().toArray();
    const activeAgents = allAgents.filter(
      (agent) =>
        agent.status !== 'offline' &&
        new Date(agent.performance.lastActivity) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const averagePerformance =
      allAgents.reduce((sum, agent) => sum + agent.performance.successRate, 0) / allAgents.length;

    const topPerformingAgents = allAgents
      .sort((a, b) => b.performance.successRate - a.performance.successRate)
      .slice(0, 10)
      .map((agent) => ({
        id: agent.id,
        type: agent.agentType,
        successRate: agent.performance.successRate,
        optimizations: agent.optimizationHistory.length,
      }));

    const allOptimizations = allAgents.flatMap((agent) => agent.optimizationHistory);
    const optimizationImpact = {
      totalOptimizations: allOptimizations.length,
      averageImprovement:
        allOptimizations.reduce((sum, opt) => sum + opt.performanceImprovement, 0) /
          allOptimizations.length || 0,
      mostEffectiveTechniques: this.getMostFrequentTechniques(allOptimizations),
    };

    const agentTypeDistribution = allAgents.reduce(
      (dist, agent) => {
        dist[agent.agentType] = (dist[agent.agentType] || 0) + 1;
        return dist;
      },
      {} as Record<AgentType, number>
    );

    const domainCoverage = allAgents.reduce(
      (coverage, agent) => {
        coverage[agent.metadata.domain] = (coverage[agent.metadata.domain] || 0) + 1;
        return coverage;
      },
      {} as Record<string, number>
    );

    return {
      totalAgents: allAgents.length,
      activeAgents: activeAgents.length,
      averagePerformance,
      topPerformingAgents,
      optimizationImpact,
      agentTypeDistribution,
      domainCoverage,
    };
  }

  /**
   * Helper method to get most frequent optimization techniques
   *
   * @param optimizations
   */
  private getMostFrequentTechniques(optimizations: Array<{ techniques: string[] }>): string[] {
    const techniqueCounts = optimizations
      .flatMap((opt) => opt.techniques)
      .reduce(
        (counts, technique) => {
          counts[technique] = (counts[technique] || 0) + 1;
          return counts;
        },
        {} as Record<string, number>
      );

    return Object.entries(techniqueCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([technique]) => technique);
  }

  /**
   * Cleanup database resources
   */
  async cleanup(): Promise<void> {
    // LanceDB cleanup if needed
    logger.info('DSPy Agent Ecosystem Database cleaned up');
  }
}

export default DSPyAgentPromptDatabase;
