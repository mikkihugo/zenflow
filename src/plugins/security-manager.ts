/**
 * Security Manager Plugin
 * Comprehensive security system for plugin sandboxing, permission management, and threat detection
 */

import { Worker } from 'node:worker_threads';
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import * as path from 'node:path';
import { BasePlugin } from './base-plugin.js';

// Security interfaces
interface SecurityPolicy {
  allowedOperations: Set<string>;
  resourceLimits: {
    memory: number;
    cpu: number;
    network: boolean;
    filesystem: string[];
  };
  permissions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityViolation {
  id: string;
  pluginName: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: string;
  blocked: boolean;
}

interface PermissionAudit {
  id: string;
  pluginName: string;
  permission: string;
  approved: boolean;
  riskScore: number;
  timestamp: Date;
  reason: string;
}

interface ThreatSignature {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface SecurityValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  riskScore: number;
}

export class SecurityManagerPlugin extends BasePlugin {
  private securityPolicies = new Map<string, SecurityPolicy>();
  private violations: SecurityViolation[] = [];
  private permissionAudits: PermissionAudit[] = [];
  private sandboxWorkers = new Map<string, Worker>();
  private threatSignatures: ThreatSignature[] = [];
  private encryptionKeys = new Map<string, string>();
  private sessionTokens = new Map<string, { token: string; expires: Date }>();
  private cleanupIntervals: NodeJS.Timeout[] = [];

  constructor(manifest: any, config: any, context: any) {
    super(manifest, config, context);
    this.initializeThreatSignatures();
    this.setupCleanupTasks();
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Security Manager plugin initialized');
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Security Manager plugin started');
  }

  async onStop(): Promise<void> {
    // Terminate all sandboxed workers
    for (const [pluginName, worker] of Array.from(this.sandboxWorkers)) {
      await this.destroySandbox(pluginName);
    }
    
    // Clear cleanup intervals
    this.cleanupIntervals.forEach(interval => clearInterval(interval));
    this.cleanupIntervals = [];
    
    this.context.logger.info('Security Manager plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.securityPolicies.clear();
    this.violations = [];
    this.permissionAudits = [];
    this.encryptionKeys.clear();
    this.sessionTokens.clear();
  }

  // Main security validation method
  async validatePluginSecurity(plugin: any, manifest: any, config: any): Promise<SecurityValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    try {
      // 1. Validate manifest integrity
      const manifestValidation = this.validateManifestSecurity(manifest);
      errors.push(...manifestValidation.errors);
      warnings.push(...manifestValidation.warnings);
      riskScore += manifestValidation.riskScore;

      // 2. Scan for malicious patterns
      const threatScan = await this.scanForThreats(plugin, manifest);
      errors.push(...threatScan.errors);
      warnings.push(...threatScan.warnings);
      riskScore += threatScan.riskScore;

      // 3. Validate permissions
      if (config.permissions && config.permissions.length > 0) {
        const permissionValidation = await this.validatePermissions(manifest.name, config.permissions);
        errors.push(...permissionValidation.errors);
        warnings.push(...permissionValidation.warnings);
        riskScore += permissionValidation.riskScore;
      }

      // 4. Check resource limits
      const resourceValidation = this.validateResourceLimits(config);
      errors.push(...resourceValidation.errors);
      warnings.push(...resourceValidation.warnings);
      riskScore += resourceValidation.riskScore;

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskScore
      };
    } catch (error) {
      errors.push(`Security validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        errors,
        warnings,
        riskScore: 100
      };
    }
  }

  // Create secure sandbox for plugin
  async createSandbox(plugin: any, manifest: any, config: any): Promise<void> {
    const securityValidation = await this.validatePluginSecurity(plugin, manifest, config);
    
    if (!securityValidation.isValid) {
      throw new Error(`Security validation failed: ${securityValidation.errors.join(', ')}`);
    }

    // Create security policy
    const policy = this.createSecurityPolicy(manifest, config);
    this.securityPolicies.set(manifest.name, policy);

    // Create sandboxed worker
    const worker = await this.createSecureWorker(manifest, config, policy);
    this.sandboxWorkers.set(manifest.name, worker);

    // Set up security monitoring for the worker
    this.monitorWorkerSecurity(worker, manifest.name);

    this.emit('plugin-sandboxed', { pluginName: manifest.name, policy });
  }

  // Destroy sandbox
  async destroySandbox(pluginName: string): Promise<void> {
    const worker = this.sandboxWorkers.get(pluginName);
    if (worker) {
      try {
        await worker.terminate();
        this.sandboxWorkers.delete(pluginName);
        this.securityPolicies.delete(pluginName);
        this.emit('sandbox-destroyed', { pluginName });
      } catch (error) {
        this.recordSecurityViolation(
          pluginName,
          'sandbox-termination-error',
          'medium',
          `Failed to terminate sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  // Permission validation
  async validatePermissions(pluginName: string, requestedPermissions: string[]): Promise<SecurityValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
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
      errors.push(`Plugin risk score too high: ${riskScore}`);
    }

    // Record permission audit
    const audit: PermissionAudit = {
      id: randomUUID(),
      pluginName,
      permission: requestedPermissions.join(', '),
      approved: errors.length === 0,
      riskScore,
      timestamp: new Date(),
      reason: errors.length === 0 ? 'Permissions approved' : errors.join('; ')
    };
    
    this.permissionAudits.push(audit);
    this.emit('permission-audit', audit);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskScore
    };
  }

  // Validate single permission
  private validateSinglePermission(permission: string): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Define high-risk permissions
    const highRiskPermissions = [
      'system:execute',
      'filesystem:write',
      'network:external',
      'process:spawn'
    ];

    if (highRiskPermissions.includes(permission)) {
      warnings.push(`High-risk permission requested: ${permission}`);
    }

    // Check for invalid permission format
    if (!/^[a-z]+:[a-z]+$/.test(permission)) {
      errors.push(`Invalid permission format: ${permission}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskScore: this.calculatePermissionRisk(permission)
    };
  }

  // Calculate permission risk score
  private calculatePermissionRisk(permission: string): number {
    const riskMap: Record<string, number> = {
      // System permissions (highest risk)
      'system:execute': 30,
      'system:admin': 25,
      'system:config': 20,
      
      // Filesystem permissions
      'filesystem:write': 20,
      'filesystem:read': 10,
      'filesystem:delete': 25,
      
      // Network permissions
      'network:external': 15,
      'network:internal': 5,
      
      // Process permissions
      'process:spawn': 20,
      'process:kill': 25,
      
      // Memory permissions
      'memory:allocate': 10,
      'memory:access': 15
    };

    return riskMap[permission] || 5; // Default low risk for unknown permissions
  }

  // Validate manifest security
  private validateManifestSecurity(manifest: any): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // Check for suspicious fields
    if (manifest.name && (manifest.name.includes('..') || manifest.name.includes('/'))) {
      errors.push('Plugin name contains path traversal characters');
      riskScore += 20;
    }

    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      warnings.push('Plugin version format appears invalid');
      riskScore += 5;
    }

    // Check for suspicious scripts
    if (manifest.scripts) {
      for (const [scriptName, scriptCommand] of Object.entries(manifest.scripts)) {
        if (typeof scriptCommand === 'string' && this.containsSuspiciousCommands(scriptCommand)) {
          errors.push(`Script '${scriptName}' contains suspicious commands`);
          riskScore += 25;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskScore
    };
  }

  // Check for suspicious commands
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

  // Scan for threats
  private async scanForThreats(plugin: any, manifest: any): Promise<SecurityValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    try {
      // Convert plugin to searchable string
      const pluginSource = plugin.toString();
      
      for (const signature of this.threatSignatures) {
        if (signature.pattern.test(pluginSource)) {
          const message = `Threat detected: ${signature.name} - ${signature.description}`;
          
          if (signature.severity === 'critical' || signature.severity === 'high') {
            errors.push(message);
            riskScore += 30;
          } else {
            warnings.push(message);
            riskScore += 10;
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskScore
      };
    } catch (error) {
      errors.push(`Threat scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        errors,
        warnings,
        riskScore: 50
      };
    }
  }

  // Validate resource limits
  private validateResourceLimits(config: any): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    if (config.resourceLimits) {
      const limits = config.resourceLimits;

      // Memory limits
      if (limits.memory && limits.memory > 1024) { // > 1GB
        warnings.push(`High memory limit requested: ${limits.memory}MB`);
        riskScore += 10;
      }

      // CPU limits
      if (limits.cpu && limits.cpu > 80) { // > 80% CPU
        warnings.push(`High CPU limit requested: ${limits.cpu}%`);
        riskScore += 15;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskScore
    };
  }

  // Create secure worker
  private async createSecureWorker(manifest: any, config: any, policy: SecurityPolicy): Promise<Worker> {
    const workerData = {
      manifest,
      config,
      policy
    };

    const worker = new Worker(this.getWorkerScript(), {
      workerData,
      resourceLimits: {
        maxOldGenerationSizeMb: policy.resourceLimits.memory,
        maxYoungGenerationSizeMb: Math.floor(policy.resourceLimits.memory * 0.1),
        codeRangeSizeMb: 2
      }
    });

    // Set up timeout for worker initialization
    const timeout = setTimeout(() => {
      worker.terminate();
      this.recordSecurityViolation(
        manifest.name,
        'worker-timeout',
        'high',
        'Worker initialization timeout'
      );
    }, 30000); // 30 second timeout

    worker.once('online', () => {
      clearTimeout(timeout);
    });

    return worker;
  }

  // Get worker script path
  private getWorkerScript(): string {
    // Return the path to the secure worker script
    return path.join(__dirname, 'secure-worker.js');
  }

  // Monitor worker security
  private monitorWorkerSecurity(worker: Worker, pluginName: string): void {
    worker.on('message', (message: any) => {
      if (message.type === 'security-violation') {
        this.recordSecurityViolation(pluginName, message.violation, message.severity, message.details);
      }
    });

    worker.on('error', (error: Error) => {
      this.recordSecurityViolation(
        pluginName,
        'worker-error',
        'high',
        error.message
      );
    });

    worker.on('exit', (code: number) => {
      if (code !== 0) {
        this.recordSecurityViolation(
          pluginName,
          'worker-abnormal-exit',
          'medium',
          `Worker exited with code ${code}`
        );
      }
    });
  }

  // Create security policy
  private createSecurityPolicy(manifest: any, config: any): SecurityPolicy {
    const permissions = config.permissions || [];
    const allowedOperations = new Set<string>();

    // Map permissions to allowed operations
    const operationMap: Record<string, string[]> = {
      'filesystem:read': ['fs.readFile', 'fs.readdir', 'fs.stat'],
      'filesystem:write': ['fs.writeFile', 'fs.mkdir', 'fs.chmod'],
      'network:internal': ['http.request.internal'],
      'network:external': ['http.request', 'https.request'],
      'process:spawn': ['child_process.spawn', 'child_process.exec']
    };

    for (const permission of permissions) {
      const ops = operationMap[permission];
      if (ops) {
        ops.forEach(op => allowedOperations.add(op));
      }
    }

    return {
      allowedOperations,
      resourceLimits: {
        memory: config.resourceLimits?.memory || 256,
        cpu: config.resourceLimits?.cpu || 50,
        network: permissions.includes('network:external') || permissions.includes('network:internal'),
        filesystem: config.resourceLimits?.filesystem || ['/tmp']
      },
      permissions,
      riskLevel: this.calculateRiskLevel(permissions)
    };
  }

  // Calculate risk level
  private calculateRiskLevel(permissions: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const totalRisk = permissions.reduce((sum, permission) => sum + this.calculatePermissionRisk(permission), 0);
    
    if (totalRisk >= 75) return 'critical';
    if (totalRisk >= 50) return 'high';
    if (totalRisk >= 25) return 'medium';
    return 'low';
  }

  // Initialize threat signatures
  private initializeThreatSignatures(): void {
    this.threatSignatures = [
      {
        id: 'malicious-eval',
        name: 'Malicious eval',
        pattern: /eval\s*\(.*\)/,
        severity: 'high',
        description: 'Dynamic code execution detected'
      },
      {
        id: 'shell-injection',
        name: 'Shell injection',
        pattern: /\$\(.*\)|`.*`/,
        severity: 'critical',
        description: 'Shell command injection detected'
      },
      {
        id: 'file-system-traversal',
        name: 'Path traversal',
        pattern: /\.\.\//,
        severity: 'high',
        description: 'Path traversal attempt detected'
      },
      {
        id: 'network-request',
        name: 'Network request',
        pattern: /fetch\(|XMLHttpRequest|require\(['"]http/,
        severity: 'medium',
        description: 'Network request detected'
      }
    ];
  }

  // Record security violation
  private recordSecurityViolation(
    pluginName: string,
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: string
  ): void {
    const violationRecord: SecurityViolation = {
      id: randomUUID(),
      pluginName,
      type,
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

  // Quarantine plugin
  private async quarantinePlugin(pluginName: string, violation: SecurityViolation): Promise<void> {
    try {
      const worker = this.sandboxWorkers.get(pluginName);
      if (worker) {
        await worker.terminate();
        this.sandboxWorkers.delete(pluginName);
      }

      this.emit('plugin-quarantined', { pluginName, violation });
    } catch (error) {
      this.context.logger.error(`Failed to quarantine plugin ${pluginName}:`, error);
    }
  }

  // Setup cleanup tasks
  private setupCleanupTasks(): void {
    // Clean up old violations (keep last 1000)
    const violationCleanup = setInterval(() => {
      if (this.violations.length > 1000) {
        this.violations = this.violations.slice(-1000);
      }
    }, 300000); // Every 5 minutes

    // Clean up old audits (keep last 500)
    const auditCleanup = setInterval(() => {
      if (this.permissionAudits.length > 500) {
        this.permissionAudits = this.permissionAudits.slice(-500);
      }
    }, 300000); // Every 5 minutes

    // Monitor worker health
    const healthMonitor = setInterval(() => {
      for (const [pluginName, worker] of Array.from(this.sandboxWorkers)) {
        if (worker.threadId === -1) { // Worker has terminated
          this.recordSecurityViolation(
            pluginName,
            'worker-unexpected-termination',
            'medium',
            `Worker ${worker.threadId} terminated unexpectedly`
          );
          this.sandboxWorkers.delete(pluginName);
        }
      }
    }, 60000); // Every minute

    this.cleanupIntervals.push(violationCleanup, auditCleanup, healthMonitor);
  }

  // Get plugin security status
  getPluginSecurityStatus(pluginName: string): any {
    const policy = this.securityPolicies.get(pluginName);
    const violations = this.violations.filter(v => v.pluginName === pluginName);
    const audits = this.permissionAudits.filter(a => a.pluginName === pluginName);
    const quarantined = violations.some(v => v.blocked && v.severity === 'critical');

    return {
      policy,
      violations,
      audits,
      quarantined,
      hasSandbox: this.sandboxWorkers.has(pluginName)
    };
  }

  // Get security analytics
  getSecurityAnalytics(): any {
    const totalAudits = this.permissionAudits.length;
    const approvedAudits = this.permissionAudits.filter(a => a.approved).length;
    const deniedAudits = this.permissionAudits.filter(a => !a.approved).length;
    const averageRiskScore = this.permissionAudits.reduce((sum, a) => sum + a.riskScore, 0) / this.permissionAudits.length || 0;
    
    const highRiskPlugins = this.permissionAudits
      .filter(audit => audit.riskScore > 75)
      .map(audit => audit.pluginName);
    
    const deniedPermissions = this.permissionAudits
      .filter(audit => !audit.approved)
      .flatMap(audit => audit.permission.split(', '))
      .reduce((acc, permission) => {
        acc[permission] = (acc[permission] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topDeniedPermissions = Object.entries(deniedPermissions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([permission, count]) => ({ permission, count }));

    return {
      totalAudits,
      approvedAudits,
      deniedAudits,
      averageRiskScore,
      highRiskPlugins,
      topDeniedPermissions,
      totalViolations: this.violations.length,
      activeSandboxes: this.sandboxWorkers.size
    };
  }

  // Clear security data
  clearSecurityData(): void {
    this.violations.length = 0;
    this.permissionAudits.length = 0;
  }
}

export default SecurityManagerPlugin;