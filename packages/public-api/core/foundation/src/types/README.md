# Foundation Types - Type Architecture Documentation

## Overview

The `@claude-zen/foundation/types` package provides the foundational type system for the entire claude-code-zen monorepo. It contains shared primitive types, structural patterns, and error handling that serve as the stable base layer for all other packages.

## Type Architecture Philosophy

### Single Source of Truth

Foundation types establish a **single source of truth** for basic primitives that all packages depend on. This ensures consistency and prevents type fragmentation across the monorepo.

### Stability First

Foundation types prioritize **stability over flexibility**. These types change infrequently and maintain backward compatibility to prevent breaking changes across the entire monorepo.

### Domain Agnostic

Foundation types contain **zero domain-specific knowledge**. They represent universal concepts that apply across all business domains and technical contexts.

## Package Structure

```
/packages/foundation/src/types/
├── index.ts          # Main export file with comprehensive documentation
├── primitives.ts     # Basic types, IDs, enums, utility types
├── patterns.ts       # Structural patterns and interfaces
├── errors.ts         # Error types and handling patterns
└── README.md         # This documentation file
```

## Type Categories

### 1. Primitives (`primitives.ts`)

**Purpose**: Most basic, universally applicable types

**Contains**:

- **Identifiers**: `ID`, `UUID`, `Timestamp`, `ISODateString`
- **Enums**: `Priority`, `Status`, `LogLevel`, `Environment`
- **Utility Types**: `Optional<T, K>`, `NonEmptyArray<T>`, `DeepReadonly<T>`
- **Branded Types**: `Email`, `URL`, `FilePath`, `JSONString`
- **Type Guards**: Runtime validation functions
- **Utility Functions**: Helper functions for type manipulation

**Examples**:

```typescript
import type { UUID, Priority, Optional } from '@claude-zen/foundation/types';

interface Task {
  id: UUID;
  priority: Priority;
}

// Make some fields optional
type TaskUpdate = Optional<Task, 'priority'>;
```

### 2. Patterns (`patterns.ts`)

**Purpose**: Standard structural patterns for organizing data

**Contains**:

- **Temporal**: `Timestamped`, `Versioned`, `Auditable`
- **Identification**: `Identifiable`, `Named`, `Described`, `Entity`
- **Pagination**: `Paginated<T>`, `CursorPaginated<T>`
- **Results**: `OperationResult<T, E>`, `ValidationResult`
- **Search**: `QueryCriteria`, `SearchCriteria`, `FilterCriteria`
- **Configuration**: `EnvironmentConfig<T>`, `FeatureFlag`

**Examples**:

```typescript
import type {
  Timestamped,
  Paginated,
  OperationResult,
} from '@claude-zen/foundation/types';

interface User extends Timestamped {
  id: string;
  email: string;
}

type UserList = Paginated<User>;
type UserResult = OperationResult<User, ValidationError>;
```

### 3. Errors (`errors.ts`)

**Purpose**: Standardized error handling and result patterns

**Contains**:

- **Base Types**: `BaseError`, `ValidationError`, `SystemError`
- **Specialized**: `NetworkError`, `ResourceError`, `TimeoutError`
- **Result Pattern**: `Result<T, E>`, `AsyncResult<T, E>`
- **Classifications**: `ErrorSeverity`, `ErrorCategory`
- **Utilities**: Error creation, type guards, result helpers

**Examples**:

```typescript
import type { Result, ValidationError } from '@claude-zen/foundation/types';
import {
  createSuccess,
  createError,
  isSuccess,
} from '@claude-zen/foundation/types';

function validateEmail(email: string): Result<string, ValidationError> {
  if (!email.includes('@')) {
    return createError(createValidationError('Invalid email format'));
  }
  return createSuccess(email);
}

const result = validateEmail('test@example.com');
if (isSuccess(result)) {
  console.log('Valid email:', result.data);
} else {
  console.error('Validation failed:', result.error.message);
}
```

## Type Governance Rules

### ✅ What Belongs in Foundation

**CRITERIA**: Universal, domain-agnostic, stable, reusable across ALL packages

1. **Basic Primitives**
   - Universal identifiers (`ID`, `UUID`, `Timestamp`)
   - Common enumerations (`Priority`, `Status`, `LogLevel`)
   - Standard patterns (`Timestamped`, `Versioned`, `Paginated`)

2. **Error Handling**
   - Base error interfaces (`BaseError`, `ValidationError`)
   - Result patterns (`Result<T, E>`, `OperationResult<T, E>`)
   - Error classification and utilities

3. **Utility Types**
   - Generic type helpers (`Optional<T, K>`, `NonEmptyArray<T>`)
   - Branded types for type safety (`Email`, `URL`, `FilePath`)
   - Universal structural patterns

### ❌ What Does NOT Belong in Foundation

**CRITERIA**: Domain-specific, business logic, implementation details

1. **Domain-Specific Types**
   - Memory system types → `@claude-zen/memory/types`
   - Coordination types → `@claude-zen/coordination-core/types`
   - Workflow types → `@claude-zen/workflows/types`
   - AI/ML types → `@claude-zen/brain/types`

2. **Implementation Details**
   - Database schemas → `@claude-zen/database/types`
   - API request/response types → Service-specific packages
   - Component-specific configuration types

3. **Business Logic**
   - Domain rules and constraints
   - Business process definitions
   - Application-specific workflows

### Decision Framework

When deciding if a type belongs in foundation, ask these questions:

1. **Universality**: Would ALL packages potentially use this type?
2. **Domain Knowledge**: Does this type contain domain-specific concepts?
3. **Stability**: Is this type unlikely to change based on business logic?
4. **Coupling**: Does this type depend on other domain-specific types?

Only types that are universal, domain-agnostic, stable, and uncoupled belong in foundation.

## Usage Patterns

### Import Strategy

```typescript
// ✅ Import foundation types (always safe)
import type {
  UUID,
  Timestamped,
  Paginated,
  Result,
  ValidationError,
} from '@claude-zen/foundation/types';

// ✅ Import domain types from appropriate packages
import type { MemoryEntry } from '@claude-zen/memory/types';
import type { Agent } from '@claude-zen/coordination-core/types';

// ✅ Combine foundation and domain types
interface UserTask extends Timestamped {
  id: UUID;
  agent: Agent; // Domain-specific
  result: Result<string, ValidationError>; // Foundation pattern
}
```

### Common Patterns

#### 1. Entity Definition

```typescript
import type { Entity, UUID } from '@claude-zen/foundation/types';

interface User extends Entity {
  email: string;
  role: string;
}

// Entity provides: id (UUID), name, description, timestamps, version, isActive
```

#### 2. API Response Pattern

```typescript
import type { Paginated, OperationResult } from '@claude-zen/foundation/types';

interface UserService {
  listUsers(page: number): Promise<OperationResult<Paginated<User>>>;
  createUser(data: Partial<User>): Promise<OperationResult<User>>;
}
```

#### 3. Result Pattern for Error Handling

```typescript
import type { Result, ValidationError } from '@claude-zen/foundation/types';

function processData(input: unknown): Result<ProcessedData, ValidationError> {
  // Avoid throwing exceptions, return Result instead
  if (!isValid(input)) {
    return createError(createValidationError('Invalid input'));
  }
  return createSuccess(process(input));
}
```

#### 4. Configuration Pattern

```typescript
import type {
  EnvironmentConfig,
  FeatureFlag,
} from '@claude-zen/foundation/types';

interface AppConfig {
  database: EnvironmentConfig<DatabaseConfig>;
  features: FeatureFlag[];
}
```

## Migration Guide

### From Untyped to Foundation Types

**Before**:

```typescript
interface User {
  id: string; // Untyped ID
  created: number; // Raw timestamp
  updated: number; // Raw timestamp
  priority: string; // Untyped enum
}
```

**After**:

```typescript
import type { UUID, Timestamped, Priority } from '@claude-zen/foundation/types';

interface User extends Timestamped {
  id: UUID; // Branded UUID type
  priority: Priority; // Typed enum
}
// Timestamped provides: createdAt, updatedAt as branded Timestamp types
```

### From Custom Error Handling to Foundation Patterns

**Before**:

```typescript
function validate(data: unknown): string | null {
  if (!isValid(data)) {
    throw new Error('Validation failed'); // Exception throwing
  }
  return processData(data);
}
```

**After**:

```typescript
import type { Result, ValidationError } from '@claude-zen/foundation/types';
import {
  createSuccess,
  createError,
  createValidationError,
} from '@claude-zen/foundation/types';

function validate(data: unknown): Result<string, ValidationError> {
  if (!isValid(data)) {
    return createError(createValidationError('Validation failed')); // Result pattern
  }
  return createSuccess(processData(data));
}
```

## Best Practices

### 1. Use Type Guards

```typescript
import { isUUID, isTimestamp } from '@claude-zen/foundation/types';

function processId(id: unknown): UUID | null {
  return isUUID(id) ? id : null;
}
```

### 2. Brand Types for Safety

```typescript
import type { Email, URL } from '@claude-zen/foundation/types';
import { brand } from '@claude-zen/foundation/types';

function createUser(email: string): User {
  // Brand the string as Email for type safety
  const validEmail: Email = brand<string, 'Email'>(email);
  return { email: validEmail };
}
```

### 3. Prefer Result Pattern Over Exceptions

```typescript
// ✅ Good - Result pattern
function parseJSON<T>(json: string): Result<T, ValidationError> {
  try {
    return createSuccess(JSON.parse(json));
  } catch (error) {
    return createError(createValidationError('Invalid JSON'));
  }
}

// ❌ Avoid - Exception throwing for expected failures
function parseJSON<T>(json: string): T {
  return JSON.parse(json); // Throws on invalid JSON
}
```

### 4. Use Utility Types for Flexibility

```typescript
import type { Optional, Required } from '@claude-zen/foundation/types';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

// Create user (email required, others optional)
type CreateUser = Optional<User, 'id' | 'name' | 'avatar'> & Required<User, 'email'>;

// Update user (all optional except ID)
type UpdateUser = Optional<User, 'email' | name' | 'avatar'> & Required<User, 'id'>;
```

## Testing

Foundation types include comprehensive test utilities:

```typescript
import {
  isUUID,
  isTimestamp,
  generateUUID,
  now,
} from '@claude-zen/foundation/types';

describe('UUID handling', () => {
  test('generates valid UUIDs', () => {
    const uuid = generateUUID();
    expect(isUUID(uuid)).toBe(true);
  });
});

describe('Timestamp handling', () => {
  test('creates valid timestamps', () => {
    const timestamp = now();
    expect(isTimestamp(timestamp)).toBe(true);
  });
});
```

## Evolution and Versioning

Foundation types follow **semantic versioning** with strict backward compatibility:

- **MAJOR**: Breaking changes (rare, require migration)
- **MINOR**: New types or non-breaking enhancements
- **PATCH**: Bug fixes, documentation, type guard improvements

### Breaking Change Policy

Breaking changes to foundation types require:

1. **RFC Process**: Proposal and community review
2. **Migration Guide**: Automated migration tools where possible
3. **Deprecation Period**: Minimum 1 major version deprecation
4. **Cross-Package Testing**: Validate all dependent packages

### Adding New Types

New foundation types must meet all criteria:

1. **Universal Applicability**: Used by 3+ packages
2. **Domain Agnostic**: No business logic or domain concepts
3. **Stable Interface**: Unlikely to change frequently
4. **Zero Dependencies**: No coupling to domain-specific types

## Performance Considerations

Foundation types are optimized for:

- **Compile-time safety**: Zero runtime overhead for type checks
- **Tree shaking**: Individual type imports to minimize bundle size
- **Memory efficiency**: Branded types have no runtime representation
- **Type inference**: Minimal explicit type annotations needed

## Support and Migration

For questions about foundation types:

1. **Documentation**: Check this README and inline JSDoc comments
2. **Examples**: Review the examples in the main index.ts file
3. **Issues**: Open issues in the main repository for type-related bugs
4. **RFCs**: Propose significant changes through the RFC process

Foundation types are designed to be stable and self-documenting. When in doubt, follow the type governance rules and prefer universal, simple types over complex, domain-specific ones.
