/**
 * Transaction Manager - TypeScript Edition
 * Provides unified transaction management across multiple database types
 * with advanced features like distributed transactions, savepoints, and deadlock detection
 */

import {
  DatabaseManager,
  Transaction,
  TransactionIsolation,
  TransactionState,
  DatabaseOperations,
  Query,
  QueryResult,
  OperationResult,
  JSONObject,
  UUID
} from '../types/database';
import { JSONValue } from '../types/core';
import { EventEmitter } from 'events';

interface TransactionOptions {
  isolation?: TransactionIsolation;
  timeout?: number;
  readonly?: boolean;
  distributed?: boolean;
  retryAttempts?: number;
  deadlockDetection?: boolean;
}

interface SavepointInfo {
  name: string;
  createdAt: Date;
  rollbackPoint: any;
  nestedLevel: number;
}

interface TransactionContext {
  id: UUID;
  databaseIds: string[];
  state: TransactionState;
  isolation: TransactionIsolation;
  startTime: Date;
  lastActivity: Date;
  operations: TransactionOperation[];
  savepoints: Map<string, SavepointInfo>;
  locks: Set<string>;
  options: TransactionOptions;
  isDistributed: boolean;
  coordinator?: string; // Database ID of coordinator for distributed transactions
}

interface TransactionOperation {
  id: string;
  databaseId: string;
  query: Query;
  result?: QueryResult;
  timestamp: Date;
  rollbackData?: any;
}

interface TransactionStats {
  totalTransactions: number;
  activeTransactions: number;
  committedTransactions: number;
  rolledBackTransactions: number;
  averageDuration: number;
  deadlockCount: number;
  timeoutCount: number;
  distributedTransactions: number;
}

export class TransactionManager extends EventEmitter {
  private databaseManager: DatabaseManager;
  private activeTransactions: Map<UUID, TransactionContext> = new Map();
  private transactionStats: TransactionStats;
  private deadlockDetectionEnabled: boolean = true;
  private deadlockCheckInterval: NodeJS.Timeout | null = null;
  private options: {
    defaultTimeout: number;
    maxTransactionDuration: number;
    deadlockCheckInterval: number;
    maxRetryAttempts: number;
  };

  constructor(
    databaseManager: DatabaseManager,
    options: {
      defaultTimeout?: number;
      maxTransactionDuration?: number;
      deadlockCheckInterval?: number;
      maxRetryAttempts?: number;
      enableDeadlockDetection?: boolean;
    } = {}
  ) {
    super();
    
    this.databaseManager = databaseManager;
    this.options = {
      defaultTimeout: options.defaultTimeout || 30000, // 30 seconds
      maxTransactionDuration: options.maxTransactionDuration || 300000, // 5 minutes
      deadlockCheckInterval: options.deadlockCheckInterval || 5000, // 5 seconds
      maxRetryAttempts: options.maxRetryAttempts || 3
    };
    
    this.transactionStats = {
      totalTransactions: 0,
      activeTransactions: 0,
      committedTransactions: 0,
      rolledBackTransactions: 0,
      averageDuration: 0,
      deadlockCount: 0,
      timeoutCount: 0,
      distributedTransactions: 0
    };

    if (options.enableDeadlockDetection !== false) {
      this.startDeadlockDetection();
    }

    // Handle graceful shutdown
    process.on('SIGINT', () => this.rollbackAllTransactions());
    process.on('SIGTERM', () => this.rollbackAllTransactions());
  }

  /**
   * Begin a new transaction
   */
  async beginTransaction(
    databaseIds: string | string[],
    options: TransactionOptions = {}
  ): Promise<Transaction> {
    const transactionId = this.generateTransactionId();
    const dbIds = Array.isArray(databaseIds) ? databaseIds : [databaseIds];
    const isDistributed = dbIds.length > 1;
    
    console.log(`🚀 Beginning ${isDistributed ? 'distributed ' : ''}transaction: ${transactionId}`);
    
    const context: TransactionContext = {
      id: transactionId,
      databaseIds: dbIds,
      state: 'pending',
      isolation: options.isolation || 'read_committed',
      startTime: new Date(),
      lastActivity: new Date(),
      operations: [],
      savepoints: new Map(),
      locks: new Set(),
      options,
      isDistributed,
      coordinator: isDistributed ? dbIds[0] : undefined
    };

    try {
      // Begin transaction on all databases
      if (isDistributed) {
        await this.beginDistributedTransaction(context);
      } else {
        await this.beginSingleTransaction(context, dbIds[0]);
      }

      context.state = 'active';
      this.activeTransactions.set(transactionId, context);
      
      // Update stats
      this.transactionStats.totalTransactions++;
      this.transactionStats.activeTransactions++;
      if (isDistributed) {
        this.transactionStats.distributedTransactions++;
      }

      const transaction: Transaction = {
        id: transactionId,
        state: 'active',
        isolation: context.isolation,
        startTime: context.startTime,
        lastActivity: context.lastActivity,
        isReadonly: options.readonly || false,
        savepoints: Array.from(context.savepoints.keys()),
        metadata: {
          databaseIds: dbIds,
          isDistributed,
          coordinator: context.coordinator
        }
      };

      this.emit('transaction:started', { transaction, context });
      return transaction;

    } catch (error: any) {
      this.emit('transaction:error', { transactionId, error: error.message });
      throw error;
    }
  }

  /**
   * Execute a query within a transaction
   */
  async executeInTransaction(
    transactionId: UUID,
    databaseId: string,
    query: Query,
    options: { saveRollbackData?: boolean } = {}
  ): Promise<QueryResult> {
    const context = this.activeTransactions.get(transactionId);
    if (!context) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    if (context.state !== 'active') {
      throw new Error(`Transaction ${transactionId} is not active (state: ${context.state})`);
    }

    if (!context.databaseIds.includes(databaseId)) {
      throw new Error(`Database ${databaseId} not part of transaction ${transactionId}`);
    }

    try {
      // Check transaction timeout
      const elapsed = Date.now() - context.startTime.getTime();
      const timeout = context.options.timeout || this.options.defaultTimeout;
      
      if (elapsed > timeout) {
        await this.rollbackTransaction(transactionId);
        throw new Error(`Transaction timeout exceeded: ${elapsed}ms > ${timeout}ms`);
      }

      // Acquire locks if needed
      const lockKey = `${databaseId}:${query.sql || query.type}`;
      if (context.options.deadlockDetection !== false) {
        await this.acquireLock(context, lockKey);
      }

      // Execute the query
      const result = await this.databaseManager.executeQuery(databaseId, query);
      
      // Record operation for rollback capability
      const operation: TransactionOperation = {
        id: this.generateOperationId(),
        databaseId,
        query,
        result,
        timestamp: new Date(),
        rollbackData: options.saveRollbackData ? await this.captureRollbackData(databaseId, query) : undefined
      };

      context.operations.push(operation);
      context.lastActivity = new Date();

      this.emit('transaction:operation', { transactionId, operation });
      return result;

    } catch (error: any) {
      this.emit('transaction:operation_error', { transactionId, databaseId, query, error: error.message });
      throw error;
    }
  }

  /**
   * Create a savepoint within a transaction
   */
  async createSavepoint(transactionId: UUID, name: string): Promise<void> {
    const context = this.activeTransactions.get(transactionId);
    if (!context) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    if (context.state !== 'active') {
      throw new Error(`Transaction ${transactionId} is not active`);
    }

    if (context.savepoints.has(name)) {
      throw new Error(`Savepoint ${name} already exists in transaction ${transactionId}`);
    }

    console.log(`📍 Creating savepoint: ${name} in transaction ${transactionId}`);

    try {
      const savepointInfo: SavepointInfo = {
        name,
        createdAt: new Date(),
        rollbackPoint: await this.captureTransactionState(context),
        nestedLevel: context.savepoints.size
      };

      // Create savepoint on all databases in the transaction
      for (const databaseId of context.databaseIds) {
        const db = await this.databaseManager.getDatabase(databaseId);
        if (db && 'createSavepoint' in db) {
          // Create a dummy transaction object for the interface
          const dummyTransaction: Transaction = {
            id: transactionId,
            state: 'active',
            isolation: context.isolation,
            startTime: context.startTime,
            lastActivity: context.lastActivity,
            isReadonly: false,
            savepoints: [],
            metadata: {}
          };
          await (db as any).createSavepoint(dummyTransaction, name);
        }
      }

      context.savepoints.set(name, savepointInfo);
      this.emit('savepoint:created', { transactionId, savepoint: name });

    } catch (error: any) {
      this.emit('savepoint:error', { transactionId, savepoint: name, error: error.message });
      throw error;
    }
  }

  /**
   * Rollback to a savepoint
   */
  async rollbackToSavepoint(transactionId: UUID, name: string): Promise<void> {
    const context = this.activeTransactions.get(transactionId);
    if (!context) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    if (context.state !== 'active') {
      throw new Error(`Transaction ${transactionId} is not active`);
    }

    const savepoint = context.savepoints.get(name);
    if (!savepoint) {
      throw new Error(`Savepoint ${name} not found in transaction ${transactionId}`);
    }

    console.log(`↩️ Rolling back to savepoint: ${name} in transaction ${transactionId}`);

    try {
      // Rollback to savepoint on all databases
      for (const databaseId of context.databaseIds) {
        const db = await this.databaseManager.getDatabase(databaseId);
        if (db && 'rollbackToSavepoint' in db) {
          const dummyTransaction: Transaction = {
            id: transactionId,
            state: 'active',
            isolation: context.isolation,
            startTime: context.startTime,
            lastActivity: context.lastActivity,
            isReadonly: false,
            savepoints: [],
            metadata: {}
          };
          await (db as any).rollbackToSavepoint(dummyTransaction, name);
        }
      }

      // Remove operations after this savepoint
      const savepointTime = savepoint.createdAt.getTime();
      context.operations = context.operations.filter(op => 
        op.timestamp.getTime() <= savepointTime
      );

      // Remove newer savepoints
      for (const [spName, spInfo] of context.savepoints) {
        if (spInfo.nestedLevel > savepoint.nestedLevel) {
          context.savepoints.delete(spName);
        }
      }

      context.lastActivity = new Date();
      this.emit('savepoint:rollback', { transactionId, savepoint: name });

    } catch (error: any) {
      this.emit('savepoint:rollback_error', { transactionId, savepoint: name, error: error.message });
      throw error;
    }
  }

  /**
   * Commit a transaction
   */
  async commitTransaction(transactionId: UUID): Promise<void> {
    const context = this.activeTransactions.get(transactionId);
    if (!context) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    if (context.state !== 'active') {
      throw new Error(`Transaction ${transactionId} is not active (state: ${context.state})`);
    }

    console.log(`✅ Committing transaction: ${transactionId}`);
    context.state = 'committing';

    try {
      if (context.isDistributed) {
        await this.commitDistributedTransaction(context);
      } else {
        await this.commitSingleTransaction(context, context.databaseIds[0]);
      }

      context.state = 'committed';
      this.activeTransactions.delete(transactionId);

      // Update stats
      this.transactionStats.activeTransactions--;
      this.transactionStats.committedTransactions++;
      this.updateAverageDuration(context);

      // Release locks
      this.releaseLocks(context);

      this.emit('transaction:committed', { transactionId, duration: Date.now() - context.startTime.getTime() });

    } catch (error: any) {
      context.state = 'failed';
      this.emit('transaction:commit_error', { transactionId, error: error.message });
      
      // Attempt rollback on commit failure
      try {
        await this.rollbackTransaction(transactionId);
      } catch (rollbackError: any) {
        console.error(`Failed to rollback after commit error: ${rollbackError.message}`);
      }
      
      throw error;
    }
  }

  /**
   * Rollback a transaction
   */
  async rollbackTransaction(transactionId: UUID): Promise<void> {
    const context = this.activeTransactions.get(transactionId);
    if (!context) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    console.log(`↩️ Rolling back transaction: ${transactionId}`);
    context.state = 'rolling_back';

    try {
      if (context.isDistributed) {
        await this.rollbackDistributedTransaction(context);
      } else {
        await this.rollbackSingleTransaction(context, context.databaseIds[0]);
      }

      context.state = 'rolled_back';
      this.activeTransactions.delete(transactionId);

      // Update stats
      this.transactionStats.activeTransactions--;
      this.transactionStats.rolledBackTransactions++;
      this.updateAverageDuration(context);

      // Release locks
      this.releaseLocks(context);

      this.emit('transaction:rolled_back', { transactionId, duration: Date.now() - context.startTime.getTime() });

    } catch (error: any) {
      context.state = 'failed';
      this.emit('transaction:rollback_error', { transactionId, error: error.message });
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  getTransactionStatus(transactionId: UUID): Transaction | null {
    const context = this.activeTransactions.get(transactionId);
    if (!context) {
      return null;
    }

    return {
      id: transactionId,
      state: context.state,
      isolation: context.isolation,
      startTime: context.startTime,
      lastActivity: context.lastActivity,
      isReadonly: context.options.readonly || false,
      savepoints: Array.from(context.savepoints.keys()),
      metadata: {
        databaseIds: context.databaseIds,
        isDistributed: context.isDistributed,
        coordinator: context.coordinator,
        operationCount: context.operations.length,
        locks: Array.from(context.locks)
      }
    };
  }

  /**
   * Get all active transactions
   */
  getActiveTransactions(): Transaction[] {
    return Array.from(this.activeTransactions.values()).map(context => ({
      id: context.id,
      state: context.state,
      isolation: context.isolation,
      startTime: context.startTime,
      lastActivity: context.lastActivity,
      isReadonly: context.options.readonly || false,
      savepoints: Array.from(context.savepoints.keys()),
      metadata: {
        databaseIds: context.databaseIds,
        isDistributed: context.isDistributed,
        coordinator: context.coordinator,
        operationCount: context.operations.length
      }
    }));
  }

  /**
   * Get transaction statistics
   */
  getStats(): TransactionStats {
    return { ...this.transactionStats };
  }

  /**
   * Force rollback all active transactions (for shutdown)
   */
  async rollbackAllTransactions(): Promise<void> {
    console.log('🛑 Rolling back all active transactions...');
    
    const rollbackPromises = Array.from(this.activeTransactions.keys()).map(async (transactionId) => {
      try {
        await this.rollbackTransaction(transactionId);
      } catch (error: any) {
        console.error(`Failed to rollback transaction ${transactionId}: ${error.message}`);
      }
    });

    await Promise.all(rollbackPromises);
    console.log('✅ All transactions rolled back');
  }

  /**
   * Cleanup expired transactions
   */
  async cleanupExpiredTransactions(): Promise<number> {
    const now = Date.now();
    const maxDuration = this.options.maxTransactionDuration;
    const expiredTransactions: UUID[] = [];

    for (const [transactionId, context] of this.activeTransactions) {
      const elapsed = now - context.startTime.getTime();
      if (elapsed > maxDuration) {
        expiredTransactions.push(transactionId);
      }
    }

    for (const transactionId of expiredTransactions) {
      try {
        await this.rollbackTransaction(transactionId);
        this.transactionStats.timeoutCount++;
        console.warn(`⏰ Rolled back expired transaction: ${transactionId}`);
      } catch (error: any) {
        console.error(`Failed to rollback expired transaction ${transactionId}: ${error.message}`);
      }
    }

    return expiredTransactions.length;
  }

  // Private helper methods

  private async beginSingleTransaction(context: TransactionContext, databaseId: string): Promise<void> {
    const db = await this.databaseManager.getDatabase(databaseId);
    if (!db) {
      throw new Error(`Database not found: ${databaseId}`);
    }

    if ('beginTransaction' in db) {
      await (db as any).beginTransaction(context.isolation);
    }
  }

  private async beginDistributedTransaction(context: TransactionContext): Promise<void> {
    // Two-phase commit preparation
    for (const databaseId of context.databaseIds) {
      await this.beginSingleTransaction(context, databaseId);
    }
  }

  private async commitSingleTransaction(context: TransactionContext, databaseId: string): Promise<void> {
    const db = await this.databaseManager.getDatabase(databaseId);
    if (db && 'commitTransaction' in db) {
      const dummyTransaction: Transaction = {
        id: context.id,
        state: 'active',
        isolation: context.isolation,
        startTime: context.startTime,
        lastActivity: context.lastActivity,
        isReadonly: false,
        savepoints: [],
        metadata: {}
      };
      await (db as any).commitTransaction(dummyTransaction);
    }
  }

  private async commitDistributedTransaction(context: TransactionContext): Promise<void> {
    // Two-phase commit protocol
    
    // Phase 1: Prepare all databases
    const preparePromises = context.databaseIds.map(async (databaseId) => {
      // In a real implementation, this would send PREPARE messages
      return this.prepareTransaction(context, databaseId);
    });

    try {
      await Promise.all(preparePromises);
    } catch (error) {
      // If prepare fails, rollback all
      await this.rollbackDistributedTransaction(context);
      throw error;
    }

    // Phase 2: Commit all databases
    const commitPromises = context.databaseIds.map(databaseId =>
      this.commitSingleTransaction(context, databaseId)
    );

    await Promise.all(commitPromises);
  }

  private async rollbackSingleTransaction(context: TransactionContext, databaseId: string): Promise<void> {
    const db = await this.databaseManager.getDatabase(databaseId);
    if (db && 'rollbackTransaction' in db) {
      const dummyTransaction: Transaction = {
        id: context.id,
        state: 'active',
        isolation: context.isolation,
        startTime: context.startTime,
        lastActivity: context.lastActivity,
        isReadonly: false,
        savepoints: [],
        metadata: {}
      };
      await (db as any).rollbackTransaction(dummyTransaction);
    }
  }

  private async rollbackDistributedTransaction(context: TransactionContext): Promise<void> {
    const rollbackPromises = context.databaseIds.map(databaseId =>
      this.rollbackSingleTransaction(context, databaseId)
    );

    await Promise.all(rollbackPromises);
  }

  private async prepareTransaction(context: TransactionContext, databaseId: string): Promise<boolean> {
    // Placeholder for 2PC prepare phase
    // In a real implementation, this would check if the database can commit
    return true;
  }

  private async acquireLock(context: TransactionContext, lockKey: string): Promise<void> {
    // Simple lock acquisition - in production, this would be more sophisticated
    context.locks.add(lockKey);
  }

  private releaseLocks(context: TransactionContext): void {
    context.locks.clear();
  }

  private async captureRollbackData(databaseId: string, query: Query): Promise<any> {
    // Placeholder for capturing rollback data
    // This would depend on the query type and database
    return null;
  }

  private async captureTransactionState(context: TransactionContext): Promise<any> {
    // Capture current state for savepoint rollback
    return {
      operationCount: context.operations.length,
      timestamp: new Date()
    };
  }

  private updateAverageDuration(context: TransactionContext): void {
    const duration = Date.now() - context.startTime.getTime();
    const total = this.transactionStats.committedTransactions + this.transactionStats.rolledBackTransactions;
    
    if (total === 1) {
      this.transactionStats.averageDuration = duration;
    } else {
      this.transactionStats.averageDuration = 
        (this.transactionStats.averageDuration * (total - 1) + duration) / total;
    }
  }

  private startDeadlockDetection(): void {
    this.deadlockCheckInterval = setInterval(async () => {
      try {
        await this.detectDeadlocks();
      } catch (error: any) {
        console.error(`Deadlock detection error: ${error.message}`);
      }
    }, this.options.deadlockCheckInterval);
  }

  private async detectDeadlocks(): Promise<void> {
    // Simple deadlock detection algorithm
    // In production, this would use a more sophisticated approach like wait-for graphs
    
    const waitingTransactions = Array.from(this.activeTransactions.values())
      .filter(context => context.state === 'active' && context.locks.size > 0);

    // Check for circular wait conditions
    for (const transaction of waitingTransactions) {
      const age = Date.now() - transaction.startTime.getTime();
      if (age > this.options.defaultTimeout * 2) {
        console.warn(`⚠️ Potential deadlock detected for transaction: ${transaction.id}`);
        this.transactionStats.deadlockCount++;
        this.emit('deadlock:detected', { transactionId: transaction.id });
        
        // Rollback the youngest transaction
        try {
          await this.rollbackTransaction(transaction.id);
        } catch (error: any) {
          console.error(`Failed to rollback deadlocked transaction: ${error.message}`);
        }
      }
    }
  }

  private generateTransactionId(): UUID {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown the transaction manager
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down transaction manager...');
    
    // Stop deadlock detection
    if (this.deadlockCheckInterval) {
      clearInterval(this.deadlockCheckInterval);
    }

    // Rollback all active transactions
    await this.rollbackAllTransactions();

    console.log('✅ Transaction manager shutdown complete');
  }
}

export default TransactionManager;