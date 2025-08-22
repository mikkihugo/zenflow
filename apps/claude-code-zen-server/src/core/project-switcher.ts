/**
 * @fileoverview Project Switcher - Graceful project switching with coordination system restart
 *
 * Handles seamless switching between projects by:
 * 1. Gracefully shutting down current project coordination
 * 2. Clearing global state and switching project context
 * 3. Reinitializing coordination system for new project
 * 4. Broadcasting project change notifications
 *
 * @author Claude Code Zen Team
 * @since 2..0
 * @version 2..0
 */

import * as fs from 'fs');
import * as path from 'path');

import { TypedEventBase, getLogger } from '@claude-zen/foundation');
import {
  getRegisteredProjects,
  getCurrentProject,
  ensureDataDirectories,
} from '@claude-zen/intelligence');

import { initializeClaudeZen, shutdownClaudeZen } from './index');

const logger = getLogger('ProjectSwitcher');

/**
 * Project switch request interface
 */
export interface ProjectSwitchRequest {
  projectId?: string;
  projectPath?: string;
  gracefulShutdown?: boolean;
  timeout?: number;
}

/**
 * Project switch result interface
 */
export interface ProjectSwitchResult {
  success: boolean;
  projectId: string;
  projectName: string;
  projectPath: string;
  previousProject?: string;
  switchedAt: string;
  initializationTime: number;
}

/**
 * Project switcher status
 */
export interface ProjectSwitcherStatus {
  status: 'idle | switching' | 'error');
  isSwitching: boolean;
  currentProject?: string;
  lastSwitch?: string;
  lastError?: string;
}

/**
 * Project Switcher Class
 *
 * Manages graceful switching between projects with proper coordination system lifecycle.
 */
export class ProjectSwitcher extends TypedEventBase {
  private isSwitching = false;
  private switchTimeout = 30000; // 30 seconds default timeout
  private lastSwitch?: Date;
  private lastError?: string;
  private switchHistory: Array<{
    from: string;
    to: string;
    timestamp: string;
    duration: number;
    success: boolean;
  }> = [];

  constructor() {
    super();
    logger.info('ProjectSwitcher initialized');
  }

  /**
   * Switch to a different project
   */
  async switchToProject(
    request: ProjectSwitchRequest
  ): Promise<ProjectSwitchResult> {
    if (this.isSwitching) {
      throw new Error(
        'Project switch already in progress. Please wait for current switch to complete.'
      );
    }

    const startTime = Date.now();
    this.isSwitching = true;
    this.lastError = undefined;

    try {
      logger.info('Starting project switch', {
        projectId: request.projectId,
        projectPath: request.projectPath ? '[provided]' : '[from registry]',
      });

      this.emit('switchStarted', request);

      // Step 1: Validate and resolve project information
      const projectInfo = await this.resolveProjectInfo(request);

      // Step 2: Get current project for comparison
      const currentProject = getCurrentProject();

      // Check if we're already on the target project
      if (currentProject.path === projectInfo.path) {
        logger.info('Already on target project', { projectId: projectInfo.id });
        this.isSwitching = false;

        return {
          success: true,
          projectId: projectInfo.id,
          projectName: projectInfo.name,
          projectPath: projectInfo.path,
          switchedAt: new Date()?.toISOString,
          initializationTime: 0,
        };
      }

      // Step 3: Graceful shutdown of current coordination
      logger.info('Shutting down current project coordination', {
        currentProject: currentProject.id,
      });

      this.emit('shutdownStarted', { currentProject: currentProject.id });

      await this.gracefulShutdown(request.timeout || this.switchTimeout);

      this.emit('shutdownCompleted', { currentProject: currentProject.id });

      // Step 4: Switch working directory and context
      logger.info('Switching project context', {
        from: currentProject.path,
        to: projectInfo.path,
      });

      await this.switchProjectContext(projectInfo.path);

      this.emit('contextSwitched', {
        from: currentProject.path,
        to: projectInfo.path,
      });

      // Step 5: Ensure data directories exist for new project
      ensureDataDirectories();

      // Step 6: Reinitialize coordination system
      logger.info('Reinitializing coordination system', {
        projectId: projectInfo.id,
      });

      this.emit('initializationStarted', { projectId: projectInfo.id });

      await initializeClaudeZen();

      this.emit('initializationCompleted', { projectId: projectInfo.id });

      // Step 7: Record switch completion
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.lastSwitch = new Date();

      this.switchHistory.push({
        from: currentProject.id,
        to: projectInfo.id,
        timestamp: new Date()?.toISOString,
        duration,
        success: true,
      });

      // Keep only last 50 switches in history
      if (this.switchHistory.length > 50) {
        this.switchHistory = this.switchHistory.slice(-50);
      }

      const result: ProjectSwitchResult = {
        success: true,
        projectId: projectInfo.id,
        projectName: projectInfo.name,
        projectPath: projectInfo.path,
        previousProject: currentProject.id,
        switchedAt: new Date()?.toISOString,
        initializationTime: duration,
      };

      logger.info('Project switch completed successfully', {
        projectId: result.projectId,
        duration: `${duration}ms`,
        previousProject: result.previousProject,
      });

      this.emit('switchCompleted', result);

      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.lastError = errorMessage;

      logger.error('Project switch failed', {
        error: errorMessage,
        projectId: request.projectId,
        projectPath: request.projectPath,
      });

      // Record failed switch
      const currentProject = getCurrentProject();
      this.switchHistory.push({
        from: currentProject.id,
        to: request.projectId || 'unknown',
        timestamp: new Date()?.toISOString,
        duration: Date.now() - startTime,
        success: false,
      });

      this.emit('switchFailed', { error: errorMessage, request });

      throw error;
    } finally {
      this.isSwitching = false;
    }
  }

  /**
   * Get current switcher status
   */
  getStatus(): ProjectSwitcherStatus {
    const currentProject = getCurrentProject();

    return {
      status: this.lastError
        ? 'error'
        : this.isSwitching
          ? 'switching'
          : 'idle',
      isSwitching: this.isSwitching,
      currentProject: currentProject.id,
      lastSwitch: this.lastSwitch?.toISOString,
      lastError: this.lastError,
    };
  }

  /**
   * Get switch history
   */
  getSwitchHistory(): Array<{
    from: string;
    to: string;
    timestamp: string;
    duration: number;
    success: boolean;
  }> {
    return [...this.switchHistory];
  }

  /**
   * Cancel current switch operation (if possible)
   */
  async cancelSwitch(): Promise<void> {
    if (!this.isSwitching) {
      throw new Error('No switch operation in progress');
    }

    logger.warn('Attempting to cancel project switch');

    // This is a hard operation to cancel safely
    // For now, we just emit the cancellation event
    this.emit('switchCancelled', {});

    throw new Error(
      'Switch cancellation not yet implemented - operation will continue'
    );
  }

  /**
   * Resolve project information from request
   */
  private async resolveProjectInfo(request: ProjectSwitchRequest): Promise<{
    id: string;
    name: string;
    path: string;
  }> {
    if (request.projectId) {
      // Look up project by ID in registry
      const projects = getRegisteredProjects();
      const project = projects.find((p) => p.id === request.projectId);

      if (!project) {
        throw new Error(
          `Project with ID '${request.projectId}' not found in registry`
        );
      }

      // Verify project path still exists
      if (!fs.existsSync(project.path)) {
        throw new Error(`Project path '${project.path}' no longer exists`);
      }

      return {
        id: project.id,
        name: project.name,
        path: project.path,
      };
    } else if (request.projectPath) {
      // Use provided path directly
      const absolutePath = path.resolve(request.projectPath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Project path '${absolutePath}' does not exist`);
      }

      // Generate project info for new path
      const projectName = path.basename(absolutePath);

      return {
        id: 'new-project', // This will be updated when project is registered
        name: projectName,
        path: absolutePath,
      };
    } else {
      throw new Error('Either projectId or projectPath must be provided');
    }
  }

  /**
   * Graceful shutdown of current coordination system
   */
  private async gracefulShutdown(timeout: number): Promise<void> {
    const shutdownPromise = shutdownClaudeZen();

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Shutdown timeout after ${timeout}ms`));
      }, timeout);
    });

    try {
      // Race between shutdown and timeout
      await Promise.race([shutdownPromise, timeoutPromise]);
      logger.info('Graceful shutdown completed');
    } catch (error) {
      if ((error as Error).message.includes('timeout')) {
        logger.warn('Graceful shutdown timed out, forcing shutdown');
        // Force cleanup of global references
        delete (global as any).swarmCoordinator;
        delete (global as any).memorySystem;
      } else {
        throw error;
      }
    }
  }

  /**
   * Switch project context (working directory)
   */
  private async switchProjectContext(projectPath: string): Promise<void> {
    const absolutePath = path.resolve(projectPath);

    try {
      process.chdir(absolutePath);
      logger.info('Working directory changed', {
        newPath: absolutePath,
        cwd: process?.cwd,
      });
    } catch (error) {
      throw new Error(
        `Failed to switch to project directory '${absolutePath}': ${(error as Error).message}`
      );
    }
  }
}

/**
 * Global project switcher instance
 */
let globalProjectSwitcher: ProjectSwitcher | null = null;

/**
 * Get the global project switcher instance
 */
export function getProjectSwitcher(): ProjectSwitcher {
  if (!globalProjectSwitcher) {
    globalProjectSwitcher = new ProjectSwitcher();
  }
  return globalProjectSwitcher;
}

/**
 * Export types for use in other modules
 */
export type {
  ProjectSwitchRequest,
  ProjectSwitchResult,
  ProjectSwitcherStatus,
};
