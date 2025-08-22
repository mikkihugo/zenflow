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

// Export main GitOperationsManager class and utilities
export { GitOperationsManager } from './git-operations-manager';

// Import the class for type reference in factory functions
import { GitOperationsManager } from './git-operations-manager';

// Export all types
export type {
  GitOperationConfig,
  BranchStrategy,
  ConflictResolution,
  GitOperation,
  GitTreeStatus,
  MaintenanceTask,
  GitCommanderResult as GitOperationsResult,
  RemoteConfig,
  ConflictSuggestion,
} from './git-operations-manager';

// Export factory functions for common use cases
export function createEnterpriseGitManager(
  repositoryPath: string
): GitOperationsManager {
  const config = {
    aiConflictResolution: true,
    intelligentBranching: true,
    automatedMaintenance: true,
    maxConcurrentOps: 10,
    operationTimeout: 600000, // 10 minutes for enterprise
    remotes: [
      {
        name: 'origin',
        url: repositoryPath, // Use the repository path for remote configuration
      },
    ],
  };

  const branchStrategy = {
    namingPattern: 'feature/{name}' as const,
    autoCleanup: true,
    protectedBranches: ['main', 'master', 'develop', 'release/*'],
    defaultMergeStrategy: 'merge' as const,
  };

  return new GitOperationsManager(
    `enterprise-git-${Date.now()}`,
    config,
    branchStrategy
  );
}

export function createSAFEGitManager(artId: string): GitOperationsManager {
  const config = {
    aiConflictResolution: true,
    intelligentBranching: true,
    automatedMaintenance: true,
    maxConcurrentOps: 15,
    operationTimeout: 900000, // 15 minutes for SAFE coordination
    remotes: [], // Initialize empty remotes array
  };

  const branchStrategy = {
    namingPattern: 'feature/{name}' as const,
    autoCleanup: true,
    protectedBranches: ['main', 'develop', 'release/*', 'hotfix/*'],
    defaultMergeStrategy: 'rebase' as const,
  };

  return new GitOperationsManager(`safe-git-${artId}`, config, branchStrategy);
}
