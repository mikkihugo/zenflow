/**
 * @fileoverview BEAM Pattern Analysis
 * Custom analysis patterns for BEAM ecosystem best practices and anti-patterns
 */

import { promises as fs } from 'fs';
import * as path from 'path';

import { getLogger, Result, ok, err } from '@claude-zen/foundation';
import type {
  BeamProject,
  BeamAnalysisRule,
  BeamPattern,
  BeamFinding,
  BeamLanguage,
  BeamSeverity,
  BeamFindingCategory,
  BeamLocation,
  BeamAnalysisError,
} from '../types/beam-types';

export class BeamPatternAnalyzer {
  private logger = getLogger('BeamPatternAnalyzer');

  /**
   * Analyze BEAM project for common patterns and anti-patterns
   */
  async analyzePatterns(
    project: BeamProject,
    customRules: BeamAnalysisRule[] = []
  ): Promise<Result<BeamFinding[], BeamAnalysisError>> {
    try {
      this.logger.info(
        `Analyzing BEAM patterns for ${project.language} project`
      );

      const findings: BeamFinding[] = [];

      // Get default rules for the project's languages
      const defaultRules = this.getDefaultRules([
        project.language,
        ...(project.additionalLanguages||[]),
      ]);
      const allRules = [...defaultRules, ...customRules];

      // Analyze each source file
      for (const app of project.applications) {
        for (const sourceDir of app.sourceDirs) {
          const files = await this.getSourceFiles(
            path.join(project.root, sourceDir),
            project.language
          );

          for (const file of files) {
            const fileFindings = await this.analyzeFile(file, allRules);
            findings.push(...fileFindings);
          }
        }
      }

      this.logger.info(
        `Pattern analysis completed: ${findings.length} findings`
      );
      return ok(findings);
    } catch (error) {
      this.logger.error('Pattern analysis failed:', error);
      return err({
        code: 'ANALYSIS_FAILED',
        message: `Pattern analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        originalError: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Get default analysis rules for BEAM languages
   */
  private getDefaultRules(languages: BeamLanguage[]): BeamAnalysisRule[] {
    const rules: BeamAnalysisRule[] = [];

    for (const language of languages) {
      rules.push(...this.getRulesForLanguage(language));
    }

    return rules;
  }

  /**
   * Get language-specific rules
   */
  private getRulesForLanguage(language: BeamLanguage): BeamAnalysisRule[] {
    switch (language) {
      case 'erlang':
        return this.getErlangRules();
      case 'elixir':
        return this.getElixirRules();
      case 'gleam':
        return this.getGleamRules();
      case 'lfe':
        return this.getLfeRules();
      default:
        return [];
    }
  }

  /**
   * Erlang-specific analysis rules
   */
  private getErlangRules(): BeamAnalysisRule[] {
    return [
      {
        name: 'erlang-catch-all-pattern',
        description: 'Avoid catch-all patterns in critical functions',
        severity: 'medium',
        languages: ['erlang'],
        pattern: {
          type: 'regex',
          expression: '\\s*_\\s*->',
          constraints: { context: 'case_expression' },
        },
        messageTemplate: 'Catch-all pattern may hide errors',
        fixSuggestion: 'Consider explicit pattern matching or error handling',
      },
      {
        name: 'erlang-process-leak',
        description:
          'Potential process leak - spawned process not linked or monitored',
        severity: 'high',
        languages: ['erlang'],
        pattern: {
          type: 'regex',
          expression: 'spawn\\s*\\(',
          constraints: { not_followed_by: ['link', 'monitor'] },
        },
        messageTemplate: 'Spawned process should be linked or monitored',
        fixSuggestion: 'Use spawn_link/1,3 or spawn_monitor/1,3',
      },
      {
        name: 'erlang-gen-server-sync',
        description: 'Synchronous call without timeout in gen_server',
        severity: 'medium',
        languages: ['erlang'],
        pattern: {
          type: 'regex',
          expression: 'gen_server:call\\s*\\([^,)]+\\)',
          constraints: { no_timeout: true },
        },
        messageTemplate:
          'gen_server:call without timeout may block indefinitely',
        fixSuggestion:
          'Add timeout parameter: gen_server:call(Server, Request, Timeout)',
      },
      {
        name: 'erlang-exit-normal',
        description: 'Using exit(normal) in worker processes',
        severity: 'low',
        languages: ['erlang'],
        pattern: {
          type: 'regex',
          expression: 'exit\\s*\\(\\s*normal\\s*\\)',
          constraints: {},
        },
        messageTemplate: 'exit(normal) in worker may cause supervisor issues',
        fixSuggestion: 'Consider using exit(shutdown) or proper error handling',
      },
    ];
  }

  /**
   * Elixir-specific analysis rules
   */
  private getElixirRules(): BeamAnalysisRule[] {
    return [
      {
        name: 'elixir-task-async-await',
        description: 'Task.async without corresponding await',
        severity: 'high',
        languages: ['elixir'],
        pattern: {
          type: 'regex',
          expression: 'Task\\.async\\s*\\(',
          constraints: { missing_await: true },
        },
        messageTemplate: 'Task.async should have corresponding Task.await',
        fixSuggestion:
          'Add Task.await/1,2 or use Task.start/1 for fire-and-forget',
      },
      {
        name: 'elixir-genserver-cast-sync',
        description:
          'Using GenServer.cast for operations that should be synchronous',
        severity: 'medium',
        languages: ['elixir'],
        pattern: {
          type: 'regex',
          expression: 'GenServer\\.cast\\s*\\([^,)]+,\\s*\\{:update',
          constraints: {},
        },
        messageTemplate:
          'Update operations should use GenServer.call for confirmation',
        fixSuggestion:
          'Use GenServer.call/2,3 for operations requiring confirmation',
      },
      {
        name: 'elixir-supervisor-restart-permanent',
        description: 'Using :permanent restart strategy inappropriately',
        severity: 'medium',
        languages: ['elixir'],
        pattern: {
          type: 'regex',
          expression: 'restart:\\s*:permanent',
          constraints: { in_worker: true },
        },
        messageTemplate:
          'Consider if :permanent restart is appropriate for this worker',
        fixSuggestion:
          'Use :temporary for one-off tasks, :transient for tasks that may fail normally',
      },
      {
        name: 'elixir-enum-into-performance',
        description: 'Inefficient use of Enum.into with large collections',
        severity: 'low',
        languages: ['elixir'],
        pattern: {
          type: 'regex',
          expression: 'Enum\\.into\\s*\\(.+\\|>\\s*Enum\\.',
          constraints: {},
        },
        messageTemplate:
          'Chaining Enum operations with Enum.into may be inefficient',
        fixSuggestion:
          'Consider using Stream for lazy evaluation or direct collection functions',
      },
      {
        name: 'elixir-phoenix-controller-private',
        description: 'Private functions in Phoenix controllers',
        severity: 'low',
        languages: ['elixir'],
        pattern: {
          type: 'regex',
          expression: 'defp\\s+\\w+.*conn,',
          constraints: { in_controller: true },
        },
        messageTemplate:
          'Consider extracting private controller logic to separate modules',
        fixSuggestion: 'Move business logic to contexts or service modules',
      },
    ];
  }

  /**
   * Gleam-specific analysis rules
   */
  private getGleamRules(): BeamAnalysisRule[] {
    return [
      {
        name: 'gleam-unused-result',
        description: 'Result type not handled properly',
        severity: 'high',
        languages: ['gleam'],
        pattern: {
          type: 'regex',
          expression: 'Result\\([^)]+\\)',
          constraints: { not_handled: true },
        },
        messageTemplate:
          'Result type should be handled with case expression or try syntax',
        fixSuggestion:
          'Use case expression or try syntax to handle Ok/Error variants',
      },
      {
        name: 'gleam-todo-fixme',
        description: 'TODO or FIXME comments in production code',
        severity: 'low',
        languages: ['gleam'],
        pattern: {
          type: 'regex',
          expression: '//.*(TODO|FIXME|XXX)',
          constraints: {},
        },
        messageTemplate: 'TODO/FIXME comment should be addressed',
        fixSuggestion: 'Complete the implementation or create a proper issue',
      },
    ];
  }

  /**
   * LFE-specific analysis rules
   */
  private getLfeRules(): BeamAnalysisRule[] {
    return [
      {
        name: 'lfe-lambda-complexity',
        description:
          'Complex lambda expressions that should be named functions',
        severity: 'medium',
        languages: ['lfe'],
        pattern: {
          type: 'regex',
          expression: '\\(lambda\\s+\\([^)]*\\)[\\s\\S]{100,}',
          constraints: {},
        },
        messageTemplate: 'Complex lambda should be extracted to named function',
        fixSuggestion:
          'Extract lambda to defun for better readability and reusability',
      },
      {
        name: 'lfe-recursive-tail-call',
        description: 'Recursive function that may not be tail-call optimized',
        severity: 'medium',
        languages: ['lfe'],
        pattern: {
          type: 'regex',
          expression: '\\(defun\\s+(\\w+).*\\1[^)]*\\)[^)]*\\)',
          constraints: { not_tail_position: true },
        },
        messageTemplate: 'Recursive call may not be in tail position',
        fixSuggestion: 'Restructure to make recursive call the last operation',
      },
    ];
  }

  /**
   * Analyze a single file for pattern violations
   */
  private async analyzeFile(
    filePath: string,
    rules: BeamAnalysisRule[]
  ): Promise<BeamFinding[]> {
    const findings: BeamFinding[] = [];

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      for (const rule of rules) {
        if (!this.isRuleApplicable(filePath, rule)) {
          continue;
        }

        const ruleFindings = await this.applyRule(
          filePath,
          content,
          lines,
          rule
        );
        findings.push(...ruleFindings);
      }
    } catch (error) {
      this.logger.warn(`Failed to analyze file ${filePath}:`, error);
    }

    return findings;
  }

  /**
   * Check if rule is applicable to the given file
   */
  private isRuleApplicable(filePath: string, rule: BeamAnalysisRule): boolean {
    const ext = path.extname(filePath).toLowerCase();

    const languageExtensions = {
      erlang: ['.erl', '.hrl'],
      elixir: ['.ex', '.exs'],
      gleam: ['.gleam'],
      lfe: ['.lfe'],
    };

    for (const language of rule.languages) {
      if (languageExtensions[language]?.includes(ext)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Apply a rule to file content
   */
  private async applyRule(
    filePath: string,
    content: string,
    lines: string[],
    rule: BeamAnalysisRule
  ): Promise<BeamFinding[]> {
    const findings: BeamFinding[] = [];

    if (rule.pattern.type === 'regex') {
      const regex = new RegExp(rule.pattern.expression, 'gm');
      let match;

      while ((match = regex.exec(content)) !== null) {
        const location = this.getLocationFromMatch(match, lines);

        // Apply constraints if any
        if (
          rule.pattern.constraints &&
          !this.checkConstraints(match, content, rule.pattern.constraints)
        ) {
          continue;
        }

        const finding: BeamFinding = {
          id: `${rule.name}-${filePath}-${location.line}`,
          severity: rule.severity,
          category: this.getCategoryFromRule(rule),
          message: rule.messageTemplate,
          location: {
            ...location,
            file: filePath,
          },
          rule: rule.name,
          tool: 'beam-analyzer',
          suggestions: rule.fixSuggestion
            ? [
                {
                  description: rule.fixSuggestion,
                  confidence: 0.7,
                },
              ]
            : undefined,
        };

        findings.push(finding);
      }
    }

    return findings;
  }

  /**
   * Get location information from regex match
   */
  private getLocationFromMatch(
    match: RegExpExecArray,
    lines: string[]
  ): BeamLocation {
    const beforeMatch = match.input!.substring(0, match.index);
    const lineCount = (beforeMatch.match(/\n/g)||[]).length;
    const lineStart = beforeMatch.lastIndexOf('\n') + 1;
    const column = match.index! - lineStart + 1;

    return {
      file: '', // Will be set by caller
      line: lineCount + 1,
      column,
      context: lines[lineCount]?.trim(),
    };
  }

  /**
   * Check pattern constraints
   */
  private checkConstraints(
    match: RegExpExecArray,
    content: string,
    constraints: Record<string, unknown>
  ): boolean {
    // This is a simplified constraint checker
    // In a real implementation, you'd have more sophisticated constraint checking

    if (constraints.context === 'case_expression') {
      // Check if match is inside a case expression
      const beforeMatch = content.substring(0, match.index);
      return beforeMatch.includes('case') && !beforeMatch.includes('end');
    }

    if (constraints.not_followed_by) {
      const followingText = content.substring(
        match.index! + match[0].length,
        match.index! + match[0].length + 100
      );
      const patterns = constraints.not_followed_by as string[];
      return !patterns.some((pattern) => followingText.includes(pattern));
    }

    return true;
  }

  /**
   * Map rule to finding category
   */
  private getCategoryFromRule(rule: BeamAnalysisRule): BeamFindingCategory {
    if (rule.name.includes('leak')||rule.name.includes('monitor')) {
      return 'reliability';
    }
    if (rule.name.includes('performance')||rule.name.includes('enum')) {
      return 'performance';
    }
    if (rule.name.includes('supervisor')||rule.name.includes('genserver')) {
      return 'otp-patterns';
    }
    if (rule.name.includes('async')||rule.name.includes('task')) {
      return 'concurrency';
    }
    if (rule.name.includes('restart')||rule.name.includes('exit')) {
      return 'fault-tolerance';
    }

    return 'maintainability';
  }

  /**
   * Get source files for analysis
   */
  private async getSourceFiles(
    sourceDir: string,
    language: BeamLanguage
  ): Promise<string[]> {
    const files: string[] = [];

    const extensions = {
      erlang: ['.erl', '.hrl'],
      elixir: ['.ex', '.exs'],
      gleam: ['.gleam'],
      lfe: ['.lfe'],
    };

    const targetExtensions = extensions[language] || [];

    try {
      await this.scanDirectory(sourceDir, targetExtensions, files);
    } catch (error) {
      this.logger.warn(`Failed to scan directory ${sourceDir}:`, error);
    }

    return files;
  }

  /**
   * Recursively scan directory for source files
   */
  private async scanDirectory(
    dir: string,
    extensions: string[],
    files: string[]
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, extensions, files);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }
  }
}
