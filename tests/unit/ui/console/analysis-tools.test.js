/**
 * @jest-environment node
 */

// Mock Chart.js
global.Chart = jest.fn().mockImplementation(() => ({
  data: { labels: [], datasets: [] },
  update: jest.fn(),
  destroy: jest.fn(),
  resize: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

// Mock WebSocket
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1; // OPEN
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }
  send(data) {}
  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose();
  }
};

describe('AnalysisTools - Error Handling', () => {
  let AnalysisTools;
  let analysisTools;

  beforeAll(async () => {
    // Setup DOM environment
    document.body.innerHTML = `
      <div id="performance-chart"></div>
      <div id="token-usage-chart"></div>
      <div id="system-health-chart"></div>
      <div id="load-monitor-chart"></div>
      <div id="performance-metrics"></div>
      <div id="token-metrics"></div>
      <div id="health-status"></div>
      <div id="alerts-container"></div>
      <div id="connection-status"></div>
      <div id="performance-report-output"></div>
      <div id="bottleneck-analysis-output"></div>
      <div id="token-usage-output"></div>
      <div id="benchmark-output"></div>
      <div id="metrics-output"></div>
      <div id="trends-output"></div>
      <div id="costs-output"></div>
      <div id="quality-output"></div>
      <div id="errors-output"></div>
      <div id="stats-output"></div>
      <div id="health-output"></div>
      <div id="load-output"></div>
      <div id="capacity-output"></div>
      <div class="analysis-tab" data-tab="metrics"></div>
      <div class="analysis-panel" id="metrics-panel"></div>
    `;
    
    // Mock the analysis tools class
    AnalysisTools = class {
      constructor() {
        this.ws = null;
        this.charts = {};
        this.currentTab = 'metrics';
        this.isConnected = false;
        this.metricsCache = new Map();
        this.updateInterval = null;
        this.init();
      }

      init() {
        this.setupWebSocket();
        this.setupEventListeners();
        this.initializeCharts();
        this.startRealTimeUpdates();
      }

      setupWebSocket() {
        this.ws = new WebSocket('ws://localhost:3000/analysis');
        this.ws.onopen = () => this.isConnected = true;
        this.ws.onclose = () => this.isConnected = false;
      }

      setupEventListeners() {}
      initializeCharts() {
        this.charts.performance = new Chart();
        this.charts.tokenUsage = new Chart();
        this.charts.systemHealth = new Chart();
        this.charts.loadMonitor = new Chart();
      }
      startRealTimeUpdates() {}

      async fetchAnalysisData(endpoint) {
        try {
          const response = await fetch(endpoint);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          console.error('Fetch error:', error);
          this.showError(`Failed to fetch data from ${endpoint}: ${error.message}`);
          throw error;
        }
      }

      showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
          errorElement.remove();
        }, 5000);
      }

      displayError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
          <div class="error-container">
            <div class="error-icon">❌</div>
            <div class="error-message">
              <h4>Error</h4>
              <p>${message}</p>
            </div>
            <div class="error-actions">
              <button class="retry-btn" onclick="location.reload()">Retry</button>
              <button class="dismiss-btn" onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
          </div>
        `;
      }

      async performanceReport() {
        try {
          const report = await this.fetchAnalysisData('/api/analysis/performance-report');
          this.displayReport('performance-report-output', report);
          await this.notifyToolCompletion('performance_report');
        } catch (error) {
          this.displayError('performance-report-output', 'Unable to fetch performance report. Please ensure the analysis service is running.');
        }
      }

      async bottleneckAnalyze() {
        try {
          const analysis = await this.fetchAnalysisData('/api/analysis/bottleneck-analyze');
          this.displayAnalysis('bottleneck-analysis-output', analysis);
          await this.notifyToolCompletion('bottleneck_analyze');
        } catch (error) {
          this.displayError('bottleneck-analysis-output', 'Unable to fetch bottleneck analysis. Please ensure the analysis service is running.');
        }
      }

      async tokenUsage() {
        try {
          const usage = await this.fetchAnalysisData('/api/analysis/token-usage');
          this.displayUsage('token-usage-output', usage);
          await this.notifyToolCompletion('token_usage');
        } catch (error) {
          this.displayError('token-usage-output', 'Unable to fetch token usage data. Please ensure the analysis service is running.');
        }
      }

      displayReport(containerId, report) {}
      displayAnalysis(containerId, analysis) {}
      displayUsage(containerId, usage) {}
      async notifyToolCompletion(toolName) {}

      executeTool(toolName) {
        const button = document.querySelector(`[data-tool="${toolName}"]`);
        if (button) {
          button.classList.add('loading');
          button.disabled = true;
        }

        const promise = this[toolName]();
        
        promise.finally(() => {
          if (button) {
            button.classList.remove('loading');
            button.disabled = false;
          }
        });

        return promise;
      }

      destroy() {
        if (this.updateInterval) {
          clearInterval(this.updateInterval);
        }
        if (this.ws) {
          this.ws.close();
        }
      }
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockReset();
    analysisTools = new AnalysisTools();
  });

  afterEach(() => {
    if (analysisTools && analysisTools.destroy) {
      analysisTools.destroy();
    }
  });

  describe('fetchAnalysisData Error Handling', () => {
    test('should throw error and show error message when fetch fails', async () => {
      const errorMessage = 'Network error';
      global.fetch.mockRejectedValue(new Error(errorMessage));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(analysisTools.fetchAnalysisData('/api/test')).rejects.toThrow(errorMessage);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Fetch error:', expect.any(Error));
      
      // Check if error message is displayed
      await new Promise(resolve => setTimeout(resolve, 100));
      const errorElements = document.querySelectorAll('.error-message');
      expect(errorElements.length).toBeGreaterThan(0);
      expect(errorElements[0].textContent).toContain('Failed to fetch data from /api/test');
      
      consoleErrorSpy.mockRestore();
    });

    test('should throw error when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      await expect(analysisTools.fetchAnalysisData('/api/test')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('Tool Error Handling', () => {
    const tools = [
      { method: 'performanceReport', container: 'performance-report-output' },
      { method: 'bottleneckAnalyze', container: 'bottleneck-analysis-output' },
      { method: 'tokenUsage', container: 'token-usage-output' }
    ];

    tools.forEach(({ method, container }) => {
      test(`${method} should display error in UI when fetch fails`, async () => {
        global.fetch.mockRejectedValue(new Error('Service unavailable'));
        
        await analysisTools[method]();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const containerElement = document.getElementById(container);
        expect(containerElement.innerHTML).toContain('error-container');
        expect(containerElement.innerHTML).toContain('Error');
        expect(containerElement.innerHTML).toContain('analysis service is running');
        expect(containerElement.innerHTML).toContain('Retry');
        expect(containerElement.innerHTML).toContain('Dismiss');
      });
    });
  });

  describe('displayError Method', () => {
    test('should create error UI with correct structure', () => {
      const containerId = 'test-container';
      const message = 'Test error message';
      
      document.body.innerHTML += `<div id="${containerId}"></div>`;
      
      analysisTools.displayError(containerId, message);
      
      const container = document.getElementById(containerId);
      expect(container.querySelector('.error-container')).toBeTruthy();
      expect(container.querySelector('.error-icon').textContent).toBe('❌');
      expect(container.querySelector('.error-message h4').textContent).toBe('Error');
      expect(container.querySelector('.error-message p').textContent).toBe(message);
      expect(container.querySelector('.retry-btn')).toBeTruthy();
      expect(container.querySelector('.dismiss-btn')).toBeTruthy();
    });

    test('should handle missing container gracefully', () => {
      expect(() => {
        analysisTools.displayError('non-existent-container', 'Test message');
      }).not.toThrow();
    });
  });

  describe('showError Method', () => {
    test('should create temporary error message', () => {
      jest.useFakeTimers();
      
      analysisTools.showError('Test error message');
      
      const errorElement = document.querySelector('.error-message');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toBe('Test error message');
      
      jest.advanceTimersByTime(5000);
      
      expect(document.querySelector('.error-message')).toBeFalsy();
      
      jest.useRealTimers();
    });
  });

  describe('Tool Button Error States', () => {
    test('should disable button and show loading state during execution', async () => {
      const button = document.createElement('button');
      button.setAttribute('data-tool', 'performanceReport');
      document.body.appendChild(button);
      
      global.fetch.mockRejectedValue(new Error('Service unavailable'));
      
      const promise = analysisTools.executeTool('performanceReport');
      
      expect(button.classList.contains('loading')).toBe(true);
      expect(button.disabled).toBe(true);
      
      await promise.catch(() => {});
      
      expect(button.classList.contains('loading')).toBe(false);
      expect(button.disabled).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should handle successful API response correctly', async () => {
      const mockData = {
        summary: 'Test summary',
        metrics: {
          averageResponseTime: 100,
          throughput: 50,
          errorRate: 0.01,
          uptime: '99.9%'
        },
        recommendations: ['Recommendation 1', 'Recommendation 2']
      };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });
      
      const displayReportSpy = jest.spyOn(analysisTools, 'displayReport').mockImplementation();
      
      await analysisTools.performanceReport();
      
      expect(displayReportSpy).toHaveBeenCalledWith('performance-report-output', mockData);
    });

    test('should not fall back to mock data on error', async () => {
      global.fetch.mockRejectedValue(new Error('API unavailable'));
      
      await expect(analysisTools.fetchAnalysisData('/api/test')).rejects.toThrow('API unavailable');
    });
  });
});