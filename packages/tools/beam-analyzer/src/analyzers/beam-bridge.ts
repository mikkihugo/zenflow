/**
 * @fileoverview BEAM Bridge - Main coordination class for BEAM ecosystem analysis
 * Orchestrates multiple analysis tools for comprehensive BEAM project scanning
 */


import { spawn } from 'node: child_process';
import { promises as fs } from 'node: fs';
import * as path from 'node: path';
import { err, getLogger, ok } from '@claude-zen/foundation';
import which from 'which';

import type {
  BeamAnalysisConfig,
  BeamAnalysisContext,
  BeamAnalysisError,
  BeamAnalysisExecutionResult,
  BeamFinding,
  BeamLanguage,
  BeamProject,
  BeamProjectDetectionResult,
} from '../types/beam-types';

export class BeamBridge {
  private logger = getLogger('BeamBridge');')  private config: Required<BeamAnalysisConfig>;

  constructor(config: BeamAnalysisConfig = {}) {
    this.config = {
      languages: config.languages||['erlang',    'elixir'],
      useDialyzer: config.useDialyzer ?? true,
      useSobelow: config.useSobelow ?? true,
      useElvis: config.useElvis ?? false,
      customRules: config.customRules||[],
      timeout: config.timeout||300000, // 5 minutes
      includeDeps: config.includeDeps ?? true,
      otpVersion: config.otpVersion||'latest',};
}

  /**
   * Analyze a BEAM project comprehensively
   */
  async analyzeProject(projectPath: string,
    config?:Partial<BeamAnalysisConfig>
  ): BeamAnalysisExecutionResult {
    const __startTime = Date.now();
    const __analysisConfig = { ...this.config, ...config};

    try {
      this.logger.info(`Starting BEAM analysis of project: ${projectPath}`);`

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
      const toolResults: BeamAnalysisResult['toolResults'] = {};')
      // Dialyzer analysis
      if (
        analysisConfig.useDialyzer &&
        context.value.availableTools.includes('dialyzer')')      ) {
        const dialyzerResult = await this.runDialyzer(project, context.value);
        if (dialyzerResult.isOk()) {
          toolResults.dialyzer = dialyzerResult.value as DialyzerResult;
          findings.push(
            ...this.convertDialyzerFindings(
              dialyzerResult.value as DialyzerResult
            )
          );
}
}

      // Sobelow security analysis (Elixir only)
      if (
        analysisConfig.useSobelow &&
        project.language === 'elixir' &&')        context.value.availableTools.includes('sobelow')')      ) {
        const sobelowResult = await this.runSobelow(project, context.value);
        if (sobelowResult.isOk()) {
          toolResults.sobelow = sobelowResult.value as SobelowResult;
          findings.push(
            ...this.convertSobelowFindings(sobelowResult.value as SobelowResult)
          );
}
}

      // Elvis style checking (Erlang)
      if (
        analysisConfig.useElvis &&
        project.language === 'erlang' &&')        context.value.availableTools.includes('elvis')')      ) {
        const elvisResult = await this.runElvis(project, context.value);
        if (elvisResult.isOk()) {
          toolResults.elvis = elvisResult.value as ElvisResult;
          findings.push(
            ...this.convertElvisFindings(elvisResult.value as ElvisResult)
          );
}
}

      // Custom rules analysis
      if (analysisConfig.customRules.length > 0) {
        const customResults = await this.runCustomAnalysis(
          project,
          analysisConfig.customRules
        );
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
        toolResults,
};

      this.logger.info(
        `BEAM analysis completed: $findings.lengthfindings in $metrics.totalTimems``
      );
      return ok(result);
} catch (error) {
      this.logger.error('BEAM analysis failed:', error);')      return err({
        code: 'ANALYSIS_FAILED',        message:`Analysis failed: ${error instanceof Error ? error.message : String(error)}`,`
        originalError: error instanceof Error ? error : undefined,
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
        language: 'erlang', // Default, will be detected')        buildTool: 'unknown',        applications:[],
        dependencies:[],
        configFiles:[],
};

      // Check for Elixir project (mix.exs)
      const mixFile = path.join(projectPath, 'mix.exs');')      if (await this.fileExists(mixFile)) {
        project.language = 'elixir';
        project.buildTool = 'mix';
        project.configFiles.push(mixFile);
        await this.analyzeMixProject(project);
}

      // Check for Erlang project (rebar.config or rebar3)
      const rebarConfig = path.join(projectPath, 'rebar.config');')      const rebar3Config = path.join(projectPath, 'rebar3');')      if (
        (await this.fileExists(rebarConfig))||(await this.fileExists(rebar3Config))
      ) {
        if (project.language ==='erlang') {
    ')          // Don't override Elixir')          project.buildTool = 'rebar3';
}
        if (await this.fileExists(rebarConfig)) {
          project.configFiles.push(rebarConfig);
}
        await this.analyzeRebarProject(project);
}

      // Check for Gleam project (gleam.toml)
      const gleamFile = path.join(projectPath, 'gleam.toml');')      if (await this.fileExists(gleamFile)) {
        project.language = 'gleam';
        project.buildTool = 'gleam';
        project.configFiles.push(gleamFile);
        await this.analyzeGleamProject(project);
}

      // Detect additional languages
      project.additionalLanguages = await this.detectAdditionalLanguages(
        projectPath,
        project.language
      );

      this.logger.info(
        `Detected BEAM project: ${project.language} with ${project.buildTool}``
      );
      return ok(project);
} catch (error) {
      return err({
        code: 'INVALID_PROJECT',        message:`Failed to detect BEAM project: ${error instanceof Error ? error.message : String(error)}`,`
        originalError: error instanceof Error ? error : undefined,
} as BeamAnalysisError);
}
}

  /**
   * Check if required tools are available
   */
  async checkToolAvailability():Promise<Result<string[], BeamAnalysisError>> {
    const tools = ['erl',    'dialyzer'];')    const availableTools: string[] = [];

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
        await which('elixir');')        availableTools.push('elixir');')
        try {
          await which('sobelow');')          availableTools.push('sobelow');')} catch {
          // Sobelow not available
}
} catch {
        // Elixir not available
}

      try {
        await which('gleam');')        availableTools.push('gleam');')} catch {
        // Gleam not available
}

      try {
        await which('elvis');')        availableTools.push('elvis');')} catch {
        // Elvis not available
}

      return ok(availableTools);
} catch (error) {
      return err({
        code: 'TOOL_NOT_FOUND',        message:`Failed to check tool availability: ${error instanceof Error ? error.message : String(error)}`,`
        originalError: error instanceof Error ? error : undefined,
} as BeamAnalysisError);
}
}

  // Private helper methods

  private async createAnalysisContext(projectPath: string
  ): Promise<Result<BeamAnalysisContext, BeamAnalysisError>> {
    try {
      const availableToolsResult = await this.checkToolAvailability();
      if (!availableToolsResult.isOk()) {
        return err(availableToolsResult.error);
}

      const context: BeamAnalysisContext = {
        workingDirectory: projectPath,
        environment: process.env as Record<string, string>,
        toolVersions:{},
        availableTools: availableToolsResult.value as any[],
};

      // Get tool versions
      for (const tool of availableToolsResult.value) {
        try {
          const version = await this.getToolVersion(tool);
          context.toolVersions[tool as keyof typeof context.toolVersions] =
            version;
} catch {
          // Version detection failed
}
}

      return ok(context);
} catch (error) {
      return err({
        code: 'CONFIGURATION_ERROR',        message:`Failed to create analysis context: ${error instanceof Error ? error.message : String(error)}`,`
        originalError: error instanceof Error ? error : undefined,
} as BeamAnalysisError);
}
}

  private async runDialyzer(project: BeamProject,
    context: BeamAnalysisContext
  ): Promise<Result<DialyzerResult, BeamAnalysisError>> {
    this.logger.info('Running Dialyzer analysis...');')
    try {
      // Check if dialyzer is available
      const dialyzerPath = await which('dialyzer').catch(() => null);')      if (!dialyzerPath) {
        return err({
          code: 'TOOL_NOT_FOUND',          message: 'Dialyzer not found in PATH',          tool: 'dialyzer',});
}

      // Build PLT if needed
      const pltFile = path.join(context.workingDirectory, '.dialyzer.plt');')      const pltExists = await fs.access(pltFile).then(() => true).catch(() => false);
      
      if (!pltExists) {
        this.logger.info('Building Dialyzer PLT...');')        await this.buildDialyzerPlt(pltFile);
}

      return ok({
        warnings:[],
        successTypings:[],
        pltInfo:{
          file: pltFile,
          modules:[],
          lastModified: new Date(),
},
});
} catch (error) {
      return err({
        code: 'ANALYSIS_FAILED',        message:`Dialyzer analysis failed: ${error instanceof Error ? error.message : String(error)}`,`
        tool: 'dialyzer',});
}
}

  private async runSobelow(project: BeamProject,
    context: BeamAnalysisContext
  ): Promise<Result<SobelowResult, BeamAnalysisError>> {
    this.logger.info('Running Sobelow security analysis...');')
    try {
      // Check if sobelow is available
      const sobelowPath = await which('sobelow').catch(() => null);')      if (!sobelowPath) {
        return err({
          code: 'TOOL_NOT_FOUND',          message: 'Sobelow not found in PATH',          tool: 'sobelow',});
}

      // Run sobelow analysis
      const analysisResult = await this.executeSobelowAnalysis(context.workingDirectory);
      
      return ok({
        findings: analysisResult.findings || [],
        phoenixIssues: analysisResult.phoenixIssues || [],
        configIssues: analysisResult.configIssues || [],
});
} catch (error) {
      return err({
        code: 'ANALYSIS_FAILED',        message:`Sobelow analysis failed: ${error instanceof Error ? error.message : String(error)}`,`
        tool: 'sobelow',});
}
}

  private async runElvis(project: BeamProject,
    context: BeamAnalysisContext
  ): Promise<Result<ElvisResult, BeamAnalysisError>> {
    this.logger.info('Running Elvis style analysis...');')
    try {
      // Check if elvis is available
      const elvisPath = await which('elvis').catch(() => null);')      if (!elvisPath) {
        return err({
          code: 'TOOL_NOT_FOUND',          message: 'Elvis not found in PATH',          tool: 'elvis',});
}

      // Run elvis analysis
      const analysisResult = await this.executeElvisAnalysis(context.workingDirectory);

      return ok({
        violations: analysisResult.violations || [],
        passed: analysisResult.passed || [],
        failed: analysisResult.failed || [],
});
} catch (error) {
      return err({
        code: 'ANALYSIS_FAILED',        message:`Elvis analysis failed: ${error instanceof Error ? error.message : String(error)}`,`
        tool: 'elvis',});
}
}

  private async runCustomAnalysis(project: BeamProject,
    rules: any[]
  ): Promise<Result<CustomAnalysisResult[], BeamAnalysisError>> {
    this.logger.info('Running custom analysis rules...');')    
    try {
      const _results: any[] = [];
      
      for (const rule of rules) {
        this.logger.debug(`Applying custom rule: ${rule.name}`);`
        const ruleResult = await this.applyCustomRule(project, rule);
        if (ruleResult.isOk()) {
          results.push(ruleResult.value);
}
}
      
      return ok(results);
} catch (error) {
      return err({
        code: 'ANALYSIS_FAILED',        message:`Custom analysis failed: $error instanceof Error ? error.message : String(error)`,`
        tool: 'custom',});
}
}

  private async analyzeMixProject(project: BeamProject): Promise<void> {
    this.logger.debug(`Analyzing Mix project: ${project.name}`);`
    
    try {
      const mixFile = path.join(project.rootPath, 'mix.exs');')      const mixExists = await fs.access(mixFile).then(() => true).catch(() => false);
      
      if (mixExists) {
        const mixContent = await fs.readFile(mixFile, 'utf8');')        // Parse mix.exs for applications and dependencies
        project.dependencies = this.parseMixDependencies(mixContent);
        project.applications = this.parseMixApplications(mixContent);
}
} catch (error) {
      this.logger.warn(`Failed to analyze Mix project: $error`);`
}
}

  private async analyzeRebarProject(project: BeamProject): Promise<void> {
    this.logger.debug(`Analyzing Rebar project: ${project.name}`);`
    
    try {
      const rebarFile = path.join(project.rootPath, 'rebar.config');')      const rebarExists = await fs.access(rebarFile).then(() => true).catch(() => false);
      
      if (rebarExists) {
        const rebarContent = await fs.readFile(rebarFile, 'utf8');')        // Parse rebar.config for applications and dependencies
        project.dependencies = this.parseRebarDependencies(rebarContent);
        project.applications = this.parseRebarApplications(rebarContent);
}
} catch (error) {
      this.logger.warn(`Failed to analyze Rebar project: $error`);`
}
}

  private async analyzeGleamProject(project: BeamProject): Promise<void> {
    this.logger.debug(`Analyzing Gleam project: ${project.name}`);`
    
    try {
      const gleamFile = path.join(project.rootPath, 'gleam.toml');')      const gleamExists = await fs.access(gleamFile).then(() => true).catch(() => false);
      
      if (gleamExists) {
        const gleamContent = await fs.readFile(gleamFile, 'utf8');')        // Parse gleam.toml for project configuration
        project.dependencies = this.parseGleamDependencies(gleamContent);
        project.applications = this.parseGleamApplications(gleamContent);
}
} catch (error) {
      this.logger.warn(`Failed to analyze Gleam project: $error`);`
}
}

  private async detectAdditionalLanguages(projectPath: string,
    primaryLanguage: BeamLanguage
  ): Promise<BeamLanguage[]> {
    const _additional: BeamLanguage[] = [];

    // Check for different file extensions
    const __extensions = {
      erlang:['.erl',    '.hrl'],
      elixir:['.ex',    '.exs'],
      gleam:['.gleam'],
      lfe:['.lfe'],
};

    this.logger.debug(`Detecting additional languages in ${projectPath}`);`
    
    try {
      for (const [lang, exts] of Object.entries(extensions)) {
        if (lang !== primaryLanguage) {
          for (const _ext of exts) {
            // Check if any files with this extension exist
            const hasFiles = await this.hasFilesWithExtension(projectPath, _ext);
            if (hasFiles && !additional.includes(lang as BeamLanguage)) {
              additional.push(lang as BeamLanguage);
              this.logger.debug(`Detected _additional language: $lang`);`
}
}
}
}
} catch (error) {
      this.logger.warn(`Error detecting additional languages: ${error}`);`
}

    return additional;
}

  private async calculateMetrics(project: BeamProject,
    startTime: number
  ): Promise<BeamAnalysisMetrics> {
    this.logger.debug(`Calculating metrics for project: $project.name`);`
    
    try {
      const metrics = await this.analyzeProjectMetrics(project.rootPath);
      
      return {
        totalTime: Date.now() - startTime,
        filesAnalyzed: metrics.filesAnalyzed || 0,
        linesOfCode: metrics.linesOfCode || 0,
        functions: metrics.functions || 0,
        modules: metrics.modules || 0,
        processes: metrics.processes || 0,
        genServers: metrics.genServers || 0,
        supervisors: metrics.supervisors || 0,
        breakdown:{
          parsing: metrics.parsingTime || 0,
          dialyzer: metrics.dialyzerTime || 0,
          sobelow: metrics.sobelowTime || 0,
          elvis: metrics.elvisTime || 0,
          custom: metrics.customTime || 0,
},
};
} catch (error) {
      this.logger.warn(`Error calculating metrics: ${error}`);`
      return {
        totalTime: Date.now() - startTime,
        filesAnalyzed:0,
        linesOfCode:0,
        functions:0,
        modules:0,
        processes:0,
        genServers:0,
        supervisors:0,
        breakdown:{
          parsing:0,
          dialyzer:0,
          sobelow:0,
          elvis:0,
          custom:0,
},
};
}
}

  private convertDialyzerFindings(result: DialyzerResult): BeamFinding[] {
    // Convert Dialyzer warnings to unified findings format
    const findings: BeamFinding[] = [];
    
    for (const warning of result.warnings) {
      findings.push({
        id:`dialyzer-$warning.type || 'warning'`,`
        message: warning.message || 'Dialyzer warning',        severity:'medium' as const,
        _category:'type-safety' as const,
        _location: warning.location || file: ', line:1,
        tool: 'dialyzer',});
}
    
    return findings;
}

  private convertSobelowFindings(result: SobelowResult): BeamFinding[] {
    // Convert Sobelow findings to unified format
    const findings: BeamFinding[] = [];
    
    for (const finding of result.findings) {
      findings.push({
        id:`sobelow-${finding.category}`,`
        message: finding.details,
        severity: this.mapConfidenceToSeverity(finding.confidence),
        category:'security' as const,
        location: finding.location,
        tool: 'sobelow',});
}
    
    return findings;
}

  private convertElvisFindings(result: ElvisResult): BeamFinding[] {
    // Convert Elvis violations to unified format
    const findings: BeamFinding[] = [];
    
    for (const violation of result.violations) {
      findings.push({
        id:`elvis-${violation.rule || 'violation'}`,`
        message: violation.message || 'Elvis style violation',        severity:'low' as const,
        category:'maintainability' as const,
        location: violation.location || { file: ', line:1},
        tool: 'elvis',});
}
    
    return findings;
}

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
} catch {
      return false;
}
}

  private getToolVersion(tool: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(tool, ['--version'], { stdio: ' pipe'});')      const output = ';

      child.stdout.on('data', (_data) => {
    ')        output += data.toString();
});

      child.on('close', (code) => {
    ')        if (code === 0) {
          resolve(output.trim().split('\n')[0]||' unknown');')} else {
          reject(new Error(`Failed to get version for ${tool}`));`
}
});

      child.on('error', reject);')});
}
}

/**
 * Create a BEAM bridge instance
 */
export function createBeamBridge(config?:BeamAnalysisConfig): BeamBridge {
  return new BeamBridge(config);
}

/**
 * Check if BEAM tools are available
 */
export async function checkBeamAvailability():Promise<boolean> {
  const bridge = new BeamBridge();
  const result = await bridge.checkToolAvailability();
  return result.isOk() && result.value.length > 0;
}
