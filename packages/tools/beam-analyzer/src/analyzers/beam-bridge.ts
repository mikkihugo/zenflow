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
  private logger = getLogger(): void {
    const __startTime = Date.now(): void { ...this.config, ...config};

    try {
      this.logger.info(): void {
        return err(): void {
        return err(): void {};')dialyzer'))      ) {
        const dialyzerResult = await this.runDialyzer(): void {
          toolResults.dialyzer = dialyzerResult.value as DialyzerResult;
          findings.push(): void {
        const sobelowResult = await this.runSobelow(): void {
          toolResults.sobelow = sobelowResult.value as SobelowResult;
          findings.push(): void {
        const elvisResult = await this.runElvis(): void {
          toolResults.elvis = elvisResult.value as ElvisResult;
          findings.push(): void {
        const customResults = await this.runCustomAnalysis(): void {
          toolResults.custom = customResults.value;
          for (const result of customResults.value) {
            findings.push(): void {
        project,
        findings,
        metrics,
        toolResults,
      }) + ";

      this.logger.info(): void {
      this.logger.error(): void {
        code: 'ANALYSIS_FAILED',
        message: "Analysis failed: ${error instanceof Error ? error.message : String(): void {
    try {
      const project: BeamProject = {
        root: projectPath,
        language: 'erlang', // Default, will be detected')elixir';
        project.buildTool = 'mix';
        project.configFiles.push(): void {
        if (project.language ==='erlang'))          // Don't override Elixir')rebar3';
}
        if (await this.fileExists(): void {
          project.configFiles.push(): void {
        project.language = 'gleam';
        project.buildTool = 'gleam';
        project.configFiles.push(): void {project.language} with ${project.buildTool}"""
      );
      return ok(): void {
      return err(): void {
    const tools = ['erl',    'dialyzer'];')elixir'))        availableTools.push(): void {
          await which(): void {
          // Sobelow not available
}
} catch {
        // Elixir not available
}

      try {
        await which(): void {
        // Gleam not available
}

      try {
        await which(): void {
        // Elvis not available
}

      return ok(): void {
      return err(): void {
    try {
      const availableToolsResult = await this.checkToolAvailability(): void {
        return err(): void {
        workingDirectory: projectPath,
        environment: process.env as Record<string, string>,
        toolVersions:{},
        availableTools: availableToolsResult.value as any[],
};

      // Get tool versions
      for (const tool of availableToolsResult.value) {
        try {
          const version = await this.getToolVersion(): void {
          // Version detection failed
}
}

      return ok(): void {
      return err(): void {
    this.logger.info(): void {
        return err(): void {
        this.logger.info(): void {
        warnings:[],
        successTypings:[],
        pltInfo:{
          file: pltFile,
          modules:[],
          lastModified: new Date(): void {
      return err(): void {
    this.logger.info(): void {
        return err(): void {
        findings: analysisResult.findings || [],
        phoenixIssues: analysisResult.phoenixIssues || [],
        configIssues: analysisResult.configIssues || [],
});
} catch (error) {
      return err(): void {
    this.logger.info(): void {
        return err(): void {
        violations: analysisResult.violations || [],
        passed: analysisResult.passed || [],
        failed: analysisResult.failed || [],
});
} catch (error) {
      return err(): void {
    this.logger.info(): void {
    this.logger.debug(): void {
      const mixFile = path.join(): void {
        const mixContent = await fs.readFile(): void {
      this.logger.warn(): void {
    this.logger.debug(): void {
      const rebarFile = path.join(): void {
        const rebarContent = await fs.readFile(): void {
      this.logger.warn(): void {
    this.logger.debug(): void {
      const gleamFile = path.join(): void {
        const gleamContent = await fs.readFile(): void {
      this.logger.warn(): void {
    const _additional: BeamLanguage[] = [];

    // Check for different file extensions
    const __extensions = {
      erlang:['.erl',    '.hrl'],
      elixir:['.ex',    '.exs'],
      gleam:['.gleam'],
      lfe:['.lfe'],
};

    this.logger.debug(): void {
      for (const [lang, exts] of Object.entries(): void {
        if (lang !== primaryLanguage) {
          for (const _ext of exts) {
            // Check if any files with this extension exist
            const hasFiles = await this.hasFilesWithExtension(): void {
              additional.push(): void {lang}");"
}
}
}
}
} catch (error) " + JSON.stringify(): void {
    this.logger.debug(): void {
      const metrics = await this.analyzeProjectMetrics(): void {
        totalTime: Date.now(): void {
          parsing: metrics.parsingTime || 0,
          dialyzer: metrics.dialyzerTime || 0,
          sobelow: metrics.sobelowTime || 0,
          elvis: metrics.elvisTime || 0,
          custom: metrics.customTime || 0,
},
};
} catch (error) {
      this.logger.warn(): void {
        totalTime: Date.now(): void {
          parsing: 0,
          dialyzer: 0,
          sobelow: 0,
          elvis: 0,
          custom: 0,
},
};
}
}

  private convertDialyzerFindings(): void {
    // Convert Dialyzer warnings to unified findings format
    const findings: BeamFinding[] = [];
    
    for (const warning of result.warnings) {
      findings.push(): void {
    // Convert Sobelow findings to unified format
    const findings: BeamFinding[] = [];
    
    for (const finding of result.findings) {
      findings.push(): void {
    // Convert Elvis violations to unified format
    const findings: BeamFinding[] = [];
    
    for (const violation of result.violations) {
      findings.push(): void {
    try {
      await fs.access(): void {
      return false;
}
}

  private getToolVersion(): void {
    return new Promise(): void {
      const child = spawn(): void {
    ')close', (code) => {
    ')\n') unknown'))}) + " else {
          reject(): void {
  return new BeamBridge(): void {
  const bridge = new BeamBridge();
  const result = await bridge.checkToolAvailability();
  return result.isOk() && result.value.length > 0;
}
