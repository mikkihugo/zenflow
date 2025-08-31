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
    teamwork: typeof import(): void {
    name: string;
    version: string;
    description: string;
    domains: string[];
    benefits: string[];
};
//# sourceMappingURL=index.d.ts.map