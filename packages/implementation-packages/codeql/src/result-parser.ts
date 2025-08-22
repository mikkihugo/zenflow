/**
 * @fileoverview CodeQL Result Parser
 * Parses SARIF results and converts to structured findings
 */

import {
  getLogger,
  Result,
  ok,
  err,
  safeAsync,
  type Logger,
} from '@claude-zen/foundation';

import type {
  SARIFResult,
  SARIFAnalysisResult,
  SARIFLocation,
  SARIFPhysicalLocation,
  CodeQLFinding,
  SourceLocation,
  DataFlowPath,
  DataFlowStep,
  SecurityClassification,
  FixSuggestion,
  CodeQLError,
} from './types/codeql-types';

/**
 * Parses CodeQL SARIF results into structured findings
 */
export class ResultParser {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ component: 'ResultParser' });
  }

  /**
   * Parse SARIF results into CodeQL findings
   */
  async parseSARIFToFindings(
    sarifResult: SARIFResult
  ): Promise<CodeQLFinding[]> {
    const findings: CodeQLFinding[] = [];

    for (const run of sarifResult.runs) {
      if (!run.results) continue;

      for (const result of run.results) {
        try {
          const finding = await this.parseAnalysisResult(result, run);
          if (finding) {
            findings.push(finding);
          }
        } catch (error) {
          this.logger.warn('Failed to parse analysis result', {
            ruleId: result.ruleId,
            error,
          });
        }
      }
    }

    this.logger.debug('Parsed SARIF results', {
      totalRuns: sarifResult.runs.length,
      totalFindings: findings.length,
    });

    return findings;
  }

  /**
   * Parse a single SARIF analysis result
   */
  private async parseAnalysisResult(
    result: SARIFAnalysisResult,
    run: any
  ): Promise<CodeQLFinding'' | ''null> {
    if (!result.locations'' | '''' | ''result.locations.length === 0) {
      return null;
    }

    const primaryLocation = this.parseLocation(result.locations[0]);
    if (!primaryLocation) {
      return null;
    }

    // Parse related locations
    const relatedLocations =
      result.relatedLocations
        ?.map((loc) => this.parseLocation(loc))
        .filter((loc): loc is SourceLocation => loc !== null)'' | '''' | ''[];

    // Parse data flow if present
    const dataFlow =
      result.codeFlows && result.codeFlows.length > 0
        ? this.parseDataFlow(result.codeFlows[0])
        : undefined;

    // Get rule information
    const rule = this.findRule(result.ruleId, run);
    const ruleName = rule?.name'' | '''' | ''result.ruleId;

    // Generate security classification
    const security = this.generateSecurityClassification(result.ruleId, rule);

    // Generate fix suggestions
    const fixSuggestions = await this.generateFixSuggestions(
      result,
      primaryLocation
    );

    const finding: CodeQLFinding = {
      id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: result.ruleId,
      ruleName,
      severity: this.mapSeverity(result.level'' | '''' | '''warning'),
      filePath: primaryLocation.filePath,
      location: primaryLocation,
      relatedLocations,
      message: result.message.text,
      description: rule?.fullDescription?.text,
      snippet: await this.extractCodeSnippet(primaryLocation),
      dataFlow,
      security,
      fixSuggestions,
      confidence: this.calculateConfidence(result, rule),
      properties: {
        ruleIndex: result.ruleIndex,
        analysisTarget: result.analysisTarget,
        ...result.properties,
      },
    };

    return finding;
  }

  /**
   * Parse SARIF location to source location
   */
  private parseLocation(sarifLocation: SARIFLocation): SourceLocation'' | ''null {
    const physicalLocation = sarifLocation.physicalLocation;
    if (!physicalLocation) {
      return null;
    }

    const region = physicalLocation.region;
    if (!region) {
      return null;
    }

    return {
      filePath: physicalLocation.artifactLocation.uri,
      startLine: region.startLine,
      startColumn: region.startColumn,
      endLine: region.endLine,
      endColumn: region.endColumn,
      message: sarifLocation.message?.text,
    };
  }

  /**
   * Parse CodeQL data flow from SARIF code flows
   */
  private parseDataFlow(codeFlow: any): DataFlowPath'' | ''undefined {
    if (!codeFlow.threadFlows'' | '''' | ''codeFlow.threadFlows.length === 0) {
      return undefined;
    }

    const threadFlow = codeFlow.threadFlows[0];
    if (!threadFlow.locations'' | '''' | ''threadFlow.locations.length < 2) {
      return undefined;
    }

    const steps: DataFlowStep[] = [];
    let source: SourceLocation'' | ''null = null;
    let sink: SourceLocation'' | ''null = null;

    for (let i = 0; i < threadFlow.locations.length; i++) {
      const flowLocation = threadFlow.locations[i];
      const location = this.parseLocation(flowLocation.location);

      if (!location) continue;

      if (i === 0) {
        source = location;
      }
      if (i === threadFlow.locations.length - 1) {
        sink = location;
      }

      steps.push({
        location,
        description: flowLocation.location.message?.text'' | '''' | ''`Step ${i + 1}`,
        stepNumber: i + 1,
        isSanitizer: flowLocation.importance ==='unimportant', // Heuristic
      });
    }

    if (!source'' | '''' | ''!sink) {
      return undefined;
    }

    return {
      steps,
      source,
      sink,
      type:'taint', // Default to taint flow
    };
  }

  /**
   * Find rule definition in run data
   */
  private findRule(ruleId: string, run: any): any {
    if (!run.tool?.driver?.rules) {
      return null;
    }

    return run.tool.driver.rules.find((rule: any) => rule.id === ruleId);
  }

  /**
   * Generate security classification for finding
   */
  private generateSecurityClassification(
    ruleId: string,
    rule: any
  ): SecurityClassification'' | ''undefined {
    // Map common CodeQL security rules to classifications
    const securityMappings: Record<string, Partial<SecurityClassification>> = {'js/sql-injection': {
        cweId: 89,
        owaspCategory: 'A03:2021 – Injection',
        securitySeverity: 'high',
        attackVector: 'network',
        exploitability: 0.8,
      },
      'js/xss': {
        cweId: 79,
        owaspCategory: 'A03:2021 – Injection',
        securitySeverity: 'high',
        attackVector: 'network',
        exploitability: 0.9,
      },
      'js/path-injection': {
        cweId: 22,
        owaspCategory: 'A01:2021 – Broken Access Control',
        securitySeverity: 'high',
        attackVector: 'network',
        exploitability: 0.7,
      },
      'js/unsafe-deserialization': {
        cweId: 502,
        owaspCategory: 'A08:2021 – Software and Data Integrity Failures',
        securitySeverity: 'critical',
        attackVector: 'network',
        exploitability: 0.6,
      },
      'js/code-injection': {
        cweId: 94,
        owaspCategory: 'A03:2021 – Injection',
        securitySeverity: 'critical',
        attackVector: 'network',
        exploitability: 0.8,
      },
    };

    const mapping = securityMappings[ruleId];
    if (!mapping) {
      // Check if rule appears to be security-related
      const isSecurityRule =
        ruleId.includes('security')'' | '''' | ''ruleId.includes('injection')'' | '''' | ''ruleId.includes('xss')'' | '''' | ''ruleId.includes('csrf')'' | '''' | ''ruleId.includes('auth');

      if (!isSecurityRule) {
        return undefined;
      }

      // Default security classification for unrecognized security rules
      return {
        securitySeverity: 'medium',
        attackVector: 'network',
        exploitability: 0.5,
      };
    }

    return {
      securitySeverity: 'medium',
      attackVector: 'network',
      exploitability: 0.5,
      ...mapping,
    } as SecurityClassification;
  }

  /**
   * Generate fix suggestions for finding
   */
  private async generateFixSuggestions(
    result: SARIFAnalysisResult,
    location: SourceLocation
  ): Promise<FixSuggestion[]> {
    const suggestions: FixSuggestion[] = [];

    // Common fix patterns based on rule types
    const fixPatterns: Record<string, string> = {
      'js/sql-injection':
        'Use parameterized queries instead of string concatenation',
      'js/xss': 'Sanitize user input before rendering in HTML',
      'js/path-injection': 'Validate and sanitize file paths',
      'js/unsafe-deserialization':
        'Use safe deserialization methods or validate input',
      'js/hardcoded-credentials':
        'Move credentials to environment variables or secure storage',
    };

    const fixDescription = fixPatterns[result.ruleId];
    if (fixDescription) {
      suggestions.push({
        description: fixDescription,
        filePath: location.filePath,
        confidence: 0.7,
        type: 'rewrite',
      });
    }

    return suggestions;
  }

  /**
   * Extract code snippet from location
   */
  private async extractCodeSnippet(
    location: SourceLocation
  ): Promise<string'' | ''undefined> {
    try {
      const content = await fs.readFile(location.filePath,'utf-8');
      const lines = content.split('\n');

      const startLine = Math.max(0, location.startLine - 1);
      const endLine = Math.min(
        lines.length,
        location.endLine'' | '''' | ''location.startLine
      );

      return lines.slice(startLine, endLine).join('\n');
    } catch {
      return undefined;
    }
  }

  /**
   * Map SARIF severity to standard severity levels
   */
  private mapSeverity(
    sarifLevel: string
  ): 'error | warning' | 'note''' | '''info' {
    switch (sarifLevel.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'note':
        return 'note';
      case 'info':
        return 'info';
      default:
        return 'warning';
    }
  }

  /**
   * Calculate confidence score for finding
   */
  private calculateConfidence(result: SARIFAnalysisResult, rule: any): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on rule quality
    if (rule?.defaultConfiguration?.rank) {
      confidence = Math.min(
        0.95,
        confidence + rule.defaultConfiguration.rank / 100
      );
    }

    // Adjust based on data flow complexity
    if (result.codeFlows && result.codeFlows.length > 0) {
      const flowLength =
        result.codeFlows[0].threadFlows?.[0]?.locations?.length'' | '''' | ''0;
      if (flowLength > 5) {
        confidence = Math.max(0.6, confidence - 0.1); // Complex flows are less certain
      }
    }

    // Adjust based on location quality
    if (result.locations.length > 1) {
      confidence += 0.05; // Multiple locations increase confidence
    }

    return Math.min(0.99, Math.max(0.1, confidence));
  }

  private createError(
    type: CodeQLError['type'],
    message: string,
    details: Record<string, unknown> = {}
  ): CodeQLError {
    const error = new Error(message) as CodeQLError;
    error.type = type;
    Object.assign(error, details);
    return error;
  }
}
