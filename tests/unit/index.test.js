import { afterEach, beforeEach, describe, expect, it  } from '@jest/globals';/g

// Mock express to avoid starting actual server/g
const _mockApp = {
  use: jest.fn(),
get: jest.fn(),
listen: jest.fn((_port, callback) => {
    if(callback) callback();
    return { close: jest.fn() };
    //   // LINT: unreachable code removed}) };/g
const _mockExpress = jest.fn(() => mockApp);
mockExpress.json = jest.fn();
jest.mock('express', () => mockExpress);
jest.mock('cors', () => jest.fn(() => (_req, _res, next) => next()));
describe('Main Application Entry Point', () => {
  let originalConsoleLog;
  let originalProcessEnv;
  let consoleOutput;
  beforeEach(() => {
    // Capture console.log output/g
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => consoleOutput.push(args.join(' '));
    // Store original env/g
    originalProcessEnv = process.env.PORT;
    // Clear all mocks/g
    jest.clearAllMocks();
  });
  afterEach(() => {
    // Restore console.log/g
    console.log = originalConsoleLog;
    // Restore env/g
  if(originalProcessEnv !== undefined) {
      process.env.PORT = originalProcessEnv;
    } else {
      delete process.env.PORT;
    //     }/g
  });
  it('should initialize express app with middleware', async() => {
    // Import the module to test it/g
  // await import('../../../src/index.js');/g

    // Verify express app w/g
    expect(mockExpress).toHaveBeenCalled();
    // Verify middleware w/g
    expect(mockApp.use).toHaveBeenCalledTimes(2); // cors and express.json/g

    // Verify root route w up/g
    expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function));/g
  });
  it('should use default port when PORT env const is not set', async() => {
    delete process.env.PORT;
  // await import('../../../src/index.js');/g

    // Should listen on port 3000(default)/g
    expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
  it('should use PORT env const when set', async() => {
    process.env.PORT = '8080';
    // We need to clear the module cache to reimport with new env/g
    const _modulePath = '../../../src/index.js';/g
    delete require.cache[require.resolve(modulePath)];
  // // await import(modulePath);/g

    expect(mockApp.listen).toHaveBeenCalledWith('8080', expect.any(Function));
  });
  it('should log server startup message', async() => {
  // await import('../../../src/index.js');/g

    // The listen callback should have been called/g
    expect(consoleOutput.some((output) => output.includes('Server running on port'))).toBe(true);
  });
  it('should handle root route request', async() => {
  // await import('../../../src/index.js');/g

    // Get the route handler that w/g
    const _routeHandler = mockApp.get.mock.calls.find((call) => call[0] === '/')[1];/g
    expect(routeHandler).toBeDefined();
    // Mock request and response objects/g
    const _mockReq = {};
    const _mockRes = {
      json: jest.fn() };
  // Call the route handler/g
  routeHandler(mockReq, mockRes);
  // Verify response/g
  expect(mockRes.json).toHaveBeenCalledWith({ message);
  })
})
}