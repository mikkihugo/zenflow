import type { BranchSummary } from 'simple-git'

export type EventMap = Record<string, unknown[]>

export const UNKNOWN_ERROR_MESSAGE = 'Unknown error'

// Event string constants
export const EVENT_CONFLICT_RESOLVED = 'git: conflict: resolved'
export const EVENT_OPERATION_STARTED = 'git: operation: started'
export const EVENT_OPERATION_COMPLETED = 'git: operation: completed'
export const EVENT_OPERATION_FAILED = 'git: operation: failed'
export const EVENT_WORKTREE_CREATED = 'git: worktree: created'
export const EVENT_WORKTREE_REMOVED = 'git: worktree: removed'
export const EVENT_MAINTENANCE_STARTED = 'git: maintenance: started'
export const EVENT_MAINTENANCE_COMPLETED = 'git: maintenance: completed'

export const SUCCESS_MESSAGES = {
  repositoryCloned: 'Repository cloned successfully',
  branchCreated: 'Branch created successfully',
  branchDeleted: 'Branch deleted successfully',
  branchMerged: 'Branch merged successfully',
  branchRebased: 'Branch rebased successfully',
} as const

// Claude API minimal types
export type ClaudeRole = 'user' | 'assistant' | 'system'
export interface ClaudeMessage { role: ClaudeRole; content: string }
export interface ClaudeTextContent { type: 'text'; text: string }
export interface ClaudeMessagesAPI {
  create(args: {
    model: string
    max_tokens: number
    messages: ClaudeMessage[]
  }): Promise<{ content: ClaudeTextContent[] }>
}
export interface Claude {
  messages?: ClaudeMessagesAPI
}

export interface GitOperationConfig {
  aiConflictResolution: boolean
  intelligentBranching: boolean
  automatedMaintenance: boolean
  alwaysUseWorktrees: boolean
  maxConcurrentOps: number
  operationTimeout: number
  remotes: RemoteConfig[]
}

export interface RemoteConfig {
  name: string
  url: string
  credentials?: {
    type: 'token' | 'ssh' | 'basic'
    token?: string
    username?: string
    password?: string
    sshKey?: string
  }
}

export interface BranchStrategy {
  namingPattern: 'feature/{name}' | 'hotfix/{name}' | 'release/{name}' | 'custom'
  customPattern?: string
  autoCleanup: boolean
  protectedBranches: string[]
  defaultMergeStrategy: 'merge' | 'rebase' | 'squash'
}

export interface ConflictResolution {
  type: 'merge' | 'rebase' | 'cherry-pick'
  conflictFiles: string[]
  aiSuggestions: ConflictSuggestion[]
  strategy: 'auto' | 'manual' | 'ai-assisted'
  result?: 'resolved' | ' requires-manual' | ' failed'
}

export interface ConflictSuggestion {
  file: string
  conflicts: Array<{
    section: string
    ourVersion: string
    theirVersion: string
    aiRecommendation: string
    confidence: number
    reasoning: string
  }>
}

export interface GitTreeStatus {
  activeTrees: number
  maintenanceRequired: number
  diskUsage: number
  lastMaintenance: Date
  treesByAge: { fresh: number; recent: number; old: number; stale: number }
}

export interface GitOperation {
  id: string
  type: 'clone' | 'pull' | 'push' | 'merge' | 'rebase' | 'branch' | 'commit' | 'fetch'
  projectId: string
  sandboxId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'requires-resolution'
  startedAt: Date
  completedAt?: Date
  result?: unknown
  error?: string
  conflictResolution?: ConflictResolution
}

export interface MaintenanceTask {
  id: string
  type: 'cleanup-stale' | ' compress-trees' | ' update-remotes' | ' verify-integrity'
  schedule: string
  lastRun?: Date
  nextRun: Date
  enabled: boolean
}

export interface GitOperationStartedEvent {
  type: 'gitOperationStarted'
  operationId: string
  operationType: GitOperation['type']
  projectId: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface GitOperationCompletedEvent {
  type: 'gitOperationCompleted'
  operationId: string
  operationType: GitOperation['type']
  projectId: string
  success: boolean
  result?: unknown
  duration: number
  timestamp: string
}

export interface GitOperationFailedEvent {
  type: 'gitOperationFailed'
  operationId: string
  operationType: GitOperation['type']
  projectId: string
  error: string
  timestamp: string
}

export interface GitConflictResolvedEvent {
  type: 'gitConflictResolved'
  projectId: string
  conflictType: 'merge' | 'rebase' | 'cherry-pick'
  filesResolved: string[]
  aiAssisted: boolean
  timestamp: string
}

export interface GitWorktreeEvent {
  type: 'git: worktree: created' | 'git: worktree: removed'
  projectId: string
  worktreeName: string
  worktreePath: string
  branch: string
  timestamp: string
}

export interface GitMaintenanceEvent {
  type: 'git: maintenance: started' | 'git: maintenance: completed'
  taskType: 'cleanup-stale' | ' compress-trees' | ' update-remotes' | ' verify-integrity'
  projectsAffected?: number
  timestamp: string
}

export type GitEvent =
  | GitOperationStartedEvent
  | GitOperationCompletedEvent
  | GitOperationFailedEvent
  | GitConflictResolvedEvent
  | GitWorktreeEvent
  | GitMaintenanceEvent

export interface GitEventMap extends EventMap {
  gitOperationStarted: [GitOperationStartedEvent]
  gitOperationCompleted: [GitOperationCompletedEvent]
  gitOperationFailed: [GitOperationFailedEvent]
  gitConflictResolved: [GitConflictResolvedEvent]
  gitWorktreeCreated: [GitWorktreeEvent]
  gitWorktreeRemoved: [GitWorktreeEvent]
  gitMaintenanceStarted: [GitMaintenanceEvent]
  gitMaintenanceCompleted: [GitMaintenanceEvent]
}

// Reserved/future types used in manager
export type ActiveBranchesMap = Map<string, BranchSummary>
