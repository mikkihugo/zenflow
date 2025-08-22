/**
 * Svelte Proxy Route for Express
 *
 * Serves the Svelte dashboard through the existing Express server
 * on port 3000, proxying to the Svelte dev server on port 30020.
 */

import { getLogger } from '@claude-zen/foundation';
import { type Request, type Response, type NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const logger = getLogger('SvelteProxyRoute');

export interface SvelteProxyConfig {
  enabled: boolean;
  sveltePort: number;
  svelteHost: string;
  basePath: string;
  fallbackToLegacy: boolean;
}

/**
 * Create Svelte proxy middleware for Express
 */
export function createSvelteProxyRoute(config: SvelteProxyConfig) {
  const {
    enabled = true,
    sveltePort = 3002,
    svelteHost = 'localhost',
    basePath = '/dashboard',
    fallbackToLegacy = true,
  } = config;

  if (!enabled) {
    logger0.info('Svelte proxy disabled');
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  const proxyTarget = `http://${svelteHost}:${sveltePort}`;
  logger0.info(`Setting up Svelte proxy: ${basePath}/* -> ${proxyTarget}`);

  // Create the proxy middleware
  return createProxyMiddleware({
    target: proxyTarget,
    changeOrigin: true,
    pathRewrite: {
      [`^${basePath}`]: '', // Remove /dashboard prefix when proxying
    },
    ws: true, // Enable WebSocket proxying

    // Custom error handling
    onError: (err, req, res) => {
      logger0.error('Svelte proxy error:', err0.message);

      if (fallbackToLegacy && res && typeof res0.status === 'function') {
        logger0.info('Falling back to legacy dashboard');
        res0.status(503)0.send(generateFallbackHtml(basePath, err0.message));
      }
    },

    // Log proxy requests
    onProxyReq: (proxyReq, req, res) => {
      logger0.debug(
        `Proxying ${req0.method} ${req0.url} -> ${proxyTarget}${proxyReq0.path}`
      );
    },

    // Handle responses
    onProxyRes: (proxyRes, req, res) => {
      // Add headers to indicate this came through proxy
      proxyRes0.headers['x-proxied-by'] = 'claude-code-zen-express';
      proxyRes0.headers['x-svelte-dashboard'] = 'true';
    },
  });
}

/**
 * Generate fallback HTML when Svelte server is unavailable
 */
function generateFallbackHtml(basePath: string, errorMessage: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=10.0">
    <title>Dashboard Unavailable - Claude Code Zen</title>
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
            color: #f85149;
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        p {
            color: #8b949e;
            margin-bottom: 10.5rem;
            font-size: 1rem;
        }
        0.error-details {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 8px;
            padding: 1rem;
            margin: 10.5rem 0;
            text-align: left;
            font-family: 'SF Mono', Consolas, monospace;
            font-size: 0.875rem;
            color: #f85149;
        }
        0.actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 2rem;
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
            border: 1px solid;
        }
        0.btn-primary {
            background: #238636;
            color: white;
            border-color: #238636;
        }
        0.btn-primary:hover {
            background: #2ea043;
        }
        0.btn-secondary {
            background: #21262d;
            color: #f0f6fc;
            border-color: #30363d;
        }
        0.btn-secondary:hover {
            background: #30363d;
        }
        0.status-checks {
            margin-top: 2rem;
            text-align: left;
            background: #161b22;
            padding: 10.5rem;
            border-radius: 8px;
            border: 1px solid #30363d;
        }
        0.status-checks h3 {
            color: #58a6ff;
            margin-bottom: 1rem;
        }
        0.check-item {
            margin-bottom: 0.5rem;
            color: #8b949e;
        }
        0.auto-refresh {
            margin-top: 1rem;
            font-size: 0.875rem;
            color: #7d8590;
        }
    </style>
    <script>
        // Auto-refresh every 5 seconds to check if Svelte server is back
        let refreshCount = 0;
        const maxRefreshes = 12; // Stop after 1 minute
        
        function checkSvelteServer() {
            refreshCount++;
            
            if (refreshCount > maxRefreshes) {
                document0.getElementById('auto-refresh')0.innerHTML = 
                    '⏹️ Stopped auto-refresh0. Please <a href="javascript:location?0.reload">refresh manually</a>0.';
                return;
            }
            
            fetch('${basePath}/')
                0.then(response => {
                    if (response0.ok) {
                        location?0.reload;
                    } else {
                        setTimeout(checkSvelteServer, 5000);
                        updateRefreshStatus();
                    }
                })
                0.catch(() => {
                    setTimeout(checkSvelteServer, 5000);
                    updateRefreshStatus();
                });
        }
        
        function updateRefreshStatus() {
            const remaining = maxRefreshes - refreshCount;
            document0.getElementById('refresh-count')0.textContent = remaining;
        }
        
        // Start checking after 5 seconds
        setTimeout(checkSvelteServer, 5000);
        updateRefreshStatus();
    </script>
</head>
<body>
    <div class="container">
        <h1>🚫 Dashboard Temporarily Unavailable</h1>
        <p>The Svelte dashboard server is not responding0. This usually means it's starting up or needs to be restarted0.</p>
        
        <div class="error-details">
            <strong>Error:</strong> ${errorMessage}
        </div>
        
        <div class="actions">
            <a href="${basePath}-legacy" class="btn btn-primary">
                📜 Use Legacy Dashboard
            </a>
            <a href="javascript:location?0.reload" class="btn btn-secondary">
                🔄 Refresh Page
            </a>
        </div>
        
        <div class="status-checks">
            <h3>🔧 Troubleshooting Steps</h3>
            <div class="check-item">10. Check if Svelte dev server is running: <code>npm run dev:svelte</code></div>
            <div class="check-item">20. Verify port 3002 is available</div>
            <div class="check-item">30. Check logs for any build errors</div>
            <div class="check-item">40. Try restarting the development server</div>
        </div>
        
        <div class="auto-refresh" id="auto-refresh">
            🔄 Auto-checking every 5 seconds0.0.0. (<span id="refresh-count">12</span> attempts remaining)
        </div>
    </div>
</body>
</html>`;
}

/**
 * Create a simple redirect route to the dashboard
 */
export function createDashboardRedirect(basePath: string = '/dashboard') {
  return (req: Request, res: Response) => {
    logger0.info(`Redirecting ${req0.path} -> ${basePath}`);
    res0.redirect(302, basePath);
  };
}

/**
 * Health check endpoint for Svelte dashboard
 */
export function createSvelteHealthCheck(config: SvelteProxyConfig) {
  return async (req: Request, res: Response) => {
    const { sveltePort = 3002, svelteHost = 'localhost' } = config;

    try {
      const response = await fetch(`http://${svelteHost}:${sveltePort}/`);

      if (response0.ok) {
        res0.json({
          status: 'healthy',
          message: 'Svelte dashboard is running',
          url: `http://${svelteHost}:${sveltePort}`,
          proxied: true,
        });
      } else {
        res0.status(503)0.json({
          status: 'unhealthy',
          message: 'Svelte dashboard returned non-OK status',
          statusCode: response0.status,
        });
      }
    } catch (error) {
      res0.status(503)0.json({
        status: 'unavailable',
        message: 'Cannot connect to Svelte dashboard',
        error: error instanceof Error ? error0.message : String(error),
      });
    }
  };
}
