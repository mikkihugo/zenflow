/**
 * @file Memory-migration-example implementation.
 */


import {
  extractErrorMessage,
  isMemoryError,
  isMemoryNotFound,
  isMemorySuccess,
  MemoryResult,
  MemoryError,
  MemoryNotFound,
  MemorySuccess,
} from '../utils/type-guards';
import { SessionMemoryStore } from '../memory';

// ============================================
// BEFORE: Unsafe Memory Operations
// ============================================

/**
 * ❌ BEFORE: Unsafe memory service - potential runtime errors.
 *
 * @example
 */
class UnsafeMemoryService {
  constructor(private store: SessionMemoryStore) {}

  // ❌ Unsafe: Direct property access on potentially undefined results
  async getUserProfile(userId: string): Promise<any> {
    const result = await this.store.retrieve('user-profiles', userId);

    // This could fail at runtime if result is null/undefined
    return result?.profile || null; // ❌ Unsafe property access
  }

  // ❌ Unsafe: No error handling for failed operations
  async cacheUserSession(userId: string, sessionData: any): Promise<void> {
    await this.store.store('user-sessions', userId, sessionData);
    // ❌ No error handling - failures are silently ignored
  }

  // ❌ Unsafe: Assumes success without checking
  async getUserPreferences(userId: string): Promise<any> {
    const result = await this.store.retrieve('user-preferences', userId);

    // ❌ Direct property access without null/type checking
    const preferences = result?.preferences;
    const settings = result?.settings;

    return { preferences, settings };
  }
}

// ============================================
// AFTER: Type-Safe Memory Operations
// ============================================

/**
 * ✅ AFTER: Type-safe memory service with proper error handling.
 *
 * @example
 */
class SafeMemoryService {
  constructor(private store: SessionMemoryStore) {}

  /**
   * ✅ Safe: Proper type guards and error handling.
   *
   * @param userId
   */
  async getUserProfile(userId: string): Promise<MemoryResult<UserProfile>> {
    try {
      // Assume we have an enhanced store that returns MemoryResult
      const result = await this.retrieveWithResult<UserProfile>('user-profiles', userId);

      // ✅ Type-safe access using type guards
      if (isMemorySuccess(result)) {
        return result; // Returns the full success result
      } else if (isMemoryNotFound(result)) {
        return result; // Returns the not-found result
      } else if (isMemoryError(result)) {
        return result; // Returns the error result
      }

      // This should never happen with proper typing
      throw new Error('Unexpected result type');
    } catch (error) {
      // ✅ Safe error handling
      return {
        found: false,
        error: {
          code: 'RETRIEVE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          key: `user-profiles:${userId}`,
        },
      } as MemoryError;
    }
  }

  /**
   * ✅ Safe: Comprehensive error handling and logging.
   *
   * @param userId
   * @param sessionData
   */
  async cacheUserSession(userId: string, sessionData: UserSession): Promise<MemoryResult<void>> {
    try {
      const result = await this.storeWithResult('user-sessions', userId, sessionData);

      if (isMemorySuccess(result)) {
        return result;
      } else if (isMemoryError(result)) {
        console.error(`❌ Failed to cache session for ${userId}:`, result?.error?.message);
        return result;
      }

      throw new Error('Unexpected result type');
    } catch (error) {
      console.error(`❌ Unexpected error caching session for ${userId}:`, error);

      return {
        found: false,
        error: {
          code: 'CACHE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown caching error',
          key: `user-sessions:${userId}`,
        },
      } as MemoryError;
    }
  }

  /**
   * ✅ Safe: Proper null checking and default values.
   *
   * @param userId
   */
  async getUserPreferences(userId: string): Promise<{
    preferences: UserPreferences | null;
    settings: UserSettings | null;
    error?: string;
  }> {
    const result = await this.retrieveWithResult<{
      preferences: UserPreferences;
      settings: UserSettings;
    }>('user-preferences', userId);

    if (isMemorySuccess(result)) {
      // ✅ Type-safe access - TypeScript knows result.data exists
      return {
        preferences: result?.data?.preferences || null,
        settings: result?.data?.settings || null,
      };
    } else if (isMemoryNotFound(result)) {
      // ✅ Handle not found case gracefully
      return {
        preferences: null,
        settings: null,
      };
    } else if (isMemoryError(result)) {
      // ✅ Handle errors with user-friendly messages
      return {
        preferences: null,
        settings: null,
        error: result?.error?.message,
      };
    }

    // Fallback for unexpected cases
    return {
      preferences: null,
      settings: null,
      error: 'Unexpected result type',
    };
  }

  /**
   * ✅ Safe: Complex operation with multiple fallbacks.
   *
   * @param userId
   */
  async getUserData(userId: string): Promise<{
    profile: UserProfile | null;
    session: UserSession | null;
    preferences: UserPreferences | null;
    errors: string[];
  }> {
    const errors: string[] = [];
    let profile: UserProfile | null = null;
    let session: UserSession | null = null;
    let preferences: UserPreferences | null = null;

    // Get profile with error handling
    const profileResult = await this.getUserProfile(userId);
    if (isMemorySuccess(profileResult)) {
      profile = profileResult?.data;
    } else {
      const errorMsg = extractErrorMessage(profileResult);
      if (errorMsg) errors.push(`Profile: ${errorMsg}`);
    }

    // Get session with error handling
    const sessionResult = await this.retrieveWithResult<UserSession>('user-sessions', userId);
    if (isMemorySuccess(sessionResult)) {
      session = sessionResult?.data;
    } else {
      const errorMsg = extractErrorMessage(sessionResult);
      if (errorMsg) errors.push(`Session: ${errorMsg}`);
    }

    // Get preferences with error handling
    const preferencesData = await this.getUserPreferences(userId);
    preferences = preferencesData?.preferences;
    if (preferencesData?.error) {
      errors.push(`Preferences: ${preferencesData?.error}`);
    }

    return { profile, session, preferences, errors };
  }

  /**
   * ✅ Safe: Batch operations with individual error handling.
   *
   * @param userIds
   */
  async getUsersData(userIds: string[]): Promise<
    Map<
      string,
      {
        profile: UserProfile | null;
        session: UserSession | null;
        error?: string;
      }
    >
  > {
    const results = new Map();

    // Process users concurrently with individual error handling
    const promises = userIds.map(async (userId) => {
      try {
        const userData = await this.getUserData(userId);

        return {
          userId,
          data: {
            profile: userData?.profile,
            session: userData?.session,
            error: userData?.errors.length > 0 ? userData?.errors?.join('; ') : undefined,
          },
        };
      } catch (error) {
        return {
          userId,
          data: {
            profile: null,
            session: null,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    });

    const resolved = await Promise.all(promises);

    resolved.forEach(({ userId, data }) => {
      results?.set(userId, data);
    });

    return results;
  }

  // ============================================
  // Helper Methods for Enhanced Store Operations
  // ============================================

  /**
   * Enhanced retrieve method that returns MemoryResult.
   *
   * @param namespace
   * @param key
   */
  private async retrieveWithResult<T>(namespace: string, key: string): Promise<MemoryResult<T>> {
    try {
      const data = await this.store.retrieve(namespace, key);

      if (data === null || data === undefined) {
        return {
          found: false,
          key: `${namespace}:${key}`,
          reason: 'not_found',
        } as MemoryNotFound;
      }

      return {
        found: true,
        data: data as T,
        key: `${namespace}:${key}`,
        timestamp: new Date(),
        metadata: { source: 'memory_store' },
      } as MemorySuccess<T>;
    } catch (error) {
      return {
        found: false,
        error: {
          code: 'RETRIEVE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown retrieval error',
          key: `${namespace}:${key}`,
        },
      } as MemoryError;
    }
  }

  /**
   * Enhanced store method that returns MemoryResult.
   *
   * @param namespace
   * @param key
   * @param data
   */
  private async storeWithResult<T>(
    namespace: string,
    key: string,
    data: T
  ): Promise<MemoryResult<void>> {
    try {
      await this.store.store(namespace, key, data);

      return {
        found: true,
        data: undefined as undefined,
        key: `${namespace}:${key}`,
        timestamp: new Date(),
        metadata: { operation: 'store' },
      } as MemorySuccess<void>;
    } catch (error) {
      return {
        found: false,
        error: {
          code: 'STORE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown storage error',
          key: `${namespace}:${key}`,
        },
      } as MemoryError;
    }
  }
}

// ============================================
// Type Definitions for Examples
// ============================================

interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface UserSession {
  id: string;
  userId: string;
  token: string;
  expires_at: string;
  metadata: Record<string, any>;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  privacy: {
    showEmail: boolean;
    showProfile: boolean;
  };
}

interface UserSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
}

// ============================================
// Usage Examples and Comparisons
// ============================================

/**
 * Example showing the difference in usage patterns.
 *
 * @example
 */
export async function demonstrateMigration(): Promise<void> {
  // Mock store for demonstration
  const mockStore = {} as SessionMemoryStore;

  const unsafeService = new UnsafeMemoryService(mockStore);
  const safeService = new SafeMemoryService(mockStore);

  const userId = 'user123';
  try {
    // ❌ This could fail at runtime with unclear errors
    const unsafeProfile = await unsafeService.getUserProfile(userId);

    // ❌ No indication if this succeeded or failed
    await unsafeService.cacheUserSession(userId, { id: 'session123', userId, token: 'abc' });

    // ❌ Could throw runtime errors on property access
    const unsafePrefs = await unsafeService.getUserPreferences(userId);
  } catch (error) {
    console.error('❌ Unsafe service failed:', error);
  }

  // ✅ Type-safe profile retrieval
  const profileResult = await safeService.getUserProfile(userId);

  if (isMemorySuccess(profileResult)) {
  } else if (isMemoryNotFound(profileResult)) {
  } else if (isMemoryError(profileResult)) {
    console.error('❌ Profile error:', profileResult?.error?.message);
  }

  // ✅ Type-safe session caching
  const sessionData: UserSession = {
    id: 'session123',
    userId,
    token: 'abc123',
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    metadata: {},
  };

  const cacheResult = await safeService.cacheUserSession(userId, sessionData);

  if (isMemorySuccess(cacheResult)) {
  } else if (isMemoryError(cacheResult)) {
    console.error('❌ Session caching failed:', cacheResult?.error?.message);
  }

  // ✅ Type-safe preferences with graceful error handling
  const preferencesData = await safeService.getUserPreferences(userId);

  if (preferencesData?.preferences) {
  } else if (preferencesData?.error) {
    console.error('❌ Preferences error:', preferencesData?.error);
  } else {
  }

  // ✅ Complex operation with comprehensive error handling
  const userData = await safeService.getUserData(userId);

  if (userData?.errors.length > 0) {
  }

  // ✅ Batch operations with individual error handling
  const batchUserIds = ['user1', 'user2', 'user3'];
  const batchResults = await safeService.getUsersData(batchUserIds);
  batchResults?.forEach((result, userId) => {
    if (result?.error) {
    } else {
    }
  });
}

/**
 * Performance comparison between unsafe and safe approaches.
 *
 * @example
 */
export async function performanceComparison(): Promise<void> {}
