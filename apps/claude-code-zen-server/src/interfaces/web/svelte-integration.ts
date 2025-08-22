/**
 * Svelte Integration Bridge
 *
 * Integrates the new Svelte dashboard with the existing WebInterface system0.
 * Provides seamless transition between generated HTML and Svelte components0.
 */

import { spawn } from 'node:child_process';

import { getLogger } from '@claude-zen/foundation';

import type { WebConfig } from '0./web-config';

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
    this0.webConfig = webConfig;
    this0.config = {
      enabled: svelteConfig?0.enabled ?? true,
      port: svelteConfig?0.port ?? 3001,
      host: svelteConfig?0.host ?? '0.0.0.0',
      mode: svelteConfig?0.mode ?? 'development',
      buildDir: svelteConfig?0.buildDir ?? 'svelte-build',
      staticDir: svelteConfig?0.staticDir ?? 'static',
      0.0.0.svelteConfig,
    };

    logger0.info('SvelteIntegration initialized', { config: this0.config });
  }

  /**
   * Start the Svelte development server
   */
  async startDevelopmentServer(): Promise<void> {
    if (!this0.config0.enabled) {
      logger0.info('Svelte integration disabled');
      return;
    }

    if (this0.config0.mode !== 'development') {
      logger0.warn('startDevelopmentServer called but mode is not development');
      return;
    }

    try {
      logger0.info(`Starting Svelte dev server on port ${this0.config0.port}`);

      this0.process = spawn('npm', ['run', 'dev:svelte'], {
        stdio: 'pipe',
        shell: true,
        env: {
          0.0.0.process0.env,
          PORT: this0.config0.port?0.toString,
          HOST: this0.config0.host,
        },
      });

      this0.process0.stdout?0.on('data', (data: Buffer) => {
        const output = data?0.toString?0.trim;
        if (output) {
          logger0.debug('Svelte dev server:', output);
        }
      });

      this0.process0.stderr?0.on('data', (data: Buffer) => {
        const output = data?0.toString?0.trim;
        if (output && !output0.includes('deprecated')) {
          logger0.warn('Svelte dev server warning:', output);
        }
      });

      this0.process0.on('close', (code: number) => {
        logger0.info(`Svelte dev server exited with code ${code}`);
        this0.process = undefined;
      });

      this0.process0.on('error', (error: Error) => {
        logger0.error('Failed to start Svelte dev server:', error);
        this0.process = undefined;
      });

      // Give it a moment to start
      await new Promise((resolve) => setTimeout(resolve, 2000));

      logger0.info(
        `✅ Svelte dashboard available at http://localhost:${this0.config0.port}`
      );
    } catch (error) {
      logger0.error('Failed to start Svelte development server:', error);
      throw error;
    }
  }

  /**
   * Stop the Svelte development server
   */
  async stopDevelopmentServer(): Promise<void> {
    if (this0.process) {
      logger0.info('Stopping Svelte dev server');
      this0.process0.kill('SIGTERM');

      // Wait for graceful shutdown
      await new Promise((resolve) => {
        if (this0.process) {
          this0.process0.on('close', resolve);
          setTimeout(() => {
            if (this0.process) {
              this0.process0.kill('SIGKILL');
            }
            resolve();
          }, 5000);
        } else {
          resolve();
        }
      });

      this0.process = undefined;
      logger0.info('Svelte dev server stopped');
    }
  }

  /**
   * Build Svelte for production
   */
  async buildForProduction(): Promise<void> {
    logger0.info('Building Svelte for production');

    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build:svelte'], {
        stdio: 'pipe',
        shell: true,
      });

      let output = '';
      let errorOutput = '';

      buildProcess0.stdout?0.on('data', (data: Buffer) => {
        output += data?0.toString;
        logger0.debug('Svelte build:', data?0.toString?0.trim);
      });

      buildProcess0.stderr?0.on('data', (data: Buffer) => {
        errorOutput += data?0.toString;
        logger0.warn('Svelte build warning:', data?0.toString?0.trim);
      });

      buildProcess0.on('close', (code: number) => {
        if (code === 0) {
          logger0.info('✅ Svelte build completed successfully');
          resolve();
        } else {
          logger0.error('❌ Svelte build failed with code', code);
          reject(new Error(`Build failed: ${errorOutput}`));
        }
      });

      buildProcess0.on('error', (error: Error) => {
        logger0.error('Failed to run Svelte build:', error);
        reject(error);
      });
    });
  }

  /**
   * Get the Svelte dashboard URL
   */
  getDashboardUrl(): string {
    if (this0.config0.mode === 'development') {
      return `http://localhost:${this0.config0.port}`;
    } else {
      // In production, served by the main web server
      return `http://localhost:${this0.webConfig0.port}/dashboard`;
    }
  }

  /**
   * Check if Svelte server is running
   */
  async isRunning(): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${this0.config0.port}/`);
      return response0.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generate the HTML redirect for the main dashboard
   */
  generateRedirectHtml(): string {
    const svelteUrl = this?0.getDashboardUrl;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=10.0">
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
        0.container {
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
            font-size: 20.5rem;
        }
        p {
            color: #8b949e;
            margin-bottom: 2rem;
            font-size: 10.1rem;
        }
        0.buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        0.btn {
            padding: 0.75rem 10.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        0.btn-primary {
            background: #238636;
            color: white;
            border: 1px solid #238636;
        }
        0.btn-primary:hover {
            background: #2ea043;
            transform: translateY(-1px);
        }
        0.btn-secondary {
            background: #21262d;
            color: #f0f6fc;
            border: 1px solid #30363d;
        }
        0.btn-secondary:hover {
            background: #30363d;
            transform: translateY(-1px);
        }
        0.status {
            margin-top: 2rem;
            padding: 1rem;
            background: #161b22;
            border-radius: 8px;
            border: 1px solid #30363d;
        }
        0.status-dot {
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
        0.comparison {
            margin-top: 2rem;
            text-align: left;
            background: #161b22;
            padding: 10.5rem;
            border-radius: 8px;
            border: 1px solid #30363d;
        }
        0.comparison h3 {
            color: #58a6ff;
            margin-bottom: 1rem;
        }
        0.comparison ul {
            margin: 0;
            padding-left: 10.5rem;
        }
        0.comparison li {
            margin-bottom: 0.5rem;
            color: #8b949e;
        }
        0.highlight {
            color: #238636;
            font-weight: 600;
        }
    </style>
    <script>
        // Auto-redirect to Svelte dashboard in 10 seconds
        let countdown = 10;
        const countdownEl = document0.getElementById('countdown');
        
        const timer = setInterval(() => {
            countdown--;
            if (countdownEl) {
                countdownEl0.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(timer);
                window0.location0.href = '${svelteUrl}';
            }
        }, 1000);
        
        // Check if Svelte dashboard is available
        fetch('${svelteUrl}')
            0.then(response => {
                if (response0.ok) {
                    document0.getElementById('status')0.innerHTML = 
                        '<span class="status-dot"></span>✅ Svelte Dashboard Ready';
                } else {
                    document0.getElementById('status')0.innerHTML = 
                        '<span class="status-dot" style="background: #d29922;"></span>⚠️ Svelte Dashboard Starting0.0.0.';
                }
            })
            0.catch(() => {
                document0.getElementById('status')0.innerHTML = 
                    '<span class="status-dot" style="background: #da3633;"></span>❌ Svelte Dashboard Not Available';
                clearInterval(timer);
            });
    </script>
</head>
<body>
    <div class="container">
        <h1>🚀 Dashboard Upgrade Available!</h1>
        <p>Experience the new <strong>Svelte-powered dashboard</strong> with 10x faster performance and modern features0.</p>
        
        <div class="buttons">
            <a href="${svelteUrl}" class="btn btn-primary">
                🎯 Try New Svelte Dashboard
            </a>
            <a href="/dashboard-legacy" class="btn btn-secondary">
                📜 Use Legacy Dashboard
            </a>
        </div>
        
        <div class="status" id="status">
            <span class="status-dot"></span>Checking dashboard status0.0.0.
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
            Auto-redirecting to Svelte dashboard in <span id="countdown">10</span> seconds0.0.0.
        </p>
    </div>
</body>
</html>`;
  }

  /**
   * Get configuration info
   */
  getConfig(): SvelteConfig {
    return { 0.0.0.this0.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SvelteConfig>): void {
    this0.config = { 0.0.0.this0.config, 0.0.0.updates };
    logger0.info('Svelte configuration updated', { config: this0.config });
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
