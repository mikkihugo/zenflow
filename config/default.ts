/**
 * Default configuration for Claude-Zen;
 * Comprehensive system configuration with TypeScript types;
 */
export interface DatabaseConfig {
  sqlite: {
    path: string;
    options: {
      timeout: number;
      verbose: boolean;
    };
  };
  lancedb: {
    path: string;
    dimensions: number;
  };
  kuzu: {
    path: string;
    readOnly: boolean;
  };
}
export interface ServerConfig {
  port: number;
  host: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}
export interface RuvFANNConfig {
  integrated: boolean;
  wasmPath: string;
  neuralModels: string[];
  gpuAcceleration: boolean;
}
export interface HiveMindConfig {
  maxQueens: number;
  consensusThreshold: number;
  memoryRetention: number;
  autoBackup: boolean;
}
export interface Config {
  app: {
    name: string;
    version: string;
    environment: string;
    debug: boolean;
  };
  server: ServerConfig;
  database: DatabaseConfig;
  ruvFANN: RuvFANNConfig;
  hiveMind: HiveMindConfig;
  logging: {
    level: string;
    format: string;
    file: string;
  };
  security: {
    jwtSecret: string;
    tokenExpiry: string;
    rateLimiting: boolean;
  };
}
const _config: Config = {
  app: {
    name: 'Claude-Zen',
    version: '2.0.0-alpha.73',
    environment: process.env.NODE_ENV ?? 'development',
    debug: process.env.DEBUG === 'true',
  },
  server: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    host: process.env.HOST ?? 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
      credentials: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
    },
  },
  database: {
    sqlite: {
      path: process.env.SQLITE_PATH ?? './databases/claude-zen.db',
      timeout: 10000,
      verbose: process.env.DEBUG === 'true',
    },
    lancedb: {
      path: process.env.LANCEDB_PATH ?? './databases/vectors',
      dimensions: 1536, // OpenAI embedding dimensions
    },
    kuzu: {
      path: process.env.KUZU_PATH ?? './databases/graph',
      readOnly: false,
    },
  },
  ruvFANN: {
    integrated: true, // Fully integrated as workspace component
    wasmPath: './ruv-FANN/ruv-swarm/npm/wasm',
    neuralModels: [
      'LSTM',
      'N-BEATS',
      'Transformer',
      'CNN-LSTM',
      'GRU',
      'ARIMA',
      'Prophet',
      'DeepAR',
      'WaveNet',
      'TCN',
    ],
    gpuAcceleration: process.env.GPU_ACCELERATION !== 'false',
  },
  hiveMind: {
    maxQueens: parseInt(process.env.MAX_QUEENS ?? '10', 10),
    consensusThreshold: 0.66, // 66% consensus required
    memoryRetention: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    autoBackup: true,
  },
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
    format: 'json',
    file: process.env.LOG_FILE ?? './logs/claude-zen.log',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET ?? 'claude-zen-development-secret-change-in-production',
    tokenExpiry: process.env.TOKEN_EXPIRY ?? '24h',
    rateLimiting: process.env.RATE_LIMITING !== 'false',
  },
};
export default _config;
