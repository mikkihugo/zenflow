/**
 * @fileoverview Jest Environment Setup for AI Testing
 * 
 * Environment configuration and global setup for Jest-based AI testing.
 * This file runs before any tests and sets up the global environment.
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.44
 * @version 2.0.0
 */

// Environment variables for AI testing
process.env.NODE_ENV = 'test';
process.env.ZEN_TEST_MODE = 'true';
process.env.AI_TEST_MODE = 'jest';
process.env.CLAUDE_CODE_TEST = 'true';
process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID||'1';

// Disable external network calls in tests
process.env.DISABLE_EXTERNAL_APIS = 'true';
process.env.MOCK_LLM_PROVIDERS = 'true';
process.env.MOCK_NEURAL_NETWORKS = 'true';

// Test database configuration
process.env.TEST_DB_PATH = ':memory:';
process.env.TEST_VECTOR_DB = 'memory';
process.env.TEST_GRAPH_DB = 'memory';

// AI-specific test configuration
process.env.AI_RESPONSE_TIMEOUT = '30000';
process.env.NEURAL_TRAINING_TIMEOUT = '60000';
process.env.SWARM_COORDINATION_TIMEOUT = '15000';
process.env.AGENT_EXECUTION_TIMEOUT = '10000';

// Logging configuration for tests
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests
process.env.DISABLE_TELEMETRY = 'true';
process.env.DISABLE_ANALYTICS = 'true';

// Performance tuning for test environment
process.env.MAX_CONCURRENT_TESTS = '4';
process.env.TEST_MEMORY_LIMIT = '512MB';
process.env.GC_INTERVAL = '10000'; // More frequent GC in tests