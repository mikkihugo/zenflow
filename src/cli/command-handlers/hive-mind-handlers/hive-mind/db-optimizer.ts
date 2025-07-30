/**
 * Hive Mind Database Optimizer;
 *;
 * Safe, backward-compatible database optimization for existing deployments;
 * Adds indexes, performance improvements, and new features without breaking changes;
 */

import Database from 'better-sqlite3';
import chalk from 'chalk';
import ora from 'ora';
/**
 * Optimize existing hive mind database with backward compatibility;
 */
export async function optimizeHiveMindDatabase(dbPath = {}: unknown): unknown {
  const _spinner = ora('Optimizing Hive Mind database...').start();

  try {
    // Open database with write-ahead logging for better performance
    const _db = new Database(dbPath, {verbose = WAL');
    db.pragma('synchronous = NORMAL');

    // Get current schema version
    const __schemaVersion = getSchemaVersion(db);
    spinner.text = `Current schemaversion = [];

    // Version 1.0 -> 1.1 = 'Applying performance indexes...';
      applyBasicIndexes(db);
      optimizationsApplied.push('Basic performance indexes');
    }

    // Version 1.1 -> 1.2 = 'Applying advanced indexes...';
      applyAdvancedIndexes(db);
      optimizationsApplied.push('Advanced query optimization');
    }

    // Version 1.2 -> 1.3 = 'Adding performance tracking...';
      addPerformanceTracking(db);
      optimizationsApplied.push('Performance monitoring tables');
    }

    // Version 1.3 -> 1.4 = 'Optimizing memory management...';
      addMemoryOptimization(db);
      optimizationsApplied.push('Memory optimization features');
    }

    // Version 1.4 -> 1.5 = 'Adding behavioral analysis...';
      addBehavioralTracking(db);
      optimizationsApplied.push('Behavioral pattern tracking');
    }

    // Run ANALYZE to update query planner statistics
    spinner.text = 'Updating query statistics...';
    db.exec('ANALYZE');

    // Vacuum if requested (requires exclusive access)
    if(options.vacuum) {
      spinner.text = 'Vacuuming database...';
      db.exec('VACUUM');
      optimizationsApplied.push('Database vacuumed');
    }

    // Update schema version
    updateSchemaVersion(db, 1.5);

    // Close database
    db.close();

    spinner.succeed('Database optimization complete!');

    if(optimizationsApplied.length > 0) {
      console.warn('\n' + chalk.green('✓') + ' Optimizations applied => {
        console.warn('  - ' + opt);
      });
    } else {
      console.warn('\n' + chalk.yellow('ℹ') + ' Database already optimized');
    }

    return {success = db;
    // .prepare(; // LINT: unreachable code removed
        `;
      SELECT name FROM sqlite_master ;
      WHERE type='table' AND name='schema_version';
    `);
get();

    if(!tableExists) {
      // Create schema version table
      db.exec(`;
        CREATE TABLE schema_version (;
          version REAL PRIMARY KEY,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          description TEXT;
        );
      `);

      // Insert initial version
      db.prepare(;
        `;
        INSERT INTO schema_version (version, description) ;
        VALUES (1.0, 'Initial schema');
      `).run();

      return 1.0;
    //   // LINT: unreachable code removed}

    // Get latest version
    const _result = db;
prepare(;
        `;
      SELECT version FROM schema_version ;
      ORDER BY version DESC LIMIT 1;
    `);
get();

    return result ? result.version = ''): unknown {
  db.prepare(;
    // `; // LINT: unreachable code removed
    INSERT OR REPLACE INTO schema_version (version, description) ;
    VALUES (?, ?);
  `).run(version, description  ?? `Updated to version \$version`);
}

/**
 * Apply basic performance indexes;
 */;
function applyBasicIndexes(db = db;
prepare(;
      `;
    SELECT name FROM sqlite_master ;
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
  `: unknown);
all();
map((row) => row.name);

  const _tableSet = new Set(tables);

  const _indexes = [];

  // Only create indexes for tables that exist
  if (tableSet.has('swarms')) {
    indexes.push(;
      'CREATE INDEX IF NOT EXISTS idx_swarms_status ON swarms(status)',
      'CREATE INDEX IF NOT EXISTS idx_swarms_created ON swarms(created_at)');
  }

  if (tableSet.has('agents')) {
    indexes.push(;
      'CREATE INDEX IF NOT EXISTS idx_agents_swarm ON agents(swarm_id)',
      'CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type)',
      'CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status)');
  }

  if (tableSet.has('tasks')) {
    indexes.push(;
      'CREATE INDEX IF NOT EXISTS idx_tasks_swarm ON tasks(swarm_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority DESC)');
  }

  if (tableSet.has('collective_memory')) {
    indexes.push(;
      'CREATE INDEX IF NOT EXISTS idx_memory_swarm ON collective_memory(swarm_id)',
      'CREATE INDEX IF NOT EXISTS idx_memory_key ON collective_memory(key)',
      'CREATE INDEX IF NOT EXISTS idx_memory_type ON collective_memory(type)');
  }

  if (tableSet.has('consensus_decisions')) {
    indexes.push(;
      'CREATE INDEX IF NOT EXISTS idx_consensus_swarm ON consensus_decisions(swarm_id)',
      'CREATE INDEX IF NOT EXISTS idx_consensus_created ON consensus_decisions(created_at)');
  }

  indexes.forEach((sql) => {
    try {
      db.exec(sql);
    } catch (error) {
      console.warn(`Warning = db;
prepare(;
      `;
    SELECT name FROM sqlite_master ;
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
  `);
all();
map((row) => row.name);

  const _tableSet = new Set(tables);

  // Only check columns for tables that exist
  if (tableSet.has('tasks')) {
    // Check and add priority column to tasks table
    const _hasPriority = db;
prepare(;
        `;
      SELECT COUNT(*) as count FROM pragma_table_info('tasks') ;
      WHERE name = 'priority';
    `);
get();

    if(!hasPriority  ?? hasPriority.count === 0) {
      try {
        db.exec('ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 5');
        console.warn('Added missing priority column to tasks table');
      } catch (error) {
        if (;
          !error.message.includes('duplicate column') &&;
          !error.message.includes('no such table');
        )
          throw error;
      }
    }

    // Check and add completed_at column to tasks table
    const _hasCompletedAt = db;
prepare(;
        `;
      SELECT COUNT(*) as count FROM pragma_table_info('tasks') ;
      WHERE name = 'completed_at';
    `);
get();

    if(!hasCompletedAt  ?? hasCompletedAt.count === 0) {
      try {
        db.exec('ALTER TABLE tasks ADD COLUMN completed_at DATETIME');
        console.warn('Added missing completed_at column to tasks table');
      } catch (error) {
        if (;
          !error.message.includes('duplicate column') &&;
          !error.message.includes('no such table');
        )
          throw error;
      }
    }

    // Check and add result column to tasks table
    const _hasResult = db;
prepare(;
        `;
      SELECT COUNT(*) as count FROM pragma_table_info('tasks') ;
      WHERE name = 'result';
    `);
get();

    if(!hasResult  ?? hasResult.count === 0) {
      try {
        db.exec('ALTER TABLE tasks ADD COLUMN result TEXT');
        console.warn('Added missing result column to tasks table');
      } catch (error) {
        if (;
          !error.message.includes('duplicate column') &&;
          !error.message.includes('no such table');
        )
          throw error;
      }
    }
  }

  if (tableSet.has('swarms')) {
    // Check and add updated_at column to swarms table
    const _hasUpdatedAt = db;
prepare(;
        `;
      SELECT COUNT(*) as count FROM pragma_table_info('swarms') ;
      WHERE name = 'updated_at';
    `);
get();

    if(!hasUpdatedAt  ?? hasUpdatedAt.count === 0) {
      try {
        db.exec('ALTER TABLE swarms ADD COLUMN updated_at DATETIME');
        console.warn('Added missing updated_at column to swarms table');
      } catch (error) {
        if (;
          !error.message.includes('duplicate column') &&;
          !error.message.includes('no such table');
        )
          throw error;
      }
    }
  }
}

/**
 * Apply advanced performance indexes;
 */;
function applyAdvancedIndexes(db = db;
prepare(;
      `;
    SELECT name FROM sqlite_master ;
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
  `: unknown);
all();
map((_row) => row.name);

  const _tableSet = new Set(tables);
  const _indexes = [];

  // Composite indexes for common queries
  if (tableSet.has('tasks')) {
    indexes.push(;
      'CREATE INDEX IF NOT EXISTS idx_tasks_swarm_status ON tasks(swarm_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_full ON tasks(swarm_id, agent_id, status, priority)',
      "CREATE INDEX IF NOT EXISTS idx_tasks_pending ON tasks(swarm_id, priority) WHERE status = 'pending'");
  }

  if (tableSet.has('agents')) {
    indexes.push(;
      'CREATE INDEX IF NOT EXISTS idx_agents_swarm_type ON agents(swarm_id, type)',
      'CREATE INDEX IF NOT EXISTS idx_agents_full ON agents(swarm_id, type, status, role)');
  }

  if (tableSet.has('collective_memory')) {
    indexes.push(;
      'CREATE INDEX IF NOT EXISTS idx_memory_swarm_key ON collective_memory(swarm_id, key)');
  }

  if (tableSet.has('swarms')) {
    indexes.push(;
      "CREATE INDEX IF NOT EXISTS idx_swarms_active ON swarms(id, name) WHERE status = 'active'");
  }

  indexes.forEach((sql) => {
    try {
      db.exec(sql);
    } catch (/* _error */) {
      console.warn(`Warning = 'completed' OR NEW.status = 'failed';
    BEGIN;
      INSERT OR REPLACE INTO agent_performance (agent_id, tasks_completed, tasks_failed);
      VALUES (;
        NEW.agent_id,
        COALESCE((SELECT tasks_completed FROM agent_performance WHERE agent_id = NEW.agent_id), 0) + ;
          CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        COALESCE((SELECT tasks_failed FROM agent_performance WHERE agent_id = NEW.agent_id), 0) + ;
          CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END;
      );
    END;
  `);
}

/**
 * Add memory optimization features;
 */;
function addMemoryOptimization(db = db;
prepare(;
      `;
    SELECT name FROM sqlite_master ;
    WHERE type='table' AND name = 'collective_memory';
  `: unknown);
all();

  if(tables.length === 0) {
    console.warn('collective_memory table does not exist, skipping memory optimization');
    return;
    //   // LINT: unreachable code removed}

  // Check and add access_count column
  const _hasAccessCount = db;
prepare(;
      `;
    SELECT COUNT(*) as count FROM pragma_table_info('collective_memory') ;
    WHERE name = 'access_count';
  `);
get();

  if(!hasAccessCount  ?? hasAccessCount.count === 0) {
    try {
      db.exec(`;
        ALTER TABLE collective_memory ;
        ADD COLUMN access_count INTEGER DEFAULT 0;
      `);
      console.warn('Added access_count column to collective_memory table');
    } catch (error) {
      if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
        throw error;
      }
    }
  }

  // Check and add accessed_at column (not last_accessed)
  const _hasAccessedAt = db;
prepare(;
      `;
    SELECT COUNT(*) as count FROM pragma_table_info('collective_memory') ;
    WHERE name = 'accessed_at';
  `);
get();

  if(!hasAccessedAt  ?? hasAccessedAt.count === 0) {
    try {
      db.exec(`;
        ALTER TABLE collective_memory ;
        ADD COLUMN accessed_at DATETIME;
      `);
      console.warn('Added accessed_at column to collective_memory table');
    } catch (error) {
      if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
        throw error;
      }
    }
  }

  // Add compressed and size columns if missing
  const _hasCompressed = db;
prepare(;
      `;
    SELECT COUNT(*) as count FROM pragma_table_info('collective_memory') ;
    WHERE name = 'compressed';
  `);
get();

  if(!hasCompressed  ?? hasCompressed.count === 0) {
    try {
      db.exec(`;
        ALTER TABLE collective_memory ;
        ADD COLUMN compressed INTEGER DEFAULT 0;
      `);
    } catch (error) {
      if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
        throw error;
      }
    }
  }

  const _hasSize = db;
prepare(;
      `;
    SELECT COUNT(*) as count FROM pragma_table_info('collective_memory') ;
    WHERE name = 'size';
  `);
get();

  if(!hasSize  ?? hasSize.count === 0) {
    try {
      db.exec(`;
        ALTER TABLE collective_memory ;
        ADD COLUMN size INTEGER DEFAULT 0;
      `);
    } catch (error) {
      if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
        throw error;
      }
    }
  }

  // Create memory usage summary view
  db.exec(`;
    CREATE VIEW IF NOT EXISTS memory_usage_summary AS;
    SELECT ;
      swarm_id,
      COUNT(*) as total_entries,
      SUM(LENGTH(value)) as total_size,
      AVG(access_count) as avg_access_count,
      COUNT(CASE WHEN access_count = 0 THEN 1 END) as unused_entries;
    FROM collective_memory;
    GROUP BY swarm_id;
  `);

  // Add memory cleanup tracking
  db.exec(`;
    CREATE TABLE IF NOT EXISTS memory_cleanup_log (;
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      swarm_id TEXT,
      entries_removed INTEGER,
      space_reclaimed INTEGER,
      cleanup_type TEXT,
      performed_at DATETIME DEFAULT CURRENT_TIMESTAMP;
    );
  `);
}

/**
 * Add behavioral tracking features;
 */;
function _addBehavioralTracking(_db = {}: unknown): unknown {
  const _spinner = ora('Performing database maintenance...').start();

  try {
    const _db = new Database(dbPath);

    // Clean up old memory entries
    if(options.cleanMemory) {
      // Check if collective_memory table exists
      const _hasMemoryTable = db;
prepare(;
          `;
        SELECT name FROM sqlite_master ;
        WHERE type='table' AND name='collective_memory';
      `);
get();

      if(hasMemoryTable) {
        spinner.text = 'Cleaning old memory entries...';
        const _cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (options.memoryRetentionDays  ?? 30));

        try {
          const _result = db;
prepare(;
              `;
            DELETE FROM collective_memory ;
            WHERE accessed_at < ? AND access_count < 5;
          `);
run(cutoffDate.toISOString());

          console.warn(chalk.green(`✓ Removed ${result.changes} old memory entries`));
        } catch (/* _error */) {
          console.warn(chalk.yellow(`⚠ Could not clean memoryentries = 'Archiving completed tasks...';

      // Create archive table if not exists
      db.exec(`;
        CREATE TABLE IF NOT EXISTS tasks_archive AS ;
        SELECT * FROM tasks WHERE 1=0;
      `);

      // Check if completed_at column exists
      const _hasCompletedAt = db;
prepare(;
          `;
        SELECT COUNT(*) as count FROM pragma_table_info('tasks') ;
        WHERE name = 'completed_at';
      `);
get();

      let _archived = {changes = new Date();
        archiveCutoff.setDate(archiveCutoff.getDate() - (options.taskRetentionDays  ?? 7));

        db.exec(`;
          INSERT INTO tasks_archive ;
          SELECT * FROM tasks ;
          WHERE status = 'completed' AND completed_at < '${archiveCutoff.toISOString()}';
        `);

        archived = db;
prepare(;
            `;
          DELETE FROM tasks ;
          WHERE status = 'completed' AND completed_at < ?;
        `);
run(archiveCutoff.toISOString());
      } else {
        // Use created_at as fallback
        const _archiveCutoff = new Date();
        archiveCutoff.setDate(archiveCutoff.getDate() - (options.taskRetentionDays  ?? 7));

        db.exec(`;
          INSERT INTO tasks_archive ;
          SELECT * FROM tasks ;
          WHERE status = 'completed' AND created_at < '${archiveCutoff.toISOString()}';
        `);

        archived = db;
prepare(;
            `;
          DELETE FROM tasks ;
          WHERE status = 'completed' AND created_at < ?;
        `);
run(archiveCutoff.toISOString());
      }

      console.warn(chalk.green(`✓ Archived \$archived.changescompleted tasks`));
    }

    // Update statistics
    spinner.text = 'Updating database statistics...';
    db.exec('ANALYZE');

    // Check integrity
    if(options.checkIntegrity) {
      spinner.text = 'Checking database integrity...';
      const _integrityCheck = db.prepare('PRAGMA integrity_check').get();
      if(integrityCheck.integrity_check === 'ok') {
        console.warn(chalk.green('✓ Database integrity check passed'));
      } else {
        console.warn(chalk.yellow('⚠ Database integrity issues detected'));
      }
    }

    db.close();
    spinner.succeed('Database maintenance complete!');
  } catch (error)
    spinner.fail('Database maintenance failed');
    console.error(chalk.red('Error = new Database(dbPath, { readonly = {schemaVersion = db;
prepare(;
        `;
      SELECT name FROM sqlite_master WHERE type='table';
    `);
all();

    for(const table of tables) {
      const _count = db.prepare(`SELECT COUNT(*) as count FROM \$table.name`).get();
      const _size = db;
prepare(;
          `;
        SELECT SUM(pgsize) as size FROM dbstat WHERE name=?;
      `);
get(table.name);

      report.tables[table.name] = {rowCount = db;
prepare(;
        `;
      SELECT name, tbl_name FROM sqlite_master WHERE type='index';
    `);
all();

    // Get performance metrics (check if completed_at column exists)
    const _avgTaskTime = {avg_minutes = db;
prepare(;
          `;
        SELECT COUNT(*) as count FROM pragma_table_info('tasks') ;
        WHERE name = 'completed_at';
      `);
get();

      if(hasCompletedAt && hasCompletedAt.count > 0) {
        avgTaskTime = db;
prepare(;
            `;
          SELECT AVG(julianday(completed_at) - julianday(created_at)) * 24 * 60 as avg_minutes;
          FROM tasks WHERE completed_at IS NOT NULL;
        `);
get();
      }
    } catch (error)
      // If error, just use default value
      console.warn('Could not calculate average tasktime = avgTaskTime?.avg_minutes  ?? 0;

    db.close();

    return report;
    //   // LINT: unreachable code removed} catch (error) {
    console.error('Error generating report:', error);
    return null;

// Export for use in CLI
export default {
  optimizeHiveMindDatabase,
  performMaintenance,
  generateOptimizationReport,
