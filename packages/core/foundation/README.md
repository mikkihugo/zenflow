# @claude-zen/foundation

[![npm version](https://badge.fury.io/js/%40claude-zen%2Ffoundation.svg)](https://badge.fury.io/js/%40claude-zen%2Ffoundation)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Professional foundation utilities for the claude-code-zen ecosystem - logging, configuration, dependency injection, error handling, and type utilities.

## Features

🚀 **Tree-Shakable Architecture** - Optimal bundle sizes with focused entry points  
🛡️ **Type-Safe Error Handling** - Result pattern with neverthrow  
🔧 **Professional DI Container** - Awilix-based dependency injection  
📊 **Advanced Logging** - LogTape integration with environment configuration  
⚡ **Circuit Breakers & Retry Logic** - Cockatiel resilience patterns  
🎯 **Schema Validation** - Zod-based input validation  
📦 **Battle-Tested Dependencies** - Only production-proven libraries

## Installation

```bash
npm install @claude-zen/foundation
# or
pnpm add @claude-zen/foundation
# or
yarn add @claude-zen/foundation
```

## Quick Start

```typescript
// Tree-shakable imports (recommended)
import { getLogger } from '@claude-zen/foundation/core';
import { Result, ok, err } from '@claude-zen/foundation/resilience';
import { createContainer } from '@claude-zen/foundation/di';
import { z, validateInput } from '@claude-zen/foundation/utils';

// Basic logging
const logger = getLogger('my-app');
logger.info('Application started');

// Type-safe error handling
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return err('Division by zero');
  }
  return ok(a / b);
}

const result = divide(10, 2);
if (result.isOk()) {
  console.log('Result:', result.value); // 5
}

// Schema validation
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const validation = validateInput(
  { name: 'John', email: 'john@example.com' },
  userSchema
);
if (validation.isOk()) {
  console.log('Valid user:', validation.value);
}
```

## Entry Points (Tree-Shaking Optimized)

### Core Utilities (`/core` - 923B)

Essential logging, configuration, and environment detection:

```typescript
import {
  getLogger,
  getConfig,
  isDevelopment,
  isProduction,
  isTest,
} from '@claude-zen/foundation/core';
```

### Dependency Injection (`/di` - 1.2KB)

Professional IoC container and service management:

```typescript
import {
  createContainer,
  inject,
  asFunction,
  asClass,
  asValue,
} from '@claude-zen/foundation/di';

const container = createContainer();
container.register({
  userService: asClass(UserService).singleton(),
  config: asValue({ apiUrl: 'https://api.example.com' }),
});
```

### Resilience Patterns (`/resilience` - 1.8KB)

Error handling, circuit breakers, and retry logic:

```typescript
import {
  Result,
  ok,
  err,
  withRetry,
  circuitBreaker,
  safeAsync,
} from '@claude-zen/foundation/resilience';

// Circuit breaker
const apiCall = circuitBreaker(async () => fetch('/api/data'), {
  timeout: 5000,
  errorThresholdPercentage: 50,
});

// Retry with exponential backoff
const resilientCall = withRetry(apiCall, {
  maxAttempts: 3,
  backoff: new ExponentialBackoff(),
});
```

### Utilities (`/utils` - 2.1KB)

Validation, date operations, and common utilities:

```typescript
import {
  z,
  validateInput,
  _,
  nanoid,
  format,
  addDays,
} from '@claude-zen/foundation/utils';

// Schema validation
const schema = z.object({ id: z.string(), count: z.number() });
const result = validateInput(data, schema);

// Date operations
const tomorrow = addDays(new Date(), 1);
const formatted = format(tomorrow, 'yyyy-MM-dd');

// Utilities
const uniqueId = nanoid();
const processedData = _(data).groupBy('category').value();
```

## Bundle Size Comparison

| Entry Point                         | Size  | Use Case               |
| ----------------------------------- | ----- | ---------------------- |
| `@claude-zen/foundation`            | 2.8KB | Minimal essentials     |
| `@claude-zen/foundation/core`       | 923B  | Logging & config only  |
| `@claude-zen/foundation/di`         | 1.2KB | Dependency injection   |
| `@claude-zen/foundation/resilience` | 1.8KB | Error handling         |
| `@claude-zen/foundation/utils`      | 2.1KB | Validation & utilities |

**🌳 Tree-Shaking Benefits: 92% bundle size reduction (36KB → 2.8KB)**

## Advanced Usage

### Error Handling with Context

```typescript
import {
  EnhancedError,
  createCircuitBreaker,
} from '@claude-zen/foundation/resilience';

class UserService {
  async getUser(id: string): Promise<Result<User, EnhancedError>> {
    try {
      const user = await this.repository.findById(id);
      return ok(user);
    } catch (error) {
      return err(
        new EnhancedError(
          'Failed to get user',
          { userId: id, timestamp: Date.now() },
          'USER_NOT_FOUND'
        )
      );
    }
  }
}
```

### Logging Configuration

```typescript
// Environment variables
ZEN_LOG_LEVEL = debug;
ZEN_LOG_FORMAT = json;
ZEN_LOG_CONSOLE = true;
ZEN_LOG_FILE = app.log;
ZEN_LOG_COMPONENT_DATABASE = debug;
ZEN_LOG_COMPONENT_AUTH = info;
```

### Dependency Injection Patterns

```typescript
import { createServiceContainer } from '@claude-zen/foundation/di';

const container = createServiceContainer();

// Service registration
container.register('database', asClass(DatabaseService).singleton());
container.register('userService', asClass(UserService).scoped());
container.register('config', asValue(loadConfig()));

// Service resolution with type safety
const userService = container.resolve<UserService>('userService');
```

## Configuration

The foundation package supports comprehensive configuration through environment variables:

```bash
# Logging
ZEN_LOG_LEVEL=info|debug|warn|error
ZEN_LOG_FORMAT=json|text
ZEN_LOG_CONSOLE=true|false
ZEN_LOG_FILE=path/to/logfile

# Environment
NODE_ENV=production|development|test
ZEN_DEBUG=true|false

# Component-specific logging
ZEN_LOG_COMPONENT_DATABASE=debug
ZEN_LOG_COMPONENT_AUTH=info
```

## TypeScript Support

Full TypeScript support with strict type checking:

```typescript
import type {
  Logger,
  Config,
  UUID,
  JsonObject,
  Result,
  ServiceContainer,
} from '@claude-zen/foundation';

// Type-safe service resolution
interface UserService {
  getUser(id: UUID): Promise<Result<User, Error>>;
}

const userService = container.resolve<UserService>('userService');
```

## Architecture

The foundation package follows a 3-tier architecture:

- **Tier 1**: Public API with tree-shakable entry points
- **Tier 2**: Internal implementations (private)
- **Tier 3**: Deep internals (restricted access)

This ensures:

- 70%+ code reduction through intelligent delegation
- Zero breaking changes via stable facades
- Lazy loading for optimal performance
- Graceful degradation when packages unavailable

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Dependencies

**Core Dependencies (Production-Proven):**

- `neverthrow` - Type-safe Result pattern
- `cockatiel` - Circuit breakers and resilience
- `awilix` - Dependency injection container
- `@logtape/logtape` - Professional logging
- `zod` - Schema validation
- `lodash` - Utility functions
- `date-fns` - Date manipulation
- `nanoid` - Short unique IDs

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and breaking changes.

---

**Part of the [claude-code-zen](https://github.com/zen-neural/claude-code-zen) ecosystem.**
