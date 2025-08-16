import express from 'express';
import { createTerminus } from '@godaddy/terminus';

console.log('🚀 Starting minimal server...');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Minimal server working' });
});

const server = app.listen(3000, 'localhost', () => {
  console.log('✅ Minimal server started on http://localhost:3000');
});

createTerminus(server, {
  signals: ['SIGTERM', 'SIGINT'],
  timeout: 5000,
  healthChecks: { '/health': () => ({ status: 'ok' }) },
  onSignal: async () => console.log('🔄 Graceful shutdown...'),
  logger: (msg) => console.log('Terminus:', msg)
});

console.log('✅ Minimal server ready');
