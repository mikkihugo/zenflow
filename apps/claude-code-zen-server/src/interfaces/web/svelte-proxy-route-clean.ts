/**
 * Svelte Proxy Route for Express
 *
 * Serves the Svelte dashboard through the existing Express server
 * on port 3000, proxying to the Svelte dev server on port 3002.
 */

import { getLogger } from '@claude-zen/foundation';
import {
  type Request,
  type Response,
  type NextFunction
} from 'express';
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
    fallbackToLegacy = true
  } = config;

  if (!enabled) {
    logger.info('Svelte proxy disabled');
    return (
      req: Request,
      res: Response,
      next: NextFunction
    ) => next();
  }

  logger.info(`Creating Svelte proxy route: ${basePath} -> ${svelteHost}:${sveltePort}`);

  const proxyMiddleware = createProxyMiddleware({
    target: `http://${svelteHost}:${sveltePort}`,
    changeOrigin: true,
    ws: true, // Enable websocket proxying
    pathRewrite: {
      [`^${basePath}`]: '',
    },
    onError: (err, req, res) => {
      logger.error('Svelte proxy error:', err);
      
      if (fallbackToLegacy && res && typeof res.status === 'function') {
        res.status(503).json({
          error: 'Svelte dashboard temporarily unavailable',
          message: 'Please check if the Svelte dev server is running on port ' + sveltePort
        });
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying ${req.method} ${req.url} to Svelte dev server`);
    }
  });

  return (req: Request, res: Response, next: NextFunction) => {
    // Check if request should be proxied to Svelte
    if (req.path.startsWith(basePath)) {
      logger.debug(`Routing ${req.path} to Svelte dashboard`);
      proxyMiddleware(req, res, next);
    } else {
      next();
    }
  };
}

/**
 * Health check for Svelte dev server
 */
export async function checkSvelteHealth(config: SvelteProxyConfig): Promise<boolean> {
  const { svelteHost, sveltePort } = config;
  
  try {
    const response = await fetch(`http://${svelteHost}:${sveltePort}/`);
    return response.ok;
  } catch (error) {
    logger.warn(`Svelte dev server health check failed: ${error}`);
    return false;
  }
}

export default createSvelteProxyRoute;