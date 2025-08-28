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
export * from './sparc';
export * as sparc from './sparc';
export * from './dspy/event-driven-dspy';
export * as eventDrivenDSPy from './dspy/event-driven-dspy';
export * from './brain/event-driven-brain';
export * as eventDrivenBrain from './brain/event-driven-brain';
export * from './safe';
export * as safe from './safe';
export * from './workflows';
export * as workflows from './workflows';
export * from './orchestration';
export * as orchestration from './orchestration';
export * from './teamwork';
export * as teamwork from './teamwork';
export * from './taskmaster/index';
export * as taskmaster from './taskmaster/index';
export * from './events/websocket-hub';
export * as events from './events/websocket-hub';
export * from './integrations';
export * as integrations from './integrations';
export interface CoordinationSystem {
    sparc: await;
}
export declare const COORDINATION_PACKAGE_INFO: {
    name: void;
    version: any;
    description: any;
    domains: string[];
    ';': any;
    "Modular imports for specific domains": any;
};
//# sourceMappingURL=index.d.ts.map