/**
 * @fileoverview Unified Coordination Package
 *
 * Consolidated coordination functionality eliminating overlaps between: * - SPARC methodology
 * - SAFe framework
 * - Workflow engines
 * - Task orchestration
 * - Multi-agent teamwork
 *
 * Domain-based organization for clean separation of concerns.
 */
export * from './dspy/event-driven-dspy';
export * as eventDrivenDSPy from './dspy/event-driven-dspy';
export * from './teamwork';
export * as teamwork from './teamwork';
export interface CoordinationSystem {
  teamwork: typeof import('./teamwork');
  dspy: typeof import('./dspy/event-driven-dspy');
}
/**
 * Create a unified coordination system by loading all domains
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
