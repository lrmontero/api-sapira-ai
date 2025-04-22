import { Injectable, Logger } from '@nestjs/common';

import { BaseResponse } from '@/core/interfaces/base/base.interface';
import { ErrorCodes, ErrorSeverity, ServiceError } from '@/core/interfaces/base/error-codes.interface';

export interface ErrorOptions {
	context?: string;
	severity?: ErrorSeverity;
	metadata?: Record<string, any>;
}

@Injectable()
export class BaseService {
	protected readonly logger = new Logger(this.constructor.name);

	protected handleError(error: Error | ServiceError, options?: ErrorOptions): BaseResponse<any> {
		if ('code' in error) {
			const serviceError = error as ServiceError;
			return {
				success: false,
				error: {
					code: serviceError.code,
					message: serviceError.message,
					severity: serviceError.severity || options?.severity || ErrorSeverity.ERROR,
					context: options?.context,
					metadata: options?.metadata,
				},
			};
		}

		return {
			success: false,
			error: {
				code: ErrorCodes.SYSTEM.UNKNOWN_ERROR,
				message: error.message || 'An unexpected error occurred',
				severity: options?.severity || ErrorSeverity.ERROR,
				context: options?.context,
				metadata: options?.metadata,
			},
		};
	}

	protected createSuccessResponse<T>(data: T): BaseResponse<T> {
		return {
			success: true,
			data,
		};
	}
}
