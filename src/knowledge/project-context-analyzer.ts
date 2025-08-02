/**
 * Hive-Controlled FACT System for Claude-Zen
 *
 * The Hive Mind intelligently determines what external knowledge to gather
 * based on:
 * - Project dependencies (package.json, Cargo.toml, etc.)
 * - Code analysis (imports, APIs used, frameworks detected)
 * - Development context (current tasks, error patterns)
 * - Team expertise gaps (learning needs, documentation requests)
 *
 * Architecture:
 * - Hive analyzes project and determines knowledge needs
 * - Domain swarms receive targeted FACT gathering missions
 * - Service swarms execute specific knowledge collection tasks
 * - Results are cached and shared across the organization
 */

import { exec } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { KnowledgeSwarm, type KnowledgeSwarmConfig } from './knowledge-swarm';

const execAsync = promisify(exec);

interface ProjectContext {
  rootPath: string;
  dependencies: DependencyInfo[];
  devDependencies: DependencyInfo[];
  frameworks: DetectedFramework[];
  languages: DetectedLanguage[];
  apis: DetectedAPI[];
  currentTasks: string[];
  errorPatterns: string[];
  teamNeeds: string[];
}

interface DependencyInfo {
  name: string;
  version: string;
  type: 'runtime' | 'development' | 'peer';
  ecosystem: 'npm' | 'cargo' | 'pip' | 'go' | 'maven' | 'unknown';
  lastUpdated?: string;
  hasVulnerabilities?: boolean;
}

interface DetectedFramework {
  name: string;
  version?: string;
  confidence: number;
  usage: 'primary' | 'secondary' | 'utility';
  needsDocs: boolean;
}

interface DetectedLanguage {
  name: string;
  version?: string;
  fileCount: number;
  percentage: number;
}

interface DetectedAPI {
  name: string;
  type: 'rest' | 'graphql' | 'websocket' | 'grpc';
  endpoints: string[];
  needsAuth: boolean;
}

interface KnowledgeGatheringMission {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'dependency' | 'framework' | 'api' | 'security' | 'performance' | 'best-practices';
  target: string;
  version?: string;
  context: string[];
  requiredInfo: string[];
  assignedDomain?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
  results?: any;
}

interface ProjectAnalyzerConfig {
  projectRoot: string;
  swarmConfig: KnowledgeSwarmConfig;
  analysisDepth: 'shallow' | 'medium' | 'deep';
  autoUpdate: boolean;
  cacheDuration: number; // hours
  priorityThresholds: {
    critical: number; // Usage % for critical priority
    high: number; // Usage % for high priority
    medium: number; // Usage % for medium priority
  };
}

/**
 * Project Context Analyzer
 * Analyzes project context and determines what external knowledge should be gathered
 */
export class ProjectContextAnalyzer extends EventEmitter {
  private config: ProjectAnalyzerConfig;
  private knowledgeSwarm: KnowledgeSwarm;
  private projectContext?: ProjectContext;
  private knowledgeMissions: Map<string, KnowledgeGatheringMission> = new Map();
  private lastAnalysis?: Date;
  private contextCache = new Map<string, any>();

  constructor(config: ProjectAnalyzerConfig) {
    super();
    this.config = {
      analysisDepth: 'medium',
      autoUpdate: true,
      cacheDuration: 24, // 24 hours
      priorityThresholds: {
        critical: 0.8, // 80%+ usage
        high: 0.5, // 50%+ usage
        medium: 0.2, // 20%+ usage
      },
      ...config,
    };
    this.knowledgeSwarm = new KnowledgeSwarm(config.swarmConfig);
  }

  /**
   * Initialize the project context analyzer
   */
  async initialize(): Promise<void> {
    console.log('🧠 Initializing Project Context Analyzer...');

    try {
      // Initialize the knowledge swarm
      await this.knowledgeSwarm.initialize();

      // Analyze project context
      await this.analyzeProjectContext();

      // Generate initial knowledge gathering missions
      await this.generateKnowledgeMissions();

      // Start background context monitoring
      if (this.config.autoUpdate) {
        this.startContextMonitoring();
      }

      console.log(
        `✅ Project Context Analyzer initialized with ${this.knowledgeMissions.size} missions`
      );
      this.emit('analyzerInitialized', {
        missions: this.knowledgeMissions.size,
        context: this.projectContext,
      });
    } catch (error) {
      console.error('❌ Project Context Analyzer initialization failed:', error);
      throw error;
    }
  }

  /**
   * Analyze the current project to understand what knowledge is needed
   */
  async analyzeProjectContext(): Promise<ProjectContext> {
    console.log('🔍 Analyzing project context...');

    try {
      const context: ProjectContext = {
        rootPath: this.config.projectRoot,
        dependencies: [],
        devDependencies: [],
        frameworks: [],
        languages: [],
        apis: [],
        currentTasks: [],
        errorPatterns: [],
        teamNeeds: [],
      };

      // Analyze dependencies from various package managers
      await this.analyzeDependencies(context);

      // Detect frameworks and libraries
      await this.detectFrameworks(context);

      // Analyze codebase languages
      await this.analyzeLanguages(context);

      // Detect API usage
      await this.detectAPIs(context);

      // Analyze current development context
      await this.analyzeCurrentContext(context);

      this.projectContext = context;
      this.lastAnalysis = new Date();

      console.log(
        `✅ Project analysis complete: ${context.dependencies.length} deps, ${context.frameworks.length} frameworks`
      );
      this.emit('contextAnalyzed', context);

      return context;
    } catch (error) {
      console.error('❌ Project context analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate knowledge gathering missions based on project context
   */
  async generateKnowledgeMissions(): Promise<void> {
    if (!this.projectContext) {
      throw new Error('Project context not analyzed');
    }

    console.log('🎯 Generating knowledge gathering missions...');

    this.knowledgeMissions.clear();

    // Mission 1: Critical dependencies documentation
    for (const dep of this.projectContext.dependencies) {
      if (this.shouldGatherKnowledge(dep)) {
        const mission = this.createDependencyMission(dep);
        this.knowledgeMissions.set(mission.id, mission);
      }
    }

    // Mission 2: Framework-specific knowledge
    for (const framework of this.projectContext.frameworks) {
      if (framework.needsDocs) {
        const mission = this.createFrameworkMission(framework);
        this.knowledgeMissions.set(mission.id, mission);
      }
    }

    // Mission 3: API integration guides
    for (const api of this.projectContext.apis) {
      const mission = this.createAPIMission(api);
      this.knowledgeMissions.set(mission.id, mission);
    }

    // Mission 4: Security vulnerability research
    const vulnDeps = this.projectContext.dependencies.filter((d) => d.hasVulnerabilities);
    if (vulnDeps.length > 0) {
      const mission = this.createSecurityMission(vulnDeps);
      this.knowledgeMissions.set(mission.id, mission);
    }

    // Mission 5: Performance optimization research
    const perfMission = this.createPerformanceMission();
    this.knowledgeMissions.set(perfMission.id, perfMission);

    // Mission 6: Best practices for current stack
    const bestPracticesMission = this.createBestPracticesMission();
    this.knowledgeMissions.set(bestPracticesMission.id, bestPracticesMission);

    console.log(`✅ Generated ${this.knowledgeMissions.size} knowledge gathering missions`);
    this.emit('missionsGenerated', Array.from(this.knowledgeMissions.values()));
  }

  /**
   * Execute knowledge gathering missions through the swarm
   */
  async executeMissions(priority?: 'critical' | 'high' | 'medium' | 'low'): Promise<void> {
    console.log(
      `🚀 Executing knowledge gathering missions${priority ? ` (${priority} priority)` : ''}...`
    );

    const missions = Array.from(this.knowledgeMissions.values())
      .filter((m) => m.status === 'pending')
      .filter((m) => !priority || m.priority === priority)
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    const executionPromises = missions.map((mission) => this.executeMission(mission));

    try {
      await Promise.allSettled(executionPromises);

      const completed = missions.filter((m) => m.status === 'completed').length;
      const failed = missions.filter((m) => m.status === 'failed').length;

      console.log(`✅ Mission execution complete: ${completed} successful, ${failed} failed`);
      this.emit('missionsExecuted', { completed, failed, total: missions.length });
    } catch (error) {
      console.error('❌ Mission execution failed:', error);
    }
  }

  /**
   * Execute a single knowledge gathering mission
   */
  private async executeMission(mission: KnowledgeGatheringMission): Promise<void> {
    mission.status = 'in-progress';
    this.knowledgeMissions.set(mission.id, mission);

    try {
      console.log(`🎯 Executing mission: ${mission.id} (${mission.type})`);

      let result;

      switch (mission.type) {
        case 'dependency':
          result = await this.knowledgeSwarm.getTechnologyDocs(mission.target, mission.version);
          break;
        case 'framework':
          result = await this.knowledgeSwarm.getTechnologyDocs(mission.target, mission.version);
          break;
        case 'api':
          result = await this.knowledgeSwarm.getAPIIntegration(mission.target);
          break;
        case 'security':
          result = await this.knowledgeSwarm.getSecurityGuidance(
            mission.target,
            mission.context.join(', ')
          );
          break;
        case 'performance':
          result = await this.knowledgeSwarm.getPerformanceOptimization(mission.context.join(', '));
          break;
        case 'best-practices':
          result = await this.knowledgeSwarm.researchProblem(
            `Best practices for ${mission.target}`,
            mission.context
          );
          break;
        default:
          throw new Error(`Unknown mission type: ${mission.type}`);
      }

      mission.results = result;
      mission.status = 'completed';

      // Store knowledge in context cache for project analysis
      await this.storeKnowledgeInCache(mission, result);

      console.log(`✅ Mission completed: ${mission.id}`);
      this.emit('missionCompleted', mission);
    } catch (error) {
      console.error(`❌ Mission failed: ${mission.id}`, error);
      mission.status = 'failed';
    }

    this.knowledgeMissions.set(mission.id, mission);
  }

  /**
   * Query the knowledge base for specific information
   */
  async queryKnowledge(query: string, context?: string[]): Promise<string> {
    console.log(`🔍 Querying knowledge base: ${query.substring(0, 100)}...`);

    try {
      // First, check if we have relevant cached knowledge
      const relevantKnowledge = await this.searchCachedKnowledge(query, context);

      if (relevantKnowledge.length > 0) {
        console.log(`📚 Found ${relevantKnowledge.length} cached knowledge entries`);
        return this.formatCachedKnowledge(relevantKnowledge);
      }

      // If no cached knowledge, create a new mission and execute it
      const mission = this.createAdHocMission(query, context);
      await this.executeMission(mission);

      return mission.results?.consolidatedResponse || 'No results found';
    } catch (error) {
      console.error('Knowledge query failed:', error);
      throw error;
    }
  }

  /**
   * Analyze dependencies from package.json, Cargo.toml, etc.
   */
  private async analyzeDependencies(context: ProjectContext): Promise<void> {
    const packageJsonPath = path.join(context.rootPath, 'package.json');

    try {
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

      // Runtime dependencies
      if (packageJson.dependencies) {
        for (const [name, version] of Object.entries(packageJson.dependencies)) {
          context.dependencies.push({
            name,
            version: version as string,
            type: 'runtime',
            ecosystem: 'npm',
          });
        }
      }

      // Dev dependencies
      if (packageJson.devDependencies) {
        for (const [name, version] of Object.entries(packageJson.devDependencies)) {
          context.devDependencies.push({
            name,
            version: version as string,
            type: 'development',
            ecosystem: 'npm',
          });
        }
      }

      console.log(
        `📦 Found ${context.dependencies.length} dependencies, ${context.devDependencies.length} dev dependencies`
      );
    } catch (error) {
      console.log('📦 No package.json found or invalid format');
    }

    // TODO: Add support for other package managers (Cargo.toml, requirements.txt, etc.)
  }

  /**
   * Detect frameworks and libraries being used
   */
  private async detectFrameworks(context: ProjectContext): Promise<void> {
    const allDeps = [...context.dependencies, ...context.devDependencies];

    // Framework detection patterns
    const frameworkPatterns: Record<
      string,
      { pattern: RegExp; usage: 'primary' | 'secondary' | 'utility' }
    > = {
      react: { pattern: /^react$/, usage: 'primary' },
      next: { pattern: /^next$/, usage: 'primary' },
      express: { pattern: /^express$/, usage: 'primary' },
      fastify: { pattern: /^fastify$/, usage: 'primary' },
      typescript: { pattern: /^typescript$/, usage: 'primary' },
      tailwindcss: { pattern: /^tailwindcss$/, usage: 'secondary' },
      prisma: { pattern: /^@?prisma/, usage: 'secondary' },
      jest: { pattern: /^jest$/, usage: 'utility' },
      eslint: { pattern: /^eslint$/, usage: 'utility' },
    };

    for (const dep of allDeps) {
      for (const [frameworkName, { pattern, usage }] of Object.entries(frameworkPatterns)) {
        if (pattern.test(dep.name)) {
          context.frameworks.push({
            name: frameworkName,
            version: dep.version,
            confidence: 0.9,
            usage,
            needsDocs: usage === 'primary' || usage === 'secondary',
          });
        }
      }
    }

    console.log(`🔧 Detected ${context.frameworks.length} frameworks`);
  }

  /**
   * Analyze programming languages used in the project
   */
  private async analyzeLanguages(context: ProjectContext): Promise<void> {
    try {
      // Use basic file counting - could be enhanced with more sophisticated analysis
      const { stdout } = await execAsync(
        `find "${context.rootPath}" -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" | wc -l`,
        { cwd: context.rootPath }
      );
      const jstsFiles = parseInt(stdout.trim());

      if (jstsFiles > 0) {
        context.languages.push({
          name: 'TypeScript/JavaScript',
          fileCount: jstsFiles,
          percentage: 1.0, // Simplified - assume it's the primary language
        });
      }

      console.log(`💻 Detected languages: ${context.languages.map((l) => l.name).join(', ')}`);
    } catch (error) {
      console.log('💻 Could not analyze languages');
    }
  }

  /**
   * Detect API usage patterns
   */
  private async detectAPIs(context: ProjectContext): Promise<void> {
    // This could be enhanced to actually scan code for API usage patterns
    // For now, make educated guesses based on dependencies

    const apiDeps = context.dependencies.filter(
      (dep) => dep.name.includes('api') || dep.name.includes('client') || dep.name.includes('sdk')
    );

    for (const dep of apiDeps) {
      context.apis.push({
        name: dep.name,
        type: 'rest', // Default assumption
        endpoints: [],
        needsAuth: true, // Safe assumption
      });
    }

    console.log(`🌐 Detected ${context.apis.length} API dependencies`);
  }

  /**
   * Analyze current development context (TODOs, issues, etc.)
   */
  private async analyzeCurrentContext(context: ProjectContext): Promise<void> {
    // TODO: This could be enhanced to:
    // - Scan for TODO comments in code
    // - Check recent git commits for context
    // - Read from .claude/context files
    // - Integrate with issue tracking systems

    context.currentTasks = ['Performance optimization', 'Type safety improvements'];
    context.errorPatterns = ['TypeScript errors', 'Build failures'];
    context.teamNeeds = ['React best practices', 'Testing strategies'];

    console.log(
      `📋 Analyzed current context: ${context.currentTasks.length} tasks, ${context.teamNeeds.length} team needs`
    );
  }

  /**
   * Determine if we should gather knowledge for a dependency
   */
  private shouldGatherKnowledge(dep: DependencyInfo): boolean {
    // Gather knowledge for:
    // - Major frameworks/libraries
    // - Dependencies with known vulnerabilities
    // - Recently updated dependencies
    // - Core runtime dependencies

    const majorLibraries = ['react', 'express', 'next', 'typescript', 'node'];
    const isMajorLibrary = majorLibraries.some((lib) => dep.name.includes(lib));

    return dep.type === 'runtime' || isMajorLibrary || dep.hasVulnerabilities || false;
  }

  /**
   * Create a dependency-focused knowledge gathering mission
   */
  private createDependencyMission(dep: DependencyInfo): KnowledgeGatheringMission {
    return {
      id: `dep-${dep.name}-${Date.now()}`,
      priority: dep.hasVulnerabilities ? 'critical' : 'high',
      type: 'dependency',
      target: dep.name,
      version: dep.version,
      context: [dep.ecosystem, dep.type],
      requiredInfo: [
        'API documentation',
        'Migration guides',
        'Best practices',
        'Common issues',
        'Security considerations',
      ],
      status: 'pending',
    };
  }

  /**
   * Create a framework-focused knowledge gathering mission
   */
  private createFrameworkMission(framework: DetectedFramework): KnowledgeGatheringMission {
    const priority = framework.usage === 'primary' ? 'high' : 'medium';

    return {
      id: `framework-${framework.name}-${Date.now()}`,
      priority,
      type: 'framework',
      target: framework.name,
      version: framework.version,
      context: [framework.usage, 'best-practices'],
      requiredInfo: [
        'Latest features',
        'Migration guides',
        'Performance optimization',
        'Common patterns',
        'Ecosystem integration',
      ],
      status: 'pending',
    };
  }

  /**
   * Create an API-focused knowledge gathering mission
   */
  private createAPIMission(api: DetectedAPI): KnowledgeGatheringMission {
    return {
      id: `api-${api.name}-${Date.now()}`,
      priority: 'medium',
      type: 'api',
      target: api.name,
      context: [api.type, api.needsAuth ? 'authentication' : 'public'],
      requiredInfo: [
        'Integration guide',
        'Authentication methods',
        'Rate limiting',
        'Error handling',
        'Code examples',
      ],
      status: 'pending',
    };
  }

  /**
   * Create a security-focused knowledge gathering mission
   */
  private createSecurityMission(vulnDeps: DependencyInfo[]): KnowledgeGatheringMission {
    return {
      id: `security-${Date.now()}`,
      priority: 'critical',
      type: 'security',
      target: vulnDeps.map((d) => d.name).join(', '),
      context: ['vulnerabilities', 'security-patches'],
      requiredInfo: [
        'Vulnerability details',
        'Patch availability',
        'Mitigation strategies',
        'Alternative packages',
        'Security best practices',
      ],
      status: 'pending',
    };
  }

  /**
   * Create a performance-focused knowledge gathering mission
   */
  private createPerformanceMission(): KnowledgeGatheringMission {
    const frameworks = this.projectContext?.frameworks.map((f) => f.name) || [];

    return {
      id: `performance-${Date.now()}`,
      priority: 'medium',
      type: 'performance',
      target: 'performance optimization',
      context: frameworks,
      requiredInfo: [
        'Performance benchmarking',
        'Optimization techniques',
        'Monitoring strategies',
        'Common bottlenecks',
        'Profiling tools',
      ],
      status: 'pending',
    };
  }

  /**
   * Create a best practices knowledge gathering mission
   */
  private createBestPracticesMission(): KnowledgeGatheringMission {
    const stack = [
      ...(this.projectContext?.frameworks.map((f) => f.name) || []),
      ...(this.projectContext?.languages.map((l) => l.name) || []),
    ];

    return {
      id: `best-practices-${Date.now()}`,
      priority: 'low',
      type: 'best-practices',
      target: stack.join(' + '),
      context: ['architecture', 'patterns', 'conventions'],
      requiredInfo: [
        'Architectural patterns',
        'Code organization',
        'Testing strategies',
        'CI/CD practices',
        'Team workflows',
      ],
      status: 'pending',
    };
  }

  /**
   * Create an ad-hoc mission for immediate queries
   */
  private createAdHocMission(query: string, context?: string[]): KnowledgeGatheringMission {
    return {
      id: `adhoc-${Date.now()}`,
      priority: 'high',
      type: 'best-practices', // Default type
      target: query,
      context: context || [],
      requiredInfo: ['Comprehensive answer'],
      status: 'pending',
    };
  }

  /**
   * Get priority weight for sorting
   */
  private getPriorityWeight(priority: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[priority as keyof typeof weights] || 0;
  }

  /**
   * Search cached knowledge in context cache
   */
  private async searchCachedKnowledge(query: string, context?: string[]): Promise<any[]> {
    try {
      const results: any[] = [];
      const queryLower = query.toLowerCase();

      // Search context cache for relevant knowledge
      for (const [key, cached] of this.contextCache.entries()) {
        if (cached.query && cached.query.toLowerCase().includes(queryLower)) {
          results.push(cached);
        }

        // Also search by context tags
        if (context && cached.context) {
          const hasMatchingContext = context.some((ctx) =>
            cached.context.some((c: string) => c.toLowerCase().includes(ctx.toLowerCase()))
          );
          if (hasMatchingContext) {
            results.push(cached);
          }
        }
      }

      return results.slice(0, 5); // Top 5 results
    } catch (error) {
      console.error('Failed to search cached knowledge:', error);
      return [];
    }
  }

  /**
   * Format cached knowledge for presentation
   */
  private formatCachedKnowledge(knowledge: any[]): string {
    let formatted = '# Cached Knowledge Results\\n\\n';

    knowledge.forEach((item, index) => {
      formatted += `## Result ${index + 1}\n`;
      formatted += `**Source:** ${item.metadata?.target || 'Unknown'}\n`;
      formatted += `**Context:** ${item.metadata?.context || 'General'}\n`;
      formatted += `**Last Updated:** ${item.metadata?.timestamp || 'Unknown'}\n\n`;
      formatted += `${item.content || 'No content available'}\n\n`;
      formatted += '---\\n\\n';
    });

    return formatted;
  }

  /**
   * Store knowledge in context cache
   */
  private async storeKnowledgeInCache(
    mission: KnowledgeGatheringMission,
    result: any
  ): Promise<void> {
    try {
      const cacheKey = `mission-${mission.id}`;
      const cached = {
        query: mission.target,
        type: mission.type,
        priority: mission.priority,
        context: mission.context,
        requiredInfo: mission.requiredInfo,
        result: result,
        timestamp: Date.now(),
        agentsUsed: result.agentsUsed || [],
        confidence: result.knowledgeConfidence || 0,
      };

      this.contextCache.set(cacheKey, cached);

      // Keep cache size reasonable (limit to 1000 entries)
      if (this.contextCache.size > 1000) {
        const oldestKey = this.contextCache.keys().next().value;
        this.contextCache.delete(oldestKey);
      }
    } catch (error) {
      console.error('Failed to store knowledge in cache:', error);
    }
  }

  /**
   * Start background context monitoring
   */
  private startContextMonitoring(): void {
    // Re-analyze context every hour
    setInterval(
      async () => {
        try {
          const lastUpdate = this.lastAnalysis?.getTime() || 0;
          const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);

          if (hoursSinceUpdate >= this.config.cacheDuration) {
            console.log('🔄 Re-analyzing project context...');
            await this.analyzeProjectContext();
            await this.generateKnowledgeMissions();
          }
        } catch (error) {
          console.error('Context monitoring failed:', error);
        }
      },
      60 * 60 * 1000
    ); // 1 hour

    console.log('🔄 Started background context monitoring');
  }

  /**
   * Get current system status
   */
  getStatus() {
    const missions = Array.from(this.knowledgeMissions.values());

    return {
      projectContext: this.projectContext,
      totalMissions: missions.length,
      pendingMissions: missions.filter((m) => m.status === 'pending').length,
      completedMissions: missions.filter((m) => m.status === 'completed').length,
      failedMissions: missions.filter((m) => m.status === 'failed').length,
      lastAnalysis: this.lastAnalysis,
      swarmStatus: 'active',
    };
  }

  /**
   * Shutdown the system
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Project Context Analyzer...');

    await this.knowledgeSwarm.shutdown();
    this.knowledgeMissions.clear();
    this.contextCache.clear();

    this.emit('analyzerShutdown');
    console.log('✅ Project Context Analyzer shutdown complete');
  }
}

export default ProjectContextAnalyzer;
