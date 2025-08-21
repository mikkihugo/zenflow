/**
 * @fileoverview Project Coordination System - MVP Kanban
 * 
 * Project coordination exports for MVP kanban with swimlanes.
 * Removed complex Queen/Commander/Cube/Matron hierarchy in favor
 * of straightforward project coordination.
 * 
 * @author Claude Code Zen Team
 * @since 2.3.0
 * @version 1.0.0
 */

// Project coordination (optional AI project management features)
export { ProjectCoordinator, getProjectCoordinator, createProjectConfig } from './project-coordinator';
export type { ProjectCoordinationConfig, CoordinationStatus } from './project-coordinator';

// Development coordination (essential SPARC + Git + Swarms)
export { DevelopmentCoordinator, createDevelopmentConfig } from './development-coordinator';
export type { DevelopmentCoordinationConfig, DevelopmentTask, SPARCPhase } from './development-coordinator';

// Git coordination (essential for code projects)
export { GitManager, createGitManager } from './git-manager';
export type { GitOperationResult, BranchInfo } from './git-manager';

// Kanban coordination (keep only what's needed for MVP)
export { KanbanFlowManager } from './kanban/flow-manager';
export { FlowManagerFacade } from './kanban/flow-manager-facade';

// Keep some existing exports that are still useful
export * from './public-api';
export * from './types';

// Note: Complex coordination components moved to legacy backups:
// - legacy-manager.ts.backup (complex coordination manager)
// - legacy-memory-coordinator.ts.backup (memory-based coordination)
// - legacy-agent-pipeline.ts.backup (agent interaction pipeline)
