import { ErrorSeverity } from './error-codes.interface';

export interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface BaseError {
	code: string;
	message: string;
	severity?: ErrorSeverity;
	context?: string;
	metadata?: Record<string, any>;
}

export interface BaseResponse<T> {
	success: boolean;
	data?: T;
	error?: BaseError;
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
	total: number;
	page: number;
	limit: number;
}
