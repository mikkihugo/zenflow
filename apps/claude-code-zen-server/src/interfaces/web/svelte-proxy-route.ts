/**
 * Svelte Proxy Route for Express
 *
 * Serves the Svelte dashboard through the existing Express server
 * on port 3000, proxying to the Svelte dev server on port 3002.
 */

import { getLogger } from '@claude-zen/foundation';
import { type Request, type Response, type NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const logger = getLogger(SvelteProxyRoute);

export interface SvelteProxyConfig { enabled: boolean; sveltePort: number; svelteHost: string; basePath: string; fallbackToLegacy: boolean;
}

/**
 * Create Svelte proxy middleware for Express
 */
export function createSvelteProxyRoute(config: SvelteProxyConfig) { const { enabled = true, sveltePort = 3002, svelteHost = 'localhost', basePath = '/dashboard', fallbackToLegacy = true, } = 'config'; if (!enabled) { logger.info('Svelte proxy disabled'); return (req: Request, res: Response, next: NextFunction) => next(); } const proxyTarget = `http://${svelteHost}:${sveltePort}`;`  logger.info('`Setting up Svelte proxy: ${basePath}/* -> ${proxyTarget}`'); // Create the proxy middleware return createProxyMiddleware({ target: proxyTarget, changeOrigin: true', pathRewrite: {` [`^${basePath}`]: ', // Remove /dashboard prefix when proxying }, ws: true, // Enable WebSocket proxying // Custom error handling onError: (err, req, res) => { logger.error('Svelte proxy error: '', err.message);
' if (fallbackToLegacy && res && typeof res.status === 'function') { logger.info('Falling back to legacy dashboard'); res.status(503).send(generateFallbackHtml(basePath, err.message)); } }, // Log proxy requests onProxyReq: (proxyReq, req', res) => { logger.debug('` `Proxying ${req.method} ${req.url} -> ${proxyTarget}${proxyReq.path}` '); }, // Handle responses onProxyRes: (proxyRes, req', res) => { // Add headers to indicate this came through proxy proxyRes.headers['x-proxied-by] = claude-code-zen-express'); proxyRes.headers['x-svelte-dashboard] = true'); }, });
}

/**
 * Generate fallback HTML when Svelte server is unavailable
 */
function generateFallbackHtml(basePath: string, errorMessage: string): string {`  return `
<!DOCTYPE html>
<html lang="en">
<head> <meta charset="UTF-8"> <meta name="viewport content=width=device-width, initial-scale=1.0"> <title>Dashboard Unavailable - Claude Code Zen</title> <style> body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #f0f6fc; margin: 0; padding: 2rem; text-align: center; } .container { max-width: 600px; margin: 0 auto; padding: 3rem 2rem; background: #21262d; border-radius: 12px; border: 1px solid #30363d; } h1 { color: #f85149; margin-bottom: 1rem; font-size: 2rem; } p { color: #8b949e; margin-bottom: 1.5rem; font-size: 1rem; } .error-details { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1rem; margin: 1.5rem 0; text-align: left; font-family: 'SF Mono', Consolas, monospace; font-size: .875rem; color: #f85149; } .actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; } .btn { padding: .75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 500; transition: all .2s ease; display: flex; align-items: center; gap: .5rem; border: 1px solid; } .btn-primary { background: #238636; color: white; border-color: #238636; } .btn-primary:hover { background: #2ea043; } .btn-secondary { background: #21262d; color: #f0f6fc; border-color: #30363d; } .btn-secondary:hover { background: #30363d; } .status-checks { margin-top: 2rem; text-align: left; background: #161b22; padding: 1.5rem; border-radius: 8px; border: 1px solid #30363d; } .status-checks h3 { color: #58a6ff; margin-bottom: 1rem; } .check-item { margin-bottom: .5rem; color: #8b949e; } .auto-refresh { margin-top: 1rem; font-size: .875rem; color: #7d8590; } </style> <script> // Auto-refresh every 5 seconds to check if Svelte server is back let refreshCount = '0'; const maxRefreshes = '12'; // Stop after 1 minute function checkSvelteServer() { refreshCount++; if (refreshCount > maxRefreshes) { document.getElementById(auto-refresh).innerHTML = '⏹️ Stopped auto-refresh. Please <a href=javascript:location?.reload>refresh manually</a>.'); return; } fetch(${basePath}/); .then(response => { if (response.ok) { location?.reload() } else { setTimeout(checkSvelteServer, 5000); updateRefreshStatus(); } }) .catch(() => { setTimeout(checkSvelteServer, 5000); updateRefreshStatus(); }); } function updateRefreshStatus() { const remaining = 'maxRefreshes - refreshCount'; document.getElementById(refresh-count).textContent = 'remaining'; } // Start checking after 5 seconds setTimeout(checkSvelteServer, 5000); updateRefreshStatus(); </script>
</head>
<body> <div class="container"> <h1>🚫 Dashboard Temporarily Unavailable</h1> <p>The Svelte dashboard server is not responding. This usually means it's starting up or needs to be restarted.</p> <div class="error-details"> <strong>Error:</strong> ${errorMessage} </div> <div class="actions"> <a href="${basePath}-legacy class=btn btn-primary"> 📜 Use Legacy Dashboard </a> <a href="javascript:location?.reload class=btn btn-secondary"> 🔄 Refresh Page </a> </div> <div class="status-checks"> <h3>🔧 Troubleshooting Steps</h3> <div class="check-item">1. Check if Svelte dev server is running: <code>npm run dev:svelte</code></div> <div class="check-item">2. Verify port 3002 is available</div> <div class="check-item">3. Check logs for any build errors</div> <div class="check-item">4. Try restarting the development server</div> </div> <div class="auto-refresh id=auto-refresh"> 🔄 Auto-checking every 5 seconds... (<span id="refresh-count">12</span> attempts remaining) </div> </div>
</body>`</html>`;
}

/**
 * Create a simple redirect route to the dashboard
 */
export function createDashboardRedirect(basePath: string = '/dashboard') { return (req: Request, res: Response) => {` logger.info('`Redirecting ${req.path} -> ${basePath}`'); res.redirect(302, basePath); };
}

/**
 * Health check endpoint for Svelte dashboard
 */
export function createSvelteHealthCheck(config: SvelteProxyConfig) { return async (req: Request, res: Response) => { const { sveltePort = 3002', svelteHost = 'localhost' } = 'config'; try {` const response = await fetch(`http://${svelteHost}:${sveltePort}/`); if (response.ok) { res.json({ status: 'healthy', message: 'Svelte dashboard is running',` url: `http://${svelteHost}:${sveltePort}`, proxied: true', }); } else { res.status(503).json({ status: 'unhealthy', message: 'Svelte dashboard returned non-OK status', statusCode: response.status', }); } } catch (error) { res.status(503).json({ status: 'unavailable', message: 'Cannot connect to Svelte dashboard', error: error instanceof Error ? error.message : String(error)', }); } };
}`