/**
 * @fileoverview SPARC Domain - Systematic Development Methodology
 *
 * Clean SPARC implementation for systematic development workflow
 */
export declare enum SPARCPhase {
    SPECIFICATION = "specification",
    PSEUDOCODE = "pseudocode",
    ARCHITECTURE = "architecture",
    REFINEMENT = "refinement",
    COMPLETION = "completion"
}
export interface SparcConfig {
    projectName: string;
    domain: string;
    requirements: string[];
    phases: SPARCPhase[];
}
export interface SparcProject {
    id: string;
    name: string;
    domain: string;
    currentPhase: SPARCPhase;
    requirements: string[];
    artifacts: Record<SPARCPhase, unknown[]>;
    createdAt: Date;
    updatedAt: Date;
}
export interface SparcResult {
    success: boolean;
    phase: SPARCPhase;
    artifacts: unknown[];
    message?: string;
}
export declare class SPARCManager {
    private config;
    constructor(config?: Partial<SparcConfig>);
    initializeProject(params: {
        name: string;
        domain: string;
        requirements: string[];
    }): Promise<SparcProject>;
    executePhase(project: SparcProject, phase: SPARCPhase): Promise<SparcResult>;
}
export default class SPARC {
    static createManager(config?: Partial<SparcConfig>): SPARCManager;
    static createProject(name: string, domain: string, requirements: string[]): Promise<SparcProject>;
}
//# sourceMappingURL=index.d.ts.map