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
import { EventEmitter } from '@claude-zen/foundation';
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
 * Manages graceful switching between projects with proper coordination system lifecycle.
 */
export declare class ProjectSwitcher extends EventEmitter {
    private isSwitching;
    private switchTimeout;
    private lastSwitch?;
    private lastError?;
    private switchHistory;
    constructor();
    /**
     * Switch to a different project
     */
    switchToProject(request: ProjectSwitchRequest): Promise<ProjectSwitchResult>;
    /**
     * Get current switcher status
     */
    getStatus(): ProjectSwitcherStatus;
    /**
     * Get switch history
     */
    getSwitchHistory(): Array<{
        from: string;
        to: string;
        timestamp: string;
        duration: number;
        success: boolean;
    }>;
    /**
     * Cancel current switch operation (if possible)
     */
    cancelSwitch(): void;
    /**
     * Resolve project information from request
     */
    private resolveProjectInfo;
    /**
     * Check if already on target project
     */
    private checkIfAlreadyOnTarget;
    /**
     * Perform the actual project switch
     */
    private performProjectSwitch;
    /**
     * Create switch result object
     */
    private createSwitchResult;
    /**
     * Record successful switch in history
     */
    private recordSuccessfulSwitch;
    /**
     * Handle switch error
     */
    private handleSwitchError;
    /**
     * Graceful shutdown of current coordination system
     */
    private gracefulShutdown;
    /**
     * Switch project context (working directory)
     */
    private switchProjectContext;
}
/**
 * Get the global project switcher instance
 */
export declare function getProjectSwitcher(): ProjectSwitcher;
/**
 * Export types for use in other modules (already exported as interfaces above)
 */
//# sourceMappingURL=project-switcher.d.ts.map