/**
 * @fileoverview Architecture Runway Manager - Comprehensive SAFe architecture management.
 *
 * Lightweight facade for architecture runway management that delegates to specialized services
 * for runway item management, technical debt tracking, architecture decisions, and capability management.
 *
 * Delegates to:
 * - RunwayItemManagementService for architecture runway items and backlog management
 * - TechnicalDebtManagementService for technical debt tracking and remediation
 * - ArchitectureDecisionManagementService for architecture decision records (ADRs)
 * - CapabilityManagementService for architecture capability tracking and development
 *
 * REDUCTION: 650 → 630 lines (3.1% reduction) through service delegation and code cleanup
 *
 * Part of the @claude-zen/safe-framework package providing comprehensive
 * Scaled Agile Framework (SAFe) integration capabilities.
 */
import { EventBus } from '@claude-zen/foundation';
import type { MemorySystem, TypeSafeEventBus } from '../types';
/**
 * Architecture Runway Manager configuration
 */
export interface ArchitectureRunwayConfig {
    readonly enableAGUIIntegration: boolean;
    readonly enableAutomatedTracking: boolean;
    readonly enableTechnicalDebtManagement: boolean;
    readonly enableArchitectureGovernance: boolean;
    readonly enableRunwayPlanning: boolean;
    readonly enableCapabilityTracking: boolean;
    readonly maxRunwayItems: number;
    readonly runwayPlanningHorizon: number;
    readonly technicalDebtThreshold: number;
    readonly governanceApprovalThreshold: number;
}
/**
 * Architecture Runway Item
 */
export interface ArchitectureRunwayItem {
    id: string;
    title: string;
    description: string;
    type: 'infrastructure|platform|enabler|technical-debt;;
    priority: 'critical|high|medium|low;;
    effort: number;
    dependencies: string[];
    status: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin';
}
/**
 * Technical Debt Item
 */
export interface TechnicalDebtItem {
    id: string;
    title: string;
    description: string;
    severity: 'critical|high|medium|low;;
    impact: string;
    effort: number;
    component: string;
    status: 'identified|approved|planned|in-progress||resolved;;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Architecture Decision Record
 */
export interface ArchitectureDecisionRecord {
    id: string;
    title: string;
    status: 'proposed|accepted|deprecated|superseded;;
    context: string;
    decision: string;
    consequences: string[];
    alternatives: string[];
    createdAt: Date;
    updatedAt: Date;
    author: string;
    stakeholders: string[];
}
/**
 * Architecture Capability
 */
export interface ArchitectureCapability {
    id: string;
    name: string;
    description: string;
    category: 'business' | 'technology' | 'process';
    maturityLevel: number;
    status: 'developing|active|retiring|deprecated;;
    enablers: string[];
    dependencies: string[];
    kpis: CapabilityKPI[];
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Capability KPI
 */
export interface CapabilityKPI {
    id: string;
    name: string;
    description: string;
    metric: string;
    target: number;
    current: number;
    unit: string;
    trend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | declining;
}
/**
 * Architecture Runway Manager - Comprehensive SAFe architecture management.
 *
 * Lightweight facade that delegates to specialized services for architecture runway management,
 * technical debt tracking, architecture decisions, and capability management.
 *
 * @example Basic usage
 * ```typescript`
 * const runwayManager = new ArchitectureRunwayManager(memory, eventBus, config);
 * await runwayManager.initialize();
 *
 * const item = await runwayManager.addRunwayItem({
 *   title: 'API Gateway Implementation',
 *   type: 'infrastructure',
 *   priority: 'high',
 *   effort: 13
 * });
 * ````
 */
export declare class ArchitectureRunwayManager extends EventBus {
    private logger;
    private eventBus;
    private config;
    private runwayItemService?;
    private technicalDebtService?;
    private architectureDecisionService?;
    private capabilityService?;
    private initialized;
    constructor(_memory: MemorySystem, eventBus: TypeSafeEventBus, config?: Partial<ArchitectureRunwayConfig>);
    /**
     * Initialize with service delegation - LAZY LOADING
     */
    initialize(): Promise<void>;
    /**
     * Add Runway Item - Delegates to RunwayItemManagementService
     */
    addRunwayItem(item: Omit<ArchitectureRunwayItem, 'id|createdAt|updatedAt|status'>, : any): any;
}
export default ArchitectureRunwayManager;
//# sourceMappingURL=architecture-runway-manager.d.ts.map