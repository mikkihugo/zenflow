/**
 * @jest-environment node
 */

// Mock modules before any imports
jest.mock('os', () => ({
  cpus: jest.fn(),
  totalmem: jest.fn(),
  freemem: jest.fn(),
  uptime: jest.fn(),
  loadavg: jest.fn(),
  platform: jest.fn()
}));

jest.mock('fs/promises', () => ({
  statfs: jest.fn(),
  readFile: jest.fn(),
  access: jest.fn(),
  readdir: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn()
}));

jest.mock('perf_hooks', () => ({
  performance: {
    now: jest.fn(() => Date.now())
  }
}));

jest.mock('../../../../src/cli/simple-commands/utils.js', () => ({
  printSuccess: jest.fn(),
  printError: jest.fn(),
  printWarning: jest.fn()
}));

describe('monitor.js - Real Metrics Implementation', () => {
  let consoleSpy;
  let processExitSpy;
  let processKillSpy;
  let clearIntervalSpy;
  let setIntervalSpy;
  let monitorCommand, showMonitorHelp;
  let os, fs, path;

  beforeAll(async () => {
    // Import the actual modules and functions after mocking
    os = (await import('os')).default;
    fs = (await import('fs/promises')).default;
    path = (await import('path')).default;
    
    const monitor = await import('../../../../src/cli/simple-commands/monitor.js');
    monitorCommand = monitor.monitorCommand;
    showMonitorHelp = monitor.showMonitorHelp;
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup console spies
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      clear: jest.spyOn(console, 'clear').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation()
    };

    // Setup process spies
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
    processKillSpy = jest.spyOn(process, 'kill').mockImplementation();

    // Setup timer spies
    clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    setIntervalSpy = jest.spyOn(global, 'setInterval');

    // Setup default os mocks
    os.cpus.mockReturnValue([
      {
        model: 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz',
        speed: 1800,
        times: { user: 100000, nice: 0, sys: 50000, idle: 850000, irq: 0 }
      },
      {
        model: 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz',
        speed: 1800,
        times: { user: 110000, nice: 0, sys: 55000, idle: 835000, irq: 0 }
      }
    ]);
    os.totalmem.mockReturnValue(8 * 1024 * 1024 * 1024); // 8GB
    os.freemem.mockReturnValue(3 * 1024 * 1024 * 1024); // 3GB free
    os.uptime.mockReturnValue(3600); // 1 hour
    os.loadavg.mockReturnValue([1.5, 1.2, 0.9]);
    os.platform.mockReturnValue('linux');

    // Setup default fs mocks
    fs.statfs.mockResolvedValue({
      blocks: 100000000,
      bsize: 4096,
      bavail: 50000000
    });
    fs.readFile.mockRejectedValue(new Error('File not found'));
    fs.access.mockRejectedValue(new Error('File not found'));
    fs.readdir.mockRejectedValue(new Error('Directory not found'));

    // Setup path mock
    path.join.mockImplementation((...args) => args.join('/'));

    // Setup process mocks
    process.version = 'v18.0.0';
    process.cwd = jest.fn(() => '/test/directory');
    process.memoryUsage = jest.fn(() => ({
      rss: 100 * 1024 * 1024,
      heapTotal: 80 * 1024 * 1024,
      heapUsed: 60 * 1024 * 1024,
      external: 10 * 1024 * 1024,
      arrayBuffers: 5 * 1024 * 1024
    }));
    process.cpuUsage = jest.fn(() => ({
      user: 1000000, // 1 second
      system: 500000  // 0.5 seconds
    }));
  });

  afterEach(() => {
    // Restore all spies
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    processExitSpy.mockRestore();
    processKillSpy.mockRestore();
    clearIntervalSpy.mockRestore();
    setIntervalSpy.mockRestore();
  });

  describe('Basic Functionality', () => {
    test('should collect and display real system metrics', async () => {
      await monitorCommand([], {});

      // Check if metrics were displayed
      const output = consoleSpy.log.mock.calls.join('\n');
      expect(output).toContain('📊 System Metrics');
      expect(output).toContain('🖥️  System Resources:');
      expect(output).toContain('Platform: linux (2 CPUs)');
      expect(output).toContain('Node Version: v18.0.0');
    });

    test('should show help information correctly', () => {
      showMonitorHelp();

      const output = consoleSpy.log.mock.calls.join('\n');
      expect(output).toContain('Monitor commands:');
      expect(output).toContain('--interval <ms>');
      expect(output).toContain('--format <type>');
      expect(output).toContain('Examples:');
    });
  });

  describe('CPU Usage Calculation', () => {
    test('should calculate real CPU usage from os.cpus()', async () => {
      await monitorCommand([], {});

      // Check if CPU usage was calculated and displayed
      const output = consoleSpy.log.mock.calls.join('\n');
      expect(output).toContain('CPU Usage:');
      expect(output).toMatch(/CPU Usage: \d+\.\d%/);
      expect(os.cpus).toHaveBeenCalled();
    });

    test('should handle single CPU correctly', async () => {
      os.cpus.mockReturnValue([{
        model: 'Single CPU',
        speed: 2400,
        times: { user: 100000, nice: 0, sys: 50000, idle: 850000, irq: 0 }
      }]);

      await monitorCommand([], {});

      const output = consoleSpy.log.mock.calls.join('\n');
      expect(output).toContain('(1 CPUs)');
    });
  });

  describe('Memory Metrics', () => {
    test('should show real memory usage from os module', async () => {
      await monitorCommand([], {});

      const output = consoleSpy.log.mock.calls.join('\n');
      expect(output).toContain('Memory: 5120.0 MB / 8192.0 MB (63%)');
      expect(os.totalmem).toHaveBeenCalled();
      expect(os.freemem).toHaveBeenCalled();
    });

    test('should show process memory details', async () => {
      await monitorCommand([], {});

      const output = consoleSpy.log.mock.calls.join('\n');
      expect(output).toContain('Process Memory (Heap): 60.0 MB / 80.0 MB');
      expect(output).toContain('External Memory: 10.0 MB');
      expect(process.memoryUsage).toHaveBeenCalled();
    });
  });

  describe('Output Formats', () => {
    test('should output JSON format when --format json is specified', async () => {
      await monitorCommand(['--format', 'json'], {});

      const calls = consoleSpy.log.mock.calls;
      const jsonOutput = calls.find(call => {
        try {
          JSON.parse(call[0]);
          return true;
        } catch {
          return false;
        }
      });

      expect(jsonOutput).toBeDefined();
      const parsed = JSON.parse(jsonOutput[0]);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('system');
      expect(parsed).toHaveProperty('orchestrator');
      expect(parsed).toHaveProperty('performance');
      expect(parsed).toHaveProperty('resources');
    });

    test('should output pretty format by default', async () => {
      await monitorCommand([], {});

      const output = consoleSpy.log.mock.calls.join('\n');
      expect(output).toContain('📊 System Metrics');
      expect(output).toContain('🖥️  System Resources:');
      expect(output).toContain('🎭 Orchestrator:');
      expect(output).toContain('⚡ Performance:');
      expect(output).toContain('📦 Resources:');
    });
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully during metric collection', async () => {
      // Make os.cpus throw an error
      os.cpus.mockImplementation(() => {
        throw new Error('Cannot get CPU info');
      });

      // Should not crash the application
      await expect(monitorCommand([], {})).resolves.not.toThrow();
      
      // Should still display some output
      expect(consoleSpy.log).toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    test('should handle fs.statfs errors gracefully', async () => {
      fs.statfs.mockRejectedValue(new Error('statfs not supported'));

      await monitorCommand([], {});

      const output = consoleSpy.log.mock.calls.join('\n');
      expect(output).toContain('Disk Usage: 0 GB / 0 GB (0%)');
    });
  });
});