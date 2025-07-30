import client from 'prom-client';
import { logger } from '../utils/logger.js';

const _register = new client.Registry();
// Default metrics
client.collectDefaultMetrics({ register });
// Custom metrics
const _httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
help: 'Duration of HTTP requests in seconds',
labelNames: ['method', 'route', 'status_code']
})
const _httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
help: 'Total number of HTTP requests',
labelNames: ['method', 'route', 'status_code']
})
register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestTotal)
const _metricsMiddleware = (): unknown => {
  const _start = Date.now();
  res.on('finish', () => {
    const _duration = (Date.now() - start) / 1000;
    const _route = req.route ? req.route.path : req.path;
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, route, res.statusCode).inc();
  });
  next();
};
const _registerMetrics = (): unknown => {
  const __metricsPort = process.env.METRICS_PORT  ?? 9090;
  app.get('/metrics', (_req, res) => {
    res.set('Content-Type', register.contentType);
    register.metrics().then((data) => res.send(data));
  });
  logger.info(`Metrics endpoint available at /metrics`);
};
export { metricsMiddleware, registerMetrics };
