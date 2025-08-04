// Web Dashboard JavaScript
class ClaudeZenDashboard {
  constructor() {
    this.ws = null;
    this.currentTab = 'dashboard';
    this.data = {};
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.connectWebSocket();
    this.loadData();
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.menu-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadData();
      });
    }

    // Command execution
    const commandInput = document.getElementById('command');
    if (commandInput) {
      commandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.executeCommand();
        }
      });
    }
  }

  connectWebSocket() {
    // Use current page's host and port for WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // includes port
    this.ws = new WebSocket(`${protocol}//${host}/ws`);

    this.ws.onopen = () => {
      this.updateStatus('Connected', 'success');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleWebSocketMessage(message);
    };

    this.ws.onclose = () => {
      this.updateStatus('Disconnected', 'error');
      // Attempt to reconnect
      setTimeout(() => this.connectWebSocket(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.updateStatus('Error', 'error');
    };
  }

  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'data_update':
        this.data = { ...this.data, ...message.data };
        this.updateUI();
        break;
      case 'notification':
        this.showNotification(message.content, message.level);
        break;
      case 'command_result':
        this.showCommandResult(message.result);
        break;
    }
  }

  async loadData() {
    try {
      const [hives, plugins, stats, queens] = await Promise.all([
        fetch('/api/hives').then((r) => r.json()),
        fetch('/api/plugins').then((r) => r.json()),
        fetch('/api/stats').then((r) => r.json()),
        fetch('/api/queens/status').then((r) => r.json()),
      ]);

      this.data = { hives, plugins, stats, queens };
      this.updateUI();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  updateUI() {
    // Update stats
    const hiveCount = document.getElementById('hive-count');
    const pluginCount = document.getElementById('plugin-count');
    const sessionCount = document.getElementById('session-count');

    if (hiveCount) hiveCount.textContent = Object.keys(this.data.hives || {}).length;
    if (pluginCount) pluginCount.textContent = (this.data.plugins || []).length;
    if (sessionCount) sessionCount.textContent = this.data.stats?.sessions || 0;

    // Update current tab content
    this.updateTabContent(this.currentTab);
  }

  updateTabContent(tab) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach((content) => {
      content.style.display = 'none';
    });

    // Show selected tab content
    const selectedContent = document.getElementById(`${tab}-content`);
    if (selectedContent) {
      selectedContent.style.display = 'block';
    }

    // Update menu item active state
    document.querySelectorAll('.menu-item').forEach((item) => {
      item.classList.remove('active');
      if (item.dataset.tab === tab) {
        item.classList.add('active');
      }
    });
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.updateTabContent(tab);
  }

  toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);

    // Save theme preference
    localStorage.setItem('claude-zen-theme', newTheme);

    // Notify server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'theme_change',
          theme: newTheme,
        })
      );
    }
  }

  async executeCommand() {
    const input = document.getElementById('command');
    const command = input.value.trim();

    if (!command) return;

    // Clear input
    input.value = '';

    // Show loading state
    this.showNotification('Executing command...', 'info');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const result = await response.json();
      this.showCommandResult(result);
    } catch (error) {
      console.error('Failed to execute command:', error);
      this.showNotification('Failed to execute command', 'error');
    }
  }

  showNotification(message, level = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${level}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  showCommandResult(result) {
    const output = document.getElementById('command-output');
    if (output) {
      output.innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    }
  }

  updateStatus(status, level) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
      statusElement.textContent = status;
      statusElement.className = `status ${level}`;
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new ClaudeZenDashboard();
});

// Global command execution function
function _executeCommand() {
  if (window.dashboard) {
    window.dashboard.executeCommand();
  }
}
