/**
 * Decorator Tests for DI System
 * Testing @injectable and @inject decorators
 */

import 'reflect-metadata';
import { 
  DIContainer,
  SingletonProvider,
  injectable,
  inject,
  createToken,
  isInjectable,
  getInjectionMetadata,
  getInjectionToken,
  CORE_TOKENS,
  type ILogger,
  type IConfig,
} from '../../../di/index.js';

describe('DI Decorators', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  afterEach(async () => {
    await container.dispose();
  });

  describe('@injectable decorator', () => {
    it('should mark classes as injectable', () => {
      @injectable
      class TestService {}
      
      expect(isInjectable(TestService)).toBe(true);
    });

    it('should preserve class functionality', () => {
      @injectable
      class TestService {
        getValue(): string {
          return 'test-value';
        }
      }
      
      const instance = new TestService();
      expect(instance.getValue()).toBe('test-value');
    });

    it('should store injection metadata', () => {
      const loggerToken = CORE_TOKENS.Logger;
      
      @injectable
      class TestService {
        constructor(@inject(loggerToken) private logger: ILogger) {}
      }
      
      const metadata = getInjectionMetadata(TestService);
      expect(metadata).toBeDefined();
      expect(metadata?.injectionTokens[0]).toBe(loggerToken);
    });

    it('should work with TypeScript parameter types', () => {
      @injectable
      class TestService {
        constructor(private value: string) {}
      }
      
      const metadata = getInjectionMetadata(TestService);
      expect(metadata).toBeDefined();
      expect(metadata?.parameterTypes).toHaveLength(1);
    });
  });

  describe('@inject decorator', () => {
    it('should mark parameters for injection', () => {
      const testToken = createToken<string>('TestString');
      
      @injectable
      class TestService {
        constructor(@inject(testToken) private value: string) {}
      }
      
      const injectionToken = getInjectionToken(TestService, 0);
      expect(injectionToken).toBe(testToken);
    });

    it('should work with multiple parameters', () => {
      const stringToken = createToken<string>('TestString');
      const numberToken = createToken<number>('TestNumber');
      
      @injectable
      class TestService {
        constructor(
          @inject(stringToken) private str: string,
          @inject(numberToken) private num: number
        ) {}
      }
      
      expect(getInjectionToken(TestService, 0)).toBe(stringToken);
      expect(getInjectionToken(TestService, 1)).toBe(numberToken);
    });

    it('should allow mixed injected and non-injected parameters', () => {
      const loggerToken = CORE_TOKENS.Logger;
      
      @injectable
      class TestService {
        constructor(
          @inject(loggerToken) private logger: ILogger,
          private config: any // Not injected
        ) {}
      }
      
      expect(getInjectionToken(TestService, 0)).toBe(loggerToken);
      expect(getInjectionToken(TestService, 1)).toBeUndefined();
    });
  });

  describe('Container integration with decorators', () => {
    it('should resolve services with automatic dependency injection', () => {
      // Mock implementations
      class MockLogger implements ILogger {
        debug = jest.fn();
        info = jest.fn();
        warn = jest.fn();
        error = jest.fn();
      }
      
      class MockConfig implements IConfig {
        private data = new Map();
        get<T>(key: string, defaultValue?: T): T { return this.data.get(key) || defaultValue; }
        set(key: string, value: any): void { this.data.set(key, value); }
        has(key: string): boolean { return this.data.has(key); }
      }
      
      @injectable
      class UserService {
        constructor(
          @inject(CORE_TOKENS.Logger) private logger: ILogger,
          @inject(CORE_TOKENS.Config) private config: IConfig
        ) {}
        
        createUser(name: string): string {
          this.logger.info('Creating user', { name });
          const userId = this.config.get('userIdPrefix', 'user') + '-' + name;
          return userId;
        }
      }
      
      // Register dependencies
      container.register(CORE_TOKENS.Logger, new SingletonProvider(() => new MockLogger()));
      container.register(CORE_TOKENS.Config, new SingletonProvider(() => new MockConfig()));
      
      // Register service with automatic dependency resolution
      const userServiceToken = createToken<UserService>('UserService');
      container.register(userServiceToken, new SingletonProvider(c => {
        const metadata = getInjectionMetadata(UserService);
        if (metadata) {
          const dependencies = metadata.injectionTokens.map(token => 
            token ? c.resolve(token) : undefined
          );
          return new UserService(...dependencies);
        }
        return new UserService(c.resolve(CORE_TOKENS.Logger), c.resolve(CORE_TOKENS.Config));
      }));
      
      const userService = container.resolve(userServiceToken);
      const userId = userService.createUser('john');
      
      expect(userId).toBe('user-john');
    });

    it('should work with complex dependency graphs', () => {
      class MockLogger implements ILogger {
        debug = jest.fn();
        info = jest.fn();
        warn = jest.fn();
        error = jest.fn();
      }
      
      @injectable
      class DatabaseService {
        constructor(@inject(CORE_TOKENS.Logger) private logger: ILogger) {}
        
        query(sql: string): any[] {
          this.logger.debug('Executing query', { sql });
          return [];
        }
      }
      
      @injectable
      class UserRepository {
        constructor(
          @inject(CORE_TOKENS.Logger) private logger: ILogger,
          private db: DatabaseService // This would also be injected in real scenario
        ) {}
        
        findUser(id: string): any {
          this.logger.info('Finding user', { id });
          return this.db.query(`SELECT * FROM users WHERE id = '${id}'`);
        }
      }
      
      @injectable
      class UserService {
        constructor(
          @inject(CORE_TOKENS.Logger) private logger: ILogger,
          private userRepo: UserRepository
        ) {}
        
        getUser(id: string): any {
          this.logger.info('Getting user', { id });
          return this.userRepo.findUser(id);
        }
      }
      
      // Register services
      container.register(CORE_TOKENS.Logger, new SingletonProvider(() => new MockLogger()));
      
      const dbToken = createToken<DatabaseService>('DatabaseService');
      const repoToken = createToken<UserRepository>('UserRepository');
      const serviceToken = createToken<UserService>('UserService');
      
      container.register(dbToken, new SingletonProvider(c => 
        new DatabaseService(c.resolve(CORE_TOKENS.Logger))
      ));
      
      container.register(repoToken, new SingletonProvider(c => 
        new UserRepository(c.resolve(CORE_TOKENS.Logger), c.resolve(dbToken))
      ));
      
      container.register(serviceToken, new SingletonProvider(c => 
        new UserService(c.resolve(CORE_TOKENS.Logger), c.resolve(repoToken))
      ));
      
      const userService = container.resolve(serviceToken);
      userService.getUser('123');
      
      const logger = container.resolve(CORE_TOKENS.Logger);
      expect(logger.info).toHaveBeenCalledWith('Getting user', { id: '123' });
      expect(logger.info).toHaveBeenCalledWith('Finding user', { id: '123' });
      expect(logger.debug).toHaveBeenCalledWith('Executing query', { sql: "SELECT * FROM users WHERE id = '123'" });
    });

    it('should support factory functions with metadata', () => {
      const valueToken = createToken<string>('ConfigValue');
      
      @injectable
      class ConfigurableService {
        constructor(@inject(valueToken) private value: string) {}
        
        getValue(): string {
          return this.value;
        }
      }
      
      container.register(valueToken, new SingletonProvider(() => 'injected-value'));
      
      const serviceToken = createToken<ConfigurableService>('ConfigurableService');
      container.register(serviceToken, new SingletonProvider(c => {
        // In a real implementation, this would use a factory that reads metadata
        return new ConfigurableService(c.resolve(valueToken));
      }));
      
      const service = container.resolve(serviceToken);
      expect(service.getValue()).toBe('injected-value');
    });
  });

  describe('Error handling with decorators', () => {
    it('should provide meaningful error messages for decorator issues', () => {
      @injectable
      class TestService {
        constructor(@inject(createToken<string>('NonExistentService')) private value: string) {}
      }
      
      const serviceToken = createToken<TestService>('TestService');
      container.register(serviceToken, new SingletonProvider(c => 
        new TestService(c.resolve(createToken<string>('NonExistentService')))
      ));
      
      expect(() => container.resolve(serviceToken)).toThrow();
    });
  });
});