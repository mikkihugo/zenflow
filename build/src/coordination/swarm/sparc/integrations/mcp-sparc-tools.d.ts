/**
 * SPARC MCP Tools.
 *
 * Model Context Protocol tools for external access to SPARC methodology system.
 * Enables AI assistants to coordinate SPARC projects and execute phases.
 */
/**
 * @file Coordination system: mcp-sparc-tools.
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class SPARCMCPTools {
    private sparcEngine;
    private activeProjects;
    private projectManagement;
    private roadmapManager;
    constructor();
    /**
     * Get all available SPARC MCP tools.
     */
    getTools(): Tool[];
    private createProjectTool;
    private executePhasetool;
    private getProjectStatusTool;
    private generateArtifactsTool;
    private validateCompletionTool;
    private listProjectsTool;
    private refineImplementationTool;
    /**
     * Execute MCP tool calls.
     *
     * @param name
     * @param args
     */
    handleOldToolCall(name: string, args: any): Promise<any>;
    private handleCreateProject;
    private handleExecutePhase;
    private handleGetProjectStatus;
    private handleGenerateArtifacts;
    private handleValidateCompletion;
    private handleListProjects;
    private handleRefineImplementation;
    private applyTemplateTool;
    private executeFullWorkflowTool;
    private handleApplyTemplate;
    private handleExecuteFullWorkflow;
    private generateProjectManagementArtifactsTool;
    private createEpicFromProjectTool;
    private addToRoadmapTool;
    private generateDomainRoadmapTool;
    /**
     * Handle project management artifacts generation with enhanced infrastructure integration.
     *
     * @param args
     */
    handleGenerateProjectManagementArtifacts(args: any): Promise<any>;
    /**
     * Handle epic creation from SPARC project.
     * Adrs: comprehensive.adrs.length,
     * epics: comprehensive.epics.length,
     * features: comprehensive.features.length,
     * prd: 1,
     * },
     * });
     * }.
     *
     * return {
     * success: true,
     * projectId: args.projectId,
     * projectName: project.name,
     * artifactsGenerated: results,
     * message: `Generated project management artifacts using existing Claude-Zen infrastructure`,
     * integration: {
     * taskAPI: 'Used existing TaskAPI and TaskCoordinator',
     * coordination: 'Integrated with TaskDistributionEngine',
     * adrTemplate: 'Used existing ADR template structure',
     * infrastructure: 'Leveraged existing coordination and task management',
     * },
     * };
     * } catch (error) {
     * return {
     * success: false,
     * error: error instanceof Error ? error.message : 'Unknown error occurred',
     * projectId: args.projectId,
     * };
     * }.
     * }.
     *
     * /**
     * Handle epic creation from project.
     *
     * @param args
     */
    handleCreateEpic(args: any): Promise<any>;
    /**
     * Handle adding project to roadmap.
     *
     * @param args
     */
    handleAddToRoadmap(args: any): Promise<any>;
    /**
     * Handle domain roadmap generation.
     *
     * @param args
     */
    handleGenerateDomainRoadmap(args: any): Promise<any>;
    /**
     * Handle tool calls with project management integration.
     *
     * @param toolName
     * @param args
     */
    handleToolCall(toolName: string, args: any): Promise<any>;
}
export declare const sparcMCPTools: SPARCMCPTools;
//# sourceMappingURL=mcp-sparc-tools.d.ts.map