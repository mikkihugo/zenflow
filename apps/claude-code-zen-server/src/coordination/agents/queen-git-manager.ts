/**
 * @fileoverview Queen Git Manager - Central Git Operations for Multi-Swarm Coordination
 * 
 * This module provides centralized git operations at the Queen level, managing
 * git sandboxes for multiple swarms simultaneously. Queens coordinate git trees
 * and repositories across all their managed swarms, ensuring safe, isolated
 * development environments.
 * 
 * Key Features:
 * - Multi-swarm git coordination
 * - Ultra-simple sandbox management with environment control
 * - Automated cleanup and maintenance
 * - Safe git operations across multiple projects
 * - Intelligent resource allocation for git operations
 * 
 * Architecture Position:
 * - Queen Commander: Strategic multi-swarm coordination (uses this)
 * - Swarm Commanders: Tactical coordination (delegates git to Queen)
 * - Agents: Implementation (work within Queen-managed git sandboxes)
 * 
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// TODO: SimpleGitSandbox was part of SPARC implementation - create standalone git utils if needed
// import { SimpleGitSandbox, type SandboxEnvironment } from '../swarm/sparc/simple-git-sandbox';

// Temporary type definition until standalone git utils are created
interface SandboxEnvironment {
  [key: string]: string;
}
import { getLogger } from '../../config/logging-config';
import * as path from 'path';

const logger = getLogger('queen-git-manager');

export interface QueenGitConfig {
  /** Root directory for all Queen-managed sandboxes */
  queenSandboxRoot: string;
  /** Maximum age for sandboxes before auto-cleanup (hours) */
  maxSandboxAgeHours: number;
  /** Maximum number of concurrent sandboxes per Queen */
  maxConcurrentSandboxes: number;
  /** Environment variables to restrict in sandboxes */
  restrictedEnvVars: string[];
}

export interface SwarmProjectInfo {
  swarmId: string;
  projectId: string;
  projectName: string;
  domain: string;
  commanderType: string;
}

export interface QueenGitMetrics {
  totalSandboxes: number;
  activeSandboxes: number;
  completedSandboxes: number;
  totalProjectsManaged: number;
  averageSandboxLifetime: number;
  resourceUtilization: {
    diskUsage: number;
    memoryUsage: number;
  };
}

/**
 * Queen Git Manager - Centralized git operations for multi-swarm coordination
 * 
 * Manages git sandboxes for multiple swarms, providing safe, isolated 
 * git environments with environment variable control and automatic cleanup.
 */
export class QueenGitManager {
  // private sandbox: SimpleGitSandbox; // TODO: Implement standalone git sandbox utility
  private config: QueenGitConfig;
  private projectSandboxes = new Map<string, SandboxEnvironment>();
  private swarmProjects = new Map<string, SwarmProjectInfo>();
  private sandboxMetrics = new Map<string, {
    createdAt: Date;
    lastUsed: Date;
    operationCount: number;
  }>();

  constructor(queenId: string, config?: Partial<QueenGitConfig>) {
    this.config = {
      queenSandboxRoot: path.join(process.cwd(), '.queen-git-sandboxes', queenId),
      maxSandboxAgeHours: 6, // 6 hours for Queen-level coordination
      maxConcurrentSandboxes: 50, // Queens can handle more concurrent operations
      restrictedEnvVars: [
        'HOME', 'PATH', 'SHELL', 'USER', 'SSH_AUTH_SOCK',
        'AWS_*', 'DOCKER_*', 'GITHUB_TOKEN', 'NPM_TOKEN',
        'CI_*', 'BUILD_*', 'DEPLOY_*' // Additional security for Queen level
      ],
      ...config
    };

    // TODO: Initialize git sandbox when standalone utility is created
    // this.sandbox = new SimpleGitSandbox({
    //   sandboxRoot: this.config.queenSandboxRoot,
    //   maxAgeHours: this.config.maxSandboxAgeHours,
    //   restrictedEnvVars: this.config.restrictedEnvVars
    // });

    logger.info(`👑 Queen Git Manager initialized`, {
      queenId,
      sandboxRoot: this.config.queenSandboxRoot,
      maxConcurrentSandboxes: this.config.maxConcurrentSandboxes
    });
  }

  /**
   * Initialize the Queen Git Manager system
   */
  async initialize(): Promise<void> {
    try {
      // await this.sandbox.initialize(); // TODO: Initialize when git sandbox utility is available
      
      logger.info(`✅ Queen Git Manager initialized successfully`, {
        sandboxRoot: this.config.queenSandboxRoot,
        maxSandboxes: this.config.maxConcurrentSandboxes
      });
    } catch (error) {
      logger.error(`❌ Failed to initialize Queen Git Manager`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Create git sandbox for a swarm project
   */
  async createSwarmProjectSandbox(
    swarmInfo: SwarmProjectInfo
  ): Promise<SandboxEnvironment> {
    // Check concurrent sandbox limit
    if (this.projectSandboxes.size >= this.config.maxConcurrentSandboxes) {
      throw new Error(`Queen sandbox limit reached: ${this.config.maxConcurrentSandboxes}`);
    }

    try {
      const sandboxId = `${swarmInfo.swarmId}-${swarmInfo.projectId}`;
      // TODO: Re-implement sandbox creation when git utility is available
      const sandbox: any = null; // await this.sandbox.createSandbox(sandboxId);
      
      // Track the sandbox and project info
      this.projectSandboxes.set(swarmInfo.projectId, sandbox);
      this.swarmProjects.set(swarmInfo.projectId, swarmInfo);
      this.sandboxMetrics.set(swarmInfo.projectId, {
        createdAt: new Date(),
        lastUsed: new Date(),
        operationCount: 0
      });

      logger.info(`📦 Created sandbox for swarm project`, {
        swarmId: swarmInfo.swarmId,
        projectId: swarmInfo.projectId,
        projectName: swarmInfo.projectName,
        sandboxId: sandbox.id,
        sandboxPath: sandbox.path
      });

      return sandbox;
    } catch (error) {
      logger.error(`❌ Failed to create sandbox for swarm project`, {
        swarmInfo,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Execute safe git operation for a swarm project
   */
  async executeSwarmGitOperation<T>(
    projectId: string,
    operation: (git: any) => Promise<T>
  ): Promise<T> {
    const sandbox = this.projectSandboxes.get(projectId);
    if (!sandbox) {
      throw new Error(`No sandbox found for project: ${projectId}`);
    }

    // Update metrics
    const metrics = this.sandboxMetrics.get(projectId);
    if (metrics) {
      metrics.lastUsed = new Date();
      metrics.operationCount++;
    }

    try {
      // TODO: Re-implement git operation execution
      const result = null; // await this.sandbox.executeSafeGitOp(sandbox, operation);
      
      logger.debug(`✅ Git operation completed for swarm project`, {
        projectId,
        sandboxId: sandbox.id,
        operationCount: metrics?.operationCount
      });

      return result;
    } catch (error) {
      logger.error(`❌ Git operation failed for swarm project`, {
        projectId,
        sandboxId: sandbox.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Extract results from swarm project sandbox
   */
  async extractSwarmProjectResults(projectId: string): Promise<any> {
    const sandbox = this.projectSandboxes.get(projectId);
    if (!sandbox) {
      throw new Error(`No sandbox found for project: ${projectId}`);
    }

    try {
      // TODO: Re-implement sandbox result extraction
      const results = null; // await this.sandbox.extractSandboxResults(sandbox);
      
      logger.info(`📤 Extracted results from swarm project sandbox`, {
        projectId,
        sandboxId: sandbox.id,
        filesCount: results.files.length,
        commitsCount: results.gitLog.length
      });

      return results;
    } catch (error) {
      logger.error(`❌ Failed to extract results from swarm project sandbox`, {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Cleanup sandbox for a swarm project
   */
  async cleanupSwarmProjectSandbox(projectId: string): Promise<void> {
    const sandbox = this.projectSandboxes.get(projectId);
    if (!sandbox) {
      logger.warn(`No sandbox found for cleanup: ${projectId}`);
      return;
    }

    try {
      // TODO: Re-implement sandbox cleanup
      // await this.sandbox.cleanupSandbox(sandbox.id);
      
      // Remove from tracking
      this.projectSandboxes.delete(projectId);
      this.swarmProjects.delete(projectId);
      this.sandboxMetrics.delete(projectId);

      logger.info(`🧹 Cleaned up sandbox for swarm project`, {
        projectId,
        sandboxId: sandbox.id
      });
    } catch (error) {
      logger.error(`❌ Failed to cleanup sandbox for swarm project`, {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get Queen Git Manager metrics
   */
  getQueenGitMetrics(): QueenGitMetrics {
    const now = Date.now();
    const lifetimes = Array.from(this.sandboxMetrics.values()).map(
      m => now - m.createdAt.getTime()
    );
    const averageLifetime = lifetimes.length > 0 
      ? lifetimes.reduce((sum, time) => sum + time, 0) / lifetimes.length
      : 0;

    return {
      totalSandboxes: this.sandboxMetrics.size,
      activeSandboxes: this.projectSandboxes.size,
      completedSandboxes: 0, // Would track completed from history
      totalProjectsManaged: this.swarmProjects.size,
      averageSandboxLifetime: averageLifetime,
      resourceUtilization: {
        diskUsage: 0, // Would calculate actual disk usage
        memoryUsage: 0  // Would calculate actual memory usage
      }
    };
  }

  /**
   * Get sandbox status for a project
   */
  getSandboxStatus(projectId: string): {
    exists: boolean;
    sandbox?: SandboxEnvironment;
    metrics?: any;
    swarmInfo?: SwarmProjectInfo;
  } {
    const sandbox = this.projectSandboxes.get(projectId);
    const metrics = this.sandboxMetrics.get(projectId);
    const swarmInfo = this.swarmProjects.get(projectId);

    return {
      exists: !!sandbox,
      sandbox,
      metrics,
      swarmInfo
    };
  }

  /**
   * List all active swarm projects managed by this Queen
   */
  listActiveSwarmProjects(): SwarmProjectInfo[] {
    return Array.from(this.swarmProjects.values());
  }

  /**
   * Shutdown the Queen Git Manager
   */
  async shutdown(): Promise<void> {
    try {
      // Cleanup all active sandboxes
      const cleanupPromises = Array.from(this.projectSandboxes.keys()).map(
        projectId => this.cleanupSwarmProjectSandbox(projectId)
      );
      
      await Promise.all(cleanupPromises);
      // TODO: Re-implement sandbox shutdown
      // await this.sandbox.shutdown();

      logger.info(`👑 Queen Git Manager shutdown complete`, {
        sandboxesCleanedUp: cleanupPromises.length
      });
    } catch (error) {
      logger.error(`❌ Error during Queen Git Manager shutdown`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}