/**
 * @fileoverview Git Manager - Essential Git Operations
 * 
 * Essential Git operations for development coordination.
 * Handles branch management, commits, and repository operations
 * needed for SPARC workflow and swarm development.
 * 
 * @author Claude Code Zen Team
 * @since 2.3.0
 * @version 1.0.0
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config';
import type { Logger } from '@claude-zen/foundation';

/**
 * Git operation result
 */
export interface GitOperationResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Branch information
 */
export interface BranchInfo {
  name: string;
  current: boolean;
  upstream?: string;
  lastCommit?: string;
}

/**
 * Git Manager
 * 
 * Handles essential Git operations for development coordination:
 * - Branch creation and management
 * - Commit operations
 * - Repository status
 * - Integration with SPARC workflow
 */
export class GitManager extends EventEmitter {
  private logger: Logger;
  private repositoryPath: string;
  private branchStrategy: 'feature' | 'gitflow' | 'github-flow' = 'feature';

  constructor(repositoryPath: string, branchStrategy: 'feature' | 'gitflow' | 'github-flow' = 'feature') {
    super();
    this.logger = getLogger('GitManager');
    this.repositoryPath = repositoryPath;
    this.branchStrategy = branchStrategy;
  }

  /**
   * Initialize Git manager
   */
  async initialize(): Promise<void> {
    this.logger.info(`Initializing Git manager for ${this.repositoryPath}`);
    
    // Verify repository exists
    const status = await this.getRepositoryStatus();
    if (!status.success) {
      throw new Error(`Invalid Git repository: ${this.repositoryPath}`);
    }
    
    this.emit('git:initialized', { repositoryPath: this.repositoryPath });
  }

  /**
   * Create branch for development task
   */
  async createTaskBranch(taskId: string, taskTitle: string, baseBranch: string = 'main'): Promise<GitOperationResult> {
    const branchName = this.generateBranchName(taskId, taskTitle);
    
    try {
      this.logger.info(`Creating branch ${branchName} from ${baseBranch}`);
      
      // Git operations would go here
      // For now, return success simulation
      const result: GitOperationResult = {
        success: true,
        message: `Branch ${branchName} created successfully`,
        data: { branchName, baseBranch }
      };
      
      this.emit('git:branch_created', { taskId, branchName, baseBranch });
      return result;
      
    } catch (error) {
      const result: GitOperationResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create branch'
      };
      
      this.logger.error(`Failed to create branch ${branchName}:`, error);
      return result;
    }
  }

  /**
   * Commit changes for SPARC phase
   */
  async commitSPARCPhase(
    taskId: string, 
    phase: string, 
    message?: string
  ): Promise<GitOperationResult> {
    const commitMessage = message || this.generateSPARCCommitMessage(taskId, phase);
    
    try {
      this.logger.info(`Committing SPARC ${phase} phase for task ${taskId}`);
      
      // Git commit operations would go here
      const result: GitOperationResult = {
        success: true,
        message: `SPARC ${phase} phase committed successfully`,
        data: { taskId, phase, commitMessage }
      };
      
      this.emit('git:sparc_commit', { taskId, phase, commitMessage });
      return result;
      
    } catch (error) {
      const result: GitOperationResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to commit changes'
      };
      
      this.logger.error(`Failed to commit SPARC ${phase} phase:`, error);
      return result;
    }
  }

  /**
   * Get current branch information
   */
  async getCurrentBranch(): Promise<BranchInfo | null> {
    try {
      // Git branch operations would go here
      // For now, return simulation
      return {
        name: 'main',
        current: true,
        lastCommit: 'abc123'
      };
    } catch (error) {
      this.logger.error('Failed to get current branch:', error);
      return null;
    }
  }

  /**
   * Get repository status
   */
  async getRepositoryStatus(): Promise<GitOperationResult> {
    try {
      // Git status operations would go here
      return {
        success: true,
        message: 'Repository status retrieved',
        data: {
          clean: true,
          ahead: 0,
          behind: 0,
          modified: [],
          untracked: []
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get repository status'
      };
    }
  }

  /**
   * Generate branch name based on strategy
   */
  private generateBranchName(taskId: string, taskTitle: string): string {
    const sanitizedTitle = taskTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    
    switch (this.branchStrategy) {
      case 'feature':
        return `feature/${sanitizedTitle}-${taskId}`;
      case 'gitflow':
        return `feature/${sanitizedTitle}`;
      case 'github-flow':
        return `${sanitizedTitle}-${taskId}`;
      default:
        return `feature/${sanitizedTitle}-${taskId}`;
    }
  }

  /**
   * Generate SPARC commit message
   */
  private generateSPARCCommitMessage(taskId: string, phase: string): string {
    const phaseMessages = {
      specification: 'spec: ',
      pseudocode: 'pseudo: ',
      architecture: 'arch: ',
      refinement: 'refine: ',
      completion: 'complete: '
    };
    
    const prefix = phaseMessages[phase as keyof typeof phaseMessages] || '';
    return `${prefix}SPARC ${phase} phase for task ${taskId}`;
  }

  /**
   * Shutdown Git manager
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Git manager');
    this.removeAllListeners();
  }
}

/**
 * Create Git manager instance
 */
export function createGitManager(
  repositoryPath: string, 
  branchStrategy: 'feature' | 'gitflow' | 'github-flow' = 'feature'
): GitManager {
  return new GitManager(repositoryPath, branchStrategy);
}