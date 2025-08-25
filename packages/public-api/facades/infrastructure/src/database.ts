/**
 * @fileoverview Database Strategic Facade - Clean Delegation Pattern
 */

export const getDatabaseAccess = async () => {
  try {
    const { createDatabaseAccess } = await import('@claude-zen/database');
    return createDatabaseAccess();
  } catch (error) {
    throw new Error('Database system not available - @claude-zen/database package required');
  }
};

export const createDatabaseConnection = async (config?: any) => {
  try {
    const { DatabaseProvider } = await import('@claude-zen/database');
    return new DatabaseProvider(config);
  } catch (error) {
    throw new Error('Database provider not available - @claude-zen/database package required');
  }
};

// Type exports for external consumers
export type * from './types';