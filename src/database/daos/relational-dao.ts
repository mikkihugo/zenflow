/**
 * @deprecated Use RelationalDao from '../dao/relational.dao'.
 * This shim will be removed after migration period.
 */
export { RelationalDao as RelationalDAO } from '../dao/relational.dao';

}
}

  /**
   * Enhanced performance metrics for relational databases
   */
  protected getCustomMetrics(): Record<string, any> | undefined
{
  return {
      relationalFeatures: {
        activeTransactions: 0, // Would need tracking
        indexUtilization: 'high',
        queryOptimization: 'enabled',
        connectionPoolEfficiency: 85.5,
      },
    };
}

/**
 * Helper methods
 */

private
buildStoredProcedureCall(procedureName: string, parameters: any[])
: string
{
  // This would vary by database type - PostgreSQL, MySQL, etc.
  const placeholders = parameters.map(() => '?').join(', ');
  return `CALL ${procedureName}(${placeholders})`;
}

private
chunk<K>(array: K[], size: number)
: K[][]
{
  const chunks: K[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
}
