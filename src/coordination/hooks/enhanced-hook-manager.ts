/**
 * Enhanced Hook Manager
 * Central coordinator for the enhanced hooks system with safety validation,
 * auto-assignment, performance tracking, and context loading
 */

import { IntelligentAgentAssignor } from './auto-agent-assignment';
import {
  type EnhancedHook,
  type EnhancedHookManager,
  EnvironmentInfo,
  type HookContext,
  type HookError,
  type HookResult,
  type HookTrigger,
  type HookType,
  Operation,
  type OperationMetrics,
  type ResourceUsage,
  SessionInfo,
  ToolInfo,
  type Warning,
} from './enhanced-hook-system';
import { HookPerformanceTracker, OperationPerformanceOptimizer } from './performance-tracker';
import { BashSafetyValidator, FileOperationValidator } from './safety-validator';

export class DefaultEnhancedHookManager implements EnhancedHookManager {
  private readonly hooks: Map<string, EnhancedHook>;
  private readonly hooksByTrigger: Map<HookTrigger, EnhancedHook[]>;
  private readonly safetyValidator: BashSafetyValidator;
  private readonly fileValidator: FileOperationValidator;
  private readonly agentAssignor: IntelligentAgentAssignor;
  private readonly performanceTracker: HookPerformanceTracker;
  private readonly performanceOptimizer: OperationPerformanceOptimizer;
  private readonly contextLoader: ContextLoader;

  constructor() {
    this.hooks = new Map();
    this.hooksByTrigger = new Map();
    this.safetyValidator = new BashSafetyValidator();
    this.fileValidator = new FileOperationValidator();
    this.agentAssignor = new IntelligentAgentAssignor();
    this.performanceTracker = new HookPerformanceTracker();
    this.performanceOptimizer = new OperationPerformanceOptimizer();
    this.contextLoader = new ContextLoader();

    this.initializeDefaultHooks();
  }

  async registerHook(hook: EnhancedHook): Promise<void> {
    this.hooks.set(hook.id, hook);

    // Add to trigger index
    if (!this.hooksByTrigger.has(hook.trigger)) {
      this.hooksByTrigger.set(hook.trigger, []);
    }
    this.hooksByTrigger.get(hook.trigger)!.push(hook);

    // Sort by priority
    this.hooksByTrigger.get(hook.trigger)!.sort((a, b) => b.priority - a.priority);

    console.log(`Registered enhanced hook: ${hook.id} (${hook.type}) for trigger ${hook.trigger}`);
  }

  async unregisterHook(hookId: string): Promise<void> {
    const hook = this.hooks.get(hookId);
    if (!hook) return;

    this.hooks.delete(hookId);

    // Remove from trigger index
    const triggerHooks = this.hooksByTrigger.get(hook.trigger);
    if (triggerHooks) {
      const index = triggerHooks.findIndex((h) => h.id === hookId);
      if (index !== -1) {
        triggerHooks.splice(index, 1);
      }
    }

    console.log(`Unregistered enhanced hook: ${hookId}`);
  }

  async executeHooks(trigger: HookTrigger, context: HookContext): Promise<HookResult[]> {
    const startTime = Date.now();
    const triggerHooks = this.hooksByTrigger.get(trigger) || [];
    const enabledHooks = triggerHooks.filter((hook) => hook.enabled);

    if (enabledHooks.length === 0) {
      return [];
    }

    console.log(`Executing ${enabledHooks.length} enhanced hooks for trigger: ${trigger}`);

    const results: HookResult[] = [];

    for (const hook of enabledHooks) {
      try {
        // Check if hook matches the context
        if (hook.matcher && !this.matchesContext(hook.matcher, context)) {
          continue;
        }

        const hookStartTime = Date.now();
        const result = await this.executeHookWithTimeout(hook, context, 30000); // 30s timeout
        const hookDuration = Date.now() - hookStartTime;

        // Track hook performance
        await this.trackHookPerformance(hook, context, result, hookDuration);

        results.push(result);

        // If a hook blocks the operation, stop execution
        if (!result.allowed) {
          console.warn(
            `Hook ${hook.id} blocked operation: ${result.errors.map((e) => e.message).join(', ')}`
          );
          break;
        }
      } catch (error) {
        console.error(`Error executing hook ${hook.id}:`, error);
        results.push({
          success: false,
          allowed: true, // Don't block on hook errors
          modified: false,
          warnings: [],
          errors: [
            {
              type: 'HOOK_EXECUTION_ERROR',
              message: `Hook execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              context: { hookId: hook.id },
            },
          ],
          suggestions: [],
          metrics: this.createEmptyMetrics(),
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`Enhanced hooks execution completed in ${totalDuration}ms`);

    return results;
  }

  async getHooks(trigger?: HookTrigger): Promise<EnhancedHook[]> {
    if (trigger) {
      return this.hooksByTrigger.get(trigger) || [];
    }
    return Array.from(this.hooks.values());
  }

  async enableHook(hookId: string): Promise<void> {
    const hook = this.hooks.get(hookId);
    if (hook) {
      (hook as any).enabled = true;
      console.log(`Enabled hook: ${hookId}`);
    }
  }

  async disableHook(hookId: string): Promise<void> {
    const hook = this.hooks.get(hookId);
    if (hook) {
      (hook as any).enabled = false;
      console.log(`Disabled hook: ${hookId}`);
    }
  }

  private async executeHookWithTimeout(
    hook: EnhancedHook,
    context: HookContext,
    timeout: number
  ): Promise<HookResult> {
    return Promise.race([
      hook.execute(context),
      new Promise<HookResult>((_, reject) =>
        setTimeout(() => reject(new Error(`Hook ${hook.id} timed out after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  private matchesContext(matcher: string | RegExp, context: HookContext): boolean {
    if (typeof matcher === 'string') {
      return (
        context.tool.name.includes(matcher) ||
        context.operation.type.includes(matcher) ||
        context.operation.description.includes(matcher)
      );
    } else {
      return (
        matcher.test(context.tool.name) ||
        matcher.test(context.operation.type) ||
        matcher.test(context.operation.description)
      );
    }
  }

  private async trackHookPerformance(
    hook: EnhancedHook,
    context: HookContext,
    result: HookResult,
    duration: number
  ): Promise<void> {
    const operationResult = {
      success: result.success,
      startTime: new Date(context.timestamp.getTime()),
      endTime: new Date(context.timestamp.getTime() + duration),
      resourceUsage: result.metrics.resourceUsage,
      output: result.data,
    };

    await this.performanceTracker.trackOperation(context.operation, operationResult);
  }

  private createEmptyMetrics(): OperationMetrics {
    return {
      operationId: '',
      type: '',
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      success: false,
      resourceUsage: {
        memoryMB: 0,
        cpuPercent: 0,
        diskIO: 0,
        networkIO: 0,
        peakMemory: 0,
      },
    };
  }

  private async initializeDefaultHooks(): Promise<void> {
    // Safety Validation Hook
    await this.registerHook(new SafetyValidationHook(this.safetyValidator, this.fileValidator));

    // Auto-Agent Assignment Hook
    await this.registerHook(new AutoAgentAssignmentHook(this.agentAssignor));

    // Performance Tracking Hook
    await this.registerHook(new PerformanceTrackingHook(this.performanceTracker));

    // Context Loading Hook
    await this.registerHook(new ContextLoadingHook(this.contextLoader));

    // Auto-Formatting Hook
    await this.registerHook(new AutoFormattingHook());

    console.log('Default enhanced hooks initialized');
  }
}

// Safety Validation Hook Implementation
class SafetyValidationHook implements EnhancedHook {
  readonly id = 'safety-validation';
  readonly type: HookType = 'validation';
  readonly trigger: HookTrigger = 'PreToolUse';
  readonly matcher = /Bash|Command|Shell|Execute/i;
  readonly enabled = true;
  readonly priority = 100; // Highest priority

  constructor(
    private readonly safetyValidator: BashSafetyValidator,
    private readonly fileValidator: FileOperationValidator
  ) {}

  async execute(context: HookContext): Promise<HookResult> {
    const warnings: Warning[] = [];
    const errors: HookError[] = [];

    // Validate bash commands
    if (context.operation.command) {
      const validation = await this.safetyValidator.validateCommand(context.operation.command);

      if (!validation.allowed) {
        errors.push({
          type: 'COMMAND_BLOCKED',
          message: validation.reason || 'Command blocked by safety validation',
          context: { command: context.operation.command, risks: validation.risks },
        });
      } else if (validation.requiresConfirmation) {
        warnings.push({
          type: 'CONFIRMATION_REQUIRED',
          message: validation.reason || 'Command requires confirmation',
          severity: 'warning',
          code: 'SAFETY_CONFIRMATION',
        });
      }

      if (validation.risks.length > 0) {
        validation.risks.forEach((risk) => {
          warnings.push({
            type: 'SECURITY_RISK',
            message: risk.description,
            severity: risk.severity === 'CRITICAL' ? 'error' : 'warning',
          });
        });
      }
    }

    // Validate file operations
    if (context.operation.filePath) {
      const fileValidation = await this.fileValidator.validateFileAccess(
        context.operation.filePath,
        context.operation.type as any
      );

      if (!fileValidation.allowed) {
        errors.push({
          type: 'FILE_ACCESS_BLOCKED',
          message: fileValidation.reason || 'File access blocked by safety validation',
          context: { filePath: context.operation.filePath, risks: fileValidation.risks },
        });
      }
    }

    return {
      success: true,
      allowed: errors.length === 0,
      modified: false,
      warnings,
      errors,
      suggestions: [],
      metrics: this.createMetrics(context),
    };
  }

  private createMetrics(context: HookContext): OperationMetrics {
    return {
      operationId: context.operation.id,
      type: 'safety-validation',
      startTime: context.timestamp,
      endTime: new Date(),
      duration: Date.now() - context.timestamp.getTime(),
      success: true,
      resourceUsage: {
        memoryMB: 10,
        cpuPercent: 5,
        diskIO: 0,
        networkIO: 0,
        peakMemory: 10,
      },
    };
  }
}

// Auto-Agent Assignment Hook Implementation
class AutoAgentAssignmentHook implements EnhancedHook {
  readonly id = 'auto-agent-assignment';
  readonly type: HookType = 'assignment';
  readonly trigger: HookTrigger = 'PreToolUse';
  readonly enabled = true;
  readonly priority = 80;

  constructor(private readonly agentAssignor: IntelligentAgentAssignor) {}

  async execute(context: HookContext): Promise<HookResult> {
    try {
      const operationContext = {
        operation: context.operation,
        filePath: context.operation.filePath,
        fileType: this.detectFileType(context.operation.filePath),
        complexity: 'moderate' as const,
        urgency: 'normal' as const,
        requiredSkills: [],
        estimatedDuration: 300000, // 5 minutes
        priority: 1,
      };

      const assignment = await this.agentAssignor.assignOptimalAgent(operationContext);

      return {
        success: true,
        allowed: true,
        modified: true,
        data: { agentAssignment: assignment },
        warnings: [],
        errors: [],
        suggestions: [
          {
            type: 'AGENT_ASSIGNMENT',
            message: `Assigned to ${assignment.agent.name}: ${assignment.reasoning}`,
            confidence: assignment.confidence,
          },
        ],
        metrics: this.createMetrics(context),
      };
    } catch (error) {
      return {
        success: false,
        allowed: true,
        modified: false,
        warnings: [
          {
            type: 'ASSIGNMENT_WARNING',
            message: 'Auto-assignment failed, using default agent',
            severity: 'warning',
          },
        ],
        errors: [],
        suggestions: [],
        metrics: this.createMetrics(context),
      };
    }
  }

  private detectFileType(filePath?: string): 'typescript' | 'javascript' | 'python' | 'unknown' {
    if (!filePath) return 'unknown';

    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'py':
        return 'python';
      default:
        return 'unknown';
    }
  }

  private createMetrics(context: HookContext): OperationMetrics {
    return {
      operationId: context.operation.id,
      type: 'agent-assignment',
      startTime: context.timestamp,
      endTime: new Date(),
      duration: Date.now() - context.timestamp.getTime(),
      success: true,
      resourceUsage: {
        memoryMB: 15,
        cpuPercent: 10,
        diskIO: 0,
        networkIO: 0,
        peakMemory: 15,
      },
    };
  }
}

// Performance Tracking Hook Implementation
class PerformanceTrackingHook implements EnhancedHook {
  readonly id = 'performance-tracking';
  readonly type: HookType = 'performance';
  readonly trigger: HookTrigger = 'PostToolUse';
  readonly enabled = true;
  readonly priority = 60;

  constructor(private readonly performanceTracker: HookPerformanceTracker) {}

  async execute(context: HookContext): Promise<HookResult> {
    // Track the operation performance
    const operationResult = {
      success: true,
      startTime: context.timestamp,
      endTime: new Date(),
      resourceUsage: this.estimateResourceUsage(context),
      output: context.operation.metadata,
    };

    await this.performanceTracker.trackOperation(context.operation, operationResult);

    return {
      success: true,
      allowed: true,
      modified: false,
      warnings: [],
      errors: [],
      suggestions: [
        {
          type: 'PERFORMANCE_TRACKING',
          message: 'Operation performance tracked successfully',
          confidence: 1.0,
        },
      ],
      metrics: this.createMetrics(context),
    };
  }

  private estimateResourceUsage(context: HookContext): ResourceUsage {
    // Estimate based on operation type
    const baseUsage = {
      memoryMB: 50,
      cpuPercent: 25,
      diskIO: 10,
      networkIO: 5,
      peakMemory: 75,
    };

    // Adjust based on operation complexity
    if (context.operation.description.length > 500) {
      baseUsage.memoryMB *= 1.5;
      baseUsage.cpuPercent *= 1.3;
    }

    return baseUsage;
  }

  private createMetrics(context: HookContext): OperationMetrics {
    return {
      operationId: context.operation.id,
      type: 'performance-tracking',
      startTime: context.timestamp,
      endTime: new Date(),
      duration: Date.now() - context.timestamp.getTime(),
      success: true,
      resourceUsage: {
        memoryMB: 5,
        cpuPercent: 2,
        diskIO: 1,
        networkIO: 0,
        peakMemory: 5,
      },
    };
  }
}

// Context Loading Hook Implementation
class ContextLoadingHook implements EnhancedHook {
  readonly id = 'context-loading';
  readonly type: HookType = 'context';
  readonly trigger: HookTrigger = 'PreToolUse';
  readonly enabled = true;
  readonly priority = 90;

  constructor(private readonly contextLoader: ContextLoader) {}

  async execute(context: HookContext): Promise<HookResult> {
    try {
      const loadedContext = await this.contextLoader.loadOperationContext(context);

      return {
        success: true,
        allowed: true,
        modified: true,
        data: { loadedContext },
        warnings: [],
        errors: [],
        suggestions: [
          {
            type: 'CONTEXT_LOADED',
            message: 'Operation context loaded successfully',
            confidence: 1.0,
          },
        ],
        metrics: this.createMetrics(context),
      };
    } catch (error) {
      return {
        success: false,
        allowed: true,
        modified: false,
        warnings: [
          {
            type: 'CONTEXT_WARNING',
            message: 'Context loading failed, proceeding without enhanced context',
            severity: 'warning',
          },
        ],
        errors: [],
        suggestions: [],
        metrics: this.createMetrics(context),
      };
    }
  }

  private createMetrics(context: HookContext): OperationMetrics {
    return {
      operationId: context.operation.id,
      type: 'context-loading',
      startTime: context.timestamp,
      endTime: new Date(),
      duration: Date.now() - context.timestamp.getTime(),
      success: true,
      resourceUsage: {
        memoryMB: 20,
        cpuPercent: 8,
        diskIO: 5,
        networkIO: 2,
        peakMemory: 25,
      },
    };
  }
}

// Auto-Formatting Hook Implementation
class AutoFormattingHook implements EnhancedHook {
  readonly id = 'auto-formatting';
  readonly type: HookType = 'command';
  readonly trigger: HookTrigger = 'PostToolUse';
  readonly matcher = /Write|Edit|MultiEdit/i;
  readonly enabled = true;
  readonly priority = 40;

  async execute(context: HookContext): Promise<HookResult> {
    const suggestions: any[] = [];

    if (context.operation.filePath) {
      const formatter = this.getFormatterForFile(context.operation.filePath);
      if (formatter) {
        suggestions.push({
          type: 'AUTO_FORMAT',
          message: `Consider formatting with ${formatter}`,
          action: `Format file using ${formatter}`,
          confidence: 0.9,
        });
      }
    }

    return {
      success: true,
      allowed: true,
      modified: false,
      warnings: [],
      errors: [],
      suggestions,
      metrics: this.createMetrics(context),
    };
  }

  private getFormatterForFile(filePath: string): string | null {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const formatters: Record<string, string> = {
      ts: 'prettier',
      tsx: 'prettier',
      js: 'prettier',
      jsx: 'prettier',
      py: 'black',
      rs: 'rustfmt',
      go: 'gofmt',
      json: 'prettier',
      yaml: 'prettier',
      yml: 'prettier',
    };

    return ext ? formatters[ext] || null : null;
  }

  private createMetrics(context: HookContext): OperationMetrics {
    return {
      operationId: context.operation.id,
      type: 'auto-formatting',
      startTime: context.timestamp,
      endTime: new Date(),
      duration: Date.now() - context.timestamp.getTime(),
      success: true,
      resourceUsage: {
        memoryMB: 8,
        cpuPercent: 5,
        diskIO: 2,
        networkIO: 0,
        peakMemory: 10,
      },
    };
  }
}

// Context Loader Implementation
class ContextLoader {
  async loadOperationContext(context: HookContext): Promise<Record<string, any>> {
    // Mock implementation - would load from actual context systems
    return {
      sessionHistory: await this.loadSessionHistory(context.session.id),
      environmentState: await this.loadEnvironmentState(),
      userPreferences: await this.loadUserPreferences(context.user?.id),
      projectContext: await this.loadProjectContext(context.environment.workingDirectory),
    };
  }

  private async loadSessionHistory(sessionId: string): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async loadEnvironmentState(): Promise<Record<string, any>> {
    // Mock implementation
    return {
      nodeVersion: process.version,
      platform: process.platform,
      workingDirectory: process.cwd(),
    };
  }

  private async loadUserPreferences(userId?: string): Promise<Record<string, any>> {
    // Mock implementation
    return {
      theme: 'dark',
      formatter: 'prettier',
      linting: true,
    };
  }

  private async loadProjectContext(workingDirectory: string): Promise<Record<string, any>> {
    // Mock implementation
    return {
      projectType: 'typescript',
      hasTests: true,
      dependencies: ['react', 'express', 'typescript'],
    };
  }
}
