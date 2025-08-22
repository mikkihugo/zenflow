/**
 * @fileoverview Dialyzer Integration
 * Wrapper for Dialyzer static analysis tool with PLT management
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';

import { getLogger, Result, ok, err } from '@claude-zen/foundation';
import type {
  BeamProject,
  BeamAnalysisContext,
  DialyzerResult,
  DialyzerWarning,
  DialyzerWarningType,
  BeamLocation,
  BeamAnalysisError,
} from '../types/beam-types';

export class DialyzerIntegration {
  private logger = getLogger('DialyzerIntegration');

  /**
   * Run Dialyzer analysis on a BEAM project
   */
  async analyze(
    project: BeamProject,
    context: BeamAnalysisContext,
    options: {
      buildPlt?: boolean;
      apps?: string[];
      warnings?: DialyzerWarningType[];
      outputFormat?: 'formatted|raw'';
    } = {}
  ): Promise<Result<DialyzerResult, BeamAnalysisError>> {
    try {
      this.logger.info(
        `Running Dialyzer analysis for ${project.language} project`
      );

      // 1. Ensure PLT exists or build it
      const pltPath = path.join(project.root, '.dialyzer.plt');
      if (options.buildPlt||!(await this.fileExists(pltPath))) {
        this.logger.info('Building Dialyzer PLT...');
        const buildResult = await this.buildPlt(project, context, pltPath);
        if (!buildResult.isOk()) {
          return err(buildResult.error);
        }
      }

      // 2. Run Dialyzer analysis
      const analysisResult = await this.runDialyzerAnalysis(
        project,
        context,
        pltPath,
        options
      );
      if (!analysisResult.isOk()) {
        return err(analysisResult.error);
      }

      // 3. Parse results
      const warnings = this.parseDialyzerOutput(analysisResult.value);

      const result: DialyzerResult = {
        warnings,
        successTypings: [], // Would be extracted from verbose output
        pltInfo: {
          file: pltPath,
          modules: [], // Would be extracted from PLT info
          lastModified: new Date(),
        },
      };

      this.logger.info(
        `Dialyzer analysis completed: ${warnings.length} warnings found`
      );
      return ok(result);
    } catch (error) {
      this.logger.error('Dialyzer analysis failed:', error);
      return err({
        code: 'ANALYSIS_FAILED',
        message: `Dialyzer analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        tool: 'dialyzer',
        originalError: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Build PLT (Persistent Lookup Table) for Dialyzer
   */
  private async buildPlt(
    project: BeamProject,
    context: BeamAnalysisContext,
    pltPath: string
  ): Promise<Result<void, BeamAnalysisError>> {
    return new Promise((resolve) => {
      const args = ['--build_plt', '--output_plt', pltPath];

      // Add OTP applications
      args.push(
        '--apps',
        'erts',
        'kernel',
        'stdlib',
        'crypto',
        'public_key',
        'ssl'
      );

      // Add project-specific applications based on language
      if (project.language === 'elixir') {
        args.push('elixir', 'logger', 'runtime_tools');
      }

      // Add project applications
      for (const app of project.applications) {
        if (app.type === 'application') {
          args.push(app.name);
        }
      }

      this.logger.debug(
        `Building PLT with command: dialyzer ${args.join(' ')}`
      );

      const child = spawn('dialyzer', args, {
        cwd: context.workingDirectory,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = ';
      let stderr = ';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.logger.info('PLT build completed successfully');
          resolve(ok(undefined));
        } else {
          this.logger.error(`PLT build failed with code ${code}: ${stderr}`);
          resolve(
            err({
              code: 'ANALYSIS_FAILED',
              message: `PLT build failed: ${stderr}`,
              tool: 'dialyzer',
            })
          );
        }
      });

      child.on('error', (error) => {
        resolve(
          err({
            code: 'TOOL_NOT_FOUND',
            message: `Failed to spawn dialyzer: ${error.message}`,
            tool: 'dialyzer',
            originalError: error,
          })
        );
      });
    });
  }

  /**
   * Run Dialyzer analysis
   */
  private async runDialyzerAnalysis(
    project: BeamProject,
    context: BeamAnalysisContext,
    pltPath: string,
    options: {
      apps?: string[];
      warnings?: DialyzerWarningType[];
      outputFormat?: 'formatted|raw'';
    }
  ): Promise<Result<string, BeamAnalysisError>> {
    return new Promise((resolve) => {
      const args = ['--plt', pltPath];

      // Add warning flags
      if (options.warnings && options.warnings.length > 0) {
        for (const warning of options.warnings) {
          args.push(`-W${warning}`);
        }
      } else {
        // Default warnings
        args.push(
          '-Wunmatched_returns',
          '-Werror_handling',
          '-Wrace_conditions'
        );
      }

      // Add output format
      if (options.outputFormat === 'raw') {
        args.push('--raw');
      }

      // Add source directories
      if (project.buildTool === 'mix') {
        args.push('_build/dev/lib/*/ebin');
      } else if (project.buildTool === 'rebar3') {
        args.push('_build/default/lib/*/ebin');
      } else {
        // Fallback to common patterns
        args.push('ebin', '*/ebin', '_build/*/lib/*/ebin');
      }

      this.logger.debug(
        `Running Dialyzer with command: dialyzer ${args.join(' ')}`
      );

      const child = spawn('dialyzer', args, {
        cwd: context.workingDirectory,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = ';
      let stderr = ';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        // Dialyzer returns non-zero code when warnings are found
        // Code 2 means warnings, code 1 means errors, code 0 means success
        if (code === 0||code === 2) {
          resolve(ok(stdout));
        } else {
          this.logger.error(`Dialyzer failed with code ${code}: ${stderr}`);
          resolve(
            err({
              code:'ANALYSIS_FAILED',
              message: `Dialyzer analysis failed: ${stderr}`,
              tool: 'dialyzer',
            })
          );
        }
      });

      child.on('error', (error) => {
        resolve(
          err({
            code: 'TOOL_NOT_FOUND',
            message: `Failed to spawn dialyzer: ${error.message}`,
            tool: 'dialyzer',
            originalError: error,
          })
        );
      });
    });
  }

  /**
   * Parse Dialyzer output into structured warnings
   */
  private parseDialyzerOutput(output: string): DialyzerWarning[] {
    const warnings: DialyzerWarning[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.trim() === ''||line.startsWith('  ')) {
        continue;
      }

      const warning = this.parseDialyzerWarningLine(line);
      if (warning) {
        warnings.push(warning);
      }
    }

    return warnings;
  }

  /**
   * Parse a single Dialyzer warning line
   */
  private parseDialyzerWarningLine(line: string): DialyzerWarning|null {
    // Dialyzer warning format:
    // filename.erl:line: Warning: warning_type message
    // or
    // filename.erl:line: function_name/arity: Warning: warning_type message

    const match = line.match(
      /^([^:]+):(\d+):\s*(?:([^:]+):\s*)?Warning:\s*(.+)$/
    );
    if (!match) {
      return null;
    }

    const [, file, lineStr, functionSig, message] = match;
    const lineNum = parseInt(lineStr, 10);

    // Extract warning type from message
    const warningType = this.extractWarningType(message);

    const location: BeamLocation = {
      file,
      line: lineNum,
      context: functionSig||undefined,
    };

    return {
      type: warningType,
      function: functionSig||'unknown',
      message: message.trim(),
      location,
    };
  }

  /**
   * Extract Dialyzer warning type from message
   */
  private extractWarningType(message: string): DialyzerWarningType {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('no local return')||lowerMessage.includes('no return')
    ) {
      return 'no_return';
    }
    if (
      lowerMessage.includes('unused')||lowerMessage.includes('will never be called')
    ) {
      return 'unused_fun';
    }
    if (lowerMessage.includes('undefined')||lowerMessage.includes('undef')) {
      return 'undef';
    }
    if (lowerMessage.includes('unknown function')) {
      return 'unknown_function';
    }
    if (lowerMessage.includes('unknown type')) {
      return 'unknown_type';
    }
    if (
      lowerMessage.includes('race condition')||lowerMessage.includes('race')
    ) {
      return 'race_condition';
    }
    if (lowerMessage.includes('contract') && lowerMessage.includes('type')) {
      return 'contract_types';
    }
    if (lowerMessage.includes('invalid contract')) {
      return 'invalid_contract';
    }
    if (lowerMessage.includes('pattern')||lowerMessage.includes('match')) {
      return 'pattern_match';
    }
    if (lowerMessage.includes('opaque')) {
      return 'opaque';
    }
    if (lowerMessage.includes('spec')) {
      return 'specdiffs';
    }

    return 'unknown_function'; // Default fallback
  }

  /**
   * Get PLT information
   */
  async getPltInfo(
    pltPath: string
  ): Promise<Result<{ modules: string[]; size: number }, BeamAnalysisError>> {
    return new Promise((resolve) => {
      const child = spawn('dialyzer', ['--plt_info', '--plt', pltPath], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = ';
      let stderr = ';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          const modules = this.extractModulesFromPltInfo(stdout);
          resolve(
            ok({
              modules,
              size: stdout.length, // Approximation
            })
          );
        } else {
          resolve(
            err({
              code: 'ANALYSIS_FAILED',
              message: `PLT info failed: ${stderr}`,
              tool: 'dialyzer',
            })
          );
        }
      });

      child.on('error', (error) => {
        resolve(
          err({
            code: 'TOOL_NOT_FOUND',
            message: `Failed to get PLT info: ${error.message}`,
            tool: 'dialyzer',
            originalError: error,
          })
        );
      });
    });
  }

  /**
   * Extract module list from PLT info output
   */
  private extractModulesFromPltInfo(output: string): string[] {
    const modules: string[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/^\s*([a-z_][a-z0-9_]*)\s*$/);
      if (match) {
        modules.push(match[1]);
      }
    }

    return modules;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
