import { ErrorSeverity } from '../base/error-codes.interface';

export enum SecurityViolationType {
	IP_BLACKLISTED = 'IP_BLACKLISTED',
	RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
	POINTS_THRESHOLD_EXCEEDED = 'POINTS_THRESHOLD_EXCEEDED',
	INVALID_TOKEN = 'INVALID_TOKEN',
	EXPIRED_TOKEN = 'EXPIRED_TOKEN',
	UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
	SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
	BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
	MALFORMED_REQUEST = 'MALFORMED_REQUEST',
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
	INVALID_MSAL_TOKEN = 'INVALID_MSAL_TOKEN',
	INVALID_B2C_TOKEN = 'INVALID_B2C_TOKEN',
	SESSION_HIJACKING = 'SESSION_HIJACKING',
	MULTIPLE_FAILED_LOGIN = 'MULTIPLE_FAILED_LOGIN',
}

export interface SecurityEventInput {
	violationType: SecurityViolationType;
	severity?: ErrorSeverity;
	description?: string;
	metadata?: Record<string, any>;
	userId?: string;
	ipAddress?: string;
	userAgent?: string;
	requestPath?: string;
	requestMethod?: string;
	timestamp?: Date;
	correlationId?: string;
	points?: number;
	riskLevel?: string;
}
