import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock express to avoid starting actual server
const mockApp = {
  use: jest.fn(),
  get: jest.fn(),
  listen: jest.fn((port, callback) => {
    if (callback) callback();
    return { close: jest.fn() };
  })
};

const mockExpress = jest.fn(() => mockApp);
mockExpress.json = jest.fn();

jest.mock('express', () => mockExpress);
jest.mock('cors', () => jest.fn(() => (req, res, next) => next()));

describe('Main Application Entry Point', () => {
  let originalConsoleLog;
  let originalProcessEnv;
  let consoleOutput;

  beforeEach(() => {
    // Capture console.log output
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => consoleOutput.push(args.join(' '));
    
    // Store original env
    originalProcessEnv = process.env.PORT;
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
    
    // Restore env
    if (originalProcessEnv !== undefined) {
      process.env.PORT = originalProcessEnv;
    } else {
      delete process.env.PORT;
    }
  });

  it('should initialize express app with middleware', async () => {
    // Import the module to test it
    await import('../../../src/index.js');
    
    // Verify express app was created
    expect(mockExpress).toHaveBeenCalled();
    
    // Verify middleware was configured
    expect(mockApp.use).toHaveBeenCalledTimes(2); // cors and express.json
    
    // Verify root route was set up
    expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function));
  });

  it('should use default port when PORT env var is not set', async () => {
    delete process.env.PORT;
    
    await import('../../../src/index.js');
    
    // Should listen on port 3000 (default)
    expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });

  it('should use PORT env var when set', async () => {
    process.env.PORT = '8080';
    
    // We need to clear the module cache to reimport with new env
    const modulePath = '../../../src/index.js';
    delete require.cache[require.resolve(modulePath)];
    
    await import(modulePath);
    
    expect(mockApp.listen).toHaveBeenCalledWith('8080', expect.any(Function));
  });

  it('should log server startup message', async () => {
    await import('../../../src/index.js');
    
    // The listen callback should have been called
    expect(consoleOutput.some(output => 
      output.includes('Server running on port')
    )).toBe(true);
  });

  it('should handle root route request', async () => {
    await import('../../../src/index.js');
    
    // Get the route handler that was registered
    const routeHandler = mockApp.get.mock.calls.find(call => call[0] === '/')[1];
    expect(routeHandler).toBeDefined();
    
    // Mock request and response objects
    const mockReq = {};
    const mockRes = {
      json: jest.fn()
    };
    
    // Call the route handler
    routeHandler(mockReq, mockRes);
    
    // Verify response
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Welcome to Claude-Flow API'
    });
  });
});