/**
 * @fileoverview Git Operations Manager - Enterprise Git Management System
 *
 * Production-grade Git operations management system for SAFE enterprise development.
 * Handles intelligent branch management, automated conflict resolution,
 * and integration with enterprise development workflows.
 *
 * Enterprise Architecture Position:
 * - Part of Development Infrastructure layer
 * - Integrates with SAFE Lean Portfolio Management (LPM)
 * - Supports Agile Release Train (ART) coordination
 * - Enables DevSecOps pipeline automation
 *
 * Core Features:
 * - 🤖 AI-powered merge conflict resolution
 * - 🌳 Intelligent branch lifecycle management
 * - 🔄 Smart rebase operations with conflict handling
 * - 📦 Safe sandbox operations for all git commands
 * - 🧹 Automated tree maintenance and cleanup
 * - ⚡ Push/pull coordination with remote repositories
 * - 🎯 Intelligent decision making for git operations
 * - 🛡️ Environment-controlled secure operations
 *
 * @author Claude Code Zen Team
 * @version 2.0.0 - GitCommander Architecture
 * @since 2024-01-01
 */
interface BaseProject {
    id: string;
    name: string;
    type: string;
    techStack?: string[];
    currentPhase?: string;
}
interface MethodologyResult {
    data?: any;
    error?: string;
}
declare class Commander {
    protected commanderId: string;
    constructor(commanderId?: string);
    getCommanderId(): string;
}
interface Claude {
    messages?: any;
}
export interface GitOperationConfig {
    /** Enable AI-powered conflict resolution */
    aiConflictResolution: boolean;
    /** Enable intelligent branch management */
    intelligentBranching: boolean;
    /** Enable automated maintenance */
    automatedMaintenance: boolean;
    /** Maximum concurrent git operations */
    maxConcurrentOps: number;
    /** Git operation timeout (ms) */
    operationTimeout: number;
    /** Remote repository configurations */
    remotes: RemoteConfig[];
}
export interface RemoteConfig {
    name: string;
    url: string;
    credentials?: {
        type: 'token' | 'ssh' | 'basic';
        token?: string;
        username?: string;
        password?: string;
        sshKey?: string;
    };
}
export interface BranchStrategy {
    /** Branch naming convention */
    namingPattern: 'feature/{name}' | 'hotfix/{name}' | 'release/{name}' | 'custom';
    /** Custom naming pattern */
    customPattern?: string;
    /** Auto-cleanup old branches */
    autoCleanup: boolean;
    /** Branch protection rules */
    protectedBranches: string[];
    /** Merge strategy preference */
    defaultMergeStrategy: 'merge' | 'rebase' | 'squash';
}
export interface ConflictResolution {
    /** Conflict type */
    type: 'merge' | 'rebase' | 'cherry-pick';
    /** Files with conflicts */
    conflictFiles: string[];
    /** AI resolution suggestions */
    aiSuggestions: ConflictSuggestion[];
    /** Resolution strategy */
    strategy: 'auto' | 'manual' | 'ai-assisted';
    /** Resolution result */
    result?: 'resolved' | 'requires-manual' | 'failed';
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
        fresh: number;
        recent: number;
        old: number;
        stale: number;
    };
}
export interface GitOperation {
    id: string;
    type: 'clone' | 'pull' | 'push' | 'merge' | 'rebase' | 'branch' | 'commit' | 'fetch';
    projectId: string;
    sandboxId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'requires-resolution';
    startedAt: Date;
    completedAt?: Date;
    result?: any;
    error?: string;
    conflictResolution?: ConflictResolution;
}
export interface MaintenanceTask {
    id: string;
    type: 'cleanup-stale' | 'compress-trees' | 'update-remotes' | 'verify-integrity';
    schedule: string;
    lastRun?: Date;
    nextRun: Date;
    enabled: boolean;
}
export interface GitCommanderResult extends MethodologyResult {
    success: boolean;
    gitOperations: GitOperation[];
    conflictsResolved: number;
    branchesManaged: number;
    maintenancePerformed: boolean;
    aiAssistanceUsed: boolean;
    deliverables?: any[];
    metrics?: {
        operationTime: number;
        resourceUsage: number;
        effectivenessScore: number;
        duration?: number;
    };
}
/**
 * GitCommander - AI-Powered Git System at Commander Level
 *
 * Manages complete git operations with AI conflict resolution, intelligent branching,
 * and automated maintenance. Positioned at the same architectural level as SPARC
 * and other swarm commanders, managed by Queen Commander.
 */
export declare class GitOperationsManager extends Commander {
    private sandbox;
    private config;
    private branchStrategy;
    private claude?;
    private activeOperations;
    private operationHistory;
    private maintenanceTasks;
    private activeBranches;
    private treeMetrics;
    private coordinationContext;
    constructor(commanderId?: string, config?: Partial<GitOperationConfig>, branchStrategy?: Partial<BranchStrategy>, claude?: Claude | undefined);
    /**
     * Get methodology name for base class
     */
    protected getMethodologyName(): string;
    /**
     * Execute Git coordination methodology
     */
    executeMethodology(project: BaseProject): Promise<GitCommanderResult>;
    /**
     * Initialize the GitCommander system
     */
    initialize(): Promise<void>;
    /**
     * Clone repository into sandbox
     */
    cloneRepository(projectId: string, repoUrl: string, options?: {
        branch?: string;
        depth?: number;
        recursive?: boolean;
    }): Promise<string>;
    /**
     * Create new branch with intelligent naming
     */
    createBranch(projectId: string, branchName: string, options?: {
        fromBranch?: string;
        checkout?: boolean;
        push?: boolean;
    }): Promise<void>;
    /**
     * Delete branch with safety checks
     */
    deleteBranch(projectId: string, branchName: string, options?: {
        force?: boolean;
        deleteRemote?: boolean;
    }): Promise<void>;
    /**
     * AI-powered merge with conflict resolution
     */
    mergeBranch(projectId: string, sourceBranch: string, targetBranch: string, options?: {
        strategy?: 'merge' | 'squash' | 'rebase';
        message?: string;
        autoResolveConflicts?: boolean;
    }): Promise<ConflictResolution | null>;
    /**
     * Smart rebase with AI conflict resolution
     */
    rebaseBranch(projectId: string, targetBranch: string, options?: {
        interactive?: boolean;
        preserveMerges?: boolean;
        autoResolveConflicts?: boolean;
    }): Promise<ConflictResolution | null>;
    /**
     * Push changes with intelligent conflict handling
     */
    push(projectId: string, options?: {
        remote?: string;
        branch?: string;
        force?: boolean;
        setUpstream?: boolean;
    }): Promise<void>;
    /**
     * Pull changes with merge conflict handling
     */
    pull(projectId: string, options?: {
        remote?: string;
        branch?: string;
        rebase?: boolean;
        autoResolveConflicts?: boolean;
    }): Promise<ConflictResolution | null>;
    /**
     * Resolve merge conflicts using AI
     */
    private resolveConflictsWithAI;
    /**
     * Get AI suggestion for conflict resolution
     */
    private getAIConflictSuggestion;
    /**
     * Parse git conflict markers from file content
     */
    private parseConflictMarkers;
    /**
     * Apply AI suggestion to resolve conflict
     */
    private applyAISuggestion;
    /**
     * Initialize maintenance tasks
     */
    private initializeMaintenanceTasks;
    /**
     * Start automated maintenance scheduler
     */
    private startMaintenanceScheduler;
    /**
     * Run individual maintenance task
     */
    private runMaintenanceTask;
    /**
     * Cleanup stale git trees
     */
    private cleanupStaleTrees;
    /**
     * Compress git objects for space optimization
     */
    private compressGitTrees;
    /**
     * Update remote references
     */
    private updateRemoteReferences;
    /**
     * Verify repository integrity
     */
    private verifyRepositoryIntegrity;
    /**
     * Initialize git environment for project
     */
    private initializeProjectGitEnvironment;
    /**
     * Perform project-specific git operations
     */
    private performProjectGitOperations;
    /**
     * Resolve any conflicts from operations
     */
    private resolveAnyConflicts;
    /**
     * Manage branches intelligently
     */
    private manageBranches;
    /**
     * Perform maintenance if needed
     */
    private performMaintenanceIfNeeded;
    /**
     * Get current branch name
     */
    private getCurrentBranch;
    /**
     * Get sandbox for project
     */
    private getSandboxForProject;
    /**
     * Format branch name according to strategy
     */
    private formatBranchName;
    /**
     * Create new git operation tracking
     */
    private createOperation;
    /**
     * Complete git operation
     */
    private completeOperation;
    /**
     * Fail git operation
     */
    private failOperation;
    /**
     * Update tree metrics
     */
    private updateTreeMetrics;
    /**
     * Get comprehensive git system status
     */
    getGitSystemStatus(): {
        activeOperations: number;
        totalTrees: number;
        systemHealth: 'healthy' | 'warning' | 'critical';
        treeStatus: GitTreeStatus;
        recentOperations: GitOperation[];
        maintenance: {
            enabled: boolean;
            tasksScheduled: number;
            lastMaintenance?: Date;
        };
    };
    /**
     * Get operation history
     */
    getOperationHistory(projectId?: string): GitOperation[];
    /**
     * Shutdown the GitCommander system
     */
    shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=git-operations-manager.d.ts.map