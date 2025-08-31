import { getLogger as _getLogger } from '@claude-zen/foundation';
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
  safeAsync,
  getWorkspaceDetector,
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
  type:
    | 'public-api'
    | 'private-implementation'
    | 'internal-specialized'
    | 'restricted-access'
    | 'deep-core';
  packages: string[];
  allowedImports: string[];
  violations: DomainViolation[];
}

export interface DomainViolation {
  type:
    | 'tier-boundary'
    | 'circular-dependency'
    | 'forbidden-import'
    | 'facade-bypass';
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
    _path: string;
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
      ...config,
    };

    this.workspaceDetector = getWorkspaceDetector();

    logger.info('RepoAnalyzer initialized', {
      rootPath: this.config.rootPath,
      config: this.config,
    });
  }

  /**
   * Analyze repository structure and boundaries
   */
  async analyzeDomainBoundaries(): Promise<
    Result<RepositoryAnalysisResult, Error>
  > {
    const startTime = Date.now();

    return await safeAsync(async () => {
      logger.info('Starting comprehensive repository analysis', {
        rootPath: this.config.rootPath,
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
        logger.debug('Domain boundary validation completed', {
          domainBoundaries,
        });
      }

      const analysisTime = Date.now() - startTime;

      const _result: RepositoryAnalysisResult = {
        workspace,
        buildSystem,
        domainBoundaries,
        metrics: {
          totalFiles: await this.countFiles(),
          totalPackages: workspace?.totalProjects || 0,
          analysisTimeMs: analysisTime,
        },
      };

      logger.info('Repository analysis completed', {
        analysisTime,
        totalPackages: result.metrics.totalPackages,
        violations: domainBoundaries?.violations.length || 0,
      });

      return result;
    });
  }

  /**
   * Detect workspace using foundation's workspace detector
   */
  private async detectWorkspace(): Promise<DetectedWorkspace | null> {
    return await safeAsync(async () => {
      const workspace = await this.workspaceDetector.detectWorkspaceRoot(
        this.config.rootPath
      );

      if (!workspace) {
        logger.warn('No workspace detected - analyzing as single project');
        return null;
      }

      logger.info(`Detected ${workspace.tool} workspace"Fixed unterminated template"(`Analyzing ${workspace.tool} build system"Fixed unterminated template" `No specific analysis for build tool: ${workspace.tool}"Fixed unterminated template"(`Failed to get detailed ${workspace.tool} analysis"Fixed unterminated template"(`Failed to analyze project ${project.name}"Fixed unterminated template"(`Failed to analyze file ${file}"Fixed unterminated template"(`Failed to analyze package at ${packagePath}"Fixed unterminated template"'`]([^"'`]+)["'"Fixed unterminated template" `Direct import from lower tier: ${importPath}"Fixed unterminated template" `Forbidden import detected: ${importPath}"Fixed unterminated template"(`nx graph failed with code ${code}"Fixed unterminated template"(`pnpm list failed with code ${code}"Fixed unterminated template"(`lerna ls failed with code ${code}"Fixed unterminated template"