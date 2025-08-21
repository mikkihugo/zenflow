/**
 * @fileoverview Project Coordinator - MVP Kanban Support
 * 
 * Project coordination system for MVP kanban with swimlanes.
 * Replaces the complex Queen/Commander/Cube/Matron hierarchy with 
 * straightforward project-focused coordination.
 * 
 * @author Claude Code Zen Team
 * @since 2.3.0
 * @version 1.0.0
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config';
import type { Logger } from '@claude-zen/foundation';

/**
 * Project coordination configuration for MVP kanban
 */
export interface ProjectCoordinationConfig {
  projectId: string;
  mode: 'kanban' | 'agile' | 'safe';
  enableAI?: boolean;
  features: {
    swimlanes?: boolean;
    timeTracking?: boolean;
    notifications?: boolean;
    flowMetrics?: boolean;
  };
}

/**
 * Project coordination status
 */
export interface CoordinationStatus {
  projectId: string;
  mode: string;
  activeFeatures: string[];
  tasksInProgress: number;
  lastActivity: Date;
}

/**
 * Project Coordinator
 * 
 * Handles project coordination for MVP kanban functionality.
 * No complex hierarchy - just practical project management.
 */
export class ProjectCoordinator extends EventEmitter {
  private logger: Logger;
  private projects = new Map<string, ProjectCoordinationConfig>();
  private initialized = false;

  constructor() {
    super();
    this.logger = getLogger('ProjectCoordinator');
  }

  /**
   * Initialize the coordinator
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.logger.info('Initializing project coordinator for MVP kanban');
    this.initialized = true;
    
    this.emit('coordinator:initialized');
  }

  /**
   * Register a project for coordination
   */
  async registerProject(config: ProjectCoordinationConfig): Promise<void> {
    if (!this.initialized) await this.initialize();

    this.projects.set(config.projectId, config);
    
    this.logger.info(`Project registered: ${config.projectId} (${config.mode})`);
    this.emit('project:registered', { projectId: config.projectId, config });
  }

  /**
   * Update project configuration
   */
  async updateProject(projectId: string, updates: Partial<ProjectCoordinationConfig>): Promise<void> {
    const existing = this.projects.get(projectId);
    if (!existing) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const updated = { ...existing, ...updates };
    this.projects.set(projectId, updated);

    this.logger.info(`Project updated: ${projectId}`);
    this.emit('project:updated', { projectId, config: updated });
  }

  /**
   * Get project coordination status
   */
  getProjectStatus(projectId: string): CoordinationStatus | null {
    const config = this.projects.get(projectId);
    if (!config) return null;

    const activeFeatures = Object.entries(config.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => feature);

    return {
      projectId,
      mode: config.mode,
      activeFeatures,
      tasksInProgress: 0, // TODO: Connect to actual task tracking
      lastActivity: new Date()
    };
  }

  /**
   * Handle kanban story events
   */
  async handleStoryEvent(projectId: string, eventType: string, data: any): Promise<void> {
    const config = this.projects.get(projectId);
    if (!config) return;

    this.logger.debug(`Story event: ${eventType} for project ${projectId}`);

    // Direct event handling - no complex routing
    switch (eventType) {
      case 'story:created':
        this.emit('story:created', { projectId, story: data });
        break;
      case 'story:moved':
        this.emit('story:moved', { projectId, story: data });
        break;
      case 'story:updated':
        this.emit('story:updated', { projectId, story: data });
        break;
      default:
        this.logger.debug(`Unknown story event: ${eventType}`);
    }
  }

  /**
   * Get all registered projects
   */
  getProjects(): string[] {
    return Array.from(this.projects.keys());
  }

  /**
   * Remove project coordination
   */
  async unregisterProject(projectId: string): Promise<void> {
    const removed = this.projects.delete(projectId);
    if (removed) {
      this.logger.info(`Project unregistered: ${projectId}`);
      this.emit('project:unregistered', { projectId });
    }
  }

  /**
   * Shutdown coordinator
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down project coordinator');
    this.projects.clear();
    this.removeAllListeners();
    this.initialized = false;
  }
}

// Global instance
let globalCoordinator: ProjectCoordinator | null = null;

/**
 * Get global project coordinator instance
 */
export function getProjectCoordinator(): ProjectCoordinator {
  if (!globalCoordinator) {
    globalCoordinator = new ProjectCoordinator();
  }
  return globalCoordinator;
}

/**
 * Factory function for creating project coordination config
 */
export function createProjectConfig(
  projectId: string,
  mode: 'kanban' | 'agile' | 'safe' = 'kanban',
  features: Partial<ProjectCoordinationConfig['features']> = {}
): ProjectCoordinationConfig {
  return {
    projectId,
    mode,
    enableAI: false, // Default off for MVP
    features: {
      swimlanes: false,
      timeTracking: false,
      notifications: false,
      flowMetrics: false,
      ...features
    }
  };
}