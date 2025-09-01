/**
 * Utility functions for error handling with exact optional property types
 */

interface ErrorOptions {
  correlationId: string;
  cause?: Error;
}

interface QueryErrorOptions {
  correlationId: string;
  query?: string;
  params?: unknown;
  cause?: Error;
}

export function createErrorOptions(correlationId: string, error?: unknown): ErrorOptions {
 const options: ErrorOptions = { correlationId };
 if (error instanceof Error) {
   options.cause = error;
 }
 return options;
}

export function createQueryErrorOptions(
 query: string,
 params: unknown,
 correlationId: string,
 cause?: unknown
): QueryErrorOptions {
 const options: QueryErrorOptions = { correlationId };
 if (query) options.query = query;
 if (params !== undefined) options.params = params;
 if (cause instanceof Error) options.cause = cause;
 return options;
}