import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { SecurityUtils } from '@/core/utils/security.utils';
import { AppLoggerService } from '@/logger/app-logger.service';
import { SecurityService } from '@/security/services/security.service';

@Injectable()
export class IpFilterMiddleware implements NestMiddleware {
	private readonly POINTS_THRESHOLD = 100;
	private readonly DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';
	private readonly RAILWAY_MODE = process.env.RAILWAY_STATIC_URL !== undefined;

	constructor(
		private readonly logger: AppLoggerService,
		private readonly securityService: SecurityService
	) {}

	async use(req: Request, res: Response, next: NextFunction) {
		try {
			// Validar y normalizar IP con todas las verificaciones
			const ipValidation = SecurityUtils.validateAndNormalizeIp(req.ip, {
				allowXForwardedFor: true,
				throwOnInvalid: true,
				checkSpecialRanges: true,
			});

			// Permitir IPs especiales en desarrollo
			if (this.DEVELOPMENT_MODE && ipValidation.isLocal) {
				return next();
			}

			// Permitir IPs de Railway en modo Railway
			if (this.RAILWAY_MODE && ipValidation.isRailway) {
				return next();
			}

			// Verificar si la IP está en whitelist
			const isWhitelisted = await this.securityService.isInList(ipValidation.ip, 'whitelist');
			if (isWhitelisted) {
				return next();
			}

			// Verificar si la IP está en blacklist
			const isBlacklisted = await this.securityService.isInList(ipValidation.ip, 'blacklist');
			if (isBlacklisted) {
				return res.status(HttpStatus.FORBIDDEN).json({
					message: 'IP address is blocked',
					error: 'IP_BLOCKED',
				});
			}

			// Verificar puntos de seguridad
			const points = await this.securityService.getPoints(ipValidation.ip);
			if (points >= this.POINTS_THRESHOLD) {
				// Log del bloqueo
				this.logger.warn(`IP blocked due to high security points: ${ipValidation.ip}`, undefined, 'security', {
					points,
					threshold: this.POINTS_THRESHOLD,
				});

				return res.status(HttpStatus.FORBIDDEN).json({
					message: 'IP address is blocked due to security violations',
					error: 'SECURITY_POINTS_EXCEEDED',
				});
			}

			next();
		} catch (error) {
			this.logger.error('Error in IP filter middleware', undefined, error);
			return res.status(HttpStatus.BAD_REQUEST).json({
				message: 'Invalid IP address',
				error: 'INVALID_IP',
			});
		}
	}
}
