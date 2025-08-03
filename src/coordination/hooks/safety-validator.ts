/**
 * Safety Validation System
 * Validates potentially dangerous commands and operations, providing safer alternatives
 */

import type {
  FileOperation,
  Operation,
  RiskLevel,
  SafetyValidator,
  SecurityRisk,
  ValidationResult,
} from './enhanced-hook-system.ts';

export class BashSafetyValidator implements SafetyValidator {
  private readonly DANGEROUS_PATTERNS: Array<{
    pattern: RegExp;
    type: string;
    severity: RiskLevel;
    description: string;
    mitigation?: string;
  }> = [
    {
      pattern: /rm\s+-rf\s+\//,
      type: 'DESTRUCTIVE_DELETE',
      severity: 'CRITICAL',
      description: 'Recursive force delete from root directory',
      mitigation: 'Use specific path instead of root, add confirmation checks',
    },
    {
      pattern: />\s*\/dev\/\w+/,
      type: 'DEVICE_WRITE',
      severity: 'HIGH',
      description: 'Writing to device files',
      mitigation: 'Use proper device management tools instead',
    },
    {
      pattern: /curl\s+.*\|\s*sh/,
      type: 'REMOTE_EXECUTION',
      severity: 'CRITICAL',
      description: 'Piping downloaded content to shell',
      mitigation: 'Download file first, review content, then execute',
    },
    {
      pattern: /eval\s+\$\(/,
      type: 'DYNAMIC_EVALUATION',
      severity: 'HIGH',
      description: 'Dynamic command evaluation',
      mitigation: 'Use direct command execution instead of eval',
    },
    {
      pattern: /chmod\s+777/,
      type: 'PERMISSION_ABUSE',
      severity: 'MEDIUM',
      description: 'Overly permissive file permissions',
      mitigation: 'Use specific permissions like 755 or 644',
    },
    {
      pattern: /sudo\s+.*--preserve-env/,
      type: 'PRIVILEGE_ESCALATION',
      severity: 'HIGH',
      description: 'Dangerous sudo usage with environment preservation',
      mitigation: 'Use sudo with specific environment variables only',
    },
    {
      pattern: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;/,
      type: 'FORK_BOMB',
      severity: 'CRITICAL',
      description: 'Fork bomb pattern detected',
      mitigation: 'Remove fork bomb code',
    },
    {
      pattern: /dd\s+if=.*\/dev\/(zero|random).*of=.*\/.*bs=.*count=/,
      type: 'DISK_FLOOD',
      severity: 'HIGH',
      description: 'Potential disk flooding with dd command',
      mitigation: 'Use smaller block sizes and counts',
    },
    {
      pattern: /find\s+\/.*-exec\s+.*rm.*\{\}\s*\+/,
      type: 'MASS_DELETE',
      severity: 'HIGH',
      description: 'Mass file deletion using find and rm',
      mitigation: 'Test with -print first, use specific directories',
    },
    {
      pattern: /\$\(.*\|.*base64.*-d.*\)/,
      type: 'OBFUSCATED_COMMAND',
      severity: 'HIGH',
      description: 'Potentially obfuscated command execution',
      mitigation: 'Decode and review the command first',
    },
  ];

  private readonly HIGH_RISK_COMMANDS: Array<{
    command: string;
    description: string;
    alternatives: string[];
  }> = [
    {
      command: 'dd',
      description: 'Low-level disk operations',
      alternatives: ['cp', 'rsync', 'tar'],
    },
    {
      command: 'fdisk',
      description: 'Disk partitioning tool',
      alternatives: ['Use disk management GUI', 'parted', 'gparted'],
    },
    {
      command: 'mkfs',
      description: 'File system creation',
      alternatives: ['Use specific mkfs.ext4, mkfs.xfs with verification'],
    },
    {
      command: 'format',
      description: 'Disk formatting',
      alternatives: ['Use OS-specific formatting tools'],
    },
    {
      command: 'reboot',
      description: 'System restart',
      alternatives: ['systemctl reboot', 'shutdown -r now'],
    },
    {
      command: 'shutdown',
      description: 'System shutdown',
      alternatives: ['systemctl poweroff', 'shutdown -h now'],
    },
    {
      command: 'halt',
      description: 'System halt',
      alternatives: ['systemctl halt'],
    },
    {
      command: 'init',
      description: 'Process initialization',
      alternatives: ['systemctl', 'service command'],
    },
  ];

  private readonly SUSPICIOUS_PATHS = [
    '/',
    '/etc',
    '/bin',
    '/sbin',
    '/usr/bin',
    '/usr/sbin',
    '/boot',
    '/sys',
    '/proc',
  ];

  async validateCommand(command: string): Promise<ValidationResult> {
    const risks = this.identifyCommandRisks(command);
    const riskLevel = this.assessOverallRisk(risks);

    if (riskLevel === 'CRITICAL') {
      return {
        allowed: false,
        riskLevel,
        risks,
        reason: 'Command contains critical security risks and is blocked',
        alternatives: await this.suggestSaferAlternative(command),
        mitigations: this.generateMitigations(risks),
      };
    }

    if (riskLevel === 'HIGH') {
      return {
        allowed: true,
        requiresConfirmation: true,
        riskLevel,
        risks,
        reason: 'Command has high risk - requires explicit confirmation',
        alternatives: await this.suggestSaferAlternative(command),
        mitigations: this.generateMitigations(risks),
      };
    }

    if (riskLevel === 'MEDIUM') {
      return {
        allowed: true,
        riskLevel,
        risks,
        reason: 'Command has moderate risk - proceed with caution',
        alternatives: await this.suggestSaferAlternative(command),
        mitigations: this.generateMitigations(risks),
      };
    }

    return {
      allowed: true,
      riskLevel: 'LOW',
      risks: [],
      reason: 'Command appears safe to execute',
    };
  }

  async validateFileOperation(operation: FileOperation): Promise<ValidationResult> {
    const risks = this.identifyFileRisks(operation);
    const riskLevel = this.assessOverallRisk(risks);

    if (riskLevel === 'CRITICAL') {
      return {
        allowed: false,
        riskLevel,
        risks,
        reason: 'File operation contains critical security risks',
        mitigations: this.generateMitigations(risks),
      };
    }

    return {
      allowed: true,
      riskLevel,
      risks,
      reason: riskLevel === 'LOW' ? 'File operation appears safe' : 'File operation has some risks',
      mitigations: risks.length > 0 ? this.generateMitigations(risks) : undefined,
    };
  }

  async suggestSaferAlternative(command: string): Promise<string[]> {
    const alternatives: string[] = [];

    // Check for high-risk commands
    for (const riskCmd of this.HIGH_RISK_COMMANDS) {
      if (command.includes(riskCmd.command)) {
        alternatives.push(...riskCmd.alternatives);
      }
    }

    // Pattern-based alternatives
    if (command.includes('rm -rf')) {
      alternatives.push(
        'Use rm with specific files instead of -rf',
        'Use trash command for recoverable deletion',
        'Use find with -delete for controlled deletion'
      );
    }

    if (command.includes('curl') && command.includes('| sh')) {
      alternatives.push(
        'Download script first: curl -O <url>',
        'Review downloaded script before execution',
        'Use package manager instead if available'
      );
    }

    if (command.includes('chmod 777')) {
      alternatives.push(
        'Use chmod 755 for executables',
        'Use chmod 644 for regular files',
        'Set specific user/group permissions'
      );
    }

    if (command.includes('sudo') && command.includes('--preserve-env')) {
      alternatives.push(
        'Use sudo with specific -E variables',
        'Use sudo without environment preservation',
        'Configure sudoers file for specific permissions'
      );
    }

    return alternatives;
  }

  async assessRiskLevel(operation: Operation): Promise<RiskLevel> {
    if (operation.command) {
      const result = await this.validateCommand(operation.command);
      return result.riskLevel;
    }

    if (operation.filePath) {
      const fileOp: FileOperation = {
        type: operation.type as any,
        path: operation.filePath,
        content: operation.parameters.content as string,
      };
      const result = await this.validateFileOperation(fileOp);
      return result.riskLevel;
    }

    return 'LOW';
  }

  private identifyCommandRisks(command: string): SecurityRisk[] {
    const risks: SecurityRisk[] = [];

    // Check against dangerous patterns
    for (const { pattern, type, severity, description, mitigation } of this.DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        risks.push({
          type,
          pattern: pattern.source,
          severity,
          description,
          mitigation,
        });
      }
    }

    // Check for high-risk commands
    for (const { command: riskCmd, description } of this.HIGH_RISK_COMMANDS) {
      if (command.includes(riskCmd)) {
        risks.push({
          type: 'HIGH_RISK_COMMAND',
          command: riskCmd,
          severity: 'HIGH',
          description: `Command '${riskCmd}' detected: ${description}`,
          mitigation: 'Verify command necessity and use safer alternatives',
        });
      }
    }

    // Check for suspicious paths
    for (const suspiciousPath of this.SUSPICIOUS_PATHS) {
      if (command.includes(suspiciousPath)) {
        risks.push({
          type: 'SUSPICIOUS_PATH',
          severity: 'MEDIUM',
          description: `Command accesses sensitive system path: ${suspiciousPath}`,
          mitigation: 'Ensure path access is necessary and authorized',
        });
      }
    }

    return risks;
  }

  private identifyFileRisks(operation: FileOperation): SecurityRisk[] {
    const risks: SecurityRisk[] = [];

    // Check for suspicious paths
    for (const suspiciousPath of this.SUSPICIOUS_PATHS) {
      if (operation.path.startsWith(suspiciousPath)) {
        risks.push({
          type: 'SENSITIVE_PATH_ACCESS',
          severity: operation.type === 'write' || operation.type === 'delete' ? 'HIGH' : 'MEDIUM',
          description: `${operation.type} operation on sensitive system path: ${operation.path}`,
          mitigation: 'Verify file operation is authorized and necessary',
        });
      }
    }

    // Check for dangerous operations
    if (operation.type === 'delete' && operation.path === '/') {
      risks.push({
        type: 'ROOT_DELETE',
        severity: 'CRITICAL',
        description: 'Attempting to delete root directory',
        mitigation: 'Specify exact files to delete instead',
      });
    }

    // Check for permission changes
    if (operation.permissions === '777') {
      risks.push({
        type: 'PERMISSIVE_PERMISSIONS',
        severity: 'MEDIUM',
        description: 'Setting overly permissive file permissions',
        mitigation: 'Use more restrictive permissions like 755 or 644',
      });
    }

    // Check for path traversal
    if (operation.path.includes('..')) {
      risks.push({
        type: 'PATH_TRAVERSAL',
        severity: 'HIGH',
        description: 'Path traversal detected in file operation',
        mitigation: 'Use absolute paths or validate relative paths',
      });
    }

    return risks;
  }

  private assessOverallRisk(risks: SecurityRisk[]): RiskLevel {
    if (risks.some((risk) => risk.severity === 'CRITICAL')) {
      return 'CRITICAL';
    }

    if (risks.some((risk) => risk.severity === 'HIGH')) {
      return 'HIGH';
    }

    if (risks.some((risk) => risk.severity === 'MEDIUM')) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  private generateMitigations(risks: SecurityRisk[]): string[] {
    return risks
      .map((risk) => risk.mitigation)
      .filter((mitigation): mitigation is string => mitigation !== undefined);
  }
}

// File Operation Validator
export class FileOperationValidator {
  private readonly RESTRICTED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif'];
  private readonly SENSITIVE_FILENAMES = ['passwd', 'shadow', 'hosts', 'fstab', 'sudoers'];

  async validateFileAccess(
    path: string,
    operation: 'read' | 'write' | 'execute'
  ): Promise<ValidationResult> {
    const risks: SecurityRisk[] = [];

    // Check for restricted file extensions
    const extension = path.split('.').pop()?.toLowerCase();
    if (extension && this.RESTRICTED_EXTENSIONS.includes(`.${extension}`)) {
      risks.push({
        type: 'RESTRICTED_EXTENSION',
        severity: 'HIGH',
        description: `File has restricted extension: .${extension}`,
        mitigation: 'Verify file content and scan for malware',
      });
    }

    // Check for sensitive filenames
    const filename = path.split('/').pop()?.toLowerCase();
    if (filename && this.SENSITIVE_FILENAMES.includes(filename)) {
      risks.push({
        type: 'SENSITIVE_FILE',
        severity: operation === 'write' ? 'CRITICAL' : 'HIGH',
        description: `Access to sensitive system file: ${filename}`,
        mitigation: 'Ensure proper authorization and backup before modification',
      });
    }

    const riskLevel = this.assessRiskLevel(risks);

    return {
      allowed: riskLevel !== 'CRITICAL',
      riskLevel,
      risks,
      reason:
        riskLevel === 'CRITICAL'
          ? 'Access denied due to critical security risks'
          : 'File access evaluated',
      requiresConfirmation: riskLevel === 'HIGH',
    };
  }

  private assessRiskLevel(risks: SecurityRisk[]): RiskLevel {
    if (risks.some((risk) => risk.severity === 'CRITICAL')) return 'CRITICAL';
    if (risks.some((risk) => risk.severity === 'HIGH')) return 'HIGH';
    if (risks.some((risk) => risk.severity === 'MEDIUM')) return 'MEDIUM';
    return 'LOW';
  }
}

// Security Risk Assessment Utils
export class SecurityRiskAssessment {
  static calculateRiskScore(risks: SecurityRisk[]): number {
    const severityWeights = {
      LOW: 1,
      MEDIUM: 3,
      HIGH: 7,
      CRITICAL: 15,
    };

    return risks.reduce((score, risk) => {
      return score + severityWeights[risk.severity];
    }, 0);
  }

  static categorizeRisks(risks: SecurityRisk[]): {
    critical: SecurityRisk[];
    high: SecurityRisk[];
    medium: SecurityRisk[];
    low: SecurityRisk[];
  } {
    return {
      critical: risks.filter((r) => r.severity === 'CRITICAL'),
      high: risks.filter((r) => r.severity === 'HIGH'),
      medium: risks.filter((r) => r.severity === 'MEDIUM'),
      low: risks.filter((r) => r.severity === 'LOW'),
    };
  }

  static generateSecurityReport(risks: SecurityRisk[]): string {
    if (risks.length === 0) {
      return 'No security risks detected';
    }

    const categorized = SecurityRiskAssessment.categorizeRisks(risks);
    const score = SecurityRiskAssessment.calculateRiskScore(risks);

    let report = `Security Risk Assessment (Score: ${score})\n\n`;

    if (categorized.critical.length > 0) {
      report += `🚨 CRITICAL RISKS (${categorized.critical.length}):\n`;
      categorized.critical.forEach((risk) => {
        report += `  • ${risk.description}\n`;
        if (risk.mitigation) {
          report += `    ✓ Mitigation: ${risk.mitigation}\n`;
        }
      });
      report += '\n';
    }

    if (categorized.high.length > 0) {
      report += `⚠️  HIGH RISKS (${categorized.high.length}):\n`;
      categorized.high.forEach((risk) => {
        report += `  • ${risk.description}\n`;
        if (risk.mitigation) {
          report += `    ✓ Mitigation: ${risk.mitigation}\n`;
        }
      });
      report += '\n';
    }

    if (categorized.medium.length > 0) {
      report += `🔶 MEDIUM RISKS (${categorized.medium.length}):\n`;
      categorized.medium.forEach((risk) => {
        report += `  • ${risk.description}\n`;
      });
      report += '\n';
    }

    return report;
  }
}
