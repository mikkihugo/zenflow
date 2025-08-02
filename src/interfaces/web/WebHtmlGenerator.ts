/**
 * Web HTML Generator - Inline HTML generation
 *
 * Generates inline HTML dashboard when no React build is available.
 * Provides fallback UI with basic functionality and theming support.
 */

import type { WebConfig } from './WebConfig.js';

export class WebHtmlGenerator {
  private config: WebConfig;

  constructor(config: WebConfig) {
    this.config = config;
  }

  /**
   * Generate complete inline HTML dashboard
   */
  generateDashboardHtml(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Flow - Web Dashboard</title>
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
   * Generate CSS styles based on theme
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
   * Generate HTML header section
   */
  private generateHeader(): string {
    return `
        <div class="header">
            <h1>🧠 Claude Code Flow</h1>
            <p>AI-Powered Development Toolkit - Web Dashboard</p>
            <div class="realtime-indicator">
                Real-time updates ${this.config.realTime ? 'enabled' : 'disabled'}
            </div>
        </div>
    `;
  }

  /**
   * Generate main dashboard content
   */
  private generateMainContent(): string {
    return `
        <div class="grid">
            ${this.generateSystemStatusCard()}
            ${this.generateSwarmsCard()}
            ${this.generateTasksCard()}
            ${this.generateApiCard()}
            ${this.generateMetricsCard()}
            ${this.generateQuickActionsCard()}
        </div>
    `;
  }

  /**
   * Generate system status card
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
   * Generate swarms status card
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
   * Generate tasks status card
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
   * Generate API endpoints card
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
   * Generate performance metrics card
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
   * Generate quick actions card
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
   * Generate footer section
   */
  private generateFooter(): string {
    return `
        <div class="footer">
            <p>Claude Code Flow Web Dashboard</p>
            <p>Running on ${this.config.host}:${this.config.port} | 
               Theme: ${this.config.theme} | 
               Real-time: ${this.config.realTime ? 'enabled' : 'disabled'}
            </p>
        </div>
    `;
  }

  /**
   * Generate JavaScript for interactivity and real-time updates
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
        
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Claude Code Flow Dashboard initialized');
            
            // Update uptime immediately
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
   * Generate WebSocket code for real-time updates
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
        
        socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
        });
    `;
  }

  /**
   * Generate polling code for non-real-time updates
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
}
