# Foundation Package Migration Guide

## 🚀 Battle-Tested Dependencies Migration

The foundation package has been enhanced with battle-tested npm packages to replace custom implementations. This provides better maintenance, documentation, and community support.

## ✅ Available Migrations

### 1. Configuration System → Convict + Dotenv ✅

**Old (Legacy):**
```typescript
import { getSharedConfig, configHelpers } from '@claude-zen/foundation';

const config = getSharedConfig();
const debug = config.development.debug;
```

**New (Recommended):**
```typescript
import { getConfig, configHelpers } from '@claude-zen/foundation';

const config = getConfig();
const debug = config.development.debug;

// Or use helpers
const debug = configHelpers.isDebug();
```

**Benefits:**
- JSON schema validation with convict
- Environment variable coercion and validation
- Better error messages for invalid config
- Documentation generation from schema

### 2. Error Handling → Neverthrow + p-retry + opossum ✅

**Old (Legacy):**
```typescript
import { safeAsync, withRetry, CircuitBreaker } from '@claude-zen/foundation';

const result = await safeAsync(() => riskyOperation());
const retryResult = await withRetry(() => operation(), { retries: 3 });
```

**New (Recommended):**
```typescript
import { 
  safeAsync, 
  withRetry, 
  createCircuitBreaker,
  ok, 
  err, 
  Result 
} from '@claude-zen/foundation';

// Type-safe Result pattern with neverthrow
const result: Result<Data, Error> = await safeAsync(() => riskyOperation());
if (result.isOk()) {
  console.log(result.value);
} else {
  console.error(result.error);
}

// Advanced retry with p-retry
const retryResult = await withRetry(() => operation(), {
  retries: 3,
  factor: 2,
  shouldRetry: (error) => error.name !== 'ValidationError'
});

// Production-ready circuit breaker with opossum
const breaker = createCircuitBreaker(
  async (data) => await apiCall(data),
  { timeout: 5000, errorThresholdPercentage: 50 }
);

const circuitResult = await breaker.execute(myData);
```

**Benefits:**
- Industry-standard Result<T, E> pattern
- Battle-tested retry logic with exponential backoff
- Production-ready circuit breaker with metrics
- Better TypeScript support

### 3. Dependency Injection → TSyringe 🚧

**Status:** Coming soon (dependency installation in progress)

**Preview:**
```typescript
import { injectable, inject, getGlobalContainer } from '@claude-zen/foundation';

@injectable()
class UserService {
  constructor(
    @inject('Logger') private logger: Logger,
    @inject('Database') private db: Database
  ) {}
}

const container = getGlobalContainer();
container.registerSingleton('UserService', UserService);
const userService = container.resolve('UserService');
```

## 📋 Migration Checklist

### Phase 1: Configuration (Available Now)
- [ ] Replace `getSharedConfig()` with `getModernConfig()`
- [ ] Replace `configHelpers` with `modernConfigHelpers`
- [ ] Update configuration file formats to use JSON schema
- [ ] Add environment validation

### Phase 2: Error Handling (Available Now)
- [ ] Replace custom `Result` with neverthrow `Result<T, E>`
- [ ] Update retry logic to use p-retry configuration
- [ ] Replace custom circuit breakers with opossum
- [ ] Update error handling patterns

### Phase 3: Dependency Injection (Coming Soon)
- [ ] Install tsyringe dependency properly
- [ ] Replace custom DI decorators with TSyringe
- [ ] Update service registration patterns
- [ ] Migrate to TSyringe container

## 🔄 Backwards Compatibility

All legacy systems remain available with prefixed names:

```typescript
// Legacy systems still work
import { 
  getSharedConfig,           // Original config system
  legacySafeAsync,           // Original error handling
  LegacyCircuitBreaker,      // Original circuit breaker
  DIContainer               // Original DI container
} from '@claude-zen/foundation';

// Modern systems available alongside
import { 
  getModernConfig,          // New convict-based config
  safeAsync,                // New neverthrow-based errors
  createCircuitBreaker,     // New opossum circuit breaker
  // ModernDIContainer      // Coming soon: TSyringe DI
} from '@claude-zen/foundation';
```

## 🎯 Performance Benefits

### Configuration System
- **Validation:** Runtime schema validation prevents invalid configs
- **Type Safety:** Better TypeScript inference from schema
- **Environment:** Automatic environment variable coercion

### Error Handling
- **Memory:** Better memory usage with neverthrow Result pattern
- **Retry Logic:** More sophisticated retry strategies with p-retry
- **Circuit Breaker:** Production-grade metrics and monitoring with opossum

### Dependency Injection (Coming Soon)
- **Performance:** TSyringe is optimized for performance
- **Bundle Size:** Better tree-shaking support
- **Ecosystem:** Integrates with existing TypeScript/NestJS patterns

## 🛠️ Implementation Details

### Dependencies Added
```json
{
  "dependencies": {
    "convict": "^6.2.4",
    "dotenv": "^17.2.1",
    "@types/convict": "^6.1.6",
    "neverthrow": "^8.2.0",
    "p-retry": "^6.2.1",
    "opossum": "^9.0.0",
    "@types/opossum": "^8.1.9"
  }
}
```

### File Structure
```
packages/foundation/
├── config.ts              # Legacy configuration system
├── config-new.ts          # New convict-based system
├── error-handling.ts      # Legacy error utilities
├── error-handling-new.ts  # New neverthrow/p-retry/opossum
├── di/                    # Legacy DI system
├── di-new.ts             # New TSyringe system (pending)
└── index.ts              # Exports both legacy and modern
```

## 🚀 Next Steps

1. **Start with Configuration:** Begin migrating to `getModernConfig()`
2. **Adopt Error Handling:** Update error patterns to use neverthrow Result
3. **Prepare for DI:** Plan TSyringe migration when available
4. **Update Tests:** Gradually update test suites to use new systems
5. **Monitor Performance:** Track improvements in error handling and config validation

## 💡 Best Practices

### Configuration
- Use environment-specific config files (`.claude-zen/development.json`)
- Leverage schema validation for early error detection
- Document configuration options in the schema

### Error Handling
- Prefer `Result<T, E>` pattern over try/catch for business logic
- Use circuit breakers for external service calls
- Configure retry strategies based on error types

### Migration Strategy
- Migrate incrementally, starting with new code
- Keep legacy systems for existing code until ready to migrate
- Test thoroughly with both systems during transition period

---

**Status:** ✅ Configuration and Error Handling systems ready for use
**Coming Soon:** 🚧 TSyringe DI system (pending dependency resolution)