/**
 * @fileoverview Project Coordination System
 * 
 * Comprehensive coordination system exports including:
 * - Essential development coordination (SPARC + Git + Swarms)
 * - Optional project management features  
 * - Universal SPARC development integration
 * - Streamlined SAFe LPM workflow management
 * 
 * @author Claude Code Zen Team
 * @since 2.3.0
 * @version 1.0.0
 */

// Project coordination - Use enterprise strategic facade
export { ProjectCoordinator, getProjectCoordinator, createProjectConfig } from '@claude-zen/enterprise';
export type { ProjectCoordinationConfig, CoordinationStatus } from '@claude-zen/enterprise';

// Development coordination - Use enterprise strategic facade
export { DevelopmentCoordinator, createDevelopmentConfig } from '@claude-zen/enterprise';
export type { DevelopmentCoordinationConfig, DevelopmentTask, SPARCPhase } from '@claude-zen/enterprise';

// Git coordination - Use development strategic facade (delegates to git-operations)
export { GitOperationsManager } from '@claude-zen/development';
export type { GitOperationConfig, BranchStrategy, ConflictResolution, GitOperation } from '@claude-zen/development';

// Development management (SAFE enterprise coordination) - Use enterprise strategic facade
export { DevelopmentManager } from '@claude-zen/enterprise';
export type { DevelopmentManagerConfig, DevelopmentTeam } from '@claude-zen/enterprise';

// SPARC integration (universal development workflow)
export { SPARCDevelopmentIntegration, createSPARCDevelopmentIntegration } from './sparc-development-integration';
export type { SPARCWorkflowState } from './sparc-development-integration';

// Kanban coordination (keep only what's needed for MVP)
export { KanbanFlowManager } from './kanban/flow-manager';
export { FlowManagerFacade } from './kanban/flow-manager-facade';

// Keep some existing exports that are still useful
export * from './public-api';
export * from './types';
