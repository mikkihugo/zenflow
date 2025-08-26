/**
 * @fileoverview Enterprise Coordination Implementation
 *
 * Production-ready coordination systems for enterprise development:
 * - DevelopmentCoordinator: SPARC workflow integration
 * - ProjectCoordinator: SAFe LPM project management
 * - DevelopmentManager: SAFE ART and team coordination
 *
 * This is the real implementation package that enterprise facade delegates to.
 */

// Export all coordination systems
export {
	createDevelopmentConfig,
	DevelopmentCoordinator,
} from "./development-coordinator";
export {
	createProjectConfig,
	getProjectCoordinator,
	ProjectCoordinator,
} from "./project-coordinator";
// NOTE: DevelopmentManager moved to @claude-zen/sparc package for SAFe 6.0 flow-based development

// Export all types
export type {
	CoordinationStatus,
	DevelopmentCoordinationConfig,
	DevelopmentTask,
} from "./development-coordinator";
export type { ProjectCoordinationConfig } from "./project-coordinator";
// NOTE: DevelopmentManager types moved to @claude-zen/sparc package for SAFe 6.0 flow-based development
