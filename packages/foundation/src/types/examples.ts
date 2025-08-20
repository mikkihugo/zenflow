/**
 * @fileoverview Foundation Types - Usage Examples
 * 
 * Comprehensive examples demonstrating how to use foundation types
 * in real-world scenarios. These examples show best practices
 * for type composition, error handling, and common patterns.
 * 
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @example
 * ```typescript
 * import type { User, UserService } from './examples';
 * 
 * const userService = new UserServiceImpl();
 * const result = await userService.createUser({ email: 'test@example.com' });
 * 
 * if (isSuccess(result)) {
 *   console.log('Created user:', result.data.name);
 * } else {
 *   console.error('Failed to create user:', result.error.message);
 * }
 * ```
 */

import type {
  UUID,
  Timestamp,
  Priority,
  Status,
  Entity,
  Timestamped,
  Paginated,
  Result,
  ValidationError,
  AsyncOperationResult,
  QueryCriteria
} from './index';
import {
  PriorityEnum,
  StatusEnum,
  generateUUID,
  now,
  createSuccess,
  createError,
  createValidationError,
  isSuccess,
  createPaginated
} from './index';

// =============================================================================
// EXAMPLE 1: USER MANAGEMENT SYSTEM
// =============================================================================

/**
 * User entity combining multiple foundation patterns
 * Demonstrates: Entity, Timestamped, Identifiable
 */
export interface User extends Entity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  lastLoginAt?: Timestamp;
  preferences: UserPreferences;
}

/**
 * User role enumeration
 */
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest'
}

/**
 * User preferences with optional fields
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  timezone: string;
}

/**
 * User creation data - simpler approach
 * Demonstrates: Pick and Partial utility types
 */
export type CreateUserData = Pick<User, 'email' | 'firstName' | 'lastName'> & 
  Partial<Pick<User, 'role' | 'preferences' | 'displayName' | 'description'>>;

/**
 * User update data - ID required, all others optional
 * Demonstrates: Pick and Partial utility types
 */
export type UpdateUserData = Pick<User, 'id'> & 
  Partial<Pick<User, 'email' | 'firstName' | 'lastName' | 'role' | 'preferences' | 'displayName' | 'description' | 'isActive'>>;

/**
 * User search and pagination
 * Demonstrates: Paginated, QueryCriteria
 */
export type UserList = Paginated<User>;

/**
 * User service interface with Result pattern
 * Demonstrates: Result pattern for error handling
 */
export interface UserService {
  createUser(data: CreateUserData): Promise<Result<User, ValidationError>>;
  updateUser(data: UpdateUserData): Promise<Result<User, ValidationError>>;
  deleteUser(id: UUID): Promise<Result<void, ValidationError>>;
  findUser(id: UUID): Promise<Result<User | null, ValidationError>>;
  listUsers(criteria: QueryCriteria): Promise<Result<UserList, ValidationError>>;
  authenticateUser(email: string, password: string): Promise<Result<User, ValidationError>>;
}

/**
 * Example implementation of UserService
 * Demonstrates: Result pattern implementation
 */
export class UserServiceImpl implements UserService {
  private users: Map<string, User> = new Map();

  async createUser(data: CreateUserData): Promise<Result<User, ValidationError>> {
    // Validation
    if (!data.email || !data.email.includes('@')) {
      return createError(createValidationError('Invalid email address', {
        field: 'email',
        rule: 'format',
        expected: 'valid email address',
        actual: data.email
      }));
    }

    if (!data.firstName?.trim()) {
      return createError(createValidationError('First name is required', {
        field: 'firstName',
        rule: 'required'
      }));
    }

    // Check if user already exists
    const existingUser = Array.from(this.users.values())
      .find(user => user.email === data.email);
    
    if (existingUser) {
      return createError(createValidationError('User with this email already exists', {
        field: 'email',
        rule: 'unique',
        context: { existingUserId: existingUser.id }
      }));
    }

    // Create user
    const user: User = {
      id: generateUUID(),
      name: `${data.firstName} ${data.lastName}`,
      displayName: data.displayName || `${data.firstName} ${data.lastName}`,
      description: data.description || `User account for ${data.firstName} ${data.lastName}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || UserRole.USER,
      preferences: data.preferences || {
        theme: 'system',
        notifications: true,
        language: 'en',
        timezone: 'UTC'
      },
      createdAt: now(),
      updatedAt: now(),
      version: 1,
      isActive: true
    };

    this.users.set(user.id, user);
    return createSuccess(user);
  }

  async updateUser(data: UpdateUserData): Promise<Result<User, ValidationError>> {
    const existingUser = this.users.get(data.id);
    if (!existingUser) {
      return createError(createValidationError('User not found', {
        field: 'id',
        rule: 'exists',
        actual: data.id
      }));
    }

    // Update user
    const updatedUser: User = {
      ...existingUser,
      ...data,
      updatedAt: now(),
      version: existingUser.version + 1
    };

    this.users.set(data.id, updatedUser);
    return createSuccess(updatedUser);
  }

  async deleteUser(id: UUID): Promise<Result<void, ValidationError>> {
    if (!this.users.has(id)) {
      return createError(createValidationError('User not found', {
        field: 'id',
        rule: 'exists',
        actual: id
      }));
    }

    this.users.delete(id);
    return createSuccess();
  }

  async findUser(id: UUID): Promise<Result<User | null, ValidationError>> {
    const user = this.users.get(id) || null;
    return createSuccess(user);
  }

  async listUsers(criteria: QueryCriteria): Promise<Result<UserList, ValidationError>> {
    let users = Array.from(this.users.values());

    // Apply filters
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (criteria.sort && criteria.sort.length > 0) {
      const sortField = criteria.sort[0];
      if (sortField) {
        users.sort((a, b) => {
          const aVal = (a as any)[sortField.field];
          const bVal = (b as any)[sortField.field];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortField.direction === 'desc' ? -comparison : comparison;
        });
      }
    }

    // Apply pagination
    const page = criteria.pagination?.page || 1;
    const pageSize = criteria.pagination?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = users.slice(startIndex, startIndex + pageSize);

    const result = createPaginated(paginatedUsers, page, pageSize, users.length);
    return createSuccess(result);
  }

  async authenticateUser(email: string, password: string): Promise<Result<User, ValidationError>> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) {
      return createError(createValidationError('Invalid credentials', {
        field: 'email',
        rule: 'authentication'
      }));
    }

    // In real implementation, verify password hash
    // For example purposes, just check if password is not empty
    if (!password) {
      return createError(createValidationError('Invalid credentials', {
        field: 'password',
        rule: 'authentication'
      }));
    }

    // Update last login
    const updatedUser = {
      ...user,
      lastLoginAt: now(),
      updatedAt: now(),
      version: user.version + 1
    };

    this.users.set(user.id, updatedUser);
    return createSuccess(updatedUser);
  }
}

// =============================================================================
// EXAMPLE 2: TASK MANAGEMENT SYSTEM
// =============================================================================

/**
 * Task entity with priority and status
 * Demonstrates: Entity extension with domain-specific fields
 */
export interface Task extends Entity {
  title: string;
  priority: Priority;
  status: Status;
  assigneeId?: UUID;
  dueDate?: Timestamp;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
}

/**
 * Task attachment
 */
export interface TaskAttachment extends Timestamped {
  id: UUID;
  taskId: UUID;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: UUID;
}

/**
 * Task comment
 */
export interface TaskComment extends Timestamped {
  id: UUID;
  taskId: UUID;
  authorId: UUID;
  content: string;
  isEdited: boolean;
}

/**
 * Task service with async operation results
 * Demonstrates: AsyncOperationResult pattern
 */
export interface TaskService {
  createTask(data: Partial<Task>): AsyncOperationResult<Task, ValidationError>;
  updateTask(id: UUID, data: Partial<Task>): AsyncOperationResult<Task, ValidationError>;
  completeTask(id: UUID): AsyncOperationResult<Task, ValidationError>;
  assignTask(taskId: UUID, assigneeId: UUID): AsyncOperationResult<Task, ValidationError>;
  addComment(taskId: UUID, authorId: UUID, content: string): AsyncOperationResult<TaskComment, ValidationError>;
}

// =============================================================================
// EXAMPLE 3: API RESPONSE PATTERNS
// =============================================================================

/**
 * Standard API response wrapper
 * Demonstrates: Result pattern for API responses
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
    context?: Record<string, unknown>;
  };
  metadata: {
    requestId: UUID;
    timestamp: Timestamp;
    duration: number;
    version: string;
  };
}

/**
 * Convert Result to API response format
 */
export function resultToApiResponse<T>(
  result: Result<T, ValidationError>,
  requestId: UUID,
  startTime: Timestamp
): ApiResponse<T> {
  const endTime = now();
  const duration = endTime - startTime;

  const baseResponse = {
    metadata: {
      requestId,
      timestamp: endTime,
      duration,
      version: '1.0'
    }
  };

  return isSuccess(result) ? {
      success: true,
      data: result.data,
      ...baseResponse
    } : {
      success: false,
      error: {
        code: result.error.code,
        message: result.error.message,
        field: result.error.field,
        context: result.error.context
      },
      ...baseResponse
    };
}

// =============================================================================
// EXAMPLE 4: CONFIGURATION PATTERN
// =============================================================================

/**
 * Application configuration with environment overrides
 * Demonstrates: EnvironmentConfig pattern
 */
export interface AppConfig {
  database: {
    host: string;
    port: number;
    name: string;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  api: {
    port: number;
    corsOrigins: string[];
    rateLimit: {
      windowMs: number;
      maxRequests: number;
    };
  };
  auth: {
    jwtSecret: string;
    sessionDuration: number;
    refreshTokenDuration: number;
  };
  logging: {
    level: string;
    format: 'json' | 'text';
    outputs: ('console' | 'file')[];
  };
}

/**
 * Feature flags configuration
 */
export interface AppFeatureFlags {
  newUserInterface: boolean;
  enhancedSecurity: boolean;
  analyticsTracking: boolean;
  experimentalFeatures: boolean;
}

// =============================================================================
// EXAMPLE USAGE FUNCTIONS
// =============================================================================

/**
 * Example: Creating and managing users
 */
export async function userManagementExample(): Promise<void> {
  const userService = new UserServiceImpl();

  // Create a user
  const createResult = await userService.createUser({
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe'
  });

  if (isSuccess(createResult)) {
    console.log('User created:', createResult.data.name);

    // Update the user
    const updateResult = await userService.updateUser({
      id: createResult.data.id,
      role: UserRole.MODERATOR
    });

    if (isSuccess(updateResult)) {
      console.log('User updated:', updateResult.data.role);
    }

    // List users with pagination
    const listResult = await userService.listUsers({
      pagination: { page: 1, pageSize: 10 },
      sort: [{ field: 'name', direction: 'asc' }]
    });

    if (isSuccess(listResult)) {
      console.log('Found users:', listResult.data.items.length);
      console.log('Total pages:', listResult.data.pagination.totalPages);
    }
  } else {
    console.error('Failed to create user:', createResult.error.message);
  }
}

/**
 * Example: Using Result pattern for error handling
 */
export async function errorHandlingExample(): Promise<void> {
  const userService = new UserServiceImpl();

  // Attempt to create user with invalid data
  const result = await userService.createUser({
    email: 'invalid-email', // Invalid email format
    firstName: '', // Empty first name
    lastName: 'Doe'
  });

  if (isSuccess(result)) {
    console.log('User created successfully');
  } else {
    // Handle the error gracefully
    console.error('Validation failed:');
    console.error('- Field:', result.error.field);
    console.error('- Rule:', result.error.rule);
    console.error('- Message:', result.error.message);
    
    if (result.error.expected) {
      console.error('- Expected:', result.error.expected);
    }
    if (result.error.actual) {
      console.error('- Actual:', result.error.actual);
    }
  }
}

/**
 * Example: Type composition and utility types
 */
export function typeCompositionExample(): void {
  // Create partial user data for updates
  type UserUpdate = Pick<User, 'id'> & Partial<Pick<User, 'email' | 'preferences'>>;

  const userUpdate: UserUpdate = {
    id: generateUUID(),
    preferences: {
      theme: 'light',
      notifications: false,
      language: 'es',
      timezone: 'Europe/Madrid'
    }
    // Other fields are optional thanks to Partial type
  };

  console.log('User update data prepared:', userUpdate.id);
}

/**
 * Example: Working with pagination
 */
export function paginationExample(): void {
  const items = Array.from({ length: 100 }, (_, i) => ({
    id: generateUUID(),
    name: `Item ${i + 1}`,
    priority: i % 2 === 0 ? PriorityEnum.HIGH : PriorityEnum.LOW,
    status: i % 3 === 0 ? StatusEnum.COMPLETED : StatusEnum.PENDING
  }));

  // Create paginated result
  const page1 = createPaginated(items.slice(0, 10), 1, 10, items.length);
  const page2 = createPaginated(items.slice(10, 20), 2, 10, items.length);

  console.log('Page 1 items:', page1.items.length);
  console.log('Has next page:', page1.pagination.hasNextPage);
  console.log('Total pages:', page1.pagination.totalPages);

  console.log('Page 2 items:', page2.items.length);
  console.log('Has previous page:', page2.pagination.hasPreviousPage);
}

// Export example runner function
export async function runAllExamples(): Promise<void> {
  console.log('🚀 Running Foundation Types Examples\n');

  console.log('1. User Management Example:');
  await userManagementExample();

  console.log('\n2. Error Handling Example:');
  await errorHandlingExample();

  console.log('\n3. Type Composition Example:');
  typeCompositionExample();

  console.log('\n4. Pagination Example:');
  paginationExample();

  console.log('\n✅ All examples completed successfully!');
}