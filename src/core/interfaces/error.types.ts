export type ErrorLevel = 'error' | 'warning' | 'info' | 'debug';

export interface ErrorContext {
	message: string;
	code?: string;
	stack?: string;
	metadata?: Record<string, any>;
	timestamp?: Date;
	level?: ErrorLevel;
	source?: string;
}

export interface ErrorResponse {
	success: false;
	error: {
		message: string;
		code: string;
		details?: Record<string, any>;
	};
}
