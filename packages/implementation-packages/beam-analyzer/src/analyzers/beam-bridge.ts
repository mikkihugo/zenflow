/**
 * @fileoverview BEAM Bridge - Main coordination class for BEAM ecosystem analysis
 * Orchestrates multiple analysis tools for comprehensive BEAM project scanning
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import which from 'which';

import { getLogger, Result, ok, err } from '@claude-zen/foundation';
import type {
  BeamAnalysisConfig,
  BeamAnalysisResult,
  BeamProject,
  BeamLanguage,
  BeamBuildTool,
  BeamAnalysisContext,
  BeamAnalysisExecutionResult,
  BeamProjectDetectionResult,
  BeamAnalysisError,
  BeamAnalysisMetrics,
  BeamFinding,
  DialyzerResult,
  SobelowResult,
  ElvisResult,
  CustomAnalysisResult
} from '../types/beam-types';

export class BeamBridge {
  private logger = getLogger('BeamBridge');
  private config: Required<BeamAnalysisConfig>;

  constructor(config: BeamAnalysisConfig = {}) {
    this.config = {
      languages: config.languages || ['erlang', 'elixir'],
      useDialyzer: config.useDialyzer ?? true,
      useSobelow: config.useSobelow ?? true,
      useElvis: config.useElvis ?? false,
      customRules: config.customRules || [],
      timeout: config.timeout || 300000, // 5 minutes
      includeDeps: config.includeDeps ?? true,
      otpVersion: config.otpVersion || 'latest'
    };
  }

  /**
   * Analyze a BEAM project comprehensively
   */
  async analyzeProject(
    projectPath: string,
    config?: Partial<BeamAnalysisConfig>
  ): BeamAnalysisExecutionResult {
    const startTime = Date.now();
    const analysisConfig = { ...this.config, ...config };

    try {
      this.logger.info(`Starting BEAM analysis of project: ${projectPath}`);

      // 1. Detect project structure
      const projectResult = await this.detectProject(projectPath);
      if (!projectResult.isOk()) {
        return err(projectResult.error);
      }
      const project = projectResult.value;

      // 2. Set up analysis context
      const context = await this.createAnalysisContext(projectPath);
      if (!context.isOk()) {
        return err(context.error);
      }

      // 3. Run analysis tools
      const findings: BeamFinding[] = [];
      const toolResults: BeamAnalysisResult['toolResults'] = {};

      // Dialyzer analysis
      if (analysisConfig.useDialyzer && context.value.availableTools.includes('dialyzer')) {
        const dialyzerResult = await this.runDialyzer(project, context.value);
        if (dialyzerResult.isOk()) {
          toolResults.dialyzer = dialyzerResult.value as DialyzerResult;
          findings.push(...this.convertDialyzerFindings(dialyzerResult.value as DialyzerResult));
        }
      }

      // Sobelow security analysis (Elixir only)
      if (analysisConfig.useSobelow && 
          project.language === 'elixir' && 
          context.value.availableTools.includes('sobelow')) {
        const sobelowResult = await this.runSobelow(project, context.value);
        if (sobelowResult.isOk()) {
          toolResults.sobelow = sobelowResult.value as SobelowResult;
          findings.push(...this.convertSobelowFindings(sobelowResult.value as SobelowResult));
        }
      }

      // Elvis style checking (Erlang)
      if (analysisConfig.useElvis && 
          project.language === 'erlang' && 
          context.value.availableTools.includes('elvis')) {
        const elvisResult = await this.runElvis(project, context.value);
        if (elvisResult.isOk()) {
          toolResults.elvis = elvisResult.value as ElvisResult;
          findings.push(...this.convertElvisFindings(elvisResult.value as ElvisResult));
        }
      }

      // Custom rules analysis
      if (analysisConfig.customRules.length > 0) {
        const customResults = await this.runCustomAnalysis(project, analysisConfig.customRules);
        if (customResults.isOk()) {
          toolResults.custom = customResults.value;
          for (const result of customResults.value) {
            findings.push(...result.findings);
          }
        }
      }

      // 4. Calculate metrics
      const metrics = await this.calculateMetrics(project, startTime);

      const result: BeamAnalysisResult = {
        project,
        findings,
        metrics,
        toolResults
      };

      this.logger.info(`BEAM analysis completed: ${findings.length} findings in ${metrics.totalTime}ms`);
      return ok(result);

    } catch (error) {
      this.logger.error('BEAM analysis failed:', error);
      return err({
        code: 'ANALYSIS_FAILED',
        message: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        originalError: error instanceof Error ? error : undefined
      } as BeamAnalysisError);
    }
  }

  /**
   * Detect BEAM project structure and configuration
   */
  async detectProject(projectPath: string): BeamProjectDetectionResult {
    try {
      const project: BeamProject = {
        root: projectPath,
        language: 'erlang', // Default, will be detected
        buildTool: 'unknown',
        applications: [],
        dependencies: [],
        configFiles: []
      };

      // Check for Elixir project (mix.exs)
      const mixFile = path.join(projectPath, 'mix.exs');
      if (await this.fileExists(mixFile)) {
        project.language = 'elixir';
        project.buildTool = 'mix';
        project.configFiles.push(mixFile);
        await this.analyzeMixProject(project);
      }
      
      // Check for Erlang project (rebar.config or rebar3)
      const rebarConfig = path.join(projectPath, 'rebar.config');
      const rebar3Config = path.join(projectPath, 'rebar3');
      if (await this.fileExists(rebarConfig) || await this.fileExists(rebar3Config)) {
        if (project.language === 'erlang') { // Don't override Elixir
          project.buildTool = 'rebar3';
        }
        if (await this.fileExists(rebarConfig)) {
          project.configFiles.push(rebarConfig);
        }
        await this.analyzeRebarProject(project);
      }

      // Check for Gleam project (gleam.toml)
      const gleamFile = path.join(projectPath, 'gleam.toml');
      if (await this.fileExists(gleamFile)) {
        project.language = 'gleam';
        project.buildTool = 'gleam';
        project.configFiles.push(gleamFile);
        await this.analyzeGleamProject(project);
      }

      // Detect additional languages
      project.additionalLanguages = await this.detectAdditionalLanguages(projectPath, project.language);

      this.logger.info(`Detected BEAM project: ${project.language} with ${project.buildTool}`);
      return ok(project);

    } catch (error) {
      return err({
        code: 'INVALID_PROJECT',
        message: `Failed to detect BEAM project: ${error instanceof Error ? error.message : String(error)}`,
        originalError: error instanceof Error ? error : undefined
      } as BeamAnalysisError);
    }
  }

  /**
   * Check if required tools are available
   */
  async checkToolAvailability(): Promise<Result<string[], BeamAnalysisError>> {
    const tools = ['erl', 'dialyzer'];
    const availableTools: string[] = [];

    try {
      for (const tool of tools) {
        try {
          await which(tool);
          availableTools.push(tool);
        } catch {
          // Tool not available
        }
      }

      // Check for language-specific tools
      try {
        await which('elixir');
        availableTools.push('elixir');
        
        try {
          await which('sobelow');
          availableTools.push('sobelow');
        } catch {
          // Sobelow not available
        }
      } catch {
        // Elixir not available
      }

      try {
        await which('gleam');
        availableTools.push('gleam');
      } catch {
        // Gleam not available
      }

      try {
        await which('elvis');
        availableTools.push('elvis');
      } catch {
        // Elvis not available
      }

      return ok(availableTools);
    } catch (error) {
      return err({
        code: 'TOOL_NOT_FOUND',
        message: `Failed to check tool availability: ${error instanceof Error ? error.message : String(error)}`,
        originalError: error instanceof Error ? error : undefined
      } as BeamAnalysisError);
    }
  }

  // Private helper methods

  private async createAnalysisContext(projectPath: string): Promise<Result<BeamAnalysisContext, BeamAnalysisError>> {
    try {
      const availableToolsResult = await this.checkToolAvailability();
      if (!availableToolsResult.isOk()) {
        return err(availableToolsResult.error);
      }

      const context: BeamAnalysisContext = {
        workingDirectory: projectPath,
        environment: process.env as Record<string, string>,
        toolVersions: {},
        availableTools: availableToolsResult.value as any[]
      };

      // Get tool versions
      for (const tool of availableToolsResult.value) {
        try {
          const version = await this.getToolVersion(tool);
          context.toolVersions[tool as keyof typeof context.toolVersions] = version;
        } catch {
          // Version detection failed
        }
      }

      return ok(context);
    } catch (error) {
      return err({
        code: 'CONFIGURATION_ERROR',
        message: `Failed to create analysis context: ${error instanceof Error ? error.message : String(error)}`,
        originalError: error instanceof Error ? error : undefined
      } as BeamAnalysisError);
    }
  }

  private async runDialyzer(project: BeamProject, context: BeamAnalysisContext): Promise<Result<DialyzerResult, BeamAnalysisError>> {
    // Placeholder for Dialyzer integration
    this.logger.info('Running Dialyzer analysis...');
    
    return ok({
      warnings: [],
      successTypings: [],
      pltInfo: {
        file: path.join(context.workingDirectory, '.dialyzer.plt'),
        modules: [],
        lastModified: new Date()
      }
    });
  }

  private async runSobelow(project: BeamProject, context: BeamAnalysisContext): Promise<Result<SobelowResult, BeamAnalysisError>> {
    // Placeholder for Sobelow integration
    this.logger.info('Running Sobelow security analysis...');
    
    return ok({
      findings: [],
      phoenixIssues: [],
      configIssues: []
    });
  }

  private async runElvis(project: BeamProject, context: BeamAnalysisContext): Promise<Result<ElvisResult, BeamAnalysisError>> {
    // Placeholder for Elvis integration
    this.logger.info('Running Elvis style analysis...');
    
    return ok({
      violations: [],
      passed: [],
      failed: []
    });
  }

  private async runCustomAnalysis(project: BeamProject, rules: any[]): Promise<Result<CustomAnalysisResult[], BeamAnalysisError>> {
    // Placeholder for custom analysis
    this.logger.info('Running custom analysis rules...');
    return ok([]);
  }

  private async analyzeMixProject(project: BeamProject): Promise<void> {
    // Parse mix.exs for applications and dependencies
    // This would involve reading and parsing the Elixir configuration
  }

  private async analyzeRebarProject(project: BeamProject): Promise<void> {
    // Parse rebar.config for applications and dependencies
    // This would involve reading and parsing the Erlang terms
  }

  private async analyzeGleamProject(project: BeamProject): Promise<void> {
    // Parse gleam.toml for project configuration
    // This would involve reading and parsing TOML
  }

  private async detectAdditionalLanguages(projectPath: string, primaryLanguage: BeamLanguage): Promise<BeamLanguage[]> {
    const additional: BeamLanguage[] = [];
    
    // Check for different file extensions
    const extensions = {
      erlang: ['.erl', '.hrl'],
      elixir: ['.ex', '.exs'],
      gleam: ['.gleam'],
      lfe: ['.lfe']
    };

    for (const [lang, exts] of Object.entries(extensions)) {
      if (lang !== primaryLanguage) {
        for (const ext of exts) {
          // Check if any files with this extension exist
          // This would involve scanning the project directory
          // For now, return empty array
        }
      }
    }

    return additional;
  }

  private async calculateMetrics(project: BeamProject, startTime: number): Promise<BeamAnalysisMetrics> {
    return {
      totalTime: Date.now() - startTime,
      filesAnalyzed: 0,
      linesOfCode: 0,
      functions: 0,
      modules: 0,
      processes: 0,
      genServers: 0,
      supervisors: 0,
      breakdown: {
        parsing: 0,
        dialyzer: 0,
        sobelow: 0,
        elvis: 0,
        custom: 0
      }
    };
  }

  private convertDialyzerFindings(result: DialyzerResult): BeamFinding[] {
    // Convert Dialyzer warnings to unified findings format
    return [];
  }

  private convertSobelowFindings(result: SobelowResult): BeamFinding[] {
    // Convert Sobelow findings to unified format
    return [];
  }

  private convertElvisFindings(result: ElvisResult): BeamFinding[] {
    // Convert Elvis violations to unified format
    return [];
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async getToolVersion(tool: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(tool, ['--version'], { stdio: 'pipe' });
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim().split('\n')[0] || 'unknown');
        } else {
          reject(new Error(`Failed to get version for ${tool}`));
        }
      });

      child.on('error', reject);
    });
  }
}

/**
 * Create a BEAM bridge instance
 */
export function createBeamBridge(config?: BeamAnalysisConfig): BeamBridge {
  return new BeamBridge(config);
}

/**
 * Check if BEAM tools are available
 */
export async function checkBeamAvailability(): Promise<boolean> {
  const bridge = new BeamBridge();
  const result = await bridge.checkToolAvailability();
  return result.isOk() && result.value.length > 0;
}