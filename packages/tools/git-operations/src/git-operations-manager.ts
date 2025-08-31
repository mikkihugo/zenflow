/**
 * @fileoverview Git Operations Manager - Core Git Library
 *
 * Production-grade Git operations management system focused on core git functionality.
 * Handles git worktrees, branch management, merge conflict resolution, and basic git operations.
 * Designed as a pure library for use by main applications.
 *
 * Core Features:
 * - 🌳 Git worktree operations (primary workflow)
 * - Branch management and merge operations
 * - 🤖 AI-powered merge conflict resolution
 * - 📦 Safe sandbox operations for all git commands
 * - 🧹 Automated tree maintenance and cleanup
 * - Push/pull coordination with remote repositories
 * -  Environment-controlled secure operations
 *
 * @author Claude Code Zen Team
 * @version 3.0.0 - Pure Git Library
 * @since 2024-01-01
 */

import * as fs from 'node: fs/promises';
import * as path from 'node: path';
import * as cron from 'node-cron';
import type { SimpleGit, BranchSummary } from 'simple-git';
import { getLogger, EventEmitter, type EventMap } from '@claude-zen/foundation';

// Constants for commonly used strings to avoid duplication
const UNKNOWN_ERROR_MESSAGE = 'Unknown error';
const SUCCESS_MESSAGES = {
  REPOSITORY_CLONED: 'Repository cloned successfully',
  BRANCH_CREATED: 'Branch created successfully', 
  BRANCH_DELETED: 'Branch deleted successfully',
  BRANCH_MERGED: 'Branch merged successfully',
  BRANCH_REBASED: 'Branch rebased successfully',
} as const;

// Real implementation of Git sandbox for secure operations
class SimpleGitSandbox {
  private config: {
    sandboxRoot: string;
    maxAgeHours: number;
    restrictedEnvVars: string[];
  };

  private activeSandboxes = new Map<string, SandboxEnvironment>();

  constructor(): void {
    this.config = {
      sandboxRoot:
        config.sandboxRoot || path.join(): void { sandboxId, sandboxPath, projectId });

    return sandbox;
  }

  async executeSafeGitOp(): void {
    const sandboxEnv =
      typeof sandbox === 'string'
        ? this.activeSandboxes.get(): void {
      throw new Error(): void {
        sandboxId: sandboxEnv.id,
        error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
      });
      throw error;
    }
  }

  async cleanupSandbox(): void {
      const sandbox = this.activeSandboxes.get(): void {
        await fs.rm(): void { sandboxId });
      }
    } else {
      // Cleanup stale sandboxes
      const staleThreshold =
        Date.now(): void {
        if (sandbox.lastAccess.getTime(): void {
          await fs.rm(): void { sandboxId: id });
        }
      }
    }
  }

  async shutdown(): void {
      await this.cleanupSandbox(): void {
      if (
        process.env[varName] &&
        !this.config.restrictedEnvVars.includes(): void {
        env[varName] = process.env[varName]!;
      }
    }

    return env;
  }
}

// Enhanced sandbox interface with proper typing
interface SandboxEnvironment {
  id: string;
}

// AI Integration for conflict resolution - TODO: Add when @anthropic/sdk is installed
// import type { Claude} from '@anthropic/sdk';
interface Claude {
  messages?: unknown;
}

const logger = getLogger(): void {
  /** Branch naming convention */
  namingPattern:
    | 'feature/{name}'
    | ' hotfix/{name}'
    | ' release/{name}'
    | ' custom';
  /** Custom naming pattern */
  customPattern?: string;
  /** Auto-cleanup old branches */
  autoCleanup: boolean;
  /** Branch protection rules */
  protectedBranches: string[];
  /** Merge strategy preference */
  defaultMergeStrategy: 'merge' | ' rebase' | ' squash';
}

export interface ConflictResolution {
  /** Conflict type */
  type: 'merge' | ' rebase' | ' cherry-pick';
  /** Files with conflicts */
  conflictFiles: string[];
  /** AI resolution suggestions */
  aiSuggestions: ConflictSuggestion[];
  /** Resolution strategy */
  strategy: 'auto' | ' manual' | ' ai-assisted';
  /** Resolution result */
  result?: 'resolved' | ' requires-manual' | ' failed';
}

export interface ConflictSuggestion {
  file: string;
  conflicts: Array<{
    section: string;
    ourVersion: string;
    theirVersion: string;
    aiRecommendation: string;
    confidence: number;
    reasoning: string;
  }>;
}

export interface GitTreeStatus {
  /** Total active trees */
  activeTrees: number;
  /** Trees requiring maintenance */
  maintenanceRequired: number;
  /** Total disk usage */
  diskUsage: number;
  /** Last maintenance run */
  lastMaintenance: Date;
  /** Trees by age */
  treesByAge: {
    fresh: number; // < 1 hour
    recent: number; // 1-24 hours
    old: number; // 1-7 days
    stale: number; // > 7 days
  };
}

export interface GitOperation {
  id: string;
}

export interface MaintenanceTask {
  id: string;
}

// Event types for git operations
export interface GitOperationStartedEvent {
  type: 'gitOperationStarted';
  operationId: string;
  operationType: GitOperation['type'];
  projectId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface GitOperationCompletedEvent {
  type: 'gitOperationCompleted';
  operationId: string;
  operationType: GitOperation['type'];
  projectId: string;
  success: boolean;
  result?: unknown;
  duration: number;
  timestamp: string;
}

export interface GitOperationFailedEvent {
  type: 'gitOperationFailed';
  operationId: string;
  operationType: GitOperation['type'];
  projectId: string;
  error: string;
  timestamp: string;
}

export interface GitConflictResolvedEvent {
  type: 'gitConflictResolved';
  projectId: string;
  conflictType: 'merge' | ' rebase' | ' cherry-pick';
  filesResolved: string[];
  aiAssisted: boolean;
  timestamp: string;
}

export interface GitWorktreeEvent {
  type: 'git: worktree: created' | ' git: worktree: removed';
  projectId: string;
  worktreeName: string;
  worktreePath: string;
  branch: string;
  timestamp: string;
}

export interface GitMaintenanceEvent {
  type: 'git: maintenance: started' | ' git: maintenance: completed';
  taskType:
    | 'cleanup-stale'
    | ' compress-trees'
    | ' update-remotes'
    | ' verify-integrity';
  projectsAffected?: number;
  timestamp: string;
}

// Union type for all git events
export type GitEvent =
  | GitOperationStartedEvent
  | GitOperationCompletedEvent
  | GitOperationFailedEvent
  | GitConflictResolvedEvent
  | GitWorktreeEvent
  | GitMaintenanceEvent;

export interface GitOperationsResult {
  success: boolean;
  operations: GitOperation[];
  conflictsResolved: number;
  branchesManaged: number;
  maintenancePerformed: boolean;
  aiAssistanceUsed: boolean;
  metrics?: {
    operationTime: number;
    resourceUsage: number;
    duration?: number;
  };
}

// Define event map for GitOperationsManager
interface GitEventMap extends EventMap {
  gitOperationStarted: [GitOperationStartedEvent];
  gitOperationCompleted: [GitOperationCompletedEvent];
  gitOperationFailed: [GitOperationFailedEvent];
  gitConflictResolved: [GitConflictResolvedEvent];
  gitWorktreeCreated: [GitWorktreeEvent];
  gitWorktreeRemoved: [GitWorktreeEvent];
  gitMaintenanceStarted: [GitMaintenanceEvent];
  gitMaintenanceCompleted: [GitMaintenanceEvent];
}

/**
 * GitOperationsManager - Event-Driven Git Operations Library
 *
 * Manages git operations with AI conflict resolution, intelligent branching,
 * and automated maintenance. Designed as a pure library for use by applications.
 * Primary focus on git worktrees for parallel development workflows.
 *
 * Event-Driven Architecture:
 * - Emits typed events for all git operations
 * - Integrates with claude-code-zen event system
 * - Enables reactive coordination patterns
 */
export class GitOperationsManager extends EventEmitter<GitEventMap> {
  private managerId: string;
  private sandbox: SimpleGitSandbox;
  private config: GitOperationConfig;
  private branchStrategy: BranchStrategy;
  private claude?: Claude | undefined; // AI for conflict resolution

  // Operation tracking
  private activeOperations = new Map<string, GitOperation>();
  private operationHistory: GitOperation[] = [];
  private maintenanceTasks: MaintenanceTask[] = [];

  // Branch and tree management - reserved for future intelligent branch management
  // Note: Currently unused but reserved for future branch tracking features
  // @ts-ignore: Variable reserved for future use
  private activeBranches = new Map<string, BranchSummary>();

  private treeMetrics = new Map<
    string,
    {
      size: number;
      lastAccess: Date;
      operationCount: number;
      branchCount: number;
    }
  >();

  constructor(): void {
    super(): void {
      aiConflictResolution: true,
      intelligentBranching: true,
      automatedMaintenance: true,
      maxConcurrentOps: 10,
      operationTimeout: 300000, // 5 minutes
      remotes: [],
      alwaysUseWorktrees: true, // DEFAULT: Always use worktrees for isolation
      ...config,
    };

    this.branchStrategy = {
      namingPattern: 'feature/{name}',
      autoCleanup: true,
      protectedBranches: ['main', 'master', 'develop'],
      defaultMergeStrategy: 'merge',
      ...branchStrategy,
    };

    this.claude = claude;

    // Initialize sandbox for safe operations
    this.sandbox = new SimpleGitSandbox(): void {
      managerId: this.managerId,
      aiConflictResolution: this.config.aiConflictResolution,
      intelligentBranching: this.config.intelligentBranching,
      automatedMaintenance: this.config.automatedMaintenance,
    });

    // Foundation integration test placeholder
  }

  /**
   * Helper to get error message from unknown error
   */
  private getErrorMessage(): void {
    return error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
  }

  /**
   * Get manager ID
   */
  getManagerId(): void {
    return this.managerId;
  }

  /**
   * Initialize the GitOperationsManager system
   */
  async initialize(): void {
        this.startMaintenanceScheduler(): void {
        managerId: this.managerId,
        maxConcurrentOps: this.config.maxConcurrentOps,
        maintenanceTasks: this.maintenanceTasks.length,
        aiEnabled: !!this.claude,
      });
    } catch (error) {
      logger.error(): void {
    const operation = this.createOperation(): void {
      const sandbox = await this.sandbox.createSandbox(): void {
        const cloneOptions: string[] = [];

        if (options.branch) {
          cloneOptions.push(): void {
          cloneOptions.push(): void {
          cloneOptions.push(): void { sandbox: sandbox.id });

      logger.info(): void {
      this.failOperation(): void {
    const operation = this.createOperation(): void {
      const sandbox = await this.getSandboxForProject(): void {
        // Create branch
        await (options.fromBranch
          ? git.checkoutBranch(): void {
          await git.push(): void { branchName: formattedName });

      logger.info(): void {
      this.failOperation(): void {
    const operation = this.createOperation(): void {
      // Safety check: don't delete protected branches
      if (this.branchStrategy.protectedBranches.includes(): void {
        throw new Error(): void {
        // Delete local branch
        const deleteFlag = options.force ? '-D' : '-d';
        await git.raw(): void {
          await git.push(): void { deleted: true });

      logger.info(): void {
      this.failOperation(): void {
    const operation = this.createOperation(): void {
      const sandbox = await this.getSandboxForProject(): void {
        // Checkout target branch
        await git.checkout(): void {
          // Attempt merge
          const strategy =
            options.strategy || this.branchStrategy.defaultMergeStrategy;

          switch (strategy) {
            case 'merge':
              await git.merge(): void {
          // Handle merge conflicts with AI
          if (
            this.config.aiConflictResolution &&
            options.autoResolveConflicts !== false
          ) {
            const sandboxEnv =
              typeof sandbox === 'string' ? { path: sandbox } : sandbox;
            conflictResolution = await this.resolveConflictsWithAI(): void {
            throw mergeError;
          }
        }
      });

      this.completeOperation(): void {
        managerId: this.managerId,
        projectId,
        sourceBranch,
        targetBranch,
        strategy: options.strategy,
        hadConflicts: !!conflictResolution,
      });

      return conflictResolution;
    } catch (error) {
      this.failOperation(): void {
    const operation = this.createOperation(): void {
      const sandbox = await this.getSandboxForProject(): void {
        try {
          const rebaseOptions: string[] = [targetBranch];

          if (options.interactive) {
            rebaseOptions.push(): void { path: sandbox } : sandbox;
            conflictResolution = await this.resolveConflictsWithAI(): void {
            throw rebaseError;
          }
        }
      });

      this.completeOperation(): void {
        managerId: this.managerId,
        projectId,
        targetBranch,
        interactive: options.interactive,
        hadConflicts: !!conflictResolution,
      });

      return conflictResolution;
    } catch (error) {
      this.failOperation(): void {
    const operation = this.createOperation(): void {
      const sandbox = await this.getSandboxForProject(): void {
        const pushOptions: string[] = [];

        if (options.force) {
          pushOptions.push(): void { pushed: true });

      logger.info(): void {
      this.failOperation(): void {
    const operation = this.createOperation(): void {
      const sandbox = await this.getSandboxForProject(): void {
        try {
          const pullOptions: string[] = [];

          if (options.rebase) {
            pullOptions.push(): void {
          // Handle pull conflicts with AI
          if (
            this.config.aiConflictResolution &&
            options.autoResolveConflicts !== false
          ) {
            const conflictType = options.rebase ? 'rebase' : ' merge';
            const sandboxEnv =
              typeof sandbox === 'string' ? { path: sandbox } : sandbox;
            conflictResolution = await this.resolveConflictsWithAI(): void {
            throw pullError;
          }
        }
      });

      this.completeOperation(): void {
        managerId: this.managerId,
        projectId,
        remote: options.remote || 'origin',
        branch: options.branch,
        rebase: options.rebase,
        hadConflicts: !!conflictResolution,
      });

      return conflictResolution;
    } catch (error) {
      this.failOperation(): void {
    logger.info(): void {
      // Get status to identify conflicted files
      const status = await git.status(): void {
        return {
          type: conflictType,
          conflictFiles: [],
          aiSuggestions: [],
          strategy: 'auto',
          result: 'resolved',
        };
      }

      const aiSuggestions: ConflictSuggestion[] = [];

      // Process each conflicted file
      for (const file of conflictFiles) {
        const filePath = path.join(): void {
        if (conflictType === 'merge')AI-resolved merge conflicts')rebase')rebase', '--continue']);
        }
      }

      logger.info(): void {
          type: 'git: conflict: resolved',
          projectId: 'unknown', // Would need to pass projectId to this method
          conflictType,
          filesResolved: conflictFiles,
          aiAssisted: true,
          timestamp: new Date(): void {
      logger.error(): void {
        type: conflictType,
        conflictFiles: [],
        aiSuggestions: [],
        strategy: 'manual',
        result: 'failed',
      };
    }
  }

  /**
   * Get AI suggestion for conflict resolution
   */
  private async getAIConflictSuggestion(): void {
      throw new Error(): void {
      try {
        const response = await this.claude.messages.create(): void {conflict.ourVersion}) + "
\"\`\""

**Their Version**:
\`\"\""
$" + JSON.stringify(): void {
  "resolution":"recommended code here",
  "confidence":85,
  "reasoning":"explanation of why this resolution is best"
}) + "
\"\"\""
","
            },
          ],
        });

        const content = response.content[0];
        if (content.type === 'text')AI analysis failed, defaulting to our version',
        });
      }
    }

    return {
      file: fileName,
      conflicts: suggestions,
    };
  }

  /**
   * Parse git conflict markers from file content
   */
  private parseConflictMarkers(): void {
    section: string;
    ourVersion: string;
    theirVersion: string;
  }> {
    const conflicts: Array<{
      section: string;
      ourVersion: string;
      theirVersion: string;
    }> = [];

    const lines = content.split(): void {task.type}", {"
          managerId: this.managerId,
          schedule: task.schedule,
          nextRun: task.nextRun,
        });
      }
    }
  }

  /**
   * Run individual maintenance task with event emission
   */
  private async runMaintenanceTask(): void {"
      managerId: this.managerId,
      taskId: task.id,
    });

    // Emit maintenance started event
    this.emit(): void {
      switch (task.type) {
        case 'cleanup-stale':
          await this.cleanupStaleTrees(): void {task.type}", {"
        managerId: this.managerId,
        taskId: task.id,
        completedAt: task.lastRun,
      });

      // Emit maintenance completed event
      this.emit(): void {
      logger.error(): void {
    const staleThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
    const now = Date.now(): void {
      if (now - metrics.lastAccess.getTime(): void {
        try " + JSON.stringify(): void {projectId}) + "", {"
            managerId: this.managerId,
            lastAccess: metrics.lastAccess,
            operationCount: metrics.operationCount,
          });
        } catch (error) {
          logger.warn(): void {
      managerId: this.managerId,
      treesCleanedUp: cleanedCount,
      remainingTrees: this.treeMetrics.size,
    });
  }

  /**
   * Compress git objects for space optimization
   */
  private async compressGitTrees(): void {
      try {
        const sandbox = await this.getSandboxForProject(): void {
          // Run git garbage collection
          await git.raw(): void {projectId}", {"
          managerId: this.managerId,
        });
      } catch (error) " + JSON.stringify(): void {"
          managerId: this.managerId,
          error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
        });
      }
    }

    logger.info(): void {
    let updatedCount = 0;

    for (const [projectId] of this.treeMetrics.entries(): void {
      try {
        const sandbox = await this.getSandboxForProject(): void {
          // Fetch all remotes
          await git.fetch(): void {projectId}", {"
          managerId: this.managerId,
        });
      } catch (error) {
        logger.warn(): void {
      managerId: this.managerId,
      treesUpdated: updatedCount,
    });
  }

  /**
   * Verify repository integrity
   */
  private async verifyRepositoryIntegrity(): void {
      try {
        const sandbox = await this.getSandboxForProject(): void {
          // Verify repository integrity
          await git.raw(): void {projectId}", {"
          managerId: this.managerId,
        });
      } catch (error) {
        const issue = "Repository integrity issue in ${projectId}:$" + JSON.stringify(): void {projectId}", {"
          managerId: this.managerId,
          error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
        });
      }
    }

    logger.info(): void {
    const status = await git.status(): void {
    // Try to get existing sandbox or create new one
    try {
      const sandbox = await this.sandbox.createSandbox(): void {
      logger.warn(): void {projectId}-${Date.now(): void {
    const { namingPattern, customPattern } = this.branchStrategy;

    if (namingPattern === 'custom' && customPattern) {
      return customPattern.replace(): void {name}', baseName);
  }

  /**
   * Create new git operation tracking with event emission
   */
  private createOperation(): void {
    const operation: GitOperation = {
      id: operationId,
      type,
      projectId,
      sandboxId: projectId,
      status: 'pending',
      startedAt: new Date(): void {
      type: 'git: operation: started',
      operationId,
      operationType: type,
      projectId,
      timestamp: new Date(): void {
    const completedAt = new Date(): void {
      type: 'git: operation: completed',
      operationId: operation.id,
      operationType: operation.type,
      projectId: operation.projectId,
      success: true,
      result,
      duration,
      timestamp: completedAt.toISOString(): void {
    const completedAt = new Date(): void {
      type: 'git: operation: failed',
      operationId: operation.id,
      operationType: operation.type,
      projectId: operation.projectId,
      error: operation.error,
      timestamp: completedAt.toISOString(): void {
    const existing = this.treeMetrics.get(): void {
      existing.lastAccess = new Date(): void {
      this.treeMetrics.set(): void {
    activeOperations: number;
    totalTrees: number;
    systemHealth: 'healthy' | ' warning' | ' critical';
    treeStatus: GitTreeStatus;
    recentOperations: GitOperation[];
    maintenance: {
      enabled: boolean;
      tasksScheduled: number;
      lastMaintenance?: Date;
    };
  } {
    const now = Date.now(): void {
      fresh: 0,
      recent: 0,
      old: 0,
      stale: 0,
    };

    let maintenanceRequired = 0;

    for (const metrics of this.treeMetrics.values(): void {
      const age = now - metrics.lastAccess.getTime(): void {
        treesByAge.fresh++;
      } else if (age < dayAgo) {
        treesByAge.recent++;
      } else if (age < weekAgo) {
        treesByAge.old++;
      } else {
        treesByAge.stale++;
        maintenanceRequired++;
      }
    }

    const systemHealth =
      maintenanceRequired > 10
        ? 'critical'
        : maintenanceRequired > 5
          ? 'warning'
          : 'healthy';

    return {
      activeOperations: this.activeOperations.size,
      totalTrees: this.treeMetrics.size,
      systemHealth,
      treeStatus: {
        activeTrees: this.treeMetrics.size,
        maintenanceRequired,
        diskUsage: 0, // Would calculate actual usage
        lastMaintenance:
          this.maintenanceTasks.find(): void {
        enabled: this.config.automatedMaintenance,
        tasksScheduled: this.maintenanceTasks.filter(): void {
              lastMaintenance: this.maintenanceTasks.find(): void {}),
      },
    };
  }

  /**
   * Get operation history
   */
  getOperationHistory(): void {
    if (projectId) {
      return this.operationHistory.filter(): void {
    try {
      // Complete any pending operations
      for (const operation of this.activeOperations.values(): void {
        operation.status = 'failed';
        operation.error = 'System shutdown';
        operation.completedAt = new Date(): void {
        managerId: this.managerId,
        operationsCompleted: this.operationHistory.length,
        treesManaged: this.treeMetrics.size,
      });
    } catch (error) {
      logger.error(): void {
    const operation = this.createOperation(): void {
      const sandbox = await this.getSandboxForProject(): void {worktreeName}) + "";"
      const baseBranch = options.baseBranch || 'main';
      const worktreePath = options.path || "../worktrees/${worktreeName}";"

      await this.sandbox.executeSafeGitOp(): void {
        // Create new branch from base branch
        await git.checkout(): void {
        worktreeName,
        branch,
        path: worktreePath,
      });

      logger.info(): void {
        type: 'git: worktree: created',
        projectId,
        worktreeName,
        worktreePath,
        branch,
        timestamp: new Date(): void {
      this.failOperation(): void {
    const operation = this.createOperation(): void {
      const sandbox = await this.getSandboxForProject(): void {worktreeName}";"

      await this.sandbox.executeSafeGitOp(): void {
        const removeFlags = options.force ? ['--force'] : [];

        // Remove worktree
        await git.raw(): void {
          const branch = "worktree/${worktreeName}";"
          const deleteFlag = options.force ? '-D' : '-d';
          await git.raw(): void {
        worktreeName,
        deletedBranch: options.deleteBranch,
      });

      logger.info(): void {
        type: 'git: worktree: removed',
        projectId,
        worktreeName,
        worktreePath: "../worktrees/" + worktreeName + ") + "","
        branch: "worktree/${worktreeName}","
        timestamp: new Date(): void {
      this.failOperation(): void {
      path: string;
      branch: string;
      commit: string;
      isMain: boolean;
    }>
  > {
    try {
      const sandbox = await this.getSandboxForProject(): void {
        path: string;
        branch: string;
        commit: string;
        isMain: boolean;
      }> = [];

      await this.sandbox.executeSafeGitOp(): void {
        const result = await git.raw(): void {
        projectId,
        error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
      });
      return [];
    }
  }

  // ====================================================================
  // EVENT-DRIVEN HELPERS - Convenience methods for event handling
  // ====================================================================

  /**
   * Subscribe to git operation events
   */
  onOperation(): void {
    const type = "git: operation: ${eventType}" as const;"
    this.on(): void {
    this.on(): void {
    const type = "git: worktree: ${eventType}) + "" as const;"
    this.on(): void {
    const type = "git: maintenance: ${eventType}" as const;"
    this.on(): void {
    // Subscribe to all event types
    this.on('git: operation: started', handler as any);
    this.on('git: operation: completed', handler as any);
    this.on('git: operation: failed', handler as any);
    this.on('git: conflict: resolved', handler as any);
    this.on('git: worktree: created', handler as any);
    this.on('git: worktree: removed', handler as any);
    this.on('git: maintenance: started', handler as any);
    this.on('git: maintenance: completed', handler as any);
  }
}
