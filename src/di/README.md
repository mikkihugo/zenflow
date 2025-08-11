# Dependency Injection System

A comprehensive, type-safe dependency injection system for Claude Code Zen, following enterprise patterns and Google TypeScript Style Guide.

## Overview

The DI system provides:
- **Type-safe service registration and resolution**
- **Decorator-based dependency injection** (`@injectable`, `@inject`)
- **Multiple service lifestyles** (singleton, transient, scoped)
- **Circular dependency detection**
- **Hierarchical scoping**
- **Automatic disposal and cleanup**

## Quick Start

### Basic Usage

```typescript
import { 
  DIContainer, 
  SingletonProvider, 
  createToken, 
  injectable, 
  inject 
} from './di/index.js';

// Define service interfaces
interface ILogger {
  log(message: string): void;
}

interface IUserService {
  createUser(name: string): void;
}

// Create tokens
const LOGGER_TOKEN = createToken<ILogger>('Logger');
const USER_SERVICE_TOKEN = createToken<IUserService>('UserService');

// Implement services
class ConsoleLogger implements ILogger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

@injectable
class UserService implements IUserService {
  constructor(@inject(LOGGER_TOKEN) private logger: ILogger) {}
  
  createUser(name: string): void {
    this.logger.log(`Creating user: ${name}`);
  }
}

// Set up container
const container = new DIContainer();
container.register(LOGGER_TOKEN, new SingletonProvider(() => new ConsoleLogger()));
container.register(USER_SERVICE_TOKEN, new SingletonProvider(c => 
  new UserService(c.resolve(LOGGER_TOKEN))
));

// Use services
const userService = container.resolve(USER_SERVICE_TOKEN);
userService.createUser('John Doe');
```

### Using Builder Pattern

```typescript
import { createContainerBuilder, CORE_TOKENS } from './di/index.js';

const container = createContainerBuilder()
  .singleton(CORE_TOKENS.Logger, () => new ConsoleLogger())
  .singleton(CORE_TOKENS.Config, () => new AppConfig())
  .transient(USER_SERVICE_TOKEN, c => new UserService(
    c.resolve(CORE_TOKENS.Logger),
    c.resolve(CORE_TOKENS.Config)
  ))
  .build();
```

## Core Concepts

### Service Lifestyles

#### Singleton
One instance per container:
```typescript
container.register(token, new SingletonProvider(() => new MyService()));
```

#### Transient
New instance every time:
```typescript
container.register(token, new TransientProvider(() => new MyService()));
```

#### Scoped
One instance per scope:
```typescript
container.register(token, new ScopedProvider(() => new MyService()));

const scope = container.createScope();
const service1 = scope.resolve(token); // Creates instance
const service2 = scope.resolve(token); // Returns same instance
```

### Decorators

#### @injectable
Marks a class as injectable:
```typescript
@injectable
class MyService {
  constructor(@inject(DEPENDENCY_TOKEN) private dep: IDependency) {}
}
```

#### @inject
Specifies which token to inject for a parameter:
```typescript
constructor(
  @inject(LOGGER_TOKEN) private logger: ILogger,
  @inject(CONFIG_TOKEN) private config: IConfig
) {}
```

### Tokens

Type-safe service tokens:
```typescript
// Create token
const SERVICE_TOKEN = createToken<IMyService>('MyService');

// Create from class
const CLASS_TOKEN = createTokenFromClass(MyClass);

// Use predefined tokens
import { CORE_TOKENS, SWARM_TOKENS, NEURAL_TOKENS } from './di/index.js';
```

## Architecture Integration

### Swarm Coordination Example

```typescript
import { 
  SWARM_TOKENS, 
  CORE_TOKENS,
  EnhancedSwarmCoordinator,
  createSwarmContainer 
} from './di/index.js';

// Create pre-configured container
const container = createSwarmContainer({
  'swarm.maxAgents': 10,
  'swarm.topology': 'mesh'
});

// Use swarm coordinator
const coordinator = container.resolve(SWARM_TOKENS.SwarmCoordinator);
await coordinator.initializeSwarm({ name: 'my-swarm' });
```

### Integration with Existing Services

```typescript
// Before: Manual dependency management
class OldSwarmCoordinator {
  constructor() {
    this.logger = new ConsoleLogger();
    this.config = new FileConfig();
    this.agentRegistry = new AgentRegistry(this.logger);
  }
}

// After: DI-based approach
@injectable
class NewSwarmCoordinator {
  constructor(
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.Config) private config: IConfig,
    @inject(SWARM_TOKENS.AgentRegistry) private agentRegistry: IAgentRegistry
  ) {}
}
```

## Testing with DI

### Unit Testing
```typescript
describe('UserService', () => {
  let container: DIContainer;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    container = new DIContainer();
    mockLogger = {
      log: vi.fn(),
      error: vi.fn(),
    };
    
    container.register(LOGGER_TOKEN, new SingletonProvider(() => mockLogger));
    container.register(USER_SERVICE_TOKEN, new SingletonProvider(c => 
      new UserService(c.resolve(LOGGER_TOKEN))
    ));
  });

  it('should log user creation', () => {
    const userService = container.resolve(USER_SERVICE_TOKEN);
    userService.createUser('John');
    
    expect(mockLogger.log).toHaveBeenCalledWith('Creating user: John');
  });
});
```

### Integration Testing
```typescript
describe('Complete System Integration', () => {
  it('should integrate all services', async () => {
    const container = createSwarmContainer();
    const coordinator = container.resolve(SWARM_TOKENS.SwarmCoordinator);
    
    await coordinator.initializeSwarm({ name: 'test' });
    const agentId = await coordinator.addAgent({ type: 'worker' });
    
    expect(typeof agentId).toBe('string');
  });
});
```

## Available Tokens

### Core System Tokens
```typescript
import { CORE_TOKENS } from './di/index.js';

CORE_TOKENS.Logger      // ILogger
CORE_TOKENS.Config      // IConfig  
CORE_TOKENS.EventBus    // IEventBus
CORE_TOKENS.Database    // IDatabase
CORE_TOKENS.HttpClient  // IHttpClient
```

### Swarm Tokens
```typescript
import { SWARM_TOKENS } from './di/index.js';

SWARM_TOKENS.SwarmCoordinator  // ISwarmCoordinator
SWARM_TOKENS.AgentRegistry     // IAgentRegistry
SWARM_TOKENS.MessageBroker     // IMessageBroker
SWARM_TOKENS.LoadBalancer      // ILoadBalancer
SWARM_TOKENS.TopologyManager   // ITopologyManager
```

### Neural Network Tokens
```typescript
import { NEURAL_TOKENS } from './di/index.js';

NEURAL_TOKENS.NetworkTrainer    // INeuralNetworkTrainer
NEURAL_TOKENS.DataLoader        // IDataLoader
NEURAL_TOKENS.OptimizationEngine // IOptimizationEngine
NEURAL_TOKENS.ModelStorage      // IModelStorage
NEURAL_TOKENS.MetricsCollector  // IMetricsCollector
```

## Performance

The DI system is designed for high performance:
- **< 1ms resolution time** for most services
- **< 10% overhead** compared to direct instantiation
- **Efficient singleton caching**
- **Lazy loading** for expensive services

Performance test results:
```
Resolved 30,000 services in 45ms (666,667 resolutions/sec)
```

## Error Handling

### Circular Dependencies
```typescript
// Automatically detected and prevented
const tokenA = createToken<ServiceA>('ServiceA');
const tokenB = createToken<ServiceB>('ServiceB');

container.register(tokenA, new SingletonProvider(c => new ServiceA(c.resolve(tokenB))));
container.register(tokenB, new SingletonProvider(c => new ServiceB(c.resolve(tokenA))));

// Throws: CircularDependencyError
container.resolve(tokenA);
```

### Service Not Found
```typescript
// Throws: ServiceNotFoundError
container.resolve(UNREGISTERED_TOKEN);
```

### Resolution Depth
```typescript
// Configurable maximum resolution depth
const container = new DIContainer({
  maxResolutionDepth: 50,
  enableCircularDependencyDetection: true
});
```

## Configuration

### Container Options
```typescript
const container = new DIContainer({
  enableCircularDependencyDetection: true,  // Default: true
  maxResolutionDepth: 50,                   // Default: 50
  enablePerformanceMetrics: false,          // Default: false
  autoRegisterByConvention: false,          // Default: false
});
```

### Environment-based Configuration
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const container = createContainerBuilder()
  .singleton(CORE_TOKENS.Logger, () => 
    isDevelopment ? new ConsoleLogger() : new FileLogger()
  )
  .build();
```

## Migration Guide

### From Manual Dependency Management
1. **Identify dependencies** in constructor parameters
2. **Create tokens** for each dependency type
3. **Add @injectable** decorator to classes
4. **Add @inject** decorators to parameters
5. **Register services** in container
6. **Resolve from container** instead of using `new`

### Example Migration
```typescript
// Before
class UserService {
  private logger = new ConsoleLogger();
  private config = new FileConfig();
  
  createUser(name: string) {
    this.logger.log(`Creating ${name}`);
  }
}

// After
@injectable
class UserService {
  constructor(
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.Config) private config: IConfig
  ) {}
  
  createUser(name: string) {
    this.logger.log(`Creating ${name}`);
  }
}
```

## Best Practices

### 1. Use Interfaces
Always depend on interfaces, not concrete implementations:
```typescript
// Good
constructor(@inject(LOGGER_TOKEN) private logger: ILogger) {}

// Avoid
constructor(@inject(LOGGER_TOKEN) private logger: ConsoleLogger) {}
```

### 2. Prefer Constructor Injection
Use constructor injection over property or method injection:
```typescript
// Good
@injectable
class UserService {
  constructor(@inject(LOGGER_TOKEN) private logger: ILogger) {}
}

// Avoid property injection (not implemented)
```

### 3. Keep Constructors Simple
Don't do work in constructors, keep them for dependency assignment only:
```typescript
// Good
constructor(@inject(LOGGER_TOKEN) private logger: ILogger) {}

async initialize() {
  // Do initialization work here
}

// Avoid
constructor(@inject(LOGGER_TOKEN) private logger: ILogger) {
  this.heavyInitialization(); // Don't do this
}
```

### 4. Use Scopes Appropriately
- **Singleton**: For stateless services, shared resources
- **Transient**: For stateful services, commands
- **Scoped**: For request-scoped or user-scoped services

### 5. Dispose Resources
Always dispose containers and scopes:
```typescript
const container = new DIContainer();
try {
  // Use container
} finally {
  await container.dispose();
}
```

## Advanced Features

### Factory Providers
```typescript
container.register(TOKEN, new FactoryProvider(c => {
  const config = c.resolve(CONFIG_TOKEN);
  return config.get('useCache') ? new CachedService() : new DirectService();
}));
```

### Conditional Registration
```typescript
const container = createContainerBuilder();

if (process.env.NODE_ENV === 'development') {
  container.singleton(LOGGER_TOKEN, () => new ConsoleLogger());
} else {
  container.singleton(LOGGER_TOKEN, () => new FileLogger());
}
```

### Global Container
```typescript
import { getGlobalContainer, setGlobalContainer } from './di/index.js';

// Set up global container once
const container = createSwarmContainer();
setGlobalContainer(container);

// Use anywhere in the application
const logger = getGlobalContainer().resolve(CORE_TOKENS.Logger);
```

## API Reference

See the individual TypeScript files for detailed API documentation:
- `src/di/types/di-types.ts` - Core type definitions
- `src/di/container/di-container.ts` - Main container implementation
- `src/di/decorators/` - Decorator implementations
- `src/di/providers/` - Provider implementations
- `src/di/tokens/` - Token definitions

## Examples

Complete working examples can be found in:
- `src/di/examples/swarm-integration.ts` - SwarmCoordinator integration
- `src/di/demo/simple-di-demo.ts` - Basic usage demonstration
- `src/__tests__/unit/di/` - Test examples showing various usage patterns