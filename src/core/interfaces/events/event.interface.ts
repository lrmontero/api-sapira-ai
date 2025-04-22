import { Identifiable } from '../common.interface';
import { SecurityViolationType } from '../security/security.types';

// Tipos de eventos principales
export enum EventType {
	SECURITY = 'SECURITY',
	AUDIT = 'AUDIT',
	BUSINESS = 'BUSINESS',
	SYSTEM = 'SYSTEM',
	DOCUMENT = 'DOCUMENT',
	AUTH = 'AUTH',
	CLIENT_ERROR = 'CLIENT_ERROR',
}

// Severidad de eventos
export enum EventSeverity {
	DEBUG = 'DEBUG',
	INFO = 'INFO',
	WARNING = 'WARNING',
	ERROR = 'ERROR',
	CRITICAL = 'CRITICAL',
}

// Estado del evento
export enum EventStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	COMPLETED = 'COMPLETED',
	FAILED = 'FAILED',
}

// Acciones de auditoría
export enum AuditAction {
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	VIEW = 'VIEW',
	EXPORT = 'EXPORT',
	IMPORT = 'IMPORT',
	LOGIN = 'LOGIN',
	LOGOUT = 'LOGOUT',
	DEVICE_CHANGE = 'DEVICE_CHANGE',
	FIRST_ACCESS = 'FIRST_ACCESS',
}

// Categorías de negocio
export enum BusinessCategory {
	TRANSACTION = 'TRANSACTION',
	WORKFLOW = 'WORKFLOW',
	NOTIFICATION = 'NOTIFICATION',
	INTEGRATION = 'INTEGRATION',
	REPORT = 'REPORT',
	DOCUMENT = 'DOCUMENT',
}

// Acciones de seguridad
export enum SecurityAction {
	LOGIN = 'LOGIN',
	LOGOUT = 'LOGOUT',
	ACCESS_DENIED = 'ACCESS_DENIED',
	RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
	IP_BLOCKED = 'IP_BLOCKED',
	SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
	SIMULATED_VIOLATION = 'SIMULATED_VIOLATION',
}

// Resultados de seguridad
export enum SecurityOutcome {
	SUCCESS = 'SUCCESS',
	FAILURE = 'FAILURE',
	WARNING = 'WARNING',
	BLOCKED = 'BLOCKED',
}

// Interfaz para errores estándar
export interface StandardError {
	code: string;
	message: string;
	timestamp: Date;
	stack?: string;
	details?: Record<string, any>;
}

// Evento base
export interface BaseEvent extends Identifiable {
	type: EventType;
	severity: EventSeverity;
	timestamp: Date;
	correlationId: string;
	status: EventStatus;
	source?: string;
	userId?: string;
	userAgent?: string;
	ipAddress?: string;
	metadata?: Record<string, any>;
	error?: StandardError;
}

// Evento de seguridad
export interface SecurityEvent extends BaseEvent {
	type: EventType.SECURITY;
	action: SecurityAction;
	outcome: SecurityOutcome;
	points?: number;
	resourceId?: string;
	riskLevel?: 'low' | 'medium' | 'high' | 'critical';
	details?: Record<string, any>;
	violationType?: SecurityViolationType;
}

// Evento de auditoría
export interface AuditEvent extends BaseEvent {
	type: EventType.AUDIT;
	action: AuditAction;
	resourceType: string;
	resourceId: string;
	changes?: {
		before: Record<string, any>;
		after: Record<string, any>;
	};
}

// Evento de negocio
export interface BusinessEvent extends BaseEvent {
	type: EventType.BUSINESS;
	category: BusinessCategory;
	action: string;
	entityType: string;
	entityId: string;
	value?: number;
}

// Evento de sistema
export interface SystemEvent extends BaseEvent {
	type: EventType.SYSTEM;
	component: string;
	action: string;
	details?: Record<string, any>;
}

// Evento de documento
export interface DocumentEvent extends BaseEvent {
	type: EventType.DOCUMENT;
	documentId: string;
	documentType: string;
	operation: string;
	duration?: number;
}

// Evento de autenticación
export interface AuthEvent extends BaseEvent {
	type: EventType.AUTH;
	provider: string;
	tenantId?: string;
	deviceInfo?: {
		browser: string;
		os: string;
		deviceId?: string;
	};
}
