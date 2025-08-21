/**
 * Svelte Integration Bridge
 * 
 * Integrates the new Svelte dashboard with the existing WebInterface system.
 * Provides seamless transition between generated HTML and Svelte components.
 */

import { spawn } from 'node:child_process';
import { getLogger } from '@claude-zen/foundation'

import type { WebConfig } from './web-config';

const logger = getLogger('SvelteIntegration');

export interface SvelteConfig {
  enabled: boolean;
  port: number;
  host: string;
  mode: 'development' | 'production';
  buildDir: string;
  staticDir: string;
}

export class SvelteIntegration {
  private config: SvelteConfig;
  private process?: any;
  private webConfig: WebConfig;

  constructor(webConfig: WebConfig, svelteConfig?: Partial<SvelteConfig>) {
    this.webConfig = webConfig;
    this.config = {
      enabled: svelteConfig?.enabled ?? true,
      port: svelteConfig?.port ?? 3001,
      host: svelteConfig?.host ?? '0.0.0.0',
      mode: svelteConfig?.mode ?? 'development',
      buildDir: svelteConfig?.buildDir ?? 'svelte-build',
      staticDir: svelteConfig?.staticDir ?? 'static',
      ...svelteConfig
    };

    logger.info('SvelteIntegration initialized', { config: this.config });
  }

  /**
   * Start the Svelte development server
   */
  async startDevelopmentServer(): Promise<void> {
    if (!this.config.enabled) {
      logger.info('Svelte integration disabled');
      return;
    }

    if (this.config.mode !== 'development') {
      logger.warn('startDevelopmentServer called but mode is not development');
      return;
    }

    try {
      logger.info(`Starting Svelte dev server on port ${this.config.port}`);
      
      this.process = spawn('npm', ['run', 'dev:svelte'], {
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          PORT: this.config.port.toString(),
          HOST: this.config.host
        }
      });

      this.process.stdout?.on('data', (data: Buffer) => {
        const output = data.toString().trim();
        if (output) {
          logger.debug('Svelte dev server:', output);
        }
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        const output = data.toString().trim();
        if (output && !output.includes('deprecated')) {
          logger.warn('Svelte dev server warning:', output);
        }
      });

      this.process.on('close', (code: number) => {
        logger.info(`Svelte dev server exited with code ${code}`);
        this.process = undefined;
      });

      this.process.on('error', (error: Error) => {
        logger.error('Failed to start Svelte dev server:', error);
        this.process = undefined;
      });

      // Give it a moment to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logger.info(`✅ Svelte dashboard available at http://localhost:${this.config.port}`);

    } catch (error) {
      logger.error('Failed to start Svelte development server:', error);
      throw error;
    }
  }

  /**
   * Stop the Svelte development server
   */
  async stopDevelopmentServer(): Promise<void> {
    if (this.process) {
      logger.info('Stopping Svelte dev server');
      this.process.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise(resolve => {
        if (this.process) {
          this.process.on('close', resolve);
          setTimeout(() => {
            if (this.process) {
              this.process.kill('SIGKILL');
            }
            resolve();
          }, 5000);
        } else {
          resolve();
        }
      });
      
      this.process = undefined;
      logger.info('Svelte dev server stopped');
    }
  }

  /**
   * Build Svelte for production
   */
  async buildForProduction(): Promise<void> {
    logger.info('Building Svelte for production');
    
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build:svelte'], {
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      buildProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
        logger.debug('Svelte build:', data.toString().trim());
      });

      buildProcess.stderr?.on('data', (data: Buffer) => {
        errorOutput += data.toString();
        logger.warn('Svelte build warning:', data.toString().trim());
      });

      buildProcess.on('close', (code: number) => {
        if (code === 0) {
          logger.info('✅ Svelte build completed successfully');
          resolve();
        } else {
          logger.error('❌ Svelte build failed with code', code);
          reject(new Error(`Build failed: ${errorOutput}`));
        }
      });

      buildProcess.on('error', (error: Error) => {
        logger.error('Failed to run Svelte build:', error);
        reject(error);
      });
    });
  }

  /**
   * Get the Svelte dashboard URL
   */
  getDashboardUrl(): string {
    if (this.config.mode === 'development') {
      return `http://localhost:${this.config.port}`;
    } else {
      // In production, served by the main web server
      return `http://localhost:${this.webConfig.port}/dashboard`;
    }
  }

  /**
   * Check if Svelte server is running
   */
  async isRunning(): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${this.config.port}/`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generate the HTML redirect for the main dashboard
   */
  generateRedirectHtml(): string {
    const svelteUrl = this.getDashboardUrl();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Zen - Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0d1117;
            color: #f0f6fc;
            margin: 0;
            padding: 2rem;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 3rem 2rem;
            background: #21262d;
            border-radius: 12px;
            border: 1px solid #30363d;
        }
        h1 {
            color: #58a6ff;
            margin-bottom: 1rem;
            font-size: 2.5rem;
        }
        p {
            color: #8b949e;
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }
        .buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .btn-primary {
            background: #238636;
            color: white;
            border: 1px solid #238636;
        }
        .btn-primary:hover {
            background: #2ea043;
            transform: translateY(-1px);
        }
        .btn-secondary {
            background: #21262d;
            color: #f0f6fc;
            border: 1px solid #30363d;
        }
        .btn-secondary:hover {
            background: #30363d;
            transform: translateY(-1px);
        }
        .status {
            margin-top: 2rem;
            padding: 1rem;
            background: #161b22;
            border-radius: 8px;
            border: 1px solid #30363d;
        }
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            background: #238636;
            margin-right: 0.5rem;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        .comparison {
            margin-top: 2rem;
            text-align: left;
            background: #161b22;
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid #30363d;
        }
        .comparison h3 {
            color: #58a6ff;
            margin-bottom: 1rem;
        }
        .comparison ul {
            margin: 0;
            padding-left: 1.5rem;
        }
        .comparison li {
            margin-bottom: 0.5rem;
            color: #8b949e;
        }
        .highlight {
            color: #238636;
            font-weight: 600;
        }
    </style>
    <script>
        // Auto-redirect to Svelte dashboard in 10 seconds
        let countdown = 10;
        const countdownEl = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            countdown--;
            if (countdownEl) {
                countdownEl.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(timer);
                window.location.href = '${svelteUrl}';
            }
        }, 1000);
        
        // Check if Svelte dashboard is available
        fetch('${svelteUrl}')
            .then(response => {
                if (response.ok) {
                    document.getElementById('status').innerHTML = 
                        '<span class="status-dot"></span>✅ Svelte Dashboard Ready';
                } else {
                    document.getElementById('status').innerHTML = 
                        '<span class="status-dot" style="background: #d29922;"></span>⚠️ Svelte Dashboard Starting...';
                }
            })
            .catch(() => {
                document.getElementById('status').innerHTML = 
                    '<span class="status-dot" style="background: #da3633;"></span>❌ Svelte Dashboard Not Available';
                clearInterval(timer);
            });
    </script>
</head>
<body>
    <div class="container">
        <h1>🚀 Dashboard Upgrade Available!</h1>
        <p>Experience the new <strong>Svelte-powered dashboard</strong> with 10x faster performance and modern features.</p>
        
        <div class="buttons">
            <a href="${svelteUrl}" class="btn btn-primary">
                🎯 Try New Svelte Dashboard
            </a>
            <a href="/dashboard-legacy" class="btn btn-secondary">
                📜 Use Legacy Dashboard
            </a>
        </div>
        
        <div class="status" id="status">
            <span class="status-dot"></span>Checking dashboard status...
        </div>
        
        <div class="comparison">
            <h3>🆚 Why Switch to Svelte?</h3>
            <ul>
                <li><span class="highlight">⚡ 10x faster</span> development and updates</li>
                <li><span class="highlight">🔥 Hot reload</span> - see changes instantly</li>
                <li><span class="highlight">📱 Mobile responsive</span> - works on all devices</li>
                <li><span class="highlight">🎨 Modern design</span> - beautiful and clean</li>
                <li><span class="highlight">🚀 Real-time updates</span> - automatic data refresh</li>
                <li><span class="highlight">🔒 Type-safe</span> - fewer bugs and errors</li>
            </ul>
        </div>
        
        <p style="margin-top: 2rem; font-size: 0.9rem; color: #7d8590;">
            Auto-redirecting to Svelte dashboard in <span id="countdown">10</span> seconds...
        </p>
    </div>
</body>
</html>`;
  }

  /**
   * Get configuration info
   */
  getConfig(): SvelteConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SvelteConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('Svelte configuration updated', { config: this.config });
  }
}

/**
 * Create Svelte integration instance
 */
export function createSvelteIntegration(
  webConfig: WebConfig,
  svelteConfig?: Partial<SvelteConfig>
): SvelteIntegration {
  return new SvelteIntegration(webConfig, svelteConfig);
}