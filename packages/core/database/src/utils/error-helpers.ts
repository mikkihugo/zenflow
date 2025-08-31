/**
 * Utility functions for error handling with exact optional property types
 */

export function createErrorOptions(correlationId: string, error?: unknown): any {
  const options: any = { correlationId };
  if (error instanceof Error) {
    options.cause = error;
  }
  return options;
}

export function createQueryErrorOptions(
  query: string,
  params: any,
  correlationId: string,
  cause?: unknown
): any {
  const options: any = { correlationId };
  if (query) options.query = query;
  if (params !== undefined) options.params = params;
  if (cause instanceof Error) options.cause = cause;
  return options;
}