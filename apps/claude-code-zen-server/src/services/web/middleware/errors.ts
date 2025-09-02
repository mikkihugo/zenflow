import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('interfaces-api-http-middleware-errors');

export interface ApiError {
	error: {
		code: number;
		message: string;
		status: string;
	};
}

export function logError(error: unknown, context?: string): void {
	logger.error(context || 'API error:', error);
}
