/**
 * Web HTML Generator - Unified dashboard with TUI migration.
 *
 * Generates comprehensive HTML dashboard with migrated terminal UI functionality.
 * Provides rich web interface with all features accessible via browser.
 */
/**
 * @file Interface implementation: web-html-generator.
 */
import type { WebConfig } from './web-config';
export declare class WebHtmlGenerator {
    private config;
    private panels;
    constructor(config: WebConfig, llmStatsService?: any);
    /**
     * Generate complete inline HTML dashboard.
     */
    generateDashboardHtml(): string;
    /**
     * Generate CSS styles based on theme.
     */
    private generateStyles;
    /**
     * Generate HTML header section.
     */
    private generateHeader;
    /**
     * Generate main dashboard content with migrated TUI panels.
     */
    private generateMainContent;
    /**
     * Generate system status card.
     */
    private generateSystemStatusCard;
    /**
     * Generate swarms status card.
     */
    private generateSwarmsCard;
    /**
     * Generate tasks status card.
     */
    private generateTasksCard;
    /**
     * Generate API endpoints card.
     */
    private generateApiCard;
    /**
     * Generate performance metrics card.
     */
    private generateMetricsCard;
    /**
     * Generate quick actions card.
     */
    private generateQuickActionsCard;
    /**
     * Generate footer section.
     */
    private generateFooter;
    /**
     * Generate JavaScript for interactivity and real-time updates.
     */
    private generateJavaScript;
    /**
     * Generate WebSocket code for real-time updates.
     */
    private generateWebSocketCode;
    /**
     * Generate polling code for non-real-time updates.
     */
    private generatePollingCode;
    /**
     * Generate status page HTML.
     */
    generateStatusPageHtml(): string;
    /**
     * Generate metrics page HTML.
     */
    generateMetricsHtml(): string;
}
//# sourceMappingURL=web-html-generator.d.ts.map