/**
 * Códigos de error estandarizados para el sistema
 */
export const ErrorCodes = {
	SYSTEM: {
		UNKNOWN_ERROR: 'SYS001',
		VALIDATION_ERROR: 'SYS002',
		NOT_FOUND: 'SYS003',
		UNAUTHORIZED: 'SYS004',
	},
	LOGGING: {
		WRITE_FAILED: 'LOG001',
		INVALID_FORMAT: 'LOG002',
		INITIALIZATION_FAILED: 'LOG003',
	},
	TELEMETRY: {
		EVENT_FAILED: 'TEL001',
		INVALID_EVENT: 'TEL002',
		CONNECTION_FAILED: 'TEL003',
	},
	AUDIT: {
		RECORD_FAILED: 'AUD001',
		VALIDATION_FAILED: 'AUD002',
		STORAGE_ERROR: 'AUD003',
	},
	SECURITY: {
		INVALID_IP: 'SEC001',
		INVALID_TOKEN: 'SEC002',
		RATE_LIMIT_EXCEEDED: 'SEC003',
		VALIDATION_FAILED: 'SEC004',
	},
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes][keyof (typeof ErrorCodes)[keyof typeof ErrorCodes]];

export enum ErrorSeverity {
	DEBUG = 'debug',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error',
	CRITICAL = 'critical',
	FATAL = 'fatal',
}

export interface ServiceError {
	code: ErrorCode;
	message: string;
	severity?: ErrorSeverity;
	details?: Record<string, any>;
}
