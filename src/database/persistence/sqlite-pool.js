/**
 * @fileoverview A simple connection pool for better-sqlite3.
 */

import Database from 'better-sqlite3';

export class SQLiteConnectionPool {
  constructor(dbPath, options) {
    this.dbPath = dbPath;
    this.options = options;
    this.pool = [];
    this.createPool();
  }

  createPool() {
    for (let i = 0; i < this.options.maxReaders; i++) {
      this.pool.push(new Database(this.dbPath, { readonly: true }));
    }
    for (let i = 0; i < this.options.maxWorkers; i++) {
      this.pool.push(new Database(this.dbPath));
    }
  }

  async read(sql, params) {
    const db = this.pool.find((p) => p.readonly);
    return db.prepare(sql).all(params);
  }

  async write(sql, params) {
    const db = this.pool.find((p) => !p.readonly);
    return db.prepare(sql).run(params);
  }

  getStats() {
    return {
      total: this.pool.length,
      readonly: this.options.maxReaders,
      readwrite: this.options.maxWorkers,
    };
  }

  isHealthy() {
    return this.pool.every((p) => p.open);
  }

  close() {
    this.pool.forEach((p) => p.close());
  }

  once(event, callback) {
    if (event === 'ready') {
      callback();
    }
  }
}
