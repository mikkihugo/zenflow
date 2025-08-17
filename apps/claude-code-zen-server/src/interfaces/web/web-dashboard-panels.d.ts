/**
 * Web Dashboard Panels - Migrated TUI functionality to web
 *
 * Converts key Terminal UI components to web dashboard panels
 * for a unified web-only interface experience.
 */
import LLMStatsService from '../../coordination/services/llm-stats-service';
export interface DashboardPanel {
    id: string;
    title: string;
    icon: string;
    content: string;
    data?: any;
}
export declare class WebDashboardPanels {
    private logger;
    private llmStatsService?;
    constructor(llmStatsService?: LLMStatsService);
    /**
     * Get system status panel (migrated from status.tsx)
     */
    getStatusPanel(): DashboardPanel;
    /**
     * Get swarm dashboard panel (migrated from swarm-dashboard.tsx)
     */
    getSwarmPanel(): DashboardPanel;
    /**
     * Get performance monitor panel (migrated from performance-monitor.tsx)
     */
    getPerformancePanel(): DashboardPanel;
    /**
     * Get logs viewer panel (migrated from logs-viewer.tsx)
     */
    getLogsPanel(): DashboardPanel;
    /**
     * Get settings panel (migrated from settings.tsx)
     */
    getSettingsPanel(): DashboardPanel;
    /**
     * Get LLM Statistics panel (migrated from llm-statistics.tsx)
     */
    getLLMStatsPanel(): DashboardPanel;
    /**
     * Get all dashboard panels (includes all restored TUI screens)
     */
    getAllPanels(): DashboardPanel[];
    private generateStatusHTML;
    private generateSwarmHTML;
    private generatePerformanceHTML;
    private generateLogsHTML;
    private generateSettingsHTML;
    /**
     * Generate LLM Statistics HTML content
     */
    private generateLLMStatsHTML;
    private generateADRManagerHTML;
    private generateCommandPaletteHTML;
    private generateFileBrowserHTML;
    private generateHelpHTML;
    private generateMainMenuHTML;
    private generateMCPServersHTML;
    private generateMCPTesterHTML;
    private generateNixManagerHTML;
    private generatePhase3LearningHTML;
    private generateSwarmDashboardHTML;
    private generateWorkspaceHTML;
    getAgentHealthPanel(): DashboardPanel;
    getTaskCoordinatorPanel(): DashboardPanel;
    getQueenCoordinatorPanel(): DashboardPanel;
    getSwarmCommanderPanel(): DashboardPanel;
    getIntelligenceEnginePanel(): DashboardPanel;
    getLoadBalancingPanel(): DashboardPanel;
    getOrchestrationPanel(): DashboardPanel;
    getSafePipelinePanel(): DashboardPanel;
    getDatabaseManagerPanel(): DashboardPanel;
    getMemorySystemPanel(): DashboardPanel;
    getVectorStorePanel(): DashboardPanel;
    getGraphDatabasePanel(): DashboardPanel;
    getDocumentServicePanel(): DashboardPanel;
    getHybridFactoryPanel(): DashboardPanel;
    getNeuralNetworkPanel(): DashboardPanel;
    getDspyEnginePanel(): DashboardPanel;
    getAdaptiveLearningPanel(): DashboardPanel;
    getPatternRecognitionPanel(): DashboardPanel;
    getBehavioralOptimizationPanel(): DashboardPanel;
    getKnowledgeEvolutionPanel(): DashboardPanel;
    getMLIntegrationPanel(): DashboardPanel;
    getDiagnosticsPanel(): DashboardPanel;
    getHealthMonitorPanel(): DashboardPanel;
    getLoggingConfigPanel(): DashboardPanel;
    getCliDiagnosticsPanel(): DashboardPanel;
    getErrorMonitoringPanel(): DashboardPanel;
    getSystemResiliencePanel(): DashboardPanel;
    getTypeEventSystemPanel(): DashboardPanel;
    getDomainValidatorPanel(): DashboardPanel;
    getApiClientPanel(): DashboardPanel;
    getWebSocketClientPanel(): DashboardPanel;
    getEventAdapterPanel(): DashboardPanel;
    getServiceAdapterPanel(): DashboardPanel;
    getKnowledgeClientPanel(): DashboardPanel;
    getHttpClientPanel(): DashboardPanel;
    getWebServicePanel(): DashboardPanel;
    getOtelConsumerPanel(): DashboardPanel;
    getWorkflowMonitorPanel(): DashboardPanel;
    getTuiDashboardPanel(): DashboardPanel;
    getAnalyticsPanel(): DashboardPanel;
    getOptimizationPanel(): DashboardPanel;
    getBenchmarkPanel(): DashboardPanel;
}
/**
 * Default export
 */
export default WebDashboardPanels;
//# sourceMappingURL=web-dashboard-panels.d.ts.map