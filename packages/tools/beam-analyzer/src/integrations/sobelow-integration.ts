/**
 * @fileoverview Sobelow Integration
 * Security-focused static analysis for Phoenix/Elixir applications
 */


import { spawn } from 'node: child_process';
import { err, getLogger, ok, type Result } from '@claude-zen/foundation';

import type {
  BeamAnalysisContext,
  BeamAnalysisError,
  BeamProject,
  ConfigSecurityIssue,
  PhoenixSecurityIssue,
  SobelowFinding,
  SobelowResult,
} from '../types/beam-types';

export class SobelowIntegration {
  private logger = getLogger('SobelowIntegration');')
  /**
   * Run Sobelow security analysis on an Elixir/Phoenix project
   */
  async analyze(project: BeamProject,
    context: BeamAnalysisContext,
    options:{
      format?:'json' | ' txt' | ' compact';
      confidence?:'high' | ' medium' | ' low';
      skipFiles?:string[];
      configFile?:string;
      verbose?:boolean;
} = {}
  ): Promise<Result<SobelowResult, BeamAnalysisError>> {
    try {
      if (project.language !== 'elixir') {
    ')        return err({
          code: 'CONFIGURATION_ERROR',          message: 'Sobelow can only analyze Elixir projects',          tool: 'sobelow',});
}

      this.logger.info('Running Sobelow security analysis...');')
      // Run Sobelow analysis
      const analysisResult = await this.runSobelowAnalysis(
        project,
        context,
        options
      );
      if (!analysisResult.isOk()) {
        return err(analysisResult.error);
}

      // Parse results
      const result = this.parseSobelowOutput(
        analysisResult.value,
        options.format||'json')      );

      this.logger.info(
        `Sobelow analysis completed: ${result.findings.length} security findings``
      );
      return ok(result);
} catch (error) {
      this.logger.error('Sobelow analysis failed:', error);')      return err({
        code: 'ANALYSIS_FAILED',        message:`Sobelow analysis failed: ${error instanceof Error ? error.message : String(error)}`,`
        tool: 'sobelow',        originalError: error instanceof Error ? error : undefined,
});
}
}

  /**
   * Run Sobelow analysis command
   */
  private async runSobelowAnalysis(project: BeamProject,
    context: BeamAnalysisContext,
    options:{
      format?:string;
      confidence?:string;
      skipFiles?:string[];
      configFile?:string;
      verbose?:boolean;
}
  ): Promise<Result<string, BeamAnalysisError>> {
    return new Promise((resolve) => {
      const args: string[] = [];

      // Set output format
      if (options.format) {
        args.push(`--format`, options.format);`
} else {
        args.push('--format',    'json');')}

      // Set confidence level
      if (options.confidence) {
        switch (options.confidence) {
          case 'high': ')'            args.push('--confidence',    'high');')            break;
          case 'medium': ')'            args.push('--confidence',    'medium');')            break;
          case 'low': ')'            args.push('--confidence',    'low');')            break;
}
}

      // Skip specific files
      if (options.skipFiles && options.skipFiles.length > 0) {
        for (const file of options.skipFiles) {
          args.push('--skip', file);')}
}

      // Use custom config file
      if (options.configFile) {
        args.push('--config', options.configFile);')}

      // Verbose output
      if (options.verbose) {
        args.push('--verbose');')}

      // Add project root
      args.push('.');')
      this.logger.debug(
        `Running Sobelow with command: sobelow $args.join(' ')``
      );

      const child = spawn('sobelow', args, {
    ')        cwd: context.workingDirectory,
        stdio:['ignore',    'pipe',    'pipe'],
});

      const stdout = ';
      const stderr = ';

      child.stdout.on('data', (_data) => {
    ')        stdout += data.toString();
});

      child.stderr.on('data', (_data) => {
    ')        stderr += data.toString();
});

      child.on('close', (code) => {
    ')        // Sobelow returns non-zero when vulnerabilities are found
        if (code === 0||code === 1) {
          resolve(ok(stdout));
} else {
          this.logger.error(`Sobelow failed with code ${code}:${stderr}`);`
          resolve(
            err({
              code: 'ANALYSIS_FAILED',              message:`Sobelow analysis failed: $stderr`,`
              tool: 'sobelow',})
          );
}
});

      child.on('error', (error) => {
    ')        resolve(
          err(
            code: 'TOOL_NOT_FOUND',            message:`Failed to spawn sobelow: $error.message`,`
            tool: 'sobelow',            originalError: error,)
        );
});
});
}

  /**
   * Parse Sobelow output into structured results
   */
  private parseSobelowOutput(output: string, format: string): SobelowResult {
    const result: SobelowResult = {
      findings:[],
      phoenixIssues:[],
      configIssues:[],
};

    try {
      if (format === 'json') {
    ')        const jsonData = JSON.parse(output);
        result.findings = this.parseJsonFindings(jsonData);
        result.phoenixIssues = this.parsePhoenixIssues(jsonData);
        result.configIssues = this.parseConfigIssues(jsonData);
} else {
        // Parse text format
        result.findings = this.parseTextFindings(output);
}
} catch (_error) {
      this.logger.warn(
        'Failed to parse Sobelow output as JSON, attempting text parsing');')      result.findings = this.parseTextFindings(output);
}

    return result;
}

  /**
   * Parse JSON format findings
   */
  private parseJsonFindings(jsonData: any): SobelowFinding[] {
    const findings: SobelowFinding[] = [];

    if (!jsonData.findings) {
      return findings;
}

    for (const finding of jsonData.findings) {
      const sobelowFinding: SobelowFinding = {
        category: this.mapSobelowCategory(finding.type),
        confidence: finding.confidence||'medium',        details: finding.details||finding.message||',        location:{
          file: finding.file||',          line: finding.line||1,
          column: finding.column,
          context: finding.fun||finding.variable||finding.module,
},
        owasp: finding.owasp,
        cwe: finding.cwe ? parseInt(finding.cwe, 10) :undefined,
};

      findings.push(sobelowFinding);
}

    return findings;
}

  /**
   * Parse text format findings
   */
  private parseTextFindings(output: string): SobelowFinding[] {
    const findings: SobelowFinding[] = [];
    const lines = output.split('\n');')
    let currentFinding: Partial<SobelowFinding>|null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed ===') {
    ')        if (currentFinding) {
          findings.push(currentFinding as SobelowFinding);
          currentFinding = null;
}
        continue;
}

      // Match finding headers like "SQL injection - High confidence"
      const headerMatch = trimmed.match(/^(.+?)\s+-\s+(\w+)\s+confidence/i);
      if (headerMatch) {
        if (currentFinding) {
          findings.push(currentFinding as SobelowFinding);
}

        currentFinding = {
          category: this.mapSobelowCategoryFromText(headerMatch[1]),
          confidence: headerMatch[2].toLowerCase() as 'high'|' medium'|' low',          details: headerMatch[1],
          location:{
            file: ','            line:1,
},
};
        continue;
}

      // Match file location like "File: lib/my_app_web/controllers/user_controller.ex:42"
      const fileMatch = trimmed.match(/^File:\s+(.+):(\d+)/);
      if (fileMatch && currentFinding) {
        currentFinding.location = {
          file: fileMatch[1],
          line: parseInt(fileMatch[2], 10),
};
        continue;
}

      // Add details to current finding
      if (currentFinding && trimmed.startsWith('-')) {
    ')        currentFinding.details += `\n$trimmed`;`
}
}

    // Don't forget the last finding')    if (currentFinding) {
      findings.push(currentFinding as SobelowFinding);
}

    return findings;
}

  /**
   * Parse Phoenix-specific security issues
   */
  private parsePhoenixIssues(jsonData: any): PhoenixSecurityIssue[] {
    const issues: PhoenixSecurityIssue[] = [];

    if (!jsonData.phoenix) {
      return issues;
}

    for (const issue of jsonData.phoenix) {
      issues.push({
        type: issue.type,
        component:
          issue.component||issue.controller||issue.view||'unknown',        risk: this.mapSeverity(issue.severity||'medium'),
        mitigation:
          issue.mitigation||'Review and apply security best practices',});
}

    return issues;
}

  /**
   * Parse configuration security issues
   */
  private parseConfigIssues(jsonData: any): ConfigSecurityIssue[] {
    const issues: ConfigSecurityIssue[] = [];

    if (!jsonData.config) {
      return issues;
}

    for (const issue of jsonData.config) {
      issues.push({
        file: issue.file||'config/config.exs',        setting: issue.setting||'unknown',        issue: issue.issue||issue.message||',        recommendation: issue.recommendation||'Apply security best practices',});
}

    return issues;
}

  /**
   * Map Sobelow category strings to enum values
   */
  private mapSobelowCategory(category: string): SobelowCategory {
    const lowerCategory = category.toLowerCase().replace(/[\s_-]/g, ');')
    switch (lowerCategory) {
      case 'sqlinjection': ')'      case 'sql': ')'        return 'sql_injection;
      case 'xss': ')'      case 'crosssitescripting': ')'        return 'xss;
      case 'csrf': ')'      case 'crosssiterequestforgery': ')'        return 'csrf;
      case 'directorytraversal': ')'      case 'pathtraversal': ')'        return 'directory_traversal;
      case 'commandinjection': ')'      case 'command': ')'        return 'command_injection;
      case 'codeinjection': ')'      case 'code': ')'        return 'code_injection;
      case 'redirect': ')'      case 'openredirect': ')'        return 'redirect;
      case 'traversal': ')'        return 'traversal;
      case 'rce': ')'      case 'remoteexecution': ')'        return 'rce;
      case 'dos': ')'      case 'denialofservice': ')'        return 'dos;
      default:
        return 'misc;
}
}

  /**
   * Map category from text descriptions
   */
  private mapSobelowCategoryFromText(text: string): SobelowCategory {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('sql')) return ' sql_injection;
    if (lowerText.includes('xss')||lowerText.includes(' cross-site scripting'))')      return 'xss;
    if (lowerText.includes('csrf')||lowerText.includes(' cross-site request'))')      return 'csrf;
    if (lowerText.includes('directory')||lowerText.includes(' path'))')      return 'directory_traversal;
    if (lowerText.includes('command')) return ' command_injection;
    if (lowerText.includes('code injection')) return ' code_injection;
    if (lowerText.includes('redirect')) return ' redirect;
    if (lowerText.includes('traversal')) return ' traversal;
    if (lowerText.includes('execution')) return ' rce;
    if (lowerText.includes('dos')||lowerText.includes(' denial')) return ' dos;

    return 'misc;
}

  /**
   * Map severity strings to BeamSeverity enum
   */
  private mapSeverity(severity: string): BeamSeverity {
    switch (severity.toLowerCase()) {
      case 'critical': ')'        return 'critical;
      case 'high': ')'        return 'high;
      case 'medium': ')'        return 'medium;
      case 'low': ')'        return 'low;
      default:
        return 'medium;
}
}

  /**
   * Check if Sobelow is available and get version
   */
  async checkAvailability():Promise<Result<string, BeamAnalysisError>> {
    return new Promise((resolve) => {
      const child = spawn('sobelow', ['--version'], {
    ')        stdio:['ignore',    'pipe',    'pipe'],
});

      const stdout = ';
      const __stderr = ';

      child.stdout.on('data', (_data) => {
    ')        stdout += data.toString();
});

      child.stderr.on('data', (_data) => {
    ')        stderr += data.toString();
});

      child.on('close', (code) => {
    ')        if (code === 0) {
          const version = stdout.trim().split('\n')[0]||' unknown;
          resolve(ok(version));
} else {
          resolve(
            err({
              code: 'TOOL_NOT_FOUND',              message: 'Sobelow not found or not working',              tool: 'sobelow',})
          );
}
});

      child.on('error', (error) => {
    ')        resolve(
          err(
            code: 'TOOL_NOT_FOUND',            message:`Sobelow not available: $error.message`,`
            tool: 'sobelow',            originalError: error,)
        );
});
});
}

  /**
   * Get Sobelow configuration template
   */
  generateConfig():string {
    return `# Sobelow Configuration`
# Generated by Claude Zen BEAM Analyzer

[
  verbose: false,
  private: false,
  skip_files:[],
  ignore_files:[],
  details: true,
  
  # Security checks to run
  checks:%
    # SQL Injection
    sql_injection: true,
    
    # Cross-Site Scripting (XSS)
    xss: true,
    
    # Cross-Site Request Forgery (CSRF)
    csrf: true,
    
    # Directory Traversal
    traversal: true,
    
    # Command Injection
    command_injection: true,
    
    # Code Injection
    code_injection: true,
    
    # Open Redirect
    redirect: true,
    
    # Denial of Service
    dos: true,
    
    # Miscellaneous
    misc: true,
  
  # Custom rules
  custom_rules:[]
]
`;`
}
}
