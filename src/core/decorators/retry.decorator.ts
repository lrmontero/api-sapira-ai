import { ConfigService } from '@nestjs/config';

import { AppLoggerService } from '@/logger/app-logger.service';

import { ErrorContext } from '../interfaces/error.types';

export function Retry() {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const configService: ConfigService = this.configService;
			const logger: AppLoggerService = this.logger;

			const retryConfig = configService.get('events.security.retryPolicy');
			const maxAttempts = retryConfig.attempts;
			const delay = retryConfig.delay;

			let lastError;
			for (let attempt = 1; attempt <= maxAttempts; attempt++) {
				try {
					return await originalMethod.apply(this, args);
				} catch (error) {
					lastError = error;
					if (attempt < maxAttempts) {
						const errorContext: ErrorContext = {
							message: error.message,
							code: error.code || 'RETRY_ERROR',
							level: 'warning',
							source: `${target.constructor.name}.${propertyKey}`,
							metadata: {
								attempt,
								maxAttempts,
								willRetry: true,
								stack: error.stack,
							},
						};

						await logger.logError(errorContext);
						await new Promise((resolve) => setTimeout(resolve, delay * attempt));
					}
				}
			}

			const errorContext: ErrorContext = {
				message: lastError.message,
				code: lastError.code || 'RETRY_ERROR',
				level: 'error',
				source: `${target.constructor.name}.${propertyKey}`,
				metadata: {
					attempt: maxAttempts,
					maxAttempts,
					willRetry: false,
					stack: lastError.stack,
				},
			};

			await logger.logError(errorContext);
			throw lastError;
		};

		return descriptor;
	};
}
