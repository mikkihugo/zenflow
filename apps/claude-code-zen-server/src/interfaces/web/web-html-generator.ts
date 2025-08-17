import { getVersion } from '../../config/version';
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
import { WebDashboardPanels } from './web-dashboard-panels';

export class WebHtmlGenerator {
  private config: WebConfig;
  private panels: WebDashboardPanels;

  constructor(config: WebConfig, llmStatsService?: any) {
    this.config = config;
    this.panels = new WebDashboardPanels(llmStatsService);
  }

  /**
   * Generate complete inline HTML dashboard.
   */
  generateDashboardHtml(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>claude-code-zen - Web Dashboard</title>
    <style>
        ${this.generateStyles()}
    </style>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div class="container">
        ${this.generateHeader()}
        ${this.generateMainContent()}
        ${this.generateFooter()}
    </div>
    
    <script>
        ${this.generateJavaScript()}
    </script>
</body>
</html>`;
  }

  /**
   * Generate CSS styles based on theme.
   */
  private generateStyles(): string {
    const isDark = this.config.theme === 'dark';

    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${isDark ? '#0d1117' : '#ffffff'};
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            padding: 20px;
            line-height: 1.5;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { 
            color: #58a6ff; 
            margin-bottom: 10px; 
            font-size: 2.5rem;
            font-weight: 600;
        }
        .header p {
            font-size: 1.1rem;
            color: ${isDark ? '#8b949e' : '#656d76'};
        }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-bottom: 40px;
        }
        .card { 
            background: ${isDark ? '#21262d' : '#f6f8fa'}; 
            border-radius: 12px; 
            padding: 24px; 
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .card h2 { 
            color: #58a6ff; 
            margin-bottom: 16px; 
            font-size: 1.25rem;
            font-weight: 600;
        }
        .status { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            margin: 12px 0;
            padding: 8px 0;
        }
        .status-dot { 
            width: 10px; 
            height: 10px; 
            border-radius: 50%; 
            flex-shrink: 0;
        }
        .status-healthy { background: #238636; }
        .status-active { background: #58a6ff; }
        .status-warning { background: #d29922; }
        .status-error { background: #da3633; }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px;
            border-top: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            color: ${isDark ? '#7d8590' : '#656d76'};
        }
        .api-links { 
            margin-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .api-links a { 
            color: #58a6ff; 
            text-decoration: none;
            padding: 8px 12px;
            border-radius: 6px;
            background: ${isDark ? '#161b22' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            transition: all 0.2s ease;
        }
        .api-links a:hover { 
            text-decoration: none;
            background: ${isDark ? '#21262d' : '#f0f6fc'};
            transform: translateX(4px);
        }
        
        /* Dashboard Navigation */
        .dashboard-nav {
            margin-bottom: 30px;
            border-bottom: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
        }
        .nav-tabs {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: -1px;
        }
        .nav-tab {
            background: ${isDark ? '#21262d' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-bottom: none;
            border-radius: 8px 8px 0 0;
            padding: 12px 20px;
            cursor: pointer;
            color: ${isDark ? '#8b949e' : '#656d76'};
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .nav-tab:hover {
            background: ${isDark ? '#30363d' : '#f0f6fc'};
            color: ${isDark ? '#f0f6fc' : '#24292f'};
        }
        .nav-tab.active {
            background: ${isDark ? '#0d1117' : '#ffffff'};
            color: #58a6ff;
            border-bottom: 1px solid ${isDark ? '#0d1117' : '#ffffff'};
        }
        .tab-icon {
            font-size: 16px;
        }
        
        /* Dashboard Panels */
        .dashboard-panels {
            min-height: 600px;
        }
        .dashboard-panel {
            display: none;
            animation: fadeIn 0.3s ease;
        }
        .dashboard-panel.active {
            display: block;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Status Panel */
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .status-card {
            background: ${isDark ? '#21262d' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .status-icon {
            font-size: 24px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: ${isDark ? '#0d1117' : '#ffffff'};
        }
        .status-info h3 {
            margin: 0 0 5px 0;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-size: 16px;
        }
        .status-info p {
            margin: 0;
            color: ${isDark ? '#8b949e' : '#656d76'};
            font-size: 14px;
        }
        
        /* Swarm Panel */
        .swarm-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 10px 16px;
            border-radius: 6px;
            border: 1px solid transparent;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
        }
        .btn-primary {
            background: #238636;
            color: white;
            border-color: #238636;
        }
        .btn-primary:hover {
            background: #2ea043;
        }
        .btn-secondary {
            background: ${isDark ? '#21262d' : '#f6f8fa'};
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            border-color: ${isDark ? '#30363d' : '#d0d7de'};
        }
        .btn-secondary:hover {
            background: ${isDark ? '#30363d' : '#f0f6fc'};
        }
        .icon {
            font-size: 14px;
        }
        
        /* Performance Panel */
        .performance-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card h4 {
            margin: 0 0 10px 0;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-size: 14px;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: ${isDark ? '#21262d' : '#f6f8fa'};
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        .progress-fill {
            height: 100%;
            background: #58a6ff;
            transition: width 0.5s ease;
        }
        
        /* Logs Panel */
        .logs-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
            align-items: center;
        }
        .log-filter {
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            background: ${isDark ? '#21262d' : '#ffffff'};
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-size: 14px;
        }
        .logs-container {
            background: ${isDark ? '#0d1117' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 6px;
            padding: 15px;
            height: 400px;
            overflow-y: auto;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 13px;
            line-height: 1.4;
        }
        .log-entry {
            margin-bottom: 4px;
            display: flex;
            gap: 8px;
        }
        .log-timestamp {
            color: ${isDark ? '#7d8590' : '#656d76'};
            min-width: 180px;
        }
        .log-level {
            min-width: 50px;
            font-weight: 600;
        }
        .log-level.info { color: #58a6ff; }
        .log-level.warn { color: #d29922; }
        .log-level.error { color: #da3633; }
        .log-level.debug { color: #8b949e; }
        
        /* Settings Panel */
        .settings-section {
            margin-bottom: 30px;
            background: ${isDark ? '#21262d' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
            padding: 20px;
        }
        .settings-section h4 {
            margin: 0 0 15px 0;
            color: #58a6ff;
            font-size: 16px;
        }
        .setting-item {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .setting-item label {
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-size: 14px;
        }
        .setting-item select, .setting-item input {
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            background: ${isDark ? '#0d1117' : '#ffffff'};
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-size: 14px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }
        .info-item {
            color: ${isDark ? '#8b949e' : '#656d76'};
            font-size: 14px;
        }
        
        /* LLM Statistics Panel */
        .llm-stats-panel {
            padding: 20px;
        }
        .llm-stats-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
        }
        .llm-stats-header h3 {
            margin: 0;
            color: #58a6ff;
            font-size: 1.5rem;
        }
        .llm-stats-controls {
            display: flex;
            gap: 10px;
        }
        .llm-overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .llm-card {
            background: ${isDark ? '#21262d' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
            padding: 20px;
        }
        .llm-card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        .llm-card-header h4 {
            margin: 0;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-size: 1rem;
        }
        .llm-icon {
            font-size: 1.2rem;
        }
        .llm-metrics {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .llm-metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid ${isDark ? '#30363d' : '#e1e4e8'};
        }
        .llm-metric:last-child {
            border-bottom: none;
        }
        .llm-metric-label {
            color: ${isDark ? '#8b949e' : '#656d76'};
            font-size: 14px;
        }
        .llm-metric-value {
            font-weight: 600;
            font-family: 'SF Mono', Consolas, monospace;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
        }
        .llm-metric-value.success {
            color: #238636;
        }
        .llm-metric-value.warning {
            color: #d29922;
        }
        .llm-metric-value.error {
            color: #da3633;
        }
        .llm-health-status {
            padding: 15px;
            border-radius: 6px;
            background: ${isDark ? '#161b22' : '#f6f8fa'};
        }
        .llm-health-main {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .llm-health-level {
            font-weight: 700;
            font-size: 1.1rem;
            color: #58a6ff;
        }
        .llm-health-score {
            font-weight: 600;
            font-size: 1.2rem;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
        }
        .llm-health-details {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .llm-insights {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .llm-insight {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
        }
        .llm-insight-label {
            color: ${isDark ? '#8b949e' : '#656d76'};
            font-size: 14px;
        }
        .llm-insight-value {
            font-weight: 600;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
        }
        .llm-section {
            margin-bottom: 30px;
        }
        .llm-section h4 {
            color: #58a6ff;
            margin-bottom: 15px;
            font-size: 1.1rem;
        }
        .llm-providers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        .llm-provider-card {
            background: ${isDark ? '#21262d' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 6px;
            padding: 15px;
        }
        .llm-provider-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .llm-provider-name {
            font-weight: 600;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
        }
        .llm-provider-status {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .status-active {
            background: #238636;
            color: white;
        }
        .status-cooldown {
            background: #d29922;
            color: white;
        }
        .status-error {
            background: #da3633;
            color: white;
        }
        .status-disabled {
            background: #8b949e;
            color: white;
        }
        .llm-provider-metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .llm-provider-metric {
            display: flex;
            flex-direction: column;
        }
        .llm-provider-last-used {
            margin-top: 8px;
            font-size: 12px;
            color: ${isDark ? '#8b949e' : '#656d76'};
        }
        .llm-alerts {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .llm-alert {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid;
        }
        .alert-warning {
            background: ${isDark ? '#332a00' : '#fff8c5'};
            border-left-color: #d29922;
        }
        .alert-error, .alert-critical {
            background: ${isDark ? '#3d1619' : '#ffebe9'};
            border-left-color: #da3633;
        }
        .llm-alert-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .llm-alert-message {
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-weight: 500;
        }
        .llm-alert-time {
            font-size: 12px;
            color: ${isDark ? '#8b949e' : '#656d76'};
        }
        .llm-recommendations {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .llm-recommendation {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: ${isDark ? '#161b22' : '#f6f8fa'};
            border-radius: 6px;
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
        }
        .llm-rec-icon {
            font-size: 16px;
        }
        .llm-rec-text {
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-size: 14px;
        }
        .llm-routing-patterns {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .llm-routing-pattern {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: ${isDark ? '#21262d' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 6px;
        }
        .llm-pattern-route {
            font-family: 'SF Mono', Consolas, monospace;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-weight: 500;
        }
        .llm-pattern-stats {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        .llm-pattern-frequency {
            font-size: 13px;
            color: ${isDark ? '#8b949e' : '#656d76'};
        }
        .llm-pattern-success {
            font-size: 13px;
            font-weight: 600;
        }
        
        /* Enhanced Performance Panel Styles */
        .performance-panel {
            padding: 20px;
        }
        .performance-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
        }
        .performance-header h3 {
            margin: 0;
            color: #58a6ff;
            font-size: 1.5rem;
        }
        .performance-controls {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        /* Performance Overview Grid */
        .performance-overview {
            margin-bottom: 30px;
        }
        .perf-metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .perf-metric-card {
            background: ${isDark ? '#21262d' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
            padding: 20px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .perf-metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .perf-metric-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        .perf-metric-header h4 {
            margin: 0;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-size: 1rem;
        }
        .perf-icon {
            font-size: 1.2rem;
        }
        .perf-metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: #58a6ff;
            margin-bottom: 5px;
            line-height: 1.2;
        }
        .perf-metric-value.large {
            font-size: 2.5rem;
        }
        .perf-metric-label {
            color: ${isDark ? '#8b949e' : '#656d76'};
            font-size: 14px;
        }
        .perf-metric-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            font-size: 12px;
            color: ${isDark ? '#7d8590' : '#656d76'};
        }
        .perf-metric-status {
            font-size: 13px;
            font-weight: 500;
            margin-top: 5px;
        }
        .perf-metric-status.good { color: #238636; }
        .perf-metric-status.warning { color: #d29922; }
        .perf-metric-status.critical { color: #f85149; }
        
        /* Progress Bars */
        .perf-progress-container {
            position: relative;
            margin-bottom: 10px;
        }
        .perf-progress-bar {
            width: 100%;
            height: 12px;
            background: ${isDark ? '#21262d' : '#f6f8fa'};
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
        }
        .perf-progress-fill {
            height: 100%;
            background: #238636;
            transition: width 0.8s ease;
            border-radius: 5px;
        }
        .perf-progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 10px;
            font-weight: 600;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            text-shadow: 0 0 3px rgba(0,0,0,0.5);
        }
        
        /* LLM Performance Section */
        .llm-performance-section {
            margin-bottom: 30px;
            padding: 20px;
            background: ${isDark ? '#161b22' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
        }
        .llm-performance-section h4 {
            margin: 0 0 20px 0;
            color: #58a6ff;
            font-size: 1.2rem;
        }
        .llm-perf-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .llm-perf-card {
            background: ${isDark ? '#21262d' : '#ffffff'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 6px;
            padding: 15px;
            text-align: center;
        }
        .llm-perf-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 10px;
        }
        .llm-perf-header h5 {
            margin: 0;
            color: ${isDark ? '#8b949e' : '#656d76'};
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .llm-perf-icon {
            font-size: 14px;
        }
        .llm-perf-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #58a6ff;
            margin-bottom: 8px;
            font-family: 'SF Mono', Consolas, monospace;
        }
        .llm-perf-trend {
            font-size: 12px;
            font-weight: 500;
        }
        .llm-perf-trend.good { color: #238636; }
        .llm-perf-trend.warning { color: #d29922; }
        .llm-perf-trend.critical { color: #f85149; }
        
        /* Performance Charts */
        .performance-charts {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 30px;
            margin-bottom: 30px;
        }
        .chart-container {
            background: ${isDark ? '#21262d' : '#ffffff'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
            padding: 20px;
        }
        .chart-container h4 {
            margin: 0 0 20px 0;
            color: #58a6ff;
            font-size: 1.1rem;
        }
        .chart-tabs {
            display: flex;
            gap: 5px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
        }
        .chart-tab {
            padding: 8px 16px;
            background: ${isDark ? '#161b22' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            color: ${isDark ? '#8b949e' : '#656d76'};
            transition: all 0.2s ease;
        }
        .chart-tab:hover {
            background: ${isDark ? '#21262d' : '#f0f6fc'};
            color: ${isDark ? '#f0f6fc' : '#24292f'};
        }
        .chart-tab.active {
            background: #58a6ff;
            color: white;
            border-color: #58a6ff;
        }
        .chart-content {
            position: relative;
            height: 300px;
        }
        .metrics-sidebar {
            background: ${isDark ? '#21262d' : '#ffffff'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
            padding: 20px;
        }
        .metrics-sidebar h4 {
            margin: 0 0 20px 0;
            color: #58a6ff;
            font-size: 1.1rem;
        }
        .live-metrics {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .live-metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid ${isDark ? '#30363d' : '#e1e4e8'};
        }
        .live-metric:last-child {
            border-bottom: none;
        }
        .live-metric .metric-label {
            color: ${isDark ? '#8b949e' : '#656d76'};
            font-size: 13px;
        }
        .live-metric .metric-value {
            font-weight: 600;
            font-family: 'SF Mono', Consolas, monospace;
            color: #58a6ff;
            font-size: 14px;
        }
        
        /* Performance Alerts */
        .performance-alerts {
            margin-bottom: 30px;
            background: ${isDark ? '#21262d' : '#ffffff'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
            padding: 20px;
        }
        .performance-alerts h4 {
            margin: 0 0 15px 0;
            color: #58a6ff;
            font-size: 1.1rem;
        }
        .alert-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .perf-alert {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid;
        }
        .perf-alert.info {
            background: ${isDark ? '#0c2d48' : '#dbeafe'};
            border-left-color: #58a6ff;
        }
        .perf-alert.warning {
            background: ${isDark ? '#332a00' : '#fff8c5'};
            border-left-color: #d29922;
        }
        .perf-alert.critical {
            background: ${isDark ? '#3d1619' : '#ffebe9'};
            border-left-color: #f85149;
        }
        .alert-icon {
            font-size: 16px;
            flex-shrink: 0;
        }
        .alert-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
        }
        .alert-message {
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-weight: 500;
            font-size: 14px;
        }
        .alert-time {
            font-size: 12px;
            color: ${isDark ? '#8b949e' : '#656d76'};
        }
        
        /* Performance Recommendations */
        .performance-recommendations {
            margin-bottom: 30px;
            background: ${isDark ? '#21262d' : '#ffffff'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
            padding: 20px;
        }
        .performance-recommendations h4 {
            margin: 0 0 15px 0;
            color: #58a6ff;
            font-size: 1.1rem;
        }
        .recommendation-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .recommendation {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 15px;
            background: ${isDark ? '#161b22' : '#f6f8fa'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        .recommendation:hover {
            background: ${isDark ? '#21262d' : '#f0f6fc'};
            transform: translateX(2px);
        }
        .rec-icon {
            font-size: 16px;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .rec-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .rec-title {
            font-weight: 600;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-size: 14px;
        }
        .rec-description {
            color: ${isDark ? '#8b949e' : '#656d76'};
            font-size: 13px;
            line-height: 1.4;
        }
        
        /* Resource Details */
        .resource-details {
            background: ${isDark ? '#21262d' : '#ffffff'};
            border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
            border-radius: 8px;
            padding: 20px;
        }
        .resource-details h4 {
            margin: 0 0 15px 0;
            color: #58a6ff;
            font-size: 1.1rem;
        }
        .resource-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 12px;
        }
        .resource-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: ${isDark ? '#161b22' : '#f6f8fa'};
            border-radius: 6px;
            border: 1px solid ${isDark ? '#30363d' : '#e1e4e8'};
        }
        .resource-label {
            color: ${isDark ? '#8b949e' : '#656d76'};
            font-size: 13px;
            font-weight: 500;
        }
        .resource-value {
            font-weight: 600;
            font-family: 'SF Mono', Consolas, monospace;
            color: ${isDark ? '#f0f6fc' : '#24292f'};
            font-size: 13px;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .performance-charts {
                grid-template-columns: 1fr;
            }
            .perf-metric-grid {
                grid-template-columns: 1fr;
            }
            .llm-perf-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            }
            .resource-grid {
                grid-template-columns: 1fr;
            }
        }
        
        .realtime-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 20px;
            background: ${isDark ? '#238636' : '#dafbe1'};
            color: ${isDark ? '#ffffff' : '#116329'};
            font-size: 0.875rem;
            font-weight: 500;
        }
        .realtime-indicator::before {
            content: '●';
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid ${isDark ? '#30363d' : '#e1e4e8'};
        }
        .metric:last-child { border-bottom: none; }
        .metric-label { font-weight: 500; }
        .metric-value { 
            font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
            color: ${isDark ? '#79c0ff' : '#0969da'};
        }
    `;
  }

  /**
   * Generate HTML header section.
   */
  private generateHeader(): string {
    return `
        <div class="header">
            <h1>🧠 claude-code-zen</h1>
            <p>AI-Powered Development Toolkit - Web Dashboard</p>
            <div class="realtime-indicator">
                Real-time updates ${this.config.realTime ? 'enabled' : 'disabled'}
            </div>
        </div>
    `;
  }

  /**
   * Generate main dashboard content with migrated TUI panels.
   */
  private generateMainContent(): string {
    const allPanels = this.panels.getAllPanels();
    
    return `
        <nav class="dashboard-nav">
            <div class="nav-tabs">
                ${allPanels.map((panel, index) => `
                    <button class="nav-tab ${index === 0 ? 'active' : ''}" 
                            onclick="showPanel('${panel.id}')">
                        <span class="tab-icon">${panel.icon}</span>
                        ${panel.title}
                    </button>
                `).join('')}
            </div>
        </nav>
        
        <div class="dashboard-panels">
            ${allPanels.map((panel, index) => `
                <div id="panel-${panel.id}" class="dashboard-panel ${index === 0 ? 'active' : ''}">
                    ${panel.content}
                </div>
            `).join('')}
        </div>
    `;
  }

  /**
   * Generate system status card.
   */
  private generateSystemStatusCard(): string {
    return `
        <div class="card">
            <h2>📊 System Status</h2>
            <div id="system-status">
                <div class="metric">
                    <span class="metric-label">System Health</span>
                    <span class="metric-value">Healthy</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Version</span>
                    <span class="metric-value">2.0.0-alpha.73</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Uptime</span>
                    <span class="metric-value" id="uptime">--</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Port</span>
                    <span class="metric-value">${this.config.port}</span>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Generate swarms status card.
   */
  private generateSwarmsCard(): string {
    return `
        <div class="card">
            <h2>🐝 Active Swarms</h2>
            <div id="swarms-status">
                <div class="status">
                    <span class="status-dot status-active"></span>
                    <span>Document Processing (4 agents)</span>
                </div>
                <div class="status">
                    <span class="status-dot status-active"></span>
                    <span>Feature Development (6 agents)</span>
                </div>
                <div class="status">
                    <span class="status-dot status-warning"></span>
                    <span>Code Analysis (2 agents)</span>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Generate tasks status card.
   */
  private generateTasksCard(): string {
    return `
        <div class="card">
            <h2>✅ Recent Tasks</h2>
            <div id="tasks-status">
                <div class="status">
                    <span class="status-dot status-active"></span>
                    <span>Process PRD: User Auth (75%)</span>
                </div>
                <div class="status">
                    <span class="status-dot status-healthy"></span>
                    <span>Generate ADR: Database (Pending)</span>
                </div>
                <div class="status">
                    <span class="status-dot status-warning"></span>
                    <span>Code Review: API (In Progress)</span>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Generate API endpoints card.
   */
  private generateApiCard(): string {
    return `
        <div class="card">
            <h2>🔗 API Endpoints</h2>
            <div class="api-links">
                <a href="${this.config.apiPrefix}/health" target="_blank">Health Check</a>
                <a href="${this.config.apiPrefix}/status" target="_blank">System Status</a>
                <a href="${this.config.apiPrefix}/swarms" target="_blank">Swarms API</a>
                <a href="${this.config.apiPrefix}/tasks" target="_blank">Tasks API</a>
                <a href="${this.config.apiPrefix}/documents" target="_blank">Documents API</a>
            </div>
        </div>
    `;
  }

  /**
   * Generate performance metrics card.
   */
  private generateMetricsCard(): string {
    return `
        <div class="card">
            <h2>📈 Performance</h2>
            <div id="performance-metrics">
                <div class="metric">
                    <span class="metric-label">Requests/min</span>
                    <span class="metric-value" id="requests-per-min">--</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Response</span>
                    <span class="metric-value" id="avg-response">--</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Cache Hit Rate</span>
                    <span class="metric-value" id="cache-hit-rate">--</span>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Generate quick actions card.
   */
  private generateQuickActionsCard(): string {
    return `
        <div class="card">
            <h2>⚡ Quick Actions</h2>
            <div class="api-links">
                <a href="#" onclick="executeAction('swarm:create')">Create New Swarm</a>
                <a href="#" onclick="executeAction('task:create')">Create New Task</a>
                <a href="#" onclick="executeAction('system:refresh')">Refresh System</a>
                <a href="#" onclick="executeAction('logs:view')">View System Logs</a>
            </div>
        </div>
    `;
  }

  /**
   * Generate footer section.
   */
  private generateFooter(): string {
    return `
        <div class="footer">
            <p>claude-code-zen Web Dashboard</p>
            <p>Running on ${this.config.host}:${this.config.port} | 
               Theme: ${this.config.theme} | 
               Real-time: ${this.config.realTime ? 'enabled' : 'disabled'}
            </p>
        </div>
    `;
  }

  /**
   * Generate JavaScript for interactivity and real-time updates.
   */
  private generateJavaScript(): string {
    return `
        ${this.config.realTime ? this.generateWebSocketCode() : this.generatePollingCode()}
        
        // Utility functions
        function formatUptime(seconds) {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            
            if (days > 0) return \`\${days}d \${hours}h\`;
            if (hours > 0) return \`\${hours}h \${minutes}m\`;
            return \`\${minutes}m\`;
        }
        
        function formatBytes(bytes) {
            const sizes = ['B', 'KB', 'MB', 'GB'];
            if (bytes === 0) return '0 B';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
        }
        
        function executeAction(action) {
            console.log('Executing action:', action);
            
            fetch('${this.config.apiPrefix}/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: action, args: [] })
            })
            .then(r => r.json())
            .then(data => {
                console.log('Action result:', data);
                alert(\`Action executed: \${action}\`);
            })
            .catch(err => {
                console.error('Action failed:', err);
                alert(\`Action failed: \${action}\`);
            });
        }
        
        // Dashboard panel switching
        window.showPanel = function(panelId) {
            // Hide all panels
            const panels = document.querySelectorAll('.dashboard-panel');
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Remove active from all tabs
            const tabs = document.querySelectorAll('.nav-tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Show selected panel
            const selectedPanel = document.getElementById('panel-' + panelId);
            if (selectedPanel) {
                selectedPanel.classList.add('active');
            }
            
            // Mark tab as active
            const selectedTab = document.querySelector(\`[onclick="showPanel('\${panelId}')"]\`);
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
            
            // Load panel-specific data
            loadPanelData(panelId);
        };
        
        // Dashboard functionality
        window.initializeSwarm = function() {
            fetch('${this.config.apiPrefix}/swarms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topology: 'hierarchical', maxAgents: 6 })
            })
            .then(r => r.json())
            .then(data => {
                console.log('Swarm initialized:', data);
                refreshSwarmStatus();
            })
            .catch(err => console.error('Failed to initialize swarm:', err));
        };
        
        window.refreshSwarmStatus = function() {
            fetch('${this.config.apiPrefix}/swarms')
            .then(r => r.json())
            .then(data => {
                updateSwarmDisplay(data);
            })
            .catch(err => console.error('Failed to refresh swarm status:', err));
        };
        
        window.clearLogs = function() {
            const logsContainer = document.getElementById('logs-container');
            if (logsContainer) {
                logsContainer.innerHTML = '<div class="log-entry info"><span class="log-timestamp">[' + new Date().toISOString() + ']</span><span class="log-level info">INFO</span><span class="log-message">Logs cleared</span></div>';
            }
        };
        
        window.toggleAutoScroll = function() {
            // Toggle auto-scroll functionality
            const button = event.target.closest('button');
            const isEnabled = button.textContent.includes('Auto-scroll');
            button.innerHTML = isEnabled ? 
                '<span class="icon">📜</span>Manual scroll' : 
                '<span class="icon">📜</span>Auto-scroll';
        };
        
        function loadPanelData(panelId) {
            switch(panelId) {
                case 'status':
                    updateSystemStatus();
                    break;
                case 'swarm':
                    refreshSwarmStatus();
                    break;
                case 'performance':
                    updatePerformanceMetrics();
                    break;
                case 'llm-stats':
                    loadLLMStats();
                    break;
                case 'logs':
                    loadRecentLogs();
                    break;
                case 'settings':
                    loadSettings();
                    break;
            }
        }
        
        function updateSystemStatus() {
            fetch('${this.config.apiPrefix}/health')
            .then(r => r.json())
            .then(data => {
                const uptimeEl = document.getElementById('uptime');
                const memoryEl = document.getElementById('memory-usage');
                
                if (uptimeEl) uptimeEl.textContent = formatUptime(data.uptime);
                if (memoryEl) memoryEl.textContent = formatBytes(process.memoryUsage ? process.memoryUsage().heapUsed : 0) + ' used';
            })
            .catch(err => console.error('Failed to update status:', err));
        }
        
        function updatePerformanceMetrics() {
            // Simulate performance data
            const cpuProgress = document.getElementById('cpu-progress');
            const memoryProgress = document.getElementById('memory-progress');
            const cpuValue = document.getElementById('cpu-value');
            const memoryValue = document.getElementById('memory-value');
            
            const cpu = Math.random() * 100;
            const memory = Math.random() * 8000;
            
            if (cpuProgress) cpuProgress.style.width = cpu + '%';
            if (memoryProgress) memoryProgress.style.width = (memory / 80) + '%';
            if (cpuValue) cpuValue.textContent = cpu.toFixed(1) + '%';
            if (memoryValue) memoryValue.textContent = memory.toFixed(0) + ' MB';
        }
        
        function updateSwarmDisplay(data) {
            const topologyEl = document.getElementById('topology');
            const agentCountEl = document.getElementById('agent-count');
            const agentListEl = document.getElementById('agent-list');
            
            if (topologyEl) topologyEl.textContent = data.topology || 'None';
            if (agentCountEl) agentCountEl.textContent = data.agents?.length || 0;
            
            if (agentListEl && data.agents) {
                agentListEl.innerHTML = data.agents.map(agent => 
                    '<div class="agent-item">' + agent.type + ': ' + agent.status + '</div>'
                ).join('');
            }
        }
        
        function loadRecentLogs() {
            // Add sample log entries
            const logsContainer = document.getElementById('logs-container');
            if (logsContainer) {
                const logs = [
                    { level: 'info', message: 'Dashboard panel loaded successfully' },
                    { level: 'debug', message: 'WebSocket connection established' },
                    { level: 'info', message: 'System status: All components healthy' }
                ];
                
                logs.forEach(log => {
                    const logEntry = document.createElement('div');
                    logEntry.className = 'log-entry';
                    logEntry.innerHTML = 
                        '<span class="log-timestamp">[' + new Date().toISOString() + ']</span>' +
                        '<span class="log-level ' + log.level + '">' + log.level.toUpperCase() + '</span>' +
                        '<span class="log-message">' + log.message + '</span>';
                    logsContainer.appendChild(logEntry);
                });
            }
        }
        
        function loadSettings() {
            // Initialize settings
            const themeSelector = document.getElementById('theme-selector');
            const refreshInterval = document.getElementById('refresh-interval');
            const refreshValue = document.getElementById('refresh-value');
            
            if (refreshInterval && refreshValue) {
                refreshInterval.addEventListener('input', function() {
                    refreshValue.textContent = this.value + 's';
                });
            }
        }
        
        // LLM Statistics functions
        function loadLLMStats() {
            // Load initial LLM statistics data
            console.log('Loading LLM Statistics...');
        }
        
        window.refreshLLMStats = function() {
            fetch('${this.config.apiPrefix}/llm-stats')
            .then(r => r.json())
            .then(data => {
                console.log('LLM Stats refreshed:', data);
                // Update the panel with fresh data
                showPanel('llm-stats');
            })
            .catch(err => console.error('Failed to refresh LLM stats:', err));
        };
        
        window.exportLLMStats = function() {
            fetch('${this.config.apiPrefix}/llm-stats/export')
            .then(r => r.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'llm-statistics-' + new Date().toISOString().split('T')[0] + '.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                console.log('LLM Statistics exported');
            })
            .catch(err => console.error('Failed to export LLM stats:', err));
        };
        
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Claude Code Zen Unified Dashboard initialized');
            
            // Load initial panel data
            fetch('${this.config.apiPrefix}/status')
                .then(r => r.json())
                .then(data => {
                    if (data.uptime) {
                        document.getElementById('uptime').textContent = data.uptime;
                    }
                })
                .catch(err => console.error('Failed to fetch initial status:', err));
        });
    `;
  }

  /**
   * Generate WebSocket code for real-time updates.
   */
  private generateWebSocketCode(): string {
    return `
        const socket = io();
        
        socket.on('connect', () => {
            console.log('Connected to server via WebSocket');
            
            // Subscribe to channels
            socket.emit('subscribe', 'system');
            socket.emit('subscribe', 'swarms');
            socket.emit('subscribe', 'tasks');
        });
        
        socket.on('system:status', (data) => {
            console.log('System status update:', data);
            if (data.data && data.data.uptime) {
                document.getElementById('uptime').textContent = data.data.uptime;
            }
        });
        
        socket.on('performance:update', (data) => {
            console.log('Performance update:', data);
            if (data.data) {
                const metrics = data.data;
                const reqPerMin = document.getElementById('requests-per-min');
                const avgResponse = document.getElementById('avg-response');
                const cacheHitRate = document.getElementById('cache-hit-rate');
                
                if (reqPerMin) reqPerMin.textContent = metrics.requestsServed || '--';
                if (avgResponse) avgResponse.textContent = (metrics.averageResponseTime || 0) + 'ms';
                if (cacheHitRate) cacheHitRate.textContent = Math.round((metrics.cacheHitRate || 0) * 100) + '%';
            }
        });
        
        socket.on('tasks:update', (data) => {
            console.log('Tasks update:', data);
            // Update tasks display with real data
        });
        
        socket.on('llm:stats', (data) => {
            console.log('LLM Stats update:', data);
            if (data.data) {
                const currentPanel = document.querySelector('.dashboard-panel.active');
                if (currentPanel && currentPanel.id === 'panel-llm-stats') {
                    // Refresh the LLM stats panel with new data
                    refreshLLMStats();
                }
            }
        });
        
        socket.on('llm:provider:status', (data) => {
            console.log('LLM Provider status update:', data);
            // Update provider status in real-time
        });
        
        socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
        });
    `;
  }

  /**
   * Generate polling code for non-real-time updates.
   */
  private generatePollingCode(): string {
    return `
        // Auto-refresh page data every 5 seconds if WebSocket is disabled
        setInterval(() => {
            fetch('${this.config.apiPrefix}/status')
                .then(r => r.json())
                .then(data => {
                    console.log('Status update:', data);
                    if (data.uptime) {
                        document.getElementById('uptime').textContent = data.uptime;
                    }
                })
                .catch(err => console.error('Failed to fetch status:', err));
        }, 5000);
    `;
  }

  /**
   * Generate status page HTML.
   */
  generateStatusPageHtml(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Zen - Status</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0d1117;
            color: #f0f6fc;
            padding: 20px;
            margin: 0;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .status-card { 
            background: #21262d;
            border: 1px solid #30363d;
            border-radius: 8px;
            padding: 20px;
        }
        .status-card h3 { color: #58a6ff; margin: 0 0 10px 0; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .metric-value { font-family: 'SF Mono', Consolas, monospace; color: #f0f6fc; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>System Status</h1>
        </div>
        <div class="status-grid">
            <div class="status-card">
                <h3>System Health</h3>
                <div class="metric"><span>Status:</span><span class="metric-value">Healthy</span></div>
                <div class="metric"><span>Uptime:</span><span class="metric-value">${Math.floor(process.uptime())}s</span></div>
                <div class="metric"><span>Version:</span><span class="metric-value">${getVersion()}</span></div>
            </div>
            <div class="status-card">
                <h3>Memory</h3>
                <div class="metric"><span>Heap Used:</span><span class="metric-value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</span></div>
                <div class="metric"><span>Heap Total:</span><span class="metric-value">${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB</span></div>
                <div class="metric"><span>RSS:</span><span class="metric-value">${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB</span></div>
            </div>
            <div class="status-card">
                <h3>Process</h3>
                <div class="metric"><span>PID:</span><span class="metric-value">${process.pid}</span></div>
                <div class="metric"><span>Platform:</span><span class="metric-value">${process.platform}</span></div>
                <div class="metric"><span>Node.js:</span><span class="metric-value">${process.version}</span></div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate metrics page HTML.
   */
  generateMetricsHtml(): string {
    const memoryUsage = process.memoryUsage();
    const analytics = this.panels.getLLMStatsPanel();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Zen - Metrics</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0d1117;
            color: #f0f6fc;
            padding: 20px;
            margin: 0;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .metrics-card { 
            background: #21262d;
            border: 1px solid #30363d;
            border-radius: 8px;
            padding: 20px;
        }
        .metrics-card h3 { color: #58a6ff; margin: 0 0 15px 0; }
        .chart-container { height: 300px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Performance Metrics Dashboard</h1>
        </div>
        ${analytics.content}
        <div class="metrics-grid">
            <div class="metrics-card">
                <h3>System Resources</h3>
                <div class="chart-container">
                    <canvas id="system-chart"></canvas>
                </div>
            </div>
            <div class="metrics-card">
                <h3>Memory Usage</h3>
                <div class="chart-container">
                    <canvas id="memory-chart"></canvas>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Initialize charts
        const systemCtx = document.getElementById('system-chart').getContext('2d');
        new Chart(systemCtx, {
            type: 'doughnut',
            data: {
                labels: ['Heap Used', 'Heap Free'],
                datasets: [{
                    data: [${memoryUsage.heapUsed}, ${memoryUsage.heapTotal - memoryUsage.heapUsed}],
                    backgroundColor: ['#f85149', '#238636']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#f0f6fc' }
                    }
                }
            }
        });
        
        const memoryCtx = document.getElementById('memory-chart').getContext('2d');
        new Chart(memoryCtx, {
            type: 'bar',
            data: {
                labels: ['Heap Used', 'Heap Total', 'RSS', 'External'],
                datasets: [{
                    label: 'Memory (MB)',
                    data: [
                        ${Math.round(memoryUsage.heapUsed / 1024 / 1024)},
                        ${Math.round(memoryUsage.heapTotal / 1024 / 1024)},
                        ${Math.round(memoryUsage.rss / 1024 / 1024)},
                        ${Math.round(memoryUsage.external / 1024 / 1024)}
                    ],
                    backgroundColor: '#58a6ff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#f0f6fc' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#8b949e' },
                        grid: { color: '#30363d' }
                    },
                    x: {
                        ticks: { color: '#8b949e' },
                        grid: { color: '#30363d' }
                    }
                }
            }
        });
    </script>
</body>
</html>
    `;
  }
}
