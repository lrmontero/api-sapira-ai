import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { SecurityUtils } from '@/core/utils/security.utils';
import { AppLoggerService } from '@/logger/app-logger.service';
import { UserUtils } from '@/security/utils/user.utils';

interface LogData {
	method: string;
	url: string;
	headers: any;
	body: any;
	userId: string;
	clientIp: string;
	userAgent: string | undefined;
	correlationId: string;
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
	private static readonly MAX_BODY_SIZE = 1024 * 100; // 100KB
	private static readonly MAX_HEADERS_SIZE = 1024 * 10; // 10KB

	constructor(private readonly logger: AppLoggerService) {}

	private truncateData(data: any, maxSize: number): any {
		if (!data) return data;

		const jsonString = JSON.stringify(data);
		if (jsonString.length <= maxSize) {
			return data;
		}
		return {
			_truncated: true,
			_originalSize: jsonString.length,
			_message: 'Contenido truncado por tamaño excesivo',
		};
	}

	use(req: Request, res: Response, next: NextFunction): void {
		try {
			const startTime = Date.now();

			// Validar y normalizar IP con X-Forwarded-For
			const ipValidation = SecurityUtils.validateAndNormalizeIp(req.ip, {
				allowXForwardedFor: true,
				throwOnInvalid: true,
			}) || { ip: 'unknown', isLocal: false, isRailway: false };

			// Normalizar ID de usuario
			const userId = UserUtils.extractUserInfo(req).userId || 'anonymous';

			// Preparar datos de log con límites de tamaño
			const logData: LogData = {
				method: req.method,
				url: req.originalUrl || req.url,
				headers: this.truncateData(req.headers, RequestContextMiddleware.MAX_HEADERS_SIZE),
				body: this.truncateData(req.body, RequestContextMiddleware.MAX_BODY_SIZE),
				userId,
				clientIp: ipValidation.ip,
				userAgent: req.headers['user-agent'],
				correlationId: uuid(),
			};

			// Log de inicio de solicitud
			this.logger.log(`Incoming ${logData.method} ${logData.url}`, logData.userId, 'http', {
				...logData,
				phase: 'start',
			});

			// Interceptar la finalización de la respuesta
			res.on('finish', () => {
				const duration = Date.now() - startTime;
				const statusCode = res.statusCode;

				// Log de finalización con duración y código de estado
				this.logger.log(`${logData.method} ${logData.url} completed with status ${statusCode}`, logData.userId, 'http', {
					...logData,
					phase: 'end',
					duration,
					statusCode,
				});
			});

			next();
		} catch (error) {
			// Log de error en caso de fallo del middleware
			this.logger.error('Error in request logger middleware', undefined, error);
			next();
		}
	}
}
