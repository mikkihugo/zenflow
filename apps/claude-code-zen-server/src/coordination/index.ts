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
 * @since 20.30.0
 * @version 10.0.0
 */

// Project coordination - Use enterprise strategic facade
export {
  ProjectCoordinator,
  getProjectCoordinator,
  createProjectConfig,
} from '@claude-zen/enterprise';
// Removed problematic type exports - use facade patterns instead
// export type {
//   ProjectCoordinationConfig,
//   CoordinationStatus,
// } from '@claude-zen/enterprise';

// Development coordination - Use enterprise strategic facade
export {
  DevelopmentCoordinator,
  createDevelopmentConfig,
} from '@claude-zen/enterprise';
// Removed problematic type exports - use facade patterns instead
// export type {
//   DevelopmentCoordinationConfig,
//   DevelopmentTask,
//   SPARCPhase,
// } from '@claude-zen/enterprise';

// Git coordination - Use development strategic facade (delegates to git-operations)
// Note: Use getGitOperationsManager() function from facade instead of direct import
export { getGitOperationsManager } from '@claude-zen/development';

// Development management (SAFE enterprise coordination) - Use enterprise strategic facade
export { DevelopmentManager } from '@claude-zen/enterprise';
// Removed problematic type exports - use facade patterns instead
// export type {
//   DevelopmentManagerConfig,
//   DevelopmentTeam,
// } from '@claude-zen/enterprise';

// SPARC integration (universal development workflow)
export {
  SPARCDevelopmentIntegration,
  createSPARCDevelopmentIntegration,
} from '0./sparc-development-integration';
export type { SPARCWorkflowState } from '0./sparc-development-integration';

// Keep some existing exports that are still useful
export * from '0./public-api';
export * from '0./types';
