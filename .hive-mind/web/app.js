
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
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadData();
        });
        
        // Command execution
        document.getElementById('command').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand();
            }
        });
    }
    
    connectWebSocket() {
        const wsPort = 3031;
        this.ws = new WebSocket(`ws://localhost:${wsPort}`);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.updateStatus('Connected', 'success');
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
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
            const [hives, plugins, stats] = await Promise.all([
                fetch('/api/hives').then(r => r.json()),
                fetch('/api/plugins').then(r => r.json()),
                fetch('/api/stats').then(r => r.json())
            ]);
            
            this.data = { hives, plugins, stats };
            this.updateUI();
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }
    
    updateUI() {
        // Update stats
        document.getElementById('hive-count').textContent = 
            Object.keys(this.data.hives || {}).length;
        document.getElementById('plugin-count').textContent = 
            (this.data.plugins || []).length;
        document.getElementById('session-count').textContent = 
            this.data.stats?.sessions || 0;
        
        // Update current tab content
        this.updateTabContent(this.currentTab);
    }
    
    switchTab(tabName) {
        // Update menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        this.updateTabContent(tabName);
    }
    
    updateTabContent(tabName) {
        switch (tabName) {
            case 'hives':
                this.updateHivesList();
                break;
            case 'plugins':
                this.updatePluginsList();
                break;
        }
    }
    
    updateHivesList() {
        const container = document.getElementById('hive-list');
        const hives = this.data.hives || {};
        
        if (Object.keys(hives).length === 0) {
            container.innerHTML = '<div class="loading">No hives found</div>';
            return;
        }
        
        container.innerHTML = Object.entries(hives).map(([name, info]) => `
            <div class="hive-item">
                <h4>${name}</h4>
                <p>${info.path}</p>
            </div>
        `).join('');
    }
    
    updatePluginsList() {
        const container = document.getElementById('plugin-list');
        const plugins = this.data.plugins || [];
        
        if (plugins.length === 0) {
            container.innerHTML = '<div class="loading">No plugins found</div>';
            return;
        }
        
        container.innerHTML = plugins.map(plugin => `
            <div class="plugin-item">
                <h4>${plugin.name}</h4>
                <p>Status: ${plugin.status}</p>
            </div>
        `).join('');
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
            this.ws.send(JSON.stringify({
                type: 'theme_change',
                theme: newTheme
            }));
        }
    }
    
    async executeCommand() {
        const input = document.getElementById('command');
        const output = document.getElementById('command-output');
        const command = input.value.trim();
        
        if (!command) return;
        
        output.classList.add('show');
        output.textContent = 'Executing command...';
        
        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            
            const result = await response.json();
            
            if (result.success) {
                output.textContent = result.output || 'Command executed successfully';
            } else {
                output.textContent = `Error: ${result.error}`;
            }
        } catch (error) {
            output.textContent = `Failed to execute command: ${error.message}`;
        }
        
        input.value = '';
    }
    
    updateStatus(text, type) {
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        
        statusText.textContent = text;
        statusDot.className = `status-dot status-${type}`;
    }
    
    showNotification(message, level = 'info') {
        // Simple notification - could be enhanced with a proper notification system
        console.log(`[${level.toUpperCase()}] ${message}`);
    }
    
    showCommandResult(result) {
        const output = document.getElementById('command-output');
        output.classList.add('show');
        output.textContent = JSON.stringify(result, null, 2);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ClaudeZenDashboard();
});

// Global functions for inline event handlers
function executeCommand() {
    window.dashboard.executeCommand();
}

function saveSettings() {
    const theme = document.getElementById('theme-select').value;
    const refreshInterval = parseInt(document.getElementById('refresh-interval').value);
    
    // Update theme
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('claude-zen-theme', theme);
    
    // Save settings via API
    fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, refreshInterval })
    });
    
    alert('Settings saved successfully!');
}
