/**
 * @fileoverview Unified Coordination Package
 *
 * Consolidated coordination functionality eliminating overlaps between:
 * - SPARC methodology
 * - SAFe framework
 * - Workflow engines
 * - Task orchestration
 * - Multi-agent teamwork
 *
 * Domain-based organization for clean separation of concerns.
 */
export * from './sparc';
export * as sparc from './sparc';
export * from './safe';
export * as safe from './safe';
export * from './workflows';
export * as workflows from './workflows';
export * from './orchestration';
export * as orchestration from './orchestration';
export * from './teamwork';
export * as teamwork from './teamwork';
export * from './agui';
export * as agui from './agui';
export interface CoordinationSystem {
    sparc: typeof import('./sparc');
    safe: typeof import('./safe');
    workflows: typeof import('./workflows');
    orchestration: typeof import('./orchestration');
    teamwork: typeof import('./teamwork');
    agui: typeof import('./agui');
}
/**
 * Create unified coordination system with all methodologies
 */
export declare function createCoordinationSystem(): Promise<CoordinationSystem>;
export declare const COORDINATION_PACKAGE_INFO: {
    name: string;
    version: string;
    description: string;
    domains: string[];
    benefits: string[];
};
//# sourceMappingURL=index.d.ts.map