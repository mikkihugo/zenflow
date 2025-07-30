import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';

/**
 * Main API server entry point for Claude-Zen;
 * Provides REST API endpoints for the system;
 */
const _app: Express = express();
const _PORT = parseInt(process.env.PORT ?? '3000', 10);
// Middleware setup
app.use(cors());
app.use(express.json());
/**
 * Health check endpoint;
 * @route GET /;
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Claude-Zen API Server',;
  status: 'healthy',;
  version: '2.0.0-alpha.73',;
  timestamp: new Date().toISOString(),;
});
})
/**
 * System status endpoint;
 * @route GET /status;
 */
app.get('/status', (_req: Request, res: Response) =>
{
  res.json({
    status: 'operational',;
  api: 'healthy',;
  database: 'healthy',;
  ('ruv-FANN');
  : 'integrated',
  memory: 'operational',
  ,
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  timestamp: new Date().toISOString(),
}
)
})
// Start server if not imported as module
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.warn(`🚀 Claude-Zen API server running on port ${PORT}`);
    console.warn(`📊 Environment: ${process.env.NODE_ENV ?? 'development'}`);
    console.warn(`🕒 Started at: ${new Date().toISOString()}`);
  });
}
export default app;
