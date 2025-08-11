/**
 * Web HTML Generator - Inline HTML generation.
 *
 * Generates inline HTML dashboard when no React build is available.
 * Provides fallback UI with basic functionality and theming support.
 */
/**
 * @file Interface implementation: web-html-generator.
 */
import type { WebConfig } from './web-config.ts';
export declare class WebHtmlGenerator {
    private config;
    constructor(config: WebConfig);
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
     * Generate main dashboard content.
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
}
//# sourceMappingURL=web-html-generator.d.ts.map