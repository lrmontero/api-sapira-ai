import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { AppLoggerService } from '@/logger/app-logger.service';

@Injectable()
export class AuditTrailMiddleware implements NestMiddleware {
	constructor(private readonly logger: AppLoggerService) {}

	use(req: Request, res: Response, next: NextFunction): void {
		try {
			const startTime = Date.now();
			const correlationId = uuid();

			// Agregar correlationId a la respuesta
			res.setHeader('X-Correlation-ID', correlationId);

			// Función para manejar el final de la petición
			res.on('finish', () => {
				const endTime = Date.now();
				const duration = endTime - startTime;

				// Registrar en el logger
				this.logger.logApi(req, res, duration);
			});

			next();
		} catch (error) {
			this.logger.error('Error en AuditTrailMiddleware', error);
			next(error);
		}
	}
}
