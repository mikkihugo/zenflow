/**
 * @fileoverview Git Operations Implementation Package
 *
 * Complete AI-powered Git operations implementation providing:
 * - Intelligent conflict resolution with AI assistance
 * - Safe sandbox operations for all git commands
 * - Automated branch lifecycle management
 * - Enterprise-grade maintenance and cleanup
 * - DevSecOps pipeline integration
 *
 * This package provides the real implementation that @claude-zen/development
 * strategic facade delegates to when available.
 */
import { GitOperationsManager } from './git-operations-manager';
export type { BranchStrategy, ConflictResolution, ConflictSuggestion, GitCommanderResult as GitOperationsResult, GitOperation, GitOperationConfig, GitTreeStatus, MaintenanceTask, RemoteConfig, } from './git-operations-manager';
export { GitOperationsManager } from './git-operations-manager';
export declare function createEnterpriseGitManager(repositoryPath: string): GitOperationsManager;
export declare function createSAFEGitManager(artId: string): GitOperationsManager;
//# sourceMappingURL=index.d.ts.map