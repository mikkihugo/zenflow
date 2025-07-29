/**
 * Global test setup for Visionary integration tests
 * Prepares test environment and starts necessary services
 */

const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const { SERVICE_URLS } = require('../fixtures/vision-workflow-fixtures');

let testProcesses = [];
let testDbPath;

module.exports = async () => {
  console.log('🚀 Setting up Visionary integration test environment...');
  
  try {
    // Create test workspace directory
    const testWorkspaceDir = path.join(process.cwd(), 'test-workspace');
    await fs.mkdir(testWorkspaceDir, { recursive: true });
    
    // Set environment variables for test mode
    process.env.NODE_ENV = 'test';
    process.env.VISIONARY_TEST_MODE = 'true';
    process.env.TEST_WORKSPACE_DIR = testWorkspaceDir;
    
    // Create test database
    testDbPath = path.join(testWorkspaceDir, 'test-visionary.db');
    process.env.TEST_DATABASE_PATH = testDbPath;
    
    // Wait for services to be ready or start mock services
    await Promise.all([
      waitForServiceOrStartMock('business', SERVICE_URLS.BUSINESS),
      waitForServiceOrStartMock('core', SERVICE_URLS.CORE),
      waitForServiceOrStartMock('swarm', SERVICE_URLS.SWARM),
      waitForServiceOrStartMock('development', SERVICE_URLS.DEVELOPMENT)
    ]);
    
    // Initialize test data
    await initializeTestData();
    
    console.log('✅ Visionary test environment setup complete');
    
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    await cleanup();
    throw error;
  }
};

async function waitForServiceOrStartMock(serviceName, serviceUrl) {
  const maxAttempts = 10;
  const retryDelay = 2000;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.get(`${serviceUrl}/api/health`, { 
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept any status < 500
      });
      
      console.log(`✅ ${serviceName} service is ready at ${serviceUrl}`);
      return;
    } catch (error) {
      console.log(`⏳ Attempt ${attempt}/${maxAttempts} - ${serviceName} service not ready, will start mock...`);
      
      if (attempt === maxAttempts) {
        console.log(`🔧 Starting mock ${serviceName} service...`);
        await startMockService(serviceName, serviceUrl);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

async function startMockService(serviceName, serviceUrl) {
  const mockServerScript = path.join(__dirname, 'mock-services', `${serviceName}-mock.js`);
  
  try {
    // Check if mock service script exists
    await fs.access(mockServerScript);
    
    const port = new URL(serviceUrl).port;
    const mockProcess = spawn('node', [mockServerScript, port], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, SERVICE_NAME: serviceName, PORT: port }
    });
    
    testProcesses.push({
      name: `mock-${serviceName}`,
      process: mockProcess
    });
    
    // Wait for mock service to start
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Mock ${serviceName} service failed to start within 10 seconds`));
      }, 10000);
      
      mockProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Mock service running')) {
          clearTimeout(timeout);
          console.log(`✅ Mock ${serviceName} service started on port ${port}`);
          resolve();
        }
      });
      
      mockProcess.stderr.on('data', (data) => {
        console.error(`Mock ${serviceName} error:`, data.toString());
      });
      
      mockProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
    
  } catch (error) {
    console.log(`⚠️ Mock service script not found for ${serviceName}, using service stubs`);
    // Create service stubs that return appropriate mock responses
    await createServiceStub(serviceName, serviceUrl);
  }
}

async function createServiceStub(serviceName, serviceUrl) {
  // This would create a simple HTTP server that returns mock responses
  // For now, we'll just set a flag that the service is mocked
  process.env[`${serviceName.toUpperCase()}_SERVICE_MOCKED`] = 'true';
  console.log(`📝 Created service stub for ${serviceName}`);
}

async function initializeTestData() {
  console.log('🗃️ Initializing test data...');
  
  // Create test database schema if needed
  if (testDbPath) {
    // Initialize SQLite database for tests
    const sqlite3 = require('sqlite3');
    const db = new sqlite3.Database(testDbPath);
    
    // Create basic tables for testing
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS test_visions (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS test_workflows (
          id TEXT PRIMARY KEY,
          vision_id TEXT,
          status TEXT DEFAULT 'registered',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS test_sessions (
          id TEXT PRIMARY KEY,
          workflow_id TEXT,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
    db.close();
  }
  
  // Seed with initial test data
  const testData = {
    visions: [
      {
        id: 'test_vision_001',
        title: 'Test Landing Page',
        description: 'Simple landing page for testing',
        status: 'approved'
      }
    ],
    workflows: [
      {
        id: 'test_workflow_001',
        vision_id: 'test_vision_001',
        status: 'registered'
      }
    ]
  };
  
  // Store test data in global for access during tests
  global.testData = testData;
  
  console.log('✅ Test data initialized');
}

async function cleanup() {
  console.log('🧹 Cleaning up test processes...');
  
  // Kill all test processes
  for (const testProcess of testProcesses) {
    try {
      testProcess.process.kill('SIGTERM');
      console.log(`✅ Stopped ${testProcess.name}`);
    } catch (error) {
      console.error(`❌ Failed to stop ${testProcess.name}:`, error.message);
    }
  }
  
  testProcesses = [];
}

// Handle cleanup on process exit
process.on('exit', cleanup);
process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});