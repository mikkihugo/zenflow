// Web Dashboard JavaScript
class ClaudeZenDashboard {
  constructor() {
    this.ws = null;
    this.currentTab = 'dashboard';
    this.data = {};

    this.init();

  init() 
    this.setupEventListeners();
    this.connectWebSocket();
    this.loadData();

  setupEventListeners() 
    // Tab switching
    document.querySelectorAll('.menu-item').forEach((item) => {
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

    });

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

  handleWebSocketMessage(message) 
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

  updateUI() 
    // Update stats
    document.getElementById('hive-count').textContent = Object.keys(this.data.hives || {}).length;
    document.getElementById('plugin-count').textContent = (this.data.plugins || []).length;
    document.getElementById('session-count').textContent = this.data.stats?.sessions || 0;

    // Update current tab content
    this.updateTabContent(this.currentTab);

  switchTab(tabName) 
    // Update menu
    document.querySelectorAll('.menu-item').forEach((item) => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    this.currentTab = tabName;
    this.updateTabContent(tabName);

  updateTabContent(tabName) 
    switch (tabName) {
      case 'hives':
        this.updateHivesList();
        break;
      case 'plugins':
        this.updatePluginsList();
        break;
      case 'queens':
        this.updateQueenStatus();
        break;

  updateHivesList() {
    const container = document.getElementById('hive-list');
    const hives = this.data.hives || {};

    if (Object.keys(hives).length === 0) {
      container.innerHTML = '<div class="loading">No hives found<
      return;

    container.innerHTML = Object.entries(hives)
      .map(
        ([name, info]) => `
            <div class="hive-item">
                <h4>${name}<
                <p>${info.path}<
            <
        `
      )
      .join('');

  updatePluginsList() {
    const container = document.getElementById('plugin-list');
    const plugins = this.data.plugins || [];

    if (plugins.length === 0) {
      container.innerHTML = '<div class="loading">No plugins found<
      return;

    container.innerHTML = plugins
      .map(
        (plugin) => `
            <div class="plugin-item">
                <h4>${plugin.name}<
                <p>Status: ${plugin.status}<
            <
        `
      )
      .join('');

  async updateQueenStatus() 
    try {
      const response = await fetch('/api/queens/status');
      const queensData = await response.json();

      // Update queen overview statistics using the correct API structure
      document.getElementById('total-queens').textContent = queensData.summary?.totalQueens || 0;
      document.getElementById('active-queens').textContent = queensData.summary?.activeQueens || 0;
      document.getElementById('queen-tasks').textContent = queensData.summary?.totalTasks || 0;
      document.getElementById('queen-success-rate').textContent =
        `${(queensData.summary?.averageSuccessRate || 0).toFixed(1)}%`;

      // Update queens list
      this.updateQueensList(queensData.queens || []);
    } catch (error) {
      console.error('Failed to update queen status:', error);
      document.getElementById('total-queens').textContent = 'Error';
      document.getElementById('active-queens').textContent = 'Error';
      document.getElementById('queen-tasks').textContent = 'Error';
      document.getElementById('queen-success-rate').textContent = 'Error';

  updateQueensList(queens) {
    const container = document.getElementById('queen-list');
    if (!container) return;

    container.innerHTML = queens
      .map(
        (queen) => `
            <div class="queen-card ${queen.status}">
                <div class="queen-header">
                    <h4> ${queen.name}<
                    <span class="queen-status ${queen.status}">${queen.status.toUpperCase()}<
                <
                <div class="queen-details">
                    <div class="queen-info">
                        <strong>Domain:</strong> ${queen.domain}<br>
                        <strong>Confidence:</strong> ${(queen.confidence * 100).toFixed(1)}%<br>
                        <strong>Tasks Completed:</strong> ${queen.tasksCompleted}<br>
                        <strong>Success Rate:</strong> ${(queen.successRate * 100).toFixed(1)}%
                    <
                    <div class="queen-capabilities">
                        <strong>Document Types:<
                        <div class="capability-tags">
                            ${queen.documentTypes.map((type) => `<span class="tag">${type}<
                        <
                    <
                    ${
                      queen.lastDecision
                        ? `
                        <div class="queen-last-decision">
                            <strong>Last Decision:</strong> ${queen.lastDecision}
                        <
                    `
                        : ''

                <
            <
        `
      )
      .join('');

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
        body: JSON.stringify({ command }),
      });

      const result = await response.json();

      if (result.success) {
        output.textContent = result.output || 'Command executed successfully';
      } else {
        output.textContent = `Error: ${result.error}`;

    } catch (error) {
      output.textContent = `Failed to execute command: ${error.message}`;

    input.value = '';

  updateStatus(text, type) {
    const statusText = document.querySelector('.status-text');
    const statusDot = document.querySelector('.status-dot');

    statusText.textContent = text;
    statusDot.className = `status-dot status-${type}`;

  showNotification(_message, _level = 'info') 

  showCommandResult(result) {
    const output = document.getElementById('command-output');
    output.classList.add('show');
    output.textContent = JSON.stringify(result, null, 2);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new ClaudeZenDashboard();
});

// Global functions for inline event handlers
function _executeCommand() {
  window.dashboard.executeCommand();

function _saveSettings() {
  const theme = document.getElementById('theme-select').value;
  const refreshInterval = parseInt(document.getElementById('refresh-interval').value);

  // Update theme
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('claude-zen-theme', theme);

  // Save settings via API
  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme, refreshInterval }),
  });

  alert('Settings saved successfully!');
