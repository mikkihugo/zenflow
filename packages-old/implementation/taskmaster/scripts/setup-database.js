#!/usr/bin/env node

/**
 * TaskMaster Database Setup Script
 *
 * Uses @claude-zen/infrastructure facade to set up TaskMaster schema
 * across multiple database types: SQL, Graph, KV, and Vector
 */

import { getLogger } from "@claude-zen/foundation";
import { getDatabaseSystem } from "@claude-zen/infrastructure";

const logger = getLogger("taskmaster-db-setup");

async function setupTaskMasterDatabases() {
	try {
		logger.info(
			"🚀 Setting up TaskMaster databases via infrastructure facade...",
		);

		const dbSystem = await getDatabaseSystem();

		// Set up SQL database for core task data
		logger.info("📊 Setting up SQL database for core task management...");
		const sqlProvider = dbSystem.createProvider("sql");

		// Set up SQLite key-value store for real-time state and caching
		logger.info("⚡ Setting up SQLite KV storage for real-time state...");
		const kvProvider = dbSystem.createProvider("kv");

		// Create TaskMaster schema in SQL database
		await setupSQLSchema(sqlProvider);

		// Set up SQLite KV storage structure for real-time data
		await setupKVSchema(kvProvider);

		logger.info("✅ TaskMaster database setup completed successfully!");
		logger.info("📋 Databases configured:");
		logger.info("  • SQL: Core task data, audit logs, metrics, dependencies");
		logger.info(
			"  • SQLite KV: Real-time state, session data, cache, notifications",
		);
	} catch (error) {
		logger.error("❌ Database setup failed:", error);
		process.exit(1);
	}
}

async function setupSQLSchema(sqlProvider) {
	logger.info("Creating SQL tables for TaskMaster...");

	// Tasks table - core task management
	await sqlProvider.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
      state VARCHAR(50) NOT NULL,
      complexity VARCHAR(20) NOT NULL CHECK (complexity IN ('trivial', 'simple', 'moderate', 'complex', 'epic')),
      estimated_hours DECIMAL(10,2),
      actual_hours DECIMAL(10,2),
      assignee_id VARCHAR(36),
      created_by VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      due_date TIMESTAMP,
      completed_at TIMESTAMP,
      parent_task_id VARCHAR(36),
      workflow_id VARCHAR(36),
      tags TEXT[], -- PostgreSQL array type
      dependencies TEXT[],
      approval_gates JSONB DEFAULT '[]',
      custom_data JSONB DEFAULT '{}',
      version INTEGER DEFAULT 1,
      tenant_id VARCHAR(36)
    );
  `);

	// Task state transitions - audit trail
	await sqlProvider.execute(`
    CREATE TABLE IF NOT EXISTS task_state_transitions (
      id VARCHAR(36) PRIMARY KEY,
      task_id VARCHAR(36) NOT NULL,
      from_state VARCHAR(50) NOT NULL,
      to_state VARCHAR(50) NOT NULL,
      direction VARCHAR(20) NOT NULL CHECK (direction IN ('forward', 'backward', 'lateral', 'exception')),
      performed_by VARCHAR(36) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reason TEXT,
      state_duration_seconds INTEGER,
      cycle_time_hours DECIMAL(10,2),
      lead_time_hours DECIMAL(10,2),
      transition_source VARCHAR(50) DEFAULT 'manual',
      metadata JSONB DEFAULT '{}',
      tenant_id VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

	// Flow metrics - time-series analytics
	await sqlProvider.execute(`
    CREATE TABLE IF NOT EXISTS flow_metrics (
      id VARCHAR(36) PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      time_period VARCHAR(20) DEFAULT 'hour',
      throughput DECIMAL(10,4) DEFAULT 0,
      avg_cycle_time DECIMAL(10,4) DEFAULT 0,
      avg_lead_time DECIMAL(10,4) DEFAULT 0,
      wip_efficiency DECIMAL(5,4) DEFAULT 0,
      flow_efficiency DECIMAL(5,4) DEFAULT 0,
      blocked_time_percentage DECIMAL(5,4) DEFAULT 0,
      predictability DECIMAL(5,4) DEFAULT 0,
      quality_index DECIMAL(5,4) DEFAULT 0,
      resource_utilization DECIMAL(5,4) DEFAULT 0,
      total_tasks INTEGER DEFAULT 0,
      completed_tasks INTEGER DEFAULT 0,
      blocked_tasks INTEGER DEFAULT 0,
      in_progress_tasks INTEGER DEFAULT 0,
      task_distribution JSONB DEFAULT '{}',
      priority_distribution JSONB DEFAULT '{}',
      complexity_distribution JSONB DEFAULT '{}',
      calculation_method VARCHAR(50) DEFAULT 'real_time',
      processing_time_ms INTEGER,
      model_version VARCHAR(20),
      workflow_id VARCHAR(36),
      tenant_id VARCHAR(36),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

	logger.info("✅ SQL schema created successfully");
}

async function setupKVSchema(kvProvider) {
	logger.info("Setting up SQLite-based KV structure for TaskMaster...");

	// Initialize SQLite KV namespaces for different data types
	const namespaces = [
		"taskmaster:state", // Real-time task states
		"taskmaster:wip-limits", // WIP limit configurations
		"taskmaster:cache:metrics", // Cached metrics
		"taskmaster:sessions", // User sessions
		"taskmaster:locks", // Distributed locks for concurrency
		"taskmaster:notifications", // Real-time notifications
		"taskmaster:approvals", // Pending approval states
	];

	// SQLite KV storage doesn't need TTL - uses file-based persistence
	for (const namespace of namespaces) {
		await kvProvider.set(`${namespace}:initialized`, "true");
	}

	logger.info("✅ SQLite KV namespaces initialized successfully");
}

// Run the setup
setupTaskMasterDatabases().catch(console.error);
