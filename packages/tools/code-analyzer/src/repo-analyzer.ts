/**
 * @fileoverview Enhanced Repository Analyzer with Foundation Integration
 * 
 * Comprehensive repository analysis using foundation's workspace detection
 * and build system native analysis capabilities.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { 
  getLogger, 
  Result, 
  ok, 
  err, 
  safeAsync, 
  withRetry,
  getWorkspaceDetector
} from '@claude-zen/foundation';

// Import DetectedWorkspace type from foundation's system utilities
type DetectedWorkspace = any; // TODO: Get proper type from foundation

const logger = getLogger('RepoAnalyzer');

export interface RepoAnalyzerConfig {
  rootPath: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  enableBuildSystemAnalysis?: boolean;
  enableDomainValidation?: boolean;
  enableDependencyAnalysis?: boolean;
}

export interface DomainBoundary {
  name: string;
  type: 'public-api' | 'private-implementation' | 'internal-specialized' | 'restricted-access' | 'deep-core';
  packages: string[];
  allowedImports: string[];
  violations: DomainViolation[];
}

export interface DomainViolation {
  type: 'tier-boundary' | 'circular-dependency' | 'forbidden-import' | 'facade-bypass';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  file: string;
  line?: number;
  suggestion: string;
}

export interface BuildSystemAnalysis {
  tool: string;
  version?: string;
  projects: Array<{
    name: string;
    path: string;
    type: string;
    language?: string;
    framework?: string;
  }>;
  dependencyGraph?: any;
  buildMetrics?: any;
}

export interface DomainBoundaryValidation {
  domains: DomainBoundary[];
  violations: DomainViolation[];
  metrics: {
    totalPackages: number;
    violationCount: number;
    complianceScore: number;
  };
}

export interface RepositoryAnalysisResult {
  workspace?: DetectedWorkspace;
  buildSystem?: BuildSystemAnalysis;
  domainBoundaries?: DomainBoundaryValidation;
  metrics: {
    totalFiles: number;
    totalPackages: number;
    analysisTimeMs: number;
  };
}

/**
 * Enhanced Repository Analyzer using foundation's workspace detection
 * and build system native analysis capabilities
 */
export class RepoAnalyzer {
  private readonly config: RepoAnalyzerConfig;
  private workspaceDetector: any;

  constructor(config: RepoAnalyzerConfig) {
    this.config = {
      enableBuildSystemAnalysis: true,
      enableDomainValidation: true,
      enableDependencyAnalysis: true,
      excludePatterns: ['node_modules/**', 'dist/**', '.git/**'],
      ...config
    };
    
    this.workspaceDetector = getWorkspaceDetector();
    
    logger.info('RepoAnalyzer initialized', {
      rootPath: this.config.rootPath,
      config: this.config
    });
  }

  /**
   * Analyze repository structure and boundaries
   */
  async analyzeDomainBoundaries(): Promise<Result<RepositoryAnalysisResult, Error>> {
    const startTime = Date.now();
    
    return await safeAsync(async () => {
      logger.info('Starting comprehensive repository analysis', {
        rootPath: this.config.rootPath
      });

      // Phase 1: Workspace Detection using foundation
      const workspace = await this.detectWorkspace();
      logger.debug('Workspace detection completed', { workspace });

      // Phase 2: Build System Analysis (if enabled)
      let buildSystem: BuildSystemAnalysis | undefined;
      if (this.config.enableBuildSystemAnalysis && workspace) {
        buildSystem = await this.analyzeBuildSystem(workspace);
        logger.debug('Build system analysis completed', { buildSystem });
      }

      // Phase 3: Domain Boundary Validation (if enabled)
      let domainBoundaries: DomainBoundaryValidation | undefined;
      if (this.config.enableDomainValidation && workspace) {
        domainBoundaries = await this.validateDomainBoundaries(workspace);
        logger.debug('Domain boundary validation completed', { domainBoundaries });
      }

      const analysisTime = Date.now() - startTime;
      
      const result: RepositoryAnalysisResult = {
        workspace,
        buildSystem,
        domainBoundaries,
        metrics: {
          totalFiles: await this.countFiles(),
          totalPackages: workspace?.totalProjects || 0,
          analysisTimeMs: analysisTime
        }
      };

      logger.info('Repository analysis completed', {
        analysisTime,
        totalPackages: result.metrics.totalPackages,
        violations: domainBoundaries?.violations.length || 0
      });

      return result;
    });
  }

  /**
   * Detect workspace using foundation's workspace detector
   */
  private async detectWorkspace(): Promise<DetectedWorkspace | null> {
    return await safeAsync(async () => {
      const workspace = await this.workspaceDetector.detectWorkspaceRoot(this.config.rootPath);
      
      if (!workspace) {
        logger.warn('No workspace detected - analyzing as single project');
        return null;
      }

      logger.info(`Detected ${workspace.tool} workspace`, {
        root: workspace.root,
        projects: workspace.totalProjects,
        configFile: workspace.configFile
      });

      return workspace;
    }).then(result => result.isOk() ? result.value : null);
  }

  /**
   * Analyze build system using native build tools
   */
  private async analyzeBuildSystem(workspace: DetectedWorkspace): Promise<BuildSystemAnalysis> {
    logger.debug(`Analyzing ${workspace.tool} build system`);
    
    const analysis: BuildSystemAnalysis = {
      tool: workspace.tool,
      projects: workspace.projects.map(project => ({
        name: project.name,
        path: project.path,
        type: project.type,
        language: project.language,
        framework: project.framework
      }))
    };

    // Try to get additional metadata from build system
    try {
      switch (workspace.tool) {
        case 'nx':
          analysis.dependencyGraph = await this.getNxDependencyGraph(workspace.root);
          break;
        case 'pnpm':
          analysis.dependencyGraph = await this.getPnpmWorkspaceInfo(workspace.root);
          break;
        case 'lerna':
          analysis.dependencyGraph = await this.getLernaDependencies(workspace.root);
          break;
        default:
          logger.debug(`No specific analysis for build tool: ${workspace.tool}`);
      }
    } catch (error) {
      logger.warn(`Failed to get detailed ${workspace.tool} analysis`, { error });
    }

    return analysis;
  }

  /**
   * Validate domain boundaries and architectural constraints
   */
  private async validateDomainBoundaries(workspace: DetectedWorkspace): Promise<DomainBoundaryValidation> {
    logger.debug('Validating domain boundaries');
    
    const domains = await this.detectDomains(workspace);
    const violations = await this.detectViolations(domains, workspace);
    
    const metrics = {
      totalPackages: workspace.totalProjects,
      violationCount: violations.length,
      complianceScore: violations.length === 0 ? 100 : Math.max(0, 100 - (violations.length * 10))
    };

    return {
      domains,
      violations,
      metrics
    };
  }

  /**
   * Detect domain structure from workspace
   */
  private async detectDomains(workspace: DetectedWorkspace): Promise<DomainBoundary[]> {
    const domains: DomainBoundary[] = [];
    
    // Group projects by path patterns to infer domains
    const domainGroups = new Map<string, string[]>();
    
    for (const project of workspace.projects) {
      const pathParts = project.path.split('/');
      let domainKey = 'unknown';
      
      // Infer domain from path structure
      if (pathParts.includes('core')) {
        domainKey = pathParts.includes('foundation') ? 'public-api' : 'deep-core';
      } else if (pathParts.includes('services')) {
        domainKey = 'private-implementation';
      } else if (pathParts.includes('tools')) {
        domainKey = 'internal-specialized';
      } else if (pathParts.includes('restricted')) {
        domainKey = 'restricted-access';
      } else if (pathParts.includes('apps')) {
        domainKey = 'public-api';
      }
      
      if (!domainGroups.has(domainKey)) {
        domainGroups.set(domainKey, []);
      }
      domainGroups.get(domainKey)!.push(project.name);
    }

    // Create domain boundaries  
    for (const entry of Array.from(domainGroups.entries())) {
      const [type, packages] = entry;
      domains.push({
        name: type.replace('-', ' ').toUpperCase(),
        type: type as any,
        packages,
        allowedImports: this.getAllowedImports(type as any),
        violations: []
      });
    }

    return domains;
  }

  /**
   * Detect architectural violations
   */
  private async detectViolations(domains: DomainBoundary[], workspace: DetectedWorkspace): Promise<DomainViolation[]> {
    const violations: DomainViolation[] = [];
    
    // Analyze import statements across packages to find violations
    for (const project of workspace.projects) {
      try {
        const projectPath = path.join(workspace.root, project.path);
        const packageViolations = await this.analyzePackageImports(projectPath, domains);
        violations.push(...packageViolations);
      } catch (error) {
        logger.warn(`Failed to analyze project ${project.name}`, { error });
      }
    }

    return violations;
  }

  /**
   * Analyze imports in a package for violations
   */
  private async analyzePackageImports(packagePath: string, domains: DomainBoundary[]): Promise<DomainViolation[]> {
    const violations: DomainViolation[] = [];
    
    try {
      // Find TypeScript/JavaScript files
      const files = await this.findSourceFiles(packagePath);
      
      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const fileViolations = await this.analyzeFileImports(file, content, domains);
          violations.push(...fileViolations);
        } catch (error) {
          logger.debug(`Failed to analyze file ${file}`, { error });
        }
      }
    } catch (error) {
      logger.warn(`Failed to analyze package at ${packagePath}`, { error });
    }

    return violations;
  }

  /**
   * Analyze imports in a single file
   */
  private async analyzeFileImports(filePath: string, content: string, domains: DomainBoundary[]): Promise<DomainViolation[]> {
    const violations: DomainViolation[] = [];
    
    // Extract import statements
    const importPattern = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importPattern.exec(content)) !== null) {
      const importPath = match[1];
      
      // Check for tier boundary violations
      if (this.isTierViolation(importPath)) {
        violations.push({
          type: 'tier-boundary',
          severity: 'high',
          description: `Direct import from lower tier: ${importPath}`,
          file: filePath,
          line: this.getLineNumber(content, match.index),
          suggestion: 'Use appropriate facade instead of direct import'
        });
      }
      
      // Check for forbidden imports
      if (this.isForbiddenImport(importPath)) {
        violations.push({
          type: 'forbidden-import',
          severity: 'medium',
          description: `Forbidden import detected: ${importPath}`,
          file: filePath,
          line: this.getLineNumber(content, match.index),
          suggestion: 'Remove or replace with allowed alternative'
        });
      }
    }

    return violations;
  }

  // Helper methods

  private getAllowedImports(domainType: string): string[] {
    const allowedImports: Record<string, string[]> = {
      'public-api': ['@claude-zen/foundation'],
      'private-implementation': ['@claude-zen/foundation'],
      'internal-specialized': ['@claude-zen/foundation'],
      'restricted-access': ['@claude-zen/foundation'],
      'deep-core': []
    };
    
    return allowedImports[domainType] || [];
  }

  private isTierViolation(importPath: string): boolean {
    // Detect direct imports from implementation tiers
    const forbiddenPatterns = [
      /@claude-zen\/brain/,
      /@claude-zen\/database/,
      /@claude-zen\/memory/,
      /@claude-zen\/dspy/,
      /@claude-zen\/neural-ml/
    ];
    
    return forbiddenPatterns.some(pattern => pattern.test(importPath));
  }

  private isForbiddenImport(importPath: string): boolean {
    // Check for other forbidden patterns
    return importPath.includes('node_modules') || importPath.startsWith('../../../');
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private async findSourceFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
          const subFiles = await this.findSourceFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors reading directories
    }
    
    return files;
  }

  private async countFiles(): Promise<number> {
    try {
      const files = await this.findSourceFiles(this.config.rootPath);
      return files.length;
    } catch {
      return 0;
    }
  }

  // Build system specific analysis methods

  private async getNxDependencyGraph(workspaceRoot: string): Promise<any> {
    try {
      // Try to run nx graph command
      const { spawn } = require('child_process');
      return new Promise((resolve, reject) => {
        const process = spawn('nx', ['graph', '--file=/tmp/nx-graph.json'], {
          cwd: workspaceRoot,
          stdio: 'pipe'
        });
        
        process.on('close', async (code: number) => {
          if (code === 0) {
            try {
              const graph = await fs.readFile('/tmp/nx-graph.json', 'utf-8');
              resolve(JSON.parse(graph));
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error(`nx graph failed with code ${code}`));
          }
        });
      });
    } catch (error) {
      logger.debug('Failed to get Nx dependency graph', { error });
      return null;
    }
  }

  private async getPnpmWorkspaceInfo(workspaceRoot: string): Promise<any> {
    try {
      const { spawn } = require('child_process');
      return new Promise((resolve, reject) => {
        const process = spawn('pnpm', ['list', '--json', '--depth=0'], {
          cwd: workspaceRoot,
          stdio: 'pipe'
        });
        
        let output = '';
        process.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });
        
        process.on('close', (code: number) => {
          if (code === 0) {
            try {
              resolve(JSON.parse(output));
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error(`pnpm list failed with code ${code}`));
          }
        });
      });
    } catch (error) {
      logger.debug('Failed to get pnpm workspace info', { error });
      return null;
    }
  }

  private async getLernaDependencies(workspaceRoot: string): Promise<any> {
    try {
      const { spawn } = require('child_process');
      return new Promise((resolve, reject) => {
        const process = spawn('lerna', ['ls', '--json'], {
          cwd: workspaceRoot,
          stdio: 'pipe'
        });
        
        let output = '';
        process.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });
        
        process.on('close', (code: number) => {
          if (code === 0) {
            try {
              resolve(JSON.parse(output));
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error(`lerna ls failed with code ${code}`));
          }
        });
      });
    } catch (error) {
      logger.debug('Failed to get Lerna dependencies', { error });
      return null;
    }
  }
}