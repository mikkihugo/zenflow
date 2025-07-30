/**
 * Plugin Security Manager
 * Comprehensive security system for plugin sandboxing, permission management, and threat detection
 */

import { EventEmitter } from 'events';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { createHash, randomUUID, createHmac } from 'crypto';
import { performance } from 'perf_hooks';
import {
  Plugin,
  PluginManifest,
  PluginConfig,
  PluginContext,
  PluginPermission,
  ValidationResult,
  PermissionAuditReport,
  ResourceUsage,
  JSONObject
} from '../types/plugin.js';

interface SecurityPolicy {
  allowedOperations: string[];
  deniedOperations: string[];
  maxExecutionTime: number;
  maxMemoryUsage: number;
  maxNetworkRequests: number;
  allowedDomains: string[];
  deniedDomains: string[];
  requiresAuthentication: boolean;
  encryptionRequired: boolean;
  auditLevel: 'none' | 'basic' | 'detailed' | 'full';
}

interface SecurityViolation {
  id: string;
  pluginName: string;
  violation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: JSONObject;
  blocked: boolean;
}

interface SandboxConfig {
  isolateMemory: boolean;
  isolateCpu: boolean;
  isolateNetwork: boolean;
  isolateFilesystem: boolean;
  allowedPaths: string[];
  deniedPaths: string[];
  maxWorkers: number;
  workerTimeout: number;
  enableSecurity: boolean;
}

interface PermissionAudit {
  pluginName: string;
  requestedPermissions: PluginPermission[];
  grantedPermissions: PluginPermission[];
  deniedPermissions: PluginPermission[];
  riskScore: number;
  timestamp: Date;
  approved: boolean;
  approver?: string;
}

interface ThreatSignature {
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: 'log' | 'warn' | 'block' | 'quarantine';
}

export class SecurityManager extends EventEmitter {
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private violations: SecurityViolation[] = [];
  private permissionAudits: PermissionAudit[] = [];
  private sandboxWorkers: Map<string, Worker> = new Map();
  private threatSignatures: ThreatSignature[] = [];
  private encryptionKeys: Map<string, Buffer> = new Map();
  private sessionTokens: Map<string, { token: string; expires: Date; pluginName: string }> = new Map();

  private readonly config: SandboxConfig;

  constructor(config: Partial<SandboxConfig> = {}) {
    super();

    this.config = {
      isolateMemory: true,
      isolateCpu: true,
      isolateNetwork: false, // Allow network but monitor
      isolateFilesystem: true,
      allowedPaths: ['./temp', './data', './logs'],
      deniedPaths: ['./src', './node_modules', '/etc', '/usr', '/bin'],
      maxWorkers: 10,
      workerTimeout: 30000,
      enableSecurity: true,
      ...config
    };

    this.initializeThreatSignatures();
    this.startSecurityMonitoring();
  }

  // Plugin sandboxing methods
  async createSandboxedPlugin(
    plugin: Plugin,
    manifest: PluginManifest,
    config: PluginConfig
  ): Promise<Worker | null> {
    if (!this.config.enableSecurity) {
      return null;
    }

    try {
      // Validate plugin security before sandboxing
      const securityValidation = await this.validatePluginSecurity(plugin, manifest, config);
      if (!securityValidation.isValid) {
        throw new Error(`Security validation failed: ${securityValidation.errors.join(', ')}`);
      }

      // Create security policy for plugin
      const policy = this.createSecurityPolicy(manifest, config);
      this.securityPolicies.set(manifest.name, policy);

      // Create sandboxed worker
      const worker = await this.createSecureWorker(manifest, config, policy);
      this.sandboxWorkers.set(manifest.name, worker);

      // Set up security monitoring for the worker
      this.monitorWorkerSecurity(worker, manifest.name);

      this.emit('plugin-sandboxed', {
        pluginName: manifest.name,
        workerId: worker.threadId,
        policy
      });

      return worker;

    } catch (error: any) {
      this.recordSecurityViolation(manifest.name, 'sandbox-creation-failed', 'high', {
        error: error.message,
        manifest: manifest.name
      });
      throw error;
    }
  }

  async destroySandbox(pluginName: string): Promise<void> {
    const worker = this.sandboxWorkers.get(pluginName);
    if (worker) {
      try {
        await worker.terminate();
        this.sandboxWorkers.delete(pluginName);
        this.securityPolicies.delete(pluginName);
        
        this.emit('sandbox-destroyed', { pluginName });
      } catch (error: any) {
        this.recordSecurityViolation(pluginName, 'sandbox-destruction-failed', 'medium', {
          error: error.message
        });
      }
    }
  }

  // Permission management
  async validatePermissions(
    pluginName: string,
    requestedPermissions: PluginPermission[]
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    let riskScore = 0;

    for (const permission of requestedPermissions) {
      const validation = this.validateSinglePermission(permission);
      if (!validation.isValid) {
        errors.push(`Permission ${permission}: ${validation.errors.join(', ')}`);
      }
      riskScore += this.calculatePermissionRisk(permission);
    }

    // Check if risk score exceeds threshold
    if (riskScore > 75) {
      errors.push(`Plugin risk score too high: ${riskScore}/100`);
    }

    const audit: PermissionAudit = {
      pluginName,
      requestedPermissions,
      grantedPermissions: errors.length === 0 ? requestedPermissions : [],
      deniedPermissions: errors.length > 0 ? requestedPermissions : [],
      riskScore,
      timestamp: new Date(),
      approved: errors.length === 0
    };

    this.permissionAudits.push(audit);
    this.emit('permission-audit', audit);

    return {
      isValid: errors.length === 0,
      errors,
      warnings: riskScore > 50 ? [`High risk score: ${riskScore}`] : [],
      metadata: { riskScore, audit }
    };
  }

  private validateSinglePermission(permission: PluginPermission): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Define high-risk permissions
    const highRiskPermissions: PluginPermission[] = [
      'system:execute',
      'system:admin',
      'filesystem:write-system',
      'network:unrestricted'
    ];

    const moderateRiskPermissions: PluginPermission[] = [
      'filesystem:write',
      'database:write',
      'network:external'
    ];

    // Check for completely forbidden permissions
    const forbiddenPermissions: PluginPermission[] = [
      'system:root',
      'system:kernel'
    ];

    if (forbiddenPermissions.includes(permission)) {
      errors.push(`Permission ${permission} is forbidden`);
    }

    if (highRiskPermissions.includes(permission)) {
      warnings.push(`Permission ${permission} is high-risk and requires manual approval`);
    }

    if (moderateRiskPermissions.includes(permission)) {
      warnings.push(`Permission ${permission} requires security review`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private calculatePermissionRisk(permission: PluginPermission): number {
    const riskScores: Record<string, number> = {
      // System permissions (highest risk)
      'system:execute': 25,
      'system:admin': 30,
      'system:root': 50, // Should be forbidden
      'system:kernel': 50, // Should be forbidden

      // Filesystem permissions
      'filesystem:read': 5,
      'filesystem:write': 15,
      'filesystem:write-system': 25,

      // Database permissions
      'database:read': 5,
      'database:write': 10,
      'database:admin': 20,

      // Network permissions
      'network:local': 5,
      'network:external': 10,
      'network:unrestricted': 20,

      // Memory permissions
      'memory:read': 3,
      'memory:write': 8,

      // Process permissions
      'process:spawn': 15,
      'process:kill': 20,

      // Default for unknown permissions
      'default': 5
    };

    return riskScores[permission] || riskScores['default'];
  }

  // Security validation
  async validatePluginSecurity(
    plugin: Plugin,
    manifest: PluginManifest,
    config: PluginConfig
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Validate manifest integrity
      const manifestValidation = this.validateManifestSecurity(manifest);
      errors.push(...manifestValidation.errors);
      warnings.push(...manifestValidation.warnings);

      // 2. Scan for malicious patterns
      const threatScan = await this.scanForThreats(plugin, manifest);
      errors.push(...threatScan.errors);
      warnings.push(...threatScan.warnings);

      // 3. Validate permissions
      if (config.permissions && config.permissions.length > 0) {
        const permissionValidation = await this.validatePermissions(manifest.name, config.permissions);
        errors.push(...permissionValidation.errors);
        warnings.push(...permissionValidation.warnings);
      }

      // 4. Check resource limits
      const resourceValidation = this.validateResourceLimits(config);
      errors.push(...resourceValidation.errors);
      warnings.push(...resourceValidation.warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          securityScore: Math.max(0, 100 - (errors.length * 20 + warnings.length * 5)),
          scanTimestamp: new Date()
        }
      };

    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Security validation failed: ${error.message}`],
        warnings: []
      };
    }
  }

  private validateManifestSecurity(manifest: PluginManifest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for suspicious fields
    if (manifest.name.includes('..') || manifest.name.includes('/')) {
      errors.push('Plugin name contains path traversal characters');
    }

    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      warnings.push('Plugin version format appears invalid');
    }

    // Check for suspicious scripts
    if (manifest.scripts) {
      for (const [scriptName, scriptCommand] of Object.entries(manifest.scripts)) {
        if (typeof scriptCommand === 'string' && this.containsSuspiciousCommands(scriptCommand)) {
          errors.push(`Script '${scriptName}' contains suspicious commands`);
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  private containsSuspiciousCommands(command: string): boolean {
    const suspiciousPatterns = [
      /rm\s+-rf/,
      /curl.*\|\s*sh/,
      /wget.*\|\s*sh/,
      /eval\s*\(/,
      /exec\s*\(/,
      /system\s*\(/,
      /\$\([^)]*\)/,
      /`[^`]*`/
    ];

    return suspiciousPatterns.some(pattern => pattern.test(command));
  }

  private async scanForThreats(plugin: Plugin, manifest: PluginManifest): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Convert plugin to searchable string
      const pluginSource = plugin.toString();

      for (const signature of this.threatSignatures) {
        if (signature.pattern.test(pluginSource)) {
          const message = `Threat detected: ${signature.name} - ${signature.description}`;
          
          switch (signature.severity) {
            case 'critical':
            case 'high':
              errors.push(message);
              break;
            case 'medium':
            case 'low':
              warnings.push(message);
              break;
          }

          this.recordSecurityViolation(
            manifest.name,
            'threat-signature-detected',
            signature.severity,
            {
              signatureName: signature.name,
              description: signature.description
            }
          );
        }
      }

      return { isValid: errors.length === 0, errors, warnings };

    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Threat scanning failed: ${error.message}`],
        warnings: []
      };
    }
  }

  private validateResourceLimits(config: PluginConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.resourceLimits) {
      const limits = config.resourceLimits;

      // Memory limits
      if (limits.memory && limits.memory > 1024) { // > 1GB
        warnings.push(`High memory limit requested: ${limits.memory}MB`);
      }
      if (limits.memory && limits.memory > 2048) { // > 2GB
        errors.push(`Memory limit too high: ${limits.memory}MB (max: 2048MB)`);
      }

      // CPU limits
      if (limits.cpu && limits.cpu > 80) { // > 80%
        warnings.push(`High CPU limit requested: ${limits.cpu}%`);
      }
      if (limits.cpu && limits.cpu > 95) { // > 95%
        errors.push(`CPU limit too high: ${limits.cpu}% (max: 95%)`);
      }

      // Network limits
      if (limits.network && limits.network.requestsPerMinute > 1000) {
        warnings.push(`High network request rate: ${limits.network.requestsPerMinute}/min`);
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Worker creation and management
  private async createSecureWorker(
    manifest: PluginManifest,
    config: PluginConfig,
    policy: SecurityPolicy
  ): Promise<Worker> {
    const workerData = {
      manifest,
      config,
      policy,
      allowedPaths: this.config.allowedPaths,
      deniedPaths: this.config.deniedPaths
    };

    const worker = new Worker(this.getWorkerScript(), {
      workerData,
      resourceLimits: {
        maxOldGenerationSizeMb: config.resourceLimits?.memory || 512,
        maxYoungGenerationSizeMb: Math.floor((config.resourceLimits?.memory || 512) / 4)
      }
    });

    // Set worker timeout
    const timeout = setTimeout(() => {
      worker.terminate();
      this.recordSecurityViolation(
        manifest.name,
        'worker-timeout',
        'high',
        { timeout: this.config.workerTimeout }
      );
    }, this.config.workerTimeout);

    worker.once('exit', () => {
      clearTimeout(timeout);
    });

    return worker;
  }

  private getWorkerScript(): string {
    // Return the path to the secure worker script
    return require.resolve('./secure-worker.js');
  }

  private monitorWorkerSecurity(worker: Worker, pluginName: string): void {
    worker.on('message', (message) => {
      // Monitor worker messages for security violations
      if (message.type === 'security-violation') {
        this.recordSecurityViolation(
          pluginName,
          message.violation,
          message.severity,
          message.details
        );
      }
    });

    worker.on('error', (error) => {
      this.recordSecurityViolation(
        pluginName,
        'worker-error',
        'high',
        { error: error.message }
      );
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        this.recordSecurityViolation(
          pluginName,
          'worker-abnormal-exit',
          'medium',
          { exitCode: code }
        );
      }
    });
  }

  // Security policy management
  private createSecurityPolicy(manifest: PluginManifest, config: PluginConfig): SecurityPolicy {
    return {
      allowedOperations: this.getAllowedOperations(config.permissions || []),
      deniedOperations: ['system:execute', 'filesystem:write-system'],
      maxExecutionTime: config.resourceLimits?.executionTime || 30000,
      maxMemoryUsage: config.resourceLimits?.memory || 512,
      maxNetworkRequests: config.resourceLimits?.network?.requestsPerMinute || 100,
      allowedDomains: config.network?.allowedDomains || [],
      deniedDomains: config.network?.deniedDomains || ['localhost', '127.0.0.1'],
      requiresAuthentication: config.requiresAuth || false,
      encryptionRequired: config.encryption?.required || false,
      auditLevel: config.auditLevel || 'basic'
    };
  }

  private getAllowedOperations(permissions: PluginPermission[]): string[] {
    const operationMap: Record<PluginPermission, string[]> = {
      'filesystem:read': ['fs:read'],
      'filesystem:write': ['fs:write'],
      'filesystem:write-system': ['fs:write:system'],
      'database:read': ['db:read'],
      'database:write': ['db:write'],
      'database:admin': ['db:admin'],
      'network:local': ['net:local'],
      'network:external': ['net:external'],
      'network:unrestricted': ['net:unrestricted'],
      'memory:read': ['mem:read'],
      'memory:write': ['mem:write'],
      'process:spawn': ['proc:spawn'],
      'process:kill': ['proc:kill'],
      'system:execute': ['sys:exec'],
      'system:admin': ['sys:admin'],
      'system:root': ['sys:root'],
      'system:kernel': ['sys:kernel']
    };

    const operations: string[] = [];
    for (const permission of permissions) {
      const ops = operationMap[permission];
      if (ops) {
        operations.push(...ops);
      }
    }

    return operations;
  }

  // Threat detection
  private initializeThreatSignatures(): void {
    this.threatSignatures = [
      {
        name: 'eval-usage',
        pattern: /eval\s*\(/g,
        severity: 'high',
        description: 'Dynamic code execution detected',
        action: 'block'
      },
      {
        name: 'shell-injection',
        pattern: /require\s*\(\s*['"]child_process['"]\s*\)/g,
        severity: 'critical',
        description: 'Shell command execution capability detected',
        action: 'block'
      },
      {
        name: 'file-system-access',
        pattern: /require\s*\(\s*['"]fs['"]\s*\)/g,
        severity: 'medium',
        description: 'File system access detected',
        action: 'warn'
      },
      {
        name: 'network-access',
        pattern: /require\s*\(\s*['"]http['"]\s*\)|require\s*\(\s*['"]https['"]\s*\)/g,
        severity: 'medium',
        description: 'Network access capability detected',
        action: 'warn'
      },
      {
        name: 'process-manipulation',
        pattern: /process\.(exit|kill|abort)/g,
        severity: 'high',
        description: 'Process manipulation detected',
        action: 'block'
      },
      {
        name: 'prototype-pollution',
        pattern: /__proto__|constructor\.prototype/g,
        severity: 'high',
        description: 'Potential prototype pollution attack',
        action: 'block'
      }
    ];
  }

  // Security violation tracking
  private recordSecurityViolation(
    pluginName: string,
    violation: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: JSONObject
  ): void {
    const violationRecord: SecurityViolation = {
      id: randomUUID(),
      pluginName,
      violation,
      severity,
      timestamp: new Date(),
      details,
      blocked: severity === 'critical' || severity === 'high'
    };

    this.violations.push(violationRecord);
    this.emit('security-violation', violationRecord);

    // Take action based on severity
    if (violationRecord.blocked) {
      this.quarantinePlugin(pluginName, violationRecord);
    }
  }

  private async quarantinePlugin(pluginName: string, violation: SecurityViolation): Promise<void> {
    try {
      // Stop the plugin's worker if it exists
      const worker = this.sandboxWorkers.get(pluginName);
      if (worker) {
        await worker.terminate();
        this.sandboxWorkers.delete(pluginName);
      }

      this.emit('plugin-quarantined', { pluginName, violation });
    } catch (error: any) {
      this.emit('quarantine-failed', { pluginName, error: error.message });
    }
  }

  // Security monitoring
  private startSecurityMonitoring(): void {
    // Clean up old violations (keep last 1000)
    setInterval(() => {
      if (this.violations.length > 1000) {
        this.violations = this.violations.slice(-1000);
      }
    }, 300000); // Every 5 minutes

    // Clean up old audits (keep last 500)
    setInterval(() => {
      if (this.permissionAudits.length > 500) {
        this.permissionAudits = this.permissionAudits.slice(-500);
      }
    }, 300000); // Every 5 minutes

    // Monitor worker health
    setInterval(() => {
      for (const [pluginName, worker] of this.sandboxWorkers) {
        if (worker.threadId === -1) { // Worker has terminated
          this.recordSecurityViolation(
            pluginName,
            'worker-unexpected-termination',
            'medium',
            { threadId: worker.threadId }
          );
          this.sandboxWorkers.delete(pluginName);
        }
      }
    }, 30000); // Every 30 seconds
  }

  // Public API methods
  getSecurityReport(): {
    violations: SecurityViolation[];
    audits: PermissionAudit[];
    policies: Record<string, SecurityPolicy>;
    activeWorkers: number;
    threatSignatures: number;
  } {
    return {
      violations: this.violations.slice(-100), // Last 100 violations
      audits: this.permissionAudits.slice(-50), // Last 50 audits
      policies: Object.fromEntries(this.securityPolicies),
      activeWorkers: this.sandboxWorkers.size,
      threatSignatures: this.threatSignatures.length
    };
  }

  getPluginSecurityStatus(pluginName: string): {
    policy?: SecurityPolicy;
    violations: SecurityViolation[];
    audits: PermissionAudit[];
    sandboxed: boolean;
    quarantined: boolean;
  } {
    const violations = this.violations.filter(v => v.pluginName === pluginName);
    const audits = this.permissionAudits.filter(a => a.pluginName === pluginName);
    const quarantined = violations.some(v => v.blocked && v.severity === 'critical');

    return {
      policy: this.securityPolicies.get(pluginName),
      violations,
      audits,
      sandboxed: this.sandboxWorkers.has(pluginName),
      quarantined
    };
  }

  async generatePermissionAuditReport(): Promise<PermissionAuditReport> {
    const highRiskPlugins = this.permissionAudits
      .filter(audit => audit.riskScore > 75)
      .map(audit => audit.pluginName);

    const deniedPermissions = this.permissionAudits
      .flatMap(audit => audit.deniedPermissions)
      .reduce((acc, permission) => {
        acc[permission] = (acc[permission] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalAudits: this.permissionAudits.length,
      approvedAudits: this.permissionAudits.filter(a => a.approved).length,
      deniedAudits: this.permissionAudits.filter(a => !a.approved).length,
      averageRiskScore: this.permissionAudits.reduce((sum, a) => sum + a.riskScore, 0) / this.permissionAudits.length || 0,
      highRiskPlugins: Array.from(new Set(highRiskPlugins)),
      mostDeniedPermissions: Object.entries(deniedPermissions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([permission, count]) => ({ permission: permission as PluginPermission, count })),
      reportGeneratedAt: new Date()
    };
  }

  async cleanup(): Promise<void> {
    // Terminate all workers
    for (const [pluginName, worker] of this.sandboxWorkers) {
      try {
        await worker.terminate();
      } catch (error) {
        // Worker already terminated
      }
    }

    this.sandboxWorkers.clear();
    this.securityPolicies.clear();
    this.violations.length = 0;
    this.permissionAudits.length = 0;
  }
}

export default SecurityManager;