import { createLogger } from '@claude-zen/foundation';
import { CodeqlAnalyzer } from './analyzers/codeql-analyzer';
import { QueryRunner } from './query-runner';

const logger = createLogger('codeql');

export async function runCodeqlAnalysis(queries: string[]): Promise<void> {
    try {
      logger.info('Starting CodeQL analysis with %d queries', queries.length);
      const analyzer = new CodeqlAnalyzer();
      await analyzer.runQueries(queries);
    } catch (error) {
      logger.error('CodeQL analysis failed:', error);
      throw error;
    }
}

export async function runQuery(query: string): Promise<string> {
    try {
      logger.info('Running CodeQL query: %s', query);
      return await new QueryRunner().runQuery(query);
    } catch (error) {
      logger.error('Query execution failed', error);
      throw error;
    }
}
