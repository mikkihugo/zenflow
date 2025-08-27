/**
 * @fileoverview Epic Management Types - SAFe Epic Domain Types
 *
 * TypeScript type definitions for SAFe epic management and portfolio Kanban.
 * Provides comprehensive types for epic ownership and lifecycle management.
 *
 * SINGLE RESPONSIBILITY: Type definitions for epic management domain
 * FOCUSES ON: Epic lifecycle, portfolio Kanban, WSJF prioritization, business cases
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
// =============================================================================
// EPIC LIFECYCLE AND STATES
// =============================================================================
/**
 * Portfolio Kanban states for epic lifecycle
 */
export var PortfolioKanbanState;
(function (PortfolioKanbanState) {
    PortfolioKanbanState["FUNNEL"] = "funnel";
    PortfolioKanbanState["ANALYZING"] = "analyzing";
    PortfolioKanbanState["PORTFOLIO_BACKLOG"] = "portfolio_backlog";
    PortfolioKanbanState["IMPLEMENTING"] = "implementing";
    PortfolioKanbanState["DONE"] = "done";
    PortfolioKanbanState["CANCELLED"] = "cancelled";
})(PortfolioKanbanState || (PortfolioKanbanState = {}));
