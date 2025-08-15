/**
 * Web Dashboard Panels - Migrated TUI functionality to web
 *
 * Converts key Terminal UI components to web dashboard panels
 * for a unified web-only interface experience.
 */

import { getLogger } from '../../config/logging-config';
import { getVersion } from '../../config/version';

export interface DashboardPanel {
  id: string;
  title: string;
  icon: string;
  content: string;
  data?: any;
}

export class WebDashboardPanels {
  private logger = getLogger('DashboardPanels');

  /**
   * Get system status panel (migrated from status.tsx)
   */
  getStatusPanel(): DashboardPanel {
    return {
      id: 'status',
      title: 'System Status',
      icon: '⚡',
      content: this.generateStatusHTML(),
    };
  }

  /**
   * Get swarm dashboard panel (migrated from swarm-dashboard.tsx)
   */
  getSwarmPanel(): DashboardPanel {
    return {
      id: 'swarm',
      title: 'Swarm Management',
      icon: '🐝',
      content: this.generateSwarmHTML(),
    };
  }

  /**
   * Get performance monitor panel (migrated from performance-monitor.tsx)
   */
  getPerformancePanel(): DashboardPanel {
    return {
      id: 'performance',
      title: 'Performance Monitor',
      icon: '📊',
      content: this.generatePerformanceHTML(),
    };
  }

  /**
   * Get logs viewer panel (migrated from logs-viewer.tsx)
   */
  getLogsPanel(): DashboardPanel {
    return {
      id: 'logs',
      title: 'Live Logs',
      icon: '📝',
      content: this.generateLogsHTML(),
    };
  }

  /**
   * Get settings panel (migrated from settings.tsx)
   */
  getSettingsPanel(): DashboardPanel {
    return {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      content: this.generateSettingsHTML(),
    };
  }

  /**
   * Get all dashboard panels
   */
  getAllPanels(): DashboardPanel[] {
    return [
      this.getStatusPanel(),
      this.getSwarmPanel(),
      this.getPerformancePanel(),
      this.getLogsPanel(),
      this.getSettingsPanel(),
    ];
  }

  private generateStatusHTML(): string {
    return `
      <div class="status-panel">
        <div class="status-grid">
          <div class="status-card">
            <div class="status-icon">🟢</div>
            <div class="status-info">
              <h3>Web Server</h3>
              <p>Healthy • ${getVersion()}</p>
            </div>
          </div>
          <div class="status-card">
            <div class="status-icon">📡</div>
            <div class="status-info">
              <h3>WebSocket</h3>
              <p>Connected • Real-time</p>
            </div>
          </div>
          <div class="status-card">
            <div class="status-icon">🧠</div>
            <div class="status-info">
              <h3>Neural Engine</h3>
              <p>Active • WASM</p>
            </div>
          </div>
          <div class="status-card">
            <div class="status-icon">💾</div>
            <div class="status-info">
              <h3>Memory</h3>
              <p id="memory-usage">Loading...</p>
            </div>
          </div>
        </div>
        <div class="uptime-info">
          <h4>Uptime: <span id="uptime">Loading...</span></h4>
        </div>
      </div>
    `;
  }

  private generateSwarmHTML(): string {
    return `
      <div class="swarm-panel">
        <div class="swarm-controls">
          <button class="btn btn-primary" onclick="initializeSwarm()">
            <span class="icon">🚀</span>
            Initialize Swarm
          </button>
          <button class="btn btn-secondary" onclick="refreshSwarmStatus()">
            <span class="icon">🔄</span>
            Refresh
          </button>
        </div>
        <div class="swarm-status">
          <div class="swarm-topology">
            <h4>Topology: <span id="topology">None</span></h4>
            <p>Agents: <span id="agent-count">0</span> active</p>
          </div>
          <div id="agent-list" class="agent-list">
            <div class="no-agents">No swarm initialized</div>
          </div>
        </div>
        <div class="task-queue">
          <h4>Task Queue</h4>
          <div id="task-list" class="task-list">
            <div class="no-tasks">No tasks queued</div>
          </div>
        </div>
      </div>
    `;
  }

  private generatePerformanceHTML(): string {
    return `
      <div class="performance-panel">
        <div class="performance-metrics">
          <div class="metric-card">
            <h4>CPU Usage</h4>
            <div class="progress-bar">
              <div class="progress-fill" id="cpu-progress" style="width: 0%"></div>
            </div>
            <span id="cpu-value">0%</span>
          </div>
          <div class="metric-card">
            <h4>Memory Usage</h4>
            <div class="progress-bar">
              <div class="progress-fill" id="memory-progress" style="width: 0%"></div>
            </div>
            <span id="memory-value">0 MB</span>
          </div>
          <div class="metric-card">
            <h4>Task Throughput</h4>
            <div class="throughput-chart">
              <canvas id="throughput-canvas" width="200" height="60"></canvas>
            </div>
            <span id="throughput-value">0 tasks/min</span>
          </div>
        </div>
        <div class="performance-history">
          <h4>Performance History</h4>
          <canvas id="performance-chart" width="400" height="200"></canvas>
        </div>
      </div>
    `;
  }

  private generateLogsHTML(): string {
    return `
      <div class="logs-panel">
        <div class="logs-controls">
          <select id="log-level" class="log-filter">
            <option value="all">All Levels</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
          <button class="btn btn-secondary" onclick="clearLogs()">
            <span class="icon">🗑️</span>
            Clear
          </button>
          <button class="btn btn-secondary" onclick="toggleAutoScroll()">
            <span class="icon">📜</span>
            Auto-scroll
          </button>
        </div>
        <div id="logs-container" class="logs-container">
          <div class="log-entry info">
            <span class="log-timestamp">[${new Date().toISOString()}]</span>
            <span class="log-level">INFO</span>
            <span class="log-message">Web dashboard initialized</span>
          </div>
        </div>
      </div>
    `;
  }

  private generateSettingsHTML(): string {
    return `
      <div class="settings-panel">
        <div class="settings-section">
          <h4>General Settings</h4>
          <div class="setting-item">
            <label>Theme:</label>
            <select id="theme-selector">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div class="setting-item">
            <label>Auto-refresh interval:</label>
            <input type="range" id="refresh-interval" min="1" max="60" value="5">
            <span id="refresh-value">5s</span>
          </div>
        </div>
        <div class="settings-section">
          <h4>Performance Settings</h4>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="real-time-updates" checked>
              Enable real-time updates
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="performance-monitoring" checked>
              Enable performance monitoring
            </label>
          </div>
        </div>
        <div class="settings-section">
          <h4>System Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <strong>Version:</strong> ${getVersion()}
            </div>
            <div class="info-item">
              <strong>Node.js:</strong> ${process.version}
            </div>
            <div class="info-item">
              <strong>Platform:</strong> ${process.platform}
            </div>
            <div class="info-item">
              <strong>Architecture:</strong> ${process.arch}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Default export
 */
export default WebDashboardPanels;