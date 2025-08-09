import { getLogger } from "../config/logging-config";
const logger = getLogger("src-knowledge-project-context-analyzer");
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
import { KnowledgeSwarm } from './knowledge-swarm';

const execAsync = promisify(exec);

interface MonorepoInfo {
  type: 'lerna' | 'nx' | 'rush' | 'pnpm' | 'yarn' | 'npm' | 'turbo' | 'bazel' | 'custom' | 'none';
  tool?: string;
  version?: string;
  workspaces?: string[];
  packages?: string[];
  confidence: number;
  configFile?: string;
  hasRootPackageJson: boolean;
  packageManager?: 'npm' | 'yarn' | 'pnpm';
}

interface ProjectContext {
  rootPath: string;
  monorepo: MonorepoInfo;
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
 *
 * @example
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
    this.knowledgeSwarm = new KnowledgeSwarm(config?.["swarmConfig"]);
  }

  /**
   * Initialize the project context analyzer
   */
  async initialize(): Promise<void> {
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
      this.emit('analyzerInitialized', {
        missions: this.knowledgeMissions.size,
        context: this.projectContext,
      });
    } catch (error) {
      logger.error('❌ Project Context Analyzer initialization failed:', error);
      throw error;
    }
  }

  /**
   * Analyze the current project to understand what knowledge is needed
   */
  async analyzeProjectContext(): Promise<ProjectContext> {
    try {
      const context: ProjectContext = {
        rootPath: this.config.projectRoot,
        monorepo: { type: 'none', confidence: 0, hasRootPackageJson: false },
        dependencies: [],
        devDependencies: [],
        frameworks: [],
        languages: [],
        apis: [],
        currentTasks: [],
        errorPatterns: [],
        teamNeeds: [],
      };

      // First detect if this is a monorepo
      await this.detectMonorepo(context);

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
      this.emit('contextAnalyzed', context);

      return context;
    } catch (error) {
      logger.error('❌ Project context analysis failed:', error);
      throw error;
    }
  }

  /**
   * Detect if the project is a monorepo and what type
   *
   * @param context
   */
  private async detectMonorepo(context: ProjectContext): Promise<void> {
    const monorepoIndicators = {
      lerna: {
        files: ['lerna.json'],
        packageJsonFields: ['workspaces'],
        confidence: 0.95,
      },
      nx: {
        files: ['nx.json', 'workspace.json'],
        packageJsonFields: [],
        confidence: 0.95,
      },
      rush: {
        files: ['rush.json'],
        packageJsonFields: [],
        confidence: 0.95,
      },
      pnpm: {
        files: ['pnpm-workspace.yaml', 'pnpm-workspace.yml'],
        packageJsonFields: [],
        confidence: 0.9,
      },
      yarn: {
        files: ['.yarnrc.yml', 'yarn.lock'],
        packageJsonFields: ['workspaces'],
        confidence: 0.8,
      },
      turbo: {
        files: ['turbo.json'],
        packageJsonFields: [],
        confidence: 0.9,
      },
      bazel: {
        files: ['WORKSPACE', 'WORKSPACE.bazel', 'BUILD', 'BUILD.bazel'],
        packageJsonFields: [],
        confidence: 0.85,
      },
    };

    // Check for monorepo indicator files
    for (const [type, indicators] of Object.entries(monorepoIndicators)) {
      for (const file of indicators.files) {
        const filePath = path.join(context.rootPath, file);
        try {
          await readFile(filePath, 'utf-8');
          context.monorepo = {
            type: type as any,
            tool: type,
            confidence: indicators.confidence,
            configFile: file,
            hasRootPackageJson: false,
          };

          // If we found a monorepo config, analyze it further
          await this.analyzeMonorepoStructure(context);
          return;
        } catch {
          // File doesn't exist, continue checking
        }
      }
    }

    // Check package.json for workspace configuration
    try {
      const packageJsonPath = path.join(context.rootPath, 'package.json');
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

      context.monorepo.hasRootPackageJson = true;

      // Check for npm/yarn workspaces
      if (packageJson.workspaces) {
        context.monorepo = {
          type: packageJson.packageManager?.includes('yarn') ? 'yarn' : 'npm',
          tool: packageJson.packageManager?.includes('yarn') ? 'yarn' : 'npm',
          workspaces: Array.isArray(packageJson.workspaces)
            ? packageJson.workspaces
            : packageJson.workspaces.packages || [],
          confidence: 0.85,
          hasRootPackageJson: true,
          packageManager: packageJson.packageManager?.includes('yarn') ? 'yarn' : 'npm',
        };

        await this.analyzeMonorepoStructure(context);
        return;
      }
    } catch {
      // No package.json or error reading it
    }

    // Check for common monorepo directory patterns
    const commonPatterns = ['packages/', 'apps/', 'services/', 'libs/', 'modules/'];
    let matchedPatterns = 0;

    for (const pattern of commonPatterns) {
      try {
        const dirPath = path.join(context.rootPath, pattern);
        const { stdout } = await execAsync(`ls -d ${dirPath} 2>/dev/null || true`);
        if (stdout.trim()) {
          matchedPatterns++;
        }
      } catch {
        // Directory doesn't exist
      }
    }

    if (matchedPatterns >= 2) {
      context.monorepo = {
        type: 'custom',
        confidence: 0.6 + matchedPatterns * 0.1,
        hasRootPackageJson: context.monorepo.hasRootPackageJson,
        packages: commonPatterns.filter(async (pattern) => {
          try {
            const dirPath = path.join(context.rootPath, pattern);
            const { stdout } = await execAsync(`ls -d ${dirPath} 2>/dev/null || true`);
            return stdout.trim() !== '';
          } catch {
            return false;
          }
        }),
      };
    }
  }

  /**
   * Analyze monorepo structure in detail
   *
   * @param context
   */
  private async analyzeMonorepoStructure(context: ProjectContext): Promise<void> {
    if (context.monorepo.type === 'none') return;

    try {
      switch (context.monorepo.type) {
        case 'lerna': {
          const lernaConfig = JSON.parse(
            await readFile(path.join(context.rootPath, 'lerna.json'), 'utf-8')
          );
          context.monorepo.version = lernaConfig?.version;
          context.monorepo.packages = lernaConfig?.packages || ['packages/*'];
          break;
        }

        case 'nx': {
          const nxConfig = JSON.parse(
            await readFile(path.join(context.rootPath, 'nx.json'), 'utf-8')
          );
          // NX has a more complex structure, we'd need to analyze workspace.json too
          context.monorepo.version = nxConfig?.version;
          break;
        }

        case 'pnpm': {
          const pnpmWorkspace = await readFile(
            path.join(context.rootPath, 'pnpm-workspace.yaml'),
            'utf-8'
          );
          // Parse YAML to get packages - simplified for now
          const packagesMatch = pnpmWorkspace.match(/packages:\s*\n((?:\s+-\s+.*\n?)*)/);
          if (packagesMatch) {
            context.monorepo.packages = packagesMatch?.[1]?.split('\n')
              .map((line) => line.trim().replace(/^-\s*/, ''))
              .filter(Boolean);
          }
          break;
        }

        case 'rush': {
          const rushConfig = JSON.parse(
            await readFile(path.join(context.rootPath, 'rush.json'), 'utf-8')
          );
          context.monorepo.version = rushConfig?.rushVersion;
          context.monorepo.packages = rushConfig?.projects?.map((p: any) => p.projectFolder) || [];
          break;
        }
      }

      // Emit monorepo detection event
      this.emit('monorepoDetected', {
        type: context.monorepo.type,
        confidence: context.monorepo.confidence,
        packages: context.monorepo.packages,
      });
    } catch (error) {
      logger.warn('Error analyzing monorepo structure:', error);
    }
  }

  /**
   * Generate knowledge gathering missions based on project context
   */
  async generateKnowledgeMissions(): Promise<void> {
    if (!this.projectContext) {
      throw new Error('Project context not analyzed');
    }

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
    this.emit('missionsGenerated', Array.from(this.knowledgeMissions.values()));
  }

  /**
   * Execute knowledge gathering missions through the swarm
   *
   * @param priority
   */
  async executeMissions(priority?: 'critical' | 'high' | 'medium' | 'low'): Promise<void> {
    const missions = Array.from(this.knowledgeMissions.values())
      .filter((m) => m.status === 'pending')
      .filter((m) => !priority || m.priority === priority)
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    const executionPromises = missions.map((mission) => this.executeMission(mission));

    try {
      await Promise.allSettled(executionPromises);

      const completed = missions.filter((m) => m.status === 'completed').length;
      const failed = missions.filter((m) => m.status === 'failed').length;
      this.emit('missionsExecuted', { completed, failed, total: missions.length });
    } catch (error) {
      logger.error('❌ Mission execution failed:', error);
    }
  }

  /**
   * Execute a single knowledge gathering mission
   *
   * @param mission
   */
  private async executeMission(mission: KnowledgeGatheringMission): Promise<void> {
    mission.status = 'in-progress';
    this.knowledgeMissions.set(mission.id, mission);

    try {
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
      this.emit('missionCompleted', mission);
    } catch (error) {
      logger.error(`❌ Mission failed: ${mission.id}`, error);
      mission.status = 'failed';
    }

    this.knowledgeMissions.set(mission.id, mission);
  }

  /**
   * Query the knowledge base for specific information
   *
   * @param query
   * @param context
   */
  async queryKnowledge(query: string, context?: string[]): Promise<string> {
    try {
      // First, check if we have relevant cached knowledge
      const relevantKnowledge = await this.searchCachedKnowledge(query, context);

      if (relevantKnowledge.length > 0) {
        return this.formatCachedKnowledge(relevantKnowledge);
      }

      // If no cached knowledge, create a new mission and execute it
      const mission = this.createAdHocMission(query, context);
      await this.executeMission(mission);

      return mission.results?.consolidatedResponse || 'No results found';
    } catch (error) {
      logger.error('Knowledge query failed:', error);
      throw error;
    }
  }

  /**
   * Analyze dependencies from package.json, Cargo.toml, etc.
   *
   * @param context
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
    } catch (error) {
      // Log dependency analysis errors for debugging
      logger.warn(
        'Error analyzing dependencies:',
        error instanceof Error ? error.message : error
      );
    }

    // Add support for other package managers (Cargo.toml, requirements.txt, etc.)
    await this.analyzeCargoToml(context);
    await this.analyzeRequirementsTxt(context);
  }

  /**
   * Detect frameworks and libraries being used
   *
   * @param context
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
  }

  /**
   * Analyze programming languages used in the project
   *
   * @param context
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
    } catch (error) {
      logger.warn(
        'Error analyzing languages:',
        error instanceof Error ? error.message : error
      );
    }
  }

  /**
   * Analyze Cargo.toml for Rust dependencies
   *
   * @param context
   */
  private async analyzeCargoToml(context: ProjectContext): Promise<void> {
    try {
      const cargoPath = path.join(context.rootPath, 'Cargo.toml');
      try {
        const cargoContent = await readFile(cargoPath, 'utf8');

        // Basic Cargo.toml parsing (simplified)
        const dependencySection = cargoContent.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
        if (dependencySection) {
          const deps = dependencySection[1]?.match(/^([a-zA-Z0-9_-]+)\s*=/gm) || [];
          deps.forEach((dep) => {
            const name = dep.replace(/\s*=.*/, '').trim();
            context.dependencies.push({
              name,
              version: 'unknown',
              type: 'runtime',
              ecosystem: 'cargo',
            });
          });
        }
      } catch {
        // File doesn't exist, skip
      }
    } catch (error) {
      logger.warn(
        'Error analyzing Cargo.toml:',
        error instanceof Error ? error.message : error
      );
    }
  }

  /**
   * Analyze requirements.txt for Python dependencies
   *
   * @param context
   */
  private async analyzeRequirementsTxt(context: ProjectContext): Promise<void> {
    try {
      const requirementsPath = path.join(context.rootPath, 'requirements.txt');
      try {
        const requirementsContent = await readFile(requirementsPath, 'utf8');

        requirementsContent.split('\n').forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [name, version] = trimmed.split(/[>=<~!]/);
            context.dependencies.push({
              name: name.trim(),
              version: version ? version.trim() : 'unknown',
              type: 'runtime',
              ecosystem: 'pip',
            });
          }
        });
      } catch {
        // File doesn't exist, skip
      }
    } catch (error) {
      logger.warn(
        'Error analyzing requirements.txt:',
        error instanceof Error ? error.message : error
      );
    }
  }

  /**
   * Detect API usage patterns
   *
   * @param context
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
  }

  /**
   * Analyze current development context (TODOs, issues, etc.)
   *
   * @param context
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
  }

  /**
   * Determine if we should gather knowledge for a dependency
   *
   * @param dep
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
   *
   * @param dep
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
   *
   * @param framework
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
   *
   * @param api
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
   *
   * @param vulnDeps
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
   *
   * @param query
   * @param context
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
   *
   * @param priority
   */
  private getPriorityWeight(priority: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[priority as keyof typeof weights] || 0;
  }

  /**
   * Search cached knowledge in context cache
   *
   * @param query
   * @param context
   */
  private async searchCachedKnowledge(query: string, context?: string[]): Promise<any[]> {
    try {
      const results: any[] = [];
      const queryLower = query.toLowerCase();

      // Search context cache for relevant knowledge
      for (const [_key, cached] of this.contextCache.entries()) {
        if (cached.query?.toLowerCase().includes(queryLower)) {
          results?.push(cached);
        }

        // Also search by context tags
        if (context && cached.context) {
          const hasMatchingContext = context.some((ctx) =>
            cached.context.some((c: string) => c.toLowerCase().includes(ctx.toLowerCase()))
          );
          if (hasMatchingContext) {
            results?.push(cached);
          }
        }
      }

      return results?.slice(0, 5); // Top 5 results
    } catch (error) {
      logger.error('Failed to search cached knowledge:', error);
      return [];
    }
  }

  /**
   * Format cached knowledge for presentation
   *
   * @param knowledge
   */
  private formatCachedKnowledge(knowledge: any[]): string {
    let formatted = '# Cached Knowledge Results\\n\\n';

    knowledge.forEach((item, index) => {
      formatted += `## Result ${index + 1}\n`;
      formatted += `**Source:** ${item?.metadata?.target || 'Unknown'}\n`;
      formatted += `**Context:** ${item?.metadata?.context || 'General'}\n`;
      formatted += `**Last Updated:** ${item?.metadata?.timestamp || 'Unknown'}\n\n`;
      formatted += `${item?.content || 'No content available'}\n\n`;
      formatted += '---\\n\\n';
    });

    return formatted;
  }

  /**
   * Store knowledge in context cache
   *
   * @param mission
   * @param result
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
        agentsUsed: result?.agentsUsed || [],
        confidence: result?.knowledgeConfidence || 0,
      };

      this.contextCache.set(cacheKey, cached);

      // Keep cache size reasonable (limit to 1000 entries)
      if (this.contextCache.size > 1000) {
        const oldestKey = this.contextCache.keys().next().value;
        this.contextCache.delete(oldestKey);
      }
    } catch (error) {
      logger.error('Failed to store knowledge in cache:', error);
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
            await this.analyzeProjectContext();
            await this.generateKnowledgeMissions();
          }
        } catch (error) {
          logger.error('Context monitoring failed:', error);
        }
      },
      60 * 60 * 1000
    ); // 1 hour
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
   * Get monorepo detection results
   */
  getMonorepoInfo(): MonorepoInfo | null {
    return this.projectContext?.monorepo || null;
  }

  /**
   * Check if project is a monorepo with high confidence
   *
   * @param confidenceThreshold
   */
  isMonorepo(confidenceThreshold: number = 0.7): boolean {
    const monorepo = this.getMonorepoInfo();
    return (
      monorepo !== null && monorepo.type !== 'none' && monorepo.confidence >= confidenceThreshold
    );
  }

  /**
   * Shutdown the system
   */
  async shutdown(): Promise<void> {
    await this.knowledgeSwarm.shutdown();
    this.knowledgeMissions.clear();
    this.contextCache.clear();

    this.emit('analyzerShutdown');
  }
}

export default ProjectContextAnalyzer;
export type { MonorepoInfo, ProjectContext };
