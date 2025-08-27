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
 * @since 2.0.0
 * @version 2.0.0
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EventEmitter, getLogger } from '@claude-zen/foundation';
// Fallback functions for missing intelligence facade exports
const ensureDataDirectories = (projectPath) => {
    // Stub implementation - would ensure data directories exist
    if (!fs.existsSync(path.join(projectPath, '.claude-zen'))) {
        fs.mkdirSync(path.join(projectPath, '.claude-zen'), { recursive: true });
    }
};
const getCurrentProject = () => {
    // Stub implementation - would get current project from memory
    const projectPath = process.env.CLAUDE_ZEN_PROJECT || process.cwd();
    const projectName = path.basename(projectPath);
    return {
        id: projectName,
        path: projectPath,
        name: projectName
    };
};
const getRegisteredProjects = () => 
// Stub implementation - would get registered projects from memory
[];
import { initializeClaudeZen, shutdownClaudeZen } from './index';
const logger = getLogger('ProjectSwitcher');
/**
 * Project Switcher Class
 *
 * Manages graceful switching between projects with proper coordination system lifecycle.
 */
export class ProjectSwitcher extends EventEmitter {
    isSwitching = false;
    switchTimeout = 30000; // 30 seconds default timeout
    lastSwitch;
    lastError;
    switchHistory = [];
    constructor() {
        super();
        logger.info('ProjectSwitcher initialized');
    }
    /**
     * Switch to a different project
     */
    async switchToProject(request) {
        if (this.isSwitching) {
            throw new Error('Project switch already in progress. Please wait for current switch to complete.');
        }
        const startTime = Date.now();
        this.isSwitching = true;
        this.lastError = undefined;
        try {
            this.emit('switchStarted', request);
            const projectInfo = this.resolveProjectInfo(request);
            const currentProject = getCurrentProject();
            if (!currentProject) {
                throw new Error('Unable to determine current project');
            }
            const alreadyOnTarget = this.checkIfAlreadyOnTarget(currentProject, projectInfo);
            if (alreadyOnTarget) {
                return alreadyOnTarget;
            }
            await this.performProjectSwitch(request, currentProject, projectInfo);
            const result = this.createSwitchResult(currentProject, projectInfo, startTime);
            this.recordSuccessfulSwitch(currentProject.id, projectInfo.id, startTime);
            logger.info('Project switch completed successfully', {
                projectId: result.projectId,
                duration: `${Date.now() - startTime}ms`,
                previousProject: result.previousProject,
            });
            this.emit('switchCompleted', result);
            return result;
        }
        catch (error) {
            this.handleSwitchError(error, request, startTime);
            throw error;
        }
        finally {
            this.isSwitching = false;
        }
    }
    /**
     * Get current switcher status
     */
    getStatus() {
        const currentProject = getCurrentProject();
        return {
            status: this.lastError
                ? 'error'
                : this.isSwitching
                    ? 'switching'
                    : 'idle',
            isSwitching: this.isSwitching,
            currentProject: currentProject?.id || 'unknown',
            lastSwitch: this.lastSwitch?.toISOString(),
            lastError: this.lastError,
        };
    }
    /**
     * Get switch history
     */
    getSwitchHistory() {
        return [...this.switchHistory];
    }
    /**
     * Cancel current switch operation (if possible)
     */
    cancelSwitch() {
        if (!this.isSwitching) {
            throw new Error('No switch operation in progress');
        }
        logger.warn('Attempting to cancel project switch');
        // This is a hard operation to cancel safely
        // For now, we just emit the cancellation event
        this.emit('switchCancelled', {});
        throw new Error('Switch cancellation not yet implemented - operation will continue');
    }
    /**
     * Resolve project information from request
     */
    resolveProjectInfo(request) {
        if (request.projectId) {
            // Look up project by ID in registry
            const projects = getRegisteredProjects();
            const project = projects.find((p) => p.id === request.projectId);
            if (!project) {
                throw new Error(`Project with ID ${request.projectId} not found in registry`);
            }
            // Verify project path still exists
            if (!fs.existsSync(project.path)) {
                throw new Error(`Project path ${project.path} no longer exists`);
            }
            return {
                id: project.id,
                name: project.name,
                path: project.path,
            };
        }
        else if (request.projectPath) {
            // Use provided path directly
            const absolutePath = path.resolve(request.projectPath);
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`Project path ${absolutePath} does not exist`);
            }
            // Generate project info for new path
            const projectName = path.basename(absolutePath);
            return {
                id: 'new-project', // This will be updated when project is registered
                name: projectName,
                path: absolutePath,
            };
        }
        else {
            throw new Error('Either projectId or projectPath must be provided');
        }
    }
    /**
     * Check if already on target project
     */
    checkIfAlreadyOnTarget(currentProject, projectInfo) {
        if (currentProject.path !== projectInfo.path) {
            return null;
        }
        logger.info('Already on target project', {
            projectId: projectInfo.id,
        });
        this.isSwitching = false;
        return {
            success: true,
            projectId: projectInfo.id,
            projectName: projectInfo.name,
            projectPath: projectInfo.path,
            switchedAt: new Date().toISOString(),
            initializationTime: 0,
        };
    }
    /**
     * Perform the actual project switch
     */
    async performProjectSwitch(request, currentProject, projectInfo) {
        logger.info('Starting project switch', {
            projectId: request.projectId,
            projectPath: request.projectPath ? '[provided]' : '[from registry]',
        });
        // Shutdown current coordination
        logger.info('Shutting down current project coordination', {
            currentProject: currentProject.id,
        });
        this.emit('shutdownStarted', { currentProject: currentProject.id });
        await this.gracefulShutdown(request.timeout || this.switchTimeout);
        this.emit('shutdownCompleted', { currentProject: currentProject.id });
        // Switch context
        logger.info('Switching project context', {
            from: currentProject.path,
            to: projectInfo.path,
        });
        this.switchProjectContext(projectInfo.path);
        this.emit('contextSwitched', {
            from: currentProject.path,
            to: projectInfo.path,
        });
        // Ensure directories and reinitialize
        ensureDataDirectories(projectInfo.path);
        logger.info('Reinitializing coordination system', {
            projectId: projectInfo.id,
        });
        this.emit('initializationStarted', { projectId: projectInfo.id });
        await initializeClaudeZen();
        this.emit('initializationCompleted', { projectId: projectInfo.id });
    }
    /**
     * Create switch result object
     */
    createSwitchResult(currentProject, projectInfo, startTime) {
        return {
            success: true,
            projectId: projectInfo.id,
            projectName: projectInfo.name,
            projectPath: projectInfo.path,
            previousProject: currentProject.id,
            switchedAt: new Date().toISOString(),
            initializationTime: Date.now() - startTime,
        };
    }
    /**
     * Record successful switch in history
     */
    recordSuccessfulSwitch(fromProjectId, toProjectId, startTime) {
        this.lastSwitch = new Date();
        this.switchHistory.push({
            from: fromProjectId,
            to: toProjectId,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            success: true,
        });
        // Keep only last 50 switches in history
        if (this.switchHistory.length > 50) {
            this.switchHistory = this.switchHistory.slice(-50);
        }
    }
    /**
     * Handle switch error
     */
    handleSwitchError(error, request, startTime) {
        const errorMessage = error.message;
        this.lastError = errorMessage;
        logger.error('Project switch failed', {
            error: errorMessage,
            projectId: request.projectId,
            projectPath: request.projectPath,
        });
        // Record failed switch
        const currentProject = getCurrentProject();
        this.switchHistory.push({
            from: currentProject?.id || 'unknown',
            to: request.projectId || 'unknown',
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            success: false,
        });
        this.emit('switchFailed', {
            error: errorMessage,
            request,
        });
    }
    /**
     * Graceful shutdown of current coordination system
     */
    async gracefulShutdown(timeout) {
        const shutdownPromise = shutdownClaudeZen();
        // Create timeout promise
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error(`Shutdown timeout after ${timeout}ms`));
            }, timeout);
        });
        try {
            // Race between shutdown and timeout
            await Promise.race([shutdownPromise, timeoutPromise]);
            logger.info('Graceful shutdown completed');
        }
        catch (error) {
            if (error.message.includes('timeout')) {
                logger.warn('Graceful shutdown timed out, forcing shutdown');
                // Force cleanup of global references
                delete global.swarmCoordinator;
                delete global.memorySystem;
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Switch project context (working directory)
     */
    switchProjectContext(projectPath) {
        const absolutePath = path.resolve(projectPath);
        try {
            process.chdir(absolutePath);
            logger.info('Working directory changed', {
                newPath: absolutePath,
                cwd: process.cwd(),
            });
        }
        catch (error) {
            throw new Error(`Failed to switch to project directory ${absolutePath}: ${error.message}`);
        }
    }
}
/**
 * Global project switcher instance
 */
let globalProjectSwitcher = null;
/**
 * Get the global project switcher instance
 */
export function getProjectSwitcher() {
    if (!globalProjectSwitcher) {
        globalProjectSwitcher = new ProjectSwitcher();
    }
    return globalProjectSwitcher;
}
/**
 * Export types for use in other modules (already exported as interfaces above)
 */
// export type {
//   ProjectSwitchRequest,
//   ProjectSwitchResult,
//   ProjectSwitcherStatus,
// };
