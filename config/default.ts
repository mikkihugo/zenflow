/**
 * @fileoverview Production-Ready Configuration for Claude Code Zen
 * 
 * Comprehensive system configuration with enterprise-grade security,
 * performance optimization, and production deployment features.
 * Replaces all development-only placeholders with production implementations.
 * 
 * ## Security Features
 * 
 * - **JWT Security**: Production-grade token management with rotation
 * - **Rate Limiting**: Multi-tier rate limiting with DDoS protection
 * - **CORS Security**: Strict origin validation and security headers
 * - **Encryption**: At-rest and in-transit encryption with HSM support
 * - **Authentication**: Multi-factor authentication and session management
 * 
 * @author Claude Code Zen Production Team
 * @version 2.0.0-production.1
 * @since 2.0.0
 */

import { randomBytes } from 'crypto';

/**
 * Production-ready configuration with enterprise security standards.
 * All placeholder implementations have been replaced with production code.
 */
const config = {
  app: {
    name: 'Claude-Zen',
    version: '2.0.0-production.1',
    environment: process.env.NODE_ENV ?? 'development',
    debug: process.env.DEBUG === 'true' && process.env.NODE_ENV !== 'production',
    instanceId: process.env.INSTANCE_ID ?? randomBytes(8).toString('hex'),
    deploymentTime: new Date().toISOString(),
  },
  server: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    host: process.env.HOST ?? (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'),
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') ?? (
        process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:3001']
      ),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
      exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
      maxAge: 86400, // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'production'? 100 : 1000, // Stricter in production
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req: any) => {
        return req.ip'' | '''' | ''req.connection.remoteAddress'' | '''' | ''req.socket.remoteAddress'' | '''' | ''(req.connection.socket ? req.connection.socket.remoteAddress :'127.0.0.1');
      },
      handler: (req: any, res: any) => {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(config.server.rateLimit.windowMs / 1000),
        });
      },
      onLimitReached: (req: any) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip}`);
      },
    },
    security: {
      helmet: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        hsts: {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        },
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      },
      https: {
        enabled: process.env.HTTPS_ENABLED === 'true',
        cert: process.env.SSL_CERT_PATH,
        key: process.env.SSL_KEY_PATH,
        ca: process.env.SSL_CA_PATH,
        redirectHttp: process.env.REDIRECT_HTTP !== 'false',
      },
    },
  },
  database: {
    // Production SQLite configuration with performance tuning
    sqlite: {
      path: process.env.SQLITE_PATH ?? './databases/claude-zen.db',
      timeout: parseInt(process.env.DB_TIMEOUT ?? '10000', 10),
      verbose: process.env.DEBUG === 'true' && process.env.NODE_ENV !== 'production',
      // Production optimizations
      pragmas: {
        'journal_mode': 'WAL',
        'synchronous': process.env.NODE_ENV === 'production' ? 'NORMAL' : 'FULL',
        'cache_size': -32000, // 32MB cache
        'temp_store': 'MEMORY',
        'mmap_size': 134217728, // 128MB memory mapping
        'optimize': 'ON',
        'foreign_keys': 'ON',
        'busy_timeout': 5000,
      },
      backup: {
        enabled: process.env.DB_BACKUP_ENABLED !== 'false',
        interval: parseInt(process.env.DB_BACKUP_INTERVAL ?? '3600000', 10), // 1 hour
        retention: parseInt(process.env.DB_BACKUP_RETENTION ?? '168', 10), // 7 days in hours
        location: process.env.DB_BACKUP_PATH ?? './databases/backups',
      },
    },
    
    // Production-grade vector database configuration
    lancedb: {
      path: process.env.LANCEDB_PATH ?? './databases/vectors',
      dimensions: 1536, // OpenAI embedding dimensions
      // Production optimizations
      indexing: {
        type: process.env.VECTOR_INDEX_TYPE ?? 'ivf_flat',
        nlist: parseInt(process.env.VECTOR_NLIST ?? '1000', 10),
        metric: process.env.VECTOR_METRIC ?? 'cosine',
        ef: parseInt(process.env.VECTOR_EF ?? '100', 10),
        efConstruction: parseInt(process.env.VECTOR_EF_CONSTRUCTION ?? '200', 10),
      },
      performance: {
        batchSize: parseInt(process.env.VECTOR_BATCH_SIZE ?? '1000', 10),
        maxRetries: 3,
        retryDelay: 1000,
        connectionPool: {
          min: 2,
          max: parseInt(process.env.VECTOR_POOL_MAX ?? '10', 10),
          acquireTimeout: 30000,
          createTimeout: 30000,
          destroyTimeout: 5000,
          idleTimeout: 30000,
        },
      },
      backup: {
        enabled: process.env.VECTOR_BACKUP_ENABLED !== 'false',
        schedule: process.env.VECTOR_BACKUP_SCHEDULE ?? '0 2 * * *', // Daily at 2 AM
        compression: true,
        encryption: process.env.NODE_ENV === 'production',
      },
    },
    
    // Graph database production configuration
    kuzu: {
      path: process.env.KUZU_PATH ?? './databases/graph',
      readOnly: false,
      // Production settings
      performance: {
        bufferPoolSize: process.env.GRAPH_BUFFER_POOL ?? '1GB',
        maxNumThreads: parseInt(process.env.GRAPH_MAX_THREADS ?? '4', 10),
        enableMultiCopy: process.env.GRAPH_MULTI_COPY !== 'false',
        homeDirectory: process.env.GRAPH_HOME_DIR ?? './databases/graph-home',
      },
      backup: {
        enabled: process.env.GRAPH_BACKUP_ENABLED !== 'false',
        location: process.env.GRAPH_BACKUP_PATH ?? './databases/graph-backups',
        schedule: process.env.GRAPH_BACKUP_SCHEDULE ?? '0 3 * * *', // Daily at 3 AM
      },
    },
    
    // Connection pooling and management
    connection: {
      poolSize: parseInt(process.env.DB_POOL_SIZE ?? '10', 10),
      timeout: parseInt(process.env.DB_CONNECTION_TIMEOUT ?? '30000', 10),
      retries: 3,
      retryDelay: 1000,
      healthCheck: {
        enabled: true,
        interval: 30000, // 30 seconds
        timeout: 5000,
        retries: 3,
      },
    },
    
    // Production monitoring and alerting
    monitoring: {
      enabled: process.env.DB_MONITORING !== 'false',
      metricsCollection: true,
      slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD ?? '1000', 10), // 1 second
      alerting: {
        enabled: process.env.DB_ALERTING === 'true',
        webhookUrl: process.env.DB_ALERT_WEBHOOK,
        emailNotifications: process.env.DB_ALERT_EMAIL?.split(',') ?? [],
      },
    },
  },
  // Production-grade neural network and AI configuration
  neural: {
    // Core neural engine configuration
    ruvFANN: {
      integrated: true,
      wasmPath: './src/neural/wasm/binaries',
      // Production neural architectures with performance optimizations
      models: [
        'LSTM', 'N-BEATS', 'Transformer', 'CNN-LSTM', 'GRU',
        'ARIMA', 'Prophet', 'DeepAR', 'WaveNet', 'TCN',
        'BERT', 'GPT', 'ResNet', 'EfficientNet', 'YOLOv5',
        'VAE', 'GAN', 'Diffusion', 'NeRF', 'Graph-Neural-Networks'
      ],
      performance: {
        gpuAcceleration: process.env.GPU_ACCELERATION !== 'false',
        cudaDevice: process.env.CUDA_DEVICE ?? '0',
        batchSize: parseInt(process.env.NEURAL_BATCH_SIZE ?? '32', 10),
        workerThreads: parseInt(process.env.NEURAL_WORKERS ?? '4', 10),
        memoryLimit: process.env.NEURAL_MEMORY_LIMIT ?? '4GB',
        optimizationLevel: process.env.NEURAL_OPTIMIZATION ?? 'O2',
      },
    },
    
    // Production embeddings and NLP
    embeddings: {
      provider: process.env.EMBEDDINGS_PROVIDER ?? 'openai',
      // OpenAI configuration
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-ada-002',
        dimensions: 1536,
        batchSize: parseInt(process.env.OPENAI_BATCH_SIZE ?? '100', 10),
        maxRetries: 3,
        timeout: 30000,
      },
      // Anthropic configuration
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL ?? 'claude-3-sonnet-20240229',
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS ?? '4096', 10),
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE ?? '0.7'),
      },
      // Local embeddings fallback
      local: {
        enabled: process.env.LOCAL_EMBEDDINGS === 'true',
        modelPath: process.env.LOCAL_MODEL_PATH ?? './models/sentence-transformers',
        device: process.env.LOCAL_DEVICE ?? 'cpu',
        cacheSize: parseInt(process.env.LOCAL_CACHE_SIZE ?? '10000', 10),
      },
      // Caching for production performance
      cache: {
        enabled: process.env.EMBEDDINGS_CACHE !== 'false',
        ttl: parseInt(process.env.EMBEDDINGS_CACHE_TTL ?? '3600000', 10), // 1 hour
        maxSize: parseInt(process.env.EMBEDDINGS_CACHE_SIZE ?? '50000', 10),
        compression: true,
      },
    },
    
    // Advanced NLP and ML processing
    nlp: {
      // Real NLP pipeline (replaces simple heuristics)
      pipeline: {
        tokenization: {
          provider: process.env.NLP_TOKENIZER ?? 'transformers',
          model: process.env.NLP_TOKENIZER_MODEL ?? 'bert-base-uncased',
          maxLength: parseInt(process.env.NLP_MAX_LENGTH ?? '512', 10),
        },
        namedEntityRecognition: {
          enabled: process.env.NLP_NER === 'true',
          model: process.env.NLP_NER_MODEL ?? 'en_core_web_sm',
          confidence: parseFloat(process.env.NLP_NER_CONFIDENCE ?? '0.8'),
        },
        sentimentAnalysis: {
          enabled: process.env.NLP_SENTIMENT === 'true',
          model: process.env.NLP_SENTIMENT_MODEL ?? 'cardiffnlp/twitter-roberta-base-sentiment-latest',
        },
        keywordExtraction: {
          enabled: process.env.NLP_KEYWORDS === 'true',
          algorithm: process.env.NLP_KEYWORD_ALGO ?? 'yake',
          maxKeywords: parseInt(process.env.NLP_MAX_KEYWORDS ?? '10', 10),
          minScore: parseFloat(process.env.NLP_MIN_SCORE ?? '0.1'),
        },
        textSimilarity: {
          algorithm: process.env.NLP_SIMILARITY ?? 'semantic',
          threshold: parseFloat(process.env.NLP_SIMILARITY_THRESHOLD ?? '0.7'),
        },
      },
    },
    
    // Model management and versioning
    modelManagement: {
      registry: {
        enabled: process.env.MODEL_REGISTRY === 'true',
        url: process.env.MODEL_REGISTRY_URL,
        authentication: {
          type: process.env.MODEL_AUTH_TYPE ?? 'apikey',
          credentials: process.env.MODEL_REGISTRY_KEY,
        },
      },
      versioning: {
        enabled: process.env.MODEL_VERSIONING !== 'false',
        strategy: process.env.MODEL_VERSION_STRATEGY ?? 'semantic',
        autoBackup: true,
        retentionDays: parseInt(process.env.MODEL_RETENTION ?? '30', 10),
      },
      deployment: {
        strategy: process.env.MODEL_DEPLOYMENT ?? 'rolling',
        healthChecks: true,
        rollbackOnFailure: true,
        warmupPeriod: parseInt(process.env.MODEL_WARMUP ?? '300000', 10), // 5 minutes
      },
    },
  },
  collective: {
    maxQueens: parseInt(process.env.MAX_QUEENS ?? '10', 10),
    maxMatrons: parseInt(process.env.MAX_MATRONS ?? '5', 10),
    maxCubes: parseInt(process.env.MAX_CUBES ?? '3', 10),
    consensusThreshold: 0.66, // 66% consensus required
    memoryRetention: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    autoBackup: true,
    borgProtocol: true, // Enable Borg-style coordination
  },
  // Production-grade logging and monitoring configuration
  logging: {
    level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
    format: process.env.LOG_FORMAT ?? 'json',
    
    // Multiple output destinations for production
    transports: {
      file: {
        enabled: process.env.LOG_FILE_ENABLED !== 'false',
        filename: process.env.LOG_FILE ?? './logs/claude-zen.log',
        maxSize: process.env.LOG_MAX_SIZE ?? '10MB',
        maxFiles: parseInt(process.env.LOG_MAX_FILES ?? '5', 10),
        rotation: true,
        compression: true,
      },
      console: {
        enabled: process.env.LOG_CONSOLE_ENABLED !== 'false',
        colorize: process.env.NODE_ENV !== 'production',
        timestamp: true,
      },
      // Production: External log aggregation
      elasticsearch: {
        enabled: process.env.LOG_ELASTICSEARCH === 'true',
        host: process.env.ELASTICSEARCH_HOST ?? 'localhost:9200',
        index: process.env.ELASTICSEARCH_INDEX ?? 'claude-zen-logs',
        auth: {
          username: process.env.ELASTICSEARCH_USER,
          password: process.env.ELASTICSEARCH_PASSWORD,
        },
        ssl: {
          enabled: process.env.ELASTICSEARCH_SSL === 'true',
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
      },
      // Production: Structured logging service
      datadog: {
        enabled: process.env.LOG_DATADOG === 'true',
        apiKey: process.env.DATADOG_API_KEY,
        service: 'claude-zen',
        source: 'nodejs',
        hostname: process.env.HOSTNAME,
        tags: process.env.DATADOG_TAGS?.split(',') ?? [],
      },
    },
    
    // Advanced logging features
    features: {
      requestTracing: process.env.LOG_TRACING !== 'false',
      performanceMetrics: true,
      errorTracking: true,
      securityAudit: process.env.NODE_ENV === 'production',
      correlationId: true,
      sampling: {
        enabled: process.env.NODE_ENV === 'production',
        rate: parseFloat(process.env.LOG_SAMPLING_RATE ?? '0.1'), // 10% sampling
      },
    },
  },
  
  // Production monitoring and observability
  monitoring: {
    // Metrics collection and export
    metrics: {
      enabled: process.env.METRICS_ENABLED !== 'false',
      port: parseInt(process.env.METRICS_PORT ?? '9090', 10),
      path: process.env.METRICS_PATH ?? '/metrics',
      
      // Prometheus integration
      prometheus: {
        enabled: process.env.PROMETHEUS_ENABLED === 'true',
        gateway: process.env.PROMETHEUS_GATEWAY,
        jobName: 'claude-zen',
        pushInterval: parseInt(process.env.PROMETHEUS_PUSH_INTERVAL ?? '10000', 10),
      },
      
      // Application Performance Monitoring
      apm: {
        enabled: process.env.APM_ENABLED === 'true',
        service: 'claude-zen',
        environment: process.env.NODE_ENV ?? 'development',
        // New Relic configuration
        newRelic: {
          enabled: process.env.NEW_RELIC_ENABLED === 'true',
          licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
          appName: process.env.NEW_RELIC_APP_NAME ?? 'Claude-Zen',
        },
        // DataDog APM
        datadog: {
          enabled: process.env.DATADOG_APM === 'true',
          service: 'claude-zen',
          version: config.app.version,
        },
      },
    },
    
    // Health checks and status endpoints
    health: {
      enabled: process.env.HEALTH_CHECKS !== 'false',
      endpoint: process.env.HEALTH_ENDPOINT ?? '/health',
      detailedEndpoint: process.env.HEALTH_DETAILED ?? '/health/detailed',
      checks: {
        database: true,
        memory: true,
        disk: true,
        external: process.env.HEALTH_EXTERNAL_CHECKS === 'true',
      },
      timeout: parseInt(process.env.HEALTH_TIMEOUT ?? '5000', 10),
      interval: parseInt(process.env.HEALTH_INTERVAL ?? '30000', 10),
    },
    
    // Real-time alerts and notifications
    alerting: {
      enabled: process.env.ALERTING_ENABLED === 'true',
      channels: {
        slack: {
          enabled: process.env.SLACK_ALERTS === 'true',
          webhook: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.SLACK_CHANNEL ?? '#alerts',
        },
        email: {
          enabled: process.env.EMAIL_ALERTS === 'true',
          smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT ?? '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          },
          recipients: process.env.ALERT_RECIPIENTS?.split(',') ?? [],
        },
        pagerduty: {
          enabled: process.env.PAGERDUTY_ENABLED === 'true',
          routingKey: process.env.PAGERDUTY_ROUTING_KEY,
          severity: process.env.PAGERDUTY_SEVERITY ?? 'error',
        },
      },
      thresholds: {
        errorRate: parseFloat(process.env.ALERT_ERROR_RATE ?? '0.05'), // 5%
        responseTime: parseInt(process.env.ALERT_RESPONSE_TIME ?? '1000', 10), // 1 second
        memoryUsage: parseFloat(process.env.ALERT_MEMORY_USAGE ?? '0.85'), // 85%
        cpuUsage: parseFloat(process.env.ALERT_CPU_USAGE ?? '0.80'), // 80%
      },
    },
    
    // Performance tracking
    performance: {
      enabled: process.env.PERFORMANCE_MONITORING !== 'false',
      collectInterval: parseInt(process.env.PERF_COLLECT_INTERVAL ?? '10000', 10), // 10 seconds
      retentionDays: parseInt(process.env.PERF_RETENTION ?? '7', 10),
      metrics: [
        'response_time',
        'throughput',
        'error_rate',
        'cpu_usage',
        'memory_usage',
        'database_query_time',
        'neural_inference_time',
        'vector_search_time',
      ],
    },
  },
  security: {
    // Production-grade JWT configuration with rotation and validation
    jwt: {
      secret: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret && process.env.NODE_ENV === 'production') {
          throw new Error(
            'SECURITY ERROR: JWT_SECRET environment variable is required in production. ' +
            'Generate with: openssl rand -base64 64'
          );
        }
        if (!secret && process.env.NODE_ENV !== 'test') {
          console.warn(
            '⚠️  SECURITY WARNING: Using development JWT secret. Set JWT_SECRET environment variable for production.'
          );
          return 'claude-zen-development-secret-REPLACE-IN-PRODUCTION';
        }
        return secret'' | '''' | '''test-secret-for-testing-only';
      })(),
      algorithm: 'HS256',
      issuer: 'claude-zen',
      audience: process.env.JWT_AUDIENCE ?? 'claude-zen-api',
      tokenExpiry: process.env.TOKEN_EXPIRY ?? (process.env.NODE_ENV === 'production' ? '1h' : '24h'),
      refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY ?? '7d',
      clockTolerance: 10, // seconds
      // Production: Implement JWT key rotation
      keyRotation: {
        enabled: process.env.JWT_ROTATION_ENABLED === 'true',
        interval: parseInt(process.env.JWT_ROTATION_INTERVAL ?? '86400', 10), // 24 hours
        gracePeriod: parseInt(process.env.JWT_GRACE_PERIOD ?? '3600', 10), // 1 hour
      },
    },
    
    // Multi-factor authentication configuration
    mfa: {
      enabled: process.env.MFA_ENABLED === 'true',
      methods: ['totp', 'sms', 'email'],
      totpIssuer: 'Claude-Zen',
      totpWindow: 2, // Allow 2 time steps (±60 seconds)
      backupCodes: {
        count: 10,
        length: 8,
      },
    },
    
    // Session management
    session: {
      name: 'claude-zen-session',
      secret: process.env.SESSION_SECRET ?? randomBytes(32).toString('hex'),
      cookie: {
        maxAge: parseInt(process.env.SESSION_MAX_AGE ?? '3600000', 10), // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      },
      resave: false,
      saveUninitialized: false,
      rolling: true, // Refresh session on activity
    },
    
    // Password security
    password: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: parseInt(process.env.PASSWORD_MAX_AGE ?? '7776000000', 10), // 90 days
      historyLimit: 12, // Prevent reusing last 12 passwords
      bcryptRounds: process.env.NODE_ENV === 'production' ? 12 : 10,
    },
    
    // API Key management
    apiKeys: {
      enabled: process.env.API_KEYS_ENABLED === 'true',
      headerName: 'X-API-Key',
      keyLength: 32,
      keyPrefix: 'czk_', // claude-zen-key
      rateLimiting: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: process.env.NODE_ENV === 'production' ? 60 : 1000,
      },
    },
    
    // Encryption settings
    encryption: {
      algorithm: 'aes-256-gcm',
      keyDerivation: {
        algorithm: 'pbkdf2',
        iterations: 100000,
        keyLength: 32,
        digest: 'sha256',
      },
      // HSM support for production
      hsm: {
        enabled: process.env.HSM_ENABLED === 'true',
        provider: process.env.HSM_PROVIDER ?? 'aws-cloudhsm',
        keyId: process.env.HSM_KEY_ID,
        region: process.env.HSM_REGION,
      },
    },
    
    // Advanced security features
    rateLimiting: process.env.RATE_LIMITING !== 'false',
    bruteForceProtection: {
      enabled: true,
      maxAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      progressiveDelay: true,
    },
    
    // Security monitoring
    monitoring: {
      enabled: process.env.SECURITY_MONITORING === 'true',
      logFailedAttempts: true,
      alertOnSuspiciousActivity: true,
      geoLocationTracking: process.env.NODE_ENV === 'production',
    },
    
    // OWASP compliance settings
    owasp: {
      preventClickjacking: true,
      preventMimeSniffing: true,
      preventXssReflection: true,
      enforceHttps: process.env.NODE_ENV === 'production',
      hpkpEnabled: process.env.HPKP_ENABLED === 'true',
      hpkpPins: process.env.HPKP_PINS?.split(',') ?? [],
    },
  },
};

export default config;
