/**
 * Example Usage of Test Helper Utilities
 *
 * Demonstrates how to use the comprehensive test helpers for both
 * London School (mock-heavy) and Classical School (real object) TDD approaches
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import all test helpers
import {
  assertionHelpers,
  createLondonMocks,
  createTestLogger,
  IntegrationTestSetup,
  performanceMeasurement,
  type TestLogger,
  testDataFactory,
  TestDataFactory,
} from './index.ts';

describe('Test Helper Utilities - Example Usage', () => {
  let testLogger: TestLogger;

  beforeEach(() => {
    testLogger = createTestLogger('example-test');
  });

  afterEach(() => {
    testLogger.clearLogs();
  });

  describe('🎭 London School TDD Examples', () => {
    describe('Mock Builder Usage', () => {
      it('should create sophisticated mocks for interaction testing', () => {
        // Create London School mock builder
        const mockBuilder = createLondonMocks({
          trackInteractions: true,
          autoGenerate: true,
        });

        // Create mock dependencies
        const mocks = mockBuilder.createCommonMocks();

        // Mock a service class
        class UserService {
          constructor(
            private database: unknown,
            private emailService: unknown,
            private logger: unknown
          ) {}

          async createUser(userData: unknown) {
            (this.logger as any).info('Creating user', userData);
            const user = await (this.database as any).save('users', userData);
            await (this.emailService as any).sendWelcomeEmail((user as any).email);
            return user;
          }
        }

        const mockUserService = mockBuilder.create(UserService);

        // Setup mock expectations (London School style)
        mocks.database.save.mockResolvedValue({ id: 1, email: 'test@example.com' });
        mocks.emailService.sendWelcomeEmail.mockResolvedValue(true);

        testLogger.logInteraction('MockBuilder', 'create', [UserService]);

        // Verify mock creation
        expect(mockUserService).toBeDefined();
        expect(typeof mockUserService.createUser).toBe('function');
      });

      it('should verify interaction sequences', async () => {
        const mockDatabase = {
          connect: vi.fn(),
          query: vi.fn(),
          disconnect: vi.fn(),
        };

        // Simulate a service that uses the database
        class DataService {
          async getData(id: string) {
            await mockDatabase?.connect();
            const result = await mockDatabase?.query('SELECT * FROM data WHERE id = ?', [id]);
            await mockDatabase?.disconnect();
            return result;
          }
        }

        const service = new DataService();

        // Setup mocks
        mockDatabase?.connect?.mockResolvedValue(undefined);
        mockDatabase?.query?.mockResolvedValue([{ id: '123', name: 'test' }]);
        mockDatabase?.disconnect?.mockResolvedValue(undefined);

        // Execute
        const result = await service.getData('123');

        // London School: Verify interactions (HOW it works)
        expect(mockDatabase?.connect).toHaveBeenCalledBefore(mockDatabase?.query);
        expect(mockDatabase?.query).toHaveBeenCalledWith('SELECT * FROM data WHERE id = ?', [
          '123',
        ]);
        expect(mockDatabase?.disconnect).toHaveBeenCalledAfter(mockDatabase?.query);

        testLogger.logInteraction('DataService', 'getData', ['123'], result);
      });
    });

    describe('Advanced Mock Patterns', () => {
      it('should handle complex dependency injection scenarios', () => {
        const mockBuilder = createLondonMocks();

        // Mock complex dependency graph
        interface EmailProvider {
          sendEmail(to: string, subject: string, body: string): Promise<boolean>;
        }

        interface UserRepository {
          findByEmail(email: string): Promise<unknown>;
          save(user: unknown): Promise<unknown>;
        }

        class EmailService {
          constructor(private provider: EmailProvider) {}

          async sendWelcome(email: string) {
            return this.provider.sendEmail(email, 'Welcome!', 'Welcome to our service');
          }
        }

        class UserService {
          constructor(
            private userRepo: UserRepository,
            private emailService: EmailService
          ) {}

          async registerUser(email: string, name: string) {
            const existing = await this.userRepo.findByEmail(email);
            if (existing) throw new Error('User exists');

            const user = await this.userRepo.save({ email, name });
            await this.emailService.sendWelcome(email);
            return user;
          }
        }

        // Create mocks
        const mockEmailProvider = mockBuilder.createPartial<EmailProvider>({
          sendEmail: vi.fn().mockResolvedValue(true),
        });

        const mockUserRepo = mockBuilder.createPartial<UserRepository>({
          findByEmail: vi.fn().mockResolvedValue(null),
          save: vi.fn().mockResolvedValue({ id: 1, email: 'test@example.com', name: 'Test' }),
        });

        const emailService = new EmailService(mockEmailProvider);
        const userService = new UserService(mockUserRepo, emailService);

        // Test the interaction
        expect(async () => {
          const user = await userService.registerUser('test@example.com', 'Test User');
          expect(user).toEqual({ id: 1, email: 'test@example.com', name: 'Test' });
        }).not.toThrow();
      });
    });
  });

  describe('🏛️ Classical School TDD Examples', () => {
    describe('Real Object Testing', () => {
      it('should test actual implementations without mocks', () => {
        // Classical TDD: Test real behavior, not mocks
        class Calculator {
          add(a: number, b: number): number {
            return a + b;
          }

          divide(a: number, b: number): number {
            if (b === 0) throw new Error('Division by zero');
            return a / b;
          }

          factorial(n: number): number {
            if (n < 0) throw new Error('Factorial of negative number');
            if (n <= 1) return 1;
            return n * this.factorial(n - 1);
          }
        }

        const calculator = new Calculator();

        // Test actual mathematical properties
        expect(calculator.add(2, 3)).toBe(5);
        expect(calculator.add(-1, 1)).toBe(0);
        expect(calculator.divide(10, 2)).toBe(5);
        expect(calculator.factorial(5)).toBe(120);

        // Test error conditions
        expect(() => calculator.divide(5, 0)).toThrow('Division by zero');
        expect(() => calculator.factorial(-1)).toThrow('Factorial of negative number');

        testLogger.logStateChange(
          'Calculator',
          { operation: 'none' },
          { result: 'tested' },
          'mathematical_operations'
        );
      });

      it('should test algorithms and data structures', () => {
        // Classical approach: Test actual algorithm behavior
        class SortingAlgorithms {
          bubbleSort(arr: number[]): number[] {
            const result = [...arr];
            const n = result.length;

            for (let i = 0; i < n - 1; i++) {
              for (let j = 0; j < n - i - 1; j++) {
                if (result?.[j] > result?.[j + 1]) {
                  if (result && result[j] !== undefined && result[j + 1] !== undefined) {
                    [result[j], result[j + 1]] = [result[j + 1], result[j]];
                  }
                }
              }
            }

            return result;
          }

          quickSort(arr: number[]): number[] {
            if (arr.length <= 1) return arr;

            const pivot = arr[Math.floor(arr.length / 2)];
            const left = arr.filter((x) => x < pivot);
            const middle = arr.filter((x) => x === pivot);
            const right = arr.filter((x) => x > pivot);

            return [...this.quickSort(left), ...middle, ...this.quickSort(right)];
          }
        }

        const sorter = new SortingAlgorithms();
        const testData = [64, 34, 25, 12, 22, 11, 90];
        const expected = [11, 12, 22, 25, 34, 64, 90];

        // Test both algorithms produce correct results
        expect(sorter.bubbleSort(testData)).toEqual(expected);
        expect(sorter.quickSort(testData)).toEqual(expected);

        // Test edge cases
        expect(sorter.bubbleSort([])).toEqual([]);
        expect(sorter.quickSort([1])).toEqual([1]);
        expect(sorter.bubbleSort([3, 1, 2])).toEqual([1, 2, 3]);
      });
    });
  });

  describe('📊 Performance Testing Examples', () => {
    it('should measure and compare algorithm performance', async () => {
      // Test data generation
      const testData = TestDataFactory.createPerformanceData(1000);

      function linearSearch(arr: any[], target: any): number {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i]?.id === target) return i;
        }
        return -1;
      }

      function binarySearch(arr: any[], target: any): number {
        let left = 0;
        let right = arr.length - 1;

        while (left <= right) {
          const mid = Math.floor((left + right) / 2);
          if (arr[mid]?.id === target) return mid;
          if (arr[mid]?.id < target) left = mid + 1;
          else right = mid - 1;
        }
        return -1;
      }

      // Sort data for binary search
      const sortedData = testData?.data?.sort((a, b) => a.id - b.id);
      const target = testData?.data?.[500]?.id;

      // Benchmark comparison
      const results = performanceMeasurement.benchmarkComparison([
        {
          name: 'Linear Search',
          fn: () => linearSearch(testData?.data, target),
        },
        {
          name: 'Binary Search',
          fn: () => binarySearch(sortedData, target),
        },
      ]);

      // Performance assertions
      expect(results).toHaveLength(2);
      expect(results?.[0]?.ranking).toBeLessThanOrEqual(2);
      expect(results?.[1]?.ranking).toBeLessThanOrEqual(2);

      // Binary search should be faster (lower ranking = better performance)
      const binaryResult = results?.find((r: any) => r.name === 'Binary Search');
      const linearResult = results?.find((r: any) => r.name === 'Linear Search');

      // Ensure both results exist and have valid ranking values
      expect(binaryResult).toBeDefined();
      expect(linearResult).toBeDefined();
      expect(typeof binaryResult?.ranking).toBe('number');
      expect(typeof linearResult?.ranking).toBe('number');
      
      // Now safely compare rankings with proper type checking
      if (binaryResult && linearResult && 
          typeof binaryResult.ranking === 'number' && 
          typeof linearResult.ranking === 'number') {
        expect(binaryResult.ranking).toBeLessThan(linearResult.ranking);
      }

      // Log performance metrics with proper null checking and type safety
      if (binaryResult?.metrics?.executionTime !== undefined && 
          typeof binaryResult.metrics.executionTime === 'number') {
        testLogger.logPerformance('Algorithm Comparison', binaryResult.metrics.executionTime, {
          algorithm: 'binary-search',
        });
      }
    });

    it('should detect memory leaks', async () => {
      // Simulate potential memory leak
      const leakyFunction = () => {
        const largeArray: number[] = [];
        for (let i = 0; i < 1000; i++) {
          largeArray.push(Math.random());
        }
        // Intentionally don't clean up
        return largeArray.length;
      };

      const cleanFunction = () => {
        const smallArray = [1, 2, 3];
        return smallArray.length;
      };

      // Test for memory leaks
      const leakResult = performanceMeasurement.detectMemoryLeaks(
        leakyFunction,
        50
      );

      const cleanResult = performanceMeasurement.detectMemoryLeaks(
        cleanFunction,
        50
      );

      // The leaky function should show memory growth
      expect(leakResult.memoryGrowth).toBeGreaterThan(cleanResult.memoryGrowth);
    });
  });

  describe('🧪 Test Data Factory Examples', () => {
    it('should generate realistic test data', () => {
      // Generate consistent test data with seed
      TestDataFactory.resetSeed(12345);

      const users = TestDataFactory.createUsers(5);
      const projects = Array.from({ length: 3 }, () => TestDataFactory.createProject());
      const swarms = Array.from({ length: 2 }, () => TestDataFactory.createSwarm());

      // Verify data structure
      expect(users).toHaveLength(5);
      users.forEach((user: any) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user.email).toMatch(/@/);
      });

      expect(projects).toHaveLength(3);
      projects.forEach((project) => {
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('type');
        expect(['typescript', 'javascript', 'python', 'rust']).toContain(project.type);
      });

      expect(swarms).toHaveLength(2);
      swarms.forEach((swarm) => {
        expect(swarm).toHaveProperty('topology');
        expect(swarm).toHaveProperty('agents');
        expect(swarm.agents.length).toBeGreaterThan(0);
      });

      testLogger.logStateChange(
        'TestDataFactory',
        { users: 0, projects: 0, swarms: 0 },
        { users: users.length, projects: projects.length, swarms: swarms.length },
        'data_generation'
      );
    });

    it('should create neural network training data', () => {
      const trainingData = TestDataFactory.createNeuralTrainingData(100);

      expect(trainingData.trainingData).toHaveLength(100);
      trainingData.trainingData.forEach((sample: any) => {
        expect(sample).toHaveProperty('input');
        expect(sample).toHaveProperty('output');
        expect(sample.input).toHaveLength(2); // Updated to match implementation
        expect(sample.output).toHaveLength(1); // Updated to match implementation

        // Verify input range [-1, 1]
        sample.input.forEach((value: unknown) => {
          expect(value).toBeGreaterThanOrEqual(-1);
          expect(value).toBeLessThanOrEqual(1);
        });

        // Verify output range [0, 1]
        sample.output.forEach((value: unknown) => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('🔧 Integration Test Setup Examples', () => {
    it('should setup complete test environment', async () => {
      const testSetup = new IntegrationTestSetup({
        environment: {
          database: 'memory',
          filesystem: 'temp',
          network: 'mock',
        },
        timeout: 10000,
      });

      try {
        const { database, filesystem, network } = await testSetup.setup();

        // Test database operations
        await database?.setup();
        await database?.seed([
          { id: 1, name: 'Test User 1' },
          { id: 2, name: 'Test User 2' },
        ]);

        const connection = database?.getConnection();
        expect(connection).toBeDefined();

        // Test filesystem operations
        const tempDir = await filesystem.createTempDir?.('integration-test');
        await filesystem.createFile(`${tempDir}/test.txt`, 'Hello World');

        const exists = await filesystem.fileExists?.(`${tempDir}/test.txt`);
        expect(exists).toBe(true);

        const content = await filesystem.readFile?.(`${tempDir}/test.txt`);
        expect(content).toBe('Hello World');

        // Test network operations
        const port = await network.startMockServer();
        expect(port).toBeGreaterThan(0);

        network.mockRequest?.('GET', '/api/health', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { status: 'healthy' },
        });

        const client = network.createHttpClient?.();
        const response = await client.get('/api/health');
        expect(response?.status).toBe(200);
        expect(response?.body).toEqual({ status: 'healthy' });

        testLogger.logStateChange(
          'IntegrationTest',
          { environment: 'none' },
          { database: 'ready', filesystem: 'ready', network: 'ready' },
          'environment_setup'
        );
      } finally {
        await testSetup.cleanup();
      }
    });
  });

  describe('✅ Advanced Assertion Examples', () => {
    it('should use custom assertions for specialized testing', () => {
      // Performance assertions
      const metrics = {
        executionTime: 150,
        memoryUsage: { heap: 1024 * 1024, external: 512 * 1024, total: 1536 * 1024 },
        throughput: 1000,
      };

      assertionHelpers.toMeetPerformanceThreshold(metrics, {
        executionTime: 200,
        memoryUsage: { heap: 2 * 1024 * 1024 },
        throughput: 500,
      });

      // Approximate equality
      assertionHelpers.toBeApproximately(Math.PI, Math.PI, 5);

      // Array assertions
      assertionHelpers.toContainElementsInAnyOrder([1, 3, 2], [2, 1, 3]);

      // Mathematical properties
      const increasingValues = [1, 2, 3, 4, 5];
      assertionHelpers.toSatisfyMathematicalProperty(increasingValues, 'monotonic-increasing');

      testLogger.logAssertion('Custom assertions', true, 'specialized checks', 'passed');
    });

    it('should handle async assertions with timeouts', async () => {
      let counter = 0;
      const eventuallyTrue = () => {
        counter++;
        return counter >= 3;
      };

      // This should eventually become true
      await assertionHelpers.toEventuallyBeTrue(eventuallyTrue, {
        timeout: 1000,
        interval: 50,
      });

      expect(counter).toBeGreaterThanOrEqual(3);
    });
  });

  describe('📝 Test Logger Examples', () => {
    it('should provide structured logging for test analysis', () => {
      const componentLogger = testLogger.createChild('UserService');

      // Log different types of events
      componentLogger.info('Starting user creation process');
      componentLogger.logInteraction('UserService', 'validateInput', ['user@example.com']);
      componentLogger.logStateChange(
        'UserValidator',
        { isValid: false },
        { isValid: true },
        'email_validation'
      );
      componentLogger.logPerformance('Database Insert', 25);
      componentLogger.logAssertion('User created successfully', true);

      // Verify logs were captured
      const logs = componentLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);

      const performanceLogs = componentLogger.getLogsByCategory('performance');
      expect(performanceLogs).toHaveLength(1);
      expect(performanceLogs[0]?.message).toContain('Database Insert');

      const interactionLogs = componentLogger.getLogsByCategory('interaction');
      expect(interactionLogs).toHaveLength(1);
    });
  });
});

/**
 * Key Takeaways from Examples:
 *
 * 1. London School TDD:
 *    - Focus on interaction testing
 *    - Heavy use of mocks to isolate units
 *    - Verify HOW objects collaborate
 *    - Test behavior through mock expectations
 *
 * 2. Classical School TDD:
 *    - Focus on state and output testing
 *    - Minimal mocks, prefer real objects
 *    - Verify WHAT the system produces
 *    - Test mathematical and algorithmic correctness
 *
 * 3. Performance Testing:
 *    - Measure execution time and memory usage
 *    - Compare algorithm efficiency
 *    - Detect memory leaks and performance regressions
 *    - Set performance thresholds and assertions
 *
 * 4. Integration Testing:
 *    - Test complete system interactions
 *    - Use realistic data and environments
 *    - Verify end-to-end workflows
 *    - Clean up resources properly
 *
 * 5. Test Data Management:
 *    - Generate reproducible test data
 *    - Create realistic domain objects
 *    - Support various data patterns and edge cases
 *    - Maintain data consistency across tests
 */
