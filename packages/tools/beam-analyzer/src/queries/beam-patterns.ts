/**
 * @fileoverview BEAM Pattern Analysis
 * Custom analysis patterns for BEAM ecosystem best practices and anti-patterns
 */


import { err, getLogger, ok, type Result } from '@claude-zen/foundation';

import type {
  BeamAnalysisError,
  BeamAnalysisRule,
  BeamFinding,
  BeamProject,
} from '../types/beam-types';

export class BeamPatternAnalyzer {
  private logger = getLogger('BeamPatternAnalyzer');
  /**
   * Analyze BEAM project for common patterns and anti-patterns
   */
  async analyzePatterns(project: BeamProject,
    _customRules: BeamAnalysisRule[] = []
  ): Promise<Result<BeamFinding[], BeamAnalysisError>> {
    try {
      this.logger.info(
        `Analyzing BEAM patterns for ${project.language} project``
      );

      const findings: BeamFinding[] = [];

      // Get default rules for the project's languages')      const defaultRules = this.getDefaultRules([
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
}

    return findings;
}

  /**
   * Get location information from regex match
   */
  private getLocationFromMatch(match: RegExpExecArray,
    lines: string[]
  ): BeamLocation {
    const beforeMatch = match.input?.substring(0, match.index);
    const lineCount = (beforeMatch.match(/\n/g)||[]).length;
    const lineStart = beforeMatch.lastIndexOf('\n') + 1;')    const column = match.index! - lineStart + 1;

    return {
      file:', // Will be set by caller')      line: lineCount + 1,
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
  ):boolean {
    // This is a simplified constraint checker
    // In a real implementation, you'd have more sophisticated constraint checking')
    if (constraints.context === 'case_expression') {
    ')      // Check if match is inside a case expression
      const beforeMatch = content.substring(0, match.index);
      return beforeMatch.includes('case') && !beforeMatch.includes(' end');')}

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
    if (rule.name.includes('leak')||rule.name.includes(' monitor')) {
    ')      return 'reliability;
}
    if (rule.name.includes('performance')||rule.name.includes(' enum')) {
    ')      return 'performance;
}
    if (rule.name.includes('supervisor')||rule.name.includes(' genserver')) {
    ')      return 'otp-patterns;
}
    if (rule.name.includes('async')||rule.name.includes(' task')) {
    ')      return 'concurrency;
}
    if (rule.name.includes('restart')||rule.name.includes(' exit')) {
    ')      return 'fault-tolerance;
}

    return 'maintainability;
}

  /**
   * Get source files for analysis
   */
  private async getSourceFiles(sourceDir: string,
    language: BeamLanguage
  ): Promise<string[]> {
    const files: string[] = [];

    const extensions = {
      erlang:['.erl',    '.hrl'],
      elixir:['.ex',    '.exs'],
      gleam:['.gleam'],
      lfe:['.lfe'],
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
  private async scanDirectory(dir: string,
    extensions: string[],
    files: string[]
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true});

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
      this.logger.debug(`Directory scan failed: ${error}`);
}
}
}
