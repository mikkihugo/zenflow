/**
 * @file Coordination system: roadmap-integration.
 */
import { type ProjectDomain, type SPARCProject } from '../types/sparc-types.ts';
export interface Epic {
    id: string;
    title: string;
    description: string;
    features: string[];
    business_value: string;
    timeline: {
        start_date: string;
        end_date: string;
    };
    status: 'approved' | 'planned' | 'in_progress' | 'completed';
    sparc_project_id: string;
}
export interface Feature {
    id: string;
    title: string;
    description: string;
    epic_id: string;
    user_stories: string[];
    status: 'backlog' | 'planned' | 'in_progress' | 'completed';
    sparc_project_id: string;
}
export interface Roadmap {
    id: string;
    title: string;
    description: string;
    timeframe: {
        start_quarter: string;
        end_quarter: string;
    };
    items: RoadmapItem[];
    last_updated: string;
}
export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    type: 'epic' | 'feature' | 'initiative';
    quarter: string;
    effort_estimate: number;
    business_value: 'high' | 'medium' | 'low';
    dependencies: string[];
    status: 'planned' | 'in_progress' | 'completed';
    sparc_project_id?: string;
}
export interface SPARCRoadmapPlanning {
    generateEpicFromSPARCProject(project: SPARCProject): Promise<Epic>;
    generateFeaturesFromProject(project: SPARCProject): Promise<Feature[]>;
    addProjectToRoadmap(project: SPARCProject, targetQuarter: string): Promise<void>;
    generateDomainRoadmap(domain: ProjectDomain, timeframe: {
        start: string;
        end: string;
    }): Promise<Roadmap>;
}
export declare class SPARCRoadmapManager implements SPARCRoadmapPlanning {
    private readonly projectRoot;
    private readonly roadmapFile;
    private readonly epicsFile;
    private readonly featuresFile;
    constructor(projectRoot?: string);
    /**
     * Generate an epic from a SPARC project.
     *
     * @param project
     */
    generateEpicFromSPARCProject(project: SPARCProject): Promise<Epic>;
    /**
     * Generate features from SPARC project phases.
     *
     * @param project
     */
    generateFeaturesFromProject(project: SPARCProject): Promise<Feature[]>;
    /**
     * Add SPARC project to enterprise roadmap.
     *
     * @param project
     * @param targetQuarter
     */
    addProjectToRoadmap(project: SPARCProject, targetQuarter: string): Promise<void>;
    /**
     * Generate domain-specific roadmap.
     *
     * @param domain
     * @param timeframe
     * @param timeframe.start
     * @param timeframe.end
     */
    generateDomainRoadmap(domain: ProjectDomain, timeframe: {
        start: string;
        end: string;
    }): Promise<Roadmap>;
    /**
     * Save epics and features to project files.
     *
     * @param project
     */
    saveProjectArtifacts(project: SPARCProject): Promise<void>;
    private generateEpicDescription;
    private calculateBusinessValue;
    private calculateEpicEndDate;
    private generateUserStoryIds;
    private getFeatureStatus;
    private generateRoadmapDescription;
    private determineRoadmapItemType;
    private calculateEffortEstimate;
    private mapBusinessValueToLevel;
    private extractProjectDependencies;
    private calculateEndQuarter;
    private generateDomainRoadmapItems;
}
//# sourceMappingURL=roadmap-integration.d.ts.map