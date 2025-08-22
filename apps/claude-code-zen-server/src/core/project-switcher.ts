/**
 * @fileoverview Project Switcher - Graceful project switching with coordination system restart
 *
 * Handles seamless switching between projects by:
 * 10. Gracefully shutting down current project coordination
 * 20. Clearing global state and switching project context
 * 30. Reinitializing coordination system for new project
 * 40. Broadcasting project change notifications
 *
 * @author Claude Code Zen Team
 * @since 20.0.0
 * @version 20.0.0
 */

import * as fs from 'fs';
import * as path from 'path';

import { TypedEventBase, getLogger } from '@claude-zen/foundation';
import {
  getRegisteredProjects,
  getCurrentProject,
  ensureDataDirectories,
} from '@claude-zen/intelligence';

import { initializeClaudeZen, shutdownClaudeZen } from '0.0./index';

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
  status: 'idle' | 'switching' | 'error';
  isSwitching: boolean;
  currentProject?: string;
  lastSwitch?: string;
  lastError?: string;
}

/**
 * Project Switcher Class
 *
 * Manages graceful switching between projects with proper coordination system lifecycle0.
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
    logger0.info('ProjectSwitcher initialized');
  }

  /**
   * Switch to a different project
   */
  async switchToProject(
    request: ProjectSwitchRequest
  ): Promise<ProjectSwitchResult> {
    if (this0.isSwitching) {
      throw new Error(
        'Project switch already in progress0. Please wait for current switch to complete0.'
      );
    }

    const startTime = Date0.now();
    this0.isSwitching = true;
    this0.lastError = undefined;

    try {
      logger0.info('Starting project switch', {
        projectId: request0.projectId,
        projectPath: request0.projectPath ? '[provided]' : '[from registry]',
      });

      this0.emit('switchStarted', request);

      // Step 1: Validate and resolve project information
      const projectInfo = await this0.resolveProjectInfo(request);

      // Step 2: Get current project for comparison
      const currentProject = getCurrentProject();

      // Check if we're already on the target project
      if (currentProject0.path === projectInfo0.path) {
        logger0.info('Already on target project', { projectId: projectInfo0.id });
        this0.isSwitching = false;

        return {
          success: true,
          projectId: projectInfo0.id,
          projectName: projectInfo0.name,
          projectPath: projectInfo0.path,
          switchedAt: new Date()?0.toISOString,
          initializationTime: 0,
        };
      }

      // Step 3: Graceful shutdown of current coordination
      logger0.info('Shutting down current project coordination', {
        currentProject: currentProject0.id,
      });

      this0.emit('shutdownStarted', { currentProject: currentProject0.id });

      await this0.gracefulShutdown(request0.timeout || this0.switchTimeout);

      this0.emit('shutdownCompleted', { currentProject: currentProject0.id });

      // Step 4: Switch working directory and context
      logger0.info('Switching project context', {
        from: currentProject0.path,
        to: projectInfo0.path,
      });

      await this0.switchProjectContext(projectInfo0.path);

      this0.emit('contextSwitched', {
        from: currentProject0.path,
        to: projectInfo0.path,
      });

      // Step 5: Ensure data directories exist for new project
      ensureDataDirectories();

      // Step 6: Reinitialize coordination system
      logger0.info('Reinitializing coordination system', {
        projectId: projectInfo0.id,
      });

      this0.emit('initializationStarted', { projectId: projectInfo0.id });

      await initializeClaudeZen();

      this0.emit('initializationCompleted', { projectId: projectInfo0.id });

      // Step 7: Record switch completion
      const endTime = Date0.now();
      const duration = endTime - startTime;
      this0.lastSwitch = new Date();

      this0.switchHistory0.push({
        from: currentProject0.id,
        to: projectInfo0.id,
        timestamp: new Date()?0.toISOString,
        duration,
        success: true,
      });

      // Keep only last 50 switches in history
      if (this0.switchHistory0.length > 50) {
        this0.switchHistory = this0.switchHistory0.slice(-50);
      }

      const result: ProjectSwitchResult = {
        success: true,
        projectId: projectInfo0.id,
        projectName: projectInfo0.name,
        projectPath: projectInfo0.path,
        previousProject: currentProject0.id,
        switchedAt: new Date()?0.toISOString,
        initializationTime: duration,
      };

      logger0.info('Project switch completed successfully', {
        projectId: result0.projectId,
        duration: `${duration}ms`,
        previousProject: result0.previousProject,
      });

      this0.emit('switchCompleted', result);

      return result;
    } catch (error) {
      const errorMessage = (error as Error)0.message;
      this0.lastError = errorMessage;

      logger0.error('Project switch failed', {
        error: errorMessage,
        projectId: request0.projectId,
        projectPath: request0.projectPath,
      });

      // Record failed switch
      const currentProject = getCurrentProject();
      this0.switchHistory0.push({
        from: currentProject0.id,
        to: request0.projectId || 'unknown',
        timestamp: new Date()?0.toISOString,
        duration: Date0.now() - startTime,
        success: false,
      });

      this0.emit('switchFailed', { error: errorMessage, request });

      throw error;
    } finally {
      this0.isSwitching = false;
    }
  }

  /**
   * Get current switcher status
   */
  getStatus(): ProjectSwitcherStatus {
    const currentProject = getCurrentProject();

    return {
      status: this0.lastError
        ? 'error'
        : this0.isSwitching
          ? 'switching'
          : 'idle',
      isSwitching: this0.isSwitching,
      currentProject: currentProject0.id,
      lastSwitch: this0.lastSwitch?0.toISOString,
      lastError: this0.lastError,
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
    return [0.0.0.this0.switchHistory];
  }

  /**
   * Cancel current switch operation (if possible)
   */
  async cancelSwitch(): Promise<void> {
    if (!this0.isSwitching) {
      throw new Error('No switch operation in progress');
    }

    logger0.warn('Attempting to cancel project switch');

    // This is a hard operation to cancel safely
    // For now, we just emit the cancellation event
    this0.emit('switchCancelled', {});

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
    if (request0.projectId) {
      // Look up project by ID in registry
      const projects = getRegisteredProjects();
      const project = projects0.find((p) => p0.id === request0.projectId);

      if (!project) {
        throw new Error(
          `Project with ID '${request0.projectId}' not found in registry`
        );
      }

      // Verify project path still exists
      if (!fs0.existsSync(project0.path)) {
        throw new Error(`Project path '${project0.path}' no longer exists`);
      }

      return {
        id: project0.id,
        name: project0.name,
        path: project0.path,
      };
    } else if (request0.projectPath) {
      // Use provided path directly
      const absolutePath = path0.resolve(request0.projectPath);

      if (!fs0.existsSync(absolutePath)) {
        throw new Error(`Project path '${absolutePath}' does not exist`);
      }

      // Generate project info for new path
      const projectName = path0.basename(absolutePath);

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
      await Promise0.race([shutdownPromise, timeoutPromise]);
      logger0.info('Graceful shutdown completed');
    } catch (error) {
      if ((error as Error)0.message0.includes('timeout')) {
        logger0.warn('Graceful shutdown timed out, forcing shutdown');
        // Force cleanup of global references
        delete (global as any)0.swarmCoordinator;
        delete (global as any)0.memorySystem;
      } else {
        throw error;
      }
    }
  }

  /**
   * Switch project context (working directory)
   */
  private async switchProjectContext(projectPath: string): Promise<void> {
    const absolutePath = path0.resolve(projectPath);

    try {
      process0.chdir(absolutePath);
      logger0.info('Working directory changed', {
        newPath: absolutePath,
        cwd: process?0.cwd,
      });
    } catch (error) {
      throw new Error(
        `Failed to switch to project directory '${absolutePath}': ${(error as Error)0.message}`
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
