import { extractErrorMessage, isMemoryError, isMemoryNotFound, isMemorySuccess, } from '../utils/type-guards.ts';
class UnsafeMemoryService {
    store;
    constructor(store) {
        this.store = store;
    }
    async getUserProfile(userId) {
        const result = await this.store.retrieve('user-profiles', userId);
        return result?.profile || null;
    }
    async cacheUserSession(userId, sessionData) {
        await this.store.store('user-sessions', userId, sessionData);
    }
    async getUserPreferences(userId) {
        const result = await this.store.retrieve('user-preferences', userId);
        const preferences = result?.preferences;
        const settings = result?.settings;
        return { preferences, settings };
    }
}
class SafeMemoryService {
    store;
    constructor(store) {
        this.store = store;
    }
    async getUserProfile(userId) {
        try {
            const result = await this.retrieveWithResult('user-profiles', userId);
            if (isMemorySuccess(result)) {
                return result;
            }
            if (isMemoryNotFound(result)) {
                return result;
            }
            if (isMemoryError(result)) {
                return result;
            }
            throw new Error('Unexpected result type');
        }
        catch (error) {
            return {
                found: false,
                error: {
                    code: 'RETRIEVE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    key: `user-profiles:${userId}`,
                },
            };
        }
    }
    async cacheUserSession(userId, sessionData) {
        try {
            const result = await this.storeWithResult('user-sessions', userId, sessionData);
            if (isMemorySuccess(result)) {
                return result;
            }
            if (isMemoryError(result)) {
                console.error(`❌ Failed to cache session for ${userId}:`, result?.error?.message);
                return result;
            }
            throw new Error('Unexpected result type');
        }
        catch (error) {
            console.error(`❌ Unexpected error caching session for ${userId}:`, error);
            return {
                found: false,
                error: {
                    code: 'CACHE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown caching error',
                    key: `user-sessions:${userId}`,
                },
            };
        }
    }
    async getUserPreferences(userId) {
        const result = await this.retrieveWithResult('user-preferences', userId);
        if (isMemorySuccess(result)) {
            return {
                preferences: result?.data?.preferences || null,
                settings: result?.data?.settings || null,
            };
        }
        if (isMemoryNotFound(result)) {
            return {
                preferences: null,
                settings: null,
            };
        }
        if (isMemoryError(result)) {
            return {
                preferences: null,
                settings: null,
                error: result?.error?.message,
            };
        }
        return {
            preferences: null,
            settings: null,
            error: 'Unexpected result type',
        };
    }
    async getUserData(userId) {
        const errors = [];
        let profile = null;
        let session = null;
        let preferences = null;
        const profileResult = await this.getUserProfile(userId);
        if (isMemorySuccess(profileResult)) {
            profile = profileResult?.data;
        }
        else {
            const errorMsg = extractErrorMessage(profileResult);
            if (errorMsg)
                errors.push(`Profile: ${errorMsg}`);
        }
        const sessionResult = await this.retrieveWithResult('user-sessions', userId);
        if (isMemorySuccess(sessionResult)) {
            session = sessionResult?.data;
        }
        else {
            const errorMsg = extractErrorMessage(sessionResult);
            if (errorMsg)
                errors.push(`Session: ${errorMsg}`);
        }
        const preferencesData = await this.getUserPreferences(userId);
        preferences = preferencesData?.preferences;
        if (preferencesData?.error) {
            errors.push(`Preferences: ${preferencesData?.error}`);
        }
        return { profile, session, preferences, errors };
    }
    async getUsersData(userIds) {
        const results = new Map();
        const promises = userIds.map(async (userId) => {
            try {
                const userData = await this.getUserData(userId);
                return {
                    userId,
                    data: {
                        profile: userData?.profile,
                        session: userData?.session,
                        error: userData?.errors.length > 0
                            ? userData?.errors?.join('; ')
                            : undefined,
                    },
                };
            }
            catch (error) {
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
    async retrieveWithResult(namespace, key) {
        try {
            const data = await this.store.retrieve(namespace, key);
            if (data === null || data === undefined) {
                return {
                    found: false,
                    key: `${namespace}:${key}`,
                    reason: 'not_found',
                };
            }
            return {
                found: true,
                data: data,
                key: `${namespace}:${key}`,
                timestamp: new Date(),
                metadata: { source: 'memory_store' },
            };
        }
        catch (error) {
            return {
                found: false,
                error: {
                    code: 'RETRIEVE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown retrieval error',
                    key: `${namespace}:${key}`,
                },
            };
        }
    }
    async storeWithResult(namespace, key, data) {
        try {
            await this.store.store(namespace, key, data);
            return {
                found: true,
                data: undefined,
                key: `${namespace}:${key}`,
                timestamp: new Date(),
                metadata: { operation: 'store' },
            };
        }
        catch (error) {
            return {
                found: false,
                error: {
                    code: 'STORE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown storage error',
                    key: `${namespace}:${key}`,
                },
            };
        }
    }
}
export async function demonstrateMigration() {
    const mockStore = {};
    const unsafeService = new UnsafeMemoryService(mockStore);
    const safeService = new SafeMemoryService(mockStore);
    const userId = 'user123';
    try {
        const unsafeProfile = await unsafeService.getUserProfile(userId);
        await unsafeService.cacheUserSession(userId, {
            id: 'session123',
            userId,
            token: 'abc',
        });
        const unsafePrefs = await unsafeService.getUserPreferences(userId);
    }
    catch (error) {
        console.error('❌ Unsafe service failed:', error);
    }
    const profileResult = await safeService.getUserProfile(userId);
    if (isMemorySuccess(profileResult)) {
    }
    else if (isMemoryNotFound(profileResult)) {
    }
    else if (isMemoryError(profileResult)) {
        console.error('❌ Profile error:', profileResult?.error?.message);
    }
    const sessionData = {
        id: 'session123',
        userId,
        token: 'abc123',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        metadata: {},
    };
    const cacheResult = await safeService.cacheUserSession(userId, sessionData);
    if (isMemorySuccess(cacheResult)) {
    }
    else if (isMemoryError(cacheResult)) {
        console.error('❌ Session caching failed:', cacheResult?.error?.message);
    }
    const preferencesData = await safeService.getUserPreferences(userId);
    if (preferencesData?.preferences) {
    }
    else if (preferencesData?.error) {
        console.error('❌ Preferences error:', preferencesData?.error);
    }
    else {
    }
    const userData = await safeService.getUserData(userId);
    if (userData?.errors.length > 0) {
    }
    const batchUserIds = ['user1', 'user2', 'user3'];
    const batchResults = await safeService.getUsersData(batchUserIds);
    batchResults?.forEach((result, userId) => {
        if (result?.error) {
        }
        else {
        }
    });
}
export async function performanceComparison() { }
//# sourceMappingURL=memory-migration-example.js.map