/**
 * Product Workflow Engine - Proper Integration of Product Flow + SPARC Methodology.
 *
 * MISSION ACCOMPLISHED: Clean integration architecture where:
 * - **Product Flow = WHAT to build** (Vision→ADR→PRD→Epic→Feature→Task)
 * - **SPARC = HOW to implement** (Technical methodology applied WITHIN Features/Tasks).
 *
 * KEY INTEGRATION POINTS:
 * 1. Features contain sparc_implementation with all 5 phases
 * 2. Tasks have sparc_implementation_details linking to parent Feature SPARC
 * 3. Product Flow defines business requirements, SPARC provides technical implementation
 * 4. Workflow orchestrates both flows seamlessly.
 */
/**
 * @file Product-workflow processing engine.
 */
import { EventEmitter } from 'node:events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { ADRDocumentEntity, EpicDocumentEntity, FeatureDocumentEntity, PRDDocumentEntity, TaskDocumentEntity, VisionDocumentEntity } from '../../database/entities/product-entities.ts';
import type { DocumentManager } from '../../database/managers/document-manager.ts';
import { WorkflowAGUIAdapter, type WorkflowAGUIConfig } from '../../interfaces/agui/workflow-agui-adapter.ts';
import type { StepExecutionResult, WorkflowContext, WorkflowDefinition, WorkflowEngineConfig } from '../../workflows/types.ts';
import type { SPARCPhase, SPARCProject } from '../swarm/sparc/types/sparc-types.ts';
import type { WorkflowGateRequest, WorkflowGateResult } from '../workflows/workflow-gate-request.ts';
import type { WorkflowHumanGate } from './workflow-gates.ts';
type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
interface CompletedStepInfo {
    index: number;
    step: WorkflowStep;
    result: any;
    duration: number;
    timestamp: string;
}
interface WorkflowError {
    code: string;
    message: string;
    recoverable: boolean;
}
interface WorkflowExecutionOptions {
    dryRun?: boolean;
    timeout?: number;
    maxConcurrency?: number;
}
interface WorkflowMetrics {
    totalDuration: number;
    avgStepDuration: number;
    successRate: number;
    retryRate: number;
    resourceUsage: {
        cpuTime: number;
        memoryPeak: number;
        diskIo: number;
        networkRequests: number;
    };
    throughput: number;
}
type WorkflowStepResults = Record<string, StepExecutionResult | any>;
interface WorkflowStepState {
    step: WorkflowStep;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    attempts: number;
}
import type { WorkflowStep } from '../../workflows/types.ts';
/**
 * Product Flow Step Types (Business Flow).
 */
export type ProductFlowStep = 'vision-analysis' | 'prd-creation' | 'epic-breakdown' | 'feature-definition' | 'task-creation' | 'sparc-integration';
/**
 * Mutable workflow state interface for runtime modifications.
 *
 * @example
 */
export interface MutableWorkflowState {
    id: string;
    definition: WorkflowDefinition;
    status: WorkflowStatus;
    context: WorkflowContext;
    currentStepIndex: number;
    steps: readonly WorkflowStepState[];
    stepResults: WorkflowStepResults;
    completedSteps: readonly CompletedStepInfo[];
    startTime: Date;
    endTime?: Date;
    pausedAt?: Date;
    error?: WorkflowError;
    progress: {
        percentage: number;
        completedSteps: number;
        totalSteps: number;
        estimatedTimeRemaining?: number;
        currentStepName?: string;
    };
    metrics: WorkflowMetrics;
}
/**
 * Integrated Product Flow + SPARC Workflow State.
 *
 * @example
 */
export interface ProductWorkflowState extends MutableWorkflowState {
    productFlow: {
        currentStep: ProductFlowStep;
        completedSteps: ProductFlowStep[];
        documents: {
            vision?: VisionDocumentEntity;
            adrs: ADRDocumentEntity[];
            prds: PRDDocumentEntity[];
            epics: EpicDocumentEntity[];
            features: FeatureDocumentEntity[];
            tasks: TaskDocumentEntity[];
        };
    };
    sparcIntegration: {
        sparcProjects: Map<string, SPARCProject>;
        activePhases: Map<string, SPARCPhase>;
        completedPhases: Map<string, SPARCPhase[]>;
    };
}
/**
 * Product Workflow Configuration.
 *
 * @example
 */
export interface ProductWorkflowConfig extends WorkflowEngineConfig {
    enableSPARCIntegration: boolean;
    sparcDomainMapping: Record<string, string>;
    autoTriggerSPARC: boolean;
    sparcQualityGates: boolean;
    templatesPath?: string;
    outputPath?: string;
    enablePersistence?: boolean;
    maxConcurrentWorkflows?: number;
    storageBackend?: {
        type: string;
        config: any;
    };
}
/**
 * Product Workflow Engine - Main Orchestrator.
 *
 * Orchestrates the complete Product Flow (Vision→Task) with SPARC methodology.
 * Applied as the technical implementation tool WITHIN Features and Tasks..
 *
 * @example
 */
export declare class ProductWorkflowEngine extends EventEmitter {
    private memory;
    private documentService;
    private sparcEngine;
    private activeWorkflows;
    private workflowDefinitions;
    private stepHandlers;
    private config;
    private aguiAdapter;
    private pendingGates;
    private gateDefinitions;
    private eventBus;
    constructor(memory: MemorySystem, documentService: DocumentManager, eventBus: TypeSafeEventBus, aguiAdapter?: WorkflowAGUIAdapter, config?: Partial<ProductWorkflowConfig>);
    initialize(): Promise<void>;
    /**
     * Start a complete Product Flow workflow with optional SPARC integration.
     *
     * @param workflowName
     * @param context
     * @param options
     */
    startProductWorkflow(workflowName: string, context?: Partial<WorkflowContext>, options?: WorkflowExecutionOptions): Promise<{
        success: boolean;
        workflowId?: string;
        error?: string;
    }>;
    /**
     * Execute the complete Product Flow workflow with SPARC integration.
     *
     * @param workflow
     * @param options
     */
    private executeProductWorkflow;
    /**
     * Execute individual Product Flow steps.
     *
     * @param workflow
     * @param step
     */
    private executeProductFlowStep;
    /**
     * SPARC Integration: Create SPARC projects for features that need technical implementation.
     *
     * @param workflow
     */
    private integrateSPARCForFeatures;
    /**
     * Determine if a feature should use SPARC methodology.
     *
     * @param feature
     */
    private shouldApplySPARCToFeature;
    /**
     * Create SPARC project for a feature.
     *
     * @param workflow
     * @param feature
     */
    private createSPARCProjectForFeature;
    /**
     * Execute SPARC phases for all integrated features.
     *
     * @param workflow
     */
    private executeSPARCPhases;
    /**
     * Update feature document with SPARC progress.
     *
     * @param featureId
     * @param completedPhase
     * @param _result
     */
    private updateFeatureSPARCProgress;
    /**
     * Map feature type to SPARC domain.
     *
     * @param featureType
     */
    private mapFeatureTypeToSPARCDomain;
    /**
     * Assess feature complexity for SPARC.
     *
     * @param feature
     */
    private assessFeatureComplexity;
    private executeVisionAnalysis;
    private createPRDsFromVision;
    private breakdownPRDsToEpics;
    private defineFeatures;
    private createTasksFromFeatures;
    private validateProductWorkflowCompletion;
    private registerProductFlowHandlers;
    private registerSPARCIntegrationHandlers;
    private registerProductWorkflowDefinitions;
    private handleVisionAnalysis;
    private handlePRDCreation;
    private handleEpicBreakdown;
    private handleFeatureDefinition;
    private handleTaskCreation;
    private handleSPARCIntegration;
    private handleSPARCSpecification;
    private handleSPARCPseudocode;
    private handleSPARCArchitecture;
    private handleSPARCRefinement;
    private handleSPARCCompletion;
    /**
     * Initialize gate definitions for workflow steps
     */
    private initializeGateDefinitions;
    /**
     * Create a gate definition template
     */
    private createGateDefinition;
    /**
     * Determine if a gate should be executed for a workflow step
     */
    private shouldExecuteGate;
    /**
     * Execute a workflow gate with AGUI integration
     */
    executeWorkflowGate(stepName: string, workflow: ProductWorkflowState, gateConfig: {
        question: string;
        businessImpact: 'low' | 'medium' | 'high' | 'critical';
        stakeholders: string[];
        gateType: 'approval' | 'checkpoint' | 'review' | 'decision' | 'escalation' | 'emergency';
    }): Promise<WorkflowGateResult>;
    /**
     * Get required approval level based on business impact
     */
    private getRequiredApprovalLevel;
    /**
     * Interpret gate response from AGUI adapter
     */
    private interpretGateResponse;
    private saveWorkflow;
    private loadPersistedWorkflows;
    getActiveProductWorkflows(): Promise<ProductWorkflowState[]>;
    getProductWorkflowStatus(workflowId: string): Promise<ProductWorkflowState | null>;
    pauseProductWorkflow(workflowId: string, reason?: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    resumeProductWorkflow(workflowId: string, reason?: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get all pending gates for active workflows
     */
    getPendingGates(): Promise<Map<string, WorkflowGateRequest>>;
    /**
     * Get gate definitions for workflow steps
     */
    getGateDefinitions(): Map<string, WorkflowHumanGate>;
    /**
     * Cancel a pending gate
     */
    cancelGate(gateId: string, reason: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get workflow decision history from AGUI adapter
     */
    getWorkflowDecisionHistory(workflowId: string): import("../../interfaces/agui/workflow-agui-adapter.ts").WorkflowDecisionAudit[];
    /**
     * Get AGUI adapter statistics
     */
    getGateStatistics(): {
        totalDecisionAudits: number;
        activeGates: number;
        config: WorkflowAGUIConfig;
        lastAuditCleanup: Date;
    };
    /**
     * Shutdown gate capabilities
     */
    shutdownGates(): Promise<void>;
}
export {};
//# sourceMappingURL=product-workflow-engine.d.ts.map