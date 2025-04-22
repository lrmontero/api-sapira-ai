import { SecurityViolationType } from '@/core/interfaces/security/security.types';

export interface BaseLogProperties {
	userId?: string;
	correlationId?: string;
	timestamp: Date;
	level: string;
	message: string;
}

export enum LogType {
	GENERAL = 'general',
	ERROR = 'error',
	WARNING = 'warning',
	API = 'api',
	AUDIT = 'audit',
	PERFORMANCE = 'performance',
	SECURITY = 'security',
	DOCUMENT = 'document',
}

export interface ApiLogProperties extends BaseLogProperties {
	type: LogType.API;
	method: string;
	url: string;
	statusCode: number;
	responseTime: number;
	userAgent: string;
	ip: string;
}

export interface DocumentLogProperties extends BaseLogProperties {
	type: LogType.DOCUMENT;
	documentId: string;
	operation: string;
	size?: number;
	duration?: number;
	status: 'success' | 'failure';
	errorDetails?: any;
}

export interface SecurityLogProperties extends BaseLogProperties {
	type: LogType.SECURITY;
	violationType: SecurityViolationType;
	ip?: string;
	points?: number;
	riskLevel?: string;
	metadata?: Record<string, any>;
}
