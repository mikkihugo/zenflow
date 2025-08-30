/**
 * @fileoverview Event Catalog - System-Wide Event Registry
 *
 * Centralized catalog of all event types used across claude-code-zen.
 * Provides TypeScript definitions and development-time validation.
 */
export interface BaseEvent {
    timestamp?: Date;
    requestId?: string;
    correlationId?: string;
}
export interface EventPayload<T = unknown> extends BaseEvent {
    data: T;
}
/**
 * SPARC requests specific phase review from Teamwork
 * @emitter SPARCManager
 * @listener TeamworkManager
 */
export interface SPARCPhaseReviewEvent extends BaseEvent {
    requestId: string;
    projectId: string;
    phase: 'specification' | ' pseudocode' | ' architecture' | ' refinement' | ' completion';
    reviewType: 'architecture' | ' specification' | ' implementation' | ' quality';
    artifacts: unknown[];
    requirements: string[];
    suggestedReviewers: string[];
    timeout?: number;
}
/**
 * SPARC project reaches completion
 * @emitter SPARCManager
 * @listener System
 */
export interface SPARCProjectCompleteEvent extends BaseEvent {
    projectId: string;
    project: {
        id: string;
        name: string;
        artifacts: Record<string, unknown[]>;
    };
}
/**
 * SPARC phase execution completes successfully
 * @emitter SPARCManager
 * @listener System
 */
export interface SPARCPhaseCompleteEvent extends BaseEvent {
    projectId: string;
    phase: string;
    artifacts: unknown[];
    completedBy: 'llm-inference' | ' claude-code' | ' teamwork';
    sparcValidated: boolean;
    filesModified?: string[];
}
/**
 * Request LLM inference with methodology context
 * @emitter SPARCManager
 * @listener LLMPackage
 */
export interface LLMInferenceRequestEvent extends BaseEvent {
    requestId: string;
    type: 'simple-inference' | ' structured-generation' | ' analysis' | ' code-generation';
    projectId: string;
    phase?: string;
    prompt: string;
    sparcMethodology?: {
        phaseName: string;
        requirements: string[];
        validationCriteria: string[];
    };
    llmConfig: {
        strategy: 'auto' | ' gemini' | ' claude' | ' github-copilot';
        contextSize: 'small' | ' medium' | ' large';
        maxTokens: number;
        temperature: number;
    };
    context: {
        requirements: string[];
        previousArtifacts: Record<string, unknown[]>;
    };
}
/**
 * LLM inference completes successfully
 * @emitter LLMPackage
 * @listener SPARCManager
 */
export interface LLMInferenceCompleteEvent extends BaseEvent {
    requestId: string;
    projectId: string;
    phase?: string;
    success: boolean;
    artifacts: unknown[];
    metadata?: {
        provider: string;
        tokensUsed: number;
        processingTime: number;
    };
}
/**
 * LLM inference fails
 * @emitter LLMPackage
 * @listener SPARCManager
 */
export interface LLMInferenceFailedEvent extends BaseEvent {
    requestId: string;
    projectId: string;
    phase?: string;
    error: string;
    retryable?: boolean;
}
/**
 * Request Claude Code to execute task with file access
 * @emitter SPARCManager
 * @listener ClaudeCode
 */
export interface ClaudeCodeExecuteTaskEvent extends BaseEvent {
    projectId: string;
    phase?: string;
    sparcMethodology?: {
        phaseName: string;
        requirements: string[];
        validationCriteria: string[];
        methodologyNotes: string[];
    };
    context: {
        requirements: string[];
        previousArtifacts: Record<string, unknown[]>;
        needsFileAccess: boolean;
    };
}
/**
 * Claude Code task completes successfully
 * @emitter ClaudeCode
 * @listener SPARCManager
 */
export interface ClaudeCodeTaskCompleteEvent extends BaseEvent {
    requestId: string;
    projectId: string;
    phase?: string;
    success: boolean;
    artifacts: unknown[];
    filesModified?: string[];
    summary?: string;
}
/**
 * Claude Code task fails
 * @emitter ClaudeCode
 * @listener SPARCManager
 */
export interface ClaudeCodeTaskFailedEvent extends BaseEvent {
    requestId: string;
    projectId: string;
    phase?: string;
    error: string;
    filesAffected?: string[];
}
/**
 * Teamwork acknowledges collaboration request
 * @emitter TeamworkManager
 * @listener SPARCManager
 */
export interface TeamworkReviewAcknowledgedEvent extends BaseEvent {
    requestId: string;
    estimatedDuration: number;
    assignedAgents: string[];
}
/**
 * Teamwork completes review process
 * @emitter TeamworkManager
 * @listener SPARCManager
 */
export interface TeamworkReviewCompleteEvent extends BaseEvent {
    projectId: string;
    phase: string;
    reviewType: 'architecture' | ' specification' | ' implementation' | ' quality';
    approved: boolean;
    feedback: string[];
    actionItems: string[];
    conversationId: string;
}
/**
 * Teamwork collaboration fails
 * @emitter TeamworkManager
 * @listener SPARCManager
 */
export interface TeamworkCollaborationFailedEvent extends BaseEvent {
    projectId: string;
    phase: string;
    error: string;
    reason: 'timeout' | ' resource_unavailable' | ' system_error';
}
/**
 * SAFe Program Increment planning initiated
 * @emitter SafeFramework
 * @listener System
 */
export interface SafePIPlanningEvent extends BaseEvent {
    programIncrementId: string;
    startDate: Date;
    endDate: Date;
    objectives: string[];
    teams: string[];
}
/**
 * SAFe Epic created or updated
 * @emitter SafeFramework
 * @listener System
 */
export interface SafeEpicEvent extends BaseEvent {
    epicId: string;
    title: string;
    businessValue: number;
    state: string;
    owner: string;
}
/**
 * Git operation starts execution
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitOperationStartedEvent extends BaseEvent {
    operationId: string;
    type: 'clone' | ' commit' | ' push' | ' pull' | ' merge' | ' rebase' | ' worktree' | ' maintenance';
    repositoryPath: string;
    branchName?: string;
    worktreePath?: string;
}
/**
 * Git operation completes successfully
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitOperationCompletedEvent extends BaseEvent {
    operationId: string;
    type: 'clone' | ' commit' | ' push' | ' pull' | ' merge' | ' rebase' | ' worktree' | ' maintenance';
    repositoryPath: string;
    result: unknown;
    branchName?: string;
    worktreePath?: string;
    filesAffected?: string[];
}
/**
 * Git operation fails
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitOperationFailedEvent extends BaseEvent {
    operationId: string;
    type: 'clone' | ' commit' | ' push' | ' pull' | ' merge' | ' rebase' | ' worktree' | ' maintenance';
    repositoryPath: string;
    error: string;
    branchName?: string;
    worktreePath?: string;
}
/**
 * Git conflict resolved with AI assistance
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitConflictResolvedEvent extends BaseEvent {
    repositoryPath: string;
    conflictFiles: string[];
    resolutionStrategy: 'ai-suggested' | ' manual' | ' automatic';
    success: boolean;
    branchName?: string;
}
/**
 * Git worktree lifecycle events
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitWorktreeEvent extends BaseEvent {
    repositoryPath: string;
    worktreePath: string;
    branchName: string;
    action: 'created' | ' removed' | ' pruned';
}
/**
 * Git maintenance task events
 * @emitter GitOperationsManager
 * @listener System
 */
export interface GitMaintenanceEvent extends BaseEvent {
    repositoryPath: string;
    taskType: 'gc' | ' prune' | ' repack' | ' fsck' | ' cleanup';
    status: 'started' | ' completed' | ' failed';
    result?: unknown;
    error?: string;
}
/**
 * Database connection event
 * @emitter DatabaseEventCoordinator
 * @listener System
 */
export interface DatabaseConnectionEvent extends BaseEvent {
    type: 'sqlite' | ' memory';
    database: string;
    status?: 'connected' | ' failed';
    error?: string;
}
/**
 * Database storage creation event
 * @emitter DatabaseEventCoordinator
 * @listener System
 */
export interface DatabaseStorageEvent extends BaseEvent {
    database: string;
    status?: 'ready' | ' failed';
    error?: string;
}
/**
 * Database operation event
 * @emitter DatabaseEventCoordinator
 * @listener System
 */
export interface DatabaseOperationEvent extends BaseEvent {
    operation: string;
    details: Record<string, unknown>;
}
/**
 * Database health status change event
 * @emitter DatabaseEventCoordinator
 * @listener System
 */
export interface DatabaseHealthEvent extends BaseEvent {
    status: 'healthy' | ' degraded' | ' unhealthy';
    details?: Record<string, unknown>;
}
/**
 * System component starts
 * @emitter AnySystem
 * @listener SystemMonitor
 */
export interface SystemStartEvent extends BaseEvent {
    component: string;
    version: string;
    config?: Record<string, unknown>;
}
/**
 * System error occurs
 * @emitter AnySystem
 * @listener SystemMonitor
 */
export interface SystemErrorEvent extends BaseEvent {
    component: string;
    error: string;
    severity: 'low' | ' medium' | ' high' | ' critical';
    context?: Record<string, unknown>;
}
export declare const EVENT_CATALOG: {
    readonly 'sparc:architecture-review-needed': " SPARCPhaseReviewEvent";
    readonly 'sparc:code-review-needed': " SPARCPhaseReviewEvent";
    readonly 'sparc:phase-review-needed': " SPARCPhaseReviewEvent";
    readonly 'sparc:project-complete': " SPARCProjectCompleteEvent";
    readonly 'sparc:phase-complete': " SPARCPhaseCompleteEvent";
    readonly 'sparc:phase-fallback': " BaseEvent";
    readonly 'llm:inference-request': " LLMInferenceRequestEvent";
    readonly 'llm:inference-complete': " LLMInferenceCompleteEvent";
    readonly 'llm:inference-failed': " LLMInferenceFailedEvent";
    readonly 'claude-code:execute-task': " ClaudeCodeExecuteTaskEvent";
    readonly 'claude-code:task-complete': " ClaudeCodeTaskCompleteEvent";
    readonly 'claude-code:task-failed': " ClaudeCodeTaskFailedEvent";
    readonly 'teamwork:review-acknowledged': " TeamworkReviewAcknowledgedEvent";
    readonly 'teamwork:review-complete': " TeamworkReviewCompleteEvent";
    readonly 'teamwork:collaboration-failed': " TeamworkCollaborationFailedEvent";
    readonly 'safe:pi-planning-initiated': " SafePIPlanningEvent";
    readonly 'safe:epic-updated': " SafeEpicEvent";
    readonly 'git:operation:started': " GitOperationStartedEvent";
    readonly 'git:operation:completed': " GitOperationCompletedEvent";
    readonly 'git:operation:failed': " GitOperationFailedEvent";
    readonly 'git:conflict:resolved': " GitConflictResolvedEvent";
    readonly 'git:worktree:created': " GitWorktreeEvent";
    readonly 'git:worktree:removed': " GitWorktreeEvent";
    readonly 'git:maintenance:started': " GitMaintenanceEvent";
    readonly 'git:maintenance:completed': " GitMaintenanceEvent";
    readonly 'database:connection:initiated': " DatabaseConnectionEvent";
    readonly 'database:connection:established': " DatabaseConnectionEvent";
    readonly 'database:connection:failed': " DatabaseConnectionEvent";
    readonly 'database:storage:creation_started': " DatabaseStorageEvent";
    readonly 'database:storage:creation_completed': " DatabaseStorageEvent";
    readonly 'database:storage:creation_failed': " DatabaseStorageEvent";
    readonly 'database:operation': " DatabaseOperationEvent";
    readonly 'database:health:status_change': " DatabaseHealthEvent";
    readonly 'dspy:optimize-request': " DspyOptimizationRequest";
    readonly 'dspy:optimization-complete': " DspyOptimizationResult";
    readonly 'dspy:llm-request': " DspyLlmRequest";
    readonly 'dspy:llm-response': " DspyLlmResponse";
    readonly 'dspy:request-timeout': " BaseEvent";
    readonly 'brain:predict-request': " BrainPredictionRequest";
    readonly 'brain:prediction-complete': " BrainPredictionResult";
    readonly 'brain:learning-update': " BaseEvent";
    readonly 'brain:performance-tracked': " BaseEvent";
    readonly 'registry:module-register': " ModuleRegistration";
    readonly 'registry:module-unregister': " BaseEvent";
    readonly 'registry:module-registered': " ActiveModule";
    readonly 'registry:module-unregistered': " ActiveModule";
    readonly 'registry:heartbeat': " BaseEvent";
    readonly 'registry:module-idle': " BaseEvent";
    readonly 'registry:module-disconnected': " BaseEvent";
    readonly 'system:component-started': " SystemStartEvent";
    readonly 'system:error': " SystemErrorEvent";
};
export type EventName = keyof typeof EVENT_CATALOG;
/**
 * Validate that event name exists in catalog
 */
export declare function isValidEventName(eventName: string): eventName is EventName;
/**
 * Get event type for an event name
 */
export declare function getEventType(eventName: EventName): string;
/**
 * Get all event names in the catalog
 */
export declare function getAllEventNames(): EventName[];
/**
 * Get events by category
 */
export declare function getEventsByCategory(category: 'sparc' | ' llm' | ' claude-code' | ' teamwork' | ' safe' | ' git' | ' database' | ' dspy' | ' brain' | ' registry' | ' system'): EventName[];
/**
 * Enhanced EventLogger with catalog validation
 */
export declare class CatalogEventLogger {
    /**
     * Log event with catalog validation
     */
    static logValidatedEvent(eventName: string, payload?: unknown): void;
    /**
     * Log flow with validation
     */
    static logValidatedFlow(from: string, to: string, eventName: string): void;
}
/**
 * Common Event Flow Patterns in claude-code-zen:
 *
 * 1. SPARC Phase Execution:
 *    SPARCManager → llm:inference-request → LLMPackage
 *    LLMPackage → llm:inference-complete → SPARCManager
 *    SPARCManager → sparc:phase-complete → System
 *
 * 2. SPARC with Teamwork Collaboration:
 *    SPARCManager → sparc:phase-review-needed → TeamworkManager
 *    TeamworkManager → teamwork:review-acknowledged → SPARCManager
 *    TeamworkManager → teamwork:review-complete → SPARCManager
 *
 * 3. Claude Code Fallback:
 *    SPARCManager → claude-code:execute-task → ClaudeCode
 *    ClaudeCode → claude-code:task-complete → SPARCManager
 *    OR:ClaudeCode → claude-code:task-failed → SPARCManager
 *    SPARCManager → llm:inference-request → LLMPackage (fallback)
 *
 * 4. System Error Handling:
 *    AnyComponent → system:error → SystemMonitor
 *    SystemMonitor → system:recovery-initiated → AnyComponent
 */
//# sourceMappingURL=event-catalog.d.ts.map