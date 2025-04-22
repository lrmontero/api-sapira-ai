import { SecurityViolationType } from '../security/security.types';

export interface BaseLogProperties {
	msg: string;
	time: Date;
	correlationId: string;
	userId?: string;
}

export interface ApiLogProperties extends BaseLogProperties {
	type: 'api';
	method: string;
	url: string;
	statusCode: number;
	responseTime: number;
	userAgent?: string;
	ip?: string;
}

export interface DocumentLogProperties extends BaseLogProperties {
	type: 'document';
	documentId: string;
	operation: string;
	status: 'success' | 'failure';
	size?: number;
	duration?: number;
	errorDetails?: any;
}

export interface SecurityLogProperties extends BaseLogProperties {
	type: 'security';
	violationType: SecurityViolationType;
	ipAddress: string;
	points: number;
	riskLevel: 'low' | 'medium' | 'high';
	metadata?: Record<string, any>;
}

export interface ErrorLogProperties extends BaseLogProperties {
	type: 'error';
	code?: string;
	stack?: string;
	metadata?: Record<string, any>;
}

export interface AuthLogProperties extends BaseLogProperties {
	type: 'auth';
	provider: string;
	deviceInfo?: Record<string, any>;
	result: 'success' | 'failure';
	metadata?: Record<string, any>;
}
