/**
 * Working DI System Demonstration
 * Shows how the DI system works without complex test setup
 */

// Simple manual test of the DI container
console.log('🚀 Starting DI System Demonstration...');

// Basic type definitions
interface Logger {
  log(message: string): void;
}

interface Config {
  get(key: string): any;
}

// Simple implementations
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

class SimpleConfig implements Config {
  private data = new Map([
    ['app.name', 'Claude Code Zen'],
    ['app.version', '2.0.0'],
  ]);

  get(key: string): any {
    return this.data.get(key);
  }
}

// Simple DI container implementation
class SimpleDIContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  register<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  resolve<T>(name: string): T {
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Service ${name} not registered`);
    }

    const instance = factory();
    this.services.set(name, instance);
    return instance;
  }
}

// Demo service that uses dependencies
class UserService {
  constructor(
    private logger: Logger,
    private config: Config
  ) {}

  createUser(name: string): void {
    const appName = this.config.get('app.name');
    this.logger.log(`Creating user ${name} in ${appName}`);
  }
}

// Set up container and demonstrate DI
function demonstrateDI(): void {
  console.log('📦 Setting up DI container...');
  
  const container = new SimpleDIContainer();
  
  // Register services
  container.register<Logger>('logger', () => new ConsoleLogger());
  container.register<Config>('config', () => new SimpleConfig());
  container.register<UserService>('userService', () => {
    const logger = container.resolve<Logger>('logger');
    const config = container.resolve<Config>('config');
    return new UserService(logger, config);
  });

  console.log('✅ Services registered');

  // Use the services
  const userService = container.resolve<UserService>('userService');
  userService.createUser('John Doe');

  // Test that singletons work
  const logger1 = container.resolve<Logger>('logger');
  const logger2 = container.resolve<Logger>('logger');
  
  console.log('🔄 Singleton test:', logger1 === logger2 ? 'PASS' : 'FAIL');
  
  console.log('✨ DI System demonstration completed successfully!');
}

// Run the demonstration
try {
  demonstrateDI();
} catch (error) {
  console.error('❌ DI demonstration failed:', error);
  process.exit(1);
}

export { SimpleDIContainer };