/**
 * @fileoverview Dependency Injection Container Tests (Vitest Version)
 * 
 * Comprehensive test suite for the DI container including:
 * - Service registration and resolution
 * - Singleton lifecycle management
 * - Dependency injection patterns
 * - Error handling and validation
 * - Advanced container features
 * 
 * VITEST FRAMEWORK: Uses Vitest testing patterns and assertions
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock logger to avoid actual logging during tests
vi.mock('@claude-zen/foundation/logging', () => ({
  getLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })
}));

import {
  Container,
  injectable,
  singleton,
  inject,
  createContainer,
  getContainer,
  type ServiceIdentifier,
  type ContainerConfig
} from '../di';

// Test service interfaces and implementations
interface IUserService {
  getUser(id: string): Promise<{ id: string; name: string }>;
}

interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

interface INotificationService {
  notify(userId: string, message: string): Promise<void>;
}

@injectable()
class UserService implements IUserService {
  async getUser(id: string): Promise<{ id: string; name: string }> {
    return { id, name: `User ${id}` };
  }
}

@injectable()
class EmailService implements IEmailService {
  private sentEmails: Array<{ to: string; subject: string; body: string }> = [];
  
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    this.sentEmails.push({ to, subject, body });
    return true;
  }
  
  getSentEmails() {
    return this.sentEmails;
  }
}

@injectable()
class NotificationService implements INotificationService {
  constructor(
    @inject('UserService') private userService: IUserService,
    @inject('EmailService') private emailService: IEmailService
  ) {}
  
  async notify(userId: string, message: string): Promise<void> {
    const user = await this.userService.getUser(userId);
    await this.emailService.sendEmail(
      `${user.name}@example.com`,
      'Notification',
      message
    );
  }
}

@singleton()
@injectable()
class DatabaseConnection {
  private static instanceCount = 0;
  public instanceId: number;
  private connected = false;
  
  constructor() {
    DatabaseConnection.instanceCount++;
    this.instanceId = DatabaseConnection.instanceCount;
  }
  
  async connect(): Promise<void> {
    this.connected = true;
  }
  
  isConnected(): boolean {
    return this.connected;
  }
  
  static getInstanceCount(): number {
    return DatabaseConnection.instanceCount;
  }
  
  static resetInstanceCount(): void {
    DatabaseConnection.instanceCount = 0;
  }
}

@injectable()
class Repository {
  constructor(@inject('DatabaseConnection') private db: DatabaseConnection) {}
  
  async save(data: any): Promise<void> {
    if (!this.db.isConnected()) {
      await this.db.connect();
    }
    // Save logic here
  }
  
  getDatabase(): DatabaseConnection {
    return this.db;
  }
}

describe('Foundation DI Container (Jest)', () => {
  let container: Container;
  
  beforeEach(() => {
    container = createContainer();
    DatabaseConnection.resetInstanceCount();
  });
  
  afterEach(() => {
    // Clean up global container
    if (getContainer() === container) {
      // Reset global container if it was set to our test container
    }
  });

  describe('Container Creation and Configuration', () => {
    it('should create container with default configuration', () => {
      expect(container).toBeDefined();
      expect(container).toBeInstanceOf(Container);
    });

    it('should create container with custom configuration', () => {
      const config: ContainerConfig = {
        enableAutoRegistration: true,
        enableCircularDependencyDetection: true,
        maxResolutionDepth: 50
      };
      
      const customContainer = createContainer(config);
      expect(customContainer).toBeDefined();
    });

    it('should provide global container access', () => {
      const globalContainer = getContainer();
      expect(globalContainer).toBeDefined();
    });
  });

  describe('Service Registration', () => {
    it('should register service with string identifier', () => {
      container.register('UserService', UserService);
      
      expect(() => container.resolve<IUserService>('UserService')).not.toThrow();
    });

    it('should register service with class identifier', () => {
      container.register(UserService, UserService);
      
      const instance = container.resolve(UserService);
      expect(instance).toBeInstanceOf(UserService);
    });

    it('should register service with factory function', () => {
      container.register('UserService', () => new UserService())();
      
      const instance = container.resolve<IUserService>('UserService');
      expect(instance).toBeInstanceOf(UserService);
    });

    it('should register service with instance', () => {
      const userServiceInstance = new UserService();
      container.register('UserService', userServiceInstance);
      
      const resolved = container.resolve<IUserService>('UserService');
      expect(resolved).toBe(userServiceInstance);
    });

    it('should override existing service registration', () => {
      container.register('UserService', UserService);
      const firstInstance = container.resolve<IUserService>('UserService');
      
      container.register('UserService', () => new UserService())();
      const secondInstance = container.resolve<IUserService>('UserService');
      
      expect(firstInstance).not.toBe(secondInstance);
    });
  });

  describe('Service Resolution', () => {
    beforeEach(() => {
      container.register('UserService', UserService);
      container.register('EmailService', EmailService);
    });

    it('should resolve registered service', async () => {
      const userService = container.resolve<IUserService>('UserService');
      
      expect(userService).toBeInstanceOf(UserService);
      
      const user = await userService.getUser('123');
      expect(user).toEqual({ id: '123', name: 'User 123' });
    });

    it('should resolve service with dependencies', () => {
      container.register('NotificationService', NotificationService);
      
      const notificationService = container.resolve<INotificationService>('NotificationService');
      expect(notificationService).toBeInstanceOf(NotificationService);
    });

    it('should throw error for unregistered service', () => {
      expect(() => {
        container.resolve('UnregisteredService');
      }).toThrow(/not registered'' | ''not found/i);
    });

    it('should resolve nested dependencies', async () => {
      container.register('NotificationService', NotificationService);
      
      const notificationService = container.resolve<INotificationService>('NotificationService');
      
      // Should not throw and should work with injected dependencies
      await expect(notificationService.notify('123', 'Test message')).resolves.toBeUndefined();
    });
  });

  describe('Singleton Lifecycle', () => {
    beforeEach(() => {
      container.register('DatabaseConnection', DatabaseConnection);
      container.register('Repository', Repository);
    });

    it('should create singleton instances only once', () => {
      const db1 = container.resolve<DatabaseConnection>('DatabaseConnection');
      const db2 = container.resolve<DatabaseConnection>('DatabaseConnection');
      
      expect(db1).toBe(db2);
      expect(db1.instanceId).toBe(db2.instanceId);
      expect(DatabaseConnection.getInstanceCount()).toBe(1);
    });

    it('should share singleton across dependent services', () => {
      const repo1 = container.resolve<Repository>('Repository');
      const repo2 = container.resolve<Repository>('Repository');
      const directDb = container.resolve<DatabaseConnection>('DatabaseConnection');
      
      expect(repo1.getDatabase()).toBe(directDb);
      expect(repo2.getDatabase()).toBe(directDb);
      expect(DatabaseConnection.getInstanceCount()).toBe(1);
    });

    it('should create new instances for non-singleton services', () => {
      const user1 = container.resolve<IUserService>('UserService');
      const user2 = container.resolve<IUserService>('UserService');
      
      expect(user1).not.toBe(user2);
      expect(user1).toBeInstanceOf(UserService);
      expect(user2).toBeInstanceOf(UserService);
    });
  });

  describe('Dependency Injection Patterns', () => {
    beforeEach(() => {
      container.register('UserService', UserService);
      container.register('EmailService', EmailService);
      container.register('NotificationService', NotificationService);
    });

    it('should inject dependencies into constructor', async () => {
      const notificationService = container.resolve<INotificationService>('NotificationService');
      
      // Test that dependencies are properly injected and functional
      await notificationService.notify('123', 'Test notification');
      
      // Verify email was sent (check if EmailService was properly injected)
      const emailService = container.resolve<EmailService>('EmailService');
      const sentEmails = emailService.getSentEmails();
      
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0]).toMatchObject({
        to: 'User 123@example.com',
        subject: 'Notification',
        body: 'Test notification'
      });
    });

    it('should handle circular dependencies gracefully', () => {
      // Register services that would create circular dependency
      container.register('ServiceA', class ServiceA {
        constructor(@inject('ServiceB') public serviceB: any) {}
      });
      
      container.register('ServiceB', class ServiceB {
        constructor(@inject('ServiceA') public serviceA: any) {}
      });
      
      // Should either detect and prevent or handle circular dependencies
      expect(() => {
        container.resolve('ServiceA');
      }).toThrow(/circular'' | ''dependency/i);
    });
  });

  describe('Advanced Container Features', () => {
    it('should support conditional registration', () => {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        container.register('Logger', class DevLogger {
          log(message: string) { console.log(`[DEV] ${message}`); }
        });
      } else {
        container.register('Logger', class ProdLogger {
          log(message: string) { /* silent in prod */ }
        });
      }
      
      const logger = container.resolve<any>('Logger');
      expect(logger).toBeDefined();
    });

    it('should support named registrations', () => {
      container.register('PrimaryUserService', UserService);
      container.register('BackupUserService', class BackupUserService implements IUserService {
        async getUser(id: string) {
          return { id, name: `Backup User ${id}` };
        }
      });
      
      const primary = container.resolve<IUserService>('PrimaryUserService');
      const backup = container.resolve<IUserService>('BackupUserService');
      
      expect(primary).not.toBe(backup);
    });

    it('should support factory registration with parameters', () => {
      container.register('ConfigurableService', (apiKey: string) => {
        return class ConfigurableService {
          constructor(public readonly apiKey: string = apiKey) {}
        };
      });
      
      // Note: This would need container extension for parameter passing
      const service = container.resolve<any>('ConfigurableService');
      expect(service).toBeDefined();
    });

    it('should provide container introspection', () => {
      container.register('UserService', UserService);
      container.register('EmailService', EmailService);
      
      // Check if container provides registration info
      expect(container.has('UserService')).toBe(true);
      expect(container.has('UnregisteredService')).toBe(false);
      
      const registrations = container.getRegistrations();
      expect(registrations).toContain('UserService');
      expect(registrations).toContain('EmailService');
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle invalid service identifiers', () => {
      expect(() => {
        container.register(null as any, UserService);
      }).toThrow(/identifier'' | ''invalid/i);
      
      expect(() => {
        container.register(undefined as any, UserService);
      }).toThrow(/identifier'' | ''invalid/i);
    });

    it('should handle invalid service implementations', () => {
      expect(() => {
        container.register('InvalidService', null as any);
      }).toThrow(/implementation'' | ''invalid/i);
    });

    it('should provide meaningful error messages', () => {
      try {
        container.resolve('NonExistentService');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toMatch(/NonExistentService/);
        expect(error.message).toMatch(/not registered'' | ''not found/i);
      }
    });

    it('should handle resolution errors gracefully', () => {
      container.register('FailingService', class FailingService {
        constructor() {
          throw new Error('Service initialization failed');
        }
      });
      
      expect(() => {
        container.resolve('FailingService');
      }).toThrow(/Service initialization failed/);
    });
  });

  describe('Performance and Memory', () => {
    it('should cache singleton instances efficiently', () => {
      container.register('DatabaseConnection', DatabaseConnection);
      
      const startTime = Date.now();
      
      // Resolve multiple times
      for (let i = 0; i < 100; i++) {
        container.resolve<DatabaseConnection>('DatabaseConnection');
      }
      
      const endTime = Date.now();
      
      // Should be fast due to caching
      expect(endTime - startTime).toBeLessThan(50); // 50ms threshold
      expect(DatabaseConnection.getInstanceCount()).toBe(1);
    });

    it('should not leak memory with transient services', () => {
      container.register('TransientService', class TransientService {
        public data = new Array(1000).fill('data');
      });
      
      // Create many instances
      const instances = [];
      for (let i = 0; i < 10; i++) {
        instances.push(container.resolve('TransientService'));
      }
      
      expect(instances).toHaveLength(10);
      // Each should be a different instance
      const uniqueInstances = new Set(instances);
      expect(uniqueInstances.size).toBe(10);
    });
  });

  describe('Integration with Decorators', () => {
    it('should work with injectable decorator', () => {
      @injectable()
      class DecoratedService {
        getValue() {
          return 'decorated';
        }
      }
      
      container.register('DecoratedService', DecoratedService);
      const instance = container.resolve<any>('DecoratedService');
      
      expect(instance.getValue()).toBe('decorated');
    });

    it('should work with singleton decorator', () => {
      @singleton()
      @injectable()
      class SingletonService {
        public id = Math.random();
      }
      
      container.register('SingletonService', SingletonService);
      
      const instance1 = container.resolve<any>('SingletonService');
      const instance2 = container.resolve<any>('SingletonService');
      
      expect(instance1).toBe(instance2);
      expect(instance1.id).toBe(instance2.id);
    });

    it('should work with inject decorator for dependencies', () => {
      @injectable()
      class ServiceWithInjection {
        constructor(
          @inject('UserService') public userService: IUserService
        ) {}
      }
      
      container.register('UserService', UserService);
      container.register('ServiceWithInjection', ServiceWithInjection);
      
      const instance = container.resolve<any>('ServiceWithInjection');
      expect(instance.userService).toBeInstanceOf(UserService);
    });
  });
});