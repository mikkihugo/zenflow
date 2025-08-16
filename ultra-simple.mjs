console.log('Step 1: Starting ultra simple test...');

// Test LogTape configuration
console.log('Step 2: Testing LogTape...');
import { configure } from '@logtape/logtape';

await configure({
  sinks: {
    console: { type: 'console' },
  },
  loggers: [{ category: [], level: 'debug', sinks: ['console'] }],
});

console.log('Step 3: LogTape configured');

// Test basic imports
console.log('Step 4: Testing imports...');
const { getLogger } = await import('./src/config/logging-config.js');
const logger = getLogger('Test');

console.log('Step 5: Logger created');
logger.info('Test message');

console.log('Step 6: Basic Express test...');
const express = await import('express');
const app = express.default();

app.get('/', (req, res) => {
  res.json({ message: 'Ultra simple test' });
});

console.log('Step 7: Starting server...');
const server = app.listen(3000, () => {
  console.log('Step 8: Server started successfully!');
  process.exit(0);
});
