/**
 * @fileoverview Session-based Memory Storage with Foundation Integration
 *
 * Enhanced memory system using @claude-zen/foundation utilities:
 * - Result pattern for type-safe error handling
 * - Structured error handling with context
 * - Professional logging with performance tracking
 * - Safe async operations with retry logic
 */

import {
  getLogger,
  Result,
  ok,
  err,
  safeAsync,
  withRetry,
  PerformanceTracker,
  BasicTelemetryManager,
  TelemetryConfig,
  Storage,
  KeyValueStore,
  injectable,
  createErrorAggregator,
  createCircuitBreaker,
  recordMetric,
  recordHistogram,
  withTrace,
  ensureError,
  EventEmitter,
} from '@claude-zen/foundation';

import type {
  MemoryStore,
  MemoryStats,
  StoreOptions,
  SessionMemoryStoreOptions as SessionMemoryStoreOptionsType,
  MemoryError,
  MemoryStorageError,
  MemoryConnectionError,
  SessionState,
  CacheEntry,
} from './types';

import type { BackendInterface} from './core/memory-system';

const logger = getLogger('memory:store');
const performanceTracker = new PerformanceTracker();

// Initialize telemetry for memory operations
const telemetryConfig:TelemetryConfig = {
  serviceName: 'memory-store',  enableTracing:true,
  enableMetrics:true,
};
const telemetry = new BasicTelemetryManager(telemetryConfig);

type BackendConfig = SessionMemoryStoreOptionsType['backendConfig'];
type SessionMemoryStoreOptions = SessionMemoryStoreOptionsType;

@injectable()
export class SessionMemoryStore extends EventEmitter implements MemoryStore {
  private backend:BackendInterface | null = null;
  private initialized = false;
  private sessions = new Map<string, SessionState>();
  private options:Required<SessionMemoryStoreOptions>;

  private cache = new Map<string, CacheEntry>();
  private cacheKeys:string[] = [];

  private storage:KeyValueStore | null = null;
  private circuitBreaker:any;
  private errorAggregator = createErrorAggregator();
  private telemetryInitialized = false;

  constructor(options:SessionMemoryStoreOptions) {
    super();

    this.options = {
      backendConfig:options?.['backendConfig'],
      enableCache:options?.['enableCache'] ?? true,
      cacheSize:options?.['cacheSize'] ?? 1000,
      cacheTTL:options?.['cacheTTL'] ?? 300000, // 5 minutes
      enableVectorStorage:options?.['enableVectorStorage'] ?? false,
      vectorDimensions:options?.['vectorDimensions'] ?? 512,
};

    // Initialize circuit breaker for resilient storage operations
    this.circuitBreaker = createCircuitBreaker(
      this.performStorageOperation.bind(this),
      {
        timeout:5000,
        errorThresholdPercentage:50,
        resetTimeout:30000,
      },
      'memory-storage-circuit-breaker'
    );

    // Record construction metrics
    recordMetric('memory_store_instances_created', 1);

    logger.debug(
      'SessionMemoryStore constructed with comprehensive foundation integration',      {
        cacheEnabled:this.options.enableCache,
        cacheSize:this.options.cacheSize,
        vectorEnabled:this.options.enableVectorStorage,
        backendType:this.options.backendConfig?.type || 'unknown',}
    );

    // Storage will be created during initialization using foundation
}

  async initialize():Promise<Result<void, MemoryConnectionError>> {
    if (this.initialized) return ok();

    const timer = performanceTracker.startTimer('memory_initialize');

    return withTrace('memory-store-initialize', () =>
      withRetry(
        async () => safeAsync(async () => {
            logger.info(
              'Initializing session memory store with foundation storage...',              {
                cacheEnabled:this.options.enableCache,
                vectorEnabled:this.options.enableVectorStorage,
                backendType:this.options.backendConfig.type,
}
            );

            // Initialize telemetry
            if (!this.telemetryInitialized) {
              const telemetryResult = await telemetry.initialize();
              if (telemetryResult.isOk()) {
                this.telemetryInitialized = true;
                logger.debug('Telemetry initialized successfully');
} else {
                logger.warn(
                  'Failed to initialize telemetry: ',
                  telemetryResult.error
                );
}
}

            // Use foundation's storage system instead of custom backend
            try {
              this.storage = await Storage.getNamespacedKV('memory-sessions');
              logger.debug('Foundation KV storage initialized successfully');
} catch (storageError) {
              const error = new MemoryConnectionError(
                'Failed to initialize foundation storage',                this.options.backendConfig.type,
                { originalError:storageError}
              );
              this.errorAggregator.add(error);
              recordMetric('memory_initialization_errors', 1);
              throw error;
}

            await this.loadFromStorage();
            this.initialized = true;

            performanceTracker.endTimer('memory_initialize');
            const initTime = timer.duration || 0;

            // Record comprehensive metrics
            recordMetric('memory_store_initializations', 1);
            recordHistogram('memory_initialization_duration_ms', initTime);
            recordMetric('memory_sessions_loaded', this.sessions.size);

            logger.info('Session memory store initialized successfully', {
              initializationTime:initTime,
              sessionsLoaded:this.sessions.size,
              hasCircuitBreaker:!!this.circuitBreaker,
              telemetryEnabled:this.telemetryInitialized,
});

            this.emit('initialized', {});
}),
        {
          retries:3,
          minTimeout:1000,
          maxTimeout:5000,
          onFailedAttempt:(error, attemptNumber) => {
            logger.warn(
              `Memory initialization attempt ${attemptNumber} failed:`,
              error
            );
            recordMetric('memory_initialization_retries', 1);
},
}
      )
    ).then((result) => {
      if (result.isErr()) {
        const error = new MemoryConnectionError(
          'Failed to initialize session memory store',          this.options.backendConfig.type,
          { originalError:result.error.message}
        );
        this.errorAggregator.add(error);
        recordMetric('memory_initialization_failures', 1);
        logger.error(
          'Session memory store initialization failed',          error.toObject()
        );
        return err(error);
}
      return ok();
});
}

  async store(
    sessionId:string,
    key:string,
    data:unknown,
    options?:StoreOptions
  ):Promise<void>;
  async store(
    key:string,
    data:unknown,
    options?:StoreOptions
  ):Promise<void>;
  async store(
    sessionIdOrKey:string,
    keyOrData?:string | unknown,
    dataOrOptions?:unknown | StoreOptions,
    options?:StoreOptions
  ):Promise<void> {
    // Handle both overloads:(sessionId, key, data, options) and (key, data, options)
    let sessionId:string;
    let key:string;
    let data:unknown;
    let storeOptions:StoreOptions | undefined;

    if (typeof keyOrData === 'string') {
      // (sessionId, key, data, options) overload
      sessionId = sessionIdOrKey;
      key = keyOrData;
      data = dataOrOptions;
      storeOptions = options;
} else {
      // (key, data, options) overload - use default session
      sessionId = 'default';
      key = sessionIdOrKey;
      data = keyOrData;
      storeOptions = dataOrOptions as StoreOptions | undefined;
}

    this.ensureInitialized();

    const timer = performanceTracker.startTimer('memory_store');
    const storeKey = `${sessionId}:${key}`;

    return withTrace('memory-store-operation', async () => withRetry(
        async () => safeAsync(async () => {
            let session = this.sessions.get(sessionId);
            if (!session) {
              session = {
                sessionId,
                data:{},
                metadata:{
                  created:Date.now(),
                  updated:Date.now(),
                  accessed:Date.now(),
                  size:0,
                  tags:storeOptions?.tags || [],
                  priority:storeOptions?.priority || 'medium',                  ttl:storeOptions?.ttl,
},
                vectors:new Map(),
};
              this.sessions.set(sessionId, session);
              recordMetric('memory_sessions_created', 1);
}

            session.data[key] = data;
            session.metadata.updated = Date.now();
            session.metadata.accessed = Date.now();

            if (storeOptions?.vector && this.options.enableVectorStorage) {
              session.vectors?.set(key, storeOptions?.vector);
              recordMetric('memory_vector_stores', 1);
}

            // Use circuit breaker for resilient storage operations
            if (this.storage) {
              await this.circuitBreaker.execute({
                operation: 'store',                sessionId,
                key,
                data:session,
});
}

            if (this.options.enableCache) {
              this.updateCache(sessionId, key, data);
              recordMetric('memory_cache_updates', 1);
}

            performanceTracker.endTimer('memory_store');
            const storeTime = timer.duration || 0;

            // Record comprehensive metrics
            recordMetric('memory_store_operations', 1);
            recordHistogram('memory_store_duration_ms', storeTime);
            recordMetric('memory_data_size_bytes', JSON.stringify(data).length);

            logger.debug('Memory store operation completed', {
              sessionId,
              key:storeKey,
              dataSize:JSON.stringify(data).length,
              hasVector:!!storeOptions?.vector,
              duration:storeTime,
});
}),
        {
          retries:2,
          minTimeout:500,
          onFailedAttempt:(error, attemptNumber) => {
            logger.warn(
              `Memory store attempt ${attemptNumber} failed for key ${storeKey}:`,
              error
            );
            recordMetric('memory_store_retries', 1);
},
}
      )).then((result) => {
      if (result.isErr()) {
        const error = ensureError(result.error);
        this.errorAggregator.add(error);
        recordMetric('memory_store_errors', 1);
        logger.error('Memory store operation failed', {
          sessionId,
          key:storeKey,
          error:error.message,
});
        throw error;
}
});
}

  async retrieve<T = unknown>(
    sessionId:string,
    key:string
  ):Promise<T | null>;
  async retrieve<T = unknown>(key:string): Promise<T | null>;
  async retrieve<T = unknown>(
    sessionIdOrKey:string,
    key?:string
  ):Promise<T | null> {
    // Handle both overloads
    const actualSessionId = key ? sessionIdOrKey: 'default';
    const actualKey = key || sessionIdOrKey;
    const retrieveKey = `${actualSessionId}:${actualKey}`;

    this.ensureInitialized();

    const timer = performanceTracker.startTimer('memory_retrieve');

    return withTrace('memory-retrieve-operation', async () => withRetry(
        async () => safeAsync(async () => {
            // Check cache first with detailed metrics
            if (this.options.enableCache) {
              const cached = this.getCachedData(actualSessionId, actualKey);
              if (cached !== null) {
                performanceTracker.endTimer('memory_retrieve');
                recordMetric('memory_cache_hits', 1);
                recordHistogram(
                  'memory_retrieve_duration_ms',                  timer.duration || 0
                );

                logger.debug('Memory retrieve cache hit', {
                  key:retrieveKey,
                  duration:timer.duration || 0,
});

                return cached as T;
} else {
                recordMetric('memory_cache_misses', 1);
}
}

            // Use circuit breaker for resilient retrieval operations
            const session = await this.circuitBreaker.execute({
              operation: 'retrieve',              sessionId:actualSessionId,
});

            const result = (session?.data[actualKey] as T) ?? null;

            performanceTracker.endTimer('memory_retrieve');
            const retrieveTime = timer.duration || 0;

            // Record comprehensive metrics
            recordMetric('memory_retrieve_operations', 1);
            recordHistogram('memory_retrieve_duration_ms', retrieveTime);

            if (result !== null) {
              recordMetric('memory_retrieve_successes', 1);
              recordMetric(
                'memory_retrieved_data_size_bytes',                JSON.stringify(result).length
              );
} else {
              recordMetric('memory_retrieve_not_found', 1);
}

            logger.debug('Memory retrieve operation completed', {
              key:retrieveKey,
              found:result !== null,
              dataSize:result ? JSON.stringify(result).length : 0,
              duration:retrieveTime,
});

            return result;
}),
        {
          retries:2,
          minTimeout:300,
          onFailedAttempt:(error, attemptNumber) => {
            logger.warn(
              `Memory retrieve attempt ${attemptNumber} failed for key ${retrieveKey}:`,
              error
            );
            recordMetric('memory_retrieve_retries', 1);
},
}
      )).then((result) => {
      if (result.isErr()) {
        const error = ensureError(result.error);
        this.errorAggregator.add(error);
        recordMetric('memory_retrieve_errors', 1);
        logger.error('Memory retrieve operation failed', {
          key:retrieveKey,
          error:error.message,
});
        throw error;
}
      return result.value;
});
}

  async retrieveSession(sessionId:string): Promise<SessionState | null> {
    this.ensureInitialized();

    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
}

    if (this.storage) {
      const sessionDataStr = await this.storage.get(`session:${sessionId}`);
      if (sessionDataStr) {
        try {
          const session = JSON.parse(sessionDataStr) as SessionState;
          this.sessions.set(sessionId, session);
          return session;
} catch (parseError) {
          logger.error(
            `Failed to parse session data for ${sessionId}:`,
            parseError
          );
}
}
}

    return null;
}

  async delete(sessionId:string, key:string): Promise<boolean>;
  async delete(key:string): Promise<boolean>;
  async delete(sessionIdOrKey:string, key?:string): Promise<boolean> {
    // Handle both overloads
    const actualSessionId = key ? sessionIdOrKey: 'default';
    const actualKey = key || sessionIdOrKey;
    const deleteKey = `${actualSessionId}:${actualKey}`;

    this.ensureInitialized();

    const timer = performanceTracker.startTimer('memory_delete');

    return withTrace('memory-delete-operation', async () => withRetry(
        async () => safeAsync(async () => {
            const session = this.sessions.get(actualSessionId);
            if (!(session && actualKey in session.data)) {
              performanceTracker.endTimer('memory_delete');
              recordMetric('memory_delete_not_found', 1);
              recordHistogram('memory_delete_duration_ms', timer.duration || 0);

              logger.debug('Memory delete operation - key not found', {
                key:deleteKey,
                duration:timer.duration || 0,
});

              return false;
}

            const dataSize = JSON.stringify(session.data[actualKey]).length;
            delete session.data[actualKey];
            session.vectors?.delete(actualKey);
            session.metadata.updated = Date.now();

            // Use circuit breaker for resilient storage operations
            if (this.storage) {
              await this.circuitBreaker.execute({
                operation: 'store',                sessionId:actualSessionId,
                key: 'session-update',                data:session,
});
}

            // Remove from cache with metrics
            const cacheKey = `${actualSessionId}:${actualKey}`;
            if (this.cache.has(cacheKey)) {
              this.cache.delete(cacheKey);
              recordMetric('memory_cache_deletions', 1);
}

            performanceTracker.endTimer('memory_delete');
            const deleteTime = timer.duration || 0;

            // Record comprehensive metrics
            recordMetric('memory_delete_operations', 1);
            recordMetric('memory_delete_successes', 1);
            recordHistogram('memory_delete_duration_ms', deleteTime);
            recordMetric('memory_deleted_data_size_bytes', dataSize);

            logger.debug('Memory delete operation completed successfully', {
              key:deleteKey,
              dataSize,
              duration:deleteTime,
});

            return true;
}),
        {
          retries:2,
          minTimeout:300,
          onFailedAttempt:(error, attemptNumber) => {
            logger.warn(
              `Memory delete attempt ${attemptNumber} failed for key ${deleteKey}:`,
              error
            );
            recordMetric('memory_delete_retries', 1);
},
}
      )).then((result) => {
      if (result.isErr()) {
        const error = ensureError(result.error);
        this.errorAggregator.add(error);
        recordMetric('memory_delete_errors', 1);
        logger.error('Memory delete operation failed', {
          key:deleteKey,
          error:error.message,
});
        throw error;
}
      return result.value;
});
}

  async getStats():Promise<MemoryStats> {
    this.ensureInitialized();

    let totalEntries = 0;
    let totalSize = 0;
    let lastModified = 0;

    for (const session of Array.from(this.sessions.values())) {
      totalEntries += Object.keys(session.data).length;
      totalSize += JSON.stringify(session.data).length;
      lastModified = Math.max(lastModified, session.metadata.updated);
}

    return {
      entries:totalEntries,
      size:totalSize,
      lastModified,
      namespaces:this.sessions.size,
};
}

  async shutdown():Promise<Result<void, MemoryError>> {
    if (!this.initialized) {
      return ok();
}

    const timer = performanceTracker.startTimer('memory_shutdown');

    return safeAsync(async () => {
      await this.saveToStorage();
      this.initialized = false;
      this.storage = null;

      performanceTracker.endTimer('memory_shutdown');
      logger.info('Session memory store shutdown successfully', {
        shutdownTime:timer.duration,
});

      this.emit('shutdown', {});
}).then((result) => {
      if (result.isErr()) {
        const error = new MemoryError(
          'Failed to shutdown session memory store',          { originalError:result.error.message}
        );
        logger.error(
          'Session memory store shutdown failed',          error.toObject()
        )();
        return err(error);
}
      return ok();
});
}

  // Additional methods to implement MemoryStore interface
  async clear():Promise<void> {
    this.ensureInitialized();
    this.sessions.clear();
    this.cache.clear();
    this.cacheKeys = [];

    // Clear storage data if needed
    if (this.storage) {
      const allKeys = await this.storage.keys();
      const sessionKeys = allKeys.filter((key) => key.startsWith('session:'));
      
      for (const key of sessionKeys) {
        await this.storage.delete(key);
}
}
}

  async size():Promise<number> {
    this.ensureInitialized();
    let totalEntries = 0;
    for (const session of Array.from(this.sessions.values())) {
      totalEntries += Object.keys(session.data).length;
}
    return totalEntries;
}

  async health():Promise<boolean> {
    try {
      this.ensureInitialized();
      return this.backend !== null && this.initialized;
} catch {
      return false;
}
}

  async stats():Promise<MemoryStats> {
    return this.getStats();
}

  private async loadFromStorage():Promise<void> {
    if (!this.storage) return;

    try {
      const allKeys = await this.storage.keys();
      const sessionKeys = allKeys.filter((key) => key.startsWith('session:'));
      
      for (const key of sessionKeys) {
        const sessionDataStr = await this.storage.get(key);
        if (sessionDataStr) {
          try {
            const session = JSON.parse(sessionDataStr) as SessionState;
            const sessionId = key.replace('session:', '');
            this.sessions.set(sessionId, session);
} catch (parseError) {
            logger.error(
              `Failed to parse session data for key ${key}:`,
              parseError
            );
}
}
}

      logger.debug(`Loaded ${this.sessions.size} sessions from storage`);
} catch (error) {
      logger.error('Failed to load sessions from storage: ', error);
      throw new MemoryStorageError('Failed to load sessions from storage', {
        originalError:error,
});
}
}

  private async saveToStorage():Promise<void> {
    if (!this.storage) return;

    try {
      for (const [sessionId, session] of Array.from(this.sessions.entries())) {
        await this.storage.set(`session:${sessionId}`, session);
}

      logger.debug(`Saved ${this.sessions.size} sessions to storage`);
} catch (error) {
      logger.error('Failed to save sessions to storage: ', error);
      throw new MemoryStorageError('Failed to save sessions to storage', {
        originalError:error,
});
}
}

  private updateCache(sessionId:string, key:string, data:unknown): void {
    const cacheKey = `${sessionId}:${key}`;
    if (this.cache.size >= this.options.cacheSize) {
      const oldestKey = this.cacheKeys.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
}
}
    this.cache.set(cacheKey, { key:cacheKey, data, timestamp:Date.now()});
    this.cacheKeys.push(cacheKey);
}

  private getCachedData(sessionId:string, key:string): unknown {
    const cacheKey = `${sessionId}:${key}`;
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.options.cacheTTL) {
      this.cache.delete(cacheKey);
      return null;
}

    return entry.data;
}

  private ensureInitialized():void {
    if (!(this.initialized && this.storage)) {
      const error = new MemoryError(
        'Session memory store not initialized. Call initialize() first.',        { initialized:this.initialized, hasStorage:!!this.storage}
      );
      this.errorAggregator.add(error);
      recordMetric('memory_initialization_errors', 1);
      throw error;
}
}

  /**
   * Circuit breaker operation handler with comprehensive error handling and metrics
   */
  private async performStorageOperation(params:{
    operation:'store' | ' retrieve';
    sessionId:string;
    key?:string;
    data?:any;
}):Promise<any> {
    return safeAsync(async () => {
      if (!this.storage) {
        throw new MemoryError(
          'Storage not available for circuit breaker operation'
        );
}

      const { operation, sessionId, key, data} = params;
      const storageKey = `session:${sessionId}`;

      switch (operation) {
        case 'store':
          await this.storage.set(storageKey, data);
          recordMetric('memory_circuit_breaker_stores', 1);
          logger.debug('Circuit breaker store operation completed', {
            sessionId,
            key,
});
          return { success:true};

        case 'retrieve':
          const sessionDataStr = await this.storage.get(storageKey);
          if (sessionDataStr) {
            try {
              const session = JSON.parse(sessionDataStr) as SessionState;
              this.sessions.set(sessionId, session);
              recordMetric('memory_circuit_breaker_retrieves', 1);
              logger.debug('Circuit breaker retrieve operation completed', {
                sessionId,
});
              return session;
} catch (parseError) {
              const error = new MemoryError(
                `Failed to parse session data for ${sessionId}`,
                { sessionId, parseError:ensureError(parseError).message}
              );
              recordMetric('memory_circuit_breaker_parse_errors', 1);
              throw error;
}
}
          return null;

        default:
          throw new MemoryError(
            `Unsupported circuit breaker operation:${operation}`
          );
}
}).then((result) => {
      if (result.isErr()) {
        const error = ensureError(result.error);
        recordMetric('memory_circuit_breaker_errors', 1);
        logger.error('Circuit breaker operation failed', {
          operation,
          sessionId,
          error:error.message,
});
        throw error;
}
      return result.value;
});
}
}

@injectable()
export class MemoryManager {
  private errorAggregator = createErrorAggregator();
  private managerLogger = getLogger('memory:manager');
  private performanceTracker = new PerformanceTracker();
  private store:SessionMemoryStore;
  private circuitBreaker:any;
  private telemetryManager:BasicTelemetryManager;
  private managerInitialized = false;

  constructor(options:SessionMemoryStoreOptions) {
    this.store = new SessionMemoryStore(options);

    // Initialize circuit breaker for manager operations
    this.circuitBreaker = createCircuitBreaker(
      this.performManagerOperation.bind(this),
      {
        timeout:10000,
        errorThresholdPercentage:60,
        resetTimeout:45000,
},
      'memory-manager-circuit-breaker'
    );

    // Initialize telemetry for manager
    this.telemetryManager = new BasicTelemetryManager({
      serviceName: 'memory-manager',      enableTracing:true,
      enableMetrics:true,
});

    recordMetric('memory_managers_created', 1);
    this.managerLogger.debug(
      'Memory manager initialized with comprehensive foundation integration',      {
        hasCircuitBreaker:!!this.circuitBreaker,
        hasTelemetry:!!this.telemetryManager,
}
    );
}

  async initialize():Promise<Result<void, MemoryConnectionError>> {
    if (this.managerInitialized) {
      return ok();
}

    const timer = this.performanceTracker.startTimer(
      'memory_manager_initialize'
    );

    return withTrace('memory-manager-initialize', async () => withRetry(
        async () => safeAsync(async () => {
            // Initialize telemetry first
            const telemetryResult = await this.telemetryManager.initialize();
            if (telemetryResult.isOk()) {
              this.managerLogger.debug('Memory manager telemetry initialized');
} else {
              this.managerLogger.warn(
                'Failed to initialize manager telemetry: ',
                telemetryResult.error
              );
}

            // Initialize the store
            const storeResult = await this.store.initialize();
            if (storeResult.isErr()) {
              throw new MemoryConnectionError(
                'Failed to initialize memory store in manager',                'memory-manager',                { originalError:storeResult.error}
              );
}

            this.managerInitialized = true;
            this.performanceTracker.endTimer('memory_manager_initialize');

            const initTime = timer.duration || 0;
            recordMetric('memory_manager_initializations', 1);
            recordHistogram(
              'memory_manager_initialization_duration_ms',              initTime
            );

            this.managerLogger.info('Memory manager initialized successfully', {
              initializationTime:initTime,
              storeInitialized:true,
              telemetryEnabled:telemetryResult.isOk(),
});
}),
        {
          retries:3,
          minTimeout:1500,
          onFailedAttempt:(error, attemptNumber) => {
            this.managerLogger.warn(
              `Memory manager initialization attempt ${attemptNumber} failed:`,
              error
            );
            recordMetric('memory_manager_initialization_retries', 1);
},
}
      )).then((result) => {
      if (result.isErr()) {
        const error = new MemoryConnectionError(
          'Failed to initialize memory manager',          'memory-manager',          { originalError:result.error.message}
        );
        this.errorAggregator.add(error);
        recordMetric('memory_manager_initialization_failures', 1);
        return err(error);
}
      return ok();
});
}

  async storeData(
    key:string,
    data:unknown,
    options?:StoreOptions
  ):Promise<Result<void, MemoryError>> {
    const timer = this.performanceTracker.startTimer('memory_manager_store');

    return withTrace('memory-manager-store', async () => withRetry(
        async () => safeAsync(async () => {
            await this.circuitBreaker.execute({
              operation: 'store',              key,
              data,
              options,
});

            this.performanceTracker.endTimer('memory_manager_store');
            const storeTime = timer.duration || 0;

            recordMetric('memory_manager_store_operations', 1);
            recordHistogram('memory_manager_store_duration_ms', storeTime);
            recordMetric(
              'memory_manager_stored_data_size_bytes',              JSON.stringify(data).length
            );

            this.managerLogger.debug('Memory manager store completed', {
              key,
              dataSize:JSON.stringify(data).length,
              duration:storeTime,
});
}),
        {
          retries:2,
          minTimeout:500,
          onFailedAttempt:(error, attemptNumber) => {
            this.managerLogger.warn(
              `Memory manager store attempt ${attemptNumber} failed for key ${key}:`,
              error
            );
            recordMetric('memory_manager_store_retries', 1);
},
}
      )).then((result) => {
      if (result.isErr()) {
        const error = new MemoryStorageError(
          'Failed to store data via memory manager',          { key, originalError:result.error.message}
        );
        this.errorAggregator.add(error);
        recordMetric('memory_manager_store_errors', 1);
        return err(error);
}
      return ok();
});
}

  async retrieve<T = unknown>(
    key:string
  ):Promise<Result<T | null, MemoryError>> {
    const timer = this.performanceTracker.startTimer('memory_manager_retrieve');

    return withTrace('memory-manager-retrieve', async () => withRetry(
        async () => safeAsync(async () => {
            const result = await this.circuitBreaker.execute({
              operation: 'retrieve',              key,
});

            this.performanceTracker.endTimer('memory_manager_retrieve');
            const retrieveTime = timer.duration || 0;

            recordMetric('memory_manager_retrieve_operations', 1);
            recordHistogram(
              'memory_manager_retrieve_duration_ms',              retrieveTime
            );

            if (result !== null) {
              recordMetric('memory_manager_retrieve_successes', 1);
              recordMetric(
                'memory_manager_retrieved_data_size_bytes',                JSON.stringify(result).length
              );
} else {
              recordMetric('memory_manager_retrieve_not_found', 1);
}

            this.managerLogger.debug('Memory manager retrieve completed', {
              key,
              found:result !== null,
              dataSize:result ? JSON.stringify(result).length : 0,
              duration:retrieveTime,
});

            return result as T | null;
}),
        {
          retries:2,
          minTimeout:300,
          onFailedAttempt:(error, attemptNumber) => {
            this.managerLogger.warn(
              `Memory manager retrieve attempt ${attemptNumber} failed for key ${key}:`,
              error
            );
            recordMetric('memory_manager_retrieve_retries', 1);
},
}
      )).then((result) => {
      if (result.isErr()) {
        const error = new MemoryStorageError(
          'Failed to retrieve data via memory manager',          { key, originalError:result.error.message}
        );
        this.errorAggregator.add(error);
        recordMetric('memory_manager_retrieve_errors', 1);
        return err(error);
}
      return ok(result.value);
});
}

  async shutdown():Promise<Result<void, MemoryError>> {
    const timer = this.performanceTracker.startTimer('memory_manager_shutdown');

    return withTrace('memory-manager-shutdown', async () => safeAsync(async () => {
        // Shutdown telemetry first
        await this.telemetryManager.shutdown();

        // Shutdown store
        const shutdownResult = await this.store.shutdown();
        if (shutdownResult.isErr()) {
          throw shutdownResult.error;
}

        this.managerInitialized = false;
        this.performanceTracker.endTimer('memory_manager_shutdown');

        const shutdownTime = timer.duration || 0;
        recordMetric('memory_manager_shutdowns', 1);
        recordHistogram('memory_manager_shutdown_duration_ms', shutdownTime);

        this.managerLogger.info('Memory manager shutdown completed', {
          duration:shutdownTime,
});
})).then((result) => {
      if (result.isErr()) {
        const error = new MemoryError('Failed to shutdown memory manager', {
          originalError:result.error.message,
});
        this.errorAggregator.add(error);
        recordMetric('memory_manager_shutdown_errors', 1);
        return err(error);
}
      return ok();
});
}

  async clear():Promise<Result<void, MemoryError>> {
    const timer = this.performanceTracker.startTimer('memory_manager_clear');

    return withTrace('memory-manager-clear', async () => safeAsync(async () => {
        await this.circuitBreaker.execute({
          operation: 'clear',});

        this.performanceTracker.endTimer('memory_manager_clear');
        const clearTime = timer.duration || 0;

        recordMetric('memory_manager_clear_operations', 1);
        recordHistogram('memory_manager_clear_duration_ms', clearTime);

        this.managerLogger.info('Memory manager clear completed', {
          duration:clearTime,
});
})).then((result) => {
      if (result.isErr()) {
        const error = new MemoryStorageError(
          'Failed to clear memory store via manager',          { originalError:result.error.message}
        );
        this.errorAggregator.add(error);
        recordMetric('memory_manager_clear_errors', 1);
        return err(error);
}
      return ok();
});
}

  async size():Promise<number> {
    return withTrace('memory-manager-size', async () => {
      const timer = this.performanceTracker.startTimer('memory_manager_size');
      const size = await this.store.size();
      this.performanceTracker.endTimer('memory_manager_size');

      recordMetric('memory_manager_size_operations', 1);
      recordHistogram('memory_manager_size_duration_ms', timer.duration || 0);

      return size;
});
}

  async health():Promise<boolean> {
    return withTrace('memory-manager-health', async () => {
      const timer = this.performanceTracker.startTimer('memory_manager_health');
      const isHealthy = await this.store.health();
      this.performanceTracker.endTimer('memory_manager_health');

      recordMetric('memory_manager_health_checks', 1);
      recordMetric('memory_manager_health_status', isHealthy ? 1:0);
      recordHistogram('memory_manager_health_duration_ms', timer.duration || 0);

      return isHealthy;
});
}

  async stats():Promise<MemoryStats> {
    return withTrace('memory-manager-stats', async () => {
      const timer = this.performanceTracker.startTimer('memory_manager_stats');
      const stats = await this.store.stats();
      this.performanceTracker.endTimer('memory_manager_stats');

      recordMetric('memory_manager_stats_operations', 1);
      recordHistogram('memory_manager_stats_duration_ms', timer.duration || 0);
      recordMetric('memory_manager_current_entries', stats.entries);
      recordMetric('memory_manager_current_size_bytes', stats.size);

      return stats;
});
}

  async delete(key:string): Promise<Result<boolean, MemoryError>> {
    const timer = this.performanceTracker.startTimer('memory_manager_delete');

    return withTrace('memory-manager-delete', async () => safeAsync(async () => {
        const result = await this.circuitBreaker.execute({
          operation: 'delete',          key,
});

        this.performanceTracker.endTimer('memory_manager_delete');
        const deleteTime = timer.duration || 0;

        recordMetric('memory_manager_delete_operations', 1);
        recordHistogram('memory_manager_delete_duration_ms', deleteTime);

        if (result) {
          recordMetric('memory_manager_delete_successes', 1);
} else {
          recordMetric('memory_manager_delete_not_found', 1);
}

        this.managerLogger.debug('Memory manager delete completed', {
          key,
          deleted:result,
          duration:deleteTime,
});

        return result;
})).then((result) => {
      if (result.isErr()) {
        const error = new MemoryStorageError(
          'Failed to delete data via memory manager',          { key, originalError:result.error.message}
        );
        this.errorAggregator.add(error);
        recordMetric('memory_manager_delete_errors', 1);
        return err(error);
}
      return ok(result.value);
});
}

  /**
   * Circuit breaker operation handler for manager operations
   */
  private async performManagerOperation(params:{
    operation: 'store|retrieve|delete|clear';
    key?:string;
    data?:unknown;
    options?:StoreOptions;
}):Promise<any> {
    const { operation, key, data, options} = params;

    switch (operation) {
      case 'store':
        if (!key) throw new MemoryError('Key required for store operation');
        await this.store.store('default', key, data, options);
        return { success:true};

      case 'retrieve':
        if (!key) throw new MemoryError('Key required for retrieve operation');
        return await this.store.retrieve('default', key);

      case 'delete':
        if (!key) throw new MemoryError('Key required for delete operation');
        return await this.store.delete('default', key);

      case 'clear':
        await this.store.clear();
        return { success:true};

      default:
        throw new MemoryError(`Unsupported manager operation:${operation}`);
}
}
}
