/**
 * @file Project-context-analyzer implementation.
 */

import { Logger } from '../core/logger.ts';

const logger = new Logger('src-knowledge-project-context-analyzer');

/**
 * Hive-Controlled FACT System for Claude-Zen.
 *
 * The Hive Mind intelligently determines what external knowledge to gather.
 * Based on:
 * - Project dependencies (package.json, Cargo.toml, etc.)
 * - Code analysis (imports, APIs used, frameworks detected)
 * - Development context (current tasks, error patterns)
 * - Team expertise gaps (learning needs, documentation requests).
 *
 * Architecture:
 * - Hive analyzes project and determines knowledge needs
 * - Domain swarms receive targeted FACT gathering missions
 * - Service swarms execute specific knowledge collection tasks
 * - Results are cached and shared across the organization.
 */

import { exec } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { KnowledgeSwarm } from './knowledge-swarm.ts';

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
  swarmConfig?: any; // KnowledgeSwarm config type
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
 * Project Context Analyzer.
 * Analyzes project context and determines what external knowledge should be gathered.
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
      ...config,
      analysisDepth: config.analysisDepth || 'medium',
      autoUpdate: config.autoUpdate ?? true,
      cacheDuration: config.cacheDuration ?? 24, // 24 hours
      priorityThresholds: config.priorityThresholds || {
        critical: 0.8, // 80%+ usage
        high: 0.5, // 50%+ usage
        medium: 0.2, // 20%+ usage
      },
    };
    this.knowledgeSwarm = new KnowledgeSwarm(config?.['swarmConfig']);
  }

  /**
   * Initialize the project context analyzer.
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
   * Analyze the current project to understand what knowledge is needed.
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
   * Detect if the project is a monorepo and what type.
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
   * Analyze monorepo structure in detail.
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
            context.monorepo.packages =
              packagesMatch?.[1]
                ?.split('\n')
                .map((line) => line.trim().replace(/^-\s*/, ''))
                .filter(Boolean) || [];
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

        case 'bazel': {
          await this.analyzeBazelWorkspace(context);
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
   * Analyze Bazel workspace structure for comprehensive monorepo understanding.
   *
   * @param context - Project context to populate with Bazel information.
   */
  private async analyzeBazelWorkspace(context: ProjectContext): Promise<void> {
    try {
      // Parse WORKSPACE file for external dependencies and version info
      const workspaceContent = await this.parseBazelWorkspace(context.rootPath);

      // Try Bazel query first for accurate dependency graph, fallback to BUILD parsing
      let targets: any[] = [];
      let dependencies: Record<string, Record<string, number>> = {};

      try {
        // Use bazel query for ground truth dependency analysis
        const queryResults = await this.runBazelQuery(context.rootPath);
        targets = queryResults.targets;
        dependencies = queryResults.dependencies;

        logger.info('🎯 Using Bazel query for accurate dependency analysis', {
          targetsFound: targets.length,
        });
      } catch (queryError) {
        logger.warn('Bazel query failed, falling back to BUILD file parsing:', queryError);

        // Fallback: Discover all BUILD files and parse targets manually
        targets = await this.discoverBazelTargets(context.rootPath);
        dependencies = await this.analyzeBazelDependencies(context.rootPath, targets);
      }

      // Extract packages from targets (directory-based)
      const packages = this.extractBazelPackages(targets);

      // Analyze .bzl files for custom rules and macros
      const bzlAnalysis = await this.analyzeBzlFiles(context.rootPath);

      // Update context with Bazel information
      context.monorepo.version = workspaceContent.workspaceName || 'unknown';
      context.monorepo.packages = packages;
      context.monorepo.workspaces = packages;

      // Store Bazel-specific metadata for GNN domain analysis
      (context.monorepo as any).bazelMetadata = {
        workspaceName: workspaceContent.workspaceName || undefined,
        externalDeps: workspaceContent.externalDeps,
        targets: targets,
        targetDependencies: dependencies,
        languages: workspaceContent.languages,
        toolchains: workspaceContent.toolchains,
        customRules: bzlAnalysis.customRules,
        macros: bzlAnalysis.macros,
        starlarkFiles: bzlAnalysis.bzlFiles,
        queryUsed: targets.length > 0 && dependencies && Object.keys(dependencies).length > 0,
        // Bzlmod (MODULE.bazel) support
        bzlmodEnabled: workspaceContent.bzlmodEnabled || undefined,
        moduleInfo: workspaceContent.moduleInfo || undefined,
      };

      logger.info('Bazel workspace analyzed', {
        packages: packages.length,
        targets: targets.length,
        externalDeps: workspaceContent.externalDeps.length,
        bzlFiles: bzlAnalysis.bzlFiles.length,
        customRules: bzlAnalysis.customRules.length,
        queryUsed: (context.monorepo as any).bazelMetadata.queryUsed,
      });
    } catch (error) {
      logger.error('Failed to analyze Bazel workspace:', error);
      // Fallback to basic package discovery
      context.monorepo.packages = await this.discoverBazelPackagesBasic(context.rootPath);
    }
  }

  /**
   * Parse WORKSPACE file for external dependencies and configuration.
   * Also supports modern MODULE.bazel files (Bzlmod).
   *
   * @param rootPath
   */
  private async parseBazelWorkspace(rootPath: string): Promise<{
    workspaceName?: string;
    externalDeps: Array<{ name: string; type: string; version?: string }>;
    languages: string[];
    toolchains: string[];
    bzlmodEnabled?: boolean;
    moduleInfo?: {
      name: string;
      version?: string;
      dependencies: Array<{
        name: string;
        version: string;
        repo_name?: string;
      }>;
    };
  }> {
    const result = {
      workspaceName: undefined as string | undefined,
      externalDeps: [] as Array<{
        name: string;
        type: string;
        version?: string;
      }>,
      languages: [] as string[],
      toolchains: [] as string[],
      bzlmodEnabled: false,
      moduleInfo: undefined as
        | {
            name: string;
            version?: string;
            dependencies: Array<{
              name: string;
              version: string;
              repo_name?: string;
            }>;
          }
        | undefined,
    };

    // First check for modern MODULE.bazel (Bzlmod)
    try {
      const moduleContent = await readFile(path.join(rootPath, 'MODULE.bazel'), 'utf-8');
      result.bzlmodEnabled = true;
      result.moduleInfo = this.parseModuleBazel(moduleContent);

      logger.info('📦 Found MODULE.bazel - using Bzlmod module system', {
        moduleName: result.moduleInfo.name,
        dependencies: result.moduleInfo.dependencies.length,
      });

      // Extract language/toolchain info from module dependencies
      this.extractLanguagesFromModuleDeps(result.moduleInfo.dependencies, result);
    } catch {
      // MODULE.bazel not found, continue with legacy WORKSPACE parsing
    }

    // Parse legacy WORKSPACE file (still needed even with Bzlmod sometimes)
    const workspaceFiles = ['WORKSPACE', 'WORKSPACE.bazel'];
    let workspaceContent = '';

    for (const file of workspaceFiles) {
      try {
        workspaceContent = await readFile(path.join(rootPath, file), 'utf-8');
        break;
      } catch {}
    }

    if (!workspaceContent && !result.bzlmodEnabled) {
      const finalResult: {
        workspaceName?: string;
        externalDeps: Array<{ name: string; type: string; version?: string }>;
        languages: string[];
        toolchains: string[];
        bzlmodEnabled?: boolean;
        moduleInfo?: {
          name: string;
          version?: string;
          dependencies: Array<{
            name: string;
            version: string;
            repo_name?: string;
          }>;
        };
      } = {
        externalDeps: result.externalDeps,
        languages: result.languages,
        toolchains: result.toolchains,
      };

      if (result.workspaceName) {
        finalResult.workspaceName = result.workspaceName;
      }
      if (result.bzlmodEnabled) {
        finalResult.bzlmodEnabled = result.bzlmodEnabled;
      }
      if (result.moduleInfo) {
        finalResult.moduleInfo = result.moduleInfo;
      }

      return finalResult;
    }

    // Extract workspace name
    const workspaceMatch = workspaceContent.match(/workspace\s*\(\s*name\s*=\s*"([^"]+)"/);
    result.workspaceName = workspaceMatch?.[1];

    // Extract external dependencies
    const depPatterns = [
      /http_archive\s*\(\s*name\s*=\s*"([^"]+)"/g,
      /git_repository\s*\(\s*name\s*=\s*"([^"]+)"/g,
      /maven_jar\s*\(\s*name\s*=\s*"([^"]+)"/g,
      /rules_\w+\s*\(\s*name\s*=\s*"([^"]+)"/g,
    ];

    for (const pattern of depPatterns) {
      let match;
      while ((match = pattern.exec(workspaceContent)) !== null) {
        const type = match[0].includes('http_archive')
          ? 'http_archive'
          : match[0].includes('git_repository')
            ? 'git_repository'
            : match[0].includes('maven_jar')
              ? 'maven_jar'
              : 'rules';
        result.externalDeps.push({ name: match[1], type });
      }
    }

    // Detect languages from rules
    const languageRules = {
      rules_go: 'go',
      rules_python: 'python',
      rules_java: 'java',
      rules_kotlin: 'kotlin',
      rules_scala: 'scala',
      rules_rust: 'rust',
      rules_nodejs: 'javascript',
      rules_typescript: 'typescript',
      rules_cc: 'cpp',
    };

    for (const [rule, lang] of Object.entries(languageRules)) {
      if (workspaceContent.includes(rule)) {
        result.languages.push(lang);
      }
    }

    // Detect toolchains
    if (workspaceContent.includes('rules_docker')) result.toolchains.push('docker');
    if (workspaceContent.includes('rules_k8s')) result.toolchains.push('kubernetes');
    if (workspaceContent.includes('rules_proto')) result.toolchains.push('protobuf');

    const finalResult: {
      workspaceName?: string;
      externalDeps: Array<{ name: string; type: string; version?: string }>;
      languages: string[];
      toolchains: string[];
      bzlmodEnabled?: boolean;
      moduleInfo?: {
        name: string;
        version?: string;
        dependencies: Array<{
          name: string;
          version: string;
          repo_name?: string;
        }>;
      };
    } = {
      externalDeps: result.externalDeps,
      languages: result.languages,
      toolchains: result.toolchains,
    };

    if (result.workspaceName) {
      finalResult.workspaceName = result.workspaceName;
    }
    if (result.bzlmodEnabled) {
      finalResult.bzlmodEnabled = result.bzlmodEnabled;
    }
    if (result.moduleInfo) {
      finalResult.moduleInfo = result.moduleInfo;
    }

    return finalResult;
  }

  /**
   * Discover all BUILD files and parse targets.
   *
   * @param rootPath
   */
  private async discoverBazelTargets(rootPath: string): Promise<
    Array<{
      package: string;
      name: string;
      type: string;
      visibility?: string[];
      deps?: string[];
      srcs?: string[];
    }>
  > {
    const targets: Array<{
      package: string;
      name: string;
      type: string;
      visibility?: string[];
      deps?: string[];
      srcs?: string[];
    }> = [];

    try {
      // Use find command to locate all BUILD files
      const { stdout } = await execAsync(
        `find "${rootPath}" -name "BUILD" -o -name "BUILD.bazel" 2>/dev/null`
      );
      const buildFiles = stdout.trim().split('\n').filter(Boolean);

      for (const buildFile of buildFiles) {
        const packagePath = path.relative(rootPath, path.dirname(buildFile));
        const buildContent = await readFile(buildFile, 'utf-8');
        const fileTargets = this.parseBazelBuildFile(buildContent, packagePath);
        targets.push(...fileTargets);
      }
    } catch (error) {
      logger.warn('Error discovering Bazel targets:', error);
    }

    return targets;
  }

  /**
   * Parse a BUILD file to extract targets.
   *
   * @param content
   * @param packagePath
   */
  private parseBazelBuildFile(
    content: string,
    packagePath: string
  ): Array<{
    package: string;
    name: string;
    type: string;
    visibility?: string[];
    deps?: string[];
    srcs?: string[];
  }> {
    const targets: Array<{
      package: string;
      name: string;
      type: string;
      visibility?: string[];
      deps?: string[];
      srcs?: string[];
    }> = [];

    // Common Bazel rule patterns
    const rulePatterns = [
      // Language-specific rules
      /(java_library|java_binary|java_test)\s*\(/g,
      /(py_library|py_binary|py_test)\s*\(/g,
      /(cc_library|cc_binary|cc_test)\s*\(/g,
      /(go_library|go_binary|go_test)\s*\(/g,
      /(ts_library|ts_config|nodejs_binary)\s*\(/g,
      // Generic rules
      /(genrule|filegroup|config_setting)\s*\(/g,
    ];

    for (const pattern of rulePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const ruleType = match[1];
        const ruleStart = match.index + match[0].length;

        // Extract the rule block (simplified parsing)
        const ruleBlock = this.extractBazelRuleBlock(content, ruleStart);
        const target = this.parseTargetAttributes(ruleBlock, ruleType, packagePath);

        if (target.name) {
          targets.push(target);
        }
      }
    }

    return targets;
  }

  /**
   * Extract a Bazel rule block from content starting at a position.
   *
   * @param content
   * @param startPos
   */
  private extractBazelRuleBlock(content: string, startPos: number): string {
    let depth = 0;
    let i = startPos;

    // Find the opening parenthesis and track depth
    while (i < content.length) {
      const char = content[i];
      if (char === '(') depth++;
      else if (char === ')') depth--;

      if (depth === 0) break;
      i++;
    }

    return content.substring(startPos, i);
  }

  /**
   * Parse target attributes from a rule block.
   *
   * @param ruleBlock
   * @param ruleType
   * @param packagePath
   */
  private parseTargetAttributes(
    ruleBlock: string,
    ruleType: string,
    packagePath: string
  ): {
    package: string;
    name: string;
    type: string;
    visibility?: string[];
    deps?: string[];
    srcs?: string[];
  } {
    const target: {
      package: string;
      name: string;
      type: string;
      visibility?: string[];
      deps?: string[];
      srcs?: string[];
    } = {
      package: packagePath,
      name: '',
      type: ruleType,
    };

    // Extract name
    const nameMatch = ruleBlock.match(/name\s*=\s*"([^"]+)"/);
    target.name = nameMatch?.[1] || '';

    // Extract deps
    const depsMatch = ruleBlock.match(/deps\s*=\s*\[(.*?)\]/s);
    if (depsMatch && depsMatch[1]) {
      const deps = depsMatch[1]
        .split(',')
        .map((dep) => dep.trim().replace(/['"]/g, ''))
        .filter((dep) => dep && dep.startsWith('//'));
      if (deps.length > 0) {
        target.deps = deps;
      }
    }

    // Extract srcs
    const srcsMatch = ruleBlock.match(/srcs\s*=\s*\[(.*?)\]/s);
    if (srcsMatch && srcsMatch[1]) {
      const srcs = srcsMatch[1]
        .split(',')
        .map((src) => src.trim().replace(/['"]/g, ''))
        .filter(Boolean);
      if (srcs.length > 0) {
        target.srcs = srcs;
      }
    }

    // Extract visibility
    const visibilityMatch = ruleBlock.match(/visibility\s*=\s*\[(.*?)\]/s);
    if (visibilityMatch && visibilityMatch[1]) {
      const visibility = visibilityMatch[1]
        .split(',')
        .map((vis) => vis.trim().replace(/['"]/g, ''))
        .filter(Boolean);
      if (visibility.length > 0) {
        target.visibility = visibility;
      }
    }

    return target;
  }

  /**
   * Extract unique packages from targets.
   *
   * @param targets
   */
  private extractBazelPackages(
    targets: Array<{ package: string; name: string; type: string }>
  ): string[] {
    const packages = new Set<string>();

    for (const target of targets) {
      if (target.package && target.package !== '.') {
        packages.add(target.package);
      }
    }

    return Array.from(packages);
  }

  /**
   * Analyze target dependencies for domain mapping.
   *
   * @param rootPath
   * @param targets
   */
  private async analyzeBazelDependencies(
    rootPath: string,
    targets: Array<{
      package: string;
      name: string;
      type: string;
      deps?: string[];
    }>
  ): Promise<Record<string, Record<string, number>>> {
    const dependencies: Record<string, Record<string, number>> = {};

    for (const target of targets) {
      if (!target.deps || target.deps.length === 0) continue;

      const sourcePackage = target.package || 'root';

      for (const dep of target.deps) {
        // Parse Bazel target label (//package:target)
        const depMatch = dep.match(/^\/\/([^:]+):/);
        const targetPackage = depMatch?.[1] || '';

        if (targetPackage && targetPackage !== sourcePackage) {
          if (!dependencies[sourcePackage]) {
            dependencies[sourcePackage] = {};
          }
          dependencies[sourcePackage][targetPackage] =
            (dependencies[sourcePackage][targetPackage] || 0) + 1;
        }
      }
    }

    return dependencies;
  }

  /**
   * Fallback basic package discovery for Bazel workspaces.
   *
   * @param rootPath
   */
  private async discoverBazelPackagesBasic(rootPath: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(
        `find "${rootPath}" -name "BUILD" -o -name "BUILD.bazel" 2>/dev/null`
      );
      const buildFiles = stdout.trim().split('\n').filter(Boolean);

      const packages = buildFiles
        .map((file) => path.relative(rootPath, path.dirname(file)))
        .filter((pkg) => pkg !== '.')
        .sort();

      return [...new Set(packages)];
    } catch (error) {
      logger.warn('Basic Bazel package discovery failed:', error);
      return [];
    }
  }

  /**
   * Run Bazel query for accurate dependency analysis.
   * This provides the ground truth dependency graph compared to BUILD file parsing.
   *
   * @param rootPath
   */
  private async runBazelQuery(rootPath: string): Promise<{
    targets: Array<{
      package: string;
      name: string;
      type: string;
      visibility?: string[];
      deps?: string[];
      srcs?: string[];
    }>;
    dependencies: Record<string, Record<string, number>>;
  }> {
    try {
      // Check if bazel binary exists
      await execAsync('which bazel', { cwd: rootPath });

      logger.info('🔍 Running Bazel query for accurate dependency analysis...');

      // Get all targets in the workspace
      const { stdout: targetsOutput } = await execAsync(
        'bazel query "//..." --output=build 2>/dev/null',
        { cwd: rootPath, timeout: 30000 } // 30 second timeout
      );

      // Get dependency information
      const { stdout: depsOutput } = await execAsync(
        'bazel query "deps(//...)" --output=graph 2>/dev/null',
        { cwd: rootPath, timeout: 30000 } // 30 second timeout
      );

      // Parse targets from build output
      const targets = this.parseBazelQueryTargets(targetsOutput);

      // Parse dependencies from graph output
      const dependencies = this.parseBazelQueryDependencies(depsOutput);

      logger.info('✅ Bazel query completed successfully', {
        targets: targets.length,
        dependencyRelations: Object.keys(dependencies).length,
      });

      return { targets, dependencies };
    } catch (error) {
      logger.debug('Bazel query failed:', error);
      throw new Error(`Bazel query execution failed: ${error}`);
    }
  }

  /**
   * Parse targets from Bazel query --output=build.
   *
   * @param buildOutput
   */
  private parseBazelQueryTargets(buildOutput: string): Array<{
    package: string;
    name: string;
    type: string;
    visibility?: string[];
    deps?: string[];
    srcs?: string[];
  }> {
    const targets: Array<{
      package: string;
      name: string;
      type: string;
      visibility?: string[];
      deps?: string[];
      srcs?: string[];
    }> = [];

    // Split into rule blocks
    const ruleBlocks = buildOutput.split(/(?=^[a-z_]+\s*\()/gm).filter(Boolean);

    for (const block of ruleBlocks) {
      try {
        const target = this.parseTargetAttributes(block, '', '');
        if (target.name) {
          // Extract package from target label
          const packageMatch = block.match(/^# (\/\/[^:]+)/);
          const packagePath =
            packageMatch && packageMatch[1] ? packageMatch[1].replace('//', '') : '';
          target.package = packagePath;
          targets.push(target);
        }
      } catch (error) {}
    }

    return targets;
  }

  /**
   * Parse dependencies from Bazel query --output=graph.
   *
   * @param graphOutput
   */
  private parseBazelQueryDependencies(graphOutput: string): Record<string, Record<string, number>> {
    const dependencies: Record<string, Record<string, number>> = {};

    // Parse DOT graph format
    const lines = graphOutput.split('\n').filter((line) => line.includes('->'));

    for (const line of lines) {
      const match = line.match(/^\s*"([^"]+)"\s*->\s*"([^"]+)"/);
      if (match) {
        const source = this.extractPackageFromTarget(match[1] || '');
        const target = this.extractPackageFromTarget(match[2] || '');

        if (source && target && source !== target) {
          if (!dependencies[source]) {
            dependencies[source] = {};
          }
          dependencies[source][target] = (dependencies[source][target] || 0) + 1;
        }
      }
    }

    return dependencies;
  }

  /**
   * Extract package name from Bazel target label.
   *
   * @param targetLabel
   */
  private extractPackageFromTarget(targetLabel: string): string {
    // Handle various Bazel target formats: //package:target, @repo//package:target, etc.
    const match = targetLabel.match(/(?:@[^/]+)?\/\/([^:]+)/);
    return match?.[1] || '';
  }

  /**
   * Analyze .bzl files for custom rules and macros.
   * This provides insights into custom build logic and architectural patterns.
   *
   * @param rootPath
   */
  private async analyzeBzlFiles(rootPath: string): Promise<{
    bzlFiles: string[];
    customRules: Array<{
      name: string;
      file: string;
      type: 'rule' | 'macro';
      parameters: string[];
      description?: string;
    }>;
    macros: Array<{
      name: string;
      file: string;
      usedRules: string[];
      parameters: string[];
    }>;
  }> {
    const result = {
      bzlFiles: [] as string[],
      customRules: [] as Array<{
        name: string;
        file: string;
        type: 'rule' | 'macro';
        parameters: string[];
        description?: string;
      }>,
      macros: [] as Array<{
        name: string;
        file: string;
        usedRules: string[];
        parameters: string[];
      }>,
    };

    try {
      // Find all .bzl files
      const { stdout } = await execAsync(`find "${rootPath}" -name "*.bzl" 2>/dev/null`);
      const bzlFiles = stdout.trim().split('\n').filter(Boolean);
      result.bzlFiles = bzlFiles.map((file) => path.relative(rootPath, file));

      // Analyze each .bzl file
      for (const bzlFile of bzlFiles) {
        try {
          const content = await readFile(bzlFile, 'utf-8');
          const relativePath = path.relative(rootPath, bzlFile);

          // Extract custom rules
          const ruleMatches = content.matchAll(/^([a-z_]+)\s*=\s*rule\s*\(/gm);
          for (const match of ruleMatches) {
            const ruleName = match[1];
            const ruleBlock = this.extractStarlarkFunctionBlock(content, match.index || 0);
            const parameters = this.extractStarlarkParameters(ruleBlock);

            result.customRules.push({
              name: ruleName || '',
              file: relativePath,
              type: 'rule',
              parameters,
            });
          }

          // Extract macros (functions that call other rules)
          const macroMatches = content.matchAll(/^def\s+([a-z_]+)\s*\(/gm);
          for (const match of macroMatches) {
            const macroName = match[1];
            const macroBlock = this.extractStarlarkFunctionBlock(content, match.index || 0);
            const parameters = this.extractStarlarkParameters(macroBlock);
            const usedRules = this.extractUsedRules(macroBlock);

            result.macros.push({
              name: macroName || '',
              file: relativePath,
              usedRules,
              parameters,
            });
          }
        } catch (error) {
          logger.debug(`Failed to analyze .bzl file ${bzlFile}:`, error);
        }
      }

      logger.info('📜 Starlark (.bzl) analysis complete', {
        bzlFiles: result.bzlFiles.length,
        customRules: result.customRules.length,
        macros: result.macros.length,
      });
    } catch (error) {
      logger.warn('Failed to analyze .bzl files:', error);
    }

    return result;
  }

  /**
   * Extract Starlark function block starting from a position.
   *
   * @param content
   * @param startIndex
   */
  private extractStarlarkFunctionBlock(content: string, startIndex: number): string {
    const lines = content.substring(startIndex).split('\n');
    const result: string[] = [];
    let indentLevel = 0;
    let inFunction = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed && !inFunction) continue;

      if (!inFunction && (trimmed.includes('=') || trimmed.startsWith('def'))) {
        inFunction = true;
        indentLevel = line.length - line.trimStart().length;
        result.push(line);
        continue;
      }

      if (inFunction) {
        const lineIndent = line.length - line.trimStart().length;
        if (trimmed && lineIndent <= indentLevel && !line.startsWith(' ')) {
          break; // End of function
        }
        result.push(line);
      }
    }

    return result.join('\n');
  }

  /**
   * Extract parameters from Starlark function definition.
   *
   * @param functionBlock
   */
  private extractStarlarkParameters(functionBlock: string): string[] {
    const paramMatch = functionBlock.match(/\(([^)]*)\)/s);
    if (!paramMatch?.[1]) return [];

    return paramMatch[1]
      .split(',')
      .map((param) => param.trim().split(/[=:]/)[0]?.trim() || '')
      .filter((param) => param && param !== 'ctx');
  }

  /**
   * Extract rules used within a Starlark macro.
   *
   * @param macroBlock
   */
  private extractUsedRules(macroBlock: string): string[] {
    const rulePattern = /([a-z_]+)\s*\(/g;
    const rules = new Set<string>();

    let match;
    while ((match = rulePattern.exec(macroBlock)) !== null) {
      const ruleName = match[1];
      // Filter out common Python functions and focus on likely Bazel rules
      if (!['def', 'if', 'for', 'len', 'str', 'int', 'print', 'fail'].includes(ruleName)) {
        rules.add(ruleName);
      }
    }

    return Array.from(rules);
  }

  /**
   * Parse MODULE.bazel file for Bzlmod module system.
   *
   * @param moduleContent
   */
  private parseModuleBazel(moduleContent: string): {
    name: string;
    version?: string;
    dependencies: Array<{ name: string; version: string; repo_name?: string }>;
  } {
    const result: {
      name: string;
      version?: string;
      dependencies: Array<{
        name: string;
        version: string;
        repo_name?: string;
      }>;
    } = {
      name: '',
      dependencies: [],
    };

    // Extract module name
    const moduleMatch = moduleContent.match(
      /module\s*\(\s*name\s*=\s*"([^"]+)"(?:\s*,\s*version\s*=\s*"([^"]+)")?/
    );
    if (moduleMatch) {
      result.name = moduleMatch[1] || '';
      if (moduleMatch[2]) {
        result.version = moduleMatch[2];
      }
    }

    // Extract bazel_dep dependencies
    const depMatches = moduleContent.matchAll(
      /bazel_dep\s*\(\s*name\s*=\s*"([^"]+)"\s*,\s*version\s*=\s*"([^"]+)"(?:\s*,\s*repo_name\s*=\s*"([^"]+)")?/g
    );
    for (const match of depMatches) {
      const dep: { name: string; version: string; repo_name?: string } = {
        name: match[1] || '',
        version: match[2] || '',
      };
      if (match[3]) {
        dep.repo_name = match[3];
      }
      result.dependencies.push(dep);
    }

    return result;
  }

  /**
   * Extract language and toolchain information from Bzlmod dependencies.
   *
   * @param dependencies
   * @param result
   * @param result.languages
   * @param result.toolchains
   */
  private extractLanguagesFromModuleDeps(
    dependencies: Array<{ name: string; version: string; repo_name?: string }>,
    result: { languages: string[]; toolchains: string[] }
  ): void {
    const moduleLanguageMap: Record<string, string> = {
      rules_java: 'java',
      rules_python: 'python',
      rules_go: 'go',
      rules_kotlin: 'kotlin',
      rules_scala: 'scala',
      rules_rust: 'rust',
      rules_nodejs: 'javascript',
      rules_typescript: 'typescript',
      rules_cc: 'cpp',
      rules_swift: 'swift',
      rules_dotnet: 'csharp',
    };

    const moduleToolchainMap: Record<string, string> = {
      rules_docker: 'docker',
      rules_k8s: 'kubernetes',
      rules_proto: 'protobuf',
      rules_oci: 'containers',
      gazelle: 'code-generation',
      buildtools: 'build-tools',
    };

    for (const dep of dependencies) {
      // Check for language modules
      const depName = dep.name || '';
      if (moduleLanguageMap[depName]) {
        result.languages.push(moduleLanguageMap[depName]);
      }

      // Check for toolchain modules
      if (moduleToolchainMap[depName]) {
        result.toolchains.push(moduleToolchainMap[depName]);
      }

      // Check for language patterns in module names
      if (depName.includes('java') || depName.includes('jvm')) {
        result.languages.push('java');
      } else if (depName.includes('python') || depName.includes('py')) {
        result.languages.push('python');
      } else if (depName.includes('go')) {
        result.languages.push('go');
      } else if (depName.includes('rust')) {
        result.languages.push('rust');
      } else if (depName.includes('node') || depName.includes('js')) {
        result.languages.push('javascript');
      }
    }

    // Remove duplicates
    result.languages = [...new Set(result.languages)];
    result.toolchains = [...new Set(result.toolchains)];
  }

  /**
   * Generate knowledge gathering missions based on project context.
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
   * Execute knowledge gathering missions through the swarm.
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
      this.emit('missionsExecuted', {
        completed,
        failed,
        total: missions.length,
      });
    } catch (error) {
      logger.error('❌ Mission execution failed:', error);
    }
  }

  /**
   * Execute a single knowledge gathering mission.
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
   * Query the knowledge base for specific information.
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
      logger.warn('Error analyzing dependencies:', error instanceof Error ? error.message : error);
    }

    // Add support for other package managers (Cargo.toml, requirements.txt, etc.)
    await this.analyzeCargoToml(context);
    await this.analyzeRequirementsTxt(context);
  }

  /**
   * Detect frameworks and libraries being used.
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
   * Analyze programming languages used in the project.
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
      logger.warn('Error analyzing languages:', error instanceof Error ? error.message : error);
    }
  }

  /**
   * Analyze Cargo.toml for Rust dependencies.
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
      logger.warn('Error analyzing Cargo.toml:', error instanceof Error ? error.message : error);
    }
  }

  /**
   * Analyze requirements.txt for Python dependencies.
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
            const depName = name?.trim();
            if (depName) {
              context.dependencies.push({
                name: depName,
                version: version ? version.trim() : 'unknown',
                type: 'runtime',
                ecosystem: 'pip',
              });
            }
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
   * Detect API usage patterns.
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
   * Analyze current development context (TODOs, issues, etc.).
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
   * Determine if we should gather knowledge for a dependency.
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
   * Create a dependency-focused knowledge gathering mission.
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
   * Create a framework-focused knowledge gathering mission.
   *
   * @param framework
   */
  private createFrameworkMission(framework: DetectedFramework): KnowledgeGatheringMission {
    const priority = framework.usage === 'primary' ? 'high' : 'medium';

    const mission: KnowledgeGatheringMission = {
      id: `framework-${framework.name}-${Date.now()}`,
      priority,
      type: 'framework',
      target: framework.name,
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

    if (framework.version) {
      mission.version = framework.version;
    }

    return mission;
  }

  /**
   * Create an API-focused knowledge gathering mission.
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
   * Create a security-focused knowledge gathering mission.
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
   * Create a performance-focused knowledge gathering mission.
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
   * Create a best practices knowledge gathering mission.
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
   * Create an ad-hoc mission for immediate queries.
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
   * Get priority weight for sorting.
   *
   * @param priority
   */
  private getPriorityWeight(priority: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[priority as keyof typeof weights] || 0;
  }

  /**
   * Search cached knowledge in context cache.
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
        if (cached.query.toLowerCase().includes(queryLower)) {
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
      logger.error('Failed to search cached knowledge:', error);
      return [];
    }
  }

  /**
   * Format cached knowledge for presentation.
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
   * Store knowledge in context cache.
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
   * Start background context monitoring.
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
   * Get current system status.
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
   * Get monorepo detection results.
   */
  getMonorepoInfo(): MonorepoInfo | null {
    return this.projectContext?.monorepo || null;
  }

  /**
   * Check if project is a monorepo with high confidence.
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
   * Shutdown the system.
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
